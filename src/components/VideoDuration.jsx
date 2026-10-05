import { useEffect, useState } from "react";
import WaveSurfer from "wavesurfer.js";

export const formatDuration = (totalSeconds = 0) => {
  if (!Number.isFinite(totalSeconds) || totalSeconds < 0) return "00:00";

  const h = Math.floor(totalSeconds / 3600);
  const m = Math.floor((totalSeconds % 3600) / 60);
  const s = Math.floor(totalSeconds % 60);

  const mm = String(m).padStart(2, "0");
  const ss = String(s).padStart(2, "0");

  return h > 0 ? `${h}:${mm}:${ss}` : `${mm}:${ss}`;
};

export default function VideoDuration({ videoUrl }) {
  const [duration, setDuration] = useState(0);

  useEffect(() => {
    if (!videoUrl) return;

    const ws = WaveSurfer.create({
      container: document.createElement("div"),
    });

    ws.load(videoUrl);
    ws.on("ready", (dur) => setDuration(dur));
    ws.on("error", (err) => console.error("WaveSurfer error:", err));

    return () => ws.destroy();
  }, [videoUrl]);
  console.log(duration);
  return formatDuration(duration);
}
