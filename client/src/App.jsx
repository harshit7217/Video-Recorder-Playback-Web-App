import { BrowserRouter, Routes, Route } from "react-router";
import VideoRecording from "./components/VideoRecording.jsx";
import LiveProctoring from "./components/LiveProctoring.jsx";
import Sidebar from "./components/SideBar.jsx";
import Header from "./components/Header.jsx";
import { socket } from "./socket.js";
import { useState, useEffect } from "react";
import { emitRecordingEvent } from "./socket.js";
import Details from "./components/Details.jsx";

function App() {
  const [socketStatus, setSocketStatus] = useState(
    socket.connected ? "connected" : "connecting",
  );
  // const handleConnect = () => setSocketStatus("connected");
  // const handleDisconnect = () => {
  //   setSocketStatus("disconnected");
  // };

  useEffect(() => {
    const handleConnect = () => {
      setSocketStatus("connected");
      console.log("Socket connected:", socket.id);
    };

    const handleDisconnect = (reason) => {
      setSocketStatus("disconnected");
      console.log("Socket disconnected:", reason);
    };

    const handleConnectError = (error) => {
      console.error("Socket connection error:", error.message);
      setSocketStatus("connecting");
    };

    socket.on("connect", handleConnect);
    socket.on("disconnect", handleDisconnect);
    socket.on("connect_error", handleConnectError);

    // Set the initial status and initiate the connection
    setSocketStatus(socket.connected ? "connected" : "connecting");

    if (!socket.connected) {
      socket.connect();
    }

    return () => {
      socket.off("connect", handleConnect);
      socket.off("disconnect", handleDisconnect);
      socket.off("connect_error", handleConnectError);

      // Disconnect only if this component owns the socket lifecycle.
      socket.disconnect();
    };
  }, []);

  // copy paste event handling
  const handleCopyAndPaste = (event, status) => {
    event.preventDefault();
    status === "copy"
      ? emitRecordingEvent("activities", {
          reason: `user copied text to clipboard - (${window.getSelection().toString()})`,
          eventName: "text:copied",
        })
      : emitRecordingEvent("activities", {
          reason: `user pasted text to clipboard - (${(event.clipboardData || window.clipboardData).getData("text")})`,
          eventName: "text:pasted",
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
            <Route path="/api/live-proctoring" element={<LiveProctoring />} />
            <Route path="api/details" element={<Details />} />
          </Routes>
        </main>
      </div>
    </BrowserRouter>
  );
}

export default App;
