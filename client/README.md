# Frontend documentation

This document summarizes the frontend of the Video Recorder & Playback Web App, based on the current code and the project git history. The history shows the frontend was repeatedly adjusted for deployment correctness, socket configuration, and geolocation/eligibility handling, which is a good indicator of how the app is expected to run in both local development and production.

## 1. Overview

The frontend is a React + Vite single-page application for a recording and playback workflow that supports both candidate and employer/interviewer flows. It is organized around route-based screens, a shared API utility layer, and a live Socket.IO connection used for activity tracking and real-time recording events.

The app includes:

- Candidate recording flow
- Interview and activity monitoring screens
- Employer/employment views
- Candidate information and eligibility checks
- Live recording-event tracking through Socket.IO
- Map-based location and geolocation UI logic

## 2. Tech stack

The frontend uses:

- React 19
- Vite 8 for development/build tooling
- React Router for SPA navigation
- Material UI and Emotion for UI components
- Tailwind for styling support
- Socket.IO client for real-time events
- Leaflet / React Leaflet / MapTiler for maps and geolocation features
- Wavesurfer for audio or waveform-related playback utilities

The package configuration shows a browser-focused app intended to operate with a backend API and a real-time socket server.

## 3. App structure

The main client application is under `client/src`.

Key parts include:

- `src/App.jsx` — root app shell and route configuration
- `src/api.js` — API base URL and response handling helper functions
- `src/socket.js` — Socket.IO client setup and recording activity emission
- `src/components/` — feature-specific UI components
  - `candidate/` — login/register, candidate info, recording entry flows
  - `employer/` — employer dashboards and employment pages
  - `recording/` — recording interface, countdown, timer, background controls, video result views
  - `activity/` — activity log and file list panels
  - `layout/` — navigation and shared layout
  - `map/` — map and location radius logic
  - `ui/` — reusable buttons or generic UI primitives

## 4. Runtime architecture

### App shell

`App.jsx` sets up the browser router and defines the main routes:

- `/` → `EntryPoint`
- `/api/interviewer/live-proctoring` → `ActivityLogPage`
- `/api/interviewer/file-list` → `FileListPanel`
- `/api/interviewer/employment` → `EmploymentPage`
- `/api/candidate/recording` → `RecordingPage`
- `/api/candidate/candidate-info` → `CandidateInfo`

The app also manages socket connection state with `connectionStatus`, toggling between `connecting`, `connected`, and `disconnected` states. This status is passed into the recording page so users can see if the app is connected to the backend event server.

### Navigation

`TopNavigation` and `Header` wrap the route content with a consistent UI shell. The routing is intentionally organized around interviewer and candidate domains, which suggests a split between system-admin or employer-side functions and candidate/self-service recording.

## 5. API layer

The API client logic is centralized in `src/api.js`.

The file defines:

- `defaultBackendUrl`: production fallback backend URL
- `configuredBackendUrl`: value from `import.meta.env.VITE_API_URL?.trim()`
- `API_BASE_URL`: resolved host, using either the configured value or the production default when not in dev mode
- `apiUrl(path)`: builds a request URL while normalizing leading slashes
- `readApiResponse(response, fallbackMessage)`: reads response text, parses JSON when present, and throws informative errors for invalid or empty responses

The significant pattern is:

```js
export const API_BASE_URL = (
  configuredBackendUrl || (import.meta.env.DEV ? "" : defaultBackendUrl)
).replace(/\/+$/, "");
```

This means:

- In development, if no environment override is set, the app avoids forcing a default backend URL.
- In production, it falls back to the deployment backend URL.
- The app prefers a configured environment value over a hardcoded one, which is a deliberate deployment-safe pattern.

The git history confirms this was intentionally corrected several times, especially around backend URL alignment for deployment; the commit history in this repo includes fixes such as `fix: correct backend URL in api.js and vite.config.js for proper deployment` and `fix: remove default backend URL and simplify API_BASE_URL assignment`.

## 6. Socket.IO setup

The Socket.IO client is configured in `src/socket.js`.

```js
const socketUrl = import.meta.env.VITE_SOCKET_URL;

export const socket = io.connect(socketUrl, {
  autoConnect: false,
  transports: ["websocket", "polling"],
});
```

The socket:

- is created with a configurable URL from `VITE_SOCKET_URL`
- disables automatic connection until the app explicitly connects
- allows both `websocket` and `polling` transport fallback
- emits an activity payload with `recordActivity` using a timestamp and socket ID

The frontend also emits recording events such as:

- `recording:started`
- `recording:paused`
- `recording:resumed`
- `recording:stopped`

The README and application behavior show that each event includes an ISO `timestamp`, and the stop event includes a `reason` value such as `stopped` or `cancelled`.

## 7. Vite dev server and proxy configuration

The frontend’s Vite config (`client/vite.config.js`) proxies requests during local development:

- `/api` → backend service
- `/static` → backend static files
- `/socket.io` → backend socket endpoint

This lets the frontend use relative paths in development without needing to hardcode a local backend address. The proxy is configured with `changeOrigin: true`, and the socket path is handled as a WebSocket-capable proxy.

The git history shows the frontend was updated several times to refine this setup, including removal of unnecessary proxy settings and making socket connection configuration more explicit.

## 8. Environment variables

The frontend expects the following Vite environment variables to be available:

- `VITE_API_URL` — backend base URL for API calls
- `VITE_SOCKET_URL` — backend URL for the Socket.IO client
- `VITE_SOCKET_PATH` — socket path override, if needed
- `VITE_*` variables are the standard Vite pattern because they are exposed to browser code safely

The app intentionally uses `VITE_` prefix variables because Vite only exposes those to the client build. This matches the pattern used throughout the project and is consistent with the deployment fixes in the commit history.

## 9. Local development workflow

To run the frontend locally:

```bash
cd client
npm install
npm run dev
```

During local development, the Vite dev server proxies backend requests, so the app can use the dev environment without manually switching URLs in code. This is a key operational pattern in the repo history and is especially visible in the earlier documentation and deployment-related fixes.

## 10. Production deployment notes

The repo history shows deployment configuration was a recurring concern. The project’s frontend was adjusted to ensure the correct deployed backend is used in production and that Socket.IO uses the right server/transport configuration.

Production deployment guidance from the codebase:

- Set `VITE_API_URL` in the frontend host or deployment environment to override the default backend URL.
- Set `VITE_SOCKET_URL` if the live socket endpoint differs from the main backend endpoint.
- For the backend, ensure `CLIENT_ORIGIN` is configured to the exact frontend origin when deployed behind a host like Render.
- Redeploy both frontend and backend after modifying service environment variables.

This is especially important because the frontend and backend are separate deployment targets, and the git history shows multiple fixes where a broken or stale backend URL caused connection issues.

## 11. Frontend feature themes observed in the code

From the routed screens and component layout, the frontend is organized around a few major product areas:

### Candidate experience

- Candidate login/register flows
- Candidate info and eligibility display
- Recording interface and recording status
- Video result display and playback-related components

### Employer / interviewer experience

- Employment page
- Interview activity log
- File list panel
- Monitoring pages for live or recorded sessions

### Geolocation and eligibility checks

The codebase includes components and logic for geolocation, map marker placement, radius validation, and candidate eligibility. The git history shows repeated fixes in these areas, such as null-handling guards, IP state tracking, and logic updates for location checks. This indicates the frontend is handling real-world edge cases around user location and geofencing.

## 12. Git history takeaways

The frontend’s git history is useful as a design and maintenance history:

- Several commits were devoted to fixing API/backend URL selection for deployment.
- Socket configuration was adjusted multiple times to ensure correct server connection and transport handling.
- Candidate geolocation and location-related checks were hardened against null inputs and inconsistent state.
- Browser-side error logs and connection-status handling were added to make failures easier to diagnose.

In other words, the project’s frontend evolved from a simple UI shell into a more production-aware application with operational safeguards, clearer environment configuration, and stronger real-time connectivity handling.

## 13. Summary

The frontend is a Vite-based React application that connects to a backend service and a Socket.IO server, supports candidate and interviewer flows, and manages real-time recording and geolocation-aware behavior. Its architecture is deliberately split into route-based pages, a central API utility layer, and a shared socket layer. The git history shows the team repeatedly corrected environment configuration and runtime reliability issues, which is a strong signal that the app’s deployment model and connection logic were treated as critical operational requirements.
