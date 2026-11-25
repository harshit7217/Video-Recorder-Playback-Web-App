import { useCallback, useState, useRef } from "react";
import NormalBackground from "./NormalBackground";
import BlurBackground from "./BlurBackground";
import ImageBackground from "./ImageBackground";

const MEDIAPIPE_URL =
  "https://cdn.jsdelivr.net/npm/@mediapipe/selfie_segmentation";

function loadSegmentationScript() {
  if (window.SelfieSegmentation) return Promise.resolve();
  return new Promise((resolve, reject) => {
    const script = document.createElement("script");
    script.src = `${MEDIAPIPE_URL}/selfie_segmentation.js`;
    script.crossOrigin = "anonymous";
    script.onload = resolve;
    script.onerror = () =>
      reject(
        new Error("Could not load the blur model. Check your connection."),
      );
    document.head.appendChild(script);
  });
}

const BackgroundController = ({
  canvasRef,
  segmenterRef,
  bgImageRef,
  isBlurEnabledRef,
  backgroundImagesRef,
}) => {
  const [modelStatus, setModelStatus] = useState("idle");
  const [normalOn, setNormalOn] = useState(true);
  const [blurOn, setBlurOn] = useState(false);
  const [bgImageState, setBgImageState] = useState([false, false]);

  const normalOnRef = useRef(true);

  const ensureSegmenter = async () => {
    if (segmenterRef.current) return;
    setModelStatus("loading");
    await loadSegmentationScript();
    const segmenter = new window.SelfieSegmentation({
      locateFile: (file) => `${MEDIAPIPE_URL}/${file}`,
    });
    segmenter.setOptions({ modelSelection: 1 }); // 1 = faster landscape model
    segmenter.onResults(handleSegmentationResults);
    await segmenter.initialize();
    segmenterRef.current = segmenter;
    setModelStatus("ready");
  };

  const drawBlurred = useCallback((results) => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const { width, height } = canvas;
    const ctx = canvas.getContext("2d");
    ctx.save();
    ctx.clearRect(0, 0, width, height);
    // Keep only the person from the sharp frame.
    ctx.drawImage(results.segmentationMask, 0, 0, width, height);
    ctx.globalCompositeOperation = "source-in";
    ctx.drawImage(results.image, 0, 0, width, height);
    // Fill in a blurred copy of the frame behind them.
    ctx.globalCompositeOperation = "destination-over";
    ctx.filter = `blur(12px)`;
    ctx.drawImage(results.image, 0, 0, width, height);
    ctx.restore();
  }, []);

  // Backgorund image
  const drawBgImage = useCallback((results, index) => {
    const canvas = canvasRef.current;
    if (!canvas || !results?.image || !results?.segmentationMask) return;

    const backgroundImage = bgImageRef.current[index];
    if (!backgroundImage) return;

    const { width, height } = canvas;
    const ctx = canvas.getContext("2d");
    if (!ctx) return;
    ctx.save();
    ctx.clearRect(0, 0, width, height);
    ctx.drawImage(results.segmentationMask, 0, 0, width, height);
    ctx.globalCompositeOperation = "source-in";
    ctx.drawImage(results.image, 0, 0, width, height);
    ctx.globalCompositeOperation = "destination-over";
    ctx.drawImage(backgroundImage, 0, 0, width, height);
    ctx.restore();
  }, []);

  const handleSegmentationResults = (results) => {
    if (isBlurEnabledRef.current) {
      drawBlurred(results);
    } else if (backgroundImagesRef.current[0]) {
      drawBgImage(results, 0);
    } else if (backgroundImagesRef.current[1]) {
      drawBgImage(results, 1);
    } else {
      drawOriginal(results);
    }
  };

  const handleToggleNormal = useCallback(async () => {
    const next = !blurOn;
    if (next) {
      try {
        await ensureSegmenter();
        backgroundImagesRef.current.forEach((_, i) => {
          backgroundImagesRef.current[i] = false;
        });
        setBgImageState((prev) => prev.map(() => false));

        isBlurEnabledRef.current = false;
        setBlurOn(false);
      } catch (err) {
        setModelStatus("idle");
        return;
      }
    }
    normalOnRef.current = next;
    setNormalOn(next);
  }, []);

  const handleToggleImageBackground = useCallback(async (index) => {
    const next = !bgImageState[index];
    if (next) {
      try {
        await ensureSegmenter();
        isBlurEnabledRef.current = false;
        setBlurOn(false);
        normalOnRef.current = false;
        setNormalOn(false);
        backgroundImagesRef.current.forEach((_, i) => {
          if (i !== index) {
            backgroundImagesRef.current[i] = false;
          }
        });
        setBgImageState((prev) => prev.map((_, i) => i === index));
        backgroundImagesRef.current[index] = true;
        setBgImageState((prev) => [...prev, (prev[index] = true)]);
      } catch (err) {
        setModelStatus("idle");
        return;
      }
    }
    backgroundImagesRef.current[index] = next;
    setBgImageState((prev) => [...prev, (prev[index] = next)]);
  }, []);

  const handleToggleBlurBackground = useCallback(async () => {
    const next = !blurOn;
    if (next) {
      try {
        await ensureSegmenter();
        backgroundImagesRef.current.forEach((_, i) => {
          backgroundImagesRef.current[i] = false;
        });
        setBgImageState((prev) => prev.map(() => false));
        normalOnRef.current = false;
        setNormalOn(false);

        isBlurEnabledRef.current = true;
        setBlurOn(true);
      } catch (err) {
        setModelStatus("idle");
        return;
      }
    }
    isBlurEnabledRef.current = next;
    setBlurOn(next);
  }, []);

  const toggleBg = useCallback(async (state, index) => {
    if (state === "normal") {
      handleToggleNormal();
    } else if (state === "blur") {
      handleToggleBlurBackground();
    } else if (state === "image") {
      handleToggleImageBackground(index);
    }
  }, []);

  return (
    <div
      className="
  relative w-full overflow-hidden
  rounded-2xl border border-slate-200/80
  bg-white shadow-sm
  dark:border-slate-700 dark:bg-slate-800
  sm:rounded-3xl
"
    >
      {/* Header */}
      <div
        className="
    flex flex-col gap-3
    border-b border-slate-100
    bg-gradient-to-r from-white via-indigo-50/40 to-violet-50/50
    p-4 dark:border-slate-700
    dark:from-slate-800 dark:via-slate-800 dark:to-indigo-950/30
    sm:flex-row sm:items-center sm:justify-between
    sm:px-6 sm:py-5
  "
      >
        <div className="flex items-center gap-3">
          {/* Header Icon */}
          <div
            className="
        flex h-11 w-11 shrink-0
        items-center justify-center
        rounded-xl bg-indigo-600
        text-white shadow-md shadow-indigo-200/50
        dark:shadow-none
      "
          >
            <svg
              className="h-5 w-5"
              viewBox="0 0 24 24"
              fill="none"
              stroke="currentColor"
              strokeWidth="1.8"
            >
              <rect x="3" y="3" width="18" height="18" rx="3" />
              <circle cx="9" cy="9" r="2" />
              <path d="m21 15-5-5L5 21" />
            </svg>
          </div>

          <div>
            <h3
              className="
          text-base font-bold tracking-tight
          text-slate-900 dark:text-white
          sm:text-lg
        "
            >
              Background Settings
            </h3>

            <p
              className="
          mt-1 text-xs text-slate-500
          dark:text-slate-400 sm:text-sm
        "
            >
              Customize how you appear in your recording.
            </p>
          </div>
        </div>

        {/* Model Loading Indicator */}
        {modelStatus === "loading" && (
          <div
            className="
        flex w-fit items-center gap-2
        rounded-full border border-indigo-100
        bg-indigo-50 px-3 py-2
        text-xs font-semibold text-indigo-700
        dark:border-indigo-500/20
        dark:bg-indigo-500/10 dark:text-indigo-300
      "
          >
            <span
              className="
          h-3.5 w-3.5 animate-spin
          rounded-full border-2
          border-indigo-300 border-t-indigo-600
          dark:border-indigo-400/30
          dark:border-t-indigo-400
        "
            />
            Preparing background...
          </div>
        )}
      </div>

      {/* Selection Content */}
      <div
        className="
    bg-slate-50/60 p-4
    dark:bg-slate-900/30
    sm:p-5 md:p-6
  "
      >
        {/* Section Label */}
        <div
          className="
      mb-4 flex flex-wrap
      items-center justify-between gap-2
    "
        >
          <div>
            <p
              className="
          text-xs font-bold uppercase
          tracking-wider text-slate-700
          dark:text-slate-200
        "
            >
              Choose Background Style
            </p>

            <p
              className="
          mt-1 text-[11px]
          text-slate-400 sm:text-xs
        "
            >
              Select your preferred recording appearance.
            </p>
          </div>

          <span
            className="
        rounded-lg border border-slate-200
        bg-white px-2.5 py-1.5
        text-[10px] font-semibold
        text-slate-500
        dark:border-slate-700 dark:bg-slate-800
        dark:text-slate-400
      "
          >
            4 OPTIONS
          </span>
        </div>

        {/* Background Options Grid */}
        <div
          className="
      grid grid-cols-1 gap-3
      min-[420px]:grid-cols-2
      lg:grid-cols-4
    "
        >
          {/* Normal Background */}
          <NormalBackground
            normalOn={normalOn}
            toggleBg={() => toggleBg("normal")}
            modelStatus={modelStatus}
            icon={"◯"}
            label={"Normal"}
            subtitle={"Original background"}
          />

          {/* Blur Background */}
          <BlurBackground
            blurOn={blurOn}
            toggleBg={() => toggleBg("blur")}
            modelStatus={modelStatus}
            icon={"◌"}
            label={"Blur"}
            subtitle={"Soft background"}
          />

          {/* Office Background */}
          <ImageBackground
            bgImageState={bgImageState[0]}
            toggleBg={() => toggleBg("image", 0)}
            modelStatus={modelStatus}
            icon={"🏢"}
            label={"Office"}
            subtitle={"Professional setting"}
          />

          {/* Sunflower Background */}
          <ImageBackground
            bgImageState={bgImageState[1]}
            toggleBg={() => toggleBg("image", 1)}
            modelStatus={modelStatus}
            icon={"🌻"}
            label={"Sunflower"}
            subtitle={"Bright background"}
          />
        </div>

        {/* Footer Information */}
        <div
          className="
      mt-5 flex items-start gap-2.5
      rounded-xl border border-indigo-100/80
      bg-indigo-50/70 px-3.5 py-3
      dark:border-indigo-500/20
      dark:bg-indigo-500/10
    "
        >
          <svg
            className="
          mt-0.5 h-4 w-4 shrink-0
          text-indigo-600 dark:text-indigo-400
        "
            viewBox="0 0 24 24"
            fill="none"
            stroke="currentColor"
            strokeWidth="1.8"
          >
            <circle cx="12" cy="12" r="9" />
            <path d="M12 11v5m0-8h.01" />
          </svg>

          <p
            className="
        text-[11px] leading-5
        text-indigo-800
        dark:text-indigo-200 sm:text-xs
      "
          >
            Choose a background style to personalize your video recording
            experience. Some effects may take a moment to load.
          </p>
        </div>
      </div>

      {/* Bottom Accent */}
      <div
        className="
    h-1 w-full bg-gradient-to-r
    from-indigo-500 via-violet-500 to-purple-400
  "
      />
    </div>
  );
};

export default BackgroundController;
