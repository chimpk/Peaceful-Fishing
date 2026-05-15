# Nâng Cấp Toàn Bộ Model Cá – Tả Thực Chi Tiết Cao

## Mô Tả

Cải tạo **toàn bộ** các file model cá để mỗi loài có hình dạng giải phẫu chính xác, shading đa lớp, texture đặc trưng và chuyển động sống động—thay thế các hình khối đơn giản bằng rendering cao cấp, bắt mắt.

---

## Phạm Vi Thay Đổi

### 1. `SharkModels.ts` — 3 loài
| Loài | Cải tiến chính |
|------|---------------|
| **Cá Mập Trắng** (`drawShark`) | Body torpedo 3D với counter-shading trắng bụng–xám lưng chính xác; gill slits 5 khe sâu; răng nanh trên/dưới; mắt đen tuyền với nội bào xanh lam; vây lưng tam giác dựng; pectoral fins hình cánh dài; đuôi dị hướng (heterocercal) mạnh mẽ |
| **Cá Mập Đầu Búa** (`drawHammerhead`) | Cephalophoil (đầu búa) T-shape chính xác với mắt nằm 2 đầu cánh; vây lưng cao; body màu xám đen đặc trưng |
| **Cá Kiếm / Cá Buồm** (`drawSwordfish`) | Rostrum (mõm kiếm) có metallic gradient; vây lưng cao như cánh buồm; body hình đầu đạn metallic xanh dương–bạc; lunate tail nhanh |

### 2. `ClassicModels.ts` — 4 loài
| Loài | Cải tiến chính |
|------|---------------|
| **Cá Thường** (`drawClassicFish`) | Scale pattern brickwork 2 lớp; operculum gill cover rõ ràng; lateral line đặc trưng; dorsal fin rayed đẹp; màu gradient đúng loài |
| **Cá Trê** (`drawCatfish`) | Đầu phẳng rộng đặc trưng; 4 cặp barbel/râu mềm mại; da mottled; adipose fin nhỏ sau lưng; bụng trắng nhạt |
| **Cá Lóc** (`drawSnakehead`) | Đầu rắn dẹp với jaw rộng; vảy hexagonal pattern đặc trưng; dorsal fin chạy dọc; caudal fin tròn |
| **Cá Chình/Lươn** (`drawEel`) | Thân ruy băng sinuous với S-wave movement; ribbon fin liên tục; gradient marbling; head blunt |

### 3. `UniqueModels.ts` — Các loài chủ lực cần nâng cấp
| Loài | Cải tiến chính |
|------|---------------|
| **Cá Đuối** (`drawRay`) | Wing flap 3D organic với texture spot; dermal denticles; spiracle trên lưng; đuôi barbed |
| **Cá Mặt Trăng** (`drawSunfish`) | Da thô clavus texture scalloped edge; ossified leathery skin; tiny pectoral fin; puckered mouth |
| **Cá Ngựa** (`drawSeahorse`) | Coronet thật; bony ring segments khớp nối; prehensile tail xoắn; dorsal fin vibration |
| **Cá Rồng** (`drawDragon`) | Scales iridescent multi-color; mane flowing gradient; antlers golden glow; whiskers dynamic |
| **Cá Sát Thủ/Orca** (`drawOrca`) | White patch saddle + eye patch chính xác; tall dorsal fin straight; powerful fluke; rounded head |
| **Cá Mao Tiên** (`drawLionfish`) | Venomous spines với membrane nối; zebra stripes đỏ-trắng; pectoral fins wing-like |
| **Cá Bay** (`drawFlyingFish`) | Enlarged pectoral fins như cánh; body metallic; tail forked |
| **Cá Nóc** (`drawPufferFish`) | Inflated sphere khi struggling; spines dựng lên; spots circles trên da |
| **Cá Đèn Lồng** (`drawAnglerFish`) | Esca (lure) phát sáng bioluminescent; huge jaw; tiny eyes; deep-sea black gradient |

### 4. `BossModels.ts` — Boss enemies
| Boss | Cải tiến chính |
|------|---------------|
| **Kraken** | Tentacles thicker với gradient; suckers 3D; mantle texture chromatic; glowing pupils |
| **Mecha Shark** | Armor plating rivets; thruster flame animation; laser eye; jaw teeth metallic |
| **Ghost Octopus** | Translucent body layers; spectral tendrils neon glow; ectoplasm drip |

---

## Thứ Tự Thực Hiện

1. `SharkModels.ts` — Toàn bộ 3 loài
2. `ClassicModels.ts` — Toàn bộ 4 loài  
3. `UniqueModels.ts` — Các loài ưu tiên cao (Orca, Lionfish, Ray, Anglerfish, Pufferfish)
4. `BossModels.ts` — Tất cả 3 boss

## Kỹ Thuật Rendering

- **Multi-stop gradient**: Minimum 4 color stops cho body shading
- **Radial + Linear kết hợp**: Tạo cảm giác 3D sphere lighting
- **Bezier anatomy**: Mọi vây, đuôi đều dùng bezier curves chính xác
- **Clipping path scales**: Scale pattern được clip vào body shape
- **Shadow casting**: ctx.shadowBlur cho depth cảm giác nước
- **Animated details**: Gill flap, fin micro-animation, breathing pulse

## Xác Minh

- Build TypeScript không lỗi
- Mỗi model hiển thị đúng trong game
- Không có placeholders hay geometric shapes đơn giản
