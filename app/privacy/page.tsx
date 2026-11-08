import type { Metadata } from "next";
import { LandingNavbar } from "@/components/public/landing-navbar";
import { LandingFooter } from "@/components/public/landing-footer";

export const metadata: Metadata = {
  title: "Chính Sách Bảo Mật | XPLORE",
  description:
    "Cam kết bảo vệ dữ liệu cá nhân và thông tin người chơi của XPLORE Detective System.",
};

export default function PrivacyPage() {
  return (
    <div className="min-h-screen bg-background text-foreground font-sans antialiased relative flex flex-col justify-between selection:bg-amber-500 selection:text-zinc-950">
      {/* Sticky Top Header */}
      <LandingNavbar />

      {/* Main Container: Văn bản chính sách thuần túy, sạch sẽ, không khung viền rườm rà */}
      <main className="flex-1 w-full max-w-3xl mx-auto px-6 py-12 sm:py-16">
        {/* Header Title */}
        <div className="space-y-2 pb-8 mb-10 border-b border-zinc-800/80">
          <h1 className="text-3xl sm:text-4xl font-black uppercase tracking-tight text-zinc-100 font-sans">
            CHÍNH SÁCH BẢO MẬT
          </h1>
          <p className="text-xs text-zinc-500 font-mono">
            Áp dụng từ: Tháng 01/2026 • Cập nhật lần cuối: Tháng 03/2026
          </p>
        </div>

        {/* Legal Text Body */}
        <div className="space-y-8 text-[13.5px] text-zinc-300 leading-relaxed font-sans">
          {/* Mục 1 */}
          <section className="space-y-2.5">
            <h2 className="text-base font-bold uppercase tracking-wide text-zinc-100 font-mono">
              1. Nguyên tắc bảo vệ quyền riêng tư
            </h2>
            <p>
              XPLORE tôn trọng và cam kết bảo vệ dữ liệu cá nhân của người chơi. Chúng tôi áp dụng các tiêu chuẩn kỹ thuật hiện đại để ngăn chặn việc truy cập trái phép, rò rỉ hoặc sử dụng sai mục đích các thông tin được người dùng cung cấp.
            </p>
          </section>

          {/* Mục 2 */}
          <section className="space-y-2.5">
            <h2 className="text-base font-bold uppercase tracking-wide text-zinc-100 font-mono">
              2. Các loại thông tin thu thập
            </h2>
            <p>
              Chúng tôi chỉ thu thập các dữ liệu tối thiểu cần thiết để tạo lập tài khoản, lưu tiến trình phá án và hoàn tất đơn hàng:
            </p>
            <p>
              - <strong>Thông tin định danh tài khoản:</strong> Địa chỉ email đăng nhập, biệt danh (nickname) hiển thị trên bàn điều tra.
            </p>
            <p>
              - <strong>Dữ liệu phiên chơi:</strong> Ghi chú cá nhân, các điểm mâu thuẫn đã giải mã, trạng thái hoàn thành chuyên án và thời gian điều tra để phục vụ việc tiếp tục phiên chơi sau đó.
            </p>
            <p>
              - <strong>Thông tin giao nhận hàng:</strong> Họ tên, số điện thoại và địa chỉ nhận hàng đối với các đơn đặt mua hộp hồ sơ vật lý.
            </p>
          </section>

          {/* Mục 3 */}
          <section className="space-y-2.5">
            <h2 className="text-base font-bold uppercase tracking-wide text-zinc-100 font-mono">
              3. Bảo mật thanh toán trực tuyến
            </h2>
            <p>
              Mọi giao dịch thanh toán trực tuyến trên XPLORE được thực hiện qua cổng thanh toán được cấp phép (PayOS). XPLORE tuyệt đối <strong>không lưu giữ</strong> thông tin thẻ ngân hàng, số CVV hoặc mật khẩu giao dịch tài chính của người dùng trên bất kỳ hệ thống máy chủ nào của chúng tôi.
            </p>
          </section>

          {/* Mục 4 */}
          <section className="space-y-2.5">
            <h2 className="text-base font-bold uppercase tracking-wide text-zinc-100 font-mono">
              4. Cam kết không chia sẻ dữ liệu
            </h2>
            <p>
              XPLORE cam kết không bán, không cho thuê và không chia sẻ thông tin cá nhân của người dùng cho bất kỳ bên thứ ba nào vì mục đích quảng cáo thương mại.
            </p>
            <p>
              Dữ liệu chỉ được cung cấp cho các đối tác bưu chính nhằm thực hiện việc giao nhận hộp vật lý, hoặc trong các trường hợp bắt buộc tuân thủ theo yêu cầu của cơ quan pháp luật có thẩm quyền tại Việt Nam.
            </p>
          </section>

          {/* Mục 5 */}
          <section className="space-y-2.5">
            <h2 className="text-base font-bold uppercase tracking-wide text-zinc-100 font-mono">
              5. Quyền của người chơi đối với dữ liệu
            </h2>
            <p>
              Người dùng có quyền kiểm tra, chỉnh sửa hoặc yêu cầu xóa bỏ vĩnh viễn tài khoản và toàn bộ dữ liệu lịch sử điều tra của mình khỏi hệ thống bất cứ lúc nào. Người dùng cũng có thể hủy đăng ký nhận email thông báo vụ án mới thông qua liên kết hủy nhận thư ở cuối mỗi email.
            </p>
          </section>

          {/* Mục 6 */}
          <section className="space-y-2.5">
            <h2 className="text-base font-bold uppercase tracking-wide text-zinc-100 font-mono">
              6. Thông tin liên hệ về bảo mật
            </h2>
            <p>
              Nếu bạn có bất kỳ câu hỏi hoặc khiếu nại nào liên quan đến quyền riêng tư và chính sách bảo mật dữ liệu, xin vui lòng gửi thư điện tử về: <span className="text-amber-400 font-mono">privacy@xplore.vn</span>.
            </p>
          </section>
        </div>
      </main>

      {/* Footer */}
      <LandingFooter />
    </div>
  );
}
