import type { Evidence } from "@/lib/types";

export interface PDFDocument {
  id: string;
  title: string;
  code: string;
  url: string;
  phase: number;
  order: number;
  dossierKey?: string;
  dossierTitle?: string;
}

export interface PhysicalEvidence extends Evidence {
  code: string;
  phase: number;
  order: number;
  dossierKey?: string;
  dossierTitle?: string;
}

export type SelectedView =
  | { type: "pdf"; data: PDFDocument }
  | { type: "evidence"; data: PhysicalEvidence };

export type CombinedItem =
  | {
      type: "pdf";
      data: PDFDocument;
      phase: number;
      order: number;
      dossierKey?: string;
      dossierTitle?: string;
    }
  | {
      type: "evidence";
      data: PhysicalEvidence;
      phase: number;
      order: number;
      dossierKey?: string;
      dossierTitle?: string;
    };
