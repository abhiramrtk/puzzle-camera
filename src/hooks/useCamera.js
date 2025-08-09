import { useState } from 'react';

export const useCamera = (videoRef, canvasSize) => {
  const [cameraError, setCameraError] = useState(null);

  const initializeCamera = async () => {
    try {
      if (!navigator.mediaDevices?.getUserMedia) {
        throw new Error("Camera API not supported");
      }

      const constraints = {
        video: {
          facingMode: { ideal: 'environment' },
          width: { ideal: canvasSize.width },
          height: { ideal: canvasSize.height },
        }
      };

      try {
        const stream = await navigator.mediaDevices.getUserMedia(constraints);
        setupVideoStream(stream);
      } catch (e) {
        const basicStream = await navigator.mediaDevices.getUserMedia({
          video: true
        });
        setupVideoStream(basicStream);
      }
      
      setCameraError(null);
    } catch (err) {
      console.error("Camera error:", err);
      setCameraError(err.message || "Failed to access camera");
    }
  };

  const setupVideoStream = (stream) => {
    if (videoRef.current) {
      videoRef.current.srcObject = stream;
      videoRef.current.onloadedmetadata = () => {
        videoRef.current.play().catch(err => {
          console.error("Video playback error:", err);
          setCameraError("Failed to start video playback");
        });
      };
    }
  };

  return { cameraError, initializeCamera };
};
