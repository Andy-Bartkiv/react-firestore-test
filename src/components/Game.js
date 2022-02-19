import { useEffect, useState } from 'react';
import { useDocumentData } from 'react-firebase-hooks/firestore';
import firebase from 'firebase/compat/app';
import 'firebase/compat/firestore';

const Game = ({ exitTheGame, db, auth, theGameID }) => {

    const [inputText, setInputText] = useState('');
    const gameDataRef = db.collection('gamesInProgress').doc(theGameID);
    const [gameData] = useDocumentData(gameDataRef);
    
    const [msgArr, setMsgArr] = useState([]);

    useEffect(()=> {
        if (gameData) {
            setMsgArr(gameData.messages);
        }
    }, [gameData]);

    const sendMessage = async (event) => {
        event.preventDefault();
        const { uid } = auth.currentUser;
        await gameDataRef.update({
            messages: firebase.firestore.FieldValue.arrayUnion({
                id: Date.now(),
                text: inputText,
                uid
            })
        })
        setInputText('');
    }

  return (
    <div style={{display:'flex',flexDirection:'column',gap:'1em',color:'orange'}}>
        
        <button onClick={ exitTheGame }>return to Menu</button>

        <form onSubmit={ sendMessage }>
            <input type="text" 
                value={ inputText } 
                onChange={(e) => setInputText(e.target.value) }
            />
            <button>Enter</button>
        </form>

        <span style={{ textAlign:'center' }}>- Chat -</span>

        <div style={{ border: '1px solid teal', color:'whitesmoke', fontSize:'0.75em' }}>
            {/* { messages && messages.map( msg => { */}
            { msgArr && msgArr.map( msg => {
                const isMine = msg.uid === auth.currentUser.uid;
                return (<div key={msg.id}>
                    { isMine ? 'Me:': 'Opp:'} { msg.text }
                </div>)
                }) 
            }
        </div>

    </div>
  )
}

export default Game