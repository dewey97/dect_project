import type { Metadata } from "next";
import { LandingNavbar } from "@/components/public/landing-navbar";
import { LandingFooter } from "@/components/public/landing-footer";

export const metadata: Metadata = {
  title: "Điều Khoản Dịch Vụ | XPLORE",
  description:
    "Quy định và điều khoản sử dụng nền tảng trò chơi trinh thám tương tác XPLORE.",
};

export default function TermsPage() {
  return (
    <div className="min-h-screen bg-background text-foreground font-sans antialiased relative flex flex-col justify-between selection:bg-amber-500 selection:text-zinc-950">
      {/* Sticky Top Header */}
      <LandingNavbar />

      {/* Main Container: Văn bản pháp lý thuần túy, sạch sẽ, không khung viền rườm rà */}
      <main className="flex-1 w-full max-w-3xl mx-auto px-6 py-12 sm:py-16">
        {/* Header Title */}
        <div className="space-y-2 pb-8 mb-10 border-b border-zinc-800/80">
          <h1 className="text-3xl sm:text-4xl font-black uppercase tracking-tight text-zinc-100 font-sans">
            ĐIỀU KHOẢN DỊCH VỤ
          </h1>
          <p className="text-xs text-zinc-500 font-mono">
            Áp dụng từ: Tháng 01/2026 • Cập nhật lần cuối: Tháng 03/2026
          </p>
        </div>

        {/* Legal Text Body */}
        <div className="space-y-8 text-[13.5px] text-zinc-300 leading-relaxed font-sans">
          {/* Điều 1 */}
          <section className="space-y-2.5">
            <h2 className="text-base font-bold uppercase tracking-wide text-zinc-100 font-mono">
              Điều 1. Phạm vi áp dụng & Chấp thuận điều khoản
            </h2>
            <p>
              1.1. Các điều khoản này quy định quyền và nghĩa vụ giữa người chơi (sau đây gọi là &quot;Người dùng&quot;) và Ban điều hành nền tảng trò chơi trinh thám tương tác XPLORE (sau đây gọi là &quot;XPLORE&quot;).
            </p>
            <p>
              1.2. Bằng việc truy cập hệ thống, đăng ký tài khoản, tham gia bàn điều tra trực tuyến hoặc kích hoạt mã hộp vật lý, Người dùng mặc nhiên đồng ý tuân thủ toàn bộ các nội dung quy định tại văn bản này.
            </p>
          </section>

          {/* Điều 2 */}
          <section className="space-y-2.5">
            <h2 className="text-base font-bold uppercase tracking-wide text-zinc-100 font-mono">
              Điều 2. Quyền sở hữu trí tuệ & Bản quyền kịch bản
            </h2>
            <p>
              2.1. Toàn bộ kịch bản vụ án, cốt truyện, thông tin nhân vật, ảnh chụp hiện trường, tài liệu giám định pháp y, âm thanh và mã nguồn trò chơi là tài sản trí tuệ độc quyền của XPLORE và được pháp luật bảo hộ.
            </p>
            <p>
              2.2. Người dùng được cấp quyền trải nghiệm giải trí cá nhân hoặc theo nhóm bạn bè. Nghiêm cấm sao chép, trích xuất dữ liệu, phát tán nội dung lên mạng xã hội, chia sẻ lời giải hoặc thương mại hóa tài liệu vụ án dưới mọi hình thức mà không có sự đồng ý bằng văn bản từ XPLORE.
            </p>
          </section>

          {/* Điều 3 */}
          <section className="space-y-2.5">
            <h2 className="text-base font-bold uppercase tracking-wide text-zinc-100 font-mono">
              Điều 3. Tài khoản người chơi & Trách nhiệm bảo mật
            </h2>
            <p>
              3.1. Người dùng có trách nhiệm tự bảo mật thông tin đăng nhập và địa chỉ email dùng để truy cập dịch vụ.
            </p>
            <p>
              3.2. Nhằm tôn trọng trải nghiệm chung của cộng đồng, Người dùng cam kết không tiết lộ danh tính hung thủ, phương thức gây án hoặc các manh mối mấu chốt (spoilers) tại các kênh thảo luận công cộng khi chưa có gắn nhãn cảnh báo trước.
            </p>
          </section>

          {/* Điều 4 */}
          <section className="space-y-2.5">
            <h2 className="text-base font-bold uppercase tracking-wide text-zinc-100 font-mono">
              Điều 4. Mở khóa vụ án, Thanh toán & Giao nhận
            </h2>
            <p>
              4.1. <strong>Bản trực tuyến:</strong> Thanh toán được thực hiện an toàn qua cổng thanh toán đối tác (PayOS). Sau khi giao dịch thành công, quyền phá án được mở khóa vĩnh viễn trên tài khoản người mua.
            </p>
            <p>
              4.2. <strong>Hộp hồ sơ vật lý:</strong> Được vận chuyển theo bưu điện tới địa chỉ Người dùng cung cấp. Người dùng có trách nhiệm kiểm tra tính nguyên vẹn của tem niêm phong hộp khi nhận hàng.
            </p>
            <p>
              4.3. <strong>Chính sách đổi trả & Hoàn tiền:</strong> XPLORE hỗ trợ đổi mới 1-1 trong 7 ngày đối với sản phẩm hộp vật lý bị lỗi in ấn, thiếu tài liệu hoặc hư hỏng do vận chuyển. Các gói mở khóa trực tuyến đã kích hoạt không áp dụng hoàn tiền trừ trường hợp phát sinh lỗi kỹ thuật hệ thống kéo dài từ máy chủ.
            </p>
          </section>

          {/* Điều 5 */}
          <section className="space-y-2.5">
            <h2 className="text-base font-bold uppercase tracking-wide text-zinc-100 font-mono">
              Điều 5. Quy chế phòng chơi nhóm trực tuyến
            </h2>
            <p>
              5.1. Người tạo phòng (Host) có quyền quản trị phòng chơi, mời thành viên tham gia hoặc loại bỏ thành viên vi phạm khỏi phiên điều tra.
            </p>
            <p>
              5.2. Nghiêm cấm các hành vi gửi yêu cầu phá hoại, spam kết nối realtime hoặc can thiệp trái phép vào tiến trình giải đố của các thành viên khác trong phòng.
            </p>
          </section>

          {/* Điều 6 */}
          <section className="space-y-2.5">
            <h2 className="text-base font-bold uppercase tracking-wide text-zinc-100 font-mono">
              Điều 6. Sửa đổi điều khoản & Liên hệ hỗ trợ
            </h2>
            <p>
              6.1. XPLORE có quyền điều chỉnh nội dung các điều khoản để phù hợp với quy định pháp luật và sự phát triển của hệ thống. Các thay đổi sẽ có hiệu lực ngay khi được công bố trên trang web.
            </p>
            <p>
              6.2. Mọi thắc mắc, khiếu nại hoặc yêu cầu hỗ trợ kỹ thuật, vui lòng gửi thư điện tử về hòm thư: <span className="text-amber-400 font-mono">support@xplore.vn</span>.
            </p>
          </section>
        </div>
      </main>

      {/* Footer */}
      <LandingFooter />
    </div>
  );
}
