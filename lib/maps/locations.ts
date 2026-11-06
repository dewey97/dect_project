/**
 * Map location and route types for the phone Maps app.
 * Locations come from the vector world map (`map_vectors`, POI features);
 * see lib/maps/vector-utils.ts and docs/architecture/vector_map_engine.md.
 */

export type LocationCategory =
  | "residential"
  | "food"
  | "shopping"
  | "transit"
  | "finance"
  | "public"
  | "crime_scene"
  | "government"
  | "entertainment";

export interface CaseLocation {
  id: string;
  name: string;
  shortName: string;
  address: string;
  category: LocationCategory;
  categoryLabel?: string;
  x: number; // map canvas X
  y: number; // map canvas Y
  lat: number;
  lng: number;
  description: string;
  rating?: number;
  reviewCount?: number;
  openingHours?: string;
  plusCode?: string;
  phone?: string;
  roadNodeId: string;
  distanceFromScene?: string;
  travelTime?: string;
}

export type TransportMode = "motorbike" | "car" | "walk" | "transit";

export interface RouteStep {
  instruction: string;
  distance: string;
  iconType: "straight" | "turn-left" | "turn-right" | "arrive";
  subInstruction?: string;
}

export interface RouteResult {
  origin: CaseLocation;
  destination: CaseLocation;
  mode: TransportMode;
  distanceKm: number;
  distanceText: string;
  durationMinutes: number;
  durationText: string;
  trafficStatus: "good" | "moderate" | "slow";
  viaRoute: string;
  points: { x: number; y: number }[];
  latLngs: [number, number][];
  steps: RouteStep[];
  alternativePoints?: { x: number; y: number }[];
  alternativeLatLngs?: [number, number][];
  alternativeDistanceText?: string;
  alternativeDurationText?: string;
  alternativeViaRoute?: string;
  alternativeDurationMinutes?: number;
  fareEstimate?: string;
}

/** Location codes printed as dots on the scanned paper map of case_000. */
const SCANNED_MAP_DOT_CODES = new Set([
  "1",
  "2",
  "3",
  "4",
  "5",
  "6",
  "7",
  "8",
  "9",
  "12",
  "13",
  "17",
]);

export function isScannedMapLocation(id: string): boolean {
  if (!id) return false;
  const norm = id.replace(/^loc-0?/, "");
  return SCANNED_MAP_DOT_CODES.has(norm) || SCANNED_MAP_DOT_CODES.has(id);
}
