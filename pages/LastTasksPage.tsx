import React from 'react';
import { useLastTasks, LastTask } from '../hooks/useLastTasks.ts';
import { TOOLS } from '../constants.ts';
import { DownloadIcon, TrashIcon } from '../components/icons.tsx';

const TaskItem: React.FC<{ task: LastTask; onDelete: (id: number) => void; }> = ({ task, onDelete }) => {
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
        if (interval > 1) return Math.floor(interval) + " years ago";
        interval = seconds / 2592000;
        if (interval > 1) return Math.floor(interval) + " months ago";
        interval = seconds / 86400;
        if (interval > 1) return Math.floor(interval) + " days ago";
        interval = seconds / 3600;
        if (interval > 1) return Math.floor(interval) + " hours ago";
        interval = seconds / 60;
        if (interval > 1) return Math.floor(interval) + " minutes ago";
        return Math.floor(seconds) + " seconds ago";
    };

    return (
        <div className="flex items-center justify-between p-4 border-b border-gray-200 dark:border-gray-700 last:border-b-0">
            <div className="flex items-center gap-4 overflow-hidden">
                {tool && (
                    <div className={`p-3 rounded-lg ${tool.color} flex-shrink-0`}>
                        <tool.Icon className="h-6 w-6 text-white" />
                    </div>
                )}
                <div className="overflow-hidden">
                    <p className="font-bold text-gray-800 dark:text-gray-100 truncate">{task.outputFilename}</p>
                    <p className="text-sm text-gray-500 dark:text-gray-400">
                        {task.toolTitle} &middot; {timeAgo(task.timestamp)}
                    </p>
                </div>
            </div>
            <div className="flex items-center gap-2 flex-shrink-0">
                <button onClick={handleDownload} className="p-2 text-gray-500 hover:text-brand-red rounded-full hover:bg-gray-100 dark:hover:bg-gray-800 transition-colors" title="Download">
                    <DownloadIcon className="h-5 w-5" />
                </button>
                <button onClick={() => onDelete(task.id)} className="p-2 text-gray-500 hover:text-brand-red rounded-full hover:bg-gray-100 dark:hover:bg-gray-800 transition-colors" title="Delete">
                    <TrashIcon className="h-5 w-5" />
                </button>
            </div>
        </div>
    );
};

const LastTasksPage: React.FC = () => {
    const { tasks, loading, deleteTask } = useLastTasks();

    return (
        <div className="w-full">
            <h1 className="text-3xl md:text-4xl font-extrabold text-gray-800 dark:text-gray-100 mb-4">Last tasks</h1>
            
            <div className="bg-blue-50 dark:bg-blue-900/20 text-blue-800 dark:text-blue-200 p-4 rounded-lg mb-8 border border-blue-200 dark:border-blue-800">
                All your files will be automatically deleted 2 hours after being processed.
            </div>

            <div className="bg-white dark:bg-surface-dark rounded-lg shadow-lg border border-gray-200 dark:border-gray-800">
                <div className="p-6 border-b border-gray-200 dark:border-gray-700">
                    <h2 className="text-xl font-bold text-gray-800 dark:text-gray-100">Processed files</h2>
                </div>
                <div>
                    {loading ? (
                        <p className="p-8 text-center text-gray-500">Loading tasks...</p>
                    ) : tasks.length === 0 ? (
                        <div className="p-8 text-center text-gray-500 dark:text-gray-400">
                            <p>There are no processed files yet. We invite you to use our services, you'll love it for sure!</p>
                        </div>
                    ) : (
                        tasks.map(task => (
                            <TaskItem key={task.id} task={task} onDelete={deleteTask} />
                        ))
                    )}
                </div>
            </div>
        </div>
    );
};

export default LastTasksPage;
