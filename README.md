<h1>Video-Recorder-Playback-Web-App</h1>

## Socket.IO connection

Start the Socket.IO server in a separate terminal with `npm run server`. It
listens on `http://localhost:3001` by default. Start the Vite app with `npm run
dev`; the recording screen connects to the local server automatically. Override
the client URL and transport path with the Vite environment variables
`VITE_SOCKET_URL` and `VITE_SOCKET_PATH`. The server port and allowed frontend
origin can be changed with `SOCKET_PORT` and `CLIENT_ORIGIN`.

When connected, the app emits `recording:started`, `recording:paused`,
`recording:resumed`, and `recording:stopped`. Each event includes an ISO
`timestamp`; the stopped event also includes a `reason` (`stopped` or
`cancelled`). The server logs these events. Video data is not sent over the
socket.
