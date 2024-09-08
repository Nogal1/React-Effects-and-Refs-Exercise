import React, { useState, useEffect } from 'react';
import axios from 'axios';

function App() {
  const [deckId, setDeckId] = useState(null);
  const [cards, setCards] = useState([]);
  const [remaining, setRemaining] = useState(52);
  const [isShuffling, setIsShuffling] = useState(false);

  // Fetch a new deck of cards when the component mounts
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

  // Draw a card from the deck
  const drawCard = async () => {
    if (remaining === 0) {
      alert('Error: no cards remaining!');
      return;
    }

    try {
      const res = await axios.get(`https://deckofcardsapi.com/api/deck/${deckId}/draw/?count=1`);
      if (res.data.success) {
        setCards([...cards, ...res.data.cards]);
        setRemaining(res.data.remaining);
      }
    } catch (err) {
      console.error('Error drawing card:', err);
    }
  };

  // Shuffle the deck and reset the state
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
    }
  };

  return (
    <div>
      <h1>Deck of Cards</h1>
      <button onClick={drawCard} disabled={remaining === 0}>
        Draw a card
      </button>
      <button onClick={shuffleDeck} disabled={isShuffling}>
        {isShuffling ? 'Shuffling...' : 'Shuffle Deck'}
      </button>
      <div>
        <h2>Cards Drawn:</h2>
        <div style={{ display: 'flex', flexWrap: 'wrap' }}>
          {cards.map(card => (
            <img key={card.code} src={card.image} alt={card.value + ' of ' + card.suit} />
          ))}
        </div>
      </div>
    </div>
  );
}

export default App;