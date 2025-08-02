
import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';

const GRID_SIZE = 14;
const COLORS = ['#ef4444', '#3b82f6', '#22c55e', '#eab308', '#8b5cf6', '#ec4899'];
const MAX_MOVES = 25;

const ColorFloodGame: React.FC = () => {
    const [grid, setGrid] = useState<number[][]>([]);
    const [moves, setMoves] = useState(0);
    const [isComplete, setIsComplete] = useState(false);
    const [win, setWin] = useState(false);

    const initializeGrid = () => {
        const newGrid = Array.from({ length: GRID_SIZE }, () => 
            Array.from({ length: GRID_SIZE }, () => Math.floor(Math.random() * COLORS.length))
        );
        setGrid(newGrid);
        setMoves(0);
        setIsComplete(false);
        setWin(false);
    };

    useEffect(initializeGrid, []);
    
    const floodFill = (targetColor: number) => {
        if (isComplete) return;

        const newGrid = grid.map(row => [...row]);
        const startColor = newGrid[0][0];
        if (startColor === targetColor) return;

        const stack = [[0, 0]];
        const visited = Array.from({ length: GRID_SIZE }, () => Array(GRID_SIZE).fill(false));
        
        while (stack.length > 0) {
            const [r, c] = stack.pop()!;
            if (r < 0 || r >= GRID_SIZE || c < 0 || c >= GRID_SIZE || visited[r][c]) continue;
            
            visited[r][c] = true;
            
            if (newGrid[r][c] === startColor) {
                newGrid[r][c] = targetColor;
                stack.push([r + 1, c], [r - 1, c], [r, c + 1], [r, c - 1]);
            }
        }
        setGrid(newGrid);
        setMoves(m => m + 1);
    };
    
    useEffect(() => {
        if(grid.length === 0) return;

        const firstColor = grid[0][0];
        const isGridComplete = grid.every(row => row.every(cellColor => cellColor === firstColor));

        if (isGridComplete) {
            setIsComplete(true);
            setWin(true);
        } else if (moves >= MAX_MOVES) {
            setIsComplete(true);
            setWin(false);
        }
    }, [grid, moves]);

    return (
        <div className="py-16 bg-gray-50 dark:bg-black min-h-[calc(100vh-130px)]">
            <div className="container mx-auto px-6 text-center">
                <h1 className="text-4xl font-extrabold text-gray-800 dark:text-gray-100">Color Flood</h1>
                <p className="mt-2 text-lg text-gray-600 dark:text-gray-300">Flood the grid with one color in {MAX_MOVES} moves or less!</p>
                
                <div className="flex justify-center items-center gap-8 my-6">
                    <div className="text-xl font-bold">Moves: <span className="text-brand-red">{moves} / {MAX_MOVES}</span></div>
                    <button onClick={initializeGrid} className="bg-brand-red hover:bg-brand-red-dark text-white font-bold py-2 px-6 rounded-lg transition-colors">
                        New Game
                    </button>
                </div>
                
                <div className="max-w-md mx-auto relative">
                    <div className="grid grid-cols-14 gap-0.5 p-2 bg-white dark:bg-black rounded-lg shadow-lg">
                        {grid.map((row, r) =>
                            row.map((colorIndex, c) => (
                                <div key={`${r}-${c}`} className="aspect-square" style={{ backgroundColor: COLORS[colorIndex] }}></div>
                            ))
                        )}
                    </div>
                    {isComplete && (
                         <div className="absolute inset-0 bg-black/70 flex flex-col items-center justify-center rounded-lg animate-fade-in-down">
                            <h2 className="text-4xl font-bold text-white">{win ? 'You Win!' : 'Game Over'}</h2>
                            <p className="text-xl text-gray-200 mt-2">{win ? `Completed in ${moves} moves.` : 'You ran out of moves.'}</p>
                            <button onClick={initializeGrid} className="mt-6 bg-brand-red hover:bg-brand-red-dark text-white font-bold py-3 px-8 rounded-lg transition-colors">
                                Play Again
                            </button>
                        </div>
                    )}
                </div>

                <div className="mt-6 flex justify-center gap-4">
                    {COLORS.map((color, index) => (
                        <button
                            key={index}
                            onClick={() => floodFill(index)}
                            className="w-12 h-12 rounded-full border-4 border-white/50 dark:border-black/50 shadow-md transition-transform hover:scale-110"
                            style={{ backgroundColor: color }}
                            aria-label={`Select color ${color}`}
                        ></button>
                    ))}
                </div>
                
                <Link to="/play-game" className="inline-block mt-8 text-gray-600 dark:text-gray-400 hover:text-brand-red dark:hover:text-brand-red font-medium transition-colors">
                    &larr; Back to Arcade
                </Link>
            </div>
        </div>
    );
};

export default ColorFloodGame;
