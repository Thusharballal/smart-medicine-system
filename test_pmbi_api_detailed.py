"""
Detailed PMBI API Testing with different configurations
"""

import requests
import json
import warnings
warnings.filterwarnings('ignore', message='Unverified HTTPS request')

print("=" * 80)
print("DETAILED PMBI API TESTING")
print("=" * 80)

# Test different base URLs and configurations
test_configs = [
    {
        'name': 'Port 8443 (discovered)',
        'base_url': 'https://janaushadhi.gov.in:8443',
        'verify': False,
    },
    {
        'name': 'Standard HTTPS (no port)',
        'base_url': 'https://janaushadhi.gov.in',
        'verify': False,
    },
    {
        'name': 'HTTP (no SSL)',
        'base_url': 'http://janaushadhi.gov.in:8443',
        'verify': False,
    },
]

endpoints = [
    '/api/kendra/getAllStateOfIndia',
    '/api/v1/website/getAllKendraByStateDistrict',
]

for config in test_configs:
    print(f"\n{'=' * 80}")
    print(f"Testing: {config['name']}")
    print(f"Base URL: {config['base_url']}")
    print('=' * 80)
    
    for endpoint in endpoints:
        url = config['base_url'] + endpoint
        print(f"\n🔗 {url}")
        
        # Try different header combinations
        header_sets = [
            {
                'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36',
                'Accept': 'application/json',
                'Referer': 'https://janaushadhi.gov.in/locate-kendra',
                'Origin': 'https://janaushadhi.gov.in',
            },
            {
                'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36',
                'Accept': '*/*',
            },
        ]
        
        for i, headers in enumerate(header_sets):
            try:
                response = requests.get(
                    url,
                    headers=headers,
                    timeout=15,
                    verify=config['verify'],
                    allow_redirects=True
                )
                
                if response.status_code == 200:
                    print(f"  ✅ SUCCESS (Header set {i+1})")
                    print(f"     Status: {response.status_code}")
                    print(f"     Content-Type: {response.headers.get('Content-Type')}")
                    
                    try:
                        data = response.json()
                        if isinstance(data, list):
                            print(f"     Records: {len(data)}")
                            if len(data) > 0:
                                print(f"     Sample: {json.dumps(data[0], indent=6)[:300]}")
                        elif isinstance(data, dict):
                            print(f"     Keys: {list(data.keys())}")
                    except:
                        print(f"     Text: {response.text[:200]}")
                    
                    break  # Success, no need to try other headers
                    
                elif response.status_code == 500:
                    if i == 0:
                        print(f"  ⚠️  500 Error with header set {i+1}, trying next...")
                elif response.status_code == 404:
                    print(f"  ❌ 404 Not Found")
                    break
                else:
                    print(f"  ⚠️  Status {response.status_code}")
                    
            except requests.exceptions.SSLError as e:
                print(f"  ❌ SSL Error: {str(e)[:100]}")
                break
            except requests.exceptions.Timeout:
                print(f"  ⚠️  Timeout")
                break
            except Exception as e:
                print(f"  ❌ Error: {str(e)[:100]}")
                break

print("\n" + "=" * 80)
print("TRYING POST METHOD")
print("=" * 80)

url = "https://janaushadhi.gov.in:8443/api/v1/website/getAllKendraByStateDistrict"

headers = {
    'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36',
    'Accept': 'application/json',
    'Content-Type': 'application/json',
    'Referer': 'https://janaushadhi.gov.in/locate-kendra',
    'Origin': 'https://janaushadhi.gov.in',
}

payloads = [
    {},
    {'stateId': None, 'districtId': None},
    {'stateId': 0, 'districtId': 0},
]

for payload in payloads:
    try:
        response = requests.post(
            url,
            json=payload,
            headers=headers,
            timeout=15,
            verify=False
        )
        
        if response.status_code == 200:
            print(f"\n✅ POST SUCCESS with payload: {payload}")
            try:
                data = response.json()
                if isinstance(data, list):
                    print(f"   Records: {len(data)}")
                    if len(data) > 0:
                        print(f"   Sample record:")
                        print(json.dumps(data[0], indent=2))
            except:
                print(f"   Response: {response.text[:300]}")
        else:
            print(f"⚠️  POST with {payload}: Status {response.status_code}")
            
    except Exception as e:
        pass

print("\n" + "=" * 80)
print("SUMMARY")
print("=" * 80)
print("""
If all attempts failed:
1. The API port :8443 might be blocked from external access
2. The API might require session cookies from the frontend
3. The API might have CORS restrictions
4. The Selenium capture showed the API exists, but it might only
   work from the browser context

Solution: We may need to use Selenium to actually execute the
API calls within the browser context and extract the data.
""")
