import React, { useState, useEffect, useRef } from 'react';
import { GoogleGenAI, Chat } from '@google/genai';
import { MessengerIcon, CloseIcon, PaperAirplaneIcon, UserIcon, RefreshIcon } from './icons.tsx';
import { useAuth } from '../contexts/AuthContext.tsx';

type ChatMessage = {
    role: 'user' | 'model';
    text: string;
};

interface ChatbotWidgetProps {
    isOpen: boolean;
    onClose: () => void;
    onOpen: () => void;
    showFab?: boolean; // Floating Action Button
}

const MarkdownRenderer: React.FC<{ text: string }> = ({ text }) => {
    // Basic markdown for bold text
    const formattedText = text.replace(/\*\*(.*?)\*\*/g, '<strong>$1</strong>');
    return <div style={{ whiteSpace: 'pre-wrap' }} dangerouslySetInnerHTML={{ __html: formattedText }} />;
};


export const ChatbotWidget: React.FC<ChatbotWidgetProps> = ({ isOpen, onClose, onOpen, showFab = true }) => {
    const [messages, setMessages] = useState<ChatMessage[]>([{ role: 'model', text: 'Hi! How can I help you today?' }]);
    const [input, setInput] = useState('');
    const [isLoading, setIsLoading] = useState(false);
    const [error, setError] = useState('');
    const [chat, setChat] = useState<Chat | null>(null);
    const chatContainerRef = useRef<HTMLDivElement>(null);
    const { user } = useAuth();

    useEffect(() => {
        if (isOpen && !chat) {
            try {
                const apiKey = process.env.API_KEY;
                if (!apiKey) {
                    throw new Error("API key is not configured.");
                }
                const ai = new GoogleGenAI({ apiKey });
                const chatSession = ai.chats.create({
                    model: 'gemini-2.5-flash',
                    config: {
                        systemInstruction: `You are a helpful and friendly AI assistant for a website called 'PDFBullet'. Your name is Bishal. Guide users on how to use the site's PDF and image tools. Prioritize privacy and speed as key features.`,
                    },
                });
                setChat(chatSession);
            } catch (e: any) {
                setError("Could not connect to the AI assistant.");
            }
        }
    }, [isOpen, chat]);
    
    useEffect(() => {
        chatContainerRef.current?.scrollTo(0, chatContainerRef.current.scrollHeight);
    }, [messages, isLoading]);
    
    const handleSendMessage = async () => {
        if (!input.trim() || isLoading || !chat) return;
        
        const userMessage: ChatMessage = { role: 'user', text: input };
        setMessages(prev => [...prev, userMessage]);
        setInput('');
        setIsLoading(true);
        setError('');
        
        try {
            const stream = await chat.sendMessageStream({ message: userMessage.text });
            let streamedText = '';
            setMessages(prev => [...prev, { role: 'model', text: '' }]);
            for await (const chunk of stream) {
                streamedText += chunk.text;
                setMessages(prev => {
                    const newMsgs = [...prev];
                    if (newMsgs.length > 0) {
                        newMsgs[newMsgs.length - 1].text = streamedText;
                    }
                    return newMsgs;
                });
            }
        } catch (e: any) {
            const errorMessage = "Sorry, I couldn't get a response. Please try again.";
            setError(errorMessage);
            setMessages(prev => [...prev, { role: 'model', text: errorMessage }]);
        } finally {
            setIsLoading(false);
        }
    };
    
    const handleNewChat = () => {
        setMessages([{ role: 'model', text: 'New chat started. How can I help?' }]);
        setChat(null); // This will trigger re-initialization
    };

    return (
        <>
            {showFab && !isOpen && (
                <button
                    onClick={onOpen}
                    className="fixed bottom-6 right-6 z-[90] bg-brand-red text-white w-16 h-16 rounded-full shadow-lg flex items-center justify-center transform hover:scale-110 transition-transform"
                    aria-label="Open Chat"
                >
                    <MessengerIcon className="h-8 w-8" />
                </button>
            )}
            
            <div className={`fixed bottom-24 right-6 sm:bottom-6 z-[99] transition-all duration-300 ease-in-out ${isOpen ? 'opacity-100 translate-y-0 pointer-events-auto' : 'opacity-0 translate-y-4 pointer-events-none'}`}>
                <div className="w-full max-w-sm h-[70vh] max-h-[500px] bg-white dark:bg-black rounded-2xl shadow-2xl flex flex-col border border-gray-200 dark:border-gray-800">
                    <header className="flex-shrink-0 p-4 flex justify-between items-center bg-gray-100 dark:bg-gray-800 rounded-t-2xl">
                        <p className="font-bold">PDFBullet Support</p>
                        <div className="flex items-center gap-2">
                             <button onClick={handleNewChat} className="text-gray-500 hover:text-gray-800 dark:hover:text-gray-200" title="New Chat"><RefreshIcon className="h-5 w-5" /></button>
                             <button onClick={onClose} className="text-gray-500 hover:text-gray-800 dark:hover:text-gray-200" title="Close Chat"><CloseIcon className="h-6 w-6" /></button>
                        </div>
                    </header>
                    <div ref={chatContainerRef} className="flex-grow p-4 overflow-y-auto space-y-4">
                        {messages.map((msg, index) => (
                            <div key={index} className={`flex items-start gap-3 ${msg.role === 'user' ? 'justify-end' : 'justify-start'}`}>
                                {msg.role === 'model' && <div className="w-8 h-8 rounded-full bg-brand-red/20 flex items-center justify-center flex-shrink-0"><MessengerIcon className="h-5 w-5 text-brand-red"/></div>}
                                <div className={`max-w-[80%] p-3 rounded-2xl text-sm ${msg.role === 'user' ? 'bg-blue-500 text-white' : 'bg-gray-200 dark:bg-gray-700'}`}>
                                    <MarkdownRenderer text={msg.text} />
                                </div>
                                {msg.role === 'user' && <div className="w-8 h-8 rounded-full bg-gray-200 dark:bg-gray-700 flex items-center justify-center flex-shrink-0"><UserIcon className="h-5 w-5"/></div>}
                            </div>
                        ))}
                        {isLoading && (
                             <div className="flex items-start gap-3 justify-start">
                                 <div className="w-8 h-8 rounded-full bg-brand-red/20 flex items-center justify-center flex-shrink-0"><MessengerIcon className="h-5 w-5 text-brand-red"/></div>
                                 <div className="p-3 rounded-2xl bg-gray-200 dark:bg-gray-700 flex items-center">
                                     <span className="h-2 w-2 bg-gray-500 rounded-full animate-bounce [animation-delay:-0.3s]"></span>
                                     <span className="h-2 w-2 bg-gray-500 rounded-full animate-bounce [animation-delay:-0.15s] mx-1.5"></span>
                                     <span className="h-2 w-2 bg-gray-500 rounded-full animate-bounce"></span>
                                 </div>
                             </div>
                        )}
                    </div>
                    {error && <p className="text-xs text-red-500 px-4 pb-2">{error}</p>}
                    <div className="flex-shrink-0 p-3 border-t border-gray-200 dark:border-gray-700">
                        <div className="relative flex items-center">
                            <input type="text" value={input} onChange={e => setInput(e.target.value)} onKeyPress={e => e.key === 'Enter' && handleSendMessage()} placeholder="Type a message..." className="w-full px-4 py-2 bg-gray-100 dark:bg-gray-800 rounded-full focus:ring-brand-red focus:border-brand-red text-sm" disabled={isLoading} />
                            <button onClick={handleSendMessage} disabled={isLoading || !input.trim()} className="absolute right-2 top-1/2 -translate-y-1/2 p-2 bg-brand-red text-white rounded-full disabled:bg-red-300"><PaperAirplaneIcon className="h-4 w-4" /></button>
                        </div>
                    </div>
                </div>
            </div>
        </>
    );
};