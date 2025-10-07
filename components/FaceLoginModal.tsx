import React, { useState, useEffect, useRef, useCallback } from 'react';
import { useAuth } from '../contexts/AuthContext.tsx';
import { db } from '../firebase/config.ts';
import { UserIcon, CameraIcon, LockIcon, CloseIcon, RefreshIcon } from './icons.tsx';

// This tells TypeScript that 'faceapi' will exist on the global scope,
// loaded from the script tag in index.html.
declare const faceapi: any;

interface FaceLoginModalProps {
  isOpen: boolean;
  onClose: () => void;
  mode: 'login' | 'register' | 'signup_redirect';
}

type ModalStep = 'INITIALIZING' | 'AWAITING_PERMISSION' | 'PERMISSION_DENIED' | 'EMAIL_INPUT' | 'CAMERA_ACTIVE' | 'PROCESSING' | 'SUCCESS' | 'ERROR';
type CameraStatus = 'Initializing...' | 'Position your face in the oval' | 'No face detected' | 'Multiple faces detected' | 'Hold still...' | 'Verifying...' | 'Face matched! Logging in...' | 'Saving your face data...';

const FaceLoginModal: React.FC<FaceLoginModalProps> = ({ isOpen, onClose, mode }) => {
  const { user, saveFaceDescriptor, loginWithFace } = useAuth();

  const [step, setStep] = useState<ModalStep>('INITIALIZING');
  const [cameraStatus, setCameraStatus] = useState<CameraStatus>('Initializing...');
  const [errorMessage, setErrorMessage] = useState('');
  const [email, setEmail] = useState('');

  const videoRef = useRef<HTMLVideoElement>(null);
  const streamRef = useRef<MediaStream | null>(null);
  const detectionIntervalRef = useRef<number | null>(null);
  const modelsLoaded = useRef(false);

  const cleanup = useCallback(() => {
    if (streamRef.current) {
      streamRef.current.getTracks().forEach(track => track.stop());
      streamRef.current = null;
    }
    if (detectionIntervalRef.current) {
      clearInterval(detectionIntervalRef.current);
      detectionIntervalRef.current = null;
    }
    setStep('INITIALIZING');
    setCameraStatus('Initializing...');
    setErrorMessage('');
    setEmail('');
  }, []);
  
  const handleClose = useCallback(() => {
      cleanup();
      onClose();
  }, [cleanup, onClose]);

  const loadModelsAndCheckPerms = useCallback(async () => {
    setErrorMessage('');
    setStep('INITIALIZING');

    if (typeof faceapi === 'undefined') {
      setStep('ERROR');
      setErrorMessage('Face recognition library could not be loaded. Please check your connection and refresh the page.');
      return;
    }

    if (!modelsLoaded.current) {
      try {
        await Promise.all([
          faceapi.nets.tinyFaceDetector.loadFromUri('/models'),
          faceapi.nets.faceLandmark68Net.loadFromUri('/models'),
          faceapi.nets.faceRecognitionNet.loadFromUri('/models'),
        ]);
        modelsLoaded.current = true;
      } catch (e) {
        setStep('ERROR');
        setErrorMessage('Could not load AI models required for face recognition. Please check your connection.');
        return;
      }
    }
    
    // Check permission status to decide the first UI to show
    try {
      const result = await navigator.permissions.query({ name: 'camera' as PermissionName });
      if (result.state === 'granted') {
        // If permission is already granted, move to the next logical step
        if (mode === 'register') {
          setStep('CAMERA_ACTIVE');
        } else {
          setStep('EMAIL_INPUT');
        }
      } else if (result.state === 'denied') {
        setStep('PERMISSION_DENIED');
      } else { // 'prompt'
        setStep('AWAITING_PERMISSION');
      }
    } catch (e) {
      // Fallback for browsers that don't support the Permissions API well
      setStep('AWAITING_PERMISSION');
    }
  }, [mode]);

  useEffect(() => {
    if (isOpen) {
      loadModelsAndCheckPerms();
    } else {
      cleanup();
    }
  }, [isOpen, loadModelsAndCheckPerms, cleanup]);

  const requestCamera = async () => {
    setErrorMessage('');
    try {
      const stream = await navigator.mediaDevices.getUserMedia({ video: { facingMode: 'user' } });
      streamRef.current = stream; // Store the stream
      if (videoRef.current) {
        videoRef.current.srcObject = stream;
      }
      // Success! Move to the next step.
      if (mode === 'register') {
        setStep('CAMERA_ACTIVE');
      } else {
        setStep('EMAIL_INPUT');
      }
    } catch (err) {
      console.error("Camera permission error:", err);
      setStep('PERMISSION_DENIED');
    }
  };

  const startDetection = useCallback(() => {
      if (detectionIntervalRef.current) clearInterval(detectionIntervalRef.current);

      const getDescriptor = async (): Promise<Float32Array | null> => {
        if (!videoRef.current || videoRef.current.paused) return null;
        
        const detection = await faceapi
            .detectSingleFace(videoRef.current, new faceapi.TinyFaceDetectorOptions())
            .withFaceLandmarks()
            .withFaceDescriptor();
            
        if (detection) {
            setCameraStatus('Hold still...');
            return detection.descriptor;
        } else {
            setCameraStatus('No face detected');
            return null;
        }
      };

      if (mode === 'register') {
        setCameraStatus('Position your face in the oval');
        const captureButton = document.getElementById('capture-face-btn');
        captureButton?.addEventListener('click', async () => {
            setCameraStatus('Saving your face data...');
            const descriptor = await getDescriptor();
            if (descriptor) {
                try {
                    await saveFaceDescriptor(Array.from(descriptor));
                    setStep('SUCCESS');
                    setTimeout(handleClose, 2000);
                } catch (e: any) {
                    setStep('ERROR');
                    setErrorMessage(e.message || "Failed to save face data.");
                }
            }
        });
      } else { // Login mode
          setCameraStatus('Position your face in the oval');
          detectionIntervalRef.current = window.setInterval(async () => {
              const descriptor = await getDescriptor();
              if (descriptor) {
                  clearInterval(detectionIntervalRef.current!);
                  setCameraStatus('Verifying...');
                  try {
                      // We need to fetch the user's stored descriptor first
                      const usersRef = db.collection('users');
                      const q = usersRef.where('email', '==', email.trim()).limit(1);
                      const snapshot = await q.get();

                      if (snapshot.empty || !snapshot.docs[0].data().faceDescriptor) {
                          throw new Error("Face Login is not set up for this account.");
                      }
                      
                      const storedDescriptor = new Float32Array(snapshot.docs[0].data().faceDescriptor);
                      const distance = faceapi.euclideanDistance(storedDescriptor, descriptor);

                      if (distance < 0.5) { // Threshold for a match
                          setCameraStatus('Face matched! Logging in...');
                          await loginWithFace(email);
                          setStep('SUCCESS');
                          setTimeout(handleClose, 1500);
                      } else {
                          setStep('ERROR');
                          setErrorMessage('Face not recognized. Please try again.');
                      }
                  } catch (err: any) {
                      setStep('ERROR');
                      setErrorMessage(err.message || 'Verification failed.');
                  }
              }
          }, 2000);
      }
  }, [email, handleClose, loginWithFace, mode, saveFaceDescriptor]);
  
  useEffect(() => {
    if (step === 'CAMERA_ACTIVE' && videoRef.current) {
        videoRef.current.onloadedmetadata = () => {
          startDetection();
        }
    }
  }, [step, startDetection]);

  const handleEmailSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!email.trim()) {
      setErrorMessage("Email address is required.");
      return;
    }
    setErrorMessage('');
    setStep('CAMERA_ACTIVE');
  };

  const renderContent = () => {
    switch (step) {
      case 'INITIALIZING':
        return <div className="p-8 text-center"><div className="animate-spin rounded-full h-8 w-8 border-b-2 border-brand-red mx-auto"></div><p className="mt-4">Initializing...</p></div>;
      
      case 'AWAITING_PERMISSION':
        return (
            <div className="p-8 text-center">
                <CameraIcon className="h-12 w-12 mx-auto text-blue-500 mb-4"/>
                <h3 className="font-bold text-lg">Enable Camera Access</h3>
                <p className="text-sm text-gray-600 dark:text-gray-400 mt-2">We need your permission to use the camera for face recognition.</p>
                <button onClick={requestCamera} className="mt-6 w-full bg-brand-red text-white font-bold py-2.5 rounded-md">Grant Permission</button>
            </div>
        );
        
      case 'PERMISSION_DENIED':
        return (
            <div className="p-8 text-center">
                <LockIcon className="h-12 w-12 mx-auto text-red-500 mb-4"/>
                <h3 className="font-bold text-lg">Camera Access Denied</h3>
                <p className="text-sm text-gray-600 dark:text-gray-400 mt-2">Please enable camera access in your browser's site settings and try again.</p>
                <button onClick={handleClose} className="mt-6 w-full bg-gray-600 text-white font-bold py-2.5 rounded-md">Close</button>
            </div>
        );
        
      case 'EMAIL_INPUT':
        return (
            <form onSubmit={handleEmailSubmit} className="p-6 space-y-4">
                <h3 className="font-bold text-center">Log In with Face ID</h3>
                <div>
                    <label htmlFor="face-login-email" className="block text-sm font-medium text-gray-700 dark:text-gray-300">Email Address</label>
                    <input type="email" id="face-login-email" value={email} onChange={e => setEmail(e.target.value)} required className="w-full mt-1 p-2 border border-gray-300 dark:border-gray-600 rounded-md bg-white dark:bg-black" placeholder="you@example.com" />
                </div>
                {errorMessage && <p className="text-sm text-red-500 text-center">{errorMessage}</p>}
                <button type="submit" className="w-full bg-brand-red text-white font-bold py-2.5 rounded-md hover:bg-brand-red-dark">Continue</button>
            </form>
        );
        
      case 'CAMERA_ACTIVE':
        return (
            <div className="p-6 text-center">
                <div className="relative w-full max-w-[256px] h-auto aspect-[3/4] mx-auto bg-black rounded-lg overflow-hidden border border-gray-300 dark:border-gray-700">
                    <video ref={videoRef} autoPlay playsInline muted className="w-full h-full object-cover transform -scale-x-100" />
                    <div className="absolute inset-0 flex items-center justify-center pointer-events-none">
                        <div className="w-[70%] h-[80%] border-4 border-white/50 rounded-[50%] animate-pulse-glow"></div>
                    </div>
                </div>
                <p className="mt-4 font-semibold h-5">{cameraStatus}</p>
                {mode === 'register' && <button id="capture-face-btn" className="w-full mt-4 bg-brand-red text-white font-bold py-2 rounded-md">Capture Face</button>}
            </div>
        );
        
      case 'SUCCESS':
        return <div className="p-12 text-center"><h3 className="font-bold text-lg text-green-600">Success!</h3><p className="mt-2">{mode === 'register' ? 'Face Login has been enabled.' : 'You are now logged in.'}</p></div>;
        
      case 'ERROR':
        return (
            <div className="p-8 text-center">
                <h3 className="font-bold text-lg text-red-500">An Error Occurred</h3>
                <p className="text-sm text-gray-600 dark:text-gray-400 mt-2">{errorMessage}</p>
                 <button onClick={loadModelsAndCheckPerms} className="mt-4 flex items-center justify-center gap-2 w-full bg-gray-200 dark:bg-gray-700 font-bold py-2.5 rounded-md"><RefreshIcon className="h-5 w-5"/> Try Again</button>
            </div>
        );
      
      default: return null;
    }
  };
  
  if (mode === 'signup_redirect' && isOpen) {
    return (
      <div className="fixed inset-0 bg-black/60 z-[100] flex items-center justify-center p-4" onClick={handleClose}>
        <div className="bg-white dark:bg-black w-full max-w-sm rounded-lg shadow-xl p-6 text-center" onClick={e => e.stopPropagation()}>
          <UserIcon className="h-10 w-10 mx-auto text-brand-red mb-4"/>
          <h2 className="text-xl font-bold mb-2">Set Up Face Login After Sign Up</h2>
          <p className="text-gray-600 dark:text-gray-400">Please complete the sign-up process first. You can then enable Face Login from your <strong>Account Settings</strong> page.</p>
          <button onClick={handleClose} className="mt-4 w-full bg-brand-red text-white font-bold py-2 px-4 rounded-md">Got it</button>
        </div>
      </div>
    );
  }
  
  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 bg-black/60 z-[100] flex items-center justify-center p-4" onClick={handleClose}>
      <div className="bg-white dark:bg-black w-full max-w-sm rounded-lg shadow-xl" onClick={e => e.stopPropagation()}>
        <header className="flex items-center justify-between p-4 border-b border-gray-200 dark:border-gray-700">
          <h2 className="text-xl font-bold">{mode === 'register' ? 'Set Up Face Login' : 'Continue with Face ID'}</h2>
          <button onClick={handleClose} className="text-gray-500 hover:text-gray-800"><CloseIcon className="h-6 w-6"/></button>
        </header>
        {renderContent()}
      </div>
    </div>
  );
};

export default FaceLoginModal;
