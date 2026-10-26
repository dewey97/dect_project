import type { AnnotationStroke } from "@/lib/types/room";

export interface AnnotationHistoryEntry {
  documentId: string;
  stroke: AnnotationStroke;
}

// Global in-memory stack for cross-document undo / redo
const undoStack: AnnotationHistoryEntry[] = [];
const redoStack: AnnotationHistoryEntry[] = [];

/**
 * Ghi nhận một nét vẽ mới hoàn thành vào lịch sử Undo
 */
export function recordAnnotationStroke(documentId: string, stroke: AnnotationStroke) {
  undoStack.push({ documentId, stroke });
  // Xóa redo stack khi có thao tác mới
  redoStack.length = 0;
  if (undoStack.length > 100) {
    undoStack.shift();
  }
}

/**
 * Lấy ra thao tác vẽ gần nhất để hoàn tác (Undo)
 */
export function popAnnotationUndo(): AnnotationHistoryEntry | null {
  const item = undoStack.pop();
  if (item) {
    redoStack.push(item);
    return item;
  }
  return null;
}

/**
 * Lấy ra thao tác vừa hoàn tác để làm lại (Redo)
 */
export function popAnnotationRedo(): AnnotationHistoryEntry | null {
  const item = redoStack.pop();
  if (item) {
    undoStack.push(item);
    return item;
  }
  return null;
}

export function canUndoAnnotation(): boolean {
  return undoStack.length > 0;
}

export function canRedoAnnotation(): boolean {
  return redoStack.length > 0;
}
