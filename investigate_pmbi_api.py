"""
PMBI Jan Aushadhi Kendra API Investigation Script
This script investigates the official PMBI website to find the Kendra data API
"""

import requests
import json
from urllib.parse import urljoin

print("=" * 80)
print("INVESTIGATING PMBI JAN AUSHADHI KENDRA API")
print("=" * 80)

base_url = "https://janaushadhi.gov.in"
locate_kendra_url = "https://janaushadhi.gov.in/locate-kendra"

print(f"\n🔍 Analyzing: {locate_kendra_url}")

# Common API endpoints to test
potential_endpoints = [
    "/api/kendras",
    "/api/kendra",
    "/api/locate-kendra",
    "/api/search-kendra",
    "/kendras",
    "/kendra",
    "/locate",
    "/search",
    "/api/v1/kendras",
    "/api/v1/kendra",
]

headers = {
    'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36',
    'Accept': 'application/json, text/plain, */*',
    'Accept-Language': 'en-US,en;q=0.9',
    'Referer': locate_kendra_url,
}

print("\n" + "=" * 80)
print("TESTING POTENTIAL API ENDPOINTS")
print("=" * 80)

for endpoint in potential_endpoints:
    url = urljoin(base_url, endpoint)
    try:
        response = requests.get(url, headers=headers, timeout=10)
        if response.status_code == 200:
            print(f"\n✅ {url}")
            print(f"   Status: {response.status_code}")
            print(f"   Content-Type: {response.headers.get('Content-Type', 'N/A')}")
            print(f"   Content-Length: {len(response.content)} bytes")
            
            # Try to parse as JSON
            try:
                data = response.json()
                print(f"   JSON Keys: {list(data.keys())[:5]}")
            except:
                print(f"   First 200 chars: {response.text[:200]}")
        elif response.status_code == 404:
            print(f"⚠️  {url} - Not Found (404)")
        else:
            print(f"⚠️  {url} - Status {response.status_code}")
    except requests.RequestException as e:
        print(f"❌ {url} - Error: {str(e)[:50]}")

print("\n" + "=" * 80)
print("TESTING WITH PARAMETERS")
print("=" * 80)

# Try common parameter patterns
test_params_list = [
    {},
    {'state': 'Delhi'},
    {'district': 'Central Delhi'},
    {'pincode': '110001'},
    {'kendra_code': ''},
    {'page': '1'},
    {'limit': '10'},
]

for endpoint in ['/api/kendras', '/kendras', '/api/kendra']:
    url = urljoin(base_url, endpoint)
    for params in test_params_list:
        if not params:  # Skip empty params for now
            continue
        try:
            response = requests.get(url, params=params, headers=headers, timeout=10)
            if response.status_code == 200:
                print(f"\n✅ SUCCESS: {url}")
                print(f"   Params: {params}")
                print(f"   Status: {response.status_code}")
                try:
                    data = response.json()
                    print(f"   Response keys: {list(data.keys())}")
                    if isinstance(data, list):
                        print(f"   Records: {len(data)}")
                    elif isinstance(data, dict) and 'data' in data:
                        print(f"   Records: {len(data['data']) if isinstance(data['data'], list) else 'N/A'}")
                except:
                    pass
        except:
            pass

print("\n" + "=" * 80)
print("CHECKING MAIN PAGE FOR EMBEDDED DATA")
print("=" * 80)

try:
    response = requests.get(locate_kendra_url, headers=headers, timeout=10)
    html = response.text
    
    # Look for API endpoints in JavaScript
    if 'api' in html.lower():
        print("\n✅ Found 'api' references in HTML")
        lines = [line.strip() for line in html.split('\n') if 'api' in line.lower()]
        for line in lines[:10]:
            if 'http' in line or 'fetch' in line or 'axios' in line:
                print(f"   {line[:150]}")
    
    # Look for JavaScript files
    if '.js' in html:
        print("\n📄 JavaScript files found - may contain API calls")
        
except Exception as e:
    print(f"\n❌ Error fetching main page: {e}")

print("\n" + "=" * 80)
print("RECOMMENDATION")
print("=" * 80)
print("""
To find the actual API endpoint, we need to:
1. Open the page in a browser with DevTools
2. Monitor Network tab
3. Interact with the search form
4. Capture the actual API request

Alternative: Check the page's JavaScript source code for:
- fetch() calls
- axios.get/post() calls
- XMLHttpRequest
- API endpoint strings
""")
