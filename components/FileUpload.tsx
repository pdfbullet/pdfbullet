

import React, { useCallback } from 'react';
import { useDropzone, Accept } from 'react-dropzone';
import { UploadCloudIcon, FileIcon } from './icons.tsx';
import { Tool } from '../types.ts';

interface FileUploadProps {
  tool: Tool;
  files: File[];
  setFiles: (files: File[]) => void;
  accept?: Accept;
}

const formatBytes = (bytes: number, decimals = 2) => {
  if (bytes === 0) return '0 Bytes';
  const k = 1024;
  const dm = decimals < 0 ? 0 : decimals;
  const sizes = ['Bytes', 'KB', 'MB', 'GB', 'TB'];
  const i = Math.floor(Math.log(bytes) / Math.log(k));
  return parseFloat((bytes / Math.pow(k, i)).toFixed(dm)) + ' ' + sizes[i];
};

const FileUpload: React.FC<FileUploadProps> = ({ tool, files, setFiles, accept }) => {

  const onDrop = useCallback((acceptedFiles: File[]) => {
    setFiles([...files, ...acceptedFiles].filter((file, index, self) =>
      index === self.findIndex((f) => (
        f.name === file.name && f.size === file.size
      ))
    ));
  }, [files, setFiles]);

  const { getRootProps, getInputProps, isDragActive } = useDropzone({
    onDrop,
    accept: accept || { 'application/pdf': ['.pdf'] },
  });
  
  const removeFile = (fileName: string) => {
    setFiles(files.filter(file => file.name !== fileName));
  };
  
  const addMoreFilesProps = useDropzone({ onDrop });

  return (
    <div className="w-full max-w-4xl mx-auto">
      {files.length === 0 ? (
        <div 
          {...getRootProps()} 
          title="Drag and drop files or click to select"
          className={`relative flex flex-col items-center justify-center p-12 border-2 border-dashed rounded-lg cursor-pointer transition-colors duration-300 ${isDragActive ? 'border-brand-red bg-red-50 dark:bg-red-900/20' : 'border-gray-300 dark:border-gray-600 bg-white dark:bg-surface-dark'}`}
        >
          <input {...getInputProps()} aria-label={`Upload files for ${tool.title}`} />
          <div className={`${tool.color} p-4 rounded-full`}>
            <UploadCloudIcon className="h-12 w-12 text-white" />
          </div>
          <p className="mt-6 text-2xl font-bold dark:text-gray-100">Drag and drop files here</p>
          <p className="mt-2 text-gray-500 dark:text-gray-400">or</p>
          <button type="button" title="Select files from your computer" className={`mt-4 ${tool.color} ${tool.hoverColor} text-white font-bold py-3 px-8 rounded-lg text-lg transition-colors`}>
            Select Files
          </button>
        </div>
      ) : (
        <div className="bg-white dark:bg-surface-dark p-8 rounded-lg shadow-lg w-full">
            <div className="max-h-64 overflow-y-auto pr-4 no-scrollbar">
            {files.map(file => (
                <div key={file.name} className="flex items-center justify-between p-3 mb-2 bg-gray-100 dark:bg-soft-dark dark:border dark:border-gray-800 rounded-md">
                    <div className="flex items-center space-x-3 overflow-hidden">
                        <FileIcon className="h-6 w-6 text-gray-500 dark:text-gray-400" />
                        <span className="text-gray-700 dark:text-gray-300 font-medium truncate" title={file.name}>{file.name}</span>
                        <span className="text-gray-500 dark:text-gray-400 text-sm flex-shrink-0">({formatBytes(file.size)})</span>
                    </div>
                    <button onClick={() => removeFile(file.name)} className="text-gray-400 hover:text-red-500 transition-colors flex-shrink-0 ml-2" aria-label={`Remove ${file.name}`} title={`Remove ${file.name}`}>
                        <svg className="h-5 w-5" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M6 18L18 6M6 6l12 12" />
                        </svg>
                    </button>
                </div>
            ))}
            </div>
            <div className="flex justify-center mt-6">
                <div {...addMoreFilesProps.getRootProps()} className="inline-block">
                    <input {...addMoreFilesProps.getInputProps()} aria-label={`Add more files for ${tool.title}`} />
                    <button type="button" title="Add more files" className={`flex items-center gap-2 text-white font-bold py-2 px-6 rounded-lg text-md transition-colors ${tool.color} ${tool.hoverColor}`}>
                        <UploadCloudIcon className="h-5 w-5" />
                        Add more files
                    </button>
                </div>
            </div>
        </div>
      )}
    </div>
  );
};

export default FileUpload;