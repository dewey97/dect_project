import type { Checkpoint } from "@/lib/types";

export interface CheckpointFormCommonProps {
  checkpoint: Checkpoint;
  hasSuccess: boolean;
}

export interface CheckpointResultModalState {
  isOpen: boolean;
  type: "success" | "error";
  message: string;
  onProceed?: () => void;
}
