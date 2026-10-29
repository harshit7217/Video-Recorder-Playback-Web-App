import { BrowserRouter, Routes, Route } from "react-router";
import VideoRecording from "./components/VideoRecording.jsx";
import LiveProctoring from "./components/LiveProctoring.jsx";
import Sidebar from "./components/SideBar.jsx";
import Header from "./components/Header.jsx";
import { socket } from "./socket.js";
import { useState, useEffect } from "react";
import Details from "./components/Details.jsx";

function App() {
  const [connectionStatus, setConnectionStatus] = useState(
    socket.connected ? "connected" : "connecting",
  );

  useEffect(() => {
    const onSocketConnect = () => setConnectionStatus("connected");
    const onSocketDisconnect = () => setConnectionStatus("disconnected");
    socket.on("connect", onSocketConnect);
    socket.on("disconnect", onSocketDisconnect);

    // Set the initial status and initiate the connection
    setConnectionStatus(socket.connected ? "connected" : "connecting");

    socket.connect();

    return () => {
      socket.off("connect", onSocketConnect);
      socket.off("disconnect", onSocketDisconnect);
    };
  }, []);

  return (
    <BrowserRouter className="h-[100vh]">
      <div>
        <Sidebar />
        <Header />
        <main className="p-4">
          <Routes>
            <Route
              path="/"
              element={<VideoRecording connectionStatus={connectionStatus} />}
            />
            <Route path="/api/live-proctoring" element={<LiveProctoring />} />
            <Route path="api/details" element={<Details />} />
          </Routes>
        </main>
      </div>
    </BrowserRouter>
  );
}

export default App;
