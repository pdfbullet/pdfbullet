import React, { lazy, Suspense, useState, useRef, useEffect, createContext, useMemo } from 'react';
import { Routes, Route, useLocation, Link, useNavigate } from 'react-router-dom';
import { ThemeProvider } from './contexts/ThemeContext.tsx';
import { AuthProvider, useAuth } from './contexts/AuthContext.tsx';
import { I18nProvider } from './contexts/I18nContext.tsx';
import { PWAInstallProvider } from './contexts/PWAInstallContext.tsx';
import { EmailIcon, CheckIcon, UserIcon, RefreshIcon, MicrophoneIcon, CopyIcon, GlobeIcon, CloseIcon } from './components/icons.tsx';
import { GoogleGenAI, Chat } from '@google/genai';
import { Logo } from './components/Logo.tsx';

// Components that are part of the main layout
// FIX: Changed the import of the Header component to a named import.
import { Header } from './components/Header.tsx';
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

// Create and export LayoutContext to manage shared layout state across components.
// This context will provide a way for pages like ToolPage to control parts of the main layout, such as the footer visibility.
export const LayoutContext = createContext<{
  setShowFooter: (show: boolean) => void;
}>({
  setShowFooter: () => {},
});


// Inlined component to fix import issue
const DataDeletionPage: React.FC = () => {
    React.useEffect(() => {
        document.title = "User Data Deletion | I Love PDFLY";
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
                            <li>Log in to your I Love PDFLY account.</li>
                            <li>Navigate to the <Link to="/user/account-settings" className="text-brand-red hover:underline">Account Settings</Link> page.</li>
                            <li>Scroll down to the "Danger Zone" section.</li>
                            <li>Click on "Delete My Account" and follow the on-screen instructions to confirm the deletion.</li>
                        </ol>

                        <h3 className="mt-6">Alternative Method</h3>
                        <p>If you are unable to access your account, you can request data deletion by sending an email to our support team with the subject line "Data Deletion Request".</p>
                        <p>
                            <strong>Email:</strong> <a href="mailto:Support@ilovepdfly.com" className="text-brand-red hover:underline">Support@ilovepdfly.com</a>
                        </p>
                        <p>Please include the username and email address associated with your account in your message.</p>

                        <h3>What Happens Next?</h3>
                        <p>
                            <strong>For self-service deletion:</strong> Your account and data will be permanently deleted immediately upon confirmation.
                        </p>
                        <p>
                            <strong>For email requests:</strong> Once we receive your request, our team will verify your identity and process the deletion. We will confirm with you via email once the process is complete, which typically takes up to 30 days.
                        </p>
                        
                        <h3>What Data is Deleted?</h3>
                        <p>The deletion process will remove:</p>
                        <ul>
                            <li>Your user account and profile information (username, email, profile picture, etc.).</li>
                            <li>Any content you have created or saved within your account.</li>
                            <li>Your API key and associated usage data.</li>
                        </ul>
                        <p>Please note that some anonymous, aggregated usage data that is not linked to your personal identity may be retained for analytical purposes.</p>

                        <p>If you have any questions about this process, please do not hesitate to contact us.</p>
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

// ===================================================================
// CHATBOT WIDGET COMPONENT
// ===================================================================
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

const MarkdownRenderer: React.FC<{ text: string; sources?: GroundingSource['web'][] }> = ({ text, sources }) => {
    const navigate = useNavigate();
    // A simple markdown parser for **bold** and links.
    const formattedText = text
        .replace(/\*\*(.*?)\*\*/g, '<strong>$1</strong>')
        .replace(/(\s|^)(\/[-a-zA-Z0-9_/?=&]+)/g, '$1<a href="$2" class="text-blue-500 hover:underline" data-internal-link="true">$2</a>');

    const handleClick = (e: React.MouseEvent<HTMLDivElement>) => {
        const target = e.target as HTMLElement;
        if (target.tagName === 'A' && target.dataset.internalLink === 'true') {
            e.preventDefault();
            const path = target.getAttribute('href');
            if (path) {
                navigate(path);
            }
        }
    };

    return (
        <div>
            <div style={{ whiteSpace: 'pre-wrap' }} dangerouslySetInnerHTML={{ __html: formattedText }} onClick={handleClick} />
            {sources && sources.length > 0 && (
                <div className="mt-3 pt-3 border-t border-gray-300 dark:border-gray-600">
                    <h4 className="text-xs font-bold text-gray-500 dark:text-gray-400 flex items-center gap-1.5 mb-1"><GlobeIcon className="h-3.5 w-3.5"/> Sources</h4>
                    <div className="flex flex-col gap-1.5">
                        {sources.map((source, i) => (
                            <a href={source.uri} target="_blank" rel="noopener noreferrer" key={i} className="text-xs text-blue-600 dark:text-blue-400 bg-blue-50 dark:bg-blue-900/30 p-2 rounded-md hover:underline truncate block" title={source.uri}>
                                {i + 1}. {source.title || source.uri}
                            </a>
                        ))}
                    </div>
                </div>
            )}
        </div>
    );
};

const faqs = [
    { q: "How do I merge PDF files?", icon: "📄" },
    { q: "Can I edit text in a PDF?", icon: "✏️" },
    { q: "Is this service secure?", icon: "🔒" },
    { q: "What are the premium features?", icon: "⭐" },
];

const ChatbotWidget: React.FC = () => {
    const [isOpen, setIsOpen] = useState(false);
    const [conversationStarted, setConversationStarted] = useState(false);
    const [messages, setMessages] = useState<ChatMessage[]>(() => {
        try {
            const savedMessages = localStorage.getItem('chatHistory');
            if (savedMessages) {
                return JSON.parse(savedMessages);
            }
        } catch (e) { console.error("Failed to load chat history", e); }
        return [{ role: 'model', text: 'Hi 👋 I’m your support assistant. How can I help you today?' }];
    });
    const [inputValue, setInputValue] = useState('');
    const [isLoading, setIsLoading] = useState(false);
    const [error, setError] = useState('');
    const [chat, setChat] = useState<Chat | null>(null);
    const [useGoogleSearch, setUseGoogleSearch] = useState(false);
    const [isListening, setIsListening] = useState(false);
    const [copiedTooltip, setCopiedTooltip] = useState<string | null>(null);
    const chatContainerRef = useRef<HTMLDivElement>(null);
    const recognitionRef = useRef<any>(null);

    useEffect(() => {
        const hasOpened = sessionStorage.getItem('chatWidgetAutoOpened');
        if (!hasOpened && !isOpen) {
            const timer = setTimeout(() => {
                setIsOpen(true);
                sessionStorage.setItem('chatWidgetAutoOpened', 'true');
            }, 3000);
            return () => clearTimeout(timer);
        }
    }, [isOpen]);

    useEffect(() => {
        try {
            localStorage.setItem('chatHistory', JSON.stringify(messages));
        } catch (e) { console.error("Failed to save chat history", e); }
    }, [messages]);
    
    const initializeChat = () => {
        try {
            const apiKey = process.env.API_KEY;
            if (!apiKey) { throw new Error("API key is not configured."); }
            const ai = new GoogleGenAI({ apiKey });
            const chatSession = ai.chats.create({
                model: 'gemini-2.5-flash',
                config: {
                    systemInstruction: `You are an expert, friendly, and helpful customer support assistant for a website called 'iLovePDFLY'. Your name is Bishal, and you represent the company. Your goal is to provide accurate information, guide users on how to use the site, and answer frequently asked questions.

**Your Identity:**
- **Your Persona:** You are Bishal, the founder. Be confident, knowledgeable, and professional, yet approachable and friendly. Use emojis to add a warm touch where appropriate. ✨
- **Your Creator:** You were created by the development team at iLovePDFLY, led by founder and CEO, **Bishal Mishra**. When asked about yourself, you can embody this persona.

**Key Information about iLovePDFLY:**
- **Website:** The official website is ilovepdfly.com.
- **Mission:** To provide a comprehensive online toolkit for PDF and image management that is FREE, fast, secure, and private.
- **Privacy:** A key feature is client-side processing. Files are processed in the user's browser, ensuring they are 100% private. This is a major selling point.
- **Tools:** The site offers a wide range of tools for PDFs (Merge, Split, Compress, Convert, Edit, Sign, Watermark, etc.) and Images (Background Remover, Resize, Crop). There are also AI tools like an Invoice Generator, CV Generator, and Lesson Plan Creator.
- **Premium Features:** While most tools are free, some advanced features (like higher limits, OCR in PDF to Word, batch processing, no ads, team features) require a Premium subscription.

**Contact Information & Support Tiers:**
- **General User Support:** For general questions, help with tools, or feedback, direct users to the main support channels. The primary support email is **Support@ilovepdfly.com**. Human support is available via WhatsApp.
- **Developer & Admin Contact:** If a user specifically asks for developer, founder, or admin contact information, you MUST provide the following details:
  - **Email:** admin@ilovepdfly.com
  - **Phone:** +9779827801575
- **Do not** provide the developer/admin contact for general inquiries. Only when explicitly asked.

**Interaction Guidelines:**
- **Answering FAQs:** Users may click pre-defined FAQ buttons. Answer these questions directly and helpfully. For example, if asked "How to merge PDFs?", explain the simple steps: go to the Merge PDF tool, upload files, reorder them, and click the merge button.
- **Providing Links:** Always provide relative links (e.g., /about, /pricing, /merge-pdf) when a user asks for a specific page or tool. Do not say you cannot provide links. Format links simply as text paths, for example: "You can find our pricing details on our pricing page: /pricing".
- **Formatting:** Use Markdown for emphasis. Use double asterisks for bolding: \`**this is bold**\`. This is important for highlighting tool names, key features, or links. Keep paragraphs short.
- **Exclusivity:** You are an assistant for **iLovePDFLY** only. If asked about competitors (like 'iLovePDF'), politely clarify that you only have information about iLovePDFLY and its unique features, like its strong focus on privacy.`,
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
        if (isOpen && !chat) {
            initializeChat();
        }
    }, [isOpen, chat]);

    useEffect(() => {
        if (typeof window !== 'undefined' && ('SpeechRecognition' in window || 'webkitSpeechRecognition' in window)) {
            const SpeechRecognition = window.SpeechRecognition || window.webkitSpeechRecognition;
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
    }, [messages, isLoading]);

    const handleSendMessage = async (messageText?: string) => {
        const textToSend = (messageText || inputValue).trim();
        if (!textToSend || isLoading) return;
        
        setConversationStarted(true);
        const userMessage: ChatMessage = { role: 'user', text: textToSend };
        setMessages(prev => [...prev, userMessage]);
        setInputValue('');
        setIsLoading(true);
        setError('');

        try {
            const apiKey = process.env.API_KEY;
            if (!apiKey) throw new Error("API key is not configured.");
            const ai = new GoogleGenAI({ apiKey });

            if (useGoogleSearch) {
                 const response = await ai.models.generateContent({
                   model: "gemini-2.5-flash",
                   contents: textToSend,
                   config: { tools: [{googleSearch: {}}] },
                 });
                 const groundingChunks = response.candidates?.[0]?.groundingMetadata?.groundingChunks;
                 const sources: GroundingSource['web'][] = groundingChunks?.map(c => c.web).filter((w): w is GroundingSource['web'] => !!w?.uri) || [];
                 setMessages(prev => [...prev, { role: 'model', text: response.text, sources: sources.length > 0 ? sources : undefined }]);
            } else {
                let currentChat = chat;
                if (!currentChat) {
                    currentChat = initializeChat();
                    if (!currentChat) throw new Error("Chat could not be re-initialized.");
                }
                const stream = await currentChat.sendMessageStream({ message: textToSend });
                let streamedText = '';
                setMessages(prev => [...prev, { role: 'model', text: '' }]);
                for await (const chunk of stream) {
                    streamedText += chunk.text;
                    setMessages(prev => {
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
            setMessages(prev => [...prev, { role: 'model', text: errorMessage }]);
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
        setMessages([{ role: 'model', text: 'New chat started. How can I help you?' }]);
        setConversationStarted(false);
        setError('');
        initializeChat();
    };

    const handleCopyText = (text: string, id: string) => {
        navigator.clipboard.writeText(text);
        setCopiedTooltip(id);
        setTimeout(() => setCopiedTooltip(null), 2000);
    };

    return (
        <div className="fixed bottom-4 left-4 z-[99] pointer-events-none">
            <div className={`transition-all duration-300 ease-in-out ${isOpen ? 'opacity-100 translate-y-0 pointer-events-auto' : 'opacity-0 translate-y-4 pointer-events-none'}`}>
                <div className="w-full max-w-[calc(100vw-2rem)] sm:w-80 h-[60vh] max-h-[480px] sm:max-h-[500px] bg-white dark:bg-black rounded-2xl shadow-2xl flex flex-col border border-gray-200 dark:border-gray-800">
                    <div className="flex-shrink-0 p-4 flex justify-between items-center bg-gradient-to-r from-red-600 to-orange-500 rounded-t-2xl">
                        <p className="font-bold text-white">iLovePDFly Support</p>
                        <div className="flex items-center gap-2">
                            <button onClick={handleNewChat} className="text-white/70 hover:text-white" aria-label="Start new chat" title="Start new chat"><RefreshIcon className="h-5 w-5" /></button>
                            <button onClick={() => setIsOpen(false)} className="text-white/70 hover:text-white" aria-label="Close chat widget" title="Close chat widget"><CloseIcon className="h-6 w-6" /></button>
                        </div>
                    </div>
                    <div ref={chatContainerRef} className="flex-grow p-4 overflow-y-auto space-y-4">
                        {messages.map((msg, index) => (
                            <div key={index} className={`flex items-end gap-2.5 ${msg.role === 'user' ? 'justify-end' : 'justify-start'}`}>
                                {msg.role === 'model' && <img src="https://ik.imagekit.io/fonepay/bishal%20mishra%20ceo%20of%20ilovepdfly.jpg?updatedAt=1753167712490" alt="Support" className="w-8 h-8 rounded-full object-cover flex-shrink-0 border-2 border-white shadow-md" />}
                                <div className={`max-w-[80%] p-3 rounded-2xl text-sm relative group ${msg.role === 'user' ? 'bg-blue-500 text-white rounded-br-none' : 'bg-gray-200 dark:bg-gray-700 text-gray-800 dark:text-gray-200 rounded-bl-none'}`}>
                                    <MarkdownRenderer text={msg.text} sources={msg.sources} />
                                </div>
                                {msg.role === 'model' && (
                                    <div className="relative self-center">
                                        <button onClick={() => handleCopyText(msg.text, `chat-${index}`)} className="opacity-0 group-hover:opacity-100 text-gray-400 hover:text-brand-red transition-all duration-200" aria-label="Copy message">
                                            <CopyIcon className="h-4 w-4" />
                                        </button>
                                        {copiedTooltip === `chat-${index}` && (<span className="absolute -top-8 left-1/2 -translate-x-1/2 text-xs bg-black text-white px-2 py-1 rounded shadow-lg z-10">Copied!</span>)}
                                    </div>
                                )}
                            </div>
                        ))}
                        {isLoading && (
                             <div className="flex items-end gap-2.5 justify-start">
                                <img src="https://ik.imagekit.io/fonepay/bishal%20mishra%20ceo%20of%20ilovepdfly.jpg?updatedAt=1753167712490" alt="Support" className="w-8 h-8 rounded-full object-cover flex-shrink-0 border-2 border-white shadow-md" />
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
                </div>
            </div>
            <button onClick={() => setIsOpen(true)} className={`relative transition-all duration-300 ease-in-out bg-brand-red text-white w-12 h-12 rounded-full shadow-lg flex items-center justify-center transform hover:scale-110 pointer-events-auto ${!isOpen ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-4 pointer-events-none'}`} aria-label="Open chat support" title="Open chat support">
                <span className="absolute inline-flex h-full w-full rounded-full bg-brand-red opacity-75 animate-ping-slow"></span>
                <ChatbotIcon className="h-6 w-6 relative" />
            </button>
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
const AIImageGeneratorPage = lazy(() => import('./pages/ImageGeneratorPage.tsx'));
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
const UserDashboardLayout = lazy(() => import('./components/UserDashboardLayout.tsx'));
const LegalPage = lazy(() => import('./pages/LegalPage.tsx'));
const SecurityPolicyPage = lazy(() => import('./pages/SecurityPolicyPage.tsx'));
const FeaturesPage = lazy(() => import('./pages/FeaturesPage.tsx'));

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

function AppContent() {
  const location = useLocation();
  const navigate = useNavigate();
  const { user, loading } = useAuth();
  const [isProfileImageModalOpen, setProfileImageModalOpen] = useState(false);
  const [isSearchModalOpen, setSearchModalOpen] = useState(false);
  const [isCalendarModalOpen, setCalendarModalOpen] = useState(false);
  const [isChangePasswordModalOpen, setChangePasswordModalOpen] = useState(false);
  const [isProblemReportModalOpen, setProblemReportModalOpen] = useState(false);
  const [isForgotPasswordModalOpen, setForgotPasswordModalOpen] = useState(false);
  const [isQrCodeModalOpen, setQrCodeModalOpen] = useState(false);
  const [showFooter, setShowFooter] = useState(true);
  const layoutContextValue = useMemo(() => ({ setShowFooter }), []);


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
  
  useEffect(() => {
    const handleVisibilityChange = () => {
      // Add a class to hide content when the tab is not active
      // This is a deterrent against screen recording.
      if (document.hidden) {
        document.body.classList.add('screen-hidden');
      } else {
        document.body.classList.remove('screen-hidden');
      }
    };

    document.addEventListener('visibilitychange', handleVisibilityChange);

    return () => {
      document.removeEventListener('visibilitychange', handleVisibilityChange);
    };
  }, []);

  return (
    <LayoutContext.Provider value={layoutContextValue}>
      <MobileAuthGate onOpenForgotPasswordModal={() => setForgotPasswordModalOpen(true)}>
        <div className="flex flex-col min-h-screen text-gray-800 dark:text-gray-200">
          <Header
            onOpenProfileImageModal={() => setProfileImageModalOpen(true)}
            onOpenSearchModal={() => setSearchModalOpen(true)}
            onOpenChangePasswordModal={() => setChangePasswordModalOpen(true)}
            onOpenQrCodeModal={() => setQrCodeModalOpen(true)}
          />
          <main className="flex-grow">
            <Suspense fallback={<div className="w-full py-20" />}>
              <Routes>
                <Route path="/" element={<HomePage />} />
                <Route path="/about" element={<AboutPage />} />
                <Route path="/blog" element={<BlogPage />} />
                <Route path="/blog/:slug" element={<BlogPostPage />} />
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
                <Route path="/ai-image-generator" element={<AIImageGeneratorPage />} />
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
                
                {/* API Routes */}
                <Route path="/api-reference" element={<ApiReferencePage />} />
                <Route path="/api-pdf" element={<ApiPdfPage />} />
                <Route path="/api-image" element={<ApiImagePage />} />
                <Route path="/api-signature" element={<ApiSignaturePage />} />

                {/* Admin Routes */}
                <Route element={<AdminProtectedRoute />}>
                    <Route path="/admin-dashboard" element={<AdminDashboardPage />} />
                </Route>

                {/* User Protected Routes with Dashboard Layout */}
                <Route element={<UserProtectedRoute />}>
                    <Route element={<UserDashboardLayout />}>
                        <Route path="/account-settings" element={<AccountSettingsPage />} />
                        <Route path="/workflows" element={<WorkflowsPage />} />
                        <Route path="/workflows/create" element={<CreateWorkflowPage />} />
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
                    </Route>
                </Route>
                
                {/* ToolPage should be last to catch dynamic tool IDs */}
                <Route path="/:toolId" element={<ToolPage />} />
              </Routes>
            </Suspense>
          </main>
          {showFooter && <Footer 
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
          <ScrollToTopButton />
          <CookieConsentBanner />
          <PWAInstallPrompt />
          <PWAInstallInstructionsModal />
          <ChatbotWidget />
        </div>
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
