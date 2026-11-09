"use client";

import { useState } from "react";
import { SafeImg } from "@/components/ui/safe-img";
import { Skull, Target, Clock, ShieldCheck, CheckCircle2 } from "lucide-react";

interface GoldenRule {
  id: "means" | "motive" | "opportunity";
  code: string;
  title: string;
  subtitle: string;
  icon: typeof Skull;
  description: string;
  checklist: string[];
  evidenceImg: string;
  evidenceCaption: string;
}

const GOLDEN_RULES: GoldenRule[] = [
  {
    id: "means",
    code: "RULE #01",
    title: "Hung Khí & Phương Thức",
    subtitle: "Công cụ gây án và nguyên nhân tử vong",
    icon: Skull,
    description:
      "Hung khí là chữ ký của kẻ thủ ác — phương pháp và vật chứng cụ thể tước đoạt sinh mạng nạn nhân. Không chỉ là hung khí vật lý, hung khí có thể là độc dược, bẫy cơ học hay thao túng môi trường hiện trường.",
    checklist: [
      "Đối chiếu báo cáo giám định pháp y và thời gian tử vong ước tính.",
      "Kiểm tra hung khí thu giữ có khớp với đặc điểm cơ học của vết thương.",
      "Xác định ai là người có quyền tiếp cận hoặc sở hữu hung khí trước thời điểm án mạng.",
    ],
    evidenceImg: "/images/landing/means_evidence.png",
    evidenceCaption: "Vật chứng tang vật thu thập tại hiện trường // Phân tích pháp y",
  },
  {
    id: "motive",
    code: "RULE #02",
    title: "Động Cơ Phạm Tội",
    subtitle: "Lợi ích, thù oán và lý do phải ra tay",
    icon: Target,
    description:
      "Động cơ là ngòi nổ tội ác — tiền bạc, tình ái, thù hận cá nhân hoặc một bí mật đen tối cần chôn giấu vĩnh viễn. Trong vụ án phòng kín, kẻ có vẻ đau buồn nhất đôi khi lại là kẻ có động cơ tàn nhẫn nhất.",
    checklist: [
      "Bóc tách các mối quan hệ tài chính, di chúc và tranh chấp quyền lợi.",
      "Tìm kiếm thư tống tiền, tin nhắn đe dọa hoặc nhật ký bị xé rách.",
      "Soi chiếu mâu thuẫn giữa lời khai của nghi phạm với nhân chứng thứ ba.",
    ],
    evidenceImg: "/images/landing/motive_evidence.png",
    evidenceCaption: "Hồ sơ trích xuất quan hệ & Tin nhắn bí mật của đối tượng tình nghi",
  },
  {
    id: "opportunity",
    code: "RULE #03",
    title: "Cơ Hội Tiếp Cận",
    subtitle: "Thời điểm gây án và bằng chứng ngoại phạm",
    icon: Clock,
    description:
      "Cơ hội là khả năng tiếp cận hiện trường vào đúng thời khắc nạn nhân bị sát hại mà không bị phát giác. Kẻ thủ ác luôn cố gắng dàn dựng các bằng chứng ngoại phạm tinh vi bằng đồng hồ hẹn giờ hoặc nhân chứng ngụy tạo.",
    checklist: [
      "Dựng lại dòng thời gian (timeline) di chuyển của từng đối tượng trước và sau vụ án.",
      "Lật tẩy các khoảng trống thời gian không thể giải trình trong lịch trình.",
      "Kiểm tra then cửa, ổ khóa và các lối thoát hiểm có dấu hiệu ngụy tạo phòng kín.",
    ],
    evidenceImg: "/images/landing/opportunity_evidence.png",
    evidenceCaption: "Bản đồ di chuyển và biên bản xác minh chứng cứ ngoại phạm",
  },
];

export function GameRulesShowcase() {
  const [activeRuleId, setActiveRuleId] = useState<"means" | "motive" | "opportunity">("means");

  const activeRule = GOLDEN_RULES.find((r) => r.id === activeRuleId) || GOLDEN_RULES[0];
  const IconComponent = activeRule.icon;

  return (
    <div className="w-full max-w-5xl px-4 sm:px-6">
      {/* 3 Tabs Rule Switcher */}
      <div className="grid grid-cols-3 gap-2 sm:gap-3 mb-6">
        {GOLDEN_RULES.map((rule) => {
          const isActive = rule.id === activeRuleId;
          const RuleIcon = rule.icon;
          return (
            <button
              key={rule.id}
              type="button"
              onClick={() => setActiveRuleId(rule.id)}
              className={`flex flex-col sm:flex-row items-center justify-center gap-2 rounded-none border p-3.5 sm:p-4 text-center transition-all cursor-pointer ${
                isActive
                  ? "border-amber-500 bg-amber-500/10 text-amber-300 shadow-sm"
                  : "border-zinc-800 bg-zinc-900/40 text-zinc-400 hover:border-zinc-700 hover:text-zinc-200"
              }`}
            >
              <RuleIcon className={`size-4 sm:size-4.5 ${isActive ? "text-amber-400" : "text-zinc-500"}`} />
              <div className="flex flex-col items-center sm:items-start text-left">
                <span className="font-mono text-xs uppercase tracking-widest text-zinc-500">
                  {rule.code}
                </span>
                <span className="text-xs sm:text-sm font-bold uppercase tracking-wider">
                  {rule.id === "means" ? "Hung Khí" : rule.id === "motive" ? "Động Cơ" : "Cơ Hội"}
                </span>
              </div>
            </button>
          );
        })}
      </div>

      {/* Active Rule Details Showcase (Split 2 Columns) */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 rounded-none border border-zinc-800/80 bg-zinc-950/60 p-5 sm:p-8">
        {/* Left Col: Explanations & Checklist */}
        <div className="lg:col-span-7 flex flex-col justify-between space-y-5">
          <div className="space-y-3">
            <div className="flex items-center gap-2 text-amber-400 font-mono text-xs uppercase tracking-widest">
              <IconComponent className="size-4" />
              <span>{activeRule.code} // TAM GIÁC PHÁ ÁN</span>
            </div>

            <h3 className="text-xl sm:text-2xl font-black uppercase text-zinc-100 tracking-tight">
              {activeRule.title}
            </h3>

            <p className="text-xs sm:text-sm text-zinc-400 leading-relaxed font-sans">
              {activeRule.description}
            </p>
          </div>

          {/* Checklist */}
          <div className="space-y-2 border-t border-zinc-800/80 pt-4">
            <span className="font-mono text-xs font-bold uppercase tracking-wider text-zinc-300 flex items-center gap-1.5">
              <ShieldCheck className="size-3.5 text-amber-400" />
              Checklist nghiệp vụ bắt buộc:
            </span>
            <ul className="space-y-2">
              {activeRule.checklist.map((item, idx) => (
                <li key={idx} className="flex items-start gap-2 text-xs text-zinc-300 leading-relaxed">
                  <CheckCircle2 className="size-3.5 text-amber-400 shrink-0 mt-0.5" />
                  <span>{item}</span>
                </li>
              ))}
            </ul>
          </div>
        </div>

        {/* Right Col: Evidence Photo Card */}
        <div className="lg:col-span-5 flex flex-col justify-center">
          <div className="relative aspect-[4/3] w-full overflow-hidden rounded-none border border-zinc-800 bg-zinc-950 p-2 flex items-center justify-center">
            <SafeImg
              src={activeRule.evidenceImg}
              fallbackSrc="/poster_c0.webp"
              alt={activeRule.title}
              className="h-full w-full object-contain grayscale contrast-125 transition-transform duration-300 hover:scale-105"
            />
            <div className="absolute top-2 left-2 bg-black/80 px-2 py-0.5 font-mono text-xs uppercase tracking-wider text-amber-400">
              VẬT CHỨNG ĐỐI CHIẾU
            </div>
          </div>
          <p className="mt-2 text-center font-sans text-sm text-zinc-500">
            {activeRule.evidenceCaption}
          </p>
        </div>
      </div>
    </div>
  );
}
