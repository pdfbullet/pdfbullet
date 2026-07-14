import React, { useState, useEffect, useMemo, useRef, memo, useCallback } from 'react';
import { Link, useLocation, useNavigate } from 'react-router-dom';
import { TOOLS, blogPosts } from '../constants.ts';
import ToolCard from '../components/ToolCard.tsx';
import { Tool } from '../types.ts';
import { 
    RefreshIcon, DownloadIcon, LockIcon, ShoppingBagIcon, WorkflowPathIcon, UserIcon, LeftArrowIcon, RightArrowIcon
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
  const [isPaused, setIsPaused] = useState(false);
  const timeoutRef = useRef<number | null>(null);

  const resetTimeout = useCallback(() => {
    if (timeoutRef.current) {
      clearTimeout(timeoutRef.current);
    }
  }, []);

  const nextSlide = useCallback(() => {
    setCurrentIndex((prevIndex) => (prevIndex + 1) % bannerSlides.length);
  }, []);
  
  const prevSlide = () => {
    const isFirstSlide = currentIndex === 0;
    const newIndex = isFirstSlide ? bannerSlides.length - 1 : currentIndex - 1;
    setCurrentIndex(newIndex);
  };

  useEffect(() => {
    if (isPaused) return;
    resetTimeout();
    timeoutRef.current = window.setTimeout(nextSlide, 5000);

    return () => {
      resetTimeout();
    };
  }, [currentIndex, isPaused, nextSlide, resetTimeout]);

  const goToSlide = (slideIndex: number) => {
    setCurrentIndex(slideIndex);
  };

  return (
    <section 
      className="relative w-full aspect-[8/3] rounded-2xl overflow-hidden shadow-lg group"
      onMouseEnter={() => setIsPaused(true)}
      onMouseLeave={() => setIsPaused(false)}
    >
      <div
        className="flex transition-transform duration-1000 ease-in-out h-full"
        style={{ transform: `translateX(-${currentIndex * 100}%)` }}
      >
        {bannerSlides.map((banner, index) => (
          <Link to={banner.link} key={index} className="relative w-full flex-shrink-0 h-full bg-gray-100 dark:bg-gray-800 overflow-hidden">
            <img 
              src={banner.image} 
              alt={banner.title} 
              className={`w-full h-full object-cover transition-transform duration-[5500ms] ease-out ${currentIndex === index ? 'scale-110' : 'scale-100'}`}
            />
          </Link>
        ))}
      </div>

      {/* Navigation Arrows */}
      <button
        onClick={prevSlide}
        className="absolute top-1/2 left-2 -translate-y-1/2 z-10 p-2 bg-white/20 backdrop-blur-sm rounded-full text-white opacity-0 group-hover:opacity-100 transition-all duration-300 hover:bg-white/40 focus:opacity-100"
        aria-label="Previous slide"
      >
        <LeftArrowIcon className="h-6 w-6" />
      </button>
      <button
        onClick={nextSlide}
        className="absolute top-1/2 right-2 -translate-y-1/2 z-10 p-2 bg-white/20 backdrop-blur-sm rounded-full text-white opacity-0 group-hover:opacity-100 transition-all duration-300 hover:bg-white/40 focus:opacity-100"
        aria-label="Next slide"
      >
        <RightArrowIcon className="h-6 w-6" />
      </button>

      {/* Pagination Dots */}
      <div className="absolute bottom-4 left-1/2 -translate-x-1/2 flex gap-2 z-10">
        {bannerSlides.map((_, index) => (
          <button
            key={index}
            onClick={() => goToSlide(index)}
            className={`h-2 rounded-full transition-all duration-300 ${currentIndex === index ? 'w-6 bg-white' : 'w-2 bg-white/50'}`}
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
        setTimeout(() => {
            URL.revokeObjectURL(url);
        }, 1000);
    };

    const timeAgo = (timestamp: number) => {
        const seconds = Math.floor((new Date().getTime() - timestamp) / 1000);
        let interval = seconds / 31536000;
        if (interval > 1) return `${Math.floor(interval)}y ago`;
        interval = seconds / 2592000;
        if (interval > 1) return `${Math.floor(interval)}mo ago`;
        interval = seconds / 86400;
        if (interval > 1) return `${Math.floor(interval)}d ago`;
        interval = seconds / 3600;
        if (interval > 1) return `${Math.floor(interval)}h ago`;
        interval = seconds / 60;
        if (interval > 1) return `${Math.floor(interval)}m ago`;
        return `Just now`;
    };

    return (
        <div className="flex items-center justify-between p-3 bg-white dark:bg-black rounded-lg shadow-sm border border-gray-200 dark:border-gray-800 hover:shadow-md hover:border-brand-red/50 transition-all">
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
            description: "All our core tools are free to use, without limits. No hidden fees or sign-up required for most features."
        }
    ];

    return (
        <section ref={sectionRef} className={`py-4 scroll-animate ${isVisible ? 'visible' : ''}`}>
            <div className="max-w-7xl mx-auto">
                <h2 className="text-xl font-bold mb-3">Key Features</h2>
                <div className="grid grid-cols-1 sm:grid-cols-3 gap-6">
                    {advantages.map((adv, index) => (
                        <div key={index} className="bg-white dark:bg-black p-6 rounded-xl shadow-md border border-gray-200 dark:border-gray-800 text-center transform hover:-translate-y-1 hover:shadow-brand-red/20 dark:hover:shadow-brand-red/10 transition-all duration-300">
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

    const quickActionTools = useMemo(() => {
        const workflowsTool: Tool = {
            id: 'workflows',
            title: 'homepage.filter_workflows',
            description: 'Chain multiple tools for one-click processing.',
            Icon: WorkflowPathIcon,
            color: 'bg-purple-500',
            hoverColor: 'hover:bg-purple-600',
            textColor: 'text-purple-600',
            isPremium: true,
            category: 'business',
        };
        
        const toolMap = new Map(TOOLS.map(t => [t.id, t]));
        
        const quickActionIds = [
            'compress-pdf', 
            'jpg-to-pdf',
            'flipbooks',
            'sign-pdf',
            'workflows', // This is the placeholder for our custom tool object
            'pdf-reader'
        ];

        return quickActionIds.map(id => {
            if (id === 'workflows') {
                return workflowsTool;
            }
            return toolMap.get(id);
        }).filter((t): t is Tool => t !== undefined);

    }, []);

    useEffect(() => {
        setTitle('Home');
    }, [setTitle]);

    const favoriteTools = useMemo(() => TOOLS.filter(tool => favorites.includes(tool.id)), [favorites]);

    return (
        <div className="p-4 sm:p-6 space-y-6">
            <PwaBannerSlider />

            {favoriteTools.length > 0 && (
                <section>
                    <h2 className="text-xl font-bold mb-3">Your Favorites</h2>
                    <div className="grid grid-cols-3 gap-3">
                        {favoriteTools.map(tool => (
                            <ToolCard key={tool.id} tool={tool} isFavorite={isFavorite(tool.id)} onToggleFavorite={toggleFavorite} />
                        ))}
                    </div>
                </section>
            )}

            <section>
                <h2 className="text-xl font-bold mb-3">Quick Actions</h2>
                <div className="grid grid-cols-3 gap-3">
                    {quickActionTools.map(tool => (
                        <ToolCard key={tool.id} tool={tool} isFavorite={isFavorite(tool.id)} onToggleFavorite={toggleFavorite} />
                    ))}
                </div>
            </section>
            
            <AdvantageSection />

            <section>
                <div className="flex justify-between items-center mb-3">
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