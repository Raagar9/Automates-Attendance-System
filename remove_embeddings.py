import numpy as np

embedding_file = r"C:\College\Sem2\SDAM\CP\refined_face_embeddings_test.npy"
student_to_remove = "Aaryan Mengawade"

# Load embeddings
embeddings = np.load(embedding_file, allow_pickle=True).item()

# Remove student if present
if student_to_remove in embeddings:
    del embeddings[student_to_remove]
    np.save(embedding_file, embeddings)
    print(f"Removed embedding for {student_to_remove}")
else:
    print(f"{student_to_remove} not found in embeddings.")
