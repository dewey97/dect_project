import { getBezierPath } from '@xyflow/react';
import type { ConnectionLineComponentProps } from '@xyflow/react';
import { getEdgeParams } from '@/lib/react-flow-utils';

function FloatingConnectionLine({
  toX,
  toY,
  fromPosition,
  toPosition,
  fromNode,
}: ConnectionLineComponentProps) {
  if (!fromNode) {
    return null;
  }

  const targetNode = {
    id: 'connection-target',
    measured: {
      width: 1,
      height: 1,
    },
    internals: {
      positionAbsolute: { x: toX, y: toY },
    },
  } as any; // Mock node để truyền vào hàm getEdgeParams

  const { sx, sy } = getEdgeParams(fromNode, targetNode);
  
  // Tính toán lại vị trí dựa trên góc kéo
  const [edgePath] = getBezierPath({
    sourceX: sx,
    sourceY: sy,
    sourcePosition: fromPosition,
    targetPosition: toPosition,
    targetX: toX,
    targetY: toY,
  });

  return (
    <g>
      <path
        fill="none"
        stroke="#f43f5e"
        strokeWidth={2}
        className="animated"
        d={edgePath}
      />
      <circle
        cx={toX}
        cy={toY}
        fill="#fff"
        r={3}
        stroke="#f43f5e"
        strokeWidth={1.5}
      />
    </g>
  );
}

export default FloatingConnectionLine;
