const VideoFrame = ({ recordedVideos, currentVideoIndex }) => {
  return (
    <div className="overflow-hidden rounded-2xl bg-black shadow-xl">
      <video
        src={recordedVideos[currentVideoIndex].url}
        controls
        loop
        autoPlay
        className="aspect-video w-full object-contain"
      />
    </div>
  );
};

export default VideoFrame;
