const config = require('../config/env');

/**
 * Tính khoảng cách giữa hai tọa độ GPS sử dụng công thức Haversine (đơn vị: Mét)
 * @param {number} lat1 Vĩ độ điểm 1
 * @param {number} lon1 Kinh độ điểm 1
 * @param {number} lat2 Vĩ độ điểm 2
 * @param {number} lon2 Kinh độ điểm 2
 * @returns {number} Khoảng cách tính bằng mét
 */
function calculateHaversineDistance(lat1, lon1, lat2, lon2) {
  const R = 6371000; // Bán kính Trái Đất (mét)
  const dLat = ((lat2 - lat1) * Math.PI) / 180;
  const dLon = ((lon2 - lon1) * Math.PI) / 180;
  
  const a =
    Math.sin(dLat / 2) * Math.sin(dLat / 2) +
    Math.cos((lat1 * Math.PI) / 180) *
      Math.cos((lat2 * Math.PI) / 180) *
      Math.sin(dLon / 2) *
      Math.sin(dLon / 2);

  const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
  return Math.round(R * c * 10) / 10;
}

/**
 * Kiểm tra xem vị trí của người dùng có nằm trong bán kính cho phép của giảng đường/trường học hay không
 * @param {number} userLat Vĩ độ của người dùng
 * @param {number} userLng Kinh độ của người dùng
 * @param {number} [targetLat] Vĩ độ đích (mặc định lấy CAMPUS_LAT)
 * @param {number} [targetLng] Kinh độ đích (mặc định lấy CAMPUS_LNG)
 * @param {number} [allowedRadius] Bán kính cho phép (mặc định lấy ALLOWED_RADIUS_METERS)
 * @returns {{ isWithinRange: boolean, distanceMeters: number, allowedRadius: number }}
 */
function verifyGpsLocation(userLat, userLng, targetLat, targetLng, allowedRadius) {
  const centerLat = targetLat !== undefined ? targetLat : config.CAMPUS_LAT;
  const centerLng = targetLng !== undefined ? targetLng : config.CAMPUS_LNG;
  const maxRadius = allowedRadius !== undefined ? allowedRadius : config.ALLOWED_RADIUS_METERS;

  // Nếu client không truyền GPS hợp lệ
  if (!userLat || !userLng || isNaN(userLat) || isNaN(userLng)) {
    return {
      isWithinRange: false,
      distanceMeters: -1,
      allowedRadius: maxRadius,
      message: 'Không lấy được tọa độ GPS hợp lệ từ thiết bị của bạn.'
    };
  }

  const distanceMeters = calculateHaversineDistance(
    parseFloat(userLat),
    parseFloat(userLng),
    centerLat,
    centerLng
  );

  return {
    isWithinRange: distanceMeters <= maxRadius,
    distanceMeters,
    allowedRadius: maxRadius,
    centerLat,
    centerLng,
    message: distanceMeters <= maxRadius
      ? `Vị trí hợp lệ. Khoảng cách tới phòng học: ${distanceMeters}m (Cho phép <= ${maxRadius}m)`
      : `Vị trí quá xa! Khoảng cách hiện tại: ${distanceMeters}m (Vượt quá bán kính cho phép ${maxRadius}m)`
  };
}

module.exports = {
  calculateHaversineDistance,
  verifyGpsLocation
};
