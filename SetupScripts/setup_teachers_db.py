from pymongo import MongoClient
from pymongo.errors import ServerSelectionTimeoutError

def setup_teachers_database():
    try:
        # Connect to MongoDB using default port 27017
        client = MongoClient('mongodb://localhost:27017/', serverSelectionTimeoutMS=2000)
        
        # Test the connection
        client.server_info()
        
        # Create/Access the SDAM database
        db = client['SDAM']
        
        # Create/Access the teachers collection
        teachers_collection = db['Teachers']
        
        # Create a unique index on email to prevent duplicate entries
        teachers_collection.create_index('email', unique=True)
        
        # Example teacher data (you can remove this later)
        sample_teacher = {
            "name": "John Doe",
            "email": "john.doe@example.com",
            "password": "hashedpassword123"  # In real application, this should be hashed
        }
        
        # Insert the sample teacher
        result = teachers_collection.insert_one(sample_teacher)
        
        print("Teachers database and collection created successfully!")
        print(f"Sample teacher inserted with id: {result.inserted_id}")
        
    except ServerSelectionTimeoutError:
        print("Failed to connect to MongoDB. Make sure the server is running on port 27017")
    except Exception as e:
        print(f"An error occurred: {str(e)}")

if __name__ == "__main__":
    setup_teachers_database()