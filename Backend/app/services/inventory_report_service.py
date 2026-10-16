from datetime import datetime
from io import BytesIO
from bson import ObjectId
from fastapi import HTTPException, status
from fastapi.responses import StreamingResponse
from reportlab.lib import colors
from reportlab.lib.pagesizes import A4
from reportlab.lib.styles import getSampleStyleSheet, ParagraphStyle
from reportlab.lib.units import mm
from reportlab.platypus import (
    SimpleDocTemplate,
    Paragraph,
    Spacer,
    Table,
    TableStyle,
)

from app.database.connection import get_database
from app.utils.logger import logger
# ============================================================
# HELPERS
# ============================================================
def utc_now() -> datetime:
    """
    Return current UTC time as naive datetime.
    """
    return datetime.utcnow()
def format_date(value):
    """
    Format MongoDB datetime for PDF.
    """
    if not value:
        return "-"
    if value.tzinfo is not None:
        value = value.replace(tzinfo=None)
    return value.strftime("%d-%m-%Y")
def format_datetime(value):
    """
    Format MongoDB datetime for PDF.
    """
    if not value:
        return "-"
    if value.tzinfo is not None:
        value = value.replace(tzinfo=None)
    return value.strftime("%d-%m-%Y %H:%M")
def safe_text(value):
    """
    Safely convert values to printable text.
    """
    if value is None:
        return "-"
    text = str(value).strip()
    return text if text else "-"
# ============================================================
# MEDICINE LOOKUP
# ============================================================
async def get_medicine_for_report(
    database,
    medicine_id: str,
):
    """
    Retrieve medicine master record.
    """

    if not medicine_id:
        return None

    if not ObjectId.is_valid(medicine_id):
        return None

    return await database.medicines.find_one(
        {
            "_id": ObjectId(medicine_id),
            "is_archived": False,
        }
    )


# ============================================================
# OUT OF STOCK DATA
# ============================================================

async def get_out_of_stock_report_data(
    pharmacy_id: str,
):
    """
    Automatically detect all active out-of-stock
    batches belonging to the authenticated pharmacy.

    Out of stock means:

        available_quantity == 0
    """

    database = get_database()

    batches = await database.batches.find(
        {
            "pharmacy_id": pharmacy_id,
            "is_archived": False,
            "available_quantity": 0,
        }
    ).sort(
        [
            ("batch_number", 1),
        ]
    ).to_list(
        length=None
    )

    results = []

    for batch in batches:

        medicine = await get_medicine_for_report(
            database,
            batch.get("medicine_id"),
        )

        if not medicine:
            continue

        results.append(
            {
                "batch_id": str(
                    batch["_id"]
                ),
                "medicine_id": batch.get(
                    "medicine_id",
                    "",
                ),
                "generic_name": medicine.get(
                    "generic_name",
                    "",
                ),
                "jan_aushadhi_name": medicine.get(
                    "jan_aushadhi_name",
                    "",
                ),
                "strength": medicine.get(
                    "strength",
                    "",
                ),
                "batch_number": batch.get(
                    "batch_number",
                    "",
                ),
                "available_quantity": int(
                    batch.get(
                        "available_quantity",
                        0,
                    )
                ),
                "supplier_name": batch.get(
                    "supplier_name",
                    "",
                ),
            }
        )

    logger.info(
        "Out-of-stock report data generated | "
        f"pharmacy={pharmacy_id} | "
        f"records={len(results)}"
    )

    return results


# ============================================================
# EXPIRED MEDICINE DATA
# ============================================================

async def get_expired_medicine_report_data(
    pharmacy_id: str,
):
    """
    Automatically detect all active expired
    medicine batches belonging to the pharmacy.

    Expired means:

        expiry_date < current UTC time
    """

    database = get_database()

    now = utc_now()

    batches = await database.batches.find(
        {
            "pharmacy_id": pharmacy_id,
            "is_archived": False,
            "expiry_date": {
                "$lt": now,
            },
        }
    ).sort(
        [
            ("expiry_date", 1),
        ]
    ).to_list(
        length=None
    )

    results = []

    for batch in batches:

        medicine = await get_medicine_for_report(
            database,
            batch.get("medicine_id"),
        )

        if not medicine:
            continue

        expiry_date = batch.get(
            "expiry_date"
        )

        if not expiry_date:
            continue

        if expiry_date.tzinfo is not None:
            expiry_date = expiry_date.replace(
                tzinfo=None
            )

        days_expired = max(
            (
                now - expiry_date
            ).days,
            0,
        )

        results.append(
            {
                "batch_id": str(
                    batch["_id"]
                ),
                "medicine_id": batch.get(
                    "medicine_id",
                    "",
                ),
                "generic_name": medicine.get(
                    "generic_name",
                    "",
                ),
                "jan_aushadhi_name": medicine.get(
                    "jan_aushadhi_name",
                    "",
                ),
                "strength": medicine.get(
                    "strength",
                    "",
                ),
                "batch_number": batch.get(
                    "batch_number",
                    "",
                ),
                "available_quantity": int(
                    batch.get(
                        "available_quantity",
                        0,
                    )
                ),
                "expiry_date": expiry_date,
                "days_expired": days_expired,
                "supplier_name": batch.get(
                    "supplier_name",
                    "",
                ),
            }
        )

    logger.info(
        "Expired medicine report data generated | "
        f"pharmacy={pharmacy_id} | "
        f"records={len(results)}"
    )

    return results


# ============================================================
# PDF STYLES
# ============================================================

def get_pdf_styles():

    styles = getSampleStyleSheet()

    title_style = ParagraphStyle(
        "ReportTitle",
        parent=styles["Title"],
        fontSize=18,
        leading=22,
        alignment=1,
        spaceAfter=8,
    )

    subtitle_style = ParagraphStyle(
        "ReportSubtitle",
        parent=styles["Normal"],
        fontSize=9,
        leading=12,
        alignment=1,
        textColor=colors.grey,
        spaceAfter=14,
    )

    section_style = ParagraphStyle(
        "Section",
        parent=styles["Heading2"],
        fontSize=11,
        leading=14,
        spaceBefore=8,
        spaceAfter=6,
    )

    normal_style = ParagraphStyle(
        "NormalReport",
        parent=styles["Normal"],
        fontSize=8,
        leading=10,
    )

    return (
        title_style,
        subtitle_style,
        section_style,
        normal_style,
    )


# ============================================================
# BUILD OUT OF STOCK PDF
# ============================================================

def build_out_of_stock_pdf(
    pharmacy_id: str,
    records: list,
):
    """
    Generate Out-of-Stock PDF.
    """

    buffer = BytesIO()

    document = SimpleDocTemplate(
        buffer,
        pagesize=A4,
        rightMargin=12 * mm,
        leftMargin=12 * mm,
        topMargin=12 * mm,
        bottomMargin=12 * mm,
        title="Out of Stock Medicines Report",
        author="Smart Medicine System",
    )

    (
        title_style,
        subtitle_style,
        section_style,
        normal_style,
    ) = get_pdf_styles()

    story = []

    # --------------------------------------------------------
    # HEADER
    # --------------------------------------------------------

    story.append(
        Paragraph(
            "OUT OF STOCK MEDICINES REPORT",
            title_style,
        )
    )

    story.append(
        Paragraph(
            "Smart Medicine Availability & "
            "Intelligent Janaushadhi Recommendation System",
            subtitle_style,
        )
    )

    # --------------------------------------------------------
    # REPORT INFORMATION
    # --------------------------------------------------------

    generated_at = utc_now()

    info_data = [
        [
            Paragraph(
                "<b>Pharmacy ID</b>",
                normal_style,
            ),
            Paragraph(
                safe_text(pharmacy_id),
                normal_style,
            ),
        ],
        [
            Paragraph(
                "<b>Generated At</b>",
                normal_style,
            ),
            Paragraph(
                format_datetime(generated_at),
                normal_style,
            ),
        ],
        [
            Paragraph(
                "<b>Total Out-of-Stock Batches</b>",
                normal_style,
            ),
            Paragraph(
                str(len(records)),
                normal_style,
            ),
        ],
    ]

    info_table = Table(
        info_data,
        colWidths=[
            55 * mm,
            115 * mm,
        ],
    )

    info_table.setStyle(
        TableStyle(
            [
                (
                    "BACKGROUND",
                    (0, 0),
                    (0, -1),
                    colors.HexColor("#F1F5F9"),
                ),
                (
                    "GRID",
                    (0, 0),
                    (-1, -1),
                    0.5,
                    colors.HexColor("#CBD5E1"),
                ),
                (
                    "VALIGN",
                    (0, 0),
                    (-1, -1),
                    "MIDDLE",
                ),
                (
                    "LEFTPADDING",
                    (0, 0),
                    (-1, -1),
                    6,
                ),
                (
                    "RIGHTPADDING",
                    (0, 0),
                    (-1, -1),
                    6,
                ),
                (
                    "TOPPADDING",
                    (0, 0),
                    (-1, -1),
                    5,
                ),
                (
                    "BOTTOMPADDING",
                    (0, 0),
                    (-1, -1),
                    5,
                ),
            ]
        )
    )

    story.append(info_table)

    story.append(
        Spacer(
            1,
            10,
        )
    )

    story.append(
        Paragraph(
            "Out-of-Stock Details",
            section_style,
        )
    )

    # --------------------------------------------------------
    # NO RECORDS
    # --------------------------------------------------------

    if not records:

        story.append(
            Paragraph(
                "No out-of-stock medicines were detected "
                "for this pharmacy.",
                normal_style,
            )
        )

    else:

        table_data = [
            [
                Paragraph(
                    "<b>Medicine</b>",
                    normal_style,
                ),
                Paragraph(
                    "<b>Strength</b>",
                    normal_style,
                ),
                Paragraph(
                    "<b>Batch</b>",
                    normal_style,
                ),
                Paragraph(
                    "<b>Stock</b>",
                    normal_style,
                ),
                Paragraph(
                    "<b>Supplier</b>",
                    normal_style,
                ),
            ]
        ]

        for record in records:

            medicine_name = (
                record.get("jan_aushadhi_name")
                or record.get("generic_name")
                or "Unknown Medicine"
            )

            table_data.append(
                [
                    Paragraph(
                        safe_text(medicine_name),
                        normal_style,
                    ),
                    Paragraph(
                        safe_text(
                            record.get("strength")
                        ),
                        normal_style,
                    ),
                    Paragraph(
                        safe_text(
                            record.get("batch_number")
                        ),
                        normal_style,
                    ),
                    Paragraph(
                        str(
                            record.get(
                                "available_quantity",
                                0,
                            )
                        ),
                        normal_style,
                    ),
                    Paragraph(
                        safe_text(
                            record.get(
                                "supplier_name"
                            )
                        ),
                        normal_style,
                    ),
                ]
            )

        table = Table(
            table_data,
            repeatRows=1,
            colWidths=[
                55 * mm,
                25 * mm,
                32 * mm,
                18 * mm,
                40 * mm,
            ],
        )

        table.setStyle(
            TableStyle(
                [
                    (
                        "BACKGROUND",
                        (0, 0),
                        (-1, 0),
                        colors.HexColor("#1E3A8A"),
                    ),
                    (
                        "TEXTCOLOR",
                        (0, 0),
                        (-1, 0),
                        colors.white,
                    ),
                    (
                        "GRID",
                        (0, 0),
                        (-1, -1),
                        0.4,
                        colors.HexColor("#CBD5E1"),
                    ),
                    (
                        "VALIGN",
                        (0, 0),
                        (-1, -1),
                        "MIDDLE",
                    ),
                    (
                        "ROWBACKGROUNDS",
                        (0, 1),
                        (-1, -1),
                        [
                            colors.white,
                            colors.HexColor("#F8FAFC"),
                        ],
                    ),
                    (
                        "LEFTPADDING",
                        (0, 0),
                        (-1, -1),
                        4,
                    ),
                    (
                        "RIGHTPADDING",
                        (0, 0),
                        (-1, -1),
                        4,
                    ),
                    (
                        "TOPPADDING",
                        (0, 0),
                        (-1, -1),
                        5,
                    ),
                    (
                        "BOTTOMPADDING",
                        (0, 0),
                        (-1, -1),
                        5,
                    ),
                ]
            )
        )

        story.append(table)

    story.append(
        Spacer(
            1,
            15,
        )
    )

    story.append(
        Paragraph(
            "This report was automatically generated from "
            "the pharmacy's current inventory records.",
            normal_style,
        )
    )

    document.build(story)

    buffer.seek(0)

    return buffer


# ============================================================
# BUILD EXPIRED MEDICINE PDF
# ============================================================

def build_expired_medicine_pdf(
    pharmacy_id: str,
    records: list,
):
    """
    Generate Expired Medicines PDF.
    """

    buffer = BytesIO()

    document = SimpleDocTemplate(
        buffer,
        pagesize=A4,
        rightMargin=12 * mm,
        leftMargin=12 * mm,
        topMargin=12 * mm,
        bottomMargin=12 * mm,
        title="Expired Medicines Report",
        author="Smart Medicine System",
    )

    (
        title_style,
        subtitle_style,
        section_style,
        normal_style,
    ) = get_pdf_styles()

    story = []

    # --------------------------------------------------------
    # HEADER
    # --------------------------------------------------------

    story.append(
        Paragraph(
            "EXPIRED MEDICINES REPORT",
            title_style,
        )
    )

    story.append(
        Paragraph(
            "Smart Medicine Availability & "
            "Intelligent Janaushadhi Recommendation System",
            subtitle_style,
        )
    )

    # --------------------------------------------------------
    # REPORT INFORMATION
    # --------------------------------------------------------

    generated_at = utc_now()

    info_data = [
        [
            Paragraph(
                "<b>Pharmacy ID</b>",
                normal_style,
            ),
            Paragraph(
                safe_text(pharmacy_id),
                normal_style,
            ),
        ],
        [
            Paragraph(
                "<b>Generated At</b>",
                normal_style,
            ),
            Paragraph(
                format_datetime(generated_at),
                normal_style,
            ),
        ],
        [
            Paragraph(
                "<b>Total Expired Batches</b>",
                normal_style,
            ),
            Paragraph(
                str(len(records)),
                normal_style,
            ),
        ],
    ]

    info_table = Table(
        info_data,
        colWidths=[
            55 * mm,
            115 * mm,
        ],
    )

    info_table.setStyle(
        TableStyle(
            [
                (
                    "BACKGROUND",
                    (0, 0),
                    (0, -1),
                    colors.HexColor("#FEF2F2"),
                ),
                (
                    "GRID",
                    (0, 0),
                    (-1, -1),
                    0.5,
                    colors.HexColor("#CBD5E1"),
                ),
                (
                    "VALIGN",
                    (0, 0),
                    (-1, -1),
                    "MIDDLE",
                ),
                (
                    "LEFTPADDING",
                    (0, 0),
                    (-1, -1),
                    6,
                ),
                (
                    "RIGHTPADDING",
                    (0, 0),
                    (-1, -1),
                    6,
                ),
                (
                    "TOPPADDING",
                    (0, 0),
                    (-1, -1),
                    5,
                ),
                (
                    "BOTTOMPADDING",
                    (0, 0),
                    (-1, -1),
                    5,
                ),
            ]
        )
    )

    story.append(info_table)

    story.append(
        Spacer(
            1,
            10,
        )
    )

    story.append(
        Paragraph(
            "Expired Medicine Details",
            section_style,
        )
    )

    # --------------------------------------------------------
    # NO RECORDS
    # --------------------------------------------------------
    if not records:

        story.append(
            Paragraph(
                "No expired medicines were detected "
                "for this pharmacy.",
                normal_style,
            )
        )

    else:

        table_data = [
            [
                Paragraph(
                    "<b>Medicine</b>",
                    normal_style,
                ),
                Paragraph(
                    "<b>Batch</b>",
                    normal_style,
                ),
                Paragraph(
                    "<b>Expiry</b>",
                    normal_style,
                ),
                Paragraph(
                    "<b>Qty</b>",
                    normal_style,
                ),
                Paragraph(
                    "<b>Days Expired</b>",
                    normal_style,
                ),
                Paragraph(
                    "<b>Supplier</b>",
                    normal_style,
                ),
            ]
        ]

        for record in records:

            medicine_name = (
                record.get("jan_aushadhi_name")
                or record.get("generic_name")
                or "Unknown Medicine"
            )

            table_data.append(
                [
                    Paragraph(
                        safe_text(medicine_name),
                        normal_style,
                    ),
                    Paragraph(
                        safe_text(
                            record.get(
                                "batch_number"
                            )
                        ),
                        normal_style,
                    ),
                    Paragraph(
                        format_date(
                            record.get(
                                "expiry_date"
                            )
                        ),
                        normal_style,
                    ),
                    Paragraph(
                        str(
                            record.get(
                                "available_quantity",
                                0,
                            )
                        ),
                        normal_style,
                    ),
                    Paragraph(
                        str(
                            record.get(
                                "days_expired",
                                0,
                            )
                        ),
                        normal_style,
                    ),
                    Paragraph(
                        safe_text(
                            record.get(
                                "supplier_name"
                            )
                        ),
                        normal_style,
                    ),
                ]
            )

        table = Table(
            table_data,
            repeatRows=1,
            colWidths=[
                48 * mm,
                30 * mm,
                28 * mm,
                18 * mm,
                28 * mm,
                38 * mm,
            ],
        )

        table.setStyle(
            TableStyle(
                [
                    (
                        "BACKGROUND",
                        (0, 0),
                        (-1, 0),
                        colors.HexColor("#991B1B"),
                    ),
                    (
                        "TEXTCOLOR",
                        (0, 0),
                        (-1, 0),
                        colors.white,
                    ),
                    (
                        "GRID",
                        (0, 0),
                        (-1, -1),
                        0.4,
                        colors.HexColor("#CBD5E1"),
                    ),
                    (
                        "VALIGN",
                        (0, 0),
                        (-1, -1),
                        "MIDDLE",
                    ),
                    (
                        "ROWBACKGROUNDS",
                        (0, 1),
                        (-1, -1),
                        [
                            colors.white,
                            colors.HexColor("#FEF2F2"),
                        ],
                    ),
                    (
                        "LEFTPADDING",
                        (0, 0),
                        (-1, -1),
                        4,
                    ),
                    (
                        "RIGHTPADDING",
                        (0, 0),
                        (-1, -1),
                        4,
                    ),
                    (
                        "TOPPADDING",
                        (0, 0),
                        (-1, -1),
                        5,
                    ),
                    (
                        "BOTTOMPADDING",
                        (0, 0),
                        (-1, -1),
                        5,
                    ),
                ]
            )
        )
        story.append(table)
    story.append(
        Spacer(
            1,
            15,
        )
    )
    story.append(
        Paragraph(
            "This report was automatically generated from "
            "the pharmacy's current inventory records.",
            normal_style,
        )
    )
    document.build(story)
    buffer.seek(0)
    return buffer
# ============================================================
# OUT OF STOCK PDF RESPONSE
# ============================================================
async def generate_out_of_stock_report(
    pharmacy_id: str,
):
    """
    Detect out-of-stock medicines and generate PDF.
    """
    records = await get_out_of_stock_report_data(
        pharmacy_id
    )
    pdf_buffer = build_out_of_stock_pdf(
        pharmacy_id=pharmacy_id,
        records=records,
    )
    filename = (
        f"out_of_stock_medicines_"
        f"{utc_now().strftime('%Y%m%d_%H%M%S')}.pdf"
    )
    return StreamingResponse(
        pdf_buffer,
        media_type="application/pdf",
        headers={
            "Content-Disposition": (
                f'attachment; filename="{filename}"'
            )
        },
    )
# ============================================================
# EXPIRED MEDICINE PDF RESPONSE
# ============================================================
async def generate_expired_medicine_report(
    pharmacy_id: str,
):
    """
    Detect expired medicines and generate PDF.
    """
    records = await get_expired_medicine_report_data(
        pharmacy_id
    )
    pdf_buffer = build_expired_medicine_pdf(
        pharmacy_id=pharmacy_id,
        records=records,
    )
    filename = (
        f"expired_medicines_"
        f"{utc_now().strftime('%Y%m%d_%H%M%S')}.pdf"
    )
    return StreamingResponse(
        pdf_buffer,
        media_type="application/pdf",
        headers={
            "Content-Disposition": (
                f'attachment; filename="{filename}"'
            )
        },
    )