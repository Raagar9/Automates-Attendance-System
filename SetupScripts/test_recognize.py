import unittest
import os
from recognize import load_embeddings_from_mongodb, recognize_faces_with_annotation
from pymongo import MongoClient

class TestRecognition(unittest.TestCase):
    def setUp(self):
        # Connect to MongoDB
        self.client = MongoClient('mongodb://localhost:27017/')
        self.db = self.client['SDAM']
        self.students_collection = self.db['Students']
        
        # Test image path
        self.test_image = r"C:\Users\SHREYAS\SDAM\Input\Input 1.jpg"

    def test_database_connection(self):
        # Test if we can load embeddings
        database = load_embeddings_from_mongodb()
        print(f"\n=== Database Test ===")
        print(f"Total students in database: {len(database)}")
        print("===================")
        self.assertGreater(len(database), 0, "No embeddings loaded from MongoDB")

    def test_face_recognition(self):
        # Test if the image exists
        print(f"\n=== Recognition Test ===")
        self.assertTrue(os.path.exists(self.test_image), "Test image not found")
        
        # Run recognition without saving files
        recognize_faces_with_annotation(self.test_image, save_files=False)
        print("=====================")

if __name__ == '__main__':
    unittest.main(verbosity=2)