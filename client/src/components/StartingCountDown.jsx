const StartingCountDown = ({ start }) => {
  return (
    <div className="flex justify-center">
      <div className="rounded-full bg-[#EEF2FF] px-6 py-3 text-base font-semibold text-[#676FA3] shadow-sm">
        Starting in <span className="text-[#030164]">0{start}s</span>
      </div>
    </div>
  );
};

export default StartingCountDown;
