import vr_pwa_logo from "./../../assets/vr_pwa_logo.jpg";

function Header() {
  return (
    <header
      className="
  sticky top-0 z-50 w-full
  border-b border-slate-200/80
  bg-white/95
  shadow-sm backdrop-blur-xl
  dark:border-slate-700
  dark:bg-slate-900/95
"
    >
      <div
        className="
    mx-auto flex min-h-[76px]
    w-full max-w-[1600px]
    items-center justify-between
    gap-3 px-4 py-2
    sm:px-6 md:min-h-[88px]
    md:px-8 lg:px-10
  "
      >
        {/* Logo */}
        <div className="flex shrink-0 items-center">
          <img
            src={vr_pwa_logo}
            alt="Video Recorder Logo"
            className="
          h-12 w-auto object-contain
          sm:h-14 md:h-16 lg:h-[70px]
        "
          />
        </div>

        {/* Project Name */}
        <div className="min-w-0 flex-1 text-right sm:text-center">
          <h1
            className="
        text-sm font-extrabold
        leading-tight tracking-tight
        sm:text-base md:text-xl
        lg:text-2xl xl:text-3xl
      "
          >
            <span className="text-[#030164] dark:text-indigo-300">
              Video Recorder
            </span>

            <span
              className="
          mx-1 hidden text-slate-300
          sm:inline dark:text-slate-600
        "
            >
              &
            </span>

            <span
              className="
          block text-[#8B1E2D]
          dark:text-rose-300
          sm:inline
        "
            >
              <span className="sm:hidden">& </span>
              Playback Web App
            </span>
          </h1>

          <p
            className="
        mt-1 hidden text-[10px]
        font-medium uppercase
        tracking-[0.2em]
        text-slate-400 md:block
      "
          >
            Professional Video Recording Platform
          </p>
        </div>

        {/* Right Accent */}
        <div
          className="
      hidden h-10 w-10 shrink-0
      items-center justify-center
      rounded-xl bg-indigo-50
      text-indigo-600
      dark:bg-indigo-500/10
      dark:text-indigo-300
      sm:flex
    "
        >
          <svg
            className="h-5 w-5"
            viewBox="0 0 24 24"
            fill="none"
            stroke="currentColor"
            strokeWidth="1.8"
          >
            <rect x="3" y="5" width="18" height="14" rx="2" />
            <path d="m10 9 5 3-5 3z" />
          </svg>
        </div>
      </div>

      {/* Bottom Accent */}
      <div
        className="
    h-[3px] w-full
    bg-gradient-to-r
    from-indigo-900 via-indigo-500 to-rose-700
  "
      />
    </header>
  );
}

export default Header;
