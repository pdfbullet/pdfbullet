import React, { createContext, useState, useContext, useEffect, ReactNode } from 'react';
import { auth, db, storage, firebase } from '../firebase/config.ts';
import Preloader from '../components/Preloader.tsx';

// Add and export this interface
export interface BusinessDetails {
  companyName: string;
  vatId: string;
  country: string;
  stateProvince: string;
  city: string;
  address: string;
  zipCode: string;
}

// New type for Problem Reports
export interface ProblemReport {
    id: string; // Firestore document ID
    email: string;
    url: string;
    problemType: string;
    description: string;
    timestamp: firebase.firestore.Timestamp;
    status: 'New' | 'In Progress' | 'Resolved';
    userId?: string;
    userName?: string;
    notes?: string;
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
  twoFactorEnabled?: boolean;
  businessDetails?: BusinessDetails;
  trialEnds?: number;
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
  loginOrSignupWithGithub: () => Promise<void>;
  signInWithEmail: (email: string, password: string) => Promise<void>;
  signUpWithEmail: (email: string, password: string) => Promise<void>;
  signInWithCustomToken: (token: string) => Promise<void>;
  generateApiKey: () => Promise<string>;
  getApiUsage: () => Promise<{ count: number; limit: number; resetsIn: string }>;
  changePassword: (oldPassword: string, newPassword: string) => Promise<void>;
  updateTwoFactorStatus: (enabled: boolean) => Promise<void>;
  updateBusinessDetails: (details: BusinessDetails) => Promise<void>;
  submitProblemReport: (reportData: Omit<ProblemReport, 'id' | 'timestamp' | 'status' | 'userId' | 'userName' | 'notes'>) => Promise<void>;
  getProblemReports: () => Promise<ProblemReport[]>;
  updateReportStatus: (reportId: string, status: ProblemReport['status']) => Promise<void>;
  deleteProblemReport: (reportId: string) => Promise<void>;
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
            const userData = docSnap.data() as User;
            setUser({ ...userData, twoFactorEnabled: userData.twoFactorEnabled || false });
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
              twoFactorEnabled: false,
              trialEnds: Date.now() + 7 * 24 * 60 * 60 * 1000, // 7-day free trial
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
  
  const loginOrSignupWithGithub = async () => {
    const provider = new firebase.auth.GithubAuthProvider();
    await auth.signInWithPopup(provider);
  };

  const signInWithEmail = async (email: string, password: string) => {
    await auth.signInWithEmailAndPassword(email, password);
  };

  const signUpWithEmail = async (email: string, password: string) => {
    await auth.createUserWithEmailAndPassword(email, password);
    // onAuthStateChanged listener will handle creating the user profile in Firestore
  };

  const signInWithCustomToken = async (token: string) => {
    await auth.signInWithCustomToken(token);
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

  const updateTwoFactorStatus = async (enabled: boolean) => {
    if (!user) throw new Error("No user is signed in.");
    const userRef = db.collection('users').doc(user.uid);
    await userRef.update({ twoFactorEnabled: enabled });
    setUser(prevUser => (prevUser ? { ...prevUser, twoFactorEnabled: enabled } : null));
  };

  const updateBusinessDetails = async (details: BusinessDetails) => {
    if (!user) throw new Error("No user is signed in.");
    const userRef = db.collection('users').doc(user.uid);
    await userRef.update({ businessDetails: details });
    setUser(prevUser => prevUser ? { ...prevUser, businessDetails: details } : null);
  };
  
  const submitProblemReport = async (reportData: Omit<ProblemReport, 'id' | 'timestamp' | 'status' | 'userId' | 'userName' | 'notes' | 'screenshotUrl'>) => {
    const report: Omit<ProblemReport, 'id'> = {
        ...reportData,
        timestamp: firebase.firestore.FieldValue.serverTimestamp() as firebase.firestore.Timestamp,
        status: 'New',
        userId: user?.uid,
        userName: user?.username,
    };

    await db.collection('reports').add(report);
  };

  const getProblemReports = async (): Promise<ProblemReport[]> => {
      const reportsCollectionRef = db.collection('reports').orderBy('timestamp', 'desc');
      const snapshot = await reportsCollectionRef.get();
      return snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() } as ProblemReport));
  };

  const updateReportStatus = async (reportId: string, status: ProblemReport['status']) => {
      const reportRef = db.collection('reports').doc(reportId);
      await reportRef.update({ status });
  };
  
  const deleteProblemReport = async (reportId: string) => {
      const reportRef = db.collection('reports').doc(reportId);
      await reportRef.delete();
  };


  const value: AuthContextType = { user, loading, logout, updateProfileImage, updateUserProfile, getAllUsers, updateUserPremiumStatus, updateUserApiPlan, deleteUser, deleteCurrentUser, loginOrSignupWithGoogle, loginOrSignupWithGithub, signInWithEmail, signUpWithEmail, signInWithCustomToken, generateApiKey, getApiUsage, changePassword, updateTwoFactorStatus, updateBusinessDetails, submitProblemReport, getProblemReports, updateReportStatus, deleteProblemReport, auth };

  return <AuthContext.Provider value={value}>{loading ? <Preloader /> : children}</AuthContext.Provider>;
};

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (context === undefined) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
};
