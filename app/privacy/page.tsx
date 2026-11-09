import type { Metadata } from "next";
import {
  LegalDocument,
  LEGAL_ENTITY,
  type LegalSection,
} from "@/components/public/legal-document";

export const metadata: Metadata = {
  title: "Chính Sách Bảo Mật | XPLORE",
  description:
    "Cách XPLORE thu thập, sử dụng, lưu trữ và bảo vệ dữ liệu cá nhân của người chơi.",
};

const E = LEGAL_ENTITY;

const SECTIONS: LegalSection[] = [
  {
    id: "quy-dinh-chung",
    title: "Quy định chung",
    body: (
      <>
        <p>
          Chính sách này giải thích cách nền tảng trò chơi trinh thám XPLORE
          (&quot;XPLORE&quot;, &quot;chúng tôi&quot;) thu thập, sử dụng, lưu
          trữ, chia sẻ và bảo vệ dữ liệu cá nhân của người dùng khi truy cập
          website, tạo tài khoản, chơi trực tuyến hoặc mua bộ hồ sơ vật lý.
        </p>
        {E.published && (
          <p>
            Đơn vị kiểm soát và xử lý dữ liệu: <strong>{E.name}</strong>, mã
            số thuế {E.taxCode}, địa chỉ {E.address}.
          </p>
        )}
        <p>
          Chúng tôi xử lý dữ liệu theo nguyên tắc: hợp pháp, minh bạch, chỉ thu
          thập ở mức tối thiểu cần thiết, đúng mục đích đã thông báo, và chỉ lưu
          trữ trong thời gian cần thiết.
        </p>
      </>
    ),
  },
  {
    id: "du-lieu-thu-thap",
    title: "Các loại dữ liệu cá nhân chúng tôi thu thập",
    body: (
      <ul>
        <li>
          <strong>Thông tin tài khoản:</strong> địa chỉ email, tên hiển thị, ảnh
          đại diện (nếu đăng nhập bằng Google), mật khẩu đã được mã hóa (nếu
          đăng ký bằng email).
        </li>
        <li>
          <strong>Dữ liệu chơi game:</strong> tiến độ phá án, ghi chú cá nhân,
          câu trả lời đã nộp, gợi ý đã mở, thời gian chơi, thông tin phòng chơi
          nhóm.
        </li>
        <li>
          <strong>Thông tin đơn hàng và giao nhận:</strong> họ tên, số điện
          thoại, địa chỉ nhận hàng, sản phẩm đã mua, mã đơn và trạng thái thanh
          toán.
        </li>
        <li>
          <strong>Dữ liệu kỹ thuật:</strong> loại thiết bị, trình duyệt, địa chỉ
          IP, thời điểm truy cập, các thao tác trên trang (ví dụ xem hồ sơ, mở
          ứng dụng trong điện thoại tang vật) được ghi nhận ẩn danh hoặc gắn với
          mã người dùng.
        </li>
        <li>
          <strong>Email nhận tin:</strong> địa chỉ email bạn để lại để nhận
          thông tin vụ án mới và ưu đãi.
        </li>
      </ul>
    ),
  },
  {
    id: "nguon-va-muc-dich",
    title: "Nguồn thu thập và mục đích xử lý",
    body: (
      <>
        <p>
          Dữ liệu được thu thập trực tiếp từ bạn (khi đăng ký, đặt hàng, điền
          form), từ dịch vụ đăng nhập Google khi bạn chọn đăng nhập bằng Google,
          và tự động trong quá trình bạn sử dụng website.
        </p>
        <p>Chúng tôi sử dụng dữ liệu để:</p>
        <ul>
          <li>Tạo và quản lý tài khoản, xác thực đăng nhập.</li>
          <li>
            Mở khóa vụ án đã mua, lưu và đồng bộ tiến độ chơi, vận hành phòng
            chơi nhóm.
          </li>
          <li>
            Xử lý thanh toán, giao hộp hồ sơ vật lý, xuất hóa đơn và hỗ trợ đổi
            trả.
          </li>
          <li>
            Gửi thông báo về đơn hàng, tài khoản và (nếu bạn đăng ký) tin vụ án
            mới, ưu đãi.
          </li>
          <li>
            Phân tích cách người chơi sử dụng sản phẩm để cải thiện trải nghiệm
            và độ khó của vụ án.
          </li>
          <li>
            Phát hiện, ngăn chặn gian lận, truy cập trái phép và bảo đảm an toàn
            hệ thống.
          </li>
          <li>Thực hiện nghĩa vụ theo quy định của pháp luật.</li>
        </ul>
        <p>
          Chúng tôi không sử dụng dữ liệu cho mục đích khác khi chưa thông báo
          và chưa có sự đồng ý của bạn.
        </p>
      </>
    ),
  },
  {
    id: "co-so-va-dong-y",
    title: "Cơ sở xử lý và sự đồng ý",
    body: (
      <>
        <p>
          Chúng tôi xử lý dữ liệu dựa trên sự đồng ý của bạn, việc thực hiện hợp
          đồng mua bán và cung cấp dịch vụ giữa bạn với XPLORE, và nghĩa vụ theo
          quy định pháp luật (ví dụ lưu chứng từ kế toán).
        </p>
        <p>
          Bạn thể hiện sự đồng ý khi tạo tài khoản, đặt hàng hoặc đăng ký nhận
          tin sau khi được dẫn tới chính sách này. Bạn có thể rút lại sự đồng ý
          bất kỳ lúc nào. Việc rút lại không ảnh hưởng tới các hoạt động xử lý
          đã diễn ra trước đó, nhưng có thể khiến chúng tôi không tiếp tục cung
          cấp được một số tính năng cần dữ liệu đó.
        </p>
      </>
    ),
  },
  {
    id: "chia-se-du-lieu",
    title: "Chia sẻ và cung cấp dữ liệu",
    body: (
      <>
        <p>
          XPLORE <strong>không bán, không cho thuê</strong> dữ liệu cá nhân của
          bạn. Dữ liệu chỉ được chia sẻ ở mức cần thiết với các bên sau:
        </p>
        <ul>
          <li>
            <strong>Supabase:</strong> lưu trữ cơ sở dữ liệu, tệp và xác thực
            tài khoản.
          </li>
          <li>
            <strong>Google:</strong> đăng nhập bằng tài khoản Google và phân
            tích hành vi sử dụng (Firebase / Google Analytics).
          </li>
          <li>
            <strong>PayOS:</strong> xử lý thanh toán trực tuyến.
          </li>
          <li>
            <strong>Đơn vị vận chuyển:</strong> họ tên, số điện thoại, địa chỉ
            để giao hộp hồ sơ vật lý.
          </li>
          <li>
            <strong>Cơ quan nhà nước có thẩm quyền:</strong> khi có yêu cầu hợp
            pháp theo quy định của pháp luật.
          </li>
        </ul>
        <p>
          Các đối tác chỉ được dùng dữ liệu để thực hiện đúng dịch vụ cho
          XPLORE. Một số đối tác có máy chủ đặt ngoài lãnh thổ Việt Nam. Khi
          chuyển dữ liệu ra nước ngoài, chúng tôi thực hiện các thủ tục và biện
          pháp bảo vệ theo quy định pháp luật về bảo vệ dữ liệu cá nhân.
        </p>
      </>
    ),
  },
  {
    id: "luu-tru-va-bao-ve",
    title: "Lưu trữ và bảo vệ dữ liệu",
    body: (
      <>
        <p>
          <strong>Thời gian lưu trữ:</strong>
        </p>
        <ul>
          <li>
            Dữ liệu tài khoản và tiến độ chơi: trong suốt thời gian tài khoản
            còn hoạt động, và được xóa trong vòng 30 ngày kể từ khi bạn yêu cầu
            xóa tài khoản.
          </li>
          <li>
            Thông tin đơn hàng, hóa đơn, chứng từ thanh toán: theo thời hạn lưu
            trữ chứng từ kế toán mà pháp luật quy định.
          </li>
          <li>Email nhận tin: cho tới khi bạn hủy đăng ký.</li>
          <li>
            Dữ liệu phân tích: theo thời hạn lưu trữ được cấu hình trên dịch vụ
            phân tích.
          </li>
        </ul>
        <p>
          <strong>Biện pháp bảo vệ:</strong>
        </p>
        <ul>
          <li>
            Kết nối được mã hóa qua HTTPS; mật khẩu được lưu ở dạng băm, không
            ai đọc được.
          </li>
          <li>
            Phân quyền truy cập cơ sở dữ liệu theo từng người dùng; chỉ nhân sự
            cần thiết mới được truy cập dữ liệu vận hành.
          </li>
          <li>Theo dõi và ghi nhận truy cập bất thường.</li>
        </ul>
        <p>
          Nếu xảy ra sự cố lộ, mất dữ liệu cá nhân, chúng tôi sẽ thông báo cho
          cơ quan có thẩm quyền và người dùng bị ảnh hưởng trong thời hạn pháp
          luật quy định, kèm các biện pháp khắc phục.
        </p>
      </>
    ),
  },
  {
    id: "quyen-chu-the",
    title: "Quyền của chủ thể dữ liệu",
    body: (
      <>
        <p>Bạn có các quyền sau đối với dữ liệu cá nhân của mình:</p>
        <ul>
          <li>Được biết về việc xử lý dữ liệu của mình.</li>
          <li>Đồng ý hoặc không đồng ý, và rút lại sự đồng ý.</li>
          <li>Truy cập, xem và nhận bản sao dữ liệu của mình.</li>
          <li>Yêu cầu chỉnh sửa dữ liệu không chính xác.</li>
          <li>Yêu cầu xóa dữ liệu hoặc hạn chế xử lý dữ liệu.</li>
          <li>Phản đối việc dùng dữ liệu cho mục đích tiếp thị.</li>
          <li>
            Khiếu nại, tố cáo, khởi kiện và yêu cầu bồi thường thiệt hại theo
            quy định pháp luật.
          </li>
        </ul>
        <p>
          Để thực hiện các quyền này, gửi yêu cầu tới{" "}
          <span className="text-amber-400 font-mono">{E.privacyEmail}</span> từ
          email gắn với tài khoản. Chúng tôi phản hồi trong thời hạn pháp luật
          quy định, thông thường không quá 15 ngày làm việc.
        </p>
      </>
    ),
  },
  {
    id: "tai-khoan-va-tre-em",
    title: "Tài khoản, xóa dữ liệu và người dùng chưa thành niên",
    body: (
      <>
        <p>
          Bạn có thể yêu cầu xóa tài khoản bất kỳ lúc nào. Khi tài khoản bị xóa,
          tiến độ chơi, ghi chú và quyền truy cập các vụ án đã mua trên tài
          khoản đó cũng bị xóa và không khôi phục được. Thông tin đơn hàng vẫn
          được lưu theo nghĩa vụ kế toán.
        </p>
        <p>
          Một số vụ án có nội dung án mạng và yếu tố kinh dị, phù hợp với người
          từ 16 tuổi trở lên. Người dùng dưới 16 tuổi chỉ được tạo tài khoản và
          cung cấp dữ liệu khi có sự đồng ý của cha, mẹ hoặc người giám hộ. Nếu
          phát hiện dữ liệu của trẻ em được cung cấp mà không có sự đồng ý này,
          chúng tôi sẽ xóa dữ liệu đó.
        </p>
      </>
    ),
  },
  {
    id: "thanh-toan",
    title: "Thông tin thanh toán và giao dịch",
    body: (
      <>
        <p>
          Thanh toán trực tuyến được xử lý qua cổng thanh toán PayOS. XPLORE{" "}
          <strong>không lưu trữ</strong> số thẻ, mã CVV, mật khẩu hay mã OTP
          ngân hàng của bạn.
        </p>
        <p>
          Chúng tôi chỉ lưu mã đơn hàng, số tiền, thời điểm và trạng thái giao
          dịch để xác nhận quyền sở hữu vụ án, đối soát và hỗ trợ khi có sự cố.
        </p>
      </>
    ),
  },
  {
    id: "cookie",
    title: "Cookie và công nghệ theo dõi",
    body: (
      <>
        <p>Website sử dụng:</p>
        <ul>
          <li>
            <strong>Cookie cần thiết:</strong> duy trì phiên đăng nhập. Thiếu
            các cookie này, bạn không thể đăng nhập.
          </li>
          <li>
            <strong>Lưu trữ trên trình duyệt:</strong> lưu tạm ghi chú, bố cục
            bàn điều tra và tùy chọn giao diện trên thiết bị của bạn.
          </li>
          <li>
            <strong>Cookie phân tích:</strong> do Google Analytics đặt để thống
            kê lượt truy cập và cách sử dụng tính năng.
          </li>
        </ul>
        <p>
          Bạn có thể chặn hoặc xóa cookie trong cài đặt trình duyệt. Việc chặn
          cookie cần thiết có thể khiến một số tính năng không hoạt động.
        </p>
      </>
    ),
  },
  {
    id: "thay-doi",
    title: "Thay đổi chính sách",
    body: (
      <p>
        Chúng tôi có thể cập nhật chính sách này khi thay đổi dịch vụ hoặc khi
        pháp luật thay đổi. Ngày cập nhật được ghi ở đầu trang. Với thay đổi
        quan trọng ảnh hưởng tới quyền của bạn, chúng tôi sẽ thông báo qua email
        hoặc trên website trước khi áp dụng.
      </p>
    ),
  },
  {
    id: "lien-he",
    title: "Liên hệ và điều khoản cuối cùng",
    body: (
      <>
        <p>
          Mọi câu hỏi, yêu cầu hoặc khiếu nại về dữ liệu cá nhân, vui lòng liên
          hệ: <span className="text-amber-400 font-mono">{E.privacyEmail}</span>
          .
        </p>
        {E.published && (
          <p>
            {E.name} • MST {E.taxCode} • {E.address}
          </p>
        )}
        <p>
          Chính sách này được điều chỉnh bởi pháp luật Việt Nam và là một phần
          không tách rời của{" "}
          <a
            href="/terms"
            className="text-amber-400 hover:underline underline-offset-4"
          >
            Điều khoản dịch vụ
          </a>
          .
        </p>
      </>
    ),
  },
];

export default function PrivacyPage() {
  return (
    <LegalDocument
      title="Chính sách bảo mật"
      effective="Tháng 01/2026"
      updated="Tháng 11/2026"
      sections={SECTIONS}
    />
  );
}
