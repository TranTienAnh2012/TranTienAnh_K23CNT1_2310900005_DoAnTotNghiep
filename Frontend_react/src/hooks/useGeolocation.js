import { useState, useEffect, useCallback } from 'react';

export function useGeolocation() {
  const [coords, setCoords] = useState(null);
  const [error, setError] = useState(null);
  const [loading, setLoading] = useState(false);

  const getCurrentLocation = useCallback(() => {
    setLoading(true);
    setError(null);

    if (!('geolocation' in navigator)) {
      setError('Trình duyệt không hỗ trợ Geolocation HTML5.');
      setLoading(false);
      return;
    }

    navigator.geolocation.getCurrentPosition(
      (position) => {
        setCoords({
          latitude: position.coords.latitude,
          longitude: position.coords.longitude,
          accuracy: position.coords.accuracy
        });
        setLoading(false);
      },
      (err) => {
        console.warn('[useGeolocation] Lỗi lấy GPS:', err.message);
        // Để thuận tiện cho môi trường phát triển / demo trên localhost:
        // Cung cấp toạ độ trường mẫu khi bị từ chối
        setCoords({
          latitude: 21.028511,
          longitude: 105.854444,
          accuracy: 10,
          isSimulated: true
        });
        setError('Đang sử dụng toạ độ GPS khuôn viên giảng đường (Chế độ demo)');
        setLoading(false);
      },
      {
        enableHighAccuracy: true,
        timeout: 10000,
        maximumAge: 0
      }
    );
  }, []);

  useEffect(() => {
    getCurrentLocation();
  }, [getCurrentLocation]);

  return {
    coords,
    error,
    loading,
    refreshLocation: getCurrentLocation
  };
}
