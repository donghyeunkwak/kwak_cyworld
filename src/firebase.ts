// src/firebase.ts
import { initializeApp } from "firebase/app";
import { getFirestore } from "firebase/firestore";
import { getStorage } from "firebase/storage";

const firebaseConfig = {
  apiKey: "AIzaSyDPf8fYWYOdA1w6r2sn94UCGPB95ljXmlI",
  authDomain: "kwak-cyworld.firebaseapp.com",
  projectId: "kwak-cyworld",
  storageBucket: "kwak-cyworld.firebasestorage.app",
  messagingSenderId: "1021581704828",
  appId: "1:1021581704828:web:0287edcfaa66fc80db53f9"
};

// 🔥 Firebase App 초기화
export const app = initializeApp(firebaseConfig);

// 🔥 Firestore DB
export const db = getFirestore(app);

// 🔥 Storage
export const storage = getStorage(app);
