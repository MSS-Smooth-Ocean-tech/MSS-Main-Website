import firebase_admin
from firebase_admin import credentials, firestore
import os

# Initialize Firebase Admin SDK
if not firebase_admin._apps:
    current_dir = os.path.dirname(os.path.abspath(__file__))
    cred_path = os.path.join(current_dir, "client_secret.json")
    
    if os.path.exists(cred_path):
        try:
            firebase_admin.initialize_app(credentials.Certificate(cred_path))
            print(f"[Firebase] Initialized with {cred_path}")
        except Exception as e:
            print(f"[Firebase] Failed to initialize: {e}")
    else:
        print(f"[Firebase] No client_secret.json found at {cred_path}. Firebase disabled.")

def get_firestore_data(path: str):
    """
    Unified Firestore fetch:
    - If path ends on a DOCUMENT (even segments) → return that document's data.
    """
    if not firebase_admin._apps:
        return None

    if path.endswith("/"):
        path = path[:-1]

    try:
        db_fs = firestore.client()

        # Split path into segments
        segments = [p for p in path.split("/") if p.strip()]
        total = len(segments)

        # Odd segments => COLLECTION
        if total % 2 == 1:
            collection_path = "/".join(segments)
            col_ref = db_fs.collection(collection_path)
            docs = col_ref.stream()

            return [
                {**d.to_dict(), "id": d.id}
                for d in docs
            ]

        # Even segments => DOCUMENT
        else:
            collection_path = "/".join(segments[:-1])
            document_id = segments[-1]

            doc_ref = db_fs.collection(collection_path).document(document_id)
            doc = doc_ref.get()

            if not doc.exists:
                return None

            data = doc.to_dict()
            data["id"] = doc.id
            return data

    except Exception as e:
        print(f"Error fetching Firestore data from {path}: {e}")
        return None

def update_firestore_data(path: str, data: dict):
    """
    Update data in Firestore.
    Path should point to a DOCUMENT.
    Data must be a dictionary.
    """
    if not firebase_admin._apps:
        return False

    if path.endswith("/"):
        path = path[:-1]

    try:
        db_fs = firestore.client()
        segments = [p for p in path.split("/") if p.strip()]

        # Ensure path points to a document
        if len(segments) % 2 != 0:
            print(f"Error: Path {path} must point to a document, not a collection.")
            return False

        collection_path = "/".join(segments[:-1])
        document_id = segments[-1]

        doc_ref = db_fs.collection(collection_path).document(document_id)
        doc_ref.set(data, merge=True)
        return True

    except Exception as e:
        print(f"Error updating Firestore data at {path}: {e}")
        return False
