import { useEffect, useState, type RefObject } from "react";
import type { ImageSegmenter } from "@mediapipe/tasks-vision";

export type BlurStatus = "off" | "loading" | "on";

const WASM_PATH = "/mediapipe/wasm";
const MODEL_PATH = "/mediapipe/selfie_segmenter.tflite";
const MASK_WIDTH = 256;
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

function createRenderer(output: HTMLCanvasElement, segmenter: ImageSegmenter) {
  const outputCtx = output.getContext("2d")!;
  const input = createCanvas();
  const mask = createCanvas();
  const person = createCanvas();
  const blurred = createCanvas();
  const supportsFilter = "filter" in blurred.ctx;
  const steps = supportsFilter ? [] : BLUR_STEPS.map(createCanvas);
  let maskImage: ImageData | null = null;

  return (video: HTMLVideoElement) => {
    const width = video.videoWidth;
    const height = video.videoHeight;
    const maskHeight = Math.round((MASK_WIDTH * height) / width);

    resize(output, width, height);
    resize(person.canvas, width, height);
    resize(input.canvas, MASK_WIDTH, maskHeight);
    resize(mask.canvas, MASK_WIDTH, maskHeight);
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

    if (maskImage?.width !== MASK_WIDTH || maskImage.height !== maskHeight) {
      maskImage = mask.ctx.createImageData(MASK_WIDTH, maskHeight);
    }

    // Segment a small copy of the frame; the mask is scaled back up below.
    input.ctx.drawImage(video, 0, 0, MASK_WIDTH, maskHeight);
    segmenter.segmentForVideo(input.canvas, performance.now(), (result) => {
      const confidence = result.confidenceMasks?.at(-1)?.getAsFloat32Array();
      if (!confidence || !maskImage) return;

      const pixels = maskImage.data;
      for (let i = 0; i < confidence.length; i++) {
        // Tighten the soft edge to reduce background halo.
        const alpha = Math.min(1, Math.max(0, (confidence[i] - 0.25) * 2));
        pixels[i * 4 + 3] = alpha * 255;
      }
    });
    mask.ctx.putImageData(maskImage, 0, 0);

    // Sharp person: upscaled mask, then video kept only where the mask is opaque.
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
