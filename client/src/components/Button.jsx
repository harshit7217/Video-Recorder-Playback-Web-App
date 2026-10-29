const Button = ({ label, onClick }) => {
  return (
    <div className="flex justify-center">
      <button
        className="cursor-pointer group flex items-center gap-3 rounded-xl bg-[#676FA3] px-7 py-3.5 text-sm font-semibold text-white shadow-lg shadow-[#676FA3]/20 transition-all duration-200 hover:-translate-y-0.5 hover:bg-[#555E91] hover:shadow-xl active:translate-y-0"
        onClick={onClick}
      >
        {label === "Start Recording" && (
          <span className="flex h-8 w-8 items-center justify-center rounded-full bg-white/15">
            <svg className="h-4 w-4 fill-current" viewBox="0 0 24 24">
              <path d="M8 5v14l11-7z" />
            </svg>
          </span>
        )}
        {label}
      </button>
    </div>
  );
};

export default Button;
