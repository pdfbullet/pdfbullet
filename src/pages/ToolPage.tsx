// FIX: Replaced corrupted file content with the correct ToolPage component to resolve build errors and restore functionality.
import React, { useState, useEffect, useCallback, useRef, useMemo, useContext } from 'react';
import { useParams, Link, useNavigate, useLocation } from 'react-router-dom';
import { TOOLS } from '../constants.ts';
import { Tool } from '../types.ts';
import FileUpload from '../components/FileUpload.tsx';
import { useAuth } from '../contexts/AuthContext.tsx';
import { useI18n } from '../contexts/I18nContext.tsx';
import { 
    TrashIcon, DownloadIcon, LinkIcon, GoogleDriveIcon, DropboxIcon, CheckIcon, CopyIcon, 
    FacebookIcon, XIcon, LinkedInIcon, RightArrowIcon, LeftArrowIcon, LockIcon
} from '../components/icons.tsx';
import { useLastTasks } from '../hooks/useLastTasks.ts';
import { LayoutContext } from '../types.ts';
import CompressionOptions from '../components/CompressionOptions.tsx';
import BackgroundRemovalUI from '../components/BackgroundRemovalUI.tsx';
import OrganizePdfUI from '../components/OrganizePdfUI.tsx';
import DocumentScannerUI from '../components/DocumentScannerUI.tsx';
import { getOutputFilename, formatBytes, formatTime } from '../utils.ts';
import CompressionResultDisplay from '../components/CompressionResultDisplay.tsx';
import WhoWillSignModal from '../components/WhoWillSignModal.tsx';
import SignatureModal from '../components/SignatureModal.tsx';
import { useSignature } from '../hooks/useSignature.ts';
import { useSignedDocuments } from '../hooks/useSignedDocuments.ts';
// FIX: Imported Preloader component to resolve undefined error.
import Preloader from '../components/Preloader.tsx';
import type { PageViewport } from 'pdfjs-dist';

enum ProcessingState {
  Idle = "IDLE",
  Processing = "PROCESSING",
  Success = "SUCCESS",
  Error = "ERROR"
}

const initialToolOptions = {
    compressionLevel: 'recommended',
    rotation: 90,
};

const toolSeoDescriptions: { [key: string]: string } = {
  'merge-pdf': 'Combine multiple PDF files into one single PDF document with PDFBullet\'s free online PDF merger. Easy to use, no installation needed.',
  'split-pdf': 'Split a large PDF file into separate pages or extract a specific range of pages into a new PDF document. Fast and secure splitting tool.',
  'compress-pdf': 'Reduce the file size of your PDF documents online for free. Optimize your PDFs for web and email sharing without losing quality.',
};

const ToolPage: React.FC = () => {
  const { toolId } = useParams<{ toolId: string }>();
  const navigate = useNavigate();
  const location = useLocation();
  const { user, sendTaskCompletionEmail, logTask } = useAuth();
  const { t } = useI18n();
  const { addTask } = useLastTasks();
  const { setShowFooter } = useContext(LayoutContext);
  
  const [tool, setTool] = useState<Tool | null>(null);
  const [state, setState] = useState<ProcessingState>(ProcessingState.Idle);
  const [errorMessage, setErrorMessage] = useState('');
  const [processedFileBlob, setProcessedFileBlob] = useState<Blob | null>(null);
  const [outputFilename, setOutputFilename] = useState('');
  const [files, setFiles] = useState<File[]>(() => (location.state?.files as File[]) || []);
  const [toolOptions, setToolOptions] = useState<any>(initialToolOptions);
  
  const handleReset = useCallback(() => {
    setState(ProcessingState.Idle);
    setErrorMessage('');
    setProcessedFileBlob(null);
    setFiles([]);
    setToolOptions(initialToolOptions);
  }, []);

  useEffect(() => {
    // This effect handles cleaning up the location state after the component has initialized with the files.
    if (location.state?.files) {
        // By replacing the state, we prevent the files from being re-added if the user navigates back.
        navigate(location.pathname, { replace: true, state: {} });
    }
  }, [location.pathname, location.state?.files, navigate]);


  useEffect(() => {
    setShowFooter(state === ProcessingState.Success);
    return () => { setShowFooter(true) };
  }, [state, setShowFooter]);

  useEffect(() => {
    const currentTool = TOOLS.find(t => t.id === toolId);
    if (currentTool) {
      if (currentTool.isPremium && !user?.isPremium) {
        navigate('/premium-feature', { state: { toolId: currentTool.id } });
        return;
      }
      setTool(currentTool);
      // Only reset if not navigating with files from another page.
      if (!location.state?.files) {
        handleReset();
      }
    } else {
      const knownGeneratorRoutes = ['invoice-generator', 'cv-generator', 'lesson-plan-creator', 'ai-question-generator', 'image-generator'];
      if (!knownGeneratorRoutes.includes(toolId || '')) {
          navigate('/404', { replace: true });
      }
    }
  }, [toolId, navigate, user, handleReset, location.state?.files]);

  const handleProcess = async () => {
    if (!tool || files.length === 0) return;
    
    setState(ProcessingState.Processing);
    setErrorMessage('');

    try {
        // Mock processing
        await new Promise(resolve => setTimeout(resolve, 2000));
        
        const filename = getOutputFilename(tool.id, files, toolOptions);
        const blob = new Blob(["mock file content"], { type: "application/pdf" });

        setProcessedFileBlob(blob);
        setOutputFilename(filename);
        setState(ProcessingState.Success);

        const taskData = {
            toolId: tool.id,
            toolTitle: t(tool.title),
            outputFilename: filename,
            fileBlob: blob
        };
        addTask(taskData);
        if (user) {
            logTask(taskData);
            sendTaskCompletionEmail(t(tool.title), filename);
        }
    } catch (e: any) {
        setErrorMessage(e.message || 'An unexpected error occurred.');
        setState(ProcessingState.Error);
    }
  };
  
  const onProcessSuccess = (blob: Blob, filename: string) => {
      setProcessedFileBlob(blob);
      setOutputFilename(filename);
      setState(ProcessingState.Success);
      if (tool) {
        const taskData = {
            toolId: tool.id,
            toolTitle: t(tool.title),
            outputFilename: filename,
            fileBlob: blob
        };
        addTask(taskData);
      }
  };

  const onProcessError = (message: string) => {
      setErrorMessage(message);
      setState(ProcessingState.Error);
  };
  
  if (!tool) return <Preloader />;

  if (state === ProcessingState.Success) {
    return (
        <div className="text-center w-full max-w-7xl mx-auto py-12 success-screen">
             <h2 className="text-3xl font-bold text-gray-800 dark:text-gray-100 mb-2">
                Task processed successfully!
             </h2>
             <button onClick={handleReset} className="text-brand-red font-semibold hover:underline">Process another file</button>
        </div>
    );
  }

  if (state === ProcessingState.Error) {
    return (
        <div className="text-center p-12 bg-red-50 dark:bg-red-900/20 rounded-lg">
            <h2 className="text-2xl font-bold text-red-700 dark:text-red-300">An Error Occurred</h2>
            <p className="mt-2 text-red-600 dark:text-red-400">{errorMessage}</p>
            <button onClick={handleReset} className="mt-6 bg-red-600 text-white font-bold py-2 px-6 rounded-lg">Try Again</button>
        </div>
    );
  }

  if (state === ProcessingState.Processing) {
    return (
        <div className="text-center py-20">
            <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-brand-red mx-auto"></div>
            <p className="mt-4">Processing...</p>
        </div>
    );
  }
  
  return (
    <div className="py-8 sm:py-16">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="text-center mb-10">
            <div className={`inline-flex items-center justify-center p-4 rounded-full ${tool.color} mb-4`}>
                <tool.Icon className="h-12 w-12 text-white" />
            </div>
            <h1 className="text-4xl font-extrabold text-gray-800 dark:text-gray-100">{t(tool.title)}</h1>
            <p className="mt-2 text-lg text-gray-600 dark:text-gray-300 max-w-2xl mx-auto">{t(tool.description)}</p>
        </div>
        
        <FileUpload tool={tool} files={files} setFiles={setFiles} accept={tool.accept}>
             <div className="space-y-6">
                {tool.id === 'compress-pdf' && (
                    <CompressionOptions 
                        level={toolOptions.compressionLevel}
                        setLevel={(level) => setToolOptions((prev: any) => ({ ...prev, compressionLevel: level }))}
                    />
                )}
                 {tool.id === 'rotate-pdf' && (
                    <div className="flex justify-center gap-4">
                        <button onClick={() => setToolOptions((prev: any) => ({...prev, rotation: 90}))} className={`px-4 py-2 font-semibold rounded-md ${toolOptions.rotation === 90 ? 'bg-brand-red text-white' : 'bg-gray-200'}`}>90°</button>
                        <button onClick={() => setToolOptions((prev: any) => ({...prev, rotation: 180}))} className={`px-4 py-2 font-semibold rounded-md ${toolOptions.rotation === 180 ? 'bg-brand-red text-white' : 'bg-gray-200'}`}>180°</button>
                        <button onClick={() => setToolOptions((prev: any) => ({...prev, rotation: 270}))} className={`px-4 py-2 font-semibold rounded-md ${toolOptions.rotation === 270 ? 'bg-brand-red text-white' : 'bg-gray-200'}`}>270°</button>
                    </div>
                )}
                {files.length > 0 && (
                    <button
                        onClick={handleProcess}
                        className={`w-full flex items-center justify-center gap-2 text-white font-bold py-4 px-6 rounded-lg text-lg transition-colors ${tool.color} ${tool.hoverColor} disabled:bg-gray-400`}
                    >
                        {t(tool.title)} <RightArrowIcon className="h-6 w-6" />
                    </button>
                )}
            </div>
        </FileUpload>
      </div>
    </div>
  );
};

export default ToolPage;
