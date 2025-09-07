import os
import cv2
import numpy as np
from mtcnn import MTCNN
import torch
from facenet_pytorch import InceptionResnetV1
from tqdm import tqdm

# Initialize models
detector = MTCNN()
facenet = InceptionResnetV1(pretrained='vggface2').eval()

# Paths
dataset_dir = r"C:\College\Sdam\Data"  # Each subfolder is a student
output_embedding_file = r"C:\College\Sdam\embedding.npy"

# Function to compute embedding
def get_face_embedding(face_img):
    resized_face = cv2.resize(face_img, (160, 160))
    resized_face = resized_face / 255.0
    face_tensor = torch.tensor(resized_face).permute(2, 0, 1).unsqueeze(0).float()
    embedding = facenet(face_tensor).detach().numpy().flatten()
    return embedding / np.linalg.norm(embedding)

# Initialize dictionary to store student embeddings
embedding_db = {}

# Loop through student folders
for student_name in tqdm(os.listdir(dataset_dir), desc="Processing students"):
    student_path = os.path.join(dataset_dir, student_name)
    if not os.path.isdir(student_path):
        continue

    embeddings = []

    for file in os.listdir(student_path):
        file_path = os.path.join(student_path, file)
        image = cv2.imread(file_path)
        if image is None:
            continue

        rgb_image = cv2.cvtColor(image, cv2.COLOR_BGR2RGB)
        detections = detector.detect_faces(rgb_image)

        if detections:
            x, y, w, h = detections[0]['box']
            face = image[y:y+h, x:x+w]
            if face.shape[0] > 0 and face.shape[1] > 0:
                try:
                    emb = get_face_embedding(face)
                    embeddings.append(emb)
                except Exception as e:
                    print(f"Error processing {file_path}: {e}")
                    continue

    if embeddings:
        avg_embedding = np.mean(embeddings, axis=0)
        embedding_db[student_name] = avg_embedding
    else:
        print(f"No valid face found for {student_name}")

# Save embeddings
np.save(output_embedding_file, embedding_db)
print(f"Embeddings saved to {output_embedding_file}")
