// Import the functions you need from the SDKs you need
import { initializeApp } from "firebase/app";
import { getAnalytics } from "firebase/analytics";
// TODO: Add SDKs for Firebase products that you want to use
// https://firebase.google.com/docs/web/setup#available-libraries

// Your web app's Firebase configuration
// For Firebase JS SDK v7.20.0 and later, measurementId is optional
const firebaseConfig = {
  apiKey: "AIzaSyCPMkIFZ0mloz5lHUdUx5w4UaOYD6wta0w",
  authDomain: "academy7-7c07b.firebaseapp.com",
  projectId: "academy7-7c07b",
  storageBucket: "academy7-7c07b.firebasestorage.app",
  messagingSenderId: "915807375283",
  appId: "1:915807375283:web:522defd09d3e542cc945c6",
  measurementId: "G-3YST95R05L"
};

// Initialize Firebase
const app = initializeApp(firebaseConfig);
const analytics = getAnalytics(app);