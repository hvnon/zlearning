# Vở Ôn Toán

App ôn toán cho 2 bé (lớp 2 và lớp 4). Là web app tĩnh (PWA): cài được lên màn hình chính của iPad, iPhone, điện thoại Android, máy tính, và chạy offline hoàn toàn.

## Tính năng
- Lặp lại ngắt quãng bằng FSRS-4.5, lập lịch theo từng kỹ năng.
- Câu hỏi sinh ngẫu nhiên; chấm Again/Hard/Good/Easy theo đúng/sai, có xem gợi ý không, và thời gian làm.
- Nhật ký thao tác: mỗi câu bé trả lời (câu hỏi, bé nhập gì, đáp án, số giây, có xem gợi ý) được ghi vào IndexedDB trên máy. Trang phụ huynh có thống kê theo ngày và 30 câu gần nhất.
- Sao lưu: tải file JSON (tiến độ + nhật ký), mở lại file trên máy khác, xuất nhật ký ra CSV (mở bằng Excel).

## Cấu trúc
| File | Vai trò |
|---|---|
| `index.html` | Toàn bộ app (HTML, CSS, JS) |
| `manifest.webmanifest` | Thông tin để cài app (tên, icon, màu) |
| `sw.js` | Service worker, lưu app vào máy để chạy offline |
| `fonts/` | Font Baloo 2 và Be Vietnam Pro tự host (không cần Google Fonts) |
| `icons/` | Icon app |
| `.github/workflows/pages.yml` | Tự deploy lên GitHub Pages mỗi lần push |

Thêm file mới vào app thì thêm vào `ASSETS` trong `sw.js` và tăng `VERSION`.

## Chạy thử trên máy
```
python3 -m http.server 8000
```
rồi mở http://localhost:8000. (Service worker cần http/https, mở file trực tiếp thì app vẫn chạy nhưng không cài được.)

## Cài lên máy
- iPhone / iPad: mở link bằng Safari → Chia sẻ → Thêm vào MH chính.
- Android: mở bằng Chrome → menu ⋮ → Cài đặt ứng dụng.
- Sau lần mở đầu tiên, app chạy không cần mạng.

Dữ liệu lưu trong `localStorage` (key `vo-on-toan-v1`) và IndexedDB `vo-on-toan` (bản sao state + nhật ký).
