# zzzlearning

Góc học của 2 bé (lớp 2 và lớp 4): một trang chủ **zzzlearning** mở ra 2 app con, tất cả là web app tĩnh (PWA), cài được lên màn hình chính của iPad, iPhone, Android, máy tính và chạy offline hoàn toàn. Chạy tại https://hvnon.github.io/zlearning/.

| Thư mục | App |
|---|---|
| `/` (`index.html`, `sw.js`, `manifest.webmanifest`, `icons/`) | Trang chủ zzzlearning: ví xu của từng bé + nút Đổi thưởng, 2 thẻ vào app con, tiến độ nhanh |
| `phuhuynh/` | Trang phụ huynh chung (khóa bằng **mã 4 số của bố mẹ**): hồ sơ bé (tên dùng cho cả 2 app), **việc hôm nay** (mục tiêu toán mỗi ngày, bắt làm toán xong mới được đạp xe, giới hạn phút chơi game xe), tổng quan 7 ngày (toán + xe), **báo cáo tuần thành một ảnh** để lưu/gửi, tặng/trừ xu, phần thưởng ngoài đời và phiếu đã đổi, nhật ký gần đây, sao lưu/khôi phục **một file** cho tất cả, xuất CSV nhật ký toán |
| `zzz.js` | Lớp dữ liệu dùng chung (script thường, cả 2 app và trang chủ đều nạp): ví xu `zzz-wallet`, tên bé `zzz-kids`, phần thưởng `zzz-rewards`, mã bố mẹ `zzz-pin`, việc hôm nay `zzz-plan` + tiến độ `zzz-today` trong `localStorage`; hộp nhập mã dùng chung `ZZZ.gate()` |
| `toan/` | Vở Ôn Toán |
| `saigon/` | Đạp Xe Sài Gòn |
| `fonts/` | Font Baloo 2 và Be Vietnam Pro tự host, dùng chung cho cả 3 |

- **Ví xu chung:** bé kiếm xu ở app nào cũng cộng vào một ví; đổi phiếu thưởng (ở trang chủ hoặc trong Vở Ôn Toán) hay mua đồ ở tủ thời trang (Đạp Xe Sài Gòn) đều trừ từ ví đó. Lần đầu chạy bản này, xu đang có của mỗi bé ở 2 app được cộng lại. Trong code, `p.coins` của mỗi app được gắn (getter/setter) vào ví chung bằng `ZZZ.bindCoins`.
- **Mở từ trang chủ** (link có `?hub=1`): nút Phụ huynh trong app con dẫn ra `phuhuynh/`. **Cài lẻ** từng app (mở thẳng `toan/` hay `saigon/`): app vẫn dùng trang phụ huynh riêng của nó như trước, nhưng ví xu, tên bé và phần thưởng vẫn là dữ liệu chung.
- **Mã của bố mẹ:** đặt ở trang phụ huynh chung (4 số, lưu dạng băm). Có mã rồi thì trang phụ huynh chung và góc phụ huynh riêng của từng app đều hỏi mã; nhập đúng một lần thì nhớ tới khi đóng app (sessionStorage). Quên mã: mở `phuhuynh/?pin=xoa` rồi xác nhận để xóa mã.
- **Việc hôm nay:** bố mẹ đặt cho từng bé số câu toán mỗi ngày (lần đầu trong ngày làm đủ được +5 xu vào ví chung), có thể bắt làm toán xong mới được lên xe trong Đạp Xe Sài Gòn và giới hạn số phút chơi game xe mỗi ngày. Vở Ôn Toán ghi mỗi câu trả lời qua `ZZZ.logToday`, game xe cộng dồn giây chơi; trang chủ hiện tiến độ, game xe tự chặn khi chưa đủ toán / hết phút. Tiến độ theo ngày giữ 35 ngày để làm báo cáo.
- Mỗi app con có manifest và service worker riêng (phạm vi thư mục của nó) nên cài riêng từng app cũng được; cài trang chủ thì vào được cả hai. Dữ liệu lưu trong `localStorage`/IndexedDB theo tên miền nên dùng chung giữa trang chủ và app con.

# Vở Ôn Toán (`toan/`)

App ôn toán cho 2 bé (lớp 2 và lớp 4). Là web app tĩnh (PWA): cài được lên màn hình chính của iPad, iPhone, điện thoại Android, máy tính, và chạy offline hoàn toàn.

## Tính năng
- Đường học kiểu game: mỗi lớp có 4–5 chặng (Làng Số, Rừng Phép Tính, Biển Phân Số...), mỗi kỹ năng là một trạm, cuối chặng có trạm trùm trộn các kỹ năng. Qua trạm (đúng từ 60%) thì mở trạm kế tiếp; 1–3 sao theo độ chính xác.
- Thú cưng: bé chọn và đặt tên (rồng, mèo, thỏ, rô-bốt), mỗi câu đúng là 1 hạt, tiến hóa qua 4 hình dạng (0/30/100/250 hạt), buồn nếu bỏ học từ 2 ngày. Tủ đồ để mặc mũ, đồ chơi mở được từ rương.
- Trận đánh trùm: trùm có thanh máu bằng số câu, bé có 3 tim, sai là mất tim, hết tim là thua.
- Rương thưởng: qua trạm hoặc thêm sao được rương (xu + 1 món đồ, độ hiếm thường/hiếm/cực hiếm), trùm cho rương to (2 món). Đồ trùng đổi thành xu.
- Xu và phiếu thưởng ngoài đời: bố mẹ đặt phần thưởng kèm giá xu ở trang phụ huynh (chung với zzzlearning), bé tự đổi trong app, bố mẹ bấm "Đã thưởng" khi thực hiện. Xu là ví chung với Đạp Xe Sài Gòn.
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
| `toan/index.html` | Toàn bộ app (HTML, CSS, JS) |
| `toan/manifest.webmanifest` | Thông tin để cài app (tên, icon, màu) |
| `toan/sw.js` | Service worker, lưu app vào máy để chạy offline |
| `fonts/` | Font Baloo 2 và Be Vietnam Pro tự host (không cần Google Fonts), ở thư mục gốc |
| `toan/icons/` | Icon app |
| `.github/workflows/pages.yml` | Tự deploy lên GitHub Pages mỗi lần push (gom `index.html`, `sw.js`, `zzz.js`, `manifest`, `fonts`, `icons`, `phuhuynh`, `toan`, `saigon`) |

Thêm file mới vào app thì thêm vào `ASSETS` trong `sw.js` và tăng `VERSION`.

## Chạy thử trên máy
```
python3 -m http.server 8000
```
rồi mở http://localhost:8000 (trang chủ), http://localhost:8000/toan/ hoặc http://localhost:8000/saigon/. (Service worker cần http/https, mở file trực tiếp thì app vẫn chạy nhưng không cài được.)

## Cài lên máy
- iPhone / iPad: mở link bằng Safari → Chia sẻ → Thêm vào MH chính (mở trang chủ thì cài zzzlearning, mở `toan/` hay `saigon/` thì cài riêng app đó).
- Android: mở bằng Chrome → menu ⋮ → Cài đặt ứng dụng.
- Sau lần mở đầu tiên, app chạy không cần mạng.

Dữ liệu lưu trong `localStorage` (key `vo-on-toan-v1`) và IndexedDB `vo-on-toan` (bản sao state + nhật ký).

## Đạp Xe Sài Gòn (`saigon/`)

Game 3D riêng cho 2 bé, nằm ở thư mục `saigon/` và chạy tại https://hvnon.github.io/zlearning/saigon/ (cũng là PWA cài được, chạy offline). Bé đạp xe từ nhà qua các con đường thật của Quận 1, Quận 3 tới một địa danh, vừa đi vừa:
- **Học luật giao thông:** dừng đèn đỏ trước vạch, nhường người đi bộ, đi sát lề phải, lách xe hàng rong, nhường xe cứu thương, đi chậm gần trường học, giơ tay trước khi rẽ. Sai luật mất 1 trong 3 ❤️, chú công an giải thích; hết tim thì đạp lại từ đầu đường.
- **Mua bán ở hàng quán:** bánh mì, nước mía, trái cây. Bé chọn hàng, tự tính tổng tiền, đưa tiền và tính tiền thối (lớp 2: cộng trừ; lớp 4: thêm nhân và so giá combo). Cuối chuyến giúp dì bán hàng tính tiền cho khách.
- **Lịch sử tên đường:** qua mỗi đường hiện thẻ kể chuyện về yếu nhân (Võ Thị Sáu, Hai Bà Trưng, Lê Lợi, Pasteur) và địa danh (Nhà hát Thành phố, chợ Bến Thành), cuối chuyến có đố vui. Thẻ vào bộ sưu tập.
- Phần thưởng: xu (tiền thừa + điểm), sao theo số lỗi, "bằng lái xe đạp" khi đi đúng luật suốt chuyến, tủ thời trang 👗 (tóc, mặt, trang phục, mũ, ba lô, màu xe, giỏ, cờ, tua rua; vài món đặc biệt mua bằng xu).
- Hai góc nhìn: sau lưng xe (3D) và bản đồ nhìn từ trên cao (nút 🗺️ khi đang đi). Có chế độ "đồ họa nhẹ" cho máy yếu. Mỗi chuyến ngẫu nhiên trời sáng, hoàng hôn hoặc chập tối.

| File | Vai trò |
|---|---|
| `saigon/index.html` | Giao diện, HUD, nút điều khiển |
| `saigon/game.js` | Lối chơi: sự kiện trên đường, mua bán, câu đố, lưu tiến độ (`localStorage` key `dap-xe-sai-gon-v1`) |
| `saigon/world.js` | Dựng thế giới 3D bằng three.js: đường, nhà, cây, xe, người, xe đạp |
| `saigon/data.js` | Tuyến đường, sự kiện, giá hàng quán, thẻ lịch sử, câu đố (sửa nội dung ở đây) |
| `saigon/vendor/three.module.min.js` | three.js r170 (MIT) |
| `saigon/sw.js`, `saigon/manifest.webmanifest`, `saigon/icons/` | PWA |

Tuyến hiện có: Nhà (Võ Thị Sáu) → Hai Bà Trưng → Lê Lợi (qua Nhà hát Thành phố, ngã tư Pasteur) → Chợ Bến Thành. Các tuyến khác (Nhà thờ Đức Bà, Dinh Độc Lập, Thảo Cầm Viên, Bến Nhà Rồng) để sẵn chỗ trong `data.js`.
