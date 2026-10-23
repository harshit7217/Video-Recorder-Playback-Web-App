const CanvasFrame = ({ canvasRef }) => {
  return (
    <canvas
      ref={canvasRef}
      className="aspect-video w-full object-cover"
      style={{ transform: "scaleX(-1)" }}
    />
  );
};

export default CanvasFrame;
