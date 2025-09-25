import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { GoogleGenAI, Type } from '@google/genai';
import { TOOLS } from '../constants.ts';
import { CopyIcon, BrainIcon } from '../components/icons.tsx';

interface GeneratedQuestion {
    question: string;
    type: 'multiple_choice' | 'short_answer' | 'true_false';
    options?: string[];
    answer: string;
}

const AIQuestionGeneratorPage: React.FC = () => {
    const tool = TOOLS.find(t => t.id === 'ai-question-generator');
    
    const [inputText, setInputText] = useState<string>('');
    const [questions, setQuestions] = useState<GeneratedQuestion[]>([]);
    const [isLoading, setIsLoading] = useState(false);
    const [error, setError] = useState('');
    const [copiedTooltip, setCopiedTooltip] = useState(false);

    useEffect(() => {
      document.title = "AI Question Generator | Create Questions from Text - PDFBullet";
      const metaDesc = document.querySelector('meta[name="description"]');
      if (metaDesc) {
          metaDesc.setAttribute("content", "Automatically create questions from any text using AI. Perfect for generating study guides, quizzes, and learning materials quickly and easily.");
      }
    }, []);

    const handleGenerate = async () => {
        if (!inputText.trim()) {
            setError('Please enter some text to generate questions from.');
            return;
        }

        const apiKey = process.env.API_KEY;
        if (!apiKey) {
            setError("API Key not found. Please ensure it is set up correctly in your environment configuration.");
            setIsLoading(false);
            return;
        }
        
        setIsLoading(true);
        setError('');
        setQuestions([]);

        try {
            const ai = new GoogleGenAI({ apiKey });
            const response = await ai.models.generateContent({
                model: 'gemini-2.5-flash',
                contents: `Generate a set of 5 diverse questions based on the following text. The questions should include a mix of multiple choice, true/false, and short answer types. For multiple choice, provide 4 options and indicate the correct answer. For true/false, provide the correct answer. For short answer, provide a concise correct answer.

                Text: "${inputText}"`,
                config: {
                    responseMimeType: "application/json",
                    responseSchema: {
                        type: Type.OBJECT,
                        properties: {
                            questions: {
                                type: Type.ARRAY,
                                description: "An array of 5 generated questions.",
                                items: {
                                    type: Type.OBJECT,
                                    properties: {
                                        question: { type: Type.STRING, description: "The question text." },
                                        type: { type: Type.STRING, enum: ['multiple_choice', 'short_answer', 'true_false'], description: "The type of question." },
                                        options: { type: Type.ARRAY, description: "An array of 4 options for multiple_choice questions.", items: { type: Type.STRING } },
                                        answer: { type: Type.STRING, description: "The correct answer." }
                                    },
                                    required: ['question', 'type', 'answer']
                                }
                            }
                        },
                        required: ['questions']
                    }
                }
            });
            
            const jsonResponse = JSON.parse(response.text);
            if (jsonResponse.questions) {
                setQuestions(jsonResponse.questions);
            } else {
                throw new Error("Received an unexpected format from the AI. Please try again.");
            }

        } catch (e: any) {
            console.error("AI Question Gen Error:", e);
            const errorMessage = e.message || '';
            let userFriendlyError = 'An error occurred. Please try again with different text.';

            if (errorMessage.toLowerCase().includes('api key')) {
                userFriendlyError = 'The AI service is currently unavailable. Please check your API key configuration.';
            } else if (errorMessage.toLowerCase().includes('safety')) {
                userFriendlyError = 'The provided text may have violated our safety policy. Please modify the text and try again.';
            } else if (errorMessage.toLowerCase().includes('parse')) {
                userFriendlyError = 'The AI returned an unexpected response. Please try modifying your text or try again later.';
            } else {
                userFriendlyError = `Failed to generate questions. ${errorMessage}`;
            }
            setError(userFriendlyError);
        } finally {
            setIsLoading(false);
        }
    };

    const handleCopy = () => {
        const textToCopy = questions.map((q, i) => {
            let text = `${i + 1}. ${q.question}\n`;
            if (q.type === 'multiple_choice' && q.options) {
                text += q.options.map((opt, idx) => `   ${String.fromCharCode(97 + idx)}) ${opt}`).join('\n') + '\n';
            }
            text += `Answer: ${q.answer}\n\n`;
            return text;
        }).join('');
        
        navigator.clipboard.writeText(textToCopy).then(() => {
            setCopiedTooltip(true);
            setTimeout(() => setCopiedTooltip(false), 2000);
        });
    };

    if (!tool) return null;

    return (
        <div className="min-h-[calc(100vh-200px)] flex flex-col items-center py-12 px-4 sm:px-6 bg-gray-50 dark:bg-black">
            <div className="text-center mb-10">
                <h1 className={`text-4xl font-extrabold ${tool.textColor}`}>{tool.title}</h1>
                <p className="mt-2 text-lg text-gray-600 dark:text-gray-300 max-w-2xl">{tool.description}</p>
            </div>
            
            <div className="w-full max-w-4xl space-y-6">
                <div className="bg-white dark:bg-black border border-gray-200 dark:border-gray-800 rounded-lg p-6 shadow-lg">
                    <div>
                        <label htmlFor="input-text" className="block text-sm font-bold text-gray-700 dark:text-gray-300 mb-2">Paste your text here</label>
                        <textarea
                            id="input-text"
                            rows={10}
                            value={inputText}
                            onChange={e => setInputText(e.target.value)}
                            className="w-full px-4 py-2 bg-white dark:bg-black border border-gray-300 dark:border-gray-600 rounded-md focus:ring-brand-red focus:border-brand-red text-gray-800 dark:text-gray-200"
                            placeholder="Paste any article, paragraph, or study material..."
                        />
                    </div>
                    <div className="mt-6">
                        <button
                            onClick={handleGenerate}
                            disabled={isLoading}
                            className={`w-full ${tool.color} ${tool.hoverColor} text-white font-bold py-3 px-8 rounded-lg text-lg transition-colors flex items-center justify-center disabled:bg-purple-300 dark:disabled:bg-purple-800`}
                        >
                            {isLoading ? (
                                <>
                                    <svg className="animate-spin -ml-1 mr-3 h-5 w-5 text-white" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24"><circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle><path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path></svg>
                                    Generating...
                                </>
                            ) : (
                                <><BrainIcon className="h-6 w-6 mr-2" /> Generate Questions</>
                            )}
                        </button>
                    </div>
                </div>

                {error && <p className="text-center text-sm text-red-500 bg-red-100 dark:bg-red-900/30 p-3 rounded-md">{error}</p>}

                {questions.length > 0 && (
                    <div className="bg-white dark:bg-black border border-gray-200 dark:border-gray-800 rounded-lg p-6 shadow-lg">
                        <div className="flex justify-between items-center mb-4">
                            <h2 className="text-2xl font-bold text-gray-800 dark:text-gray-100">Generated Questions</h2>
                            <div className="relative">
                                <button onClick={handleCopy} className="flex items-center gap-2 text-sm font-semibold text-gray-600 dark:text-gray-300 hover:text-brand-red transition-colors">
                                    <CopyIcon className="h-5 w-5"/> Copy All
                                </button>
                                 {copiedTooltip && <span className="absolute -top-8 left-1/2 -translate-x-1/2 text-xs bg-black text-white px-2 py-1 rounded shadow-lg z-10">Copied!</span>}
                            </div>
                        </div>
                        <div className="space-y-6">
                            {questions.map((q, index) => (
                                <div key={index} className="p-4 border-l-4 border-brand-red bg-gray-50 dark:bg-black rounded-r-lg">
                                    <p className="font-bold text-gray-800 dark:text-gray-100">{index + 1}. {q.question}</p>
                                    {q.type === 'multiple_choice' && q.options && (
                                        <div className="mt-2 space-y-1 pl-4">
                                            {q.options.map((option, i) => (
                                                <p key={i} className={`text-sm ${option === q.answer ? 'text-green-600 font-semibold' : 'text-gray-600 dark:text-gray-300'}`}>
                                                    {String.fromCharCode(97 + i)}) {option}
                                                </p>
                                            ))}
                                        </div>
                                    )}
                                     <p className="mt-2 text-sm text-green-700 dark:text-green-400 font-semibold">Answer: {q.answer}</p>
                                </div>
                            ))}
                        </div>
                    </div>
                )}
            </div>
             <div className="mt-12 text-center">
                <Link to="/" className="text-gray-600 dark:text-gray-400 hover:text-brand-red dark:hover:text-brand-red font-medium transition-colors">
                    &larr; Back to all tools
                </Link>
            </div>
        </div>
    );
};

export default AIQuestionGeneratorPage;