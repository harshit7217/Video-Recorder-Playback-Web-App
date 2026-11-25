const Button = ({ label, onClick }) => {
  return (
    <div className="flex w-full justify-center px-3">
      <button
        type="button"
        onClick={onClick}
        className="
      group inline-flex min-h-12
      items-center justify-center gap-3
      rounded-xl
      bg-gradient-to-r from-indigo-600 to-violet-600
      px-6 py-3 sm:px-8 sm:py-3.5
      text-sm font-semibold text-white
      shadow-lg shadow-indigo-500/20
      transition-all duration-300 ease-out
      hover:-translate-y-1
      hover:from-indigo-700 hover:to-violet-700
      hover:shadow-xl hover:shadow-indigo-500/30
      active:translate-y-0 active:scale-[0.98]
      focus:outline-none focus:ring-4
      focus:ring-indigo-500/25
      max-[360px]:w-full
    "
      >
        {label === "Start Recording" && (
          <span
            className="
        flex h-9 w-9 shrink-0
        items-center justify-center
        rounded-full bg-white/15
        ring-1 ring-white/20
        transition-all duration-300
        group-hover:bg-white/25
      "
          >
            <svg className="h-4 w-4 fill-current" viewBox="0 0 24 24">
              <path d="M8 5v14l11-7z" />
            </svg>
          </span>
        )}

        {label === "Stop Recording" && (
          <span
            className="
        relative flex h-9 w-9 shrink-0
        items-center justify-center
        rounded-full bg-white/15
        ring-1 ring-white/20
      "
          >
            <span className="absolute h-3 w-3 animate-ping rounded-full bg-red-300 opacity-50" />
            <span className="relative h-3 w-3 rounded-sm bg-white" />
          </span>
        )}

        <span className="whitespace-nowrap">{label}</span>

        <svg
          className="h-4 w-4 transition-transform duration-300 group-hover:translate-x-1"
          viewBox="0 0 24 24"
          fill="none"
          stroke="currentColor"
          strokeWidth="2"
        >
          <path d="M5 12h14m-7-7 7 7-7 7" />
        </svg>
      </button>
    </div>
  );
};

export default Button;
