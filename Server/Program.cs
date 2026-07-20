using System.Collections.Concurrent;
using System.Security.Claims;
using System.Security.Cryptography;
using Microsoft.AspNetCore.Authentication;
using Microsoft.AspNetCore.Authentication.Cookies;

var builder = WebApplication.CreateBuilder(args);

builder.Services.AddCors(options => options.AddDefaultPolicy(policy =>
    policy.WithOrigins("http://127.0.0.1:5173", "http://localhost:5173")
        .AllowAnyHeader()
        .AllowAnyMethod()
        .AllowCredentials()));
builder.Services.AddAuthentication(CookieAuthenticationDefaults.AuthenticationScheme)
    .AddCookie(options =>
    {
        options.Cookie.Name = "automation-pm-session";
        options.Cookie.HttpOnly = true;
        options.Cookie.SameSite = SameSiteMode.Lax;
        options.Cookie.SecurePolicy = CookieSecurePolicy.SameAsRequest;
        options.ExpireTimeSpan = TimeSpan.FromHours(2);
        options.Events.OnRedirectToLogin = context =>
        {
            context.Response.StatusCode = StatusCodes.Status401Unauthorized;
            return Task.CompletedTask;
        };
    });
builder.Services.AddAuthorization();

var users = new ConcurrentDictionary<string, UserRecord>(StringComparer.OrdinalIgnoreCase);
var seedSalt = RandomNumberGenerator.GetBytes(16);
users["prateek@automation.pm"] = new UserRecord(
    Guid.NewGuid(), "Prateek Mishra", "prateek@automation.pm", seedSalt,
    HashPassword("Playwright@2026", seedSalt));

var products = new ConcurrentDictionary<int, Product>(new[]
{
    new KeyValuePair<int, Product>(1, new(1, "Smart Bulb", "Home Automation", 1299m, true)),
    new KeyValuePair<int, Product>(2, new(2, "Air Quality Sensor", "Sensors", 3499m, true)),
    new KeyValuePair<int, Product>(3, new(3, "Security Camera", "Security", 5999m, false)),
});
var nextProductId = 3;

var app = builder.Build();
app.UseCors();
app.UseAuthentication();
app.UseAuthorization();
app.UseDefaultFiles();
app.UseStaticFiles();

app.MapGet("/api/health", () => Results.Ok(new
{
    status = "healthy",
    application = "Playwright Practice App",
    framework = ".NET 10 + React"
}));

app.MapPost("/api/auth/register", async (RegisterRequest request, HttpContext context) =>
{
    var email = request.Email.Trim().ToLowerInvariant();
    if (request.Name.Trim().Length < 2 || !email.Contains('@') || request.Password.Length < 8)
        return Results.ValidationProblem(new Dictionary<string, string[]>
        {
            ["credentials"] = ["Name, a valid email, and a password of at least 8 characters are required."]
        });

    var salt = RandomNumberGenerator.GetBytes(16);
    var user = new UserRecord(Guid.NewGuid(), request.Name.Trim(), email, salt, HashPassword(request.Password, salt));
    if (!users.TryAdd(email, user))
        return Results.Conflict(new { message = "An account with this email already exists." });

    await SignIn(context, user);
    return Results.Created("/api/auth/me", PublicUser(user));
});

app.MapPost("/api/auth/login", async (LoginRequest request, HttpContext context) =>
{
    var email = request.Email.Trim().ToLowerInvariant();
    if (!users.TryGetValue(email, out var user) || !VerifyPassword(request.Password, user.Salt, user.PasswordHash))
        return Results.Json(new { message = "Invalid email or password." }, statusCode: StatusCodes.Status401Unauthorized);

    await SignIn(context, user);
    return Results.Ok(PublicUser(user));
});

app.MapPost("/api/auth/logout", async (HttpContext context) =>
{
    await context.SignOutAsync(CookieAuthenticationDefaults.AuthenticationScheme);
    return Results.NoContent();
});

app.MapPost("/api/auth/request-password", (PasswordRequest request) =>
    Results.Accepted(value: new
    {
        message = $"If {request.Email.Trim()} is registered, password reset instructions have been prepared."
    }));

app.MapPost("/api/auth/reset-password", (ResetPasswordRequest request) =>
{
    var email = request.Email.Trim().ToLowerInvariant();
    if (request.NewPassword.Length < 8)
        return Results.BadRequest(new { message = "The new password must contain at least 8 characters." });
    if (!users.TryGetValue(email, out var current))
        return Results.NotFound(new { message = "No account was found for this email." });
    var salt = RandomNumberGenerator.GetBytes(16);
    users[email] = current with { Salt = salt, PasswordHash = HashPassword(request.NewPassword, salt) };
    return Results.Ok(new { message = "Password updated. You can now log in." });
});

app.MapGet("/api/auth/me", (ClaimsPrincipal principal) =>
{
    var email = principal.FindFirstValue(ClaimTypes.Email);
    return email is not null && users.TryGetValue(email, out var user)
        ? Results.Ok(PublicUser(user))
        : Results.Unauthorized();
}).RequireAuthorization();

var productApi = app.MapGroup("/api/products");
productApi.MapGet("/", (string? search) =>
{
    var result = products.Values.OrderBy(product => product.Id).AsEnumerable();
    if (!string.IsNullOrWhiteSpace(search))
        result = result.Where(product => product.Name.Contains(search, StringComparison.OrdinalIgnoreCase));
    return Results.Ok(result);
});
productApi.MapGet("/{id:int}", (int id) => products.TryGetValue(id, out var product) ? Results.Ok(product) : Results.NotFound());
productApi.MapPost("/", (ProductRequest request) =>
{
    if (string.IsNullOrWhiteSpace(request.Name) || request.Price <= 0)
        return Results.ValidationProblem(new Dictionary<string, string[]> { ["product"] = ["Name and a positive price are required."] });
    var id = Interlocked.Increment(ref nextProductId);
    var product = new Product(id, request.Name.Trim(), request.Category.Trim(), request.Price, request.InStock);
    products[id] = product;
    return Results.Created($"/api/products/{id}", product);
});
productApi.MapPut("/{id:int}", (int id, ProductRequest request) =>
{
    if (!products.ContainsKey(id)) return Results.NotFound();
    if (string.IsNullOrWhiteSpace(request.Name) || request.Price <= 0)
        return Results.ValidationProblem(new Dictionary<string, string[]> { ["product"] = ["Name and a positive price are required."] });
    var product = new Product(id, request.Name.Trim(), request.Category.Trim(), request.Price, request.InStock);
    products[id] = product;
    return Results.Ok(product);
});
productApi.MapDelete("/{id:int}", (int id) => products.TryRemove(id, out _) ? Results.NoContent() : Results.NotFound());

// React Router and client-side URLs fall back to the compiled SPA.
app.MapFallbackToFile("index.html");

app.Run();

static byte[] HashPassword(string password, byte[] salt) =>
    Rfc2898DeriveBytes.Pbkdf2(password, salt, 100_000, HashAlgorithmName.SHA256, 32);

static bool VerifyPassword(string password, byte[] salt, byte[] expected) =>
    CryptographicOperations.FixedTimeEquals(HashPassword(password, salt), expected);

static object PublicUser(UserRecord user) => new { user.Id, user.Name, user.Email };

static async Task SignIn(HttpContext context, UserRecord user)
{
    var claims = new[]
    {
        new Claim(ClaimTypes.NameIdentifier, user.Id.ToString()),
        new Claim(ClaimTypes.Name, user.Name),
        new Claim(ClaimTypes.Email, user.Email),
    };
    await context.SignInAsync(CookieAuthenticationDefaults.AuthenticationScheme,
        new ClaimsPrincipal(new ClaimsIdentity(claims, CookieAuthenticationDefaults.AuthenticationScheme)));
}

record RegisterRequest(string Name, string Email, string Password);
record LoginRequest(string Email, string Password);
record PasswordRequest(string Email);
record ResetPasswordRequest(string Email, string NewPassword);
record UserRecord(Guid Id, string Name, string Email, byte[] Salt, byte[] PasswordHash);
record Product(int Id, string Name, string Category, decimal Price, bool InStock);
record ProductRequest(string Name, string Category, decimal Price, bool InStock);
