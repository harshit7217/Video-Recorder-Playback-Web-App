import { useEffect, useState } from "react";
import WaveSurfer from "wavesurfer.js";

export const formatVideoDuration = (totalSeconds = 0) => {
  if (!Number.isFinite(totalSeconds) || totalSeconds < 0) return "00:00";

  const h = Math.floor(totalSeconds / 3600);
  const m = Math.floor((totalSeconds % 3600) / 60);
  const s = Math.floor(totalSeconds % 60);

  const mm = String(m).padStart(2, "0");
  const ss = String(s).padStart(2, "0");

  return h > 0 ? `${h}:${mm}:${ss}` : `${mm}:${ss}`;
};

export default function VideoDuration({ videoUrl }) {
  const [videoDurationSeconds, setVideoDurationSeconds] = useState(0);

  useEffect(() => {
    if (!videoUrl) return;

    const waveSurfer = WaveSurfer.create({
      container: document.createElement("div"),
    });

    waveSurfer.load(videoUrl);
    waveSurfer.on("ready", (dur) => setVideoDurationSeconds(dur));
    waveSurfer.on("error", (err) => console.error("WaveSurfer error:", err));

    return () => waveSurfer.destroy();
  }, [videoUrl]);
  return formatVideoDuration(videoDurationSeconds);
}
