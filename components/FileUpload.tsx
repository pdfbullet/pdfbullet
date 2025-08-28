import React, { useCallback, useEffect, useState } from 'react';
import { useDropzone, Accept } from 'react-dropzone';
import { UploadCloudIcon, GoogleDriveIcon, DropboxIcon, PlusIcon, CloseIcon, DesktopIcon } from './icons.tsx';
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
  children?: React.ReactNode;
}

const FileUpload: React.FC<FileUploadProps> = ({ tool, files, setFiles, accept, children }) => {
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

  const { getRootProps, getInputProps, isDragActive, open } = useDropzone({
    onDrop,
    accept: accept || { 'application/pdf': ['.pdf'] },
    noClick: true, // We will trigger the file input manually
  });
  
  const removeFile = (fileName: string) => {
    setFiles(files.filter(file => file.name !== fileName));
  };
  
  const addMoreFilesProps = useDropzone({ onDrop, accept: accept || { 'application/pdf': ['.pdf'] } });

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

  const handleGoogleDriveClick = (e: React.MouseEvent) => {
    e.stopPropagation();
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
  
  const handleDropboxClick = (e: React.MouseEvent) => {
      e.stopPropagation();
      Dropbox.choose({
          success: (dropboxFiles: any[]) => {
              dropboxFiles.forEach(file => handleCloudFile(file.link, file.name));
          },
          linkType: "direct",
          multiselect: true,
      });
  };

  const handleOneDriveClick = (e: React.MouseEvent) => {
    e.stopPropagation();
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
    <div className="w-full">
      {files.length === 0 ? (
        <div 
          {...getRootProps()} 
          className={`relative flex flex-col items-center justify-center p-12 rounded-lg cursor-pointer transition-colors duration-300 ${isDragActive ? 'bg-red-50 dark:bg-red-900/20 ring-2 ring-brand-red ring-dashed' : 'bg-transparent'}`}
        >
          <input {...getInputProps()} />
          
          <div className="flex items-center space-x-2">
            <button
              type="button"
              onClick={open}
              className={`${tool.color} ${tool.hoverColor} text-white font-bold py-4 px-10 rounded-lg text-xl transition-colors shadow-lg flex-grow-0`}
            >
              Select {tool.fileTypeDisplayName || 'files'}
            </button>
            
            <button
                onClick={handleGoogleDriveClick}
                aria-label="Select from Google Drive"
                title="Select from Google Drive"
                className={`p-4 rounded-lg shadow-lg transition-colors ${tool.color} ${tool.hoverColor} text-white`}
              >
                <GoogleDriveIcon className="h-6 w-6" />
              </button>
              <button
                onClick={handleDropboxClick}
                aria-label="Select from Dropbox"
                title="Select from Dropbox"
                className={`p-4 rounded-lg shadow-lg transition-colors ${tool.color} ${tool.hoverColor} text-white`}
              >
                <DropboxIcon className="h-6 w-6" />
              </button>
          </div>

          <p className="mt-4 text-gray-600 dark:text-gray-400">
            or drop {tool.fileTypeDisplayName || ''} {tool.fileTypeNounPlural || 'here'}
          </p>
        </div>
      ) : (
         <div className="w-full grid grid-cols-1 lg:grid-cols-12 gap-8 items-start">
            {/* File Previews (Main Area) */}
            <div className="lg:col-span-8 xl:col-span-9 grid grid-cols-1 sm:grid-cols-2 xl:grid-cols-3 gap-6">
                {files.map(file => (
                    <div key={`${file.name}-${file.lastModified}`} className="relative group bg-white dark:bg-surface-dark border border-gray-200 dark:border-gray-800 rounded-2xl p-4 flex flex-col items-center justify-center text-center shadow-md">
                        <div className="w-full bg-white dark:bg-gray-900/50 rounded-lg p-4 flex-grow flex items-center justify-center aspect-[4/3]">
                            <tool.Icon className={`w-16 h-16 ${tool.textColor}`} />
                        </div>
                        <p className="w-full text-sm font-semibold text-gray-700 dark:text-gray-300 truncate mt-3" title={file.name}>{file.name}</p>
                        <button onClick={() => removeFile(file.name)} className="absolute top-2 right-2 p-1.5 bg-gray-800/60 hover:bg-red-600/80 text-white rounded-full opacity-0 group-hover:opacity-100 transition-opacity" aria-label={`Remove ${file.name}`}>
                            <CloseIcon className="h-4 w-4" />
                        </button>
                    </div>
                ))}
            </div>

            {/* Actions Sidebar */}
            <div className="lg:col-span-4 xl:col-span-3 lg:sticky lg:top-24">
                 <div className="flex justify-end relative mb-8">
                    <div className="absolute right-[80px] top-1/2 -translate-y-1/2 bg-gray-800 text-white text-sm font-semibold px-3 py-1 rounded-md shadow-lg whitespace-nowrap">
                        Add more files
                        <div className="absolute right-[-5px] top-1/2 -translate-y-1/2 w-3 h-3 bg-gray-800 transform rotate-45"></div>
                    </div>

                    <div className="flex flex-col items-center gap-2">
                        <div className="relative">
                            <button {...addMoreFilesProps.getRootProps()} onClick={addMoreFilesProps.open} title="Add more files" className="w-16 h-16 bg-brand-red rounded-full flex items-center justify-center text-white shadow-lg hover:bg-brand-red-dark transition-colors">
                                <input {...addMoreFilesProps.getInputProps()} />
                                <PlusIcon className="h-8 w-8" />
                            </button>
                            <span className="absolute -top-1 -right-1 w-6 h-6 bg-gray-900 text-white text-xs font-bold rounded-full flex items-center justify-center border-2 border-white dark:border-surface-dark">{files.length}</span>
                        </div>
                        <button onClick={addMoreFilesProps.open} title="Add from computer" className="w-12 h-12 bg-brand-red rounded-full flex items-center justify-center text-white shadow-lg hover:bg-brand-red-dark transition-colors">
                            <DesktopIcon className="h-6 w-6" />
                        </button>
                        <button onClick={handleGoogleDriveClick} title="Add from Google Drive" className="w-12 h-12 bg-brand-red rounded-full flex items-center justify-center text-white shadow-lg hover:bg-brand-red-dark transition-colors">
                            <GoogleDriveIcon className="h-6 w-6" />
                        </button>
                        <button onClick={handleDropboxClick} title="Add from Dropbox" className="w-12 h-12 bg-brand-red rounded-full flex items-center justify-center text-white shadow-lg hover:bg-brand-red-dark transition-colors">
                            <DropboxIcon className="h-6 w-6" />
                        </button>
                    </div>
                </div>
                {children}
            </div>
        </div>
      )}
    </div>
  );
};

export default FileUpload;