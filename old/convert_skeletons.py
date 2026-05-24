"""Convert all skeleton/viewport PNGs to skeleton.webp"""
import os
from pathlib import Path
from PIL import Image

BASE = Path(r"C:\Users\PC\Desktop\ShadiFarhat.github.io-main\assets\3d-work")
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
        print(f"  {src.name} -> skeleton.webp ({old_size:.0f}KB -> {new_size:.0f}KB)")
        return True
    except Exception as e:
        print(f"  ERROR: {src} - {e}")
        return False

for folder in BASE.iterdir():
    if folder.is_dir():
        print(f"\n{folder.name}:")
        # Find skeleton/viewport file
        skeleton_file = None
        for f in folder.iterdir():
            name_lower = f.name.lower()
            if f.suffix.lower() in ['.png', '.jpg', '.jpeg']:
                if 'vp' in name_lower or 'skeleton' in name_lower or 'layout' in name_lower:
                    skeleton_file = f
                    break

        if skeleton_file:
            dst = folder / "skeleton.webp"
            convert(skeleton_file, dst)
        else:
            print("  No skeleton/vp file found")

print("\nDone!")
