import React, { useState, useEffect, useRef } from 'react';
import axios from 'axios';
import './App.css';

function App() {
  const [deckId, setDeckId] = useState(null);
  const [cards, setCards] = useState([]);
  const [remaining, setRemaining] = useState(52);
  const [isDrawing, setIsDrawing] = useState(false);
  const [isShuffling, setIsShuffling] = useState(false);
  const drawInterval = useRef(null);

  useEffect(() => {
    const getNewDeck = async () => {
      try {
        const res = await axios.get('https://deckofcardsapi.com/api/deck/new/shuffle/');
        setDeckId(res.data.deck_id);
        setRemaining(res.data.remaining);
      } catch (err) {
        console.error('Error fetching new deck:', err);
      }
    };
    getNewDeck();
  }, []);

  const drawCard = async () => {
    if (remaining === 0) {
      // Stop drawing and alert if the deck is already empty
      stopDrawing();
      alert('Error: no cards remaining!');
      return;
    }

    try {
      const res = await axios.get(`https://deckofcardsapi.com/api/deck/${deckId}/draw/?count=1`);
      if (res.data.success) {
        setCards(prevCards => [...prevCards, ...res.data.cards]);
        setRemaining(res.data.remaining);

        // Check after drawing the card if the remaining count is 0
        if (res.data.remaining === 0) {
          stopDrawing();
          alert('Error: no cards remaining!');
        }
      }
    } catch (err) {
      console.error('Error drawing card:', err);
    }
  };

  const startDrawing = () => {
    setIsDrawing(true);
    drawInterval.current = setInterval(() => {
      drawCard();
    }, 1000);
  };

  const stopDrawing = () => {
    setIsDrawing(false);
    clearInterval(drawInterval.current);
  };

  const toggleDrawing = () => {
    if (isDrawing) {
      stopDrawing();
    } else {
      startDrawing();
    }
  };

  const shuffleDeck = async () => {
    setIsShuffling(true);
    try {
      await axios.get(`https://deckofcardsapi.com/api/deck/${deckId}/shuffle/`);
      setCards([]);
      setRemaining(52);
    } catch (err) {
      console.error('Error shuffling deck:', err);
    } finally {
      setIsShuffling(false);
      stopDrawing();  // Stop drawing when shuffling
    }
  };

  return (
    <div className="app-container">
      <h1>Deck of Cards</h1>
      <button onClick={toggleDrawing} disabled={remaining === 0}>
        {isDrawing ? 'Stop Drawing' : 'Start Drawing'}
      </button>
      <button onClick={shuffleDeck} disabled={isShuffling}>
        {isShuffling ? 'Shuffling...' : 'Shuffle Deck'}
      </button>
      <div className="cards-container">
        <h2>Cards Drawn:</h2>
        <div className="cards">
          {cards.map(card => (
            <img key={card.code} src={card.image} alt={card.value + ' of ' + card.suit} />
          ))}
        </div>
      </div>
    </div>
  );
}

export default App;
