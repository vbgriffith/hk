/**
 * utils.js
 * Math problem generation, answer validation, and misc helpers.
 */

const Utils = (() => {

  /**
   * Pick a random integer in [min, max] inclusive.
   */
  function randInt(min, max) {
    return Math.floor(Math.random() * (max - min + 1)) + min;
  }

  /**
   * Pick a random element from an array.
   */
  function pick(arr) {
    return arr[Math.floor(Math.random() * arr.length)];
  }

  /**
   * Shuffle array in place (Fisher-Yates).
   */
  function shuffle(arr) {
    for (let i = arr.length - 1; i > 0; i--) {
      const j = Math.floor(Math.random() * (i + 1));
      [arr[i], arr[j]] = [arr[j], arr[i]];
    }
    return arr;
  }

  /**
   * Generate a math problem for the given level.
   * Returns { question, answer, operandA, operandB, operation }
   */
  function generateProblem(level) {
    const levelIdx = Math.min(level - 1, CONFIG.LEVEL_OPS.length - 1);
    const ops      = CONFIG.LEVEL_OPS[levelIdx];
    const op       = pick(ops);
    const max      = CONFIG.MAX_NUMBER;

    let a, b, answer;

    switch (op) {
      case '+':
        a = randInt(0, max);
        b = randInt(0, max - a); // keep sum ≤ max
        answer = a + b;
        break;

      case '-':
        a = randInt(0, max);
        b = randInt(0, a);       // keep result ≥ 0
        answer = a - b;
        break;

      case '×':
        // Keep product ≤ max (so pairs like 2×5, 3×3, etc.)
        a = randInt(0, 5);
        b = randInt(0, Math.min(max, Math.floor(max / Math.max(a, 1))));
        if (a === 0 || b === 0) { a = randInt(1, 5); b = randInt(1, 5); }
        answer = a * b;
        break;

      case '÷':
        // Generate answer first, then build the dividend
        answer = randInt(1, max);
        b      = randInt(1, Math.min(max, Math.floor(max / answer)));
        a      = answer * b;
        break;

      default:
        a = randInt(0, max); b = randInt(0, max - a); answer = a + b; op = '+';
    }

    return {
      question:  `${a} ${op} ${b} = ?`,
      answer,
      operandA:  a,
      operandB:  b,
      operation: op,
    };
  }

  /**
   * Generate an array of N unique answer choices, including the correct answer.
   * Spread controls how far decoys can differ from the correct answer.
   */
  function generateAnswers(correctAnswer, count, spread) {
    const set  = new Set([correctAnswer]);
    const min  = 0;
    const max  = CONFIG.MAX_NUMBER * CONFIG.MAX_NUMBER; // outer possible result
    let   tries = 0;

    while (set.size < count && tries < 500) {
      tries++;
      const delta  = randInt(1, spread);
      const sign   = Math.random() < 0.5 ? 1 : -1;
      const decoy  = correctAnswer + sign * delta;
      if (decoy >= min && decoy <= max && decoy !== correctAnswer) {
        set.add(decoy);
      }
    }

    // If still not enough, pad with sequential numbers
    let pad = correctAnswer + 1;
    while (set.size < count) {
      if (!set.has(pad)) set.add(pad);
      pad++;
    }

    return shuffle(Array.from(set));
  }

  /**
   * Assign answer choices to alien grid cells.
   * Returns a 2D array [row][col] with answer values.
   * The correct answer is placed randomly among the bottom row.
   */
  function buildAnswerGrid(problem, rows, cols) {
    const totalAliens = rows * cols;
    const spread      = CONFIG.DECOY_SPREAD[rows - 1] || 10;
    const answers     = generateAnswers(problem.answer, totalAliens, spread);

    // Ensure correct answer is somewhere in the bottom row
    const grid       = [];
    const flat       = [...answers];
    const correctIdx = flat.indexOf(problem.answer);

    // Bottom row indices in flat array: [totalAliens-cols .. totalAliens-1]
    const bottomStart = totalAliens - cols;
    const bottomSlot  = randInt(bottomStart, totalAliens - 1);

    // Swap correct answer into bottom row
    [flat[correctIdx], flat[bottomSlot]] = [flat[bottomSlot], flat[correctIdx]];

    for (let r = 0; r < rows; r++) {
      grid[r] = [];
      for (let c = 0; c < cols; c++) {
        grid[r][c] = flat[r * cols + c];
      }
    }

    return grid;
  }

  /**
   * Format time in mm:ss
   */
  function formatTime(ms) {
    const totalSec = Math.floor(ms / 1000);
    const m = Math.floor(totalSec / 60).toString().padStart(2, '0');
    const s = (totalSec % 60).toString().padStart(2, '0');
    return `${m}:${s}`;
  }

  /**
   * Clamp a value between min and max.
   */
  function clamp(val, min, max) {
    return Math.max(min, Math.min(max, val));
  }

  return {
    randInt,
    pick,
    shuffle,
    generateProblem,
    generateAnswers,
    buildAnswerGrid,
    formatTime,
    clamp,
  };

})();
