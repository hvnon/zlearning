/* Dữ liệu game Đạp Xe Sài Gòn: tuyến đường, sự kiện trên đường, hàng quán, thẻ lịch sử, câu đố.
   Bố mẹ muốn sửa nội dung (giá bán, câu chuyện lịch sử, câu đố) thì sửa ở file này. */

/* ================= THẺ LỊCH SỬ =================
   Mỗi thẻ là một con đường hoặc địa danh. facts: 4-5 câu ngắn cho bé đọc.
   quiz: câu hỏi trắc nghiệm, a = chỉ số đáp án đúng trong mảng o.
   Nguồn tham khảo: sách giáo khoa Lịch sử, Wikipedia tiếng Việt (bố mẹ xem lại và sửa nếu cần). */
const CARDS = {
  vts: {
    id: 'vts', kind: 'street', title: 'Đường Võ Thị Sáu', who: 'Võ Thị Sáu (1933 – 1952)', emoji: '🌸',
    color: '#d94f7a',
    facts: [
      'Chị Võ Thị Sáu sinh năm 1933 ở Đất Đỏ, Bà Rịa (nay thuộc TP. Hồ Chí Minh).',
      'Mới 14 tuổi chị đã tham gia kháng chiến chống thực dân Pháp, làm liên lạc và trinh sát rất gan dạ.',
      'Chị bị bắt năm 1950, bị đưa ra nhà tù Côn Đảo và bị xử bắn ngày 23 tháng 1 năm 1952, khi mới 19 tuổi.',
      'Trước lúc hy sinh, chị vẫn hiên ngang, không chịu bịt mắt và cất tiếng hát. Có bài hát "Biết ơn chị Võ Thị Sáu" kể về chị.',
      'Năm 1993, chị được truy tặng danh hiệu Anh hùng Lực lượng vũ trang nhân dân.'
    ],
    quiz: [
      { q: 'Chị Võ Thị Sáu hy sinh ở đâu?', o: ['Côn Đảo', 'Hà Nội', 'Huế', 'Đà Lạt'], a: 0 },
      { q: 'Chị Võ Thị Sáu bắt đầu tham gia kháng chiến khi mấy tuổi?', o: ['14 tuổi', '20 tuổi', '30 tuổi', '8 tuổi'], a: 0 },
      { q: 'Chị Võ Thị Sáu hy sinh khi bao nhiêu tuổi?', o: ['19 tuổi', '45 tuổi', '70 tuổi', '12 tuổi'], a: 0 }
    ]
  },
  hbt: {
    id: 'hbt', kind: 'street', title: 'Đường Hai Bà Trưng', who: 'Trưng Trắc và Trưng Nhị (thế kỷ 1)', emoji: '🐘',
    color: '#c7742b',
    facts: [
      'Hai Bà Trưng là hai chị em Trưng Trắc và Trưng Nhị, quê ở Mê Linh (nay thuộc Hà Nội).',
      'Năm 40, hai bà phất cờ khởi nghĩa chống quân Đông Hán đô hộ, chiếm lại 65 thành. Truyện kể hai bà cưỡi voi ra trận.',
      'Bà Trưng Trắc lên làm vua, gọi là Trưng Vương, đóng đô ở Mê Linh.',
      'Năm 43, quân Hán do Mã Viện kéo sang rất đông, cuộc khởi nghĩa thất bại. Đây là cuộc khởi nghĩa đầu tiên của dân ta chống giặc phương Bắc.',
      'Đường Hai Bà Trưng rất dài, chạy từ bờ sông Sài Gòn lên tới chợ Tân Định và nhà thờ Tân Định màu hồng.'
    ],
    quiz: [
      { q: 'Hai Bà Trưng khởi nghĩa vào năm nào?', o: ['Năm 40', 'Năm 1945', 'Năm 1789', 'Năm 938'], a: 0 },
      { q: 'Hai Bà Trưng chống lại quân xâm lược nào?', o: ['Quân Đông Hán', 'Quân Pháp', 'Quân Mông Cổ', 'Quân Minh'], a: 0 },
      { q: 'Hai Bà Trưng tên là gì?', o: ['Trưng Trắc và Trưng Nhị', 'Trưng Hoa và Trưng Mai', 'Triệu Thị Trinh và Triệu Quốc Đạt', 'Bà Triệu và Bà Lê'], a: 0 }
    ]
  },
  lel: {
    id: 'lel', kind: 'street', title: 'Đường Lê Lợi', who: 'Lê Lợi (1385 – 1433)', emoji: '⚔️',
    color: '#2f7d4f',
    facts: [
      'Lê Lợi quê ở Lam Sơn, Thanh Hóa. Năm 1418, ông dựng cờ khởi nghĩa Lam Sơn để đánh đuổi quân Minh.',
      'Sau 10 năm gian khổ, năm 1427 nghĩa quân thắng lớn ở Chi Lăng – Xương Giang, quân Minh phải rút về nước.',
      'Năm 1428, ông lên ngôi vua, gọi là Lê Thái Tổ, lập ra nhà Hậu Lê. Nguyễn Trãi viết "Bình Ngô đại cáo" báo tin thắng trận.',
      'Truyền thuyết kể ông có gươm thần. Thắng giặc rồi, ông trả gươm cho Rùa Vàng ở hồ Lục Thủy, từ đó hồ mang tên Hồ Gươm (Hoàn Kiếm).',
      'Đường Lê Lợi nối Nhà hát Thành phố với chợ Bến Thành. Dưới lòng đường có ga metro của tuyến Metro số 1, khai trương ngày 22/12/2024.'
    ],
    quiz: [
      { q: 'Lê Lợi lãnh đạo cuộc khởi nghĩa nào?', o: ['Khởi nghĩa Lam Sơn', 'Khởi nghĩa Hai Bà Trưng', 'Khởi nghĩa Yên Thế', 'Khởi nghĩa Tây Sơn'], a: 0 },
      { q: 'Theo truyền thuyết, Lê Lợi trả gươm thần cho ai?', o: ['Rùa Vàng', 'Rồng Vàng', 'Cá Chép', 'Hổ Trắng'], a: 0 },
      { q: 'Lê Lợi đánh đuổi quân xâm lược nào?', o: ['Quân Minh', 'Quân Thanh', 'Quân Pháp', 'Quân Đông Hán'], a: 0 }
    ]
  },
  pas: {
    id: 'pas', kind: 'street', title: 'Đường Pasteur', who: 'Louis Pasteur (1822 – 1895)', emoji: '🔬',
    color: '#3461b3',
    facts: [
      'Louis Pasteur là nhà khoa học người Pháp. Ông phát hiện vi khuẩn nhỏ xíu làm hỏng thức ăn và gây bệnh.',
      'Ông nghĩ ra cách đun nóng sữa để giữ lâu không hỏng. Cách này được đặt theo tên ông: "thanh trùng Pasteur".',
      'Năm 1885, ông chế ra vắc-xin phòng bệnh dại, cứu sống một cậu bé bị chó dại cắn. Nhờ vắc-xin, ngày nay bé đi tiêm phòng để không mắc nhiều bệnh.',
      'Năm 1891, Viện Pasteur Sài Gòn ra đời, là viện Pasteur đầu tiên ở ngoài nước Pháp. Viện nay nằm ngay trên đường Pasteur.',
      'Pasteur là một trong vài con đường ở TP.HCM mang tên người nước ngoài, cùng với Calmette, Yersin và Alexandre de Rhodes.'
    ],
    quiz: [
      { q: 'Louis Pasteur là người nước nào?', o: ['Pháp', 'Việt Nam', 'Anh', 'Nhật'], a: 0 },
      { q: 'Pasteur chế ra vắc-xin phòng bệnh gì?', o: ['Bệnh dại', 'Bệnh cảm cúm', 'Bệnh sâu răng', 'Bệnh đau bụng'], a: 0 },
      { q: 'Viện Pasteur Sài Gòn ra đời năm nào?', o: ['1891', '2001', '1700', '1975'], a: 0 }
    ]
  },
  opera: {
    id: 'opera', kind: 'place', title: 'Nhà hát Thành phố', who: 'Khánh thành năm 1900', emoji: '🎭',
    color: '#8a5bb5',
    facts: [
      'Nhà hát Thành phố nằm ở đầu đường Lê Lợi, được người Pháp xây từ năm 1898 và khánh thành năm 1900.',
      'Mặt tiền có mái vòm, cột đá và tượng hai thiếu nữ đỡ cửa chính, trông như một cung điện nhỏ.',
      'Bên trong là sân khấu lớn để diễn kịch, múa ba lê, hòa nhạc và xiếc.',
      'Hiện nay nhà hát vẫn biểu diễn hằng đêm và là nơi nhiều du khách ghé chụp ảnh.'
    ],
    quiz: [
      { q: 'Nhà hát Thành phố khánh thành năm nào?', o: ['1900', '2000', '1500', '1975'], a: 0 }
    ]
  },
  benthanh: {
    id: 'benthanh', kind: 'place', title: 'Chợ Bến Thành', who: 'Khánh thành tháng 3 năm 1914', emoji: '🕰️',
    color: '#c9a227',
    facts: [
      'Ngày xưa chợ nằm bên bến sông, gần thành Gia Định, nên có tên là Bến Thành.',
      'Ngôi chợ hiện nay được xây từ năm 1912 và khánh thành tháng 3 năm 1914, đến nay đã hơn 100 tuổi.',
      'Chợ có 4 cửa: Nam, Bắc, Đông, Tây. Cửa Nam có tháp đồng hồ nổi tiếng, là biểu tượng của TP. Hồ Chí Minh.',
      'Trong chợ bán đủ thứ: vải vóc, trái cây, bánh kẹo, quà lưu niệm và nhiều món ăn ngon.',
      'Ngay trước chợ là ga Bến Thành, ga trung tâm của tuyến Metro số 1.'
    ],
    quiz: [
      { q: 'Cửa nào của chợ Bến Thành có tháp đồng hồ?', o: ['Cửa Nam', 'Cửa Bắc', 'Cửa Đông', 'Cửa Tây'], a: 0 },
      { q: 'Chợ Bến Thành khánh thành năm nào?', o: ['1914', '2014', '1800', '1954'], a: 0 }
    ]
  }
};

/* ================= LUẬT GIAO THÔNG ================= */
const RULES = {
  redlight: { title: 'Vượt đèn đỏ', text: 'Đèn đỏ là phải dừng lại trước vạch kẻ. Đèn xanh mới được đi, đèn vàng thì đi chậm lại chuẩn bị dừng.' },
  pedestrian: { title: 'Không nhường người đi bộ', text: 'Gặp vạch kẻ sang đường có người đang đi, mình phải dừng lại nhường họ qua hết rồi mới đi tiếp.' },
  signal: { title: 'Rẽ mà không giơ tay', text: 'Trước khi rẽ, bé giơ thẳng tay về phía mình sắp rẽ để xe phía sau biết. Rẽ phải thì giơ tay phải, rẽ trái thì giơ tay trái.' },
  wrongsignal: { title: 'Giơ nhầm tay', text: 'Rẽ phải thì giơ tay phải, rẽ trái thì giơ tay trái. Giơ nhầm tay, xe phía sau sẽ hiểu sai đó!' },
  crash: { title: 'Va chạm', text: 'Nhìn đường phía trước, thấy chướng ngại thì đi chậm lại rồi lách sang làn bên trái, qua rồi về lại sát lề.' },
  lane: { title: 'Đi sai làn', text: 'Xe đạp đi sát lề bên phải. Làn bên trái dành cho xe máy và xe hơi đi nhanh hơn, mình chỉ tạt ra khi cần tránh chướng ngại rồi về lại ngay.' },
  moto: { title: 'Bị xe máy tông', text: 'Làn bên trái có xe máy chạy nhanh. Xe đạp đi sát lề bên phải cho an toàn nhé.' },
  ambulance: { title: 'Không nhường xe cứu thương', text: 'Nghe còi hú của xe cứu thương, cứu hỏa hay xe công an, mình phải nép sát vào lề phải và đi chậm để nhường đường.' },
  speed: { title: 'Đi nhanh gần trường học', text: 'Gần trường học có nhiều bạn nhỏ qua đường. Thấy biển "Trường học" là phải đi chậm lại.' },
  stopline: { title: 'Dừng quá vạch', text: 'Khi dừng đèn đỏ, cả bánh xe phải nằm trước vạch kẻ ngang. Vạch này để chừa chỗ cho người đi bộ qua đường.' }
};

/* Câu đố luật giao thông. sign: vẽ biển báo (xem drawSign trong game.js). */
const TRAFFIC_QUIZ = [
  { q: 'Đèn giao thông chuyển sang vàng, bé nên làm gì?', o: ['Đi chậm lại, chuẩn bị dừng', 'Đạp nhanh cho kịp', 'Quay đầu xe', 'Bóp chuông thật to'], a: 0 },
  { q: 'Xe đạp nên đi ở đâu trên đường?', o: ['Sát lề bên phải', 'Giữa đường', 'Bên trái đường', 'Trên vỉa hè'], a: 0 },
  { q: 'Trước khi rẽ phải, bé phải làm gì?', o: ['Giơ tay phải', 'Giơ tay trái', 'Nhắm mắt', 'Đạp nhanh hơn'], a: 0 },
  { q: 'Thấy người đi bộ đang qua vạch kẻ, bé phải làm gì?', o: ['Dừng lại nhường họ qua', 'Lách qua thật nhanh', 'Bấm chuông cho họ tránh', 'Đi lên vỉa hè'], a: 0 },
  { q: 'Nghe còi xe cứu thương phía sau, bé nên làm gì?', o: ['Nép sát lề phải, đi chậm', 'Đạp nhanh dẫn đường', 'Dừng giữa đường', 'Rẽ trái'], a: 0 },
  { q: 'Biển này có nghĩa là gì?', sign: 'nobike', o: ['Cấm xe đạp', 'Đường dành cho xe đạp', 'Chỗ sửa xe đạp', 'Xe đạp đi nhanh'], a: 0 },
  { q: 'Biển này có nghĩa là gì?', sign: 'oneway', o: ['Cấm đi ngược chiều', 'Được đi thẳng', 'Đường một chiều', 'Chỗ đậu xe'], a: 0 },
  { q: 'Biển này có nghĩa là gì?', sign: 'bikelane', o: ['Đường dành cho xe đạp', 'Cấm xe đạp', 'Chỗ gửi xe đạp', 'Cấm xe máy'], a: 0 },
  { q: 'Biển này có nghĩa là gì?', sign: 'ped', o: ['Chú ý người đi bộ qua đường', 'Cấm người đi bộ', 'Đường dành cho người chạy bộ', 'Có công viên'], a: 0 },
  { q: 'Biển này có nghĩa là gì?', sign: 'school', o: ['Gần trường học, đi chậm', 'Cấm trẻ em', 'Chỗ bán sách', 'Có trạm xe buýt'], a: 0 }
];

/* ================= HÀNG QUÁN =================
   price tính bằng NGHÌN đồng. */
const SHOPS = {
  banhmi: { id: 'banhmi', name: 'Xe bánh mì cô Ba', seller: 'cô Ba', emoji: '🥖', sign: 'BÁNH MÌ', color: 0xffb74d, umbrella: 0xe53935, itemColor: 0xd7a86e, signBg: '#c62828',
    goods: [
      { id: 'banhmi', name: 'Bánh mì thịt', emoji: '🥖', price: { g2: 15, g4: 17 } },
      { id: 'banhmi_op', name: 'Bánh mì ốp la', emoji: '🍳', price: { g2: 20, g4: 22 } },
      { id: 'suadau', name: 'Sữa đậu nành', emoji: '🥛', price: { g2: 8, g4: 9 } }
    ] },
  nuocmia: { id: 'nuocmia', name: 'Xe nước mía chú Tư', seller: 'chú Tư', emoji: '🥤', sign: 'NƯỚC MÍA', color: 0x81c784, umbrella: 0x1e88e5, itemColor: 0xc5e1a5, signBg: '#2e7d32',
    goods: [
      { id: 'nuocmia', name: 'Nước mía', emoji: '🥤', price: { g2: 10, g4: 12 } },
      { id: 'tratac', name: 'Trà tắc', emoji: '🍋', price: { g2: 12, g4: 15 } },
      { id: 'dua', name: 'Dừa tươi', emoji: '🥥', price: { g2: 20, g4: 25 } }
    ] },
  traicay: { id: 'traicay', name: 'Sạp trái cây dì Năm', seller: 'dì Năm', emoji: '🍊', sign: 'TRÁI CÂY', color: 0x8d6e63, umbrella: 0xfbc02d, itemColor: 0xff9800, signBg: '#ef6c00',
    goods: [
      { id: 'cam', name: 'Cam (1 kg)', emoji: '🍊', price: { g2: 40, g4: 45 } },
      { id: 'chuoi', name: 'Chuối (1 nải)', emoji: '🍌', price: { g2: 25, g4: 28 } },
      { id: 'xoai', name: 'Xoài (1 kg)', emoji: '🥭', price: { g2: 35, g4: 38 } }
    ] }
};

/* Nhiệm vụ mẹ giao theo lớp: mua gì, ở quán nào, bao nhiêu. Tiền mẹ cho tính bằng nghìn. */
const MISSIONS = {
  g2: { money: 100, items: [
    { shop: 'banhmi', good: 'banhmi', qty: 2 },
    { shop: 'nuocmia', good: 'nuocmia', qty: 2 },
    { shop: 'traicay', good: 'cam', qty: 1 }
  ] },
  g4: { money: 150, items: [
    { shop: 'banhmi', good: 'banhmi', qty: 3 },
    { shop: 'nuocmia', good: 'nuocmia', qty: 4 },
    { shop: 'traicay', good: 'cam', qty: 2 }
  ] }
};

/* ================= TUYẾN ĐƯỜNG =================
   Mỗi đường: length = chiều dài (mét), events = sự kiện theo vị trí x (mét từ đầu đường).
   Loại sự kiện: light (đèn giao thông), zebra (vạch người đi bộ), shop, obstacle (xe hàng rong đậu lấn lòng đường),
   moto (xe máy vượt ở làn trái), ambulance (xe cứu thương), school (vùng đi chậm 60 m), landmark (địa danh có thẻ),
   light có card = ngã tư có biển tên đường cắt ngang (mở thẻ lịch sử sau khi qua).
   turn: hướng rẽ ở cuối đường ('right'/'left'), next: tên đường kế tiếp. */
const ROUTES = [
  {
    id: 'benthanh', name: 'Nhà → Chợ Bến Thành', from: 'Nhà (đường Võ Thị Sáu)', to: 'Chợ Bến Thành', emoji: '🕰️',
    goalCard: 'benthanh', desc: 'Qua Võ Thị Sáu, Hai Bà Trưng và Lê Lợi tới chợ Bến Thành. Khoảng 1 km.',
    streets: [
      { card: 'vts', length: 320, turn: 'right', next: 'Hai Bà Trưng',
        events: [
          { x: 55, type: 'shop', shop: 'banhmi' },
          { x: 110, type: 'light' },
          { x: 160, type: 'obstacle' },
          { x: 205, type: 'zebra' },
          { x: 240, type: 'moto' },
          { x: 268, type: 'light' }
        ] },
      { card: 'hbt', length: 340, turn: 'right', next: 'Lê Lợi',
        events: [
          { x: 40, type: 'moto' },
          { x: 70, type: 'school' },
          { x: 150, type: 'shop', shop: 'nuocmia' },
          { x: 190, type: 'light' },
          { x: 230, type: 'obstacle' },
          { x: 262, type: 'ambulance' },
          { x: 300, type: 'zebra' }
        ] },
      { card: 'lel', length: 360, turn: null,
        events: [
          { x: 30, type: 'landmark', card: 'opera' },
          { x: 90, type: 'zebra' },
          { x: 140, type: 'light', card: 'pas' },
          { x: 190, type: 'moto' },
          { x: 230, type: 'obstacle' },
          { x: 280, type: 'shop', shop: 'traicay' },
          { x: 322, type: 'light' }
        ] }
    ]
  },
  { id: 'ducba', name: 'Nhà → Nhà thờ Đức Bà', emoji: '⛪', soon: true },
  { id: 'dinh', name: 'Nhà → Dinh Độc Lập', emoji: '🏛️', soon: true },
  { id: 'zoo', name: 'Nhà → Thảo Cầm Viên', emoji: '🦒', soon: true },
  { id: 'nharong', name: 'Nhà → Bến Nhà Rồng', emoji: '🐉', soon: true }
];
