"""
Extract Kendra data directly from the page DOM after it loads
The React app might embed the data in the page or load it via different method
"""

from selenium import webdriver
from selenium.webdriver.chrome.service import Service
from selenium.webdriver.chrome.options import Options
from selenium.webdriver.common.by import By
from selenium.webdriver.support.ui import WebDriverWait
from selenium.webdriver.support import expected_conditions as EC
from webdriver_manager.chrome import ChromeDriverManager
import json
import time
import csv

print("=" * 80)
print("EXTRACTING KENDRA DATA FROM PAGE")
print("=" * 80)

chrome_options = Options()
# chrome_options.add_argument('--headless')
chrome_options.add_argument('--no-sandbox')
chrome_options.add_argument('--disable-dev-shm-usage')

print("\n📦 Setting up Chrome...")

try:
    service = Service(ChromeDriverManager().install())
    driver = webdriver.Chrome(service=service, options=chrome_options)
    
    print("✅ Ready")
    
    print("\n🌐 Loading page...")
    driver.get("https://janaushadhi.gov.in/locate-kendra")
    
    time.sleep(8)  # Wait for full load
    
    print("✅ Page loaded")
    
    # Try clicking search without filters to load all data
    print("\n🖱️  Attempting to trigger search...")
    
    try:
        # Click search button to load results
        search_btn = WebDriverWait(driver, 10).until(
            EC.element_to_be_clickable((By.XPATH, "//button[contains(text(), 'Search') or contains(text(), 'search')]"))
        )
        
        # Scroll into view
        driver.execute_script("arguments[0].scrollIntoView(true);", search_btn)
        time.sleep(1)
        
        # Click
        driver.execute_script("arguments[0].click();", search_btn)
        print("✅ Search clicked")
        
        # Wait for results to load
        time.sleep(5)
        
        # Try to find result table/list
        print("\n🔍 Looking for results...")
        
        # Check if there's a table
        tables = driver.find_elements(By.TAG_NAME, "table")
        if tables:
            print(f"✅ Found {len(tables)} table(s)")
            
            for idx, table in enumerate(tables):
                rows = table.find_elements(By.TAG_NAME, "tr")
                print(f"\n  Table {idx+1}: {len(rows)} rows")
                
                if len(rows) > 1:  # Has header + data
                    # Extract headers
                    header_row = rows[0]
                    headers = [th.text for th in header_row.find_elements(By.TAG_NAME, "th")]
                    if not headers:
                        headers = [td.text for td in header_row.find_elements(By.TAG_NAME, "td")]
                    
                    print(f"  Headers: {headers}")
                    
                    # Extract sample rows
                    print(f"\n  Sample rows:")
                    for i, row in enumerate(rows[1:min(4, len(rows))]):
                        cells = [td.text for td in row.find_elements(By.TAG_NAME, "td")]
                        print(f"    Row {i+1}: {cells}")
        
        # Try to extract from page source
        print("\n📄 Checking page source for data...")
        page_source = driver.page_source
        
        # Look for JSON data embedded in page
        if 'kendraCode' in page_source or 'kendra_code' in page_source:
            print("✅ Found 'kendraCode' in source")
        
        if 'ownerName' in page_source or 'owner_name' in page_source:
            print("✅ Found 'ownerName' in source")
        
        # Try to execute script to get React state
        print("\n⚛️  Attempting to access React component data...")
        
        react_data = driver.execute_script("""
            // Try to find React Fiber
            const rootElement = document.querySelector('#root');
            if (rootElement && rootElement._reactRootContainer) {
                return 'React root found';
            }
            
            // Try window data
            if (window.__INITIAL_STATE__) {
                return window.__INITIAL_STATE__;
            }
            
            if (window.__DATA__) {
                return window.__DATA__;
            }
            
            // Check for common data stores
            if (window.kendraData) {
                return window.kendraData;
            }
            
            return null;
        """)
        
        if react_data:
            print(f"✅ Found data: {str(react_data)[:200]}")
        else:
            print("⚠️  No embedded data found")
        
    except Exception as e:
        print(f"⚠️  Could not interact: {e}")
    
    # Take screenshot for debugging
    driver.save_screenshot('pmbi_page_screenshot.png')
    print("\n📸 Screenshot saved: pmbi_page_screenshot.png")
    
    driver.quit()
    
    print("\n" + "=" * 80)
    print("SUMMARY")
    print("=" * 80)
    print("""
The PMBI website's API endpoint requires:
1. Active browser session with cookies
2. Possibly authentication tokens generated client-side
3. Or the API might be temporarily down

RECOMMENDATIONS:

Option A: Manual Browser Capture
1. Open Chrome Dev Tools (F12)
2. Go to: https://janaushadhi.gov.in/locate-kendra
3. Network tab → Filter: Fetch/XHR
4. Click Search
5. Find the API call that returns Kendra JSON
6. Right-click → Copy → Copy Response
7. Save as pmbi_kendras_manual.json
8. I'll convert it to CSV

Option B: Official Data Request
Contact PMBI directly:
- Email: complaints@janaushadhi.gov.in
- Phone: 1800-180-8080
- Request: Official Kendra dataset export

Option C: Alternative Sources
Check if PMBI provides:
- Downloadable Excel/CSV on their website
- Open Data Portal listing
- API documentation with proper authentication

Which would you prefer?
""")
    
except Exception as e:
    print(f"\n❌ Error: {e}")
    import traceback
    traceback.print_exc()
