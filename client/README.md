<h1>Video-Recorder-Playback-Web-App</h1>

## Backend proxy and Socket.IO connection

During local development, Vite proxies `/api`, `/static`, and `/socket.io` to
`https://video-recorder-playback-web-app.onrender.com`. Start the frontend with
`npm run dev`; API requests and Socket.IO use these proxied paths by default.
Override the socket server URL and transport path with the Vite environment
variables `VITE_SOCKET_URL` and `VITE_SOCKET_PATH` if needed.

In production, API and static-file requests use
`https://video-recorder-playback-web-app.onrender.com` by default. Set
`VITE_API_URL` in the frontend host's build environment to override the backend
URL. Socket.IO uses the same URL by default; `VITE_SOCKET_URL` can override it
separately. Set the backend's `CLIENT_ORIGIN` environment variable to the exact
frontend origin (multiple comma-separated origins are supported), then redeploy
both services after changing these settings.

When connected, the app emits `recording:started`, `recording:paused`,
`recording:resumed`, and `recording:stopped`. Each event includes an ISO
`timestamp`; the stopped event also includes a `reason` (`stopped` or
`cancelled`). The server logs these events. Video data is not sent over the
socket.
