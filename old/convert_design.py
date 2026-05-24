"""Convert all design JPGs to WebP and create mockups"""
import os
from pathlib import Path
from PIL import Image

BASE = Path(r"C:\Users\PC\Desktop\ShadiFarhat.github.io-main\assets\design")
QUALITY = 85
MAX_SIZE = (1920, 1080)

def convert(src, dst):
    try:
        img = Image.open(src)
        if img.mode not in ('RGB', 'RGBA'):
            img = img.convert('RGB')
        img.thumbnail(MAX_SIZE, Image.Resampling.LANCZOS)
        img.save(dst, 'WEBP', quality=QUALITY, method=6)
        old_size = os.path.getsize(src) / 1024
        new_size = os.path.getsize(dst) / 1024
        print(f"  {src.name} -> {dst.name} ({old_size:.0f}KB -> {new_size:.0f}KB)")
        return True
    except Exception as e:
        print(f"  ERROR: {src} - {e}")
        return False

for folder in BASE.iterdir():
    if folder.is_dir():
        print(f"\n{folder.name}:")

        # Find all images
        images = []
        for f in folder.iterdir():
            if f.suffix.lower() in ['.png', '.jpg', '.jpeg']:
                images.append(f)

        if not images:
            print("  No images found")
            continue

        # Sort by name
        images.sort(key=lambda x: x.name)

        # Convert first image as mockup.webp
        mockup_dst = folder / "mockup.webp"
        if not mockup_dst.exists() or True:  # Always overwrite
            convert(images[0], mockup_dst)

        # Convert rest as 1.webp, 2.webp, etc.
        for i, img in enumerate(images[1:], start=1):
            dst = folder / f"{i}.webp"
            convert(img, dst)

print("\n\nDone!")
