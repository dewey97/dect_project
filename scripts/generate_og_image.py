import os
from PIL import Image, ImageDraw, ImageFont, ImageFilter, ImageEnhance
import numpy as np

W, H = 1200, 630

# 1. Base dark background with noir gradient
# Create a radial gradient from top-center (#1c1e27) to outer edges (#08080c)
x = np.linspace(-1, 1, W)
y = np.linspace(-1, 1, H)
xx, yy = np.meshgrid(x, y)
dist = np.sqrt(xx**2 + yy**2)
dist = np.clip(dist / 1.25, 0, 1)

# Gradient color interpolation
c_center = np.array([24, 26, 36])     # dark slate blue-gray
c_edge = np.array([8, 8, 12])         # deep obsidian noir

bg_arr = (1 - dist[:, :, None]) * c_center + dist[:, :, None] * c_edge
bg_img = Image.fromarray(bg_arr.astype(np.uint8), mode='RGB').convert('RGBA')

# 2. Add subtle background grid lines
grid_overlay = Image.new('RGBA', (W, H), (0, 0, 0, 0))
draw_grid = ImageDraw.Draw(grid_overlay)

# Grid spacing 60px
for gx in range(0, W, 60):
    draw_grid.line([(gx, 0), (gx, H)], fill=(255, 255, 255, 8), width=1)
for gy in range(0, H, 60):
    draw_grid.line([(0, gy), (W, gy)], fill=(255, 255, 255, 8), width=1)

# Subtle ambient glow behind right visual
glow = Image.new('RGBA', (W, H), (0, 0, 0, 0))
draw_glow = ImageDraw.Draw(glow)
draw_glow.ellipse([700, 80, 1200, 580], fill=(199, 145, 55, 22)) # amber glow
glow = glow.filter(ImageFilter.GaussianBlur(80))

canvas = Image.alpha_composite(bg_img, grid_overlay)
canvas = Image.alpha_composite(canvas, glow)

# 3. Fonts
font_bold = "C:/Windows/Fonts/segoeuib.ttf"
font_reg = "C:/Windows/Fonts/segoeui.ttf"
font_mono = "C:/Windows/Fonts/consola.ttf"

f_badge = ImageFont.truetype(font_mono, 15)
f_title = ImageFont.truetype(font_bold, 54)
f_subtitle = ImageFont.truetype(font_bold, 20)
f_desc = ImageFont.truetype(font_reg, 18)
f_tag = ImageFont.truetype(font_bold, 13)

# 4. Left Content Area (Branding & Copy)
# Badge pill: [ PHÂN LOẠI: TUYỆT MẬT // CHUYÊN ÁN #000 ]
bx, by = 75, 68
badge_text = "● CHUYÊN ÁN #000  //  HỒ SƠ ĐIỀU TRA ĐẶC BIỆT"
badge_bbox = f_badge.getbbox(badge_text)
bw = badge_bbox[2] - badge_bbox[0] + 28
bh = badge_bbox[3] - badge_bbox[1] + 16

badge_img = Image.new('RGBA', (bw, bh), (0, 0, 0, 0))
b_draw = ImageDraw.Draw(badge_img)
b_draw.rounded_rectangle([0, 0, bw - 1, bh - 1], radius=6, fill=(220, 38, 38, 35), outline=(220, 38, 38, 120), width=1)
b_draw.text((14, 7), badge_text, font=f_badge, fill=(248, 113, 113, 255))
canvas.alpha_composite(badge_img, (bx, by))

# Official Logo
logo_path = 'public/brand/logo.png'
if os.path.exists(logo_path):
    logo = Image.open(logo_path).convert('RGBA')
    # Resize to height ~64px
    lw, lh = logo.size
    target_lh = 60
    target_lw = int(round(lw * (target_lh / lh)))
    logo_scaled = logo.resize((target_lw, target_lh), Image.Resampling.LANCZOS)
    canvas.alpha_composite(logo_scaled, (bx, by + bh + 22))

# Main Title: TRỐN TÌM
tx = bx
ty = by + bh + 104
draw = ImageDraw.Draw(canvas)

draw.text((tx, ty), "TRỐN TÌM", font=f_title, fill=(255, 255, 255, 255))

# Subtitle line
sty = ty + 72
draw.text((tx, sty), "KHI SỰ THẬT BỊ CHÔN GIẤU SUỐT 20 NĂM", font=f_subtitle, fill=(199, 145, 55, 255))

# Thin divider line
dty = sty + 42
draw.line([(tx, dty), (tx + 540, dty)], fill=(255, 255, 255, 30), width=1)

# Description text
desc_y = dty + 20
draw.text((tx, desc_y), "Trò chơi trinh thám điều tra tương tác lai độc đáo.", font=f_desc, fill=(210, 215, 225, 240))
draw.text((tx, desc_y + 28), "Đối chiếu hồ sơ hiện vật giấy · Khai thác điện thoại số · Phá án trực tuyến.", font=f_desc, fill=(160, 168, 185, 220))

# 3 Feature Pills at Bottom
pills = [
    ("📁 HỒ SƠ PHÁP Y", (30, 41, 59, 230), (51, 65, 85, 255)),
    ("📱 ĐIỆN THOẠI NẠN NHÂN", (30, 41, 59, 230), (51, 65, 85, 255)),
    ("🌐 GIẢI MÃ TRỰC TUYẾN", (199, 145, 55, 40), (199, 145, 55, 180)),
]

cur_px = tx
py = desc_y + 85
for label, bg_col, border_col in pills:
    tbox = f_tag.getbbox(label)
    pw = tbox[2] - tbox[0] + 24
    ph = tbox[3] - tbox[1] + 16
    p_img = Image.new('RGBA', (pw, ph), (0, 0, 0, 0))
    p_draw = ImageDraw.Draw(p_img)
    p_draw.rounded_rectangle([0, 0, pw - 1, ph - 1], radius=ph//2, fill=bg_col, outline=border_col, width=1)
    p_draw.text((12, 7), label, font=f_tag, fill=(240, 242, 245, 255) if border_col[0] < 150 else (245, 195, 110, 255))
    canvas.alpha_composite(p_img, (cur_px, py))
    cur_px += pw + 12

# 5. Right Area: Forensic Poster & Victim Phone Collage
# Poster layer
poster_path = 'public/poster_c0.png'
if os.path.exists(poster_path):
    poster = Image.open(poster_path).convert('RGBA')
    # Resize poster to ~440px height
    pw_orig, ph_orig = poster.size
    p_h = 420
    p_w = int(round(pw_orig * (p_h / ph_orig)))
    poster_resized = poster.resize((p_w, p_h), Image.Resampling.LANCZOS)
    
    # Add a white photo border (like a real print/dossier)
    border_px = 8
    framed_poster = Image.new('RGBA', (p_w + border_px*2, p_h + border_px*2 + 18), (245, 243, 238, 255))
    framed_poster.paste(poster_resized, (border_px, border_px))
    
    # Add bottom label on white border
    f_stamp = ImageFont.truetype(font_mono, 10)
    fp_draw = ImageDraw.Draw(framed_poster)
    fp_draw.text((border_px + 4, p_h + border_px + 3), "EV-000 // CHUYÊN ÁN TRỐN TÌM", font=f_stamp, fill=(80, 80, 90, 255))
    
    # Rotate slightly -4 degrees
    rotated_poster = framed_poster.rotate(-4, expand=True, resample=Image.Resampling.BICUBIC)
    
    # Create soft shadow for poster
    p_shadow = Image.new('RGBA', rotated_poster.size, (0, 0, 0, 0))
    # Fill non-zero alpha with black
    p_arr = np.array(rotated_poster)
    p_alpha = p_arr[:, :, 3]
    p_shadow_alpha = (p_alpha.astype(float) * 0.55).astype(np.uint8)
    p_shadow_img = Image.fromarray(np.stack([np.zeros_like(p_alpha)]*3 + [p_shadow_alpha], axis=-1), mode='RGBA')
    p_shadow_img = p_shadow_img.filter(ImageFilter.GaussianBlur(16))
    
    poster_x, poster_y = 690, 85
    canvas.alpha_composite(p_shadow_img, (poster_x + 8, poster_y + 16))
    canvas.alpha_composite(rotated_poster, (poster_x, poster_y))

# Phone layer (overlapping in front of poster)
phone_path = 'public/images/cases/case_000/phone/victim_phone_node.png'
if os.path.exists(phone_path):
    phone = Image.open(phone_path).convert('RGBA')
    ph_w_orig, ph_h_orig = phone.size
    target_ph = 360
    target_pw = int(round(ph_w_orig * (target_ph / ph_h_orig)))
    phone_resized = phone.resize((target_pw, target_ph), Image.Resampling.LANCZOS)
    
    # Rotate slightly +5 degrees
    rotated_phone = phone_resized.rotate(5, expand=True, resample=Image.Resampling.BICUBIC)
    
    # Create drop shadow
    ph_arr = np.array(rotated_phone)
    ph_alpha = ph_arr[:, :, 3]
    ph_shadow_alpha = (ph_alpha.astype(float) * 0.70).astype(np.uint8)
    ph_shadow_img = Image.fromarray(np.stack([np.zeros_like(ph_alpha)]*3 + [ph_shadow_alpha], axis=-1), mode='RGBA')
    ph_shadow_img = ph_shadow_img.filter(ImageFilter.GaussianBlur(18))
    
    phone_x, phone_y = 905, 160
    canvas.alpha_composite(ph_shadow_img, (phone_x + 6, phone_y + 14))
    canvas.alpha_composite(rotated_phone, (phone_x, phone_y))

# 6. Top Corner Noir Markers & Border
draw_final = ImageDraw.Draw(canvas)

# Frame border
draw_final.rectangle([16, 16, W - 17, H - 17], outline=(255, 255, 255, 22), width=1)

# Corner crosshairs
def draw_corner(cx, cy):
    sz = 8
    draw_final.line([(cx - sz, cy), (cx + sz, cy)], fill=(255, 255, 255, 60), width=1)
    draw_final.line([(cx, cy - sz), (cx, cy + sz)], fill=(255, 255, 255, 60), width=1)

draw_corner(28, 28)
draw_corner(W - 28, 28)
draw_corner(28, H - 28)
draw_corner(W - 28, H - 28)

# Output destinations
os.makedirs('public/brand', exist_ok=True)
os.makedirs('public', exist_ok=True)

final_img = canvas.convert('RGB')
final_img.save('public/brand/og-image.jpg', quality=92, optimize=True)
canvas.save('public/brand/og-image.png', optimize=True)
canvas.save('public/og-image.png', optimize=True)

print(f"Generated OG Image successfully! Size: {W}x{H}")
print(f"JPG size: {os.path.getsize('public/brand/og-image.jpg') / 1024:.1f} KB")
print(f"PNG size: {os.path.getsize('public/brand/og-image.png') / 1024:.1f} KB")
