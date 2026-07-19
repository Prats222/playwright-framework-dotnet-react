# Playwright Practice App — .NET + React

A React recreation of the Angular/Nebular automation practice site from
[`Prats222/playwright-framework`](https://github.com/Prats222/playwright-framework), personalized for Prateek Mishra and backed by an ASP.NET Core API.

## Test cases

The repository contains **64 Playwright tests** across desktop Chromium and an iPhone-sized mobile project. The suite covers every implemented route and every meaningful interactive control in the current website.

| Area | Automated test scenarios |
| --- | --- |
| Branding | Prateek Mishra header identity, supplied profile photo load, personalized footer, and mobile branding |
| Routing | All 16 application deep links, sidebar navigation, URL updates, browser back navigation, and unknown-route fallback |
| Header and themes | Theme menu contents and switching through Light, Dark, Cosmic, and Corporate themes |
| Smart-home cards | Independent ON/OFF behavior for Light, Roller Shades, Wireless Audio, and Coffee Maker |
| Temperature and humidity | Pointer dragging, keyboard changes, power off/on, tab switching, accessible slider values, and four operating modes |
| Dashboard selectors | Electricity period, traffic period, and room selection |
| Music player | Real audio start/pause, progress movement, manual seeking, volume, previous track, and next track |
| Contacts and content | Six Indian contacts, call controls, Mumbai weather, solar widget, traffic widget, and theme-specific artwork |
| Security cameras | Camera selection, selected image, pause, and resume |
| Form layouts | Navigation, text entry, clearing, sequential typing, labels, placeholders, checkboxes, radio buttons, disabled state, card composition, and page-object form submission |
| Datepicker | Page composition and valid date entry |
| Toastr | Delayed standard toast, random toast, configuration checkboxes, auto-waiting, and dismissal |
| Tooltips | Hover appearance, content, placement control, and disappearance |
| Overlays | Dialog, Window, and Popover opening, form input, submit, close, and native confirmation handling |
| Smart Table | Indian seed data, editing, saving, deletion, confirmation, age filtering, email changes, and pagination |
| Other pages | Calendar grid and selected date, line chart, bar chart, and Tree Grid data |
| Authentication | Login, Register, Request Password, and Reset Password routes, headings, email fields, password-field counts, and actions |
| Backend | ASP.NET Core `/api/health` status, application name, and framework response |
| Test architecture | User-facing locators, CSS locators, reusable locators, page objects, automatic fixtures, tags, parallel execution, and failure artifacts |
| Mobile | Responsive form entry, navigation collapse, dashboard interaction, profile identity, and footer branding |

### Run the tests

Install the dependencies and Chromium once:

```powershell
npm install
npm run install:all
npx playwright install chromium
```

Run the complete suite:

```powershell
npm test
```

Useful focused commands:

```powershell
npx playwright test tests/comprehensiveCoverage.spec.ts
npx playwright test --project=mobile
npx playwright test --grep "music player"
npm run test:headed
npm run test:report
```

Playwright starts the API at `http://127.0.0.1:5000` and the React application at `http://127.0.0.1:5173`. In CI it also records traces on retry, captures failure screenshots, and uploads the HTML report.

## Website implementation

### Frontend

- React 19, TypeScript, and Vite
- Angular/Nebular-inspired responsive dashboard with Light, Dark, Cosmic, and Corporate themes
- Personalized Prateek Mishra profile and footer
- Draggable and keyboard-accessible temperature control
- Functional smart-home toggles, room controls, dashboard selectors, camera controls, forms, tables, overlays, tooltips, charts, calendar, and authentication screens
- Browser-generated local music with three original tracks, avoiding external media dependencies
- Client-side routing with direct-link and browser-history support

### Backend

- ASP.NET Core 10 minimal API
- `/api/health` health endpoint
- CORS configuration for local Vite development
- Static React production hosting and SPA fallback routing

### Project structure

```text
ClientApp/       React application, styles, and public assets
Server/          ASP.NET Core API and production host
tests/           Playwright desktop and mobile specifications
page-objects/    Reusable navigation and form page objects
Dockerfile       Multi-stage React + .NET production image
render.yaml      Free Render deployment configuration
```

## Run the website locally

Prerequisites: .NET 10 SDK and Node.js 24 or newer.

Start the API and frontend in separate PowerShell terminals:

```powershell
dotnet run --project Server/Server.csproj
```

```powershell
npm run dev --prefix ClientApp
```

Create a production build with:

```powershell
npm run build
```

## Free deployment on Render

The multi-stage `Dockerfile` compiles React and places it in ASP.NET Core's static web root. One .NET process serves both the website and `/api/health` on Render's free plan.

1. Sign in at [Render](https://dashboard.render.com/) with GitHub.
2. Select **New > Blueprint**.
3. Connect `Prats222/playwright-framework-dotnet-react`.
4. Confirm the service plan is **Free** and apply the blueprint.
5. Wait for the Docker build and health check to complete.

Every commit to `main` deploys after GitHub CI passes. Free services sleep after inactivity, so the first request after an idle period can take roughly a minute.

Test a deployed instance with:

```powershell
$env:URL="https://automation-pm.onrender.com"
npm test
Remove-Item Env:URL
```
