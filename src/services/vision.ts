import {
  PoseLandmarker,
  FilesetResolver,
  DrawingUtils,
} from "@mediapipe/tasks-vision";

/**
 * TITAN VISION ENGINE 2.0 (GHOST SPOTTER)
 * Uses MediaPipe Pose to track skeletal mechanics in real-time.
 */

export class VisionService {
  private poseLandmarker: PoseLandmarker | null = null;
  private runningMode: "IMAGE" | "VIDEO" = "VIDEO";
  private lastY: number = 0;
  private lastTime: number = 0;

  // State for Rep Counting logic
  private state: "ECCENTRIC" | "CONCENTRIC" | "TOP" | "BOTTOM" = "TOP";
  private repCount: number = 0;
  private depthHit: boolean = false;

  // Singleton instance
  private static instance: VisionService;

  private constructor() {}

  public static getInstance(): VisionService {
    if (!VisionService.instance) {
      VisionService.instance = new VisionService();
    }
    return VisionService.instance;
  }

  async init() {
    if (this.poseLandmarker) return;

    const vision = await FilesetResolver.forVisionTasks(
      "https://cdn.jsdelivr.net/npm/@mediapipe/tasks-vision@0.10.0/wasm",
    );

    this.poseLandmarker = await PoseLandmarker.createFromOptions(vision, {
      baseOptions: {
        modelAssetPath: `https://storage.googleapis.com/mediapipe-models/pose/pose_landmarker/float16/1/pose_landmarker.task`,
        delegate: "GPU",
      },
      runningMode: this.runningMode,
      numPoses: 1,
    });
    console.log("Titan Vision Engine: Online");
  }

  /**
   * Analyzes a video frame for skeletal data.
   * Calculates velocity and checks squat depth (Hip < Knee).
   */
  detect(video: HTMLVideoElement, timestamp: number) {
    if (!this.poseLandmarker) return null;

    const result = this.poseLandmarker.detectForVideo(video, timestamp);

    if (result.landmarks && result.landmarks.length > 0) {
      const landmarks = result.landmarks[0];

      // 1. DEPTH CHECK (Squat)
      // Hip (23, 24) vs Knee (25, 26)
      // Y increases downwards in canvas coordinates
      const hipY = (landmarks[23].y + landmarks[24].y) / 2;
      const kneeY = (landmarks[25].y + landmarks[26].y) / 2;

      const isBelowParallel = hipY > kneeY; // Hip is physically lower than knee

      // 2. VELOCITY CALCULATION (Bar Speed Proxy via Shoulders)
      const shoulderY = (landmarks[11].y + landmarks[12].y) / 2;
      const currentTime = Date.now();
      const timeDiff = (currentTime - this.lastTime) / 1000; // seconds

      let velocity = 0;
      if (this.lastTime > 0 && timeDiff > 0) {
        // Delta Y is normalized (0-1), multiply by approx height (e.g. 1.8m) to get m/s
        velocity = (Math.abs(shoulderY - this.lastY) * 1.8) / timeDiff;
      }

      this.lastY = shoulderY;
      this.lastTime = currentTime;

      // 3. REP LOGIC (Simplified State Machine)
      let repDetected = false;

      if (this.state === "TOP" && velocity > 0.08 && shoulderY > this.lastY) {
        this.state = "ECCENTRIC";
      } else if (this.state === "ECCENTRIC" && isBelowParallel) {
        this.state = "BOTTOM";
        this.depthHit = true;
      } else if (
        this.state === "BOTTOM" &&
        !isBelowParallel &&
        velocity > 0.12
      ) {
        this.state = "CONCENTRIC";
      } else if (
        this.state === "CONCENTRIC" &&
        (velocity < 0.04 || shoulderY < this.lastY - 0.02)
      ) {
        this.state = "TOP";
        if (this.depthHit) {
          this.repCount++;
          repDetected = true;
          this.depthHit = false;
        }
      }

      return {
        landmarks,
        metrics: {
          isBelowParallel,
          velocity: velocity.toFixed(2),
          state: this.state,
          repDetected,
        },
      };
    }
    return null;
  }
}
