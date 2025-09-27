import React, { useState, useEffect, useMemo, useRef, memo } from 'react';
import { Link, useLocation, useNavigate } from 'react-router-dom';
import { TOOLS, blogPosts } from '../constants.ts';
import ToolCard from '../components/ToolCard.tsx';
import { Tool } from '../types.ts';
import { 
    ProtectIcon, RefreshIcon, ShoppingBagIcon, EditIcon, DownloadIcon,
    StarIcon, OcrPdfIcon, UploadCloudIcon,
    UsersIcon, ChartBarIcon, HeartbeatIcon, LockIcon, QuestionMarkIcon,
    IOSIcon, AndroidIcon, MacOSIcon, WindowsIcon, GlobeIcon, PlusIcon, RightArrowIcon,
    WorkflowPathIcon
} from '../components/icons.tsx';
import { useFavorites } from '../hooks/useFavorites.ts';
import { useAuth } from '../contexts/AuthContext.tsx';
import { useWorkflows } from '../hooks/useWorkflows.ts';
import { useI18n } from '../contexts/I18nContext.tsx';

const useIsVisible = (ref: React.RefObject<HTMLElement>) => {
    const [isIntersecting, setIntersecting] = useState(false);
    useEffect(() => {
        const observer = new IntersectionObserver(([entry]) => {
            if (entry.isIntersecting) {
                setIntersecting(true);
                observer.unobserve(entry.target);
            }
        }, { threshold: 0.1 });
        const currentRef = ref.current;
        if (currentRef) {
            observer.observe(currentRef);
        }
        return () => {
            if (currentRef) {
                observer.unobserve(currentRef);
            }
        };
    }, [ref]);
    return isIntersecting;
};

const HomeFaqItem: React.FC<{
    item: { q: string, a: string },
    isOpen: boolean,
    toggle: () => void,
}> = ({ item, isOpen, toggle }) => (
    <div className="border-t border-gray-200 dark:border-gray-700 first:border-t-0">
        <button onClick={toggle} title={isOpen ? 'Collapse answer' : 'Expand answer'} className="w-full flex justify-between items-center text-left py-4 focus:outline-none">
            <span className="text-base font-semibold text-gray-800 dark:text-gray-100">{item.q}</span>
            <span className={`transform transition-transform duration-300 ${isOpen ? 'rotate-180' : ''}`}>
                <svg className="w-5 h-5 text-gray-500" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M19 9l-7 7-7-7" /></svg>
            </span>
        </button>
        <div className={`overflow-hidden transition-all duration-300 ease-in-out ${isOpen ? 'max-h-96 pb-4' : 'max-h-0'}`}>
            <p className="text-gray-600 dark:text-gray-400 leading-relaxed pr-4">{item.a}</p>
        </div>
    </div>
);

const PremiumIllustration = memo(() => (
    <div className="relative w-full h-full">
        <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-full h-full">
            {/* Document 1 */}
            <div className="absolute top-[20%] left-[25%] w-40 h-52 bg-white dark:bg-gray-800 rounded-lg shadow-lg -rotate-12 transform-gpu transition-transform duration-500 hover:rotate-0 hover:scale-105">
                <div className="p-3">
                    <div className="w-1/3 h-2 bg-red-400 rounded-sm mb-2"></div>
                    <div className="w-full h-1.5 bg-gray-200 dark:bg-gray-600 rounded-sm mb-1"></div>
                    <div className="w-full h-1.5 bg-gray-200 dark:bg-gray-600 rounded-sm mb-1"></div>
                    <div className="w-3/4 h-1.5 bg-gray-200 dark:bg-gray-600 rounded-sm"></div>
                </div>
            </div>
             {/* Document 2 */}
            <div className="absolute top-[30%] left-[45%] w-40 h-52 bg-white dark:bg-gray-800 rounded-lg shadow-xl rotate-6 transform-gpu transition-transform duration-500 hover:rotate-0 hover:scale-105">
                <div className="p-3">
                    <div className="w-1/3 h-2 bg-blue-400 rounded-sm mb-2"></div>
                    <div className="w-full h-1.5 bg-gray-200 dark:bg-gray-600 rounded-sm mb-1"></div>
                    <div className="w-5/6 h-1.5 bg-gray-200 dark:bg-gray-600 rounded-sm"></div>
                </div>
            </div>
            {/* Path */}
            <svg viewBox="0 0 200 100" className="absolute top-[20%] left-[20%] w-full h-full" style={{filter: 'drop-shadow(0 2px 4px rgba(0,0,0,0.1))'}}>
                <path d="M 50 70 Q 100 -20 150 70" stroke="#4299E1" fill="none" strokeWidth="4" strokeLinecap="round"/>
            </svg>
            {/* Floating Icons */}
            <div className="absolute top-[15%] left-[60%] p-2 bg-white dark:bg-gray-700 rounded-full shadow-md animate-float-1">
                <OcrPdfIcon className="h-5 w-5 text-teal-500" />
            </div>
            <div className="absolute top-[70%] left-[15%] p-2 bg-white dark:bg-gray-700 rounded-full shadow-md animate-float-2">
                <ShoppingBagIcon className="h-5 w-5 text-brand-red" />
            </div>
        </div>
    </div>
));

const StatCard: React.FC<{ icon: React.FC<any>, value: number, label: string, suffix?: string }> = ({ icon: Icon, value, label, suffix }) => {
    const [count, setCount] = useState(0);
    const cardRef = React.useRef<HTMLDivElement>(null);
    const [hasAnimated, setHasAnimated] = useState(false);

    useEffect(() => {
        const currentRef = cardRef.current;
        if (!currentRef || hasAnimated) return;

        const observer = new IntersectionObserver(
            (entries) => {
                if (entries[0].isIntersecting) {
                    setHasAnimated(true); // Ensure it only runs once
                    
                    let start = 0;
                    const duration = 2000;
                    const end = value;
                    if (start === end) {
                        setCount(end);
                        return;
                    }
                    
                    let startTimestamp: number | null = null;
                    const step = (timestamp: number) => {
                        if (!startTimestamp) startTimestamp = timestamp;
                        const progress = Math.min((timestamp - startTimestamp) / duration, 1);
                        setCount(Math.floor(progress * end));
                        if (progress < 1) {
                            window.requestAnimationFrame(step);
                        } else {
                            setCount(end);
                        }
                    };
                    window.requestAnimationFrame(step);
                    
                    observer.unobserve(currentRef);
                }
            },
            { threshold: 0.5 } // Trigger when 50% is visible
        );

        observer.observe(currentRef);

        return () => {
            if (currentRef) {
                observer.unobserve(currentRef);
            }
        };
    }, [value, hasAnimated]);

    return (
        <div className="bg-white dark:bg-surface-dark p-6 rounded-xl shadow-lg text-center border border-transparent dark:border-gray-800" ref={cardRef}>
            <Icon className="h-10 w-10 mx-auto text-brand-red mb-3" />
            <p className="text-4xl font-extrabold text-gray-800 dark:text-gray-100">{count.toLocaleString()}{suffix}</p>
            <p className="text-gray-500 dark:text-gray-400 mt-1">{label}</p>
        </div>
    );
};

const AdvantageSection = memo(() => {
    const sectionRef = useRef<HTMLElement>(null);
    const isVisible = useIsVisible(sectionRef);

    const advantages = [
        {
            icon: LockIcon,
            title: 'Secure & Private',
            description: 'Your files are processed client-side. Nothing is ever uploaded, guaranteeing 100% privacy.'
        },
        {
            icon: RefreshIcon,
            title: 'Blazing Fast',
            description: "Because all processing happens in your browser, there are no upload or download delays. Get results instantly."
        },
        {
            icon: ShoppingBagIcon,
            title: 'Completely Free',
            description: "All our core tools are free to use, without limits. No hidden fees, no sign-up required for most features."
        }
    ];

    return (
        <section ref={sectionRef} className={`py-20 bg-white dark:bg-black scroll-animate ${isVisible ? 'visible' : ''}`}>
            <div className="container max-w-screen-2xl mx-auto px-6">
                <div className="max-w-4xl mx-auto text-center">
                    <h2 className="text-4xl font-extrabold text-gray-900 dark:text-gray-50">The PDFBullet Advantage</h2>
                    <p className="mt-3 text-lg text-gray-600 dark:text-gray-400">Secure, fast, and easy-to-use tools, right in your browser.</p>
                </div>
                <div className="max-w-7xl mx-auto mt-16 grid grid-cols-1 md:grid-cols-3 gap-8">
                    {advantages.map((adv, index) => (
                        <div key={index} className="bg-gray-50 dark:bg-surface-dark p-8 rounded-2xl shadow-lg border border-gray-200 dark:border-gray-800 text-center transform hover:-translate-y-2 transition-transform duration-300">
                            <div className="inline-flex items-center justify-center h-16 w-16 rounded-full bg-brand-red/10 mb-6">
                                <adv.icon className="h-8 w-8 text-brand-red" />
                            </div>
                            <h3 className="text-xl font-bold text-gray-900 dark:text-gray-100">{adv.title}</h3>
                            <p className="mt-2 text-gray-600 dark:text-gray-400">{adv.description}</p>
                        </div>
                    ))}
                </div>
            </div>
        </section>
    );
});


const EcosystemSection = memo(() => {
    const sectionRef = useRef<HTMLElement>(null);
    const isVisible = useIsVisible(sectionRef);
    
    const solutions = [
        { title: 'PDFBullet Desktop', description: 'Download the', linkText: 'PDFBullet Desktop App', descriptionAfter: 'to work with your favorite PDF tools on your Mac or Windows PC. Get a lightweight PDF app that helps you process heavy PDF tasks offline in seconds.' },
        { title: 'PDFBullet Mobile', description: 'Get the', linkText: 'PDFBullet Mobile App', descriptionAfter: 'to manage documents remotely or on the move. Turn your Android or iPhone device into a PDF Editor & Scanner to annotate, sign, and share documents with ease.' },
        { title: 'iLoveIMG', description: '', linkText: 'iLoveIMG', descriptionAfter: 'is the web app that helps you modify images in bulk for free. Crop, resize, compress, convert, and more. All the tools you need to enhance your images in just a few clicks.' },
    ];
    
    const platforms = [
        { name: 'iOS', icon: IOSIcon },
        { name: 'Android', icon: AndroidIcon },
        { name: 'MacOS', icon: MacOSIcon },
        { name: 'Windows', icon: WindowsIcon },
        { name: 'Web', icon: GlobeIcon }
    ];

    return (
        <section ref={sectionRef} className={`py-20 scroll-animate ${isVisible ? 'visible' : ''}`}>
            <div className="container max-w-screen-2xl mx-auto px-6">
                <div className="max-w-4xl mx-auto text-center">
                    <h2 className="text-4xl font-extrabold text-gray-900 dark:text-gray-50 flex items-center justify-center gap-4">
                        <span>Our Ecosystem: Beyond the Browser</span>
                    </h2>
                    <p className="mt-3 text-lg text-gray-600 dark:text-gray-400">Manage your documents seamlessly across all your devices.</p>
                </div>
                <div className="max-w-7xl mx-auto mt-12 grid grid-cols-1 md:grid-cols-3 gap-12">
                    {solutions.map((solution, index) => (
                         <div key={index} className="text-center p-8">
                            <h3 className="text-xl font-bold text-gray-900 dark:text-gray-100">{solution.title}</h3>
                            <p className="mt-2 text-gray-600 dark:text-gray-400">
                                {solution.description}{' '}
                                <a href="#" className="text-brand-red hover:underline font-semibold">{solution.linkText}</a>{' '}
                                {solution.descriptionAfter}
                            </p>
                        </div>
                    ))}
                </div>
                 <div className="mt-12 flex flex-wrap justify-center items-center gap-x-20 md:gap-x-32">
                    {platforms.map(platform => (
                        <div key={platform.name} className="flex flex-col items-center gap-2 text-gray-700 dark:text-gray-300">
                            <platform.icon className="h-16 w-16" />
                            <span className="font-semibold text-lg">{platform.name}</span>
                        </div>
                    ))}
                </div>
            </div>
        </section>
    );
});


const HomePage: React.FC = () => {
    const [openFaq, setOpenFaq] = useState<number | null>(0);
    const [activeCategory, setActiveCategory] = useState<string>('All');
    
    const { favorites, isFavorite, toggleFavorite } = useFavorites();
    const { user } = useAuth();
    const navigate = useNavigate();
    const { workflows } = useWorkflows();
    const toolsByTitle = useMemo(() => new Map(TOOLS.map(t => [t.title, t])), []);
    const { t } = useI18n();
    
    const favoriteTools = useMemo(() => TOOLS.filter(tool => isFavorite(tool.id)), [isFavorite]);
    const otherTools = useMemo(() => TOOLS.filter(tool => !isFavorite(tool.id)), [isFavorite]);
    
    const imageToolIds = useMemo(() => new Set(TOOLS.filter(t => t.api?.category === 'image' || ['jpg-to-pdf', 'psd-to-pdf', 'pdf-to-jpg', 'pdf-to-png', 'scan-to-pdf'].includes(t.id)).map(t => t.id)), []);

    const filterCategories = [
        { labelKey: 'homepage.filter_all', category: 'All' },
        { labelKey: 'homepage.filter_workflows', category: 'workflows' },
        { labelKey: 'homepage.filter_organize', category: 'organize' },
        { labelKey: 'homepage.filter_optimize', category: 'optimize' },
        { labelKey: 'homepage.filter_convert', category: 'convert' },
        { labelKey: 'homepage.filter_edit', category: 'edit' },
        { labelKey: 'homepage.filter_security', category: 'security' },
        { labelKey: 'image Tools', category: 'image' },
    ];

    const handleWorkflowClick = () => {
        if (!user) {
            navigate('/login', { state: { from: 'workflows_create' } });
        } else {
            navigate('/workflows/create');
        }
    };
    
    const handleCategoryClick = (category: string) => {
      setActiveCategory(category);
    };

    const filteredTools = useMemo(() => {
        const allTools = [...favoriteTools, ...otherTools];
        if (activeCategory === 'All') return allTools;
        if (activeCategory === 'workflows') return [];
        if (activeCategory === 'image') {
            return allTools.filter(tool => imageToolIds.has(tool.id));
        }
        if (activeCategory === 'convert') {
             return allTools.filter(tool => (tool.category === 'convert-to' || tool.category === 'convert-from'));
        }
        return allTools.filter(tool => tool.category === activeCategory);
    }, [activeCategory, favoriteTools, otherTools, imageToolIds]);

    const toggleFaq = (index: number) => {
        setOpenFaq(openFaq === index ? null : index);
    };

    const location = useLocation();
    useEffect(() => {
        if (location.hash) {
            const id = location.hash.substring(1);
            const element = document.getElementById(id);
            if (element) {
                element.scrollIntoView({ behavior: 'smooth' });
            }
        }
    }, [location]);
    
    const steps = [
        {
            icon: UploadCloudIcon,
            title: 'Select Files',
            description: 'Choose your documents from your device or drag and drop them.',
        },
        {
            icon: EditIcon,
            title: 'Process & Customize',
            description: 'Adjust settings, merge, rotate, or apply changes as you need.',
        },
        {
            icon: DownloadIcon,
            title: 'Download',
            description: 'Your processed file is ready for download instantly.',
        },
    ];

    const testimonials = [
      { name: 'Bishal Mishra', role: 'Founder & CEO, PDFBullet', text: 'The entire suite of tools is impressive. From converting JPGs to PDF for our campaigns to compressing large reports for clients, PDFBullet handles everything flawlessly. The client-side processing gives me peace of mind about data security.', image: 'https://i.ibb.co/RpStGhqm/IMG-5251-Original.jpg' },
      { name: 'Anam Mishra', role: 'Project Manager', text: 'Organizing and merging project documents from different teams used to be a nightmare. With PDFBullet, I can do it in minutes. The Organize PDF tool is particularly brilliant for reordering pages exactly how I need them.', image: 'https://i.ibb.co/nq8D2rCh/IMG-0293.png' },
      { name: 'Prashant Mishra', role: 'Student', text: 'I recommend PDFBullet to all my students. It’s an essential tool for organizing research papers and compressing presentations.The fact that it\'s free is incredible', image: 'https://i.ibb.co/JWCp96YL/IMG-0292.png' },
      { name: 'Michael Chen', role: 'Small Business Owner', text: 'Protecting confidential client proposals with a password is a critical step for my business. PDFBullet makes it incredibly simple and secure. Highly recommended!', image: 'https://i.pravatar.cc/150?u=michael' },
      { name: 'David Miller', role: 'Freelance Designer', text: 'The client-side processing is a game-changer for me. I can handle sensitive client files with confidence, knowing nothing is uploaded. The speed is just a fantastic bonus!', image: 'https://i.pravatar.cc/150?u=david' },
      { name: 'Emily Carter', role: 'University Professor', text: 'I recommend PDFBullet to all my students. It’s an essential tool for organizing research papers and compressing presentations. The fact that it\'s free is incredible.', image: 'https://i.pravatar.cc/150?u=emily' },
    ];
    
    const faqs = [
        { q: "Is PDFBullet completely free?", a: "Yes! Most of our tools are 100% free for standard use. We offer Premium plans for users who need advanced features like unlimited processing, larger file sizes, and an ad-free experience." },
        { q: "Are my files secure?", a: "Absolutely. Security is our top priority. For most tools, your files are processed entirely in your browser, meaning they never leave your computer. For tasks requiring server-side processing, we use end-to-end encryption and delete all files automatically within 2 hours. This guarantees that your privacy is always respected." },
        { q: "Do I need to install any software?", a: "No, you don't need to install anything. PDFBullet works directly in your web browser. This means you can access our tools from any device with an internet connection, anywhere in the world." },
    ];

    useEffect(() => {
        const faqSchema = {
            "@context": "https://schema.org",
            "@type": "FAQPage",
            "mainEntity": faqs.map(faq => ({
                "@type": "Question",
                "name": faq.q,
                "acceptedAnswer": {
                    "@type": "Answer",
                    "text": faq.a
                }
            }))
        };
        
        const scriptId = 'faq';
        let script = document.getElementById(scriptId) as HTMLScriptElement | null;
        if (!script) {
            script = document.createElement('script');
            script.id = scriptId;
            script.type = 'application/ld+json';
            document.head.appendChild(script);
        }
        script.textContent = JSON.stringify(faqSchema);
    
        return () => {
            const scriptToRemove = document.getElementById(scriptId);
            if (scriptToRemove) {
                scriptToRemove.remove();
            }
        };
    }, [faqs]);

    const stats = [
        { icon: UsersIcon, value: 250000, label: "Happy Users", suffix: "+" },
        { icon: ChartBarIcon, value: 300000, label: "Documents Processed", suffix: "+" },
        { icon: HeartbeatIcon, value: 99.9, label: "Uptime", suffix: "%" },
        { icon: LockIcon, value: 100, label: "Private & Secure", suffix: "%" },
    ];

  return (
    <div className="overflow-x-hidden">
        {/* Hero Section */}
        <section className={`relative text-center overflow-hidden hero-background transition-all duration-300 ${user ? 'py-4' : 'pt-4 pb-2 md:pt-6 md:pb-2'}`}>
            <div className="container max-w-screen-2xl mx-auto px-6 relative z-10">
                {user ? (
                    <h1 className="text-4xl md:text-5xl font-extrabold text-gray-900 dark:text-gray-50">
                        Hi {user.username}, let's get started
                    </h1>
                ) : (
                    <>
                        <h1 className="text-4xl md:text-5xl font-extrabold text-gray-900 dark:text-gray-50">
                            {t('homepage.hero_title')}
                        </h1>
                        <p className="mt-4 max-w-3xl mx-auto text-base sm:text-lg text-gray-600 dark:text-gray-400">
                            {t('homepage.hero_subtitle')}
                        </p>
                    </>
                )}
                <div className={`w-full ${user ? 'mt-2' : 'mt-8'}`}>
                    <div className="pb-2">
                        <div className="flex flex-wrap items-center justify-center gap-3">
                            {filterCategories.map(({ labelKey, category }) => (
                                <button
                                    key={labelKey}
                                    onClick={() => handleCategoryClick(category)}
                                    title={`Filter by ${t(labelKey)}`}
                                    className={`px-4 py-2 text-sm font-semibold rounded-full transition-colors ${
                                        activeCategory === category
                                            ? 'bg-gray-900 dark:bg-gray-200 text-white dark:text-black shadow-md'
                                            : 'bg-white dark:bg-surface-dark text-gray-700 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-800 border border-gray-300 dark:border-gray-700'
                                    }`}
                                >
                                    {t(labelKey)}
                                </button>
                            ))}
                        </div>
                    </div>
                </div>
            </div>
        </section>

        {/* Tools Section */}
        <section id="all-tools" className="pb-24">
            <div className="container max-w-screen-2xl mx-auto px-6">
                {activeCategory === 'workflows' ? (
                     <div className="mt-4 grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 xl:grid-cols-5 gap-4">
                        {/* Manage Workflows Card */}
                        <Link
                            to="/workflows"
                            title="Manage your workflows"
                            className="flex flex-col p-6 bg-pink-50 dark:bg-pink-900/20 border border-pink-200 dark:border-pink-800 rounded-2xl hover:-translate-y-1 transition-all duration-300 group shadow-sm hover:shadow-lg h-full"
                        >
                            <h3 className="text-lg font-bold text-gray-800 dark:text-gray-100">Manage your workflows</h3>
                            <p className="mt-2 text-sm text-gray-600 dark:text-gray-400 flex-grow">View and edit your saved workflows.</p>
                            <div className="mt-4 font-semibold text-pink-600 flex items-center gap-2 group-hover:underline">
                                Go to admin
                                <RightArrowIcon className="h-4 w-4 transition-transform group-hover:translate-x-1" />
                            </div>
                        </Link>

                        {/* User-created Workflows */}
                        {workflows.filter(wf => wf.status).map(workflow => {
                            const firstTool = toolsByTitle.get(workflow.tools[0]);
                            if (!firstTool) return null;

                            return (
                                <Link
                                    key={workflow.id}
                                    to={`/${firstTool.id}`}
                                    title={`Start workflow: ${workflow.name}`}
                                    className="relative flex flex-col p-6 bg-white dark:bg-surface-dark border border-gray-200 dark:border-gray-800 rounded-2xl hover:-translate-y-1 transition-all duration-300 group shadow-sm hover:shadow-lg h-full"
                                >
                                    <WorkflowPathIcon className="h-10 w-10 mb-4" />
                                    <h3 className="text-lg font-bold text-gray-800 dark:text-gray-100">{workflow.name}</h3>
                                    <p className="mt-1 text-sm text-gray-500 dark:text-gray-400 leading-relaxed flex-grow break-words">
                                        {workflow.tools.join(' → ')}
                                    </p>
                                </Link>
                            );
                        })}

                        {/* Add a workflow Card */}
                        <div 
                            onClick={handleWorkflowClick} 
                            className="cursor-pointer flex flex-col items-center justify-center p-6 bg-white dark:bg-surface-dark border-2 border-dashed border-gray-300 dark:border-gray-700 rounded-2xl hover:border-brand-red hover:text-brand-red transition-all duration-300 group h-full"
                        >
                             <div className="w-12 h-12 rounded-full bg-gray-100 dark:bg-gray-800 flex items-center justify-center mb-4 text-gray-500 dark:text-gray-400 group-hover:bg-red-50 dark:group-hover:bg-red-900/20 transition-colors">
                                <PlusIcon className="h-6 w-6" />
                            </div>
                            <h3 className="text-lg font-bold text-gray-800 dark:text-gray-100">Add a workflow</h3>
                            <p className="text-sm text-gray-500 dark:text-gray-400 mt-1">
                                {workflows.length + 1} of 6
                            </p>
                            <div className="mt-4 bg-yellow-400 text-yellow-900 font-bold py-2 px-4 rounded-lg text-sm flex items-center gap-2">
                                <StarIcon className="h-4 w-4"/> Premium
                            </div>
                        </div>
                    </div>
                ) : (
                    <div className="mt-4 grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 xl:grid-cols-5 gap-4">
                        {filteredTools.length > 0 ? filteredTools.map((tool) => (
                            <div key={tool.id}>
                                <ToolCard tool={tool} isFavorite={isFavorite(tool.id)} onToggleFavorite={toggleFavorite} />
                            </div>
                        )) : (
                            <p className="col-span-full text-center text-gray-500 py-10">No tools found in this category.</p>
                        )}
                    </div>
                )}
            </div>
        </section>

        {/* The PDFBullet Advantage Section */}
        <AdvantageSection />

        {/* Simple Steps Section */}
        <section className="py-20 bg-gray-50 dark:bg-black">
            <div className="container max-w-screen-2xl mx-auto px-6">
                <div className="max-w-4xl mx-auto text-center">
                    <h2 className="text-4xl font-extrabold text-gray-900 dark:text-gray-50">{t('Guide To Use Our Tools')}</h2>
                    <p className="mt-3 text-lg text-gray-600 dark:text-gray-400">{t('Simple Steps')}</p>
                </div>
                <div className="max-w-6xl mx-auto mt-12 grid grid-cols-1 md:grid-cols-3 gap-8 md:gap-12 relative">
                    <div className="absolute top-1/2 left-0 w-full h-0.5 bg-gray-200 dark:bg-gray-700 hidden md:block" style={{transform: 'translateY(-2.5rem)'}}></div>
                    <div className="absolute top-1/2 left-0 w-full h-0.5 hidden md:block" style={{transform: 'translateY(-2.5rem)'}}>
                        <div className="h-full bg-brand-red w-full" style={{background: 'linear-gradient(to right, #e53935 50%, #f56565 100%)'}}></div>
                    </div>
                     {steps.map((step, index) => (
                        <div key={index} className="text-center relative">
                            <div className="relative inline-block">
                                <div className="w-24 h-24 rounded-full bg-red-50 dark:bg-red-900/30 flex items-center justify-center">
                                    <step.icon className="h-12 w-12 text-brand-red" />
                                </div>
                                <div className="absolute -top-2 -right-2 w-8 h-8 rounded-full bg-brand-red text-white flex items-center justify-center font-bold text-sm border-4 border-white dark:border-soft-dark">
                                    {index + 1}
                                </div>
                            </div>
                            <h3 className="mt-6 text-xl font-bold text-gray-900 dark:text-gray-100">{step.title}</h3>
                            <p className="mt-2 text-gray-600 dark:text-gray-400">{step.description}</p>
                        </div>
                    ))}
                </div>
                <div className="mt-12 text-center">
                    <Link to="/how-to-use" title="Explore All Guides" className="inline-block bg-white dark:bg-surface-dark border-2 border-brand-red text-brand-red font-bold py-3 px-8 rounded-lg hover:bg-red-50 dark:hover:bg-red-900/20 transition-colors">
                        Explore All Guides
                    </Link>
                </div>
            </div>
        </section>

        {/* Our Impact Section */}
        <section className="py-20 bg-white dark:bg-black">
            <div className="container max-w-screen-2xl mx-auto px-6">
                <div className="max-w-5xl mx-auto text-center">
                    <h2 className="text-4xl font-extrabold text-gray-900 dark:text-gray-50">Our Impact in Numbers</h2>
                    <p className="mt-3 text-lg text-gray-600 dark:text-gray-400">
                        Join thousands of users who trust PDFBullet every day.
                    </p>
                </div>
                <div className="max-w-6xl mx-auto mt-12 grid grid-cols-1 sm:grid-cols-2 md:grid-cols-4 gap-8">
                    {stats.map((stat, index) => (
                        <StatCard 
                            key={index}
                            icon={stat.icon}
                            value={stat.value}
                            label={stat.label}
                            suffix={stat.suffix}
                        />
                    ))}
                </div>
            </div>
        </section>

        {/* Ecosystem Section */}
        <EcosystemSection />

        {/* Testimonials Section */}
        <section className="py-20 overflow-hidden bg-gray-50 dark:bg-black">
            <div className="container max-w-screen-2xl mx-auto px-6">
                <div className="max-w-4xl mx-auto text-center">
                    <h2 className="text-4xl font-extrabold text-gray-900 dark:text-gray-50">Trusted by Professionals Worldwide</h2>
                </div>
            </div>
            <div className="mt-12 relative">
                <div className="md:overflow-x-auto no-scrollbar md:max-w-5xl md:mx-auto">
                    <div className="flex space-x-8 animate-marquee md:animate-none md:w-max md:px-6">
                        {[...testimonials, ...testimonials].map((testimonial, index) => (
                            <div key={index} className="flex-shrink-0 w-80 bg-white dark:bg-surface-dark p-8 rounded-xl shadow-lg border border-gray-200 dark:border-gray-800 flex flex-col items-center">
                                <img src={testimonial.image} alt={`Photo of ${testimonial.name}`} className="h-20 w-20 rounded-full object-cover mb-4 border-2 border-brand-red p-1" width="80" height="80" loading="lazy" decoding="async" />
                                <blockquote className="text-gray-600 dark:text-gray-300 italic text-center text-base leading-relaxed flex-grow">
                                    "{testimonial.text}"
                                </blockquote>
                                <div className="mt-4 text-center">
                                    <p className="text-sm font-bold text-gray-800 dark:text-gray-200">{testimonial.name}</p>
                                    <p className="text-xs font-normal text-gray-500 dark:text-gray-400">{testimonial.role}</p>
                                </div>
                            </div>
                        ))}
                    </div>
                </div>
                <div className="absolute inset-y-0 left-0 w-24 bg-gradient-to-r from-gray-50 dark:from-black to-transparent pointer-events-none"></div>
                <div className="absolute inset-y-0 right-0 w-24 bg-gradient-to-l from-gray-50 dark:from-black to-transparent pointer-events-none"></div>
            </div>
        </section>
        
        {/* Premium Section */}
        <section>
            <div className="bg-white dark:bg-surface-dark shadow-xl overflow-hidden md:flex">
                <div className="md:w-1/2 p-8 md:p-12 lg:px-24 lg:py-32 flex flex-col justify-center text-center md:text-left">
                    <h2 className="text-3xl md:text-4xl font-extrabold text-gray-900 dark:text-gray-100">{t('Get more with Premium')}</h2>
                    <p className="mt-4 text-gray-600 dark:text-gray-400">
                        {t('Complete projects faster with batch file processing, convert scanned documents with OCR and e-sign your business agreements.')}
                    </p>
                    <div className="mt-6">
                        <Link to="/signup" title="Get Premium" className="inline-block bg-brand-red hover:bg-brand-red-dark text-white font-bold py-3 px-8 rounded-lg text-lg transition-colors">
                            {t('Get Premium')}
                        </Link>
                    </div>
                </div>
                <div className="md:w-1/2 relative min-h-[300px] md:min-h-0" aria-hidden="true">
                    <PremiumIllustration />
                </div>
            </div>
        </section>
        
        {/* Blog Section */}
        <section className="py-20 bg-gray-50 dark:bg-black">
            <div className="container max-w-screen-2xl mx-auto px-6 text-center">
                <h2 className="text-4xl font-extrabold text-gray-900 dark:text-gray-50">{t('Our Latest Articles')}</h2>
                <p className="mt-3 text-lg text-gray-600 dark:text-gray-400">
                    {t('Blogs Posts')}
                </p>
                <div className="mt-8 text-center">
                    <Link to="/blog" title="View All Articles" className="text-brand-red font-semibold hover:underline">
                        View All Articles &rarr;
                    </Link>
                </div>
            </div>
            <div className="mt-12 group relative overflow-hidden" style={{ cursor: 'grab' }}>
                <div className="flex space-x-8 animate-marquee">
                    {[...blogPosts.slice(0, 6), ...blogPosts.slice(0, 6)].map((post, index) => (
                        <div key={`${post.slug}-${index}`} className="flex-shrink-0 w-80 bg-white dark:bg-surface-dark rounded-xl shadow-lg border border-gray-200 dark:border-gray-800 overflow-hidden hover:shadow-2xl transition-shadow duration-300">
                            <Link to={`/blog/${post.slug}`} className="block">
                                <img src={post.image} alt={post.title} className="h-40 w-full object-cover" loading="lazy" decoding="async" width="320" height="160" />
                                <div className="p-6">
                                    <h3 className="font-bold text-lg text-gray-800 dark:text-gray-100 h-14 overflow-hidden">{post.title}</h3>
                                    <p className="text-sm text-gray-500 dark:text-gray-400 mt-2 h-10 overflow-hidden text-ellipsis">{post.excerpt}</p>
                                    <span className="text-brand-red font-semibold text-sm mt-4 inline-block">Read More &rarr;</span>
                                </div>
                            </Link>
                        </div>
                    ))}
                </div>
                <div className="absolute inset-y-0 left-0 w-48 bg-gradient-to-r from-gray-50 dark:from-black to-transparent pointer-events-none"></div>
                <div className="absolute inset-y-0 right-0 w-48 bg-gradient-to-l from-gray-50 dark:from-black to-transparent pointer-events-none"></div>
            </div>
        </section>
        
        {/* Trustpilot Section */}
        <section className="py-20 bg-white dark:bg-black">
            <div className="container max-w-screen-2xl mx-auto px-6">
                <div className="max-w-4xl mx-auto text-center">
                    <h2 className="text-4xl font-extrabold text-gray-900 dark:text-gray-50">Review Us on Trustpilot</h2>
                    <p className="mt-3 text-lg text-gray-600 dark:text-gray-400">Your feedback helps us grow and improve.</p>
                </div>
                <div className="mt-8 flex justify-center">
                    <a href="https://www.trustpilot.com/review/ilovepdfly.com" target="_blank" rel="noopener noreferrer" title="Review PDFBullet on Trustpilot">
                        <img 
                            src="https://ik.imagekit.io/fonepay/widget.jpg?updatedAt=1752933053507" 
                            alt="Review PDFBullet on Trustpilot" 
                            className="h-auto transition-transform hover:scale-105"
                            style={{ maxWidth: '150px' }}
                            width="150"
                            height="78"
                            loading="lazy"
                            decoding="async"
                        />
                    </a>
                </div>
            </div>
        </section>
        
        {/* FAQ Section */}
        <section className="py-20 bg-gray-50 dark:bg-black">
            <div className="container max-w-screen-2xl mx-auto px-6">
                <div className="max-w-4xl mx-auto text-center">
                    <h2 className="text-4xl font-extrabold text-gray-900 dark:text-gray-50">{t('Frequently Asked Questions')}</h2>
                </div>
                <div className="max-w-4xl mx-auto mt-12 bg-white dark:bg-surface-dark p-6 rounded-lg shadow-lg border border-gray-200 dark:border-gray-800">
                    {faqs.map((faq, index) => (
                        <HomeFaqItem 
                            key={index} 
                            item={faq}
                            isOpen={openFaq === index}
                            toggle={() => toggleFaq(index)}
                        />
                    ))}
                </div>
                <div className="mt-8 text-center">
                     <Link to="/faq" title="View all FAQs" className="text-brand-red font-semibold hover:underline">
                        View all FAQs &rarr;
                    </Link>
                </div>
            </div>
        </section>
    </div>
  );
};

export default HomePage;