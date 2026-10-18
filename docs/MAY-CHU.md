# Lưu trên máy chủ và dùng trên điện thoại

Trang luôn giữ một bản sao dữ liệu trong trình duyệt (localStorage) để dùng được khi mất mạng.
Khi có máy chủ, bài (kèm file MIDI), lịch và tiến độ được lưu thêm trên máy chủ, nên điện thoại và máy tính thấy cùng một dữ liệu.

## 1. Chạy máy chủ trên máy tính

```bash
npm run serve            # hoặc: node tools/serve.js 8080
```

Cửa sổ lệnh in ra:

```
Trên máy này:   http://localhost:8080
Điện thoại cùng Wi-Fi: http://192.168.1.23:8080
Dữ liệu lưu ở: .../phong-tap-piano/data
```

* Mở địa chỉ thứ hai trên điện thoại (cùng mạng Wi-Fi). Trang tự nhận ra máy chủ và bật đồng bộ (chấm xanh “Đã lưu trên máy chủ”).
* Windows có thể hỏi cho phép Node.js qua tường lửa: chọn **Private networks**.
* Dữ liệu nằm trong thư mục `data/` (đã được `.gitignore`, không lên GitHub). Sao lưu thư mục này là đủ.

## 2. Dùng khi ra ngoài

Điện thoại cần vào được máy chủ qua Internet. Ba cách, từ dễ tới bền:

| Cách | Làm gì | Ghi chú |
| --- | --- | --- |
| Tailscale | Cài Tailscale trên máy tính và điện thoại, đăng nhập cùng tài khoản. Mở `http://<tên-máy>:8080` | Miễn phí, không mở cổng ra Internet. Máy tính ở nhà phải bật. |
| VPS (máy chủ ảo) | `docker build -t ptp . && docker run -d -p 8080:8080 -v ptp-data:/data -e PTP_TOKEN=<mã> ptp`, đặt tên miền + HTTPS (vd. Caddy) | Luôn bật, dữ liệu nằm trong volume `ptp-data`. |
| Render / Railway / Fly.io | Tạo dịch vụ từ repo này (có sẵn `Dockerfile`), gắn **ổ đĩa lâu dài** vào `/data`, đặt biến `PTP_TOKEN` | Gói miễn phí thường **không** có ổ đĩa lâu dài: dữ liệu sẽ mất khi dịch vụ khởi động lại. |

Khi máy chủ mở ra Internet, **luôn đặt `PTP_TOKEN`**, rồi trên trang vào “Lưu trữ và dùng trên điện thoại” và nhập mã đó.

Nếu giao diện chạy ở chỗ khác (ví dụ GitHub Pages) còn máy chủ ở chỗ khác, nhập địa chỉ máy chủ vào ô “Địa chỉ máy chủ” (vd. `https://piano.example.com`). API đã bật CORS.

## 3. Cài lên màn hình chính (PWA)

* Android/Chrome: menu ⋮ → “Cài đặt ứng dụng”, hoặc nút “Cài lên màn hình chính” trong trang Lưu trữ.
* iPhone/Safari: nút Chia sẻ → “Thêm vào MH chính”.
* Chỉ cài được khi trang mở qua **HTTPS** (hoặc `localhost`). Địa chỉ `http://192.168.x.x` trong mạng nhà vẫn dùng được trên trình duyệt nhưng không cài thành ứng dụng và không lưu sẵn để dùng khi mất mạng.

## 4. API

| Lệnh | Ý nghĩa |
| --- | --- |
| `GET /api/health` | Kiểm tra máy chủ (`{ app: "phong-tap-piano", auth }`) |
| `GET /api/songs` | Danh sách bài `{ id, name, updatedAt, deleted }` |
| `GET/PUT/DELETE /api/songs/:id` | Một bài (gồm file MIDI dạng base64, lịch, lựa chọn đoạn). PUT cũ hơn bản trên máy chủ trả `409` kèm bản mới hơn. |
| `GET /api/progress` · `GET/PUT /api/progress/:id` | Tiến độ. PUT được **gộp**: buổi đã đạt ở thiết bị nào cũng giữ là đạt. |

Mọi lệnh trừ `health` cần `Authorization: Bearer <PTP_TOKEN>` khi máy chủ có đặt mã.
