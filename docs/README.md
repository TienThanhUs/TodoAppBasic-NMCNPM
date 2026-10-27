# Tài liệu kiến trúc – Bài tập tuần 7

Một codebase duy nhất phát triển qua 4 phiên bản. Mỗi phiên bản có commit và tag riêng (`v2`, `v3`, `v4`).

## Mục lục

| File | Nội dung |
|---|---|
| [`V2-client-server.md`](V2-client-server.md) | Sơ đồ kiến trúc V2, nhật ký, đánh đổi |
| [`V3-n-layer.md`](V3-n-layer.md) | Sơ đồ 3 lớp V3, file đổi khi thay UI / thay DB |
| [`V4-p2p.md`](V4-p2p.md) | Sơ đồ thành phần + luồng kết nối P2P, đánh đổi, trả lời câu hỏi thảo luận |
| [`agent-log.md`](agent-log.md) | Prompt chính và lỗi phát sinh khi dùng coding agent |
| `screenshots/` | Ảnh minh chứng kiểm thử từng phiên bản |

## Bảng nhật ký quyết định

| Version | NFR mới | Quyết định thiết kế | File/thành phần đổi | Kết quả test |
|---|---|---|---|---|
| V1 | Chưa có (chỉ chức năng: tạo, xem, đổi trạng thái, xoá; dữ liệu còn sau khi restart) | Express + 1 trang HTML, lưu `tasks.json` | `server.js`, `public/index.html`, `tasks.json` | _(nhóm V1 điền: tạo 2 task, hoàn thành 1, restart → dữ liệu còn)_ |
| V2 | Chia sẻ trạng thái tập trung giữa nhiều client | Giữ server, client polling 2s; đặt trạng thái `{done}` thay toggle; id UUID; ghi file atomic; listen `0.0.0.0` | `server.js`, `public/index.html` | A tạo → B thấy không reload; B đánh dấu xong → A thấy; tắt server → client báo mất kết nối ✅ |
| V3 | Modifiability: thay UI và persistence | Tách Presentation / Business / Data Access; `ITaskRepository`; Kanban 2 cột; SQLite + migration từ JSON | `src/**`, `scripts/migrate-to-sqlite.js`, `server.js`, `public/index.html` | _(nhóm V3 điền)_ |
| V4 | Availability khi mất server; giao tiếp ngang hàng | Giữ V3 làm chế độ thường; thêm WebRTC DataChannel (signaling copy-paste); bản sao cục bộ; snapshot + op, last-write-wins | `public/js/peer-link.js`, `public/js/local-replica.js`, `public/index.html` (server không đổi) | Kết nối A–B, tắt server; A tạo → B nhận; bấm XONG → cả hai đổi cột ✅ |

## Kiến trúc qua từng phiên bản

| | V1 | V2 | V3 | V4 |
|---|---|---|---|---|
| Kiểu kiến trúc | Ứng dụng web 1 máy | Client–Server | Client–Server + N-Layer | Client–Server + N-Layer + đường P2P |
| Dữ liệu nằm ở | `tasks.json` | `tasks.json` trên server | `tasks.db` (SQLite) | SQLite (thường) / bản sao trên mỗi peer (P2P) |
| Tắt server thì | Không dùng được | Không dùng được | Không dùng được | Vẫn đồng bộ được giữa 2 peer đã kết nối |

## Điều đã học

- Thiết kế V1 chỉ đủ cho 1 người 1 máy; mỗi NFR mới (nhiều client, dễ thay thế, chịu được mất server) buộc phải đổi kiến trúc.
- Client–Server, N-Layer và P2P không loại trừ nhau: V4 vẫn giữ nguyên V3, chỉ thêm một đường đồng bộ.
- Đổi lấy availability ở V4 là mất nhất quán mạnh: không còn một nguồn dữ liệu chuẩn, xung đột chỉ xử lý thô.
