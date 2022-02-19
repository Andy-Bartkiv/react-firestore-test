import './App.css';
import { useState, useEffect } from "react";
import MainMenu from './components/MainMenu';
import Game from './components/Game';

import firebase from 'firebase/compat/app';
import 'firebase/compat/auth';
import 'firebase/compat/firestore';
import { useCollectionData } from 'react-firebase-hooks/firestore';

const firebaseConfig = {
  apiKey: "AIzaSyDDBE2-zvAOwkZJD7dyqxWVIczVzbr1AUc",
  authDomain: "game--44.firebaseapp.com",
  projectId: "game--44",
  storageBucket: "game--44.appspot.com",
  messagingSenderId: "1038430599800",
  appId: "1:1038430599800:web:6af423c2b762bb0b678b8d"
};
const app = firebase.initializeApp(firebaseConfig);

const auth = firebase.auth();
const db = firebase.firestore();

const signInWithGoogle = () => {
  const provider = new firebase.auth.GoogleAuthProvider();
  auth.signInWithPopup(provider);
}

const signInAnon = async () => {
  await firebase.auth().signInAnonymously();
}

const signOutWithGoogle = () => {
  if (auth.currentUser) 
    return auth.signOut()
}

function App() {

  const gamesInProgressRef = db.collection('gamesInProgress');
  const [gamesInProgress] = useCollectionData(gamesInProgressRef);

  const [showMainMenu, setShowMainMenu] = useState(true);
  const [theGameID, setTheGameID] = useState('');

  const exitTheGame = async () => {
    await gamesInProgressRef.doc(theGameID).delete();
  }
  
  useEffect(async () => { 
    if (gamesInProgress && !gamesInProgress.find(game => game.id === theGameID)) { 
      setTheGameID('');
      setShowMainMenu(true);
    }
  }, [gamesInProgress]);

  return (
    <div className={'App ' + ((showMainMenu) ? 'menu' : 'game') }>
      { (showMainMenu)
        ? <MainMenu
            setTheGameID= { setTheGameID }
            closeMainMenu={ () => setShowMainMenu(false) }
            signIn={ signInAnon }
            signOut={ signOutWithGoogle }
            auth={ auth }
            db={ db }
          />
        : <Game
            theGameID= { theGameID }
            exitTheGame={ exitTheGame }
            auth={ auth }
            db={ db }
          /> 
      }

    </div>
  );
}

export default App;
