import React, { useState, useEffect } from 'react';
import { useWebcam } from '../../hooks/useWebcam';
import { useGeolocation } from '../../hooks/useGeolocation';
import { Camera, MapPin, RefreshCw, CheckCircle2, AlertTriangle } from 'lucide-react';

export default function WebcamGpsCapture({
  onCapture,
  btnText = 'Chụp ảnh & Điểm danh',
  disabled = false,
  showGpsDetails = true
}) {
  const { videoRef, isStreaming, error: cameraError, startCamera, stopCamera, capturePhotoBlob } = useWebcam();
  const { coords, error: gpsError, loading: gpsLoading, refreshLocation } = useGeolocation();
  const [previewUrl, setPreviewUrl] = useState(null);
  const [capturedBlob, setCapturedBlob] = useState(null);

  useEffect(() => {
    startCamera();
    return () => {
      stopCamera();
    };
  }, [startCamera, stopCamera]);

  const handleTakeSnapshot = async () => {
    const blob = await capturePhotoBlob();
    if (blob) {
      setCapturedBlob(blob);
      const url = URL.createObjectURL(blob);
      setPreviewUrl(url);
    }
  };

  const handleRetake = () => {
    if (previewUrl) URL.revokeObjectURL(previewUrl);
    setPreviewUrl(null);
    setCapturedBlob(null);
    startCamera();
  };

  const handleConfirm = () => {
    if (capturedBlob && onCapture) {
      onCapture({
        imageBlob: capturedBlob,
        latitude: coords?.latitude,
        longitude: coords?.longitude
      });
    }
  };

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
      {/* Khung Camera / Ảnh xem trước */}
      <div className="camera-wrapper">
        {previewUrl ? (
          <img
            src={previewUrl}
            alt="Captured Preview"
            style={{ width: '100%', height: '100%', objectFit: 'cover' }}
          />
        ) : (
          <>
            <video
              ref={videoRef}
              autoPlay
              playsInline
              muted
              style={{ width: '100%', height: '100%', objectFit: 'cover', transform: 'scaleX(-1)' }}
            />
            {isStreaming && <div className="face-scanning-mesh" />}
          </>
        )}
      </div>

      {cameraError && (
        <div style={{ fontSize: '13px', color: '#ef4444', display: 'flex', alignItems: 'center', gap: '6px' }}>
          <AlertTriangle size={16} /> {cameraError}
        </div>
      )}

      {/* Thông tin tọa độ GPS */}
      {showGpsDetails && (
        <div
          style={{
            background: '#f8fafc',
            border: '1px solid #e2e8f0',
            borderRadius: '8px',
            padding: '12px 16px',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'space-between',
            fontSize: '13px'
          }}
        >
          <div style={{ display: 'flex', alignItems: 'center', gap: '8px', color: '#334155' }}>
            <MapPin size={18} color="#2563eb" />
            <div>
              <b>GPS hiện tại:</b>{' '}
              {coords ? (
                <span>
                  {coords.latitude.toFixed(6)}, {coords.longitude.toFixed(6)}
                  {coords.isSimulated && ' (Giảng đường demo)'}
                </span>
              ) : (
                <span style={{ color: '#94a3b8' }}>Đang dò tìm vệ tinh...</span>
              )}
            </div>
          </div>
          <button
            type="button"
            onClick={refreshLocation}
            className="btn btn-secondary"
            style={{ padding: '4px 10px', fontSize: '12px' }}
            disabled={gpsLoading}
          >
            <RefreshCw size={13} className={gpsLoading ? 'animate-spin' : ''} />
            Làm mới GPS
          </button>
        </div>
      )}

      {/* Nút hành động */}
      <div style={{ display: 'flex', gap: '12px', justifyContent: 'center' }}>
        {!previewUrl ? (
          <button
            type="button"
            onClick={handleTakeSnapshot}
            disabled={!isStreaming || disabled}
            className="btn btn-primary"
            style={{ padding: '12px 28px', fontSize: '15px' }}
          >
            <Camera size={18} />
            Chụp ảnh xác thực
          </button>
        ) : (
          <>
            <button
              type="button"
              onClick={handleRetake}
              className="btn btn-secondary"
              style={{ padding: '12px 20px' }}
            >
              Chụp lại
            </button>
            <button
              type="button"
              onClick={handleConfirm}
              disabled={disabled}
              className="btn btn-success"
              style={{ padding: '12px 28px', fontSize: '15px' }}
            >
              <CheckCircle2 size={18} />
              {btnText}
            </button>
          </>
        )}
      </div>
    </div>
  );
}
