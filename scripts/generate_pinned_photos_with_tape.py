import os
import re
import io
import argparse
import random
import requests
from PIL import Image, ImageDraw, ImageFont

def normalize_drive_url(url: str) -> str:
    """Converts a Google Drive share link into a direct CDN download URL."""
    if not url:
        return ""
    trimmed = url.strip()
    match = re.search(r'/file/d/([a-zA-Z0-9_-]+)', trimmed)
    if match:
        return f"https://lh3.googleusercontent.com/d/{match.group(1)}"
    match = re.search(r'[?&]id=([a-zA-Z0-9_-]+)', trimmed)
    if match:
        return f"https://lh3.googleusercontent.com/d/{match.group(1)}"
    return trimmed

def load_image(source: str) -> Image.Image:
    """Loads an image from a local file path or a remote URL (Google Drive / CDN)."""
    if not source:
        raise ValueError("Image source cannot be empty")
        
    if source.startswith("http://") or source.startswith("https://"):
        direct_url = normalize_drive_url(source)
        resp = requests.get(direct_url, timeout=20)
        resp.raise_for_status()
        return Image.open(io.BytesIO(resp.content)).convert("RGBA")
        
    clean_path = os.path.abspath(source)
    if os.path.exists(clean_path):
        return Image.open(clean_path).convert("RGBA")
        
    raise FileNotFoundError(f"File not found locally: {clean_path}")

def generate_torn_tape_polygon(x_left, x_right, y_top, y_bottom, seed=42):
    """Generates realistic jagged/torn paper tape edge coordinates."""
    rng = random.Random(seed)
    points = []
    
    # Top edge
    steps_x = 12
    for i in range(steps_x + 1):
        t = i / steps_x
        x = x_left + (x_right - x_left) * t
        y = y_top + rng.uniform(-0.5, 0.5)
        points.append((x, y))
        
    # Right torn edge (jagged paper fiber tear)
    steps_y = 9
    for i in range(1, steps_y + 1):
        t = i / steps_y
        y = y_top + (y_bottom - y_top) * t
        offset = (5 if i % 2 == 1 else -4) + rng.uniform(-2.0, 2.0)
        x = x_right + offset
        points.append((x, y))
        
    # Bottom edge
    for i in range(steps_x - 1, -1, -1):
        t = i / steps_x
        x = x_left + (x_right - x_left) * t
        y = y_bottom + rng.uniform(-0.5, 0.5)
        points.append((x, y))
        
    # Left torn edge
    for i in range(steps_y - 1, 0, -1):
        t = i / steps_y
        y = y_top + (y_bottom - y_top) * t
        offset = (-5 if i % 2 == 1 else 4) + rng.uniform(-2.0, 2.0)
        x = x_left + offset
        points.append((x, y))
        
    return points

def create_straight_card_with_tape(
    raw_img: Image.Image,
    label_text: str,
    target_w: int = 300,
    target_h: int = 380,
    seed: int = 42
) -> Image.Image:
    """
    Tạo thẻ ảnh Polaroid phẳng 0 độ, không cắm ghim, không đổ bóng.
    Tự động gắn băng dính răng cưa in tên chữ in hoa.
    """
    photo = raw_img.resize((target_w, target_h), Image.Resampling.LANCZOS)
    
    pad_top = 18
    pad_side = 14
    pad_bottom = 54
    
    card_w = target_w + pad_side * 2
    card_h = target_h + pad_top + pad_bottom
    
    # Beige Masking Tape dimensions
    tape_overhang = 16
    tape_h = 50
    tape_y1 = pad_top + target_h - 14
    tape_y2 = tape_y1 + tape_h
    
    tape_x1 = pad_side - tape_overhang
    tape_x2 = card_w - pad_side + tape_overhang
    
    canvas_w = card_w + tape_overhang * 2
    canvas_h = card_h
    offset_x = tape_overhang
    
    canvas = Image.new("RGBA", (canvas_w, canvas_h), (0, 0, 0, 0))
    draw = ImageDraw.Draw(canvas)
    
    # 1. Clean off-white Polaroid card
    paper_color = (248, 247, 243, 255)
    card_box = [offset_x, 0, offset_x + card_w - 1, card_h - 1]
    draw.rectangle(card_box, fill=paper_color)
    draw.rectangle(card_box, outline=(210, 205, 195, 200), width=1)
    
    # 2. Paste inner photo
    canvas.paste(photo, (offset_x + pad_side, pad_top), photo if photo.mode == "RGBA" else None)
    
    # 3. Beige Paper Masking Tape Layer
    tape_overlay = Image.new("RGBA", (canvas_w, canvas_h), (0, 0, 0, 0))
    tape_draw = ImageDraw.Draw(tape_overlay)
    
    tape_pts = generate_torn_tape_polygon(
        offset_x + tape_x1, offset_x + tape_x2,
        tape_y1, tape_y2,
        seed=seed
    )
    
    tape_body_color = (235, 218, 185, 242)
    tape_draw.polygon(tape_pts, fill=tape_body_color)
    
    tape_edge_color = (210, 192, 160, 200)
    tape_draw.polygon(tape_pts, outline=tape_edge_color, width=1)
    
    # Add fibrous paper texture lines
    rng = random.Random(seed)
    for _ in range(8):
        fy = tape_y1 + rng.randint(4, tape_h - 4)
        fx1 = offset_x + tape_x1 + rng.randint(5, 30)
        fx2 = offset_x + tape_x2 - rng.randint(5, 30)
        tape_draw.line([(fx1, fy), (fx2, fy)], fill=(245, 230, 205, 110), width=1)
    
    # 4. Bold text printed on tape
    clean_label = (label_text or "").strip().upper()
    try:
        font_main = ImageFont.truetype(r"C:\Windows\Fonts\arialbd.ttf", 23)
    except Exception:
        font_main = ImageFont.load_default()
        
    text_bbox = tape_draw.textbbox((0, 0), clean_label, font=font_main)
    tw = text_bbox[2] - text_bbox[0]
    th = text_bbox[3] - text_bbox[1]
    
    tx = offset_x + (card_w - tw) // 2
    ty = tape_y1 + (tape_h - th) // 2 - 2
    
    ink_color = (22, 24, 30, 250)
    tape_draw.text((tx, ty), clean_label, font=font_main, fill=ink_color)
    
    # Merge card and tape cleanly (No shadow, no pin, no rotation)
    return Image.alpha_composite(canvas, tape_overlay)

def clean_character_name(title: str) -> str:
    """Tự động chuẩn hóa tiêu đề ảnh thành tên ngắn gọn (ví dụ: 'Ảnh chân dung Nguyễn Văn Khang' -> 'NGUYỄN VĂN KHANG')"""
    if not title:
        return ""
    t = re.sub(r'^[🔑⚡📝🔴🟢⚪\s]+', '', title).strip()
    t = re.sub(r'^(Ảnh chân dung|Ảnh thẻ|Ảnh|Chân dung)\s+', '', t, flags=re.IGNORECASE).strip()
    t = re.sub(r'\s*\([^)]*\)', '', t).strip()
    return t.upper()

def sync_from_google_sheet(spreadsheet_id: str, case_id: str = "case_000", output_dir: str = None):
    """Đọc dữ liệu ảnh và tên trực tiếp 100% từ Google Sheet Live CMS."""
    from google.oauth2 import service_account
    from googleapiclient.discovery import build
    
    root_dir = os.path.dirname(os.path.dirname(os.path.abspath(__file__)))
    key_file = os.path.join(root_dir, "google-service-account.json")
    if not os.path.exists(key_file):
        raise FileNotFoundError(f"Google service account key not found at: {key_file}")
        
    if not output_dir:
        output_dir = os.path.join(root_dir, "public", "images", "cases", case_id, "pinned_photos_with_tape")
    os.makedirs(output_dir, exist_ok=True)
    
    creds = service_account.Credentials.from_service_account_file(
        key_file,
        scopes=["https://www.googleapis.com/auth/spreadsheets.readonly"]
    )
    service = build("sheets", "v4", credentials=creds)
    
    # 1. Đọc tab 'characters' để có map tên chuẩn
    char_map = {}
    try:
        char_res = service.spreadsheets().values().get(spreadsheet_id=spreadsheet_id, range="characters!A1:Z100").execute()
        char_rows = char_res.get("values", [])
        if char_rows:
            headers = [h.strip().lower() for h in char_rows[0]]
            code_col = next((i for i, h in enumerate(headers) if "code" in h), 1)
            name_col = next((i for i, h in enumerate(headers) if "name" in h), 2)
            for r in char_rows[1:]:
                if len(r) > max(code_col, name_col):
                    c_code = r[code_col].strip().lower().replace("suspect-", "").replace("04-", "").replace("03-", "").replace("01-", "")
                    c_name = r[name_col].strip()
                    char_map[c_code] = c_name
    except Exception as e:
        print(f"Notice: Cannot read 'characters' tab: {e}")

    # 2. Đọc tab 'photos'
    print(f"Fetching photos from Google Sheet ({spreadsheet_id})...")
    photos_res = service.spreadsheets().values().get(spreadsheet_id=spreadsheet_id, range="photos!A1:Z100").execute()
    rows = photos_res.get("values", [])
    if not rows:
        print("No rows found in 'photos' tab.")
        return

    headers = [re.sub(r'^[🔑⚡📝🔴🟢⚪\s]+', '', h).strip().lower() for h in rows[0]]
    code_idx = headers.index("photo_code") if "photo_code" in headers else 1
    title_idx = headers.index("title") if "title" in headers else 2
    category_idx = headers.index("category") if "category" in headers else 3
    file_idx = headers.index("file_name") if "file_name" in headers else 4
    local_idx = headers.index("local_file_path") if "local_file_path" in headers else 6
    drive_idx = headers.index("drive_url") if "drive_url" in headers else 7
    cdn_idx = headers.index("direct_cdn_url") if "direct_cdn_url" in headers else 8
    
    success_count = 0
    for idx, r in enumerate(rows[1:]):
        code = r[code_idx].strip() if len(r) > code_idx else f"photo_{idx+1}"
        title = r[title_idx].strip() if len(r) > title_idx else ""
        category = r[category_idx].strip().upper() if len(r) > category_idx else ""
        local_path = r[local_idx].strip() if len(r) > local_idx else ""
        drive_url = r[drive_idx].strip() if len(r) > drive_idx else ""
        direct_cdn = r[cdn_idx].strip() if len(r) > cdn_idx else ""
        
        # Chỉ tạo thẻ Polaroid cho AVATAR hoặc ảnh nhân vật
        if category and category != "AVATAR" and not code.startswith("avatar"):
            continue
            
        img_source = direct_cdn or drive_url or (os.path.join(root_dir, local_path) if local_path else None)
        if not img_source:
            print(f"Skipping [{code}]: No image URL or local path provided on Sheet.")
            continue
            
        # Tìm tên hiển thị
        clean_code = code.lower().replace("avatar_", "").replace("avatar-", "")
        person_name = char_map.get(clean_code) or clean_character_name(title) or clean_code.upper()
        
        try:
            print(f"Generating Polaroid: [{code}] -> {person_name}...")
            raw_img = load_image(img_source)
            card = create_straight_card_with_tape(raw_img, person_name, seed=idx * 17)
            
            out_filename = f"pinned_tape_{clean_code}.png"
            out_file_path = os.path.join(output_dir, out_filename)
            card.save(out_file_path, format="PNG")
            print(f"  -> Saved: {out_file_path}")
            success_count += 1
        except Exception as e:
            print(f"  -> Error processing [{code}]: {e}")
            
    print(f"\nCompleted! Generated {success_count} Polaroid cards from Google Sheet Live CMS.")

def main():
    parser = argparse.ArgumentParser(description="Universal Polaroid + Tape Generator (CLI & Google Sheet Live)")
    parser.add_argument("--image", help="Đường dẫn file ảnh cục bộ hoặc URL")
    parser.add_argument("--drive-url", help="Link Google Drive công khai")
    parser.add_argument("--name", help="Tên hiển thị in lên băng dính (VD: NGUYỄN VĂN KHANG)")
    parser.add_argument("--output", help="Đường dẫn file PNG xuất ra")
    parser.add_argument("--sync-sheet", action="store_true", help="Tự động đồng bộ toàn bộ ảnh từ Google Sheet")
    parser.add_argument("--sheet-id", default="1h2P9VaBC9PELUMhipo6ze1SkJIVv3IOm5SP3ynURm4Q", help="Google Sheet ID")
    parser.add_argument("--case-id", default="case_000", help="Case ID")
    
    args = parser.parse_args()
    
    # 1. Chế độ CLI cho 1 ảnh cụ thể
    if args.image or args.drive_url:
        img_source = args.drive_url or args.image
        name = args.name or "DANH TÍNH ẨN"
        out_path = args.output or "output_polaroid.png"
        
        print(f"Processing image: {img_source} -> Label: {name}")
        raw_img = load_image(img_source)
        card = create_straight_card_with_tape(raw_img, name)
        card.save(out_path, format="PNG")
        print(f"Saved: {out_path}")
        return
        
    # 2. Mặc định: Chế độ Live Sync toàn bộ ảnh từ Google Sheet
    sync_from_google_sheet(spreadsheet_id=args.sheet_id, case_id=args.case_id, output_dir=args.output)

if __name__ == "__main__":
    main()
