import { BrowserRouter, Routes, Route } from "react-router";
import VideoRecording from "./components/VideoRecording.jsx";
import Details from "./components/Details.jsx";
import Sidebar from "./components/SideBar.jsx";
import Header from "./components/Header.jsx";
import { socket } from "./socket.js";
import { useState, useEffect } from "react";
import { emitRecordingEvent } from "./socket.js";

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

  // copy paste event handling
  const handleCopyAndPaste = (event, status) => {
    event.preventDefault();
    status === "copy"
      ? emitRecordingEvent("activities", {
          reason: `user copied text to clipboard - (${window.getSelection().toString()})`,
          eventName: "text:copy",
        })
      : emitRecordingEvent("activities", {
          reason: `user pasted text to clipboard - (${(event.clipboardData || window.clipboardData).getData("text")})`,
          eventName: "text:paste",
        });
  };

  return (
    <BrowserRouter className="h-[100vh]">
      <div
        onCopy={() => handleCopyAndPaste(event, "copy")}
        onPaste={() => handleCopyAndPaste(event, "paste")}
      >
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
      </div>
    </BrowserRouter>
  );
}

export default App;
