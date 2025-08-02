
import React, { useState } from 'react';
import { Link } from 'react-router-dom';

const quizQuestions = [
    {
        question: "What does PDF stand for?",
        options: ["Public Document File", "Portable Document Format", "Printed Document File", "Personal Document Format"],
        correctAnswer: 1
    },
    {
        question: "Which company created the PDF format?",
        options: ["Microsoft", "Google", "Apple", "Adobe"],
        correctAnswer: 3
    },
    {
        question: "Which I Love PDFLY tool combines multiple PDFs into one?",
        options: ["Split PDF", "Compress PDF", "Merge PDF", "Organize PDF"],
        correctAnswer: 2
    },
    {
        question: "What does OCR stand for in 'OCR PDF'?",
        options: ["Optical Character Recognition", "Online Content Reader", "Original Copy Resolution", "Official Certified Record"],
        correctAnswer: 0
    },
    {
        question: "Which tool reduces a PDF's file size?",
        options: ["Unlock PDF", "Compress PDF", "Watermark", "Rotate PDF"],
        correctAnswer: 1
    },
    {
        question: "Which tool would you use to remove password protection from a PDF?",
        options: ["Protect PDF", "Sign PDF", "Unlock PDF", "Redact PDF"],
        correctAnswer: 2
    },
    {
        question: "Is I Love PDFLY available as a mobile app?",
        options: ["Yes", "No"],
        correctAnswer: 0
    },
    {
        question: "What is the primary benefit of client-side processing on I Love PDFLY?",
        options: ["Faster Speeds", "Better Quality", "Enhanced Privacy/Security", "More Features"],
        correctAnswer: 2
    },
    {
        question: "Which tool adds page numbers to a document?",
        options: ["Edit PDF", "Page Numbers", "Organize PDF", "Watermark"],
        correctAnswer: 1
    },
    {
        question: "Can you turn a website into a PDF using I Love PDFLY?",
        options: ["Yes, with the HTML to PDF tool", "No, this is not possible"],
        correctAnswer: 0
    }
];

const QuizGame: React.FC = () => {
    const [questions, setQuestions] = useState(quizQuestions.sort(() => 0.5 - Math.random()));
    const [currentQuestionIndex, setCurrentQuestionIndex] = useState(0);
    const [score, setScore] = useState(0);
    const [selectedAnswer, setSelectedAnswer] = useState<number | null>(null);
    const [showFeedback, setShowFeedback] = useState(false);
    const [isCorrect, setIsCorrect] = useState(false);
    const [gameOver, setGameOver] = useState(false);

    const restartGame = () => {
        setQuestions(quizQuestions.sort(() => 0.5 - Math.random()));
        setCurrentQuestionIndex(0);
        setScore(0);
        setSelectedAnswer(null);
        setShowFeedback(false);
        setIsCorrect(false);
        setGameOver(false);
    };

    const handleAnswerClick = (answerIndex: number) => {
        if (showFeedback) return;

        setSelectedAnswer(answerIndex);
        setShowFeedback(true);
        const correct = answerIndex === questions[currentQuestionIndex].correctAnswer;
        setIsCorrect(correct);
        if (correct) {
            setScore(prevScore => prevScore + 10);
        }
    };

    const handleNextQuestion = () => {
        if (currentQuestionIndex < questions.length - 1) {
            setCurrentQuestionIndex(prevIndex => prevIndex + 1);
            setSelectedAnswer(null);
            setShowFeedback(false);
            setIsCorrect(false);
        } else {
            setGameOver(true);
        }
    };
    
    const getButtonClass = (index: number) => {
        if (!showFeedback) {
            return "bg-white dark:bg-black border-gray-300 dark:border-gray-700 hover:bg-gray-100 dark:hover:bg-gray-800";
        }
        if (index === questions[currentQuestionIndex].correctAnswer) {
            return "bg-green-500 text-white border-green-500";
        }
        if (index === selectedAnswer && !isCorrect) {
            return "bg-red-500 text-white border-red-500";
        }
        return "bg-white dark:bg-black border-gray-300 dark:border-gray-700 opacity-60";
    };

    if (gameOver) {
        return (
            <div className="py-16 bg-gray-50 dark:bg-black min-h-[calc(100vh-130px)] flex items-center justify-center">
                <div className="container mx-auto px-6 text-center animate-fade-in-down">
                    <h1 className="text-4xl font-extrabold text-gray-800 dark:text-gray-100">Quiz Complete!</h1>
                    <p className="mt-4 text-2xl text-gray-600 dark:text-gray-300">
                        Your final score is: <span className="font-bold text-brand-red">{score}</span> / {questions.length * 10}
                    </p>
                    <button onClick={restartGame} className="mt-8 bg-brand-red hover:bg-brand-red-dark text-white font-bold py-3 px-8 rounded-lg transition-colors text-lg">
                        Play Again
                    </button>
                    <Link to="/play-game" className="block mt-4 text-gray-600 dark:text-gray-400 hover:text-brand-red dark:hover:text-brand-red font-medium transition-colors">
                        &larr; Back to Arcade
                    </Link>
                </div>
            </div>
        );
    }
    
    const currentQuestion = questions[currentQuestionIndex];

    return (
        <div className="py-16 bg-gray-50 dark:bg-black min-h-[calc(100vh-130px)]">
            <div className="container mx-auto px-6">
                <div className="max-w-3xl mx-auto bg-white dark:bg-black rounded-lg shadow-xl p-6 md:p-8">
                    <div className="flex justify-between items-center mb-6">
                        <div className="text-sm font-bold text-gray-600 dark:text-gray-400">Question {currentQuestionIndex + 1} / {questions.length}</div>
                        <div className="text-lg font-bold text-brand-red">Score: {score}</div>
                    </div>
                    <div className="w-full bg-gray-200 dark:bg-gray-700 rounded-full h-2.5 mb-6">
                        <div className="bg-brand-red h-2.5 rounded-full" style={{ width: `${((currentQuestionIndex + 1) / questions.length) * 100}%` }}></div>
                    </div>
                    <h2 className="text-2xl md:text-3xl font-bold text-gray-800 dark:text-gray-100 mb-6 text-center min-h-[96px]">
                        {currentQuestion.question}
                    </h2>
                    <div className="space-y-4">
                        {currentQuestion.options.map((option, index) => (
                            <button
                                key={index}
                                onClick={() => handleAnswerClick(index)}
                                disabled={showFeedback}
                                className={`w-full text-left p-4 rounded-lg border-2 text-lg font-semibold transition-all duration-300 ${getButtonClass(index)}`}
                            >
                                {option}
                            </button>
                        ))}
                    </div>
                    {showFeedback && (
                        <div className="mt-6 text-center animate-fade-in-down">
                            <p className={`font-bold text-xl ${isCorrect ? 'text-green-600' : 'text-red-600'}`}>
                                {isCorrect ? 'Correct!' : 'Incorrect!'}
                            </p>
                            <button onClick={handleNextQuestion} className="mt-4 bg-brand-red hover:bg-brand-red-dark text-white font-bold py-2 px-8 rounded-lg transition-colors">
                                Next
                            </button>
                        </div>
                    )}
                </div>
                <div className="text-center">
                    <Link to="/play-game" className="inline-block mt-8 text-gray-600 dark:text-gray-400 hover:text-brand-red dark:hover:text-brand-red font-medium transition-colors">
                        &larr; Back to Arcade
                    </Link>
                </div>
            </div>
        </div>
    );
};

export default QuizGame;
