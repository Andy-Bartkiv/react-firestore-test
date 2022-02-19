import { useEffect, useState } from 'react';
import { useAuthState } from 'react-firebase-hooks/auth';
import { useCollectionData } from 'react-firebase-hooks/firestore';
import firebase from 'firebase/compat/app';

const MainMenu = ({ 
    auth, db,
    closeMainMenu, setTheGameID, signIn, signOut }) => {


    const [inputText, setInputText] = useState('');

    const openGamesRef = db.collection('openGames');
    const [openGames] = useCollectionData(openGamesRef);
    const gamesInProgressRef = db.collection('gamesInProgress');
    const [gamesInProgress] = useCollectionData(gamesInProgressRef);
    const [user] = useAuthState(auth);
    const uid = (user) ? user.uid : null;
    // const { uid } = (auth.currentUser) ? auth.currentUser : {};

    console.log(user, auth.currentUser);
    
    const [myGameID, setMyGameID] = useState('');
    const [guestGameID, setGuestGameID] = useState('');
    // console.log(myGameID);
    
    useEffect(() => { 
        if (openGames) {
            const gameAsGuest = openGames.find(game => game.uidGuest === uid);
            if (!gameAsGuest) setGuestGameID('');

            const gameAsHost = openGames.find(game => game.uidHost === uid);
            console.log('game as host =', gameAsHost)
            if (gameAsHost && !myGameID) setMyGameID(gameAsHost.id);
        }
    }, [openGames]);

    // STARTING NEW GAME
    useEffect(async () => { 
        if (gamesInProgress) {
            const newGame = gamesInProgress.find(game => game.id === myGameID || game.id === guestGameID);
            if (newGame) {
                setTheGameID(newGame.id);
                setGuestGameID('');
                if (myGameID) cancelMyGame();
                closeMainMenu();
            }
        }
    }, [gamesInProgress]);

    const handleSubmit = async (event) => {
        event.preventDefault();
        await auth.signInAnonymously();
        await auth.currentUser.updateProfile({
            displayName: inputText,
          });
    }

    const deleteOutdatedGames = () => {
        openGames.forEach(game => console.log(Date.now() - game.timestamp.toMillis()));
        gamesInProgress.forEach(game => console.log((Date.now() - game.timestamp.toMillis())/1000/60));
    }
    
    const createChatRoom = async (event) => {
        event.preventDefault();
        // setInputText('');
        const newGame = await openGamesRef.add({
            timestamp: firebase.firestore.FieldValue.serverTimestamp(),
            // name: inputText,
            name: `${user.displayName}'s Game`,
            uidHost: uid,
            uidGuest: ''
        });
        await openGamesRef.doc(newGame.id).update({
            id: newGame.id
        });
        setMyGameID(newGame.id);
        // deleteOutdatedGames();
    }

    const cancelMyGame = async () => {
        await openGamesRef.doc(myGameID).delete();
        setMyGameID('');
    }

    const startNewGame = async (game) => {
        await gamesInProgressRef.doc(game.id).set(game);
        await gamesInProgressRef.doc(game.id).update({
            timestamp: firebase.firestore.FieldValue.serverTimestamp(),
            messages: []
         });
        cancelMyGame();
    }

    const joinGame = async (game) => {
        await openGamesRef.doc(game.id).update({
            uidGuest: uid
        });
        setGuestGameID(game.id);
    }

    const exitGameOpen = async (game) => {
        await openGamesRef.doc(game.id).update({
            uidGuest: ''
        });
        setGuestGameID('');
    }

    const styleWrap = { width:'85%', display: 'flex', flexDirection:'column', gap:'1em', alignItems:'center' };
    const styleOpenGames = { width:'100%', fontSize:'.75em', border:'.1em solid teal', padding:'.25em', display:'flex', flexDirection:'column', gap:'.25em' };
    const styleOneGame = { display:'flex', justifyContent:'space-between' };
    const styleInputForm = { display:'flex', justifyContent:'space-between' };

  return (
    <div style={ styleWrap }>
        This is Main Menu

        <div>
            { (user)
                ? <button onClick={ signOut }>Sign Out</button>
                : <form onSubmit={ handleSubmit } style={ styleInputForm }>
                        <input type="text" maxLength="10" placeholder='Your Nickname' required
                            value={ inputText } 
                            onChange={(e) => setInputText(e.target.value) }
                        />
                        <button>Sign In</button>
                    </form>
            // <button onClick={ signIn }>Sign In</button>
            }
        </div>

        <div>
            { (user) && `Hello, ${user.displayName} !`}
        </div>

        { (user) &&
            <div style={ styleOpenGames }>
                { openGames && openGames.map( (game, i) =>
                    (<div key={i} style={ styleOneGame }>
                        <span>{ `${i}: ${game.name}  ` }</span>
                        { (game.id === myGameID)
                            ? <>
                                { (game.uidGuest)  
                                    ? <button onClick={ () => startNewGame(game) }>Start Game</button>
                                    : <span>Waiting</span>
                                }
                                <button onClick={ () => cancelMyGame() }>- Cancel -</button>
                            </>
                            : <>
                                { (guestGameID === game.id) &&
                                    <button onClick={ () => exitGameOpen(game) }>- exit -</button>
                                }
                                { (!guestGameID && game.uidGuest === '') &&
                                    <button onClick={ () => joinGame(game) }>- Join -</button>
                                }
                            </>
                        }
                    </div>)
                    ) 
                }
                
                { (!myGameID) &&
                    <button onClick={ createChatRoom }>- Create -</button>
                }

                {/* { (!myGameID) &&
                    <form onSubmit={ createChatRoom } style={ styleInputForm }>
                        <input type="text" maxLength="8" placeholder='New game title' required
                            value={ inputText } 
                            onChange={(e) => setInputText(e.target.value) }
                        />
                        <button>- Create -</button>
                    </form>
                } */}
                
            </div>
        }

    </div>
  )
}

export default MainMenu