import React, { useState, useCallback, useEffect } from 'react';
import { useDropzone } from 'react-dropzone';
import { useAuth } from '../contexts/AuthContext.tsx';
import { UploadCloudIcon, CloseIcon } from './icons.tsx';

interface ProfileImageModalProps {
  isOpen: boolean;
  onClose: () => void;
}

const ProfileImageModal: React.FC<ProfileImageModalProps> = ({ isOpen, onClose }) => {
  const [file, setFile] = useState<File | null>(null);
  const [preview, setPreview] = useState<string | null>(null);
  const [error, setError] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const { user, updateProfileImage } = useAuth();

  const onDrop = useCallback((acceptedFiles: File[], fileRejections: any[]) => {
    setError('');
    if (fileRejections.length > 0) {
        setError('Please upload a valid image file (PNG, JPG, etc.) under 2MB.');
        return;
    }
    if (acceptedFiles.length > 0) {
      const selectedFile = acceptedFiles[0];
      setFile(selectedFile);
      const reader = new FileReader();
      reader.onloadend = () => {
        setPreview(reader.result as string);
      };
      reader.readAsDataURL(selectedFile);
    }
  }, []);

  const { getRootProps, getInputProps, isDragActive } = useDropzone({
    onDrop,
    accept: { 'image/*': ['.jpeg', '.png', '.gif', '.jpg', '.webp'] },
    maxSize: 2 * 1024 * 1024, // 2MB
    multiple: false,
  });

  const handleSave = async () => {
    if (!file || !user) return;
    setIsLoading(true);
    setError('');
    try {
        await updateProfileImage(file);
        handleClose();
    } catch(err: any) {
        setError(err.message || 'Failed to save image.');
    } finally {
        setIsLoading(false);
    }
  };
  
  const handleClose = () => {
      setFile(null);
      setPreview(null);
      setError('');
      setIsLoading(false);
      onClose();
  }

  useEffect(() => {
    if (!isOpen) return;
    const handleKeyDown = (e: KeyboardEvent) => {
        if (e.key === 'Escape') {
            handleClose();
        }
    };
    document.addEventListener('keydown', handleKeyDown);
    return () => {
        document.removeEventListener('keydown', handleKeyDown);
    };
  }, [isOpen, handleClose]);

  if (!isOpen) return null;

  return (
    <div
      className="fixed inset-0 bg-black/60 dark:bg-black/80 z-[100] flex items-center justify-center p-4 animate-fade-in-down"
      style={{animationDuration: '300ms'}}
      onClick={handleClose}
      role="dialog"
      aria-modal="true"
      aria-labelledby="profile-image-modal-title"
    >
      <div
        className="bg-white dark:bg-gray-900 w-full max-w-lg flex flex-col rounded-xl shadow-2xl"
        onClick={e => e.stopPropagation()}
      >
        <header className="p-4 bg-gray-50 dark:bg-gray-800/50 rounded-t-xl border-b border-gray-200 dark:border-gray-700">
          <div className="flex items-center justify-between">
            <h2 id="profile-image-modal-title" className="text-xl font-bold text-gray-800 dark:text-gray-100">Change Profile Photo</h2>
            <button onClick={handleClose} className="p-1 rounded-full text-gray-500 hover:bg-gray-200 dark:text-gray-400 dark:hover:bg-gray-700 transition-colors" aria-label="Close modal">
              <CloseIcon className="h-6 w-6" />
            </button>
          </div>
        </header>
        <main className="p-8">
            {error && <p className="text-center text-sm text-red-500 bg-red-100 dark:bg-red-900/30 p-3 rounded-md mb-4">{error}</p>}
            
            {preview ? (
                 <div className="text-center">
                    <img src={preview} alt="Preview" className="w-40 h-40 rounded-full mx-auto object-cover border-4 border-gray-200 dark:border-gray-700" />
                    <button onClick={() => { setFile(null); setPreview(null); }} className="mt-4 text-sm text-brand-red hover:underline">Choose a different photo</button>
                 </div>
            ) : (
                <div 
                    {...getRootProps()} 
                    className={`relative flex flex-col items-center justify-center p-12 border-2 border-dashed rounded-lg cursor-pointer transition-colors duration-300 ${isDragActive ? 'border-brand-red bg-red-50 dark:bg-red-900/20' : 'border-gray-300 dark:border-gray-600 bg-gray-50 dark:bg-gray-800'}`}
                    >
                    <input {...getInputProps()} />
                    <UploadCloudIcon className="h-12 w-12 text-gray-400" />
                    <p className="mt-4 font-semibold text-gray-700 dark:text-gray-200">Drag & drop or click to upload</p>
                    <p className="mt-1 text-xs text-gray-500 dark:text-gray-400">PNG, JPG, GIF up to 2MB</p>
                </div>
            )}
        </main>
        <footer className="flex justify-end gap-4 p-4 bg-gray-50 dark:bg-gray-800/50 rounded-b-xl">
            <button onClick={handleClose} className="px-4 py-2 text-sm font-semibold text-gray-700 dark:text-gray-300 bg-white dark:bg-gray-700 border border-gray-300 dark:border-gray-600 rounded-md hover:bg-gray-50 dark:hover:bg-gray-600 transition-colors">Cancel</button>
            <button onClick={handleSave} disabled={!file || isLoading} className="px-4 py-2 text-sm font-semibold text-white bg-brand-red rounded-md hover:bg-brand-red-dark transition-colors disabled:bg-red-300 dark:disabled:bg-red-800 disabled:cursor-not-allowed">
                {isLoading ? 'Saving...' : 'Save Changes'}
            </button>
        </footer>
      </div>
    </div>
  );
};

export default ProfileImageModal;