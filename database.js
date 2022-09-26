// Import the functions you need from the SDKs you need
import { initializeApp } from "firebase/app";
// TODO: Add SDKs for Firebase products that you want to use
// https://firebase.google.com/docs/web/setup#available-libraries

import {
  doc,
  setDoc,
  getDoc,
  collection,
  addDoc,
  getFirestore,
  arrayUnion,
  updateDoc,
  
} from "firebase/firestore";

// Your web app's Firebase configuration
// For Firebase JS SDK v7.20.0 and later, measurementId is optional
const firebaseConfig = {
  apiKey: "AIzaSyDjXtiZEOEE_458yPjk-D-mBjsJWldJ6dw",
  authDomain: "cardgame-8728e.firebaseapp.com",
  projectId: "cardgame-8728e",
  storageBucket: "cardgame-8728e.appspot.com",
  messagingSenderId: "994447706099",
  appId: "1:994447706099:web:b363369bb47a4f3fdcf486",
  measurementId: "G-0R6FWMPZFZ",
};

// Initialize Firebase
const app = initializeApp(firebaseConfig);
const db = getFirestore(app);

export async function GameCreate(id) {
  try {
    const gameRef = doc(db, "games", id);
    setDoc(gameRef, {
      gameID: id,
    });
    return true;
  } catch (e) {
    throw e;
  }
}
// Function for a player joining the game which connects to db
export async function PlayerJoin(username, currentPlayer, id) {
  try {
    const gameRef = doc(db, "games", id);
    await updateDoc(gameRef, {
      users: arrayUnion({ username: username, currentPlayer:currentPlayer }),
    });
  } catch (e) {
    throw e;
  }
}

export async function GetPlayerList(id) {
  let users;
  try {
    const gameRef = doc(db, "games", id);
    const docSnapshot = await getDoc(gameRef);

    return docSnapshot.get("users");
  } catch (e) {
    throw e;
  }
}

export async function UpdateCards(playerIndex, cards, id) {
 try {
    const gameRef = doc(db,"games", id);
    await updateDoc(gameRef, {
      [`users.${playerIndex}.cards`] : cards
    })
 } 
 catch(e) {
 }
}