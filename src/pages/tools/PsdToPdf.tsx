import React from 'react';
import ToolPageLayout from '../../components/ToolPageLayout.tsx';
import { TOOLS } from '../../constants.ts';
import FileUpload from '../../components/FileUpload.tsx';
// NOTE: This is a placeholder component. The full logic from the old ToolPage.tsx will be migrated here.

const PsdToPdf: React.FC = () => {
    const tool = TOOLS.find(t => t.id === 'psd-to-pdf')!;
    const [files, setFiles] = React.useState<File[]>([]);

    return (
        <ToolPageLayout tool={tool}>
            <FileUpload tool={tool} files={files} setFiles={setFiles} accept={tool.accept} />
        </ToolPageLayout>
    );
};

export default PsdToPdf;
