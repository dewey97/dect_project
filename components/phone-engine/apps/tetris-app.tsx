"use client";

import React, { useState, useEffect, useRef, useCallback } from "react";
import { RotateCcw, Play } from "lucide-react";
import { cn } from "@/lib/utils";

interface TetrisProps {
  onBackToHome?: () => void;
  targetClueLines?: number;
  onSecretUnlocked?: () => void;
}

const ROWS = 20;
const COLS = 10;

// Các khối hình gạch kinh điển
const TETROMINOES = {
  I: { shape: [[1, 1, 1, 1]], color: "bg-cyan-500" },
  O: { shape: [[1, 1], [1, 1]], color: "bg-yellow-400" },
  T: { shape: [[0, 1, 0], [1, 1, 1]], color: "bg-purple-500" },
  S: { shape: [[0, 1, 1], [1, 1, 0]], color: "bg-emerald-500" },
  Z: { shape: [[1, 1, 0], [0, 1, 1]], color: "bg-rose-500" },
  J: { shape: [[1, 0, 0], [1, 1, 1]], color: "bg-blue-500" },
  L: { shape: [[0, 0, 1], [1, 1, 1]], color: "bg-amber-500" },
};

type TetrominoKey = keyof typeof TETROMINOES;

interface PieceItem {
  shape: number[][];
  color: string;
  x: number;
  y: number;
}

export function TetrisApp({
  targetClueLines = 4,
  onSecretUnlocked,
}: TetrisProps) {
  const [board, setBoard] = useState<string[][]>(() =>
    Array.from({ length: ROWS }, () => Array(COLS).fill(""))
  );
  const [currentPiece, setCurrentPiece] = useState<PieceItem | null>(null);
  const [nextPiece, setNextPiece] = useState<PieceItem | null>(null);

  const [score, setScore] = useState<number>(0);
  const [lines, setLines] = useState<number>(0);
  const [isPlaying, setIsPlaying] = useState<boolean>(false);
  const [isGameOver, setIsGameOver] = useState<boolean>(false);
  const [clueUnlocked, setClueUnlocked] = useState<boolean>(false);

  const boardRef = useRef(board);
  boardRef.current = board;
  const currentPieceRef = useRef(currentPiece);
  currentPieceRef.current = currentPiece;
  const nextPieceRef = useRef(nextPiece);
  nextPieceRef.current = nextPiece;

  // Tạo ngẫu nhiên một khối gạch mới
  const createRandomPiece = useCallback((): PieceItem => {
    const keys = Object.keys(TETROMINOES) as TetrominoKey[];
    const randomKey = keys[Math.floor(Math.random() * keys.length)];
    const item = TETROMINOES[randomKey];

    return {
      shape: item.shape,
      color: item.color,
      x: Math.floor(COLS / 2) - Math.floor(item.shape[0].length / 2),
      y: 0,
    };
  }, []);

  // Đưa khối Next vào Current, và sinh khối Next tiếp theo
  const spawnPiece = useCallback(() => {
    const incomingPiece = nextPieceRef.current || createRandomPiece();
    const futurePiece = createRandomPiece();

    // Kiểm tra đụng nóc (Game Over)
    for (let r = 0; r < incomingPiece.shape.length; r++) {
      for (let c = 0; c < incomingPiece.shape[r].length; c++) {
        if (
          incomingPiece.shape[r][c] &&
          boardRef.current[incomingPiece.y + r]?.[incomingPiece.x + c]
        ) {
          setIsGameOver(true);
          setIsPlaying(false);
          return null;
        }
      }
    }

    setCurrentPiece(incomingPiece);
    setNextPiece(futurePiece);
    nextPieceRef.current = futurePiece;
    return incomingPiece;
  }, [createRandomPiece]);

  const resetGame = () => {
    setBoard(Array.from({ length: ROWS }, () => Array(COLS).fill("")));
    setScore(0);
    setLines(0);
    setIsGameOver(false);
    setIsPlaying(true);

    const first = createRandomPiece();
    const second = createRandomPiece();
    setCurrentPiece(first);
    setNextPiece(second);
    nextPieceRef.current = second;
  };

  // Kiểm tra va chạm
  const checkCollision = (
    shape: number[][],
    offsetPos: { x: number; y: number },
    curBoard: string[][]
  ) => {
    for (let r = 0; r < shape.length; r++) {
      for (let c = 0; c < shape[r].length; c++) {
        if (shape[r][c]) {
          const targetX = offsetPos.x + c;
          const targetY = offsetPos.y + r;

          if (
            targetX < 0 ||
            targetX >= COLS ||
            targetY >= ROWS ||
            (targetY >= 0 && curBoard[targetY][targetX])
          ) {
            return true;
          }
        }
      }
    }
    return false;
  };

  // Cố định khối gạch & xóa hàng kín
  const lockPiece = useCallback(() => {
    const piece = currentPieceRef.current;
    if (!piece) return;

    const newBoard = boardRef.current.map((row) => [...row]);

    piece.shape.forEach((row, r) => {
      row.forEach((cell, c) => {
        if (cell) {
          const targetY = piece.y + r;
          const targetX = piece.x + c;
          if (targetY >= 0 && targetY < ROWS && targetX >= 0 && targetX < COLS) {
            newBoard[targetY][targetX] = piece.color;
          }
        }
      });
    });

    let clearedLines = 0;
    const filteredBoard = newBoard.filter((row) => {
      const isFull = row.every((c) => c !== "");
      if (isFull) clearedLines++;
      return !isFull;
    });

    while (filteredBoard.length < ROWS) {
      filteredBoard.unshift(Array(COLS).fill(""));
    }

    if (clearedLines > 0) {
      const pts = clearedLines === 4 ? 800 : clearedLines * 100;
      setScore((s) => s + pts);
      setLines((l) => {
        const nextLines = l + clearedLines;
        if (nextLines >= targetClueLines && !clueUnlocked) {
          setClueUnlocked(true);
          if (onSecretUnlocked) onSecretUnlocked();
        }
        return nextLines;
      });
    }

    setBoard(filteredBoard);
    spawnPiece();
  }, [spawnPiece, targetClueLines, clueUnlocked, onSecretUnlocked]);

  // Di chuyển ngang
  const moveHorizontal = useCallback((dir: -1 | 1) => {
    const piece = currentPieceRef.current;
    if (!piece || !isPlaying || isGameOver) return;
    if (!checkCollision(piece.shape, { x: piece.x + dir, y: piece.y }, boardRef.current)) {
      setCurrentPiece({ ...piece, x: piece.x + dir });
    }
  }, [isPlaying, isGameOver]);

  // Rơi xuống 1 ô
  const moveDown = useCallback(() => {
    const piece = currentPieceRef.current;
    if (!piece || !isPlaying || isGameOver) return;
    if (!checkCollision(piece.shape, { x: piece.x, y: piece.y + 1 }, boardRef.current)) {
      setCurrentPiece({ ...piece, y: piece.y + 1 });
    } else {
      lockPiece();
    }
  }, [isPlaying, isGameOver, lockPiece]);

  // Xoay khối gạch
  const rotatePiece = useCallback(() => {
    const piece = currentPieceRef.current;
    if (!piece || !isPlaying || isGameOver) return;
    const rotated = piece.shape[0].map((_, index) =>
      piece.shape.map((row) => row[index]).reverse()
    );
    if (!checkCollision(rotated, { x: piece.x, y: piece.y }, boardRef.current)) {
      setCurrentPiece({ ...piece, shape: rotated });
    }
  }, [isPlaying, isGameOver]);

  // Thả rơi tức thì (Hard Drop)
  const hardDrop = useCallback(() => {
    const piece = currentPieceRef.current;
    if (!piece || !isPlaying || isGameOver) return;
    let newY = piece.y;
    while (!checkCollision(piece.shape, { x: piece.x, y: newY + 1 }, boardRef.current)) {
      newY++;
    }
    currentPieceRef.current = { ...piece, y: newY };
    lockPiece();
  }, [isPlaying, isGameOver, lockPiece]);

  // Game Loop
  useEffect(() => {
    if (!isPlaying || isGameOver) return;
    const timer = setInterval(moveDown, 700);
    return () => clearInterval(timer);
  }, [isPlaying, isGameOver, moveDown]);

  // Bắt phím bàn phím máy tính
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === "ArrowLeft") { e.preventDefault(); moveHorizontal(-1); }
      if (e.key === "ArrowRight") { e.preventDefault(); moveHorizontal(1); }
      if (e.key === "ArrowDown") { e.preventDefault(); moveDown(); }
      if (e.key === "ArrowUp") { e.preventDefault(); rotatePiece(); }
      if (e.code === "Space") { e.preventDefault(); hardDrop(); }
    };
    window.addEventListener("keydown", handleKeyDown);
    return () => window.removeEventListener("keydown", handleKeyDown);
  }, [moveHorizontal, moveDown, rotatePiece, hardDrop]);

  // Touch handlers
  const touchStartPos = useRef<{ x: number; y: number; time: number } | null>(null);
  const accumulatedDeltaX = useRef<number>(0);
  const CELL_STEP = 24;

  const onTouchStart = (e: React.TouchEvent) => {
    touchStartPos.current = {
      x: e.touches[0].clientX,
      y: e.touches[0].clientY,
      time: Date.now(),
    };
    accumulatedDeltaX.current = 0;
  };

  const onTouchMove = (e: React.TouchEvent) => {
    if (!touchStartPos.current || !isPlaying || isGameOver) return;
    const curX = e.touches[0].clientX;
    const curY = e.touches[0].clientY;

    const diffX = curX - touchStartPos.current.x - accumulatedDeltaX.current;
    const diffY = curY - touchStartPos.current.y;

    if (Math.abs(diffX) >= CELL_STEP) {
      const steps = Math.trunc(diffX / CELL_STEP);
      if (steps > 0) {
        for (let i = 0; i < steps; i++) moveHorizontal(1);
      } else {
        for (let i = 0; i < Math.abs(steps); i++) moveHorizontal(-1);
      }
      accumulatedDeltaX.current += steps * CELL_STEP;
    }

    if (diffY > 40) {
      moveDown();
      touchStartPos.current.y = curY;
    }
  };

  const onTouchEnd = (e: React.TouchEvent) => {
    if (!touchStartPos.current) return;
    const endTime = Date.now();
    const duration = endTime - touchStartPos.current.time;
    const touch = e.changedTouches[0];
    const totalDiffX = touch.clientX - touchStartPos.current.x;
    const totalDiffY = touch.clientY - touchStartPos.current.y;

    if (duration < 220 && Math.abs(totalDiffX) < 14 && Math.abs(totalDiffY) < 14) {
      rotatePiece();
    } else if (duration < 280 && totalDiffY > 50 && Math.abs(totalDiffY) > Math.abs(totalDiffX) * 1.5) {
      hardDrop();
    }

    touchStartPos.current = null;
    accumulatedDeltaX.current = 0;
  };

  return (
    <div
      onTouchStart={onTouchStart}
      onTouchMove={onTouchMove}
      onTouchEnd={onTouchEnd}
      className="flex-1 min-h-0 flex flex-col bg-[#0F172A] text-white select-none overflow-hidden font-sans touch-none"
      style={{ touchAction: "none" }}
    >
      {/* Header */}
      <div className="h-10 px-3 bg-[#1E293B] border-b border-white/10 flex items-center justify-between shrink-0">
        <span className="w-8" />
        <div className="font-extrabold text-sm text-cyan-400 tracking-widest font-mono">
          TETRIS RETRO
        </div>
        <button
          onClick={resetGame}
          className="p-1 rounded text-zinc-400 hover:text-white active:scale-95"
          title="Chơi lại"
        >
          <RotateCcw className="size-3.5" />
        </button>
      </div>

      {/* Secret Clue Toast */}
      {clueUnlocked && (
        <div className="mx-3 mt-1 px-2.5 py-1 bg-cyan-500/20 border border-cyan-500/50 text-cyan-300 text-[11px] rounded text-center animate-pulse">
          🔓 Phá đủ {targetClueLines} hàng gạch! Tang vật rơi ra: "Thẻ gửi đồ số: 104"
        </div>
      )}

      {/* Main Play Area with Side Dashboard */}
      <div className="flex-1 min-h-0 flex items-center justify-center gap-3 p-2 relative">
        {/* Tetris Board */}
        <div className="w-[190px] h-[380px] sm:w-[210px] sm:h-[420px] bg-slate-900 border-2 border-cyan-700/60 rounded-md grid grid-cols-10 grid-rows-20 gap-[1px] p-[1px] shadow-2xl relative overflow-hidden shrink-0">
          {board.map((row, r) =>
            row.map((cell, c) => {
              let activeColor = cell;
              if (
                currentPiece &&
                r >= currentPiece.y &&
                r < currentPiece.y + currentPiece.shape.length &&
                c >= currentPiece.x &&
                c < currentPiece.x + currentPiece.shape[0].length
              ) {
                if (currentPiece.shape[r - currentPiece.y][c - currentPiece.x]) {
                  activeColor = currentPiece.color;
                }
              }

              return (
                <div
                  key={`${r}-${c}`}
                  className={cn(
                    "w-full h-full rounded-[1px]",
                    activeColor ? `${activeColor} shadow-xs` : "bg-slate-950/40"
                  )}
                />
              );
            })
          )}

          {/* Start / Game Over Overlay */}
          {(!isPlaying || isGameOver) && (
            <div className="absolute inset-0 bg-black/80 backdrop-blur-2xs flex flex-col items-center justify-center p-3 text-center z-10 pointer-events-auto">
              {isGameOver ? (
                <>
                  <div className="text-rose-500 font-black text-lg mb-1">
                    GAME OVER
                  </div>
                  <div className="text-xs text-zinc-300 mb-3">
                    Điểm số: <span className="font-bold text-white">{score}</span>
                  </div>
                  <button
                    onClick={resetGame}
                    className="px-5 py-2 rounded-full bg-cyan-600 hover:bg-cyan-500 text-white font-bold text-xs flex items-center gap-1 active:scale-95 shadow-md cursor-pointer"
                  >
                    <RotateCcw className="size-3.5" />
                    <span>Chơi lại</span>
                  </button>
                </>
              ) : (
                <>
                  <div className="text-cyan-400 font-black text-lg mb-3">
                    XẾP GẠCH
                  </div>
                  <button
                    onClick={resetGame}
                    className="px-6 py-2 rounded-full bg-cyan-600 hover:bg-cyan-500 text-white font-bold text-xs flex items-center gap-1 active:scale-95 shadow-md cursor-pointer"
                  >
                    <Play className="size-3.5 fill-current" />
                    <span>Bắt đầu</span>
                  </button>
                </>
              )}
            </div>
          )}
        </div>

        {/* Side Panel: TIẾP THEO (Next Piece Preview) + SCORE + LINES */}
        <div className="flex flex-col justify-between h-[380px] sm:h-[420px] w-[95px] py-1 shrink-0">
          {/* Ô DỰ BÁO HÌNH TIẾP THEO (NEXT PIECE PREVIEW) */}
          <div className="p-2 rounded-xl bg-slate-900/90 border border-cyan-800/60 shadow-lg flex flex-col items-center">
            <span className="text-[9.5px] uppercase font-bold text-cyan-400/90 tracking-wider mb-2 font-mono">
              TIẾP THEO
            </span>
            <div className="size-16 flex items-center justify-center bg-slate-950/60 rounded-lg border border-white/5">
              {nextPiece && (
                <div
                  className="grid gap-[2px]"
                  style={{
                    gridTemplateColumns: `repeat(${nextPiece.shape[0].length}, minmax(0, 1fr))`,
                  }}
                >
                  {nextPiece.shape.map((row, r) =>
                    row.map((cell, c) => (
                      <div
                        key={`${r}-${c}`}
                        className={cn(
                          "size-3 rounded-[1px]",
                          cell ? `${nextPiece.color} shadow-xs` : "opacity-0"
                        )}
                      />
                    ))
                  )}
                </div>
              )}
            </div>
          </div>

          {/* SCORE PANEL */}
          <div className="p-2.5 rounded-xl bg-slate-900/90 border border-white/10 shadow-lg flex flex-col space-y-2">
            <div>
              <div className="text-[9px] uppercase font-bold text-zinc-400 tracking-wider font-mono">
                ĐIỂM SỐ
              </div>
              <div className="font-mono text-cyan-300 font-bold text-base truncate">
                {score}
              </div>
            </div>

            <div className="border-t border-white/10 pt-1.5">
              <div className="text-[9px] uppercase font-bold text-zinc-400 tracking-wider font-mono">
                SỐ HÀNG
              </div>
              <div className="font-mono text-amber-300 font-bold text-base">
                {lines}
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
export default TetrisApp;
