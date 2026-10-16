import os
import re
from datetime import datetime
from typing import Any, Dict, List, Optional
import pdf2image
import pytesseract
# ============================================================
# TESSERACT CONFIGURATION
# ============================================================
# If Tesseract is installed in the default Windows location,
# this path will work.
# If you installed Tesseract somewhere else, change this path.
TESSERACT_PATH = r"C:\Program Files\Tesseract-OCR\tesseract.exe"
if os.path.exists(TESSERACT_PATH):
    pytesseract.pytesseract.tesseract_cmd = TESSERACT_PATH
# ============================================================
# TEXT CLEANING
# ============================================================
def clean_ocr_text(text: str) -> str:
    """
    Clean raw OCR text.
    """
    if not text:
        return ""
    text = text.replace("\r", "\n")
    # Remove excessive spaces
    text = re.sub(r"[ \t]+", " ", text)
    # Remove excessive blank lines
    text = re.sub(r"\n{3,}", "\n\n", text)
    return text.strip()
# ============================================================
# PDF → IMAGES
# ============================================================
def convert_pdf_to_images(
    file_path: str,
    dpi: int = 300,
) -> List[Any]:
    """
    Convert each PDF page into an image.
    Higher DPI generally improves OCR accuracy but
    requires more memory and processing time.
    """
    if not os.path.exists(file_path):
        raise FileNotFoundError(
            f"PDF file not found: {file_path}"
        )
    images = pdf2image.convert_from_path(
        file_path,
        dpi=dpi,
    )
    return images
# ============================================================
# IMAGE → OCR TEXT
# ============================================================
def extract_text_from_image(
    image: Any,
) -> str:
    """
    Extract text from one PDF page image using Tesseract.
    """
    try:
        text = pytesseract.image_to_string(
            image,
            config="--psm 6",
        )
        return clean_ocr_text(text)
    except Exception as exc:
        raise RuntimeError(
            f"OCR failed: {str(exc)}"
        )
# ============================================================
# COMPLETE PDF OCR
# ============================================================
def extract_ocr_text(
    file_path: str,
    dpi: int = 300,
) -> str:
    """
    Convert a scanned PDF into images and extract
    text from every page.
    """
    images = convert_pdf_to_images(
        file_path=file_path,
        dpi=dpi,
    )
    pages: List[str] = []
    for page_number, image in enumerate(images, start=1):
        try:
            page_text = extract_text_from_image(
                image
            )
            if page_text:
                pages.append(
                    f"--- Page {page_number} ---\n"
                    f"{page_text}"
                )
        except Exception as exc:
            pages.append(
                f"--- Page {page_number} OCR Error ---\n"
                f"{str(exc)}"
            )
    return "\n\n".join(pages)
# ============================================================
# OCR KEY-VALUE PARSER
# ============================================================
def normalize_key(key: str) -> str:
    """
    Normalize OCR field labels.
    """
    key = key.lower().strip()
    key = key.replace("_", " ")
    key = key.replace("-", " ")
    key = re.sub(r"[^\w\s]", " ", key)
    key = re.sub(r"\s+", " ", key)
    return key.strip()
def identify_field(key: str) -> Optional[str]:
    """
    Identify an inventory field from OCR text.
    """
    key = normalize_key(key)
    aliases = {
        "medicine_name": [
            "medicine",
            "medicine name",
            "product",
            "product name",
            "drug",
            "drug name",
            "item",
            "item name",
        ],
        "generic_name": [
            "generic",
            "generic name",
        ],
        "jan_aushadhi_name": [
            "jan aushadhi",
            "janaushadhi",
            "pmbjp",
        ],
        "strength": [
            "strength",
            "dose",
            "dosage",
        ],
        "batch_number": [
            "batch",
            "batch no",
            "batch number",
        ],
        "manufacturing_date": [
            "mfg",
            "mfg date",
            "manufacturing date",
            "manufactured date",
        ],
        "expiry_date": [
            "exp",
            "exp date",
            "expiry",
            "expiry date",
            "expiration",
            "expiration date",
        ],
        "quantity": [
            "qty",
            "quantity",
            "stock",
            "units",
        ],
        "purchase_price": [
            "purchase price",
            "buy price",
            "cost price",
            "cost",
            "purchase rate",
        ],
        "mrp": [
            "mrp",
            "maximum retail price",
            "retail price",
            "selling price",
        ],
        "supplier_name": [
            "supplier",
            "supplier name",
            "vendor",
            "vendor name",
        ],
        "invoice_number": [
            "invoice",
            "invoice no",
            "invoice number",
            "bill no",
            "bill number",
        ],
    }
    for field, field_aliases in aliases.items():
        for alias in field_aliases:
            if key == normalize_key(alias):
                return field
    return None
# ============================================================
# VALUE CLEANING
# ============================================================
def clean_price(
    value: str,
) -> Optional[float]:
    """
    Extract price from OCR text.
    """
    if not value:
        return None
    value = (
        value
        .replace("₹", "")
        .replace("Rs.", "")
        .replace("Rs", "")
        .replace("INR", "")
        .replace(",", "")
    )
    match = re.search(
        r"\d+(?:\.\d+)?",
        value,
    )
    if not match:
        return None
    try:
        return float(match.group())
    except ValueError:
        return None
def clean_quantity(
    value: str,
) -> Optional[int]:
    """
    Extract quantity from OCR text.
    """
    if not value:
        return None
    value = value.replace(",", "")
    match = re.search(
        r"\d+",
        value,
    )
    if not match:
        return None
    try:
        return int(match.group())
    except ValueError:
        return None
def clean_date(
    value: str,
) -> Optional[datetime]:
    """
    Parse common medicine dates.
    """
    if not value:
        return None
    value = value.strip()
    formats = [
        "%d/%m/%Y",
        "%d-%m-%Y",
        "%d.%m.%Y",
        "%d/%m/%y",
        "%d-%m-%y",
        "%d.%m.%y",
        "%Y-%m-%d",
        "%Y/%m/%d",
        "%m/%Y",
        "%m-%Y",
    ]
    for date_format in formats:
        try:
            parsed = datetime.strptime(
                value,
                date_format,
            )
            if date_format in (
                "%m/%Y",
                "%m-%Y",
            ):
                parsed = parsed.replace(day=1)
            return parsed
        except ValueError:
            continue
    return None
# ============================================================
# KEY-VALUE OCR EXTRACTION
# ============================================================
def parse_ocr_key_value_text(
    text: str,
) -> Dict[str, Any]:
    """
    Parse OCR text such as:
        Medicine Name: Paracetamol
        Batch No: PCM001
        Quantity: 100
        MRP: 20
        Expiry Date: 20/09/2027
    """
    result: Dict[str, Any] = {}
    if not text:
        return result
    for line in text.splitlines():
        line = line.strip()
        if not line:
            continue
        # Supports:
        # Medicine: Paracetamol
        # Medicine - Paracetamol
        # Medicine = Paracetamol
        match = re.match(
            r"^(.+?)\s*(?::|=|-)\s*(.+)$",
            line,
        )
        if not match:
            continue
        key = match.group(1).strip()
        value = match.group(2).strip()
        field = identify_field(key)
        if not field:
            continue
        result[field] = value
    # Convert numeric/date fields
    if "quantity" in result:
        result["quantity"] = clean_quantity(
            result["quantity"]
        )
    if "purchase_price" in result:
        result["purchase_price"] = clean_price(
            result["purchase_price"]
        )
    if "mrp" in result:
        result["mrp"] = clean_price(
            result["mrp"]
        )
    if "manufacturing_date" in result:
        result["manufacturing_date"] = clean_date(
            result["manufacturing_date"]
        )
    if "expiry_date" in result:
        result["expiry_date"] = clean_date(
            result["expiry_date"]
        )
    return result
# ============================================================
# MAIN OCR PARSER
# ============================================================
def parse_scanned_pdf(
    file_path: str,
) -> List[Dict[str, Any]]:
    """
    Main function used by the inventory import service.
    Process:

        Scanned PDF
             ↓
        PDF pages → images
             ↓
        Tesseract OCR
             ↓
        Extract text
             ↓
        Parse inventory fields
    """
    ocr_text = extract_ocr_text(
        file_path
    )
    if not ocr_text:
        return []
    rows: List[Dict[str, Any]] = []
    # Split pages
    pages = re.split(
        r"--- Page \d+ ---",
        ocr_text,
    )
    for page in pages:
        page = page.strip()
        if not page:
            continue
        row = parse_ocr_key_value_text(
            page
        )
        if row:
            rows.append(row)
    return rows
# ============================================================
# OCR AVAILABILITY CHECK
# ============================================================
def is_tesseract_available() -> bool:
    """
    Check whether Tesseract OCR is available.
    """
    try:
        pytesseract.get_tesseract_version()
        return True
    except Exception:
        return False