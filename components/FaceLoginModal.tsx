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

type ModalStep = 'INITIALIZING_MODELS' | 'AWAITING_PERMISSION' | 'PERMISSION_DENIED' | 'EMAIL_INPUT' | 'CAMERA_ACTIVE' | 'PROCESSING' | 'SUCCESS' | 'ERROR';
// FIX: Added 'Multiple faces detected' to the CameraStatus type definition to resolve a TypeScript error where an un-typed string was being assigned to a state with a strict literal type.
type CameraStatus = 'Loading AI models...' | 'Position your face in the oval' | 'No face detected' | 'Multiple faces detected' | 'Hold still...' | 'Verifying...' | 'Face matched! Logging in...' | 'Saving your face data...';

const FaceLoginModal: React.FC<FaceLoginModalProps> = ({ isOpen, onClose, mode }) => {
  const { user, saveFaceDescriptor, loginWithFace } = useAuth();

  const [step, setStep] = useState<ModalStep>('INITIALIZING_MODELS');
  const [cameraStatus, setCameraStatus] = useState<CameraStatus>('Loading AI models...');
  const [errorMessage, setErrorMessage] = useState('');
  const [email, setEmail] = useState('');

  const videoRef = useRef<HTMLVideoElement>(null);
  const streamRef = useRef<MediaStream | null>(null);
  const modelsLoaded = useRef(false);
  const detectionIntervalRef = useRef<number | null>(null);

  const cleanup = useCallback(() => {
    if (streamRef.current) {
      streamRef.current.getTracks().forEach(track => track.stop());
      streamRef.current = null;
    }
    if (detectionIntervalRef.current) {
      clearInterval(detectionIntervalRef.current);
      detectionIntervalRef.current = null;
    }
    setStep('INITIALIZING_MODELS');
    setCameraStatus('Loading AI models...');
    setErrorMessage('');
    setEmail('');
  }, []);

  const handleClose = useCallback(() => {
    cleanup();
    onClose();
  }, [cleanup, onClose]);

  const loadModels = useCallback(async () => {
    if (modelsLoaded.current) return true;
    try {
      if (typeof faceapi === 'undefined') {
        throw new Error('Face recognition library is not loaded.');
      }
      // Load models from a reliable CDN
      const MODEL_URL = 'https://cdn.jsdelivr.net/npm/face-api.js@0.22.2/weights/';
      await Promise.all([
        faceapi.nets.tinyFaceDetector.loadFromUri(MODEL_URL),
        faceapi.nets.faceLandmark68Net.loadFromUri(MODEL_URL),
        faceapi.nets.faceRecognitionNet.loadFromUri(MODEL_URL),
      ]);
      modelsLoaded.current = true;
      return true;
    } catch (e) {
      console.error("Model loading error:", e);
      setStep('ERROR');
      setErrorMessage('Could not load AI models required for face recognition. Please check your internet connection and try again.');
      return false;
    }
  }, []);
  
  const checkPermissionsAndProceed = async () => {
    try {
      const result = await navigator.permissions.query({ name: 'camera' as PermissionName });
      if (result.state === 'granted') {
        if (mode === 'register' || mode === 'signup_redirect') {
          setStep('CAMERA_ACTIVE');
        } else {
          setStep('EMAIL_INPUT');
        }
      } else if (result.state === 'denied') {
        setStep('PERMISSION_DENIED');
      } else {
        setStep('AWAITING_PERMISSION');
      }
    } catch (e) {
      setStep('AWAITING_PERMISSION');
    }
  };
  
  useEffect(() => {
    const initialize = async () => {
      if (isOpen) {
        setStep('INITIALIZING_MODELS');
        setCameraStatus('Loading AI models...');
        const modelsAreLoaded = await loadModels();
        if (modelsAreLoaded) {
          await checkPermissionsAndProceed();
        }
      } else {
        cleanup();
      }
    };
    initialize();
  }, [isOpen, loadModels, cleanup]);

  const requestCamera = async () => {
    try {
      const stream = await navigator.mediaDevices.getUserMedia({ video: { facingMode: 'user' } });
      streamRef.current = stream;
      if (videoRef.current) {
        videoRef.current.srcObject = stream;
      }
      if (mode === 'register' || mode === 'signup_redirect') {
        setStep('CAMERA_ACTIVE');
      } else {
        setStep('EMAIL_INPUT');
      }
    } catch (err) {
      setStep('PERMISSION_DENIED');
    }
  };

  const startDetection = useCallback(async () => {
      if (detectionIntervalRef.current) clearInterval(detectionIntervalRef.current);
      if (!videoRef.current) return;

      setCameraStatus('Position your face in the oval');

      const detectAndProcess = async () => {
        if (!videoRef.current || videoRef.current.paused) return;

        const detections = await faceapi
            .detectAllFaces(videoRef.current, new faceapi.TinyFaceDetectorOptions())
            .withFaceLandmarks()
            .withFaceDescriptor();

        if (detections.length === 0) {
            setCameraStatus('No face detected');
            return;
        }
        if (detections.length > 1) {
            setCameraStatus('Multiple faces detected');
            return;
        }
        
        // Single face detected
        setCameraStatus('Hold still...');
        const descriptor = detections[0].descriptor;

        if (mode === 'register') {
            setStep('PROCESSING');
            setCameraStatus('Saving your face data...');
            try {
                await saveFaceDescriptor(Array.from(descriptor));
                setStep('SUCCESS');
                setTimeout(handleClose, 2000);
            } catch (e: any) {
                setStep('ERROR');
                setErrorMessage(e.message || "Failed to save face data.");
            }
        } else { // Login mode
            setStep('PROCESSING');
            setCameraStatus('Verifying...');
            try {
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
      };

      if (mode === 'register') {
          // In register mode, wait for button click
          const captureButton = document.getElementById('capture-face-btn');
          if (captureButton) {
            captureButton.onclick = () => {
                if(detectionIntervalRef.current) clearInterval(detectionIntervalRef.current);
                detectAndProcess();
            };
          }
      } else {
          // In login mode, auto-detect
          detectionIntervalRef.current = window.setInterval(detectAndProcess, 2500);
      }
  }, [email, handleClose, loginWithFace, mode, saveFaceDescriptor]);

  useEffect(() => {
    if (step === 'CAMERA_ACTIVE' && videoRef.current) {
        videoRef.current.onplaying = () => {
            startDetection();
        };
    }
  }, [step, startDetection]);

  const handleEmailSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!email.trim() || !email.includes('@')) {
      setErrorMessage("Please enter a valid email address.");
      return;
    }
    setErrorMessage('');
    setStep('CAMERA_ACTIVE');
  };

  const renderContent = () => {
    const isCameraStep = step === 'CAMERA_ACTIVE' || step === 'PROCESSING';
    const mainTitle = mode === 'register' ? 'Set Up Face Login' : 'Continue with Face ID';

    return (
      <>
        <header className="flex items-center justify-between p-4 border-b border-gray-200 dark:border-gray-700">
          <h2 className="text-xl font-bold">{mainTitle}</h2>
          <button onClick={handleClose} className="text-gray-500 hover:text-gray-800"><CloseIcon className="h-6 w-6"/></button>
        </header>
        
        <div className="p-6">
            {step === 'INITIALIZING_MODELS' && <div className="text-center py-10"><div className="animate-spin rounded-full h-8 w-8 border-b-2 border-brand-red mx-auto"></div><p className="mt-4 font-semibold">{cameraStatus}</p></div>}
            
            {step === 'AWAITING_PERMISSION' && <div className="text-center py-6"><CameraIcon className="h-12 w-12 mx-auto text-blue-500 mb-4"/><h3 className="font-bold text-lg">Enable Camera Access</h3><p className="text-sm text-gray-600 dark:text-gray-400 mt-2">We need permission to use your camera for face recognition.</p><button onClick={requestCamera} className="mt-6 w-full bg-brand-red text-white font-bold py-2.5 rounded-md">Grant Permission</button></div>}
            
            {step === 'PERMISSION_DENIED' && <div className="text-center py-6"><LockIcon className="h-12 w-12 mx-auto text-red-500 mb-4"/><h3 className="font-bold text-lg">Camera Access Denied</h3><p className="text-sm text-gray-600 dark:text-gray-400 mt-2">Please enable camera access in your browser's site settings, then try again.</p><button onClick={handleClose} className="mt-6 w-full bg-gray-600 text-white font-bold py-2.5 rounded-md">Close</button></div>}
            
            {step === 'EMAIL_INPUT' && <form onSubmit={handleEmailSubmit} className="space-y-4"><label htmlFor="face-login-email" className="block text-sm font-medium">Email Address</label><input type="email" id="face-login-email" value={email} onChange={e => setEmail(e.target.value)} required className="w-full mt-1 p-2 border rounded-md" placeholder="you@example.com" />{errorMessage && <p className="text-sm text-red-500">{errorMessage}</p>}<button type="submit" className="w-full bg-brand-red text-white font-bold py-2.5 rounded-md">Continue</button></form>}

            {isCameraStep && <div className="text-center"><div className="relative w-full max-w-[240px] aspect-[3/4] mx-auto bg-black rounded-lg overflow-hidden border"><video ref={videoRef} autoPlay playsInline muted className="w-full h-full object-cover transform -scale-x-100" /><div className="absolute inset-0 flex items-center justify-center pointer-events-none"><div className="w-[75%] h-[85%] border-4 border-white/50 rounded-[50%] animate-pulse"></div></div>{step === 'PROCESSING' && <div className="absolute inset-0 bg-black/70 flex flex-col items-center justify-center"><div className="animate-spin rounded-full h-8 w-8 border-b-2 border-white"></div></div>}</div><p className="mt-4 font-semibold h-5">{cameraStatus}</p>{mode === 'register' && step === 'CAMERA_ACTIVE' && <button id="capture-face-btn" className="w-full mt-4 bg-brand-red text-white font-bold py-2 rounded-md">Capture Face</button>}</div>}
            
            {step === 'SUCCESS' && <div className="text-center py-12"><h3 className="font-bold text-lg text-green-600">Success!</h3><p className="mt-2">{mode === 'register' ? 'Face Login has been set up.' : 'Logged in successfully!'}</p></div>}
            
            {step === 'ERROR' && <div className="text-center py-8"><h3 className="font-bold text-lg text-red-500">An Error Occurred</h3><p className="text-sm text-gray-600 dark:text-gray-400 mt-2">{errorMessage}</p><button onClick={() => loadModels().then(checkPermissionsAndProceed)} className="mt-4 flex items-center justify-center gap-2 w-full bg-gray-200 font-bold py-2.5 rounded-md"><RefreshIcon className="h-5 w-5"/> Try Again</button></div>}
        </div>
      </>
    );
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
        {renderContent()}
      </div>
    </div>
  );
};

export default FaceLoginModal;
