// ============================================================
//  AXIOM BREAK — utils.js
//  Shared helper functions
// ============================================================

const Utils = {

  // Format score with leading zeros
  formatScore(n) {
    return String(n).padStart(6, '0');
  },

  // Angle between two points (radians)
  angleTo(x1, y1, x2, y2) {
    return Math.atan2(y2 - y1, x2 - x1);
  },

  // Distance between two points
  dist(x1, y1, x2, y2) {
    const dx = x2 - x1, dy = y2 - y1;
    return Math.sqrt(dx * dx + dy * dy);
  },

  // Clamp a value
  clamp(val, min, max) {
    return Math.max(min, Math.min(max, val));
  },

  // Random integer in range [min, max]
  randInt(min, max) {
    return Math.floor(Math.random() * (max - min + 1)) + min;
  },

  // Random float
  randFloat(min, max) {
    return Math.random() * (max - min) + min;
  },

  // Hex color to Phaser-friendly int (if not already)
  hexInt(hex) {
    if (typeof hex === 'number') return hex;
    return parseInt(hex.replace('#', ''), 16);
  },

  // Lerp
  lerp(a, b, t) {
    return a + (b - a) * t;
  },

  // Pad a number with zeros
  pad(n, len = 2) {
    return String(n).padStart(len, '0');
  },

};
