"use client";

import type { GameBridge } from "./types";

/* eslint-disable @typescript-eslint/no-explicit-any */

const W = 960;
const H = 540;

const PADDLE_W = 14;
const PADDLE_H = 92;
const PADDLE_MARGIN = 30;
const PADDLE_SPEED = 620;

const BALL_SIZE = 14;
const BALL_SPEED_START = 400;
const BALL_SPEED_STEP = 26;
const BALL_SPEED_MAX = 980;

/** Ángulo máximo de rebote, como en el arcade: el borde de la pala abre 60°. */
const MAX_BOUNCE_RAD = (60 * Math.PI) / 180;
const WIN_SCORE = 11;

/** Pausa entre punto y saque, en segundos. */
const SERVE_DELAY = 0.9;

/** Frecuencia de sincronización por red. */
const STATE_HZ = 30;
const INPUT_HZ = 40;

const CPU_PROFILE = {
  facil: { speed: 330, reaction: 0.22, error: 46 },
  normal: { speed: 470, reaction: 0.12, error: 26 },
  dificil: { speed: 640, reaction: 0.05, error: 10 },
} as const;

interface Ball {
  x: number;
  y: number;
  vx: number;
  vy: number;
}

/**
 * Pong clásico con simulación autoritativa en el anfitrión: el invitado sólo
 * envía la posición de su pala y recibe el estado del mundo, que interpola para
 * que la bola se vea fluida aunque los paquetes lleguen a 30 Hz.
 */
export function createPoingScene(phaser: any, bridge: GameBridge) {
  const isHost = bridge.role !== "guest";
  const isOnline = bridge.role !== "solo";

  const ball: Ball = { x: W / 2, y: H / 2, vx: 0, vy: 0 };
  /** `left` es siempre el anfitrión, o el jugador local en modo solitario. */
  const paddles = { left: H / 2, right: H / 2 };
  const score = { left: 0, right: 0 };

  let serveTimer = SERVE_DELAY;
  let serveDirection = Math.random() < 0.5 ? -1 : 1;
  let finished = false;
  let paused = false;
  let localTargetY: number | null = null;
  let remoteTargetY = H / 2;
  let cpuTargetY = H / 2;
  let cpuTimer = 0;

  let netAccumulator = 0;
  let inputAccumulator = 0;
  /** Último estado recibido del anfitrión, que el invitado extrapola. */
  const remoteBall: Ball = { x: W / 2, y: H / 2, vx: 0, vy: 0 };

  let graphics: any = null;
  let scoreText: any = null;
  let hintText: any = null;
  let unsubscribe: (() => void) | null = null;
  let keys: any = null;
  let cursors: any = null;

  const cpu = CPU_PROFILE[bridge.difficulty];

  function clampPaddle(value: number) {
    return phaser.Math.Clamp(value, PADDLE_H / 2, H - PADDLE_H / 2);
  }

  function pushScore() {
    bridge.onScore(isHost ? score.left : score.right, isHost ? score.right : score.left);
  }

  function resetBall(direction: number) {
    ball.x = W / 2;
    ball.y = H / 2;
    ball.vx = 0;
    ball.vy = 0;
    serveDirection = direction;
    serveTimer = SERVE_DELAY;
  }

  function serve() {
    const angle = phaser.Math.FloatBetween(-0.35, 0.35);
    ball.vx = Math.cos(angle) * BALL_SPEED_START * serveDirection;
    ball.vy = Math.sin(angle) * BALL_SPEED_START;
  }

  function restart() {
    score.left = 0;
    score.right = 0;
    finished = false;
    paused = false;
    paddles.left = H / 2;
    paddles.right = H / 2;
    resetBall(Math.random() < 0.5 ? -1 : 1);
    pushScore();
    bridge.onStatus("");
    if (isHost && isOnline) bridge.send({ t: "rs" });
  }

  function finish(winnerSide: "left" | "right") {
    finished = true;
    ball.vx = 0;
    ball.vy = 0;
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

  /** Rebote estilo arcade: el punto de impacto decide el ángulo de salida. */
  function bounceOnPaddle(side: "left" | "right") {
    const paddleY = paddles[side];
    const offset = phaser.Math.Clamp((ball.y - paddleY) / (PADDLE_H / 2), -1, 1);
    const speed = Math.min(Math.hypot(ball.vx, ball.vy) + BALL_SPEED_STEP, BALL_SPEED_MAX);
    const angle = offset * MAX_BOUNCE_RAD;
    const direction = side === "left" ? 1 : -1;

    ball.vx = Math.cos(angle) * speed * direction;
    ball.vy = Math.sin(angle) * speed;
    ball.x =
      side === "left"
        ? PADDLE_MARGIN + PADDLE_W + BALL_SIZE / 2
        : W - PADDLE_MARGIN - PADDLE_W - BALL_SIZE / 2;
  }

  function stepPhysics(dt: number) {
    if (serveTimer > 0) {
      serveTimer -= dt;
      if (serveTimer <= 0) serve();
      return;
    }

    ball.x += ball.vx * dt;
    ball.y += ball.vy * dt;

    if (ball.y < BALL_SIZE / 2) {
      ball.y = BALL_SIZE / 2;
      ball.vy = Math.abs(ball.vy);
    } else if (ball.y > H - BALL_SIZE / 2) {
      ball.y = H - BALL_SIZE / 2;
      ball.vy = -Math.abs(ball.vy);
    }

    const leftFace = PADDLE_MARGIN + PADDLE_W;
    const rightFace = W - PADDLE_MARGIN - PADDLE_W;

    if (
      ball.vx < 0 &&
      ball.x - BALL_SIZE / 2 <= leftFace &&
      ball.x > PADDLE_MARGIN - BALL_SIZE &&
      Math.abs(ball.y - paddles.left) <= PADDLE_H / 2 + BALL_SIZE / 2
    ) {
      bounceOnPaddle("left");
    } else if (
      ball.vx > 0 &&
      ball.x + BALL_SIZE / 2 >= rightFace &&
      ball.x < W - PADDLE_MARGIN + BALL_SIZE &&
      Math.abs(ball.y - paddles.right) <= PADDLE_H / 2 + BALL_SIZE / 2
    ) {
      bounceOnPaddle("right");
    }

    if (ball.x < -BALL_SIZE) {
      score.right += 1;
      pushScore();
      if (score.right >= WIN_SCORE) finish("right");
      else resetBall(1);
    } else if (ball.x > W + BALL_SIZE) {
      score.left += 1;
      pushScore();
      if (score.left >= WIN_SCORE) finish("left");
      else resetBall(-1);
    }
  }

  function updateCpu(dt: number) {
    cpuTimer -= dt;
    if (cpuTimer <= 0) {
      cpuTimer = cpu.reaction;
      cpuTargetY = ball.vx > 0 ? ball.y + phaser.Math.Between(-cpu.error, cpu.error) : H / 2;
    }
    const delta = cpuTargetY - paddles.right;
    const step = Math.sign(delta) * Math.min(Math.abs(delta), cpu.speed * dt);
    paddles.right = clampPaddle(paddles.right + step);
  }

  function readLocalInput(dt: number, side: "left" | "right") {
    const up = cursors?.up.isDown || keys?.W.isDown;
    const down = cursors?.down.isDown || keys?.S.isDown;

    if (up || down) {
      localTargetY = null;
      paddles[side] = clampPaddle(paddles[side] + (down ? 1 : -1) * PADDLE_SPEED * dt);
      return;
    }

    if (localTargetY !== null) {
      paddles[side] = clampPaddle(localTargetY);
    }
  }

  function draw(accent: number) {
    graphics.clear();

    graphics.fillStyle(0x1c1c22, 1);
    for (let y = 10; y < H; y += 32) {
      graphics.fillRect(W / 2 - 3, y, 6, 18);
    }

    graphics.fillStyle(accent, 1);
    graphics.fillRect(PADDLE_MARGIN, paddles.left - PADDLE_H / 2, PADDLE_W, PADDLE_H);
    graphics.fillRect(W - PADDLE_MARGIN - PADDLE_W, paddles.right - PADDLE_H / 2, PADDLE_W, PADDLE_H);

    graphics.fillStyle(0xf4f4f5, 1);
    graphics.fillRect(ball.x - BALL_SIZE / 2, ball.y - BALL_SIZE / 2, BALL_SIZE, BALL_SIZE);
  }

  return {
    key: "poing",

    create(this: any) {
      const scene = this;
      graphics = scene.add.graphics();

      scoreText = scene.add
        .text(W / 2, 30, "0   0", {
          fontFamily: "Inter, system-ui, sans-serif",
          fontSize: "40px",
          color: "#71717a",
        })
        .setOrigin(0.5, 0);

      hintText = scene.add
        .text(W / 2, H - 26, "", {
          fontFamily: "Inter, system-ui, sans-serif",
          fontSize: "17px",
          color: "#71717a",
        })
        .setOrigin(0.5, 1);

      cursors = scene.input.keyboard.createCursorKeys();
      keys = scene.input.keyboard.addKeys("W,S,P");
      scene.input.keyboard.on("keydown-P", () => {
        if (finished) return;
        paused = !paused;
        bridge.onStatus(paused ? "Partida en pausa. Pulsa P para continuar." : "");
      });

      scene.input.on("pointermove", (pointer: any) => {
        localTargetY = pointer.y;
      });
      scene.input.on("pointerdown", (pointer: any) => {
        localTargetY = pointer.y;
      });

      bridge.registerControls({
        restart,
        setPaused: (value: boolean) => {
          paused = value;
        },
      });

      if (isOnline) {
        unsubscribe = bridge.subscribe((message) => {
          if (message.t === "p" && isHost) {
            remoteTargetY = clampPaddle(Number(message.y) || H / 2);
            return;
          }
          if (message.t === "s" && !isHost) {
            remoteBall.x = Number(message.bx);
            remoteBall.y = Number(message.by);
            remoteBall.vx = Number(message.vx);
            remoteBall.vy = Number(message.vy);
            paddles.left = Number(message.ly);
            score.left = Number(message.sl);
            score.right = Number(message.sr);
            serveTimer = Number(message.sv);
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

      resetBall(serveDirection);
      pushScore();
      hintText.setText(
        isOnline ? "Mueve la pala con el ratón o con W / S" : "Ratón o W / S · P para pausar",
      );
    },

    update(this: any, _time: number, deltaMs: number) {
      const dt = Math.min(deltaMs, 50) / 1000;
      const accent = 0x22d3ee;

      if (paused || finished) {
        draw(accent);
        return;
      }

      if (isHost) {
        readLocalInput(dt, "left");

        if (bridge.role === "solo") {
          updateCpu(dt);
        } else {
          paddles.right = remoteTargetY;
        }

        // Subpasos fijos: con la bola a 980 px/s evita que atraviese una pala.
        let remaining = dt;
        while (remaining > 0) {
          const step = Math.min(remaining, 1 / 240);
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
              bx: Math.round(ball.x * 10) / 10,
              by: Math.round(ball.y * 10) / 10,
              vx: Math.round(ball.vx),
              vy: Math.round(ball.vy),
              ly: Math.round(paddles.left),
              sl: score.left,
              sr: score.right,
              sv: Math.round(serveTimer * 100) / 100,
            });
          }
          if (finished) {
            bridge.send({ t: "go", w: score.left >= WIN_SCORE ? "left" : "right" });
          }
        }
      } else {
        readLocalInput(dt, "right");

        // Extrapolación más corrección suave hacia el estado del anfitrión.
        remoteBall.x += remoteBall.vx * dt;
        remoteBall.y += remoteBall.vy * dt;
        ball.x += (remoteBall.x - ball.x) * Math.min(1, dt * 14);
        ball.y += (remoteBall.y - ball.y) * Math.min(1, dt * 14);

        inputAccumulator += dt;
        if (inputAccumulator >= 1 / INPUT_HZ) {
          inputAccumulator = 0;
          bridge.send({ t: "p", y: Math.round(paddles.right) });
        }
      }

      const local = isHost ? score.left : score.right;
      const rival = isHost ? score.right : score.left;
      scoreText.setText(local + "   " + rival);

      draw(accent);
    },
  };
}
