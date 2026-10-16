from typing import List

from app.services.ocr.detector import detect_text_regions
from app.services.ocr.recognizer import recognize_regions
from app.services.ocr.medicine_matcher import match_medicine


# =========================================================
# ENGLISH TEXT CLEANING
# =========================================================

def clean_english_text(text: str) -> str:
    """
    Keep only English ASCII letters, numbers and spaces.

    Arabic and other non-English characters are removed.
    """

    if not text:
        return ""

    cleaned = []

    for char in text:

        if (
            char.isascii()
            and (
                char.isalpha()
                or char.isdigit()
                or char.isspace()
            )
        ):
            cleaned.append(char)

        else:
            cleaned.append(" ")

    return " ".join(
        "".join(cleaned).split()
    )


# =========================================================
# EXTRACT DOSAGE
# =========================================================

def extract_dosage(text: str):

    import re

    if not text:
        return None

    pattern = (
        r"\b\d+(?:\.\d+)?\s*"
        r"(?:mg|mcg|g|ml|iu|%)\b"
    )

    match = re.search(
        pattern,
        text,
        flags=re.IGNORECASE,
    )

    if match:
        return match.group(0).strip()

    return None


# =========================================================
# EXTRACT DURATION
# =========================================================

def extract_duration(text: str):

    import re

    if not text:
        return None

    pattern = (
        r"\b\d+\s*"
        r"(?:day|days|week|weeks|month|months)\b"
    )

    match = re.search(
        pattern,
        text,
        flags=re.IGNORECASE,
    )

    if match:
        return match.group(0).strip()

    return None


# =========================================================
# COMPLETE OCR PIPELINE
# =========================================================

async def process_prescription(
    image_bytes: bytes,
) -> dict:
    """
    Complete prescription OCR pipeline.

    Flow:

        Prescription image
                ↓
        YOLO text detection
                ↓
        TrOCR recognition
                ↓
        English text cleaning
                ↓
        Medicine database matching
                ↓
        OCR text + medicine objects
    """

    if not image_bytes:

        raise ValueError(
            "Prescription image is empty."
        )

    print(
        "\n=============================="
    )

    print(
        "Running prescription OCR"
    )

    print(
        "=============================="
    )

    # =====================================================
    # STEP 1 - YOLO DETECTION
    # =====================================================

    print(
        "Step 1: Detecting text regions..."
    )

    regions = detect_text_regions(
        image_bytes
    )

    if not regions:

        print(
            "No text regions detected."
        )

        return {
            "recognized_text": [],
            "medicines": [],
        }

    print(
        f"Detected {len(regions)} "
        "text regions."
    )

    # =====================================================
    # STEP 2 - TROCR RECOGNITION
    # =====================================================

    print(
        "Step 2: Recognizing handwriting..."
    )

    recognized_texts = recognize_regions(
        regions
    )

    if not recognized_texts:

        print(
            "No readable text detected."
        )

        return {
            "recognized_text": [],
            "medicines": [],
        }

    print(
        f"Recognized {len(recognized_texts)} "
        "regions."
    )

    # =====================================================
    # STEP 3 - CLEAN ENGLISH TEXT
    # =====================================================

    print(
        "Step 3: Cleaning and matching medicines..."
    )

    cleaned_texts = []

    for index, text in enumerate(
        recognized_texts
    ):

        if not text:
            continue

        cleaned = clean_english_text(
            text
        )

        print(
            f"\nOCR region {index + 1}: "
            f"{text}"
        )

        print(
            f"Cleaned text: {cleaned}"
        )

        # -------------------------------------------------
        # Ignore Arabic-only / non-English text
        # -------------------------------------------------

        if not cleaned:

            print(
                "Ignored: no usable English text."
            )

            continue

        # -------------------------------------------------
        # Ignore tiny fragments
        # -------------------------------------------------

        if len(cleaned) < 3:

            print(
                "Ignored: text too short."
            )

            continue

        # -------------------------------------------------
        # Save text for frontend
        # -------------------------------------------------

        cleaned_texts.append(
            cleaned
        )

    # =====================================================
    # STEP 4 - MATCH MEDICINES
    # =====================================================

    medicines = []

    for text in cleaned_texts:

        # -------------------------------------------------
        # Dosage/instruction-only text
        # -------------------------------------------------

        if (
            extract_dosage(text)
            and not any(
                char.isalpha()
                for char in text
                if char.lower()
                not in "mgmcgiu"
            )
        ):

            print(
                f"Ignored dosage: {text}"
            )

            continue

        # -------------------------------------------------
        # Try medicine database
        # -------------------------------------------------

        try:

            matched_medicine = (
                match_medicine(text)
            )

        except Exception as exc:

            print(
                f"Medicine matching failed "
                f"for '{text}': "
                f"{repr(exc)}"
            )

            matched_medicine = None

        if matched_medicine:

            print(
                f"Matched medicine: "
                f"{matched_medicine}"
            )

            medicines.append(
                {
                    "name": matched_medicine,
                    "dosage": extract_dosage(
                        text
                    ),
                    "frequency": None,
                    "duration": extract_duration(
                        text
                    ),
                    "composition": None,
                    "confidence": None,
                }
            )

        else:

            print(
                f"No medicine match for: "
                f"{text}"
            )

    # =====================================================
    # REMOVE DUPLICATE MEDICINES
    # =====================================================

    unique_medicines = []

    seen = set()

    for medicine in medicines:

        key = medicine[
            "name"
        ].lower()

        if key not in seen:

            seen.add(key)

            unique_medicines.append(
                medicine
            )

    # =====================================================
    # FINAL OUTPUT
    # =====================================================

    print(
        "\n=============================="
    )

    print(
        "FINAL OCR TEXT"
    )

    print(
        "=============================="
    )

    for text in cleaned_texts:

        print(text)

    print(
        "\n=============================="
    )

    print(
        "FINAL MEDICINES"
    )

    print(
        "=============================="
    )

    for medicine in unique_medicines:

        print(
            medicine["name"]
        )

    print(
        "==============================\n"
    )

    return {
        "recognized_text": cleaned_texts,
        "medicines": unique_medicines,
    }