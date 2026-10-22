const Button = ({ title, onClick }) => {
  return (
    <button
      className="cursor-pointer rounded-xl bg-[#676FA3] px-5 py-3 text-sm font-semibold text-white transition hover:bg-[#555E91]"
      onClick={onClick}
    >
      {title}
    </button>
  );
};

export default Button;
