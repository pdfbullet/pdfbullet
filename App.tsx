
// FIX: Replaced incomplete file content with the full App component definition and default export to resolve the import error in index.tsx.
import React, { lazy, Suspense, useState, useRef, useEffect, createContext, useMemo, useCallback } from 'react';
import { Routes, Route, useLocation, Link, useNavigate, Navigate } from 'react-router-dom';
import { ThemeProvider } from './contexts/ThemeContext.tsx';
import { AuthProvider, useAuth } from './contexts/AuthContext.tsx';
import { I18nProvider, useI18n } from './contexts/I18nContext.tsx';
import { PWAInstallProvider, usePWAInstall } from './contexts/PWAInstallContext.tsx';
import PullToRefresh from './components/PullToRefresh.tsx';
import { EmailIcon, CheckIcon, UserIcon, RefreshIcon, MicrophoneIcon, CopyIcon, GlobeIcon, CloseIcon, HeadsetIcon, TrashIcon, BellIcon } from './components/icons.tsx';
import { GoogleGenAI, Chat } from '@google/genai';
import { Logo } from './components/Logo.tsx';
import { TOOLS } from './constants.ts';
import { db } from './firebase/config.ts';
// FIX: Changed to a default import for the Header component to match its updated export type.
import Header from './components/Header.tsx';
import Footer from './components/Footer.tsx';
import ScrollToTopButton from './components/ScrollToTopButton.tsx';
import ProfileImageModal from './components/ProfileImageModal.tsx';
import SearchModal from './components/SearchModal.tsx';
import AdminProtectedRoute from './components/AdminProtectedRoute.tsx';
import UserProtectedRoute from './components/UserProtectedRoute.tsx';
import CalendarModal from './components/CalendarModal.tsx';
import CookieConsentBanner from './components/CookieConsentBanner.tsx';
import ChangePasswordModal from './components/ChangePasswordModal.tsx';
import PWAInstallPrompt from './components/PWAInstallPrompt.tsx';
import ProblemReportModal from './components/ProblemReportModal.tsx';
import QrCodeModal from './components/QrCodeModal.tsx';
import Preloader from './components/Preloader.tsx';
import PWAInstallInstructionsModal from './components/PWAInstallInstructionsModal.tsx';
import MobileAuthGate from './components/MobileAuthGate.tsx';
import WelcomeInstallModal from './components/WelcomeInstallModal.tsx';
import PwaBottomNav from './components/PwaBottomNav.tsx';
import UserDashboardLayout from './components/UserDashboardLayout.tsx';
import PlaceholderPage from './components/PlaceholderPage.tsx';
import NotFoundPage from './pages/NotFoundPage.tsx';
import NotificationsPage from './pages/NotificationsPage.tsx';
import InAppNotification from './components/InAppNotification.tsx';


// Create and export LayoutContext to manage shared layout state across components.
// This context will provide a way for pages like ToolPage to control parts of the main layout, such as the footer visibility.
export const LayoutContext = createContext<{
  setShowFooter: (show: boolean) => void;
}>({
  setShowFooter: () => {},
});

// Define a richer Notification interface
export interface Notification {
  id: string;
  title: string;
  message: string;
  timestamp: number;
  read: boolean;
  url?: string;
  attachmentUrl?: string;
}


// Inlined component to fix import issue
const DataDeletionPage: React.FC = () => {
    React.useEffect(() => {
        document.title = "User Data Deletion | PDFBullet";
    }, []);

    return (
        <div className="py-16 md:py-24">
            <div className="px-6">
                <div className="max-w-4xl mx-auto bg-white dark:bg-black p-8 md:p-12 rounded-lg shadow-lg border border-gray-200 dark:border-gray-800">
                    <h1 className="text-3xl md:text-4xl font-extrabold text-gray-800 dark:text-gray-100 mb-8">User Data Deletion Request</h1>
                    <div className="prose dark:prose-invert max-w-none text-gray-700 dark:text-gray-300">
                        <p>We are committed to protecting your privacy and giving you control over your personal data. If you wish to delete your account and all associated data from our systems, please follow the instructions below.</p>
                        
                        <h3>How to Delete Your Data</h3>
                        <p>You can permanently delete your account and all associated data directly from your account settings. This is the fastest and most secure way to delete your data.</p>
                        <ol>
                            <li>Log in to your PDFBullet account.</li>
                            <li>Navigate to the <Link to="/account-settings" className="text-brand-red hover:underline">Account Settings</Link> page.</li>
                            <li>Scroll down to the "Danger Zone" section.</li>
                            <li>Click on "Delete My Account" and follow the on-screen instructions to confirm the deletion.</li>
                        </ol>

                        <h3 className="mt-6">Alternative Method</h3>
                        <p>If you are unable to access your account, you can request data deletion by sending an email to our support team with the subject line "Data Deletion Request".</p>
                        <p>
                            <strong>Email:</strong> <a href="mailto:Support@pdfbullet.com" className="text-brand-red hover:underline">Support@pdfbullet.com</a>
                        </p>
                        <p>Please include the username and email address associated with your account in your message.</p>
                    </div>
                </div>
            </div>
        </div>
    );
};

const ForgotPasswordModal: React.FC<{ isOpen: boolean; onClose: () => void; }> = ({ isOpen, onClose }) => {
    const [email, setEmail] = useState('');
    const [error, setError] = useState('');
    const [success, setSuccess] = useState('');
    const [isLoading, setIsLoading] = useState(false);
    const { auth } = useAuth();
    const emailInputRef = useRef<HTMLInputElement>(null);

    useEffect(() => {
        if (isOpen) {
            setEmail('');
            setError('');
            setSuccess('');
            setIsLoading(false);
            setTimeout(() => emailInputRef.current?.focus(), 100);
        }
    }, [isOpen]);

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        setError('');
        setSuccess('');
        setIsLoading(true);

        try {
            await auth.sendPasswordResetEmail(email);
            setSuccess(`Password reset link sent to ${email}. Please check your inbox (and spam folder).`);
        } catch (err: any) {
            if (err.code === 'auth/user-not-found') {
                setError('No account found with this email address.');
            } else {
                setError(err.message || 'Failed to send reset email. Please try again.');
            }
        } finally {
            setIsLoading(false);
        }
    };
    
    if (!isOpen) return null;

    return (
        <div className="fixed inset-0 bg-black/60 z-[100] flex items-center justify-center p-4" onClick={onClose}>
            <div className="bg-white dark:bg-black w-full max-w-md rounded-lg shadow-xl" onClick={e => e.stopPropagation()}>
                <header className="flex items-center justify-between p-4 border-b border-gray-200 dark:border-gray-700">
                    <h2 className="text-xl font-bold text-gray-800 dark:text-gray-100">Reset Password</h2>
                    <button onClick={onClose} aria-label="Close modal" className="text-gray-500 hover:text-gray-800 dark:text-gray-400 dark:hover:text-white transition-colors">&times;</button>
                </header>
                {success ? (
                  <div className="p-8 text-center">
                     <CheckIcon className="h-12 w-12 text-green-500 mx-auto mb-4" />
                     <p className="text-green-700 dark:text-green-300">{success}</p>
                     <button onClick={onClose} className="mt-6 w-full bg-brand-red text-white font-bold py-2 px-4 rounded-md">Close</button>
                  </div>
                ) : (
                  <form onSubmit={handleSubmit}>
                    <main className="p-6 space-y-4">
                      <p className="text-sm text-gray-600 dark:text-gray-400">Enter your account's email address and we will send you a password reset link.</p>
                      <div>
                        <label htmlFor="reset-email" className="sr-only">Email address</label>
                        <div className="relative">
                            <div className="pointer-events-none absolute inset-y-0 left-0 flex items-center pl-3">
                                <EmailIcon className="h-5 w-5 text-gray-400" />
                            </div>
                            <input ref={emailInputRef} type="email" id="reset-email" value={email} onChange={e => setEmail(e.target.value)} required placeholder="you@example.com" className="w-full pl-10 pr-3 py-2 border rounded-md bg-white dark:bg-gray-800 border-gray-300 dark:border-gray-600 focus:ring-brand-red focus:border-brand-red" />
                        </div>
                      </div>
                      {error && <p className="text-sm text-red-500">{error}</p>}
                    </main>
                    <footer className="flex justify-end gap-4 p-4 bg-gray-50 dark:bg-gray-900/50 rounded-b-lg">
                      <button type="button" onClick={onClose} className="px-4 py-2 text-sm font-semibold border rounded-md bg-white dark:bg-gray-700 hover:bg-gray-100 dark:hover:bg-gray-600">Cancel</button>
                      <button type="submit" disabled={isLoading} className="px-4 py-2 text-sm font-semibold text-white bg-brand-red rounded-md disabled:bg-red-300 hover:bg-brand-red-dark">
                        {isLoading ? 'Sending...' : 'Send Reset Link'}
                      </button>
                    </footer>
                  </form>
                )}
            </div>
        </div>
    );
};

const ChatbotIcon: React.FC<{ className?: string }> = ({ className }) => (
    <svg className={className} xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="currentColor">
        <path d="M21.99 4c0-1.1-.89-2-1.99-2H4c-1.1 0-2 .9-2 2v12c0 1.1.9 2 2 2h14l4 4-.01-18z"/>
    </svg>
);

const SendIcon: React.FC<{ className?: string }> = ({ className }) => (
    <svg className={className} xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="currentColor">
        <path d="M2.01 21L23 12 2.01 3 2 10l15 2-15 2z"/>
    </svg>
);

const EllipsisHorizontalIcon: React.FC<{ className?: string }> = ({ className }) => (
  <svg className={className} xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="currentColor">
    <path d="M6 12a2 2 0 11-4 0 2 2 0 014 0zm8 0a2 2 0 11-4 0 2 2 0 014 0zm8 0a2 2 0 11-4 0 2 2 0 014 0z" />
  </svg>
);

const ArrowLeftIcon: React.FC<{ className?: string }> = ({ className }) => (
    <svg className={className} xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="currentColor">
        <path d="M11.67 3.87L9.9 2.1 0 12l9.9 9.9 1.77-1.77L3.54 12z"/>
    </svg>
);

const ClockIcon: React.FC<{ className?: string }> = ({ className }) => (
    <svg className={className} xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="currentColor">
        <path d="M12 2C6.48 2 2 6.48 2 12s4.48 10 10 10 10-4.48 10-10S17.52 2 12 2zm0 18c-4.41 0-8-3.59-8-8s3.59-8 8-8 8 3.59 8 8-3.59 8-8 8zm-1-13h2v6h-2zm0 8h2v-2h-2z" />
    </svg>
);

const BoltIcon: React.FC<{ className?: string }> = ({ className }) => (
    <svg className={className} xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="currentColor">
        <path d="M7 2v11h3v9l7-12h-4l4-8z"/>
    </svg>
);

// FIX: Define missing types and constants for ChatbotWidget
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

const INITIAL_MESSAGE: ChatMessage = { role: 'model', text: 'Hello! I am Bishal, your support assistant for PDFBullet. How can I help you today?' };

const faqs = [
    { q: 'How do I merge PDF files?', icon: '📄' },
    { q: 'Is this service secure?', icon: '🔒' },
    { q: 'Can I edit a PDF?', icon: '✏️' },
    { q: 'What about pricing?', icon: '💰' },
];

const MarkdownRenderer: React.FC<{ text: string; sources?: GroundingSource['web'][] }> = ({ text, sources }) => {
    // A simple markdown renderer that handles **bold** text and converts paths like /merge-pdf to links.
    const formattedText = text
        .replace(/\*\*(.*?)\*\*/g, '<strong>$1</strong>')
        .replace(/(\s|^)(\/[a-z0-9-]+)/g, (match, space, path) => `${space}<a href="${path}" class="text-brand-red hover:underline">${path}</a>`);

    return (
        <div>
            <div style={{ whiteSpace: 'pre-wrap' }} dangerouslySetInnerHTML={{ __html: formattedText }} />
            {sources && sources.length > 0 && (
                <div className="mt-2 pt-2 border-t border-gray-300 dark:border-gray-600">
                    <h4 className="text-xs font-bold text-gray-600 dark:text-gray-400 flex items-center gap-1"><GlobeIcon className="h-4 w-4"/> Sources:</h4>
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

const ChatbotWidget: React.FC<ChatbotWidgetProps> = ({ isOpen, onClose, onOpen, showFab, isPwa }) => {
    const [currentMessages, setCurrentMessages] = useState<ChatMessage[]>([INITIAL_MESSAGE]);
    const [allConversations, setAllConversations] = useState<Conversation[]>([]);
    const [inputValue, setInputValue] = useState('');
    const [isLoading, setIsLoading] = useState(false);
    const [error, setError] = useState('');
    const [chat, setChat] = useState<Chat | null>(null);
    const [useGoogleSearch, setUseGoogleSearch] = useState(false);
    const [isListening, setIsListening] = useState(false);
    const [copiedTooltip, setCopiedTooltip] = useState<string | null>(null);
    const [isMenuOpen, setIsMenuOpen] = useState(false);
    const [userHasInteracted, setUserHasInteracted] = useState(false);
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
    
    const speak = (text: string) => {
        if ('speechSynthesis' in window && text) {
            window.speechSynthesis.cancel();
            const utterance = new SpeechSynthesisUtterance(text);
            utterance.lang = 'en-US';
            const trySpeak = () => {
                const voices = window.speechSynthesis.getVoices();
                const femaleVoice = voices.find(voice => voice.lang === 'en-US' && (voice.name.includes('Google') || voice.name.includes('Female')));
                if (femaleVoice) utterance.voice = femaleVoice;
                window.speechSynthesis.speak(utterance);
            };
            if (window.speechSynthesis.getVoices().length > 0) trySpeak();
            else window.speechSynthesis.onvoiceschanged = trySpeak;
        }
    };
    
    const initializeChat = () => {
        try {
            const apiKey = process.env.API_KEY;
            if (!apiKey) throw new Error("API key is not configured.");
            const ai = new GoogleGenAI({ apiKey });
            const chatSession = ai.chats.create({
                model: 'gemini-2.5-flash',
                config: {
                    systemInstruction: `You are an expert, friendly, and helpful customer support assistant for a website called 'PDFBullet'. Your name is Bishal, and you represent the company. Your goal is to provide accurate information, guide users on how to use the site, and answer frequently asked questions based *only* on the extensive information provided below.

**Core Mission & Values:**
- **Website:** The official website is pdfbullet.com.
- **Mission:** To provide a comprehensive online toolkit for PDF and image management that is FREE, fast, secure, and private.
- **Key Feature - Privacy:** The cornerstone of PDFBullet is **client-side processing**. This means most file operations happen directly in the user's browser. Files are NOT uploaded to servers for most tools, guaranteeing 100% privacy. This is a major advantage and should be mentioned when relevant.
- **Key Feature - Speed:** Because of client-side processing, there are no upload delays, making the tools incredibly fast.
- **Key Feature - Free Access:** Most tools are completely free to use without limits.

**Available Tools (Organized by Category):**
- **Organize PDF:** Merge, Split, Organize, Rotate PDF, Create ZIP files.
- **Optimize PDF:** Compress PDF, Repair PDF (a premium tool to fix corrupted files).
- **Convert to PDF:** JPG to PDF, Word to PDF, PowerPoint to PDF, Excel to PDF, PSD to PDF, and Scan to PDF (using a device camera).
- **Convert from PDF:** PDF to JPG, PDF to PNG, PDF to Word, PDF to PowerPoint (premium), PDF to Excel, Extract Text (OCR).
- **Edit PDF:** Edit PDF (premium), Add Page Numbers (premium), Crop PDF (premium), OCR PDF (premium, to make scanned text selectable).
- **PDF Security:** Unlock PDF, Protect PDF (add password), Sign PDF (premium), Watermark PDF.
- **Image Tools:** Remove Background, Compress Image, Watermark Image.
- **Business & AI Tools:** AI Question Generator, Invoice Generator, CV Generator, Lesson Plan Creator.

**Premium Features & Pricing:**
- Premium plans unlock advanced features like OCR, batch processing, higher file limits, no ads, team features, and access to premium tools like Edit PDF and PDF to PowerPoint.
- Pricing information can be found at /pricing.

**Company & Support:**
- **Founder & CEO:** Bishal Mishra.
- **Support:** The primary support email is Support@pdfbullet.com. Human support is available via WhatsApp for urgent issues.
- **Developer API:** A REST API is available for developers at /developer.

**Interaction Guidelines:**
- **Be Friendly & Professional:** Use emojis sparingly to add warmth ✨.
- **Provide Links:** When mentioning a tool or page, provide the relative path (e.g., "You can use our /merge-pdf tool for that."). Format them as simple text paths.
- **Use Markdown:** Use double asterisks for bolding: \`**this is bold**\`. This helps highlight important information.
- **Stay Focused:** Only answer questions related to PDFBullet. If asked about competitors (like 'Smallpdf'), politely state you only have information about PDFBullet and its features.`,
                   thinkingConfig: { thinkingBudget: 0 }
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
            // FIX: Cast window to `any` to access non-standard SpeechRecognition APIs.
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
            const apiKey = process.env.API_KEY;
            if (!apiKey) throw new Error("API key is not configured.");
            const ai = new GoogleGenAI({ apiKey });

            if (useGoogleSearch) {
                 const response = await ai.models.generateContent({ model: "gemini-2.5-flash", contents: textToSend, config: { tools: [{googleSearch: {}}] } });
                 const groundingChunks = response.candidates?.[0]?.groundingMetadata?.groundingChunks;
                 const sources: GroundingSource['web'][] = groundingChunks?.map(c => c.web).filter((w): w is GroundingSource['web'] => !!w?.uri) || [];
                 setCurrentMessages(prev => [...prev, { role: 'model', text: response.text, sources: sources.length > 0 ? sources : undefined }]);
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
            const errorMessage = "Sorry, I couldn't get a response. Please check your connection or try again later.";
            setError(errorMessage);
            setCurrentMessages(prev => [...prev, { role: 'model', text: errorMessage }]);
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
        if (window.confirm('Are you sure you want to delete all chat history? This action cannot be undone.')) {
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

    const widgetPositionClasses = isPwa ? 'bottom-24 right-4 sm:bottom-6 sm:right-6' : 'bottom-4 left-4';

    return (
        <div className={`fixed z-[99] pointer-events-none ${widgetPositionClasses}`}>
            <div className={`transition-all duration-300 ease-in-out ${isOpen ? 'opacity-100 translate-y-0 pointer-events-auto' : 'opacity-0 translate-y-4 pointer-events-none'}`}>
                <div 
                    className="w-full max-w-[calc(100vw-2rem)] sm:w-80 h-[60vh] max-h-[480px] sm:max-h-[500px] bg-white dark:bg-black rounded-2xl shadow-2xl flex flex-col border border-gray-200 dark:border-gray-800 overflow-hidden"
                    onMouseEnter={() => setUserHasInteracted(true)}
                    onClick={() => setUserHasInteracted(true)}
                >
                    <div className="flex-shrink-0 p-4 flex justify-between items-center bg-gradient-to-r from-red-600 to-orange-500 rounded-t-2xl">
                        <p className="font-bold text-white">PDFBullet Support</p>
                        <div className="flex items-center gap-2">
                            <button onClick={() => setIsMenuOpen(true)} className="p-1.5 rounded-md border border-white/30 text-white/80 hover:bg-white/10 hover:text-white transition-colors" aria-label="Open menu" title="Open menu"><EllipsisHorizontalIcon className="h-5 w-5" /></button>
                            <button onClick={onClose} className="text-white/70 hover:text-white" aria-label="Close chat widget" title="Close chat widget"><CloseIcon className="h-6 w-6" /></button>
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
                            {!conversationStarted && !isLoading && (
                                <div className="pt-2">
                                    <p className="text-xs font-semibold text-gray-500 dark:text-gray-400 mb-2">Or ask about:</p>
                                    <div className="flex flex-wrap gap-2">
                                        {faqs.map((faq, i) => (
                                            <button key={i} onClick={() => handleSendMessage(faq.q)} className="flex items-center gap-2 text-xs text-left bg-gray-100 dark:bg-gray-800 hover:bg-gray-200 dark:hover:bg-gray-700 p-2 rounded-lg transition-colors">
                                                <span>{faq.icon}</span><span className="font-medium text-gray-700 dark:text-gray-300">{faq.q}</span>
                                            </button>
                                        ))}
                                    </div>
                                </div>
                            )}
                        </div>
                         {error && <p className="text-xs text-red-500 text-center px-4 pb-2">{error}</p>}
                         <div className="flex-shrink-0 p-3 border-t border-gray-200 dark:border-gray-700">
                            <a href="https://wa.me/9779827801575" target="_blank" rel="noopener noreferrer" className="mb-2 w-full text-center bg-green-500 hover:bg-green-600 text-white text-xs font-bold py-2 px-4 rounded-full flex items-center justify-center gap-2 transition-colors">
                                <UserIcon className="h-4 w-4" /><span>Talk to human support</span>
                            </a>
                            <div className="relative flex items-center">
                                <button type="button" onClick={handleVoiceSearch} disabled={isLoading || isListening} className={`absolute left-3 top-1/2 -translate-y-1/2 text-gray-500 hover:text-brand-red transition-colors disabled:opacity-50 ${isListening ? 'text-red-500 animate-pulse' : ''}`} aria-label="Use voice input" title="Use voice input">
                                    <MicrophoneIcon className="h-5 w-5" />
                                </button>
                                <input type="text" value={inputValue} onChange={(e) => setInputValue(e.target.value)} onKeyPress={(e) => e.key === 'Enter' && handleSendMessage()} placeholder={isListening ? "Listening..." : "Type a message..."} className="flex-grow w-full px-4 py-2 pl-10 bg-gray-100 dark:bg-gray-800 border border-transparent rounded-full focus:ring-brand-red focus:border-brand-red text-sm" disabled={isLoading || isListening}/>
                                <button onClick={() => handleSendMessage()} disabled={isLoading || !inputValue.trim()} className="p-2.5 ml-2 bg-brand-red text-white rounded-full disabled:bg-red-300 transition-colors flex-shrink-0"><SendIcon className="h-5 w-5" /></button>
                            </div>
                            <div className="mt-2 flex items-center justify-center gap-2">
                                <label htmlFor="google-search-toggle" className="flex items-center cursor-pointer">
                                    <div className="relative">
                                        <input type="checkbox" id="google-search-toggle" className="sr-only" checked={useGoogleSearch} onChange={() => setUseGoogleSearch(!useGoogleSearch)} />
                                        <div className="block bg-gray-200 dark:bg-gray-700 w-10 h-6 rounded-full"></div>
                                        <div className={`dot absolute left-1 top-1 bg-white w-4 h-4 rounded-full transition-transform ${useGoogleSearch ? 'translate-x-full bg-brand-red' : ''}`}></div>
                                    </div>
                                    <div className="ml-2 text-xs text-gray-600 dark:text-gray-300 font-semibold flex items-center gap-1"><GlobeIcon className="h-4 w-4"/> Search with Google</div>
                                </label>
                            </div>
                        </div>
                        <div className={`absolute inset-0 bg-white dark:bg-black flex flex-col transition-transform duration-300 ease-in-out ${isMenuOpen ? 'translate-x-0' : '-translate-x-full'}`}>
                            <div className="flex-shrink-0 p-4 flex items-center border-b border-gray-200 dark:border-gray-700">
                                <button onClick={() => setIsMenuOpen(false)} className="mr-4 text-gray-500 hover:text-gray-800"><ArrowLeftIcon className="h-6 w-6"/></button>
                                <h3 className="font-bold text-lg">Menu</h3>
                            </div>
                            <div className="flex-grow overflow-y-auto p-4">
                                <button onClick={handleNewChat} className="w-full text-left flex items-center gap-3 p-3 rounded-lg hover:bg-gray-100 dark:hover:bg-gray-800 font-semibold">
                                    <RefreshIcon className="h-5 w-5 text-brand-red"/> New Chat
                                </button>
                                <button onClick={handleClearHistory} className="w-full text-left flex items-center gap-3 p-3 rounded-lg hover:bg-gray-100 dark:hover:bg-gray-800 font-semibold">
                                    <TrashIcon className="h-5 w-5 text-brand-red"/> Clear History
                                </button>
                                <div className="mt-4">
                                    <h4 className="px-3 text-sm font-bold text-gray-500 dark:text-gray-400 flex items-center gap-2"><ClockIcon className="h-4 w-4"/> History</h4>
                                    <div className="mt-2 space-y-1 max-h-40 overflow-y-auto">
                                        {allConversations.length > 0 ? [...allConversations].reverse().map(conv => (
                                            <button key={conv.id} onClick={() => loadConversation(conv)} className="w-full text-left p-3 text-sm rounded-lg hover:bg-gray-100 dark:hover:bg-gray-800">
                                                <p className="truncate font-medium">{conv.messages[1]?.text || 'New Conversation'}</p>
                                                <p className="text-xs text-gray-400">{new Date(conv.timestamp).toLocaleString()}</p>
                                            </button>
                                        )) : <p className="p-3 text-sm text-gray-400">No past conversations.</p>}
                                    </div>
                                </div>
                                 <div className="mt-4">
                                    <h4 className="px-3 text-sm font-bold text-gray-500 dark:text-gray-400 flex items-center gap-2"><BoltIcon className="h-4 w-4"/> Quick Tools</h4>
                                    <div className="mt-2 space-y-1">
                                        {TOOLS.slice(0, 4).map(tool => (
                                            <Link key={tool.id} to={`/${tool.id}`} onClick={() => setIsMenuOpen(false)} className="w-full text-left flex items-center gap-3 p-3 rounded-lg hover:bg-gray-100 dark:hover:bg-gray-800">
                                                <tool.Icon className={`h-5 w-5 ${tool.textColor}`}/>
                                                <span className="font-semibold text-sm">{t(tool.title)}</span>
                                            </Link>
                                        ))}
                                    </div>
                                </div>
                            </div>
                        </div>
                    </div>
                </div>
            </div>
            {showFab && (
                <button onClick={onOpen} className={`relative transition-all duration-300 ease-in-out bg-brand-red text-white w-12 h-12 rounded-full shadow-lg flex items-center justify-center transform hover:scale-110 pointer-events-auto animate-wave-float ${!isOpen ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-4 pointer-events-none'}`} aria-label="Open chat support" title="Open chat support">
                    <span className="absolute inline-flex h-full w-full rounded-full bg-brand-red opacity-75 animate-ping-slow"></span>
                    <ChatbotIcon className="h-6 w-6 relative" />
                </button>
            )}
        </div>
    );
};


// Lazy-loaded page components
const HomePage = lazy(() => import('./pages/HomePage.tsx'));
const ToolPage = lazy(() => import('./pages/ToolPage.tsx'));
const AboutPage = lazy(() => import('./pages/AboutPage.tsx'));
const BlogPage = lazy(() => import('./pages/BlogPage.tsx'));
const BlogPostPage = lazy(() => import('./pages/BlogPostPage.tsx'));
const ContactPage = lazy(() => import('./pages/ContactPage.tsx'));
const LoginPage = lazy(() => import('./pages/LoginPage.tsx'));
const SignUpPage = lazy(() => import('./pages/SignUpPage.tsx'));
const DeveloperPage = lazy(() => import('./pages/DeveloperPage.tsx'));
const FaqPage = lazy(() => import('./pages/FaqPage.tsx'));
const SitemapPage = lazy(() => import('./pages/SitemapPage.tsx'));
const InvoiceGeneratorPage = lazy(() => import('./pages/InvoiceGeneratorPage.tsx'));
const CVGeneratorPage = lazy(() => import('./pages/CVGeneratorPage.tsx'));
const LessonPlanCreatorPage = lazy(() => import('./pages/LessonPlanCreatorPage.tsx'));
const AIQuestionGeneratorPage = lazy(() => import('./pages/AIQuestionGeneratorPage.tsx'));
const PricingPage = lazy(() => import('./pages/PricingPage.tsx'));
const PremiumFeaturePage = lazy(() => import('./pages/PremiumFeaturePage.tsx'));
const PaymentPage = lazy(() => import('./pages/PaymentPage.tsx'));
const DeveloperAccessPage = lazy(() => import('./pages/DeveloperAccessPage.tsx'));
const AdminDashboardPage = lazy(() => import('./pages/AdminDashboardPage.tsx'));
const HowToUsePage = lazy(() => import('./pages/HowToUsePage.tsx'));
const EducationPage = lazy(() => import('./pages/EducationPage.tsx'));
const BusinessPage = lazy(() => import('./pages/BusinessPage.tsx'));
const PrivacyPolicyPage = lazy(() => import('./pages/PrivacyPolicyPage.tsx'));
const TermsOfServicePage = lazy(() => import('./pages/TermsOfServicePage.tsx'));
const CookiesPolicyPage = lazy(() => import('./pages/CookiesPolicyPage.tsx'));
const CeoPage = lazy(() => import('./pages/CeoPage.tsx'));
const ApiPricingPage = lazy(() => import('./pages/ApiPricingPage.tsx'));
const ApiReferencePage = lazy(() => import('./pages/ApiReferencePage.tsx'));
const ApiPdfPage = lazy(() => import('./pages/ApiPdfPage.tsx'));
const ApiImagePage = lazy(() => import('./pages/ApiImagePage.tsx'));
const ApiSignaturePage = lazy(() => import('./pages/ApiSignaturePage.tsx'));
const AccountSettingsPage = lazy(() => import('./pages/AccountSettingsPage.tsx'));
const PressPage = lazy(() => import('./pages/PressPage.tsx'));
const WorkflowsPage = lazy(() => import('./pages/WorkflowsPage.tsx'));
const CreateWorkflowPage = lazy(() => import('./pages/CreateWorkflowPage.tsx'));
const LegalPage = lazy(() => import('./pages/LegalPage.tsx'));
const SecurityPolicyPage = lazy(() => import('./pages/SecurityPolicyPage.tsx'));
const FeaturesPage = lazy(() => import('./pages/FeaturesPage.tsx'));
const ImageGeneratorPage = lazy(() => import('./pages/ImageGeneratorPage.tsx'));

// New Dashboard Pages
const SecurityPage = lazy(() => import('./pages/SecurityPage.tsx'));
const TeamPage = lazy(() => import('./pages/TeamPage.tsx'));
const LastTasksPage = lazy(() => import('./pages/LastTasksPage.tsx'));
const SignaturesOverviewPage = lazy(() => import('./pages/SignaturesOverviewPage.tsx'));
const SentPage = lazy(() => import('./pages/SentPage.tsx'));
const InboxPage = lazy(() => import('./pages/InboxPage.tsx'));
const SignedPage = lazy(() => import('./pages/SignedPage.tsx'));
const TemplatesPage = lazy(() => import('./pages/TemplatesPage.tsx'));
const ContactsPage = lazy(() => import('./pages/ContactsPage.tsx'));
const SignatureSettingsPage = lazy(() => import('./pages/SignatureSettingsPage.tsx'));
const PlansAndPackagesPage = lazy(() => import('./pages/PlansAndPackagesPage.tsx'));
const BusinessDetailsPage = lazy(() => import('./pages/BusinessDetailsPage.tsx'));
const InvoicesPage = lazy(() => import('./pages/InvoicesPage.tsx'));

// New PWA-specific pages
const PwaHomePage = lazy(() => import('./pages/PwaHomePage.tsx'));
const PwaToolsPage = lazy(() => import('./pages/PwaToolsPage.tsx'));
const PwaArticlesPage = lazy(() => import('./pages/PwaArticlesPage.tsx'));
const PwaSettingsPage = lazy(() => import('./pages/PwaSettingsPage.tsx'));
const PwaStoragePage = lazy(() => import('./pages/PwaStoragePage.tsx'));


function AppContent() {
  const location = useLocation();
  const navigate = useNavigate();
  const { user, loading } = useAuth();
  const { isPwa } = usePWAInstall();
  const [isProfileImageModalOpen, setProfileImageModalOpen] = useState(false);
  const [isSearchModalOpen, setSearchModalOpen] = useState(false);
  const [isCalendarModalOpen, setCalendarModalOpen] = useState(false);
  const [isChangePasswordModalOpen, setChangePasswordModalOpen] = useState(false);
  const [isProblemReportModalOpen, setProblemReportModalOpen] = useState(false);
  const [isForgotPasswordModalOpen, setForgotPasswordModalOpen] = useState(false);
  const [isQrCodeModalOpen, setQrCodeModalOpen] = useState(false);
  const [isChatbotOpen, setChatbotOpen] = useState(false);
  const [showFooter, setShowFooter] = useState(true);
  const layoutContextValue = useMemo(() => ({ setShowFooter }), []);

  const [notifications, setNotifications] = useState<Notification[]>([]);
  const [unreadCount, setUnreadCount] = useState(0);
  const [justReceivedNotification, setJustReceivedNotification] = useState(false);
  const [inAppNotification, setInAppNotification] = useState<Notification | null>(null);
  const prevTotalNotificationsRef = useRef(0);

  const READ_NOTIFICATIONS_KEY = 'read_notification_ids';

  useEffect(() => {
    if (!isPwa) return; // Only for PWA users

    const unsubscribe = db.collection('pwa_notifications')
      .orderBy('timestamp', 'desc')
      .onSnapshot(snapshot => {
        const readIds = new Set(JSON.parse(localStorage.getItem(READ_NOTIFICATIONS_KEY) || '[]'));
        
        const newNotifications = snapshot.docs.map(doc => {
            const data = doc.data();
            return {
              id: doc.id,
              title: data.title || 'Notification',
              message: data.message,
              timestamp: data.timestamp ? data.timestamp.toDate().getTime() : Date.now(),
              read: readIds.has(doc.id),
              url: data.url,
              attachmentUrl: data.attachmentUrl
            };
        });
        
        const newUnreadCount = newNotifications.filter(n => !n.read).length;

        if ('setAppBadge' in navigator) {
            (navigator as any).setAppBadge(newUnreadCount).catch((error: any) => {
                console.error("Failed to set app badge:", error);
            });
        }
        
        if (newNotifications.length > prevTotalNotificationsRef.current && prevTotalNotificationsRef.current > 0) {
            const latestNotification = newNotifications[0];
            if (latestNotification && !latestNotification.read) {
                setJustReceivedNotification(true); // For bell animation
                setInAppNotification(latestNotification); // For toast
            }
        }

        setNotifications(newNotifications);
        setUnreadCount(newUnreadCount);
        prevTotalNotificationsRef.current = newNotifications.length;
      }, (error) => {
          console.error("Error listening to notifications:", error);
      });

    return () => unsubscribe();
  }, [isPwa]);

  const markAllAsRead = useCallback(() => {
    try {
        const allIds = notifications.map(n => n.id);
        localStorage.setItem(READ_NOTIFICATIONS_KEY, JSON.stringify(allIds));
        
        setNotifications(prev => prev.map(n => ({...n, read: true})));
        setUnreadCount(0);
        if ('clearAppBadge' in navigator) {
            (navigator as any).clearAppBadge().catch((error: any) => {
                console.error("Failed to clear app badge:", error);
            });
        }
    } catch (e) {
        console.error("Failed to mark notifications as read", e);
    }
  }, [notifications]);

  const clearAllNotifications = useCallback(() => {
      if (window.confirm("Are you sure you want to clear all notifications? This will mark them all as read.")) {
          markAllAsRead();
      }
  }, [markAllAsRead]);

  useEffect(() => {
    const redirectPath = sessionStorage.getItem('redirect');
    if (redirectPath && redirectPath !== location.pathname) {
      sessionStorage.removeItem('redirect');
      navigate(redirectPath, { replace: true });
    }
  }, [navigate, location.pathname]);

  useEffect(() => {
    window.scrollTo(0, 0);
  }, [location.pathname]);

  useEffect(() => {
    if (!loading && user) {
      const redirectInfoStr = sessionStorage.getItem('postLoginRedirect');
      if (redirectInfoStr) {
        sessionStorage.removeItem('postLoginRedirect');
        const redirectInfo = JSON.parse(redirectInfoStr);
        const pendingDataStr = sessionStorage.getItem('pendingInvoiceDataRedirect');
        if (pendingDataStr) {
          sessionStorage.removeItem('pendingInvoiceDataRedirect');
          navigate('/invoice-generator', { state: { restoredData: JSON.parse(pendingDataStr) }, replace: true });
        } else if (redirectInfo.from === 'pricing') {
          navigate('/payment', { state: { plan: redirectInfo.plan } });
        } else if (redirectInfo.from === 'developer') {
          navigate('/developer');
        } else if (redirectInfo.from === 'workflows_create') {
          navigate('/workflows/create');
        } else if (location.pathname === '/login' || location.pathname === '/signup') {
          navigate('/');
        }
      } else if (location.pathname === '/login' || location.pathname === '/signup') {
        navigate('/');
      }
    }
  }, [user, loading, navigate, location.pathname]);
  
  return (
    <LayoutContext.Provider value={layoutContextValue}>
      <MobileAuthGate onOpenForgotPasswordModal={() => setForgotPasswordModalOpen(true)}>
        <PullToRefresh>
            <div className="flex flex-col min-h-screen text-gray-800 dark:text-gray-200">
              <Header
                isPwa={isPwa}
                onOpenProfileImageModal={() => setProfileImageModalOpen(true)}
                onOpenSearchModal={() => setSearchModalOpen(true)}
                onOpenChangePasswordModal={() => setChangePasswordModalOpen(true)}
                onOpenQrCodeModal={() => setQrCodeModalOpen(true)}
                unreadCount={unreadCount}
                justReceivedNotification={justReceivedNotification}
                onNotificationAnimationEnd={() => setJustReceivedNotification(false)}
              />
              <main className="flex-grow">
                <Suspense fallback={<Preloader />}>
                  <Routes>
                    <Route path="/" element={isPwa ? <PwaHomePage /> : <HomePage />} />
                    <Route path="/tools" element={isPwa ? <PwaToolsPage /> : <Navigate to="/" />} />
                    <Route path="/articles" element={isPwa ? <PwaArticlesPage /> : <BlogPage />} />
                    <Route path="/settings" element={isPwa ? <PwaSettingsPage /> : <Navigate to="/" />} />
                    <Route path="/storage" element={isPwa ? <PwaStoragePage /> : <Navigate to="/" />} />
                    <Route path="/notifications" element={isPwa ? <NotificationsPage notifications={notifications} markAllAsRead={markAllAsRead} clearAll={clearAllNotifications} /> : <Navigate to="/" />} />

                    <Route path="/about" element={<AboutPage />} />
                    <Route path="/blog/:slug" element={<BlogPostPage />} />
                    <Route path="/blog" element={<BlogPage />} />
                    <Route path="/contact" element={<ContactPage />} />
                    <Route path="/login" element={<LoginPage onOpenForgotPasswordModal={() => setForgotPasswordModalOpen(true)} />} />
                    <Route path="/signup" element={<SignUpPage />} />
                    <Route path="/developer" element={<DeveloperPage />} />
                    <Route path="/faq" element={<FaqPage />} />
                    <Route path="/sitemap" element={<SitemapPage />} />
                    <Route path="/invoice-generator" element={<InvoiceGeneratorPage />} />
                    <Route path="/cv-generator" element={<CVGeneratorPage />} />
                    <Route path="/lesson-plan-creator" element={<LessonPlanCreatorPage />} />
                    <Route path="/ai-question-generator" element={<AIQuestionGeneratorPage />} />
                    <Route path="/image-generator" element={<ImageGeneratorPage />} />
                    <Route path="/pricing" element={<PricingPage />} />
                    <Route path="/api-pricing" element={<ApiPricingPage />} />
                    <Route path="/premium-feature" element={<PremiumFeaturePage />} />
                    <Route path="/payment" element={<PaymentPage />} />
                    <Route path="/developer-access" element={<DeveloperAccessPage />} />
                    <Route path="/how-to-use" element={<HowToUsePage />} />
                    <Route path="/education" element={<EducationPage />} />
                    <Route path="/business" element={<BusinessPage />} />
                    <Route path="/privacy-policy" element={<PrivacyPolicyPage />} />
                    <Route path="/terms-of-service" element={<TermsOfServicePage />} />
                    <Route path="/cookies-policy" element={<CookiesPolicyPage />} />
                    <Route path="/ceo" element={<CeoPage />} />
                    <Route path="/press" element={<PressPage />} />
                    <Route path="/user-data-deletion" element={<DataDeletionPage />} />
                    <Route path="/legal" element={<LegalPage />} />
                    <Route path="/security-policy" element={<SecurityPolicyPage />} />
                    <Route path="/features" element={<FeaturesPage />} />
                    
                    <Route path="/api-reference" element={<ApiReferencePage />} />
                    <Route path="/api-pdf" element={<ApiPdfPage />} />
                    <Route path="/api-image" element={<ApiImagePage />} />
                    <Route path="/api-signature" element={<ApiSignaturePage />} />

                    <Route element={<AdminProtectedRoute />}>
                        <Route path="/admin-dashboard" element={<AdminDashboardPage />} />
                    </Route>

                    <Route element={<UserProtectedRoute />}>
                        <Route element={<UserDashboardLayout />}>
                            <Route path="/account-settings" element={<AccountSettingsPage />} />
                            <Route path="/workflows" element={<WorkflowsPage />} />
                            <Route path="/security" element={<SecurityPage />} />
                            <Route path="/team" element={<TeamPage />} />
                            <Route path="/last-tasks" element={<LastTasksPage />} />
                            <Route path="/signatures-overview" element={<SignaturesOverviewPage />} />
                            <Route path="/sent" element={<SentPage />} />
                            <Route path="/inbox" element={<InboxPage />} />
                            <Route path="/signed" element={<SignedPage />} />
                            <Route path="/templates" element={<TemplatesPage />} />
                            <Route path="/contacts" element={<ContactsPage />} />
                            <Route path="/signature-settings" element={<SignatureSettingsPage />} />
                            <Route path="/plans-packages" element={<PlansAndPackagesPage />} />
                            <Route path="/business-details" element={<BusinessDetailsPage />} />
                            <Route path="/invoices" element={<InvoicesPage />} />
                             <Route path="/placeholder" element={<PlaceholderPage title="Placeholder" />} />
                        </Route>
                        <Route path="/workflows/create" element={<CreateWorkflowPage />} />
                    </Route>
                    
                    <Route path="/:toolId" element={<ToolPage />} />
                    <Route path="*" element={<NotFoundPage />} />
                  </Routes>
                </Suspense>
              </main>
              {inAppNotification && <InAppNotification notification={inAppNotification} onClose={() => setInAppNotification(null)} />}
              {!isPwa && showFooter && <Footer 
                onOpenCalendarModal={() => setCalendarModalOpen(true)}
                onOpenProblemReportModal={() => setProblemReportModalOpen(true)}
              />}
              
              <ProfileImageModal isOpen={isProfileImageModalOpen} onClose={() => setProfileImageModalOpen(false)} />
              <SearchModal isOpen={isSearchModalOpen} onClose={() => setSearchModalOpen(false)} />
              <CalendarModal isOpen={isCalendarModalOpen} onClose={() => setCalendarModalOpen(false)} />
              <ChangePasswordModal isOpen={isChangePasswordModalOpen} onClose={() => setChangePasswordModalOpen(false)} />
              <ProblemReportModal isOpen={isProblemReportModalOpen} onClose={() => setProblemReportModalOpen(false)} />
              <ForgotPasswordModal isOpen={isForgotPasswordModalOpen} onClose={() => setForgotPasswordModalOpen(false)} />
              <QrCodeModal isOpen={isQrCodeModalOpen} onClose={() => setQrCodeModalOpen(false)} />
              {!isPwa && <ScrollToTopButton />}
              <CookieConsentBanner />
              <PWAInstallPrompt />
              <PWAInstallInstructionsModal />
              <ChatbotWidget isOpen={isChatbotOpen} onClose={() => setChatbotOpen(false)} onOpen={() => setChatbotOpen(true)} showFab={true} isPwa={isPwa} />
              <WelcomeInstallModal />
              {isPwa && <PwaBottomNav />}
            </div>
        </PullToRefresh>
      </MobileAuthGate>
    </LayoutContext.Provider>
  );
}

function App() {
    return (
        <ThemeProvider>
            <AuthProvider>
                <PWAInstallProvider>
                    <I18nProvider>
                        <AppContent />
                    </I18nProvider>
                </PWAInstallProvider>
            </AuthProvider>
        </ThemeProvider>
    );
}

export default App;
