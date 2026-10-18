"use client";

import React, { useState, useEffect, useRef, useCallback } from "react";
import { ArrowLeft, RotateCcw, Trophy } from "lucide-react";

interface FlappyBirdProps {
  onBackToHome: () => void;
  targetClueScore?: number;
  onSecretUnlocked?: () => void;
}

interface Pipe {
  x: number;
  topHeight: number;
  passed: boolean;
}

// -----------------------------------------------------------------
// THÔNG SỐ VẬT LÝ FLAPPY BIRD NGUYÊN BẢN CỦA ĐÔNG NGUYỄN:
// - Trọng lực mạnh (GRAVITY 0.32), cú quạt cánh tức thì và dứt khoát (JUMP -5.6)
// - Hitbox thu nhỏ 20% (forgiving hitbox) để tránh ức chế va quẹt viền ảo
// -----------------------------------------------------------------
const GRAVITY = 0.32;
const JUMP = -5.6;
const PIPE_SPEED = 2.0;
const PIPE_SPAWN_INTERVAL = 110;
const PIPE_GAP = 104; // Tăng nhẹ khe hở giữa 2 ống giúp bay mượt hơn
const BIRD_W = 34;
const BIRD_H = 24;
const CANVAS_WIDTH = 340;
const CANVAS_HEIGHT = 480;

export function FlappyBirdApp({
  onBackToHome,
  targetClueScore = 15,
  onSecretUnlocked,
}: FlappyBirdProps) {
  const [gameState, setGameState] = useState<"IDLE" | "PLAYING" | "GAMEOVER">("IDLE");
  const [score, setScore] = useState<number>(0);
  const [bestScore, setBestScore] = useState<number>(34);
  const [clueUnlocked, setClueUnlocked] = useState<boolean>(false);

  // Ref lưu trạng thái trực tiếp để input handler không bị delay 1 frame React state
  const gameStateRef = useRef<"IDLE" | "PLAYING" | "GAMEOVER">("IDLE");
  gameStateRef.current = gameState;

  const canvasRef = useRef<HTMLCanvasElement | null>(null);
  const birdY = useRef<number>(220);
  const birdVelocity = useRef<number>(0);
  const pipes = useRef<Pipe[]>([]);
  const groundOffset = useRef<number>(0);
  const frameCount = useRef<number>(0);
  const wingCycle = useRef<number>(0);
  const animationFrameId = useRef<number | null>(null);
  const audioCtxRef = useRef<AudioContext | null>(null);

  // Khởi tạo AudioContext 1 lần duy nhất ngay từ thao tác người dùng đầu tiên
  const getAudioContext = useCallback(() => {
    if (!audioCtxRef.current) {
      const AudioCtx =
        window.AudioContext ||
        (window as unknown as { webkitAudioContext: typeof AudioContext }).webkitAudioContext;
      if (AudioCtx) {
        audioCtxRef.current = new AudioCtx();
      }
    }
    if (audioCtxRef.current && audioCtxRef.current.state === "suspended") {
      audioCtxRef.current.resume();
    }
    return audioCtxRef.current;
  }, []);

  const playSound = useCallback((type: "jump" | "score" | "hit") => {
    try {
      const ctx = getAudioContext();
      if (!ctx) return;
      const osc = ctx.createOscillator();
      const gain = ctx.createGain();
      osc.connect(gain);
      gain.connect(ctx.destination);

      const now = ctx.currentTime;
      if (type === "jump") {
        osc.type = "sine";
        osc.frequency.setValueAtTime(450, now);
        osc.frequency.exponentialRampToValueAtTime(750, now + 0.08);
        gain.gain.setValueAtTime(0.12, now);
        gain.gain.linearRampToValueAtTime(0.001, now + 0.08);
        osc.start(now);
        osc.stop(now + 0.08);
      } else if (type === "score") {
        osc.type = "sine";
        osc.frequency.setValueAtTime(880, now);
        osc.frequency.setValueAtTime(1320, now + 0.07);
        gain.gain.setValueAtTime(0.15, now);
        gain.gain.linearRampToValueAtTime(0.001, now + 0.18);
        osc.start(now);
        osc.stop(now + 0.18);
      } else if (type === "hit") {
        osc.type = "sawtooth";
        osc.frequency.setValueAtTime(200, now);
        osc.frequency.linearRampToValueAtTime(50, now + 0.2);
        gain.gain.setValueAtTime(0.25, now);
        gain.gain.linearRampToValueAtTime(0.001, now + 0.2);
        osc.start(now);
        osc.stop(now + 0.2);
      }
    } catch {
      // Audio fallback
    }
  }, [getAudioContext]);

  const resetGame = useCallback(() => {
    birdY.current = 220;
    birdVelocity.current = JUMP * 0.8; // Ngay khi bắt đầu có một lực nâng nhẹ
    pipes.current = [];
    frameCount.current = 0;
    setScore(0);
    setGameState("PLAYING");
    gameStateRef.current = "PLAYING";
  }, []);

  // -------------------------------------------------------------
  // XỬ LÝ NHẤN (POINTER DOWN TỨC THÌ - 0ms LATENCY)
  // -------------------------------------------------------------
  const handleAction = useCallback(() => {
    const currentState = gameStateRef.current;
    if (currentState === "IDLE") {
      resetGame();
      playSound("jump");
      return;
    }
    if (currentState === "GAMEOVER") {
      resetGame();
      playSound("jump");
      return;
    }
    // Đang bay: Gán ngay vận tốc hướng lên lập tức (Instant response)
    birdVelocity.current = JUMP;
    playSound("jump");
  }, [resetGame, playSound]);

  // Bắt phím Space / ArrowUp tức thì
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.code === "Space" || e.key === "ArrowUp") {
        e.preventDefault();
        handleAction();
      }
    };
    window.addEventListener("keydown", handleKeyDown);
    return () => window.removeEventListener("keydown", handleKeyDown);
  }, [handleAction]);

  // Main Render & Physics Loop
  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext("2d");
    if (!ctx) return;

    let localScore = score;

    const gameLoop = () => {
      ctx.clearRect(0, 0, CANVAS_WIDTH, CANVAS_HEIGHT);
      frameCount.current++;

      // 1. SKY & CITYSCAPE
      ctx.fillStyle = "#4ec0ca";
      ctx.fillRect(0, 0, CANVAS_WIDTH, CANVAS_HEIGHT);

      // Clouds
      ctx.fillStyle = "rgba(255, 255, 255, 0.75)";
      ctx.beginPath();
      ctx.arc(60, 290, 35, 0, Math.PI * 2);
      ctx.arc(105, 280, 45, 0, Math.PI * 2);
      ctx.arc(150, 290, 35, 0, Math.PI * 2);
      ctx.arc(240, 300, 30, 0, Math.PI * 2);
      ctx.arc(280, 290, 40, 0, Math.PI * 2);
      ctx.arc(315, 300, 30, 0, Math.PI * 2);
      ctx.fill();

      // Skyline
      ctx.fillStyle = "#9de8c2";
      ctx.fillRect(10, 330, 30, 80);
      ctx.fillRect(45, 305, 38, 105);
      ctx.fillRect(90, 340, 25, 70);
      ctx.fillRect(120, 295, 42, 115);
      ctx.fillRect(170, 335, 32, 75);
      ctx.fillRect(210, 310, 40, 100);
      ctx.fillRect(255, 345, 28, 65);
      ctx.fillRect(290, 300, 45, 110);

      // Trees
      ctx.fillStyle = "#83d56b";
      for (let x = 0; x < CANVAS_WIDTH; x += 30) {
        ctx.beginPath();
        ctx.arc(x + 15, 410, 16, Math.PI, 0);
        ctx.fill();
      }

      // 2. PHYSICS & COLLISION
      if (gameStateRef.current === "PLAYING") {
        wingCycle.current = Math.floor((frameCount.current % 18) / 6);
        groundOffset.current = (groundOffset.current + PIPE_SPEED) % 18;

        birdVelocity.current += GRAVITY;
        birdY.current += birdVelocity.current;

        const groundLevel = CANVAS_HEIGHT - 65;

        // Ground check
        if (birdY.current + BIRD_H >= groundLevel) {
          birdY.current = groundLevel - BIRD_H;
          playSound("hit");
          setGameState("GAMEOVER");
          gameStateRef.current = "GAMEOVER";
        }
        // Ceiling check
        if (birdY.current <= 0) {
          birdY.current = 0;
          birdVelocity.current = 0;
        }

        // Spawn Pipes
        if (frameCount.current % PIPE_SPAWN_INTERVAL === 0) {
          const minPipe = 60;
          const maxPipe = groundLevel - PIPE_GAP - minPipe;
          const topHeight = Math.floor(Math.random() * (maxPipe - minPipe)) + minPipe;
          pipes.current.push({
            x: CANVAS_WIDTH,
            topHeight,
            passed: false,
          });
        }

        // Hitbox vị tha (Forgiving Hitbox: thu nhỏ 4px mỗi chiều để chơi sướng tay hơn)
        const hitLeft = 70 + 4;
        const hitRight = 70 + BIRD_W - 6;
        const hitTop = birdY.current + 5;
        const hitBottom = birdY.current + BIRD_H - 5;

        pipes.current.forEach((pipe) => {
          pipe.x -= PIPE_SPEED;

          const pipeW = 52;
          const pLeft = pipe.x;
          const pRight = pipe.x + pipeW;
          const topCapY = pipe.topHeight;
          const bottomCapY = pipe.topHeight + PIPE_GAP;

          // Va chạm ống trên
          if (hitRight > pLeft && hitLeft < pRight && hitTop < topCapY) {
            playSound("hit");
            setGameState("GAMEOVER");
            gameStateRef.current = "GAMEOVER";
          }
          // Va chạm ống dưới
          if (hitRight > pLeft && hitLeft < pRight && hitBottom > bottomCapY) {
            playSound("hit");
            setGameState("GAMEOVER");
            gameStateRef.current = "GAMEOVER";
          }

          // Ăn điểm
          if (!pipe.passed && pipe.x + pipeW < 70) {
            pipe.passed = true;
            localScore += 1;
            setScore(localScore);
            setBestScore((prev) => Math.max(prev, localScore));
            playSound("score");

            if (localScore >= targetClueScore && !clueUnlocked) {
              setClueUnlocked(true);
              if (onSecretUnlocked) onSecretUnlocked();
            }
          }
        });

        pipes.current = pipes.current.filter((p) => p.x + 60 > 0);
      } else if (gameStateRef.current === "IDLE") {
        birdY.current = 220 + Math.sin(frameCount.current * 0.08) * 6;
        wingCycle.current = Math.floor((frameCount.current % 18) / 6);
        groundOffset.current = (groundOffset.current + 1.2) % 18;
      }

      // 3. DRAW PIPES
      pipes.current.forEach((pipe) => {
        const pipeW = 52;
        const capW = 58;
        const capH = 24;
        const capOffset = (capW - pipeW) / 2;

        const drawPipeSegment = (x: number, y: number, w: number, h: number) => {
          ctx.fillStyle = "#73bf2e";
          ctx.fillRect(x, y, w, h);
          ctx.fillStyle = "#9de64e";
          ctx.fillRect(x + 3, y, 7, h);
          ctx.fillStyle = "#558022";
          ctx.fillRect(x + w - 8, y, 8, h);
          ctx.strokeStyle = "#000000";
          ctx.lineWidth = 2.5;
          ctx.strokeRect(x, y, w, h);
        };

        // Top Pipe
        drawPipeSegment(pipe.x, -2, pipeW, pipe.topHeight - capH + 2);
        drawPipeSegment(pipe.x - capOffset, pipe.topHeight - capH, capW, capH);

        // Bottom Pipe
        const bY = pipe.topHeight + PIPE_GAP;
        drawPipeSegment(pipe.x - capOffset, bY, capW, capH);
        drawPipeSegment(pipe.x, bY + capH, pipeW, CANVAS_HEIGHT - 65 - (bY + capH));
      });

      // 4. DRAW GROUND
      const groundY = CANVAS_HEIGHT - 65;
      ctx.fillStyle = "#ded895";
      ctx.fillRect(0, groundY, CANVAS_WIDTH, 65);

      ctx.fillStyle = "#73bf2e";
      ctx.fillRect(0, groundY, CANVAS_WIDTH, 14);
      ctx.fillStyle = "#558022";
      ctx.fillRect(0, groundY + 12, CANVAS_WIDTH, 3);
      ctx.fillStyle = "#9de64e";
      ctx.fillRect(0, groundY, CANVAS_WIDTH, 3);

      ctx.fillStyle = "#cfb769";
      for (let x = -20 - groundOffset.current; x < CANVAS_WIDTH + 20; x += 18) {
        ctx.beginPath();
        ctx.moveTo(x, groundY + 15);
        ctx.lineTo(x + 9, groundY + 15);
        ctx.lineTo(x - 3, groundY + 65);
        ctx.lineTo(x - 12, groundY + 65);
        ctx.fill();
      }

      ctx.strokeStyle = "#000000";
      ctx.lineWidth = 2.5;
      ctx.beginPath();
      ctx.moveTo(0, groundY);
      ctx.lineTo(CANVAS_WIDTH, groundY);
      ctx.stroke();

      // 5. DRAW BIRD
      ctx.save();
      ctx.translate(70 + BIRD_W / 2, birdY.current + BIRD_H / 2);
      let angle = 0;
      if (gameStateRef.current === "PLAYING" || gameStateRef.current === "GAMEOVER") {
        angle = Math.min(Math.max(birdVelocity.current * 4.2, -24), 78);
      }
      ctx.rotate((angle * Math.PI) / 180);

      // Thân
      ctx.fillStyle = "#f8e038";
      ctx.beginPath();
      ctx.ellipse(0, 0, 16, 12, 0, 0, Math.PI * 2);
      ctx.fill();
      ctx.strokeStyle = "#000000";
      ctx.lineWidth = 2;
      ctx.stroke();

      // Cánh
      ctx.fillStyle = "#ffffff";
      ctx.beginPath();
      if (wingCycle.current === 0) {
        ctx.ellipse(-6, -2, 7, 5, -0.3, 0, Math.PI * 2);
      } else if (wingCycle.current === 1) {
        ctx.ellipse(-6, 2, 8, 4, 0, 0, Math.PI * 2);
      } else {
        ctx.ellipse(-6, 6, 7, 5, 0.4, 0, Math.PI * 2);
      }
      ctx.fill();
      ctx.strokeStyle = "#000000";
      ctx.lineWidth = 1.8;
      ctx.stroke();

      // Mắt
      ctx.fillStyle = "#ffffff";
      ctx.beginPath();
      ctx.arc(6, -4, 6, 0, Math.PI * 2);
      ctx.fill();
      ctx.strokeStyle = "#000000";
      ctx.lineWidth = 1.5;
      ctx.stroke();

      // Con ngươi
      ctx.fillStyle = "#000000";
      ctx.beginPath();
      ctx.arc(8, -4, 2.5, 0, Math.PI * 2);
      ctx.fill();

      // Mỏ cam
      ctx.fillStyle = "#f85820";
      ctx.beginPath();
      ctx.moveTo(8, 0);
      ctx.lineTo(19, 2);
      ctx.lineTo(15, 9);
      ctx.lineTo(6, 6);
      ctx.closePath();
      ctx.fill();
      ctx.strokeStyle = "#000000";
      ctx.lineWidth = 1.8;
      ctx.stroke();

      ctx.restore();

      // 6. SCORE DISPLAY
      if (gameStateRef.current === "PLAYING") {
        ctx.font = "900 36px 'Impact', 'Arial Black', sans-serif";
        ctx.textAlign = "center";
        ctx.strokeStyle = "#000000";
        ctx.lineWidth = 5;
        ctx.strokeText(String(localScore), CANVAS_WIDTH / 2, 70);
        ctx.fillStyle = "#ffffff";
        ctx.fillText(String(localScore), CANVAS_WIDTH / 2, 70);
      }

      animationFrameId.current = requestAnimationFrame(gameLoop);
    };

    animationFrameId.current = requestAnimationFrame(gameLoop);
    return () => {
      if (animationFrameId.current) cancelAnimationFrame(animationFrameId.current);
    };
  }, [score, playSound, targetClueScore, clueUnlocked, onSecretUnlocked]);

  return (
    <div
      onPointerDown={(e) => {
        // Chỉ nhận sự kiện click nếu không click vào nút thanh header
        const target = e.target as HTMLElement;
        if (target.closest("button")) return;
        e.preventDefault();
        handleAction();
      }}
      className="flex-1 min-h-0 flex flex-col bg-[#4ec0ca] select-none overflow-hidden font-sans cursor-pointer relative touch-none"
      style={{ touchAction: "none" }}
    >
      {/* Header */}
      <div className="h-10 px-3 bg-[#ded895] border-b-2 border-black flex items-center justify-between shrink-0 z-40">
        <span className="w-8" />
        <div className="font-black text-sm text-[#ea580c] tracking-wider drop-shadow-xs">
          FLAPPY BIRD
        </div>
        <button
          onClick={(e) => {
            e.stopPropagation();
            resetGame();
          }}
          className="p-1 rounded text-zinc-800 hover:text-black active:scale-95"
          title="Chơi lại"
        >
          <RotateCcw className="size-3.5" />
        </button>
      </div>

      {/* Secret Clue Toast */}
      {clueUnlocked && (
        <div className="mx-3 mt-1 px-3 py-1 bg-amber-400 text-amber-950 font-bold text-[11px] rounded shadow-md z-30 text-center animate-bounce border border-amber-600">
          🔓 Đạt 15 điểm! Mở khóa: "FLAP_0814"
        </div>
      )}

      {/* Canvas Viewport */}
      <div className="flex-1 min-h-0 flex items-center justify-center relative p-0 overflow-hidden pointer-events-none">
        <canvas
          ref={canvasRef}
          width={CANVAS_WIDTH}
          height={CANVAS_HEIGHT}
          className="w-full max-w-[340px] h-full max-h-[480px] object-contain"
        />

        {/* 1. MÀN HÌNH CHỜ (GET READY) */}
        {gameState === "IDLE" && (
          <div className="absolute inset-0 flex flex-col items-center justify-center z-30 pb-16 pointer-events-none">
            <div className="font-black text-3xl text-[#ea580c] drop-shadow-[0_2px_4px_rgba(0,0,0,0.5)] tracking-wider mb-6">
              GET READY!
            </div>
            <div className="flex flex-col items-center animate-pulse">
              <div className="size-16 rounded-full bg-white/20 border-2 border-white flex items-center justify-center shadow-lg mb-2">
                <span className="text-3xl">👆</span>
              </div>
              <div className="bg-black/60 px-3 py-1 rounded-full text-white font-bold text-xs">
                Chạm bất kỳ đâu để bay
              </div>
            </div>
          </div>
        )}

        {/* 2. BẢNG GAME OVER */}
        {gameState === "GAMEOVER" && (
          <div className="absolute inset-0 bg-black/40 backdrop-blur-2xs flex flex-col items-center justify-center p-4 z-30 pointer-events-auto">
            <div className="font-black text-3xl text-[#ea580c] drop-shadow-[0_2px_4px_rgba(0,0,0,0.6)] tracking-wide mb-3">
              GAME OVER
            </div>

            <div className="w-[240px] bg-[#ded895] rounded-xl border-4 border-[#558022] p-4 shadow-2xl flex flex-col items-stretch space-y-3">
              <div className="flex items-center justify-between border-b border-black/10 pb-2">
                <div className="flex items-center gap-1.5 text-xs font-bold text-zinc-700">
                  <Trophy className="size-4 text-amber-500" />
                  <span>Huy chương</span>
                </div>
                <div className="text-2xl">
                  {score >= 20 ? "🥇" : score >= 10 ? "🥈" : "🥉"}
                </div>
              </div>

              <div className="flex justify-between items-center text-xs font-bold text-zinc-700">
                <span>Điểm:</span>
                <span className="font-black text-xl text-black font-mono">
                  {score}
                </span>
              </div>

              <div className="flex justify-between items-center text-xs font-bold text-zinc-700">
                <span>Kỷ lục:</span>
                <span className="font-black text-lg text-[#ea580c] font-mono">
                  {bestScore}
                </span>
              </div>
            </div>

            <button
              onClick={(e) => {
                e.stopPropagation();
                resetGame();
              }}
              className="mt-4 px-6 py-2 rounded-xl bg-[#73bf2e] hover:bg-[#62a626] border-2 border-black text-white font-black text-sm shadow-[0_4px_0_#000] active:translate-y-1 active:shadow-none transition-all flex items-center gap-2 cursor-pointer"
            >
              <RotateCcw className="size-4" />
              <span>CHƠI TIẾP</span>
            </button>
          </div>
        )}
      </div>
    </div>
  );
}
export default FlappyBirdApp;
