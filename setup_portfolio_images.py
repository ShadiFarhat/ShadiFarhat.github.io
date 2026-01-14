"""
Setup Portfolio Images - Copy and convert all 3D and Design images to WebP
"""

import os
import shutil
from pathlib import Path
from PIL import Image

# Paths
PORTFOLIO_DIR = Path(r"C:\Users\PC\Desktop\ShadiFarhat.github.io-main")
BLENDER_SOURCE = Path(r"C:\Users\PC\Desktop\Web Development\My Portfolio Updated\ShadiFarhat.github.io\Projects\3D Modeling")
DESIGN_SOURCE = Path(r"C:\Users\PC\Desktop\Shadi Farhat\Portfolio\Portfolio V1\Mockups")

# Output folders
BLENDER_OUTPUT = PORTFOLIO_DIR / "assets" / "3d-work"
DESIGN_OUTPUT = PORTFOLIO_DIR / "assets" / "design"

QUALITY = 85
MAX_SIZE = (1920, 1080)

def slugify(name):
    """Convert name to URL-friendly slug"""
    return name.lower().replace(' ', '-').replace("'", "").replace('.png', '').replace('.jpg', '').replace('.jpeg', '')

def convert_to_webp(source_path, output_path):
    """Convert image to WebP format"""
    try:
        img = Image.open(source_path)
        if img.mode in ('RGBA', 'LA'):
            pass
        elif img.mode != 'RGB':
            img = img.convert('RGB')

        img.thumbnail(MAX_SIZE, Image.Resampling.LANCZOS)
        img.save(output_path, 'WEBP', quality=QUALITY, method=6)

        original_size = os.path.getsize(source_path) / 1024
        new_size = os.path.getsize(output_path) / 1024
        print(f"  Converted: {source_path.name} ({original_size:.0f}KB -> {new_size:.0f}KB)")
        return True
    except Exception as e:
        print(f"  ERROR: {source_path.name} - {e}")
        return False

def setup_3d_projects():
    """Setup 3D Blender project images"""
    print("\n" + "="*60)
    print("SETTING UP 3D BLENDER PROJECTS")
    print("="*60)

    BLENDER_OUTPUT.mkdir(parents=True, exist_ok=True)

    projects = []

    for img_file in BLENDER_SOURCE.iterdir():
        if img_file.suffix.lower() in ['.png', '.jpg', '.jpeg']:
            name = img_file.stem
            slug = slugify(name)

            # Create project folder
            project_dir = BLENDER_OUTPUT / slug
            project_dir.mkdir(exist_ok=True)

            # Convert to WebP as final.webp (main render)
            output_path = project_dir / "final.webp"
            if convert_to_webp(img_file, output_path):
                projects.append({
                    'slug': slug,
                    'name': name,
                    'folder': str(project_dir.relative_to(PORTFOLIO_DIR))
                })

    print(f"\nCreated {len(projects)} 3D project folders")
    return projects

def setup_design_projects():
    """Setup Design project images"""
    print("\n" + "="*60)
    print("SETTING UP DESIGN PROJECTS")
    print("="*60)

    DESIGN_OUTPUT.mkdir(parents=True, exist_ok=True)

    projects = []

    for folder in DESIGN_SOURCE.iterdir():
        if folder.is_dir():
            name = folder.name
            slug = slugify(name)

            # Create project folder
            project_dir = DESIGN_OUTPUT / slug
            project_dir.mkdir(exist_ok=True)

            # Find images in the folder
            images = []
            for ext in ['*.png', '*.jpg', '*.jpeg', '*.PNG', '*.JPG', '*.JPEG']:
                images.extend(folder.glob(ext))

            if images:
                print(f"\n{name}: Found {len(images)} images")

                # Convert first image as mockup
                if convert_to_webp(images[0], project_dir / "mockup.webp"):
                    # Convert additional images
                    for i, img in enumerate(images[1:6], start=1):  # Max 6 images per project
                        convert_to_webp(img, project_dir / f"{i}.webp")

                    projects.append({
                        'slug': slug,
                        'name': name,
                        'folder': str(project_dir.relative_to(PORTFOLIO_DIR)),
                        'image_count': min(len(images), 6)
                    })

    print(f"\nCreated {len(projects)} design project folders")
    return projects

def main():
    print("Portfolio Image Setup Script")
    print("="*60)

    blender_projects = setup_3d_projects()
    design_projects = setup_design_projects()

    print("\n" + "="*60)
    print("SUMMARY")
    print("="*60)
    print(f"3D Projects: {len(blender_projects)}")
    print(f"Design Projects: {len(design_projects)}")

    print("\n3D PROJECT SLUGS:")
    for p in blender_projects:
        print(f"  - {p['slug']}: {p['name']}")

    print("\nDESIGN PROJECT SLUGS:")
    for p in design_projects:
        print(f"  - {p['slug']}: {p['name']}")

    return blender_projects, design_projects

if __name__ == "__main__":
    main()
