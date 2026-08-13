from pymongo import MongoClient
import bcrypt
from datetime import datetime

# Connect to MongoDB
client = MongoClient("mongodb://localhost:27017")
db = client["smart_medicine_system"]

print("=" * 80)
print("SETTING UP PHARMACY_OWNER USER")
print("=" * 80)

# Check if user exists
user = db.users.find_one({"email": "pharmacy@test.com"})

if user:
    print(f"\n✅ User found: {user.get('full_name')}")
    print(f"   Current role: {user.get('role', 'USER')}")
    print(f"   Email verified: {user.get('is_email_verified', False)}")
    
    # Update user to be verified and PHARMACY_OWNER
    result = db.users.update_one(
        {"email": "pharmacy@test.com"},
        {"$set": {
            "is_email_verified": True,
            "role": "PHARMACY_OWNER",
            "status": "ACTIVE",
            "updated_at": datetime.utcnow()
        }}
    )
    
    if result.modified_count > 0:
        print("\n✅ User updated successfully!")
        print("   - Email verified: True")
        print("   - Role: PHARMACY_OWNER")
        print("   - Status: active")
    else:
        print("\n⚠️  No changes made (user might already be updated)")
    
    # Verify the update
    updated_user = db.users.find_one({"email": "pharmacy@test.com"})
    print(f"\n📋 Updated User Details:")
    print(f"   - Name: {updated_user.get('full_name')}")
    print(f"   - Email: {updated_user.get('email')}")
    print(f"   - Phone: {updated_user.get('phone_number')}")
    print(f"   - Role: {updated_user.get('role')}")
    print(f"   - Status: {updated_user.get('status')}")
    print(f"   - Email Verified: {updated_user.get('is_email_verified')}")
    
else:
    print("\n❌ User not found. Creating new PHARMACY_OWNER user...")
    
    # Hash password
    password = "Test123456"
    hashed_password = bcrypt.hashpw(password.encode('utf-8'), bcrypt.gensalt())
    
    # Create user document
    new_user = {
        "full_name": "Test Pharmacy Owner",
        "email": "pharmacy@test.com",
        "phone_number": "1234567890",
        "password": hashed_password.decode('utf-8'),
        "role": "PHARMACY_OWNER",
        "status": "ACTIVE",
        "is_email_verified": True,
        "created_at": datetime.utcnow(),
        "updated_at": datetime.utcnow()
    }
    
    result = db.users.insert_one(new_user)
    print(f"✅ User created with ID: {result.inserted_id}")

print("\n" + "=" * 80)
print("LOGIN CREDENTIALS:")
print("=" * 80)
print("Email: pharmacy@test.com")
print("Password: Test123456")
print("Role: PHARMACY_OWNER")
print("=" * 80)
print("\nYou can now login at: http://localhost:5174/login")
print("=" * 80)

client.close()
