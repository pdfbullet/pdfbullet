import React, { useState, useEffect, useRef } from 'react';
import { useAuth } from '../contexts/AuthContext.tsx';
import { db } from '../firebase/config.ts';
import { UserIcon } from './icons.tsx';

// This tells TypeScript that 'faceapi' will exist on the global scope,
// loaded from the script tag in index.html.
declare const faceapi: any;

interface FaceLoginModalProps {
  isOpen: boolean;
  onClose: () => void;
  mode: 'login' | 'register' | 'signup_redirect';
}

const FaceLoginModal: React.FC<FaceLoginModalProps> = ({ isOpen, onClose, mode }) => {
  const { user, saveFaceDescriptor, loginWithFace } = useAuth();
  const [status, setStatus] = useState('Loading AI models...');
  const [error, setError] = useState('');
  const [email, setEmail] = useState('');
  const [step, setStep] = useState(mode === 'register' ? 2 : 1);
  const videoRef = useRef<HTMLVideoElement>(null);
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const streamRef = useRef<MediaStream | null>(null);
  const detectionIntervalRef = useRef<number | null>(null);

  const loadModels = async () => {
    try {
      if (typeof faceapi === 'undefined') {
        throw new Error('Face-api.js script not loaded yet.');
      }
      await Promise.all([
        faceapi.nets.tinyFaceDetector.loadFromUri('/models'),
        faceapi.nets.faceLandmark68Net.loadFromUri('/models'),
        faceapi.nets.faceRecognitionNet.loadFromUri('/models'),
      ]);
      setStatus(mode === 'register' ? 'Initializing camera...' : 'Please enter your email');
    } catch (e) {
      console.error("Model loading error:", e);
      setError('Could not load AI models. Please check your connection and refresh.');
    }
  };

  const startCamera = async () => {
    try {
      const stream = await navigator.mediaDevices.getUserMedia({ video: {} });
      streamRef.current = stream;
      if (videoRef.current) {
        videoRef.current.srcObject = stream;
      }
    } catch (err) {
      setError('Camera access is required. Please enable it in your browser settings.');
      setStatus('');
    }
  };

  useEffect(() => {
    if (isOpen) {
      loadModels();
      if (step === 2) {
        startCamera();
      }
    }
    return () => {
      streamRef.current?.getTracks().forEach(track => track.stop());
      streamRef.current = null;
      if (detectionIntervalRef.current) {
        clearInterval(detectionIntervalRef.current);
        detectionIntervalRef.current = null;
      }
    };
  }, [isOpen, step]);

  const handleDetection = async (onSuccess: (descriptor: Float32Array) => void) => {
    if (!videoRef.current || videoRef.current.paused || videoRef.current.error || typeof faceapi === 'undefined') return;
    
    const detections = await faceapi
      .detectAllFaces(videoRef.current, new faceapi.TinyFaceDetectorOptions())
      .withFaceLandmarks()
      .withFaceDescriptors();
    
    if (detections.length === 0) {
      setStatus('No face detected. Please position yourself clearly.');
      return;
    }
    if (detections.length > 1) {
      setStatus('Multiple faces detected. Please ensure only one person is in frame.');
      return;
    }
    
    onSuccess(detections[0].descriptor);
  };

  const handleRegister = async () => {
    setStatus('Capturing your face...');
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
    if (!email) {
      setError("Email is required.");
      return;
    }
    setStatus('Finding your account...');
    setError('');
    
    try {
      const usersRef = db.collection('users');
      const q = usersRef.where('email', '==', email).limit(1);
      const snapshot = await q.get();

      if (snapshot.empty) throw new Error("No account found with this email.");
      
      const userData = snapshot.docs[0].data();
      if (!userData.faceDescriptor) throw new Error("Face Login is not set up for this account. Please set it up in Account Settings.");

      const storedDescriptor = new Float32Array(userData.faceDescriptor);
      
      setStep(2); 
      
      const videoEl = videoRef.current;
      videoEl?.addEventListener('play', () => {
          detectionIntervalRef.current = window.setInterval(async () => {
            await handleDetection(async (currentDescriptor) => {
              const distance = faceapi.euclideanDistance(storedDescriptor, currentDescriptor);
              if (distance < 0.6) {
                if (detectionIntervalRef.current) clearInterval(detectionIntervalRef.current);
                setStatus('Face matched! Logging you in... ✅');
                try {
                  await loginWithFace(email);
                  setTimeout(onClose, 1000);
                } catch (loginError: any) {
                  setError(loginError.message);
                  setStatus('');
                }
              } else {
                setStatus('Face not recognized. Trying again... ❌');
              }
            });
          }, 2000);
      });

    } catch (err: any) {
      setError(err.message);
      setStatus('Please enter your email');
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
          <button onClick={onClose} className="text-2xl">&times;</button>
        </header>
        <div className="p-6">
          {step === 1 && (
            <form onSubmit={handleLogin}>
              <label htmlFor="face-login-email" className="block text-sm font-medium text-gray-700 dark:text-gray-300">Email Address</label>
              <input type="email" id="face-login-email" value={email} onChange={e => setEmail(e.target.value)} required className="w-full mt-1 p-2 border border-gray-300 dark:border-gray-600 rounded-md bg-white dark:bg-black" />
              <button type="submit" className="w-full mt-4 bg-brand-red text-white font-bold py-2 rounded-md">Continue</button>
            </form>
          )}
          {step === 2 && (
            <div className="text-center">
              <div className="relative w-64 h-48 mx-auto bg-black rounded-md overflow-hidden border">
                <video ref={videoRef} autoPlay playsInline muted className="w-full h-full object-cover transform -scale-x-100" />
                <canvas ref={canvasRef} className="absolute top-0 left-0" />
              </div>
              {mode === 'register' && (
                <button onClick={handleRegister} className="w-full mt-4 bg-brand-red text-white font-bold py-2 rounded-md">
                  Capture and Save Face
                </button>
              )}
            </div>
          )}
          <p className="text-center text-sm font-semibold mt-4 min-h-[20px]">{status}</p>
          {error && <p className="text-center text-sm text-red-500 mt-2">{error}</p>}
        </div>
      </div>
    </div>
  );
};

export default FaceLoginModal;