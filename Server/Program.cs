var builder = WebApplication.CreateBuilder(args);

builder.Services.AddCors(options => options.AddDefaultPolicy(policy =>
    policy.WithOrigins("http://127.0.0.1:5173", "http://localhost:5173")
        .AllowAnyHeader()
        .AllowAnyMethod()));

var app = builder.Build();
app.UseCors();
app.UseDefaultFiles();
app.UseStaticFiles();

app.MapGet("/api/health", () => Results.Ok(new
{
    status = "healthy",
    application = "Playwright Practice App",
    framework = ".NET 10 + React"
}));

// React Router and client-side URLs fall back to the compiled SPA.
app.MapFallbackToFile("index.html");

app.Run();
