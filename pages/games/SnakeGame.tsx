import React, { useState, useEffect, useRef } from 'react';
import { Link } from 'react-router-dom';

const SnakeGame: React.FC = () => {
    const canvasRef = useRef<HTMLCanvasElement>(null);
    const [score, setScore] = useState(0);
    const [gameOver, setGameOver] = useState(false);
    
    useEffect(() => {
        if (gameOver) return;

        const canvas = canvasRef.current;
        if (!canvas) return;
        const ctx = canvas.getContext('2d');
        if (!ctx) return;
        
        const TILE_COUNT = 20;
        const tileSize = canvas.width / TILE_COUNT;
        
        let snake = [{ x: 10, y: 10 }];
        let food = { x: 15, y: 15 };
        let velocity = { x: 0, y: 0 };
        let touchStart = { x: 0, y: 0 };
        
        const main = () => {
            const head = { x: snake[0].x + velocity.x, y: snake[0].y + velocity.y };
            snake.unshift(head);
            
            if (head.x < 0 || head.x >= TILE_COUNT || head.y < 0 || head.y >= TILE_COUNT || checkCollision(head)) {
                setGameOver(true);
                return;
            }

            if (head.x === food.x && head.y === food.y) {
                setScore(s => s + 10);
                placeFood();
            } else {
                snake.pop();
            }
            draw();
        };

        const draw = () => {
            // Background
            ctx.fillStyle = '#1a202c';
            ctx.fillRect(0, 0, canvas.width, canvas.height);
            // Grid
            ctx.strokeStyle = '#2d3748';
            for (let i = 0; i < TILE_COUNT; i++) {
                ctx.beginPath();
                ctx.moveTo(i * tileSize, 0);
                ctx.lineTo(i * tileSize, canvas.height);
                ctx.moveTo(0, i * tileSize);
                ctx.lineTo(canvas.width, i * tileSize);
                ctx.stroke();
            }
            
            // Food with pulse effect
            const pulse = Math.abs(Math.sin(Date.now() / 200)) * 2;
            ctx.fillStyle = '#e53935';
            ctx.fillRect(food.x * tileSize - pulse/2, food.y * tileSize - pulse/2, tileSize + pulse, tileSize + pulse);
            
            // Snake
            snake.forEach((part, index) => {
                ctx.fillStyle = index === 0 ? '#68d391' : '#48bb78'; // Brighter head
                ctx.fillRect(part.x * tileSize, part.y * tileSize, tileSize - 1, tileSize - 1);
            });
        };

        const placeFood = () => {
            food = { x: Math.floor(Math.random() * TILE_COUNT), y: Math.floor(Math.random() * TILE_COUNT) };
            if (snake.some(part => part.x === food.x && part.y === food.y)) placeFood();
        };

        const checkCollision = (head: {x: number, y: number}) => snake.slice(1).some(part => part.x === head.x && part.y === head.y);

        const changeDirection = (e: KeyboardEvent) => {
            e.preventDefault();
            if (e.key === 'ArrowUp' && velocity.y === 0) velocity = { x: 0, y: -1 };
            if (e.key === 'ArrowDown' && velocity.y === 0) velocity = { x: 0, y: 1 };
            if (e.key === 'ArrowLeft' && velocity.x === 0) velocity = { x: -1, y: 0 };
            if (e.key === 'ArrowRight' && velocity.x === 0) velocity = { x: 1, y: 0 };
        };
        
        const handleTouchStart = (e: TouchEvent) => { touchStart = { x: e.touches[0].clientX, y: e.touches[0].clientY }; };
        
        const handleTouchEnd = (e: TouchEvent) => {
            const touchEnd = { x: e.changedTouches[0].clientX, y: e.changedTouches[0].clientY };
            const dx = touchEnd.x - touchStart.x;
            const dy = touchEnd.y - touchStart.y;
            if (Math.abs(dx) > Math.abs(dy)) { // Horizontal swipe
                if (dx > 0 && velocity.x === 0) velocity = { x: 1, y: 0 }; // Right
                else if (dx < 0 && velocity.x === 0) velocity = { x: -1, y: 0 }; // Left
            } else { // Vertical swipe
                if (dy > 0 && velocity.y === 0) velocity = { x: 0, y: 1 }; // Down
                else if (dy < 0 && velocity.y === 0) velocity = { x: 0, y: -1 }; // Up
            }
        };

        window.addEventListener('keydown', changeDirection);
        canvas.addEventListener('touchstart', handleTouchStart);
        canvas.addEventListener('touchend', handleTouchEnd);
        canvas.style.touchAction = 'none';
        
        placeFood();
        const gameLoop = setInterval(main, 100);

        return () => {
            clearInterval(gameLoop);
            window.removeEventListener('keydown', changeDirection);
            canvas.removeEventListener('touchstart', handleTouchStart);
            canvas.removeEventListener('touchend', handleTouchEnd);
        };
    }, [gameOver]);

    const restartGame = () => {
        setScore(0);
        setGameOver(false);
    };

    return (
        <div className="py-16 bg-gray-50 dark:bg-black min-h-screen flex flex-col items-center justify-center">
            <div className="container mx-auto px-4 text-center">
                <h1 className="text-4xl font-extrabold text-gray-800 dark:text-gray-100">Snake Game</h1>
                
                <div className="my-4 p-4 bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-700 rounded-lg max-w-lg mx-auto">
                    <h2 className="text-lg font-bold text-gray-700 dark:text-gray-200 mb-2">How to Play</h2>
                    <p className="text-sm text-gray-600 dark:text-gray-400"><strong className="text-brand-red">Desktop:</strong> Use Arrow Keys to control the snake.</p>
                    <p className="text-sm text-gray-600 dark:text-gray-400"><strong className="text-brand-red">Mobile:</strong> Swipe on the screen to change direction.</p>
                </div>

                <div className="text-2xl font-bold my-4">Score: <span className="text-brand-red">{score}</span></div>
                
                <div className="relative max-w-lg mx-auto aspect-square bg-gray-200 dark:bg-black rounded-lg shadow-lg overflow-hidden">
                    <canvas ref={canvasRef} width="400" height="400" className="w-full h-full" />
                    {gameOver && (
                        <div className="absolute inset-0 bg-black/70 flex flex-col items-center justify-center rounded-lg animate-fade-in-down">
                            <h2 className="text-4xl font-bold text-white">Game Over</h2>
                            <p className="text-2xl text-gray-200 mt-2">Final Score: {score}</p>
                            <button onClick={restartGame} className="mt-6 bg-brand-red hover:bg-brand-red-dark text-white font-bold py-3 px-8 rounded-lg transition-colors">
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

export default SnakeGame;
