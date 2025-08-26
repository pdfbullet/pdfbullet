import React, { useState, useEffect } from 'react';
import { Link, useNavigate, useLocation } from 'react-router-dom';
import { TOOLS } from '../constants.ts';
import { Tool } from '../types.ts';
import { PlusIcon, TrashIcon, RightArrowIcon } from '../components/icons.tsx';
import { useWorkflows, Workflow, WorkflowStep } from '../hooks/useWorkflows.ts';

const CreateWorkflowPage: React.FC = () => {
    const navigate = useNavigate();
    const location = useLocation();
    const { addWorkflow, updateWorkflow } = useWorkflows();

    const editingWorkflow = location.state?.workflow as Workflow | null;

    const [workflowName, setWorkflowName] = useState(editingWorkflow?.name || '');
    const [steps, setSteps] = useState<WorkflowStep[]>(() => {
        if (editingWorkflow) {
            return editingWorkflow.tools.map((toolTitle, index) => {
                const tool = TOOLS.find(t => t.title === toolTitle);
                return tool ? { id: Date.now() + index, tool } : null;
            }).filter((s): s is WorkflowStep => s !== null);
        }
        return [];
    });
    const [selectedToolId, setSelectedToolId] = useState<string>('');

    // Filter out tools that don't make sense in a workflow (like generators)
    const workflowCompatibleTools = TOOLS.filter(t => t.api && t.category);

    const addStep = () => {
        if (!selectedToolId) return;
        const toolToAdd = workflowCompatibleTools.find(t => t.id === selectedToolId);
        if (toolToAdd) {
            setSteps([...steps, { id: Date.now(), tool: toolToAdd }]);
            setSelectedToolId(''); // Reset selector
        }
    };

    const removeStep = (id: number) => {
        setSteps(steps.filter(step => step.id !== id));
    };

    const handleSave = () => {
        const workflowData = {
            name: workflowName,
            tools: steps.map(s => s.tool.title),
        };

        if (editingWorkflow) {
            updateWorkflow({
                ...editingWorkflow,
                ...workflowData
            });
        } else {
            addWorkflow(workflowData);
        }

        navigate('/workflows', { state: { workflowSaved: true } });
    };

    return (
        <div className="w-full">
            {/* Header */}
            <div className="flex justify-between items-center mb-8">
                <div className="text-3xl md:text-4xl font-extrabold text-gray-800 dark:text-gray-100">
                    <Link to="/workflows" className="text-gray-400 dark:text-gray-500 hover:underline">Workflows</Link>
                    <span className="text-gray-400 dark:text-gray-500 mx-2">/</span>
                    <span>{editingWorkflow ? 'Edit workflow' : 'Create new workflow'}</span>
                </div>
                <Link
                    to="/pricing"
                    className="bg-yellow-400 hover:bg-yellow-500 text-yellow-900 font-bold py-2 px-4 rounded-md flex items-center gap-2 transition-colors text-sm sm:text-base"
                >
                    <span>Upgrade to Premium</span>
                </Link>
            </div>

            {/* Main Content Grid */}
            <div className="grid md:grid-cols-2 gap-8">
                {/* Left Column: Tool Selection */}
                <div className="bg-white dark:bg-surface-dark p-8 rounded-lg shadow-lg border border-gray-200 dark:border-gray-800 space-y-6">
                    <h2 className="text-xl font-bold">Tool selection</h2>
                    
                    <div className="p-6 bg-blue-50 dark:bg-blue-900/20 border-t-4 border-blue-400 rounded-md">
                        <label htmlFor="workflowName" className="block text-sm font-bold text-gray-700 dark:text-gray-300">Workflow name</label>
                        <p className="text-xs text-gray-500 dark:text-gray-400 mt-1 mb-2">Enter a workflow name so you can find it in tools and on the homepage.</p>
                        <input
                            type="text"
                            id="workflowName"
                            value={workflowName}
                            onChange={(e) => setWorkflowName(e.target.value)}
                            placeholder="Enter workflow name"
                            className="w-full px-4 py-2 bg-white dark:bg-gray-900 border border-gray-300 dark:border-gray-600 rounded-md focus:ring-brand-red focus:border-brand-red"
                        />
                    </div>
                    
                    <div>
                        <label htmlFor="tool-select" className="block text-sm font-bold text-gray-700 dark:text-gray-300 mb-2">Select a tool:</label>
                        <select
                            id="tool-select"
                            value={selectedToolId}
                            onChange={(e) => setSelectedToolId(e.target.value)}
                            className="w-full px-4 py-3 bg-white dark:bg-gray-900 border border-gray-300 dark:border-gray-600 rounded-md focus:ring-brand-red focus:border-brand-red"
                        >
                            <option value="">Available tools...</option>
                            {workflowCompatibleTools.map(tool => (
                                <option key={tool.id} value={tool.id}>{tool.title}</option>
                            ))}
                        </select>
                    </div>

                    <button
                        onClick={addStep}
                        disabled={!selectedToolId}
                        className="w-full flex items-center justify-center gap-2 py-3 border border-red-300 text-red-600 rounded-lg hover:bg-red-50 dark:hover:bg-red-900/20 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
                    >
                        Add step <RightArrowIcon className="h-4 w-4" />
                    </button>
                </div>

                {/* Right Column: Workflow Preview */}
                <div className="bg-white dark:bg-surface-dark p-8 rounded-lg shadow-lg border border-gray-200 dark:border-gray-800">
                    <h2 className="text-xl font-bold mb-4">Workflow preview</h2>
                    {steps.length === 0 ? (
                        <div className="text-center text-gray-500 dark:text-gray-400 py-16">
                            <p>Add tools to start building your workflow</p>
                        </div>
                    ) : (
                        <div className="space-y-4">
                            {steps.map((step, index) => (
                                <div key={step.id} className="flex items-center gap-4 p-4 bg-gray-50 dark:bg-gray-900/50 rounded-lg border dark:border-gray-700">
                                    <div className="flex-shrink-0 w-8 h-8 rounded-full bg-brand-red text-white flex items-center justify-center font-bold">{index + 1}</div>
                                    <div className={`p-2 rounded-md ${step.tool.color}`}>
                                        <step.tool.Icon className="h-6 w-6 text-white" />
                                    </div>
                                    <div className="flex-grow">
                                        <p className="font-semibold">{step.tool.title}</p>
                                    </div>
                                    <button onClick={() => removeStep(step.id)} className="p-2 text-gray-400 hover:text-red-500 rounded-full hover:bg-red-100 dark:hover:bg-red-900/50">
                                        <TrashIcon className="h-5 w-5" />
                                    </button>
                                </div>
                            ))}
                        </div>
                    )}
                </div>
            </div>

            {/* Save Button at the bottom */}
            <div className="mt-8 pt-6 border-t border-gray-200 dark:border-gray-700 flex justify-end">
                <button
                    onClick={handleSave}
                    disabled={!workflowName || steps.length === 0}
                    className="bg-brand-red hover:bg-brand-red-dark text-white font-bold py-3 px-8 rounded-md transition-colors disabled:bg-red-300 dark:disabled:bg-red-800"
                >
                    Save Workflow
                </button>
            </div>
        </div>
    );
};

export default CreateWorkflowPage;
