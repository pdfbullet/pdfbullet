
import React, { useState, useEffect, useMemo } from 'react';
import { Link } from 'react-router-dom';
import { TOOLS } from '../../constants.ts';

interface Card {
  id: number;
  toolId: string;
  Icon: React.FC<{ className?: string }>;
  color: string;
  state: 'up' | 'down' | 'matched';
}

const MemoryMatchGame: React.FC = () => {
  const [cards, setCards] = useState<Card[]>([]);
  const [flippedIndices, setFlippedIndices] = useState<number[]>([]);
  const [moves, setMoves] = useState(0);
  const [isLocked, setIsLocked] = useState(false);
  const [isComplete, setIsComplete] = useState(false);

  const gameTools = useMemo(() => {
    // Select 8 unique tools for a 4x4 grid
    const shuffled = [...TOOLS].sort(() => 0.5 - Math.random());
    return shuffled.slice(0, 8);
  }, []);

  const initializeGame = () => {
    const initialCards = gameTools.flatMap((tool, index) => {
      const cardData = { toolId: tool.id, Icon: tool.Icon, color: tool.color };
      return [
        { ...cardData, id: index * 2, state: 'down' as const },
        { ...cardData, id: index * 2 + 1, state: 'down' as const },
      ];
    });

    setCards(initialCards.sort(() => Math.random() - 0.5));
    setMoves(0);
    setFlippedIndices([]);
    setIsLocked(false);
    setIsComplete(false);
  };

  useEffect(() => {
    initializeGame();
  }, [gameTools]);

  useEffect(() => {
    if (flippedIndices.length === 2) {
      setIsLocked(true);
      const [firstIndex, secondIndex] = flippedIndices;
      const firstCard = cards[firstIndex];
      const secondCard = cards[secondIndex];

      if (firstCard.toolId === secondCard.toolId) {
        // It's a match
        setCards(prev => prev.map((card, i) => (i === firstIndex || i === secondIndex) ? { ...card, state: 'matched' } : card));
        setFlippedIndices([]);
        setIsLocked(false);
      } else {
        // Not a match, flip back after a delay
        setTimeout(() => {
          setCards(prev => prev.map((card, i) => (i === firstIndex || i === secondIndex) ? { ...card, state: 'down' } : card));
          setFlippedIndices([]);
          setIsLocked(false);
        }, 1000);
      }
      setMoves(prev => prev + 1);
    }
  }, [flippedIndices, cards]);

  useEffect(() => {
    if (cards.length > 0 && cards.every(c => c.state === 'matched')) {
      setIsComplete(true);
    }
  }, [cards]);

  const handleCardClick = (index: number) => {
    if (isLocked || cards[index].state !== 'down' || flippedIndices.length >= 2) return;

    setCards(prev => prev.map((card, i) => (i === index ? { ...card, state: 'up' } : card)));
    setFlippedIndices(prev => [...prev, index]);
  };

  return (
    <div className="py-16 bg-gray-50 dark:bg-black min-h-[calc(100vh-130px)]">
      <div className="container mx-auto px-6 text-center">
        <h1 className="text-4xl font-extrabold text-gray-800 dark:text-gray-100">Memory Match</h1>
        <p className="mt-2 text-lg text-gray-600 dark:text-gray-300">Match all the pairs of tool icons!</p>
        
        <div className="flex justify-center items-center gap-8 my-6">
            <div className="text-xl font-bold">Moves: <span className="text-brand-red">{moves}</span></div>
            <button onClick={initializeGame} className="bg-brand-red hover:bg-brand-red-dark text-white font-bold py-2 px-6 rounded-lg transition-colors">
                New Game
            </button>
        </div>

        <div className="relative max-w-xl mx-auto">
            <div className="grid grid-cols-4 gap-4 p-4 bg-white dark:bg-black rounded-lg shadow-lg">
                {cards.map((card, index) => (
                    <div key={index} className="aspect-square" onClick={() => handleCardClick(index)}>
                        <div className={`w-full h-full rounded-md transition-transform duration-500 [transform-style:preserve-3d] ${card.state !== 'down' ? '[transform:rotateY(180deg)]' : ''}`}>
                            {/* Back of card */}
                            <div className="absolute w-full h-full bg-gray-300 dark:bg-gray-900 rounded-md flex items-center justify-center cursor-pointer [backface-visibility:hidden] hover:bg-gray-400 dark:hover:bg-gray-800">
                                <span className="text-3xl font-bold text-brand-red">♥</span>
                            </div>
                            {/* Front of card */}
                            <div className={`absolute w-full h-full rounded-md flex items-center justify-center [backface-visibility:hidden] [transform:rotateY(180deg)] ${card.state === 'matched' ? 'bg-green-100 dark:bg-green-900/50' : 'bg-gray-100 dark:bg-black'}`}>
                                <card.Icon className={`h-1/2 w-1/2 ${card.color}`} />
                            </div>
                        </div>
                    </div>
                ))}
            </div>

            {isComplete && (
                 <div className="absolute inset-0 bg-black/70 flex flex-col items-center justify-center rounded-lg animate-fade-in-down">
                    <h2 className="text-4xl font-bold text-white">Congratulations!</h2>
                    <p className="text-xl text-gray-200 mt-2">You completed the game in {moves} moves.</p>
                    <button onClick={initializeGame} className="mt-6 bg-brand-red hover:bg-brand-red-dark text-white font-bold py-3 px-8 rounded-lg transition-colors">
                        Play Again
                    </button>
                </div>
            )}
        </div>
        <Link to="/play-game" className="inline-block mt-8 text-gray-600 dark:text-gray-400 hover:text-brand-red dark:hover:text-brand-red font-medium transition-colors">
          &larr; Back to Arcade
        </Link>
      </div>
    </div>
  );
};

export default MemoryMatchGame;