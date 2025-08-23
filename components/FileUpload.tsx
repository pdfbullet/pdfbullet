import React, { useCallback, useEffect, useState } from 'react';
import { useDropzone, Accept } from 'react-dropzone';
import { UploadCloudIcon, FileIcon, GoogleDriveIcon, DropboxIcon, OneDriveIcon } from './icons.tsx';
import { Tool } from '../types.ts';

// TODO: Replace with your actual API keys and IDs
const GOOGLE_API_KEY = 'AIzaSyD3MDVQ3bkz0n3Hu3ju-sGCIMCybUQGbVU';
const GOOGLE_CLIENT_ID = '415789226795-0mu2ru52dcc5b649njfarn059lkjkcnk.apps.googleusercontent.com';
const ONEDRIVE_CLIENT_ID = 'YOUR_ONEDRIVE_CLIENT_ID';

// These declarations are needed to access the cloud picker SDKs loaded in index.html
declare const gapi: any;
declare const Dropbox: any;
declare const OneDrive: any;
declare const google: any;

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
  const [gapiLoaded, setGapiLoaded] = useState(false);
  const [pickerApiLoaded, setPickerApiLoaded] = useState(false);
  const [oauthToken, setOauthToken] = useState<any>(null);

  useEffect(() => {
    if (gapi) {
      gapi.load('client:picker', () => {
        setGapiLoaded(true);
      });
    }
  }, []);

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

  const handleCloudFile = async (url: string, name: string) => {
    try {
      const response = await fetch(url);
      if (!response.ok) throw new Error(`Failed to fetch file: ${response.statusText}`);
      const blob = await response.blob();
      const file = new File([blob], name, { type: blob.type });
      onDrop([file]);
    } catch (error) {
      console.error("Error fetching cloud file:", error);
    }
  };

  const handleGoogleDriveClick = () => {
    if (!gapiLoaded || !GOOGLE_API_KEY || !GOOGLE_CLIENT_ID) {
        alert("Google Drive Picker is not configured. Please provide API Key and Client ID.");
        return;
    }

    gapi.load('picker', { 'callback': () => setPickerApiLoaded(true) });
    gapi.auth.authorize(
      { client_id: GOOGLE_CLIENT_ID, scope: ['https://www.googleapis.com/auth/drive.readonly'], immediate: false },
      (authResult: any) => {
        if (authResult && !authResult.error) {
          setOauthToken(authResult);
          createPicker(authResult.access_token);
        }
      }
    );
  };
  
  const createPicker = (token: string) => {
      const view = new google.picker.View(google.picker.ViewId.DOCS);
      const picker = new google.picker.PickerBuilder()
          .setApiKey(GOOGLE_API_KEY)
          .setOAuthToken(token)
          .addView(view)
          .setCallback(pickerCallback)
          .build();
      picker.setVisible(true);
  };
  
  const pickerCallback = (data: any) => {
      if (data[google.picker.Response.ACTION] === google.picker.Action.PICKED) {
          const doc = data[google.picker.Response.DOCUMENTS][0];
          const url = `https://www.googleapis.com/drive/v3/files/${doc.id}?alt=media`;
          fetch(url, {
              headers: { 'Authorization': `Bearer ${oauthToken.access_token}` }
          })
          .then(res => res.blob())
          .then(blob => {
              const file = new File([blob], doc.name, { type: doc.mimeType });
              onDrop([file]);
          });
      }
  };
  
  const handleDropboxClick = () => {
      Dropbox.choose({
          success: (dropboxFiles: any[]) => {
              dropboxFiles.forEach(file => handleCloudFile(file.link, file.name));
          },
          linkType: "direct",
          multiselect: true,
      });
  };

  const handleOneDriveClick = () => {
    if (!ONEDRIVE_CLIENT_ID || ONEDRIVE_CLIENT_ID === 'YOUR_ONEDRIVE_CLIENT_ID') {
      alert("OneDrive Picker is not configured. Please provide a Client ID.");
      return;
    }
    OneDrive.open({
        clientId: ONEDRIVE_CLIENT_ID,
        action: "download",
        multiSelect: true,
        success: (files: any) => {
            files.value.forEach((file: any) => handleCloudFile(file["@microsoft.graph.downloadUrl"], file.name));
        },
        cancel: () => {},
        error: (e: any) => console.error(e)
    });
  };

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
          <div className="mt-6 pt-6 border-t border-dashed border-gray-300 dark:border-gray-600 w-full flex flex-col sm:flex-row items-center justify-center gap-4">
              <button onClick={handleGoogleDriveClick} className="flex items-center gap-2 bg-gray-100 dark:bg-gray-800 hover:bg-gray-200 dark:hover:bg-gray-700 font-semibold py-2 px-4 rounded-md transition-colors">
                  <GoogleDriveIcon className="h-5 w-5" /> Google Drive
              </button>
              <button onClick={handleDropboxClick} className="flex items-center gap-2 bg-gray-100 dark:bg-gray-800 hover:bg-gray-200 dark:hover:bg-gray-700 font-semibold py-2 px-4 rounded-md transition-colors">
                  <DropboxIcon className="h-5 w-5" /> Dropbox
              </button>
              <button onClick={handleOneDriveClick} className="flex items-center gap-2 bg-gray-100 dark:bg-gray-800 hover:bg-gray-200 dark:hover:bg-gray-700 font-semibold py-2 px-4 rounded-md transition-colors">
                  <OneDriveIcon className="h-5 w-5" /> OneDrive
              </button>
          </div>
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
