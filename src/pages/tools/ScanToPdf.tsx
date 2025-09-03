import React from 'react';
import ToolPageLayout from '../../components/ToolPageLayout.tsx';
import { TOOLS } from '../../constants.ts';
import { CameraIcon } from '../../components/icons.tsx';
// NOTE: This is a placeholder component. The full logic from the old ToolPage.tsx will be migrated here.

const ScanToPdf: React.FC = () => {
    const tool = TOOLS.find(t => t.id === 'scan-to-pdf')!;

    return (
        <ToolPageLayout tool={tool}>
            <div className="flex flex-col items-center">
                <button className={`${tool.color} ${tool.hoverColor} text-white font-bold py-4 px-10 rounded-lg text-xl transition-colors shadow-lg flex items-center gap-3`}>
                    <CameraIcon className="h-8 w-8" />
                    <span>Open Camera</span>
                </button>
            </div>
        </ToolPageLayout>
    );
};

export default ScanToPdf;
