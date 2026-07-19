# Playwright Practice App — .NET + React

A React recreation of the Angular/Nebular UI automation practice site in
[`Prats222/playwright-framework`](https://github.com/Prats222/playwright-framework), backed by an ASP.NET Core API and covered by Playwright tests.

## Stack

- ASP.NET Core 10 minimal API (`Server`)
- React + TypeScript + Vite (`ClientApp`)
- Playwright end-to-end tests (`tests`)
- GitHub Actions build and browser-test workflow

## Run locally

Prerequisites: .NET 10 SDK and Node.js 24 or newer.

```powershell
npm install
npm run install:all
npx playwright install chromium
npm test
```

Playwright starts both the API at `http://127.0.0.1:5000` and the React app at
`http://127.0.0.1:5173`. To run them manually in separate terminals:

```powershell
dotnet run --project Server/Server.csproj
npm run dev --prefix ClientApp
```

## Test coverage

The suite preserves the source repository's learning scenarios while removing
hard-coded URLs and flaky external dependencies. It covers navigation, locator
strategies, form inputs, radio buttons, checkboxes, theme selection, tooltips,
browser dialogs, table editing/filtering, a temperature control, page objects,
custom fixtures, auto-waiting, and an iPhone-sized mobile project.

## Free deployment on Render

The repository includes a multi-stage `Dockerfile` that compiles React and
places it in ASP.NET Core's static web root. In production, one .NET process
serves both the website and `/api/health` on port `10000`.

1. Sign in at [Render](https://dashboard.render.com/) with GitHub.
2. Select **New > Blueprint**.
3. Connect `Prats222/playwright-framework-dotnet-react`.
4. Render reads `render.yaml`. Confirm that the service plan is **Free**.
5. Select **Apply** and wait for the Docker build and health check to finish.
6. Open the generated `https://playwright-framework-dotnet-react.onrender.com`
   URL shown in the service dashboard.

Every commit to `main` is deployed after its GitHub CI checks pass. Render free
services sleep after a period without traffic, so the first request after idle
can take roughly a minute.

To test the deployed URL from PowerShell without starting local servers:

```powershell
$env:URL="https://your-service-name.onrender.com"
npm test
Remove-Item Env:URL
```

You can verify the backend directly at `https://your-service-name.onrender.com/api/health`.
