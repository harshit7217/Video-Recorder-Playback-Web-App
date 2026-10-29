import { useCallback, useState, useRef } from "react";
import NormalBackground from "./Background/NormalBackground";
import BlurBackground from "./Background/BlurBackground";
import ImageBackground from "./Background/ImageBackground";

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

const BackgroundControllers = ({
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
    <div className="rounded-2xl border border-[#E8E9F3] bg-[#FAFAFD] p-4 md:p-5">
      <div className="mb-4 flex items-center justify-between">
        <div>
          <h3 className="text-sm font-semibold text-[#030164]">Background</h3>
          <p className="mt-1 text-xs text-gray-500">
            Choose how your background should appear
          </p>
        </div>

        {modelStatus === "loading" && (
          <div className="flex items-center gap-2 text-xs font-medium text-[#676FA3]">
            <span className="h-3 w-3 animate-spin rounded-full border-2 border-[#676FA3]/30 border-t-[#676FA3]" />
            Loading...
          </div>
        )}
      </div>

      <div className="grid grid-cols-1 gap-2 sm:grid-cols-2 lg:grid-cols-4">
        {/* Normal */}
        <NormalBackground
          normalOn={normalOn}
          toggleBg={() => toggleBg("normal")}
          modelStatus={modelStatus}
          icon={"◯"}
          label={"Normal"}
          subtitle={"Original background"}
        />

        {/* Blur */}
        <BlurBackground
          blurOn={blurOn}
          toggleBg={() => toggleBg("blur")}
          modelStatus={modelStatus}
          icon={"◌"}
          label={"Blur"}
          subtitle={"Soft background"}
        />

        {/* Office */}
        <ImageBackground
          bgImageState={bgImageState[0]}
          toggleBg={() => toggleBg("image", 0)}
          modelStatus={modelStatus}
          icon={"🏢"}
          label={"Office"}
          subtitle={"Professional setting"}
        />

        {/* Sunflower */}
        <ImageBackground
          bgImageState={bgImageState[1]}
          toggleBg={() => toggleBg("image", 1)}
          modelStatus={modelStatus}
          icon={"🌻"}
          label={"Sunflower"}
          subtitle={"Bright background"}
        />
      </div>
    </div>
  );
};

export default BackgroundControllers;
