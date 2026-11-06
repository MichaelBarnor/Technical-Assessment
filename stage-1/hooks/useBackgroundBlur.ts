import { useEffect, useState, type RefObject } from "react";
import type { ImageSegmenter } from "@mediapipe/tasks-vision";

export type BlurStatus = "off" | "loading" | "on";

const WASM_PATH = "/mediapipe/wasm";
// Landscape model expects 256x144 (16:9) input.
const MODEL_PATH = "/mediapipe/selfie_segmenter_landscape.tflite";
const MODEL_WIDTH = 256;
const MODEL_HEIGHT = 144;
// Mask blur radius in mask pixels. Large values erode thin body parts and pull in nearby objects.
const EDGE_SOFTNESS = 3;
// Weight of the previous frame's mask; higher = less flicker but more lag on movement.
const TEMPORAL_SMOOTHING = 0.3;
// Blur runs on a 1/8-size copy, so the radius is in 1/8-size pixels.
const BLUR_SCALE = 0.125;
const BLUR_RADIUS = 3;
// Fallback when ctx.filter is unsupported: shrink in steps, then scale back up.
const BLUR_STEPS = [0.5, 0.25, 0.125, 0.0625];

let segmenterPromise: Promise<ImageSegmenter> | null = null;

function loadSegmenter() {
  segmenterPromise ??= (async () => {
    const { FilesetResolver, ImageSegmenter } = await import("@mediapipe/tasks-vision");
    const fileset = await FilesetResolver.forVisionTasks(WASM_PATH);

    return ImageSegmenter.createFromOptions(fileset, {
      baseOptions: { modelAssetPath: MODEL_PATH, delegate: "GPU" },
      runningMode: "VIDEO",
      outputConfidenceMasks: true,
      outputCategoryMask: false
    });
  })();

  return segmenterPromise;
}

function createCanvas() {
  const canvas = document.createElement("canvas");
  const ctx = canvas.getContext("2d")!;
  return { canvas, ctx };
}

function resize(canvas: HTMLCanvasElement, width: number, height: number) {
  if (canvas.width !== width || canvas.height !== height) {
    canvas.width = width;
    canvas.height = height;
  }
}

// Separable box blur with clamped edges, so the mask doesn't fade at the frame border.
function blurMask(data: Float32Array, temp: Float32Array, width: number, height: number) {
  const r = EDGE_SOFTNESS;
  const size = r * 2 + 1;

  for (let y = 0; y < height; y++) {
    const row = y * width;
    for (let x = 0; x < width; x++) {
      let sum = 0;
      for (let k = -r; k <= r; k++) {
        sum += data[row + Math.min(width - 1, Math.max(0, x + k))];
      }
      temp[row + x] = sum / size;
    }
  }

  for (let y = 0; y < height; y++) {
    for (let x = 0; x < width; x++) {
      let sum = 0;
      for (let k = -r; k <= r; k++) {
        sum += temp[Math.min(height - 1, Math.max(0, y + k)) * width + x];
      }
      data[y * width + x] = sum / size;
    }
  }
}

function smoothstep(edge0: number, edge1: number, value: number) {
  const t = Math.min(1, Math.max(0, (value - edge0) / (edge1 - edge0)));
  return t * t * (3 - 2 * t);
}

function createRenderer(output: HTMLCanvasElement, segmenter: ImageSegmenter) {
  const outputCtx = output.getContext("2d")!;
  const input = createCanvas();
  const mask = createCanvas();
  const person = createCanvas();
  const blurred = createCanvas();
  const supportsFilter = "filter" in blurred.ctx;
  const steps = supportsFilter ? [] : BLUR_STEPS.map(createCanvas);
  let maskImage: ImageData | null = null;
  let smoothed = new Float32Array(0);
  let maskValues = new Float32Array(0);
  let maskTemp = new Float32Array(0);

  return (video: HTMLVideoElement) => {
    const width = video.videoWidth;
    const height = video.videoHeight;
    // Letterbox into the model input instead of stretching it.
    const fit = Math.min(MODEL_WIDTH / width, MODEL_HEIGHT / height);
    const maskWidth = Math.round(width * fit);
    const maskHeight = Math.round(height * fit);
    const offsetX = Math.floor((MODEL_WIDTH - maskWidth) / 2);
    const offsetY = Math.floor((MODEL_HEIGHT - maskHeight) / 2);

    resize(output, width, height);
    resize(person.canvas, width, height);
    resize(input.canvas, MODEL_WIDTH, MODEL_HEIGHT);
    resize(mask.canvas, maskWidth, maskHeight);
    resize(
      blurred.canvas,
      Math.max(1, Math.round(width * BLUR_SCALE)),
      Math.max(1, Math.round(height * BLUR_SCALE))
    );
    steps.forEach((step, i) =>
      resize(
        step.canvas,
        Math.max(1, Math.round(width * BLUR_STEPS[i])),
        Math.max(1, Math.round(height * BLUR_STEPS[i]))
      )
    );

    if (maskImage?.width !== maskWidth || maskImage.height !== maskHeight) {
      maskImage = mask.ctx.createImageData(maskWidth, maskHeight);
      smoothed = new Float32Array(maskWidth * maskHeight);
      maskValues = new Float32Array(maskWidth * maskHeight);
      maskTemp = new Float32Array(maskWidth * maskHeight);
    }

    // Segment a small copy of the frame; the mask is scaled back up below.
    input.ctx.fillRect(0, 0, MODEL_WIDTH, MODEL_HEIGHT);
    input.ctx.drawImage(video, offsetX, offsetY, maskWidth, maskHeight);
    segmenter.segmentForVideo(input.canvas, performance.now(), (result) => {
      const confidence = result.confidenceMasks?.at(-1)?.getAsFloat32Array();
      if (!confidence || !maskImage || confidence.length !== MODEL_WIDTH * MODEL_HEIGHT) return;

      for (let y = 0; y < maskHeight; y++) {
        for (let x = 0; x < maskWidth; x++) {
          const i = y * maskWidth + x;
          const foreground = confidence[(y + offsetY) * MODEL_WIDTH + x + offsetX];
          smoothed[i] = smoothed[i] * TEMPORAL_SMOOTHING + foreground * (1 - TEMPORAL_SMOOTHING);
        }
      }

      maskValues.set(smoothed);
      blurMask(maskValues, maskTemp, maskWidth, maskHeight);

      const pixels = maskImage.data;
      for (let i = 0; i < maskValues.length; i++) {
        // Tighten the soft edge to reduce background halo.
        pixels[i * 4 + 3] = smoothstep(0.25, 0.75, maskValues[i]) * 255;
      }
    });
    mask.ctx.putImageData(maskImage, 0, 0);

    // Sharp person: upscaled mask, then video kept only where the mask is opaque.
    person.ctx.imageSmoothingQuality = "high";
    person.ctx.globalCompositeOperation = "copy";
    person.ctx.drawImage(mask.canvas, 0, 0, width, height);
    person.ctx.globalCompositeOperation = "source-in";
    person.ctx.drawImage(video, 0, 0, width, height);

    let source: CanvasImageSource = video;
    if (supportsFilter) {
      const { canvas, ctx } = blurred;
      // Overdraw past the edges so the blur doesn't fade into a dark border.
      const pad = BLUR_RADIUS * 2;
      ctx.filter = `blur(${BLUR_RADIUS}px)`;
      ctx.drawImage(video, -pad, -pad, canvas.width + pad * 2, canvas.height + pad * 2);
      source = canvas;
    } else {
      for (const step of steps) {
        step.ctx.drawImage(source, 0, 0, step.canvas.width, step.canvas.height);
        source = step.canvas;
      }
      for (let i = steps.length - 2; i >= 0; i--) {
        steps[i].ctx.drawImage(source, 0, 0, steps[i].canvas.width, steps[i].canvas.height);
        source = steps[i].canvas;
      }
    }

    outputCtx.imageSmoothingQuality = "high";
    outputCtx.drawImage(source, 0, 0, width, height);
    outputCtx.drawImage(person.canvas, 0, 0);
  };
}

export function useBackgroundBlur(
  videoRef: RefObject<HTMLVideoElement | null>,
  canvasRef: RefObject<HTMLCanvasElement | null>,
  active: boolean
): BlurStatus {
  const [status, setStatus] = useState<BlurStatus>("off");

  useEffect(() => {
    const video = videoRef.current;
    const canvas = canvasRef.current;

    if (!active || !video || !canvas) {
      setStatus("off");
      return;
    }

    let cancelled = false;
    let frameHandle = 0;
    setStatus("loading");

    const schedule = (tick: () => void) => {
      frameHandle =
        "requestVideoFrameCallback" in video
          ? video.requestVideoFrameCallback(tick)
          : requestAnimationFrame(tick);
    };

    void loadSegmenter().then((segmenter) => {
      if (cancelled) return;

      const render = createRenderer(canvas, segmenter);
      let firstFrame = true;

      const tick = () => {
        if (cancelled) return;

        if (video.readyState >= HTMLMediaElement.HAVE_CURRENT_DATA) {
          render(video);

          if (firstFrame) {
            firstFrame = false;
            setStatus("on");
          }
        }

        schedule(tick);
      };

      schedule(tick);
    });

    return () => {
      cancelled = true;

      if ("cancelVideoFrameCallback" in video) {
        video.cancelVideoFrameCallback(frameHandle);
      } else {
        cancelAnimationFrame(frameHandle);
      }
    };
  }, [active, videoRef, canvasRef]);

  return status;
}
