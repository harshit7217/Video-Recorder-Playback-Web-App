import { BrowserRouter, Routes, Route } from "react-router";
import RecordingPage from "./components/recording/RecordingPage.jsx";
import ActivityLogPage from "./components/activity/ActivityLogPage.jsx";
import TopNavigation from "./components/layout/TopNavigation.jsx";
import Header from "./components/layout/Header.jsx";
import { socket } from "./socket.js";
import { useState, useEffect } from "react";
import FileListPanel from "./components/activity/FileListPanel.jsx";
import EmploymentPage from "./components/employer/EmploymentPage.jsx";
import Candidate from "./components/candidate/Candidate.jsx";
import CandidateInfo from "./components/candidate/CandidateInfo.jsx";

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
        <TopNavigation />
        <Header />
        <main className="p-4">
          <Routes>
            <Route
              path="/"
              element={<RecordingPage connectionStatus={connectionStatus} />}
            />
            <Route path="/api/live-proctoring" element={<ActivityLogPage />} />
            <Route path="/api/details" element={<FileListPanel />} />
            <Route path="/employment" element={<EmploymentPage />} />
            <Route path="/register-candidate" element={<Candidate />} />
            <Route path="/candidate-info" element={<CandidateInfo />} />
          </Routes>
        </main>
      </div>
    </BrowserRouter>
  );
}

export default App;
