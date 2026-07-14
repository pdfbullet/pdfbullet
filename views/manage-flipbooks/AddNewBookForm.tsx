import React, { useState, useCallback, useRef } from 'react';
import { useDropzone } from 'react-dropzone';
import { InfoIcon, UploadIcon, CogIcon, CloseIcon, ProtectIcon, TagIcon, BookOpenIcon, StarIcon, CheckCircleIcon, TrashIcon, LinkIcon, PlusIcon } from '../../components/icons.tsx';
import { useAuth } from '../../contexts/AuthContext.tsx';
import { addFlipbook } from '../../hooks/useFlipbooks.ts';
import * as pdfjsLib from 'pdfjs-dist';

interface AddNewBookFormProps {
  onCancel: () => void;
  onSave: (data: any) => void;
}

interface Bookmark {
    id: number;
    title: string;
    page: string;
}

const templateCategories = [
    {
      name: 'Active',
      templates: [
        { id: 'active_waterdrop', name: 'WaterDrop', thumb: 'https://ik.imagekit.io/fonepay/flipbook/anyflip-assets/active/waterdrop.jpg' },
        { id: 'active_florid', name: 'Florid', thumb: 'https://ik.imagekit.io/fonepay/flipbook/anyflip-assets/active/florid.jpg' },
        { id: 'active_dazzle', name: 'Dazzle', thumb: 'https://ik.imagekit.io/fonepay/flipbook/anyflip-assets/active/dazzle.jpg' },
        { id: 'active_black', name: 'Black', thumb: 'https://ik.imagekit.io/fonepay/flipbook/anyflip-assets/active/black.jpg' },
        { id: 'active_gray', name: 'Gray', thumb: 'https://ik.imagekit.io/fonepay/flipbook/anyflip-assets/active/gray.jpg' },
        { id: 'active_neatblue', name: 'Neat-Blue', thumb: 'https://ik.imagekit.io/fonepay/flipbook/anyflip-assets/active/neat-blue.jpg' },
      ],
    },
    {
      name: 'Classical',
      templates: [
        { id: 'classical_awhite', name: 'A-White', thumb: 'https://ik.imagekit.io/fonepay/flipbook/anyflip-assets/classical/a-white.jpg' },
        { id: 'classical_walline', name: 'Wall-line', thumb: 'https://ik.imagekit.io/fonepay/flipbook/anyflip-assets/classical/wall-line.jpg' },
        { id: 'classical_green', name: 'Green', thumb: 'https://ik.imagekit.io/fonepay/flipbook/anyflip-assets/classical/green.jpg' },
        { id: 'classical_ultram', name: 'Ultram', thumb: 'https://ik.imagekit.io/fonepay/flipbook/anyflip-assets/classical/ultram.jpg' },
        { id: 'classical_darkclouds', name: 'DarkClouds', thumb: 'https://ik.imagekit.io/fonepay/flipbook/anyflip-assets/classical/darkclouds.jpg' },
        { id: 'classical_wood', name: 'Wood', thumb: 'https://ik.imagekit.io/fonepay/flipbook/anyflip-assets/classical/wood.jpg' },
        { id: 'classical_landscape', name: 'Landscape', thumb: 'https://ik.imagekit.io/fonepay/flipbook/anyflip-assets/classical/landscape.jpg' },
      ],
    },
    { name: 'Handy', templates: [] },
    {
      name: 'Mobile',
      templates: [
        { id: 'mobile_waterdrop', name: 'WaterDrop', thumb: 'https://ik.imagekit.io/fonepay/flipbook/anyflip-assets/mobile/waterdrop.jpg' },
        { id: 'mobile_florid', name: 'Florid', thumb: 'https://ik.imagekit.io/fonepay/flipbook/anyflip-assets/mobile/florid.jpg' },
        { id: 'mobile_dazzle', name: 'Dazzle', thumb: 'https://ik.imagekit.io/fonepay/flipbook/anyflip-assets/mobile/dazzle.jpg' },
        { id: 'mobile_black', name: 'Black', thumb: 'https://ik.imagekit.io/fonepay/flipbook/anyflip-assets/mobile/black.jpg' },
        { id: 'mobile_gray', name: 'Gray', thumb: 'https://ik.imagekit.io/fonepay/flipbook/anyflip-assets/mobile/gray.jpg' },
        { id: 'mobile_neatblue', name: 'Neat-Blue', thumb: 'https://ik.imagekit.io/fonepay/flipbook/anyflip-assets/mobile/neat-blue.jpg' },
      ],
    },
    { name: 'Metro', templates: [] },
    { name: 'Float', templates: [] },
    { name: 'Neat', templates: [] },
    { name: 'Clear', templates: [] },
  ];

const AddNewBookForm: React.FC<AddNewBookFormProps> = ({ onCancel, onSave }) => {
  const [activeTab, setActiveTab] = useState<'info' | 'template' | 'advanced' | 'bookmark'>('info');
  const [isAdvancedPanelOpen, setIsAdvancedPanelOpen] = useState(false);

  // Book Info State
  const [title, setTitle] = useState('');
  const [description, setDescription] = useState('');
  const [keywords, setKeywords] = useState('');
  const [category, setCategory] = useState('None');
  const [allowDownload, setAllowDownload] = useState(true);
  const [label, setLabel] = useState('None');
  const [pdfFile, setPdfFile] = useState<File | null>(null);
  const { user } = useAuth();
  
  // Template State
  const [activeTemplateCategory, setActiveTemplateCategory] = useState('Active');
  const [selectedTemplateId, setSelectedTemplateId] = useState('active_waterdrop');
  const [customBackground, setCustomBackground] = useState<string | null>(null);
  const customBgInputRef = useRef<HTMLInputElement>(null);
  
  // Advanced Settings State
  const [password, setPassword] = useState('');
  const [seoTitle, setSeoTitle] = useState('');
  const [seoDescription, setSeoDescription] = useState('');
  const [showPdfBulletLogo, setShowPdfBulletLogo] = useState(true);
  const [uploadedLogo, setUploadedLogo] = useState<string | null>(null);

  // Bookmark State
  const [bookmarks, setBookmarks] = useState<Bookmark[]>([]);

  // Processing State
  const [uploadState, setUploadState] = useState<'idle' | 'processing' | 'converting' | 'success'>('idle');
  const [progress, setProgress] = useState(0);
  const [progressMessage, setProgressMessage] = useState('');
  const [error, setError] = useState('');

  const [isAiGenerating, setIsAiGenerating] = useState(false);

  const handleAiMetadata = async () => {
    const filenameToUse = pdfFile ? pdfFile.name : title;
    if (!filenameToUse) {
      setError('Please upload a PDF file or enter a title first to generate AI details.');
      return;
    }
    setError('');
    setIsAiGenerating(true);
    try {
      const res = await fetch('/api/generate-flipbook-details', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ filename: filenameToUse, category }),
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error || 'Failed to generate details.');
      
      if (data.title) setTitle(data.title);
      if (data.description) setDescription(data.description);
      if (data.keywords) setKeywords(data.keywords);
    } catch (err: any) {
      setError(err.message || 'Failed to run AI helper.');
    } finally {
      setIsAiGenerating(false);
    }
  };

  const onDrop = useCallback((acceptedFiles: File[], fileRejections: any[]) => {
    setError('');
    if (fileRejections.length > 0) {
      setError('Please upload a PDF file under 100MB.');
      return;
    }
    if (acceptedFiles.length > 0) {
      const file = acceptedFiles[0];
      setPdfFile(file);
      if (!title) {
        setTitle(file.name.replace(/\.pdf$/i, ''));
      }
    }
  }, [title]);

  const { getRootProps, getInputProps, isDragActive } = useDropzone({
    onDrop,
    accept: { 'application/pdf': ['.pdf'] },
    maxSize: 100 * 1024 * 1024,
    multiple: false,
  });

  const onLogoDrop = useCallback((acceptedFiles: File[]) => {
      if (acceptedFiles.length > 0) {
          const reader = new FileReader();
          reader.onload = () => setUploadedLogo(reader.result as string);
          reader.readAsDataURL(acceptedFiles[0]);
      }
  }, []);
  const { getRootProps: getLogoRootProps, getInputProps: getLogoInputProps } = useDropzone({ onDrop: onLogoDrop, accept: {'image/*': []} });

  const handleCustomBgUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files[0]) {
        const file = e.target.files[0];
        const reader = new FileReader();
        reader.onload = () => {
            setCustomBackground(reader.result as string);
            setSelectedTemplateId('');
        };
        reader.readAsDataURL(file);
    }
  };

  const handleSubmit = async () => {
    if (!pdfFile || !user) {
      setError('A PDF file is required.');
      setActiveTab('info');
      return;
    }
    setError('');
    setUploadState('processing');
    setProgress(0);
    setProgressMessage('Processing file...');

    let backgroundUrl: string | undefined = undefined;
    if (customBackground) {
        backgroundUrl = customBackground;
    } else if (selectedTemplateId) {
        for (const category of templateCategories) {
            const template = category.templates.find(t => t.id === selectedTemplateId);
            if (template) {
                backgroundUrl = template.thumb;
                break;
            }
        }
    }

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
        await addFlipbook({
            title: title || pdfFile.name.replace('.pdf', ''),
            ownerId: user.uid,
            ownerName: user.username,
            pageUrls,
            public: true,
            folder: category === 'None' ? 'Default' : category,
            isPremium: !!user.isFlipbookPremium,
            createdAt: new Date(),
            backgroundUrl: backgroundUrl,
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
        <div className="bg-gray-800/50 backdrop-blur-sm p-6 rounded-lg shadow-xl mt-6 text-white">
            <div className="flex flex-col items-center justify-center py-16">
                <CogIcon className="h-12 w-12 text-gray-200 animate-spin" />
                <h3 className="mt-4 text-lg font-semibold">{title || pdfFile?.name}</h3>
                <p className="mt-2 text-gray-300">{progressMessage}</p>
                <div className="w-full max-w-sm bg-black/20 rounded-full h-2.5 mt-4">
                    <div className="bg-blue-600 h-2.5 rounded-full" style={{ width: `${progress}%`, transition: 'width 0.2s ease-in-out' }}></div>
                </div>
                 {error && <p className="mt-4 text-sm text-red-400">{error}</p>}
            </div>
        </div>
    );
  }
   if (uploadState === 'success') {
    return (
      <div className="bg-gray-800/50 backdrop-blur-sm p-6 rounded-lg shadow-xl mt-6 text-white">
        <div className="flex flex-col items-center justify-center py-16">
          <CheckCircleIcon className="h-16 w-16 text-green-400 mb-4" />
          <h3 className="text-xl font-bold">Successfully Created!</h3>
          <p className="mt-2 text-gray-300">{progressMessage}</p>
        </div>
      </div>
    );
  }


  const TabButton: React.FC<{ tabId: 'info' | 'template' | 'advanced' | 'bookmark', children: React.ReactNode }> = ({ tabId, children }) => (
    <button onClick={() => setActiveTab(tabId)} className={`py-2 px-1 border-b-2 font-semibold transition-colors ${activeTab === tabId ? 'text-blue-400 border-blue-400' : 'border-transparent text-gray-300 hover:text-blue-400 hover:border-gray-500'}`}>
        {children}
    </button>
  );

  const addBookmark = () => {
    setBookmarks(prev => [...prev, { id: Date.now(), title: '', page: '' }]);
  };

  const removeBookmark = (id: number) => {
    setBookmarks(prev => prev.filter(b => b.id !== id));
  };
  
  const updateBookmark = (id: number, field: 'title' | 'page', value: string) => {
    setBookmarks(prev => prev.map(b => b.id === id ? { ...b, [field]: value } : b));
  };
  
  return (
    <div className="bg-black/40 backdrop-blur-xl border border-gray-700/50 p-6 rounded-lg shadow-2xl mt-6 relative overflow-hidden">
      <div className="flex justify-between items-center text-white">
        <h2 className="text-xl font-bold">Add New Book</h2>
        <div className="flex items-center gap-2">
          <button onClick={() => setIsAdvancedPanelOpen(true)} className="px-3 py-1 border rounded-md text-sm font-semibold border-gray-500 hover:bg-gray-800">Advanced</button>
        </div>
      </div>
      
      <div className="border-b border-gray-700 mt-4 mb-6">
        <nav className="-mb-px flex space-x-6 text-sm font-medium">
          <TabButton tabId="info">Book Info</TabButton>
          <TabButton tabId="template">Template</TabButton>
          <TabButton tabId="advanced">Advanced</TabButton>
          <TabButton tabId="bookmark">Table of Bookmark</TabButton>
        </nav>
      </div>

      <div className="min-h-[450px]">
        {activeTab === 'info' && (
             <div className="grid md:grid-cols-2 gap-8 animate-fade-in-down" style={{animationDuration: '300ms'}}>
                <div className="space-y-4 text-white">
                    <div>
                        <div className="flex justify-between items-center mb-1">
                            <label className="text-sm font-medium flex items-center text-gray-300">Title <InfoIcon className="h-4 w-4 ml-1 text-gray-400" /></label>
                            <button
                                type="button"
                                onClick={handleAiMetadata}
                                disabled={isAiGenerating}
                                className="text-xs font-semibold px-2 py-1 rounded bg-violet-900/40 text-violet-400 border border-violet-800 hover:bg-violet-800/40 transition disabled:opacity-50"
                            >
                                {isAiGenerating ? '✨ Generating...' : '✨ Auto-Fill with AI'}
                            </button>
                        </div>
                        <input type="text" value={title} onChange={e => setTitle(e.target.value)} className="w-full p-2.5 border rounded-md bg-[#2d2d2d] border-gray-700 focus:ring-blue-500 focus:border-blue-500" />
                    </div>
                    <div>
                        <label className="text-sm font-medium flex items-center mb-1 text-gray-300">Description <InfoIcon className="h-4 w-4 ml-1 text-gray-400" /></label>
                        <textarea value={description} onChange={e => setDescription(e.target.value)} rows={4} className="w-full p-2.5 border rounded-md bg-[#2d2d2d] border-gray-700 focus:ring-blue-500 focus:border-blue-500"></textarea>
                    </div>
                    <div>
                        <label className="text-sm font-medium mb-1 text-gray-300">Keywords</label>
                        <input type="text" value={keywords} onChange={e => setKeywords(e.target.value)} placeholder="Enter keywords" className="w-full p-2.5 border rounded-md bg-[#2d2d2d] border-gray-700 focus:ring-blue-500 focus:border-blue-500" />
                    </div>
                    <div>
                        <label className="text-sm font-medium flex items-center mb-1 text-gray-300">Category <InfoIcon className="h-4 w-4 ml-1 text-gray-400" /></label>
                        <select value={category} onChange={e => setCategory(e.target.value)} className="w-full p-2.5 border rounded-md bg-[#2d2d2d] border-gray-700 focus:ring-blue-500 focus:border-blue-500">
                            <option>None</option>
                            <option>Art</option>
                            <option>Business</option>
                            <option>Education</option>
                        </select>
                    </div>
                    <div className="flex items-center pt-2">
                        <input type="checkbox" id="allowDownload" checked={allowDownload} onChange={e => setAllowDownload(e.target.checked)} className="h-4 w-4 rounded text-blue-600 focus:ring-blue-500 bg-gray-700 border-gray-600" />
                        <label htmlFor="allowDownload" className="ml-2 text-sm text-gray-300">Allow readers to download PDF</label>
                    </div>
                    <div className="pt-2">
                        <label className="text-sm font-medium text-gray-300">Label</label>
                        <div className="flex gap-6 mt-2 text-sm items-center text-gray-300">
                            <label className="flex items-center gap-2 cursor-pointer"><input type="radio" name="label" value="None" checked={label === 'None'} onChange={e => setLabel(e.target.value)} className="form-radio h-4 w-4 text-blue-600 bg-gray-700 border-gray-600"/> <span>None</span></label>
                            <label className="flex items-center gap-2 cursor-pointer"><input type="radio" name="label" value="New" checked={label === 'New'} onChange={e => setLabel(e.target.value)} className="form-radio h-4 w-4 text-blue-600 bg-gray-700 border-gray-600"/> <span>New</span></label>
                            <label className="flex items-center gap-2 cursor-pointer"><input type="radio" name="label" value="Hot" checked={label === 'Hot'} onChange={e => setLabel(e.target.value)} className="form-radio h-4 w-4 text-blue-600 bg-gray-700 border-gray-600"/> <span>Hot</span></label>
                            <label className="flex items-center gap-2 cursor-pointer"><input type="radio" name="label" value="Featured" checked={label === 'Featured'} onChange={e => setLabel(e.target.value)} className="form-radio h-4 w-4 text-blue-600 bg-gray-700 border-gray-600"/> <span>Featured</span></label>
                        </div>
                    </div>
                </div>

                <div 
                    {...getRootProps()}
                    className={`flex flex-col items-center justify-center p-6 border-2 border-dashed rounded-xl text-center cursor-pointer transition-colors h-full ${isDragActive ? 'border-blue-500 bg-blue-900/20' : 'border-gray-600'}`}
                >
                    <input {...getInputProps()} />
                    <p className="text-sm text-gray-400">...or simply drag and drop your PDF file here</p>
                    <p className="text-sm text-gray-400 my-2">...or <button type="button" className="text-blue-400 underline">upload a file</button> from an online file link.</p>
                    <button type="button" className="bg-blue-600 text-white font-semibold py-3 px-8 rounded-md mt-4 flex items-center gap-2 hover:bg-blue-700 text-lg">
                        <UploadIcon className="h-5 w-5" />
                        UPLOAD YOUR PDF
                    </button>
                    {pdfFile && <p className="mt-4 text-sm font-semibold text-green-400 break-all">{pdfFile.name}</p>}
                    {error && <p className="mt-2 text-sm text-red-400">{error}</p>}
                    <p className="text-xs text-gray-500 mt-auto pt-4">The PDF uploaded needs to be less than 100 MB</p>
                </div>
            </div>
        )}
        {activeTab === 'template' && (
            <div className="flex gap-4 animate-fade-in-down h-[400px]" style={{animationDuration: '300ms'}}>
                <div className="w-40 flex-shrink-0 space-y-1 pr-2 border-r border-gray-600/50 overflow-y-auto">
                    {templateCategories.map(cat => (
                        <button
                            key={cat.name}
                            onClick={() => setActiveTemplateCategory(cat.name)}
                            className={`w-full text-left p-2 rounded-md text-sm font-semibold transition-colors ${
                                activeTemplateCategory === cat.name
                                    ? 'bg-blue-500 text-white'
                                    : 'text-gray-200 hover:bg-gray-800'
                            }`}
                        >
                            {cat.name}
                        </button>
                    ))}
                </div>
                <div className="flex-grow overflow-y-auto pr-2">
                    <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 gap-4">
                        {(templateCategories.find(c => c.name === activeTemplateCategory)?.templates ?? []).map(template => (
                            <div
                                key={template.id}
                                onClick={() => { setSelectedTemplateId(template.id); setCustomBackground(null); }}
                                className={`group rounded-lg overflow-hidden border-2 cursor-pointer transition-all duration-200 flex flex-col bg-gray-800 ${selectedTemplateId === template.id ? 'border-blue-500 shadow-lg' : 'border-gray-600 hover:border-blue-400'}`}
                            >
                                <div className="aspect-[16/10] bg-gray-700 overflow-hidden">
                                  <img src={template.thumb} alt={template.name} className="w-full h-full object-cover" />
                                </div>
                                <p className="text-sm font-semibold text-center text-gray-200 py-2 bg-gray-900/70">{template.name}</p>
                            </div>
                        ))}
                        {/* Custom Upload */}
                        <div
                            onClick={() => customBgInputRef.current?.click()}
                            className={`group rounded-lg overflow-hidden border-2 cursor-pointer transition-all duration-200 flex flex-col ${!selectedTemplateId && customBackground ? 'border-blue-500 shadow-lg' : 'border-dashed border-gray-500 hover:border-blue-400'}`}
                        >
                            <div
                                className="aspect-[16/10] flex-grow flex items-center justify-center bg-gray-800/50 bg-cover bg-center"
                                style={{ backgroundImage: customBackground ? `url(${customBackground})` : 'none' }}
                            >
                                {!customBackground && <UploadIcon className="h-8 w-8 text-gray-400" />}
                            </div>
                            <p className="text-sm font-semibold text-center text-gray-200 py-2 bg-gray-900/70">Custom</p>
                            <input type="file" ref={customBgInputRef} className="hidden" accept="image/*" onChange={handleCustomBgUpload}/>
                        </div>
                    </div>
                </div>
            </div>
        )}
        {activeTab === 'advanced' && <div className="text-white p-10 text-center animate-fade-in-down">Please use the 'Advanced' button in the top right corner to access these settings.</div>}
        {activeTab === 'bookmark' && (
            <div className="animate-fade-in-down" style={{animationDuration: '300ms'}}>
                 <button onClick={addBookmark} className="mb-4 bg-blue-500 text-white font-semibold py-2 px-4 rounded-md flex items-center gap-2 hover:bg-blue-600">
                    <PlusIcon className="h-5 w-5" /> Add Bookmark
                </button>
                <div className="space-y-3 max-h-80 overflow-y-auto pr-2">
                    {bookmarks.map(b => (
                        <div key={b.id} className="flex items-center gap-2 p-2 bg-black/20 rounded-md">
                            <input type="text" value={b.title} onChange={e => updateBookmark(b.id, 'title', e.target.value)} placeholder="Bookmark Title" className="flex-grow p-2 border rounded-md bg-black/20 border-gray-600 text-white" />
                            <input type="number" value={b.page} onChange={e => updateBookmark(b.id, 'page', e.target.value)} placeholder="Page #" className="w-24 p-2 border rounded-md bg-black/20 border-gray-600 text-white" />
                            <button onClick={() => removeBookmark(b.id)} className="p-2 text-gray-400 hover:text-red-500"><TrashIcon className="h-5 w-5"/></button>
                        </div>
                    ))}
                    {bookmarks.length === 0 && <p className="text-center text-gray-400 p-8">No bookmarks added yet.</p>}
                </div>
            </div>
        )}
      </div>

      <div className="flex justify-end gap-4 mt-8 pt-4 border-t border-gray-700">
        <button onClick={onCancel} className="px-6 py-2 border rounded-md font-semibold text-white hover:bg-gray-800 border-gray-500">Cancel</button>
        <button onClick={handleSubmit} className="px-6 py-2 bg-blue-600 text-white rounded-md font-semibold hover:bg-blue-700 disabled:bg-gray-500 disabled:cursor-not-allowed" disabled={isSaveDisabled}>Save And Close</button>
      </div>

      {/* Advanced Panel */}
      <div className={`absolute top-0 right-0 h-full w-full sm:w-80 bg-gray-900/80 backdrop-blur-md border-l border-gray-700 transition-transform duration-300 ease-in-out ${isAdvancedPanelOpen ? 'translate-x-0' : 'translate-x-full'}`} >
          <div className="flex flex-col h-full">
              <div className="flex justify-between items-center p-4 border-b border-gray-700">
                  <h3 className="font-bold text-white">Advanced Settings</h3>
                  <button onClick={() => setIsAdvancedPanelOpen(false)} className="p-1 rounded-full hover:bg-gray-700 text-white"><CloseIcon className="h-5 w-5"/></button>
              </div>
              <div className="p-4 space-y-6 overflow-y-auto flex-grow">
                  <div className="space-y-2">
                    <label className="text-sm font-semibold flex items-center gap-2 text-white"><ProtectIcon className="h-5 w-5"/> Password Protection</label>
                    <input type="password" placeholder="Enter password" value={password} onChange={e => setPassword(e.target.value)} className="w-full p-2 border rounded-md bg-gray-800 border-gray-600 text-white placeholder-gray-400" />
                  </div>
                  <div className="space-y-2">
                    <label className="text-sm font-semibold flex items-center gap-2 text-white"><TagIcon className="h-5 w-5"/> SEO</label>
                    <input type="text" placeholder="SEO Title" value={seoTitle} onChange={e => setSeoTitle(e.target.value)} className="w-full p-2 border rounded-md bg-gray-800 border-gray-600 text-white placeholder-gray-400" />
                    <textarea placeholder="SEO Description" rows={3} value={seoDescription} onChange={e => setSeoDescription(e.target.value)} className="w-full p-2 border rounded-md bg-gray-800 border-gray-600 text-white placeholder-gray-400" />
                  </div>
                  <div className="space-y-3">
                    <h4 className="text-sm font-semibold text-white">Branding</h4>
                     <div className="flex items-center justify-between text-white"><label>Show PDFBullet Logo</label><input type="checkbox" checked={showPdfBulletLogo} onChange={e => setShowPdfBulletLogo(e.target.checked)} className="h-4 w-4 rounded" /></div>
                     <div {...getLogoRootProps()} className="p-3 text-center border-2 border-dashed border-gray-600 rounded-md cursor-pointer">
                        <input {...getLogoInputProps()} />
                        {uploadedLogo ? <img src={uploadedLogo} alt="Logo Preview" className="h-16 mx-auto" /> : <p className="text-xs text-gray-400">Upload your logo</p>}
                        <p className="text-xs text-yellow-400 flex items-center justify-center gap-1 mt-1"><StarIcon className="h-3 w-3"/> Premium Feature</p>
                     </div>
                  </div>
              </div>
              <div className="p-4 border-t border-gray-700 flex justify-end gap-2">
                 <button onClick={() => setIsAdvancedPanelOpen(false)} className="px-4 py-2 border rounded-md font-semibold text-sm text-white border-gray-600 hover:bg-gray-700">Cancel</button>
                 <button onClick={() => setIsAdvancedPanelOpen(false)} className="px-4 py-2 bg-blue-600 text-white rounded-md font-semibold text-sm hover:bg-blue-700">Save</button>
              </div>
          </div>
      </div>
    </div>
  );
};
export default AddNewBookForm;