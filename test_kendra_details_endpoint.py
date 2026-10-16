"""
Test KendraDetails endpoint found in search results
"""

import requests
import json

print("=" * 80)
print("TESTING KENDRA DETAILS ENDPOINT")
print("=" * 80)

base_url = "https://janaushadhi.gov.in"
endpoints = [
    "/KendraDetails",
    "/kendraDetails",
    "/kendra-details",
    "/api/KendraDetails",
    "/api/kendraDetails",
]

headers = {
    'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36',
    'Accept': 'application/json, text/plain, */*',
    'Referer': 'https://janaushadhi.gov.in/locate-kendra',
}

for endpoint in endpoints:
    url = base_url + endpoint
    print(f"\n🔍 Testing: {url}")
    
    try:
        # Try GET
        response = requests.get(url, headers=headers, timeout=10)
        print(f"   GET Status: {response.status_code}")
        
        if response.status_code == 200:
            content_type = response.headers.get('Content-Type', '')
            print(f"   Content-Type: {content_type}")
            
            if 'json' in content_type:
                try:
                    data = response.json()
                    print(f"   ✅ JSON Response!")
                    print(f"   Type: {type(data)}")
                    if isinstance(data, list):
                        print(f"   Records: {len(data)}")
                        if len(data) > 0:
                            print(f"   Sample keys: {list(data[0].keys())}")
                            print(f"   Sample record:")
                            print(json.dumps(data[0], indent=2)[:500])
                    elif isinstance(data, dict):
                        print(f"   Keys: {list(data.keys())}")
                except Exception as e:
                    print(f"   JSON parse error: {e}")
            else:
                print(f"   First 200 chars: {response.text[:200]}")
        
        # Try POST
        response_post = requests.post(url, json={}, headers=headers, timeout=10)
        if response_post.status_code == 200 and 'json' in response_post.headers.get('Content-Type', ''):
            print(f"   POST Status: {response_post.status_code}")
            print(f"   ✅ POST works with JSON!")
            
    except Exception as e:
        print(f"   Error: {str(e)[:100]}")

print("\n" + "=" * 80)
print("TRYING COMMON PATTERNS")
print("=" * 80)

patterns = [
    "/api/kendra/list",
    "/api/kendra/all",
    "/api/kendra/search",
    "/api/v1/kendra/list",
    "/kendra/list",
    "/kendra/all",
]

for pattern in patterns:
    url = base_url + pattern
    try:
        response = requests.get(url, headers=headers, timeout=5)
        if response.status_code == 200:
            print(f"✅ {url} - Status {response.status_code}")
            if 'json' in response.headers.get('Content-Type', ''):
                try:
                    data = response.json()
                    if isinstance(data, list) and len(data) > 0:
                        print(f"   Records: {len(data)}")
                        print(f"   Sample: {list(data[0].keys())[:5]}")
                except:
                    pass
    except:
        pass

print("\n" + "=" * 80)
print("SUMMARY")
print("=" * 80)
print("""
If no API endpoint found, the data might be:
1. Loaded client-side from embedded JSON
2. Behind authentication
3. Using a different domain/subdomain
4. Loaded via WebSocket
5. In the React app's JavaScript bundle

Next step: I can create a browser automation script using Selenium
to interact with the page and capture network requests.
""")
