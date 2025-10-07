import React, { useState, useEffect, useRef, useCallback } from 'react';
import { useAuth } from '../contexts/AuthContext.tsx';
import { db } from '../firebase/config.ts';
import { UserIcon, CameraIcon, LockIcon } from './icons.tsx';

// This tells TypeScript that 'faceapi' will exist on the global scope,
// loaded from the script tag in index.html.
declare const faceapi: any;

interface FaceLoginModalProps {
  isOpen: boolean;
  onClose: () => void;
  mode: 'login' | 'register' | 'signup_redirect';
}

type PermissionStatus = 'checking' | 'prompt' | 'granted' | 'denied';

const FaceLoginModal: React.FC<FaceLoginModalProps> = ({ isOpen, onClose, mode }) => {
  const { user, saveFaceDescriptor, loginWithFace } = useAuth();
  
  // State Management
  const [permissionStatus, setPermissionStatus] = useState<PermissionStatus>('checking');
  const [status, setStatus] = useState('Loading...');
  const [error, setError] = useState('');
  const [email, setEmail] = useState('');
  const [step, setStep] = useState(1); // 1: Pre-camera (perms/email), 2: Camera active
  
  // Refs for camera and detection logic
  const videoRef = useRef<HTMLVideoElement>(null);
  const streamRef = useRef<MediaStream | null>(null);
  const detectionIntervalRef = useRef<number | null>(null);
  const modelsLoaded = useRef(false);

  // --- Core Logic: Permissions and Camera ---

  const checkCameraPermission = useCallback(async () => {
    if (!navigator.permissions) {
      setPermissionStatus('prompt'); // Fallback for browsers without Permissions API
      return;
    }
    try {
      const result = await navigator.permissions.query({ name: 'camera' as PermissionName });
      setPermissionStatus(result.state);
      result.onchange = () => setPermissionStatus(result.state);
    } catch (e) {
      console.warn('Camera permission query not supported, falling back to prompt.', e);
      setPermissionStatus('prompt');
    }
  }, []);
  
  const requestCameraPermission = async () => {
    setStatus('Requesting camera access...');
    setError('');
    try {
      const stream = await navigator.mediaDevices.getUserMedia({ video: true });
      stream.getTracks().forEach(track => track.stop()); // Got permission, don't need the stream yet
      setPermissionStatus('granted'); // This will trigger the useEffect to advance the step
    } catch (err) {
      if (err instanceof DOMException && err.name === 'NotAllowedError') {
        setError('Camera access was denied. Please enable it in your browser settings.');
        setPermissionStatus('denied');
      } else {
        setError('Could not access the camera. Please ensure it is not in use by another application.');
      }
    }
  };
  
  const startCamera = async () => {
    setStatus('Initializing camera...');
    try {
      const stream = await navigator.mediaDevices.getUserMedia({ video: {} });
      streamRef.current = stream;
      if (videoRef.current) {
        videoRef.current.srcObject = stream;
      }
    } catch (err) {
      setError('Camera access is required. Please enable it in your browser settings.');
      setPermissionStatus('denied');
      setStep(1); // Go back to permission step
    }
  };
  
  // --- Lifecycle and Effects ---

  useEffect(() => {
    const loadModels = async () => {
      if (modelsLoaded.current || typeof faceapi === 'undefined') return;
      try {
        await Promise.all([
          faceapi.nets.tinyFaceDetector.loadFromUri('/models'),
          faceapi.nets.faceLandmark68Net.loadFromUri('/models'),
          faceapi.nets.faceRecognitionNet.loadFromUri('/models'),
        ]);
        modelsLoaded.current = true;
        checkCameraPermission();
      } catch (e) {
        setError('Could not load AI models. Please check your connection and refresh.');
      }
    };

    if (isOpen) {
      loadModels();
    }

    return () => { // Cleanup function for when modal closes
      streamRef.current?.getTracks().forEach(track => track.stop());
      streamRef.current = null;
      if (detectionIntervalRef.current) {
        clearInterval(detectionIntervalRef.current);
        detectionIntervalRef.current = null;
      }
    };
  }, [isOpen, checkCameraPermission]);

  useEffect(() => {
    if (isOpen && permissionStatus === 'granted') {
      if (mode === 'register') {
        setStep(2); // Go straight to camera for registration
      } else {
        setStatus('Please enter your email');
        setStep(1);
      }
    } else if (isOpen && permissionStatus !== 'checking') {
      setStatus('');
      setStep(1);
    }
  }, [isOpen, permissionStatus, mode]);
  
  useEffect(() => {
    if (isOpen && step === 2) {
      startCamera();
    }
  }, [isOpen, step]);
  

  // --- Face Detection and Logic ---

  const handleDetection = async (onSuccess: (descriptor: Float32Array) => void) => {
    if (!videoRef.current || videoRef.current.paused || typeof faceapi === 'undefined') return;
    
    const detections = await faceapi
      .detectAllFaces(videoRef.current, new faceapi.TinyFaceDetectorOptions())
      .withFaceLandmarks()
      .withFaceDescriptors();
    
    if (detections.length === 0) {
      setStatus('No face detected. Move closer to the camera.');
      return;
    }
    if (detections.length > 1) {
      setStatus('Multiple faces detected. Please ensure only one person is in frame.');
      return;
    }
    
    onSuccess(detections[0].descriptor);
  };

  const handleRegister = async () => {
    setStatus('Hold still, capturing your face...');
    await handleDetection(async (descriptor) => {
      setStatus('Saving your face data...');
      try {
        await saveFaceDescriptor(Array.from(descriptor));
        setStatus('Face login setup complete! ✅');
        setTimeout(onClose, 2000);
      } catch (e: any) {
        setError(e.message || 'Could not save face data.');
        setStatus('');
      }
    });
  };
  
  const handleLogin = async (e?: React.FormEvent) => {
    e?.preventDefault();
    if (!email.trim()) {
      setError("Email address is required to find your account.");
      return;
    }
    setStatus('Finding your account...');
    setError('');
    
    try {
      const usersRef = db.collection('users');
      const q = usersRef.where('email', '==', email.trim()).limit(1);
      const snapshot = await q.get();

      if (snapshot.empty) throw new Error("No account found with this email.");
      
      const userData = snapshot.docs[0].data();
      if (!userData.faceDescriptor) throw new Error("Face Login is not set up for this account. Please set it up in your Account Settings.");

      const storedDescriptor = new Float32Array(userData.faceDescriptor);
      
      setStep(2); 
      
      const videoEl = videoRef.current;
      videoEl?.addEventListener('play', () => {
          setStatus('Position your face in the oval...');
          detectionIntervalRef.current = window.setInterval(async () => {
            await handleDetection(async (currentDescriptor) => {
              const distance = faceapi.euclideanDistance(storedDescriptor, currentDescriptor);
              if (distance < 0.5) { // Stricter threshold for better security
                if (detectionIntervalRef.current) clearInterval(detectionIntervalRef.current);
                setStatus('Face matched! Logging you in... ✅');
                try {
                  await loginWithFace(email);
                  setTimeout(onClose, 1500);
                } catch (loginError: any) {
                  setError(loginError.message);
                  setStatus('');
                }
              } else {
                setStatus('Face not recognized. Trying again...');
              }
            });
          }, 2500); // Check every 2.5 seconds
      });

    } catch (err: any) {
      setError(err.message);
      setStatus('Please enter your email');
    }
  };

  // --- Render Logic ---

  const renderContent = () => {
    if (step === 1) { // Pre-camera steps
        switch (permissionStatus) {
            case 'checking':
                return <div className="text-center p-8"><div className="animate-spin rounded-full h-8 w-8 border-b-2 border-brand-red mx-auto"></div><p className="mt-4">{status}</p></div>;
            case 'denied':
                return (
                    <div className="text-center p-8">
                        <LockIcon className="h-10 w-10 mx-auto text-red-500 mb-4"/>
                        <h3 className="font-bold text-lg">Camera Access Denied</h3>
                        <p className="text-sm text-gray-600 dark:text-gray-400 mt-2">To use Face Login, you need to allow camera access in your browser settings. Please update your settings and try again.</p>
                        <button onClick={onClose} className="mt-4 w-full bg-gray-600 text-white font-bold py-2 rounded-md">Close</button>
                    </div>
                );
            case 'prompt':
                return (
                    <div className="text-center p-8">
                        <CameraIcon className="h-10 w-10 mx-auto text-blue-500 mb-4"/>
                        <h3 className="font-bold text-lg">Camera Access Required</h3>
                        <p className="text-sm text-gray-600 dark:text-gray-400 mt-2">This feature needs access to your camera to scan your face.</p>
                        <button onClick={requestCameraPermission} className="mt-4 w-full bg-brand-red text-white font-bold py-2 rounded-md">Enable Camera</button>
                    </div>
                );
            case 'granted': // This is the email step for login
                return (
                    <form onSubmit={handleLogin} className="p-6 space-y-4">
                        <label htmlFor="face-login-email" className="block text-sm font-medium text-gray-700 dark:text-gray-300">Email Address</label>
                        <input type="email" id="face-login-email" value={email} onChange={e => setEmail(e.target.value)} required className="w-full mt-1 p-2 border border-gray-300 dark:border-gray-600 rounded-md bg-white dark:bg-black" placeholder="you@example.com" />
                        <button type="submit" className="w-full bg-brand-red text-white font-bold py-2 rounded-md hover:bg-brand-red-dark transition-colors">Continue</button>
                    </form>
                );
        }
    }

    if (step === 2) { // Camera active step
        return (
            <div className="p-6 text-center">
                <div className="relative w-64 h-48 mx-auto bg-black rounded-lg overflow-hidden border border-gray-300 dark:border-gray-700">
                    <video ref={videoRef} autoPlay playsInline muted className="w-full h-full object-cover transform -scale-x-100" />
                    <div className="absolute inset-0 flex items-center justify-center pointer-events-none">
                        <div className="w-40 h-56 border-4 border-white/50 rounded-[50%]"></div>
                    </div>
                </div>
                {mode === 'register' && (
                    <button onClick={handleRegister} className="w-full mt-4 bg-brand-red text-white font-bold py-2 rounded-md">
                        Capture and Save Face
                    </button>
                )}
            </div>
        );
    }
  };
  
  if (!isOpen) return null;
  
  if (mode === 'signup_redirect') {
       return (
        <div className="fixed inset-0 bg-black/60 z-[100] flex items-center justify-center p-4" onClick={onClose}>
            <div className="bg-white dark:bg-black w-full max-w-sm rounded-lg shadow-xl p-6 text-center" onClick={e => e.stopPropagation()}>
                <UserIcon className="h-10 w-10 mx-auto text-brand-red mb-4"/>
                <h2 className="text-xl font-bold mb-2">Set Up Face Login</h2>
                <p className="text-gray-600 dark:text-gray-400">To use Face ID, please sign up with another method first. You can then enable Face Login from your <strong>Account Settings</strong> page.</p>
                <button onClick={onClose} className="mt-4 w-full bg-brand-red text-white font-bold py-2 px-4 rounded-md">Got it</button>
            </div>
        </div>
      );
  }

  return (
    <div className="fixed inset-0 bg-black/60 z-[100] flex items-center justify-center p-4" onClick={onClose}>
      <div className="bg-white dark:bg-black w-full max-w-md rounded-lg shadow-xl" onClick={e => e.stopPropagation()}>
        <header className="flex items-center justify-between p-4 border-b border-gray-200 dark:border-gray-700">
          <h2 className="text-xl font-bold">{mode === 'register' ? 'Set Up Face Login' : 'Continue with Face ID'}</h2>
          <button onClick={onClose} className="text-2xl font-light">&times;</button>
        </header>
        <div>
            {renderContent()}
            <div className="px-6 pb-4 text-center text-sm font-semibold min-h-[44px]">
                <p className="text-gray-700 dark:text-gray-300">{status}</p>
                {error && <p className="text-red-500 mt-2">{error}</p>}
            </div>
        </div>
      </div>
    </div>
  );
};

export default FaceLoginModal;
