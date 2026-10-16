from typing import List

import torch

from PIL import Image, ImageOps, ImageEnhance

from transformers import (
    TrOCRProcessor,
    VisionEncoderDecoderModel,
)


# =========================================================
# TrOCR MODEL
# =========================================================

MODEL_NAME = "David-Magdy/TROCR_MASTER_V2"


_processor = None
_model = None


# =========================================================
# DEVICE
# =========================================================

DEVICE = torch.device(
    "cuda" if torch.cuda.is_available() else "cpu"
)


# =========================================================
# LOAD MODEL ONCE
# =========================================================

def load_recognizer():
    """
    Load the TrOCR model once and keep it in memory.
    """

    global _processor
    global _model

    if (
        _processor is not None
        and _model is not None
    ):
        return _processor, _model

    print(
        "Loading medical prescription TrOCR model..."
    )

    _processor = TrOCRProcessor.from_pretrained(
        MODEL_NAME
    )

    _model = VisionEncoderDecoderModel.from_pretrained(
        MODEL_NAME
    )

    _model.to(DEVICE)

    _model.eval()

    print(
        f"Medical prescription TrOCR model loaded "
        f"on {DEVICE}."
    )

    return _processor, _model


# =========================================================
# PREPROCESS IMAGE
# =========================================================

def preprocess_image(
    image: Image.Image,
) -> Image.Image:
    """
    Prepare a detected handwritten text region
    before sending it to TrOCR.

    Processing:
        RGB
        ↓
        Grayscale
        ↓
        Contrast enhancement
        ↓
        Autocontrast
        ↓
        RGB

    We deliberately do NOT apply aggressive thresholding
    because handwriting strokes can be damaged by it.
    """

    if image is None:
        return None

    # -----------------------------------------------------
    # RGB
    # -----------------------------------------------------

    image = image.convert("RGB")

    # -----------------------------------------------------
    # Add a small white border
    #
    # This prevents characters touching the crop edges.
    # -----------------------------------------------------

    width, height = image.size

    padding_x = max(
        8,
        int(width * 0.05)
    )

    padding_y = max(
        8,
        int(height * 0.15)
    )

    padded = Image.new(
        "RGB",
        (
            width + (padding_x * 2),
            height + (padding_y * 2),
        ),
        "white",
    )

    padded.paste(
        image,
        (
            padding_x,
            padding_y,
        ),
    )

    image = padded

    # -----------------------------------------------------
    # Grayscale
    # -----------------------------------------------------

    image = ImageOps.grayscale(
        image
    )

    # -----------------------------------------------------
    # Improve contrast
    # -----------------------------------------------------

    image = ImageEnhance.Contrast(
        image
    ).enhance(1.5)

    # -----------------------------------------------------
    # Automatic contrast
    # -----------------------------------------------------

    image = ImageOps.autocontrast(
        image
    )

    # -----------------------------------------------------
    # Convert back to RGB
    #
    # TrOCR expects a 3-channel image.
    # -----------------------------------------------------

    image = image.convert("RGB")

    return image


# =========================================================
# RECOGNIZE ONE REGION
# =========================================================

def recognize_text(
    image: Image.Image,
) -> str:
    """
    Recognize handwritten text from one
    cropped prescription region.
    """

    if image is None:
        return ""

    processor, model = load_recognizer()

    # -----------------------------------------------------
    # Preprocess
    # -----------------------------------------------------

    image = preprocess_image(
        image
    )

    if image is None:
        return ""

    # -----------------------------------------------------
    # Prepare image for TrOCR
    # -----------------------------------------------------

    pixel_values = processor(
        images=image,
        return_tensors="pt",
    ).pixel_values

    pixel_values = pixel_values.to(
        DEVICE
    )

    # -----------------------------------------------------
    # Generate text
    #
    # num_beams=1 keeps recognition reasonably fast.
    #
    # max_new_tokens=32 is enough for short prescription
    # regions.
    # -----------------------------------------------------

    with torch.inference_mode():

        generated_ids = model.generate(
            pixel_values,
            max_new_tokens=32,
            num_beams=1,
            do_sample=False,
        )

    # -----------------------------------------------------
    # Decode
    # -----------------------------------------------------

    text = processor.batch_decode(
        generated_ids,
        skip_special_tokens=True,
    )[0]

    return text.strip()


# =========================================================
# RECOGNIZE MULTIPLE REGIONS
# =========================================================

def recognize_regions(
    image_regions: List[Image.Image],
) -> List[str]:
    """
    Recognize text from multiple detected regions.

    Very small regions are skipped because they are
    usually noise, punctuation or tiny fragments.
    """

    results = []

    total = len(
        image_regions
    )

    for index, region in enumerate(
        image_regions
    ):

        print(
            f"Recognizing text region "
            f"{index + 1}/{total}..."
        )

        # -------------------------------------------------
        # Invalid region
        # -------------------------------------------------

        if region is None:

            print(
                f"Skipping empty region "
                f"{index + 1}"
            )

            continue

        width, height = region.size

        # -------------------------------------------------
        # Skip extremely tiny regions
        # -------------------------------------------------

        if (
            width < 50
            or height < 25
        ):

            print(
                f"Skipping tiny region "
                f"{index + 1}: "
                f"{width}x{height}"
            )

            continue

        # -------------------------------------------------
        # Recognition
        # -------------------------------------------------

        try:

            text = recognize_text(
                region
            )

        except Exception as exc:

            print(
                f"Recognition failed for "
                f"region {index + 1}: "
                f"{repr(exc)}"
            )

            continue

        # -------------------------------------------------
        # Store result
        # -------------------------------------------------

        if text:

            print(
                f"Recognized: {text}"
            )

            results.append(
                text
            )

        else:

            print(
                f"No text recognized in "
                f"region {index + 1}"
            )

    return results