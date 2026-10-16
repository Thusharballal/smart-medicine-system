from pathlib import Path

from app.services.ocr.detector import detect_text_regions


IMAGE_PATH = Path("prescp2.png")


if not IMAGE_PATH.exists():
    print(f"Image not found: {IMAGE_PATH}")
    raise SystemExit(1)


image_bytes = IMAGE_PATH.read_bytes()

regions = detect_text_regions(image_bytes)

print()
print("==============================")
print("DETECTOR TEST")
print("==============================")
print(f"Detected regions: {len(regions)}")
print("==============================")