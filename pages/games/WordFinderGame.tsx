
import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';

const GRID_SIZE = 12;
const WORDS = ['MERGE', 'SPLIT', 'COMPRESS', 'CONVERT', 'SIGN', 'WATERMARK', 'ROTATE', 'EDIT', 'UNLOCK', 'SECURE', 'PDFLY'];

const WordFinderGame: React.FC = () => {
    const [grid, setGrid] = useState<string[][]>([]);
    const [foundWords, setFoundWords] = useState<string[]>([]);
    const [selectedCells, setSelectedCells] = useState<{ r: number, c: number }[]>([]);
    const [isDragging, setIsDragging] = useState(false);
    const [message, setMessage] = useState('');

    const generateGrid = () => {
        // This is a simplified grid generation. A real implementation would be more robust.
        let newGrid = Array.from({ length: GRID_SIZE }, () => Array(GRID_SIZE).fill(''));
        const placedWords: string[] = [];

        // Simple placement (horizontal and vertical only for this example)
        WORDS.forEach(word => {
            let placed = false;
            let attempts = 0;
            while (!placed && attempts < 50) {
                const direction = Math.random() > 0.5 ? 'horizontal' : 'vertical';
                const r = Math.floor(Math.random() * GRID_SIZE);
                const c = Math.floor(Math.random() * GRID_SIZE);

                if (direction === 'horizontal' && c + word.length <= GRID_SIZE) {
                    let canPlace = true;
                    for (let i = 0; i < word.length; i++) {
                        if (newGrid[r][c + i] !== '' && newGrid[r][c + i] !== word[i]) {
                            canPlace = false;
                            break;
                        }
                    }
                    if (canPlace) {
                        for (let i = 0; i < word.length; i++) newGrid[r][c + i] = word[i];
                        placed = true;
                    }
                } else if (direction === 'vertical' && r + word.length <= GRID_SIZE) {
                    let canPlace = true;
                    for (let i = 0; i < word.length; i++) {
                        if (newGrid[r + i][c] !== '' && newGrid[r + i][c] !== word[i]) {
                            canPlace = false;
                            break;
                        }
                    }
                    if (canPlace) {
                        for (let i = 0; i < word.length; i++) newGrid[r + i][c] = word[i];
                        placed = true;
                    }
                }
                attempts++;
            }
            if(placed) placedWords.push(word);
        });

        // Fill empty cells with random letters
        for (let r = 0; r < GRID_SIZE; r++) {
            for (let c = 0; c < GRID_SIZE; c++) {
                if (newGrid[r][c] === '') {
                    newGrid[r][c] = 'ABCDEFGHIJKLMNOPQRSTUVWXYZ'[Math.floor(Math.random() * 26)];
                }
            }
        }
        setGrid(newGrid);
        setFoundWords([]);
    };
    
    useEffect(() => {
        generateGrid();
    }, []);

    const handleMouseDown = (r: number, c: number) => {
        setIsDragging(true);
        setSelectedCells([{ r, c }]);
    };

    const handleMouseOver = (r: number, c: number) => {
        if (!isDragging) return;
        // Basic logic to keep selection straight (for simplicity)
        const firstCell = selectedCells[0];
        const newCells = [firstCell];
        const dr = r - firstCell.r;
        const dc = c - firstCell.c;
        if (dr === 0 || dc === 0 || Math.abs(dr) === Math.abs(dc)) { // Horizontal, vertical, or diagonal
            const len = Math.max(Math.abs(dr), Math.abs(dc));
            const stepR = dr === 0 ? 0 : dr / Math.abs(dr);
            const stepC = dc === 0 ? 0 : dc / Math.abs(dc);
            for(let i=1; i <= len; i++) {
                newCells.push({r: firstCell.r + i * stepR, c: firstCell.c + i * stepC});
            }
        }
        setSelectedCells(newCells);
    };
    
    const handleMouseUp = () => {
        if (!isDragging) return;
        setIsDragging(false);
        const selectedWord = selectedCells.map(({ r, c }) => grid[r][c]).join('');
        const reversedSelectedWord = [...selectedWord].reverse().join('');

        if (WORDS.includes(selectedWord) && !foundWords.includes(selectedWord)) {
            setFoundWords(prev => [...prev, selectedWord]);
            setMessage(`Found "${selectedWord}"!`);
        } else if (WORDS.includes(reversedSelectedWord) && !foundWords.includes(reversedSelectedWord)) {
            setFoundWords(prev => [...prev, reversedSelectedWord]);
            setMessage(`Found "${reversedSelectedWord}"!`);
        } else {
            setMessage('Not a word, try again!');
        }
        setTimeout(() => setMessage(''), 1500);
        setSelectedCells([]);
    };
    
    const isCellSelected = (r: number, c: number) => {
        return selectedCells.some(cell => cell.r === r && cell.c === c);
    };

    return (
        <div className="py-16 bg-gray-50 dark:bg-black min-h-[calc(100vh-130px)]" onMouseUp={handleMouseUp}>
            <div className="container mx-auto px-6 text-center">
                <h1 className="text-4xl font-extrabold text-gray-800 dark:text-gray-100">Word Finder</h1>
                <p className="mt-2 text-lg text-gray-600 dark:text-gray-300">Find all the hidden words.</p>
                
                 <button onClick={generateGrid} className="my-4 bg-brand-red hover:bg-brand-red-dark text-white font-bold py-2 px-6 rounded-lg transition-colors">
                    New Game
                </button>
                
                <div className="max-w-4xl mx-auto md:flex gap-8">
                    <div className="flex-grow bg-white dark:bg-black p-2 rounded-lg shadow-lg">
                        <div className="grid grid-cols-12 gap-1">
                        {grid.map((row, r) =>
                            row.map((cell, c) => (
                                <div
                                    key={`${r}-${c}`}
                                    className={`flex items-center justify-center aspect-square text-sm md:text-base font-bold rounded-md cursor-pointer transition-colors
                                    ${isCellSelected(r, c) ? 'bg-yellow-400 text-black' : 'bg-gray-200 dark:bg-black dark:border dark:border-gray-800 text-gray-700 dark:text-gray-300'}`}
                                    onMouseDown={() => handleMouseDown(r, c)}
                                    onMouseOver={() => handleMouseOver(r, c)}
                                >
                                    {cell}
                                </div>
                            ))
                        )}
                        </div>
                    </div>
                    <div className="w-full md:w-56 mt-6 md:mt-0 bg-white dark:bg-black p-4 rounded-lg shadow-lg">
                        <h3 className="font-bold text-xl mb-3">Words to Find:</h3>
                        <ul className="space-y-1">
                            {WORDS.map(word => (
                                <li key={word} className={`text-lg transition-colors ${foundWords.includes(word) ? 'line-through text-gray-400' : 'text-gray-700 dark:text-gray-200'}`}>
                                    {word}
                                </li>
                            ))}
                        </ul>
                         {message && <div className="mt-4 text-sm font-semibold p-2 bg-yellow-100 dark:bg-yellow-900/50 text-yellow-800 dark:text-yellow-300 rounded-md">{message}</div>}
                    </div>
                </div>

                <Link to="/play-game" className="inline-block mt-8 text-gray-600 dark:text-gray-400 hover:text-brand-red dark:hover:text-brand-red font-medium transition-colors">
                    &larr; Back to Arcade
                </Link>
            </div>
        </div>
    );
};

export default WordFinderGame;
