const HiddenVideoFrame = ({ videoRef }) => {
  return <video ref={videoRef} playsInline muted style={{ display: "none" }} />;
};

export default HiddenVideoFrame;
