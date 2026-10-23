const VideoFrame = ({ videoUrlList, videoIndex}) => {
    return (
        <div className="overflow-hidden rounded-2xl bg-black shadow-xl">
          <video
            src={videoUrlList[videoIndex].url}
            controls
            loop
            autoPlay
            className="aspect-video w-full object-contain"
          />
        </div>
    )
}

export default VideoFrame;