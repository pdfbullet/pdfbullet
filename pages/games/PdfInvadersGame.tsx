import React, { useRef, useEffect, useState } from 'react';
import { Link } from 'react-router-dom';

const PdfInvadersGame: React.FC = () => {
    const canvasRef = useRef<HTMLCanvasElement>(null);
    const [score, setScore] = useState(0);
    const [gameOver, setGameOver] = useState(false);
    
    useEffect(() => {
        const canvas = canvasRef.current;
        if (!canvas) return;
        const ctx = canvas.getContext('2d');
        if (!ctx) return;
        
        let animationFrameId: number;
        const keys: { [key: string]: boolean } = {};

        const player = { x: canvas.width / 2 - 25, y: canvas.height - 60, width: 50, height: 20, speed: 5 };
        const bullets: { x: number, y: number, width: 5, height: 10, speed: 7 }[] = [];
        const invaders: { x: number, y: number, width: 30, height: 30, speed: number }[] = [];
        let invaderSpawnTimer = 2000;

        const spawnInvader = () => {
            invaders.push({
                x: Math.random() * (canvas.width - 30),
                y: -30,
                width: 30,
                height: 30,
                speed: 1 + Math.random() * 2
            });
        };

        let lastSpawnTime = 0;
        const gameLoop = (timestamp: number) => {
            if (gameOver) return;

            ctx.clearRect(0, 0, canvas.width, canvas.height);

            // Move player
            if (keys['ArrowLeft'] && player.x > 0) player.x -= player.speed;
            if (keys['ArrowRight'] && player.x < canvas.width - player.width) player.x += player.speed;

            // Draw player
            ctx.fillStyle = '#e53935';
            ctx.fillRect(player.x, player.y, player.width, player.height);
            ctx.fillRect(player.x + 20, player.y - 10, 10, 10);

            // Handle bullets
            bullets.forEach((bullet, bIndex) => {
                bullet.y -= bullet.speed;
                ctx.fillStyle = '#fdd835';
                ctx.fillRect(bullet.x, bullet.y, bullet.width, bullet.height);
                if (bullet.y < 0) bullets.splice(bIndex, 1);
            });
            
            // Handle invaders
            if (timestamp - lastSpawnTime > invaderSpawnTimer) {
                spawnInvader();
                lastSpawnTime = timestamp;
                if (invaderSpawnTimer > 500) invaderSpawnTimer *= 0.98;
            }

            invaders.forEach((invader, iIndex) => {
                invader.y += invader.speed;
                ctx.fillStyle = '#424242';
                ctx.font = '24px sans-serif';
                ctx.fillText('📄', invader.x, invader.y + 25);

                if (invader.y > canvas.height) {
                    setGameOver(true);
                }

                // Collision detection
                bullets.forEach((bullet, bIndex) => {
                    if (bullet.x < invader.x + invader.width &&
                        bullet.x + bullet.width > invader.x &&
                        bullet.y < invader.y + invader.height &&
                        bullet.y + bullet.height > invader.y) {
                        
                        invaders.splice(iIndex, 1);
                        bullets.splice(bIndex, 1);
                        setScore(s => s + 10);
                    }
                });
            });

            animationFrameId = requestAnimationFrame(gameLoop);
        };

        const handleKeyDown = (e: KeyboardEvent) => {
            keys[e.key] = true;
            if (e.key === ' ') { // Spacebar
                e.preventDefault();
                bullets.push({ x: player.x + player.width / 2 - 2.5, y: player.y, width: 5, height: 10, speed: 7 });
            }
        };
        const handleKeyUp = (e: KeyboardEvent) => { keys[e.key] = false; };

        window.addEventListener('keydown', handleKeyDown);
        window.addEventListener('keyup', handleKeyUp);
        
        animationFrameId = requestAnimationFrame(gameLoop);

        return () => {
            cancelAnimationFrame(animationFrameId);
            window.removeEventListener('keydown', handleKeyDown);
            window.removeEventListener('keyup', handleKeyUp);
        };
    }, []);
    
    const restartGame = () => {
        setScore(0);
        setGameOver(false);
    };

    return (
        <div className="py-16 bg-gray-50 dark:bg-black min-h-[calc(100vh-130px)]">
            <div className="container mx-auto px-6 text-center">
                <h1 className="text-4xl font-extrabold text-gray-800 dark:text-gray-100">PDF Invaders</h1>
                <p className="mt-2 text-lg text-gray-600 dark:text-gray-300">Use Arrow Keys to move, Spacebar to shoot.</p>
                <div className="text-2xl font-bold my-4">Score: <span className="text-brand-red">{score}</span></div>
                
                <div className="relative max-w-2xl mx-auto bg-gray-200 dark:bg-black rounded-lg shadow-lg overflow-hidden">
                    <canvas ref={canvasRef} width="600" height="400" className="w-full h-auto" />
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

export default PdfInvadersGame;
