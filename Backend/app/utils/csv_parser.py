import re
from datetime import datetime
from typing import List, Dict, Any
import pandas as pd
# ============================================================
# CSV COLUMN ALIASES
# ============================================================
COLUMN_ALIASES = {
    "medicine_name": [
        "medicine_name",
        "medicine",
        "medicine name",
        "product",
        "product name",
        "drug",
        "drug name",
        "name",
    ],
    "batch_number": [
        "batch_number",
        "batch number",
        "batch_no",
        "batch no",
        "batch",
    ],
    "manufacturing_date": [
        "manufacturing_date",
        "manufacturing date",
        "mfg_date",
        "mfg date",
        "mfg",
        "manufactured date",
    ],
    "expiry_date": [
        "expiry_date",
        "expiry date",
        "exp_date",
        "exp date",
        "expiry",
        "exp",
    ],
    "quantity": [
        "quantity",
        "qty",
        "quantity_received",
        "quantity received",
        "stock",
        "units",
    ],
    "purchase_price": [
        "purchase_price",
        "purchase price",
        "purchase",
        "buying price",
        "buy price",
        "cost",
        "cost price",
        "rate",
    ],
    "mrp": [
        "mrp",
        "mrp price",
        "maximum retail price",
        "selling price",
    ],
    "supplier_name": [
        "supplier_name",
        "supplier name",
        "supplier",
        "vendor",
        "vendor name",
    ],
    "invoice_number": [
        "invoice_number",
        "invoice number",
        "invoice_no",
        "invoice no",
        "invoice",
        "bill number",
        "bill no",
    ],
}
# ============================================================
# NORMALIZE COLUMN NAME
# ============================================================
def normalize_column_name(column_name: Any) -> str:
    """
    Normalize CSV column names so that different supplier
    naming conventions can be handled.
    """
    value = str(column_name).strip().lower()
    value = re.sub(
        r"[^a-z0-9]+",
        " ",
        value,
    )
    value = re.sub(
        r"\s+",
        " ",
        value,
    ).strip()
    return value
# ============================================================
# FIND STANDARD FIELD
# ============================================================
def find_standard_field(
    column_name: str,
) -> str | None:
    """
    Convert a supplier-specific column name into one of
    our standard import fields.
    """
    normalized = normalize_column_name(
        column_name
    )
    for standard_field, aliases in COLUMN_ALIASES.items():
        for alias in aliases:
            if normalized == normalize_column_name(alias):
                return standard_field
    return None
# ============================================================
# CLEAN VALUE
# ============================================================
def clean_value(value: Any) -> Any:
    """
    Clean values extracted from CSV.
    """
    if pd.isna(value):
        return None
    if isinstance(value, str):
        value = value.strip()
        if not value:
            return None
    return value
# ============================================================
# CLEAN PRICE
# ============================================================
def clean_price(value: Any) -> float | None:
    """
    Convert values such as:
        18
        18.50
        ₹18
        ₹18.50
        Rs. 18
    into float.
    """
    value = clean_value(value)
    if value is None:
        return None
    if isinstance(value, (int, float)):
        return float(value)
    value = str(value)
    value = value.replace(
        "₹",
        "",
    )
    value = value.replace(
        "Rs.",
        "",
    )
    value = value.replace(
        "Rs",
        "",
    )
    value = value.replace(
        ",",
        "",
    )
    value = value.strip()
    match = re.search(
        r"-?\d+(?:\.\d+)?",
        value,
    )
    if not match:
        return None
    return float(
        match.group()
    )
# ============================================================
# CLEAN QUANTITY
# ============================================================
def clean_quantity(value: Any) -> int | None:
    """
    Convert quantity values such as:
        100
        100.0
        "100 units"
        "Qty: 100"
    into integer.
    """
    value = clean_value(value)
    if value is None:
        return None
    if isinstance(value, int):
        return value
    if isinstance(value, float):
        return int(value)
    value = str(value)
    match = re.search(
        r"\d+",
        value,
    )
    if not match:
        return None
    return int(
        match.group()
    )
# ============================================================
# CLEAN DATE
# ============================================================
def clean_date(value: Any) -> datetime | None:
    """
    Convert common supplier date formats into datetime.
    Examples:
        2026-08-01
        01/08/2026
        01-08-2026
        01-Aug-2026
    """
    value = clean_value(value)
    if value is None:
        return None
    if isinstance(value, datetime):
        return value
    try:
        parsed = pd.to_datetime(
            value,
            dayfirst=True,
            errors="coerce",
        )
        if pd.isna(parsed):
            return None
        return parsed.to_pydatetime()
    except Exception:
        return None
# ============================================================
# NORMALIZE ROW
# ============================================================
def normalize_csv_row(
    row: Dict[str, Any],
) -> Dict[str, Any]:
    """
    Convert one raw CSV row into our standard
    inventory import structure.
    """
    normalized_row = {}
    for key, value in row.items():
        standard_field = find_standard_field(
            key
        )
        if standard_field:
            normalized_row[
                standard_field
            ] = clean_value(value)
    # --------------------------------------------------------
    # Convert special fields
    # --------------------------------------------------------
    if "quantity" in normalized_row:
        normalized_row["quantity"] = clean_quantity(
            normalized_row["quantity"]
        )
    if "purchase_price" in normalized_row:
        normalized_row["purchase_price"] = clean_price(
            normalized_row["purchase_price"]
        )
    if "mrp" in normalized_row:
        normalized_row["mrp"] = clean_price(
            normalized_row["mrp"]
        )
    if "manufacturing_date" in normalized_row:
        normalized_row["manufacturing_date"] = clean_date(
            normalized_row["manufacturing_date"]
        )
    if "expiry_date" in normalized_row:
        normalized_row["expiry_date"] = clean_date(
            normalized_row["expiry_date"]
        )
    return normalized_row
# ============================================================
# VALIDATE REQUIRED CSV FIELDS
# ============================================================
def validate_csv_row(
    row: Dict[str, Any],
) -> List[str]:
    """
    Validate the fields required for inventory import.
    """
    errors = []
    required_fields = [
        "medicine_name",
        "batch_number",
        "manufacturing_date",
        "expiry_date",
        "quantity",
        "purchase_price",
        "mrp",
        "supplier_name",
        "invoice_number",
    ]
    for field in required_fields:
        value = row.get(field)
        if value is None or value == "":
            errors.append(
                f"{field} is required."
            )
    # --------------------------------------------------------
    # Quantity validation
    # -------------------------------------------------------
    quantity = row.get(
        "quantity"
    )
    if quantity is not None:
        if quantity <= 0:
            errors.append(
                "Quantity must be greater than zero."
            )
    # --------------------------------------------------------
    # Purchase price validation
    # --------------------------------------------------------
    purchase_price = row.get(
        "purchase_price"
    )
    if purchase_price is not None:
        if purchase_price <= 0:
            errors.append(
                "Purchase price must be greater than zero."
            )
    # --------------------------------------------------------
    # MRP validation
    # --------------------------------------------------------
    mrp = row.get(
        "mrp"
    )
    if mrp is not None:
        if mrp <= 0:
            errors.append(
                "MRP must be greater than zero."
            )
    # --------------------------------------------------------
    # Price relationship
    # --------------------------------------------------------
    if (
        purchase_price is not None
        and mrp is not None
        and mrp < purchase_price
    ):
        errors.append(
            "MRP cannot be lower than purchase price."
        )
    # --------------------------------------------------------
    # Date validation
    # --------------------------------------------------------
    manufacturing_date = row.get(
        "manufacturing_date"
    )
    expiry_date = row.get(
        "expiry_date"
    )
    if (
        manufacturing_date is not None
        and expiry_date is not None
        and manufacturing_date > expiry_date
    ):
        errors.append(
            "Manufacturing date cannot be after expiry date."
        )
    return errors
# ============================================================
# PARSE CSV FILE
# ============================================================
def parse_csv_file(
    file_path: str,
) -> List[Dict[str, Any]]:
    """
    Read and normalize a supplier CSV file.
    Returns a list of normalized inventory rows.
    """
    try:
        dataframe = pd.read_csv(
            file_path,
            dtype=str,
        )
    except Exception as error:
        raise ValueError(
            f"Unable to read CSV file: {error}"
        )
    if dataframe.empty:
        raise ValueError(
            "CSV file is empty."
        )
    # --------------------------------------------------------
    # Remove completely empty rows
    # --------------------------------------------------------
    dataframe = dataframe.dropna(
        how="all"
    )
    if dataframe.empty:
        raise ValueError(
            "CSV file does not contain any data rows."
        )
    rows = []
    for _, dataframe_row in dataframe.iterrows():
        raw_row = dataframe_row.to_dict()
        normalized_row = normalize_csv_row(
            raw_row
        )
        errors = validate_csv_row(
            normalized_row
        )
        normalized_row["errors"] = errors
        rows.append(
            normalized_row
        )
    return rows