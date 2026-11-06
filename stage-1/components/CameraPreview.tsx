"use client";

import { useCallback, useEffect, useRef, useState } from "react";
import { useBackgroundBlur } from "../hooks/useBackgroundBlur";
import { Button } from "./ui/button";

type CameraState = "idle" | "requesting" | "ready" | "blocked" | "unsupported";

const cameraConstraints: MediaStreamConstraints = {
  audio: false,
  video: {
    facingMode: "user",
    width: { ideal: 1280 },
    height: { ideal: 720 }
  }
};

const fallbackConstraints: MediaStreamConstraints = { audio: false, video: true };

const MESSAGES = {
  waiting: "Waiting for camera permission.",
  requesting: "Requesting front camera.",
  live: "Front camera is live.",
  stopped: "Camera stopped.",
  insecure: "Camera access requires a secure (HTTPS) connection.",
  unsupported:
    "This browser doesn't support camera access. Try a recent version of Chrome, Edge, Firefox, or Safari.",
  disconnected: "The camera was disconnected or access was revoked. Press Start to reconnect.",
  playback: "The camera started, but the video couldn't play. Press Start to try again."
};

// Errors that can resolve on their own, so the camera restarts automatically.
const RETRY_ON_DEVICE_CHANGE = ["NotFoundError", "DevicesNotFoundError", "ended"];
const RETRY_ON_PERMISSION_GRANTED = ["NotAllowedError", "PermissionDeniedError"];

function stopStream(stream: MediaStream | null) {
  stream?.getTracks().forEach((track) => track.stop());
}

function getErrorName(error: unknown) {
  return typeof error === "object" && error !== null && "name" in error
    ? String(error.name)
    : "";
}

function getErrorMessage(error: unknown) {
  switch (getErrorName(error)) {
    case "NotAllowedError":
    case "PermissionDeniedError":
      return "Camera access was blocked. Allow camera access in your browser's site settings, then press Start.";
    case "SecurityError":
      return "Camera access is blocked on this page by a browser or organization policy.";
    case "NotFoundError":
    case "DevicesNotFoundError":
      return "No camera was found. Connect a camera, then press Start.";
    case "NotReadableError":
    case "TrackStartError":
      return "Your camera is in use by another app or couldn't start. Close other apps using it, then press Start.";
    case "OverconstrainedError":
      return "Your camera doesn't support the required video settings.";
    case "AbortError":
      return "The camera stopped unexpectedly. Press Start to try again.";
    default:
      return "The camera couldn't be started. Press Start to try again.";
  }
}

async function getCameraStream() {
  try {
    return await navigator.mediaDevices.getUserMedia(cameraConstraints);
  } catch (error) {
    if (getErrorName(error) !== "OverconstrainedError") throw error;
    return navigator.mediaDevices.getUserMedia(fallbackConstraints);
  }
}

export function CameraPreview() {
  const videoRef = useRef<HTMLVideoElement>(null);
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const streamRef = useRef<MediaStream | null>(null);
  // Bumped on every start/stop so stale getUserMedia results are discarded.
  const requestIdRef = useRef(0);
  const cameraStateRef = useRef<CameraState>("idle");
  const errorNameRef = useRef<string | null>(null);
  const [cameraState, setCameraState] = useState<CameraState>("idle");
  const [message, setMessage] = useState(MESSAGES.waiting);
  const [blurEnabled, setBlurEnabled] = useState(false);
  const isReady = cameraState === "ready";
  const blur = useBackgroundBlur(videoRef, canvasRef, blurEnabled && isReady);

  const updateCamera = useCallback(
    (state: CameraState, nextMessage: string, errorName: string | null = null) => {
      cameraStateRef.current = state;
      errorNameRef.current = errorName;
      setCameraState(state);
      setMessage(nextMessage);
    },
    []
  );

  const releaseStream = useCallback(() => {
    stopStream(streamRef.current);
    streamRef.current = null;

    if (videoRef.current) {
      videoRef.current.srcObject = null;
    }
  }, []);

  const cancelCamera = useCallback(() => {
    requestIdRef.current++;
    releaseStream();
  }, [releaseStream]);

  const stopCamera = useCallback(() => {
    cancelCamera();
    updateCamera("idle", MESSAGES.stopped);
  }, [cancelCamera, updateCamera]);

  const startCamera = useCallback(async () => {
    const requestId = ++requestIdRef.current;
    const isCurrent = () => requestId === requestIdRef.current;
    releaseStream();

    if (!navigator.mediaDevices?.getUserMedia) {
      updateCamera(
        "unsupported",
        window.isSecureContext ? MESSAGES.unsupported : MESSAGES.insecure
      );
      return;
    }

    updateCamera("requesting", MESSAGES.requesting);

    let stream: MediaStream;
    try {
      stream = await getCameraStream();
    } catch (error) {
      if (isCurrent()) {
        updateCamera("blocked", getErrorMessage(error), getErrorName(error));
      }
      return;
    }

    const video = videoRef.current;
    if (!isCurrent() || !video) {
      stopStream(stream);
      return;
    }

    streamRef.current = stream;
    stream.getVideoTracks()[0]?.addEventListener(
      "ended",
      () => {
        if (streamRef.current !== stream) return;
        releaseStream();
        updateCamera("blocked", MESSAGES.disconnected, "ended");
      },
      { once: true }
    );
    video.srcObject = stream;

    try {
      await video.play();
    } catch {
      if (isCurrent()) {
        releaseStream();
        updateCamera("blocked", MESSAGES.playback);
      }
      return;
    }

    if (isCurrent()) {
      updateCamera("ready", MESSAGES.live);
    }
  }, [releaseStream, updateCamera]);

  useEffect(() => {
    void startCamera();
    return cancelCamera;
  }, [startCamera, cancelCamera]);

  useEffect(() => {
    const mediaDevices = navigator.mediaDevices;
    if (!mediaDevices) return;

    let disposed = false;
    let permission: PermissionStatus | null = null;

    const retryAfter = (errorNames: string[]) => {
      if (
        cameraStateRef.current === "blocked" &&
        errorNames.includes(errorNameRef.current ?? "")
      ) {
        void startCamera();
      }
    };

    const onDeviceChange = () => retryAfter(RETRY_ON_DEVICE_CHANGE);
    const onPermissionChange = () => {
      if (permission?.state === "granted") retryAfter(RETRY_ON_PERMISSION_GRANTED);
    };

    mediaDevices.addEventListener?.("devicechange", onDeviceChange);

    // Not every browser can query camera permission; this is only a convenience.
    navigator.permissions
      ?.query({ name: "camera" as PermissionName })
      .then((status) => {
        if (disposed) return;
        permission = status;
        status.addEventListener("change", onPermissionChange);
      })
      .catch(() => {});

    return () => {
      disposed = true;
      mediaDevices.removeEventListener?.("devicechange", onDeviceChange);
      permission?.removeEventListener("change", onPermissionChange);
    };
  }, [startCamera]);

  const isRequesting = cameraState === "requesting";
  const isError = cameraState === "blocked" || cameraState === "unsupported";
  const blurUnavailable = blur.status === "unsupported";

  const toggleBlur = () => {
    if (blur.status === "error") {
      blur.retry();
    } else {
      setBlurEnabled((enabled) => !enabled);
    }
  };

  const blurLabel =
    blur.status === "loading"
      ? "Loading blur…"
      : blur.status === "error"
        ? "Retry blur"
        : blurUnavailable
          ? "Blur unavailable"
          : blurEnabled
            ? "Blur on"
            : "Blur off";

  return (
    <section className="camera-panel" aria-label="Live camera preview">
      <div className="camera-toolbar">
        <div className="camera-status" aria-live="polite">
          <p className="camera-status-label">Camera</p>
          <p className={isError ? "camera-status-value camera-error" : "camera-status-value"}>
            {message}
          </p>
          {isReady && blur.error && (
            <p className="camera-status-value camera-error">{blur.error}</p>
          )}
        </div>

        <div className="camera-actions">
          <Button
            variant="glass"
            type="button"
            onClick={startCamera}
            disabled={isRequesting || cameraState === "unsupported"}
          >
            {isReady ? "Restart" : "Start"}
          </Button>
          <Button
            variant="outline"
            type="button"
            onClick={stopCamera}
            disabled={!isReady}
          >
            Stop
          </Button>
          <Button
            variant={blurEnabled && !blurUnavailable ? "glass" : "outline"}
            type="button"
            aria-pressed={blurEnabled}
            onClick={toggleBlur}
            disabled={!isReady || blurUnavailable || blur.status === "loading"}
          >
            {blurLabel}
          </Button>
        </div>
      </div>

      <div className="camera-frame">
        <video
          ref={videoRef}
          className="camera-video"
          muted
          playsInline
          autoPlay
        />
        <canvas
          ref={canvasRef}
          className="camera-video camera-canvas"
          hidden={blur.status !== "on"}
        />

        {!isReady && (
          <div className="camera-placeholder">
            <p>{isRequesting ? "Waiting for the browser permission prompt." : message}</p>
          </div>
        )}
      </div>
    </section>
  );
}
