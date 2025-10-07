import React, { useState, useEffect, useRef, useCallback } from 'react';
import { useAuth } from '../contexts/AuthContext.tsx';
import { db } from '../firebase/config.ts';
import { UserIcon, CameraIcon, LockIcon, CloseIcon } from './icons.tsx';

// This tells TypeScript that 'faceapi' will exist on the global scope,
// loaded from the script tag in index.html.
declare const faceapi: any;

interface FaceLoginModalProps {
  isOpen: boolean;
  onClose: () => void;
  mode: 'login' | 'register' | 'signup_redirect';
}

type ModalStep = 'LOADING_MODELS' | 'NEEDS_PERMS' | 'PERMS_DENIED' | 'NEEDS_EMAIL' | 'CAMERA_ACTIVE' | 'SUCCESS';
type CameraStatus = 'Initializing...' | 'Position your face in the oval' | 'No face detected' | 'Multiple faces detected' | 'Hold still, capturing...' | 'Face not recognized. Trying again...' | 'Verifying...' | 'Face matched! Logging in...' | 'Saving your face data...';


const FaceLoginModal: React.FC<FaceLoginModalProps> = ({ isOpen, onClose, mode }) => {
  const { user, saveFaceDescriptor, loginWithFace } = useAuth();
  
  // State Management
  const [step, setStep] = useState<ModalStep>('LOADING_MODELS');
  const [cameraStatus, setCameraStatus] = useState<CameraStatus>('Initializing...');
  const [errorMessage, setErrorMessage] = useState('');
  const [email, setEmail] = useState('');
  
  // Refs for camera and detection logic
  const videoRef = useRef<HTMLVideoElement>(null);
  const streamRef = useRef<MediaStream | null>(null);
  const detectionIntervalRef = useRef<number | null>(null);
  const modelsLoaded = useRef(false);

  const cleanup = useCallback(() => {
    streamRef.current?.getTracks().forEach(track => track.stop());
    streamRef.current = null;
    if (detectionIntervalRef.current) {
      clearInterval(detectionIntervalRef.current);
      detectionIntervalRef.current = null;
    }
    // Reset state for next open
    setStep('LOADING_MODELS');
    setCameraStatus('Initializing...');
    setErrorMessage('');
    setEmail('');
  }, []);
  
  const loadModelsAndCheckPerms = useCallback(async () => {
    setErrorMessage('');
    setStep('LOADING_MODELS');
    setCameraStatus('Initializing...');

    if (typeof faceapi === 'undefined') {
      setErrorMessage('Face recognition library could not be loaded. Please check your connection.');
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
        setErrorMessage('Could not load AI models. Please check your connection and refresh.');
        return;
      }
    }
    
    try {
      const result = await navigator.permissions.query({ name: 'camera' as PermissionName });
      if (result.state === 'granted') {
        if (mode === 'register') setStep('CAMERA_ACTIVE');
        else setStep('NEEDS_EMAIL');
      } else if (result.state === 'denied') {
        setStep('PERMS_DENIED');
      } else {
        setStep('NEEDS_PERMS');
      }
    } catch (e) {
      setStep('NEEDS_PERMS'); // Fallback for browsers without Permissions API
    }
  }, [mode]);

  useEffect(() => {
    if (isOpen) {
      loadModelsAndCheckPerms();
    } else {
      cleanup();
    }
    return cleanup;
  }, [isOpen, loadModelsAndCheckPerms, cleanup]);

  const requestCameraPermission = async () => {
    setCameraStatus('Initializing...');
    setErrorMessage('');
    try {
      const stream = await navigator.mediaDevices.getUserMedia({ video: true });
      stream.getTracks().forEach(track => track.stop());
      if (mode === 'register') setStep('CAMERA_ACTIVE');
      else setStep('NEEDS_EMAIL');
    } catch (err) {
      setStep('PERMS_DENIED');
    }
  };

  const startCamera = useCallback(async () => {
    if (streamRef.current || !videoRef.current) return;
    setCameraStatus('Initializing...');
    try {
      const stream = await navigator.mediaDevices.getUserMedia({ video: { facingMode: 'user' } });
      streamRef.current = stream;
      if (videoRef.current) {
        videoRef.current.srcObject = stream;
      }
    } catch (err) {
      setErrorMessage('Failed to start camera. Please ensure permissions are granted.');
      setStep('PERMS_DENIED');
    }
  }, []);
  
  useEffect(() => {
    if (step === 'CAMERA_ACTIVE') {
      startCamera();
    }
  }, [step, startCamera]);

  const handleDetection = async (onSuccess: (descriptor: Float32Array) => void) => {
    if (!videoRef.current || videoRef.current.paused || typeof faceapi === 'undefined') return;
    
    const detections = await faceapi
      .detectAllFaces(videoRef.current, new faceapi.TinyFaceDetectorOptions())
      .withFaceLandmarks()
      .withFaceDescriptors();
    
    if (detections.length === 0) {
      setCameraStatus('No face detected');
      return;
    }
    if (detections.length > 1) {
      setCameraStatus('Multiple faces detected');
      return;
    }
    
    onSuccess(detections[0].descriptor);
  };
  
  const handleRegister = () => {
    setCameraStatus('Hold still, capturing...');
    handleDetection(async (descriptor) => {
      setCameraStatus('Saving your face data...');
      try {
        await saveFaceDescriptor(Array.from(descriptor));
        setStep('SUCCESS');
        setTimeout(onClose, 2000);
      } catch (e: any) {
        setErrorMessage(e.message || 'Could not save face data.');
        setStep('NEEDS_PERMS');
      }
    });
  };
  
  const handleLogin = async (e?: React.FormEvent) => {
    e?.preventDefault();
    if (!email.trim()) {
      setErrorMessage("Email is required.");
      return;
    }
    setErrorMessage('');
    
    try {
      const usersRef = db.collection('users');
      const q = usersRef.where('email', '==', email.trim()).limit(1);
      const snapshot = await q.get();

      if (snapshot.empty) throw new Error("No account found with this email.");
      const userData = snapshot.docs[0].data();
      if (!userData.faceDescriptor) throw new Error("Face Login is not set up for this account.");

      const storedDescriptor = new Float32Array(userData.faceDescriptor);
      setStep('CAMERA_ACTIVE'); 
      
      const videoEl = videoRef.current;
      videoEl?.addEventListener('play', () => {
          setCameraStatus('Position your face in the oval');
          detectionIntervalRef.current = window.setInterval(async () => {
            setCameraStatus('Verifying...');
            await handleDetection(async (currentDescriptor) => {
              const distance = faceapi.euclideanDistance(storedDescriptor, currentDescriptor);
              if (distance < 0.5) { 
                if (detectionIntervalRef.current) clearInterval(detectionIntervalRef.current);
                setCameraStatus('Face matched! Logging in...');
                try {
                  await loginWithFace(email);
                  setStep('SUCCESS');
                  setTimeout(onClose, 1500);
                } catch (loginError: any) {
                  setErrorMessage(loginError.message);
                  setStep('NEEDS_EMAIL');
                }
              } else {
                setCameraStatus('Face not recognized. Trying again...');
              }
            });
          }, 2500);
      });

    } catch (err: any) {
      setErrorMessage(err.message);
    }
  };
  
  // --- Render Logic ---
  
  const renderContent = () => {
    switch (step) {
      case 'LOADING_MODELS':
        return <div className="p-8 text-center"><div className="animate-spin rounded-full h-8 w-8 border-b-2 border-brand-red mx-auto"></div><p className="mt-4">Loading AI models...</p></div>;
      case 'NEEDS_PERMS':
        return (
            <div className="p-8 text-center">
                <CameraIcon className="h-12 w-12 mx-auto text-blue-500 mb-4"/>
                <h3 className="font-bold text-lg">Camera Access Required</h3>
                <p className="text-sm text-gray-600 dark:text-gray-400 mt-2">This feature needs your permission to use the camera for face recognition.</p>
                <button onClick={requestCameraPermission} className="mt-6 w-full bg-brand-red text-white font-bold py-2.5 rounded-md">Enable Camera</button>
            </div>
        );
      case 'PERMS_DENIED':
        return (
            <div className="p-8 text-center">
                <LockIcon className="h-12 w-12 mx-auto text-red-500 mb-4"/>
                <h3 className="font-bold text-lg">Camera Access Denied</h3>
                <p className="text-sm text-gray-600 dark:text-gray-400 mt-2">You've denied camera access. Please enable it in your browser's site settings to use this feature.</p>
                <button onClick={onClose} className="mt-6 w-full bg-gray-600 text-white font-bold py-2.5 rounded-md">Close</button>
            </div>
        );
      case 'NEEDS_EMAIL':
        return (
            <form onSubmit={handleLogin} className="p-6 space-y-4">
                <h3 className="font-bold text-center">Continue with Face ID</h3>
                <div>
                    <label htmlFor="face-login-email" className="block text-sm font-medium text-gray-700 dark:text-gray-300">Enter your account email</label>
                    <input type="email" id="face-login-email" value={email} onChange={e => setEmail(e.target.value)} required className="w-full mt-1 p-2 border border-gray-300 dark:border-gray-600 rounded-md bg-white dark:bg-black" placeholder="you@example.com" />
                </div>
                {errorMessage && <p className="text-sm text-red-500">{errorMessage}</p>}
                <button type="submit" className="w-full bg-brand-red text-white font-bold py-2.5 rounded-md hover:bg-brand-red-dark">Continue</button>
            </form>
        );
      case 'CAMERA_ACTIVE':
        return (
            <div className="p-6 text-center">
                <div className="relative w-64 h-48 mx-auto bg-black rounded-lg overflow-hidden border border-gray-300 dark:border-gray-700">
                    <video ref={videoRef} autoPlay playsInline muted className="w-full h-full object-cover transform -scale-x-100" />
                    <div className="absolute inset-0 flex items-center justify-center pointer-events-none">
                        <div className="w-40 h-56 border-4 border-white/50 rounded-[50%]"></div>
                    </div>
                </div>
                <p className="mt-4 font-semibold h-5">{cameraStatus}</p>
                {mode === 'register' && <button onClick={handleRegister} className="w-full mt-4 bg-brand-red text-white font-bold py-2 rounded-md">Capture Face</button>}
            </div>
        );
      case 'SUCCESS':
        return <div className="p-8 text-center"><h3 className="font-bold text-green-600">Success!</h3><p>{mode === 'register' ? 'Face login has been set up.' : 'You have been logged in.'}</p></div>;
      default:
        return null;
    }
  };
  
  if (!isOpen) return null;
  
  if (mode === 'signup_redirect') {
    return (
      <div className="fixed inset-0 bg-black/60 z-[100] flex items-center justify-center p-4" onClick={onClose}>
        <div className="bg-white dark:bg-black w-full max-w-sm rounded-lg shadow-xl p-6 text-center" onClick={e => e.stopPropagation()}>
          <UserIcon className="h-10 w-10 mx-auto text-brand-red mb-4"/>
          <h2 className="text-xl font-bold mb-2">Set Up Face Login After Sign Up</h2>
          <p className="text-gray-600 dark:text-gray-400">Please sign up with another method first. You can then enable Face Login from your <strong>Account Settings</strong> page.</p>
          <button onClick={onClose} className="mt-4 w-full bg-brand-red text-white font-bold py-2 px-4 rounded-md">Got it</button>
        </div>
      </div>
    );
  }

  return (
    <div className="fixed inset-0 bg-black/60 z-[100] flex items-center justify-center p-4" onClick={onClose}>
      <div className="bg-white dark:bg-black w-full max-w-sm rounded-lg shadow-xl" onClick={e => e.stopPropagation()}>
        <header className="flex items-center justify-between p-4 border-b border-gray-200 dark:border-gray-700">
          <h2 className="text-xl font-bold">{mode === 'register' ? 'Set Up Face Login' : 'Continue with Face ID'}</h2>
          <button onClick={onClose} className="text-gray-500 hover:text-gray-800"><CloseIcon className="h-6 w-6"/></button>
        </header>
        {renderContent()}
      </div>
    </div>
  );
};

export default FaceLoginModal;