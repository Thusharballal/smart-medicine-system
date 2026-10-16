"""
Extract PMBI Kendra data using Selenium (browser context)
Since the API requires browser session/cookies, we'll use Selenium
to execute the API calls within the browser context
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

print("=" * 80)
print("EXTRACTING PMBI KENDRA DATA VIA SELENIUM")
print("=" * 80)

# Setup Chrome
chrome_options = Options()
# chrome_options.add_argument('--headless')  # Comment out to see browser
chrome_options.add_argument('--no-sandbox')
chrome_options.add_argument('--disable-dev-shm-usage')

print("\n📦 Setting up Chrome WebDriver...")

try:
    service = Service(ChromeDriverManager().install())
    driver = webdriver.Chrome(service=service, options=chrome_options)
    
    print("✅ Chrome WebDriver ready")
    
    print("\n🌐 Loading PMBI Locate Kendra page...")
    driver.get("https://janaushadhi.gov.in/locate-kendra")
    
    # Wait for page to fully load
    time.sleep(5)
    
    print("✅ Page loaded")
    
    # Execute JavaScript to call the API
    print("\n📡 Executing API call via browser JavaScript...")
    
    script = """
    return fetch('https://janaushadhi.gov.in:8443/api/v1/website/getAllKendraByStateDistrict', {
        method: 'GET',
        headers: {
            'Accept': 'application/json'
        }
    })
    .then(response => response.json())
    .then(data => data)
    .catch(error => ({error: error.toString()}));
    """
    
    result = driver.execute_async_script("""
        var callback = arguments[arguments.length - 1];
        fetch('https://janaushadhi.gov.in:8443/api/v1/website/getAllKendraByStateDistrict', {
            method: 'GET',
            headers: {
                'Accept': 'application/json'
            }
        })
        .then(response => response.json())
        .then(data => callback(data))
        .catch(error => callback({error: error.toString()}));
    """)
    
    if result and 'error' in result:
        print(f"❌ API Error: {result['error']}")
    elif result and isinstance(result, list):
        print(f"\n✅ SUCCESS!")
        print(f"Total Kendras retrieved: {len(result)}")
        
        if len(result) > 0:
            print(f"\n📋 Sample Kendra Record:")
            sample = result[0]
            print(json.dumps(sample, indent=2))
            
            print(f"\n📊 Available Fields:")
            for key in sample.keys():
                print(f"  - {key}")
            
            # Save sample data
            with open('pmbi_sample_response.json', 'w', encoding='utf-8') as f:
                json.dump(result[:5], f, indent=2, ensure_ascii=False)
            print(f"\n💾 Saved 5 sample records to: pmbi_sample_response.json")
            
            # Count records by state
            states = {}
            for kendra in result:
                state = kendra.get('state', 'Unknown')
                states[state] = states.get(state, 0) + 1
            
            print(f"\n📍 Kendras by State (top 10):")
            sorted_states = sorted(states.items(), key=lambda x: x[1], reverse=True)
            for state, count in sorted_states[:10]:
                print(f"  {state}: {count}")
            
    elif result and isinstance(result, dict):
        print(f"\n⚠️  Unexpected response structure:")
        print(json.dumps(result, indent=2)[:500])
    else:
        print(f"\n⚠️  Empty or invalid response")
    
    driver.quit()
    
    print("\n" + "=" * 80)
    print("NEXT STEPS")
    print("=" * 80)
    
    if result and isinstance(result, list) and len(result) > 0:
        print(f"""
✅ API Access Successful!

Total Kendras Available: {len(result)}

The API returns ALL Kendras in a single request (no pagination needed).

Available fields: {list(result[0].keys())}

To proceed with full download:
1. Review the sample record in pmbi_sample_response.json
2. Confirm the field names
3. I'll create download_pmbi_kendras.py to:
   - Fetch all Kendras
   - Extract required fields
   - Save to pmbi_kendras.csv

Ready to proceed? Reply: "Proceed"
""")
    else:
        print("""
⚠️  Could not retrieve data.

This might mean:
1. API requires additional authentication
2. API endpoint changed
3. Network/firewall restrictions

Alternative: Manual data extraction or official data request.
""")
    
except Exception as e:
    print(f"\n❌ Error: {e}")
    import traceback
    traceback.print_exc()
