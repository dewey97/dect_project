import os
import math
import random
from PIL import Image, ImageDraw, ImageFilter, ImageFont

SOURCE_DIR = r"d:\code_world\dect_project\docs\cases\case_000\04_photos"
OUTPUT_DIR = r"d:\code_world\dect_project\public\images\cases\case_000\pinned_photos_with_tape"
ARTIFACT_DIR = r"C:\Users\Dell\.gemini\antigravity\brain\6dec1bcd-bdae-4bc7-9a7e-722029b75aa6"

os.makedirs(OUTPUT_DIR, exist_ok=True)
os.makedirs(ARTIFACT_DIR, exist_ok=True)

# ALL PUSH PINS YELLOW with natural slight diagonal card tilts (-4.5° to +4.5°)
YELLOW_PIN = (235, 185, 20)

TARGETS = [
    {"file": "avata_khang.png", "name": "khang",   "label": "NGUYỄN VĂN KHANG", "angle": -4.0, "pin_tilt": -12},
    {"file": "Ảnh_Hà.png",      "name": "ha",      "label": "TRẦN THỊ HÀ",     "angle": 3.5,  "pin_tilt": 10},
    {"file": "Ảnh_Tùng.png",    "name": "tung",    "label": "NGUYỄN THANH TÙNG","angle": -2.5, "pin_tilt": -8},
    {"file": "Ảnh_Vũ.png",      "name": "vu",      "label": "LÊ QUANG VŨ",      "angle": 3.0,  "pin_tilt": 14},
    {"file": "Ảnh_Mai.png",     "name": "mai",     "label": "NGUYỄN NGỌC MAI",  "angle": -3.5, "pin_tilt": -10},
    {"file": "Ảnh_Vy.png",      "name": "vy",      "label": "THẢO VY",          "angle": 2.5,  "pin_tilt": 8},
    {"file": "Ảnh_Bà_Lụa.png",  "name": "ba_lua",  "label": "BÀ NGUYỄN THỊ LỤA","angle": -3.0, "pin_tilt": -12},
    {"file": "Ảnh_Đạt_Gà.png",  "name": "dat_ga",  "label": "TRẦN VĂN ĐẠT",    "angle": 4.0,  "pin_tilt": 12},
]

def draw_yellow_pushpin_angled(draw, cx, cy, radius=9, tilt_deg=10):
    """Draws a rich 3D yellow pushpin inserted at a slight diagonal angle."""
    # Convert tilt to radians for directional lighting and shadow offset
    rad = math.radians(tilt_deg)
    sin_t = math.sin(rad)
    cos_t = math.cos(rad)
    
    # Cast shadow of the pin body onto the photo/card (offset downwards & towards tilt direction)
    shadow_ox = int(sin_t * 6)
    shadow_oy = int(cos_t * 5 + 3)
    shadow_box = [cx - radius + shadow_ox, cy - radius + shadow_oy, cx + radius + shadow_ox, cy + radius + shadow_oy + 2]
    draw.ellipse(shadow_box, fill=(10, 10, 15, 140))
    
    # Yellow Color Palette
    base_dark = (160, 115, 5, 255)       # Dark gold rim
    body_yellow = (245, 195, 15, 255)     # Vibrant yellow plastic
    hi_yellow = (255, 235, 110, 255)      # Top dome yellow highlight
    white_spec = (255, 255, 240, 245)     # Specular glint
    
    # Outer base rim (angled slightly)
    base_ox = int(sin_t * 2)
    base_oy = int(cos_t * 1)
    draw.ellipse([cx - radius, cy - radius, cx + radius, cy + radius], fill=base_dark)
    
    # Main pin dome (shifted towards tilt)
    dome_r = radius - 2
    dcx = cx + base_ox
    dcy = cy - base_oy
    draw.ellipse([dcx - dome_r, dcy - dome_r, dcx + dome_r, dcy + dome_r], fill=body_yellow)
    
    # Inner gradient / top cap highlight
    cap_r = dome_r - 2
    hcx = dcx - int(sin_t * 1)
    hcy = dcy - 2
    draw.ellipse([hcx - cap_r, hcy - cap_r + 1, hcx + cap_r, hcy + cap_r - 1], fill=hi_yellow)
    
    # Specular glint (light reflection from top spotlight)
    glint_x = hcx - 2
    glint_y = hcy - 2
    draw.ellipse([glint_x - 2, glint_y - 2, glint_x + 2, glint_y + 1], fill=white_spec)

def generate_torn_tape_polygon(x_left, x_right, y_top, y_bottom, seed=42):
    rng = random.Random(seed)
    points = []
    
    # Top edge
    steps_x = 12
    for i in range(steps_x + 1):
        t = i / steps_x
        x = x_left + (x_right - x_left) * t
        y = y_top + rng.uniform(-0.6, 0.6)
        points.append((x, y))
        
    # Right torn edge (jagged paper fiber tear)
    steps_y = 9
    for i in range(1, steps_y + 1):
        t = i / steps_y
        y = y_top + (y_bottom - y_top) * t
        offset = (6 if i % 2 == 1 else -5) + rng.uniform(-2.5, 2.5)
        x = x_right + offset
        points.append((x, y))
        
    # Bottom edge
    for i in range(steps_x - 1, -1, -1):
        t = i / steps_x
        x = x_left + (x_right - x_left) * t
        y = y_bottom + rng.uniform(-0.6, 0.6)
        points.append((x, y))
        
    # Left torn edge
    for i in range(steps_y - 1, 0, -1):
        t = i / steps_y
        y = y_top + (y_bottom - y_top) * t
        offset = (-6 if i % 2 == 1 else 5) + rng.uniform(-2.5, 2.5)
        x = x_left + offset
        points.append((x, y))
        
    return points

def create_pinned_card_with_torn_tape(img_path, item, idx):
    raw_img = Image.open(img_path).convert("RGBA")
    
    target_w, target_h = 300, 380
    photo = raw_img.resize((target_w, target_h), Image.Resampling.LANCZOS)
    
    pad_top = 18
    pad_side = 14
    pad_bottom = 54
    
    card_w = target_w + pad_side * 2
    card_h = target_h + pad_top + pad_bottom
    
    # Beige Masking Tape dimensions
    tape_overhang = 26
    tape_h = 52
    tape_y1 = pad_top + target_h - 16
    tape_y2 = tape_y1 + tape_h
    
    tape_x1 = pad_side - tape_overhang
    tape_x2 = card_w - pad_side + tape_overhang
    
    # 1. Base card image
    card = Image.new("RGBA", (card_w, card_h), (0, 0, 0, 0))
    card_draw = ImageDraw.Draw(card)
    
    # Clean off-white polaroid card
    paper_color = (248, 247, 243, 255)
    card_draw.rectangle([0, 0, card_w - 1, card_h - 1], fill=paper_color)
    card_draw.rectangle([0, 0, card_w - 1, card_h - 1], outline=(210, 205, 195, 200), width=1)
    
    card.paste(photo, (pad_side, pad_top), photo if photo.mode == 'RGBA' else None)
    
    # Add YELLOW PUSHPIN AT SLIGHT DIAGONAL TILT
    pin_cx = card_w // 2
    pin_cy = pad_top // 2 + 1
    draw_yellow_pushpin_angled(card_draw, pin_cx, pin_cy, radius=9, tilt_deg=item["pin_tilt"])
    
    # 2. Canvas for shadows and overhanging tape
    margin = 80
    canvas_w = card_w + margin * 2
    canvas_h = card_h + margin * 2
    
    # Shadow layer
    shadow_layer = Image.new("RGBA", (canvas_w, canvas_h), (0, 0, 0, 0))
    shadow_draw = ImageDraw.Draw(shadow_layer)
    
    # Card shadow
    shadow_offset_y = 10
    shadow_box = [
        margin,
        margin + shadow_offset_y,
        margin + card_w,
        margin + card_h + shadow_offset_y
    ]
    shadow_draw.rectangle(shadow_box, fill=(0, 0, 0, 130))
    
    # Tape polygon points
    tape_pts_canvas = generate_torn_tape_polygon(
        margin + tape_x1, margin + tape_x2,
        margin + tape_y1, margin + tape_y2,
        seed=150 + idx * 23
    )
    tape_shadow_pts = [(x, y + 6) for x, y in tape_pts_canvas]
    shadow_draw.polygon(tape_shadow_pts, fill=(0, 0, 0, 70))
    
    # Blur shadows
    shadow_layer = shadow_layer.filter(ImageFilter.GaussianBlur(radius=8))
    
    # Content layer
    content_layer = Image.new("RGBA", (canvas_w, canvas_h), (0, 0, 0, 0))
    content_layer.paste(card, (margin, margin))
    
    # 3. Beige Paper Masking Tape Layer
    tape_overlay = Image.new("RGBA", (canvas_w, canvas_h), (0, 0, 0, 0))
    tape_draw = ImageDraw.Draw(tape_overlay)
    
    tape_body_color = (235, 218, 185, 242)
    tape_draw.polygon(tape_pts_canvas, fill=tape_body_color)
    
    tape_edge_color = (210, 192, 160, 200)
    tape_draw.polygon(tape_pts_canvas, outline=tape_edge_color, width=1)
    
    rng = random.Random(200 + idx)
    for _ in range(8):
        fy = margin + tape_y1 + rng.randint(4, tape_h - 4)
        fx1 = margin + tape_x1 + rng.randint(5, 30)
        fx2 = margin + tape_x2 - rng.randint(5, 30)
        tape_draw.line([(fx1, fy), (fx2, fy)], fill=(245, 230, 205, 110), width=1)
    
    # 4. BIGGER, BOLD TEXT
    try:
        font_main = ImageFont.truetype(r"C:\Windows\Fonts\arialbd.ttf", 25)
    except Exception:
        font_main = ImageFont.load_default()
        
    text_bbox = tape_draw.textbbox((0, 0), item["label"], font=font_main)
    tw = text_bbox[2] - text_bbox[0]
    th = text_bbox[3] - text_bbox[1]
    
    tx = margin + (card_w - tw) // 2
    ty = margin + tape_y1 + (tape_h - th) // 2 - 2
    
    ink_color = (22, 24, 30, 250)
    tape_draw.text((tx, ty), item["label"], font=font_main, fill=ink_color)
    
    # Merge card + tape
    content_with_tape = Image.alpha_composite(content_layer, tape_overlay)
    
    # Merge with shadow
    merged = Image.alpha_composite(shadow_layer, content_with_tape)
    
    # Rotate by slight natural angle
    rotated = merged.rotate(item["angle"], resample=Image.Resampling.BICUBIC, expand=True)
    
    # Crop transparent bounding box tightly
    bbox = rotated.getbbox()
    if bbox:
        pad = 6
        crop_box = (
            max(0, bbox[0] - pad),
            max(0, bbox[1] - pad),
            min(rotated.width, bbox[2] + pad),
            min(rotated.height, bbox[3] + pad)
        )
        rotated = rotated.crop(crop_box)
        
    return rotated

def main():
    processed_images = []
    
    for idx, item in enumerate(TARGETS):
        src_path = os.path.join(SOURCE_DIR, item["file"])
        if not os.path.exists(src_path):
            continue
            
        print(f"Processing with yellow pin: {item['name']}...")
        pinned_img = create_pinned_card_with_torn_tape(src_path, item, idx)
        
        out_filename = f"pinned_tape_{item['name']}.png"
        out_path = os.path.join(OUTPUT_DIR, out_filename)
        pinned_img.save(out_path, format="PNG")
        
        artifact_img_path = os.path.join(ARTIFACT_DIR, out_filename)
        pinned_img.save(artifact_img_path, format="PNG")
        
        processed_images.append((item["name"], pinned_img))
        
    print(f"Generated {len(processed_images)} photos with yellow pins and beige tape successfully!")
    
    cols = 4
    rows = 2
    cell_w = 430
    cell_h = 520
    grid_img = Image.new("RGBA", (cols * cell_w, rows * cell_h), (40, 40, 46, 255))
    
    for idx, (name, p_img) in enumerate(processed_images):
        r = idx // cols
        c = idx % cols
        x = c * cell_w + (cell_w - p_img.width) // 2
        y = r * cell_h + (cell_h - p_img.height) // 2
        grid_img.paste(p_img, (x, y), p_img)
        
    overview_path = os.path.join(OUTPUT_DIR, "all_pinned_tape_overview.png")
    grid_img.save(overview_path, format="PNG")
    grid_img.save(os.path.join(ARTIFACT_DIR, "all_pinned_tape_overview.png"), format="PNG")
    print("Saved yellow pin overview grid.")

if __name__ == "__main__":
    main()
