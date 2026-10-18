/* 27 bài tập — Merry Christmas Mr. Lawrence (bản MIDI 96 ô của Nura: ô 1–16 nhịp 12/8, từ ô 17 nhịp 4/4).
   Không chứa nốt nhạc của bài: phần "Đàn hướng dẫn" đọc file .mid do Nura tự chọn. */
export const REDUCED = [[1, 40], [89, 96]];
const P = (min, label, task, bpm, pass) => ({ min, label, task, bpm, pass });

export const LESSONS = [
/* ───────── Tuần 19/10 ───────── */
{ n:1, date:"2026-10-19", week:"Tuần 19/10", phase:"Khóa Fa, tay trái", title:"Khóa Fa: đọc nốt cho tay trái",
  theory:{ title:"Khóa Fa và hai cái mốc",
    body:[
      "Khóa Fa (𝄢) có hai chấm kẹp dòng kẻ thứ 4 tính từ dưới lên. Dòng đó là nốt Fa ngay dưới Đô giữa (Fa3). Đây là mốc thứ nhất.",
      "Năm dòng kẻ khóa Fa, từ dưới lên: Sol – Si – Rê – Fa – La. Bốn khe: La – Đô – Mi – Sol.",
      "Mốc thứ hai: Đô giữa nằm trên dòng kẻ phụ ngay phía trên khuông khóa Fa. Đây cũng chính là Đô giữa của khóa Sol, nốt nối hai khuông với nhau."
    ],
    why:"Trong file của Nura, từ ô 17 trở đi tay trái xuống âm vực trầm và được ghi bằng khóa Fa. Chú ý: ở đoạn mở đầu (ô 1–16), tay trái chơi khá cao, nên bản phổ có thể ghi tay trái bằng khóa Sol. Luôn nhìn khóa ở đầu khuông trước khi đọc." },
  plan:[
    P(5,"Khởi động","Tay trái thế 5 ngón: ngón 5 trên Đô3 … ngón 1 trên Sol3. Đi lên rồi đi xuống, mỗi nốt 1 phách.",60,"2 lượt đều, cổ tay thả lỏng"),
    P(10,"Đọc nốt","Mở công cụ “Đọc nốt khóa Fa” bên dưới, làm 10 câu. Gọi tên thành tiếng rồi bấm phím.",null,"Đúng ≥ 8/10, mỗi nốt ≤ 3 giây"),
    P(12,"Bản phổ","Tìm khóa Fa đầu tiên của tay trái trong bản phổ (khoảng ô 17). Gọi tên từng nốt tay trái ô 17–20 từ dưới lên, tìm trên đàn. Dùng “Đàn hướng dẫn → Từng bước, tay trái” để kiểm tra.",null,"Đặt đúng mọi nốt tay trái ô 17–20"),
    P(3,"Ôn lại","Nói to: dòng kẻ Sol Si Rê Fa La, khe La Đô Mi Sol. Ghi 1 dòng: nốt nào hay nhầm.",null,"Nói đúng không cần nhìn")
  ],
  mistake:{ title:"Đọc khóa Fa theo thói quen của khóa Sol", fix:"Dòng dưới cùng khóa Sol là Mi, còn khóa Fa là Sol. Đọc theo thói quen sẽ lệch 2 bậc. Luôn bắt đầu từ một mốc: dòng Fa giữa hai chấm, hoặc Đô giữa." },
  check:[
    {q:"Dòng kẻ dưới cùng của khóa Fa là nốt gì?", a:"Sol (Sol2)."},
    {q:"Hai chấm của khóa Fa kẹp dòng kẻ nào?", a:"Dòng thứ 4 từ dưới lên, nốt Fa3."},
    {q:"Đô giữa nằm ở đâu so với khuông khóa Fa?", a:"Trên dòng kẻ phụ thứ nhất ngay phía trên khuông."}
  ],
  tools:[ {type:"clef", clef:"bass", label:"Đọc nốt khóa Fa"}, {type:"song", segs:[[17,20]], hand:"L", label:"Tay trái ô 17–20", mode:"step"} ] },

{ n:2, date:"2026-10-21", week:"Tuần 19/10", phase:"Dấu giáng, hóa biểu", title:"Phím đen, dấu giáng và giọng Rê♭ trưởng",
  theory:{ title:"Hóa biểu 5 giáng",
    body:[
      "Dấu giáng (♭) hạ nốt xuống nửa cung, tức là phím sát bên trái. Phần lớn trường hợp đó là một phím đen. Dấu thăng (♯) nâng lên nửa cung, tức là phím sát bên phải. Dấu bình (♮) hủy thăng hoặc giáng, có hiệu lực tới hết ô nhịp.",
      "Hóa biểu là các dấu giáng đặt ở đầu mỗi dòng nhạc. Hóa biểu áp dụng cho mọi nốt cùng tên, ở mọi quãng 8, suốt cả bài.",
      "Bài này có 5 giáng, xếp theo thứ tự Si – Mi – La – Rê – Sol. Mẹo đọc giọng: dấu giáng áp chót chính là tên giọng, ở đây là Rê♭. Vậy bài ở giọng Rê♭ trưởng. Gam Rê♭ trưởng dùng cả 5 phím đen cộng với Fa và Đô."
    ],
    why:"Với 5 giáng, gần như mọi nốt Si, Mi, La, Rê, Sol trên bản phổ đều là phím đen. Quên hóa biểu là lỗi sai nốt phổ biến nhất ở bài này. Một vài chỗ có dấu bình (trong file: ô 39–40, 85 và các ô 90, 92, 94 ở coda), những chỗ đó tạm trở về phím trắng." },
  plan:[
    P(5,"Khởi động","Tay phải chạm lần lượt các phím đen trong một quãng 8: nhóm 2 phím (ngón 2-3), rồi nhóm 3 phím (ngón 2-3-4).",60,"Lượt 2 không nhìn tay"),
    P(10,"Gam Rê♭","Bấm “Nghe gam Rê♭ trưởng” trong công cụ, rồi làm 10 câu “Tìm nốt trong gam”.",null,"Đúng ≥ 9/10, trung bình ≤ 3 giây"),
    P(12,"Bản phổ","Khoanh hóa biểu ở dòng đầu. Đánh dấu bút chì mọi nốt bị hóa biểu ảnh hưởng trong ô 1–4. Kiểm tra bằng “Từng bước, tay phải” ô 1–2.",null,"Chơi đúng phím đen/trắng mọi nốt ô 1–2"),
    P(3,"Ôn lại","Đọc to “Si Mi La Rê Sol đều giáng”. Ghi ra giấy 7 nốt của gam Rê♭.",null,"Viết đúng 7 nốt")
  ],
  mistake:{ title:"Chỉ để ý dấu giáng ngay cạnh nốt, quên hóa biểu đầu dòng", fix:"Trước khi tập ô mới, đọc to 5 nốt giáng. Viết chữ ♭ nhỏ bằng bút chì ở vài ô đầu cho đến khi tay tự quen với phím đen." },
  check:[
    {q:"Hóa biểu 5 giáng gồm những nốt nào, theo thứ tự?", a:"Si, Mi, La, Rê, Sol."},
    {q:"Giọng của bài là gì? Vì sao?", a:"Rê♭ trưởng: dấu giáng áp chót là Rê♭."},
    {q:"Dấu bình có hiệu lực tới đâu?", a:"Tới hết ô nhịp đó."}
  ],
  tools:[ {type:"scale", label:"Gam Rê♭ trưởng"}, {type:"song", segs:[[1,2]], hand:"R", label:"Tay phải ô 1–2", mode:"step"} ] },

{ n:3, date:"2026-10-23", week:"Tuần 19/10", phase:"Ôn và tự kiểm tra", title:"Ôn tuần: đọc nốt = vị trí + hóa biểu",
  theory:{ title:"Đọc một nốt theo hai bước",
    body:[
      "Bước 1: tìm tên nốt theo vị trí, dựa vào mốc của khóa (Sol của khóa Sol, Fa của khóa Fa, hoặc Đô giữa).",
      "Bước 2: áp hóa biểu và dấu bất thường. Nếu nốt đó là Si, Mi, La, Rê hoặc Sol thì chuyển sang phím giáng.",
      "Hôm nay công cụ đọc nốt có vẽ hóa biểu 5 giáng như trong bản phổ thật, nên Nura phải làm đủ cả hai bước."
    ],
    why:"Bài đổi âm vực và đổi khóa giữa các đoạn. Mở đầu chơi cao, chủ đề xuống trầm. Đọc theo hai bước giúp đọc đúng ở mọi đoạn, kể cả khi khóa thay đổi." },
  plan:[
    P(5,"Khởi động","Gam Rê♭ trưởng tay phải 1 quãng 8, ngón 2 3 1 2 3 4 1 2, mỗi nốt 1 phách.",50,"Không dừng, đúng ngón"),
    P(10,"Tự kiểm tra","Công cụ đọc nốt, chế độ “Cả hai khóa + hóa biểu”: làm 2 lượt 10 câu.",null,"Đúng ≥ 16/20"),
    P(12,"Bản phổ","Đọc tên nốt tay trái ô 17–24 (chưa đàn). Sau đó bấm lại bằng “Từng bước, tay trái”.",null,"Mọi nốt đúng, kể cả phím giáng"),
    P(3,"Ghi chú","Ghi lại những nốt hay sai để buổi sau ôn tiếp.",null,"Có danh sách")
  ],
  mistake:{ title:"Đếm từ Đô lên mỗi lần gặp một nốt", fix:"Cách này quá chậm khi có metronome. Dùng 3 mốc: Đô giữa, Fa của khóa Fa, Sol của khóa Sol. Nốt nào gần mốc nào thì đếm từ mốc đó, tối đa 2 bậc." },
  check:[
    {q:"Trong giọng Rê♭, nốt nằm ở dòng giữa khuông khóa Sol được bấm phím nào?", a:"Si♭ (dòng giữa là Si, có hóa biểu nên giáng)."},
    {q:"Thế 5 ngón tay trái ở bài 1 đặt ngón 1 lên nốt nào?", a:"Sol3."},
    {q:"Trước khi đọc một khuông nhạc, việc đầu tiên cần nhìn là gì?", a:"Khóa ở đầu khuông (khóa Sol hay khóa Fa) và hóa biểu."}
  ],
  tools:[ {type:"clef", clef:"mixed", keysig:true, label:"Cả hai khóa + hóa biểu"}, {type:"song", segs:[[17,24]], hand:"L", label:"Tay trái ô 17–24", mode:"step"} ] },

/* ───────── Tuần 26/10 ───────── */
{ n:4, date:"2026-10-26", week:"Tuần 26/10", phase:"Quãng và hợp âm", title:"Quãng, hợp âm 3 nốt và tay trái mở đầu",
  theory:{ title:"Quãng và hợp âm ba",
    body:[
      "Quãng là khoảng cách giữa hai nốt, đếm cả hai đầu theo tên nốt. Ví dụ Đô → Mi là quãng 3.",
      "Nửa cung là hai phím sát nhau, tính cả phím đen. Quãng 3 trưởng = 4 nửa cung (nghe sáng). Quãng 3 thứ = 3 nửa cung (nghe buồn). Quãng 5 đúng = 7 nửa cung.",
      "Hợp âm 3 nốt = nốt gốc + quãng 3 + quãng 5, xếp “cách một nốt” (Đô–Mi–Sol). Quãng 3 dưới cùng là trưởng thì hợp âm trưởng; là thứ thì hợp âm thứ."
    ],
    why:"Ở đoạn mở đầu (ô 1–16), tay trái bấm một hợp âm 3–4 nốt ở đầu mỗi ô rồi giữ hết ô. Riêng ô 4 và ô 12 có hai hợp âm, mỗi hợp âm nửa ô. Nhận ra hình hợp âm giúp đặt cả bàn tay một lần thay vì tìm từng nốt. Cảm giác vừa sáng vừa buồn của bài đến từ việc xen kẽ hợp âm trưởng và thứ." },
  plan:[
    P(5,"Khởi động","Đặt rồi nhấc hợp âm Rê♭ trưởng (Rê♭–Fa–La♭) tay trái, ngón 5-3-1, làm 8 lần.",60,"3 nốt kêu cùng lúc"),
    P(10,"Hợp âm & quãng","Trong công cụ, nghe 7 hợp âm của giọng Rê♭. Bật “Đo quãng” và đo 5 cặp nốt bất kỳ.",null,"Nói đúng trưởng/thứ của I, ii, IV, V, vi"),
    P(12,"Bài","Tay trái ô 1–4: đặt hợp âm, giữ hết ô (đếm chậm 4 phách lớn). Tập “Từng bước” trước, rồi “Nghe & xem” ở 50%. Nhìn khóa đầu khuông tay trái (đoạn này có thể ghi bằng khóa Sol).","♩. = 30","Đổi hợp âm đúng đầu ô, không dừng"),
    P(3,"Ôn lại","Viết tên 3 hợp âm tay trái đầu tiên mà Nura nhận ra trong bản phổ.",null,"Có 3 tên hợp âm")
  ],
  mistake:{ title:"Bấm hợp âm mà các ngón lệch nhau", fix:"Đặt cả bàn tay chạm nhẹ lên các phím trước, rồi ấn một lần từ cổ tay. Đừng ấn từng ngón một." },
  check:[
    {q:"Quãng 3 thứ có bao nhiêu nửa cung?", a:"3 nửa cung."},
    {q:"Hợp âm Rê♭ trưởng gồm những nốt nào?", a:"Rê♭ – Fa – La♭."},
    {q:"Trong ô 1–16, ô nào tay trái có hai hợp âm?", a:"Ô 4 và ô 12."}
  ],
  tools:[ {type:"chords", label:"Hợp âm & quãng"}, {type:"song", segs:[[1,4]], hand:"L", label:"Tay trái ô 1–4", mode:"step"} ] },

{ n:5, date:"2026-10-28", week:"Tuần 26/10", phase:"Quãng 8", title:"Quãng 8 và tay trái ô 5–8",
  theory:{ title:"Quãng 8",
    body:[
      "Quãng 8 là hai nốt cùng tên, cách nhau 12 nửa cung. Đếm phím trắng tính cả hai đầu thì được 8 phím.",
      "Bản phổ có thể dùng ký hiệu 8va (chơi cao hơn 1 quãng 8) hoặc 8vb (thấp hơn 1 quãng 8) để khỏi viết quá nhiều dòng kẻ phụ. Đoạn mở đầu chơi rất cao nên dễ gặp 8va. Gặp ký hiệu này thì đóng khung bằng bút chì."
    ],
    why:"Bài dùng quãng 8 ở khắp nơi: bass của chủ đề, tay trái giữ quãng 8 suốt đoạn kết, tay phải có quãng 8 từ ô 25 trở đi. Bàn tay người mới thường chỉ vừa đủ quãng 8, nên cần tập mở tay mà không gồng." },
  plan:[
    P(5,"Khởi động","Tay trái chơi quãng 8 trên Rê♭ rồi Sol♭ (ngón 5-1), nhấc rồi đặt 8 lần.",60,"Không chạm phím bên cạnh"),
    P(10,"Đo quãng","Bật “Đo quãng” trong công cụ, tìm 5 cặp quãng 8. Xem bản phổ ô 1–8 có ký hiệu 8va/8vb không.",null,"5/5 cặp đúng"),
    P(12,"Bài","Tay trái ô 5–8, sau đó nối với ô 1–4 thành ô 1–8.","♩. = 30","Ô 1–8 liền mạch 2 lần"),
    P(3,"Ôn lại","So sánh ô 1–4 và 5–8 của tay trái: ô nào giống nhau?",null,"Tìm được các ô lặp lại")
  ],
  mistake:{ title:"Gồng cứng bàn tay khi mở quãng 8", fix:"Chỉ mở ngón 1 và ngón 5, các ngón giữa giữ cong và thả lỏng. Nhả hẳn tay sau mỗi lần bấm." },
  check:[
    {q:"Quãng 8 có bao nhiêu nửa cung?", a:"12."},
    {q:"Ký hiệu 8va nghĩa là gì?", a:"Chơi cao hơn một quãng 8 so với nốt viết."},
    {q:"Tay trái ô 5–7 giống những ô nào?", a:"Giống ô 1–3 (cùng hợp âm)."}
  ],
  tools:[ {type:"chords", label:"Đo quãng", interval:true}, {type:"song", segs:[[5,8]], hand:"L", label:"Tay trái ô 5–8", mode:"play"}, {type:"song", segs:[[1,8]], hand:"L", label:"Tay trái ô 1–8", mode:"play"} ] },

{ n:6, date:"2026-10-30", week:"Tuần 26/10", phase:"Nhịp 12/8, hai tay", title:"Nhịp 12/8 và mẫu móc đơn tay phải",
  theory:{ title:"Nhịp 12/8: bốn nhóm ba",
    body:[
      "Đoạn mở đầu (ô 1–16) viết ở nhịp 12/8: mỗi ô có 12 nốt móc đơn, chia thành 4 nhóm, mỗi nhóm 3 nốt. Mỗi nhóm là một phách lớn, bằng một nốt đen chấm (♩.).",
      "Đếm: “1-2-3, 2-2-3, 3-2-3, 4-2-3”. Số đầu mỗi nhóm hơi nhấn. Tay trái bấm hợp âm ở phách 1 rồi giữ hết ô.",
      "Metronome trên đàn: đặt 4 phách. Mỗi tiếng tích là một nhóm 3 nốt. Trong file gốc là ♩. = 68; Nura bắt đầu ở ♩. = 30.",
      "Số ngón: ghi số ngón cho tay phải ô 1–2 và giữ đúng số đó mỗi lần chơi."
    ],
    why:"Dòng móc đơn chia nhóm 3 như tiếng chuông đung đưa là dấu ấn của bài. Đếm theo nhóm 2 như nhịp 4/4 sẽ làm mất cảm giác đó. Từ ô 17 bài đổi sang 4/4, nên cần nắm 12/8 ngay từ đầu." },
  plan:[
    P(5,"Khởi động","Không dùng đàn: đếm to “1-2-3, 2-2-3, 3-2-3, 4-2-3”, tay phải gõ mọi số, tay trái chỉ gõ số 1.","♩. = 30","2 ô liền không lệch"),
    P(10,"Số ngón","Ghi số ngón tay phải ô 1–2 vào bản phổ. Xem “Từng bước, tay phải” để thấy từng nốt và vị trí trong nhóm.",null,"Mọi nốt ô 1–2 đều có số ngón"),
    P(12,"Bài","Tay phải ô 1–2 ở ♩. = 30, rồi tăng lên 36. Thử chơi theo “Nghe & xem” với tiếng tay trái phát kèm.","♩. = 30–36","Ô 1–2 đều 3 lần liền"),
    P(3,"Bản phổ","Kiểm tra bản phổ đã khớp file chưa: 5 giáng, mở đầu 12/8, ô 17 đổi sang 4/4, tổng 96 ô. Cần có trước ngày 2/11.",null,"Bản phổ khớp")
  ],
  mistake:{ title:"Đếm 12/8 thành nhóm 2 (như 4/4)", fix:"Nhấn nhẹ nốt đầu mỗi nhóm 3 và đếm to “1-2-3”. Nếu tiếng tích rơi vào nốt thứ 2 hoặc 3 của nhóm là đã lệch." },
  check:[
    {q:"Mỗi ô 12/8 có bao nhiêu nốt móc đơn?", a:"12, chia 4 nhóm 3."},
    {q:"Một phách lớn trong 12/8 là nốt gì?", a:"Nốt đen chấm (♩.) = 3 móc đơn."},
    {q:"Từ ô nào bài đổi sang 4/4?", a:"Ô 17."}
  ],
  tools:[ {type:"song", segs:[[1,2]], hand:"R", label:"Tay phải ô 1–2", mode:"step"}, {type:"song", segs:[[1,2]], hand:"R", other:true, label:"Tay phải + nghe tay trái", mode:"play"} ] },

/* ───────── Tuần 2/11 ───────── */
{ n:7, date:"2026-11-02", week:"Tuần 2/11", phase:"Mở đầu, tay riêng", title:"Mở đầu (A): tay phải ô 1–4",
  theory:{ title:"Tập theo cụm",
    body:[
      "Chia đoạn thành từng cụm 2 ô. Tập mỗi cụm đúng 3 lần liền rồi mới ghép.",
      "Khi ghép, tập riêng chỗ nối: ô cuối của cụm trước cùng với ô đầu của cụm sau (ví dụ ô 2–3)."
    ],
    why:"Ô 1–4 gồm các mẫu lặp gần giống nhau. Chỗ khác nhau nhỏ giữa các ô chính là chỗ người mới hay sai. Tập theo cụm buộc mình để ý những khác biệt đó." },
  plan:[
    P(5,"Khởi động","Gam Rê♭ trưởng tay phải, ngón 2 3 1 2 3 4 1 2, mỗi nốt 1 phách.",60,"2 lượt đúng ngón"),
    P(10,"So sánh ô","Nghe ô 1–4 ở 50%. So sánh từng ô với ô 1: khoanh bút chì những nốt khác nhau.",null,"Tìm được chỗ khác của mỗi ô"),
    P(12,"Bài","Tay phải theo cụm ô 1–2, 3–4, rồi nối 1–4.","♩. = 36","4 ô không vấp, đúng số ngón"),
    P(3,"Ôn lại","Chơi lại cụm yếu nhất 2 lần.",null,"Cụm yếu nhất đúng 2 lần")
  ],
  mistake:{ title:"Cứ vấp là quay về ô 1", fix:"Làm vậy ô 1 sẽ rất thuộc còn các ô sau luôn yếu. Hãy bắt đầu buổi tập từ cụm yếu nhất." },
  check:[
    {q:"Ghép hai cụm thì tập riêng chỗ nào?", a:"Ô cuối cụm trước + ô đầu cụm sau."},
    {q:"Bao nhiêu lần đúng liền thì coi là xong một cụm?", a:"3 lần."}
  ],
  tools:[ {type:"song", segs:[[1,4]], hand:"R", label:"Tay phải ô 1–4", mode:"play"} ] },

{ n:8, date:"2026-11-04", week:"Tuần 2/11", phase:"Mở đầu, tay riêng", title:"Mở đầu (A): tay phải ô 5–8, nối 1–8",
  theory:{ title:"Dịch thế tay",
    body:[
      "Ô 5–6 nhắc lại ô 1–2. Ở ô 7–8, tay phải mở rộng lên cao hơn. Bàn tay phải dịch sang một vị trí mới.",
      "Dịch thế tay là di chuyển cả bàn tay, không với ngón. Mắt nhìn trước tới vị trí mới ngay khi đang chơi nốt cuối ở vị trí cũ."
    ],
    why:"Nếu với ngón thay vì dịch cả bàn tay, móc đơn sẽ bị khựng ngay chỗ đổi. Mẫu chuông sẽ mất đều." },
  plan:[
    P(5,"Khởi động","Tay phải chơi Rê♭–Mi♭–Fa ba lần, rồi dịch cả bàn tay lên 1 quãng 8 và chơi lại.",60,"Dịch không dừng nhịp"),
    P(10,"Đọc","Đọc ô 5–8 tay phải. Đánh dấu ô bắt đầu dịch thế tay (ô 7).",null,"Biết chỗ dịch tay"),
    P(12,"Bài","Ô 5–6, ô 7–8, rồi nối cả ô 1–8.","♩. = 36","8 ô tay phải liền mạch"),
    P(3,"Ôn lại","Chơi lại chỗ nối ô 6–7 ba lần.",null,"3/3 đúng")
  ],
  mistake:{ title:"Nhìn xuống tay ở mỗi lần dịch nên mất nhịp", fix:"Nhìn trước vị trí mới trong lúc đang chơi nốt cuối ở vị trí cũ." },
  check:[
    {q:"Dịch thế tay khác với ngón như thế nào?", a:"Di chuyển cả bàn tay, giữ nguyên hình bàn tay."},
    {q:"Tay phải mở rộng lên cao ở ô nào?", a:"Ô 7–8."}
  ],
  tools:[ {type:"song", segs:[[5,8]], hand:"R", label:"Tay phải ô 5–8", mode:"play"}, {type:"song", segs:[[1,8]], hand:"R", label:"Tay phải ô 1–8", mode:"play"} ] },

{ n:9, date:"2026-11-06", week:"Tuần 2/11", phase:"Mở đầu, tay riêng", title:"Mở đầu thêm bè (A'): ô 9–16 từng tay",
  theory:{ title:"Hai giọng trong một tay",
    body:[
      "Ở ô 9–14, tại một số chỗ tay phải bấm 2 nốt cùng lúc. Nốt cao thường là giai điệu, nên ấn hơi mạnh hơn. Nốt thấp nhẹ hơn.",
      "Nếu còn khó, dùng bản đơn giản: chỉ chơi mẫu móc đơn, bỏ nốt thêm. Ghi chú điều này bằng bút chì vào bản phổ.",
      "Ô 16 kết thúc bằng một nốt đen chấm ngân dài. Đó là hơi thở trước khi sang chủ đề."
    ],
    why:"Nghe file ô 9–16 sẽ thấy giai điệu nổi lên phía trên mẫu lặp. Đó là lúc chủ đề của bài bắt đầu lộ ra." },
  plan:[
    P(5,"Khởi động","Tay phải chơi quãng 3 hai nốt cùng lúc, ngón 3 ấn mạnh hơn ngón 1, làm 8 lần.",60,"Nghe rõ nốt trên"),
    P(10,"Nghe","Nghe ô 9–16 ở 50%, chú ý những nốt thêm của tay phải.",null,"Chỉ ra được ô có nốt thêm"),
    P(12,"Bài","Tay phải ô 9–12, rồi 13–16. Tay trái ô 9–16 (hợp âm 4 nốt; có thể bỏ nốt giữa).","♩. = 34","Mỗi tay chơi ô 9–16 không dừng"),
    P(3,"Ôn lại","Chọn chơi bản có bè hoặc bản đơn giản, và ghi lại lựa chọn.",null,"Đã chọn")
  ],
  mistake:{ title:"Hai nốt đánh to như nhau nên giai điệu bị chìm", fix:"Tập riêng mẫu móc đơn trước. Sau đó thêm nốt bè thật nhẹ." },
  check:[
    {q:"Ô nào tay phải có nốt thêm (hai nốt cùng lúc)?", a:"Ô 9–14."},
    {q:"Ô 16 kết thúc bằng nốt gì?", a:"Một nốt đen chấm ngân dài."}
  ],
  tools:[ {type:"song", segs:[[9,16]], hand:"R", label:"Tay phải ô 9–16", mode:"play"}, {type:"song", segs:[[9,16]], hand:"L", label:"Tay trái ô 9–16", mode:"step"} ] },

/* ───────── Tuần 9/11 ───────── */
{ n:10, date:"2026-11-09", week:"Tuần 9/11", phase:"Ghép hai tay", title:"Ghép hai tay ô 1–4",
  theory:{ title:"Cách ghép hai tay",
    body:[
      "1. Mỗi tay phải chơi riêng được rồi mới ghép.",
      "2. Tìm điểm hẹn: những chỗ hai tay bấm cùng lúc. Ở đây là phách 1 của mỗi ô, khi tay trái đặt hợp âm. Riêng ô 4 có thêm điểm hẹn ở phách 3.",
      "3. Ghép ở tốc độ chậm hơn tốc độ một tay khoảng 20%."
    ],
    why:"Khi ghép, não phải chia sự chú ý cho hai tay. Điểm hẹn là chỗ để hai tay gặp nhau. Giữa các điểm hẹn, tay phải tự chạy theo mẫu đã thuộc." },
  plan:[
    P(5,"Khởi động","Gõ hai tay lên đùi (trái phách 1, phải 12 móc đơn), 4 ô.","♩. = 30","4 ô liền"),
    P(10,"Từng bước","“Từng bước, hai tay” ô 1–2: xem chỗ hai tay bấm cùng lúc.",null,"Biết các điểm hẹn"),
    P(12,"Bài","Ghép theo cụm ô 1–2, rồi 3–4, rồi nối 1–4.","♩. = 28","3 lần liền, hợp âm đúng phách 1"),
    P(3,"Ôn lại","Ghi lại chỗ hai tay hay lệch nhau.",null,"Có ghi chú")
  ],
  mistake:{ title:"Tay phải dừng chờ tay trái tìm hợp âm", fix:"Chuẩn bị hợp âm tay trái trong lúc tay phải chơi nhóm 3 nốt cuối của ô trước (nhìn trước)." },
  check:[
    {q:"Điểm hẹn của hai tay trong ô 1–4 là ở đâu?", a:"Phách 1 mỗi ô, thêm phách 3 ở ô 4."},
    {q:"Ghép hai tay nên chậm hơn tốc độ một tay khoảng bao nhiêu?", a:"Khoảng 20%."}
  ],
  tools:[ {type:"song", segs:[[1,4]], hand:"B", label:"Hai tay ô 1–4", mode:"step"}, {type:"song", segs:[[1,4]], hand:"B", label:"Hai tay ô 1–4 (nghe & xem)", mode:"play"} ] },

{ n:11, date:"2026-11-11", week:"Tuần 9/11", phase:"Ghép hai tay", title:"Ghép ô 5–8 và nghe trước chủ đề",
  theory:{ title:"Nghe chủ động",
    body:[
      "Trước khi học một đoạn mới, nghe đoạn đó 3 lần, mỗi lần một mục tiêu: (1) dò theo bản phổ để đếm ô, (2) chỉ nghe tay phải, (3) chỉ nghe tay trái.",
      "Trong “Đàn hướng dẫn”, chọn công cụ ô 17–32, chỉnh 50%, rồi đổi tay để nghe riêng từng tay."
    ],
    why:"Tai biết trước đoạn nhạc nghe thế nào thì tay học nhanh hơn. Khi chơi sai, Nura cũng tự nhận ra được." },
  plan:[
    P(5,"Khởi động","Chơi lại hai tay ô 1–4 một lần.","♩. = 28","Không dừng"),
    P(10,"Bài","Ghép hai tay ô 5–6, rồi 7–8.","♩. = 28","Mỗi cụm 3 lần đúng"),
    P(12,"Nối","Nối ô 1–8 hai tay. Sau đó nghe ô 17–32 ba lần theo 3 mục tiêu.","♩. = 30","Ô 1–8 hai tay liền mạch"),
    P(3,"Ôn lại","Ghi 1 câu: chủ đề nghe khác mở đầu ở chỗ nào?",null,"Có ghi chú")
  ],
  mistake:{ title:"Thấy quen là tự tăng tốc", fix:"Chỉ tăng metronome thêm 2–4 sau khi đã chơi đúng 3 lần liên tiếp." },
  check:[
    {q:"3 mục tiêu của 3 lần nghe là gì?", a:"Đếm ô theo bản phổ, nghe tay phải, nghe tay trái."},
    {q:"Khi nào được tăng metronome?", a:"Sau 3 lần đúng liên tiếp."}
  ],
  tools:[ {type:"song", segs:[[5,8]], hand:"B", label:"Hai tay ô 5–8", mode:"play"}, {type:"song", segs:[[17,32]], hand:"B", label:"Nghe ô 17–32", mode:"play"} ] },

{ n:12, date:"2026-11-13", week:"Tuần 9/11", phase:"Mốc kiểm tra 1", title:"Ghép ô 9–16 · Mốc kiểm tra 1: ô 1–16",
  theory:{ title:"Tự kiểm tra bằng ghi âm",
    body:[
      "Ghi âm ô 1–16 bằng điện thoại. Nghe lại mà không nhìn tay, tự hỏi: các nhóm 3 có đều không? Hợp âm tay trái có vang hết ô không? Dừng mấy lần?",
      "Đây là mốc kiểm tra 1. Nếu dừng quá 1 lần, tuần sau lặp lại bài 10–12 và cân nhắc rút gọn (xem lộ trình): tăng lên 45 phút mỗi buổi, hoặc bỏ đoạn C."
    ],
    why:"Đang chơi thì khó tự nghe mình. Bản ghi âm cho biết chính xác đang ở đâu so với kế hoạch." },
  plan:[
    P(5,"Khởi động","Tay phải ô 9–10, hai lần.","♩. = 34","Không dừng"),
    P(10,"Bài","Ghép hai tay ô 9–12, rồi 13–16.","♩. = 28","Mỗi cụm 3 lần đúng"),
    P(12,"Kiểm tra","Chơi và ghi âm ô 1–16 hai tay. Nghe lại.","♩. = 32","Ô 1–16 dừng không quá 1 lần"),
    P(3,"Báo lại","Nhắn kết quả: số lần dừng, chỗ dừng, tốc độ.",null,"Đã gửi")
  ],
  mistake:{ title:"Gặp chỗ khó là chậm lại", fix:"Tốc độ thường tự chậm đi ở ô khó. Hãy chọn một tốc độ mà ô khó nhất cũng chơi được, rồi giữ nguyên tốc độ đó cho cả đoạn." },
  check:[
    {q:"Dừng bao nhiêu lần thì coi là đạt mốc 1?", a:"Không quá 1 lần cho ô 1–16."},
    {q:"Nếu chưa đạt thì làm gì?", a:"Lặp lại bài 10–12, cân nhắc tăng thời lượng hoặc rút gọn."}
  ],
  tools:[ {type:"song", segs:[[9,16]], hand:"B", label:"Hai tay ô 9–16", mode:"play"}, {type:"song", segs:[[1,16]], hand:"B", label:"Kiểm tra ô 1–16", mode:"play"} ] },

/* ───────── Tuần 16/11 ───────── */
{ n:13, date:"2026-11-16", week:"Tuần 16/11", phase:"Chủ đề chính", title:"Chủ đề chính (B): ô 17–20 từng tay",
  theory:{ title:"Đổi sang 4/4 và giữ đủ trường độ",
    body:[
      "Từ ô 17, nhịp đổi từ 12/8 sang 4/4: mỗi ô 4 phách, mỗi phách là một nốt đen (♩). Đếm “1 và 2 và 3 và 4 và”, chia đôi thay vì chia ba. Tốc độ trong file là ♩ = 88.",
      "Tay phải xuống âm vực giữa, quanh Đô giữa, có thể có dòng kẻ phụ. Tay trái xuống khóa Fa (đã quen từ bài 1).",
      "Chủ đề có nhiều nốt trắng và nốt tròn: bấm một lần rồi giữ đủ số phách, trong khi tay kia vẫn chơi tiếp."
    ],
    why:"Giai điệu chủ đề sống nhờ những nốt ngân. Nhả nốt sớm thì giai điệu nghe hụt hơi." },
  plan:[
    P(5,"Khởi động","Tay phải giữ một nốt 4 phách trong khi tay trái gõ đùi 4 phách, đếm to “1 và 2 và…”.",60,"Giữ đủ 4 phách"),
    P(10,"Đọc","Đọc tay phải ô 17–20 (để ý dòng kẻ phụ) và tay trái ô 17–20.",null,"Gọi đúng tên mọi nốt"),
    P(12,"Bài","Tay phải ô 17–20, rồi tay trái ô 17–20.",50,"Mỗi tay 4 ô đúng nốt, đủ trường độ"),
    P(3,"Ôn lại","Hát nhẩm giai điệu ô 17–20.",null,"Hát được")
  ],
  mistake:{ title:"Nhả nốt dài quá sớm", fix:"Đếm to và chỉ nhấc ngón đúng lúc bắt đầu nốt tiếp theo." },
  check:[
    {q:"Ô 17 đổi nhịp từ gì sang gì?", a:"Từ 12/8 sang 4/4."},
    {q:"Nốt trắng giữ mấy phách trong 4/4?", a:"2 phách."}
  ],
  tools:[ {type:"song", segs:[[17,20]], hand:"R", label:"Tay phải ô 17–20", mode:"step"}, {type:"song", segs:[[17,20]], hand:"L", label:"Tay trái ô 17–20", mode:"play"} ] },

{ n:14, date:"2026-11-18", week:"Tuần 16/11", phase:"Chủ đề chính", title:"Chủ đề (B): ô 21–24 và ghép 17–20",
  theory:{ title:"Dấu chấm dôi và dấu nối",
    body:[
      "Dấu chấm dôi đặt sau nốt cộng thêm một nửa trường độ: nốt đen chấm = 1,5 phách, nốt trắng chấm = 3 phách.",
      "Dấu nối là đường cong nối hai nốt cùng cao độ. Chỉ bấm nốt đầu, rồi giữ qua cả hai trường độ. Dấu nối khác dấu luyến: dấu luyến nối các nốt khác cao độ, nghĩa là chơi liền tiếng."
    ],
    why:"Chủ đề có nhiều nốt kéo dài qua vạch nhịp hoặc lệch phách. Đếm sai những chỗ này thì giai điệu nghe như bị xô." },
  plan:[
    P(5,"Khởi động","Vỗ tay theo nhịp: đen chấm + móc đơn, lặp 4 ô, đếm “1 – – và 2”.",60,"4 ô đều"),
    P(10,"Bài","Tay phải ô 21–24, rồi tay trái ô 21–24. Tìm dấu chấm và dấu nối, khoanh lại.",50,"Đếm đúng mọi nốt có chấm hoặc nối"),
    P(12,"Ghép","Ghép hai tay ô 17–20.",50,"3 lần liền"),
    P(3,"Ôn lại","Ghi lại chỗ nào phải đếm kỹ.",null,"Có ghi chú")
  ],
  mistake:{ title:"Bấm lại nốt ở dấu nối", fix:"Đường cong giữa hai nốt cùng cao độ nghĩa là chỉ bấm một lần. Tô màu đường nối bằng bút chì để không quên." },
  check:[
    {q:"Nốt đen chấm dài mấy phách?", a:"1,5 phách."},
    {q:"Dấu nối khác dấu luyến ở đâu?", a:"Dấu nối nối hai nốt cùng cao độ (bấm 1 lần); dấu luyến nối các nốt khác cao độ (chơi liền tiếng)."}
  ],
  tools:[ {type:"song", segs:[[21,24]], hand:"R", label:"Tay phải ô 21–24", mode:"step"}, {type:"song", segs:[[21,24]], hand:"L", label:"Tay trái ô 21–24", mode:"step"}, {type:"song", segs:[[17,20]], hand:"B", label:"Hai tay ô 17–20", mode:"play"} ] },

{ n:15, date:"2026-11-20", week:"Tuần 16/11", phase:"Chủ đề chính", title:"Ghép ô 17–24 và nối từ mở đầu",
  theory:{ title:"Chỗ chuyển đoạn",
    body:[
      "Từ ô 16 sang ô 17, nhiều thứ đổi cùng lúc: nhịp (12/8 → 4/4), tốc độ, âm vực của hai tay, và có thể cả khóa của tay trái.",
      "Tập chỗ nối riêng: ô 15–16 nối với ô 17–18, lặp lại vài lần. Cuối ô 16, tay phải có nốt đen chấm ngân dài. Tận dụng lúc đó để đưa tay xuống vị trí mới."
    ],
    why:"Người nghe nhớ nhất những chỗ chuyển đoạn. Chỗ nối êm thì cả bài nghe liền mạch." },
  plan:[
    P(5,"Khởi động","Hai tay ô 17–20, một lần.",50,"Không dừng"),
    P(10,"Bài","Ghép hai tay ô 21–24, rồi 17–24.",50,"Ô 17–24 hai tay 2 lần"),
    P(12,"Nối","Ô 13–16 nối sang 17–20, rồi ô 13–24.","♩. 32 → ♩ 50","Ô 13–24 liền mạch"),
    P(3,"Ôn lại","Đánh dấu bút chì chỗ đổi nhịp ở ô 17.",null,"Đã đánh dấu")
  ],
  mistake:{ title:"Mang cảm giác nhóm 3 của 12/8 sang chủ đề", fix:"Đếm thầm một ô “1 và 2 và 3 và 4 và” ở tốc độ mới trong lúc ô 16 đang ngân." },
  check:[
    {q:"Cuối ô 16 tay phải có gì giúp chuyển đoạn?", a:"Một nốt đen chấm ngân dài."},
    {q:"Những gì thay đổi khi sang ô 17?", a:"Nhịp, tốc độ, âm vực hai tay, có thể cả khóa."}
  ],
  tools:[ {type:"song", segs:[[17,24]], hand:"B", label:"Hai tay ô 17–24", mode:"play"}, {type:"song", segs:[[13,24]], hand:"B", label:"Nối ô 13–24", mode:"play"} ] },

/* ───────── Tuần 23/11 ───────── */
{ n:16, date:"2026-11-23", week:"Tuần 23/11", phase:"Chủ đề dày hơn", title:"Chủ đề dày hơn (B'): tay phải ô 25–28",
  theory:{ title:"Giai điệu nằm trong hợp âm",
    body:[
      "Từ ô 25, tay phải chơi quãng 8 hoặc 2–3 nốt cùng lúc. Nốt trên cùng (thường là ngón 5) mang giai điệu, nên dồn trọng lượng về phía ngón 5.",
      "Quãng 8 tay phải dùng ngón 1–5. Khi nốt trên là phím đen, có thể dùng ngón 4 nếu tay đủ rộng."
    ],
    why:"Đây là lúc chủ đề được nhắc lại, to và đầy hơn. Giai điệu không nổi lên trên thì đoạn này chỉ còn là một khối âm thanh." },
  plan:[
    P(5,"Khởi động","Quãng 8 tay phải trên Rê♭ và Mi♭, nảy nhẹ cổ tay, 8 lần.",60,"Cổ tay mềm"),
    P(10,"Tách giai điệu","Ô 25–28: chỉ chơi nốt trên cùng của tay phải.",45,"Hát theo được"),
    P(12,"Bài","Thêm các nốt dưới, ô 25–26 rồi 27–28.",45,"Nốt trên nghe rõ hơn các nốt dưới"),
    P(3,"Ôn lại","Ghi lại số ngón cho các quãng 8 có phím đen.",null,"Có số ngón")
  ],
  mistake:{ title:"Cứng cổ tay khi chơi quãng 8 liên tiếp", fix:"Nảy cổ tay nhẹ, thả lỏng sau mỗi lần bấm. Thấy mỏi cẳng tay thì dừng 30 giây." },
  check:[
    {q:"Trong hợp âm tay phải, nốt nào là giai điệu?", a:"Nốt trên cùng."},
    {q:"Quãng 8 có phím đen ở trên có thể dùng ngón nào?", a:"Ngón 1 và ngón 4 (hoặc 5)."}
  ],
  tools:[ {type:"song", segs:[[25,28]], hand:"R", label:"Tay phải ô 25–28", mode:"step"} ] },

{ n:17, date:"2026-11-25", week:"Tuần 23/11", phase:"Chủ đề dày hơn", title:"B': tay phải ô 29–32, tay trái ô 25–32",
  theory:{ title:"Bass rải rộng",
    body:[
      "Từ ô 25, tay trái chơi nốt bass rồi rải các nốt cao hơn, trải rộng hơn một quãng 8. Bàn tay không thể giữ tất cả cùng lúc, nên pedal sẽ giữ tiếng bass trong lúc tay di chuyển.",
      "Bản đơn giản nếu chưa kịp: chỉ đánh nốt bass đầu ô rồi giữ pedal. Hoặc đánh bass cùng một nốt gần nhất."
    ],
    why:"Tay trái làm nền vang cho giai điệu. Nền chỉ cần vững và đúng hòa âm, chưa cần đủ mọi nốt." },
  plan:[
    P(5,"Khởi động","Tay trái nhảy từ một nốt bass lên một nốt cao hơn một quãng 10, rồi quay lại, 8 lần.",50,"Không nhìn tay lần 5–8"),
    P(10,"Bài","Tay phải ô 29–32.",45,"4 ô đúng"),
    P(12,"Bài","Tay trái ô 25–32, bản đầy đủ hoặc bản đơn giản.",45,"Ô 25–32 không dừng"),
    P(3,"Ôn lại","Ghi lại đang dùng bản nào cho tay trái.",null,"Đã chọn")
  ],
  mistake:{ title:"Với ngón để bấm nốt xa", fix:"Nhảy bằng cả cánh tay, các ngón giữ hình. Mắt nhìn tới nốt đích trước." },
  check:[
    {q:"Vì sao cần pedal ở tay trái đoạn này?", a:"Để giữ tiếng bass khi tay di chuyển lên các nốt cao hơn."},
    {q:"Bản đơn giản của tay trái ô 25–32 là gì?", a:"Chỉ đánh nốt bass đầu ô và giữ pedal."}
  ],
  tools:[ {type:"song", segs:[[29,32]], hand:"R", label:"Tay phải ô 29–32", mode:"play"}, {type:"song", segs:[[25,32]], hand:"L", label:"Tay trái ô 25–32", mode:"step"} ] },

{ n:18, date:"2026-11-27", week:"Tuần 23/11", phase:"Mốc kiểm tra 2", title:"Ghép ô 25–32 · Mốc kiểm tra 2: ô 17–32",
  theory:{ title:"Quyết định ở mốc 2",
    body:[
      "Chơi ô 17–32 hai tay và ghi âm. Đạt khi dừng không quá 1 lần.",
      "Nếu chưa đạt: bỏ đoạn C (ô 33–40), bản biểu diễn sẽ là ô 1–32 rồi vào coda. Hoặc tăng thời lượng tập. Quyết định ngay hôm nay để 3 tuần còn lại tập trúng chỗ."
    ],
    why:"Còn 3 tuần trước 20/12. Chơi chắc một bản ngắn hơn tốt hơn chơi vấp một bản dài." },
  plan:[
    P(5,"Khởi động","Tay phải ô 25–28 một lần.",45,"Không dừng"),
    P(10,"Bài","Ghép hai tay ô 25–28, rồi 29–32.",45,"Mỗi cụm 3 lần đúng"),
    P(12,"Kiểm tra","Ghi âm ô 17–32 hai tay.",50,"Dừng không quá 1 lần"),
    P(3,"Báo lại","Nhắn kết quả và quyết định có giữ đoạn C không.",null,"Đã quyết định")
  ],
  mistake:{ title:"Tập lại cả đoạn dài thay vì sửa chỗ vấp", fix:"Chỗ nào vấp thì cắt ra 2 ô quanh đó, tập 5 lần đúng, rồi mới chơi lại cả đoạn." },
  check:[
    {q:"Nếu không đạt mốc 2, bản biểu diễn là gì?", a:"Ô 1–32 rồi vào coda (bỏ đoạn C)."}
  ],
  tools:[ {type:"song", segs:[[25,32]], hand:"B", label:"Hai tay ô 25–32", mode:"play"}, {type:"song", segs:[[17,32]], hand:"B", label:"Kiểm tra ô 17–32", mode:"play"} ] },

/* ───────── Tuần 30/11 ───────── */
{ n:19, date:"2026-11-30", week:"Tuần 30/11", phase:"Chuyển thế tay", title:"Đoạn chuyển (C): tay phải ô 33–36",
  theory:{ title:"Chuyển thế tay giữa các hợp âm",
    body:[
      "Ở ô 33–36, tay phải đổi liên tục giữa các hợp âm 4 nốt. Cách tập: đặt tay lên hợp âm kế tiếp mà không bấm (im lặng), kiểm tra đúng chưa, rồi mới bấm.",
      "Tìm nốt chung giữa hai hợp âm liền nhau. Ngón giữ nốt chung đóng vai trò trục, các ngón khác chỉ dịch quanh nó.",
      "Tập theo cặp: hợp âm 1 → 2, rồi 2 → 3, …"
    ],
    why:"Đây là chỗ khó nhất của bản rút gọn. Tay phải đổi hình liên tục, và tốc độ trong file nhanh hơn chủ đề (♩ 92)." },
  plan:[
    P(5,"Khởi động","Tay phải chơi hợp âm Rê♭ trưởng rồi Sol♭ trưởng, đổi qua lại 8 lần, tìm nốt chung.",50,"Đổi không nhìn tay"),
    P(10,"Im lặng","Dùng “Từng bước”: với mỗi hợp âm, đặt tay trước rồi mới bấm “Tiếp”.",null,"Đặt đúng trước khi bấm"),
    P(12,"Bài","Tay phải ô 33–34, rồi 35–36, rồi 33–36.",45,"Đặt đúng hợp âm kế tiếp trong 1 phách"),
    P(3,"Ôn lại","Ghi lại nốt chung giữa các cặp hợp âm khó.",null,"Có ghi chú")
  ],
  mistake:{ title:"Nhấc hết tay rồi mới tìm hợp âm mới", fix:"Giữ ngón ở nốt chung, chỉ di chuyển các ngón còn lại. Tay ít rời phím thì ít lạc." },
  check:[
    {q:"Tập “im lặng” là gì?", a:"Đặt tay lên hợp âm kế tiếp mà không bấm, kiểm tra rồi mới bấm."},
    {q:"Nốt chung giúp gì?", a:"Làm trục để các ngón khác dịch quanh, ít lạc tay."}
  ],
  tools:[ {type:"song", segs:[[33,36]], hand:"R", label:"Tay phải ô 33–36", mode:"step"} ] },

{ n:20, date:"2026-12-02", week:"Tuần 30/11", phase:"Nhảy quãng", title:"C: tay phải ô 37–40, tay trái ô 33–40",
  theory:{ title:"Nhảy quãng xa",
    body:[
      "Ở ô 39–40, tay trái nhảy xuống rất trầm, gần đầu trái bàn phím. Mắt đi trước tay. Nhảy bằng cả cánh tay, không với ngón. Tận dụng nốt ngân hoặc pedal để có thời gian di chuyển.",
      "Ô 39–40 có dấu bình (một vài nốt trở về phím trắng). Khoanh lại trước khi tập."
    ],
    why:"Ô 39–40 là cửa ngõ dẫn vào đoạn kết trong bản rút gọn. Nhảy sai bass ở đây thì cả đoạn kết bị lệch hòa âm." },
  plan:[
    P(5,"Khởi động","Tay trái nhảy 2 quãng 8 xuống rồi lên lại, nhìn đích trước, 8 lần.",50,"Trúng đích 6/8 lần"),
    P(10,"Bài","Tay phải ô 37–40 (để ý dấu bình).",45,"Đúng phím trắng ở chỗ có dấu bình"),
    P(12,"Bài","Tay trái ô 33–40. Ghép hai tay ô 33–36.",45,"Ô 33–36 hai tay liền mạch"),
    P(3,"Ôn lại","Ghi lại ngón nào dùng ở cú nhảy ô 39–40.",null,"Có số ngón")
  ],
  mistake:{ title:"Nhìn bản phổ trong lúc nhảy", fix:"Thuộc lòng 2 ô quanh cú nhảy. Lúc nhảy thì nhìn tay, xong mới nhìn lại bản phổ." },
  check:[
    {q:"Ô 39–40 có gì cần chú ý ngoài cú nhảy?", a:"Dấu bình."},
    {q:"Nhảy quãng nên dùng bộ phận nào?", a:"Cả cánh tay, mắt nhìn đích trước."}
  ],
  tools:[ {type:"song", segs:[[37,40]], hand:"R", label:"Tay phải ô 37–40", mode:"step"}, {type:"song", segs:[[33,40]], hand:"L", label:"Tay trái ô 33–40", mode:"play"}, {type:"song", segs:[[33,36]], hand:"B", label:"Hai tay ô 33–36", mode:"play"} ] },

{ n:21, date:"2026-12-04", week:"Tuần 30/11", phase:"Đoạn kết", title:"Coda rút gọn: ô 89–96",
  theory:{ title:"Coda và chậm dần",
    body:[
      "Coda là đoạn kết. Trong bản này, tay trái giữ quãng 8 trầm suốt đoạn, còn tay phải đi lên qua nhiều quãng 8.",
      "Bản rút gọn: bỏ các nốt hoa mỹ (nốt nhỏ). Ở ô 95, thay tremolo (rung nhanh hai nốt) bằng một hợp âm giữ dài. Các ô 90, 92, 94 có dấu bình.",
      "Tốc độ coda trong file là ♩ 80. Chậm dần (rit.) ở 2 ô cuối."
    ],
    why:"Câu kết là thứ người nghe mang về. Chơi chậm và chắc ở đây quan trọng hơn chơi đủ nốt." },
  plan:[
    P(5,"Khởi động","Tay phải chơi cùng một hình nốt ở 3 quãng 8 liên tiếp, đi lên.",50,"Dịch quãng 8 không dừng"),
    P(10,"Bài","Tay phải ô 89–96, bản rút gọn.",50,"Không dừng, đúng dấu bình"),
    P(12,"Ghép","Ghép hai tay ô 89–96.",50,"Coda hai tay không dừng, mỗi ô nhìn xuống tay không quá 1 lần"),
    P(3,"Ôn lại","Gạch bút chì những nốt hoa mỹ đã bỏ.",null,"Đã đánh dấu")
  ],
  mistake:{ title:"Chơi coda nhanh vì sắp xong bài", fix:"Coda chậm hơn cả bài. Hít một hơi trước ô 89 và đếm thầm ở tốc độ mới." },
  check:[
    {q:"Bản rút gọn xử lý ô 95 thế nào?", a:"Thay tremolo bằng một hợp âm giữ dài."},
    {q:"Rit. nghĩa là gì?", a:"Chậm dần."}
  ],
  tools:[ {type:"song", segs:[[89,96]], hand:"R", label:"Tay phải ô 89–96", mode:"step"}, {type:"song", segs:[[89,96]], hand:"B", label:"Hai tay ô 89–96", mode:"play"} ] },

/* ───────── Tuần 7/12 ───────── */
{ n:22, date:"2026-12-07", week:"Tuần 7/12", phase:"Pedal", title:"Pedal vang trên đàn điện",
  theory:{ title:"Pedal trễ (legato pedal)",
    body:[
      "Pedal vang (pedal phải, sustain) làm các nốt tiếp tục ngân sau khi đã nhả phím.",
      "Kỹ thuật pedal trễ: bấm hợp âm mới → ngay sau đó nhả pedal → nhấn lại. Nhả pedal trước khi bấm thì tiếng bị hở. Đổi pedal cùng lúc với bấm phím thì tiếng bị đục, vì dính hợp âm cũ.",
      "Đàn điện: cắm pedal vào cổng SUSTAIN trước khi bật đàn. Nếu nhấn pedal mà tiếng lại tắt, pedal đang bị đảo cực: tắt đàn, cắm lại rồi bật."
    ],
    why:"File có ghi pedal. Trong “Đàn hướng dẫn”, vạch Pedal ở mép trái khung nốt sáng lên lúc nhấn và tắt lúc nhả. Bài này cần pedal để có tiếng vang mênh mang như trong bản gốc." },
  plan:[
    P(5,"Khởi động","Chỉ một hợp âm đổi qua lại (Rê♭ → Sol♭), tập pedal trễ, 8 lần.",50,"Không hở, không đục"),
    P(10,"Pedal","Ô 1–8 hai tay, đổi pedal theo vạch Pedal trong Đàn hướng dẫn.","♩. = 32","Không đục khi đổi hợp âm"),
    P(12,"Bài","Ô 9–16 với pedal. Sau đó ghép hai tay ô 37–40.","♩. = 32","Ô 1–16 với pedal sạch tiếng"),
    P(3,"Ôn lại","Đánh dấu chỗ đổi pedal trên bản phổ.",null,"Đã đánh dấu")
  ],
  mistake:{ title:"Đổi pedal cùng lúc với bấm phím", fix:"Thứ tự đúng là tay xuống trước, chân lên rồi xuống sau. Nói thầm “bấm – nhả – nhấn”." },
  check:[
    {q:"Thứ tự đúng của pedal trễ là gì?", a:"Bấm phím → nhả pedal → nhấn lại."},
    {q:"Nhấn pedal mà tiếng tắt thì vì sao?", a:"Pedal bị đảo cực; cắm pedal trước khi bật đàn."}
  ],
  tools:[ {type:"song", segs:[[1,16]], hand:"B", label:"Ô 1–16 + vạch pedal", mode:"play"}, {type:"song", segs:[[37,40]], hand:"B", label:"Hai tay ô 37–40", mode:"step"} ] },

{ n:23, date:"2026-12-09", week:"Tuần 7/12", phase:"Nối các đoạn", title:"Pedal ô 17–40, nối 32→33 và 40→89",
  theory:{ title:"Bước nhảy trong bản rút gọn",
    body:[
      "Đánh dấu bút chì ở cuối ô 40: “nhảy tới ô 89”. Cuối ô 40, tay trái đang ở bass rất trầm. Ô 89 tay trái bắt đầu quãng 8 trầm, nên hai chỗ khá gần nhau và chuyển êm.",
      "Tốc độ đổi từ ♩ 92 sang 80. Chậm lại một chút ở ô 40 cho tự nhiên.",
      "Trong “Đàn hướng dẫn”, công cụ “Nối 39–40 → 89–90” phát liền hai đoạn này, đúng như khi biểu diễn."
    ],
    why:"Người nghe không biết có đoạn bị bỏ, nếu chỗ nối nghe như đã được viết sẵn." },
  plan:[
    P(5,"Khởi động","Ô 37–40 hai tay một lần.",45,"Không dừng"),
    P(10,"Pedal","Ô 17–32 với pedal.",50,"Sạch tiếng"),
    P(12,"Nối","Ô 31–34, rồi nối 39–40 → 89–90.",50,"Hai chỗ nối chơi liền 3 lần"),
    P(3,"Ôn lại","Viết lên bản phổ thứ tự: 1–40 → 89–96.",null,"Đã viết")
  ],
  mistake:{ title:"Dừng lại để lật trang hoặc tìm ô 89", fix:"Photo riêng trang coda, đặt ngay cạnh trang có ô 40." },
  check:[
    {q:"Bản rút gọn đi theo thứ tự nào?", a:"Ô 1–40 rồi ô 89–96."}
  ],
  tools:[ {type:"song", segs:[[17,40]], hand:"B", label:"Ô 17–40 + pedal", mode:"play"}, {type:"song", segs:[[31,34]], hand:"B", label:"Nối ô 31–34", mode:"play"}, {type:"song", segs:[[39,40],[89,90]], hand:"B", label:"Nối 39–40 → 89–90", mode:"play"} ] },

{ n:24, date:"2026-12-11", week:"Tuần 7/12", phase:"Chơi cả bài", title:"Lần đầu chơi cả bản rút gọn",
  theory:{ title:"Vấp thì chơi tiếp",
    body:[
      "Biểu diễn khác với tập. Khi tập, gặp chỗ sai thì dừng lại sửa. Khi biểu diễn, sai thì không quay lại: giữ nhịp, vào lại ở phách 1 của ô kế tiếp.",
      "Hôm nay chơi cả bài ở tốc độ chậm, theo luật biểu diễn."
    ],
    why:"Ngày 20/12 không có “làm lại”. Kỹ năng chơi tiếp khi vấp cũng cần được tập." },
  plan:[
    P(5,"Khởi động","Gam Rê♭ trưởng hai tay, mỗi nốt 1 phách.",60,"Đều"),
    P(22,"Cả bài","Chơi bản rút gọn ô 1–40 → 89–96 hai lần. Có thể chơi theo “Nghe & xem” 50–60%.","50–60%","Hết bài, dừng không quá 2 lần"),
    P(3,"Ghi chú","Ghi 2 chỗ vấp nặng nhất.",null,"Có 2 chỗ")
  ],
  mistake:{ title:"Quay lại sửa ngay khi sai", fix:"Thói quen quay lại sẽ lộ ra khi biểu diễn. Từ hôm nay, mỗi lần chơi cả bài đều đi tới cuối." },
  check:[
    {q:"Sai khi biểu diễn thì làm gì?", a:"Giữ nhịp, vào lại ở phách 1 ô kế tiếp."}
  ],
  tools:[ {type:"song", segs:REDUCED, hand:"B", label:"Bản rút gọn", mode:"play"} ] },

/* ───────── Tuần 14/12 ───────── */
{ n:25, date:"2026-12-14", week:"Tuần 14/12", phase:"Hoàn thiện", title:"Sắc thái to – nhỏ",
  theory:{ title:"Sắc thái",
    body:[
      "Ký hiệu sắc thái, từ nhỏ tới to: pp – p – mp – mf – f – ff. Ký hiệu < là to dần (crescendo), > là nhỏ dần (decrescendo).",
      "File MIDI này cho mọi nốt cùng một lực, nên Nura tự chọn sắc thái. Gợi ý: mở đầu p (như chuông xa), chủ đề mp đến mf, ô 25–32 to dần, đoạn C mf lên f, coda p rồi pp và chậm dần.",
      "Đàn điện: kiểm tra chế độ Touch (độ nhạy lực) đang ở Normal, không phải Fixed. Ở Fixed, đánh mạnh hay nhẹ đều ra một âm lượng."
    ],
    why:"Đúng nốt mới là chơi được bài. Có to – nhỏ thì bài mới kể được câu chuyện, và với bài này câu chuyện là thứ quan trọng nhất." },
  plan:[
    P(5,"Khởi động","Một hợp âm chơi lần lượt pp → ff → pp, 7 mức.",60,"Nghe rõ 7 mức khác nhau"),
    P(10,"Ghi sắc thái","Viết ký hiệu sắc thái bằng bút chì vào bản phổ theo gợi ý (hoặc theo ý Nura).",null,"Mỗi đoạn có ký hiệu"),
    P(12,"Sửa vấp","Tập riêng 2 chỗ vấp nặng nhất từ bài 24, mỗi chỗ 2 ô.","60–70%","Mỗi chỗ đúng 5 lần liền"),
    P(3,"Ôn lại","Chơi ô 1–8 với sắc thái p.","♩. = 44","Nghe nhỏ mà vẫn đều")
  ],
  mistake:{ title:"Chơi nhỏ thì cũng chậm lại", fix:"Nhỏ là ít lực, không phải ít tốc độ. Giữ metronome khi tập đoạn p." },
  check:[
    {q:"mf là gì?", a:"Hơi to (mezzo forte)."},
    {q:"Vì sao phải kiểm tra chế độ Touch?", a:"Ở Fixed, lực bấm không đổi âm lượng."}
  ],
  tools:[ {type:"song", segs:REDUCED, hand:"B", label:"Bản rút gọn", mode:"play"} ] },

{ n:26, date:"2026-12-16", week:"Tuần 14/12", phase:"Hoàn thiện", title:"Tốc độ biểu diễn và quay video",
  theory:{ title:"Chọn tốc độ biểu diễn",
    body:[
      "Tốc độ biểu diễn là tốc độ mà Nura chơi sạch 3 lần liên tiếp, rồi trừ đi 5% để bù cho hồi hộp.",
      "Mục tiêu tham khảo: mở đầu ♩. 50–56 (gốc 68), chủ đề ♩ 72–80 (gốc 88–92). Bài này chơi chậm vẫn đẹp.",
      "Quay video ở góc nghiêng thấy được hai tay. Xem lại và ghi đúng 3 việc cần sửa, không hơn."
    ],
    why:"Video cho thấy những thứ không cảm nhận được lúc đang chơi: vai gồng, tay nhìn xuống nhiều, chỗ chậm lại." },
  plan:[
    P(5,"Khởi động","Ô 1–4 hai tay ở tốc độ mục tiêu.","♩. = 50","Không dừng"),
    P(10,"Tăng tốc","Mỗi đoạn A, B, C, coda: tăng dần lên tốc độ mục tiêu, mỗi lần +2–4.","80–85%","Mỗi đoạn sạch 3 lần ở tốc độ mục tiêu"),
    P(12,"Video","Quay video cả bản rút gọn. Xem lại và ghi 3 việc cần sửa.","Tốc độ mục tiêu","Có video và danh sách 3 việc"),
    P(3,"Ôn lại","Sửa việc số 1 trong danh sách.",null,"Đã sửa")
  ],
  mistake:{ title:"Ép tốc độ của bản ghi", fix:"Tốc độ đúng là tốc độ chơi sạch. Chậm mà chắc nghe hay hơn nhanh mà vấp." },
  check:[
    {q:"Cách chọn tốc độ biểu diễn?", a:"Tốc độ chơi sạch 3 lần liên tiếp, trừ 5%."}
  ],
  tools:[ {type:"song", segs:REDUCED, hand:"B", label:"Bản rút gọn", mode:"play"} ] },

{ n:27, date:"2026-12-18", week:"Tuần 14/12", phase:"Tổng duyệt", title:"Tổng duyệt cho ngày 20/12",
  theory:{ title:"Thói quen trước khi chơi",
    body:[
      "Trước mỗi lần biểu diễn: ngồi chỉnh ghế, thở chậm 2 hơi, đặt tay lên vị trí ô 1, đếm thầm 1 ô ở tốc độ đúng rồi mới bắt đầu.",
      "Tập “lần đầu lạnh”: không chơi bài trước đó, chỉ khởi động ngón tay. Hôm 20/12 cũng sẽ như vậy."
    ],
    why:"Hồi hộp làm tay nhanh hơn và cứng hơn. Thói quen cố định giúp cơ thể vào trạng thái quen thuộc." },
  plan:[
    P(5,"Khởi động","Chỉ khởi động ngón: gam Rê♭ trưởng, hợp âm. Không chơi bài.",60,"Tay ấm"),
    P(22,"Biểu diễn","Chơi trọn bản rút gọn 2 lần như biểu diễn thật, quay video lần 2. Vấp thì chơi tiếp.","Tốc độ biểu diễn","2 lần trọn bài không dừng"),
    P(3,"Chuẩn bị 20/12","Ghi lại: tốc độ, giờ chơi, chỗ cần nhớ.",null,"Sẵn sàng")
  ],
  mistake:{ title:"Tập thêm thật nhiều vào ngày 19/12", fix:"Hôm trước biểu diễn chỉ chơi nhẹ 1 lần ở tốc độ chậm. Tay cần nghỉ để giữ những gì đã tập." },
  check:[
    {q:"Thói quen trước khi chơi gồm những bước nào?", a:"Chỉnh ghế, thở 2 hơi, đặt tay, đếm thầm 1 ô."}
  ],
  tools:[ {type:"song", segs:REDUCED, hand:"B", label:"Bản rút gọn", mode:"play"} ] }
];

// Thông tin để nhận ra file MIDI tương ứng (xem fingerprint() trong js/midi.js).
export const PRESET = {
  id: "mr-lawrence",
  title: "Merry Christmas Mr. Lawrence",
  fingerprint: "96-2029-fynuxx",
  match: song => song.bars.length === 96 && song.notes.length === 2029 && (!song.key || song.key.sf === -5),
  note: "Giáo án soạn tay cho Nura: 27 buổi thứ 2/4/6 từ 19/10 tới 18/12/2026, biểu diễn 20/12. Bản rút gọn ô 1–40 → 89–96.",
  settings: { start: "2026-10-19", target: "2026-12-20", weekdays: [1, 3, 5], minutes: 30, time: "19:00", level: "beginner", known: ["keyboard", "treble", "rhythm"] },
  lessons: LESSONS,
  perfSegs: REDUCED
};
