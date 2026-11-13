# Backend documentation

This document summarizes the backend of the Video Recorder & Playback Web App based on the current code and the project git history. The backend evolved around a few recurring themes: MongoDB-backed account and location data, Express API routes for employer and candidate workflows, geo-location checks, and a Socket.IO server for recording activity tracking. The git history shows several fixes to deployment config, IP geolocation handling, Socket.IO bindings, and request flow clarity, which is useful context for understanding how the backend is expected to run in both local development and production.

## 1. Overview

The backend is an Express.js service that runs alongside the frontend and provides:

- REST API routes for employer and candidate flows
- MongoDB persistence for candidate account data and employer-location records
- Geolocation lookup using an external IP geolocation API
- Radius validation logic to determine whether a candidate is within an employer-defined boundary
- A Socket.IO server for live recording activity events and activity log persistence
- Static file serving for recorded or generated data files

The server’s entry point is `server/app.js`, which creates the Express application, configures CORS, connects to MongoDB, wires API routes, and starts the Socket.IO server.

## 2. Tech stack

The backend is built with:

- Node.js
- Express 5
- MongoDB via Mongoose
- Socket.IO
- dotenv for environment variables
- validator for input validation
- IP geolocation SDK for external geolocation lookups

The project package also includes `ejs`, though the backend currently appears to use mostly JSON responses and a socket-driven flow rather than server-rendered EJS templates.

## 3. Runtime architecture

### Entry point

`server/app.js` does the main bootstrapping:

- loads environment variables using `dotenv.config()`
- connects to MongoDB with `connectDB()`
- reads `SOCKET_PORT` and `CLIENT_ORIGIN` from environment variables
- creates an Express app and applies CORS to allowed origins
- mounts route groups for employers, candidates, and IP geolocation
- serves static files from the `server/data` directory under `/static`
- registers socket event handlers via `registerSocketHandlers(io)`
- starts the server on `0.0.0.0` on the configured port

A key operational pattern is that the backend listens on all interfaces rather than localhost only, which was fixed in the git history as part of deployment support:

- `fix: update socket server to listen on all interfaces`
- `fix: add default port fallback for socket server configuration`
- `fix: remove default port fallback in socket server configuration`

This shows the backend was adjusted to work more reliably in hosted environments where binding to all interfaces and a fallback port are required.

## 4. Environment configuration

The backend relies on environment variables such as:

- `MONGODB_URI` — MongoDB connection string
- `SOCKET_PORT` — port used by the Socket.IO server
- `CLIENT_ORIGIN` — frontend origin allowed by CORS
- `IPGEO_API_KEY` — API key for IP geolocation lookup

The app uses `cors({ origin: clientOrigin })`, so the frontend must be allowed explicitly via the configured origin. The git history includes a commit specifically about simplifying this setting:

- `fix: simplify client origin assignment in app.js`

This indicates that origin configuration is part of the backend’s operational correctness and is especially important in cross-origin browser requests during deployment.

## 5. Database layer

### MongoDB connection

The database connection logic is in `server/config/db.js`.

```js
const connectDB = async () => {
  try {
    await mongoose.connect(mongoDB_URI);
    console.log("MongoDB connected");
  } catch (err) {
    console.error("MongoDB connection error:", err);
    process.exit(1);
  }
};
```

The server does not use a separate database abstraction layer; the controller files directly interact with Mongoose models. This keeps the backend small but means database logic is tightly coupled to route handlers and service code.

### Candidate model

`server/models/candidateModel.js` contains the candidate schema:

- `username` — required unique string
- `password` — required string
- `latitude` and `longitude` — optional numeric fields
- `name` — optional string

This model is used for candidate sign-up, login, and lookup flows.

### Employer account model

`server/models/employerAccountModel.js` is used for employer authentication and account management. The exact file name suggests a separate account record from the location-based employer model.

### Employer location model

`server/models/employerModels.js` defines the location schema used by the employer radius feature:

- `employerId` — reference to the employer account
- `lat` — latitude
- `lng` — longitude
- `radius` — default 500 meters
- `name` — default label for the selected location
- timestamps enabled via `timestamps: true`

This model is the core data source for geofencing and candidate-radius eligibility checks.

## 6. API routes

The backend has separate route modules under `server/routes`.

### Candidate routes

`server/routes/candidateRoutes.js` exposes:

- `POST /api/candidates/register`
- `POST /api/candidates/login`
- `GET /api/candidates/details`
- `POST /api/candidates/check-radius`

These endpoints coordinate with `candidateControllers.js` for user registration, auth, profile lookup, and employer radius validation.

### Employer routes

`server/routes/employerRoutes.js` exposes:

- `POST /api/employers/post`
- `GET /api/employers/`
- `DELETE /api/employers/:id`
- `PUT /api/employers/:id`
- `POST /api/employers/register-employer`
- `POST /api/employers/login-employer`

This indicates a simple CRUD display of employer location records plus authentication endpoints for employer accounts.

### IP geolocation route

`server/routes/ipRoute.js` exposes:

- `GET /api/ip/geolocation`

This route is mounted after `app.set("trust proxy", true)` so the server can trust forwarded client IP values in proxied or production environments.

## 7. Controllers and business logic

### Candidate controller

`server/controllers/candidateControllers.js` handles:

- `createCandidate`: validates email and password strength, checks for duplicates, stores a new candidate
- `loginCandidate`: validates credentials and returns candidate details on success
- `getCandidateDetails`: fetches a candidate by username
- `checkCandidateInEmployerRadius`: validates lat/lng, loads employer locations, checks against radius, and returns whether the candidate is inside an employer radius

The controller uses `validator` for strong-password enforcement and email validation. It also imports `isLocationWithinRadius` from the distance utility service, which suggests a geospatial business rule is enforced in a dedicated service rather than inside the controller.

### Employer controller

`server/controllers/employerControllers.js` handles employer account registration, login, and location management.

Core behaviors:

- `registerEmployer`: validates email and password, prevents duplicate usernames
- `loginEmployer`: checks the account and returns login success/failure
- `postEmployer`: creates a new employer location record for a given employer account
- `getAllEmployers`: fetches employer location records, optionally filtered by employer ID
- `updateEmployerById`: updates an employer location and returns a trimmed radius payload
- `deleteEmployerById`: deletes a specific employer location record

A default location is defined in the controller:

```js
const defaultEmployerLocation = {
  lat: 28.44373061164518,
  lng: 77.05585275554049,
  radius: 500,
  name: "Shaheed Major Vikas Yadav Marg, Sector 39, Gurgaon, Haryana, 101301, India",
};
```

This acts as a fallback center point and is used when the client does not provide coordinates.

## 8. Geolocation and radius logic

### Radius calculations

`server/services/checkRadiusOfCandidate.js` implements a haversine-based distance check using Earth radius in meters.

Key exports:

- `calculateDistanceInMeters({ lat1, lng1, lat2, lng2 })`
- `isLocationWithinRadius({ employerLat, employerLng, interviewLat, interviewLng, radiusInMeters })`

This service validates numeric coordinates and throws errors if latitude or longitude values are invalid. This allows the backend to reject malformed location inputs rather than silently failing.

### IP geolocation lookup

`server/services/ip-geolocationService.js` uses the `ip-geolocation-api-javascript-sdk` package to lookup the user’s IP geolocation using `IPGEO_API_KEY`.

It:

- reads the configured API key from environment variables
- creates a geolocation client with short timeouts
- calls `lookupIpGeolocation({ ip: ipAddress })`
- returns the response data and closes the client in a `finally` block

The controller wraps this service with error handling:

- if the API key is absent, it returns a 503 response
- if the lookup fails for another reason, it returns a 502 response

The git history shows strong attention to this feature:

- `feat: add IP geolocation controller to handle root route`
- `feat: implement IP geolocation route and integrate it into the server`
- `refactor: improve IP geolocation handling and error responses in controllers and services`
- `fix: update IP address used in geolocation lookup in ipService function`
- `fix: use dynamic IP address in geolocation lookup in ipService function`

This suggests geolocation was an evolving feature and that runtime correctness was important for both accuracy and deployment reliability.

## 9. Data persistence and file logging

The backend stores activity records in `server/data` as date-based text files.

`server/services/fileDataService.js` creates a file for the current date such as `26-10-2026.txt` and appends JSON activity records one per line. It keeps an in-memory array `data` as a temporary store and flushes it to disk when the recording client disconnects.

Features include:

- `saveActivitiesToDataFile()` — writes queued activity records to the current file
- `getDataFileNames()` — lists available data files for the frontend to request

This is a lightweight persistence strategy for socket-recorded activity logs without introducing a dedicated database model for activity events.

## 10. Socket.IO server

The Socket.IO backend is registered in `server/socket/socket.js`.

The server handles:

- `registerClient` — sets a `recordingClientId` to track which client is the primary recording client
- `requestData` — sends the in-memory activity list back to the client
- `disconnect` — flushes buffered activity data if the recorder disconnects
- `recordActivity` — converts event names to numeric codes using `socketActivity` and broadcasts them to all clients
- `clearActivities` — clears the in-memory list
- `requestFiles` — returns the list of stored data files

The event mapping file is `server/socket/socketActivity.js`, which translates strings like `recording:started` into numeric codes that are easier to store and analyze.

Example translations:

- `camera-connected` → `1`
- `recording:started` → `3`
- `recording:paused` → `4`
- `recording:resumed` → `5`
- `recording:stopped` → `6`

This creates a compact event representation while preserving readable event names on the client side.

The git history confirms that backend socket behavior was revised several times:

- `fix: add default port fallback for socket server configuration`
- `fix: update socket server to listen on all interfaces`
- `fix: update socket connection configuration to use specified transports`
- `fix: update socket connection URL to use environment variable and remove unused Postman resources`

This indicates the real-time channel was a major part of the production reliability story.

## 11. Typical request flow

A typical candidate or employer flow looks like this:

1. Frontend sends a request to the Express API.
2. Express route dispatches to a controller.
3. Controller validates input and queries Mongoose models.
4. For geolocation or radius checks, the controller invokes a service.
5. For recording activity, the frontend emits a Socket.IO event.
6. The backend stores activity data in memory and optionally flushes it to a date-based file.
7. The backend emits status or data back to connected clients.

This is a straightforward, event-oriented backend design that combines RESTful endpoints with a socket-driven real-time recording layer.

## 12. Production and deployment notes

The git history shows multiple backend improvements focused on deployment readiness.

Notable examples:

- `fix: update socket server to listen on all interfaces`
- `fix: add default port fallback for socket server configuration`
- `fix: simplify client origin assignment in app.js`
- `fix: update socket connection URL to use environment variable and remove unused Postman resources`
- `fix: remove default backend URL and simplify API_BASE_URL assignment` (this is frontend-related but tied to the deployment story)

These fixes suggest the application was deployed behind a hosted environment where localhost behavior and direct origin assumptions were not sufficient. In production, the following are especially important:

- the backend must bind to `0.0.0.0` rather than localhost-only
- `SOCKET_PORT` may need a fallback or explicit value
- `CLIENT_ORIGIN` must match the deployed frontend origin exactly
- `IPGEO_API_KEY` must be configured to enable IP geolocation
- `MONGODB_URI` must be valid and reachable in the deployment environment

## 13. Git history takeaways

The backend history shows a clear pattern:

- deployment-related server config was repeatedly adjusted for real hosting environments
- geo-location logic was refined as the app matured
- socket handling was hardened for production reliability
- database-backed employer and candidate flows were organized around CRUD and validation patterns
- activity data persistence was designed to be lightweight and file-based rather than requiring a heavy analytics backend

This means the backend is not just “a generic Express app”; it is a practical service designed to support a live recording workflow, location-aware candidate validation, and operational logging in a deployment setting.

## 14. Summary

The backend is a Node.js + Express + MongoDB + Socket.IO service that powers the recording, candidate, employer, and geolocation features of the app. It exposes REST endpoints for authentication and employer/candidate operations, performs geospatial validation for employer radius checks, serves static files for activity data, and provides a real-time event channel for recording updates. The git history shows the backend was intentionally refined for deployment safety, reliable socket binding, and more resilient geolocation and request handling. In short, the backend is a compact but production-aware service designed for a real-time interview/recording workflow.
