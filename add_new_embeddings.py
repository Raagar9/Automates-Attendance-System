import os
import torch
import numpy as np
from PIL import Image
from facenet_pytorch import InceptionResnetV1, MTCNN
from tqdm import tqdm

# Define paths
data_dir = r"C:\College\Sdam\Data"
embedding_path = r"C:\Users\SHREYAS\SDAM\embedding.npy"

# Load face detector and recognition model
device = torch.device('cuda' if torch.cuda.is_available() else 'cpu')
mtcnn = MTCNN(image_size=160, margin=0, min_face_size=20, device=device)
resnet = InceptionResnetV1(pretrained='vggface2').eval().to(device)

# Load existing embeddings if available
if os.path.exists(embedding_path):
    database = np.load(embedding_path, allow_pickle=True).item()
    print(f"[INFO] Loaded existing embeddings. Total students: {len(database)}")
else:
    database = {}
    print("[INFO] No existing embeddings found. Creating new database...")

# Process new student folders
student_names = os.listdir(data_dir)

for name in tqdm(student_names, desc="Processing Students"):
    if name in database:
        continue  # Skip if already exists

    folder = os.path.join(data_dir, name)
    if not os.path.isdir(folder):
        continue

    embeddings = []
    for file in os.listdir(folder):
        img_path = os.path.join(folder, file)
        try:
            img = Image.open(img_path)
            face = mtcnn(img)
            if face is not None:
                face_embedding = resnet(face.unsqueeze(0).to(device))
                embeddings.append(face_embedding.detach().cpu().numpy())
        except Exception as e:
            print(f"[ERROR] {e} on {img_path}")

    if embeddings:
        mean_embedding = np.mean(embeddings, axis=0)
        database[name] = mean_embedding
        print(f"[SUCCESS] Added embeddings for {name}")
    else:
        print(f"[WARNING] No valid face found for {name}")

# Save updated embeddings
np.save(embedding_path, database)
print(f"[INFO] Embeddings updated and saved to {embedding_path}")
