from pathlib import Path
from typing import Optional

import pandas as pd
from symspellpy import SymSpell, Verbosity


# =========================================================
# MEDICINE DATABASE
# =========================================================

BASE_DIR = Path(__file__).resolve().parents[3]

DATABASE_FILE = (
    BASE_DIR
    / "data"
    / "database.xlsx"
)


# =========================================================
# GLOBAL CACHE
# =========================================================

_symspell = None
_medicine_names = []


# =========================================================
# LOAD MEDICINE DATABASE
# =========================================================

def load_medicine_database():
    """
    Load medicine names from database.xlsx.

    Expected database structure:

        text        medicine
        --------------------
        Telmisartan 1
        Amlodipine  1
        Atorvastatin 1
        Ecosprin AV 1
        Pantoprazole 1

    The 'text' column contains the actual text.

    The 'medicine' column contains the classification:

        1 = medicine
        0 = non-medicine/instruction
    """

    global _symspell
    global _medicine_names

    # -----------------------------------------------------
    # Return cached database if already loaded
    # -----------------------------------------------------

    if _symspell is not None:
        return (
            _symspell,
            _medicine_names
        )

    # -----------------------------------------------------
    # Check database file
    # -----------------------------------------------------

    if not DATABASE_FILE.exists():
        raise FileNotFoundError(
            f"Medicine database not found: "
            f"{DATABASE_FILE}"
        )

    print(
        "Loading medicine database..."
    )

    # -----------------------------------------------------
    # Read Excel
    # -----------------------------------------------------

    dataframe = pd.read_excel(
        DATABASE_FILE
    )

    print(
        "Medicine database columns:",
        list(dataframe.columns)
    )

    # -----------------------------------------------------
    # Check required columns
    # -----------------------------------------------------

    if "text" not in dataframe.columns:

        raise ValueError(
            "database.xlsx must contain "
            "a 'text' column. "
            f"Available columns: "
            f"{list(dataframe.columns)}"
        )

    if "medicine" not in dataframe.columns:

        raise ValueError(
            "database.xlsx must contain "
            "a 'medicine' column. "
            f"Available columns: "
            f"{list(dataframe.columns)}"
        )

    # =====================================================
    # SELECT MEDICINE ROWS
    # =====================================================

    medicine_column = (
        dataframe["medicine"]
        .astype(str)
        .str.strip()
        .str.lower()
    )

    # Accept common representations of 1
    medicine_rows = dataframe[
        medicine_column.isin(
            [
                "1",
                "1.0",
                "true",
                "yes",
                "medicine",
            ]
        )
    ]

    print(
        "Medicine rows found:",
        len(medicine_rows)
    )

    # =====================================================
    # EXTRACT MEDICINE NAMES
    # =====================================================

    names = (
        medicine_rows["text"]
        .dropna()
        .astype(str)
        .str.strip()
        .tolist()
    )

    # -----------------------------------------------------
    # Remove empty names
    # -----------------------------------------------------

    names = [
        name
        for name in names
        if name
        and len(name) >= 3
    ]

    # -----------------------------------------------------
    # Remove duplicates
    # -----------------------------------------------------

    unique_names = []

    seen = set()

    for name in names:

        key = name.lower()

        if key not in seen:

            seen.add(key)

            unique_names.append(
                name
            )

    names = unique_names

    # -----------------------------------------------------
    # Check result
    # -----------------------------------------------------

    if not names:

        raise ValueError(
            "No medicine names were found "
            "in database.xlsx. "
            "Check the 'text' and "
            "'medicine' columns."
        )

    _medicine_names = names

    print(
        f"Medicine database loaded: "
        f"{len(_medicine_names)} medicines."
    )

    # =====================================================
    # CREATE SYMSPELL
    # =====================================================

    _symspell = SymSpell(
        max_dictionary_edit_distance=2,
        prefix_length=7,
    )

    # -----------------------------------------------------
    # Add medicine words
    # -----------------------------------------------------

    for name in names:

        words = (
            name
            .lower()
            .split()
        )

        for word in words:

            cleaned = word.strip(
                ".,;:()[]{}"
            )

            if len(cleaned) >= 3:

                _symspell.create_dictionary_entry(
                    cleaned,
                    1,
                )

    print(
        "SymSpell dictionary created."
    )

    return (
        _symspell,
        _medicine_names
    )


# =========================================================
# NORMALIZE TEXT
# =========================================================

def normalize_text(
    text: str
) -> str:
    """
    Normalize OCR text for comparison.
    """

    if not text:
        return ""

    text = text.lower().strip()

    # Replace common punctuation
    for character in (
        ".",
        ",",
        ";",
        ":",
        "(",
        ")",
        "[",
        "]",
        "{",
        "}",
        "-",
        "_",
    ):
        text = text.replace(
            character,
            " ",
        )

    # Remove extra spaces
    text = " ".join(
        text.split()
    )

    return text


# =========================================================
# EXACT MATCH
# =========================================================

def exact_match(
    text: str,
    medicine_names: list,
) -> Optional[str]:
    """
    Check for exact case-insensitive match.
    """

    normalized = normalize_text(
        text
    )

    if not normalized:
        return None

    for medicine in medicine_names:

        if normalize_text(
            medicine
        ) == normalized:

            return medicine

    return None


# =========================================================
# SYMSPELL MATCH
# =========================================================

def symspell_match(
    text: str,
    symspell: SymSpell,
    medicine_names: list,
) -> Optional[str]:
    """
    Try to correct OCR spelling using SymSpell.
    """

    normalized = normalize_text(
        text
    )

    if not normalized:
        return None

    words = normalized.split()

    corrected_words = []

    for word in words:

        # Ignore very short words
        if len(word) < 3:
            corrected_words.append(
                word
            )
            continue

        suggestions = (
            symspell.lookup(
                word,
                Verbosity.CLOSEST,
                max_edit_distance=2,
                include_unknown=True,
            )
        )

        if suggestions:

            corrected_words.append(
                suggestions[0].term
            )

        else:

            corrected_words.append(
                word
            )

    corrected = " ".join(
        corrected_words
    )

    # -----------------------------------------------------
    # Compare corrected text against database
    # -----------------------------------------------------

    for medicine in medicine_names:

        medicine_normalized = (
            normalize_text(
                medicine
            )
        )

        if medicine_normalized == corrected:

            return medicine

    return None


# =========================================================
# PARTIAL MATCH
# =========================================================

def partial_match(
    text: str,
    medicine_names: list,
) -> Optional[str]:
    """
    Perform conservative partial matching.

    This is intentionally limited so that ordinary
    prescription instructions such as:

        after food
        30 days
        at night

    are not incorrectly identified as medicines.
    """

    normalized = normalize_text(
        text
    )

    if not normalized:
        return None

    # -----------------------------------------------------
    # Only allow reasonably long OCR text
    # -----------------------------------------------------

    if len(normalized) < 5:
        return None

    for medicine in medicine_names:

        medicine_normalized = (
            normalize_text(
                medicine
            )
        )

        # Exact substring relationship
        if (
            normalized in medicine_normalized
            or medicine_normalized in normalized
        ):

            return medicine

    return None


# =========================================================
# MAIN MEDICINE MATCHER
# =========================================================

def match_medicine(
    text: str,
) -> Optional[str]:
    """
    Match OCR text against the medicine database.

    Matching order:

        1. Exact match
        2. SymSpell spelling correction
        3. Conservative partial match

    Returns:
        Medicine name if matched
        None if no reliable match exists
    """

    if not text:
        return None

    text = text.strip()

    if not text:
        return None

    # =====================================================
    # LOAD DATABASE
    # =====================================================

    try:

        symspell, medicine_names = (
            load_medicine_database()
        )

    except Exception as exc:

        print(
            "Medicine database loading failed:",
            repr(exc)
        )

        return None

    # =====================================================
    # ONLY PROCESS ENGLISH TEXT
    # =====================================================

    # If the OCR result contains no English letters,
    # don't try to match it.
    if not any(
        "a" <= character.lower() <= "z"
        for character in text
    ):

        print(
            f"Ignored non-English OCR text: "
            f"{text}"
        )

        return None

    # =====================================================
    # STEP 1 - EXACT MATCH
    # =====================================================

    result = exact_match(
        text,
        medicine_names,
    )

    if result:

        print(
            f"Exact medicine match: "
            f"{result}"
        )

        return result

    # =====================================================
    # STEP 2 - SYMSPELL
    # =====================================================

    result = symspell_match(
        text,
        symspell,
        medicine_names,
    )

    if result:
        print(
            f"SymSpell medicine match: "
            f"{text} -> {result}"
        )
        return result
    # =====================================================
    # STEP 3 - PARTIAL MATCH
    # =====================================================

    result = partial_match(
        text,
        medicine_names,
    )

    if result:
        print(
            f"Partial medicine match: "
            f"{text} -> {result}"
        )

        return result

    # =====================================================
    # NO MATCH
    # =====================================================

    print(
        f"No medicine match for: "
        f"{text}"
    )

    return None