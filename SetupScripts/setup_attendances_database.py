from pymongo import MongoClient
from pymongo.errors import ServerSelectionTimeoutError

def setup_attendances_database():
    try:
        # Connect to MongoDB on default port
        client = MongoClient('mongodb://localhost:27017/', serverSelectionTimeoutMS=2000)

        # Confirm connection
        client.server_info()

        # Access SDAM DB
        db = client['SDAM']

        # Create/Access Attendances collection
        attendances_collection = db['Attendances']

        # Create a compound index to prevent duplicate entries for same session
        attendances_collection.create_index(
            [("teacherName", 1), ("date", 1), ("timeSlot", 1)],
            unique=True
        )

        # Insert sample record (optional, for test)
        sample_attendance = {
            "teacherName": "John Doe",
            "date": "21/04/2025",
            "timeSlot": "10:00 - 11:00",
            "studentsPresent": ["Alice", "Bob", "Charlie"],
            "imageFilename": "example-image.jpg"
        }

        result = attendances_collection.insert_one(sample_attendance)
        print("Attendances collection created successfully!")
        print(f"Sample record inserted with id: {result.inserted_id}")

    except ServerSelectionTimeoutError:
        print("❌ Could not connect to MongoDB. Make sure it's running on port 27017.")
    except Exception as e:
        print(f"❌ Error: {str(e)}")

if __name__ == "__main__":
    setup_attendances_database()
