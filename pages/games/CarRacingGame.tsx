import React, { useRef, useEffect, useState } from 'react';
import { Link } from 'react-router-dom';

const CarRacingGame: React.FC = () => {
    const canvasRef = useRef<HTMLCanvasElement>(null);
    const [score, setScore] = useState(0);
    const [gameOver, setGameOver] = useState(false);
    const [highScore, setHighScore] = useState(() => parseInt(localStorage.getItem('carRacingHighScore') || '0', 10));

    // This effect runs the game loop and handles controls.
    useEffect(() => {
        const canvas = canvasRef.current;
        if (!canvas) return;
        const ctx = canvas.getContext('2d');
        if (!ctx) return;

        let animationFrameId: number;
        let gameSpeed = 3;
        let isGameOver = false;

        const roadImg = new Image();
        roadImg.src = 'https://media.istockphoto.com/id/1146551901/photo/retro-video-game-background-3d-illustration.jpg?s=612x612&w=0&k=20&c=QTRz-D9-evP8M3XMYZaGxXbjgJghg3tOtl93pDvCPDI=';
        roadImg.crossOrigin = "Anonymous";

        const playerCar = { x: canvas.width / 2 - 25, y: canvas.height - 120, width: 50, height: 100, speed: 5 };
        const obstacles: { x: number, y: number, width: number, height: number, color: string }[] = [];
        let roadY = 0;

        const keys: { [key: string]: boolean } = {};
        let touchX: number | null = null;

        const drawPlayerCar = () => {
            // Car Body
            ctx.fillStyle = '#e53935';
            ctx.fillRect(playerCar.x, playerCar.y, playerCar.width, playerCar.height);
            // Windshield
            ctx.fillStyle = '#212121';
            ctx.fillRect(playerCar.x + 5, playerCar.y + 10, playerCar.width - 10, 30);
            // Roof
            ctx.fillStyle = '#c62828';
            ctx.fillRect(playerCar.x + 5, playerCar.y, playerCar.width - 10, 10);
            // Headlights
            ctx.fillStyle = 'yellow';
            ctx.fillRect(playerCar.x + 5, playerCar.y, 10, 5);
            ctx.fillRect(playerCar.x + playerCar.width - 15, playerCar.y, 10, 5);
        };

        const gameLoop = () => {
            if (isGameOver) return;
            
            ctx.clearRect(0, 0, canvas.width, canvas.height);
            
            // Draw scrolling road
            roadY += gameSpeed * 2;
            if (roadY > canvas.height) roadY = 0;
            ctx.drawImage(roadImg, 0, roadY, canvas.width, canvas.height);
            ctx.drawImage(roadImg, 0, roadY - canvas.height, canvas.width, canvas.height);

            // Handle player movement (Keyboard & Touch)
            if (keys['ArrowLeft'] && playerCar.x > 0) playerCar.x -= playerCar.speed;
            if (keys['ArrowRight'] && playerCar.x < canvas.width - playerCar.width) playerCar.x += playerCar.speed;
            if (touchX !== null) {
                playerCar.x = Math.max(0, Math.min(canvas.width - playerCar.width, touchX - playerCar.width / 2));
            }
            
            drawPlayerCar();

            // Spawn and move obstacles
            if (Math.random() < 0.05 && obstacles.length < 5) { // spawn rate
                const obstacleColors = ['#42a5f5', '#66bb6a', '#ffee58', '#ab47bc'];
                obstacles.push({ 
                    x: Math.random() * (canvas.width - 50), 
                    y: -100, 
                    width: 50, 
                    height: 100,
                    color: obstacleColors[Math.floor(Math.random() * obstacleColors.length)]
                });
            }

            obstacles.forEach((obstacle, index) => {
                obstacle.y += gameSpeed;
                ctx.fillStyle = obstacle.color;
                ctx.fillRect(obstacle.x, obstacle.y, obstacle.width, obstacle.height);
                ctx.fillStyle = '#212121'; // Windows for obstacle cars
                ctx.fillRect(obstacle.x + 5, obstacle.y + 10, obstacle.width - 10, 30);


                if (playerCar.x < obstacle.x + obstacle.width &&
                    playerCar.x + playerCar.width > obstacle.x &&
                    playerCar.y < obstacle.y + obstacle.height &&
                    playerCar.y + playerCar.height > obstacle.y) {
                    isGameOver = true;
                    setGameOver(true);
                    if(score > highScore) {
                        localStorage.setItem('carRacingHighScore', score.toString());
                        setHighScore(score);
                    }
                }
                
                if (obstacle.y > canvas.height) {
                    obstacles.splice(index, 1);
                    setScore(s => s + 10);
                }
            });
            
            gameSpeed += 0.002;

            animationFrameId = requestAnimationFrame(gameLoop);
        };
        
        const handleKeyDown = (e: KeyboardEvent) => { keys[e.key] = true; };
        const handleKeyUp = (e: KeyboardEvent) => { keys[e.key] = false; };
        
        const handleTouchStart = (e: TouchEvent) => {
            if (e.touches[0]) touchX = e.touches[0].clientX - canvas.getBoundingClientRect().left;
        };
        const handleTouchMove = (e: TouchEvent) => {
            e.preventDefault();
            if (e.touches[0]) touchX = e.touches[0].clientX - canvas.getBoundingClientRect().left;
        };
        const handleTouchEnd = () => { touchX = null; };

        window.addEventListener('keydown', handleKeyDown);
        window.addEventListener('keyup', handleKeyUp);
        canvas.addEventListener('touchstart', handleTouchStart);
        canvas.addEventListener('touchmove', handleTouchMove);
        canvas.addEventListener('touchend', handleTouchEnd);
        canvas.style.touchAction = 'none';

        roadImg.onload = () => { gameLoop(); };
        roadImg.onerror = () => { 
            console.error("Failed to load road image. Starting game with solid color.");
            gameLoop();
        };

        return () => {
            cancelAnimationFrame(animationFrameId);
            window.removeEventListener('keydown', handleKeyDown);
            window.removeEventListener('keyup', handleKeyUp);
            canvas.removeEventListener('touchstart', handleTouchStart);
            canvas.removeEventListener('touchmove', handleTouchMove);
            canvas.removeEventListener('touchend', handleTouchEnd);
        };
    }, [gameOver, score, highScore]);
    
    const restartGame = () => {
        setScore(0);
        setGameOver(false);
    };

    return (
        <div className="py-16 bg-gray-900 text-white min-h-screen flex flex-col items-center justify-center font-mono">
            <div className="container mx-auto px-4 text-center">
                <h1 className="text-5xl font-extrabold text-white" style={{ textShadow: '2px 2px #ff00ff, 4px 4px #00ffff' }}>Retro Racer</h1>
                
                <div className="my-4 p-4 bg-black/50 border-2 border-cyan-400 rounded-lg max-w-lg mx-auto">
                    <h2 className="text-lg font-bold text-yellow-300 mb-2">How to Play</h2>
                    <p className="text-sm"><strong className="text-cyan-400">Desktop:</strong> Use <kbd>←</kbd> and <kbd>→</kbd> arrow keys to move.</p>
                    <p className="text-sm"><strong className="text-cyan-400">Mobile:</strong> Touch and drag the car to move.</p>
                </div>

                <div className="flex justify-center items-center gap-8 my-4">
                    <div className="text-xl font-bold">Score: <span className="text-yellow-300">{score}</span></div>
                    <div className="text-xl font-bold">High Score: <span className="text-yellow-300">{highScore}</span></div>
                </div>
                
                <div className="relative max-w-lg mx-auto border-4 border-gray-700 rounded-lg shadow-2xl overflow-hidden">
                    <canvas ref={canvasRef} width="400" height="600" className="w-full h-auto block" />
                    {gameOver && (
                         <div className="absolute inset-0 bg-black/80 flex flex-col items-center justify-center rounded-lg animate-fade-in-down">
                            <h2 className="text-5xl font-bold text-red-500" style={{ textShadow: '2px 2px #fff' }}>GAME OVER</h2>
                            <p className="text-2xl text-white mt-4">Final Score: {score}</p>
                            <button onClick={restartGame} className="mt-8 bg-yellow-400 hover:bg-yellow-500 text-black font-bold py-3 px-8 rounded-lg transition-colors border-2 border-black text-xl">
                                RESTART
                            </button>
                        </div>
                    )}
                </div>
                <Link to="/play-game" className="inline-block mt-8 text-cyan-400 hover:text-yellow-300 font-medium transition-colors">
                    &larr; Back to Arcade
                </Link>
            </div>
        </div>
    );
};

export default CarRacingGame;
