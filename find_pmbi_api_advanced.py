"""
Advanced PMBI API Investigation
Tries to find the actual backend API by examining network patterns
"""

import requests
import json
import re

print("=" * 80)
print("ADVANCED PMBI API INVESTIGATION")
print("=" * 80)

base_url = "https://janaushadhi.gov.in"
headers = {
    'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36',
    'Accept': 'application/json',
    'Referer': 'https://janaushadhi.gov.in/locate-kendra',
}

# Common backend API patterns
backend_patterns = [
    "https://api.janaushadhi.gov.in",
    "https://backend.janaushadhi.gov.in",
    "https://data.janaushadhi.gov.in",
    "https://services.janaushadhi.gov.in",
    "https://janaushadhi.gov.in/backend",
    "https://janaushadhi.gov.in/server",
    "https://janaushadhi.gov.in/api",
]

# Kendra-related endpoints
kendra_endpoints = [
    "/kendra",
    "/kendras",
    "/search",
    "/locate",
    "/api/kendra",
    "/api/kendras",
    "/api/v1/kendra",
    "/api/v1/kendras",
    "/api/search-kendra",
    "/api/locate-kendra",
]

print("\n1️⃣  TESTING BACKEND DOMAINS")
print("=" * 80)

for backend in backend_patterns:
    try:
        response = requests.get(backend, headers=headers, timeout=5)
        if response.status_code != 404:
            print(f"✅ {backend} - Status {response.status_code}")
    except Exception as e:
        pass

print("\n2️⃣  TESTING POST REQUESTS (Search/Filter Pattern)")
print("=" * 80)

search_endpoints = [
    f"{base_url}/api/search",
    f"{base_url}/api/kendra/search",
    f"{base_url}/api/kendras/search",
    f"{base_url}/api/locate",
]

test_payloads = [
    {},
    {"state": "Delhi"},
    {"district": "Central Delhi"},
    {"pinCode": "110001"},
    {"kendraCode": ""},
]

for endpoint in search_endpoints:
    for payload in test_payloads:
        try:
            response = requests.post(
                endpoint,
                json=payload,
                headers={**headers, 'Content-Type': 'application/json'},
                timeout=5
            )
            if response.status_code == 200:
                try:
                    data = response.json()
                    print(f"\n✅ SUCCESS: POST {endpoint}")
                    print(f"   Payload: {payload}")
                    print(f"   Response type: {type(data)}")
                    if isinstance(data, list):
                        print(f"   Records: {len(data)}")
                        if len(data) > 0:
                            print(f"   Sample: {list(data[0].keys())[:5]}")
                    elif isinstance(data, dict):
                        print(f"   Keys: {list(data.keys())}")
                except:
                    pass
        except:
            pass

print("\n3️⃣  CHECKING COMMON BACKEND PATTERNS")
print("=" * 80)

# Try GraphQL
graphql_url = f"{base_url}/graphql"
try:
    response = requests.post(
        graphql_url,
        json={"query": "{ kendras { id } }"},
        headers=headers,
        timeout=5
    )
    if response.status_code != 404:
        print(f"✅ GraphQL endpoint found: {graphql_url}")
        print(f"   Status: {response.status_code}")
except:
    pass

# Try REST with different methods
print("\n4️⃣  TRYING REST PATTERNS")
print("=" * 80)

rest_urls = [
    f"{base_url}/rest/kendra",
    f"{base_url}/rest/kendras",
    f"{base_url}/webapi/kendra",
    f"{base_url}/webapi/kendras",
]

for url in rest_urls:
    try:
        response = requests.get(url, headers=headers, timeout=5)
        if response.status_code == 200:
            try:
                data = response.json()
                print(f"✅ {url}")
                print(f"   Type: {type(data)}")
                if isinstance(data, list) and len(data) > 0:
                    print(f"   Sample keys: {list(data[0].keys())}")
            except:
                pass
    except:
        pass

print("\n5️⃣  FINAL RECOMMENDATIONS")
print("=" * 80)
print("""
The PMBI website appears to be a React Single Page Application.

To find the actual API:

METHOD 1: Browser DevTools (Most Reliable)
1. Open https://janaushadhi.gov.in/locate-kendra in Chrome/Firefox
2. Open DevTools (F12) → Network tab
3. Filter: XHR or Fetch
4. Click "Search" or interact with the form
5. Look for API calls showing JSON responses

METHOD 2: Inspect JavaScript Source
1. View page source
2. Find React bundle JavaScript files (main.*.js)
3. Search for:
   - "fetch("
   - "axios.get"
   - "/api/"
   - "kendra"

METHOD 3: Check Mobile App
The page mentions "Jan Aushadhi Sugam" mobile app.
Mobile apps often use clearer REST APIs.
We could:
1. Decompile the Android APK
2. Find the API endpoint URLs
3. Use those same endpoints

Would you like me to try METHOD 2 (inspect JavaScript source)?
""")
