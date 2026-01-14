"""Convert hero frames to optimized WebP - Apple style"""
import os
from pathlib import Path
from PIL import Image

FRAMES_DIR = Path(r"C:\Users\PC\Desktop\ShadiFarhat.github.io-main\assets\frames")
QUALITY = 65  # Aggressive compression - users won't notice on scroll
MAX_WIDTH = 1280  # Smaller = faster load, canvas upscales smoothly

def convert_frame(src):
    try:
        img = Image.open(src)

        # Resize to max width, maintain aspect ratio
        if img.width > MAX_WIDTH:
            ratio = MAX_WIDTH / img.width
            new_height = int(img.height * ratio)
            img = img.resize((MAX_WIDTH, new_height), Image.Resampling.LANCZOS)

        # Convert to RGB if needed
        if img.mode != 'RGB':
            img = img.convert('RGB')

        # Save as WebP
        dst = src.with_suffix('.webp')
        img.save(dst, 'WEBP', quality=QUALITY, method=6)

        old_size = os.path.getsize(src) / 1024
        new_size = os.path.getsize(dst) / 1024
        print(f"{src.name}: {old_size:.0f}KB -> {new_size:.0f}KB ({100 - (new_size/old_size*100):.0f}% saved)")

        return True
    except Exception as e:
        print(f"ERROR: {src} - {e}")
        return False

# Convert all JPG frames
total_old = 0
total_new = 0

for f in sorted(FRAMES_DIR.glob("*.jpg")):
    old_size = os.path.getsize(f)
    if convert_frame(f):
        new_size = os.path.getsize(f.with_suffix('.webp'))
        total_old += old_size
        total_new += new_size

print(f"\nTOTAL: {total_old/1024/1024:.2f}MB -> {total_new/1024/1024:.2f}MB ({100 - (total_new/total_old*100):.0f}% saved)")
print("Done!")
