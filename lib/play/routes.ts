/**
 * Route chơi game của một vụ án. Mọi màn chơi nằm dưới `/play/<case_id>`:
 *
 *   /play/<case_id>                  Vào game: chơi một mình, tạo phòng, nhập mã
 *   /play/<case_id>/lobby?room=CODE  Phòng chờ và intro đồng bộ của phòng
 *   /play/<case_id>/board            Bàn điều tra online
 *   /play/<case_id>/box              Bàn đồng hành bản hộp
 *   /play/<case_id>/phone            Điện thoại nạn nhân
 *
 * `?room=CODE` là phiên chơi nhóm, không phải trang: gắn kèm khi đang ở phòng.
 * Logic thuần, không import alias để chạy được bằng `node --test`.
 */

function withRoom(path: string, room?: string | null): string {
  return room ? `${path}?room=${encodeURIComponent(room)}` : path;
}

function base(caseId: string): string {
  return `/play/${encodeURIComponent(caseId)}`;
}

export const playPath = (caseId: string, room?: string | null) =>
  withRoom(base(caseId), room);

export const lobbyPath = (caseId: string, room: string) =>
  withRoom(`${base(caseId)}/lobby`, room);

export const boardPath = (caseId: string, room?: string | null) =>
  withRoom(`${base(caseId)}/board`, room);

export const boxPath = (caseId: string, room?: string | null) =>
  withRoom(`${base(caseId)}/box`, room);

export const phonePath = (caseId: string, room?: string | null) =>
  withRoom(`${base(caseId)}/phone`, room);

/** case_id trong pathname `/play/<case_id>/...`, null nếu không phải route chơi. */
export function caseIdFromPath(pathname: string): string | null {
  const m = pathname.match(/^\/play\/([^/?#]+)/);
  return m ? decodeURIComponent(m[1]) : null;
}
