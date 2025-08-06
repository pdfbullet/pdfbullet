import React, { createContext, useState, useContext, useEffect, ReactNode } from 'react';
import firebase from 'firebase/compat/app';
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
}

// Auth Context Type
interface AuthContextType {
  user: User | null;
  loading: boolean;
  logout: () => Promise<void>;
  updateProfileImage: (imageFile: File) => Promise<void>;
  getAllUsers: () => Promise<User[]>;
  updateUserPremiumStatus: (uid: string, isPremium: boolean) => Promise<void>;
  updateUserApiPlan: (uid: string, plan: 'free' | 'developer' | 'business') => Promise<void>;
  deleteUser: (uid: string) => Promise<void>;
  loginOrSignupWithGoogle: () => Promise<void>;
  generateApiKey: () => Promise<string>;
  getApiUsage: () => Promise<{ count: number; limit: number; resetsIn: string }>;
  changePassword: (oldPassword: string, newPassword: string) => Promise<void>;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export const AuthProvider: React.FC<{ children: ReactNode }> = ({ children }) => {
  const [user, setUser] = useState<User | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    // This handles the redirect result from Google Sign-In. 
    // It's useful for catching errors from the redirect flow.
    auth.getRedirectResult().catch((error) => {
        console.error("Firebase redirect result error:", error.code, error.message);
    });

    const unsubscribe = auth.onAuthStateChanged(async (firebaseUser) => {
      try {
        if (firebaseUser) {
          const userRef = db.collection('users').doc(firebaseUser.uid);
          const doc = await userRef.get();
          if (doc.exists) {
            setUser(doc.data() as User);
          } else {
            // New user, create a profile in Firestore
            const newUserProfile: User = {
              uid: firebaseUser.uid,
              username: firebaseUser.displayName || firebaseUser.email || 'Anonymous',
              profileImage: firebaseUser.photoURL || undefined,
              isPremium: false,
              creationDate: firebaseUser.metadata.creationTime || new Date().toISOString(),
              apiPlan: 'free',
            };
            await userRef.set(newUserProfile);
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
    const provider = new firebase.auth.GoogleAuthProvider();
    // Use redirect which is more reliable than popup
    await auth.signInWithRedirect(provider);
  };

  const logout = async () => {
    sessionStorage.removeItem('isAdminAuthenticated');
    await auth.signOut();
  };
  
  const updateProfileImage = async (imageFile: File) => {
    if (!user) throw new Error("No user is signed in.");
    const storageRef = storage.ref(`profile_images/${user.uid}/${imageFile.name}`);
    const snapshot = await storageRef.put(imageFile);
    const downloadURL = await snapshot.ref.getDownloadURL();
    
    const firebaseUser = auth.currentUser;
    if(firebaseUser) {
        await firebaseUser.updateProfile({ photoURL: downloadURL });
    }

    const userRef = db.collection('users').doc(user.uid);
    await userRef.update({ profileImage: downloadURL });
    setUser(prevUser => prevUser ? { ...prevUser, profileImage: downloadURL } : null);
  };

  const changePassword = async (oldPassword: string, newPassword: string) => {
    const firebaseUser = auth.currentUser;
    if (!firebaseUser || !firebaseUser.email) {
        throw new Error("No user is signed in or user does not have an email address.");
    }
    // This flow is for users with an email/password. It will fail for Google-only users, which is expected.
    const credential = firebase.auth.EmailAuthProvider.credential(firebaseUser.email, oldPassword);
    await firebaseUser.reauthenticateWithCredential(credential);
    await firebaseUser.updatePassword(newPassword);
  };

  const getAllUsers = async (): Promise<User[]> => {
    const snapshot = await db.collection('users').get();
    return snapshot.docs.map(doc => doc.data() as User);
  };

  const updateUserPremiumStatus = async (uid: string, isPremium: boolean) => {
    await db.collection('users').doc(uid).update({ isPremium });
  };
  
  const updateUserApiPlan = async (uid: string, plan: 'free' | 'developer' | 'business') => {
    await db.collection('users').doc(uid).update({ apiPlan: plan });
  };
  
  const deleteUser = async (uid: string) => {
    await db.collection('users').doc(uid).delete();
  };
  
  const generateApiKey = async (): Promise<string> => {
    if (!user) throw new Error("You must be logged in.");
    const newApiKey = 'pdfly-mock-' + Array.from(crypto.getRandomValues(new Uint8Array(16))).map(b => b.toString(16).padStart(2, '0')).join('');
    await db.collection('users').doc(user.uid).update({ apiKey: newApiKey });
    setUser(prevUser => prevUser ? { ...prevUser, apiKey: newApiKey } : null);
    return newApiKey;
  };
  
  const getApiUsage = async (): Promise<{ count: number; limit: number; resetsIn: string }> => {
    if (!user) throw new Error("You must be logged in.");
    const plan = user.apiPlan || 'free';
    const limits = { free: 100, developer: 1000, business: 10000 };
    return { count: Math.floor(Math.random() * limits[plan]), limit: limits[plan], resetsIn: '23h 59m' };
  };

  const value = { user, loading, logout, updateProfileImage, getAllUsers, updateUserPremiumStatus, updateUserApiPlan, deleteUser, loginOrSignupWithGoogle, generateApiKey, getApiUsage, changePassword };

  return <AuthContext.Provider value={value}>{!loading && children}</AuthContext.Provider>;
};

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (context === undefined) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
};