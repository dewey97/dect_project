import os
import numpy as np
from PIL import Image

folder = r'd:\code_world\dect_project\docs\cases\case_000\07_khamxetlai'

# Load key views
img_north = Image.open(os.path.join(folder, '14.png')).convert('RGB')
img_east = Image.open(os.path.join(folder, 'room_360_east_90deg.jpg')).convert('RGB')
img_south_bed = Image.open(os.path.join(folder, '16.png')).convert('RGB')
img_west = Image.open(os.path.join(folder, 'room_360_west_270deg.jpg')).convert('RGB')

pano_w = 4096
pano_h = 1080

def resize_to_height(img, h):
    w = int(img.width * (h / img.height))
    return img.resize((w, h), Image.Resampling.LANCZOS)

img_north_r = resize_to_height(img_north, pano_h)
img_east_r = resize_to_height(img_east, pano_h)
img_south_r = resize_to_height(img_south_bed, pano_h)
img_west_r = resize_to_height(img_west, pano_h)

canvas = np.zeros((pano_h, pano_w, 3), dtype=np.float32)
weight_map = np.zeros((pano_h, pano_w), dtype=np.float32)

def create_feather_mask(w, h, fade_ratio=0.25):
    fade_len = int(w * fade_ratio)
    mask_1d = np.ones(w, dtype=np.float32)
    if fade_len > 0:
        fade_in = 0.5 * (1 - np.cos(np.linspace(0, np.pi, fade_len)))
        mask_1d[:fade_len] = fade_in
        mask_1d[-fade_len:] = fade_in[::-1]
    return np.tile(mask_1d, (h, 1))

views = [
    (img_north_r, 0.0),
    (img_east_r, 0.25),
    (img_south_r, 0.50),
    (img_west_r, 0.75),
    (img_north_r, 1.0),
]

for img, center_ratio in views:
    img_arr = np.array(img, dtype=np.float32)
    w = img.width
    mask = create_feather_mask(w, pano_h, fade_ratio=0.28)
    
    center_x = int(center_ratio * pano_w)
    start_x = center_x - w // 2
    
    for ix in range(w):
        src_x = ix
        dst_x = (start_x + ix) % pano_w
        w_val = mask[:, src_x]
        
        canvas[:, dst_x, :] += img_arr[:, src_x, :] * w_val[:, None]
        weight_map[:, dst_x] += w_val

weight_map[weight_map == 0] = 1.0
blended = canvas / weight_map[:, :, None]
blended = np.clip(blended, 0, 255).astype(np.uint8)

pano_img = Image.fromarray(blended)
out_path = os.path.join(folder, 'room_360_panorama.jpg')
pano_img.save(out_path, quality=95)
print('Generated panorama:', out_path, pano_img.size)

# Equirectangular 2:1 (4096 x 2048)
pano_equirect = Image.new('RGB', (pano_w, 2048), color=(25, 23, 20))
y_offset = (2048 - pano_h) // 2
pano_equirect.paste(pano_img, (0, y_offset))

# Smooth top ceiling and bottom floor
ceiling = pano_img.crop((0, 0, pano_w, 15)).resize((pano_w, y_offset), Image.Resampling.BILINEAR)
floor = pano_img.crop((0, pano_h - 15, pano_w, pano_h)).resize((pano_w, 2048 - y_offset - pano_h), Image.Resampling.BILINEAR)
pano_equirect.paste(ceiling, (0, 0))
pano_equirect.paste(floor, (0, y_offset + pano_h))

out_equirect = os.path.join(folder, 'room_360_equirectangular.jpg')
pano_equirect.save(out_equirect, quality=95)
print('Generated equirectangular:', out_equirect, pano_equirect.size)
