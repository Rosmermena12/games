"use client";

import type { GameBridge } from "./types";

/* eslint-disable @typescript-eslint/no-explicit-any */

const W = 960;
const H = 540;

/** Grosor de la banda: el disco rebota contra su cara interior. */
const WALL = 16;

/** El disco es grande y pesado; el mazo es sensiblemente más pequeño. */
const PUCK_R = 30;
const MALLET_R = 34;

/**
 * La portería está sólo en el centro de cada fondo y es más ancha que el mazo,
 * como en una mesa real: se puede defender con el cuerpo del mazo, pero no
 * taparla entera.
 */
const GOAL_H = 176;

const PUCK_MAX_SPEED = 1500;
const PUCK_MIN_SPEED = 30;
/** Rozamiento del aire de la mesa: fracción de velocidad conservada por segundo. */
const PUCK_FRICTION = 0.55;
const WALL_RESTITUTION = 0.94;
const MALLET_RESTITUTION = 0.96;
const MALLET_MAX_SPEED = 2400;

const WIN_SCORE = 7;
const FACEOFF_DELAY = 0.8;

const STATE_HZ = 40;
const INPUT_HZ = 50;

const CPU_PROFILE = {
  facil: { speed: 620, aggression: 0.55, error: 60 },
  normal: { speed: 900, aggression: 0.78, error: 34 },
  dificil: { speed: 1250, aggression: 0.95, error: 14 },
} as const;

interface Vec {
  x: number;
  y: number;
}

interface Mallet extends Vec {
  vx: number;
  vy: number;
  targetX: number;
  targetY: number;
}

/**
 * Air hockey con simulación a paso fijo de 1/240 s. El mazo es cinemático: se
 * mueve hacia el puntero a velocidad limitada y transfiere su propia velocidad
 * al disco, que es lo que da la sensación de golpe seco de una mesa real.
 */
export function createHockeyScene(phaser: any, bridge: GameBridge) {
  const isHost = bridge.role !== "guest";
  const isOnline = bridge.role !== "solo";

  const puck = { x: W / 2, y: H / 2, vx: 0, vy: 0 };
  const left: Mallet = { x: 150, y: H / 2, vx: 0, vy: 0, targetX: 150, targetY: H / 2 };
  const right: Mallet = { x: W - 150, y: H / 2, vx: 0, vy: 0, targetX: W - 150, targetY: H / 2 };
  const score = { left: 0, right: 0 };

  let faceoffTimer = FACEOFF_DELAY;
  let finished = false;
  let paused = false;
  let netAccumulator = 0;
  let inputAccumulator = 0;
  let cpuTimer = 0;
  let cpuNoise = 0;
  /** Lado hacia el que se pone en juego el disco tras un gol. */
  let puckServeDirection = 1;

  const remotePuck = { x: W / 2, y: H / 2, vx: 0, vy: 0 };
  const remoteMallet = { x: 150, y: H / 2 };

  let graphics: any = null;
  let scoreText: any = null;
  let hintText: any = null;
  let unsubscribe: (() => void) | null = null;
  let keys: any = null;

  const cpu = CPU_PROFILE[bridge.difficulty];

  const minY = WALL + MALLET_R;
  const maxY = H - WALL - MALLET_R;
  const goalTop = H / 2 - GOAL_H / 2;
  const goalBottom = H / 2 + GOAL_H / 2;

  function pushScore() {
    bridge.onScore(isHost ? score.left : score.right, isHost ? score.right : score.left);
  }

  function faceoff(towards: number) {
    puck.x = W / 2;
    puck.y = H / 2;
    puck.vx = 0;
    puck.vy = 0;
    faceoffTimer = FACEOFF_DELAY;
    puckServeDirection = towards;
  }

  function restart() {
    score.left = 0;
    score.right = 0;
    finished = false;
    paused = false;
    left.x = 150;
    left.y = H / 2;
    right.x = W - 150;
    right.y = H / 2;
    faceoff(Math.random() < 0.5 ? -1 : 1);
    pushScore();
    bridge.onStatus("");
    if (isHost && isOnline) bridge.send({ t: "rs" });
  }

  function finish(winnerSide: "left" | "right") {
    finished = true;
    puck.vx = 0;
    puck.vy = 0;
    const localSide = isHost ? "left" : "right";
    const localScore = score[localSide];
    const rivalScore = localSide === "left" ? score.right : score.left;
    bridge.onGameOver({
      outcome: winnerSide === localSide ? "win" : "lose",
      label:
        winnerSide === localSide
          ? "Ganas " + localScore + " a " + rivalScore
          : "Pierdes " + localScore + " a " + rivalScore,
    });
  }

  /** Mueve un mazo hacia su objetivo respetando su mitad de la mesa. */
  function moveMallet(mallet: Mallet, side: "left" | "right", dt: number) {
    const minX = side === "left" ? WALL + MALLET_R : W / 2 + MALLET_R;
    const maxX = side === "left" ? W / 2 - MALLET_R : W - WALL - MALLET_R;

    const targetX = phaser.Math.Clamp(mallet.targetX, minX, maxX);
    const targetY = phaser.Math.Clamp(mallet.targetY, minY, maxY);

    const dx = targetX - mallet.x;
    const dy = targetY - mallet.y;
    const distance = Math.hypot(dx, dy);
    const maxStep = MALLET_MAX_SPEED * dt;

    const previousX = mallet.x;
    const previousY = mallet.y;

    if (distance > maxStep && distance > 0) {
      mallet.x += (dx / distance) * maxStep;
      mallet.y += (dy / distance) * maxStep;
    } else {
      mallet.x = targetX;
      mallet.y = targetY;
    }

    mallet.vx = dt > 0 ? (mallet.x - previousX) / dt : 0;
    mallet.vy = dt > 0 ? (mallet.y - previousY) / dt : 0;
  }

  function collidePuckWithMallet(mallet: Mallet) {
    const dx = puck.x - mallet.x;
    const dy = puck.y - mallet.y;
    const distance = Math.hypot(dx, dy);
    const minDistance = PUCK_R + MALLET_R;

    if (distance >= minDistance || distance === 0) return;

    const nx = dx / distance;
    const ny = dy / distance;

    // Se saca el disco del mazo para que no quede atrapado dentro.
    puck.x = mallet.x + nx * minDistance;
    puck.y = mallet.y + ny * minDistance;

    const relativeVx = puck.vx - mallet.vx;
    const relativeVy = puck.vy - mallet.vy;
    const normalSpeed = relativeVx * nx + relativeVy * ny;

    if (normalSpeed > 0) return;

    const impulse = -(1 + MALLET_RESTITUTION) * normalSpeed;
    puck.vx += impulse * nx;
    puck.vy += impulse * ny;

    // Golpe mínimo: evita que el disco se quede muerto pegado al mazo.
    const speed = Math.hypot(puck.vx, puck.vy);
    if (speed < 260) {
      puck.vx = nx * 260;
      puck.vy = ny * 260;
    }
  }

  function stepPhysics(dt: number) {
    if (faceoffTimer > 0) {
      faceoffTimer -= dt;
      if (faceoffTimer <= 0) {
        const angle = phaser.Math.FloatBetween(-0.5, 0.5);
        puck.vx = Math.cos(angle) * 520 * puckServeDirection;
        puck.vy = Math.sin(angle) * 520;
      }
      return;
    }

    puck.x += puck.vx * dt;
    puck.y += puck.vy * dt;

    // Rozamiento exponencial: frena rápido al principio y luego se desliza.
    const decay = Math.pow(PUCK_FRICTION, dt);
    puck.vx *= decay;
    puck.vy *= decay;

    const speed = Math.hypot(puck.vx, puck.vy);
    if (speed > PUCK_MAX_SPEED) {
      puck.vx = (puck.vx / speed) * PUCK_MAX_SPEED;
      puck.vy = (puck.vy / speed) * PUCK_MAX_SPEED;
    } else if (speed < PUCK_MIN_SPEED) {
      puck.vx = 0;
      puck.vy = 0;
    }

    if (puck.y < WALL + PUCK_R) {
      puck.y = WALL + PUCK_R;
      puck.vy = Math.abs(puck.vy) * WALL_RESTITUTION;
    } else if (puck.y > H - WALL - PUCK_R) {
      puck.y = H - WALL - PUCK_R;
      puck.vy = -Math.abs(puck.vy) * WALL_RESTITUTION;
    }

    const inGoalMouth = puck.y > goalTop && puck.y < goalBottom;

    if (puck.x < WALL + PUCK_R) {
      if (inGoalMouth) {
        if (puck.x < -PUCK_R) {
          score.right += 1;
          pushScore();
          if (score.right >= WIN_SCORE) finish("right");
          else faceoff(-1);
          return;
        }
      } else {
        puck.x = WALL + PUCK_R;
        puck.vx = Math.abs(puck.vx) * WALL_RESTITUTION;
      }
    } else if (puck.x > W - WALL - PUCK_R) {
      if (inGoalMouth) {
        if (puck.x > W + PUCK_R) {
          score.left += 1;
          pushScore();
          if (score.left >= WIN_SCORE) finish("left");
          else faceoff(1);
          return;
        }
      } else {
        puck.x = W - WALL - PUCK_R;
        puck.vx = -Math.abs(puck.vx) * WALL_RESTITUTION;
      }
    }

    collidePuckWithMallet(left);
    collidePuckWithMallet(right);
  }

  function updateCpu(dt: number) {
    cpuTimer -= dt;
    if (cpuTimer <= 0) {
      cpuTimer = 0.08;
      cpuNoise = phaser.Math.Between(-cpu.error, cpu.error);
    }

    const puckInCpuHalf = puck.x > W / 2 - 40;
    const defendX = W - 150;

    if (puckInCpuHalf && puck.vx >= -40) {
      // Ataca: se coloca detrás del disco para empujarlo hacia la portería.
      right.targetX = puck.x + PUCK_R * cpu.aggression;
      right.targetY = puck.y + cpuNoise;
    } else {
      // Defiende: sigue la altura del disco pegado a su línea de fondo.
      right.targetX = defendX;
      right.targetY = phaser.Math.Clamp(puck.y + cpuNoise, goalTop, goalBottom);
    }

    const dx = right.targetX - right.x;
    const dy = right.targetY - right.y;
    const distance = Math.hypot(dx, dy);
    const step = Math.min(distance, cpu.speed * dt);

    if (distance > 0) {
      right.targetX = right.x + (dx / distance) * step;
      right.targetY = right.y + (dy / distance) * step;
    }

    moveMallet(right, "right", dt);
  }

  function drawRink(accent: number) {
    graphics.clear();

    graphics.fillStyle(0x101014, 1);
    graphics.fillRect(0, 0, W, H);

    graphics.fillStyle(0x17171c, 1);
    graphics.fillRect(WALL, WALL, W - WALL * 2, H - WALL * 2);

    graphics.lineStyle(3, 0x27272a, 1);
    graphics.strokeRect(WALL, WALL, W - WALL * 2, H - WALL * 2);
    graphics.lineBetween(W / 2, WALL, W / 2, H - WALL);
    graphics.strokeCircle(W / 2, H / 2, 86);

    // Boca de portería: el hueco por el que sí entra el disco.
    graphics.lineStyle(WALL, accent, 0.75);
    graphics.lineBetween(WALL / 2, goalTop, WALL / 2, goalBottom);
    graphics.lineBetween(W - WALL / 2, goalTop, W - WALL / 2, goalBottom);

    graphics.fillStyle(accent, 1);
    graphics.fillCircle(left.x, left.y, MALLET_R);
    graphics.fillStyle(0x101014, 1);
    graphics.fillCircle(left.x, left.y, MALLET_R * 0.45);

    graphics.fillStyle(0xe879f9, 1);
    graphics.fillCircle(right.x, right.y, MALLET_R);
    graphics.fillStyle(0x101014, 1);
    graphics.fillCircle(right.x, right.y, MALLET_R * 0.45);

    graphics.fillStyle(0xf4f4f5, 1);
    graphics.fillCircle(puck.x, puck.y, PUCK_R);
    graphics.fillStyle(0xd4d4d8, 1);
    graphics.fillCircle(puck.x, puck.y, PUCK_R * 0.62);
  }

  return {
    key: "hockey",

    create(this: any) {
      const scene = this;
      graphics = scene.add.graphics();

      scoreText = scene.add
        .text(W / 2, 28, "0   0", {
          fontFamily: "Inter, system-ui, sans-serif",
          fontSize: "34px",
          color: "#71717a",
        })
        .setOrigin(0.5, 0);

      hintText = scene.add
        .text(W / 2, H - 24, "", {
          fontFamily: "Inter, system-ui, sans-serif",
          fontSize: "16px",
          color: "#71717a",
        })
        .setOrigin(0.5, 1);

      keys = scene.input.keyboard.addKeys("P");
      scene.input.keyboard.on("keydown-P", () => {
        if (finished) return;
        paused = !paused;
        bridge.onStatus(paused ? "Partida en pausa. Pulsa P para continuar." : "");
      });

      const localMallet = isHost ? left : right;
      const aim = (pointer: any) => {
        localMallet.targetX = pointer.x;
        localMallet.targetY = pointer.y;
      };
      scene.input.on("pointermove", aim);
      scene.input.on("pointerdown", aim);

      bridge.registerControls({
        restart,
        setPaused: (value: boolean) => {
          paused = value;
        },
      });

      if (isOnline) {
        unsubscribe = bridge.subscribe((message) => {
          if (message.t === "m" && isHost) {
            right.targetX = Number(message.x);
            right.targetY = Number(message.y);
            return;
          }
          if (message.t === "s" && !isHost) {
            remotePuck.x = Number(message.px);
            remotePuck.y = Number(message.py);
            remotePuck.vx = Number(message.vx);
            remotePuck.vy = Number(message.vy);
            remoteMallet.x = Number(message.mx);
            remoteMallet.y = Number(message.my);
            score.left = Number(message.sl);
            score.right = Number(message.sr);
            faceoffTimer = Number(message.fo);
            pushScore();
            return;
          }
          if (message.t === "go" && !isHost) {
            finished = true;
            const winnerIsGuest = message.w === "right";
            bridge.onGameOver({
              outcome: winnerIsGuest ? "win" : "lose",
              label: winnerIsGuest
                ? "Ganas " + score.right + " a " + score.left
                : "Pierdes " + score.right + " a " + score.left,
            });
            return;
          }
          if (message.t === "rs" && !isHost) {
            score.left = 0;
            score.right = 0;
            finished = false;
            pushScore();
            bridge.onStatus("");
          }
        });
      }

      scene.events.once("shutdown", () => {
        unsubscribe?.();
        unsubscribe = null;
      });

      faceoff(Math.random() < 0.5 ? -1 : 1);
      pushScore();
      hintText.setText(
        "Mueve el mazo con el ratón o el dedo · sólo se marca por el hueco central",
      );
    },

    update(this: any, _time: number, deltaMs: number) {
      const dt = Math.min(deltaMs, 50) / 1000;
      const accent = 0x22d3ee;

      if (paused || finished) {
        drawRink(accent);
        return;
      }

      if (isHost) {
        let remaining = dt;
        while (remaining > 0) {
          const step = Math.min(remaining, 1 / 240);
          moveMallet(left, "left", step);
          if (bridge.role === "solo") updateCpu(step);
          else moveMallet(right, "right", step);
          stepPhysics(step);
          remaining -= step;
          if (finished) break;
        }

        if (isOnline) {
          netAccumulator += dt;
          if (netAccumulator >= 1 / STATE_HZ) {
            netAccumulator = 0;
            bridge.send({
              t: "s",
              px: Math.round(puck.x * 10) / 10,
              py: Math.round(puck.y * 10) / 10,
              vx: Math.round(puck.vx),
              vy: Math.round(puck.vy),
              mx: Math.round(left.x),
              my: Math.round(left.y),
              sl: score.left,
              sr: score.right,
              fo: Math.round(faceoffTimer * 100) / 100,
            });
          }
          if (finished) {
            bridge.send({ t: "go", w: score.left >= WIN_SCORE ? "left" : "right" });
          }
        }
      } else {
        // El invitado simula su propio mazo y sólo interpola disco y rival.
        let remaining = dt;
        while (remaining > 0) {
          const step = Math.min(remaining, 1 / 240);
          moveMallet(right, "right", step);
          remaining -= step;
        }

        remotePuck.x += remotePuck.vx * dt;
        remotePuck.y += remotePuck.vy * dt;
        const blend = Math.min(1, dt * 16);
        puck.x += (remotePuck.x - puck.x) * blend;
        puck.y += (remotePuck.y - puck.y) * blend;
        left.x += (remoteMallet.x - left.x) * blend;
        left.y += (remoteMallet.y - left.y) * blend;

        inputAccumulator += dt;
        if (inputAccumulator >= 1 / INPUT_HZ) {
          inputAccumulator = 0;
          bridge.send({ t: "m", x: Math.round(right.targetX), y: Math.round(right.targetY) });
        }
      }

      const local = isHost ? score.left : score.right;
      const rival = isHost ? score.right : score.left;
      scoreText.setText(local + "   " + rival);

      drawRink(accent);
    },
  };
}
