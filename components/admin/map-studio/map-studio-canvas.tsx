"use client";

import React from "react";
import { cn } from "@/lib/utils";
import type {
  Point,
  MapVectorData,
  MapStudioTool,
  WaterFeature,
  RoadFeature,
  RailwayFeature,
  ZoneFeature,
  PoiFeature,
  LabelFeature,
} from "@/lib/types/map-vector";
import {
  pointsToSvgPath,
} from "@/lib/maps/vector-utils";
import {
  MemoWaterFeature,
  RoadCasingItem,
  RoadSurfaceItem,
  MemoRailwayFeature,
  MemoZoneFeature,
  MemoPoiFeature,
  MemoLabelFeature,
  ActiveDrawingPreview,
} from "./map-features";
import { type FeatureLayerItem } from "./map-studio-sidebar";

export interface MapStudioCanvasProps {
  containerRef: React.RefObject<HTMLDivElement | null>;
  handleCanvasMouseDown: (e: React.MouseEvent) => void;
  handleCanvasMouseMove: (e: React.MouseEvent) => void;
  handleCanvasMouseUp: () => void;
  finishDrawing: () => void;
  isDraggingFeature: boolean;
  activeTool: MapStudioTool;
  isSpacePressed: boolean;
  mapData: MapVectorData;
  isLoading: boolean;
  svgRef: React.RefObject<SVGSVGElement | null>;
  pan: Point;
  zoom: number;
  gridSize: number;
  showGrid: boolean;
  viewMode: "admin" | "player";
  allFeaturesSorted: FeatureLayerItem[];
  hiddenFeatureIds: Record<string, boolean>;
  isFeatureInView: (id: string) => boolean;
  selectedFeatureId: string | null;
  handleSelectFeature: (id: string) => void;
  handleFeatureMouseDown: (e: React.MouseEvent, id: string) => void;
  isPanning: boolean;
  drawingPoints: Point[];
  candidateLineRef: React.RefObject<SVGLineElement | null>;
  candidateDotRef: React.RefObject<SVGCircleElement | null>;
  selectedFeature: WaterFeature | ZoneFeature | RoadFeature | RailwayFeature | LabelFeature | PoiFeature | null;
  selectedVertexIndex: number | null;
  setSelectedVertexIndex: React.Dispatch<React.SetStateAction<number | null>>;
  setIsDraggingVertex: React.Dispatch<React.SetStateAction<boolean>>;
  showPhoneOverlay: boolean;
}

export function MapStudioCanvas({
  containerRef,
  handleCanvasMouseDown,
  handleCanvasMouseMove,
  handleCanvasMouseUp,
  finishDrawing,
  isDraggingFeature,
  activeTool,
  isSpacePressed,
  mapData,
  isLoading,
  svgRef,
  pan,
  zoom,
  gridSize,
  showGrid,
  viewMode,
  allFeaturesSorted,
  hiddenFeatureIds,
  isFeatureInView,
  selectedFeatureId,
  handleSelectFeature,
  handleFeatureMouseDown,
  isPanning,
  drawingPoints,
  candidateLineRef,
  candidateDotRef,
  selectedFeature,
  selectedVertexIndex,
  setSelectedVertexIndex,
  setIsDraggingVertex,
  showPhoneOverlay,
}: MapStudioCanvasProps) {
  return (
    <div
          ref={containerRef}
          onMouseDown={handleCanvasMouseDown}
          onMouseMove={handleCanvasMouseMove}
          onMouseUp={handleCanvasMouseUp}
          onMouseLeave={handleCanvasMouseUp}
          onDoubleClick={finishDrawing}
          className={cn(
            "flex-1 h-full relative overflow-hidden bg-[#0A0F1D]",
            isDraggingFeature
              ? "cursor-grabbing"
              : activeTool === "pan" || isSpacePressed
                ? "cursor-grab active:cursor-grabbing"
                : "cursor-crosshair",
          )}
          style={{
            contain: "paint layout",
            backgroundColor: mapData.backgroundColor || "#F4F6F8",
          }}
        >
          {/* Loading State Overlay */}
          {isLoading && (
            <div className="absolute inset-0 z-30 flex flex-col items-center justify-center bg-[#0a0a0d] backdrop-blur-md text-zinc-400 gap-3">
              <div className="relative">
                <div className="size-10 rounded-full border-2 border-emerald-500/20 border-t-emerald-500 animate-spin" />
                <div className="absolute inset-0 flex items-center justify-center">
                  <div className="size-2 rounded-full bg-emerald-400 animate-ping" />
                </div>
              </div>
              <div className="text-center">
                <p className="font-mono text-xs text-zinc-400 tracking-wider uppercase">
                  Đang đồng bộ dữ liệu bản đồ Vector...
                </p>
              </div>
            </div>
          )}

          {/* THE SVG WORLD LAYER (Infinite Canvas) */}
          <svg
            ref={svgRef}
            id="map-canvas-svg"
            className="absolute origin-top-left overflow-visible"
            style={{
              transform: `translate3d(${pan.x}px, ${pan.y}px, 0px) scale(${zoom})`,
              willChange: "transform",
            }}
          >
            <defs>
              {/* Infinite Studio Grid Pattern */}
              <pattern
                id="infinite-grid-pattern"
                width={gridSize}
                height={gridSize}
                patternUnits="userSpaceOnUse"
              >
                <path
                  d={`M ${gridSize} 0 L 0 0 0 ${gridSize}`}
                  fill="none"
                  stroke="#94A3B8"
                  strokeWidth="0.8"
                  strokeOpacity="0.35"
                />
              </pattern>
            </defs>

            {/* Infinite Grid Overlay (Chỉ hiện trong chế độ Admin) */}
            {showGrid && viewMode === "admin" && (
              <rect
                x="-300000"
                y="-300000"
                width="600000"
                height="600000"
                fill="url(#infinite-grid-pattern)"
                pointerEvents="none"
              />
            )}

            {/* ================================================================= */}
            {/* RENDER ALL ORDERED FEATURES (WATER, ZONES, ROADS, RAILS, POIS)    */}
            {/* ================================================================= */}
            <g
              id="map-static-features-group"
              style={{
                pointerEvents:
                  activeTool === "select" && !isSpacePressed ? "auto" : "none",
              }}
            >
              {allFeaturesSorted.map((layer) => {
                const { type, item } = layer;
                if (hiddenFeatureIds[item.id]) return null;
                // Viewport Culling: Loại bỏ các node SVG nằm ngoài khung nhìn để giữ 60-120 FPS
                if (!isFeatureInView(item.id)) return null;

                const isSelected = selectedFeatureId === item.id;

                if (layer.type === "water") {
                  return (
                    <MemoWaterFeature
                      key={layer.item.id}
                      feature={layer.item}
                      isSelected={isSelected}
                      onSelect={handleSelectFeature}
                      onStartDrag={handleFeatureMouseDown}
                    />
                  );
                }
                if (layer.type === "zone") {
                  return (
                    <MemoZoneFeature
                      key={layer.item.id}
                      feature={layer.item}
                      isSelected={isSelected}
                      onSelect={handleSelectFeature}
                      onStartDrag={handleFeatureMouseDown}
                    />
                  );
                }
                if (layer.type === "building") {
                  const d = pointsToSvgPath(layer.item.points, true, false);
                  return (
                    <path
                      key={layer.item.id}
                      d={d}
                      fill={
                        isSelected ? "#FDE68A" : layer.item.color || "#E2E8F0"
                      }
                      stroke={
                        isSelected
                          ? "#D97706"
                          : layer.item.strokeColor || "#CBD5E1"
                      }
                      strokeWidth={
                        isSelected ? 1.5 : layer.item.strokeWidth || 0.8
                      }
                      opacity={layer.item.opacity ?? 0.85}
                      onClick={(e) => {
                        e.stopPropagation();
                        handleSelectFeature(layer.item.id);
                      }}
                      className="cursor-pointer transition-colors"
                    >
                      {layer.item.name && <title>{layer.item.name}</title>}
                    </path>
                  );
                }
                if (layer.type === "road") {
                  // Pass 1: Render casing border under the surface
                  return (
                    <RoadCasingItem
                      key={`casing-${layer.item.id}`}
                      feature={layer.item}
                      isSelected={isSelected}
                    />
                  );
                }
                if (layer.type === "railway") {
                  return (
                    <MemoRailwayFeature
                      key={layer.item.id}
                      feature={layer.item}
                      isSelected={isSelected}
                      onSelect={handleSelectFeature}
                      onStartDrag={handleFeatureMouseDown}
                    />
                  );
                }
                if (layer.type === "label") {
                  return (
                    <MemoLabelFeature
                      key={layer.item.id}
                      feature={layer.item}
                      isSelected={isSelected}
                      onSelect={handleSelectFeature}
                      onStartDrag={handleFeatureMouseDown}
                    />
                  );
                }
                if (layer.type === "poi") {
                  return (
                    <MemoPoiFeature
                      key={layer.item.id}
                      feature={layer.item}
                      isSelected={isSelected}
                      viewMode={viewMode}
                      onSelect={handleSelectFeature}
                      onStartDrag={handleFeatureMouseDown}
                    />
                  );
                }
                return null;
              })}

              {/* PASS 2 FOR ROADS: All white surfaces rendered ON TOP of all casings */}
              {/* This completely eliminates cutting lines at any crossroads / T-junctions */}
              {allFeaturesSorted
                .filter(
                  (layer): layer is { type: "road"; item: RoadFeature } =>
                    layer.type === "road" &&
                    !hiddenFeatureIds[layer.item.id] &&
                    isFeatureInView(layer.item.id),
                )
                .map(({ item }) => (
                  <RoadSurfaceItem
                    key={`surface-${item.id}`}
                    feature={item}
                    isSelected={selectedFeatureId === item.id}
                    onSelect={handleSelectFeature}
                    onStartDrag={handleFeatureMouseDown}
                    showLabel={!isPanning}
                  />
                ))}
            </g>

            {/* ================================================================= */}
            {/* LIVE DRAWING PREVIEW PATH (IN-PROGRESS)                           */}
            {/* ================================================================= */}
            <ActiveDrawingPreview
              drawingPoints={drawingPoints}
              candidateLineRef={candidateLineRef}
              candidateDotRef={candidateDotRef}
            />

            {/* ================================================================= */}
            {/* SELECTED FEATURE EDITABLE VERTEX HANDLES                          */}
            {/* ================================================================= */}
            {viewMode === "admin" &&
              selectedFeature &&
              "points" in selectedFeature && (
                <g>
                  {(selectedFeature as { points: Point[] }).points.map(
                    (pt, idx) => (
                      <circle
                        key={`v-${idx}`}
                        cx={pt.x}
                        cy={pt.y}
                        r={selectedVertexIndex === idx ? "8" : "6"}
                        fill={
                          selectedVertexIndex === idx ? "#EA580C" : "#2563EB"
                        }
                        stroke="#FFFFFF"
                        strokeWidth="2.5"
                        className="cursor-move shadow-md"
                        onMouseDown={(e) => {
                          e.stopPropagation();
                          setSelectedVertexIndex(idx);
                          setIsDraggingVertex(true);
                        }}
                      />
                    ),
                  )}
                </g>
              )}

            {/* Phone Viewport Simulator Overlay */}
            {showPhoneOverlay && (
              <g pointerEvents="none" opacity="0.9">
                <rect
                  x="1450"
                  y="200"
                  width="500"
                  height="888"
                  fill="none"
                  stroke="#38BDF8"
                  strokeWidth="3"
                  strokeDasharray="8 6"
                  rx="40"
                />
                <rect
                  x="1630"
                  y="210"
                  width="140"
                  height="24"
                  rx="12"
                  fill="#38BDF8"
                  opacity="0.35"
                />
                <text
                  x="1700"
                  y="260"
                  fill="#38BDF8"
                  fontSize="13"
                  fontWeight="bold"
                  textAnchor="middle"
                  letterSpacing="1"
                >
                  MÔ PHỎNG KHUNG NHÌN IPHONE TRONG GAME
                </text>
              </g>
            )}
          </svg>
        </div>
  );
}
