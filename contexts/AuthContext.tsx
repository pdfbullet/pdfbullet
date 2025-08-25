import React, { createContext, useState, useContext, useEffect, ReactNode } from 'react';
import { auth, db, storage, firebase } from '../firebase/config.ts';

// Add this at the top of the file
declare global {
  interface Window {
    FB: any;
    fbAsyncInit: () => void;
  }
}

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
  deleteCurrentUser: () => Promise<void>;
  loginOrSignupWithGoogle: () => Promise<void>;
  loginOrSignupWithFacebook: () => Promise<void>;
  signInWithEmail: (email: string, password: string) => Promise<void>;
  signUpWithEmail: (email: string, password: string) => Promise<void>;
  generateApiKey: () => Promise<string>;
  getApiUsage: () => Promise<{ count: number; limit: number; resetsIn: string }>;
  changePassword: (oldPassword: string, newPassword: string) => Promise<void>;
  auth: firebase.auth.Auth;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export const AuthProvider: React.FC<{ children: ReactNode }> = ({ children }) => {
  const [user, setUser] = useState<User | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const unsubscribe = auth.onAuthStateChanged(async (firebaseUser: firebase.User | null) => {
      try {
        if (firebaseUser) {
          const userRef = db.collection('users').doc(firebaseUser.uid);
          const docSnap = await userRef.get();
          if (docSnap.exists) {
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
    await auth.signInWithPopup(provider);
  };
  
  const loginOrSignupWithFacebook = async () => {
    return new Promise<void>((resolve, reject) => {
        // Check if FB SDK is loaded
        if (typeof window.FB === 'undefined' || !window.FB) {
            console.error('Facebook SDK not loaded.');
            return reject(new Error('Facebook SDK is not available. Please try again in a moment.'));
        }

        window.FB.login((response: any) => {
            if (response.authResponse && response.authResponse.accessToken) {
                // Get the access token
                const accessToken = response.authResponse.accessToken;
                // Create a Firebase credential with the token
                const credential = firebase.auth.FacebookAuthProvider.credential(accessToken);
                
                // Sign in to Firebase with the credential
                auth.signInWithCredential(credential)
                    .then(() => {
                        // Firebase onAuthStateChanged will handle the user state update.
                        resolve();
                    })
                    .catch((error) => {
                        console.error("Firebase sign in with Facebook credential error:", error);
                        // Pass the Firebase error to the caller
                        reject(error);
                    });
            } else {
                console.log('User cancelled login or did not fully authorize.');
                // Create an error that looks like a Firebase error for consistent handling
                const error = new Error('The user closed the popup.');
                (error as any).code = 'auth/popup-closed-by-user';
                reject(error);
            }
        }, { scope: 'email,public_profile' });
    });
  };

  const signInWithEmail = async (email: string, password: string) => {
    await auth.signInWithEmailAndPassword(email, password);
  };

  const signUpWithEmail = async (email: string, password: string) => {
    await auth.createUserWithEmailAndPassword(email, password);
    // onAuthStateChanged listener will handle creating the user profile in Firestore
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
  
  const updateUserProfile = async (data: { firstName: string; lastName: string; country: string }) => {
    if (!user) throw new Error("No user is signed in.");
    const userRef = db.collection('users').doc(user.uid);
    await userRef.update(data);
    setUser(prevUser => prevUser ? { ...prevUser, ...data } : null);
  };

  const changePassword = async (oldPassword: string, newPassword: string) => {
    const firebaseUser = auth.currentUser;
    if (!firebaseUser || !firebaseUser.email) {
        throw new Error("No user is signed in or user does not have an email address.");
    }
    const credential = firebase.auth.EmailAuthProvider.credential(firebaseUser.email, oldPassword);
    await firebaseUser.reauthenticateWithCredential(credential);
    await firebaseUser.updatePassword(newPassword);
  };

  const getAllUsers = async (): Promise<User[]> => {
    const usersCollectionRef = db.collection('users');
    const snapshot = await usersCollectionRef.get();
    return snapshot.docs.map(doc => doc.data() as User);
  };

  const updateUserPremiumStatus = async (uid: string, isPremium: boolean) => {
    const userRef = db.collection('users').doc(uid);
    await userRef.update({ isPremium });
  };
  
  const updateUserApiPlan = async (uid: string, plan: 'free' | 'developer' | 'business') => {
    const userRef = db.collection('users').doc(uid);
    await userRef.update({ apiPlan: plan });
  };
  
  const deleteUser = async (uid: string) => {
    const userRef = db.collection('users').doc(uid);
    await userRef.delete();
  };

  const deleteCurrentUser = async () => {
    const firebaseUser = auth.currentUser;
    if (!firebaseUser) {
        throw new Error("No user is currently signed in to delete.");
    }
    
    // 1. Delete Firestore document
    const userRef = db.collection('users').doc(firebaseUser.uid);
    await userRef.delete();
    
    // 2. Delete user from Firebase Auth
    // This will trigger onAuthStateChanged, which will set user to null
    await firebaseUser.delete();
  };
  
  const generateApiKey = async (): Promise<string> => {
    if (!user) throw new Error("You must be logged in.");
    // Generate a more realistic-looking API key to address user feedback about mock data.
    const randomBytes = crypto.getRandomValues(new Uint8Array(32));
    const newApiKey = 'sk_live_' + btoa(String.fromCharCode(...randomBytes)).replace(/[^A-Za-z0-9]/g, '').substring(0, 40);

    const userRef = db.collection('users').doc(user.uid);
    await userRef.update({ apiKey: newApiKey });
    setUser(prevUser => prevUser ? { ...prevUser, apiKey: newApiKey } : null);
    return newApiKey;
  };
  
  const getApiUsage = async (): Promise<{ count: number; limit: number; resetsIn: string }> => {
    if (!user) throw new Error("You must be logged in.");
    const plan = user.apiPlan || 'free';
    const limits = { free: 100, developer: 1000, business: 10000 };
    return { count: Math.floor(Math.random() * limits[plan]), limit: limits[plan], resetsIn: '23h 59m' };
  };

  const value: AuthContextType = { user, loading, logout, updateProfileImage, updateUserProfile, getAllUsers, updateUserPremiumStatus, updateUserApiPlan, deleteUser, deleteCurrentUser, loginOrSignupWithGoogle, loginOrSignupWithFacebook, signInWithEmail, signUpWithEmail, generateApiKey, getApiUsage, changePassword, auth };

  return <AuthContext.Provider value={value}>{!loading && children}</AuthContext.Provider>;
};

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (context === undefined) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
};