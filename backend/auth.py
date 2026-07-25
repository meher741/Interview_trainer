import os
import firebase_admin
from firebase_admin import credentials, auth
from fastapi import Depends, HTTPException, status
from fastapi.security import HTTPBearer, HTTPAuthorizationCredentials
from dotenv import load_dotenv

load_dotenv()  # Load environment variables from .env file

# Initialize Firebase Admin SDK
# You can set the path to your service account key via environment variable
# or use the default application credentials (if running on Google Cloud).
# For local development, we expect a file named `firebase-service-account.json` in the backend directory.
# Alternatively, set the environment variable FIREBASE_SERVICE_ACCOUNT_KEY to the path of the JSON file.

cred_path = os.getenv("FIREBASE_SERVICE_ACCOUNT_KEY", "firebase-service-account.json")

if not os.path.exists(cred_path):
    # In a production environment, you might want to raise an error or use a different method.
    # For now, we'll print a warning and try to initialize without credentials (which will fail in production).
    print(f"Warning: Firebase service account key not found at {cred_path}")
    # If you are running in an environment that provides default credentials (like Google Cloud),
    # you can initialize without credentials. Otherwise, this will cause an error.
    try:
        cred = credentials.ApplicationDefault()
    except Exception:
        # If we cannot get default credentials, we raise an error.
        raise RuntimeError(
            f"Firebase service account key not found at {cred_path} and no default credentials available."
        )
else:
    cred = credentials.Certificate(cred_path)

try:
    default_app = firebase_admin.initialize_app(cred)
except ValueError:
    # If the app is already initialized, we don't need to do anything.
    pass

# Dependency to verify the Firebase ID token
security = HTTPBearer()

def verify_token(credentials: HTTPAuthorizationCredentials = Depends(security)):
    """
    Verify the Firebase ID token.
    """
    try:
        token = credentials.credentials
        decoded_token = auth.verify_id_token(token)
        return decoded_token
    except Exception as e:
        raise HTTPException(
            status_code=status.HTTP_401_UNAUTHORIZED,
            detail="Invalid authentication credentials",
            headers={"WWW-Authenticate": "Bearer"},
        )