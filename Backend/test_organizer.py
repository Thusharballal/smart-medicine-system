from pathlib import Path

from app.services.ocr.detector import detect_text_regions
from app.services.ocr.recognizer import recognize_regions


IMAGE_PATH = Path("prescp2.png")


if not IMAGE_PATH.exists():
    print(f"Image not found: {IMAGE_PATH}")
    raise SystemExit(1)


# Read prescription
image_bytes = IMAGE_PATH.read_bytes()


# Step 1: YOLO detection
print("\n==============================")
print("STEP 1 - YOLO DETECTION")
print("==============================")

regions = detect_text_regions(image_bytes)

print(
    f"Total regions detected: {len(regions)}"
)


# Step 2: TrOCR recognition
print("\n==============================")
print("STEP 2 - TrOCR RECOGNITION")
print("==============================")

texts = recognize_regions(regions)


# Display results
print("\n==============================")
print("OCR RESULTS")
print("==============================")

for index, text in enumerate(texts, start=1):

    print(
        f"{index}. {text}"
    )

print("==============================")
print(
    f"Total recognized regions: {len(texts)}"
)
print("==============================")