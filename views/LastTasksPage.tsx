import React, { useState } from 'react';
import { useLastTasks, LastTask } from '../hooks/useLastTasks.ts';
import { TOOLS } from '../constants.ts';
import { DownloadIcon, TrashIcon, CalendarIconSimple, EditIcon, CheckIcon, CloseIcon, WarningIcon } from '../components/icons.tsx';

const DueDateManager: React.FC<{ task: LastTask; onUpdate: (id: number, dueDate: string | null) => void; }> = ({ task, onUpdate }) => {
    const [isEditing, setIsEditing] = useState(false);
    const [date, setDate] = useState(task.dueDate || '');

    const handleSave = () => {
        onUpdate(task.id, date || null);
        setIsEditing(false);
    };

    const handleCancel = () => {
        setDate(task.dueDate || '');
        setIsEditing(false);
    };

    const isOverdue = task.dueDate ? new Date(task.dueDate) < new Date() && new Date(task.dueDate).toDateString() !== new Date().toDateString() : false;

    if (isEditing) {
        return (
            <div className="flex items-center gap-2 mt-2">
                <input 
                    type="date" 
                    value={date} 
                    onChange={(e) => setDate(e.target.value)} 
                    className="p-1 border rounded-md text-sm bg-white dark:bg-gray-800 border-gray-300 dark:border-gray-600 focus:ring-1 focus:ring-brand-red focus:border-brand-red"
                />
                <button onClick={handleSave} className="p-1 text-green-500 hover:bg-gray-100 dark:hover:bg-gray-700 rounded-full" title="Save"><CheckIcon className="h-5 w-5" /></button>
                <button onClick={handleCancel} className="p-1 text-gray-500 hover:bg-gray-100 dark:hover:bg-gray-700 rounded-full" title="Cancel"><CloseIcon className="h-5 w-5" /></button>
            </div>
        );
    }

    if (task.dueDate) {
        return (
            <div className="flex items-center gap-2 mt-2 text-sm">
                {/* The 'WarningIcon' component does not accept a 'title' prop. The icon is now wrapped in a 'span' element with the 'title' attribute to provide the tooltip, resolving the TypeScript error. */}
                {isOverdue && <span title="This task is overdue"><WarningIcon className="h-4 w-4 text-red-500" /></span>}
                <span className={isOverdue ? 'text-red-500 font-semibold' : 'text-gray-600 dark:text-gray-400'}>
                    Due: {new Date(task.dueDate).toLocaleDateString(undefined, { year: 'numeric', month: 'short', day: 'numeric' })}
                </span>
                <button onClick={() => setIsEditing(true)} className="p-1 text-gray-400 hover:text-gray-600 dark:hover:text-gray-200 rounded-full" title="Edit due date"><EditIcon className="h-4 w-4" /></button>
                <button onClick={() => onUpdate(task.id, null)} className="p-1 text-gray-400 hover:text-red-500 dark:hover:text-red-400 rounded-full" title="Clear due date"><TrashIcon className="h-4 w-4" /></button>
            </div>
        );
    }

    return (
        <button onClick={() => setIsEditing(true)} className="flex items-center gap-1 mt-2 text-sm text-blue-500 hover:underline">
            <CalendarIconSimple className="h-4 w-4" />
            Add due date
        </button>
    );
};


const TaskItem: React.FC<{ task: LastTask; onDelete: (id: number) => void; onUpdateDueDate: (id: number, dueDate: string | null) => void; }> = ({ task, onDelete, onUpdateDueDate }) => {
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
                        {tool?.title ? tool.title.replace('tool.', '').replace('.title', '').replace(/-/g, ' ') : task.toolTitle} &middot; {timeAgo(task.timestamp)}
                    </p>
                    <DueDateManager task={task} onUpdate={onUpdateDueDate} />
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
    const { tasks, loading, deleteTask, updateTaskDueDate } = useLastTasks();

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
                            <TaskItem key={task.id} task={task} onDelete={deleteTask} onUpdateDueDate={updateTaskDueDate} />
                        ))
                    )}
                </div>
            </div>
        </div>
    );
};

export default LastTasksPage;