import { useCallback } from "react";

const RecordingTimer = ({ remainingSeconds }) => {
  // time limit - format
  const formatTimeLeft = useCallback((secondsLeft) => {
    const durationMinutes = Math.floor(secondsLeft / 60);
    let durationSeconds = secondsLeft % 60;
    const formattedMinutes = String(durationMinutes).padStart(2, "0");
    if (durationSeconds < 10) {
      durationSeconds = String(durationSeconds).padStart(2, "0");
    }
    return `${formattedMinutes}:${durationSeconds}`;
  });
  return (
    <div
      className="
  absolute right-3 top-3 z-20
  inline-flex items-center gap-2.5
  rounded-full
  bg-slate-950/75
  px-4 py-2.5
  text-sm font-semibold text-white
  shadow-lg shadow-black/20
  backdrop-blur-xl
  transition-all duration-300
  sm:right-4 sm:top-4 sm:px-5
"
    >
      {/* Recording Indicator */}
      <span className="relative flex h-2.5 w-2.5 items-center justify-center">
        <span
          className="
      absolute h-full w-full
      animate-ping rounded-full
      bg-red-400 opacity-70
    "
        />

        <span
          className="
      relative h-2 w-2
      rounded-full bg-red-500
      shadow-[0_0_8px_rgba(239,68,68,0.8)]
    "
        />
      </span>

      {/* Recording Label */}
      <span
        className="
    text-[10px] font-bold uppercase
    tracking-widest text-red-300
    sm:text-xs
  "
      >
        REC
      </span>

      {/* Divider */}
      <span className="h-4 w-px bg-white/20" />

      {/* Timer */}
      <span
        className="
    min-w-[48px] text-center
    font-mono text-sm font-bold
    tabular-nums tracking-wider
    sm:text-base
  "
      >
        {formatTimeLeft(remainingSeconds)}
      </span>
    </div>
  );
};

export default RecordingTimer;
