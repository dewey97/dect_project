import os
import math
from PIL import Image, ImageDraw, ImageFilter

SOURCE_DIR = r"d:\code_world\dect_project\docs\cases\case_000\04_photos"
OUTPUT_DIR = r"d:\code_world\dect_project\public\images\cases\case_000\pinned_photos"
ARTIFACT_DIR = r"C:\Users\Dell\.gemini\antigravity\brain\6dec1bcd-bdae-4bc7-9a7e-722029b75aa6"

os.makedirs(OUTPUT_DIR, exist_ok=True)
os.makedirs(ARTIFACT_DIR, exist_ok=True)

# 8 target photo files and their customized subtle angles & pin colors
TARGETS = [
    {"file": "avata_khang.png", "name": "khang",   "angle": -3.5, "pin_color": (220, 50, 50)},    # Red pin
    {"file": "Ảnh_Hà.png",      "name": "ha",      "angle": 3.0,  "pin_color": (30, 120, 230)},  # Blue pin
    {"file": "Ảnh_Tùng.png",    "name": "tung",    "angle": -2.0, "pin_color": (230, 180, 20)},  # Yellow pin
    {"file": "Ảnh_Vũ.png",      "name": "vu",      "angle": 2.5,  "pin_color": (220, 50, 50)},    # Red pin
    {"file": "Ảnh_Mai.png",     "name": "mai",     "angle": -3.0, "pin_color": (30, 120, 230)},  # Blue pin
    {"file": "Ảnh_Vy.png",      "name": "vy",      "angle": 2.0,  "pin_color": (230, 180, 20)},  # Yellow pin
    {"file": "Ảnh_Bà_Lụa.png",  "name": "ba_lua",  "angle": -2.5, "pin_color": (220, 50, 50)},    # Red pin
    {"file": "Ảnh_Đạt_Gà.png",  "name": "dat_ga",  "angle": 3.5,  "pin_color": (30, 120, 230)},  # Blue pin
]

def draw_pushpin(draw, cx, cy, radius, color):
    # Outer dark shadow of the pin
    shadow_color = (10, 10, 15, 140)
    draw.ellipse([cx - radius + 1, cy - radius + 3, cx + radius + 1, cy + radius + 5], fill=shadow_color)
    
    # Pin head base
    r, g, b = color
    base_color = (max(0, r - 50), max(0, g - 50), max(0, b - 50), 255)
    main_color = (r, g, b, 255)
    hi_color = (min(255, r + 70), min(255, g + 70), min(255, b + 70), 255)
    
    # Outer ring
    draw.ellipse([cx - radius, cy - radius, cx + radius, cy + radius], fill=base_color)
    # Inner body
    draw.ellipse([cx - radius + 2, cy - radius + 2, cx + radius - 2, cy + radius - 2], fill=main_color)
    # Highlight dot (specular reflection from top spotlight)
    draw.ellipse([cx - radius // 3, cy - radius // 2, cx + radius // 3, cy - radius // 6], fill=hi_color)
    draw.ellipse([cx - 2, cy - radius // 3, cx + 2, cy - radius // 3 + 3], fill=(255, 255, 255, 240))

def create_pinned_card(img_path, angle, pin_color):
    raw_img = Image.open(img_path).convert("RGBA")
    
    # Standardize photo size (width = 300, height = 380)
    target_w, target_h = 300, 380
    photo = raw_img.resize((target_w, target_h), Image.Resampling.LANCZOS)
    
    # Border margins (Polaroid style: top 16, left/right 14, bottom 34)
    pad_top = 16
    pad_side = 14
    pad_bottom = 34
    
    card_w = target_w + pad_side * 2
    card_h = target_h + pad_top + pad_bottom
    
    # Create card background (off-white paper with subtle warm tone)
    card = Image.new("RGBA", (card_w, card_h), (0, 0, 0, 0))
    card_draw = ImageDraw.Draw(card)
    
    # Draw photo paper rectangle
    paper_color = (248, 247, 243, 255)
    card_draw.rectangle([0, 0, card_w - 1, card_h - 1], fill=paper_color)
    
    # Subtle vintage inner border/crease
    card_draw.rectangle([0, 0, card_w - 1, card_h - 1], outline=(210, 205, 195, 200), width=1)
    
    # Paste the exact photo
    card.paste(photo, (pad_side, pad_top), photo if photo.mode == 'RGBA' else None)
    
    # Add pushpin at top center
    pin_cx = card_w // 2
    pin_cy = pad_top // 2 + 1
    draw_pushpin(card_draw, pin_cx, pin_cy, radius=8, color=pin_color)
    
    # Add drop shadow
    margin = 70
    canvas_w = card_w + margin * 2
    canvas_h = card_h + margin * 2
    
    # Base shadow layer
    shadow_layer = Image.new("RGBA", (canvas_w, canvas_h), (0, 0, 0, 0))
    shadow_draw = ImageDraw.Draw(shadow_layer)
    
    # Shadow offset (top-down spotlight creates downward shadow)
    shadow_offset_y = 10
    shadow_offset_x = 0
    
    shadow_box = [
        margin + shadow_offset_x,
        margin + shadow_offset_y,
        margin + card_w + shadow_offset_x,
        margin + card_h + shadow_offset_y
    ]
    shadow_draw.rectangle(shadow_box, fill=(0, 0, 0, 130))
    shadow_layer = shadow_layer.filter(ImageFilter.GaussianBlur(radius=8))
    
    # Combine card onto canvas
    content_layer = Image.new("RGBA", (canvas_w, canvas_h), (0, 0, 0, 0))
    content_layer.paste(card, (margin, margin))
    
    # Merge shadow and card
    merged = Image.alpha_composite(shadow_layer, content_layer)
    
    # Rotate by slight angle
    rotated = merged.rotate(angle, resample=Image.Resampling.BICUBIC, expand=True)
    
    # Crop transparent bounding box tightly with padding
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
    
    for item in TARGETS:
        src_path = os.path.join(SOURCE_DIR, item["file"])
        if not os.path.exists(src_path):
            print(f"Warning: {src_path} not found")
            continue
            
        print(f"Processing: {item['name']}...")
        pinned_img = create_pinned_card(src_path, item["angle"], item["pin_color"])
        
        # Save individual transparent PNG
        out_filename = f"pinned_{item['name']}.png"
        out_path = os.path.join(OUTPUT_DIR, out_filename)
        pinned_img.save(out_path, format="PNG")
        
        # Also copy to artifact dir
        artifact_img_path = os.path.join(ARTIFACT_DIR, out_filename)
        pinned_img.save(artifact_img_path, format="PNG")
        
        processed_images.append((item["name"], pinned_img))
        
    print(f"Generated {len(processed_images)} individual pinned photos successfully!")
    
    # Create a clean combined grid overview (4 columns x 2 rows) on dark neutral background
    cols = 4
    rows = 2
    cell_w = 400
    cell_h = 480
    grid_img = Image.new("RGBA", (cols * cell_w, rows * cell_h), (40, 40, 46, 255))
    
    for idx, (name, p_img) in enumerate(processed_images):
        r = idx // cols
        c = idx % cols
        x = c * cell_w + (cell_w - p_img.width) // 2
        y = r * cell_h + (cell_h - p_img.height) // 2
        grid_img.paste(p_img, (x, y), p_img)
        
    overview_path = os.path.join(OUTPUT_DIR, "all_pinned_avatars_overview.png")
    grid_img.save(overview_path, format="PNG")
    grid_img.save(os.path.join(ARTIFACT_DIR, "all_pinned_avatars_overview.png"), format="PNG")
    print("Saved overview grid to all_pinned_avatars_overview.png")

if __name__ == "__main__":
    main()
