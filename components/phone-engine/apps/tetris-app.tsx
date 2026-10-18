"use client";

import React, { useState, useEffect, useRef, useCallback } from "react";
import { ArrowLeft, RotateCcw, Trophy, Play, Pause } from "lucide-react";
import { cn } from "@/lib/utils";

interface TetrisProps {
  onBackToHome: () => void;
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

export function TetrisApp({
  onBackToHome,
  targetClueLines = 4,
  onSecretUnlocked,
}: TetrisProps) {
  const [board, setBoard] = useState<string[][]>(() =>
    Array.from({ length: ROWS }, () => Array(COLS).fill(""))
  );
  const [currentPiece, setCurrentPiece] = useState<{
    shape: number[][];
    color: string;
    x: number;
    y: number;
  } | null>(null);

  const [score, setScore] = useState<number>(0);
  const [lines, setLines] = useState<number>(0);
  const [isPlaying, setIsPlaying] = useState<boolean>(false);
  const [isGameOver, setIsGameOver] = useState<boolean>(false);
  const [clueUnlocked, setClueUnlocked] = useState<boolean>(false);

  const boardRef = useRef(board);
  boardRef.current = board;
  const currentPieceRef = useRef(currentPiece);
  currentPieceRef.current = currentPiece;

  // Sinh khối gạch mới
  const spawnPiece = useCallback(() => {
    const keys = Object.keys(TETROMINOES) as TetrominoKey[];
    const randomKey = keys[Math.floor(Math.random() * keys.length)];
    const item = TETROMINOES[randomKey];

    const newPiece = {
      shape: item.shape,
      color: item.color,
      x: Math.floor(COLS / 2) - Math.floor(item.shape[0].length / 2),
      y: 0,
    };

    // Kiểm tra đụng nóc (Game Over)
    for (let r = 0; r < newPiece.shape.length; r++) {
      for (let c = 0; c < newPiece.shape[r].length; c++) {
        if (
          newPiece.shape[r][c] &&
          boardRef.current[newPiece.y + r]?.[newPiece.x + c]
        ) {
          setIsGameOver(true);
          setIsPlaying(false);
          return null;
        }
      }
    }

    setCurrentPiece(newPiece);
    return newPiece;
  }, []);

  const resetGame = () => {
    setBoard(Array.from({ length: ROWS }, () => Array(COLS).fill("")));
    setScore(0);
    setLines(0);
    setIsGameOver(false);
    setIsPlaying(true);
    spawnPiece();
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

  // Cố định khối gạch vào bàn cờ & xóa hàng kín
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

    // Quét và xóa các hàng đã lấp đầy
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
  const moveHorizontal = (dir: -1 | 1) => {
    const piece = currentPieceRef.current;
    if (!piece || !isPlaying || isGameOver) return;
    if (!checkCollision(piece.shape, { x: piece.x + dir, y: piece.y }, boardRef.current)) {
      setCurrentPiece({ ...piece, x: piece.x + dir });
    }
  };

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
  const rotatePiece = () => {
    const piece = currentPieceRef.current;
    if (!piece || !isPlaying || isGameOver) return;
    const rotated = piece.shape[0].map((_, index) =>
      piece.shape.map((row) => row[index]).reverse()
    );
    if (!checkCollision(rotated, { x: piece.x, y: piece.y }, boardRef.current)) {
      setCurrentPiece({ ...piece, shape: rotated });
    }
  };

  // Thả rơi tức thì (Hard Drop)
  const hardDrop = () => {
    const piece = currentPieceRef.current;
    if (!piece || !isPlaying || isGameOver) return;
    let newY = piece.y;
    while (!checkCollision(piece.shape, { x: piece.x, y: newY + 1 }, boardRef.current)) {
      newY++;
    }
    currentPieceRef.current = { ...piece, y: newY };
    lockPiece();
  };

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
  }, [moveDown]);

  return (
    <div className="flex-1 min-h-0 flex flex-col bg-[#0F172A] text-white select-none overflow-hidden font-sans">
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

      {/* Score bar */}
      <div className="px-4 py-1.5 bg-[#1E293B]/60 flex items-center justify-between text-xs border-b border-white/5 shrink-0">
        <div>
          Điểm: <span className="font-mono text-cyan-300 font-bold">{score}</span>
        </div>
        <div>
          Số hàng phá: <span className="font-mono text-amber-300 font-bold">{lines}</span>
        </div>
      </div>

      {/* Secret Clue Toast */}
      {clueUnlocked && (
        <div className="mx-3 mt-1 px-2.5 py-1 bg-cyan-500/20 border border-cyan-500/50 text-cyan-300 text-[11px] rounded text-center animate-pulse">
          🔓 Phá đủ {targetClueLines} hàng gạch! Tang vật rơi ra: "Thẻ gửi đồ số: 104"
        </div>
      )}

      {/* Tetris Board */}
      <div className="flex-1 min-h-0 flex items-center justify-center p-2 relative">
        <div className="w-[180px] sm:w-[200px] h-[360px] sm:h-[400px] bg-slate-900 border-2 border-cyan-700/60 rounded-md grid grid-cols-10 grid-rows-20 gap-[1px] p-[1px] shadow-2xl relative overflow-hidden">
          {board.map((row, r) =>
            row.map((cell, c) => {
              // Kiểm tra xem ô này có thuộc piece đang rơi hay không
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
            <div className="absolute inset-0 bg-black/80 backdrop-blur-2xs flex flex-col items-center justify-center p-3 text-center z-10">
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
                    className="px-4 py-1.5 rounded-full bg-cyan-600 hover:bg-cyan-500 text-white font-bold text-xs flex items-center gap-1 active:scale-95 shadow-md"
                  >
                    <RotateCcw className="size-3.5" />
                    <span>Chơi lại</span>
                  </button>
                </>
              ) : (
                <>
                  <div className="text-cyan-400 font-black text-lg mb-1">
                    XẾP GẠCH
                  </div>
                  <div className="text-[11px] text-zinc-400 mb-3">
                    Phá 4 hàng để mở khóa manh mối
                  </div>
                  <button
                    onClick={resetGame}
                    className="px-4 py-1.5 rounded-full bg-cyan-600 hover:bg-cyan-500 text-white font-bold text-xs flex items-center gap-1 active:scale-95 shadow-md"
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

      {/* D-Pad Buttons for Mobile */}
      <div className="p-2 bg-[#1E293B] border-t border-white/5 flex items-center justify-center gap-2 shrink-0">
        <button
          onClick={() => moveHorizontal(-1)}
          className="size-10 rounded-lg bg-slate-800 active:bg-cyan-600 text-white font-bold text-sm flex items-center justify-center shadow-md active:scale-95"
        >
          ◀
        </button>
        <button
          onClick={rotatePiece}
          className="size-10 rounded-lg bg-cyan-700 active:bg-cyan-600 text-white font-bold text-xs flex items-center justify-center shadow-md active:scale-95"
          title="Xoay"
        >
          🔄
        </button>
        <button
          onClick={moveDown}
          className="size-10 rounded-lg bg-slate-800 active:bg-cyan-600 text-white font-bold text-sm flex items-center justify-center shadow-md active:scale-95"
        >
          ▼
        </button>
        <button
          onClick={() => moveHorizontal(1)}
          className="size-10 rounded-lg bg-slate-800 active:bg-cyan-600 text-white font-bold text-sm flex items-center justify-center shadow-md active:scale-95"
        >
          ▶
        </button>
        <button
          onClick={hardDrop}
          className="h-10 px-3 rounded-lg bg-amber-600 active:bg-amber-500 text-white font-bold text-xs flex items-center justify-center shadow-md active:scale-95"
          title="Thả rơi ngay"
        >
          ⚡ Rơi
        </button>
      </div>
    </div>
  );
}
export default TetrisApp;
