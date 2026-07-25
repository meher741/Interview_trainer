import firebase_admin
from firebase_admin import credentials

# Initialize the Firebase Admin SDK with a service account.
# Make sure to place your serviceAccountKey.json in the backend directory.
# For security, consider using environment variables or a secrets manager.
cred = credentials.Certificate("serviceAccountKey.json")
firebase_admin.initialize_app(cred)