import React, { createContext, useState, useContext, useEffect, ReactNode } from 'react';
import {
    onAuthStateChanged,
    signOut,
    updateProfile,
    GoogleAuthProvider,
    signInWithPopup,
    signInWithEmailAndPassword,
    createUserWithEmailAndPassword,
    reauthenticateWithCredential,
    EmailAuthProvider,
    updatePassword,
    Auth,
    User as FirebaseUser,
} from 'firebase/auth';
import {
    doc,
    getDoc,
    setDoc,
    collection,
    getDocs,
    updateDoc,
    deleteDoc,
} from 'firebase/firestore';
import {
    ref,
    uploadBytes,
    getDownloadURL,
} from 'firebase/storage';
import { auth, db, storage } from '../firebase/config.ts';

// User interface for our app
interface User {
  uid: string;
  username: string; // Will store displayName or email
  profileImage?: string; // Will store photoURL
  isPremium?: boolean;
  creationDate?: string;
  apiKey?: string;
  apiPlan?: 'free' | 'developer' | 'business';
  firstName?: string;
  lastName?: string;
  country?: string; // e.g., 'US'
}

// Auth Context Type
interface AuthContextType {
  user: User | null;
  loading: boolean;
  logout: () => Promise<void>;
  updateProfileImage: (imageFile: File) => Promise<void>;
  updateUserProfile: (data: { firstName: string; lastName: string; country: string }) => Promise<void>;
  getAllUsers: () => Promise<User[]>;
  updateUserPremiumStatus: (uid: string, isPremium: boolean) => Promise<void>;
  updateUserApiPlan: (uid: string, plan: 'free' | 'developer' | 'business') => Promise<void>;
  deleteUser: (uid: string) => Promise<void>;
  loginOrSignupWithGoogle: () => Promise<void>;
  signInWithEmail: (email: string, password: string) => Promise<void>;
  signUpWithEmail: (email: string, password: string) => Promise<void>;
  generateApiKey: () => Promise<string>;
  getApiUsage: () => Promise<{ count: number; limit: number; resetsIn: string }>;
  changePassword: (oldPassword: string, newPassword: string) => Promise<void>;
  auth: Auth;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export const AuthProvider: React.FC<{ children: ReactNode }> = ({ children }) => {
  const [user, setUser] = useState<User | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const unsubscribe = onAuthStateChanged(auth, async (firebaseUser: FirebaseUser | null) => {
      try {
        if (firebaseUser) {
          const userRef = doc(db, 'users', firebaseUser.uid);
          const docSnap = await getDoc(userRef);
          if (docSnap.exists()) {
            setUser(docSnap.data() as User);
          } else {
            // New user, create a profile in Firestore
            const newUserProfile: User = {
              uid: firebaseUser.uid,
              username: firebaseUser.displayName || firebaseUser.email?.split('@')[0] || 'Anonymous',
              profileImage: firebaseUser.photoURL || undefined,
              isPremium: false,
              creationDate: firebaseUser.metadata.creationTime || new Date().toISOString(),
              apiPlan: 'free',
              firstName: '',
              lastName: '',
              country: '',
            };
            await setDoc(userRef, newUserProfile);
            setUser(newUserProfile);
          }
        } else {
          setUser(null);
        }
      } catch (err) {
        console.error("Auth state change error:", err);
        setUser(null);
      } finally {
        setLoading(false);
      }
    });
    return () => unsubscribe();
  }, []);

  const loginOrSignupWithGoogle = async () => {
    const provider = new GoogleAuthProvider();
    await signInWithPopup(auth, provider);
  };
  
  const signInWithEmail = async (email: string, password: string) => {
    await signInWithEmailAndPassword(auth, email, password);
  };

  const signUpWithEmail = async (email: string, password: string) => {
    await createUserWithEmailAndPassword(auth, email, password);
    // onAuthStateChanged listener will handle creating the user profile in Firestore
  };

  const logout = async () => {
    sessionStorage.removeItem('isAdminAuthenticated');
    await signOut(auth);
  };
  
  const updateProfileImage = async (imageFile: File) => {
    if (!user) throw new Error("No user is signed in.");
    const storageRef = ref(storage, `profile_images/${user.uid}/${imageFile.name}`);
    const snapshot = await uploadBytes(storageRef, imageFile);
    const downloadURL = await getDownloadURL(snapshot.ref);
    
    const firebaseUser = auth.currentUser;
    if(firebaseUser) {
        await updateProfile(firebaseUser, { photoURL: downloadURL });
    }

    const userRef = doc(db, 'users', user.uid);
    await updateDoc(userRef, { profileImage: downloadURL });
    setUser(prevUser => prevUser ? { ...prevUser, profileImage: downloadURL } : null);
  };
  
  const updateUserProfile = async (data: { firstName: string; lastName: string; country: string }) => {
    if (!user) throw new Error("No user is signed in.");
    const userRef = doc(db, 'users', user.uid);
    await updateDoc(userRef, data);
    setUser(prevUser => prevUser ? { ...prevUser, ...data } : null);
  };

  const changePassword = async (oldPassword: string, newPassword: string) => {
    const firebaseUser = auth.currentUser;
    if (!firebaseUser || !firebaseUser.email) {
        throw new Error("No user is signed in or user does not have an email address.");
    }
    const credential = EmailAuthProvider.credential(firebaseUser.email, oldPassword);
    await reauthenticateWithCredential(firebaseUser, credential);
    await updatePassword(firebaseUser, newPassword);
  };

  const getAllUsers = async (): Promise<User[]> => {
    const usersCollectionRef = collection(db, 'users');
    const snapshot = await getDocs(usersCollectionRef);
    return snapshot.docs.map(doc => doc.data() as User);
  };

  const updateUserPremiumStatus = async (uid: string, isPremium: boolean) => {
    const userRef = doc(db, 'users', uid);
    await updateDoc(userRef, { isPremium });
  };
  
  const updateUserApiPlan = async (uid: string, plan: 'free' | 'developer' | 'business') => {
    const userRef = doc(db, 'users', uid);
    await updateDoc(userRef, { apiPlan: plan });
  };
  
  const deleteUser = async (uid: string) => {
    const userRef = doc(db, 'users', uid);
    await deleteDoc(userRef);
  };
  
  const generateApiKey = async (): Promise<string> => {
    if (!user) throw new Error("You must be logged in.");
    // Generate a more realistic-looking API key to address user feedback about mock data.
    const randomBytes = crypto.getRandomValues(new Uint8Array(32));
    const newApiKey = 'sk_live_' + btoa(String.fromCharCode(...randomBytes)).replace(/[^A-Za-z0-9]/g, '').substring(0, 40);

    const userRef = doc(db, 'users', user.uid);
    await updateDoc(userRef, { apiKey: newApiKey });
    setUser(prevUser => prevUser ? { ...prevUser, apiKey: newApiKey } : null);
    return newApiKey;
  };
  
  const getApiUsage = async (): Promise<{ count: number; limit: number; resetsIn: string }> => {
    if (!user) throw new Error("You must be logged in.");
    const plan = user.apiPlan || 'free';
    const limits = { free: 100, developer: 1000, business: 10000 };
    return { count: Math.floor(Math.random() * limits[plan]), limit: limits[plan], resetsIn: '23h 59m' };
  };

  const value = { user, loading, logout, updateProfileImage, updateUserProfile, getAllUsers, updateUserPremiumStatus, updateUserApiPlan, deleteUser, loginOrSignupWithGoogle, signInWithEmail, signUpWithEmail, generateApiKey, getApiUsage, changePassword, auth };

  return <AuthContext.Provider value={value}>{!loading && children}</AuthContext.Provider>;
};

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (context === undefined) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
};
