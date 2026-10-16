"""
Test PMBI GraphQL API
"""

import requests
import json

graphql_url = "https://janaushadhi.gov.in/graphql"

headers = {
    'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36',
    'Content-Type': 'application/json',
    'Accept': 'application/json',
    'Referer': 'https://janaushadhi.gov.in/locate-kendra',
}

print("=" * 80)
print("TESTING PMBI GRAPHQL API")
print("=" * 80)

# Test 1: Introspection query (discover schema)
print("\n1️⃣  SCHEMA INTROSPECTION")
print("=" * 80)

introspection_query = {
    "query": """
        query IntrospectionQuery {
            __schema {
                queryType { name }
                mutationType { name }
                types {
                    name
                    kind
                    description
                }
            }
        }
    """
}

try:
    response = requests.post(graphql_url, json=introspection_query, headers=headers, timeout=10)
    print(f"Status: {response.status_code}")
    
    if response.status_code == 200:
        try:
            data = response.json()
            if 'data' in data and '__schema' in data['data']:
                types = data['data']['__schema']['types']
                kendra_types = [t for t in types if 'kendra' in t['name'].lower()]
                
                print(f"\n✅ GraphQL Schema discovered!")
                print(f"   Total types: {len(types)}")
                print(f"\n   Kendra-related types:")
                for t in kendra_types:
                    print(f"      - {t['name']} ({t['kind']})")
            else:
                print(f"   Response: {json.dumps(data, indent=2)[:500]}")
        except Exception as e:
            print(f"   Error parsing: {e}")
            print(f"   Raw response: {response.text[:500]}")
    else:
        print(f"   Response: {response.text[:500]}")
except Exception as e:
    print(f"❌ Error: {e}")

# Test 2: Simple queries
print("\n2️⃣  TESTING SIMPLE QUERIES")
print("=" * 80)

test_queries = [
    {"query": "{ kendras { id name } }"},
    {"query": "{ kendra { id name } }"},
    {"query": "{ allKendras { id name } }"},
    {"query": "{ searchKendras { id name } }"},
]

for q in test_queries:
    try:
        response = requests.post(graphql_url, json=q, headers=headers, timeout=5)
        if response.status_code == 200:
            try:
                data = response.json()
                print(f"\n✅ Query worked: {q['query'][:50]}")
                print(f"   Response keys: {list(data.keys())}")
                if 'data' in data:
                    print(f"   Data keys: {list(data['data'].keys())}")
            except:
                pass
    except:
        pass

print("\n3️⃣  TESTING WITH FILTERS")
print("=" * 80)

filtered_queries = [
    {
        "query": """
            query {
                kendras(state: "Delhi") {
                    id
                    name
                    state
                }
            }
        """
    },
    {
        "query": """
            query SearchKendras($state: String) {
                kendras(state: $state) {
                    id
                    code
                    name
                }
            }
        """,
        "variables": {"state": "Delhi"}
    },
]

for q in filtered_queries:
    try:
        response = requests.post(graphql_url, json=q, headers=headers, timeout=5)
        if response.status_code == 200:
            try:
                data = response.json()
                if 'data' in data and data['data']:
                    print(f"\n✅ Filtered query SUCCESS")
                    print(f"   Query: {q['query'][:100]}")
                    print(f"   Data: {json.dumps(data['data'], indent=2)[:300]}")
            except:
                pass
    except:
        pass

print("\n" + "=" * 80)
print("NEXT STEPS")
print("=" * 80)
print("""
If GraphQL introspection is disabled, we need to:
1. Use browser DevTools to capture actual queries
2. Or examine the React app's JavaScript source
3. Or test common GraphQL query patterns

Let me know if you want me to inspect the JavaScript source files.
""")
