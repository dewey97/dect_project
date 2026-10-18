"use client";

import React, { useState, useEffect, useRef, useCallback } from "react";
import { ArrowLeft, RotateCcw, Trophy, Play, Pause } from "lucide-react";
import { cn } from "@/lib/utils";

interface SnakeAppProps {
  onBackToHome: () => void;
  targetClueScore?: number; // Điểm số bí mật để mở manh mối
  onSecretUnlocked?: () => void;
}

type Point = { x: number; y: number };
type Direction = "UP" | "DOWN" | "LEFT" | "RIGHT";

const GRID_SIZE = 18;
const INITIAL_SPEED = 140;

export function SnakeApp({
  onBackToHome,
  targetClueScore = 50,
  onSecretUnlocked,
}: SnakeAppProps) {
  const [snake, setSnake] = useState<Point[]>([
    { x: 9, y: 9 },
    { x: 9, y: 10 },
    { x: 9, y: 11 },
  ]);
  const [food, setFood] = useState<Point>({ x: 5, y: 5 });
  const [direction, setDirection] = useState<Direction>("UP");
  const [isPlaying, setIsPlaying] = useState<boolean>(false);
  const [isGameOver, setIsGameOver] = useState<boolean>(false);
  const [score, setScore] = useState<number>(0);
  const [highScore, setHighScore] = useState<number>(140); // Điểm kỷ lục của nạn nhân
  const [clueUnlocked, setClueUnlocked] = useState<boolean>(false);

  const directionRef = useRef<Direction>(direction);
  directionRef.current = direction;

  // Tạo thức ăn ngẫu nhiên
  const generateFood = useCallback((currentSnake: Point[]): Point => {
    while (true) {
      const newFood = {
        x: Math.floor(Math.random() * GRID_SIZE),
        y: Math.floor(Math.random() * GRID_SIZE),
      };
      const collision = currentSnake.some(
        (seg) => seg.x === newFood.x && seg.y === newFood.y
      );
      if (!collision) return newFood;
    }
  }, []);

  // Khởi động lại
  const resetGame = () => {
    const initSnake: Point[] = [
      { x: 9, y: 9 },
      { x: 9, y: 10 },
      { x: 9, y: 11 },
    ];
    setSnake(initSnake);
    setFood(generateFood(initSnake));
    setDirection("UP");
    directionRef.current = "UP";
    setScore(0);
    setIsGameOver(false);
    setIsPlaying(true);
  };

  // Thay đổi hướng đi an toàn
  const changeDirection = (newDir: Direction) => {
    const cur = directionRef.current;
    if (newDir === "UP" && cur !== "DOWN") setDirection("UP");
    if (newDir === "DOWN" && cur !== "UP") setDirection("DOWN");
    if (newDir === "LEFT" && cur !== "RIGHT") setDirection("LEFT");
    if (newDir === "RIGHT" && cur !== "LEFT") setDirection("RIGHT");
  };

  // Vòng lặp game
  useEffect(() => {
    if (!isPlaying || isGameOver) return;

    const moveSnake = () => {
      setSnake((prevSnake) => {
        const head = { ...prevSnake[0] };
        const curDir = directionRef.current;

        if (curDir === "UP") head.y -= 1;
        if (curDir === "DOWN") head.y += 1;
        if (curDir === "LEFT") head.x -= 1;
        if (curDir === "RIGHT") head.x += 1;

        // Va chạm tường
        if (
          head.x < 0 ||
          head.x >= GRID_SIZE ||
          head.y < 0 ||
          head.y >= GRID_SIZE
        ) {
          setIsGameOver(true);
          return prevSnake;
        }

        // Va chạm thân rắn
        if (prevSnake.some((seg) => seg.x === head.x && seg.y === head.y)) {
          setIsGameOver(true);
          return prevSnake;
        }

        const newSnake = [head, ...prevSnake];

        // Ăn mồi
        if (head.x === food.x && head.y === food.y) {
          const newScore = score + 10;
          setScore(newScore);
          if (newScore > highScore) setHighScore(newScore);

          // Kích hoạt bí mật vụ án nếu đạt điểm
          if (newScore >= targetClueScore && !clueUnlocked) {
            setClueUnlocked(true);
            if (onSecretUnlocked) onSecretUnlocked();
          }

          setFood(generateFood(newSnake));
        } else {
          newSnake.pop();
        }

        return newSnake;
      });
    };

    const interval = setInterval(moveSnake, INITIAL_SPEED);
    return () => clearInterval(interval);
  }, [isPlaying, isGameOver, food, score, highScore, generateFood, targetClueScore, clueUnlocked, onSecretUnlocked]);

  // Bắt phím mũi tên từ bàn phím máy tính
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === "ArrowUp") { e.preventDefault(); changeDirection("UP"); }
      if (e.key === "ArrowDown") { e.preventDefault(); changeDirection("DOWN"); }
      if (e.key === "ArrowLeft") { e.preventDefault(); changeDirection("LEFT"); }
      if (e.key === "ArrowRight") { e.preventDefault(); changeDirection("RIGHT"); }
    };
    window.addEventListener("keydown", handleKeyDown);
    return () => window.removeEventListener("keydown", handleKeyDown);
  }, []);

  return (
    <div className="flex-1 min-h-0 flex flex-col bg-[#111827] text-white font-sans select-none overflow-hidden">
      {/* App Header */}
      <div className="h-11 px-3 bg-[#1F2937] border-b border-white/10 flex items-center justify-between shrink-0">
        <span className="w-8" />
        <div className="font-bold text-sm tracking-wide text-emerald-400 font-mono">
          SNAKE '97
        </div>
        <button
          onClick={resetGame}
          className="p-1 rounded text-zinc-400 hover:text-white active:scale-95"
          title="Chơi lại"
        >
          <RotateCcw className="size-3.5" />
        </button>
      </div>

      {/* Scoreboard */}
      <div className="px-4 py-2 bg-emerald-950/40 border-b border-emerald-900/40 flex items-center justify-between text-xs">
        <div className="flex items-center gap-2">
          <span className="text-zinc-400">Điểm:</span>
          <span className="font-mono text-emerald-300 font-bold text-sm">
            {score}
          </span>
        </div>
        <div className="flex items-center gap-1.5 text-zinc-400">
          <Trophy className="size-3 text-amber-400" />
          <span>Kỷ lục nạn nhân:</span>
          <span className="font-mono text-amber-300 font-bold">
            {highScore}
          </span>
        </div>
      </div>

      {/* Secret Clue Toast */}
      {clueUnlocked && (
        <div className="mx-3 mt-2 px-2.5 py-1.5 rounded-lg bg-emerald-500/20 border border-emerald-500/40 text-[11px] text-emerald-300 flex items-center justify-between animate-pulse">
          <span>🔓 Ghi chú bí mật: "Mật khẩu két sắt: 2407"</span>
        </div>
      )}

      {/* Game Board */}
      <div className="flex-1 min-h-0 flex items-center justify-center p-2 relative">
        <div
          className="aspect-square w-full max-w-[280px] bg-[#064E3B]/20 border-2 border-emerald-800/60 rounded-lg relative overflow-hidden grid"
          style={{
            gridTemplateColumns: `repeat(${GRID_SIZE}, minmax(0, 1fr))`,
            gridTemplateRows: `repeat(${GRID_SIZE}, minmax(0, 1fr))`,
          }}
        >
          {/* Rắn */}
          {snake.map((seg, i) => (
            <div
              key={i}
              className={cn(
                "rounded-[2px]",
                i === 0 ? "bg-emerald-400 shadow-sm" : "bg-emerald-500/80"
              )}
              style={{
                gridColumnStart: seg.x + 1,
                gridRowStart: seg.y + 1,
              }}
            />
          ))}

          {/* Mồi */}
          <div
            className="bg-red-400 rounded-full animate-ping shadow-[0_0_8px_rgba(239,68,68,0.8)]"
            style={{
              gridColumnStart: food.x + 1,
              gridRowStart: food.y + 1,
            }}
          />
          <div
            className="bg-red-500 rounded-full"
            style={{
              gridColumnStart: food.x + 1,
              gridRowStart: food.y + 1,
            }}
          />

          {/* Overlay Khi Chưa Bắt Đầu Hoặc Game Over */}
          {(!isPlaying || isGameOver) && (
            <div className="absolute inset-0 bg-black/75 backdrop-blur-xs flex flex-col items-center justify-center p-4 text-center z-10">
              {isGameOver ? (
                <>
                  <div className="text-red-400 font-bold text-base mb-1">
                    GAME OVER
                  </div>
                  <div className="text-xs text-zinc-300 mb-3">
                    Điểm số: <span className="font-bold text-white">{score}</span>
                  </div>
                  <button
                    onClick={resetGame}
                    className="px-4 py-1.5 rounded-full bg-emerald-600 hover:bg-emerald-500 text-white font-medium text-xs flex items-center gap-1.5 active:scale-95 transition-all shadow-md cursor-pointer"
                  >
                    <RotateCcw className="size-3.5" />
                    <span>Chơi lại</span>
                  </button>
                </>
              ) : (
                <>
                  <div className="text-emerald-400 font-bold text-base mb-1">
                    RẮN SĂN MỒI
                  </div>
                  <div className="text-[11px] text-zinc-400 mb-3">
                    Đạt 50 điểm để mở manh mối ẩn
                  </div>
                  <button
                    onClick={resetGame}
                    className="px-4 py-1.5 rounded-full bg-emerald-600 hover:bg-emerald-500 text-white font-medium text-xs flex items-center gap-1.5 active:scale-95 transition-all shadow-md cursor-pointer"
                  >
                    <Play className="size-3.5 fill-current" />
                    <span>Bắt đầu</span>
                  </button>
                </>
              )}
            </div>
          )}
        </div>
      </div>

      {/* D-Pad Controller ảo cho Mobile */}
      <div className="p-3 bg-[#1F2937]/80 border-t border-white/5 flex flex-col items-center justify-center shrink-0">
        <div className="grid grid-cols-3 gap-1.5 w-36">
          <div />
          <button
            onClick={() => changeDirection("UP")}
            className="h-10 rounded-lg bg-zinc-800 hover:bg-zinc-700 active:bg-emerald-600 text-white font-bold flex items-center justify-center shadow-md active:scale-95 transition-all"
          >
            ▲
          </button>
          <div />
          <button
            onClick={() => changeDirection("LEFT")}
            className="h-10 rounded-lg bg-zinc-800 hover:bg-zinc-700 active:bg-emerald-600 text-white font-bold flex items-center justify-center shadow-md active:scale-95 transition-all"
          >
            ◀
          </button>
          <button
            onClick={() => setIsPlaying((p) => !p)}
            className="h-10 rounded-lg bg-zinc-700 hover:bg-zinc-600 active:scale-95 text-xs text-zinc-300 flex items-center justify-center"
            title="Tạm dừng"
          >
            {isPlaying ? <Pause className="size-3.5" /> : <Play className="size-3.5 fill-current" />}
          </button>
          <button
            onClick={() => changeDirection("RIGHT")}
            className="h-10 rounded-lg bg-zinc-800 hover:bg-zinc-700 active:bg-emerald-600 text-white font-bold flex items-center justify-center shadow-md active:scale-95 transition-all"
          >
            ▶
          </button>
          <div />
          <button
            onClick={() => changeDirection("DOWN")}
            className="h-10 rounded-lg bg-zinc-800 hover:bg-zinc-700 active:bg-emerald-600 text-white font-bold flex items-center justify-center shadow-md active:scale-95 transition-all"
          >
            ▼
          </button>
          <div />
        </div>
      </div>
    </div>
  );
}
export default SnakeApp;
