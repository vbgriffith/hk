/**
 * Noise — simplex noise for procedural generation (Layer 4 primarily).
 * Self-contained implementation, no external dependencies.
 */
const Noise = (function () {
  // Permutation table
  const perm = new Uint8Array(512);
  const gradP = new Array(512);

  const grad3 = [
    [1,1,0],[-1,1,0],[1,-1,0],[-1,-1,0],
    [1,0,1],[-1,0,1],[1,0,-1],[-1,0,-1],
    [0,1,1],[0,-1,1],[0,1,-1],[0,-1,-1]
  ];

  function seed(s) {
    // Simple LCG seeded permutation
    let n = s & 0xffffffff;
    const p = new Uint8Array(256);
    for (let i = 0; i < 256; i++) p[i] = i;
    for (let i = 255; i > 0; i--) {
      n = (1664525 * n + 1013904223) & 0xffffffff;
      const j = ((n >>> 0) % (i + 1));
      [p[i], p[j]] = [p[j], p[i]];
    }
    for (let i = 0; i < 512; i++) {
      perm[i] = p[i & 255];
      gradP[i] = grad3[perm[i] % 12];
    }
  }

  function dot2(g, x, y) { return g[0] * x + g[1] * y; }

  function simplex2(xin, yin) {
    const F2 = 0.5 * (Math.sqrt(3) - 1);
    const G2 = (3 - Math.sqrt(3)) / 6;
    const s = (xin + yin) * F2;
    const i = Math.floor(xin + s);
    const j = Math.floor(yin + s);
    const t = (i + j) * G2;
    const x0 = xin - i + t, y0 = yin - j + t;
    let i1, j1;
    if (x0 > y0) { i1 = 1; j1 = 0; } else { i1 = 0; j1 = 1; }
    const x1 = x0 - i1 + G2, y1 = y0 - j1 + G2;
    const x2 = x0 - 1 + 2 * G2, y2 = y0 - 1 + 2 * G2;
    const ii = i & 255, jj = j & 255;
    let n0, n1, n2;
    let t0 = 0.5 - x0*x0 - y0*y0;
    if (t0 < 0) n0 = 0;
    else { t0 *= t0; n0 = t0 * t0 * dot2(gradP[ii + perm[jj]], x0, y0); }
    let t1 = 0.5 - x1*x1 - y1*y1;
    if (t1 < 0) n1 = 0;
    else { t1 *= t1; n1 = t1 * t1 * dot2(gradP[ii + i1 + perm[jj + j1]], x1, y1); }
    let t2 = 0.5 - x2*x2 - y2*y2;
    if (t2 < 0) n2 = 0;
    else { t2 *= t2; n2 = t2 * t2 * dot2(gradP[ii + 1 + perm[jj + 1]], x2, y2); }
    return 70 * (n0 + n1 + n2); // returns -1..1
  }

  // Fractal brownian motion
  function fbm(x, y, octaves = 4, lacunarity = 2.0, gain = 0.5) {
    let value = 0, amplitude = 0.5, frequency = 1;
    for (let i = 0; i < octaves; i++) {
      value += amplitude * simplex2(x * frequency, y * frequency);
      amplitude *= gain;
      frequency *= lacunarity;
    }
    return value;
  }

  // Initialize with a default seed
  seed(42);

  return {
    seed,
    simplex2,
    fbm,
    // Returns 0..1 normalized
    value(x, y) { return (simplex2(x, y) + 1) * 0.5; },
    fbmValue(x, y, octaves, lacunarity, gain) {
      return (fbm(x, y, octaves, lacunarity, gain) + 1) * 0.5;
    }
  };
})();
