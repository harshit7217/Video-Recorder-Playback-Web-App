import { useCallback } from "react";

const TimeLeft = ({ count }) => {
  // time limit - format
  const timeParser = useCallback((duration) => {
    const durationMinutes = Math.floor(duration / 60);
    let durationSeconds = duration % 60;
    const durationFormattedMintues = String(durationMinutes).padStart(2, "0");
    if (durationSeconds < 10) {
      durationSeconds = String(durationSeconds).padStart(2, "0");
    }
    return `${durationFormattedMintues}:${durationSeconds}`;
  });
  return (
    <div className="absolute right-4 top-4 z-20 flex items-center gap-2 rounded-full bg-black/60 px-4 py-2 text-sm font-medium text-white backdrop-blur-md">
      <span className="h-2 w-2 animate-pulse rounded-full bg-red-500" />
      {timeParser(count)}
    </div>
  );
};

export default TimeLeft;
