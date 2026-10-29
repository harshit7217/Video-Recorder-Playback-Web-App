import { BrowserRouter, Routes, Route } from "react-router";
import VideoRecording from "./components/VideoRecording.jsx";
import LiveProctoring from "./components/LiveProctoring.jsx";
import Sidebar from "./components/SideBar.jsx";
import Header from "./components/Header.jsx";
import { socket, emitRecordingEvent } from "./socket.js";
import { useState, useEffect } from "react";
import Details from "./components/Details.jsx";

function App() {
  const [socketStatus, setSocketStatus] = useState(
    socket.connected ? "connected" : "connecting",
  );

  useEffect(() => {
    const handleConnect = () => {
      setSocketStatus("connected");
      console.log("Socket connected:", socket.id);
    };

    const handleDisconnect = (reason) => {
      setSocketStatus("disconnected");
      console.log("Socket disconnected:", reason);
    };

    socket.on("connect", handleConnect);
    socket.on("disconnect", handleDisconnect);

    // Set the initial status and initiate the connection
    setSocketStatus(socket.connected ? "connected" : "connecting");

    socket.connect();

    return () => {
      socket.off("connect", handleConnect);
      socket.off("disconnect", handleDisconnect);
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
              element={<VideoRecording socketStatus={socketStatus} />}
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
