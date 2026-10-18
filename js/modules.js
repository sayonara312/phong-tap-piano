// Thư viện kiến thức (module) dùng để sinh giáo án. Mỗi module là một đơn vị nhạc lý / kỹ thuật,
// có phần giải thích chung và phần "vì sao cần cho bài này" lấy số liệu từ bản phân tích.
// Thêm module mới: thêm một mục vào MODULES và (nếu cần) một điều kiện trong planner.js.

const bar = n => "ô " + n;
const tri = k => {
  // hợp âm chủ của giọng
  const names = k.minor ? "thứ" : "trưởng";
  return k.name.replace(/ (trưởng|thứ)$/, "") + " " + names;
};

export const MODULES = {
  keyboard: {
    title: "Bàn phím, tên nốt và số ngón",
    body: () => [
      "Phím đen xếp thành nhóm 2 và nhóm 3. Phím trắng ngay bên trái nhóm 2 phím đen là Đô (C). Đô gần giữa đàn nhất gọi là Đô giữa (Đô4).",
      "Bảy nốt lặp lại theo vòng: Đô Rê Mi Fa Sol La Si (C D E F G A B), rồi lại Đô ở quãng 8 kế tiếp.",
      "Số ngón: ngón cái là 1, ngón trỏ 2, ngón giữa 3, ngón áp út 4, ngón út 5, cho cả hai tay. Ngồi cách đàn sao cho khuỷu tay ngang mặt phím, cổ tay thẳng, các ngón cong như đang cầm quả cam."
    ],
    why: () => "Mọi bước sau đều dựa vào việc tìm đúng phím thật nhanh. Bản phổ ghi số ngón theo đúng quy ước 1–5 này.",
    warmup: () => ({ task: "Tìm và bấm mọi phím Đô trên đàn từ trái sang phải bằng ngón 3, rồi tất cả phím Fa.", bpm: null, pass: "Không nhìn nhầm lần nào" }),
    mistake: { title: "Ngón tay duỗi thẳng, bấm bằng bụng ngón", fix: "Giữ ngón cong, bấm bằng đầu ngón. Tưởng tượng đang cầm một quả cam nhỏ trong lòng bàn tay." },
    check: () => [{ q: "Đô nằm ở đâu so với nhóm 2 phím đen?", a: "Phím trắng ngay bên trái nhóm 2 phím đen." }, { q: "Ngón 4 là ngón nào?", a: "Ngón áp út." }],
    tool: () => ({ type: "notes", label: "Tìm nốt trên bàn phím" })
  },
  treble: {
    title: "Khóa Sol và đọc nốt tay phải",
    body: () => [
      "Khuông nhạc có 5 dòng kẻ và 4 khe. Khóa Sol (𝄞) cuộn quanh dòng kẻ thứ 2 tính từ dưới lên: đó là nốt Sol4.",
      "Năm dòng kẻ khóa Sol, từ dưới lên: Mi – Sol – Si – Rê – Fa. Bốn khe: Fa – La – Đô – Mi.",
      "Đô giữa nằm trên dòng kẻ phụ ngay dưới khuông khóa Sol."
    ],
    why: (c) => "Tay phải của bài được ghi chủ yếu ở khóa Sol" + (c.A.rRange[1] > 81 ? ", và có lúc lên rất cao (dòng kẻ phụ phía trên hoặc ký hiệu 8va)." : "."),
    warmup: () => ({ task: "Tay phải thế 5 ngón: ngón 1 trên Đô giữa … ngón 5 trên Sol. Đi lên rồi đi xuống, mỗi nốt 1 phách.", bpm: 60, pass: "2 lượt đều" }),
    mistake: { title: "Đếm từ Đô lên mỗi lần gặp một nốt", fix: "Dùng mốc: Đô giữa, Sol (dòng 2), Fa (dòng trên cùng). Nốt nào gần mốc nào thì đếm từ mốc đó." },
    check: () => [{ q: "Dòng kẻ dưới cùng khóa Sol là nốt gì?", a: "Mi (Mi4)." }, { q: "Bốn khe khóa Sol đọc thành chữ gì?", a: "F A C E: Fa La Đô Mi." }],
    tool: () => ({ type: "clef", clef: "treble", label: "Đọc nốt khóa Sol" })
  },
  rhythm: {
    title: "Trường độ và đếm phách",
    body: () => [
      "Nốt tròn = 4 phách, nốt trắng = 2 phách, nốt đen = 1 phách, nốt móc đơn = nửa phách. Hai móc đơn đếm “1 – và”.",
      "Số nhịp ở đầu bài (ví dụ 4/4) cho biết mỗi ô có mấy phách và loại nốt nào là một phách.",
      "Metronome trên đàn điện giữ phách đều. Luôn bật nó khi tập bài mới."
    ],
    why: (c) => "Bài có " + c.A.barCount + " ô ở nhịp " + c.A.meters.join(", ") + ". Đếm phách đúng thì hai tay mới khớp được với nhau.",
    warmup: () => ({ task: "Vỗ tay theo metronome: 4 nốt đen, 2 nốt trắng, 1 nốt tròn, 8 móc đơn. Đếm to.", bpm: 60, pass: "4 ô liền không lệch" }),
    mistake: { title: "Nhả nốt dài quá sớm", fix: "Đếm to và chỉ nhấc ngón đúng lúc bắt đầu nốt tiếp theo." },
    check: () => [{ q: "Nốt trắng giữ mấy phách?", a: "2 phách." }, { q: "Một nốt đen bằng mấy móc đơn?", a: "2 móc đơn." }],
    tool: null
  },
  bass: {
    title: "Khóa Fa và đọc nốt tay trái",
    body: () => [
      "Khóa Fa (𝄢) có hai chấm kẹp dòng kẻ thứ 4 tính từ dưới lên. Dòng đó là nốt Fa3, ngay dưới Đô giữa.",
      "Năm dòng kẻ khóa Fa, từ dưới lên: Sol – Si – Rê – Fa – La. Bốn khe: La – Đô – Mi – Sol.",
      "Đô giữa nằm trên dòng kẻ phụ ngay phía trên khuông khóa Fa."
    ],
    why: (c) => "Tay trái xuống âm vực trầm từ " + bar(c.A.firstOf.bass) + ", phần đó được ghi bằng khóa Fa." + (c.A.firstOf.bass > 1 ? " Trước " + bar(c.A.firstOf.bass) + ", tay trái chơi cao nên có thể được ghi bằng khóa Sol: luôn nhìn khóa ở đầu khuông." : ""),
    warmup: () => ({ task: "Tay trái thế 5 ngón: ngón 5 trên Đô3 … ngón 1 trên Sol3. Đi lên rồi đi xuống.", bpm: 60, pass: "2 lượt đều" }),
    mistake: { title: "Đọc khóa Fa theo thói quen của khóa Sol", fix: "Hai khóa lệch nhau 2 bậc: dòng dưới cùng khóa Sol là Mi, khóa Fa là Sol. Luôn bắt đầu từ dòng Fa giữa hai chấm." },
    check: () => [{ q: "Dòng kẻ dưới cùng của khóa Fa là nốt gì?", a: "Sol (Sol2)." }, { q: "Hai chấm của khóa Fa kẹp nốt nào?", a: "Fa3." }],
    tool: () => ({ type: "clef", clef: "bass", label: "Đọc nốt khóa Fa" })
  },
  keysig: {
    title: "Hóa biểu và giọng của bài",
    body: (c) => {
      const k = c.A.key; const n = Math.abs(k.sf);
      return [
        "Dấu thăng (♯) nâng nốt lên nửa cung, tức là phím sát bên phải. Dấu giáng (♭) hạ xuống nửa cung, tức là phím sát bên trái. Dấu bình (♮) hủy thăng hoặc giáng tới hết ô nhịp.",
        "Hóa biểu là các dấu hóa đặt ở đầu mỗi dòng nhạc. Hóa biểu áp dụng cho mọi nốt cùng tên, ở mọi quãng 8, suốt cả bài.",
        n ? "Bài này có " + n + " dấu " + (k.sf < 0 ? "giáng" : "thăng") + ": " + k.accNames.join(", ") + ". Giọng của bài là " + k.name + (k.detected ? " (đoán từ các nốt trong file, hãy đối chiếu với bản phổ)." : ".")
          : "Bài này không có dấu hóa ở hóa biểu: giọng " + k.name + "."
      ];
    },
    why: (c) => Math.abs(c.A.key.sf) >= 3 ? "Với " + Math.abs(c.A.key.sf) + " dấu hóa, rất nhiều nốt trên bản phổ là phím đen dù không có dấu ngay cạnh. Quên hóa biểu là lỗi sai nốt phổ biến nhất." : "Biết giọng giúp đoán trước những phím nào sẽ dùng nhiều nhất.",
    warmup: (c) => ({ task: "Chơi chậm gam " + c.A.key.name + " tay phải, 1 quãng 8, mỗi nốt 1 phách.", bpm: 50, pass: "Đúng mọi phím đen/trắng" }),
    mistake: { title: "Quên hóa biểu đầu dòng", fix: "Trước khi tập ô mới, đọc to các nốt có dấu hóa. Viết dấu nhỏ bằng bút chì ở vài ô đầu cho tới khi quen." },
    check: (c) => [{ q: "Hóa biểu của bài gồm những nốt nào?", a: c.A.key.accNames.length ? c.A.key.accNames.join(", ") + " (" + (c.A.key.sf < 0 ? "giáng" : "thăng") + ")." : "Không có." }, { q: "Giọng của bài là gì?", a: c.A.key.name + "." }],
    tool: () => ({ type: "scale", label: "Gam của bài" })
  },
  intervals: {
    title: "Quãng và hợp âm 3 nốt",
    body: () => [
      "Quãng là khoảng cách giữa hai nốt, đếm cả hai đầu theo tên nốt (Đô → Mi là quãng 3). Nửa cung là hai phím sát nhau.",
      "Quãng 3 trưởng = 4 nửa cung (sáng), quãng 3 thứ = 3 nửa cung (buồn), quãng 5 đúng = 7 nửa cung.",
      "Hợp âm 3 nốt = nốt gốc + quãng 3 + quãng 5, xếp “cách một nốt”. Quãng 3 dưới cùng là trưởng thì hợp âm trưởng, là thứ thì hợp âm thứ."
    ],
    why: (c) => "Từ " + bar(c.A.firstOf.chords) + " có hợp âm 3 nốt trở lên. Nhận ra hình hợp âm giúp đặt cả bàn tay một lần thay vì tìm từng nốt.",
    warmup: (c) => ({ task: "Đặt rồi nhấc hợp âm " + tri(c.A.key) + " bằng từng tay (ngón 5-3-1 hoặc 1-3-5), 8 lần.", bpm: 60, pass: "3 nốt kêu cùng lúc" }),
    mistake: { title: "Bấm hợp âm mà các ngón lệch nhau", fix: "Đặt cả bàn tay chạm nhẹ lên các phím trước, rồi ấn một lần từ cổ tay." },
    check: () => [{ q: "Quãng 3 thứ có bao nhiêu nửa cung?", a: "3." }, { q: "Hợp âm trưởng và thứ khác nhau ở đâu?", a: "Ở quãng 3 dưới cùng: trưởng 4 nửa cung, thứ 3 nửa cung." }],
    tool: () => ({ type: "chords", label: "Hợp âm & quãng" })
  },
  compound: {
    title: "Nhịp ghép (6/8, 9/8, 12/8)",
    body: () => [
      "Ở nhịp ghép, mỗi phách lớn là một nốt đen chấm (♩.) chia thành 3 móc đơn. 6/8 có 2 phách lớn, 9/8 có 3, 12/8 có 4.",
      "Đếm 12/8: “1-2-3, 2-2-3, 3-2-3, 4-2-3”. Số đầu mỗi nhóm hơi nhấn.",
      "Metronome trên đàn: đặt số phách lớn (vd. 4 cho 12/8). Mỗi tiếng tích là một nhóm 3 móc đơn."
    ],
    why: (c) => "Từ " + bar(c.A.firstOf.compound) + " bài viết ở nhịp ghép. Đếm theo nhóm 2 sẽ làm mất cảm giác đung đưa của đoạn này.",
    warmup: () => ({ task: "Không dùng đàn: đếm to “1-2-3, 2-2-3…”, tay phải gõ mọi số, tay trái chỉ gõ số đầu nhóm.", bpm: "♩. = 30", pass: "2 ô liền không lệch" }),
    mistake: { title: "Đếm nhịp ghép thành nhóm 2", fix: "Nhấn nhẹ nốt đầu mỗi nhóm 3. Nếu tiếng tích rơi vào nốt thứ 2 hoặc 3 của nhóm là đã lệch." },
    check: () => [{ q: "Một phách lớn trong 12/8 bằng mấy móc đơn?", a: "3 (một nốt đen chấm)." }],
    tool: null
  },
  meterChange: {
    title: "Chỗ đổi nhịp",
    body: (c) => {
      const s = c.A.sections.find(x => x.a === c.A.firstOf.meterChange); const prev = c.A.sections[c.A.sections.indexOf(s) - 1];
      return ["Ở " + bar(s.a) + ", nhịp đổi từ " + prev.meter + " sang " + s.meter + ". Cách đếm và cảm giác phách đổi theo.",
        "Tập chỗ nối riêng: 2 ô trước và 2 ô sau chỗ đổi. Đếm thầm một ô ở nhịp mới trong lúc nốt cuối đoạn trước đang ngân."];
    },
    why: () => "Người nghe nhớ nhất những chỗ chuyển đoạn. Chuyển nhịp êm thì cả bài nghe liền mạch.",
    warmup: () => ({ task: "Đếm to 2 ô nhịp cũ rồi 2 ô nhịp mới, vỗ tay theo.", bpm: 60, pass: "Chuyển không khựng" }),
    mistake: { title: "Mang cách đếm cũ sang đoạn mới", fix: "Đánh dấu bút chì chỗ đổi nhịp và viết cách đếm mới lên trên ô đó." },
    check: (c) => { const s = c.A.sections.find(x => x.a === c.A.firstOf.meterChange); return [{ q: "Bài đổi nhịp ở ô nào?", a: bar(s.a) + ", sang " + s.meter + "." }]; },
    tool: null
  },
  octave: {
    title: "Quãng 8 và ký hiệu 8va",
    body: () => [
      "Quãng 8 là hai nốt cùng tên, cách nhau 12 nửa cung. Bấm bằng ngón 1 và 5 (phím đen phía trên có thể dùng ngón 4).",
      "Ký hiệu 8va nghĩa là chơi cao hơn 1 quãng 8 so với nốt viết, 8vb là thấp hơn. Gặp ký hiệu này thì đóng khung bằng bút chì."
    ],
    why: (c) => "Từ " + bar(c.A.firstOf.octave) + " có quãng 8 chơi cùng lúc. Bàn tay người mới thường chỉ vừa đủ, nên cần tập mở tay mà không gồng.",
    warmup: (c) => ({ task: "Chơi quãng 8 trên nốt chủ của giọng " + c.A.key.name + " bằng từng tay, nhấc rồi đặt 8 lần.", bpm: 60, pass: "Không chạm phím bên cạnh" }),
    mistake: { title: "Gồng cứng bàn tay khi mở quãng 8", fix: "Chỉ mở ngón 1 và 5, các ngón giữa giữ cong và thả lỏng. Nhả hẳn tay sau mỗi lần bấm." },
    check: () => [{ q: "Quãng 8 có bao nhiêu nửa cung?", a: "12." }],
    tool: () => ({ type: "chords", interval: true, label: "Đo quãng" })
  },
  dotted: {
    title: "Dấu chấm dôi và dấu nối",
    body: () => [
      "Dấu chấm dôi cộng thêm một nửa trường độ: nốt đen chấm = 1,5 phách, nốt trắng chấm = 3 phách.",
      "Dấu nối nối hai nốt cùng cao độ: chỉ bấm nốt đầu rồi giữ qua cả hai. Dấu luyến nối các nốt khác cao độ: chơi liền tiếng."
    ],
    why: (c) => "Từ " + bar(c.A.firstOf.dotted) + " có nốt chấm dôi hoặc nốt kéo qua phách. Đếm sai những chỗ này thì giai điệu nghe như bị xô.",
    warmup: () => ({ task: "Vỗ tay: đen chấm + móc đơn, lặp 4 ô, đếm “1 – – và 2”.", bpm: 60, pass: "4 ô đều" }),
    mistake: { title: "Bấm lại nốt ở dấu nối", fix: "Tô màu đường nối bằng bút chì để không quên chỉ bấm một lần." },
    check: () => [{ q: "Nốt đen chấm dài mấy phách?", a: "1,5 phách." }],
    tool: null
  },
  accidentals: {
    title: "Dấu hóa bất thường",
    body: () => [
      "Dấu hóa bất thường là dấu ♯, ♭ hoặc ♮ đặt ngay trước một nốt, ngoài hóa biểu. Nó có hiệu lực cho nốt cùng tên tới hết ô nhịp đó.",
      "Khoanh bút chì mọi dấu bất thường trước khi tập ô có nó."
    ],
    why: (c) => "Bài có nốt ngoài giọng từ " + bar(c.A.firstOf.accidentals) + ". Tay đã quen hóa biểu sẽ tự bấm sai ở những chỗ này nếu không đánh dấu trước.",
    warmup: () => ({ task: "Chơi một nốt, rồi nốt đó có dấu bình/thăng/giáng, rồi trở lại, 5 lần.", bpm: 60, pass: "Đúng phím mọi lần" }),
    mistake: { title: "Mang dấu bất thường sang ô sau", fix: "Dấu bất thường hết hiệu lực ở vạch nhịp. Ô sau quay về hóa biểu." },
    check: () => [{ q: "Dấu bất thường có hiệu lực tới đâu?", a: "Tới hết ô nhịp." }],
    tool: null
  },
  voicing: {
    title: "Giai điệu nổi lên trong hợp âm",
    body: () => [
      "Khi một tay bấm nhiều nốt cùng lúc, nốt cao nhất thường là giai điệu. Dồn trọng lượng về phía ngón đó (thường ngón 5), các nốt khác bấm nhẹ hơn.",
      "Cách tập: chơi riêng nốt giai điệu trước, rồi thêm các nốt dưới thật nhẹ. Nếu còn khó, bản đơn giản là chỉ chơi nốt giai điệu."
    ],
    why: (c) => "Từ " + bar(c.A.firstOf.voicing) + " tay phải có nhiều nốt cùng lúc. Giai điệu không nổi lên thì đoạn đó chỉ còn là một khối âm thanh.",
    warmup: () => ({ task: "Tay phải chơi quãng 3, ngón trên ấn mạnh hơn ngón dưới, 8 lần.", bpm: 60, pass: "Nghe rõ nốt trên" }),
    mistake: { title: "Mọi nốt to như nhau", fix: "Tập riêng nốt trên trước, sau đó thêm nốt dưới thật nhẹ." },
    check: () => [{ q: "Trong hợp âm tay phải, nốt nào thường là giai điệu?", a: "Nốt cao nhất." }],
    tool: null
  },
  shift: {
    title: "Chuyển thế tay giữa các hợp âm",
    body: () => [
      "Tập im lặng: đặt tay lên hợp âm kế tiếp mà không bấm, kiểm tra đúng chưa, rồi mới bấm.",
      "Tìm nốt chung giữa hai hợp âm liền nhau và giữ ngón ở đó làm trục. Tập theo cặp: hợp âm 1 → 2, rồi 2 → 3."
    ],
    why: () => "Đoạn hôm nay đổi hợp âm liên tục. Tay ít rời phím thì ít lạc.",
    warmup: (c) => ({ task: "Đổi qua lại giữa hợp âm I và IV của giọng " + c.A.key.name + ", 8 lần, tìm nốt chung.", bpm: 50, pass: "Đổi không nhìn tay" }),
    mistake: { title: "Nhấc hết tay rồi mới tìm hợp âm mới", fix: "Giữ ngón ở nốt chung, chỉ di chuyển các ngón còn lại." },
    check: () => [{ q: "Tập “im lặng” là gì?", a: "Đặt tay lên hợp âm kế tiếp mà không bấm, kiểm tra rồi mới bấm." }],
    tool: null
  },
  leaps: {
    title: "Nhảy quãng xa",
    body: () => [
      "Mắt đi trước tay: nhìn nốt đích trước khi rời nốt cũ. Nhảy bằng cả cánh tay, các ngón giữ hình, không với ngón.",
      "Dùng nốt ngân hoặc pedal để có thời gian di chuyển. Thuộc lòng 2 ô quanh cú nhảy để lúc nhảy có thể nhìn tay."
    ],
    why: (c) => "Từ " + bar(c.A.firstOf.leaps) + " có những bước nhảy hơn một quãng 8. Nhảy sai bass thì cả hòa âm bị lệch.",
    warmup: () => ({ task: "Tay trái nhảy 2 quãng 8 xuống rồi lên lại, nhìn đích trước, 8 lần.", bpm: 50, pass: "Trúng đích 6/8 lần" }),
    mistake: { title: "Nhìn bản phổ trong lúc nhảy", fix: "Lúc nhảy thì nhìn tay, xong mới nhìn lại bản phổ." },
    check: () => [{ q: "Nhảy quãng nên dùng bộ phận nào?", a: "Cả cánh tay, mắt nhìn đích trước." }],
    tool: null
  },
  running: {
    title: "Tay trái chạy đều",
    body: () => [
      "Khi tay trái chơi móc đơn liên tục, nó là “động cơ” của đoạn nhạc. Tập riêng tay trái tới mức chơi được mà không cần nghĩ.",
      "Giữ cổ tay mềm, các ngón gần phím. Dùng metronome và tăng tốc từng chút một."
    ],
    why: (c) => "Từ " + bar(c.A.firstOf.running) + ", tay trái chạy liên tục dưới giai điệu. Tay trái vững thì tay phải mới hát được.",
    warmup: (c) => ({ task: "Tay trái chơi rải hợp âm " + tri(c.A.key) + " lên xuống theo móc đơn, 4 ô.", bpm: 60, pass: "Đều, không nhấn lung tung" }),
    mistake: { title: "Tay trái to hơn giai điệu", fix: "Tay trái chơi nhỏ hơn tay phải một bậc (mp dưới mf)." },
    check: () => [{ q: "Vì sao tay trái phải thuộc trước khi ghép?", a: "Để sự chú ý dành cho giai điệu tay phải." }],
    tool: null
  },
  repChords: {
    title: "Hợp âm nhắc lại và cổ tay thả lỏng",
    body: () => [
      "Bấm cùng một hợp âm nhiều lần liên tiếp rất dễ mỏi. Bấm bằng cổ tay nảy nhẹ, không bằng cẳng tay gồng.",
      "Giữa hai lần bấm, thả lỏng ngay. Thấy mỏi cẳng tay thì dừng 30 giây."
    ],
    why: (c) => "Từ " + bar(c.A.firstOf.repChords) + " có hợp âm nhắc lại liên tục. Đây thường là đoạn cao trào, dễ gồng nhất.",
    warmup: (c) => ({ task: "Bấm hợp âm " + tri(c.A.key) + " 8 lần theo móc đơn, nảy cổ tay.", bpm: 60, pass: "Không mỏi, đều" }),
    mistake: { title: "Gồng vai và cẳng tay", fix: "Hạ vai, thả cổ tay. Chơi nhỏ trước, to dần sau." },
    check: () => [{ q: "Bấm hợp âm nhắc lại bằng bộ phận nào?", a: "Cổ tay nảy nhẹ." }],
    tool: null
  },
  ornaments: {
    title: "Nốt hoa mỹ và tremolo",
    body: () => [
      "Nốt hoa mỹ (nốt nhỏ) chơi thật nhanh ngay trước nốt chính. Tremolo là rung nhanh xen kẽ hai nốt.",
      "Bản đơn giản: bỏ nốt hoa mỹ, thay tremolo bằng một hợp âm giữ dài. Ghi chú lựa chọn vào bản phổ."
    ],
    why: (c) => "Từ " + bar(c.A.firstOf.ornaments) + " có nốt rất ngắn (hoa mỹ hoặc tremolo). Với người mới, bản đơn giản nghe vẫn đẹp.",
    warmup: () => ({ task: "Chơi hai nốt cạnh nhau xen kẽ thật nhẹ, nhanh dần trong 4 phách.", bpm: 60, pass: "Đều và nhẹ" }),
    mistake: { title: "Nốt hoa mỹ làm trễ nốt chính", fix: "Nốt chính vẫn vào đúng phách. Nốt hoa mỹ lấy thời gian của nốt trước." },
    check: () => [{ q: "Bản đơn giản của tremolo là gì?", a: "Một hợp âm giữ dài." }],
    tool: null
  },
  pedal: {
    title: "Pedal vang (pedal trễ)",
    body: () => [
      "Pedal vang (pedal phải) làm các nốt tiếp tục ngân sau khi đã nhả phím.",
      "Pedal trễ: bấm hợp âm mới → ngay sau đó nhả pedal → nhấn lại. Nhả trước khi bấm thì hở tiếng; đổi cùng lúc thì đục tiếng.",
      "Đàn điện: cắm pedal vào cổng SUSTAIN trước khi bật đàn. Nhấn mà tiếng lại tắt nghĩa là pedal bị đảo cực."
    ],
    why: (c) => "File có ghi pedal" + (c.song?.pedalInferred ? " (suy ra từ các lệnh nhả pedal trong file)" : "") + ". Trong Đàn hướng dẫn, vạch pedal ở mép trái khung nốt cho biết lúc nhấn và lúc nhả.",
    warmup: (c) => ({ task: "Đổi qua lại hai hợp âm I – IV của giọng " + c.A.key.name + ", tập pedal trễ, 8 lần.", bpm: 50, pass: "Không hở, không đục" }),
    mistake: { title: "Đổi pedal cùng lúc với bấm phím", fix: "Tay xuống trước, chân lên rồi xuống sau. Nói thầm “bấm – nhả – nhấn”." },
    check: () => [{ q: "Thứ tự của pedal trễ là gì?", a: "Bấm phím → nhả pedal → nhấn lại." }],
    tool: null
  },
  chunking: {
    title: "Tập theo cụm",
    body: () => [
      "Chia đoạn thành từng cụm 2–4 ô. Tập mỗi cụm đúng 3 lần liền rồi mới ghép.",
      "Khi ghép, tập riêng chỗ nối: ô cuối cụm trước + ô đầu cụm sau. Bắt đầu buổi tập từ cụm yếu nhất, không phải từ ô 1."
    ],
    why: () => "Đây là cách tập dùng cho mọi đoạn sau. Cứ vấp là quay về ô 1 thì ô đầu rất thuộc còn các ô sau luôn yếu.",
    warmup: null,
    mistake: { title: "Cứ vấp là quay về ô 1", fix: "Bắt đầu từ cụm yếu nhất, và chỉ chơi lại cả đoạn khi mọi cụm đã đúng." },
    check: () => [{ q: "Bao nhiêu lần đúng liền thì xong một cụm?", a: "3 lần." }],
    tool: null
  },
  handsTogether: {
    title: "Ghép hai tay",
    body: () => [
      "Mỗi tay chơi riêng được rồi mới ghép. Tìm điểm hẹn: những chỗ hai tay bấm cùng lúc (thường là phách 1).",
      "Ghép ở tốc độ chậm hơn tốc độ một tay khoảng 20%. Dùng “Từng bước, hai tay” để thấy rõ điểm hẹn."
    ],
    why: () => "Khi ghép, não phải chia sự chú ý cho hai tay. Điểm hẹn là chỗ hai tay gặp nhau, giữa các điểm hẹn để tay đã thuộc tự chạy.",
    warmup: null,
    mistake: { title: "Một tay dừng chờ tay kia", fix: "Nhìn trước: chuẩn bị vị trí tay trái trong lúc tay phải chơi những nốt cuối của ô trước." },
    check: () => [{ q: "Ghép hai tay nên chậm hơn tốc độ một tay bao nhiêu?", a: "Khoảng 20%." }],
    tool: null
  },
  listening: {
    title: "Nghe chủ động trước khi học đoạn mới",
    body: () => ["Nghe đoạn sắp học 3 lần: (1) dò theo bản phổ để đếm ô, (2) chỉ nghe tay phải, (3) chỉ nghe tay trái. Dùng tốc độ 50% trong Đàn hướng dẫn."],
    why: () => "Tai biết trước đoạn nhạc nghe thế nào thì tay học nhanh hơn, và tự nhận ra khi chơi sai.",
    warmup: null, mistake: null, check: () => [], tool: null
  },
  checkpoint: {
    title: "Mốc kiểm tra bằng ghi âm",
    body: () => ["Ghi âm cả đoạn bằng điện thoại, nghe lại không nhìn tay: có đều không, có dừng không, nốt dài có đủ phách không.", "Đạt khi dừng không quá 1 lần. Chưa đạt thì lặp lại các buổi của đoạn này trước khi sang đoạn mới, và cân nhắc rút gọn."],
    why: () => "Đang chơi thì khó tự nghe mình. Bản ghi âm cho biết chính xác đang ở đâu so với kế hoạch.",
    warmup: null,
    mistake: { title: "Gặp chỗ khó là tự chậm lại", fix: "Chọn một tốc độ mà ô khó nhất cũng chơi được, rồi giữ nguyên cho cả đoạn." },
    check: () => [{ q: "Dừng bao nhiêu lần thì đạt mốc?", a: "Không quá 1 lần." }], tool: null
  },
  connect: {
    title: "Nối các đoạn và bước nhảy trong bản rút gọn",
    body: (c) => {
      const out = ["Tập riêng từng chỗ nối: 2 ô cuối đoạn trước + 2 ô đầu đoạn sau, lặp 3 lần."];
      if (c.plan?.jumps?.length) out.push("Bản rút gọn có bước nhảy: " + c.plan.jumps.map(j => "cuối ô " + j[0] + " → ô " + j[1]).join("; ") + ". Ghi bút chì lên bản phổ và photo trang đích đặt cạnh trang trước để khỏi lật.");
      return out;
    },
    why: () => "Người nghe không biết có đoạn bị bỏ nếu chỗ nối nghe như đã được viết sẵn.",
    warmup: null,
    mistake: { title: "Dừng lại để tìm trang", fix: "Photo trang đích, đặt ngay cạnh trang đang chơi." },
    check: () => [], tool: null
  },
  fullRun: {
    title: "Vấp thì chơi tiếp",
    body: () => ["Biểu diễn khác tập: sai thì không quay lại, giữ nhịp và vào lại ở phách 1 của ô kế tiếp.", "Hôm nay chơi cả bài ở tốc độ chậm, theo luật biểu diễn."],
    why: () => "Ngày biểu diễn không có “làm lại”. Kỹ năng chơi tiếp khi vấp cũng cần được tập.",
    warmup: null,
    mistake: { title: "Quay lại sửa ngay khi sai", fix: "Từ hôm nay, mỗi lần chơi cả bài đều đi tới cuối." },
    check: () => [{ q: "Sai khi biểu diễn thì làm gì?", a: "Giữ nhịp, vào lại ở phách 1 ô kế tiếp." }], tool: null
  },
  dynamics: {
    title: "Sắc thái to – nhỏ",
    body: () => ["Từ nhỏ tới to: pp – p – mp – mf – f – ff. Ký hiệu < là to dần, > là nhỏ dần.",
      "Nhiều file MIDI cho mọi nốt cùng lực: hãy lấy sắc thái từ bản phổ, hoặc tự chọn: mở đầu nhỏ, cao trào to, kết nhỏ dần.",
      "Đàn điện: kiểm tra chế độ Touch đang ở Normal, không phải Fixed."],
    why: () => "Đúng nốt mới là chơi được bài. Có to – nhỏ thì bài mới kể được câu chuyện.",
    warmup: (c) => ({ task: "Một hợp âm " + tri(c.A.key) + " chơi lần lượt pp → ff → pp.", bpm: 60, pass: "Nghe rõ 7 mức" }),
    mistake: { title: "Chơi nhỏ thì cũng chậm lại", fix: "Nhỏ là ít lực, không phải ít tốc độ. Giữ metronome khi tập đoạn nhỏ." },
    check: () => [{ q: "mf là gì?", a: "Hơi to (mezzo forte)." }], tool: null
  },
  tempoVideo: {
    title: "Tốc độ biểu diễn và quay video",
    body: () => ["Tốc độ biểu diễn = tốc độ chơi sạch 3 lần liên tiếp, trừ 5% cho hồi hộp.", "Quay video góc nghiêng thấy hai tay. Xem lại và ghi đúng 3 việc cần sửa."],
    why: () => "Video cho thấy những thứ không cảm nhận được lúc chơi: vai gồng, nhìn tay nhiều, chỗ chậm lại.",
    warmup: null,
    mistake: { title: "Ép tốc độ của bản ghi", fix: "Chậm mà chắc nghe hay hơn nhanh mà vấp." },
    check: () => [{ q: "Cách chọn tốc độ biểu diễn?", a: "Tốc độ chơi sạch 3 lần liên tiếp, trừ 5%." }], tool: null
  },
  performance: {
    title: "Tổng duyệt và thói quen trước khi chơi",
    body: () => ["Trước khi chơi: chỉnh ghế, thở chậm 2 hơi, đặt tay vào vị trí ô 1, đếm thầm 1 ô ở tốc độ đúng.", "Tập “lần đầu lạnh”: không chơi bài trước đó, chỉ khởi động ngón."],
    why: () => "Hồi hộp làm tay nhanh và cứng hơn. Thói quen cố định giúp cơ thể vào trạng thái quen thuộc.",
    warmup: null,
    mistake: { title: "Tập thật nhiều vào hôm trước biểu diễn", fix: "Hôm trước chỉ chơi nhẹ 1 lần ở tốc độ chậm." },
    check: () => [{ q: "Thói quen trước khi chơi gồm gì?", a: "Chỉnh ghế, thở 2 hơi, đặt tay, đếm thầm 1 ô." }], tool: null
  },
  review: {
    title: "Ôn và củng cố",
    body: () => ["Buổi củng cố: chơi lại các đoạn đã học, tăng metronome thêm 2–4 cho đoạn đã sạch, và tập riêng 2 ô hay vấp nhất."],
    why: () => "Lịch còn dư thời gian. Tăng độ chắc chắn bây giờ giúp ngày biểu diễn bớt hồi hộp.",
    warmup: null,
    mistake: { title: "Chỉ chơi lại phần đã hay", fix: "Dành phần lớn thời gian cho chỗ yếu nhất." },
    check: () => [], tool: null
  }
};

// Thứ tự dạy nền tảng (trước khi vào bài), lọc theo nhu cầu của bài và trình độ.
export const FOUNDATION = ["keyboard", "treble", "rhythm", "bass", "keysig", "intervals"];
// Kiến thức dạy đúng lúc: gắn vào buổi có ô nhịp xuất hiện lần đầu.
export const JIT = ["compound", "meterChange", "chunking", "handsTogether", "octave", "dotted", "accidentals", "voicing", "leaps", "running", "repChords", "ornaments"];
export const LEVELS = {
  beginner: { label: "Mới bắt đầu (chưa biết nhạc lý)", factor: 1.3, known: [] },
  reader: { label: "Đã biết đọc nốt cơ bản", factor: 1.0, known: ["keyboard", "treble", "rhythm", "bass"] },
  inter: { label: "Đã chơi được vài bài", factor: 0.7, known: ["keyboard", "treble", "rhythm", "bass", "keysig", "intervals", "chunking", "handsTogether", "dotted", "octave"] }
};
