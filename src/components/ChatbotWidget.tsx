'use client';

import React, { useState, useEffect, useRef } from 'react';
import { Link } from 'react-router-dom';
import { useAuth } from '../../contexts/AuthContext';
import { useI18n } from '../../contexts/I18nContext';
import { TOOLS } from '../../constants';
import {
  CloseIcon, GlobeIcon, MicrophoneIcon, TrashIcon, RefreshIcon, HeadsetIcon
} from '../../components/icons';
import { GoogleGenAI } from '@google/genai';

const ChatbotIcon: React.FC<{ className?: string }> = ({ className }) => (
  <svg className={className} xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="currentColor">
    <path d="M21.99 4c0-1.1-.89-2-1.99-2H4c-1.1 0-2 .9-2 2v12c0 1.1.9 2 2 2h14l4 4-.01-18z" />
  </svg>
);

const SendIcon: React.FC<{ className?: string }> = ({ className }) => (
  <svg className={className} xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="currentColor">
    <path d="M2.01 21L23 12 2.01 3 2 10l15 2-15 2z" />
  </svg>
);

const EllipsisHorizontalIcon: React.FC<{ className?: string }> = ({ className }) => (
  <svg className={className} xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="currentColor">
    <path d="M6 12a2 2 0 11-4 0 2 2 0 014 0zm8 0a2 2 0 11-4 0 2 2 0 014 0zm8 0a2 2 0 11-4 0 2 2 0 014 0z" />
  </svg>
);

const ArrowLeftIcon: React.FC<{ className?: string }> = ({ className }) => (
  <svg className={className} xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="currentColor">
    <path d="M11.67 3.87L9.9 2.1 0 12l9.9 9.9 1.77-1.77L3.54 12z" />
  </svg>
);

const ClockIcon: React.FC<{ className?: string }> = ({ className }) => (
  <svg className={className} xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="currentColor">
    <path d="M12 2C6.48 2 2 6.48 2 12s4.48 10 10 10 10-4.48 10-10S17.52 2 12 2zm0 18c-4.41 0-8-3.59-8-8s3.59-8 8-8 8 3.59 8 8-3.59 8-8 8zm-1-13h2v6h-2zm0 8h2v-2h-2z" />
  </svg>
);

const BoltIcon: React.FC<{ className?: string }> = ({ className }) => (
  <svg className={className} xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="currentColor">
    <path d="M7 2v11h3v9l7-12h-4l4-8z" />
  </svg>
);

type GroundingSource = {
  web: {
    uri: string;
    title?: string;
  }
};

type ChatMessage = {
  role: 'user' | 'model';
  text: string;
  sources?: GroundingSource['web'][];
};

type Conversation = {
  id: number;
  messages: ChatMessage[];
  timestamp: number;
};

const CHAT_CONVERSATIONS_KEY = 'pdfbullet_chat_history_v2';
const INITIAL_MESSAGE: ChatMessage = { role: 'model', text: 'Hello! I am Bishal, your support assistant for Pdf Bullet. How can I help you today?' };

const faqs = [
  { q: 'How do I merge PDF files?', icon: '📄' },
  { q: 'Is this service secure?', icon: '🔒' },
  { q: 'Can I edit a PDF?', icon: '✏️' },
  { q: 'What about pricing?', icon: '💰' },
];

const MarkdownRenderer: React.FC<{ text: string; sources?: GroundingSource['web'][] }> = ({ text, sources }) => {
  const formattedText = text
    .replace(/\*\*(.*?)\*\*/g, '<strong>$1</strong>')
    .replace(/(\s|^)(\/[a-z0-9-]+)/g, (match, space, path) => `${space}<a href="${path}" class="text-brand-red hover:underline">${path}</a>`);

  return (
    <div>
      <div style={{ whiteSpace: 'pre-wrap' }} dangerouslySetInnerHTML={{ __html: formattedText }} />
      {sources && sources.length > 0 && (
        <div className="mt-2 pt-2 border-t border-gray-300 dark:border-gray-600">
          <h4 className="text-xs font-bold text-gray-600 dark:text-gray-400 flex items-center gap-1"><GlobeIcon className="h-4 w-4" /> Sources:</h4>
          <ul className="list-none pl-0 text-xs mt-1 space-y-1">
            {sources.map((source, i) => (
              <li key={i}>
                <a href={source.uri} target="_blank" rel="noopener noreferrer" className="block p-1.5 bg-blue-50 dark:bg-blue-900/30 rounded-md text-blue-600 dark:text-blue-400 hover:underline truncate" title={source.uri}>
                  {source.title || source.uri}
                </a>
              </li>
            ))}
          </ul>
        </div>
      )}
    </div>
  );
};

interface ChatbotWidgetProps {
  isOpen: boolean;
  onClose: () => void;
  onOpen: () => void;
  showFab: boolean;
  isPwa: boolean;
}

export function ChatbotWidget({ isOpen, onClose, onOpen, showFab, isPwa }: ChatbotWidgetProps) {
  const [currentMessages, setCurrentMessages] = useState<ChatMessage[]>([INITIAL_MESSAGE]);
  const [allConversations, setAllConversations] = useState<Conversation[]>([]);
  const [inputValue, setInputValue] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState('');
  const [chat, setChat] = useState<any>(null);
  const [useGoogleSearch, setUseGoogleSearch] = useState(false);
  const [isListening, setIsListening] = useState(false);
  const [isMenuOpen, setIsMenuOpen] = useState(false);
  const { user } = useAuth();
  const { t } = useI18n();

  const chatContainerRef = useRef<HTMLDivElement>(null);
  const recognitionRef = useRef<any>(null);

  useEffect(() => {
    try {
      const saved = localStorage.getItem(CHAT_CONVERSATIONS_KEY);
      if (saved) {
        const conversations: Conversation[] = JSON.parse(saved);
        setAllConversations(conversations);
        if (conversations.length > 0) {
          setCurrentMessages(conversations[conversations.length - 1].messages);
        }
      }
    } catch (e) { console.error("Failed to load chat history", e); }
  }, []);

  const initializeChat = () => {
    try {
      const apiKey = process.env.NEXT_PUBLIC_GEMINI_API_KEY || process.env.API_KEY || 'mock-key';
      const ai = new GoogleGenAI({ apiKey });
      const chatSession = ai.chats.create({
        model: 'gemini-flash-latest',
        config: {
          systemInstruction: `You are an expert support assistant for Pdf Bullet.`,
        },
      });
      setChat(chatSession);
      return chatSession;
    } catch (e: any) {
      console.error("Failed to initialize Gemini Chat:", e);
      setError("Could not connect to the AI assistant. Please try again later.");
      return null;
    }
  };

  useEffect(() => {
    if (isOpen && !chat) initializeChat();
  }, [isOpen, chat]);

  useEffect(() => {
    if (typeof window !== 'undefined' && ('SpeechRecognition' in window || 'webkitSpeechRecognition' in window)) {
      const SpeechRecognition = (window as any).SpeechRecognition || (window as any).webkitSpeechRecognition;
      const recognition = new SpeechRecognition();
      recognition.continuous = false;
      recognition.interimResults = false;
      recognition.lang = 'en-US';
      recognition.onresult = (event: any) => setInputValue(event.results[0][0].transcript);
      recognition.onerror = (event: any) => setError(`Voice recognition error: ${event.error}`);
      recognition.onend = () => setIsListening(false);
      recognitionRef.current = recognition;
    }
  }, []);

  useEffect(() => {
    if (chatContainerRef.current) {
      chatContainerRef.current.scrollTop = chatContainerRef.current.scrollHeight;
    }
  }, [currentMessages, isLoading]);

  const saveCurrentConversation = () => {
    if (currentMessages.length > 1) {
      const newConversation: Conversation = { id: Date.now(), messages: currentMessages, timestamp: Date.now() };
      const updatedConversations = [...allConversations, newConversation];
      setAllConversations(updatedConversations);
      localStorage.setItem(CHAT_CONVERSATIONS_KEY, JSON.stringify(updatedConversations));
    }
  };

  const handleSendMessage = async (messageText?: string) => {
    const textToSend = (messageText || inputValue).trim();
    if (!textToSend || isLoading) return;

    const userMessage: ChatMessage = { role: 'user', text: textToSend };
    setCurrentMessages(prev => [...prev, userMessage]);
    setInputValue('');
    setIsLoading(true);
    setError('');

    try {
      const apiKey = process.env.NEXT_PUBLIC_GEMINI_API_KEY || process.env.API_KEY || 'mock-key';
      const ai = new GoogleGenAI({ apiKey });

      if (useGoogleSearch) {
        const response = await ai.models.generateContent({ model: "gemini-flash-latest", contents: textToSend, config: { tools: [{ googleSearch: {} }] } });
        const groundingChunks = response.candidates?.[0]?.groundingMetadata?.groundingChunks;
        const sources: GroundingSource['web'][] = groundingChunks?.map(c => c.web).filter((w): w is GroundingSource['web'] => !!w?.uri) || [];
        setCurrentMessages(prev => [...prev, { role: 'model', text: response.text || 'Done', sources: sources.length > 0 ? sources : undefined }]);
      } else {
        let currentChat = chat;
        if (!currentChat) {
          currentChat = initializeChat();
          if (!currentChat) throw new Error("Chat could not be re-initialized.");
        }
        const stream = await currentChat.sendMessageStream({ message: textToSend });
        let streamedText = '';
        setCurrentMessages(prev => [...prev, { role: 'model', text: '' }]);
        for await (const chunk of stream) {
          streamedText += chunk.text;
          setCurrentMessages(prev => {
            const newMsgs = [...prev];
            if (newMsgs.length > 0) newMsgs[newMsgs.length - 1].text = streamedText;
            return newMsgs;
          });
        }
      }
    } catch (e: any) {
      console.error("Gemini API error:", e);
      const displayMessage = `Sorry, I couldn't get a response.`;
      setError(displayMessage);
      setCurrentMessages(prev => [...prev, { role: 'model', text: displayMessage }]);
    } finally {
      setIsLoading(false);
    }
  };

  const handleVoiceSearch = () => {
    if (isListening || !recognitionRef.current) return;
    setIsListening(true);
    setError('');
    recognitionRef.current.start();
  };

  const handleNewChat = () => {
    saveCurrentConversation();
    setCurrentMessages([INITIAL_MESSAGE]);
    setChat(null);
    setIsMenuOpen(false);
    initializeChat();
  };

  const handleClearHistory = () => {
    if (window.confirm('Are you sure you want to delete all chat history?')) {
      setCurrentMessages([INITIAL_MESSAGE]);
      setAllConversations([]);
      localStorage.removeItem(CHAT_CONVERSATIONS_KEY);
      setIsMenuOpen(false);
      setChat(null);
      initializeChat();
    }
  };

  const loadConversation = (conversation: Conversation) => {
    saveCurrentConversation();
    setCurrentMessages(conversation.messages);
    setChat(null);
    setIsMenuOpen(false);
    initializeChat();
  };

  const conversationStarted = currentMessages.length > 1;
  const widgetPositionClasses = isPwa ? 'bottom-24 right-4 sm:bottom-6 sm:right-6' : 'bottom-6 left-6';

  return (
    <div className={`fixed z-[90] flex flex-col-reverse ${isPwa ? 'items-end' : 'items-start'} gap-2 ${widgetPositionClasses} pointer-events-none`}>
      {showFab && (
        isPwa ? (
          <button
            onClick={onOpen}
            className={`pointer-events-auto transition-opacity duration-300 ease-in-out transform hover:scale-110 hover:brightness-110 ${!isOpen ? 'opacity-100' : 'opacity-0 pointer-events-none'}`}
            aria-label="Open Chat Support"
          >
            <img
              src="https://ik.imagekit.io/fonepay/chatbot%20icon.png?updatedAt=1760017579423"
              alt="Chat Support"
              className="w-16 h-16 rounded-full shadow-lg"
            />
          </button>
        ) : (
          <button
            onClick={onOpen}
            className={`pointer-events-auto relative transition-opacity duration-300 ease-in-out bg-brand-red text-white w-12 h-12 rounded-full shadow-lg flex items-center justify-center transform hover:scale-110 animate-wave-float ${!isOpen ? 'opacity-100' : 'opacity-0 pointer-events-none'}`}
            aria-label="Open chat support"
          >
            <span className="absolute inline-flex h-full w-full rounded-full bg-brand-red opacity-75 animate-ping-slow"></span>
            <ChatbotIcon className="h-6 w-6 relative" />
          </button>
        )
      )}

      <div className={`transition-all duration-300 ease-in-out ${isOpen ? 'opacity-100 translate-y-0 pointer-events-auto' : 'opacity-0 translate-y-4 pointer-events-none'}`}>
        <div className="w-full max-w-[calc(100vw-2rem)] sm:w-80 h-[60vh] max-h-[480px] sm:max-h-[500px] bg-white/90 dark:bg-black/80 backdrop-blur-lg rounded-2xl shadow-2xl flex flex-col border border-gray-200/30 dark:border-gray-700/30 overflow-hidden">
          <div className="flex-shrink-0 p-4 flex justify-between items-center bg-gradient-to-r from-red-600 to-orange-500 rounded-t-2xl">
            <p className="font-bold text-white">Pdf Bullet Support</p>
            <div className="flex items-center gap-2">
              <button onClick={() => setIsMenuOpen(true)} className="p-1.5 rounded-md border border-white/30 text-white/80 hover:bg-white/10 hover:text-white transition-colors"><EllipsisHorizontalIcon className="h-5 w-5" /></button>
              <button onClick={onClose} className="text-white/70 hover:text-white"><CloseIcon className="h-6 w-6" /></button>
            </div>
          </div>
          <div className="flex-grow flex flex-col overflow-hidden relative">
            <div ref={chatContainerRef} className="flex-grow p-4 overflow-y-auto space-y-4">
              {currentMessages.map((msg, index) => (
                <div key={index} className={`flex items-end gap-2.5 ${msg.role === 'user' ? 'justify-end' : 'justify-start'}`}>
                  {msg.role === 'model' && <img src="https://i.ibb.co/RpStGhqm/IMG-5251-Original.jpg" alt="Support" className="w-8 h-8 rounded-full object-cover flex-shrink-0 border-2 border-white shadow-md" />}
                  <div className={`max-w-[80%] p-3 rounded-2xl text-sm relative group ${msg.role === 'user' ? 'bg-blue-500 text-white rounded-br-none' : 'bg-gray-200 dark:bg-gray-700 text-gray-800 dark:text-gray-200 rounded-bl-none'}`}>
                    <MarkdownRenderer text={msg.text} sources={msg.sources} />
                  </div>
                </div>
              ))}
              {isLoading && (
                <div className="flex items-end gap-2.5 justify-start">
                  <img src="https://i.ibb.co/RpStGhqm/IMG-5251-Original.jpg" alt="Support" className="w-8 h-8 rounded-full object-cover flex-shrink-0 border-2 border-white shadow-md" />
                  <div className="p-3 rounded-2xl bg-gray-200 dark:bg-gray-700 flex items-center rounded-bl-none">
                    <span className="h-2 w-2 bg-gray-500 rounded-full animate-bounce [animation-delay:-0.3s]"></span>
                    <span className="h-2 w-2 bg-gray-500 rounded-full animate-bounce [animation-delay:-0.15s] mx-1.5"></span>
                    <span className="h-2 w-2 bg-gray-500 rounded-full animate-bounce"></span>
                  </div>
                </div>
              )}
            </div>
            {error && <p className="text-xs text-red-500 text-center px-4 pb-2">{error}</p>}
            <div className="flex-shrink-0 p-3 border-t border-gray-200/50 dark:border-gray-700/50">
              <a href="https://wa.me/9779827801575" target="_blank" rel="noopener noreferrer" className="mb-2 w-full text-center bg-green-500 hover:bg-green-600 text-white text-xs font-bold py-2 px-4 rounded-full flex items-center justify-center gap-2">
                <HeadsetIcon className="h-4 w-4" /><span>Talk to human support</span>
              </a>
              <div className="relative flex items-center">
                <button type="button" onClick={handleVoiceSearch} className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-500 hover:text-brand-red"><MicrophoneIcon className="h-5 w-5" /></button>
                <input type="text" value={inputValue} onChange={(e) => setInputValue(e.target.value)} onKeyPress={(e) => e.key === 'Enter' && handleSendMessage()} placeholder="Type a message..." className="flex-grow w-full px-4 py-2 pl-10 bg-gray-100 dark:bg-gray-800 border border-transparent rounded-full text-sm" />
                <button onClick={() => handleSendMessage()} className="p-2.5 ml-2 bg-brand-red text-white rounded-full"><SendIcon className="h-5 w-5" /></button>
              </div>
            </div>
            <div className={`absolute inset-0 bg-white dark:bg-black flex flex-col transition-transform duration-300 ease-in-out ${isMenuOpen ? 'translate-x-0' : '-translate-x-full'}`}>
              <div className="flex-shrink-0 p-4 flex items-center border-b border-gray-200 dark:border-gray-700">
                <button onClick={() => setIsMenuOpen(false)} className="mr-4 text-gray-500 hover:text-gray-800"><ArrowLeftIcon className="h-6 w-6" /></button>
                <h3 className="font-bold text-lg">Menu</h3>
              </div>
              <div className="flex-grow overflow-y-auto p-4">
                <button onClick={handleNewChat} className="w-full text-left flex items-center gap-3 p-3 rounded-lg hover:bg-gray-100 dark:hover:bg-gray-800 font-semibold"><RefreshIcon className="h-5 w-5 text-brand-red" /> New Chat</button>
                <button onClick={handleClearHistory} className="w-full text-left flex items-center gap-3 p-3 rounded-lg hover:bg-gray-100 dark:hover:bg-gray-800 font-semibold"><TrashIcon className="h-5 w-5 text-brand-red" /> Clear History</button>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
