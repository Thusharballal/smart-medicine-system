"""
Capture PMBI Kendra API Network Requests
Uses Selenium to monitor network traffic and find the actual API endpoint
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
print("CAPTURING PMBI KENDRA API REQUESTS")
print("=" * 80)

# Setup Chrome with network logging
chrome_options = Options()
chrome_options.add_argument('--headless')  # Run in background
chrome_options.add_argument('--no-sandbox')
chrome_options.add_argument('--disable-dev-shm-usage')
chrome_options.set_capability('goog:loggingPrefs', {'performance': 'ALL'})

print("\n📦 Setting up Chrome WebDriver...")

try:
    service = Service(ChromeDriverManager().install())
    driver = webdriver.Chrome(service=service, options=chrome_options)
    
    print("✅ Chrome WebDriver ready")
    
    print("\n🌐 Loading PMBI Locate Kendra page...")
    driver.get("https://janaushadhi.gov.in/locate-kendra")
    
    # Wait for page to load
    time.sleep(5)
    
    print("✅ Page loaded")
    
    # Capture performance logs (network requests)
    print("\n📡 Capturing network requests...")
    logs = driver.get_log('performance')
    
    api_requests = []
    
    for entry in logs:
        try:
            log = json.loads(entry['message'])['message']
            
            if log['method'] == 'Network.responseReceived':
                response = log['params']['response']
                url = response['url']
                
                # Filter for API calls
                if ('api' in url.lower() or 
                    'kendra' in url.lower() or
                    'search' in url.lower()) and 'janaushadhi' in url:
                    
                    if response.get('mimeType') == 'application/json':
                        api_requests.append({
                            'url': url,
                            'method': response.get('requestMethod', 'GET'),
                            'status': response['status'],
                            'mimeType': response.get('mimeType'),
                        })
        except:
            pass
    
    if api_requests:
        print(f"\n✅ Found {len(api_requests)} API request(s):")
        for req in api_requests:
            print(f"\n  URL: {req['url']}")
            print(f"  Method: {req['method']}")
            print(f"  Status: {req['status']}")
            print(f"  Type: {req['mimeType']}")
    else:
        print("\n⚠️  No JSON API requests detected yet")
        print("   The data might be:")
        print("   - Loaded after user interaction")
        print("   - Embedded in JavaScript")
        print("   - Using WebSocket")
    
    print("\n🔍 Looking for Search button...")
    
    try:
        # Try to find and click search button
        search_button = WebDriverWait(driver, 10).until(
            EC.presence_of_element_located((By.XPATH, "//button[contains(text(), 'Search')]"))
        )
        
        print("✅ Search button found")
        print("🖱️  Clicking Search button...")
        
        search_button.click()
        time.sleep(3)
        
        # Capture logs after interaction
        logs_after = driver.get_log('performance')
        
        print("\n📡 Capturing requests after search click...")
        
        for entry in logs_after:
            try:
                log = json.loads(entry['message'])['message']
                
                if log['method'] == 'Network.responseReceived':
                    response = log['params']['response']
                    url = response['url']
                    
                    if ('api' in url.lower() or 
                        'kendra' in url.lower() or
                        'search' in url.lower()) and 'janaushadhi' in url:
                        
                        print(f"\n✅ API REQUEST FOUND!")
                        print(f"   URL: {url}")
                        print(f"   Method: {response.get('requestMethod', 'GET')}")
                        print(f"   Status: {response['status']}")
                        print(f"   Type: {response.get('mimeType')}")
                        
                        # Try to get request details
                        if log['method'] == 'Network.requestWillBeSent':
                            request_data = log['params']['request']
                            print(f"\n   Request Headers:")
                            for key, value in request_data.get('headers', {}).items():
                                print(f"      {key}: {value}")
                            
                            if 'postData' in request_data:
                                print(f"\n   POST Data:")
                                print(f"      {request_data['postData']}")
            except:
                pass
        
    except Exception as e:
        print(f"⚠️  Could not interact with search button: {e}")
    
    print("\n📄 Examining page source for embedded data...")
    
    page_source = driver.page_source
    
    # Look for data patterns
    if 'kendraCode' in page_source or 'kendra_code' in page_source:
        print("✅ Found 'kendraCode' in page source - data might be embedded")
    
    if 'ownerName' in page_source or 'owner_name' in page_source:
        print("✅ Found 'ownerName' in page source - data might be embedded")
    
    driver.quit()
    
    print("\n" + "=" * 80)
    print("SUMMARY")
    print("=" * 80)
    print("""
The automated capture is limited. For the most accurate results:

MANUAL METHOD (Recommended):
1. Open Chrome/Firefox
2. Go to https://janaushadhi.gov.in/locate-kendra
3. Open DevTools (F12) → Network tab
4. Filter by: XHR or Fetch
5. Click the Search button
6. Look for API calls showing JSON responses
7. Right-click the request → Copy → Copy as cURL
8. Share the cURL command with me

The API endpoint is definitely there - we just need to capture
it during actual user interaction.
""")
    
except Exception as e:
    print(f"\n❌ Error: {e}")
    print("\nPlease install Chrome browser if not already installed.")
    print("Selenium requires Chrome to capture network requests.")
