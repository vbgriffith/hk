/**
 * inference.js — PortraitGAN generator forward pass in pure JavaScript.
 *
 * Implements the exact architecture defined in src/model.py:
 *   - ConditionEmbedding (7 embedding tables, projected)
 *   - ResBlock × 2 at bottleneck
 *   - 4× GeneratorBlock (ConvTranspose2d + CondBatchNorm + ReLU)
 *   - Final Conv2d + Tanh
 *
 * No dependencies. Uses typed arrays (Float32Array) for all arithmetic.
 * Weights are loaded once from the WEIGHTS_B64 / WEIGHTS_INT8_B64 global.
 *
 * Main API:
 *   await initModel()                          — decode + cache weights
 *   await runInference(condIndices, seed, temp, onProgress)
 *                                              → Float32Array pixels [64×64×3]
 *                                                in range [-1, 1]
 */

'use strict';

// ─────────────────────────────────────────────────────────────────────────────
// WEIGHT STORE (populated by initModel)
// ─────────────────────────────────────────────────────────────────────────────

const W = {};           // name → Float32Array
let modelLoaded = false;

// ─────────────────────────────────────────────────────────────────────────────
// BASE64 DECODE
// ─────────────────────────────────────────────────────────────────────────────

function b64ToFloat32Array(b64) {
  const bin    = atob(b64);
  const bytes  = new Uint8Array(bin.length);
  for (let i = 0; i < bin.length; i++) bytes[i] = bin.charCodeAt(i);
  return new Float32Array(bytes.buffer);
}

function b64ToInt8Array(b64) {
  const bin   = atob(b64);
  const bytes = new Int8Array(bin.length);
  for (let i = 0; i < bin.length; i++) bytes[i] = bin.charCodeAt(i);
  return bytes;
}

// ─────────────────────────────────────────────────────────────────────────────
// DEQUANTIZE INT8 → FLOAT32 (block_size=128, symmetric)
// ─────────────────────────────────────────────────────────────────────────────

function dequantizeWeights(int8arr, scalesF32, blockSize = 128) {
  const n = int8arr.length;
  const out = new Float32Array(n);
  const invQ = 1.0 / 127.0;
  for (let i = 0; i < n; i++) {
    const blockIdx = Math.floor(i / blockSize);
    out[i] = int8arr[i] * scalesF32[blockIdx] * invQ;
  }
  return out;
}

// ─────────────────────────────────────────────────────────────────────────────
// WEIGHT SLICER — extract named parameter from flat array
// ─────────────────────────────────────────────────────────────────────────────

function getParam(name) {
  if (!W[name]) throw new Error(`Weight not found: ${name}`);
  return W[name];
}

// ─────────────────────────────────────────────────────────────────────────────
// INIT MODEL — decode and slice weights
// ─────────────────────────────────────────────────────────────────────────────

async function initModel() {
  if (modelLoaded) return;

  // Yield to browser so status text can update
  await new Promise(r => setTimeout(r, 10));

  // Decode flat weight array
  let flat;
  if (typeof WEIGHTS_INT8_B64 !== 'undefined') {
    const int8   = b64ToInt8Array(WEIGHTS_INT8_B64);
    const scales = b64ToFloat32Array(SCALES_B64);
    flat = dequantizeWeights(int8, scales, MODEL_METADATA.block_size || 128);
  } else {
    flat = b64ToFloat32Array(WEIGHTS_B64);
  }

  // Slice into named tensors using PARAM_LAYOUT
  for (const [name, info] of Object.entries(PARAM_LAYOUT)) {
    W[name] = flat.subarray(info.offset, info.offset + info.numel);
  }

  modelLoaded = true;
}

// ─────────────────────────────────────────────────────────────────────────────
// SEEDED PRNG — mulberry32
// ─────────────────────────────────────────────────────────────────────────────

function makePRNG(seed) {
  let s = seed >>> 0;
  return function() {
    s += 0x6D2B79F5;
    let t = Math.imul(s ^ (s >>> 15), 1 | s);
    t ^= t + Math.imul(t ^ (t >>> 7), 61 | t);
    return ((t ^ (t >>> 14)) >>> 0) / 0xFFFFFFFF;
  };
}

function randnPRNG(prng) {
  // Box-Muller transform
  let u, v;
  do { u = prng(); } while (u === 0);
  v = prng();
  return Math.sqrt(-2.0 * Math.log(u)) * Math.cos(2.0 * Math.PI * v);
}

// ─────────────────────────────────────────────────────────────────────────────
// TENSOR PRIMITIVES
// All tensors are flat Float32Arrays with explicit shape [N, C, H, W] or [N, D]
// ─────────────────────────────────────────────────────────────────────────────

function zeros(size) { return new Float32Array(size); }
function ones(size)  { const a = new Float32Array(size); a.fill(1); return a; }

// ── Linear (fully connected) ──
// x: [B, in], W: [out, in], b: [out] → [B, out]
function linear(x, W_mat, bias, B, inDim, outDim) {
  const out = zeros(B * outDim);
  for (let b = 0; b < B; b++) {
    for (let o = 0; o < outDim; o++) {
      let sum = bias ? bias[o] : 0;
      const wRow = o * inDim;
      const xRow = b * inDim;
      for (let i = 0; i < inDim; i++) {
        sum += W_mat[wRow + i] * x[xRow + i];
      }
      out[b * outDim + o] = sum;
    }
  }
  return out;
}

// ── ReLU in-place ──
function relu(x) { for (let i = 0; i < x.length; i++) if (x[i] < 0) x[i] = 0; return x; }

// ── LeakyReLU in-place ──
function leakyRelu(x, slope = 0.2) {
  for (let i = 0; i < x.length; i++) if (x[i] < 0) x[i] *= slope;
  return x;
}

// ── Tanh in-place ──
function tanh_(x) { for (let i = 0; i < x.length; i++) x[i] = Math.tanh(x[i]); return x; }

// ── Embedding lookup ──
// indices: [B] ints, table: [vocabSize, embedDim] → [B, embedDim]
function embedding(indices, table, embedDim) {
  const B = indices.length;
  const out = zeros(B * embedDim);
  for (let b = 0; b < B; b++) {
    const row = indices[b] * embedDim;
    for (let d = 0; d < embedDim; d++) {
      out[b * embedDim + d] = table[row + d];
    }
  }
  return out;
}

// ── Concat along last axis ──
// arrays: list of [B × di], returns [B × sum(di)]
function catLastDim(arrays, B) {
  const totalDim = arrays.reduce((s, a) => s + a.length / B, 0);
  const out = zeros(B * totalDim);
  let offset = 0;
  for (const arr of arrays) {
    const dim = arr.length / B;
    for (let b = 0; b < B; b++) {
      for (let d = 0; d < dim; d++) {
        out[b * totalDim + offset + d] = arr[b * dim + d];
      }
    }
    offset += dim;
  }
  return out;
}

// ── Batch Norm (inference mode) ──
// x: [B,C,H,W], mean/var/weight/bias: [C]
function batchNorm(x, mean, variance, weight, bias, B, C, H, W, eps = 1e-5) {
  const out = new Float32Array(x.length);
  const HW = H * W;
  for (let b = 0; b < B; b++) {
    for (let c = 0; c < C; c++) {
      const scale = weight[c] / Math.sqrt(variance[c] + eps);
      const shift = bias[c] - mean[c] * scale;
      const base  = (b * C + c) * HW;
      for (let i = 0; i < HW; i++) {
        out[base + i] = x[base + i] * scale + shift;
      }
    }
  }
  return out;
}

// ── Conditional Batch Norm ──
// x: [B,C,H,W], condGamma/condBeta: [B,C], running mean/var: [C]
function condBatchNorm(x, runMean, runVar, gamma, beta, B, C, H, W, eps = 1e-5) {
  const out = new Float32Array(x.length);
  const HW = H * W;
  for (let b = 0; b < B; b++) {
    for (let c = 0; c < C; c++) {
      const normScale = 1.0 / Math.sqrt(runVar[c] + eps);
      const g = gamma[b * C + c];
      const bt = beta[b * C + c];
      const base = (b * C + c) * HW;
      for (let i = 0; i < HW; i++) {
        out[base + i] = g * ((x[base + i] - runMean[c]) * normScale) + bt;
      }
    }
  }
  return out;
}

// ── ConvTranspose2d (stride=2, padding=1, kernel=4) ──
// in: [B, Cin, H, W] → out: [B, Cout, H*2, W*2]
function convTranspose2d(input, weight, bias, B, Cin, Cout, H, W) {
  const Hout = H * 2;
  const Wout = W * 2;
  const out  = zeros(B * Cout * Hout * Wout);
  const K = 4; // kernel size

  for (let b = 0; b < B; b++) {
    for (let co = 0; co < Cout; co++) {
      for (let ci = 0; ci < Cin; ci++) {
        for (let h = 0; h < H; h++) {
          for (let w = 0; w < W; w++) {
            const x_val = input[((b * Cin + ci) * H + h) * W + w];
            if (x_val === 0) continue;
            for (let kh = 0; kh < K; kh++) {
              for (let kw = 0; kw < K; kw++) {
                // ConvTranspose: output[h*stride - padding + kh]
                const oh = h * 2 - 1 + kh;
                const ow = w * 2 - 1 + kw;
                if (oh < 0 || oh >= Hout || ow < 0 || ow >= Wout) continue;
                const w_idx = ((co * Cin + ci) * K + kh) * K + kw;
                out[((b * Cout + co) * Hout + oh) * Wout + ow] +=
                  x_val * weight[w_idx];
              }
            }
          }
        }
      }
      // Add bias
      if (bias) {
        const bv = bias[co];
        const base = (b * Cout + co) * Hout * Wout;
        for (let i = 0; i < Hout * Wout; i++) out[base + i] += bv;
      }
    }
  }
  return out;
}

// ── Conv2d (stride=1, padding=1, kernel=3 OR kernel=1) ──
function conv2d(input, weight, bias, B, Cin, Cout, H, W, K = 3, stride = 1, pad = 1) {
  const Hout = Math.floor((H + 2 * pad - K) / stride) + 1;
  const Wout = Math.floor((W + 2 * pad - K) / stride) + 1;
  const out  = zeros(B * Cout * Hout * Wout);

  for (let b = 0; b < B; b++) {
    for (let co = 0; co < Cout; co++) {
      for (let ci = 0; ci < Cin; ci++) {
        for (let oh = 0; oh < Hout; oh++) {
          for (let ow = 0; ow < Wout; ow++) {
            let sum = 0;
            for (let kh = 0; kh < K; kh++) {
              for (let kw = 0; kw < K; kw++) {
                const ih = oh * stride - pad + kh;
                const iw = ow * stride - pad + kw;
                if (ih < 0 || ih >= H || iw < 0 || iw >= W) continue;
                sum += input[((b * Cin + ci) * H + ih) * W + iw] *
                       weight[((co * Cin + ci) * K + kh) * K + kw];
              }
            }
            out[((b * Cout + co) * Hout + oh) * Wout + ow] += sum;
          }
        }
      }
      if (bias) {
        const bv = bias[co];
        const base = (b * Cout + co) * Hout * Wout;
        for (let i = 0; i < Hout * Wout; i++) out[base + i] += bv;
      }
    }
  }
  return out;
}

// ─────────────────────────────────────────────────────────────────────────────
// CONDITION EMBEDDING
// ─────────────────────────────────────────────────────────────────────────────

const NUM_DIMS_JS = 7;
const EMBED_DIM   = 16;   // matches model.py EMBED_DIM_PER_DIM
const COND_DIM    = NUM_DIMS_JS * EMBED_DIM; // = 112

function conditionEmbedding(condIndices) {
  // condIndices: [7] integers (B=1 for inference)
  const B = 1;
  const embedParts = [];

  for (let d = 0; d < NUM_DIMS_JS; d++) {
    const tableW = getParam(`cond_embed.embeds.${d}.weight`); // [vocabSize, EMBED_DIM]
    const idx    = condIndices[d];
    const emb    = zeros(EMBED_DIM);
    for (let e = 0; e < EMBED_DIM; e++) emb[e] = tableW[idx * EMBED_DIM + e];
    embedParts.push(emb);
  }

  // Concatenate
  const concat = zeros(COND_DIM);
  for (let d = 0; d < NUM_DIMS_JS; d++) {
    for (let e = 0; e < EMBED_DIM; e++) {
      concat[d * EMBED_DIM + e] = embedParts[d][e];
    }
  }

  // Project: linear(COND_DIM → COND_DIM) + LeakyReLU
  const projW = getParam('cond_embed.proj.0.weight'); // [COND_DIM, COND_DIM]
  const projB = getParam('cond_embed.proj.0.bias');
  let cond = linear(concat, projW, projB, 1, COND_DIM, COND_DIM);
  leakyRelu(cond, 0.2);

  return cond; // [COND_DIM]
}

// ─────────────────────────────────────────────────────────────────────────────
// COND BATCH NORM HELPER
// ─────────────────────────────────────────────────────────────────────────────

function applyCondBN(x, prefix, cond, B, C, H, W) {
  // Compute gamma = linear(cond, gammaW, gammaB)
  const gammaW = getParam(`${prefix}.cbn.gamma_proj.weight`); // [C, COND_DIM]
  const gammaB = getParam(`${prefix}.cbn.gamma_proj.bias`);
  const betaW  = getParam(`${prefix}.cbn.beta_proj.weight`);
  const betaB  = getParam(`${prefix}.cbn.beta_proj.bias`);

  const gamma = linear(cond, gammaW, gammaB, 1, COND_DIM, C);
  const beta  = linear(cond, betaW,  betaB,  1, COND_DIM, C);

  const bnMean = getParam(`${prefix}.cbn.bn.running_mean`);
  const bnVar  = getParam(`${prefix}.cbn.bn.running_var`);

  return condBatchNorm(x, bnMean, bnVar, gamma, beta, B, C, H, W);
}

// ─────────────────────────────────────────────────────────────────────────────
// RES BLOCK
// ─────────────────────────────────────────────────────────────────────────────

function resBlock(x, prefix, B, C, H, W) {
  // conv1 + bn + relu + conv2 + bn → add residual
  const w1 = getParam(`${prefix}.net.0.weight`);
  const h1 = conv2d(x, w1, null, B, C, C, H, W, 3, 1, 1);

  const bn1W = getParam(`${prefix}.net.1.weight`);
  const bn1B = getParam(`${prefix}.net.1.bias`);
  const bn1M = getParam(`${prefix}.net.1.running_mean`);
  const bn1V = getParam(`${prefix}.net.1.running_var`);
  let r1 = batchNorm(h1, bn1M, bn1V, bn1W, bn1B, B, C, H, W);
  relu(r1);

  const w2 = getParam(`${prefix}.net.3.weight`);
  const h2 = conv2d(r1, w2, null, B, C, C, H, W, 3, 1, 1);

  const bn2W = getParam(`${prefix}.net.4.weight`);
  const bn2B = getParam(`${prefix}.net.4.bias`);
  const bn2M = getParam(`${prefix}.net.4.running_mean`);
  const bn2V = getParam(`${prefix}.net.4.running_var`);
  const r2 = batchNorm(h2, bn2M, bn2V, bn2W, bn2B, B, C, H, W);

  // Residual add
  for (let i = 0; i < x.length; i++) r2[i] += x[i];
  return r2;
}

// ─────────────────────────────────────────────────────────────────────────────
// GENERATOR BLOCK (ConvTranspose + CondBN + ReLU)
// ─────────────────────────────────────────────────────────────────────────────

function generatorBlock(x, prefix, cond, B, Cin, Cout, H, W) {
  // ConvTranspose2d: [B,Cin,H,W] → [B,Cout,H*2,W*2]
  const convW = getParam(`${prefix}.conv.weight`); // [Cin, Cout, 4, 4]
  let out = convTranspose2d(x, convW, null, B, Cin, Cout, H, W);

  // Conditional BN
  out = applyCondBN(out, prefix, cond, B, Cout, H * 2, W * 2);

  // ReLU
  relu(out);
  return out;
}

// ─────────────────────────────────────────────────────────────────────────────
// FULL GENERATOR FORWARD PASS
// ─────────────────────────────────────────────────────────────────────────────

const NZ_JS  = 128;
const NGF_JS = 64;

async function generatorForward(z, condIndices) {
  // z: Float32Array [NZ_JS]
  // condIndices: [7] ints
  // Returns: Float32Array [3 * 64 * 64] in [-1, 1]

  const B = 1;

  // ── Condition embedding ──
  const cond = conditionEmbedding(condIndices);  // [COND_DIM]

  // ── Input projection: concat(z, cond) → linear → reshape ──
  const zCond = zeros(NZ_JS + COND_DIM);
  for (let i = 0; i < NZ_JS; i++)   zCond[i] = z[i];
  for (let i = 0; i < COND_DIM; i++) zCond[NZ_JS + i] = cond[i];

  const projW  = getParam('input_proj.0.weight'); // [4*4*NGF*8, NZ+COND]
  const projB  = getParam('input_proj.0.bias');
  const NGF8   = NGF_JS * 8; // 512
  const projOut = linear(zCond, projW, projB, 1, NZ_JS + COND_DIM, 4 * 4 * NGF8);
  relu(projOut);

  // Reshape to [B, 512, 4, 4]
  let x = projOut; // flat, conceptually [1, 512, 4, 4]

  // ── Residual blocks at 4×4 ──
  x = resBlock(x, 'res1', B, NGF8, 4, 4);
  x = resBlock(x, 'res2', B, NGF8, 4, 4);

  // ── Upsampling stages ──
  // up1: [B, 512, 4, 4] → [B, 256, 8, 8]
  x = generatorBlock(x, 'up1', cond, B, NGF8,       NGF_JS*4, 4,  4);
  // up2: [B, 256, 8, 8] → [B, 128, 16, 16]
  x = generatorBlock(x, 'up2', cond, B, NGF_JS*4,   NGF_JS*2, 8,  8);
  // up3: [B, 128, 16, 16] → [B, 64, 32, 32]
  x = generatorBlock(x, 'up3', cond, B, NGF_JS*2,   NGF_JS,   16, 16);
  // up4: [B, 64, 32, 32] → [B, 32, 64, 64]
  x = generatorBlock(x, 'up4', cond, B, NGF_JS,     NGF_JS/2, 32, 32);

  // ── Output conv: [B, 32, 64, 64] → [B, 3, 64, 64] ──
  const outW = getParam('output_conv.0.weight'); // [3, 32, 3, 3]
  const outB = getParam('output_conv.0.bias');
  x = conv2d(x, outW, outB, B, NGF_JS/2, 3, 64, 64, 3, 1, 1);

  // ── Tanh ──
  tanh_(x);

  return x; // Float32Array [3 * 64 * 64], range [-1, 1]
}

// ─────────────────────────────────────────────────────────────────────────────
// PUBLIC API
// ─────────────────────────────────────────────────────────────────────────────

/**
 * Run a single inference pass.
 * @param {number[]} condIndices  — 7-element array of condition indices
 * @param {number}   seed         — integer seed for reproducibility
 * @param {number}   temp         — noise temperature (1.0 = normal, <1 = conservative)
 * @param {function} onProgress   — optional callback(fraction 0..1)
 * @returns {Promise<Float32Array>} pixels [3×64×64] in [-1,1]
 */
async function runInference(condIndices, seed = 42, temp = 1.0, onProgress = null) {
  if (!modelLoaded) throw new Error('Model not loaded. Call initModel() first.');

  if (onProgress) onProgress(0.1);
  await new Promise(r => setTimeout(r, 0)); // yield to UI

  // Sample noise vector
  const prng = makePRNG(seed);
  const z = new Float32Array(NZ_JS);
  for (let i = 0; i < NZ_JS; i++) z[i] = randnPRNG(prng) * temp;

  if (onProgress) onProgress(0.2);
  await new Promise(r => setTimeout(r, 0));

  const pixels = await generatorForward(z, condIndices);

  if (onProgress) onProgress(1.0);
  return pixels;
}
