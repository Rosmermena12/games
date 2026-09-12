"use client";

import type { GameBridge } from "./types";

/* eslint-disable @typescript-eslint/no-explicit-any */

const COLS = 8;
const ROWS = 16;
const CELL = 34;

const BOARD_X = 26;
const BOARD_Y = 26;
const W = BOARD_X * 2 + COLS * CELL + 150;
const H = BOARD_Y * 2 + ROWS * CELL;

/** Sólo dos colores: la mitad de combinaciones que un Dr. Mario clásico. */
const COLOR_A = 1;
const COLOR_B = 2;
const EMPTY = 0;

const PALETTE: Record<number, number> = {
  [COLOR_A]: 0x22d3ee,
  [COLOR_B]: 0xe879f9,
};

/** Fichas iguales en línea necesarias para eliminar. */
const MATCH_LENGTH = 4;

const DROP_START_MS = 720;
const DROP_MIN_MS = 150;
const DROP_STEP_MS = 22;
const LOCK_DELAY_MS = 260;
const SOFT_DROP_MS = 45;

/** Repetición automática al mantener pulsado izquierda/derecha. */
const MOVE_REPEAT_MS = 110;
const MOVE_DELAY_MS = 190;

type Grid = number[];

interface Capsule {
  /** Celda pivote, en coordenadas de tablero. */
  col: number;
  row: number;
  /** 0 = derecha, 1 = arriba, 2 = izquierda, 3 = abajo respecto al pivote. */
  rotation: number;
  colors: [number, number];
}

const ROTATION_OFFSETS: Array<[number, number]> = [
  [1, 0],
  [0, -1],
  [-1, 0],
  [0, 1],
];

/**
 * Puzle de cápsulas de dos colores. Cada jugador simula su propio tablero; por
 * la red sólo viajan la basura enviada y una foto del tablero para el
 * marcador del rival, así que no hace falta autoridad de servidor.
 */
export function createBloquesScene(phaser: any, bridge: GameBridge) {
  const isOnline = bridge.role !== "solo";

  let grid: Grid = new Array(COLS * ROWS).fill(EMPTY);
  let current: Capsule | null = null;
  let nextColors: [number, number] = randomColors();

  let dropInterval = DROP_START_MS;
  let dropTimer = 0;
  let lockTimer = 0;
  let softDrop = false;
  let placed = 0;
  let score = 0;
  let cleared = 0;
  let rivalScore = 0;
  let pendingGarbage = 0;
  let finished = false;
  let paused = false;

  let moveDirection = 0;
  let moveTimer = 0;
  let moveRepeating = false;

  let graphics: any = null;
  let scoreText: any = null;
  let nextText: any = null;
  let garbageText: any = null;
  let unsubscribe: (() => void) | null = null;
  let cursors: any = null;
  let keys: any = null;

  function index(col: number, row: number) {
    return row * COLS + col;
  }

  function cellAt(col: number, row: number) {
    if (col < 0 || col >= COLS || row < 0 || row >= ROWS) return -1;
    return grid[index(col, row)];
  }

  function randomColor() {
    return Math.random() < 0.5 ? COLOR_A : COLOR_B;
  }

  function randomColors(): [number, number] {
    return [randomColor(), randomColor()];
  }

  function capsuleCells(capsule: Capsule): Array<[number, number, number]> {
    const [dx, dy] = ROTATION_OFFSETS[capsule.rotation];
    return [
      [capsule.col, capsule.row, capsule.colors[0]],
      [capsule.col + dx, capsule.row + dy, capsule.colors[1]],
    ];
  }

  function fits(capsule: Capsule) {
    return capsuleCells(capsule).every(([col, row]) => {
      if (col < 0 || col >= COLS || row >= ROWS) return false;
      // Por encima del techo se permite, para poder girar al aparecer.
      if (row < 0) return true;
      return grid[index(col, row)] === EMPTY;
    });
  }

  function spawn() {
    applyPendingGarbage();

    const capsule: Capsule = {
      col: Math.floor(COLS / 2) - 1,
      row: 0,
      rotation: 0,
      colors: nextColors,
    };
    nextColors = randomColors();

    if (!fits(capsule)) {
      gameOver();
      return;
    }

    current = capsule;
    dropTimer = 0;
    lockTimer = 0;
  }

  function gameOver() {
    finished = true;
    current = null;
    bridge.onGameOver({
      outcome: "lose",
      label: "Tablero lleno · " + score + " puntos",
    });
    if (isOnline) bridge.send({ t: "over", s: score });
  }

  function win() {
    finished = true;
    current = null;
    bridge.onGameOver({ outcome: "win", label: "El rival ha desbordado · " + score + " puntos" });
  }

  /** Mete la basura recibida como fichas sueltas en columnas al azar. */
  function applyPendingGarbage() {
    if (pendingGarbage <= 0) return;

    const columns = Array.from({ length: COLS }, (_, col) => col);
    for (let i = columns.length - 1; i > 0; i -= 1) {
      const j = Math.floor(Math.random() * (i + 1));
      [columns[i], columns[j]] = [columns[j], columns[i]];
    }

    const amount = Math.min(pendingGarbage, COLS);
    for (let i = 0; i < amount; i += 1) {
      const col = columns[i];
      if (grid[index(col, 0)] === EMPTY) {
        grid[index(col, 0)] = randomColor();
      }
    }

    pendingGarbage = Math.max(0, pendingGarbage - amount);
    settle();
    resolveBoard(true);
  }

  function move(delta: number) {
    if (!current || finished || paused) return;
    const candidate = { ...current, col: current.col + delta };
    if (fits(candidate)) {
      current = candidate;
      lockTimer = 0;
    }
  }

  function rotate(direction: number) {
    if (!current || finished || paused) return;
    const rotation = (current.rotation + direction + 4) % 4;
    const candidate: Capsule = { ...current, rotation };

    // Empujones laterales: permite girar pegado a la pared o a una pila.
    const kicks = [0, -1, 1, -2, 2];
    for (const kick of kicks) {
      const kicked = { ...candidate, col: candidate.col + kick };
      if (fits(kicked)) {
        current = kicked;
        lockTimer = 0;
        return;
      }
    }
  }

  function stepDown(): boolean {
    if (!current) return false;
    const candidate = { ...current, row: current.row + 1 };
    if (fits(candidate)) {
      current = candidate;
      return true;
    }
    return false;
  }

  function hardDrop() {
    if (!current || finished || paused) return;
    while (stepDown()) {
      score += 1;
    }
    lock();
  }

  function lock() {
    if (!current) return;
    for (const [col, row, color] of capsuleCells(current)) {
      if (row < 0) {
        gameOver();
        return;
      }
      grid[index(col, row)] = color;
    }
    current = null;
    placed += 1;
    dropInterval = Math.max(DROP_MIN_MS, DROP_START_MS - placed * DROP_STEP_MS);
    resolveBoard(false);
    if (!finished) spawn();
  }

  /** Hace caer todas las fichas sueltas una casilla a la vez hasta reposar. */
  function settle() {
    let moved = true;
    while (moved) {
      moved = false;
      for (let row = ROWS - 2; row >= 0; row -= 1) {
        for (let col = 0; col < COLS; col += 1) {
          if (grid[index(col, row)] !== EMPTY && grid[index(col, row + 1)] === EMPTY) {
            grid[index(col, row + 1)] = grid[index(col, row)];
            grid[index(col, row)] = EMPTY;
            moved = true;
          }
        }
      }
    }
  }

  function findMatches(): Set<number> {
    const marked = new Set<number>();

    for (let row = 0; row < ROWS; row += 1) {
      let run = 1;
      for (let col = 1; col <= COLS; col += 1) {
        const previous = cellAt(col - 1, row);
        const value = col < COLS ? cellAt(col, row) : -1;
        if (value !== EMPTY && value === previous) {
          run += 1;
        } else {
          if (run >= MATCH_LENGTH && previous !== EMPTY) {
            for (let k = 1; k <= run; k += 1) marked.add(index(col - k, row));
          }
          run = 1;
        }
      }
    }

    for (let col = 0; col < COLS; col += 1) {
      let run = 1;
      for (let row = 1; row <= ROWS; row += 1) {
        const previous = cellAt(col, row - 1);
        const value = row < ROWS ? cellAt(col, row) : -1;
        if (value !== EMPTY && value === previous) {
          run += 1;
        } else {
          if (run >= MATCH_LENGTH && previous !== EMPTY) {
            for (let k = 1; k <= run; k += 1) marked.add(index(col, row - k));
          }
          run = 1;
        }
      }
    }

    return marked;
  }

  /** Elimina, deja caer y repite: cada vuelta extra es una cascada. */
  function resolveBoard(fromGarbage: boolean) {
    let cascades = 0;
    let total = 0;

    for (;;) {
      const matches = findMatches();
      if (matches.size === 0) break;

      matches.forEach((cell) => {
        grid[cell] = EMPTY;
      });
      total += matches.size;
      cascades += 1;
      settle();
    }

    if (total === 0) {
      if (!fromGarbage) syncBoard();
      return;
    }

    cleared += total;
    score += total * 10 * cascades;

    if (isOnline && !fromGarbage) {
      const attack = Math.max(0, total - MATCH_LENGTH) + (cascades - 1) * 2;
      if (attack > 0) bridge.send({ t: "gb", n: Math.min(attack, COLS) });
    }

    syncBoard();
  }

  function syncBoard() {
    bridge.onScore(score, rivalScore);
    if (isOnline) {
      bridge.send({ t: "bd", g: grid.join(""), s: score });
    }
  }

  function restart() {
    grid = new Array(COLS * ROWS).fill(EMPTY);
    current = null;
    nextColors = randomColors();
    dropInterval = DROP_START_MS;
    dropTimer = 0;
    lockTimer = 0;
    placed = 0;
    score = 0;
    cleared = 0;
    pendingGarbage = 0;
    finished = false;
    paused = false;
    bridge.onStatus("");
    syncBoard();
    spawn();
  }

  function roundedCell(col: number, row: number, color: number, alpha = 1) {
    const x = BOARD_X + col * CELL;
    const y = BOARD_Y + row * CELL;
    graphics.fillStyle(color, alpha);
    graphics.fillRoundedRect(x + 2, y + 2, CELL - 4, CELL - 4, 8);
    graphics.fillStyle(0x0b0b0c, alpha * 0.45);
    graphics.fillCircle(x + CELL / 2, y + CELL / 2, CELL * 0.16);
  }

  function draw() {
    graphics.clear();

    graphics.fillStyle(0x121216, 1);
    graphics.fillRoundedRect(BOARD_X - 8, BOARD_Y - 8, COLS * CELL + 16, ROWS * CELL + 16, 12);

    graphics.lineStyle(1, 0x1f1f24, 1);
    for (let col = 0; col <= COLS; col += 1) {
      graphics.lineBetween(
        BOARD_X + col * CELL,
        BOARD_Y,
        BOARD_X + col * CELL,
        BOARD_Y + ROWS * CELL,
      );
    }
    for (let row = 0; row <= ROWS; row += 1) {
      graphics.lineBetween(
        BOARD_X,
        BOARD_Y + row * CELL,
        BOARD_X + COLS * CELL,
        BOARD_Y + row * CELL,
      );
    }

    for (let row = 0; row < ROWS; row += 1) {
      for (let col = 0; col < COLS; col += 1) {
        const value = grid[index(col, row)];
        if (value !== EMPTY) roundedCell(col, row, PALETTE[value]);
      }
    }

    if (current) {
      // Sombra de aterrizaje: indica dónde caerá la cápsula.
      const ghost = { ...current };
      while (fits({ ...ghost, row: ghost.row + 1 })) ghost.row += 1;
      for (const [col, row, color] of capsuleCells(ghost)) {
        if (row >= 0) roundedCell(col, row, PALETTE[color], 0.18);
      }
      for (const [col, row, color] of capsuleCells(current)) {
        if (row >= 0) roundedCell(col, row, PALETTE[color]);
      }
    }

    const panelX = BOARD_X + COLS * CELL + 26;
    graphics.fillStyle(0x121216, 1);
    graphics.fillRoundedRect(panelX, BOARD_Y, 112, 96, 10);
    graphics.fillStyle(PALETTE[nextColors[0]], 1);
    graphics.fillRoundedRect(panelX + 18, BOARD_Y + 46, CELL - 4, CELL - 4, 8);
    graphics.fillStyle(PALETTE[nextColors[1]], 1);
    graphics.fillRoundedRect(panelX + 18 + CELL, BOARD_Y + 46, CELL - 4, CELL - 4, 8);

    if (pendingGarbage > 0) {
      graphics.fillStyle(0xf59e0b, 1);
      graphics.fillRoundedRect(panelX, BOARD_Y + 190, 112, 34, 10);
    }
  }

  function handleAction(name: string) {
    if (finished || paused) return;
    if (name === "left") move(-1);
    else if (name === "right") move(1);
    else if (name === "rotate") rotate(1);
    else if (name === "rotateBack") rotate(-1);
    else if (name === "drop") hardDrop();
    else if (name === "soft") {
      if (stepDown()) {
        score += 1;
        dropTimer = 0;
      }
    }
  }

  return {
    key: "bloques",

    create(this: any) {
      const scene = this;
      graphics = scene.add.graphics();

      const panelX = BOARD_X + COLS * CELL + 26;

      nextText = scene.add.text(panelX + 10, BOARD_Y + 12, "SIGUIENTE", {
        fontFamily: "Inter, system-ui, sans-serif",
        fontSize: "12px",
        color: "#71717a",
      });

      scoreText = scene.add.text(panelX, BOARD_Y + 120, "", {
        fontFamily: "Inter, system-ui, sans-serif",
        fontSize: "13px",
        color: "#a1a1aa",
        lineSpacing: 6,
      });

      garbageText = scene.add.text(panelX + 10, BOARD_Y + 198, "", {
        fontFamily: "Inter, system-ui, sans-serif",
        fontSize: "13px",
        color: "#0b0b0c",
        fontStyle: "bold",
      });

      cursors = scene.input.keyboard.createCursorKeys();
      keys = scene.input.keyboard.addKeys("Z,X,P,SPACE");

      scene.input.keyboard.on("keydown-UP", () => handleAction("rotate"));
      scene.input.keyboard.on("keydown-X", () => handleAction("rotate"));
      scene.input.keyboard.on("keydown-Z", () => handleAction("rotateBack"));
      scene.input.keyboard.on("keydown-SPACE", () => handleAction("drop"));
      scene.input.keyboard.on("keydown-P", () => {
        if (finished) return;
        paused = !paused;
        bridge.onStatus(paused ? "Partida en pausa. Pulsa P para continuar." : "");
      });

      bridge.registerControls({
        restart,
        setPaused: (value: boolean) => {
          paused = value;
        },
        action: handleAction,
      });

      if (isOnline) {
        unsubscribe = bridge.subscribe((message) => {
          if (message.t === "gb") {
            pendingGarbage += Math.max(0, Math.min(COLS, Number(message.n) || 0));
            bridge.onStatus("Te llegan " + pendingGarbage + " fichas de basura");
            return;
          }
          if (message.t === "bd") {
            rivalScore = Number(message.s) || 0;
            bridge.onScore(score, rivalScore);
            window.dispatchEvent(
              new CustomEvent("gf-bloques-rival", { detail: String(message.g ?? "") }),
            );
            return;
          }
          if (message.t === "over" && !finished) {
            win();
            return;
          }
          if (message.t === "rs") {
            restart();
          }
        });
      }

      scene.events.once("shutdown", () => {
        unsubscribe?.();
        unsubscribe = null;
      });

      restart();
    },

    update(this: any, _time: number, deltaMs: number) {
      const dt = Math.min(deltaMs, 100);

      if (paused || finished) {
        draw();
        return;
      }

      // Movimiento lateral con repetición al mantener pulsado.
      const left = cursors?.left.isDown;
      const right = cursors?.right.isDown;
      const direction = left ? -1 : right ? 1 : 0;

      if (direction !== moveDirection) {
        moveDirection = direction;
        moveRepeating = false;
        moveTimer = 0;
        if (direction !== 0) move(direction);
      } else if (direction !== 0) {
        moveTimer += dt;
        const threshold = moveRepeating ? MOVE_REPEAT_MS : MOVE_DELAY_MS;
        if (moveTimer >= threshold) {
          moveTimer = 0;
          moveRepeating = true;
          move(direction);
        }
      }

      softDrop = Boolean(cursors?.down.isDown);

      if (current) {
        dropTimer += dt;
        const interval = softDrop ? SOFT_DROP_MS : dropInterval;
        if (dropTimer >= interval) {
          dropTimer = 0;
          if (stepDown()) {
            if (softDrop) score += 1;
            lockTimer = 0;
          } else {
            lockTimer += interval;
            if (lockTimer >= LOCK_DELAY_MS) lock();
          }
        }
      }

      scoreText.setText(
        "Puntos\n" +
          score +
          "\n\nFichas\n" +
          cleared +
          (isOnline ? "\n\nRival\n" + rivalScore : ""),
      );
      garbageText.setText(pendingGarbage > 0 ? "+" + pendingGarbage + " basura" : "");

      draw();
    },
  };
}

export const BLOQUES_VIEWPORT = { width: W, height: H, cols: COLS, rows: ROWS };
