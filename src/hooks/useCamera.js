import { useState, useCallback } from 'react';

export const useCamera = (videoRef, canvasSize) => {
  const [cameraError, setCameraError] = useState(null);
  const [isInitializing, setIsInitializing] = useState(false);

  // Mobile-specific camera constraints with fallback options
  const getMobileOptimizedConstraints = useCallback(() => {
    const isMobile = /Android|webOS|iPhone|iPad|iPod|BlackBerry|IEMobile|Opera Mini/i.test(navigator.userAgent);
    
    if (isMobile) {
      return [
        // Primary: High-quality rear camera
        {
          video: {
            facingMode: { exact: 'environment' },
            width: { ideal: 1280, max: 1920 },
            height: { ideal: 720, max: 1080 },
            frameRate: { ideal: 30, max: 60 }
          }
        },
        // Fallback 1: Rear camera with relaxed constraints
        {
          video: {
            facingMode: 'environment',
            width: { ideal: 640, max: 1280 },
            height: { ideal: 480, max: 720 }
          }
        },
        // Fallback 2: Any rear camera
        {
          video: {
            facingMode: { ideal: 'environment' }
          }
        },
        // Fallback 3: Front camera
        {
          video: {
            facingMode: 'user'
          }
        },
        // Fallback 4: Any camera
        {
          video: true
        }
      ];
    } else {
      // Desktop constraints
      return [
        {
          video: {
            width: { ideal: canvasSize.width },
            height: { ideal: canvasSize.height },
            frameRate: { ideal: 30 }
          }
        },
        {
          video: true
        }
      ];
    }
  }, [canvasSize]);

  const requestCameraPermission = async () => {
    // Check if permissions API is available
    if ('permissions' in navigator) {
      try {
        const permission = await navigator.permissions.query({ name: 'camera' });
        if (permission.state === 'denied') {
          throw new Error('Camera permission denied. Please enable camera access in your browser settings.');
        }
      } catch (err) {
        console.warn('Permission API not supported:', err);
      }
    }
  };

  const tryConstraints = async (constraints) => {
    for (const constraint of constraints) {
      try {
        const stream = await navigator.mediaDevices.getUserMedia(constraint);
        return stream;
      } catch (err) {
        console.warn('Constraint failed:', constraint, err);
        continue;
      }
    }
    throw new Error('All camera constraints failed');
  };

  const initializeCamera = async () => {
    if (isInitializing) return;
    
    setIsInitializing(true);
    setCameraError(null);

    try {
      // Check browser support
      if (!navigator.mediaDevices?.getUserMedia) {
        throw new Error("Camera API not supported in this browser");
      }

      // Log the current protocol for debugging
      console.log('Current protocol:', window.location.protocol);
      console.log('Current host:', window.location.host);
      
      // Check if we're on HTTPS or localhost (required for camera access)
      const isSecureContext = window.isSecureContext || window.location.protocol === 'https:' || window.location.hostname === 'localhost';
      if (!isSecureContext) {
        throw new Error("Camera access requires HTTPS or localhost. Please use https:// or access via localhost.");
      }

      // Request permission first
      await requestCameraPermission();

      // Get mobile-optimized constraints
      const constraints = getMobileOptimizedConstraints();
      console.log('Trying constraints:', constraints);
      
      // Try constraints in order of preference
      const stream = await tryConstraints(constraints);
      
      if (stream) {
        await setupVideoStream(stream);
        setCameraError(null);
        console.log('Camera initialized successfully');
      }
      
    } catch (err) {
      console.error("Camera initialization error:", err);
      let errorMessage = "Failed to access camera";
      
      if (err.name === 'NotAllowedError' || err.name === 'PermissionDeniedError') {
        errorMessage = "Camera access denied. Please allow camera permissions and refresh the page.";
      } else if (err.name === 'NotFoundError' || err.name === 'DevicesNotFoundError') {
        errorMessage = "No camera found on this device.";
      } else if (err.name === 'NotReadableError' || err.name === 'TrackStartError') {
        errorMessage = "Camera is being used by another application.";
      } else if (err.name === 'OverconstrainedError' || err.name === 'ConstraintNotSatisfiedError') {
        errorMessage = "Camera doesn't meet requirements. Trying with basic settings...";
        // Try one more time with basic constraints
        try {
          const basicStream = await navigator.mediaDevices.getUserMedia({ video: true });
          await setupVideoStream(basicStream);
          setCameraError(null);
          setIsInitializing(false);
          return;
        } catch (basicErr) {
          errorMessage = "Failed to initialize camera with any settings.";
        }
      } else if (err.message) {
        errorMessage = err.message;
      }
      
      setCameraError(errorMessage);
    } finally {
      setIsInitializing(false);
    }
  };

  const setupVideoStream = (stream) => {
    return new Promise((resolve, reject) => {
      if (!videoRef.current) {
        reject(new Error('Video element not available'));
        return;
      }

      const video = videoRef.current;
      
      // Set up event listeners
      const onLoadedMetadata = () => {
        // Ensure video dimensions are set correctly
        video.width = video.videoWidth;
        video.height = video.videoHeight;
        
        video.play().then(() => {
          console.log('Video started successfully');
          resolve();
        }).catch(err => {
          console.error("Video playback error:", err);
          reject(new Error("Failed to start video playback"));
        });
      };

      const onError = (err) => {
        console.error("Video error:", err);
        reject(new Error("Video loading failed"));
      };

      // Add event listeners
      video.addEventListener('loadedmetadata', onLoadedMetadata, { once: true });
      video.addEventListener('error', onError, { once: true });

      // Set the stream
      video.srcObject = stream;
      
      // Mobile-specific settings
      video.playsInline = true;
      video.muted = true;
      video.autoplay = true;
      
      // Cleanup function for timeout
      setTimeout(() => {
        video.removeEventListener('loadedmetadata', onLoadedMetadata);
        video.removeEventListener('error', onError);
        reject(new Error('Video initialization timeout'));
      }, 10000); // 10 second timeout
    });
  };

  const stopCamera = useCallback(() => {
    if (videoRef.current?.srcObject) {
      const stream = videoRef.current.srcObject;
      stream.getTracks().forEach(track => {
        track.stop();
      });
      videoRef.current.srcObject = null;
    }
  }, [videoRef]);

  return { 
    cameraError, 
    isInitializing, 
    initializeCamera, 
    stopCamera 
  };
};
