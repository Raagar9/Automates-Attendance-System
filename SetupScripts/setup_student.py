import os
import torch
import numpy as np
from PIL import Image
from facenet_pytorch import InceptionResnetV1, MTCNN
from tqdm import tqdm
from pymongo import MongoClient
import re

# MongoDB setup
client = MongoClient('mongodb://localhost:27017/')
db = client['SDAM']
students_collection = db['Students']

# Define paths and models (similar to add_new_embeddings.py)
data_dir = r"C:\Users\SHREYAS\SDAM\Data"
device = torch.device('cuda' if torch.cuda.is_available() else 'cpu')
mtcnn = MTCNN(image_size=160, margin=0, min_face_size=20, device=device)
resnet = InceptionResnetV1(pretrained='vggface2').eval().to(device)

def generate_email(name):
    # Convert name to lowercase and remove spaces
    email = name.lower().replace(' ', '')
    # Remove any special characters
    email = re.sub(r'[^a-z0-9]', '', email)
    return f"{email}@gmail.com"

def process_student(name, folder_path):
    """Process a student's images and return their face embedding"""
    embeddings = []
    
    for file in os.listdir(folder_path):
        img_path = os.path.join(folder_path, file)
        try:
            img = Image.open(img_path)
            face = mtcnn(img)
            if face is not None:
                face_embedding = resnet(face.unsqueeze(0).to(device))
                embeddings.append(face_embedding.detach().cpu().numpy())
        except Exception as e:
            print(f"[ERROR] {e} on {img_path}")

    if not embeddings:
        return None
        
    return np.mean(embeddings, axis=0)

def setup_students():
    print("[INFO] Starting student setup process...")
    
    # Process each student folder
    student_names = os.listdir(data_dir)
    
    for name in tqdm(student_names, desc="Processing Students"):
        folder = os.path.join(data_dir, name)
        if not os.path.isdir(folder):
            continue
            
        # Check if student already exists
        email = generate_email(name)
        if students_collection.find_one({"email": email}):
            print(f"[SKIP] Student {name} already exists")
            continue
            
        # Generate face embedding
        embedding = process_student(name, folder)
        if embedding is None:
            print(f"[WARNING] No valid face found for {name}")
            continue
            
        # Create student document
        student_doc = {
            "name": name,
            "email": email,
            "password": email,  # Using email as password as requested
            "face_embedding": embedding.tolist()  # Convert numpy array to list for MongoDB storage
        }
        
        try:
            # Insert into MongoDB
            result = students_collection.insert_one(student_doc)
            print(f"[SUCCESS] Added student {name} with ID: {result.inserted_id}")
        except Exception as e:
            print(f"[ERROR] Failed to add student {name}: {str(e)}")

if __name__ == "__main__":
    # Create unique index on email field
    students_collection.create_index("email", unique=True)
    
    # Start setup process
    setup_students()
    print("[INFO] Student setup process completed")