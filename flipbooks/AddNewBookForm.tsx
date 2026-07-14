import React, { useState, useCallback } from 'react';
import { useDropzone } from 'react-dropzone';
import { InfoIcon, UploadIcon, CogIcon } from '../components/icons.tsx';
import { useAuth } from '../contexts/AuthContext.tsx';
import { addFlipbook } from '../hooks/useFlipbooks.ts';
import * as pdfjsLib from 'pdfjs-dist';

interface AddNewBookFormProps {
  onCancel: () => void;
  onSave: (data: any) => void;
}

const AddNewBookForm: React.FC<AddNewBookFormProps> = ({ onCancel, onSave }) => {
  const [title, setTitle] = useState('');
  const [description, setDescription] = useState('');
  const [keywords, setKeywords] = useState('');
  const [category, setCategory] = useState('None');
  const [allowDownload, setAllowDownload] = useState(false);
  const [label, setLabel] = useState('None');
  const [pdfFile, setPdfFile] = useState<File | null>(null);
  const { user } = useAuth();

  const [uploadState, setUploadState] = useState<'idle' | 'processing' | 'converting' | 'success'>('idle');
  const [progress, setProgress] = useState(0);
  const [progressMessage, setProgressMessage] = useState('');
  const [error, setError] = useState('');

  const onDrop = useCallback((acceptedFiles: File[], fileRejections: any[]) => {
    setError('');
    if (fileRejections.length > 0) {
      setError('Please upload a PDF file under 100MB.');
      return;
    }
    if (acceptedFiles.length > 0) {
      setPdfFile(acceptedFiles[0]);
      if (!title) {
        setTitle(acceptedFiles[0].name.replace(/\.pdf$/i, ''));
      }
    }
  }, [title]);

  const { getRootProps, getInputProps, isDragActive } = useDropzone({
    onDrop,
    accept: { 'application/pdf': ['.pdf'] },
    maxSize: 100 * 1024 * 1024, // 100 MB
    multiple: false,
  });

  const handleSubmit = async () => {
    if (!pdfFile || !user) {
      setError('A PDF file is required.');
      return;
    }
    setError('');
    setUploadState('processing');
    setProgress(0);
    setProgressMessage('Processing file...');

    await new Promise(resolve => {
        let currentProgress = 0;
        const interval = setInterval(() => {
            currentProgress += 10;
            setProgress(currentProgress);
            if (currentProgress >= 100) {
                clearInterval(interval);
                resolve(true);
            }
        }, 100);
    });

    setUploadState('converting');
    setProgress(0);

    try {
        const arrayBuffer = await pdfFile.arrayBuffer();
        const pdf = await pdfjsLib.getDocument({ data: arrayBuffer }).promise;
        const numPages = pdf.numPages;
        const pageUrls: string[] = [];

        for (let i = 1; i <= numPages; i++) {
            const currentProgress = Math.round((i / numPages) * 100);
            setProgressMessage(`- Converting... ${currentProgress}%`);
            setProgress(currentProgress);
            
            const page = await pdf.getPage(i);
            const viewport = page.getViewport({ scale: 1.5 });
            const canvas = document.createElement('canvas');
            canvas.width = viewport.width;
            canvas.height = viewport.height;
            const context = canvas.getContext('2d');
            if (!context) throw new Error('Could not get canvas context');

            await page.render({ canvasContext: context, viewport } as any).promise;
            pageUrls.push(canvas.toDataURL('image/jpeg', 0.8));
        }
        
        setProgressMessage('Saving flipbook...');
// FIX: Added missing 'createdAt' property to align with the Flipbook interface.
        await addFlipbook({
            title: title || pdfFile.name.replace('.pdf', ''),
            ownerId: user.uid,
            ownerName: user.username,
            pageUrls,
            public: true,
            folder: category === 'None' ? 'Default' : category,
            isPremium: !!user.isFlipbookPremium,
            createdAt: new Date(),
        });

        setUploadState('success');
        setProgressMessage('Flipbook created successfully!');

        setTimeout(() => {
            onSave({ title, pdfFile });
        }, 1500);

    } catch (err: any) {
        setError(`Conversion failed: ${err.message}`);
        setUploadState('idle');
    }
  };

  const isSaveDisabled = !pdfFile || !title.trim() || uploadState !== 'idle';

  if (uploadState !== 'idle' && uploadState !== 'success') {
    return (
        <div className="bg-white dark:bg-gray-800 p-6 rounded-lg shadow-lg mt-6 text-gray-900 dark:text-gray-100">
            <div className="flex flex-col items-center justify-center py-16">
                <CogIcon className="h-12 w-12 text-gray-500 animate-spin" />
                <h3 className="mt-4 text-lg font-semibold">{title || pdfFile?.name}</h3>
                <p className="mt-2 text-gray-600 dark:text-gray-400">{progressMessage}</p>
                <div className="w-full max-w-sm bg-gray-200 rounded-full h-2.5 dark:bg-gray-700 mt-4">
                    <div className="bg-blue-600 h-2.5 rounded-full" style={{ width: `${progress}%`, transition: 'width 0.2s ease-in-out' }}></div>
                </div>
                 {error && <p className="mt-4 text-sm text-red-500">{error}</p>}
            </div>
        </div>
    );
  }

  return (
    <div className="bg-white dark:bg-gray-800 p-6 rounded-lg shadow-lg mt-6 text-gray-900 dark:text-gray-100">
      <div className="flex justify-between items-center">
        <h2 className="text-xl font-bold">Add New Book</h2>
        <div>
          <button className="px-3 py-1 border rounded-md text-sm font-semibold">Advanced</button>
          <button className="ml-2 p-1 border rounded-md">&#x26F6;</button>
        </div>
      </div>
      
      <div className="border-b border-gray-200 dark:border-gray-700 mt-4 mb-6">
        <nav className="-mb-px flex space-x-6 text-sm font-medium">
          <a href="#" className="py-2 px-1 border-b-2 font-semibold text-blue-600 border-blue-600">Book Info</a>
          <a href="#" className="py-2 px-1 border-b-2 border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300">Template</a>
          <a href="#" className="py-2 px-1 border-b-2 border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300">Advanced</a>
          <a href="#" className="py-2 px-1 border-b-2 border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300">Table of Bookmark</a>
        </nav>
      </div>

      <div className="grid md:grid-cols-2 gap-8">
        {/* Left Side: Form Fields */}
        <div className="space-y-4">
          <div>
            <label className="text-sm font-medium text-gray-600 dark:text-gray-300 flex items-center">Title <InfoIcon className="h-4 w-4 ml-1 text-gray-400" /></label>
            <input type="text" value={title} onChange={e => setTitle(e.target.value)} className="w-full p-2 border rounded-md mt-1 bg-white dark:bg-gray-700 border-gray-300 dark:border-gray-600" />
          </div>
          <div>
            <label className="text-sm font-medium text-gray-600 dark:text-gray-300 flex items-center">Description <InfoIcon className="h-4 w-4 ml-1 text-gray-400" /></label>
            <textarea value={description} onChange={e => setDescription(e.target.value)} rows={3} className="w-full p-2 border rounded-md mt-1 bg-white dark:bg-gray-700 border-gray-300 dark:border-gray-600"></textarea>
          </div>
          <div>
            <label className="text-sm font-medium text-gray-600 dark:text-gray-300">Keywords</label>
            <input type="text" value={keywords} onChange={e => setKeywords(e.target.value)} placeholder="Enter keywords" className="w-full p-2 border rounded-md mt-1 bg-white dark:bg-gray-700 border-gray-300 dark:border-gray-600" />
          </div>
          <div>
            <label className="text-sm font-medium text-gray-600 dark:text-gray-300 flex items-center">Category <InfoIcon className="h-4 w-4 ml-1 text-gray-400" /></label>
            <select value={category} onChange={e => setCategory(e.target.value)} className="w-full p-2 border rounded-md mt-1 bg-white dark:bg-gray-700 border-gray-300 dark:border-gray-600">
              <option>None</option>
              <option>Art</option>
              <option>Business</option>
              <option>Education</option>
            </select>
          </div>
          <div className="flex items-center">
            <input type="checkbox" id="allowDownload" checked={allowDownload} onChange={e => setAllowDownload(e.target.checked)} className="h-4 w-4 rounded text-blue-600 focus:ring-blue-500" />
            <label htmlFor="allowDownload" className="ml-2 text-sm text-gray-600 dark:text-gray-300">Allow readers to download PDF</label>
          </div>
          <div>
            <label className="text-sm font-medium text-gray-600 dark:text-gray-300">Label</label>
            <div className="flex gap-4 mt-2 text-sm">
              <label className="flex items-center"><input type="radio" name="label" value="None" checked={label === 'None'} onChange={e => setLabel(e.target.value)} /> <span className="ml-1">None</span></label>
              <label className="flex items-center"><input type="radio" name="label" value="New" checked={label === 'New'} onChange={e => setLabel(e.target.value)} /> <span className="ml-1">New</span></label>
              <label className="flex items-center"><input type="radio" name="label" value="Hot" checked={label === 'Hot'} onChange={e => setLabel(e.target.value)} /> <span className="ml-1">Hot</span></label>
              <label className="flex items-center"><input type="radio" name="label" value="Featured" checked={label === 'Featured'} onChange={e => setLabel(e.target.value)} /> <span className="ml-1">Featured</span></label>
            </div>
          </div>
        </div>

        {/* Right Side: Upload */}
        <div 
          {...getRootProps()}
          className={`flex flex-col items-center justify-center p-6 border-2 border-dashed rounded-lg text-center cursor-pointer transition-colors h-full ${isDragActive ? 'border-blue-500 bg-blue-50 dark:bg-blue-900/20' : 'border-gray-300 dark:border-gray-600'}`}
        >
          <input {...getInputProps()} />
          <p className="text-sm text-gray-500 dark:text-gray-400">...or simply drag and drop your PDF file here</p>
          <p className="text-sm text-gray-500 dark:text-gray-400 my-2">...or <span className="text-blue-500 underline">upload a file</span> from an online file link.</p>
          <button type="button" className="bg-blue-500 text-white font-semibold py-3 px-6 rounded-md mt-4 flex items-center gap-2 hover:bg-blue-600">
            <UploadIcon className="h-5 w-5" />
            UPLOAD YOUR PDF
          </button>
          {pdfFile && <p className="mt-4 text-sm font-semibold text-green-600">File selected: {pdfFile.name}</p>}
          {error && <p className="mt-2 text-sm text-red-500">{error}</p>}
          <p className="text-xs text-gray-400 mt-auto pt-4">The PDF uploaded needs to be less than 100 MB</p>
        </div>
      </div>

      {/* Footer Buttons */}
      <div className="flex justify-end gap-4 mt-8 pt-4 border-t border-gray-200 dark:border-gray-700">
        <button onClick={onCancel} className="px-6 py-2 border rounded-md font-semibold text-gray-700 dark:text-gray-200 hover:bg-gray-100 dark:hover:bg-gray-700">Cancel</button>
        <button onClick={handleSubmit} className="px-6 py-2 bg-blue-600 text-white rounded-md font-semibold hover:bg-blue-700 disabled:bg-gray-400 disabled:cursor-not-allowed" disabled={isSaveDisabled}>Save And Close</button>
      </div>
    </div>
  );
};
// FIX: Added default export to the AddNewBookForm component.
export default AddNewBookForm;