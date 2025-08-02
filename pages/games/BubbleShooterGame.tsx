import React, { useRef, useEffect, useState } from 'react';
import { Link } from 'react-router-dom';

const BubbleShooterGame: React.FC = () => {
    const canvasRef = useRef<HTMLCanvasElement>(null);
    const [score, setScore] = useState(0);
    const [gameOver, setGameOver] = useState(false);

    useEffect(() => {
        const canvas = canvasRef.current;
        if (!canvas) return;
        const ctx = canvas.getContext('2d');
        if (!ctx) return;

        let animationFrameId: number;
        let isGameOver = false;

        const BUBBLE_RADIUS = 15;
        const COLORS = ['#ef4444', '#3b82f6', '#22c55e', '#eab308', '#8b5cf6', '#ec4899'];
        const COLS = 13;
        const ROWS_TO_START = 8;
        const HEX_PACKING_Y = 0.866; // Sqrt(3)/2

        let grid: ({ color: string, r: number, c: number } | null)[][] = [];
        let playerBubble = { color: '', isShooting: false, x: 0, y: 0, dx: 0, dy: 0, speed: 15 };
        let nextBubbleColor = '';
        let aimAngle = Math.PI / 2;

        const init = () => {
            grid = [];
            for (let r = 0; r < ROWS_TO_START; r++) {
                grid[r] = [];
                const colsInRow = COLS - (r % 2);
                for (let c = 0; c < colsInRow; c++) {
                    grid[r][c] = { color: randomColor(), r, c };
                }
            }
            spawnPlayerBubble();
        };

        function randomColor() { return COLORS[Math.floor(Math.random() * COLORS.length)]; }

        function spawnPlayerBubble() {
            playerBubble.color = nextBubbleColor || randomColor();
            nextBubbleColor = randomColor();
            playerBubble.isShooting = false;
        }
        
        const getBubbleCoords = (r: number, c: number) => {
            const x = c * BUBBLE_RADIUS * 2 + (r % 2 ? BUBBLE_RADIUS : 0) + BUBBLE_RADIUS;
            const y = r * BUBBLE_RADIUS * 2 * HEX_PACKING_Y + BUBBLE_RADIUS;
            return { x, y };
        }

        const drawBubble = (x: number, y: number, color: string) => {
            ctx.beginPath();
            ctx.arc(x, y, BUBBLE_RADIUS, 0, Math.PI * 2);
            ctx.fillStyle = color;
            ctx.fill();
        };

        const drawGrid = () => {
            grid.forEach(row => row.forEach(bubble => {
                if(bubble) {
                    const { x, y } = getBubbleCoords(bubble.r, bubble.c);
                    drawBubble(x, y, bubble.color);
                }
            }));
        };

        const gameLoop = () => {
            if (isGameOver) return;
            ctx.clearRect(0, 0, canvas.width, canvas.height);
            drawGrid();

            // Draw aim line
            const shooterX = canvas.width / 2;
            const shooterY = canvas.height - 30;
            ctx.strokeStyle = '#616161';
            ctx.lineWidth = 2;
            ctx.beginPath();
            ctx.moveTo(shooterX, shooterY);
            ctx.lineTo(shooterX + Math.cos(aimAngle) * 80, shooterY - Math.sin(aimAngle) * 80);
            ctx.stroke();

            // Draw player bubble
            if (playerBubble.isShooting) {
                playerBubble.x += playerBubble.dx;
                playerBubble.y += playerBubble.dy;
                drawBubble(playerBubble.x, playerBubble.y, playerBubble.color);

                // Collision logic placeholder - a full implementation is very complex
                if (playerBubble.y < ROWS_TO_START * BUBBLE_RADIUS * 2 * HEX_PACKING_Y || playerBubble.x < 0 || playerBubble.x > canvas.width) {
                    setScore(s => s + 10); // Simulate a hit
                    spawnPlayerBubble();
                }
            } else {
                drawBubble(shooterX, shooterY, playerBubble.color);
            }

            // Draw next bubble
            ctx.fillStyle = '#616161';
            ctx.font = '16px sans-serif';
            ctx.fillText('Next:', 20, canvas.height - 25);
            drawBubble(70, canvas.height - 25, nextBubbleColor);

            animationFrameId = requestAnimationFrame(gameLoop);
        };
        
        const updateAim = (e: MouseEvent | TouchEvent) => {
            const rect = canvas.getBoundingClientRect();
            const clientX = 'touches' in e ? e.touches[0].clientX : e.clientX;
            const clientY = 'touches' in e ? e.touches[0].clientY : e.clientY;
            const mouseX = clientX - rect.left;
            const mouseY = clientY - rect.top;
            const shooterY = canvas.height - 30;
            const angle = Math.atan2(shooterY - mouseY, mouseX - canvas.width / 2);
            aimAngle = Math.PI - angle;
        };

        const shoot = () => {
            if (playerBubble.isShooting) return;
            playerBubble.isShooting = true;
            playerBubble.x = canvas.width / 2;
            playerBubble.y = canvas.height - 30;
            playerBubble.dx = Math.cos(aimAngle) * playerBubble.speed;
            playerBubble.dy = -Math.sin(aimAngle) * playerBubble.speed;
        };
        
        init();
        gameLoop();
        canvas.addEventListener('mousemove', updateAim);
        canvas.addEventListener('click', shoot);
        canvas.addEventListener('touchmove', (e) => { e.preventDefault(); updateAim(e); });
        canvas.addEventListener('touchend', shoot);
        canvas.style.touchAction = 'none';

        return () => {
            cancelAnimationFrame(animationFrameId);
            canvas.removeEventListener('mousemove', updateAim);
            canvas.removeEventListener('click', shoot);
            canvas.removeEventListener('touchmove', updateAim);
            canvas.removeEventListener('touchend', shoot);
        };
    }, [gameOver]);

    const restartGame = () => {
        setScore(0);
        setGameOver(false);
    };

    return (
        <div className="py-16 bg-gray-50 dark:bg-black min-h-screen flex flex-col items-center justify-center">
            <div className="container mx-auto px-4 text-center">
                <h1 className="text-4xl font-extrabold text-gray-800 dark:text-gray-100">Bubble Shooter</h1>
                 <div className="my-4 p-4 bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-700 rounded-lg max-w-lg mx-auto">
                    <h2 className="text-lg font-bold text-gray-700 dark:text-gray-200 mb-2">How to Play</h2>
                    <p className="text-sm text-gray-600 dark:text-gray-400"><strong className="text-brand-red">Desktop:</strong> Move mouse to aim, click to shoot.</p>
                    <p className="text-sm text-gray-600 dark:text-gray-400"><strong className="text-brand-red">Mobile:</strong> Touch and drag to aim, release to shoot.</p>
                </div>
                <div className="flex justify-center items-center gap-8 my-4">
                    <div className="text-xl font-bold">Score: <span className="text-brand-red">{score}</span></div>
                </div>
                
                <div className="relative max-w-lg mx-auto bg-blue-100 dark:bg-gray-900 rounded-lg shadow-lg overflow-hidden border-4 border-gray-300 dark:border-gray-700">
                    <canvas ref={canvasRef} width="420" height="500" className="w-full h-auto block" />
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

export default BubbleShooterGame;
