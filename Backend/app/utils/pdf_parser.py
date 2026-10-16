import re
from datetime import datetime
from typing import Any, Dict, List, Optional
import pdfplumber
# ============================================================
# COLUMN ALIASES
# ============================================================
COLUMN_ALIASES = {
    "medicine_name": [
        "medicine",
        "medicine name",
        "product",
        "product name",
        "drug",
        "drug name",
        "item",
        "item name",
        "name",
    ],
    "generic_name": [
        "generic",
        "generic name",
        "generic medicine",
    ],
    "jan_aushadhi_name": [
        "jan aushadhi",
        "janaushadhi",
        "pm jan aushadhi",
        "pmbjp name",
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
        "batch code",
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
        "quantity received",
    ],
    "purchase_price": [
        "purchase price",
        "buy price",
        "cost price",
        "cost",
        "purchase rate",
        "rate",
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
# ============================================================
# BASIC HELPERS
# ============================================================
def normalize_text(value: Any) -> str:
    """
    Convert any value into clean normalized text.
    """
    if value is None:
        return ""
    value = str(value)
    value = value.replace("\n", " ")
    value = value.replace("\r", " ")
    value = re.sub(r"\s+", " ", value)
    return value.strip()
def normalize_column_name(value: Any) -> str:
    """
    Normalize a PDF table column name.
    """
    value = normalize_text(value).lower()
    value = value.replace("_", " ")
    value = value.replace("-", " ")
    value = re.sub(r"[^\w\s]", " ", value)
    value = re.sub(r"\s+", " ", value)
    return value.strip()
def find_standard_field(column_name: str) -> Optional[str]:
    """
    Match a PDF column name against known aliases.
    """
    normalized = normalize_column_name(column_name)
    if not normalized:
        return None
    for standard_field, aliases in COLUMN_ALIASES.items():
        for alias in aliases:
            alias_normalized = normalize_column_name(alias)
            if normalized == alias_normalized:
                return standard_field
    # Fuzzy contains matching
    for standard_field, aliases in COLUMN_ALIASES.items():
        for alias in aliases:
            alias_normalized = normalize_column_name(alias)
            if (
                alias_normalized in normalized
                or normalized in alias_normalized
            ):
                return standard_field
    return None
# ============================================================
# PRICE / QUANTITY / DATE CLEANING
# ============================================================
def clean_price(value: Any) -> Optional[float]:
    """
    Convert price text such as:
        ₹120.50
        Rs. 120
        1,250.00
        120
    into float.
    """
    if value is None:
        return None
    text = normalize_text(value)
    if not text:
        return None
    text = (
        text.replace("₹", "")
        .replace("Rs.", "")
        .replace("Rs", "")
        .replace("INR", "")
        .replace(",", "")
    )
    match = re.search(r"-?\d+(?:\.\d+)?", text)
    if not match:
        return None
    try:
        return float(match.group())
    except ValueError:
        return None
def clean_quantity(value: Any) -> Optional[int]:
    """
    Convert quantity text into integer.
    """
    if value is None:
        return None
    text = normalize_text(value)
    if not text:
        return None
    text = text.replace(",", "")
    match = re.search(r"\d+", text)
    if not match:
        return None
    try:
        return int(match.group())
    except ValueError:
        return None
def clean_date(value: Any) -> Optional[datetime]:
    """
    Parse common medicine date formats.
    """
    if value is None:
        return None
    text = normalize_text(value)
    if not text:
        return None
    formats = [
        "%d/%m/%Y",
        "%d-%m-%Y",
        "%d.%m.%Y",
        "%d/%m/%y",
        "%d-%m-%y",
        "%d.%m.%y",
        "%m/%Y",
        "%m-%Y",
        "%Y-%m-%d",
        "%Y/%m/%d",
        "%d %b %Y",
        "%d %B %Y",
        "%b %Y",
        "%B %Y",
    ]
    for fmt in formats:
        try:
            parsed = datetime.strptime(text, fmt)
            # If only month/year is provided,
            # use the first day of that month.
            if fmt in ("%m/%Y", "%m-%Y", "%b %Y", "%B %Y"):
                parsed = parsed.replace(day=1)
            return parsed
        except ValueError:
            continue
    # Final fallback for strings containing a recognizable date
    match = re.search(
        r"\b(\d{1,2})[/-](\d{1,2})[/-](\d{2,4})\b",
        text,
    )
    if match:
        day = int(match.group(1))
        month = int(match.group(2))
        year = int(match.group(3))
        if year < 100:
            year += 2000
        try:
            return datetime(year, month, day)
        except ValueError:
            return None
    return None
# ============================================================
# TABLE EXTRACTION
# ============================================================
def extract_pdf_tables(file_path: str) -> List[List[List[str]]]:
    """
    Extract tables from a text-based PDF.
    Returns:
        [
            [
                ["Medicine", "Batch", "Qty", "MRP"],
                ["Paracetamol", "PCM001", "100", "20"]
            ]
        ]
    """
    all_tables: List[List[List[str]]] = []
    with pdfplumber.open(file_path) as pdf:
        for page in pdf.pages:
            try:
                tables = page.extract_tables()
                if not tables:
                    continue
                for table in tables:
                    if not table:
                        continue
                    cleaned_table = []
                    for row in table:
                        if not row:
                            continue
                        cleaned_row = [
                            normalize_text(cell)
                            for cell in row
                        ]
                        # Ignore completely empty rows
                        if any(cleaned_row):
                            cleaned_table.append(cleaned_row)
                    if cleaned_table:
                        all_tables.append(cleaned_table)
            except Exception:
                continue
    return all_tables
# ============================================================
# TABLE → STANDARD ROWS
# ============================================================
def table_to_rows(
    table: List[List[str]],
) -> List[Dict[str, Any]]:
    """
    Convert a PDF table into normalized inventory rows.
    The first row is treated as the header.
    """
    if not table or len(table) < 2:
        return []
    header = table[0]
    field_mapping: Dict[int, str] = {}
    for index, column in enumerate(header):
        standard_field = find_standard_field(column)
        if standard_field:
            field_mapping[index] = standard_field
    # If almost nothing matched, this probably isn't
    # an inventory table.
    if not field_mapping:
        return []
    rows: List[Dict[str, Any]] = []
    for raw_row in table[1:]:
        if not raw_row:
            continue
        row: Dict[str, Any] = {}
        for index, value in enumerate(raw_row):
            if index not in field_mapping:
                continue
            field = field_mapping[index]
            row[field] = normalize_text(value)
        if not row:
            continue
        # Convert known values
        if "quantity" in row:
            row["quantity"] = clean_quantity(row["quantity"])
        if "purchase_price" in row:
            row["purchase_price"] = clean_price(
                row["purchase_price"]
            )
        if "mrp" in row:
            row["mrp"] = clean_price(row["mrp"])
        if "manufacturing_date" in row:
            row["manufacturing_date"] = clean_date(
                row["manufacturing_date"]
            )
        if "expiry_date" in row:
            row["expiry_date"] = clean_date(
                row["expiry_date"]
            )
        rows.append(row)
    return rows
# ============================================================
# TEXT EXTRACTION
# ============================================================
def extract_pdf_text(file_path: str) -> str:
    """
    Extract selectable text from a normal PDF.
    """
    pages_text: List[str] = []
    with pdfplumber.open(file_path) as pdf:
        for page in pdf.pages:
            try:
                text = page.extract_text()
                if text:
                    pages_text.append(text)
            except Exception:
                continue
    return "\n".join(pages_text)
# ============================================================
# KEY-VALUE TEXT PARSER
# ============================================================
def parse_key_value_text(text: str) -> Dict[str, Any]:
    """
    Parse text like:
        Medicine Name: Paracetamol
        Batch No: PCM001
        Quantity: 100
        MRP: ₹20
        Expiry Date: 20/09/2027

    """
    result: Dict[str, Any] = {}
    if not text:
        return result
    lines = text.splitlines()
    for line in lines:
        line = normalize_text(line)
        if not line:
            continue
        # Support:
        # Key: Value
        # Key - Value
        match = re.match(
            r"^(.+?)\s*(?::|-)\s*(.+)$",
            line,
        )
        if not match:
            continue
        key = normalize_column_name(match.group(1))
        value = normalize_text(match.group(2))
        standard_field = find_standard_field(key)
        if not standard_field:
            continue
        result[standard_field] = value
    # Convert fields
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
# VALIDATION
# ============================================================
def validate_pdf_row(row: Dict[str, Any]) -> List[str]:
    """
    Validate a normalized PDF inventory row.
    """
    errors: List[str] = []
    medicine_name = row.get("medicine_name")
    if not medicine_name:
        errors.append("Medicine name is missing.")
    quantity = row.get("quantity")
    if quantity is None:
        errors.append("Quantity is missing.")
    elif quantity <= 0:
        errors.append("Quantity must be greater than 0.")
    purchase_price = row.get("purchase_price")
    if purchase_price is None:
        errors.append("Purchase price is missing.")
    elif purchase_price <= 0:
        errors.append("Purchase price must be greater than 0.")
    mrp = row.get("mrp")
    if mrp is None:
        errors.append("MRP is missing.")
    elif mrp <= 0:
        errors.append("MRP must be greater than 0.")
    if (
        purchase_price is not None
        and mrp is not None
        and mrp < purchase_price
    ):
        errors.append(
            "MRP cannot be lower than purchase price."
        )
    manufacturing_date = row.get(
        "manufacturing_date"
    )
    expiry_date = row.get("expiry_date")
    if (
        manufacturing_date
        and expiry_date
        and manufacturing_date > expiry_date
    ):
        errors.append(
            "Manufacturing date cannot be after expiry date."
        )
    return errors
# ============================================================
# MAIN PDF PARSER
# ============================================================
def parse_pdf_file(file_path: str) -> List[Dict[str, Any]]:
    """
    Main parser for normal/text-based supplier PDFs.
    Strategy:
        1. Extract tables.
        2. Convert recognized tables into inventory rows.
        3. If no usable tables are found, extract text.
        4. Try key-value parsing as fallback.
    """
    rows: List[Dict[str, Any]] = []
    # -------------------------------------------------------
    # STEP 1: TABLE EXTRACTION
    # --------------------------------------------------------
    try:
        tables = extract_pdf_tables(file_path)
        for table in tables:
            table_rows = table_to_rows(table)
            if table_rows:
                rows.extend(table_rows)
    except Exception:
        tables = []
    # --------------------------------------------------------
    # STEP 2: TEXT FALLBACK
    # --------------------------------------------------------
    if not rows:
        try:
            text = extract_pdf_text(file_path)
            if text:
                row = parse_key_value_text(text)
                if row:
                    rows.append(row)
        except Exception:
            pass
    # --------------------------------------------------------
    # STEP 3: NORMALIZE + VALIDATE
    # --------------------------------------------------------
    normalized_rows: List[Dict[str, Any]] = []
    for row in rows:
        cleaned_row: Dict[str, Any] = {}
        for key, value in row.items():
            if isinstance(value, str):
                cleaned_row[key] = normalize_text(value)
            else:
                cleaned_row[key] = value
        # If medicine_name is missing but generic_name exists,
        # use generic name as the searchable medicine name.
        if (
            not cleaned_row.get("medicine_name")
            and cleaned_row.get("generic_name")
        ):
            cleaned_row["medicine_name"] = (
                cleaned_row["generic_name"]
            )
        cleaned_row["errors"] = validate_pdf_row(
            cleaned_row
        )
        normalized_rows.append(cleaned_row)
    return normalized_rows
# ============================================================
# PDF TYPE DETECTION
# ============================================================
def is_text_pdf(file_path: str) -> bool:
    """
    Determine whether the PDF contains selectable text.
    Returns:
        True  -> normal/text PDF
        False -> likely scanned/image PDF
    """
    try:
        text = extract_pdf_text(file_path)
        # A small amount of text is enough to indicate that
        # the PDF contains a text layer.
        return len(text.strip()) > 20
    except Exception:
        return False