import os
import random
import math
from PIL import Image, ImageDraw, ImageFilter, ImageFont

OUTPUT_DIR = r"d:\code_world\dect_project\public\images\cases\case_000\clue_notes"
ARTIFACT_DIR = r"C:\Users\Dell\.gemini\antigravity\brain\6dec1bcd-bdae-4bc7-9a7e-722029b75aa6"

os.makedirs(OUTPUT_DIR, exist_ok=True)
os.makedirs(ARTIFACT_DIR, exist_ok=True)

def draw_yellow_pushpin(draw, cx, cy, radius=8, tilt_deg=8):
    rad = math.radians(tilt_deg)
    sin_t = math.sin(rad)
    cos_t = math.cos(rad)
    
    shadow_ox = int(sin_t * 5)
    shadow_oy = int(cos_t * 4 + 2)
    shadow_box = [cx - radius + shadow_ox, cy - radius + shadow_oy, cx + radius + shadow_ox, cy + radius + shadow_oy + 2]
    draw.ellipse(shadow_box, fill=(10, 10, 15, 130))
    
    base_dark = (160, 115, 5, 255)
    body_yellow = (245, 195, 15, 255)
    hi_yellow = (255, 235, 110, 255)
    white_spec = (255, 255, 240, 245)
    
    draw.ellipse([cx - radius, cy - radius, cx + radius, cy + radius], fill=base_dark)
    dome_r = radius - 2
    dcx = cx + int(sin_t * 2)
    dcy = cy - int(cos_t * 1)
    draw.ellipse([dcx - dome_r, dcy - dome_r, dcx + dome_r, dcy + dome_r], fill=body_yellow)
    cap_r = dome_r - 2
    hcx = dcx - int(sin_t * 1)
    hcy = dcy - 2
    draw.ellipse([hcx - cap_r, hcy - cap_r + 1, hcx + cap_r, hcy + cap_r - 1], fill=hi_yellow)
    draw.ellipse([hcx - 2, hcy - 2, hcx + 2, hcy + 1], fill=white_spec)

def create_isolated_white_note(width=220, height=260, angle=-2.5, pin_tilt=10, filename="note_white_1.png"):
    # Base canvas
    margin = 50
    cw = width + margin * 2
    ch = height + margin * 2
    
    # Paper layer
    paper = Image.new("RGBA", (width, height), (0, 0, 0, 0))
    p_draw = ImageDraw.Draw(paper)
    
    # Off-white warm paper color with slight texture
    paper_color = (250, 248, 242, 255)
    p_draw.rectangle([0, 0, width - 1, height - 1], fill=paper_color)
    p_draw.rectangle([0, 0, width - 1, height - 1], outline=(215, 210, 198, 220), width=1)
    
    # Pushpin at top center
    pin_cx = width // 2
    pin_cy = 14
    draw_yellow_pushpin(p_draw, pin_cx, pin_cy, radius=8, tilt_deg=pin_tilt)
    
    # Shadow layer
    shadow_layer = Image.new("RGBA", (cw, ch), (0, 0, 0, 0))
    s_draw = ImageDraw.Draw(shadow_layer)
    s_draw.rectangle([margin, margin + 8, margin + width, margin + height + 8], fill=(0, 0, 0, 120))
    shadow_layer = shadow_layer.filter(ImageFilter.GaussianBlur(radius=7))
    
    # Content layer
    content_layer = Image.new("RGBA", (cw, ch), (0, 0, 0, 0))
    content_layer.paste(paper, (margin, margin))
    
    merged = Image.alpha_composite(shadow_layer, content_layer)
    rotated = merged.rotate(angle, resample=Image.Resampling.BICUBIC, expand=True)
    
    bbox = rotated.getbbox()
    if bbox:
        crop_box = (max(0, bbox[0] - 4), max(0, bbox[1] - 4), min(rotated.width, bbox[2] + 4), min(rotated.height, bbox[3] + 4))
        rotated = rotated.crop(crop_box)
        
    out_path = os.path.join(OUTPUT_DIR, filename)
    rotated.save(out_path, format="PNG")
    rotated.save(os.path.join(ARTIFACT_DIR, filename), format="PNG")
    return rotated

def create_isolated_sticky_note(size=180, angle=3.0, color=(250, 235, 130), filename="sticky_yellow_1.png"):
    margin = 40
    cw = size + margin * 2
    ch = size + margin * 2
    
    paper = Image.new("RGBA", (size, size), (0, 0, 0, 0))
    p_draw = ImageDraw.Draw(paper)
    
    r, g, b = color
    p_draw.rectangle([0, 0, size - 1, size - 1], fill=(r, g, b, 255))
    p_draw.rectangle([0, 0, size - 1, 14], fill=(max(0, r - 15), max(0, g - 15), max(0, b - 15), 180)) # sticky strip top
    p_draw.rectangle([0, 0, size - 1, size - 1], outline=(max(0, r - 30), max(0, g - 30), max(0, b - 30), 120), width=1)
    
    shadow_layer = Image.new("RGBA", (cw, ch), (0, 0, 0, 0))
    s_draw = ImageDraw.Draw(shadow_layer)
    s_draw.rectangle([margin, margin + 6, margin + size, margin + size + 6], fill=(0, 0, 0, 110))
    shadow_layer = shadow_layer.filter(ImageFilter.GaussianBlur(radius=6))
    
    content_layer = Image.new("RGBA", (cw, ch), (0, 0, 0, 0))
    content_layer.paste(paper, (margin, margin))
    
    merged = Image.alpha_composite(shadow_layer, content_layer)
    rotated = merged.rotate(angle, resample=Image.Resampling.BICUBIC, expand=True)
    
    bbox = rotated.getbbox()
    if bbox:
        crop_box = (max(0, bbox[0] - 4), max(0, bbox[1] - 4), min(rotated.width, bbox[2] + 4), min(rotated.height, bbox[3] + 4))
        rotated = rotated.crop(crop_box)
        
    out_path = os.path.join(OUTPUT_DIR, filename)
    rotated.save(out_path, format="PNG")
    rotated.save(os.path.join(ARTIFACT_DIR, filename), format="PNG")
    return rotated

def main():
    # 4 distinct white case notes
    create_isolated_white_note(220, 270, angle=-3.0, pin_tilt=-10, filename="note_white_tilt_left.png")
    create_isolated_white_note(220, 270, angle=3.5,  pin_tilt=12,  filename="note_white_tilt_right.png")
    create_isolated_white_note(240, 310, angle=-1.5, pin_tilt=-6,  filename="note_white_large.png")
    create_isolated_white_note(200, 220, angle=2.0,  pin_tilt=8,   filename="note_white_square.png")
    
    # 4 distinct sticky notes
    create_isolated_sticky_note(170, angle=4.0,  color=(252, 238, 140), filename="sticky_yellow_tilt_right.png")
    create_isolated_sticky_note(170, angle=-3.5, color=(252, 238, 140), filename="sticky_yellow_tilt_left.png")
    create_isolated_sticky_note(180, angle=1.0,  color=(245, 230, 125), filename="sticky_yellow_flat.png")
    create_isolated_sticky_note(170, angle=-2.0, color=(240, 220, 185), filename="sticky_kraft_beige.png")
    
    print("All individual note and sticky assets generated successfully!")

if __name__ == "__main__":
    main()
