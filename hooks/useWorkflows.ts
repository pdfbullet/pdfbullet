import { useState, useEffect } from 'react';
import { TOOLS } from '../constants.ts';
import { Tool } from '../types.ts';

export interface Workflow {
    id: number;
    name: string;
    tools: string[]; // Store tool titles for simplicity
    status: boolean;
}

export interface WorkflowStep {
    id: number;
    tool: Tool;
}

const WORKFLOWS_KEY = 'ilovepdfly_workflows_v1';

// Initial mock data to populate localStorage if it's empty
const initialWorkflows: Workflow[] = [
    {
        id: 1,
        name: 'mishra',
        tools: ['Excel to PDF', 'Merge PDF'],
        status: true,
    },
];

// Helper to get workflows from localStorage
const getStoredWorkflows = (): Workflow[] => {
    try {
        const storedWorkflows = localStorage.getItem(WORKFLOWS_KEY);
        if (storedWorkflows) {
            return JSON.parse(storedWorkflows);
        }
        // If nothing is in storage, set initial data and return it
        localStorage.setItem(WORKFLOWS_KEY, JSON.stringify(initialWorkflows));
        return initialWorkflows;
    } catch (error) {
        console.error("Failed to parse workflows from localStorage", error);
        // Fallback to initial data if parsing fails
        localStorage.setItem(WORKFLOWS_KEY, JSON.stringify(initialWorkflows));
        return initialWorkflows;
    }
};

export const useWorkflows = () => {
    const [workflows, setWorkflows] = useState<Workflow[]>(getStoredWorkflows);

    // This effect handles changes from other tabs/windows to keep the UI in sync
    useEffect(() => {
        const handleStorageChange = (event: StorageEvent) => {
            if (event.key === WORKFLOWS_KEY && event.newValue) {
                setWorkflows(JSON.parse(event.newValue));
            }
        };

        window.addEventListener('storage', handleStorageChange);
        return () => {
            window.removeEventListener('storage', handleStorageChange);
        };
    }, []);

    // Helper to persist changes to both localStorage and React state
    const persistAndSet = (newWorkflows: Workflow[]) => {
        try {
            localStorage.setItem(WORKFLOWS_KEY, JSON.stringify(newWorkflows));
            setWorkflows(newWorkflows);
        } catch (error) {
            console.error("Failed to save workflows to localStorage", error);
        }
    };

    const addWorkflow = (workflow: Omit<Workflow, 'id' | 'status'>) => {
        const newWorkflow: Workflow = {
            id: Date.now(),
            ...workflow,
            status: true,
        };
        const currentWorkflows = getStoredWorkflows();
        persistAndSet([...currentWorkflows, newWorkflow]);
    };
    
    const updateWorkflow = (updatedWorkflow: Workflow) => {
        const currentWorkflows = getStoredWorkflows();
        const newWorkflows = currentWorkflows.map(wf => wf.id === updatedWorkflow.id ? updatedWorkflow : wf);
        persistAndSet(newWorkflows);
    };

    const deleteWorkflow = (id: number) => {
        const currentWorkflows = getStoredWorkflows();
        const newWorkflows = currentWorkflows.filter(wf => wf.id !== id);
        persistAndSet(newWorkflows);
    };
    
    const toggleWorkflowStatus = (id: number) => {
        const currentWorkflows = getStoredWorkflows();
        const newWorkflows = currentWorkflows.map(wf => wf.id === id ? { ...wf, status: !wf.status } : wf);
        persistAndSet(newWorkflows);
    };

    return { workflows, addWorkflow, updateWorkflow, deleteWorkflow, toggleWorkflowStatus };
};
