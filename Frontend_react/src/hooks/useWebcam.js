import { useState, useRef, useCallback, useEffect } from 'react';

export function useWebcam() {
  const videoRef = useRef(null);
  const streamRef = useRef(null);
  const [isStreaming, setIsStreaming] = useState(false);
  const [error, setError] = useState(null);

  const startCamera = useCallback(async () => {
    setError(null);
    try {
      if (streamRef.current) {
        streamRef.current.getTracks().forEach((track) => track.stop());
      }

      const stream = await navigator.mediaDevices.getUserMedia({
        video: {
          width: { ideal: 640 },
          height: { ideal: 480 },
          facingMode: 'user'
        },
        audio: false
      });

      streamRef.current = stream;
      if (videoRef.current) {
        videoRef.current.srcObject = stream;
        await videoRef.current.play();
      }
      setIsStreaming(true);
    } catch (err) {
      console.error('[useWebcam] Lỗi mở camera:', err);
      setError('Không thể truy cập camera. Vui lòng cấp quyền truy cập webcam trên trình duyệt.');
      setIsStreaming(false);
    }
  }, []);

  const stopCamera = useCallback(() => {
    if (streamRef.current) {
      streamRef.current.getTracks().forEach((track) => track.stop());
      streamRef.current = null;
    }
    if (videoRef.current) {
      videoRef.current.srcObject = null;
    }
    setIsStreaming(false);
  }, []);

  const capturePhotoBlob = useCallback(async () => {
    if (!videoRef.current || !isStreaming) return null;

    const video = videoRef.current;
    const canvas = document.createElement('canvas');
    canvas.width = video.videoWidth || 640;
    canvas.height = video.videoHeight || 480;

    const ctx = canvas.getContext('2d');
    ctx.drawImage(video, 0, 0, canvas.width, canvas.height);

    return new Promise((resolve) => {
      canvas.toBlob(
        (blob) => {
          resolve(blob);
        },
        'image/jpeg',
        0.92
      );
    });
  }, [isStreaming]);

  useEffect(() => {
    return () => {
      stopCamera();
    };
  }, [stopCamera]);

  return {
    videoRef,
    isStreaming,
    error,
    startCamera,
    stopCamera,
    capturePhotoBlob
  };
}
