import requests
import json

BASE_URL = "http://localhost:8000/api/v1"

credentials = {
    "email": "pharmacy@test.com",
    "password": "Test123456"
}

print("=" * 80)
print("TESTING FRONTEND LOGIN FLOW")
print("=" * 80)

# Step 1: Login
print("\n1. POST /api/v1/auth/login")
login_response = requests.post(f"{BASE_URL}/auth/login", json=credentials)

if login_response.status_code == 200:
    print("✅ Login successful")
    data = login_response.json()
    token = data.get('access_token')
    print(f"   Token: {token[:50]}...")
    
    # Step 2: Get user details
    print("\n2. GET /api/v1/auth/me")
    headers = {"Authorization": f"Bearer {token}"}
    me_response = requests.get(f"{BASE_URL}/auth/me", headers=headers)
    
    if me_response.status_code == 200:
        user = me_response.json()
        print("✅ User details retrieved")
        print("\n" + "=" * 80)
        print("USER OBJECT RETURNED BY BACKEND:")
        print("=" * 80)
        print(json.dumps(user, indent=2))
        print("=" * 80)
        
        print("\n📋 KEY CHECKS:")
        print(f"   - user['role'] = {repr(user.get('role'))}")
        print(f"   - type(user['role']) = {type(user.get('role'))}")
        print(f"   - user['role'] == 'PHARMACY_OWNER': {user.get('role') == 'PHARMACY_OWNER'}")
        
        print("\n📋 FRONTEND WILL CHECK:")
        print(f"   - allowedRoles = ['PHARMACY_OWNER']")
        print(f"   - currentUser.role = {repr(user.get('role'))}")
        print(f"   - allowedRoles.includes(currentUser.role) = {user.get('role') in ['PHARMACY_OWNER']}")
        
        if user.get('role') == 'PHARMACY_OWNER':
            print("\n✅ Role check will PASS")
        else:
            print("\n❌ Role check will FAIL")
            print(f"   Expected: 'PHARMACY_OWNER'")
            print(f"   Got: {repr(user.get('role'))}")
    else:
        print(f"❌ Failed to get user: {me_response.status_code}")
        print(f"   Response: {me_response.text}")
else:
    print(f"❌ Login failed: {login_response.status_code}")
    print(f"   Response: {login_response.text}")

print("\n" + "=" * 80)
