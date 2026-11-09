import { EvidenceMarker } from "./evidence-marker";

export function LandingPhoneShowcase() {
  return (
    <div
      id="dien-thoai-nan-nhan"
      className="relative w-full pt-6 sm:pt-8 select-none"
    >
      <div className="w-full flex flex-col gap-4 sm:gap-5">
        {/* Victim's phone sealed in an evidence bag (static, no hover effect) */}
        <div className="relative w-full flex items-center justify-center md:justify-start py-2 order-2">
          <div className="relative max-w-[210px] sm:max-w-[240px] md:max-w-[260px]">
            <img
              src="/images/cases/case_000/victim_phone_bag.webp"
              alt="Điện thoại của nạn nhân trong túi zip tang vật"
              width={600}
              height={777}
              className="w-full h-auto object-contain select-none pointer-events-none drop-shadow-[0_20px_40px_rgba(0,0,0,0.9)]"
              draggable={false}
            />
          </div>
        </div>

        {/* Title */}
        <div className="flex flex-col items-start text-left gap-3 max-w-lg z-10 order-1">
          <div className="flex items-end gap-3">
            <EvidenceMarker n={1} className="shrink-0 -rotate-[8deg]" />
            <h3 className="text-xl sm:text-2xl font-bold tracking-tight text-stone-200 font-sans">
              Điện thoại nạn nhân
            </h3>
          </div>
        </div>
      </div>
    </div>
  );
}
