import React from 'react';
import ToolPageLayout from '../../components/ToolPageLayout.tsx';
import { TOOLS } from '../../constants.ts';
import AIAssistant from '../../components/AIAssistant.tsx';

const AiQuestionGenerator: React.FC = () => {
    const tool = TOOLS.find(t => t.id === 'ai-question-generator')!;
    
    // The core logic is now within the AIAssistant component itself.
    // This page acts as a wrapper to provide the correct layout and context.
    return (
        <ToolPageLayout tool={tool}>
            <AIAssistant />
        </ToolPageLayout>
    );
};

export default AiQuestionGenerator;
