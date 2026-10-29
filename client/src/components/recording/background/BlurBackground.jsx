const BlurBackground = ({ blurOn, toggleBg, modelStatus, icon, label, subtitle}) => {
    return (
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
              {icon}
            </div>

            <div>
              <p className="text-sm font-medium text-gray-800">{label}</p>
              <p className="text-xs text-gray-500">{subtitle}</p>
            </div>
          </div>
        </label>
    )
}

export default BlurBackground;