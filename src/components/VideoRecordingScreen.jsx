const VideoRecordingScreen = ({
  isRecording,
  videoRef,
  canvasRef,
  checking,
  handleStart,
  recorderState,
  modelStatus,
  normalOn,
  blurOn,
  bgImageState,
  start,
  timeParser,
  count,
  minDuration,
  handlePauseOrResumingRecording,
  handleCancel,
  handleStop,
  toggleBg,
}) => {
  return (
    <div className="space-y-6">
      {/* Video Preview */}
      <div className="relative mx-auto w-full max-w-3xl overflow-hidden rounded-2xl bg-[#11142B] shadow-lg">
        {/* Timer */}
        {isRecording && (
          <div className="absolute right-4 top-4 z-20 flex items-center gap-2 rounded-full bg-black/60 px-4 py-2 text-sm font-medium text-white backdrop-blur-md">
            <span className="h-2 w-2 animate-pulse rounded-full bg-red-500" />
            {timeParser(count)}
          </div>
        )}

        {/* Hidden source video */}
        <video ref={videoRef} playsInline muted style={{ display: "none" }} />

        <canvas
          ref={canvasRef}
          className="aspect-video w-full object-cover"
          style={{ transform: "scaleX(-1)" }}
        />

        {/* Empty state */}
        {!isRecording && !checking && (
          <div className="pointer-events-none absolute inset-0 flex items-center justify-center">
            <div className="rounded-2xl bg-black/30 px-5 py-3 text-center text-white backdrop-blur-sm">
              <p className="text-sm font-medium">Camera preview</p>
              <p className="mt-1 text-xs text-white/70">
                Click start when you're ready
              </p>
            </div>
          </div>
        )}
      </div>

      {/* Countdown */}
      {checking && (
        <div className="flex justify-center">
          <div className="rounded-full bg-[#EEF2FF] px-6 py-3 text-base font-semibold text-[#676FA3] shadow-sm">
            Starting in <span className="text-[#030164]">0{start}s</span>
          </div>
        </div>
      )}

      {/* Start Button */}
      {!isRecording && !checking && (
        <div className="flex justify-center">
          <button
            onClick={handleStart}
            className="cursor-pointer group flex items-center gap-3 rounded-xl bg-[#676FA3] px-7 py-3.5 text-sm font-semibold text-white shadow-lg shadow-[#676FA3]/20 transition-all duration-200 hover:-translate-y-0.5 hover:bg-[#555E91] hover:shadow-xl active:translate-y-0"
          >
            <span className="flex h-8 w-8 items-center justify-center rounded-full bg-white/15">
              <svg className="h-4 w-4 fill-current" viewBox="0 0 24 24">
                <path d="M8 5v14l11-7z" />
              </svg>
            </span>
            Start Recording
          </button>
        </div>
      )}

      {/* Recording Controls */}
      {isRecording && (
        <div className="flex flex-wrap items-center justify-center gap-3">
          {minDuration == 5 && (
            <button
              onClick={() => handleStop("stopped")}
              className="cursor-pointer rounded-xl border border-red-200 bg-red-50 px-5 py-3 text-sm font-semibold text-red-600 transition hover:bg-red-100"
            >
              Stop Recording
            </button>
          )}

          {recorderState === "active" ? (
            <button
              onClick={() => handlePauseOrResumingRecording("active")}
              className="cursor-pointer rounded-xl bg-[#EEF2FF] px-5 py-3 text-sm font-semibold text-[#676FA3] transition hover:bg-[#676FA3] hover:text-white"
            >
              Pause Recording
            </button>
          ) : (
            <button
              onClick={() => handlePauseOrResumingRecording("paused")}
              className="cursor-pointer rounded-xl bg-[#676FA3] px-5 py-3 text-sm font-semibold text-white transition hover:bg-[#555E91]"
            >
              Resume Recording
            </button>
          )}
          <button
            onClick={() => handleCancel()}
            className="cursor-pointer rounded-xl bg-[#EEF2FF] px-5 py-3 text-sm font-semibold text-[#676FA3] transition hover:bg-[#676FA3] hover:text-white"
          >
            Cancel Recording
          </button>
        </div>
      )}

      {/* Background Controls */}
      {!checking &&
        recorderState !== "active" &&
        recorderState !== "paused" && (
          <div className="rounded-2xl border border-[#E8E9F3] bg-[#FAFAFD] p-4 md:p-5">
            <div className="mb-4 flex items-center justify-between">
              <div>
                <h3 className="text-sm font-semibold text-[#030164]">
                  Background
                </h3>
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
              <label
                className={`cursor-pointer rounded-xl border p-3 transition ${
                  normalOn
                    ? "border-[#676FA3] bg-[#EEF2FF] shadow-sm"
                    : "border-gray-200 bg-white hover:border-[#676FA3]/40"
                }`}
              >
                <input
                  type="checkbox"
                  checked={normalOn}
                  onChange={() => toggleBg("normal")}
                  disabled={modelStatus === "loading"}
                  className="sr-only"
                />

                <div className="flex items-center gap-3">
                  <div className="flex h-9 w-9 items-center justify-center rounded-lg bg-gray-100 text-lg">
                    ◯
                  </div>

                  <div>
                    <p className="text-sm font-medium text-gray-800">Normal</p>
                    <p className="text-xs text-gray-500">Original background</p>
                  </div>
                </div>
              </label>

              {/* Blur */}
              <label
                className={`cursor-pointer rounded-xl border p-3 transition ${
                  blurOn
                    ? "border-[#676FA3] bg-[#EEF2FF] shadow-sm"
                    : "border-gray-200 bg-white hover:border-[#676FA3]/40"
                }`}
              >
                <input
                  type="checkbox"
                  checked={blurOn}
                  onChange={() => toggleBg("blur")}
                  disabled={modelStatus === "loading"}
                  className="sr-only"
                />

                <div className="flex items-center gap-3">
                  <div className="flex h-9 w-9 items-center justify-center rounded-lg bg-blue-50 text-lg">
                    ◌
                  </div>

                  <div>
                    <p className="text-sm font-medium text-gray-800">Blur</p>
                    <p className="text-xs text-gray-500">Soft background</p>
                  </div>
                </div>
              </label>

              {/* Office */}
              <label
                className={`cursor-pointer rounded-xl border p-3 transition ${
                  bgImageState[0]
                    ? "border-[#676FA3] bg-[#EEF2FF] shadow-sm"
                    : "border-gray-200 bg-white hover:border-[#676FA3]/40"
                }`}
              >
                <input
                  type="checkbox"
                  checked={bgImageState[0]}
                  onChange={() => toggleBg("image", 0)}
                  disabled={modelStatus === "loading"}
                  className="sr-only"
                />

                <div className="flex items-center gap-3">
                  <div className="flex h-9 w-9 items-center justify-center rounded-lg bg-amber-50 text-lg">
                    🏢
                  </div>

                  <div>
                    <p className="text-sm font-medium text-gray-800">Office</p>
                    <p className="text-xs text-gray-500">
                      Professional setting
                    </p>
                  </div>
                </div>
              </label>

              {/* Sunflower */}
              <label
                className={`cursor-pointer rounded-xl border p-3 transition ${
                  bgImageState[1]
                    ? "border-[#676FA3] bg-[#EEF2FF] shadow-sm"
                    : "border-gray-200 bg-white hover:border-[#676FA3]/40"
                }`}
              >
                <input
                  type="checkbox"
                  checked={bgImageState[1]}
                  onChange={() => toggleBg("image", 1)}
                  disabled={modelStatus === "loading"}
                  className="sr-only"
                />

                <div className="flex items-center gap-3">
                  <div className="flex h-9 w-9 items-center justify-center rounded-lg bg-yellow-50 text-lg">
                    🌻
                  </div>

                  <div>
                    <p className="text-sm font-medium text-gray-800">
                      Sunflower
                    </p>
                    <p className="text-xs text-gray-500">Bright background</p>
                  </div>
                </div>
              </label>
            </div>
          </div>
        )}
    </div>
  );
};

export default VideoRecordingScreen;
