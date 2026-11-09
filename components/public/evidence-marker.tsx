/**
 * Yellow A-frame evidence marker (crime-scene numbered tent), drawn in CSS.
 * Place it absolutely on top of a visual, like a marker set down next to the evidence.
 */
export function EvidenceMarker({
  n,
  className = "",
}: {
  n: number;
  className?: string;
}) {
  return (
    <div
      aria-hidden="true"
      className={`pointer-events-none relative h-11 w-12 sm:h-12 sm:w-[52px] drop-shadow-[0_6px_8px_rgba(0,0,0,0.75)] ${className}`}
    >
      {/* Top fold of the tent */}
      <div className="absolute left-[22%] right-[22%] top-0 h-[16%] bg-[#c99300] [clip-path:polygon(0_100%,100%_100%,92%_0,8%_0)]" />
      {/* Front face with the number */}
      <div className="absolute inset-x-[8%] bottom-0 top-[14%] flex items-center justify-center bg-[#f5b70a] pt-1 font-sans text-xl font-black leading-none text-zinc-950 sm:text-2xl [clip-path:polygon(14%_0,86%_0,100%_100%,0_100%)]">
        {n}
      </div>
    </div>
  );
}
