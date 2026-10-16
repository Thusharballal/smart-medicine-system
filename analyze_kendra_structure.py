"""
Analyze kendra.docx structure based on observed pattern
"""
from docx import Document

def analyze_kendra_structure(docx_path):
    """Analyze the actual structure of kendra records"""
    
    print("=" * 80)
    print("KENDRA.DOCX STRUCTURE ANALYSIS")
    print("=" * 80)
    
    doc = Document(docx_path)
    texts = [p.text.strip() for p in doc.paragraphs]
    
    print(f"\nTotal paragraphs: {len(texts)}")
    
    # Based on observed pattern:
    # Field 0: Serial number (1, 2, 3, ...)
    # Field 1: Kendra Code (PMBJK...)
    # Field 2: Owner Name
    # Field 3: State
    # Field 4: District
    # Field 5: PIN Code
    # Field 6: Address
    # Total: 7 fields per record
    
    fields_per_record = 7
    
    print(f"\nDetected pattern: {fields_per_record} fields per record")
    print("\nField structure:")
    print("  0: Serial Number")
    print("  1: Kendra Code")
    print("  2: Owner Name")
    print("  3: State")
    print("  4: District")
    print("  5: PIN Code")
    print("  6: Address")
    
    # Calculate total records
    total_records = len(texts) // fields_per_record
    print(f"\n✓ TOTAL KENDRA RECORDS: {total_records}")
    
    # Show 5 sample records
    print("\n" + "=" * 80)
    print("FIRST 5 SAMPLE RECORDS")
    print("=" * 80)
    
    for record_num in range(min(5, total_records)):
        start_idx = record_num * fields_per_record
        print(f"\n--- Record {record_num + 1} ---")
        print(f"  Serial:       {texts[start_idx + 0]}")
        print(f"  Kendra Code:  {texts[start_idx + 1]}")
        print(f"  Owner:        {texts[start_idx + 2]}")
        print(f"  State:        {texts[start_idx + 3]}")
        print(f"  District:     {texts[start_idx + 4]}")
        print(f"  PIN Code:     {texts[start_idx + 5]}")
        print(f"  Address:      {texts[start_idx + 6][:80]}...")
    
    # Show last 2 records
    print("\n" + "=" * 80)
    print("LAST 2 SAMPLE RECORDS")
    print("=" * 80)
    
    for record_num in range(max(0, total_records - 2), total_records):
        start_idx = record_num * fields_per_record
        if start_idx + 6 < len(texts):
            print(f"\n--- Record {record_num + 1} ---")
            print(f"  Serial:       {texts[start_idx + 0]}")
            print(f"  Kendra Code:  {texts[start_idx + 1]}")
            print(f"  Owner:        {texts[start_idx + 2]}")
            print(f"  State:        {texts[start_idx + 3]}")
            print(f"  District:     {texts[start_idx + 4]}")
            print(f"  PIN Code:     {texts[start_idx + 5]}")
            print(f"  Address:      {texts[start_idx + 6][:80]}...")
    
    return fields_per_record, total_records

if __name__ == "__main__":
    docx_path = r"c:\Users\admin\Desktop\Smart Medicine system\kendra.docx"
    analyze_kendra_structure(docx_path)
