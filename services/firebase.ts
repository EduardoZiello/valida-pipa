import AsyncStorage from "@react-native-async-storage/async-storage";

import { getApp, getApps, initializeApp } from "firebase/app";

import * as FirebaseAuth from "firebase/auth";

import { getFirestore } from "firebase/firestore";

const firebaseConfig = {
  apiKey: "AIzaSyB0-42LiXN7QYQCxFaJWH-wKbqCainTPoM",
  authDomain: "valida-pipa-33e0f.firebaseapp.com",
  projectId: "valida-pipa-33e0f",
  storageBucket: "valida-pipa-33e0f.firebasestorage.app",
  messagingSenderId: "783586651354",
  appId: "1:783586651354:web:f6f519f91e805583e609e3",
};

const app = getApps().length > 0 ? getApp() : initializeApp(firebaseConfig);

let auth: FirebaseAuth.Auth;

try {
  auth = FirebaseAuth.initializeAuth(app, {
    persistence: (FirebaseAuth as any).getReactNativePersistence(AsyncStorage),
  });
} catch {
  auth = FirebaseAuth.getAuth(app);
}

export { auth };

export const db = getFirestore(app);
