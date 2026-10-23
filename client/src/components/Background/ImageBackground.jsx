const ImageBackground = ({ bgImageState, toggleBg, modelStatus, icon, title, subtitle}) => {
    return (
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
            onChange={toggleBg}
            disabled={modelStatus === "loading"}
            className="sr-only"
          />

          <div className="flex items-center gap-3">
            <div className="flex h-9 w-9 items-center justify-center rounded-lg bg-amber-50 text-lg">
              {icon}
            </div>

            <div>
              <p className="text-sm font-medium text-gray-800">{title}</p>
              <p className="text-xs text-gray-500">{subtitle}</p>
            </div>
          </div>
        </label>
    )
}

export default ImageBackground;