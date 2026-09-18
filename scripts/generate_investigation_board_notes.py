import os
import numpy as np
from PIL import Image, ImageDraw, ImageFont, ImageFilter

FONT_DIR = r"d:\code_world\dect_project\public\fonts"
NOTES_DIR = r"d:\code_world\dect_project\public\images\cases\case_000\clue_notes\rendered_notes"
FONT_PATH = os.path.join(FONT_DIR, "PatrickHand-Regular.ttf")

TARGET_YELLOW_RGB = np.array([232.0, 188.0, 15.0])
TARGET_WHITE_RGB = (247, 244, 238)

os.makedirs(NOTES_DIR, exist_ok=True)

def generate_perfect_yellow_note(img_path, text, font_size=82, offset_y=-10):
    im = Image.open(img_path).convert("RGBA")
    arr = np.array(im, dtype=float)
    rgb = arr[:, :, :3]
    alpha = arr[:, :, 3]
    h, w = alpha.shape
    
    is_paper = alpha > 230
    lum = 0.299 * rgb[:, :, 0] + 0.587 * rgb[:, :, 1] + 0.114 * rgb[:, :, 2]
    
    clean_samples = is_paper & (
        (np.arange(h)[:, None] < int(h * 0.20)) |
        (np.arange(h)[:, None] > int(h * 0.84)) |
        (np.arange(w)[None, :] < int(w * 0.14)) |
        (np.arange(w)[None, :] > int(w * 0.86))
    ) & (rgb[:, :, 0] > 140)
    
    y_coords, x_coords = np.mgrid[0:h, 0:w]
    train_y = y_coords[clean_samples] / h
    train_x = x_coords[clean_samples] / w
    
    A = np.column_stack([
        np.ones_like(train_x),
        train_x, train_y,
        train_x**2, train_y**2,
        train_x * train_y,
        train_x**3, train_y**3,
    ])
    
    grid_x = (x_coords / w).ravel()
    grid_y = (y_coords / h).ravel()
    A_full = np.column_stack([
        np.ones(h * w),
        grid_x, grid_y,
        grid_x**2, grid_y**2,
        grid_x * grid_y,
        grid_x**3, grid_y**3,
    ])
    
    train_lum = lum[clean_samples]
    coeffs, _, _, _ = np.linalg.lstsq(A, train_lum, rcond=None)
    pred_lum = A_full.dot(coeffs).reshape((h, w))
    
    median_pred_lum = np.median(pred_lum[is_paper])
    shading_factor = np.clip(pred_lum / (median_pred_lum + 1e-5), 0.86, 1.14)
    
    paper_rgb = TARGET_YELLOW_RGB[None, None, :] * shading_factor[:, :, None]
    
    final_rgb = rgb.copy()
    final_rgb[is_paper] = paper_rgb[is_paper]
    
    out_im = Image.fromarray(np.clip(final_rgb, 0, 255).astype(np.uint8))
    out_im.putalpha(Image.fromarray(alpha.astype(np.uint8)))
    
    draw = ImageDraw.Draw(out_im)
    font = ImageFont.truetype(FONT_PATH, font_size)
    
    cx = w / 2
    cy = h * 0.50 + offset_y
    lines = text.split("\n")
    line_bboxes = [font.getbbox(l) for l in lines]
    line_heights = [b[3] - b[1] for b in line_bboxes]
    line_spacing = 1.12
    total_height = sum(line_heights) + (len(lines) - 1) * (font_size * (line_spacing - 1))
    
    cur_y = cy - total_height / 2
    ink_color = (20, 18, 15, 255)
    
    for l, bbox, lh in zip(lines, line_bboxes, line_heights):
        lw = bbox[2] - bbox[0]
        lx = cx - lw / 2 - bbox[0]
        draw.text(
            (lx, cur_y - bbox[1]),
            l,
            font=font,
            fill=ink_color,
            stroke_width=2,
            stroke_fill=ink_color,
        )
        cur_y += lh + font_size * (line_spacing - 1)
        
    return out_im

def create_dossier_white_note(width, height, header_text, body_text, font_size=82, offset_y=20, curl_type="left"):
    pad_x, pad_y = 36, 45
    cw = width + pad_x * 2
    ch = height + pad_y * 2
    
    paper = Image.new("RGBA", (width, height), (0, 0, 0, 0))
    p_draw = ImageDraw.Draw(paper)
    
    for y in range(height):
        grad = 1.015 - 0.035 * (y / height)
        r = int(TARGET_WHITE_RGB[0] * grad)
        g = int(TARGET_WHITE_RGB[1] * grad)
        b = int(TARGET_WHITE_RGB[2] * grad)
        p_draw.line([(0, y), (width, y)], fill=(r, g, b, 255))
        
    p_draw.rectangle([0, 0, width - 1, height - 1], outline=(218, 214, 206, 255), width=1)
    
    arr = np.array(paper, dtype=float)
    noise = np.random.normal(0, 0.7, (height, width, 3))
    arr[:, :, :3] = np.clip(arr[:, :, :3] + noise, 0, 255)
    paper = Image.fromarray(arr.astype(np.uint8))
    p_draw = ImageDraw.Draw(paper)
    
    try:
        header_font = ImageFont.truetype("C:/Windows/Fonts/segoeuib.ttf", 20)
    except:
        header_font = ImageFont.truetype("C:/Windows/Fonts/arialbd.ttf", 20)
        
    p_draw.text((45, 34), header_text, font=header_font, fill=(110, 105, 98, 240))
    p_draw.line([(45, 70), (width - 45, 70)], fill=(120, 115, 108, 240), width=2)
    p_draw.line([(45, 74), (width - 45, 74)], fill=(150, 145, 138, 200), width=1)
    
    num_lines = 10
    start_y = 135
    end_y = height - 65
    line_spacing = (end_y - start_y) / (num_lines - 1)
    line_color = (195, 190, 182, 210)
    
    for i in range(num_lines):
        ly = int(start_y + i * line_spacing)
        p_draw.line([(45, ly), (width - 45, ly)], fill=line_color, width=1)
        
    font = ImageFont.truetype(FONT_PATH, font_size)
    cx = width / 2
    cy = height * 0.52 + offset_y
    lines = body_text.split("\n")
    line_bboxes = [font.getbbox(l) for l in lines]
    line_heights = [b[3] - b[1] for b in line_bboxes]
    line_spacing_f = 1.12
    total_height = sum(line_heights) + (len(lines) - 1) * (font_size * (line_spacing_f - 1))
    
    cur_y = cy - total_height / 2
    ink_color = (20, 18, 15, 255)
    
    for l, bbox, lh in zip(lines, line_bboxes, line_heights):
        lw = bbox[2] - bbox[0]
        lx = cx - lw / 2 - bbox[0]
        p_draw.text(
            (lx, cur_y - bbox[1]),
            l,
            font=font,
            fill=ink_color,
            stroke_width=2,
            stroke_fill=ink_color,
        )
        cur_y += lh + font_size * (line_spacing_f - 1)
        
    shadow = Image.new("RGBA", (cw, ch), (0, 0, 0, 0))
    s_draw = ImageDraw.Draw(shadow)
    s_draw.rectangle([pad_x, pad_y + 10, pad_x + width, pad_y + height + 10], fill=(0, 0, 0, 110))
    if curl_type == "left":
        s_draw.polygon([(pad_x, pad_y + height - 25), (pad_x + 190, pad_y + height + 18), (pad_x, pad_y + height + 28)], fill=(0, 0, 0, 130))
    elif curl_type == "right":
        s_draw.polygon([(pad_x + width - 190, pad_y + height + 18), (pad_x + width, pad_y + height - 25), (pad_x + width, pad_y + height + 28)], fill=(0, 0, 0, 130))
        
    shadow = shadow.filter(ImageFilter.GaussianBlur(radius=10))
    
    canvas = Image.new("RGBA", (cw, ch), (0, 0, 0, 0))
    canvas.alpha_composite(shadow)
    canvas.alpha_composite(paper, (pad_x, pad_y))
    return canvas

def main():
    img_bo_sung = generate_perfect_yellow_note(os.path.join(NOTES_DIR, "note_bo_sung_chung_cu.png"), "Bổ sung\nchứng cứ", font_size=80, offset_y=-10)
    img_nghi_pham = generate_perfect_yellow_note(os.path.join(NOTES_DIR, "note_nghi_pham.png"), "Nghi phạm", font_size=88, offset_y=-8)
    img_nghi_van = generate_perfect_yellow_note(os.path.join(NOTES_DIR, "note_cau_hoi_tung.png"), "Nghi vấn", font_size=92, offset_y=-8)
    img_nghi_van_vu = generate_perfect_yellow_note(os.path.join(NOTES_DIR, "note_cau_hoi_vu.png"), "Nghi vấn", font_size=92, offset_y=-8)
    img_nghi_van_ha = generate_perfect_yellow_note(os.path.join(NOTES_DIR, "note_cau_hoi_ha.png"), "Nghi vấn", font_size=92, offset_y=-8)

    img_mo_rong = create_dossier_white_note(640, 680, "MEMO // TRÍCH LỤC THÔNG TIN", "Mở rộng\nđiều tra", font_size=86, offset_y=15, curl_type="flat")
    img_kham_xet = create_dossier_white_note(640, 680, "HỒ SƠ VỤ ÁN #000 // BIÊN BẢN ĐIỀU TRA", "Khám xét lại", font_size=88, offset_y=15, curl_type="left")
    img_ket_luan = create_dossier_white_note(640, 680, "HỒ SƠ VỤ ÁN #000 // BIÊN BẢN ĐIỀU TRA", "Bản kết luận\nđiều tra", font_size=82, offset_y=15, curl_type="right")

    img_bo_sung.save(os.path.join(NOTES_DIR, "note_bo_sung_chung_cu.png"))
    img_nghi_pham.save(os.path.join(NOTES_DIR, "note_nghi_pham.png"))
    img_nghi_van.save(os.path.join(NOTES_DIR, "note_nghi_van.png"))
    img_nghi_van.save(os.path.join(NOTES_DIR, "note_cau_hoi_tung.png"))
    img_nghi_van_vu.save(os.path.join(NOTES_DIR, "note_cau_hoi_vu.png"))
    img_nghi_van_ha.save(os.path.join(NOTES_DIR, "note_cau_hoi_ha.png"))

    img_mo_rong.save(os.path.join(NOTES_DIR, "note_mo_rong_dieu_tra.png"))
    img_kham_xet.save(os.path.join(NOTES_DIR, "note_kham_xet_lai.png"))
    img_ket_luan.save(os.path.join(NOTES_DIR, "note_ket_luan_dieu_tra.png"))

    print("All 8 investigation notes generated and synchronized successfully!")

if __name__ == "__main__":
    main()
