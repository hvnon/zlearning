/* Dữ liệu game Shipper Nhí Sài Gòn: tuyến đường, sự kiện trên đường, hàng quán, thẻ lịch sử, câu đố.
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
  },
  /* ---- tuyến Nhà thờ Đức Bà ---- */
  nguyendu: {
    id: 'nguyendu', kind: 'street', title: 'Đường Nguyễn Du', who: 'Nguyễn Du (1765 – 1820)', emoji: '📜',
    color: '#7b5e2a',
    facts: [
      'Nguyễn Du là đại thi hào của Việt Nam, quê ở Tiên Điền, Nghi Xuân, Hà Tĩnh.',
      'Ông viết "Truyện Kiều" dài 3.254 câu thơ lục bát, kể về nàng Kiều tài sắc nhưng gặp nhiều gian truân. Rất nhiều người Việt thuộc lòng những câu Kiều.',
      'Ông làm quan dưới triều Nguyễn và năm 1813 từng đi sứ sang Trung Quốc.',
      'Năm 1965, ông được Hội đồng Hòa bình thế giới vinh danh là Danh nhân văn hóa thế giới.',
      'Đường Nguyễn Du chạy ngang bên Dinh Độc Lập và dẫn tới công viên trước Nhà thờ Đức Bà.'
    ],
    quiz: [
      { q: 'Nguyễn Du là tác giả của tác phẩm nào?', o: ['Truyện Kiều', 'Bình Ngô đại cáo', 'Hịch tướng sĩ', 'Dế Mèn phiêu lưu ký'], a: 0 },
      { q: 'Nguyễn Du quê ở tỉnh nào?', o: ['Hà Tĩnh', 'Hà Nội', 'Cần Thơ', 'Lâm Đồng'], a: 0 },
      { q: 'Truyện Kiều được viết bằng thể thơ nào?', o: ['Lục bát', 'Thơ tự do', 'Thơ bốn chữ', 'Văn xuôi'], a: 0 }
    ]
  },
  buudien: {
    id: 'buudien', kind: 'place', title: 'Bưu điện Thành phố', who: 'Xây từ năm 1886 đến 1891', emoji: '📮',
    color: '#c08a2e',
    facts: [
      'Bưu điện Thành phố nằm ngay cạnh Nhà thờ Đức Bà, do người Pháp xây từ năm 1886 đến 1891.',
      'Tòa nhà màu vàng với các cửa sổ vòm xanh lá, trên mặt tiền có một chiếc đồng hồ lớn.',
      'Bên trong là một gian sảnh rộng mái vòm, trên tường vẽ hai bản đồ cổ về Sài Gòn và vùng Nam Bộ xưa.',
      'Đây vẫn là bưu điện đang hoạt động: bé có thể mua tem, viết bưu thiếp và gửi đi khắp thế giới.'
    ],
    quiz: [
      { q: 'Bưu điện Thành phố nằm cạnh địa danh nào?', o: ['Nhà thờ Đức Bà', 'Chợ Bến Thành', 'Thảo Cầm Viên', 'Bến Nhà Rồng'], a: 0 },
      { q: 'Ở bưu điện bé có thể làm gì?', o: ['Gửi thư và bưu thiếp', 'Xem thú', 'Mua trái cây', 'Đi tàu'], a: 0 }
    ]
  },
  ducba: {
    id: 'ducba', kind: 'place', title: 'Nhà thờ Đức Bà', who: 'Xây từ năm 1877 đến 1880', emoji: '⛪',
    color: '#b5563c',
    facts: [
      'Nhà thờ Đức Bà được người Pháp xây từ năm 1877 đến 1880, nằm ở quảng trường Công xã Paris giữa trung tâm Quận 1.',
      'Toàn bộ gạch đỏ xây nhà thờ được chở từ Pháp sang. Hơn 140 năm rồi mà gạch vẫn đỏ tươi, không cần sơn.',
      'Hai tháp chuông cao 57,6 m, bên trong có 6 quả chuông lớn. Tháp được xây thêm năm 1895.',
      'Trước nhà thờ có tượng Đức Mẹ Hòa Bình bằng đá, đặt năm 1959. Tượng làm ở Ý rồi chở về.',
      'Từ năm 2017 nhà thờ được sửa chữa lớn nên có giàn giáo bao quanh, nhưng vẫn là nơi rất nhiều người đến chụp ảnh.'
    ],
    quiz: [
      { q: 'Nhà thờ Đức Bà được xây bằng gạch chở từ nước nào?', o: ['Pháp', 'Nhật', 'Mỹ', 'Trung Quốc'], a: 0 },
      { q: 'Nhà thờ Đức Bà có mấy tháp chuông?', o: ['2', '1', '4', '6'], a: 0 },
      { q: 'Nhà thờ Đức Bà xây xong năm nào?', o: ['1880', '1980', '1500', '2000'], a: 0 }
    ]
  },
  /* ---- tuyến Dinh Độc Lập ---- */
  nkkn: {
    id: 'nkkn', kind: 'street', title: 'Đường Nam Kỳ Khởi Nghĩa', who: 'Cuộc khởi nghĩa Nam Kỳ (23/11/1940)', emoji: '🚩',
    color: '#b3261e',
    facts: [
      'Tên đường nhắc tới cuộc khởi nghĩa Nam Kỳ ngày 23 tháng 11 năm 1940, khi người dân nhiều tỉnh miền Nam cùng đứng lên chống thực dân Pháp.',
      'Trong cuộc khởi nghĩa này, lá cờ đỏ sao vàng lần đầu tiên được giương lên. Sau này lá cờ ấy trở thành Quốc kỳ Việt Nam.',
      'Cuộc khởi nghĩa không thành công, nhiều người đã hy sinh, nhưng tinh thần dũng cảm ấy được nhớ mãi.',
      'Trước năm 1975 đường này tên là Công Lý. Đường chạy từ sân bay Tân Sơn Nhất thẳng về trung tâm, ngang qua Dinh Độc Lập.'
    ],
    quiz: [
      { q: 'Cuộc khởi nghĩa Nam Kỳ diễn ra năm nào?', o: ['1940', '1975', '1945', '1954'], a: 0 },
      { q: 'Lá cờ nào xuất hiện lần đầu trong khởi nghĩa Nam Kỳ?', o: ['Cờ đỏ sao vàng', 'Cờ xanh', 'Cờ trắng', 'Cờ có ngôi sao trắng'], a: 0 }
    ]
  },
  ntmk: {
    id: 'ntmk', kind: 'street', title: 'Đường Nguyễn Thị Minh Khai', who: 'Nguyễn Thị Minh Khai (1910 – 1941)', emoji: '🌺',
    color: '#8e24aa',
    facts: [
      'Cô Nguyễn Thị Minh Khai sinh năm 1910 ở thành phố Vinh, Nghệ An.',
      'Từ khi còn là học sinh, cô đã tham gia hoạt động yêu nước, từng đi học và làm việc ở Hồng Kông và nước Nga.',
      'Về Sài Gòn, cô là Bí thư Thành ủy Sài Gòn – Chợ Lớn, lãnh đạo phong trào chống thực dân Pháp.',
      'Cô bị bắt năm 1940 và hy sinh năm 1941 ở Hóc Môn khi mới 31 tuổi.',
      'Đường Nguyễn Thị Minh Khai rất dài, chạy ngang sau Dinh Độc Lập và tới sát Thảo Cầm Viên. Trước năm 1975 tên là Hồng Thập Tự.'
    ],
    quiz: [
      { q: 'Nguyễn Thị Minh Khai sinh ra ở đâu?', o: ['Vinh, Nghệ An', 'Sài Gòn', 'Huế', 'Cần Thơ'], a: 0 },
      { q: 'Đường Nguyễn Thị Minh Khai đi tới sát địa danh nào?', o: ['Thảo Cầm Viên', 'Sân bay', 'Chợ Bến Thành', 'Bến Nhà Rồng'], a: 0 }
    ]
  },
  lqd: {
    id: 'lqd', kind: 'place', title: 'Trường Lê Quý Đôn', who: 'Lê Quý Đôn (1726 – 1784) · trường lập năm 1874', emoji: '🏫',
    sign: 'TRƯỜNG LÊ QUÝ ĐÔN',
    color: '#1565c0',
    facts: [
      'Trường Lê Quý Đôn ở góc đường Nam Kỳ Khởi Nghĩa và Nguyễn Thị Minh Khai, lập năm 1874, là trường trung học xưa nhất Sài Gòn, đã hơn 150 tuổi.',
      'Trường có những dãy nhà mái ngói, tường vàng và sân rộng đầy cây cổ thụ.',
      'Trường mang tên Lê Quý Đôn, nhà bác học lớn nhất của Việt Nam thời xưa, quê ở Thái Bình.',
      'Ông đọc rất nhiều, nhớ rất giỏi và viết sách về đủ thứ: lịch sử, địa lý, thiên văn, cây cỏ. Người ta nói "thiên hạ vô tri vấn Bảng Đôn", nghĩa là không biết gì thì hỏi ông Bảng Đôn.',
      'Ông đỗ Bảng nhãn năm 1752 khi mới 26 tuổi.'
    ],
    quiz: [
      { q: 'Trường Lê Quý Đôn được lập năm nào?', o: ['1874', '1974', '2004', '1945'], a: 0 },
      { q: 'Lê Quý Đôn nổi tiếng là gì?', o: ['Nhà bác học', 'Cầu thủ bóng đá', 'Nhà hàng hải', 'Họa sĩ'], a: 0 }
    ]
  },
  dinh: {
    id: 'dinh', kind: 'place', title: 'Dinh Độc Lập', who: 'Xây từ năm 1962 đến 1966', emoji: '🏛️',
    color: '#5c6bc0',
    facts: [
      'Trên khu đất này xưa là Dinh Norodom của người Pháp, xây từ năm 1868. Năm 1962 dinh cũ bị máy bay ném bom hỏng nặng nên được phá đi xây mới.',
      'Dinh mới do kiến trúc sư Ngô Viết Thụ thiết kế, xây từ năm 1962 đến 1966. Mặt tiền có "rèm hoa đá" hình những đốt trúc rất đẹp.',
      'Trưa ngày 30 tháng 4 năm 1975, xe tăng 843 và 390 tiến vào cổng dinh, kết thúc chiến tranh, đất nước thống nhất.',
      'Nay dinh còn gọi là Hội trường Thống Nhất, mở cửa cho mọi người tham quan. Trong sân có bãi cỏ rộng, đài phun nước và trưng bày hai chiếc xe tăng.',
      'Trên sân thượng dinh còn có cả một chiếc máy bay trực thăng!'
    ],
    quiz: [
      { q: 'Ai thiết kế Dinh Độc Lập?', o: ['Ngô Viết Thụ', 'Louis Pasteur', 'Nguyễn Du', 'Lê Lợi'], a: 0 },
      { q: 'Xe tăng tiến vào Dinh Độc Lập vào ngày nào?', o: ['30/4/1975', '2/9/1945', '1/1/2000', '23/11/1940'], a: 0 },
      { q: 'Dinh Độc Lập ngày nay còn gọi là gì?', o: ['Hội trường Thống Nhất', 'Nhà hát Thành phố', 'Bưu điện Thành phố', 'Chợ Bến Thành'], a: 0 }
    ]
  },
  /* ---- tuyến Thảo Cầm Viên ---- */
  nbk: {
    id: 'nbk', kind: 'street', title: 'Đường Nguyễn Bỉnh Khiêm', who: 'Nguyễn Bỉnh Khiêm (1491 – 1585)', emoji: '🔮',
    color: '#00838f',
    facts: [
      'Nguyễn Bỉnh Khiêm quê ở Vĩnh Bảo, Hải Phòng. Ông sống tới 95 tuổi, rất thọ so với người xưa.',
      'Năm 1535, khi 44 tuổi, ông đi thi và đỗ Trạng nguyên, tức là người đứng đầu cả nước.',
      'Người ta gọi ông là Trạng Trình vì ông được phong là Trình Quốc công. Ông mở trường dạy học, có rất nhiều học trò giỏi.',
      'Ông nổi tiếng với những câu "sấm" tiên đoán chuyện tương lai, gọi là Sấm Trạng Trình.',
      'Cổng chính Thảo Cầm Viên nằm ngay trên đường Nguyễn Bỉnh Khiêm, số 2.'
    ],
    quiz: [
      { q: 'Nguyễn Bỉnh Khiêm còn được gọi là gì?', o: ['Trạng Trình', 'Trạng Quỳnh', 'Ông Táo', 'Thánh Gióng'], a: 0 },
      { q: 'Nguyễn Bỉnh Khiêm đỗ Trạng nguyên khi bao nhiêu tuổi?', o: ['44 tuổi', '14 tuổi', '80 tuổi', '7 tuổi'], a: 0 }
    ]
  },
  zoo: {
    id: 'zoo', kind: 'place', title: 'Thảo Cầm Viên', who: 'Mở cửa từ năm 1864', emoji: '🦒',
    color: '#2e7d32',
    facts: [
      'Thảo Cầm Viên Sài Gòn được lập năm 1864, là một trong những vườn thú lâu đời nhất thế giới, đã hơn 160 tuổi.',
      '"Thảo" là cây cỏ, "cầm" là chim thú. Ở đây có hơn 1.000 con thú như hươu cao cổ, voi, hà mã, hổ, cùng hơn 2.000 cây xanh, nhiều cây cổ thụ trăm tuổi.',
      'Người đầu tiên trông coi vườn là nhà thực vật học người Pháp Louis Pierre, ông đã trồng rất nhiều cây ở đây.',
      'Trong khuôn viên còn có Bảo tàng Lịch sử và Đền thờ Vua Hùng.',
      'Cuối tuần nhiều gia đình tới chơi, cho hươu ăn, xem voi tắm và đi xe điện vòng quanh vườn.'
    ],
    quiz: [
      { q: '"Thảo" trong Thảo Cầm Viên nghĩa là gì?', o: ['Cây cỏ', 'Chim thú', 'Nước', 'Nhà'], a: 0 },
      { q: 'Thảo Cầm Viên được lập năm nào?', o: ['1864', '1964', '2004', '1700'], a: 0 },
      { q: 'Trong Thảo Cầm Viên có bảo tàng nào?', o: ['Bảo tàng Lịch sử', 'Bảo tàng Xe đạp', 'Bảo tàng Vũ trụ', 'Bảo tàng Kem'], a: 0 }
    ]
  },
  /* ---- tuyến Bến Nhà Rồng ---- */
  tdt: {
    id: 'tdt', kind: 'street', title: 'Đường Tôn Đức Thắng', who: 'Tôn Đức Thắng (1888 – 1980)', emoji: '🔧',
    color: '#455a64',
    facts: [
      'Bác Tôn Đức Thắng sinh năm 1888 ở cù lao Ông Hổ, Long Xuyên, An Giang.',
      'Thời trẻ bác là thợ máy rất giỏi ở xưởng đóng tàu Ba Son bên sông Sài Gòn, và đã lãnh đạo công nhân Ba Son đình công năm 1925.',
      'Bác bị thực dân Pháp giam ở nhà tù Côn Đảo gần 17 năm nhưng vẫn kiên cường.',
      'Sau khi Bác Hồ qua đời, bác Tôn trở thành Chủ tịch nước từ năm 1969 đến 1980. Mọi người thường gọi thân mật là Bác Tôn.',
      'Đường Tôn Đức Thắng chạy dọc sông Sài Gòn, cạnh bến Bạch Đằng, nhìn qua Thủ Thiêm bên kia sông.'
    ],
    quiz: [
      { q: 'Thời trẻ bác Tôn Đức Thắng làm nghề gì?', o: ['Thợ máy', 'Bác sĩ', 'Thầy giáo', 'Ca sĩ'], a: 0 },
      { q: 'Đường Tôn Đức Thắng chạy dọc theo gì?', o: ['Sông Sài Gòn', 'Đường ray xe lửa', 'Núi', 'Sân bay'], a: 0 }
    ]
  },
  tranhungdao: {
    id: 'tranhungdao', kind: 'place', title: 'Tượng Trần Hưng Đạo', who: 'Trần Hưng Đạo (thế kỷ 13) · tượng dựng năm 1967', emoji: '🗡️',
    color: '#6d4c41',
    facts: [
      'Tượng Trần Hưng Đạo đứng ở công trường Mê Linh, bên sông Sài Gòn, ngay đầu đường Hai Bà Trưng. Tượng dựng năm 1967.',
      'Trần Hưng Đạo tên thật là Trần Quốc Tuấn, vị tướng tài của nhà Trần, sống vào thế kỷ 13.',
      'Ông chỉ huy quân dân ta hai lần đánh thắng quân Nguyên Mông rất mạnh, năm 1285 và 1288. Trận Bạch Đằng năm 1288 dùng cọc nhọn cắm dưới sông làm đắm tàu giặc.',
      'Ông viết "Hịch tướng sĩ" để khích lệ binh lính. Tượng ông chỉ tay xuống sông như đang chỉ huy thủy quân.'
    ],
    quiz: [
      { q: 'Trần Hưng Đạo đánh thắng quân xâm lược nào?', o: ['Quân Nguyên Mông', 'Quân Pháp', 'Quân Minh', 'Quân Đông Hán'], a: 0 },
      { q: 'Trận Bạch Đằng năm 1288 dùng mưu gì?', o: ['Cắm cọc nhọn dưới sông', 'Bắn tên lửa', 'Đào hầm', 'Thả diều'], a: 0 }
    ]
  },
  ntt: {
    id: 'ntt', kind: 'street', title: 'Đường Nguyễn Tất Thành', who: 'Nguyễn Tất Thành, tên thời trẻ của Bác Hồ', emoji: '🚢',
    color: '#c62828',
    facts: [
      'Nguyễn Tất Thành là tên thời trẻ của Bác Hồ (Chủ tịch Hồ Chí Minh). Bác sinh năm 1890 ở Nghệ An.',
      'Ngày 5 tháng 6 năm 1911, chàng trai Nguyễn Tất Thành 21 tuổi lên tàu Amiral Latouche-Tréville ở Bến Nhà Rồng, làm phụ bếp với tên Văn Ba, để ra nước ngoài tìm đường cứu nước.',
      'Bác đi qua rất nhiều nước suốt 30 năm, đến năm 1941 mới trở về Việt Nam.',
      'Đường Nguyễn Tất Thành ở Quận 4 chạy dọc sông Sài Gòn, bắt đầu từ cầu Khánh Hội, ngay chỗ Bến Nhà Rồng.'
    ],
    quiz: [
      { q: 'Nguyễn Tất Thành là tên thời trẻ của ai?', o: ['Bác Hồ', 'Lê Lợi', 'Tôn Đức Thắng', 'Trần Hưng Đạo'], a: 0 },
      { q: 'Năm 1911 Nguyễn Tất Thành ra nước ngoài bằng gì?', o: ['Tàu thủy', 'Máy bay', 'Xe đạp', 'Tàu lửa'], a: 0 }
    ]
  },
  nharong: {
    id: 'nharong', kind: 'place', title: 'Bến Nhà Rồng', who: 'Xây năm 1863', emoji: '🐉',
    color: '#ef6c00',
    facts: [
      'Bến Nhà Rồng nằm ở Quận 4, chỗ rạch Bến Nghé chảy ra sông Sài Gòn, ngay chân cầu Khánh Hội.',
      'Tòa nhà màu vàng xây năm 1863, là trụ sở của hãng tàu biển Pháp. Trên mái có hai con rồng bằng gốm chầu mặt trăng, nên dân gọi là Nhà Rồng.',
      'Ngày 5 tháng 6 năm 1911, Bác Hồ (tên là Nguyễn Tất Thành) từ bến này lên tàu ra đi tìm đường cứu nước.',
      'Từ năm 1979 tòa nhà trở thành Bảo tàng Hồ Chí Minh, trưng bày nhiều hình ảnh, kỷ vật về cuộc đời Bác.',
      'Đứng ở bến có thể thấy tàu bè qua lại trên sông và những tòa nhà cao của Quận 1 bên kia bờ.'
    ],
    quiz: [
      { q: 'Vì sao gọi là Nhà Rồng?', o: ['Trên mái có hai con rồng', 'Trong nhà nuôi rồng', 'Chủ nhà tên Rồng', 'Nhà hình con rồng'], a: 0 },
      { q: 'Bến Nhà Rồng ngày nay là gì?', o: ['Bảo tàng Hồ Chí Minh', 'Chợ', 'Trường học', 'Sân bay'], a: 0 },
      { q: 'Bến Nhà Rồng nằm ở quận nào?', o: ['Quận 4', 'Quận 1', 'Quận 3', 'Quận 7'], a: 0 }
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
   moto (xe máy vượt ở làn trái), ambulance (xe cứu thương), school (vùng đi chậm 60 m; có card = trường có tên, mở thẻ sau khi qua),
   landmark (địa danh có thẻ), bridge (lên cầu 80 m, có sông hai bên),
   light có card = ngã tư có biển tên đường cắt ngang (mở thẻ lịch sử sau khi qua).
   turn: hướng rẽ ở cuối đường ('right'/'left'), next: tên đường kế tiếp. river: -1 = bờ sông bên trái (1 = bên phải) thay cho dãy nhà.
   goalCard: thẻ địa danh nơi đến (world.js dựng mô hình theo id này). helper: người nhờ bé tính tiền ở cuối chuyến
   (items: 2 món cho lớp 2 cộng; multi: lớp 4 nhân n món rồi cộng món thứ hai). */
const ROUTES = [
  {
    id: 'benthanh', name: 'Nhà → Chợ Bến Thành', from: 'Nhà (đường Võ Thị Sáu)', to: 'Chợ Bến Thành', emoji: '🕰️',
    goalCard: 'benthanh', desc: 'Qua Võ Thị Sáu, Hai Bà Trưng và Lê Lợi tới chợ Bến Thành. Khoảng 1 km.',
    helper: { who: 'Dì Năm', emoji: '🍊', bg: '#8d6e63', where: 'Trong chợ', ask: 'Giúp dì bán hàng một chút nha!', job: 'bán hàng',
      items: [{ label: '1 kg cam', emoji: '🍊', price: { g2: 40, g4: 38 } }, { label: '1 nải chuối', emoji: '🍌', price: { g2: 25, g4: 28 } }],
      multi: { label: 'kg xoài', emoji: '🥭', price: 38, n: 3 } },
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
  {
    id: 'dinh', name: 'Nhà → Dinh Độc Lập', from: 'Nhà (đường Võ Thị Sáu)', to: 'Dinh Độc Lập', emoji: '🏛️',
    goalCard: 'dinh', desc: 'Tuyến ngắn: Võ Thị Sáu rồi rẽ trái vào Nam Kỳ Khởi Nghĩa, qua trường Lê Quý Đôn tới Dinh Độc Lập. Khoảng 650 m.',
    helper: { who: 'Chú Sáu', emoji: '🎫', bg: '#5c6bc0', where: 'Quầy vé Dinh Độc Lập', ask: 'Giúp chú bán vé một chút nha!', job: 'bán vé',
      items: [{ label: '1 vé người lớn', emoji: '🎫', price: { g2: 40, g4: 40 } }, { label: '1 vé trẻ em', emoji: '🎟️', price: { g2: 10, g4: 15 } }],
      multi: { label: 'vé người lớn', emoji: '🎫', price: 40, n: 3, unit: 'vé' } },
    streets: [
      { card: 'vts', length: 280, turn: 'left', next: 'Nam Kỳ Khởi Nghĩa',
        events: [
          { x: 50, type: 'shop', shop: 'banhmi' },
          { x: 100, type: 'light' },
          { x: 150, type: 'obstacle' },
          { x: 190, type: 'zebra' },
          { x: 228, type: 'moto' }
        ] },
      { card: 'nkkn', length: 370, turn: null,
        events: [
          { x: 40, type: 'shop', shop: 'nuocmia' },
          { x: 90, type: 'light', card: 'ntmk' },
          { x: 130, type: 'school', card: 'lqd' },
          { x: 225, type: 'zebra' },
          { x: 255, type: 'ambulance' },
          { x: 295, type: 'shop', shop: 'traicay' },
          { x: 335, type: 'light' }
        ] }
    ]
  },
  {
    id: 'ducba', name: 'Nhà → Nhà thờ Đức Bà', from: 'Nhà (đường Võ Thị Sáu)', to: 'Nhà thờ Đức Bà', emoji: '⛪',
    goalCard: 'ducba', desc: 'Qua Võ Thị Sáu, Pasteur và Nguyễn Du, ngang Bưu điện Thành phố tới Nhà thờ Đức Bà. Khoảng 900 m.',
    helper: { who: 'Cô Hai', emoji: '🎈', bg: '#c08a2e', where: 'Trước Bưu điện', ask: 'Giúp cô bán bưu thiếp và bong bóng nha!', job: 'bán hàng',
      items: [{ label: '1 tấm bưu thiếp', emoji: '📮', price: { g2: 15, g4: 15 } }, { label: '1 quả bong bóng', emoji: '🎈', price: { g2: 30, g4: 35 } }],
      multi: { label: 'tấm bưu thiếp', emoji: '📮', price: 15, n: 4, unit: 'tấm' } },
    streets: [
      { card: 'vts', length: 300, turn: 'left', next: 'Pasteur',
        events: [
          { x: 55, type: 'shop', shop: 'banhmi' },
          { x: 110, type: 'light' },
          { x: 150, type: 'zebra' },
          { x: 190, type: 'moto' },
          { x: 225, type: 'obstacle' },
          { x: 262, type: 'light' }
        ] },
      { card: 'pas', length: 320, turn: 'left', next: 'Nguyễn Du',
        events: [
          { x: 40, type: 'moto' },
          { x: 90, type: 'light' },
          { x: 140, type: 'shop', shop: 'nuocmia' },
          { x: 185, type: 'zebra' },
          { x: 220, type: 'ambulance' },
          { x: 255, type: 'obstacle' },
          { x: 290, type: 'light' }
        ] },
      { card: 'nguyendu', length: 300, turn: null,
        events: [
          { x: 60, type: 'light', card: 'nkkn' },
          { x: 120, type: 'zebra' },
          { x: 165, type: 'shop', shop: 'traicay' },
          { x: 215, type: 'landmark', card: 'buudien' },
          { x: 262, type: 'light' }
        ] }
    ]
  },
  {
    id: 'zoo', name: 'Nhà → Thảo Cầm Viên', from: 'Nhà (đường Võ Thị Sáu)', to: 'Thảo Cầm Viên', emoji: '🦒',
    goalCard: 'zoo', desc: 'Qua Võ Thị Sáu, Hai Bà Trưng và Nguyễn Thị Minh Khai tới Thảo Cầm Viên, nơi có hươu cao cổ và voi. Khoảng 1 km.',
    helper: { who: 'Cô Lan', emoji: '🥕', bg: '#2e7d32', where: 'Quầy thức ăn cho thú', ask: 'Giúp cô bán thức ăn cho thú nha!', job: 'bán hàng',
      items: [{ label: '1 bó cà rốt cho hươu', emoji: '🥕', price: { g2: 20, g4: 20 } }, { label: '1 nải chuối cho voi', emoji: '🍌', price: { g2: 25, g4: 28 } }],
      multi: { label: 'bó cà rốt', emoji: '🥕', price: 20, n: 4, unit: 'bó' } },
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
      { card: 'hbt', length: 300, turn: 'left', next: 'Nguyễn Thị Minh Khai',
        events: [
          { x: 40, type: 'moto' },
          { x: 85, type: 'shop', shop: 'nuocmia' },
          { x: 130, type: 'light' },
          { x: 175, type: 'zebra' },
          { x: 215, type: 'obstacle' },
          { x: 258, type: 'light' }
        ] },
      { card: 'ntmk', length: 380, turn: null,
        events: [
          { x: 50, type: 'light' },
          { x: 95, type: 'school' },
          { x: 190, type: 'ambulance' },
          { x: 230, type: 'shop', shop: 'traicay' },
          { x: 275, type: 'zebra' },
          { x: 300, type: 'moto' },
          { x: 335, type: 'light', card: 'nbk' }
        ] }
    ]
  },
  {
    id: 'nharong', name: 'Nhà → Bến Nhà Rồng', from: 'Nhà (đường Võ Thị Sáu)', to: 'Bến Nhà Rồng', emoji: '🐉',
    goalCard: 'nharong', desc: 'Tuyến xa nhất: Võ Thị Sáu, Hai Bà Trưng, dọc sông Sài Gòn theo Tôn Đức Thắng rồi qua cầu Khánh Hội tới Bến Nhà Rồng. Khoảng 1,3 km.',
    helper: { who: 'Chú Bảy', emoji: '🍦', bg: '#ef6c00', where: 'Quán kem ở bến tàu', ask: 'Giúp chú bán kem một chút nha!', job: 'bán kem',
      items: [{ label: '1 cây kem', emoji: '🍦', price: { g2: 15, g4: 15 } }, { label: '1 ly nước mía', emoji: '🥤', price: { g2: 10, g4: 12 } }],
      multi: { label: 'cây kem', emoji: '🍦', price: 15, n: 4, unit: 'cây' } },
    streets: [
      { card: 'vts', length: 300, turn: 'right', next: 'Hai Bà Trưng',
        events: [
          { x: 55, type: 'shop', shop: 'banhmi' },
          { x: 105, type: 'light' },
          { x: 150, type: 'zebra' },
          { x: 195, type: 'obstacle' },
          { x: 235, type: 'moto' },
          { x: 262, type: 'light' }
        ] },
      { card: 'hbt', length: 320, turn: 'right', next: 'Tôn Đức Thắng',
        events: [
          { x: 45, type: 'moto' },
          { x: 80, type: 'school' },
          { x: 160, type: 'shop', shop: 'nuocmia' },
          { x: 205, type: 'light' },
          { x: 245, type: 'ambulance' },
          { x: 282, type: 'zebra' }
        ] },
      { card: 'tdt', length: 320, turn: 'left', next: 'Nguyễn Tất Thành', river: -1,
        events: [
          { x: 30, type: 'landmark', card: 'tranhungdao' },
          { x: 85, type: 'zebra' },
          { x: 125, type: 'moto' },
          { x: 170, type: 'obstacle' },
          { x: 215, type: 'light' },
          { x: 262, type: 'zebra' }
        ] },
      { card: 'ntt', length: 320, turn: null, river: -1,
        events: [
          { x: 20, type: 'bridge' },
          { x: 150, type: 'zebra' },
          { x: 195, type: 'shop', shop: 'traicay' },
          { x: 240, type: 'moto' },
          { x: 280, type: 'light' }
        ] }
    ]
  }
];

/* ================= CÂU ÔN KỸ NĂNG YẾU (từ Vở Ôn Toán) =================
   Khi bé ghé tiệm, người bán đố thêm một câu thuộc kỹ năng mà bé hay quên nhất trong Vở Ôn Toán
   (zzz.js đọc thẻ FSRS của app toán: ZZZ.weakSkills). id trùng với id kỹ năng bên Vở Ôn Toán.
   gen() trả { q, ans, unit?, ex?, choices? }: ans là số nguyên (bàn phím số) hoặc một lựa chọn trong choices. */
const REVIEW = (() => {
  const rnd = (a, b) => a + Math.floor(Math.random() * (b - a + 1)), pick = (a) => a[Math.floor(Math.random() * a.length)];
  const big = (t) => `<span class="big">${t}</span>`;
  const R = {};
  R.g2_cong = { name: 'Cộng có nhớ (phạm vi 100)', gen() { let a, b; do { a = rnd(12, 79); b = rnd(6, 49); } while ((a % 10) + (b % 10) < 10 || a + b > 100); return { q: big(`${a} + ${b} = ?`), ans: a + b, ex: `Cộng hàng đơn vị trước, có nhớ 1: ${a} + ${b} = ${a + b}.` }; } };
  R.g2_tru = { name: 'Trừ có nhớ (phạm vi 100)', gen() { let a, b; do { a = rnd(31, 99); b = rnd(7, a - 10); } while ((a % 10) >= (b % 10)); return { q: big(`${a} − ${b} = ?`), ans: a - b, ex: `${a % 10} không trừ được ${b % 10}, mượn 1 chục: ${a} − ${b} = ${a - b}.` }; } };
  R.g2_sosanh = { name: 'So sánh số có ba chữ số', gen() { const a = rnd(100, 999); let b = Math.random() < .15 ? a : Math.random() < .5 ? a + rnd(-9, 9) : Math.floor(a / 100) * 100 + rnd(0, 99); b = Math.min(999, Math.max(100, b)); const s = a > b ? '>' : a < b ? '<' : '='; return { q: big(`${a} &nbsp;?&nbsp; ${b}`), choices: ['<', '=', '>'], ans: s, ex: `So hàng trăm trước, rồi hàng chục, hàng đơn vị: ${a} ${s} ${b}.` }; } };
  R.g2_cautao = { name: 'Cấu tạo số (trăm, chục, đơn vị)', gen() { const h = rnd(1, 9), t = rnd(0, 9), u = rnd(0, 9), n = h * 100 + t * 10 + u; return { q: `Số gồm ${big(h)} trăm, ${big(t)} chục và ${big(u)} đơn vị là số nào?`, ans: n, ex: `Viết lần lượt hàng trăm, chục, đơn vị: ${n}.` }; } };
  R.g2_nhan = { name: 'Bảng nhân 2 và 5', gen() { const a = pick([2, 5]), b = rnd(1, 10); return Math.random() < .5 ? { q: big(`${a} × ${b} = ?`), ans: a * b, ex: `${a} × ${b} = ${a * b}.` } : { q: big(`${b} × ${a} = ?`), ans: a * b, ex: `${b} × ${a} = ${a} × ${b} = ${a * b}.` }; } };
  R.g2_chia = { name: 'Bảng chia 2 và 5', gen() { const a = pick([2, 5]), b = rnd(1, 10); return { q: big(`${a * b} : ${a} = ?`), ans: b, ex: `${a} × ${b} = ${a * b} nên ${a * b} : ${a} = ${b}.` }; } };
  R.g2_timso = { name: 'Tìm số còn thiếu', gen() { const a = rnd(11, 60), b = rnd(10, 39), t = rnd(0, 2); if (t === 0) return { q: big(`? + ${b} = ${a + b}`), ans: a, ex: `Số hạng chưa biết = tổng − số hạng kia: ${a + b} − ${b} = ${a}.` }; if (t === 1) return { q: big(`${a + b} − ? = ${a}`), ans: b, ex: `Số trừ = số bị trừ − hiệu: ${a + b} − ${a} = ${b}.` }; return { q: big(`? − ${b} = ${a}`), ans: a + b, ex: `Số bị trừ = hiệu + số trừ: ${a} + ${b} = ${a + b}.` }; } };
  R.g2_dayso = { name: 'Quy luật dãy số', gen() { const d = pick([2, 3, 4, 5, 10]), up = Math.random() < .7, s0 = up ? rnd(1, 40) : rnd(60, 99); const seq = [0, 1, 2, 3, 4].map(i => up ? s0 + i * d : s0 - i * d), hole = pick([2, 3, 4]); return { q: `Điền số còn thiếu:<br>${big(seq.map((x, i) => i === hole ? '?' : x).join(', '))}`, ans: seq[hole], ex: `Mỗi số ${up ? 'tăng' : 'giảm'} ${d}: số còn thiếu là ${seq[hole]}.` }; } };
  R.g2_canbang = { name: 'Đoán giá trị con vật, đồ vật', gen() { const [A, B] = pick([['🍎', '🍌'], ['🐱', '🐶'], ['⭐', '🌙'], ['🍓', '🍇'], ['🚗', '🚲']]), a = rnd(2, 9), b = rnd(1, 9); return { q: `<div class="eq">${A} + ${A} = ${2 * a}<br>${A} + ${B} = ${a + b}<br>${B} = ?</div>`, ans: b, ex: `${A} = ${a} (vì hai ${A} bằng ${2 * a}), nên ${B} = ${a + b} − ${a} = ${b}.` }; } };
  R.g2_1000 = { name: 'Cộng, trừ trong phạm vi 1000', gen() { if (Math.random() < .5) { let a, b; do { a = rnd(105, 750); b = rnd(102, 499); } while (a + b > 999); return { q: big(`${a} + ${b} = ?`), ans: a + b, ex: `Đặt tính thẳng cột: ${a} + ${b} = ${a + b}.` }; } const a = rnd(300, 999), b = rnd(101, a - 50); return { q: big(`${a} − ${b} = ?`), ans: a - b, ex: `Đặt tính thẳng cột: ${a} − ${b} = ${a - b}.` }; } };
  R.g2_donvi = { name: 'Đổi đơn vị độ dài', gen() { const n = rnd(1, 9); return pick([{ q: big(`${n} m = ? dm`), ans: n * 10, unit: 'dm', ex: `1 m = 10 dm nên ${n} m = ${n * 10} dm.` }, { q: big(`${n} dm = ? cm`), ans: n * 10, unit: 'cm', ex: `1 dm = 10 cm nên ${n} dm = ${n * 10} cm.` }, { q: big(`${n} m = ? cm`), ans: n * 100, unit: 'cm', ex: `1 m = 100 cm nên ${n} m = ${n * 100} cm.` }, { q: big(`${n} km = ? m`), ans: n * 1000, unit: 'm', ex: `1 km = 1000 m nên ${n} km = ${n * 1000} m.` }]); } };
  R.g2_tien = { name: 'Tiền Việt Nam', gen() { const notes = [1, 2, 5, 10, 20, 50], k = rnd(2, 3), take = []; for (let i = 0; i < k; i++) take.push(pick(notes)); const sum = take.reduce((x, y) => x + y, 0); return { q: `Con có ${take.map(v => `tờ ${big(v + ' nghìn')}`).join(' và ')}. Tất cả bao nhiêu nghìn đồng?`, ans: sum, unit: 'nghìn', ex: `${take.join(' + ')} = ${sum} nghìn.` }; } };
  R.g2_loivan = { name: 'Toán có lời văn (nhiều hơn, ít hơn)', gen() { const a = rnd(18, 60), b = rnd(5, 19); return pick([{ q: `Lớp 2A có ${a} bạn nữ. Số bạn nam nhiều hơn số bạn nữ ${b} bạn. Hỏi lớp 2A có bao nhiêu bạn nam?`, ans: a + b, unit: 'bạn', ex: `"Nhiều hơn" thì cộng: ${a} + ${b} = ${a + b}.` }, { q: `Cây cam có ${a + b} quả. Bà hái ${b} quả biếu hàng xóm. Hỏi trên cây còn lại bao nhiêu quả?`, ans: a, unit: 'quả', ex: `Hái đi thì bớt: ${a + b} − ${b} = ${a}.` }, { q: `Bao gạo nặng ${a + b} kg, bao ngô nhẹ hơn bao gạo ${b} kg. Hỏi bao ngô nặng bao nhiêu kg?`, ans: a, unit: 'kg', ex: `"Nhẹ hơn" thì trừ: ${a + b} − ${b} = ${a}.` }]); } };
  R.g2_nhanloi = { name: 'Toán có lời văn phép nhân, chia', gen() { const a = pick([2, 5]), b = rnd(2, 9); return Math.random() < .5 ? { q: `Mỗi hộp có ${a} cái bánh. Hỏi ${b} hộp như thế có bao nhiêu cái bánh?`, ans: a * b, unit: 'cái', ex: `${a} × ${b} = ${a * b} cái bánh.` } : { q: `Có ${a * b} viên kẹo chia đều cho ${a} bạn. Hỏi mỗi bạn được mấy viên kẹo?`, ans: b, unit: 'viên', ex: `${a * b} : ${a} = ${b} viên.` }; } };
  R.g4_giatri = { name: 'Giá trị của chữ số (đến lớp triệu)', gen() { let n, s0, i; do { n = rnd(10000, 999999); s0 = String(n); i = rnd(0, s0.length - 1); } while (s0[i] === '0' || s0.indexOf(s0[i]) !== i); const d = +s0[i], e = s0.length - 1 - i, val = d * Math.pow(10, e); return { q: `Trong số ${big(n.toLocaleString('vi-VN'))}, chữ số ${big(d)} có giá trị bao nhiêu?`, ans: val, ex: `Chữ số ${d} ở hàng ${['đơn vị', 'chục', 'trăm', 'nghìn', 'chục nghìn', 'trăm nghìn', 'triệu'][e]} nên có giá trị ${val.toLocaleString('vi-VN')}.` }; } };
  R.g4_lamtron = { name: 'Làm tròn số', gen() { const p = pick([10, 100, 1000]), n = rnd(1200, 98765), r = Math.round(n / p) * p; return { q: `Làm tròn số ${big(n.toLocaleString('vi-VN'))} đến hàng ${p === 10 ? 'chục' : p === 100 ? 'trăm' : 'nghìn'}.`, ans: r, ex: `Nhìn chữ số bên phải hàng cần làm tròn (dưới 5 giữ nguyên, từ 5 lên): ${r.toLocaleString('vi-VN')}.` }; } };
  R.g4_congtru = { name: 'Cộng, trừ số có nhiều chữ số', gen() { const a = rnd(1234, 48765), b = rnd(1050, 39999); return Math.random() < .5 ? { q: big(`${a.toLocaleString('vi-VN')} + ${b.toLocaleString('vi-VN')} = ?`), ans: a + b, ex: `Đặt tính thẳng cột: ${a} + ${b} = ${(a + b).toLocaleString('vi-VN')}.` } : { q: big(`${Math.max(a, b).toLocaleString('vi-VN')} − ${Math.min(a, b).toLocaleString('vi-VN')} = ?`), ans: Math.abs(a - b), ex: `Đặt tính thẳng cột: ${Math.max(a, b)} − ${Math.min(a, b)} = ${Math.abs(a - b).toLocaleString('vi-VN')}.` }; } };
  R.g4_nhan = { name: 'Nhân với số có hai chữ số', gen() { const a = rnd(23, 489), b = rnd(12, 49); return { q: big(`${a} × ${b} = ?`), ans: a * b, ex: `${a} × ${b % 10} rồi ${a} × ${Math.floor(b / 10)} chục, cộng lại: ${(a * b).toLocaleString('vi-VN')}.` }; } };
  R.g4_chia1 = { name: 'Chia cho số có một chữ số', gen() { const b = rnd(2, 9), q = rnd(102, 987); return { q: big(`${(b * q).toLocaleString('vi-VN')} : ${b} = ?`), ans: q, ex: `${b} × ${q} = ${b * q} nên thương là ${q}.` }; } };
  R.g4_chia2 = { name: 'Chia cho số có hai chữ số', gen() { const b = rnd(12, 45), q = rnd(12, 98); return { q: big(`${(b * q).toLocaleString('vi-VN')} : ${b} = ?`), ans: q, ex: `${b} × ${q} = ${b * q} nên thương là ${q}.` }; } };
  R.g4_tbc = { name: 'Trung bình cộng', gen() { const m = rnd(12, 60), d1 = rnd(1, 9), d2 = rnd(1, 9); const xs = [m - d1, m + d1 - d2, m + d2]; return { q: `Trung bình cộng của ba số ${big(xs.join(', '))} là bao nhiêu?`, ans: m, ex: `(${xs.join(' + ')}) : 3 = ${xs.reduce((x, y) => x + y, 0)} : 3 = ${m}.` }; } };
  R.g4_tonghieu = { name: 'Tìm hai số khi biết tổng và hiệu', gen() { const small = rnd(12, 80), d = rnd(4, 30), S = 2 * small + d; return Math.random() < .5 ? { q: `Tổng hai số là ${big(S)}, hiệu hai số là ${big(d)}. Tìm số lớn.`, ans: small + d, ex: `Số lớn = (tổng + hiệu) : 2 = (${S} + ${d}) : 2 = ${small + d}.` } : { q: `Tổng hai số là ${big(S)}, hiệu hai số là ${big(d)}. Tìm số bé.`, ans: small, ex: `Số bé = (tổng − hiệu) : 2 = (${S} − ${d}) : 2 = ${small}.` }; } };
  R.g4_donvi = { name: 'Đổi đơn vị khối lượng, diện tích', gen() { const n = rnd(2, 9); return pick([{ q: big(`${n} kg = ? g`), ans: n * 1000, unit: 'g', ex: `1 kg = 1000 g nên ${n} kg = ${n * 1000} g.` }, { q: big(`${n} tấn = ? kg`), ans: n * 1000, unit: 'kg', ex: `1 tấn = 1000 kg nên ${n} tấn = ${n * 1000} kg.` }, { q: big(`${n} tạ = ? kg`), ans: n * 100, unit: 'kg', ex: `1 tạ = 100 kg nên ${n} tạ = ${n * 100} kg.` }, { q: big(`${n} m² = ? dm²`), ans: n * 100, unit: 'dm²', ex: `1 m² = 100 dm² nên ${n} m² = ${n * 100} dm².` }, { q: big(`${n} dm² = ? cm²`), ans: n * 100, unit: 'cm²', ex: `1 dm² = 100 cm² nên ${n} dm² = ${n * 100} cm².` }]); } };
  R.g4_thoigian = { name: 'Giây, phút, thế kỷ', gen() { const n = rnd(2, 9), y = rnd(1001, 2025), c = Math.ceil(y / 100); return pick([{ q: big(`${n} phút = ? giây`), ans: n * 60, unit: 'giây', ex: `1 phút = 60 giây nên ${n} phút = ${n * 60} giây.` }, { q: big(`${n} giờ = ? phút`), ans: n * 60, unit: 'phút', ex: `1 giờ = 60 phút nên ${n} giờ = ${n * 60} phút.` }, { q: `Năm ${big(y)} thuộc thế kỷ thứ mấy?`, ans: c, ex: `Thế kỷ ${c} gồm các năm ${(c - 1) * 100 + 1} đến ${c * 100}.` }]); } };
  R.g4_dayso = { name: 'Quy luật dãy số nâng cao', gen() { const t = rnd(0, 2); let seq; if (t === 0) { const s0 = rnd(1, 6); seq = [0, 1, 2, 3, 4].map(i => s0 * Math.pow(2, i)); } else if (t === 1) { seq = [1, 2, 3, 4, 5].map(i => i * i); } else { const s0 = rnd(3, 30), d = rnd(6, 25); seq = [0, 1, 2, 3, 4].map(i => s0 + i * d); } const hole = pick([3, 4]); return { q: `Điền số còn thiếu:<br>${big(seq.map((x, i) => i === hole ? '?' : x).join(', '))}`, ans: seq[hole], ex: t === 0 ? `Mỗi số gấp đôi số trước: ${seq[hole]}.` : t === 1 ? `Các số chính phương 1×1, 2×2, 3×3…: ${seq[hole]}.` : `Mỗi số tăng ${seq[1] - seq[0]}: ${seq[hole]}.` }; } };
  R.g4_tuoi = { name: 'Bài toán tuổi', gen() { const c = rnd(5, 12), d = rnd(24, 32); return Math.random() < .5 ? { q: `Mẹ ${big(c + d)} tuổi, mẹ hơn con ${big(d)} tuổi. Hỏi con mấy tuổi?`, ans: c, unit: 'tuổi', ex: `${c + d} − ${d} = ${c} tuổi.` } : { q: `Tổng số tuổi của hai mẹ con là ${big(2 * c + d)}, mẹ hơn con ${big(d)} tuổi. Hỏi con mấy tuổi?`, ans: c, unit: 'tuổi', ex: `Tuổi con = (tổng − hiệu) : 2 = (${2 * c + d} − ${d}) : 2 = ${c}.` }; } };
  R.g4_canbang = { name: 'Suy luận giá trị ẩn', gen() { const [A, B] = pick([['🍎', '🍌'], ['⭐', '🌙'], ['🐱', '🐶'], ['🚗', '🚲']]), a = rnd(3, 12), b = rnd(2, 15); return { q: `<div class="eq">${A} + ${A} + ${A} = ${3 * a}<br>${A} + ${B} + ${B} = ${a + 2 * b}<br>${B} = ?</div>`, ans: b, ex: `${A} = ${3 * a} : 3 = ${a}; hai ${B} = ${a + 2 * b} − ${a} = ${2 * b}, nên ${B} = ${b}.` }; } };
  return R;
})();
