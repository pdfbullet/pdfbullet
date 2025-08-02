import React, { useEffect } from 'react';
import { Link } from 'react-router-dom';
import { PuzzleIcon, BrainIcon, QuestionMarkIcon, CarIcon, GamepadIcon } from '../components/icons.tsx';

const games = [
    {
        id: 'memory-match',
        title: 'Memory Match',
        description: 'Test your memory by matching pairs of tool icons. How quickly can you find them all?',
        Icon: PuzzleIcon,
        color: 'text-blue-500'
    },
    {
        id: 'word-finder',
        title: 'Word Finder',
        description: 'Find PDF-related words hidden in the grid. A fun challenge for word puzzle lovers.',
        Icon: BrainIcon,
        color: 'text-purple-500'
    },
    {
        id: 'quiz-game',
        title: 'Quiz Game',
        description: 'Challenge your knowledge with our PDF and tech-themed quiz. Can you get a perfect score?',
        Icon: QuestionMarkIcon,
        color: 'text-yellow-500'
    },
    {
        id: 'car-racing',
        title: 'Retro Racer',
        description: 'Dodge the traffic in this fast-paced retro racing game. How long can you survive?',
        Icon: CarIcon,
        color: 'text-red-500'
    },
    {
        id: 'pdf-invaders',
        title: 'PDF Invaders',
        description: 'Defend against waves of invading PDF documents in this classic arcade shooter.',
        Icon: GamepadIcon,
        color: 'text-gray-500'
    },
];

const GameCard: React.FC<{ game: typeof games[0] }> = ({ game }) => (
    <Link 
        to={`/play-game/${game.id}`}
        className="group flex flex-col p-6 bg-white dark:bg-black rounded-xl hover:-translate-y-1 transition-transform duration-300 animated-border"
    >
        <div className={`p-3 rounded-lg self-start bg-gray-100 dark:bg-black dark:border dark:border-gray-800`}>
            <game.Icon className={`h-8 w-8 ${game.color}`} />
        </div>
        <h3 className="mt-4 text-xl font-bold text-gray-800 dark:text-gray-100">{game.title}</h3>
        <p className="mt-2 text-sm text-gray-500 dark:text-gray-400 leading-relaxed flex-grow">{game.description}</p>
        <div className="mt-4 text-sm font-semibold text-brand-red group-hover:underline">
            Play Now &rarr;
        </div>
    </Link>
);


const GamesPage: React.FC = () => {
  useEffect(() => {
    document.title = "Games Arcade | Fun Mini-Games - I Love PDFLY";
    const metaDesc = document.querySelector('meta[name="description"]');
    if (metaDesc) {
        metaDesc.setAttribute("content", "Take a break and have some fun with the I Love PDFLY Arcade. Play mini-games like Memory Match, Word Finder, and more.");
    }
  }, []);

  return (
    <div className="py-16 md:py-24 bg-gray-50 dark:bg-black">
      <div className="container mx-auto px-6">
        <div className="max-w-4xl mx-auto text-center mb-12">
            <h1 className="text-4xl md:text-5xl font-extrabold text-gray-800 dark:text-gray-100">ILovePDFLY Arcade</h1>
            <p className="mt-4 text-lg text-gray-600 dark:text-gray-300">
                Take a break and have some fun! Here are a few mini-games to enjoy.
            </p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8 max-w-7xl mx-auto">
            {games.map(game => (
                <GameCard key={game.id} game={game} />
            ))}
        </div>
      </div>
    </div>
  );
};

export default GamesPage;