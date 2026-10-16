from fastapi import (
    APIRouter,
    File,
    HTTPException,
    UploadFile,
    status,
)

from app.schemas.ocr_schema import OCRResponse
from app.services.ocr_service import process_prescription


router = APIRouter(
    prefix="/ocr",
    tags=["Prescription OCR"],
)


@router.post(
    "/prescription",
    response_model=OCRResponse,
    status_code=status.HTTP_200_OK,
)
async def scan_prescription(
    image: UploadFile = File(...),
):
    """
    Upload a prescription image and process OCR.

    Endpoint:

        POST /api/v1/ocr/prescription
    """

    # =====================================================
    # 1. VALIDATE FILE TYPE
    # =====================================================

    allowed_types = {
        "image/jpeg",
        "image/jpg",
        "image/png",
        "image/webp",
    }

    if image.content_type not in allowed_types:

        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail=(
                "Invalid file type. "
                "Please upload JPG, JPEG, PNG, or WEBP."
            ),
        )

    # =====================================================
    # 2. READ IMAGE
    # =====================================================

    try:

        image_bytes = await image.read()

    except Exception as exc:

        print(
            "IMAGE READ ERROR:",
            repr(exc),
        )

        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail=(
                "Unable to read the uploaded image."
            ),
        ) from exc

    if not image_bytes:

        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail=(
                "Uploaded prescription image is empty."
            ),
        )

    # =====================================================
    # 3. PROCESS OCR
    # =====================================================

    try:

        result = await process_prescription(
            image_bytes
        )

    except ValueError as exc:

        print(
            "\n=============================="
        )

        print(
            "OCR VALUE ERROR"
        )

        print(
            "=============================="
        )

        print(
            repr(exc)
        )

        print(
            "==============================\n"
        )

        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail=str(exc),
        ) from exc

    except Exception as exc:

        print(
            "\n=============================="
        )

        print(
            "OCR UNEXPECTED ERROR"
        )

        print(
            "=============================="
        )

        print(
            "Error type:",
            type(exc).__name__,
        )

        print(
            "Error:",
            repr(exc),
        )

        print(
            "==============================\n"
        )

        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail=(
                "Prescription OCR processing failed: "
                f"{type(exc).__name__}: {str(exc)}"
            ),
        ) from exc

    # =====================================================
    # 4. RETURN RESULT
    # =====================================================

    return OCRResponse(
        success=True,

        recognized_text=result.get(
            "recognized_text",
            [],
        ),

        medicines=result.get(
            "medicines",
            [],
        ),

        message=(
            "Prescription processed successfully."
        ),
    )