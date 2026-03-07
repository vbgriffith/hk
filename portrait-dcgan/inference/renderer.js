/**
 * renderer.js — Render generator output pixels to a canvas element.
 *
 * Takes the raw Float32Array [-1, 1] output from the generator and:
 *   1. Converts to [0, 255] uint8
 *   2. Applies optional color correction (brightness/contrast/saturation)
 *   3. Renders to a 64×64 canvas (then CSS scales to 256×256)
 *
 * The canvas is set to image-rendering: pixelated (CSS) for a crisp look,
 * OR you can call renderToCanvasSmooth() for bilinear CSS scaling.
 */

'use strict';

// ─────────────────────────────────────────────────────────────────────────────
// CONVERSION HELPERS
// ─────────────────────────────────────────────────────────────────────────────

/**
 * Convert Float32Array [C, H, W] in [-1, 1] to Uint8ClampedArray [H, W, 4]
 * Channel order: R=0, G=1, B=2 (matches torchvision convention)
 */
function pixelsToRGBA(pixels, H, W) {
  const C = 3;
  const rgba = new Uint8ClampedArray(H * W * 4);
  for (let h = 0; h < H; h++) {
    for (let w = 0; w < W; w++) {
      const srcBase = h * W + w;           // pixel index in spatial HW
      const dstBase = (h * W + w) * 4;
      rgba[dstBase + 0] = Math.round((pixels[0 * H * W + srcBase] * 0.5 + 0.5) * 255); // R
      rgba[dstBase + 1] = Math.round((pixels[1 * H * W + srcBase] * 0.5 + 0.5) * 255); // G
      rgba[dstBase + 2] = Math.round((pixels[2 * H * W + srcBase] * 0.5 + 0.5) * 255); // B
      rgba[dstBase + 3] = 255; // A
    }
  }
  return rgba;
}

// ─────────────────────────────────────────────────────────────────────────────
// COLOR CORRECTION
// ─────────────────────────────────────────────────────────────────────────────

/**
 * Apply contrast + brightness + saturation to RGBA data in-place.
 * @param {Uint8ClampedArray} rgba
 * @param {number} brightness  — additive, e.g. +10 lightens
 * @param {number} contrast    — multiplier, e.g. 1.1 increases contrast
 * @param {number} saturation  — multiplier, e.g. 1.2 increases saturation
 */
function colorCorrect(rgba, brightness = 0, contrast = 1.0, saturation = 1.0) {
  const n = rgba.length;
  for (let i = 0; i < n; i += 4) {
    let r = rgba[i + 0];
    let g = rgba[i + 1];
    let b = rgba[i + 2];

    // Saturation (convert to grayscale, lerp)
    if (saturation !== 1.0) {
      const gray = 0.299 * r + 0.587 * g + 0.114 * b;
      r = Math.round(gray + saturation * (r - gray));
      g = Math.round(gray + saturation * (g - gray));
      b = Math.round(gray + saturation * (b - gray));
    }

    // Contrast (about midpoint 128)
    if (contrast !== 1.0) {
      r = (r - 128) * contrast + 128;
      g = (g - 128) * contrast + 128;
      b = (b - 128) * contrast + 128;
    }

    // Brightness
    r += brightness;
    g += brightness;
    b += brightness;

    rgba[i + 0] = Math.max(0, Math.min(255, Math.round(r)));
    rgba[i + 1] = Math.max(0, Math.min(255, Math.round(g)));
    rgba[i + 2] = Math.max(0, Math.min(255, Math.round(b)));
  }
}

// ─────────────────────────────────────────────────────────────────────────────
// UPSCALE 2× (bilinear) — for optional 128×128 intermediate step
// ─────────────────────────────────────────────────────────────────────────────

function bilinearUpscale2x(src, srcW, srcH) {
  const dstW = srcW * 2;
  const dstH = srcH * 2;
  const dst  = new Uint8ClampedArray(dstW * dstH * 4);

  for (let dy = 0; dy < dstH; dy++) {
    for (let dx = 0; dx < dstW; dx++) {
      // Source coordinates (0.5 offset for pixel centers)
      const sx = (dx + 0.5) / dstW * srcW - 0.5;
      const sy = (dy + 0.5) / dstH * srcH - 0.5;

      const x0 = Math.floor(sx), y0 = Math.floor(sy);
      const x1 = Math.min(x0 + 1, srcW - 1);
      const y1 = Math.min(y0 + 1, srcH - 1);
      const x0c = Math.max(0, x0), y0c = Math.max(0, y0);

      const wx = sx - x0, wy = sy - y0;

      const dstIdx = (dy * dstW + dx) * 4;
      for (let c = 0; c < 4; c++) {
        const tl = src[(y0c * srcW + x0c) * 4 + c];
        const tr = src[(y0c * srcW + x1 ) * 4 + c];
        const bl = src[(y1  * srcW + x0c) * 4 + c];
        const br = src[(y1  * srcW + x1 ) * 4 + c];
        dst[dstIdx + c] = Math.round(
          tl * (1-wx) * (1-wy) +
          tr *    wx  * (1-wy) +
          bl * (1-wx) *    wy  +
          br *    wx  *    wy
        );
      }
    }
  }
  return dst;
}

// ─────────────────────────────────────────────────────────────────────────────
// MAIN RENDER FUNCTION
// ─────────────────────────────────────────────────────────────────────────────

/**
 * Render generator pixels to a canvas element.
 *
 * @param {HTMLCanvasElement} canvas   — target canvas (should be 64×64)
 * @param {Float32Array}      pixels   — generator output [3, H, W] in [-1, 1]
 * @param {number}            H        — image height (64)
 * @param {number}            W        — image width (64)
 * @param {object}            opts     — optional: { brightness, contrast, saturation }
 */
function renderToCanvas(canvas, pixels, H, W, opts = {}) {
  const {
    brightness  = 5,     // slight brightness boost (0-10 looks natural)
    contrast    = 1.05,  // slight contrast boost
    saturation  = 1.1,   // slight saturation boost
  } = opts;

  // Convert generator output → RGBA
  let rgba = pixelsToRGBA(pixels, H, W);

  // Color correct
  colorCorrect(rgba, brightness, contrast, saturation);

  // Write to canvas
  canvas.width  = W;
  canvas.height = H;
  const ctx = canvas.getContext('2d');
  const imageData = new ImageData(rgba, W, H);
  ctx.putImageData(imageData, 0, 0);
}

/**
 * Render with 2× bilinear upscale (128×128 on a 128×128 canvas).
 * Better visual quality than pure CSS scaling.
 */
function renderToCanvasUpscaled(canvas, pixels, H, W, opts = {}) {
  const {
    brightness = 5,
    contrast   = 1.05,
    saturation = 1.1,
  } = opts;

  let rgba = pixelsToRGBA(pixels, H, W);
  colorCorrect(rgba, brightness, contrast, saturation);

  // 2× bilinear
  const upscaled = bilinearUpscale2x(rgba, W, H);

  canvas.width  = W * 2;
  canvas.height = H * 2;
  const ctx = canvas.getContext('2d');
  ctx.putImageData(new ImageData(upscaled, W * 2, H * 2), 0, 0);
}

/**
 * Get RGBA pixel data as a raw array (useful for download/export).
 */
function getPixelData(pixels, H, W, opts = {}) {
  const {
    brightness = 5,
    contrast   = 1.05,
    saturation = 1.1,
  } = opts;
  let rgba = pixelsToRGBA(pixels, H, W);
  colorCorrect(rgba, brightness, contrast, saturation);
  return rgba;
}
