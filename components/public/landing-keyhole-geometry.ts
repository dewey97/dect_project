/**
 * Hằng số hình học ổ khóa Euro-cylinder và camera cho landing 360.
 * Tách khỏi `landing-keyhole-model.tsx` để phần layout/scroll dùng được
 * mà không kéo three.js vào bundle đầu trang.
 */

// Euro-profile cylinder lock proportions (based on reference photos)
export const PLATE_W = 1.0;
export const PLATE_H = 1.88;
export const PLATE_DEPTH = 0.34; // Authentic realistic Euro-cylinder depth (matches reference lock barrel)
export const BEVEL_THICKNESS = 0.015;
export const BEVEL_SIZE = 0.010;

// Keyway centre inside the cylinder plug (in plate units)
export const SLOT_CX = -0.018;
export const SLOT_CY = 0.572;

// Euro-cylinder keyway profile precisely matching reference photo (media_1792595925558_1d95ed3c.png):
// - Prominent left warding shelf with horizontal underside
// - Iconic triangular wedge warding tooth on the right
// - Clean vertical lower keyway channel with flat floor
export const SLOT_POINTS: [number, number][] = [
  // Top entrance
  [-0.080, 0.865],
  [-0.080, 0.805],
  // Left warding shelf (pointing right)
  [-0.108, 0.795],
  [-0.015, 0.735],
  [-0.015, 0.708],
  [-0.082, 0.705],
  // Left wall channel
  [-0.082, 0.535],
  [-0.054, 0.490],
  [-0.054, 0.280],
  // Bottom channel
  [0.072, 0.280],
  // Right wall channel & triangular wedge tooth (pointing left)
  [0.072, 0.510],
  [-0.010, 0.590],
  [0.062, 0.672],
  // Right wall upper section
  [0.070, 0.865],
];

// Chaikin corner cutting for silky smooth, machined cut edge
export const SLOT_PATH: [number, number][] = (() => {
  const dense: [number, number][] = [];
  for (let i = 0; i < SLOT_POINTS.length; i++) {
    const [x0, y0] = SLOT_POINTS[i];
    const [x1, y1] = SLOT_POINTS[(i + 1) % SLOT_POINTS.length];
    const steps = Math.max(1, Math.ceil(Math.hypot(x1 - x0, y1 - y0) / 0.012));
    for (let s = 0; s < steps; s++) {
      const t = s / steps;
      dense.push([x0 + (x1 - x0) * t, y0 + (y1 - y0) * t]);
    }
  }
  let pts = dense;
  for (let pass = 0; pass < 1; pass++) {
    const next: [number, number][] = [];
    for (let i = 0; i < pts.length; i++) {
      const [x0, y0] = pts[i];
      const [x1, y1] = pts[(i + 1) % pts.length];
      next.push([x0 * 0.75 + x1 * 0.25, y0 * 0.75 + y1 * 0.25]);
      next.push([x0 * 0.25 + x1 * 0.75, y0 * 0.25 + y1 * 0.75]);
    }
    pts = next;
  }
  return pts;
})();

// Bounding box of the keyway opening, used to isolate tunnel wall vertices
// (so the ambient-occlusion gradient never darkens the outer barrel walls).
export const KEYWAY_BOUNDS = (() => {
  let minX = Infinity;
  let maxX = -Infinity;
  let minY = Infinity;
  let maxY = -Infinity;
  for (const [x, y] of SLOT_PATH) {
    minX = Math.min(minX, x);
    maxX = Math.max(maxX, x);
    minY = Math.min(minY, y);
    maxY = Math.max(maxY, y);
  }
  const margin = 0.04; // covers the beveled lip of the opening
  return {
    minX: minX - margin,
    maxX: maxX + margin,
    minY: minY - margin,
    maxY: maxY + margin,
  };
})();

export const CAMERA_FOV = 30;
export const REST_DISTANCE = 5.2;
export const END_DISTANCE = -0.38;
export const PITCH_REST = 0;
