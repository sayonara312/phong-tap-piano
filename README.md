# Phòng tập piano

Ứng dụng web tĩnh (HTML + JavaScript thuần, không cần build) giúp người mới tập một bản piano tới ngày biểu diễn:

1. **Đọc file MIDI** của bài (xuất từ MuseScore, Musescore.com, Flat, Sibelius…).
2. **Phân tích bài**: giọng và hóa biểu, nhịp (kể cả nhịp ghép 6/8, 12/8 và chỗ đổi nhịp), tốc độ, các đoạn và câu, câu nào nhắc lại câu nào, độ khó từng ô, kỹ thuật xuất hiện lần đầu ở đâu.
3. **Xếp lộ trình** theo lịch của người tập (ngày bắt đầu, ngày biểu diễn, các thứ trong tuần, số phút mỗi buổi, trình độ). Nếu không đủ thời gian cho cả bài, tự chọn **bản rút gọn** (luôn giữ mở đầu và đoạn kết).
4. **Từng buổi tập**: nhạc lý đúng lúc cần, kế hoạch theo phút có đồng hồ, metronome gợi ý, tiêu chí “đạt”, lỗi hay gặp, câu tự kiểm tra, và **đàn hướng dẫn** (nốt rơi xuống bàn phím, chế độ từng bước, chọn tay, chỉnh tốc độ, metronome, vạch pedal, trắc nghiệm đọc nốt khóa Sol/Fa, gam và hợp âm của giọng).

Mọi dữ liệu (file MIDI, lịch, tiến độ) chỉ nằm trong trình duyệt của người dùng (`localStorage`). Kho mã này **không chứa file MIDI hay bản phổ** nào.

## Chạy thử

```bash
python3 -m http.server 8080      # rồi mở http://localhost:8080
```

Cần chạy qua máy chủ web (không mở trực tiếp file `index.html`) vì trang dùng ES module và tải tiếng piano trong `samples/`.
Có thể bật GitHub Pages cho nhánh `main` để dùng trên điện thoại.

Dùng thử bộ phân tích và bộ xếp lộ trình bằng dòng lệnh (Node 18+):

```bash
node tools/analyze.js bai.mid --start 2026-10-19 --target 2026-12-20 --days 1,3,5 --minutes 30 --level beginner
node tools/analyze.js bai.mid --json > ket-qua.json
```

## Khung tổng thể

```
file .mid ──► midi.js ──► analyze.js ──► planner.js ──► app.js (giao diện)
              đọc MIDI     phân tích       xếp lộ trình      │
              ô nhịp       độ khó, câu      dùng modules.js   ├─► studio.js  (đàn hướng dẫn)
              tốc độ       kỹ thuật                           │     ├─ keyboard.js
              pedal                                           │     └─ audio.js
                               presets/ (giáo án soạn tay) ───┘
```

| Tệp | Vai trò |
| --- | --- |
| `js/midi.js` | Đọc SMF 0/1, chia tay trái/phải (theo track, hoặc theo Đô giữa nếu chỉ có 1 track), dựng ô nhịp theo số chỉ nhịp, bản đồ tốc độ, pedal (suy ra lệnh nhấn khi file chỉ có lệnh nhả), ghép đoạn để phát. |
| `js/analyze.js` | Giọng (từ file hoặc đoán bằng Krumhansl–Schmuckler), đặc điểm từng ô cho mỗi tay (số nốt, hợp âm lớn nhất, bước nhảy, quãng 8, hợp âm nhắc lại, nốt rất ngắn, nốt ngoài giọng, pedal), điểm độ khó 1–5, chia đoạn ở chỗ đổi nhịp/tốc độ, chia câu ~8 ô, nhận ra câu nhắc lại bằng so sánh giai điệu, vị trí lần đầu của từng kỹ thuật. |
| `js/modules.js` | Thư viện kiến thức: mỗi module có giải thích, “vì sao cần cho bài này” (điền số liệu từ bản phân tích), bài khởi động, lỗi hay gặp, câu tự kiểm tra, công cụ đi kèm. Định nghĩa trình độ và hệ số thời gian. |
| `js/planner.js` | Đếm buổi theo lịch → dành buổi cho nhạc lý nền tảng còn thiếu → giai đoạn hoàn thiện (pedal, nối đoạn, chơi cả bài, sắc thái, tốc độ + video, tổng duyệt) → phần còn lại cho học bài. Ước tính chi phí từng câu, chọn bản biểu diễn, chia câu thành cụm 1–4 ô, sinh việc (tay phải, tay trái, ghép, nối câu, mốc kiểm tra), chia đều vào các buổi, gắn kiến thức “đúng lúc”. |
| `js/studio.js` | Đàn hướng dẫn và các công cụ nhạc lý. |
| `js/app.js` | Thư viện bài, form thêm bài, trang tổng quan (biểu đồ độ khó, chọn câu, lịch), trang từng buổi. |
| `presets/` | Giáo án soạn tay, tự áp dụng khi file MIDI khớp (ví dụ `mr-lawrence.js`). |

### Mô hình chi phí (có thể chỉnh trong `planner.js`)

* Cụm tay riêng: `số ô × (0,05 + 0,03 × độ khó tay đó)` buổi.
* Cụm ghép hai tay: `số ô × (0,06 + 0,035 × độ khó ô)` buổi.
* Nhân với hệ số trình độ (1,3 / 1,0 / 0,7) và `30 / số phút mỗi buổi`. Câu nhắc lại một câu trước đó chỉ tính 60%.
* Bản biểu diễn: mở đầu + các câu liền nhau từ đầu + câu kết, lấy nhiều nhất trong ngân sách (cho phép vượt 10%). Người dùng có thể tự bật/tắt từng câu ở trang Tổng quan.

### Mở rộng

* **Thêm kiến thức mới**: thêm mục vào `MODULES` (`js/modules.js`), đánh dấu vị trí xuất hiện trong `analyze.js` (`firstOf`) và đưa id vào `JIT` hoặc `FOUNDATION`.
* **Thêm giáo án soạn tay** cho một bài: tạo `presets/<id>.js` xuất `PRESET` (`match`, `settings`, `lessons`, `perfSegs`) rồi khai báo trong `presets/index.js`. Định dạng buổi tập giống đầu ra của `planner.js`.
* **Công cụ mới cho đàn hướng dẫn**: thêm hàm `toolXxx` trong `studio.js` và khai báo trong `openTool`.

### Giới hạn hiện tại

* Chia tay dựa vào track của file. File chỉ có 1 track sẽ chia ở Đô giữa (chỉ gần đúng).
* Số ô nhịp tính theo số chỉ nhịp trong file. Ô lấy đà (anacrusis) có thể làm lệch số ô so với bản phổ.
* Độ khó và chi phí là ước lượng heuristics, nên xem lại ở các mốc kiểm tra.
* Không nhận tín hiệu từ đàn điện (Web MIDI) — có thể thêm sau.

## Bản quyền

* Mã nguồn: MIT (xem `LICENSE`).
* Tiếng piano trong `samples/`: Salamander Grand Piano của Alexander Holm, giấy phép CC BY 3.0.
* Không đưa file MIDI hay bản phổ có bản quyền vào kho này (`.gitignore` đã chặn `*.mid`).
