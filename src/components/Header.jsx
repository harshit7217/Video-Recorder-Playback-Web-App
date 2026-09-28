import vr_pwa_logo from "./../assets/vr_pwa_logo.jpg";

function Header() {
  return (
    <header className="h-[12vh] bg-[#FFF] shadow-xl">
      <div className="flex justify-around items-center">
        {/* Logo */}
        <div>
          <img src={vr_pwa_logo} alt="logo" className="w-auto h-[11vh]" />
        </div>
        {/* Project Name */}
        <h1 className="font-semibold font-serif text-xs sm:text-xs md:text-xl lg:text-2xl xl:text-4xl">
          <span className="text-[#030164]">Video Recorder &</span>{" "}
          <span className="text-[#8B1E2D]">Playback Web App</span>
        </h1>
      </div>
    </header>
  );
}

export default Header;
