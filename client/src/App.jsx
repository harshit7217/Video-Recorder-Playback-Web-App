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
  const [isLogin, setIsLogin] = useState(false);
  const [candidate, setCandidate] = useState(() => {
    try {
      const savedCandidate = localStorage.getItem("candidate");
      return savedCandidate ? JSON.parse(savedCandidate) : null;
    } catch (error) {
      console.error("Error reading saved candidate:", error);
      return null;
    }
  });

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

  useEffect(() => {
    if (candidate) {
      localStorage.setItem("candidate", JSON.stringify(candidate));
      return;
    }

    localStorage.removeItem("candidate");
  }, [candidate]);

  return (
    <BrowserRouter className="h-[100vh]">
      <div>
        <TopNavigation isLogin={isLogin} setIsLogin={setIsLogin} />
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
            <Route
              path="/register-candidate"
              element={<Candidate isLogin={isLogin} setCandidate={setCandidate} />}
            />
            <Route
              path="/candidate-info"
              element={<CandidateInfo candidate={candidate} setCandidate={setCandidate} />}
            />
          </Routes>
        </main>
      </div>
    </BrowserRouter>
  );
}

export default App;
