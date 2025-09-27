import React, { useState, useEffect, useMemo } from 'react';
import { Link } from 'react-router-dom';
import { TOOLS } from '../constants.ts';
import ToolCard from '../components/ToolCard.tsx';
import { Tool } from '../types.ts';
import { 
    RefreshIcon, DownloadIcon
} from '../components/icons.tsx';
import { useFavorites } from '../hooks/useFavorites.ts';
import { useAuth } from '../contexts/AuthContext.tsx';
import { useI18n } from '../contexts/I18nContext.tsx';
import { useLastTasks, LastTask } from '../hooks/useLastTasks.ts';

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

const PwaHomePage: React.FC = () => {
    const { user } = useAuth();
    const { isFavorite, toggleFavorite, favorites } = useFavorites();
    const { t } = useI18n();
    const { tasks, loading: tasksLoading } = useLastTasks();

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

            <section>
                <div className="flex justify-between items-center mb-4">
                    <h2 className="text-xl font-bold">Recent Activity</h2>
                    <Link to="/last-tasks" className="text-sm font-semibold text-brand-red hover:underline">View All</Link>
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
            
            <section>
                <h2 className="text-xl font-bold mb-4">Explore</h2>
                 <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                    <Link to="/tools" className="block p-6 bg-blue-50 dark:bg-blue-900/20 rounded-lg">
                        <h3 className="font-bold text-blue-800 dark:text-blue-200">All Tools</h3>
                        <p className="text-sm text-blue-700 dark:text-blue-300">Browse the complete suite of over 40 PDF and image tools.</p>
                    </Link>
                     <Link to="/articles" className="block p-6 bg-green-50 dark:bg-green-900/20 rounded-lg">
                        <h3 className="font-bold text-green-800 dark:text-green-200">Tips & Tricks</h3>
                        <p className="text-sm text-green-700 dark:text-green-300">Read our blog for guides and updates to boost your productivity.</p>
                    </Link>
                 </div>
            </section>
        </div>
    );
};

export default PwaHomePage;