import type { Metadata } from "next";
import {
  LegalDocument,
  LEGAL_ENTITY,
  type LegalSection,
} from "@/components/public/legal-document";

export const metadata: Metadata = {
  title: "Điều Khoản Dịch Vụ | XPLORE",
  description:
    "Quy định và điều khoản sử dụng nền tảng trò chơi trinh thám tương tác XPLORE.",
};

const E = LEGAL_ENTITY;

const SECTIONS: LegalSection[] = [
  {
    id: "pham-vi",
    title: "Phạm vi áp dụng và chấp thuận điều khoản",
    body: (
      <>
        <p>
          Điều khoản này quy định quyền và nghĩa vụ giữa người dùng và{" "}
          {E.published ? (
            <>
              <strong>{E.name}</strong> (mã số thuế {E.taxCode}),{" "}
            </>
          ) : null}
          đơn vị vận hành nền tảng trò chơi trinh thám XPLORE.
        </p>
        <p>
          Khi truy cập website, tạo tài khoản, mua sản phẩm, tham gia phòng chơi
          hoặc kích hoạt mã trong hộp hồ sơ, bạn xác nhận đã đọc, hiểu và đồng ý
          với Điều khoản này cùng{" "}
          <a
            href="/privacy"
            className="text-amber-400 hover:underline underline-offset-4"
          >
            Chính sách bảo mật
          </a>
          . Nếu không đồng ý, vui lòng ngừng sử dụng dịch vụ.
        </p>
      </>
    ),
  },
  {
    id: "dinh-nghia",
    title: "Định nghĩa",
    body: (
      <ul>
        <li>
          <strong>Vụ án:</strong> một bộ nội dung trò chơi gồm cốt truyện, hồ
          sơ, vật chứng, câu đố và lời giải.
        </li>
        <li>
          <strong>Bản trực tuyến:</strong> quyền chơi một vụ án trên website,
          gắn với tài khoản người mua.
        </li>
        <li>
          <strong>Bản hộp hồ sơ:</strong> bộ tài liệu in và vật chứng được giao
          tận nơi, kèm mã QR mở phần điều tra trên web.
        </li>
        <li>
          <strong>Phòng chơi nhóm:</strong> phiên chơi trực tuyến cho nhiều
          người cùng điều tra một vụ án.
        </li>
      </ul>
    ),
  },
  {
    id: "tai-khoan",
    title: "Điều kiện sử dụng và tài khoản",
    body: (
      <>
        <p>
          Một số vụ án có nội dung án mạng và yếu tố kinh dị, phù hợp với người
          từ 16 tuổi trở lên. Người dưới 16 tuổi cần có sự đồng ý và giám sát
          của cha, mẹ hoặc người giám hộ.
        </p>
        <p>
          Bạn có thể đăng ký bằng email hoặc đăng nhập bằng tài khoản Google.
          Bạn chịu trách nhiệm về tính chính xác của thông tin cung cấp, tự bảo
          mật thông tin đăng nhập và mọi hoạt động diễn ra trên tài khoản của
          mình.
        </p>
        <p>
          Mỗi tài khoản dành cho một người. Không chia sẻ, mua bán hay chuyển
          nhượng tài khoản. Hãy báo ngay cho chúng tôi nếu phát hiện tài khoản
          bị truy cập trái phép.
        </p>
      </>
    ),
  },
  {
    id: "san-pham",
    title: "Sản phẩm và quyền sử dụng",
    body: (
      <>
        <p>
          <strong>Bản trực tuyến:</strong> sau khi thanh toán thành công, vụ án
          được mở khóa trên tài khoản người mua trong suốt thời gian XPLORE còn
          cung cấp dịch vụ. Quyền này dành cho mục đích giải trí cá nhân, không
          được chuyển nhượng.
        </p>
        <p>
          <strong>Bản hộp hồ sơ:</strong> người sở hữu hộp được dùng mã QR trong
          hộp để mở phần điều tra trên web đi kèm vụ án. Bạn có thể tặng hoặc
          cho mượn hộp hồ sơ.
        </p>
        <p>
          <strong>Gói chơi nhóm:</strong> số lượt tạo phòng và số người tham gia
          mỗi phòng theo mô tả của gói tại thời điểm mua.
        </p>
      </>
    ),
  },
  {
    id: "gia-thanh-toan",
    title: "Giá, thanh toán và hóa đơn",
    body: (
      <>
        <p>
          Giá sản phẩm được niêm yết bằng Việt Nam đồng tại trang sản phẩm, đã
          bao gồm thuế theo quy định. Phí vận chuyển của hộp hồ sơ (nếu có) được
          hiển thị trước khi bạn xác nhận đặt hàng.
        </p>
        <p>
          Thanh toán trực tuyến được thực hiện qua cổng thanh toán PayOS. Đơn
          hàng được xác nhận khi hệ thống nhận được kết quả thanh toán thành
          công. Nếu đã bị trừ tiền nhưng vụ án chưa được mở khóa, vui lòng liên
          hệ hỗ trợ kèm mã đơn hàng.
        </p>
        <p>
          Hóa đơn điện tử được xuất theo quy định. Nếu cần hóa đơn ghi thông tin
          doanh nghiệp, vui lòng gửi thông tin xuất hóa đơn khi đặt hàng hoặc
          trong vòng 3 ngày kể từ ngày thanh toán.
        </p>
      </>
    ),
  },
  {
    id: "giao-hang",
    title: "Giao hàng hộp hồ sơ vật lý",
    body: (
      <>
        <p>
          Hộp hồ sơ được giao qua đơn vị vận chuyển tới địa chỉ bạn cung cấp.
          Thời gian giao dự kiến được thông báo khi đặt hàng và có thể thay đổi
          tùy khu vực.
        </p>
        <p>
          Khi nhận hàng, vui lòng kiểm tra tem niêm phong và tình trạng hộp. Nếu
          hộp bị móp, rách hoặc mất niêm phong, hãy chụp ảnh và báo cho chúng
          tôi trong vòng 48 giờ kể từ khi nhận.
        </p>
        <p>
          Chúng tôi không chịu trách nhiệm cho việc giao chậm hoặc thất lạc do
          thông tin người nhận không chính xác.
        </p>
      </>
    ),
  },
  {
    id: "doi-tra",
    title: "Đổi trả và hoàn tiền",
    body: (
      <>
        <p>
          <strong>Bản hộp hồ sơ:</strong> đổi mới miễn phí trong 7 ngày kể từ
          ngày nhận nếu hộp bị lỗi in, thiếu tài liệu hoặc hư hỏng do vận
          chuyển. Nếu không còn hàng để đổi, chúng tôi hoàn tiền đầy đủ.
        </p>
        <p>
          <strong>Bản trực tuyến:</strong> do nội dung được mở ngay sau khi
          thanh toán, vụ án đã kích hoạt không được hoàn tiền. Ngoại lệ: lỗi kỹ
          thuật từ phía hệ thống khiến bạn không thể chơi và chúng tôi không
          khắc phục được trong 7 ngày kể từ khi nhận báo lỗi.
        </p>
        <p>
          Tiền hoàn được chuyển về phương thức thanh toán ban đầu hoặc tài khoản
          ngân hàng do bạn cung cấp, trong vòng 7 ngày làm việc kể từ khi yêu
          cầu được chấp nhận.
        </p>
      </>
    ),
  },
  {
    id: "so-huu-tri-tue",
    title: "Quyền sở hữu trí tuệ",
    body: (
      <>
        <p>
          Toàn bộ kịch bản, cốt truyện, nhân vật, hình ảnh, tài liệu, âm thanh,
          thiết kế, thương hiệu XPLORE và mã nguồn là tài sản trí tuệ của XPLORE
          hoặc được XPLORE cấp phép sử dụng, được pháp luật bảo hộ.
        </p>
        <p>
          Nghiêm cấm sao chép, in lại, trích xuất dữ liệu, đăng tải tài liệu vụ
          án, phát tán lời giải hoặc thương mại hóa nội dung dưới bất kỳ hình
          thức nào khi chưa có sự đồng ý bằng văn bản của XPLORE.
        </p>
      </>
    ),
  },
  {
    id: "quy-tac-ung-xu",
    title: "Quy tắc ứng xử",
    body: (
      <>
        <p>Khi sử dụng dịch vụ, bạn không được:</p>
        <ul>
          <li>
            Tiết lộ hung thủ, lời giải hoặc manh mối mấu chốt ở nơi công cộng mà
            không có cảnh báo trước (spoiler).
          </li>
          <li>
            Dùng công cụ, phần mềm hoặc thủ thuật để can thiệp hệ thống, bỏ qua
            bước kiểm tra, xem trước đáp án.
          </li>
          <li>Sao chép, dịch ngược hoặc khai thác lỗ hổng của website.</li>
          <li>
            Đăng tên hiển thị hoặc nội dung xúc phạm, vi phạm pháp luật, thuần
            phong mỹ tục.
          </li>
          <li>Spam, gây quá tải hoặc làm gián đoạn dịch vụ của người khác.</li>
        </ul>
      </>
    ),
  },
  {
    id: "phong-choi-nhom",
    title: "Phòng chơi nhóm trực tuyến",
    body: (
      <>
        <p>
          Người tạo phòng có quyền mời thành viên, quản lý và loại thành viên vi
          phạm khỏi phiên điều tra.
        </p>
        <p>
          Các thành viên tự chịu trách nhiệm về nội dung mình chia sẻ trong
          phòng. Nghiêm cấm phá hoại tiến trình giải đố của thành viên khác.
        </p>
      </>
    ),
  },
  {
    id: "gioi-han-trach-nhiem",
    title: "Gián đoạn dịch vụ và giới hạn trách nhiệm",
    body: (
      <>
        <p>
          Dịch vụ có thể tạm gián đoạn để bảo trì, nâng cấp hoặc do sự cố ngoài
          tầm kiểm soát như mất điện, lỗi mạng, thiên tai hay sự cố của đối tác
          hạ tầng. Chúng tôi sẽ thông báo trước với các đợt bảo trì có kế hoạch
          và khắc phục sự cố sớm nhất có thể.
        </p>
        <p>
          Trong phạm vi pháp luật cho phép, XPLORE không chịu trách nhiệm với
          thiệt hại gián tiếp phát sinh từ việc không thể sử dụng dịch vụ. Trách
          nhiệm bồi thường (nếu có) không vượt quá số tiền bạn đã thanh toán cho
          sản phẩm liên quan. Điều này không hạn chế các quyền của người tiêu
          dùng theo quy định pháp luật.
        </p>
      </>
    ),
  },
  {
    id: "cham-dut",
    title: "Tạm khóa và chấm dứt tài khoản",
    body: (
      <>
        <p>
          Chúng tôi có thể tạm khóa hoặc chấm dứt tài khoản vi phạm Điều khoản
          này, sau khi thông báo lý do qua email, trừ trường hợp cần ngăn chặn
          ngay hành vi gây hại cho hệ thống hoặc người khác.
        </p>
        <p>
          Bạn có thể ngừng sử dụng và yêu cầu xóa tài khoản bất kỳ lúc nào theo
          hướng dẫn tại Chính sách bảo mật.
        </p>
      </>
    ),
  },
  {
    id: "du-lieu-ca-nhan",
    title: "Bảo vệ dữ liệu cá nhân",
    body: (
      <p>
        Việc thu thập và xử lý dữ liệu cá nhân của bạn được thực hiện theo{" "}
        <a
          href="/privacy"
          className="text-amber-400 hover:underline underline-offset-4"
        >
          Chính sách bảo mật
        </a>
        , là một phần không tách rời của Điều khoản này.
      </p>
    ),
  },
  {
    id: "sua-doi",
    title: "Sửa đổi điều khoản",
    body: (
      <p>
        Chúng tôi có thể sửa đổi Điều khoản để phù hợp với sự thay đổi của dịch
        vụ hoặc pháp luật. Bản sửa đổi được đăng trên trang này kèm ngày cập
        nhật. Với thay đổi ảnh hưởng tới quyền lợi của bạn, chúng tôi thông báo
        qua email hoặc trên website ít nhất 7 ngày trước khi áp dụng. Việc bạn
        tiếp tục sử dụng dịch vụ sau thời điểm đó được hiểu là đồng ý với bản
        sửa đổi.
      </p>
    ),
  },
  {
    id: "luat-ap-dung",
    title: "Luật áp dụng và giải quyết tranh chấp",
    body: (
      <>
        <p>Điều khoản này được điều chỉnh bởi pháp luật Việt Nam.</p>
        <p>
          Mọi tranh chấp trước hết được giải quyết bằng thương lượng. Bạn có thể
          gửi khiếu nại tới {E.supportEmail}; chúng tôi phản hồi trong vòng 7
          ngày làm việc. Nếu không thương lượng được, các bên có thể yêu cầu hòa
          giải hoặc đưa vụ việc ra Tòa án có thẩm quyền tại Việt Nam.
        </p>
      </>
    ),
  },
  {
    id: "lien-he",
    title: "Liên hệ",
    body: (
      <>
        <p>
          Hỗ trợ, khiếu nại và câu hỏi về Điều khoản:{" "}
          <span className="text-amber-400 font-mono">{E.supportEmail}</span>
        </p>
        {E.published && (
          <p>
            {E.name} • MST {E.taxCode} • {E.address}
          </p>
        )}
      </>
    ),
  },
];

export default function TermsPage() {
  return (
    <LegalDocument
      title="Điều khoản dịch vụ"
      effective="Tháng 01/2026"
      updated="Tháng 11/2026"
      sections={SECTIONS}
    />
  );
}
