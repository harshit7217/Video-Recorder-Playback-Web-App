<h1>Video-Recorder-Playback-Web-App</h1>

## Backend proxy and Socket.IO connection

During local development, Vite proxies `/api`, `/static`, and `/socket.io` to
`https://video-recorder-playback-web-app.onrender.com`. Start the frontend with
`npm run dev`; API requests and Socket.IO use these proxied paths by default.
Override the socket server URL and transport path with the Vite environment
variables `VITE_SOCKET_URL` and `VITE_SOCKET_PATH` if needed.

The Vite proxy is for development only. When hosting the built frontend
separately, configure that host to reverse-proxy the same paths to the backend,
or set `VITE_SOCKET_URL` to the backend URL for the Socket.IO connection.

When connected, the app emits `recording:started`, `recording:paused`,
`recording:resumed`, and `recording:stopped`. Each event includes an ISO
`timestamp`; the stopped event also includes a `reason` (`stopped` or
`cancelled`). The server logs these events. Video data is not sent over the
socket.
