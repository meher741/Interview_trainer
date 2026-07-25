// Import the functions you need from the SDKs you need
import { initializeApp } from "firebase/app";
import { getAuth } from "firebase/auth";
// TODO: Add SDKs for Firebase products that you want to use
// https://firebase.google.com/docs/web/setup#available-libraries

// Your web app's Firebase configuration
// For Firebase JS SDK v7.20.0 and later, measurementId is optional
const firebaseConfig = {
  apiKey: "AIzaSyDC3SP3xkOrJofNZDcBikEckw7gyUAz2Co",
  authDomain: "interview-a31ea.firebaseapp.com",
  projectId: "interview-a31ea",
  storageBucket: "interview-a31ea.firebasestorage.app",
  messagingSenderId: "3076319871",
  appId: "1:3076319871:web:277a3cf5291520840ced4a",
  measurementId: "G-M7T0JK82GW"
};

// Initialize Firebase
const app = initializeApp(firebaseConfig);
const auth = getAuth(app);

export { auth };