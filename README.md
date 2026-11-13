# Video-Recorder-Playback-Web-App

This project is a full-stack application for recording, monitoring, and playback workflows with a web frontend and a Node.js backend. The app supports candidate recording flows, employer/interviewer monitoring, geolocation-based validation, and real-time activity tracking through Socket.IO.

## Project structure

- [client/README.md](./client/README.md) — frontend overview, architecture, environment configuration, routing, API usage, and deployment notes
- [server/README.md](./server/README.md) — backend overview, Express routes, MongoDB models, geolocation logic, Socket.IO server, and deployment guidance

## Frontend overview

The frontend is a React + Vite application located in the [client/](./client/) folder. It includes:

- route-based screens for candidate and employer workflows
- a central API helper layer for backend requests
- Socket.IO client setup for live activity tracking
- map and geolocation features for candidate eligibility checks
- local development support through Vite proxy rules and environment variables such as `VITE_API_URL` and `VITE_SOCKET_URL`

The frontend documentation includes operational details from the git history, especially around backend URL configuration, socket transport handling, and deployment-safe runtime behavior.

## Backend overview

The backend is a Node.js + Express service located in the [server/](./server/) folder. It includes:

- REST APIs for candidate and employer authentication and data management
- MongoDB persistence for accounts and employer location records
- geolocation and radius validation logic using IP-based lookups and geographic distance calculations
- Socket.IO event handling for recording activity logs and file-backed persistence
- CORS and environment-variable configuration for deployment compatibility

The backend documentation describes how the service evolved across its git history, particularly around server binding, Socket.IO configuration, and geolocation reliability.

## Typical architecture

The frontend and backend work together as a connected system:

1. The frontend sends requests to the backend API.
2. The backend validates input and stores or retrieves application data from MongoDB.
3. The backend performs geolocation and radius checks when required for candidate validation.
4. The frontend and backend communicate in real time through Socket.IO for recording activity updates.
5. Activity records are persisted as date-based files in the backend data directory.

## Related docs

- [client/README.md](./client/README.md)
- [server/README.md](./server/README.md)

