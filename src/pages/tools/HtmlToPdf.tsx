import React, { useState } from 'react';
import ToolPageLayout from '../../components/ToolPageLayout.tsx';
import { TOOLS } from '../../constants.ts';
// NOTE: This is a placeholder component. The full logic from the old ToolPage.tsx will be migrated here.

const HtmlToPdf: React.FC = () => {
    const tool = TOOLS.find(t => t.id === 'html-to-pdf')!;
    const [url, setUrl] = useState('');

    return (
        <ToolPageLayout tool={tool}>
            <div className="flex flex-col items-center space-y-4">
                 <input
                    type="url"
                    value={url}
                    onChange={(e) => setUrl(e.target.value)}
                    placeholder="Enter URL to convert"
                    className="w-full max-w-lg p-4 border-2 border-gray-300 rounded-lg text-lg"
                />
                <button className={`${tool.color} ${tool.hoverColor} text-white font-bold py-3 px-8 rounded-lg text-xl transition-colors shadow-lg`}>
                    Convert to PDF
                </button>
            </div>
        </ToolPageLayout>
    );
};

export default HtmlToPdf;
