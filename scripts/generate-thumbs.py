#!/usr/bin/env python3
# /// script
# requires-python = ">=3.10"
# dependencies = ["Pillow"]
# ///
"""Generate WebP thumbnails for the home page photo grid.

Reads show data to pick the exact image the front-end would display
(matching getHeadlinerImage logic), then generates one 400px-wide
WebP thumbnail per show. Skips shows that already have an up-to-date thumb.
"""

import json
import sys
from pathlib import Path

from PIL import Image, ImageOps

THUMB_WIDTH = 800
QUALITY = 85


def pick_image(show: dict) -> dict | None:
    """Pick the image the front-end would display for this show.

    Images in data.js are pre-sorted by artist name match (via
    sortImagesByArtists in convert-tsv.js), so highlight or
    images[0] is always the right choice.
    """
    images = show.get("images", [])
    if not images:
        return None

    for img in images:
        if img.get("highlight"):
            return img

    return images[0]


def load_shows(data_path: Path) -> list[dict]:
    """Parse data/data.js (a JS module exporting a JSON array)."""
    text = data_path.read_text()
    # Strip the JS wrapper: "const showsList = [...]\nexport default showsList"
    start = text.index("[")
    end = text.rindex("]") + 1
    return json.loads(text[start:end])


def main():
    root = Path(__file__).resolve().parent.parent
    data_path = root / "data" / "data.js"
    images_dir = root / "public"
    thumbs_dir = root / "public" / "thumbs"

    if not data_path.exists():
        print(f"No data file found at {data_path}")
        sys.exit(1)

    shows = load_shows(data_path)
    created = 0
    skipped = 0

    for show in shows:
        img = pick_image(show)
        if img is None:
            continue

        # img["path"] is like "/images/2024-07-06/photo.jpeg"
        rel = Path(img["path"].lstrip("/"))  # "images/2024-07-06/photo.jpeg"
        src = images_dir / rel
        dest = thumbs_dir / Path(*rel.parts[1:]).with_suffix(".webp")  # "thumbs/2024-07-06/photo.webp"

        if not src.exists():
            continue

        if dest.exists() and dest.stat().st_mtime >= src.stat().st_mtime:
            skipped += 1
            continue

        dest.parent.mkdir(parents=True, exist_ok=True)

        with Image.open(src) as pil_img:
            pil_img = ImageOps.exif_transpose(pil_img)
            pil_img.thumbnail((THUMB_WIDTH, THUMB_WIDTH * 2), Image.LANCZOS)
            pil_img.save(dest, "WEBP", quality=QUALITY)

        created += 1

    print(f"Thumbnails: {created} created, {skipped} skipped")


if __name__ == "__main__":
    main()
