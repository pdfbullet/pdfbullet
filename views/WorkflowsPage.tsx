import React, { useState, useEffect } from 'react';
import { Link, useLocation, useNavigate } from 'react-router-dom';
import { PuzzleIcon, RightArrowIcon, EditIcon, TrashIcon, CheckIcon } from '../components/icons.tsx';
import { useWorkflows } from '../hooks/useWorkflows.ts';
import { TOOLS } from '../constants.ts';

// Reusable toggle switch component
const ToggleSwitch: React.FC<{ checked: boolean; onChange: () => void }> = ({ checked, onChange }) => (
    <button
        type="button"
        className={`${checked ? 'bg-green-500' : 'bg-gray-300 dark:bg-gray-600'} relative inline-flex items-center h-6 rounded-full w-11 transition-colors focus:outline-none`}
        onClick={onChange}
        aria-checked={checked}
        role="switch"
    >
        <span className={`${checked ? 'translate-x-6' : 'translate-x-1'} inline-block w-4 h-4 transform bg-white rounded-full transition-transform`} />
    </button>
);

const WorkflowsPage: React.FC = () => {
    const location = useLocation();
    const navigate = useNavigate();
    const [showSuccess, setShowSuccess] = useState(location.state?.workflowSaved || false);
    
    const { workflows, toggleWorkflowStatus, deleteWorkflow } = useWorkflows();

    // Effect to hide the success message after a few seconds
    useEffect(() => {
        if (showSuccess) {
            const timer = setTimeout(() => {
                setShowSuccess(false);
                // Clean the location state to prevent message from reappearing on refresh
                navigate(location.pathname, { replace: true, state: {} });
            }, 5000); 
            return () => clearTimeout(timer);
        }
    }, [showSuccess, navigate, location.pathname]);

    const handleStart = (workflowTools: string[]) => {
        if (workflowTools.length > 0) {
            const firstToolTitle = workflowTools[0];
            const tool = TOOLS.find(t => t.title === firstToolTitle);
            if (tool) {
                navigate(`/${tool.id}`);
            } else {
                alert(`Tool "${firstToolTitle}" not found.`);
            }
        }
    };

    const handleEdit = (id: number) => {
        const workflowToEdit = workflows.find(wf => wf.id === id);
        if (workflowToEdit) {
            navigate('/workflows/create', { state: { workflow: workflowToEdit } });
        }
    };

    const handleDelete = (id: number, name: string) => {
        if (window.confirm(`Are you sure you want to delete the workflow "${name}"?`)) {
            deleteWorkflow(id);
        }
    };

    return (
        <div className="w-full">
            <div className="flex justify-between items-center mb-6">
                <h1 className="text-3xl md:text-4xl font-extrabold text-gray-800 dark:text-gray-100">Workflows</h1>
                <Link
                    to="/pricing"
                    className="bg-yellow-400 hover:bg-yellow-500 text-yellow-900 font-bold py-2 px-4 rounded-md flex items-center gap-2 transition-colors text-sm sm:text-base"
                >
                    <span>Upgrade to Premium</span>
                </Link>
            </div>
            
            {showSuccess && (
                 <div className="bg-green-100 dark:bg-green-900/30 border border-green-200 dark:border-green-700 text-green-800 dark:text-green-200 px-4 py-3 rounded-lg relative mb-6 flex items-center gap-3 animate-fade-in-down">
                    <CheckIcon className="h-5 w-5" />
                    <span className="block sm:inline font-semibold">Workflow saved successfully!</span>
                </div>
            )}

            <div className="bg-white dark:bg-surface-dark p-6 md:p-8 rounded-lg shadow-lg border border-gray-200 dark:border-gray-800">
                <div className="flex justify-between items-center mb-6 border-b border-gray-200 dark:border-gray-700 pb-4">
                    <h2 className="text-xl font-bold text-gray-800 dark:text-gray-100">My workflows</h2>
                    <Link
                        to="/workflows/create"
                        className="text-sm font-semibold bg-white dark:bg-gray-800 border border-gray-300 dark:border-gray-600 text-gray-700 dark:text-gray-200 py-2 px-4 rounded-md hover:bg-gray-50 dark:hover:bg-gray-700"
                    >
                        Create new workflow
                    </Link>
                </div>
                
                <div className="overflow-x-auto">
                    <div className="min-w-full">
                        <div className="grid grid-cols-12 gap-4 text-xs font-semibold text-gray-500 dark:text-gray-400 uppercase px-4 py-2">
                            <div className="col-span-3">Name</div>
                            <div className="col-span-4">Tools</div>
                            <div className="col-span-2">Status</div>
                            <div className="col-span-3 text-right">Actions</div>
                        </div>

                        <div>
                             {workflows.length > 0 ? workflows.map(wf => (
                                <div key={wf.id} className="grid grid-cols-12 gap-4 items-center px-4 py-3 border-t border-gray-200 dark:border-gray-700">
                                    <div className="col-span-3 font-semibold text-gray-800 dark:text-gray-100 flex items-center gap-2">
                                        <PuzzleIcon className="h-5 w-5 text-gray-400"/>
                                        <span>{wf.name}</span>
                                    </div>
                                    <div className="col-span-4 flex items-center gap-2 flex-wrap">
                                        {wf.tools.map((tool, index) => (
                                            <React.Fragment key={index}>
                                                <span className="bg-blue-100 dark:bg-blue-900/30 text-blue-800 dark:text-blue-300 text-xs font-medium px-2.5 py-1 rounded-md">{tool}</span>
                                                {index < wf.tools.length - 1 && <RightArrowIcon className="h-4 w-4 text-gray-400"/>}
                                            </React.Fragment>
                                        ))}
                                    </div>
                                    <div className="col-span-2">
                                        <ToggleSwitch checked={wf.status} onChange={() => toggleWorkflowStatus(wf.id)} />
                                    </div>
                                    <div className="col-span-3 flex justify-end items-center gap-1 text-gray-500 dark:text-gray-400">
                                        <button onClick={() => handleStart(wf.tools)} aria-label="Start workflow" title="Start workflow" className="p-2 rounded-full font-semibold text-sm text-brand-red hover:bg-red-50 dark:hover:bg-red-900/20">Start</button>
                                        <button onClick={() => handleEdit(wf.id)} aria-label="Edit workflow" title="Edit workflow" className="p-2 rounded-full hover:bg-gray-100 dark:hover:bg-gray-700"><EditIcon className="h-5 w-5"/></button>
                                        <button onClick={() => handleDelete(wf.id, wf.name)} aria-label="Delete workflow" title="Delete workflow" className="p-2 rounded-full hover:bg-gray-100 dark:hover:bg-gray-700"><TrashIcon className="h-5 w-5"/></button>
                                    </div>
                                </div>
                             )) : (
                                <div className="text-center py-8 text-gray-500">
                                    No workflows created yet.
                                </div>
                             )}
                        </div>
                    </div>
                </div>
                
                <div className="text-xs text-gray-500 dark:text-gray-400 mt-4 pt-4 border-t border-gray-200 dark:border-gray-700">
                    {workflows.length} of {workflows.length}
                </div>
            </div>
        </div>
    );
};

export default WorkflowsPage;
