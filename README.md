# Vở Ôn Toán

App ôn toán cho 2 bé (lớp 2 và lớp 4). Là web app tĩnh (PWA): cài được lên màn hình chính của iPad, iPhone, điện thoại Android, máy tính, và chạy offline hoàn toàn.

## Tính năng
- Đường học kiểu game: mỗi lớp có 4–5 chặng (Làng Số, Rừng Phép Tính, Biển Phân Số...), mỗi kỹ năng là một trạm, cuối chặng có trạm trùm trộn các kỹ năng. Qua trạm (đúng từ 60%) thì mở trạm kế tiếp; 1–3 sao theo độ chính xác.
- Thú cưng: bé chọn và đặt tên (rồng, mèo, thỏ, rô-bốt), mỗi câu đúng là 1 hạt, tiến hóa qua 4 hình dạng (0/30/100/250 hạt), buồn nếu bỏ học từ 2 ngày. Tủ đồ để mặc mũ, đồ chơi mở được từ rương.
- Trận đánh trùm: trùm có thanh máu bằng số câu, bé có 3 tim, sai là mất tim, hết tim là thua.
- Rương thưởng: qua trạm hoặc thêm sao được rương (xu + 1 món đồ, độ hiếm thường/hiếm/cực hiếm), trùm cho rương to (2 món). Đồ trùng đổi thành xu.
- Xu và phiếu thưởng ngoài đời: bố mẹ đặt phần thưởng kèm giá xu ở trang phụ huynh, bé tự đổi trong app, bố mẹ bấm "Đã thưởng" khi thực hiện.
- Nhiệm vụ ngày: mỗi ngày 3 nhiệm vụ ngẫu nhiên (đúng N câu, qua trạm, đúng liên tiếp, học dưới 2 phút...), làm đủ 3 thì nhận xu + 1 bùa chuỗi. Bùa chuỗi (giữ tối đa 2) tự dùng khi bé bỏ 1 ngày để không mất chuỗi ngày học.
- Đổi dạng chơi: ngoài bàn phím số còn có bắn bóng bay (chọn đáp án trong 4 bóng bay) và đua thời gian (thanh thời gian chạy, hết giờ tính sai, trả lời nhanh được thêm XP ⚡). Trạm trùm và lần đầu qua trạm vẫn dùng bàn phím.
- Ma số: câu bé làm sai biến thành "ma số", 2–3 ngày sau hiện lại ở bảng ma để bé bắt; bắt đủ 10 ma được rương.
- Cây gia đình: ở trang chính, ngày nào cả 2 bé cùng học thì cây lớn thêm 1 nấc và mỗi bé được 15 xu. Chỉ hợp tác, không xếp hạng ai hơn ai.
- XP, cấp độ và danh hiệu (Hạt mầm → Huyền thoại), combo khi đúng liên tiếp, sticker.
- Hiệu ứng: pháo giấy, sao bay, rung khi sai, âm thanh (tắt được bằng nút 🔊). Tự tắt chuyển động nếu máy bật giảm chuyển động.
- Nút "Ôn bài cũ" lấy các kỹ năng đã học đến hạn theo FSRS.
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
