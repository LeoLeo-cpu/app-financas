import { initializeApp } from "firebase/app";
import { getFirestore } from "firebase/firestore";

const firebaseConfig = {
  apiKey: "AIzaSyB62NeKDcPZFUYcFys16dVoCwwuJz4FAlg",
  authDomain: "financas-120b9.firebaseapp.com",
  projectId: "financas-120b9",
  storageBucket: "financas-120b9.firebasestorage.app",
  messagingSenderId: "474679668653",
  appId: "1:474679668653:web:0e581633dcff67ca367b24",
  measurementId: "G-P1K0CQLN91"
};

const app = initializeApp(firebaseConfig);
export const db = getFirestore(app);
