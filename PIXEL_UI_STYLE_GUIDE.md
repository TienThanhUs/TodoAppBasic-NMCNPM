# PIXEL UI STYLE GUIDE (phong cách Minecraft / Codédex)

> **Dành cho AI agent.** Khi làm bất kỳ giao diện nào trong dự án này, hãy làm theo file này.
> Mục tiêu: **giao diện phải "cảm giác" như game pixel (Minecraft, Codédex)**.
> Chỉ bắt chước **phong cách của thành phần** (nút, khung, ô nhập, thẻ, thanh tiến độ...).
> **KHÔNG** bắt chước cách bố cục (layout) của trang nào cả. Bố cục tự do theo nhu cầu của dự án.

---

## 0. Luật vàng (đọc trước, nhớ kỹ)

1. **Không bo góc mượt.** Mọi thứ vuông vức. `border-radius: 0` (trừ khi dùng góc "bậc thang" ở mục 5).
2. **Viền dày, cứng, màu tối.** Viền 3–4px, không mờ, không gradient.
3. **Bóng đổ cứng (hard shadow).** Không blur. Bóng là một khối màu đặc lệch xuống dưới/phải.
4. **Màu phẳng.** Không gradient, không glassmorphism, không bóng mờ (`blur`).
5. **Font pixel** cho tiêu đề và nút. Chữ dài (đoạn văn) dùng font dễ đọc hơn.
6. **Nút "lún xuống" khi bấm.** Hover thì sáng lên, active thì dịch chuyển + mất bóng.
7. **Ảnh/icon phải là pixel art.** Khi phóng to: `image-rendering: pixelated`.
8. **Ít màu, màu đậm, tương phản cao.** Mỗi màn hình chỉ dùng 1 màu nhấn chính.
9. **Animation kiểu "nhảy bậc"** (`steps()`), không dùng easing mượt.

Nếu không chắc: chọn phương án **vuông hơn, dày hơn, phẳng hơn**.

---

## 1. Design tokens (CSS variables)

Đặt vào `:root`. Đây là nguồn sự thật duy nhất. **Không hard-code màu ở chỗ khác.**

```css
:root {
  /* ---------- Màu nền ---------- */
  --bg-page:        #1b1b2f;   /* nền trang (xanh đêm đậm) */
  --bg-panel:       #2a2a45;   /* nền khung/panel */
  --bg-panel-light: #3a3a5c;   /* nền khung sáng hơn / hover */
  --bg-inset:       #121222;   /* ô trũng: input, thanh tiến độ */

  /* ---------- Chữ ---------- */
  --text:           #ffffff;
  --text-muted:     #a9a9c8;
  --text-on-accent: #1a1a1a;   /* chữ đặt trên nút màu sáng */

  /* ---------- Màu nhấn (mỗi cái có 3 sắc: sáng / chính / tối) ---------- */
  --green-light: #8be36a;  --green: #4cb944;  --green-dark: #2b7a2b;   /* hành động chính */
  --yellow-light:#ffe580;  --yellow:#ffc72c;  --yellow-dark:#b8860b;   /* điểm/XP/nổi bật */
  --blue-light:  #7ec8ff;  --blue:  #3a8fe0;  --blue-dark:  #1f548f;   /* thông tin/liên kết */
  --red-light:   #ff8a80;  --red:   #e04646;  --red-dark:   #8f2020;   /* nguy hiểm/xoá */
  --gray-light:  #c9c9d6;  --gray:  #8e8ea5;  --gray-dark:  #55556b;   /* nút phụ / vô hiệu */

  /* ---------- Viền & bóng ---------- */
  --outline:        #0b0b14;   /* viền ngoài của mọi thứ (gần đen) */
  --border-w:       4px;       /* viền chuẩn */
  --border-w-sm:    3px;       /* viền cho thành phần nhỏ */
  --shadow-offset:  4px;       /* độ lệch bóng chuẩn */

  /* ---------- Cỡ & khoảng cách (bội số của 4) ---------- */
  --space-1: 4px;  --space-2: 8px;  --space-3: 12px;
  --space-4: 16px; --space-5: 24px; --space-6: 32px;

  /* ---------- Font ---------- */
  --font-pixel: 'Press Start 2P', 'Pixelify Sans', monospace;  /* tiêu đề, nút, nhãn */
  --font-body:  'Pixelify Sans', 'VT323', 'Silkscreen', monospace; /* chữ thường */
}
```

**Về font:** lấy từ Google Fonts. Gợi ý:
- `Press Start 2P` — rất "game", **chỉ dùng cho chữ ngắn** (tiêu đề, nút, nhãn). Chữ này to và rộng.
- `Pixelify Sans` hoặc `VT323` — dễ đọc hơn, dùng cho đoạn văn.
- **Tiếng Việt có dấu:** `Press Start 2P` hỗ trợ dấu tiếng Việt kém. Với chữ tiếng Việt, ưu tiên `Pixelify Sans` (hoặc font khác hỗ trợ đủ dấu) và **phải kiểm tra thực tế**. Đừng để chữ bị mất dấu hoặc rơi về font hệ thống.
- Cỡ chữ pixel nên là bội số của 8px (8, 16, 24...) để chữ không bị nhoè.

---

## 2. Kỹ thuật cốt lõi

### 2.1. Viền + bóng cứng (dùng `box-shadow` nhiều lớp, không blur)

Đây là "công thức" tạo cảm giác pixel. Một khung chuẩn:

```css
.pixel-box {
  background: var(--bg-panel);
  border: var(--border-w) solid var(--outline);
  border-radius: 0;
  box-shadow:
    inset calc(var(--border-w) * -1) calc(var(--border-w) * -1) 0 0 rgba(0,0,0,.35), /* tối ở dưới-phải (bên trong) */
    inset var(--border-w) var(--border-w) 0 0 rgba(255,255,255,.18),                  /* sáng ở trên-trái (bên trong) */
    var(--shadow-offset) var(--shadow-offset) 0 0 var(--outline);                      /* bóng đổ cứng bên ngoài */
}
```

Ý nghĩa đơn giản: **trên-trái sáng, dưới-phải tối** → khối trông như nổi lên (giống nút/khối Minecraft).

### 2.2. Render pixel sắc nét

```css
img, canvas, .sprite {
  image-rendering: pixelated;      /* Chrome/Edge/Safari */
  image-rendering: crisp-edges;    /* Firefox */
}
body {
  -webkit-font-smoothing: none;    /* chữ pixel sắc hơn (nếu trình duyệt hỗ trợ) */
  font-smooth: never;
}
```

### 2.3. Animation kiểu pixel

Dùng `steps()` thay vì `ease`. Ví dụ nhấp nháy con trỏ, nhún nút:

```css
@keyframes blink { 50% { opacity: 0; } }
.cursor { animation: blink 1s steps(1) infinite; }

.pixel-btn { transition: transform 60ms steps(2), box-shadow 60ms steps(2); }
```

Tôn trọng người dùng nhạy cảm chuyển động:

```css
@media (prefers-reduced-motion: reduce) { * { animation: none !important; transition: none !important; } }
```

---

## 3. Nút bấm (Button): thành phần quan trọng nhất

### 3.1. Cấu trúc

- Chữ: `--font-pixel`, in HOA hoặc thường đều được nhưng **phải nhất quán** trong cả dự án.
- Padding: `var(--space-3) var(--space-5)`. Chiều cao tối thiểu **44px** (dễ bấm trên điện thoại).
- Viền `--border-w` màu `--outline`. Bóng cứng `--shadow-offset`.
- Mỗi nút có 3 sắc: **sáng** (cạnh trên-trái), **chính** (nền), **tối** (cạnh dưới-phải + bóng).

### 3.2. Code mẫu (nút xanh lá = hành động chính)

```css
.pixel-btn {
  font-family: var(--font-pixel);
  font-size: 12px;
  line-height: 1;
  padding: var(--space-3) var(--space-5);
  min-height: 44px;
  cursor: pointer;
  color: var(--text-on-accent);
  background: var(--green);
  border: var(--border-w) solid var(--outline);
  border-radius: 0;
  box-shadow:
    inset 0 4px 0 0 var(--green-light),    /* vạch sáng ở trên */
    inset 0 -4px 0 0 var(--green-dark),    /* vạch tối ở dưới */
    4px 4px 0 0 var(--outline);            /* bóng cứng */
  text-transform: uppercase;
  user-select: none;
}

.pixel-btn:hover {
  filter: brightness(1.1);                 /* sáng lên chút */
}

.pixel-btn:active {
  transform: translate(4px, 4px);          /* lún xuống đúng bằng độ lệch bóng */
  box-shadow:
    inset 0 4px 0 0 var(--green-dark),
    inset 0 -4px 0 0 var(--green-light),
    0 0 0 0 var(--outline);                /* mất bóng */
}

.pixel-btn:focus-visible {
  outline: 4px dashed var(--yellow);       /* focus rõ ràng cho bàn phím */
  outline-offset: 4px;
}

.pixel-btn:disabled {
  background: var(--gray);
  color: var(--gray-dark);
  box-shadow: inset 0 4px 0 0 var(--gray-light), inset 0 -4px 0 0 var(--gray-dark), 4px 4px 0 0 var(--outline);
  cursor: not-allowed;
  filter: none;
}
```

### 3.3. Biến thể (variant)

Chỉ cần đổi 3 màu `--*-light`, `--*`, `--*-dark`. Quy ước **dùng màu theo ý nghĩa, không dùng bừa**:

| Variant | Màu | Dùng cho |
|---|---|---|
| `primary` | xanh lá | Hành động chính (Bắt đầu, Lưu, Tiếp tục). **Tối đa 1 nút primary mỗi khu vực.** |
| `secondary` | xám | Hành động phụ (Huỷ, Quay lại) |
| `accent` | vàng | Điểm thưởng, nâng cấp, nổi bật |
| `info` | xanh dương | Liên kết, xem thêm, hướng dẫn |
| `danger` | đỏ | Xoá, thao tác nguy hiểm |

Kích thước: `sm` (font 10px, cao 36px), `md` (mặc định), `lg` (font 16px, cao 56px).

**Nút icon:** hình vuông, kích thước 44×44px, icon pixel 16×16 hoặc 24×24 ở giữa.

---

## 4. Các thành phần khác

### 4.1. Panel / Card (khung nội dung)
- Dùng `.pixel-box` ở mục 2.1.
- Tiêu đề card: `--font-pixel`, 14–16px, có thể đặt trong "thanh tiêu đề" riêng (nền `--bg-panel-light`, viền dưới 4px `--outline`).
- Card có thể bấm: thêm hover = dịch lên `translate(-2px, -2px)` + tăng bóng thêm 2px; active = giống nút.
- Khoảng cách trong card: `var(--space-4)` đến `var(--space-5)`.

### 4.2. Ô nhập liệu (Input / Textarea / Select)
- Là ô **trũng xuống** (ngược với nút): nền `--bg-inset`, bóng bên trong đảo chiều (tối ở trên-trái, sáng ở dưới-phải).
- Viền 4px `--outline`. Không bo góc. Không bóng ngoài.
- Chữ: `--font-body`, 16px trở lên (tránh iOS tự zoom).
- Focus: viền đổi sang `--yellow` hoặc `--blue`, **không** dùng glow mờ.
- Lỗi: viền `--red`, thông báo lỗi bên dưới bằng chữ `--red-light`.

```css
.pixel-input {
  font-family: var(--font-body);
  font-size: 16px;
  color: var(--text);
  background: var(--bg-inset);
  border: var(--border-w) solid var(--outline);
  border-radius: 0;
  padding: var(--space-3) var(--space-4);
  box-shadow: inset 4px 4px 0 0 rgba(0,0,0,.5), inset -4px -4px 0 0 rgba(255,255,255,.08);
}
.pixel-input:focus { outline: none; border-color: var(--yellow); }
```

### 4.3. Thanh tiến độ / XP bar (rất đặc trưng game)
- Khung ngoài: kiểu ô trũng (như input), cao 24px.
- Phần đầy: màu `--green` (hoặc `--yellow` cho XP), có vạch sáng 4px ở trên.
- **Chia thành các khối rời** (mỗi khối 8–12px, hở 2px) thay vì thanh liền, trông giống thanh máu trong game.
- Luôn kèm chữ số (`120 / 200 XP`) để dễ hiểu, không chỉ dựa vào màu.

### 4.4. Huy hiệu / Nhãn (Badge, Tag)
- Nhỏ, vuông, viền 3px, font pixel 8–10px, padding `4px 8px`.
- Màu theo ý nghĩa như bảng ở mục 3.3.

### 4.5. Hộp thoại (Modal / Dialog)
- Nền phủ: `rgba(0,0,0,.7)` **phẳng**, không blur.
- Hộp thoại: `.pixel-box`, có thanh tiêu đề, nút đóng (X) vuông ở góc phải trên.
- Nút ở cuối hộp: primary bên phải, secondary bên trái.
- Phải đóng được bằng phím `Esc`, và giữ focus trong hộp thoại.

### 4.6. Tab / Điều hướng
- Mỗi tab là một nút vuông. Tab đang chọn = "lún xuống" (không bóng, màu sáng/chính), tab còn lại = nổi lên (màu xám tối).
- Không dùng gạch chân mảnh. Trạng thái chọn phải **rõ bằng hình khối**, không chỉ bằng màu.

### 4.7. Checkbox / Radio / Toggle
- Checkbox: ô vuông 24×24px, viền 4px, dấu tick là pixel art (vẽ bằng `box-shadow` hoặc SVG pixel).
- Radio: cũng vuông hoặc "thoi" (xoay 45°). **Không dùng hình tròn mượt.**
- Toggle: khung chữ nhật, nút trượt vuông; bật = xanh lá, tắt = xám.

### 4.8. Thông báo (Toast / Alert)
- Dùng `.pixel-box` với màu nền theo ý nghĩa (xanh lá thành công, đỏ lỗi, vàng cảnh báo, xanh dương thông tin).
- Có icon pixel 16×16 bên trái + chữ ngắn gọn.

### 4.9. Thanh cuộn (Scrollbar) cho đồng bộ

```css
::-webkit-scrollbar { width: 16px; height: 16px; }
::-webkit-scrollbar-track { background: var(--bg-inset); border-left: 4px solid var(--outline); }
::-webkit-scrollbar-thumb { background: var(--gray); border: 4px solid var(--outline); }
::-webkit-scrollbar-thumb:hover { background: var(--gray-light); }
```

---

## 5. Góc "bậc thang" (tuỳ chọn, để trông giống pixel thật hơn)

Muốn khung có góc cắt kiểu pixel (thay vì góc vuông hoàn toàn), dùng `clip-path`:

```css
.pixel-corners {
  clip-path: polygon(
    0 4px, 4px 4px, 4px 0,
    calc(100% - 4px) 0, calc(100% - 4px) 4px, 100% 4px,
    100% calc(100% - 4px), calc(100% - 4px) calc(100% - 4px), calc(100% - 4px) 100%,
    4px 100%, 4px calc(100% - 4px), 0 calc(100% - 4px)
  );
}
```

> Lưu ý: `clip-path` sẽ cắt luôn `box-shadow` ngoài. Nếu dùng góc bậc thang thì
> phải bọc ngoài bằng một thẻ khác để tạo bóng (`filter: drop-shadow(4px 4px 0 var(--outline))`).
> Nếu thấy phức tạp, **cứ dùng góc vuông** (mặc định, đủ đẹp).

---

## 6. Ảnh, icon, hình minh hoạ

- Tất cả icon/hình trong giao diện: **pixel art**. Kích thước gốc nhỏ (16×16, 24×24, 32×32, 64×64) rồi phóng to theo **số nguyên** (×2, ×3, ×4). Không phóng số lẻ (làm nhoè pixel).
- Icon một màu thì dùng đúng bảng màu ở mục 1.
- Không dùng ảnh chụp thật, ảnh có gradient, hoặc icon bo tròn mềm (kiểu Material/Feather) trong giao diện.
- Nếu chưa có asset: dùng ký tự/emoji **tạm thời** và ghi chú `TODO: thay bằng pixel icon`.

---

## 7. Giọng điệu chữ (copywriting)

- Ngắn, vui, như đang chơi game: "Bắt đầu hành trình", "Nhận XP", "Mở khoá", "Tiếp tục".
- Nhãn nút là động từ rõ ràng. Tránh chữ dài trong nút.
- Vẫn phải **rõ nghĩa** trước, vui sau. Đừng đánh đổi sự dễ hiểu lấy sự "game".

---

## 8. Khả năng truy cập (bắt buộc)

- Tương phản chữ/nền tối thiểu **4.5:1** (chữ thường), **3:1** (chữ lớn, viền).
- Mọi nút và liên kết phải dùng bàn phím được và có `:focus-visible` rõ ràng (mục 3.2).
- Không truyền đạt thông tin **chỉ bằng màu**. Thêm icon/chữ.
- Vùng bấm tối thiểu **44×44px**.
- Dùng thẻ HTML đúng nghĩa: `<button>` cho nút, `<a>` cho liên kết, `<label>` cho input. **Không** dùng `<div onclick>`.
- Không dùng chữ pixel cỡ nhỏ hơn **8px**. Đoạn văn dài dùng `--font-body`, **không** dùng `Press Start 2P`.

---

## 9. Responsive

- Mobile trước. Giữ viền 4px và nút ≥ 44px trên mọi kích cỡ.
- Trên màn hình nhỏ có thể giảm `--shadow-offset` xuống 3px và font nút xuống 10px.
- Không để chữ pixel bị tràn khỏi nút: cho phép xuống dòng (`white-space: normal`) hoặc rút gọn nhãn.

---

## 10. Checklist trước khi nộp (agent tự kiểm tra)

- [ ] Không còn `border-radius` > 0 ở bất kỳ thành phần nào (trừ khi có lý do ghi chú).
- [ ] Không có `blur`, `gradient`, bóng mờ nào trong UI.
- [ ] Mọi màu lấy từ biến `--*` ở mục 1, không hard-code.
- [ ] Nút có đủ 4 trạng thái: normal, hover, active (lún xuống), disabled; và có `:focus-visible`.
- [ ] Tiêu đề/nút dùng font pixel; đoạn văn dài dùng font dễ đọc.
- [ ] Chữ tiếng Việt hiển thị đúng dấu (đã kiểm tra thực tế).
- [ ] Ảnh/icon là pixel art và có `image-rendering: pixelated`.
- [ ] Mỗi khu vực chỉ có tối đa 1 nút `primary`.
- [ ] Đạt các yêu cầu ở mục 8 (tương phản, bàn phím, vùng bấm).
- [ ] **Bố cục không bị copy từ Codédex**, chỉ giống phong cách thành phần.

---

## 11. Điều KHÔNG được làm

- ❌ Bo góc tròn, nút dạng "viên thuốc" (pill).
- ❌ Gradient, glow, glassmorphism, `backdrop-filter: blur`.
- ❌ Bóng đổ mờ (`box-shadow` có giá trị blur > 0).
- ❌ Animation mượt kiểu `ease-in-out` dài; hiệu ứng parallax nặng.
- ❌ Trộn nhiều phong cách (vừa pixel vừa Material/iOS).
- ❌ Dùng quá 1 màu nhấn chính trên cùng một màn hình.
- ❌ Dùng font pixel cho cả đoạn văn dài.
- ❌ Dùng tên thương hiệu, logo, hay asset có bản quyền của Minecraft/Codédex. Chỉ lấy **cảm hứng phong cách**, tự vẽ/tự tạo asset riêng.

---

## 12. Ghi chú cho người dùng/agent về nguồn

File này là bộ quy tắc **tự đúc kết** theo phong cách pixel/game của Codédex và Minecraft.
Các giá trị màu, cỡ viền, bóng là **giá trị khởi điểm hợp lý**, không phải trích nguyên từ CSS của Codédex.
Có thể chỉnh các biến ở mục 1 cho hợp thương hiệu dự án; **giữ nguyên các nguyên tắc ở mục 0, 2, 3**.
