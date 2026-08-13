import requests
import json

BASE_URL = "http://localhost:8000/api/v1"

# Test data
pharmacy_owner = {
    "full_name": "Test Pharmacy Owner",
    "email": "pharmacy@test.com",
    "phone_number": "1234567890",
    "password": "Test123456"
}

print("=" * 80)
print("TESTING PHARMACY_OWNER AUTHENTICATION")
print("=" * 80)

# Step 1: Try to login first (in case user already exists)
print("\n1. Attempting login with existing credentials...")
try:
    login_response = requests.post(
        f"{BASE_URL}/auth/login",
        json={
            "email": pharmacy_owner["email"],
            "password": pharmacy_owner["password"]
        }
    )
    
    if login_response.status_code == 200:
        print("✅ Login successful!")
        data = login_response.json()
        print(f"   Access Token: {data.get('access_token', 'N/A')[:50]}...")
        
        # Get user details
        token = data.get('access_token')
        headers = {"Authorization": f"Bearer {token}"}
        
        me_response = requests.get(f"{BASE_URL}/auth/me", headers=headers)
        if me_response.status_code == 200:
            user = me_response.json()
            print(f"\n   User Details:")
            print(f"   - Name: {user.get('name')}")
            print(f"   - Email: {user.get('email')}")
            print(f"   - Role: {user.get('role')}")
            print(f"   - ID: {user.get('_id')}")
        
        print("\n" + "=" * 80)
        print("CREDENTIALS FOR TESTING:")
        print("=" * 80)
        print(f"Email: {pharmacy_owner['email']}")
        print(f"Password: {pharmacy_owner['password']}")
        print("=" * 80)
        
    else:
        print(f"❌ Login failed: {login_response.status_code}")
        print(f"   Response: {login_response.text}")
        print("\n2. User doesn't exist. Attempting registration...")
        
        # Step 2: Register new user
        register_response = requests.post(
            f"{BASE_URL}/auth/register",
            json=pharmacy_owner
        )
        
        if register_response.status_code == 201:
            print("✅ Registration successful!")
            print("   Waiting for OTP verification...")
            print("\n   NOTE: Check the email or backend logs for OTP code")
            print("   You'll need to verify OTP before login works")
        else:
            print(f"❌ Registration failed: {register_response.status_code}")
            print(f"   Response: {register_response.text}")
            
except Exception as e:
    print(f"❌ Error: {str(e)}")
