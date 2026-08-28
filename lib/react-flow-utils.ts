import { Position, InternalNode } from '@xyflow/react';

// Trả về trung tâm (x,y) của một Node
function getNodeCenter(node: InternalNode) {
  return {
    x: node.internals.positionAbsolute.x + (node.measured.width || 0) / 2,
    y: node.internals.positionAbsolute.y + (node.measured.height || 0) / 2,
  };
}

// Tính toán giao điểm của đoạn thẳng nối tâm 2 Node với đường viền (bounding box) của Node nguồn
function getNodeIntersection(intersectionNode: InternalNode, targetNode: InternalNode) {
  const {
    width: intersectionNodeWidth,
    height: intersectionNodeHeight,
  } = intersectionNode.measured;
  
  const intersectionNodePosition = intersectionNode.internals.positionAbsolute;
  const targetPosition = getNodeCenter(targetNode);

  if (!intersectionNodeWidth || !intersectionNodeHeight) {
    return { x: 0, y: 0 };
  }

  const w = intersectionNodeWidth / 2;
  const h = intersectionNodeHeight / 2;

  const x2 = intersectionNodePosition.x + w;
  const y2 = intersectionNodePosition.y + h;
  const x1 = targetPosition.x;
  const y1 = targetPosition.y;

  const xx1 = (x1 - x2) / (2 * w) - (y1 - y2) / (2 * h);
  const yy1 = (x1 - x2) / (2 * w) + (y1 - y2) / (2 * h);
  const a = 1 / (Math.abs(xx1) + Math.abs(yy1));
  const xx3 = a * xx1;
  const yy3 = a * yy1;
  const x = w * (xx3 + yy3) + x2;
  const y = h * (-xx3 + yy3) + y2;

  return { x, y };
}

// Dựa vào vị trí tương đối để quyết định Handle là Top, Bottom, Left hay Right
function getEdgePosition(node: InternalNode, intersectionPoint: { x: number; y: number }) {
  const n = { ...node.internals.positionAbsolute, ...node.measured };
  
  if (!n.width || !n.height) return Position.Top;

  const nx = Math.round(n.x);
  const ny = Math.round(n.y);
  const px = Math.round(intersectionPoint.x);
  const py = Math.round(intersectionPoint.y);

  if (px <= nx + 1) {
    return Position.Left;
  }
  if (px >= nx + n.width - 1) {
    return Position.Right;
  }
  if (py <= ny + 1) {
    return Position.Top;
  }
  if (py >= ny + n.height - 1) {
    return Position.Bottom;
  }

  return Position.Top;
}

// Trả về thông số để vẽ Edge (Tọa độ X,Y bắt đầu và kết thúc cùng vị trí Cổng)
export function getEdgeParams(source: InternalNode, target: InternalNode) {
  const sourceIntersectionPoint = getNodeIntersection(source, target);
  const targetIntersectionPoint = getNodeIntersection(target, source);

  const sourcePos = getEdgePosition(source, sourceIntersectionPoint);
  const targetPos = getEdgePosition(target, targetIntersectionPoint);

  return {
    sx: sourceIntersectionPoint.x,
    sy: sourceIntersectionPoint.y,
    tx: targetIntersectionPoint.x,
    ty: targetIntersectionPoint.y,
    sourcePos,
    targetPos,
  };
}
