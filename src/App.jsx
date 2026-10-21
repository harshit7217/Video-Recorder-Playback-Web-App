import { BrowserRouter, Link, Routes, Route } from "react-router";
import VideoRecording from "./components/VideoRecording.jsx";
import Details from "./components/Details.jsx";
import Sidebar from "./components/SideBar.jsx";
import Header from "./components/Header.jsx";

function App() {
  return (
    <BrowserRouter className="h-[100vh]">
      <Sidebar />
      <Header />
      <main className="p-4">
        <Routes>
          <Route path="/" element={<VideoRecording />} />
          <Route path="/api/details" element={<Details />} />
        </Routes>
      </main>
    </BrowserRouter>
  );
}

export default App;
