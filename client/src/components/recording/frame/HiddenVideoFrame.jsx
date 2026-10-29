const HiddenVideoFrame = ({ videoElementRef }) => {
  return (
    <video
      ref={videoElementRef}
      playsInline
      muted
      style={{ display: "none" }}
    />
  );
};

export default HiddenVideoFrame;
