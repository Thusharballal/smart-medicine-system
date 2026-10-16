from io import BytesIO
from typing import List

import torch
from PIL import Image, ImageOps
from transformers import (
    AutoImageProcessor,
    AutoModelForObjectDetection,
)

from huggingface_hub import hf_hub_download


MODEL_REPO = "wahdan2003/YOLO_handwritten_medical"

_model = None
_processor = None


def load_detector():
    """
    Load the YOLO handwritten prescription detector.

    The model is loaded once and kept in memory.
    """

    global _model
    global _processor

    if _model is not None and _processor is not None:
        return _processor, _model

    print("Loading medical prescription YOLO detector...")

    try:
        # Download the model configuration/weights from Hugging Face.
        model_file = hf_hub_download(
            repo_id=MODEL_REPO,
            filename="best.pt",
        )

    except Exception as exc:
        raise RuntimeError(
            "Unable to download the medical prescription "
            "YOLO model from Hugging Face. "
            "Check your internet connection and HF token."
        ) from exc

    try:
        from ultralytics import YOLO

        _model = YOLO(model_file)

    except Exception as exc:
        raise RuntimeError(
            "Unable to load the YOLO prescription model."
        ) from exc

    print(
        "Medical prescription YOLO detector loaded."
    )

    return _processor, _model


def detect_text_regions(
    image_bytes: bytes,
) -> List[Image.Image]:
    """
    Detect handwritten text regions from a prescription.

    Pipeline based on the selected GitHub project:

        Image
          ↓
        YOLO
          ↓
        bounding boxes
          ↓
        sort by Y-coordinate
          ↓
        crop regions
          ↓
        pad to 384x384
          ↓
        TrOCR
    """

    # -------------------------------------------------
    # Open image
    # -------------------------------------------------

    try:

        image = Image.open(
            BytesIO(image_bytes)
        ).convert("RGB")

    except Exception as exc:

        raise ValueError(
            "The uploaded file is not a valid image."
        ) from exc

    # -------------------------------------------------
    # Load detector
    # -------------------------------------------------

    _, model = load_detector()

    print(
        "Detecting prescription text regions..."
    )

    # -------------------------------------------------
    # YOLO prediction
    #
    # GitHub project:
    # confidence = 0.5
    # IoU = 0.6
    # -------------------------------------------------

    results = model.predict(
        source=image,
        conf=0.5,
        iou=0.6,
        imgsz=640,
        verbose=False,
    )

    if not results:

        print(
            "YOLO returned no results."
        )

        return []

    result = results[0]

    if result.boxes is None:

        print(
            "No text boxes detected."
        )

        return []

    # -------------------------------------------------
    # Extract bounding boxes
    # -------------------------------------------------

    boxes = []

    image_width, image_height = image.size

    for box in result.boxes.xyxy:

        x1, y1, x2, y2 = (
            box.tolist()
        )

        x1 = max(
            0,
            int(x1)
        )

        y1 = max(
            0,
            int(y1)
        )

        x2 = min(
            image_width,
            int(x2)
        )

        y2 = min(
            image_height,
            int(y2)
        )

        if x2 <= x1 or y2 <= y1:
            continue

        boxes.append(
            (
                x1,
                y1,
                x2,
                y2,
            )
        )

    # -------------------------------------------------
    # Sort boxes by Y-coordinate
    #
    # This preserves reading order.
    # -------------------------------------------------

    boxes.sort(
        key=lambda box: box[1]
    )

    print(
        f"Detected {len(boxes)} text regions."
    )

    # -------------------------------------------------
    # Crop and pad
    # -------------------------------------------------

    crops = []

    for index, (
        x1,
        y1,
        x2,
        y2,
    ) in enumerate(boxes):

        crop = image.crop(
            (
                x1,
                y1,
                x2,
                y2,
            )
        )

        # -------------------------------------------------
        # Pad crop to square
        # -------------------------------------------------

        width, height = crop.size

        size = max(
            width,
            height,
        )

        padded = ImageOps.pad(
            crop,
            (
                384,
                384,
            ),
            method=Image.Resampling.LANCZOS,
            color="white",
            centering=(0.5, 0.5),
        )

        crops.append(
            padded
        )

        print(
            f"Prepared text region "
            f"{index + 1}: "
            f"{width}x{height} → 384x384"
        )

    return crops