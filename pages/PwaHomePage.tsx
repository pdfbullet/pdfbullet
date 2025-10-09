import React, { useState, useEffect, useMemo, useRef, memo } from 'react';
import { Link } from 'react-router-dom';
import { TOOLS, blogPosts } from '../constants.ts';
import ToolCard from '../components/ToolCard.tsx';
import { Tool } from '../types.ts';
import { 
    RefreshIcon, DownloadIcon, LockIcon, ShoppingBagIcon
} from '../components/icons.tsx';
import { useFavorites } from '../hooks/useFavorites.ts';
import { useAuth } from '../contexts/AuthContext.tsx';
import { useI18n } from '../contexts/I18nContext.tsx';
import { useLastTasks, LastTask } from '../hooks/useLastTasks.ts';
import { usePwaLayout } from '../contexts/PwaLayoutContext.tsx';

const bannerSlides = [
  {
    image: 'https://ik.imagekit.io/fonepay/slider-1.png?updatedAt=1758555229409',
    title: 'Unlock Premium Features!',
    description: 'Get unlimited access, advanced tools, and an ad-free experience.',
    link: '/pricing',
  },
  {
    image: 'https://ik.imagekit.io/fonepay/slider-2.png?updatedAt=1758554896182',
    title: 'Discover AI-Powered Tools',
    description: 'Generate invoices, CVs, and lesson plans in seconds with our new AI assistants.',
    link: '/ai-question-generator', // A relevant link for AI tools
  },
  {
    image: 'https://ik.imagekit.io/fonepay/slider-3.png?updatedAt=1758554896137',
    title: 'Read Our Latest Articles',
    description: 'Stay updated with the latest tips, tricks, and news on document management.',
    link: '/articles',
  }
];

const PwaBannerSlider: React.FC = () => {
  const [currentIndex, setCurrentIndex] = useState(0);

  useEffect(() => {
    const timer = setInterval(() => {
      setCurrentIndex((prevIndex) => (prevIndex + 1) % bannerSlides.length);
    }, 3000); // Slower, more pleasant transition

    return () => clearInterval(timer);
  }, []);

  return (
    <section className="relative w-full aspect-[5/2] rounded-2xl overflow-hidden shadow-lg">
      <div
        className="flex transition-transform duration-700 ease-in-out h-full"
        style={{ transform: `translateX(-${currentIndex * 100}%)` }}
      >
        {bannerSlides.map((banner, index) => (
          <Link to={banner.link} key={index} className="relative w-full flex-shrink-0 h-full bg-gray-100 dark:bg-gray-800">
            <img src={banner.image} alt={banner.title} className="w-full h-full object-contain" />
            <div className="absolute inset-0 bg-gradient-to-r from-black/60 to-transparent p-6 flex flex-col justify-center">
              <h3 className="text-2xl font-extrabold text-white">{banner.title}</h3>
              <p className="mt-1 text-sm text-gray-200 max-w-xs">{banner.description}</p>
            </div>
          </Link>
        ))}
      </div>
      <div className="absolute bottom-3 left-1/2 -translate-x-1/2 flex gap-2">
        {bannerSlides.map((_, index) => (
          <button
            key={index}
            onClick={() => setCurrentIndex(index)}
            className={`w-2.5 h-2.5 rounded-full transition-all duration-300 ${currentIndex === index ? 'w-6 bg-white' : 'bg-white/50'}`}
            aria-label={`Go to slide ${index + 1}`}
          />
        ))}
      </div>
    </section>
  );
};

const PwaTaskItem: React.FC<{ task: LastTask }> = ({ task }) => {
    const tool = TOOLS.find(t => t.id === task.toolId);

    const handleDownload = () => {
        const url = URL.createObjectURL(task.fileBlob);
        const a = document.createElement('a');
        a.href = url;
        a.download = task.outputFilename;
        document.body.appendChild(a);
        a.click();
        document.body.removeChild(a);
        URL.revokeObjectURL(url);
    };

    const timeAgo = (timestamp: number) => {
        const seconds = Math.floor((new Date().getTime() - timestamp) / 1000);
        let interval = seconds / 31536000;
        if (interval > 1) return `${Math.floor(interval)} years ago`;
        interval = seconds / 2592000;
        if (interval > 1) return `${Math.floor(interval)} months ago`;
        interval = seconds / 86400;
        if (interval > 1) return `${Math.floor(interval)} days ago`;
        interval = seconds / 3600;
        if (interval > 1) return `${Math.floor(interval)} hours ago`;
        interval = seconds / 60;
        if (interval > 1) return `${Math.floor(interval)} minutes ago`;
        return `${Math.floor(seconds)} seconds ago`;
    };

    return (
        <div className="flex items-center justify-between p-3 bg-white dark:bg-black rounded-lg shadow-sm border border-gray-200 dark:border-gray-800">
            <div className="flex items-center gap-4 overflow-hidden">
                {tool && (
                    <div className={`p-2 rounded-lg ${tool.color} flex-shrink-0`}>
                        <tool.Icon className="h-5 w-5 text-white" />
                    </div>
                )}
                <div className="overflow-hidden">
                    <p className="font-semibold text-gray-800 dark:text-gray-100 truncate text-sm">{task.outputFilename}</p>
                    <p className="text-xs text-gray-500 dark:text-gray-400">
                        {tool?.title ? tool.title.replace('tool.', '').replace('.title', '').replace(/-/g, ' ') : task.toolTitle} &middot; {timeAgo(task.timestamp)}
                    </p>
                </div>
            </div>
            <button onClick={handleDownload} className="p-2 text-gray-500 hover:text-brand-red rounded-full flex-shrink-0" title="Download">
                <DownloadIcon className="h-5 w-5" />
            </button>
        </div>
    );
};

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
        <section ref={sectionRef} className={`py-8 scroll-animate ${isVisible ? 'visible' : ''}`}>
            <div className="max-w-7xl mx-auto">
                <h2 className="text-xl font-bold mb-4">Key Features</h2>
                <div className="grid grid-cols-1 sm:grid-cols-3 gap-6">
                    {advantages.map((adv, index) => (
                        <div key={index} className="bg-white dark:bg-black p-6 rounded-xl shadow-md border border-gray-200 dark:border-gray-800 text-center">
                            <div className="inline-flex items-center justify-center h-14 w-14 rounded-full bg-brand-red/10 mb-4">
                                <adv.icon className="h-7 w-7 text-brand-red" />
                            </div>
                            <h3 className="text-lg font-bold text-gray-900 dark:text-gray-100">{adv.title}</h3>
                            <p className="mt-1 text-sm text-gray-600 dark:text-gray-400">{adv.description}</p>
                        </div>
                    ))}
                </div>
            </div>
        </section>
    );
});


const PwaHomePage: React.FC = () => {
    const { user } = useAuth();
    const { isFavorite, toggleFavorite, favorites } = useFavorites();
    const { t } = useI18n();
    const { tasks, loading: tasksLoading } = useLastTasks();
    const { setTitle } = usePwaLayout();

    useEffect(() => {
        setTitle('Home');
    }, [setTitle]);

    const favoriteTools = useMemo(() => TOOLS.filter(tool => favorites.includes(tool.id)), [favorites]);

    const quickActionTools = useMemo(() => {
        const toolIds = ['merge-pdf', 'compress-pdf', 'jpg-to-pdf', 'document-scanner'];
        return TOOLS.filter(tool => toolIds.includes(tool.id));
    }, []);

    return (
        <div className="p-4 sm:p-6 space-y-8">
            <PwaBannerSlider />
            <div>
                <h1 className="text-3xl font-extrabold text-gray-800 dark:text-gray-100">
                    Welcome{user ? `, ${user.username}` : ''}!
                </h1>
                <p className="text-gray-500 dark:text-gray-400 mt-1">What would you like to do today?</p>
            </div>

            {favoriteTools.length > 0 && (
                <section>
                    <h2 className="text-xl font-bold mb-4">Your Favorites</h2>
                    <div className="grid grid-cols-2 gap-4">
                        {favoriteTools.map(tool => (
                            <ToolCard key={tool.id} tool={tool} isFavorite={isFavorite(tool.id)} onToggleFavorite={toggleFavorite} />
                        ))}
                    </div>
                </section>
            )}

            <section>
                <h2 className="text-xl font-bold mb-4">Quick Actions</h2>
                <div className="grid grid-cols-2 gap-4">
                    {quickActionTools.map(tool => (
                        <ToolCard key={tool.id} tool={tool} isFavorite={isFavorite(tool.id)} onToggleFavorite={toggleFavorite} />
                    ))}
                </div>
            </section>
            
            <AdvantageSection />

            <section>
                <div className="flex justify-between items-center mb-4">
                    <h2 className="text-xl font-bold">Recent Activity</h2>
                    <Link to="/storage" className="text-sm font-semibold text-brand-red hover:underline">View All</Link>
                </div>
                <div className="space-y-3">
                    {tasksLoading ? (
                        <div className="bg-white dark:bg-black p-8 rounded-lg shadow-sm border border-gray-200 dark:border-gray-800 text-center text-gray-500 dark:text-gray-400">
                            Loading recent files...
                        </div>
                    ) : tasks.length === 0 ? (
                        <div className="bg-white dark:bg-black p-8 rounded-lg shadow-sm border border-gray-200 dark:border-gray-800 text-center text-gray-500 dark:text-gray-400">
                            <RefreshIcon className="h-8 w-8 mx-auto mb-2" />
                            <p>Your recently processed files will appear here.</p>
                        </div>
                    ) : (
                        tasks.slice(0, 3).map(task => <PwaTaskItem key={task.id} task={task} />)
                    )}
                </div>
            </section>
        </div>
    );
};

export default PwaHomePage;