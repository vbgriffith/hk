// ============================================================
//  AXIOM BREAK — procedural.js  [PHASE 3]
//
//  Procedural level generator.
//  Algorithm:
//    1. Fill with walls
//    2. Scatter seed floor tiles (40% density)
//    3. Run 4 passes of cellular automata smoothing
//    4. Flood-fill to find largest connected region
//    5. Carve guaranteed rooms at corners for spawn variety
//    6. Punch border wall back in
//    7. Validate: must have ≥30% open tiles, else regenerate
//
//  Returns a 10×13 2D array (matching existing level dimensions).
//  Also returns { playerStart, enemySpawns[], portalHint } world coords.
//
//  USAGE:
//    const { layout, playerStart, enemySpawns } = ProceduralGen.generate(seed);
// ============================================================

const ProceduralGen = (() => {

  const ROWS = 10;
  const COLS = 13;
  const TILE = 64;

  // ── Cellular automata thresholds ─────────────────────────
  const BIRTH_LIMIT  = 4;  // become floor if ≥ this many floor neighbours
  const DEATH_LIMIT  = 3;  // become wall if < this many floor neighbours

  function generate(seed) {
    let attempt = 0;
    while (attempt < 20) {
      attempt++;
      const rng = _seededRng(seed + attempt * 997);
      const layout = _tryGenerate(rng);
      if (layout) return _finalise(layout, rng);
    }
    // Fallback: guaranteed open layout
    return _finalise(_fallbackLayout(), _seededRng(seed));
  }

  function _tryGenerate(rng) {
    // Step 1: random fill
    const grid = [];
    for (let r = 0; r < ROWS; r++) {
      grid.push([]);
      for (let c = 0; c < COLS; c++) {
        // Border always wall
        if (r === 0 || r === ROWS-1 || c === 0 || c === COLS-1) {
          grid[r].push(1);
        } else {
          grid[r].push(rng() < 0.42 ? 0 : 1);
        }
      }
    }

    // Step 2: cellular automata passes
    for (let pass = 0; pass < 4; pass++) {
      _caStep(grid);
    }

    // Step 3: ensure border is wall
    for (let r = 0; r < ROWS; r++) {
      grid[r][0] = 1; grid[r][COLS-1] = 1;
    }
    for (let c = 0; c < COLS; c++) {
      grid[0][c] = 1; grid[ROWS-1][c] = 1;
    }

    // Step 4: carve guaranteed corner rooms
    _carveRoom(grid, 1, 1, 3, 3);
    _carveRoom(grid, ROWS-4, 1, ROWS-2, 3);
    _carveRoom(grid, 1, COLS-4, 3, COLS-2);
    _carveRoom(grid, ROWS-4, COLS-4, ROWS-2, COLS-2);

    // Step 5: flood fill — keep only largest region
    const filled = _keepLargestRegion(grid);

    // Step 6: validate open tile ratio
    let open = 0;
    for (let r = 1; r < ROWS-1; r++)
      for (let c = 1; c < COLS-1; c++)
        if (filled[r][c] === 0) open++;

    const interior = (ROWS-2) * (COLS-2);
    if (open / interior < 0.30) return null;

    return filled;
  }

  function _caStep(grid) {
    const next = grid.map(r => [...r]);
    for (let r = 1; r < ROWS-1; r++) {
      for (let c = 1; c < COLS-1; c++) {
        const floors = _countFloorNeighbours(grid, r, c);
        if (grid[r][c] === 1) {
          next[r][c] = floors >= BIRTH_LIMIT ? 0 : 1;
        } else {
          next[r][c] = floors < DEATH_LIMIT ? 1 : 0;
        }
      }
    }
    for (let r = 0; r < ROWS; r++)
      for (let c = 0; c < COLS; c++)
        grid[r][c] = next[r][c];
  }

  function _countFloorNeighbours(grid, r, c) {
    let count = 0;
    for (let dr = -1; dr <= 1; dr++)
      for (let dc = -1; dc <= 1; dc++) {
        if (dr === 0 && dc === 0) continue;
        const nr = r + dr, nc = c + dc;
        if (nr < 0 || nr >= ROWS || nc < 0 || nc >= COLS) continue;
        if (grid[nr][nc] === 0) count++;
      }
    return count;
  }

  function _carveRoom(grid, r1, c1, r2, c2) {
    for (let r = r1; r <= r2; r++)
      for (let c = c1; c <= c2; c++)
        grid[r][c] = 0;
  }

  function _keepLargestRegion(grid) {
    // BFS flood fill — identify all regions, keep largest
    const visited = Array.from({ length: ROWS }, () => Array(COLS).fill(false));
    let largestCells = [];

    for (let sr = 1; sr < ROWS-1; sr++) {
      for (let sc = 1; sc < COLS-1; sc++) {
        if (grid[sr][sc] === 0 && !visited[sr][sc]) {
          const region = _bfs(grid, visited, sr, sc);
          if (region.length > largestCells.length) largestCells = region;
        }
      }
    }

    // Rebuild: everything wall except largest region
    const result = Array.from({ length: ROWS }, () => Array(COLS).fill(1));
    for (const [r, c] of largestCells) result[r][c] = 0;
    // Border stays wall
    return result;
  }

  function _bfs(grid, visited, startR, startC) {
    const queue  = [[startR, startC]];
    const region = [];
    visited[startR][startC] = true;
    while (queue.length > 0) {
      const [r, c] = queue.shift();
      region.push([r, c]);
      for (const [dr, dc] of [[-1,0],[1,0],[0,-1],[0,1]]) {
        const nr = r+dr, nc = c+dc;
        if (nr < 0 || nr >= ROWS || nc < 0 || nc >= COLS) continue;
        if (visited[nr][nc] || grid[nr][nc] !== 0) continue;
        visited[nr][nc] = true;
        queue.push([nr, nc]);
      }
    }
    return region;
  }

  function _fallbackLayout() {
    // Simple guaranteed-open cross layout
    const g = Array.from({ length: ROWS }, () => Array(COLS).fill(1));
    for (let r = 1; r < ROWS-1; r++)
      for (let c = 1; c < COLS-1; c++)
        if (r === Math.floor(ROWS/2) || c === Math.floor(COLS/2) ||
            (r > 1 && r < ROWS-2 && c > 1 && c < COLS-2))
          g[r][c] = 0;
    return g;
  }

  // ── Finalise: compute spawn positions ─────────────────────

  function _finalise(layout, rng) {
    const openCells = [];
    for (let r = 1; r < ROWS-1; r++)
      for (let c = 1; c < COLS-1; c++)
        if (layout[r][c] === 0)
          openCells.push({ x: c * TILE + TILE/2, y: r * TILE + TILE/2 });

    if (openCells.length === 0) {
      return _finalise(_fallbackLayout(), rng);
    }

    // Shuffle open cells
    openCells.sort(() => rng() - 0.5);

    const playerStart = openCells[0];

    // Enemy spawns: cells far from player start
    const enemySpawns = openCells
      .filter(c => _dist(c, playerStart) > 200)
      .slice(0, 12);

    return { layout, playerStart, enemySpawns };
  }

  // ── Seeded PRNG (mulberry32) ───────────────────────────────

  function _seededRng(seed) {
    let s = seed >>> 0;
    return function() {
      s  += 0x6D2B79F5;
      let t = s;
      t  = Math.imul(t ^ t >>> 15, t | 1);
      t ^= t + Math.imul(t ^ t >>> 7, t | 61);
      return ((t ^ t >>> 14) >>> 0) / 4294967296;
    };
  }

  function _dist(a, b) {
    return Math.sqrt((a.x-b.x)**2 + (a.y-b.y)**2);
  }

  // ── Preview renderer (used in UpgradeScene preview) ───────
  function renderPreview(layout, gfx, ox, oy, cellSize = 6) {
    gfx.clear();
    for (let r = 0; r < layout.length; r++) {
      for (let c = 0; c < layout[r].length; c++) {
        const px = ox + c * cellSize;
        const py = oy + r * cellSize;
        if (layout[r][c] === 1) {
          gfx.fillStyle(AXIOM.COLORS.WALL, 0.8);
        } else {
          gfx.fillStyle(AXIOM.COLORS.FLOOR, 0.6);
        }
        gfx.fillRect(px, py, cellSize, cellSize);
      }
    }
    gfx.lineStyle(1, AXIOM.COLORS.WALL_EDGE, 0.4);
    gfx.strokeRect(ox, oy, layout[0].length * cellSize, layout.length * cellSize);
  }

  return { generate, renderPreview };

})();
