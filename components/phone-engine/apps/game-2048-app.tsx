"use client";

import React, { useState, useEffect, useCallback, useRef } from "react";
import { ArrowLeft, RotateCcw, Trophy } from "lucide-react";
import { cn } from "@/lib/utils";

interface Game2048Props {
  onBackToHome: () => void;
  targetClueTile?: number; // Ví dụ đạt ô 512 hoặc 1024 để mở manh mối
  onSecretUnlocked?: () => void;
}

type Board = number[][];

const TILE_COLORS: Record<number, string> = {
  2: "bg-[#EEE4DA] text-[#776E65]",
  4: "bg-[#EDE0C8] text-[#776E65]",
  8: "bg-[#F2B179] text-white",
  16: "bg-[#F59563] text-white",
  32: "bg-[#F67C5F] text-white",
  64: "bg-[#F65E3B] text-white",
  128: "bg-[#EDCF72] text-white text-base shadow-[0_0_10px_rgba(237,207,114,0.5)]",
  256: "bg-[#EDCC61] text-white text-base shadow-[0_0_12px_rgba(237,204,97,0.6)]",
  512: "bg-[#EDC850] text-white text-base shadow-[0_0_14px_rgba(237,200,80,0.7)]",
  1024: "bg-[#EDC53F] text-white text-sm shadow-[0_0_16px_rgba(237,197,63,0.8)]",
  2048: "bg-[#EDC22E] text-white text-sm shadow-[0_0_20px_rgba(237,194,46,0.9)] animate-pulse",
};

export function Game2048App({
  onBackToHome,
  targetClueTile = 512,
  onSecretUnlocked,
}: Game2048Props) {
  const [board, setBoard] = useState<Board>([
    [0, 0, 0, 0],
    [0, 0, 0, 0],
    [0, 0, 0, 0],
    [0, 0, 0, 0],
  ]);
  const [score, setScore] = useState<number>(0);
  const [bestScore, setBestScore] = useState<number>(3840);
  const [isGameOver, setIsGameOver] = useState<boolean>(false);
  const [clueUnlocked, setClueUnlocked] = useState<boolean>(false);

  // Thêm ngẫu nhiên 2 hoặc 4 vào ô trống
  const addRandomTile = useCallback((currentBoard: Board): Board => {
    const emptyCells: { r: number; c: number }[] = [];
    currentBoard.forEach((row, r) => {
      row.forEach((cell, c) => {
        if (cell === 0) emptyCells.push({ r, c });
      });
    });

    if (emptyCells.length === 0) return currentBoard;

    const randomCell = emptyCells[Math.floor(Math.random() * emptyCells.length)];
    const newBoard = currentBoard.map((row) => [...row]);
    newBoard[randomCell.r][randomCell.c] = Math.random() < 0.9 ? 2 : 4;
    return newBoard;
  }, []);

  // Khởi tạo ván mới
  const resetGame = useCallback(() => {
    let newBoard: Board = [
      [0, 0, 0, 0],
      [0, 0, 0, 0],
      [0, 0, 0, 0],
      [0, 0, 0, 0],
    ];
    newBoard = addRandomTile(newBoard);
    newBoard = addRandomTile(newBoard);
    setBoard(newBoard);
    setScore(0);
    setIsGameOver(false);
  }, [addRandomTile]);

  useEffect(() => {
    resetGame();
  }, [resetGame]);

  // Logic trượt ô
  const slide = (row: number[]): { newRow: number[]; gainedScore: number } => {
    let arr = row.filter((val) => val !== 0);
    let gainedScore = 0;

    for (let i = 0; i < arr.length - 1; i++) {
      if (arr[i] === arr[i + 1]) {
        arr[i] *= 2;
        gainedScore += arr[i];
        arr.splice(i + 1, 1);
      }
    }

    while (arr.length < 4) {
      arr.push(0);
    }
    return { newRow: arr, gainedScore };
  };

  const moveLeft = useCallback(() => {
    let changed = false;
    let addScore = 0;
    const newBoard = board.map((row) => {
      const { newRow, gainedScore } = slide(row);
      if (JSON.stringify(newRow) !== JSON.stringify(row)) changed = true;
      addScore += gainedScore;
      return newRow;
    });

    if (changed) {
      const finalBoard = addRandomTile(newBoard);
      setBoard(finalBoard);
      const nextScore = score + addScore;
      setScore(nextScore);
      if (nextScore > bestScore) setBestScore(nextScore);

      // Check clue
      if (!clueUnlocked) {
        const hasClueTile = finalBoard.some((row) =>
          row.some((val) => val >= targetClueTile)
        );
        if (hasClueTile) {
          setClueUnlocked(true);
          if (onSecretUnlocked) onSecretUnlocked();
        }
      }
    }
  }, [board, score, bestScore, addRandomTile, clueUnlocked, targetClueTile, onSecretUnlocked]);

  const moveRight = useCallback(() => {
    let changed = false;
    let addScore = 0;
    const newBoard = board.map((row) => {
      const reversed = [...row].reverse();
      const { newRow, gainedScore } = slide(reversed);
      const restored = newRow.reverse();
      if (JSON.stringify(restored) !== JSON.stringify(row)) changed = true;
      addScore += gainedScore;
      return restored;
    });

    if (changed) {
      const finalBoard = addRandomTile(newBoard);
      setBoard(finalBoard);
      const nextScore = score + addScore;
      setScore(nextScore);
      if (nextScore > bestScore) setBestScore(nextScore);

      if (!clueUnlocked) {
        const hasClueTile = finalBoard.some((row) =>
          row.some((val) => val >= targetClueTile)
        );
        if (hasClueTile) {
          setClueUnlocked(true);
          if (onSecretUnlocked) onSecretUnlocked();
        }
      }
    }
  }, [board, score, bestScore, addRandomTile, clueUnlocked, targetClueTile, onSecretUnlocked]);

  const moveUp = useCallback(() => {
    let changed = false;
    let addScore = 0;
    const newBoard: Board = [
      [0, 0, 0, 0],
      [0, 0, 0, 0],
      [0, 0, 0, 0],
      [0, 0, 0, 0],
    ];

    for (let c = 0; c < 4; c++) {
      const col = [board[0][c], board[1][c], board[2][c], board[3][c]];
      const { newRow, gainedScore } = slide(col);
      if (JSON.stringify(newRow) !== JSON.stringify(col)) changed = true;
      addScore += gainedScore;
      for (let r = 0; r < 4; r++) {
        newBoard[r][c] = newRow[r];
      }
    }

    if (changed) {
      const finalBoard = addRandomTile(newBoard);
      setBoard(finalBoard);
      const nextScore = score + addScore;
      setScore(nextScore);
      if (nextScore > bestScore) setBestScore(nextScore);

      if (!clueUnlocked) {
        const hasClueTile = finalBoard.some((row) =>
          row.some((val) => val >= targetClueTile)
        );
        if (hasClueTile) {
          setClueUnlocked(true);
          if (onSecretUnlocked) onSecretUnlocked();
        }
      }
    }
  }, [board, score, bestScore, addRandomTile, clueUnlocked, targetClueTile, onSecretUnlocked]);

  const moveDown = useCallback(() => {
    let changed = false;
    let addScore = 0;
    const newBoard: Board = [
      [0, 0, 0, 0],
      [0, 0, 0, 0],
      [0, 0, 0, 0],
      [0, 0, 0, 0],
    ];

    for (let c = 0; c < 4; c++) {
      const col = [board[3][c], board[2][c], board[1][c], board[0][c]];
      const { newRow, gainedScore } = slide(col);
      if (JSON.stringify(newRow) !== JSON.stringify(col)) changed = true;
      addScore += gainedScore;
      const reversed = newRow.reverse();
      for (let r = 0; r < 4; r++) {
        newBoard[r][c] = reversed[r];
      }
    }

    if (changed) {
      const finalBoard = addRandomTile(newBoard);
      setBoard(finalBoard);
      const nextScore = score + addScore;
      setScore(nextScore);
      if (nextScore > bestScore) setBestScore(nextScore);

      if (!clueUnlocked) {
        const hasClueTile = finalBoard.some((row) =>
          row.some((val) => val >= targetClueTile)
        );
        if (hasClueTile) {
          setClueUnlocked(true);
          if (onSecretUnlocked) onSecretUnlocked();
        }
      }
    }
  }, [board, score, bestScore, addRandomTile, clueUnlocked, targetClueTile, onSecretUnlocked]);

  // Touch Swipe Handler
  const touchStartRef = useRef<{ x: number; y: number } | null>(null);

  const handleTouchStart = (e: React.TouchEvent) => {
    touchStartRef.current = {
      x: e.touches[0].clientX,
      y: e.touches[0].clientY,
    };
  };

  const handleTouchEnd = (e: React.TouchEvent) => {
    if (!touchStartRef.current) return;
    const diffX = e.changedTouches[0].clientX - touchStartRef.current.x;
    const diffY = e.changedTouches[0].clientY - touchStartRef.current.y;

    if (Math.abs(diffX) > Math.abs(diffY)) {
      if (diffX > 30) moveRight();
      else if (diffX < -30) moveLeft();
    } else {
      if (diffY > 30) moveDown();
      else if (diffY < -30) moveUp();
    }
    touchStartRef.current = null;
  };

  // Keyboard navigation
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === "ArrowUp") { e.preventDefault(); moveUp(); }
      if (e.key === "ArrowDown") { e.preventDefault(); moveDown(); }
      if (e.key === "ArrowLeft") { e.preventDefault(); moveLeft(); }
      if (e.key === "ArrowRight") { e.preventDefault(); moveRight(); }
    };
    window.addEventListener("keydown", handleKeyDown);
    return () => window.removeEventListener("keydown", handleKeyDown);
  }, [moveUp, moveDown, moveLeft, moveRight]);

  return (
    <div
      onTouchStart={handleTouchStart}
      onTouchEnd={handleTouchEnd}
      className="flex-1 min-h-0 flex flex-col bg-[#FAF8EF] text-[#776E65] font-sans select-none overflow-hidden"
    >
      {/* Header */}
      <div className="h-11 px-3 bg-[#FAF8EF] border-b border-[#D8D4D0] flex items-center justify-between shrink-0">
        <span className="w-8" />
        <div className="font-extrabold text-lg text-[#776E65] tracking-tight">
          2048
        </div>
        <button
          onClick={resetGame}
          className="p-1 rounded bg-[#8F7A66] text-white active:scale-95"
          title="Ván mới"
        >
          <RotateCcw className="size-3.5" />
        </button>
      </div>

      {/* Score Cards */}
      <div className="px-4 py-2 flex items-center justify-between">
        <div className="text-[11px] text-[#776E65] leading-tight font-medium">
          Trượt các ô số để đạt <strong>2048</strong>!
        </div>
        <div className="flex gap-2">
          <div className="px-2.5 py-1 rounded-md bg-[#BBADA0] text-white flex flex-col items-center">
            <span className="text-[8.5px] uppercase font-bold tracking-wider opacity-80">
              ĐIỂM
            </span>
            <span className="font-bold text-xs">{score}</span>
          </div>
          <div className="px-2.5 py-1 rounded-md bg-[#BBADA0] text-white flex flex-col items-center">
            <span className="text-[8.5px] uppercase font-bold tracking-wider opacity-80">
              KỶ LỤC
            </span>
            <span className="font-bold text-xs">{bestScore}</span>
          </div>
        </div>
      </div>

      {/* Secret Clue Toast */}
      {clueUnlocked && (
        <div className="mx-3 mb-1 px-2.5 py-1.5 rounded-lg bg-amber-500/20 border border-amber-500/40 text-[11px] text-amber-800 flex items-center justify-between animate-pulse">
          <span>🔓 Đạt ô {targetClueTile}: Mở khóa manh mối "Thư mục ẩn: 1994"</span>
        </div>
      )}

      {/* 2048 Board Container */}
      <div className="flex-1 min-h-0 flex items-center justify-center p-3">
        <div className="aspect-square w-full max-w-[280px] bg-[#BBADA0] p-2 rounded-xl grid grid-cols-4 grid-rows-4 gap-2 shadow-inner">
          {board.map((row, r) =>
            row.map((cell, c) => (
              <div
                key={`${r}-${c}`}
                className={cn(
                  "w-full h-full rounded-md flex items-center justify-center font-bold text-lg transition-transform duration-100",
                  cell === 0 ? "bg-[#CDC1B4]" : TILE_COLORS[cell] || "bg-[#3C3A32] text-white"
                )}
              >
                {cell > 0 ? cell : ""}
              </div>
            ))
          )}
        </div>
      </div>

      {/* D-Pad Buttons on mobile */}
      <div className="p-2 bg-[#EBE5DE] border-t border-[#D8D4D0] flex items-center justify-center gap-1 shrink-0">
        <button
          onClick={moveLeft}
          className="px-3 py-1.5 rounded-lg bg-[#8F7A66] text-white font-bold text-xs active:scale-95"
        >
          ◀ Trái
        </button>
        <button
          onClick={moveUp}
          className="px-3 py-1.5 rounded-lg bg-[#8F7A66] text-white font-bold text-xs active:scale-95"
        >
          ▲ Lên
        </button>
        <button
          onClick={moveDown}
          className="px-3 py-1.5 rounded-lg bg-[#8F7A66] text-white font-bold text-xs active:scale-95"
        >
          ▼ Xuống
        </button>
        <button
          onClick={moveRight}
          className="px-3 py-1.5 rounded-lg bg-[#8F7A66] text-white font-bold text-xs active:scale-95"
        >
          Phải ▶
        </button>
      </div>
    </div>
  );
}
export default Game2048App;
