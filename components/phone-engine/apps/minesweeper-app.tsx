"use client";

import React, { useState, useEffect, useCallback } from "react";
import { ArrowLeft, RotateCcw, Flag } from "lucide-react";
import { cn } from "@/lib/utils";

interface MinesweeperProps {
  onBackToHome: () => void;
  onSecretUnlocked?: () => void;
}

type Cell = {
  isMine: boolean;
  isRevealed: boolean;
  isFlagged: boolean;
  neighborMines: number;
};

const ROWS = 8;
const COLS = 8;
const MINES_COUNT = 8;

export function MinesweeperApp({
  onBackToHome,
  onSecretUnlocked,
}: MinesweeperProps) {
  const [grid, setGrid] = useState<Cell[][]>([]);
  const [flagMode, setFlagMode] = useState<boolean>(false);
  const [status, setStatus] = useState<"PLAYING" | "WON" | "LOST">("PLAYING");
  const [flagsLeft, setFlagsLeft] = useState<number>(MINES_COUNT);

  const initBoard = useCallback(() => {
    // 1. Khởi tạo mảng trống
    const newGrid: Cell[][] = Array.from({ length: ROWS }, () =>
      Array.from({ length: COLS }, () => ({
        isMine: false,
        isRevealed: false,
        isFlagged: false,
        neighborMines: 0,
      }))
    );

    // 2. Rải mìn ngẫu nhiên
    let placedMines = 0;
    while (placedMines < MINES_COUNT) {
      const r = Math.floor(Math.random() * ROWS);
      const c = Math.floor(Math.random() * COLS);
      if (!newGrid[r][c].isMine) {
        newGrid[r][c].isMine = true;
        placedMines++;
      }
    }

    // 3. Tính số mìn lân cận
    for (let r = 0; r < ROWS; r++) {
      for (let c = 0; c < COLS; c++) {
        if (!newGrid[r][c].isMine) {
          let count = 0;
          for (let dr = -1; dr <= 1; dr++) {
            for (let dc = -1; dc <= 1; dc++) {
              const nr = r + dr;
              const nc = c + dc;
              if (
                nr >= 0 &&
                nr < ROWS &&
                nc >= 0 &&
                nc < COLS &&
                newGrid[nr][nc].isMine
              ) {
                count++;
              }
            }
          }
          newGrid[r][c].neighborMines = count;
        }
      }
    }

    setGrid(newGrid);
    setStatus("PLAYING");
    setFlagsLeft(MINES_COUNT);
  }, []);

  useEffect(() => {
    initBoard();
  }, [initBoard]);

  // Mở rộng các ô trống (Flood Fill)
  const revealCell = (r: number, c: number) => {
    if (status !== "PLAYING") return;
    const current = grid[r][c];

    if (flagMode) {
      // Chế độ cắm cờ
      if (current.isRevealed) return;
      const nextGrid = grid.map((row) => row.map((cell) => ({ ...cell })));
      const willFlag = !current.isFlagged;
      if (willFlag && flagsLeft <= 0) return;
      nextGrid[r][c].isFlagged = willFlag;
      setFlagsLeft((prev) => (willFlag ? prev - 1 : prev + 1));
      setGrid(nextGrid);
      return;
    }

    if (current.isFlagged || current.isRevealed) return;

    // Giẫm phải mìn
    if (current.isMine) {
      const nextGrid = grid.map((row) =>
        row.map((cell) => ({
          ...cell,
          isRevealed: cell.isMine ? true : cell.isRevealed,
        }))
      );
      setGrid(nextGrid);
      setStatus("LOST");
      return;
    }

    // Mở ô an toàn
    const nextGrid = grid.map((row) => row.map((cell) => ({ ...cell })));
    const queue: [number, number][] = [[r, c]];
    nextGrid[r][c].isRevealed = true;

    while (queue.length > 0) {
      const [cr, cc] = queue.shift()!;
      if (nextGrid[cr][cc].neighborMines === 0) {
        for (let dr = -1; dr <= 1; dr++) {
          for (let dc = -1; dc <= 1; dc++) {
            const nr = cr + dr;
            const nc = cc + dc;
            if (
              nr >= 0 &&
              nr < ROWS &&
              nc >= 0 &&
              nc < COLS &&
              !nextGrid[nr][nc].isRevealed &&
              !nextGrid[nr][nc].isFlagged
            ) {
              nextGrid[nr][nc].isRevealed = true;
              if (nextGrid[nr][nc].neighborMines === 0) {
                queue.push([nr, nc]);
              }
            }
          }
        }
      }
    }

    // Kiểm tra chiến thắng
    let unrevealedSafeCells = 0;
    for (let row = 0; row < ROWS; row++) {
      for (let col = 0; col < COLS; col++) {
        if (!nextGrid[row][col].isMine && !nextGrid[row][col].isRevealed) {
          unrevealedSafeCells++;
        }
      }
    }

    if (unrevealedSafeCells === 0) {
      setStatus("WON");
      if (onSecretUnlocked) onSecretUnlocked();
    }

    setGrid(nextGrid);
  };

  const getNumberColor = (num: number) => {
    switch (num) {
      case 1: return "text-blue-600";
      case 2: return "text-emerald-600";
      case 3: return "text-red-600";
      case 4: return "text-indigo-800";
      default: return "text-amber-800";
    }
  };

  return (
    <div className="flex-1 min-h-0 flex flex-col bg-[#C0C0C0] text-black font-mono select-none overflow-hidden">
      {/* Header */}
      <div className="h-11 px-3 bg-[#B0B0B0] border-b-2 border-white flex items-center justify-between shrink-0 shadow-sm">
        <span className="w-8" />
        <div className="font-extrabold text-sm tracking-wider">DÒ MÌN</div>
        <button
          onClick={initBoard}
          className="p-1 border border-zinc-500 bg-[#D4D0C8] active:border-zinc-700"
          title="Chơi lại"
        >
          <RotateCcw className="size-3.5" />
        </button>
      </div>

      {/* Retro Status Panel */}
      <div className="mx-3 my-2 p-2 bg-[#C0C0C0] border-2 border-t-[#808080] border-l-[#808080] border-b-white border-r-white flex items-center justify-between">
        <div className="px-2 py-0.5 bg-black text-red-600 font-bold text-sm rounded-[2px]">
          {String(flagsLeft).padStart(3, "0")}
        </div>

        <button
          onClick={initBoard}
          className="px-2 py-0.5 text-base border-2 border-t-white border-l-white border-b-[#808080] border-r-[#808080] bg-[#C0C0C0] active:border-t-[#808080] active:border-l-[#808080]"
        >
          {status === "LOST" ? "💀" : status === "WON" ? "😎" : "🙂"}
        </button>

        <button
          onClick={() => setFlagMode((f) => !f)}
          className={cn(
            "px-2 py-0.5 text-xs font-bold font-sans flex items-center gap-1 border-2",
            flagMode
              ? "bg-red-500 text-white border-red-700"
              : "bg-[#D4D0C8] text-zinc-700 border-t-white border-l-white border-b-[#808080] border-r-[#808080]"
          )}
        >
          <Flag className="size-3 fill-current" />
          <span>{flagMode ? "Cờ ON" : "Mở ô"}</span>
        </button>
      </div>

      {/* Secret Toast */}
      {status === "WON" && (
        <div className="mx-3 mb-1 px-2.5 py-1.5 bg-emerald-100 border border-emerald-400 text-[11px] text-emerald-800 font-sans font-medium text-center animate-pulse">
          🏆 Phá giải hoàn tất bãi mìn! Manh mối: "Tọa độ GPS: 21.0285, 105.8542"
        </div>
      )}

      {/* Mine Grid */}
      <div className="flex-1 min-h-0 flex items-center justify-center p-2">
        <div className="border-4 border-t-[#808080] border-l-[#808080] border-b-white border-r-white bg-[#808080] p-1 grid grid-cols-8 grid-rows-8 gap-[1px]">
          {grid.map((row, r) =>
            row.map((cell, c) => (
              <button
                key={`${r}-${c}`}
                onClick={() => revealCell(r, c)}
                className={cn(
                  "size-8 sm:size-9 flex items-center justify-center font-bold text-sm select-none cursor-pointer",
                  cell.isRevealed
                    ? "bg-[#C0C0C0] border border-[#808080]"
                    : "bg-[#C0C0C0] border-2 border-t-white border-l-white border-b-[#808080] border-r-[#808080] active:border-none"
                )}
              >
                {cell.isRevealed ? (
                  cell.isMine ? (
                    "💣"
                  ) : cell.neighborMines > 0 ? (
                    <span className={getNumberColor(cell.neighborMines)}>
                      {cell.neighborMines}
                    </span>
                  ) : (
                    ""
                  )
                ) : cell.isFlagged ? (
                  "🚩"
                ) : (
                  ""
                )}
              </button>
            ))
          )}
        </div>
      </div>
    </div>
  );
}
export default MinesweeperApp;
