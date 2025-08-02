
import React, { useRef, useEffect, useState } from 'react';
import { Link } from 'react-router-dom';

const PaperTossGame: React.FC = () => {
    const canvasRef = useRef<HTMLCanvasElement>(null);
    const [score, setScore] = useState(0);
    const [message, setMessage] = useState('Click and drag to toss!');

    useEffect(() => {
        const canvas = canvasRef.current;
        if (!canvas) return;
        const ctx = canvas.getContext('2d');
        if (!ctx) return;

        let animationFrameId: number;
        let isDragging = false;
        let startPos = { x: 0, y: 0 };
        
        const wind = { speed: (Math.random() - 0.5) * 0.2 };

        const paper = {
            x: 100,
            y: 350,
            z: 0,
            radius: 15,
            vx: 0,
            vy: 0,
            vz: 0,
            gravity: -0.2,
            isFlying: false
        };
        
        const bin = { x: canvas.width - 150, y: canvas.height - 100, width: 100, depth: 80 };
        
        const resetPaper = () => {
            paper.x = 100;
            paper.y = 350;
            paper.z = 0;
            paper.vx = 0;
            paper.vy = 0;
            paper.vz = 0;
            paper.isFlying = false;
        };

        const draw = () => {
            ctx.clearRect(0, 0, canvas.width, canvas.height);
            
            // Draw wind indicator
            ctx.fillStyle = '#90caf9';
            ctx.font = '16px sans-serif';
            ctx.fillText(`Wind: ${wind.speed > 0 ? '→' : '←'} ${Math.abs(wind.speed * 10).toFixed(1)}`, 10, 20);

            // Draw bin (back and front)
            ctx.fillStyle = '#616161';
            ctx.beginPath();
            ctx.ellipse(bin.x + bin.width / 2, bin.y, bin.width / 2, bin.depth / 4, 0, 0, Math.PI * 2);
            ctx.fill();

            // Draw paper
            const scale = 1 + paper.z / 200;
            const paperY = paper.y - paper.z;
            ctx.fillStyle = '#e0e0e0';
            ctx.beginPath();
            ctx.arc(paper.x, paperY, paper.radius * scale, 0, Math.PI * 2);
            ctx.fill();
            ctx.fillStyle = 'black';
            ctx.font = `${12*scale}px sans-serif`;
            ctx.fillText('📄', paper.x - (8*scale), paperY + (6*scale));
            
            // Draw bin front
            ctx.fillStyle = '#757575';
            ctx.beginPath();
            ctx.ellipse(bin.x + bin.width / 2, bin.y + bin.depth/2, bin.width / 2, bin.depth / 4, 0, 0, Math.PI * 2);
            ctx.fill();

            if (paper.isFlying) {
                paper.x += paper.vx + wind.speed;
                paper.y += paper.vy;
                paper.z += paper.vz;
                paper.vz += paper.gravity;
                
                if (paperY > canvas.height) resetPaper();

                // Check for score
                if (paper.z < 0) {
                    const distToBinCenter = Math.hypot(paper.x - (bin.x + bin.width / 2), paper.y - (bin.y + bin.depth / 2));
                    if(distToBinCenter < bin.width/3) {
                       setScore(s => s + 1);
                       setMessage('Nice shot!');
                       setTimeout(() => setMessage(''), 1500);
                       resetPaper();
                    }
                }
            }
        };

        const gameLoop = () => {
            draw();
            animationFrameId = requestAnimationFrame(gameLoop);
        };
        gameLoop();
        
        const handleMouseDown = (e: MouseEvent) => {
            isDragging = true;
            startPos = { x: e.offsetX, y: e.offsetY };
        };
        const handleMouseUp = (e: MouseEvent) => {
            if (!isDragging || paper.isFlying) return;
            isDragging = false;
            const endPos = { x: e.offsetX, y: e.offsetY };
            
            paper.isFlying = true;
            paper.vx = (endPos.x - startPos.x) * 0.1;
            paper.vz = -(endPos.y - startPos.y) * 0.1;
            paper.vy = (endPos.y - startPos.y) * 0.02; // A little bit of y-axis movement
        };

        canvas.addEventListener('mousedown', handleMouseDown);
        canvas.addEventListener('mouseup', handleMouseUp);

        return () => {
            cancelAnimationFrame(animationFrameId);
            canvas.removeEventListener('mousedown', handleMouseDown);
            canvas.removeEventListener('mouseup', handleMouseUp);
        };
    }, []);

    return (
        <div className="py-16 bg-gray-50 dark:bg-black min-h-[calc(100vh-130px)]">
            <div className="container mx-auto px-6 text-center">
                <h1 className="text-4xl font-extrabold text-gray-800 dark:text-gray-100">Paper Toss</h1>
                <p className="mt-2 text-lg text-gray-600 dark:text-gray-300">Toss the crumpled PDF into the bin. Mind the wind!</p>
                <div className="text-2xl font-bold my-4">Score: <span className="text-brand-red">{score}</span></div>
                
                <div className="relative max-w-2xl mx-auto bg-blue-100 dark:bg-black rounded-lg shadow-lg overflow-hidden">
                    <canvas ref={canvasRef} width="600" height="400" className="w-full h-auto cursor-pointer" />
                    <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 text-2xl font-bold text-black/20 dark:text-white/20 select-none pointer-events-none">
                       {message}
                    </div>
                </div>
                 <Link to="/play-game" className="inline-block mt-8 text-gray-600 dark:text-gray-400 hover:text-brand-red dark:hover:text-brand-red font-medium transition-colors">
                    &larr; Back to Arcade
                </Link>
            </div>
        </div>
    );
};

export default PaperTossGame;
