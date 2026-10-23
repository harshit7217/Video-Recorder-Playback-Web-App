import { BrowserRouter, Routes, Route } from "react-router";
import VideoRecording from "./components/VideoRecording.jsx";
import Details from "./components/Details.jsx";
import Sidebar from "./components/SideBar.jsx";
import Header from "./components/Header.jsx";
import { socket } from "./socket.js";
import { useState, useEffect } from "react";

function App() {
  const [socketStatus, setSocketStatus] = useState(
    socket.connected ? "connected" : "connecting",
  );

  const handleConnect = () => setSocketStatus("connected");
  const handleDisconnect = () => setSocketStatus("disconnected");

  useEffect(() => {
    socket.on("connect", handleConnect);
    socket.on("disconnect", handleDisconnect);
    socket.connect();

    return () => {
      socket.off("connect", handleConnect);
      socket.off("disconnect", handleDisconnect);
      socket.disconnect();
    };
  }, []);

  return (
    <BrowserRouter className="h-[100vh]">
      <Sidebar />
      <Header />
      <main className="p-4">
        <Routes>
          <Route
            path="/"
            element={<VideoRecording socketStatus={socketStatus} />}
          />
          <Route path="/api/details" element={<Details />} />
        </Routes>
      </main>
    </BrowserRouter>
  );
}

export default App;
