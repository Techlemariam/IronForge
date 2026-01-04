import React, { useRef, useEffect, useState } from "react";
import { Camera, X, Activity, ArrowDown } from "lucide-react";
import { VisionService } from "@/services/vision";
import { DrawingUtils, PoseLandmarker } from "@mediapipe/tasks-vision";

interface VisionRepCounterProps {
  isActive: boolean;
  onRepCount: () => void;
  onClose: () => void;
}

const VisionRepCounter: React.FC<VisionRepCounterProps> = ({
  isActive,
  onRepCount,
  onClose,
}) => {
  const videoRef = useRef<HTMLVideoElement>(null);
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const streamRef = useRef<MediaStream | null>(null);
  const requestRef = useRef<number | null>(null);
  const [metrics, setMetrics] = useState({
    velocity: "0.00",
    isBelowParallel: false,
    state: "IDLE",
  });
  const [engineReady, setEngineReady] = useState(false);

  useEffect(() => {
    if (isActive) {
      const init = async () => {
        await VisionService.getInstance().init();
        setEngineReady(true);
        startCamera();
      };
      init();
    } else {
      stopCamera();
    }
    // Cleanup function for unmount
    return () => {
      stopCamera();
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [isActive]);

  const startCamera = async () => {
    try {
      const s = await navigator.mediaDevices.getUserMedia({
        video: { width: 640, height: 480, facingMode: "user" },
      });
      streamRef.current = s;
      if (videoRef.current) {
        videoRef.current.srcObject = s;
        videoRef.current.play();
        videoRef.current.addEventListener("loadeddata", predictWebcam);
      }
    } catch (e) {
      console.error("Camera denied", e);
    }
  };

  const stopCamera = () => {
    if (streamRef.current) {
      streamRef.current.getTracks().forEach((t) => t.stop());
      streamRef.current = null;
    }
    if (requestRef.current) {
      cancelAnimationFrame(requestRef.current);
      requestRef.current = null;
    }
  };

  const predictWebcam = async () => {
    if (!videoRef.current || !canvasRef.current || !streamRef.current?.active)
      return;

    const video = videoRef.current;
    const canvas = canvasRef.current;
    const ctx = canvas.getContext("2d");
    const drawingUtils = new DrawingUtils(ctx!);

    // Resize canvas to match video
    canvas.width = video.videoWidth;
    canvas.height = video.videoHeight;

    const result = VisionService.getInstance().detect(video, performance.now());

    ctx?.clearRect(0, 0, canvas.width, canvas.height);

    if (result) {
      // Draw Skeleton
      drawingUtils.drawLandmarks(result.landmarks, {
        radius: (data) => DrawingUtils.lerp(data.from!.z, -0.15, 0.1, 5, 1),
        color: result.metrics.isBelowParallel ? "#1eff00" : "#00e5ff",
      });

      drawingUtils.drawConnectors(
        result.landmarks,
        PoseLandmarker.POSE_CONNECTIONS,
        {
          color: "#ffffff",
          lineWidth: 2,
        },
      );

      setMetrics((prev) => ({
        velocity: result.metrics.velocity,
        isBelowParallel: result.metrics.isBelowParallel,
        state: result.metrics.state,
      }));

      if (result.metrics.repDetected) {
        onRepCount();
      }
    }

    requestRef.current = requestAnimationFrame(predictWebcam);
  };

  if (!isActive) return null;

  return (
    <div className="relative w-full aspect-video bg-black rounded-lg overflow-hidden border-2 border-cyan-500 shadow-[0_0_20px_rgba(6,182,212,0.4)] mb-4 animate-fade-in group">
      {!engineReady && (
        <div className="absolute inset-0 flex items-center justify-center bg-black z-20">
          <span className="text-cyan-500 font-mono animate-pulse">
            Initializing Ghost Spotter...
          </span>
        </div>
      )}

      <video
        ref={videoRef}
        className="absolute inset-0 w-full h-full object-cover opacity-60"
        muted
        playsInline
      />
      <canvas ref={canvasRef} className="absolute inset-0 w-full h-full z-10" />

      {/* AI HUD Overlay */}
      <div className="absolute inset-0 pointer-events-none z-20">
        {/* Status Text */}
        <div className="absolute top-4 left-4 flex items-center gap-2">
          <div className="w-2 h-2 bg-red-500 rounded-full animate-pulse"></div>
          <span className="text-[10px] font-mono text-cyan-400 uppercase tracking-widest">
            Titan Vision v2.0
          </span>
        </div>

        {/* Velocity Meter */}
        <div className="absolute top-4 right-12 flex flex-col items-end">
          <div className="flex items-center gap-2">
            <span className="text-2xl font-black text-white font-mono">
              {metrics.velocity}
            </span>
            <span className="text-[10px] text-zinc-400 uppercase">m/s</span>
          </div>
          {parseFloat(metrics.velocity) > 0 &&
            parseFloat(metrics.velocity) < 0.3 && (
              <span className="text-red-500 font-bold uppercase text-[10px] animate-pulse">
                Drive! Too Slow!
              </span>
            )}
        </div>

        {/* Depth Indicator */}
        <div
          className={`absolute bottom-4 left-1/2 -translate-x-1/2 px-4 py-1 rounded border ${metrics.isBelowParallel ? "bg-green-500/20 border-green-500 text-green-400" : "bg-black/50 border-zinc-700 text-zinc-500"}`}
        >
          <span className="text-xs font-bold uppercase tracking-widest flex items-center gap-2">
            <ArrowDown
              className={`w-4 h-4 ${metrics.isBelowParallel ? "animate-bounce" : ""}`}
            />
            {metrics.isBelowParallel ? "DEPTH GOOD" : "BREAK PARALLEL"}
          </span>
        </div>
      </div>

      <button
        onClick={onClose}
        className="absolute top-2 right-2 p-2 bg-black/50 text-white rounded-full hover:bg-red-900 pointer-events-auto z-30"
      >
        <X className="w-4 h-4" />
      </button>
    </div>
  );
};

export default VisionRepCounter;
