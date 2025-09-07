import os
os.environ['TF_CPP_MIN_LOG_LEVEL'] = '2'  # Suppress TensorFlow logs

import numpy as np
import cv2
from mtcnn import MTCNN
import torch
from facenet_pytorch import InceptionResnetV1
import sys
from pymongo import MongoClient

# Initialize MongoDB connection
client = MongoClient('mongodb://localhost:27017/')
db = client['SDAM']
students_collection = db['Students']

# Initialize models
facenet = InceptionResnetV1(pretrained='vggface2').eval()
detector = MTCNN()

# Load face embeddings from MongoDB
def load_embeddings_from_mongodb():
    database = {}
    students = students_collection.find({}, {'name': 1, 'face_embedding': 1})
    for student in students:
        database[student['name']] = np.array(student['face_embedding'])
    return database

# Load the face embeddings database from MongoDB
database = load_embeddings_from_mongodb()
print(f"[INFO] Loaded {len(database)} student embeddings from MongoDB")

# Compute normalized embeddings
def get_face_embedding(image):
    resized_face = cv2.resize(image, (160, 160))
    resized_face = resized_face / 255.0
    resized_face = torch.tensor(resized_face).permute(2, 0, 1).unsqueeze(0).float()
    embedding = facenet(resized_face).detach().numpy().flatten()
    return embedding / np.linalg.norm(embedding)

# Improved cosine similarity function with better handling of embedding dimensions
def cosine_similarity(embedding1, embedding2):
    embedding2 = np.squeeze(embedding2)  # Flatten from shape (1, 512) to (512,)
    return np.dot(embedding1, embedding2) / (np.linalg.norm(embedding1) * np.linalg.norm(embedding2))

# Main function
def recognize_faces_with_annotation(image_path, save_files=True):  # Changed default to True
    image = cv2.imread(image_path)
    rgb_image = cv2.cvtColor(image, cv2.COLOR_BGR2RGB)
    detections = detector.detect_faces(rgb_image)

    if not detections:
        print("No faces detected.")
        return

    attendance = []
    recognized_names = set()

    for i, detection in enumerate(detections):
        x, y, width, height = detection['box']
        cropped_face = image[y:y+height, x:x+width]

        embedding = get_face_embedding(cropped_face)
        similarity_scores = [(name, cosine_similarity(embedding, db_emb)) for name, db_emb in database.items()]
        similarity_scores.sort(key=lambda x: x[1], reverse=True)

        threshold = 0.45
        recognized_name = "Unknown"
        if similarity_scores and similarity_scores[0][1] >= threshold and similarity_scores[0][0] not in recognized_names:
            recognized_name = similarity_scores[0][0]
            recognized_names.add(recognized_name)

        attendance.append(recognized_name)
        print(f"Face {i+1} recognized as: {recognized_name} (similarity: {similarity_scores[0][1]:.2f})")

        # Draw and annotate
        cv2.rectangle(image, (x, y), (x + width, y + height), (0, 255, 0), 2)
        cv2.putText(image, recognized_name, (x, y - 10), cv2.FONT_HERSHEY_SIMPLEX, 0.8, (0, 255, 0), 2)

    # Print summary of present students
    print("\n=== Present Students ===")
    present_students = sorted(name for name in recognized_names if name != "Unknown")
    if present_students:
        for name in present_students:
            print(f"* {name}")  # Changed ✓ to *
    else:
        print("No known students detected")
    print("=====================")

    # Remove the popup window display
    # cv2.imshow("Recognition Result", image)
    # cv2.waitKey(0)
    # cv2.destroyAllWindows()

    # Always save results
    try:
        # Use the existing backend/Output directory
        output_dir = r"C:\Users\SHREYAS\SDAM\backend\Output"
        
        # Get base filename without extension
        base_filename = os.path.splitext(os.path.basename(image_path))[0]
        
        # Create full paths for output files
        txt_path = os.path.join(output_dir, f"{base_filename}_attendance.txt")
        annotated_img_path = os.path.join(output_dir, f"{base_filename}_annotated.jpg")
        
        # Save attendance file
        with open(txt_path, 'w') as f:
            for name in sorted(set(attendance)):
                if name != "Unknown":
                    f.write(f"{name}\n")

        # Save annotated image
        cv2.imwrite(annotated_img_path, image)
        
        print(f"\nAttendance saved to: {txt_path}")
        print(f"Annotated image saved to: {annotated_img_path}")
        
        return txt_path, annotated_img_path
    
    except Exception as e:
        print(f"Error saving files: {str(e)}")
        return None, None

if __name__ == "__main__":
    if len(sys.argv) < 2 or len(sys.argv) > 3:
        print("Usage: python recognize.py <image_path> [save_files]")
        sys.exit(1)
    
    group_image_path = sys.argv[1]
    save_files_flag = len(sys.argv) == 3 and sys.argv[2].lower() == 'true'
    recognize_faces_with_annotation(group_image_path, save_files_flag)
