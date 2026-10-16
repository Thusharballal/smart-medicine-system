"""
PMBI Kendra PDF Analysis Script
This script analyzes the structure of the kendra.pdf file
"""

import pdfplumber
import json

pdf_path = "kendra.pdf"

print("=" * 80)
print("ANALYZING PMBI KENDRA PDF")
print("=" * 80)

try:
    with pdfplumber.open(pdf_path) as pdf:
        total_pages = len(pdf.pages)
        print(f"\n📄 Total Pages: {total_pages}")
        
        # Analyze first few pages
        print("\n" + "=" * 80)
        print("ANALYZING FIRST 3 PAGES")
        print("=" * 80)
        
        for page_num in range(min(3, total_pages)):
            page = pdf.pages[page_num]
            print(f"\n--- Page {page_num + 1} ---")
            
            # Extract text
            text = page.extract_text()
            if text:
                lines = text.split('\n')
                print(f"Lines of text: {len(lines)}")
                print(f"\nFirst 10 lines:")
                for i, line in enumerate(lines[:10]):
                    print(f"  {i+1}: {line[:100]}")
            
            # Try to extract tables
            tables = page.extract_tables()
            if tables:
                print(f"\nTables found: {len(tables)}")
                for i, table in enumerate(tables[:2]):  # Show first 2 tables
                    print(f"\nTable {i+1}:")
                    print(f"  Rows: {len(table)}")
                    print(f"  Columns: {len(table[0]) if table else 0}")
                    if table and len(table) > 0:
                        print(f"  Header row: {table[0]}")
                        if len(table) > 1:
                            print(f"  Sample row: {table[1]}")
        
        # Try to detect structure
        print("\n" + "=" * 80)
        print("DETECTING DATA STRUCTURE")
        print("=" * 80)
        
        # Sample page in the middle
        mid_page = pdf.pages[total_pages // 2] if total_pages > 1 else pdf.pages[0]
        
        tables = mid_page.extract_tables()
        if tables:
            print(f"\nFound {len(tables)} table(s) on middle page")
            if tables[0]:
                print(f"\nEstimated structure:")
                print(f"  Header: {tables[0][0]}")
                print(f"  Columns: {len(tables[0][0])}")
                print(f"\nColumn headers detected:")
                for i, header in enumerate(tables[0][0]):
                    print(f"  {i+1}. {header}")
        
except Exception as e:
    print(f"\n❌ Error: {e}")
    print(f"\nMake sure pdfplumber is installed:")
    print("  pip install pdfplumber")
