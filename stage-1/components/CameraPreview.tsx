"use client";

import { useCallback, useEffect, useRef, useState } from "react";
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

function stopStream(stream: MediaStream | null) {
  stream?.getTracks().forEach((track) => track.stop());
}

function getErrorMessage(error: unknown) {
  if (error instanceof DOMException && error.name === "NotAllowedError") {
    return "Camera permission was blocked. Allow camera access in the browser to continue.";
  }

  if (error instanceof DOMException && error.name === "NotFoundError") {
    return "No camera was found on this device.";
  }

  return "The camera could not be started.";
}

export function CameraPreview() {
  const videoRef = useRef<HTMLVideoElement>(null);
  const streamRef = useRef<MediaStream | null>(null);
  const [cameraState, setCameraState] = useState<CameraState>("idle");
  const [message, setMessage] = useState("Waiting for camera permission.");

  const stopCamera = useCallback(() => {
    stopStream(streamRef.current);
    streamRef.current = null;

    if (videoRef.current) {
      videoRef.current.srcObject = null;
    }

    setCameraState("idle");
    setMessage("Camera stopped.");
  }, []);

  const startCamera = useCallback(async () => {
    if (!navigator.mediaDevices?.getUserMedia) {
      setCameraState("unsupported");
      setMessage("This browser does not support camera capture.");
      return;
    }

    setCameraState("requesting");
    setMessage("Requesting front camera.");
    stopStream(streamRef.current);
    streamRef.current = null;

    if (videoRef.current) {
      videoRef.current.srcObject = null;
    }

    try {
      const stream = await navigator.mediaDevices.getUserMedia(cameraConstraints);
      streamRef.current = stream;

      if (videoRef.current) {
        videoRef.current.srcObject = stream;
        await videoRef.current.play();
      }

      setCameraState("ready");
      setMessage("Front camera is live.");
    } catch (error) {
      stopStream(streamRef.current);
      streamRef.current = null;
      setCameraState("blocked");
      setMessage(getErrorMessage(error));
    }
  }, []);

  useEffect(() => {
    void startCamera();

    return () => {
      stopStream(streamRef.current);
      streamRef.current = null;
    };
  }, [startCamera]);

  const isReady = cameraState === "ready";
  const isRequesting = cameraState === "requesting";
  const isError = cameraState === "blocked" || cameraState === "unsupported";

  return (
    <section className="camera-panel" aria-label="Live camera preview">
      <div className="camera-toolbar">
        <div className="camera-status" aria-live="polite">
          <p className="camera-status-label">Camera</p>
          <p className={isError ? "camera-status-value camera-error" : "camera-status-value"}>
            {message}
          </p>
        </div>

        <div className="camera-actions">
          <Button
            variant="glass"
            type="button"
            onClick={startCamera}
            disabled={isRequesting}
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

        {!isReady && (
          <div className="camera-placeholder">
            <p>{isRequesting ? "Waiting for the browser permission prompt." : message}</p>
          </div>
        )}
      </div>
    </section>
  );
}
