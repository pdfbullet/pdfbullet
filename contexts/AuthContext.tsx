import React, { createContext, useState, useContext, useEffect, ReactNode } from 'react';
import { auth, db, firebase } from '../firebase/config.ts';
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

// New type for Task Logs
export interface TaskLog {
    id: string; // Firestore document ID
    userId: string;
    username: string;
    toolId: string;
    toolTitle: string;
    outputFilename: string;
    timestamp: firebase.firestore.Timestamp;
    fileSize: number;
}


// User interface for our app
interface User {
  uid: string;
  username: string; // Will store displayName or email
  email?: string;
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
  isAdmin?: boolean;
  faceDescriptor?: number[];
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
  sendTaskCompletionEmail: (toolTitle: string, outputFilename: string) => Promise<void>;
  logTask: (taskData: { toolId: string; toolTitle: string; outputFilename: string; fileBlob: Blob | null }) => Promise<void>;
  getTaskHistory: () => Promise<TaskLog[]>;
  deleteTaskRecord: (taskId: string) => Promise<void>;
  auth: firebase.auth.Auth;
  saveFaceDescriptor: (descriptor: number[]) => Promise<void>;
  loginWithFace: (email: string) => Promise<void>;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

const handleFirestoreError = (error: any, operation: string): Error => {
    console.error(`Firestore error during ${operation}:`, error);
    if (error.code === 'permission-denied') {
        return new Error(`Operation failed: Permission Denied. Please check your Firestore security rules to allow this action.`);
    }
    if (error.code === 'unavailable') {
         return new Error(`Could not connect to the database. The service may be temporarily unavailable or blocked by your network.`);
    }
    return new Error(`An unexpected error occurred during ${operation}.`);
};


export const AuthProvider: React.FC<{ children: ReactNode }> = ({ children }) => {
  const [user, setUser] = useState<User | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const unsubscribe = auth.onAuthStateChanged(async (firebaseUser: firebase.User | null) => {
      if (!firebaseUser) {
        setUser(null);
        setLoading(false);
        return;
      }

      const fallbackUser: User = {
        uid: firebaseUser.uid,
        username: firebaseUser.displayName || firebaseUser.email?.split('@')[0] || 'Anonymous',
        email: firebaseUser.email || undefined,
        profileImage: firebaseUser.photoURL || undefined,
        isPremium: false,
        creationDate: firebaseUser.metadata.creationTime || new Date().toISOString(),
        apiPlan: 'free',
        isAdmin: false,
      };

      try {
        const userRef = db.collection('users').doc(firebaseUser.uid);
        const docSnap = await userRef.get();
        
        if (docSnap.exists) {
          const firestoreData = docSnap.data() as User;
          setUser({ ...firestoreData, ...fallbackUser, ...firestoreData });
        } else {
          const isStandalone = window.matchMedia('(display-mode: standalone)').matches || (window.navigator as any).standalone === true;
          if (isStandalone) {
              fallbackUser.trialEnds = Date.now() + 7 * 24 * 60 * 60 * 1000;
          }
          await userRef.set(fallbackUser);
          setUser(fallbackUser);
        }
      } catch (err) {
        console.error("Critical Firestore error during auth state change:", err);
        alert("Could not connect to the user database. Please check your connection and Firebase setup. The application may not function correctly.");
        setUser(fallbackUser);
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
    // This function will now require Firebase Storage, which is on a paid plan.
    // For now, we will just simulate this by updating Firestore.
    // To implement fully, you would need to use Firebase Storage.
    // const storageRef = storage.ref(`profile_images/${user.uid}/${imageFile.name}`);
    // const snapshot = await storageRef.put(imageFile);
    // const downloadURL = await snapshot.ref.getDownloadURL();
    const mockURL = URL.createObjectURL(imageFile); // For local preview only

    const firebaseUser = auth.currentUser;
    if(firebaseUser) {
        await firebaseUser.updateProfile({ photoURL: mockURL });
    }
    
    try {
        const userRef = db.collection('users').doc(user.uid);
        await userRef.update({ profileImage: mockURL });
        setUser(prevUser => prevUser ? { ...prevUser, profileImage: mockURL } : null);
    } catch (error) {
        throw handleFirestoreError(error, 'profile image update');
    }
  };
  
  const updateUserProfile = async (data: { firstName: string; lastName: string; country: string }) => {
    if (!user) throw new Error("No user is signed in.");
    try {
        const userRef = db.collection('users').doc(user.uid);
        await userRef.update(data);
        setUser(prevUser => prevUser ? { ...prevUser, ...data } : null);
    } catch (error) {
        throw handleFirestoreError(error, 'user profile update');
    }
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
    try {
        const usersCollectionRef = db.collection('users');
        const snapshot = await usersCollectionRef.get();
        return snapshot.docs.map(doc => doc.data() as User);
    } catch (error) {
        throw handleFirestoreError(error, 'fetching all users');
    }
  };

  const updateUserPremiumStatus = async (uid: string, isPremium: boolean) => {
    try {
        const userRef = db.collection('users').doc(uid);
        await userRef.update({ isPremium });
    } catch (error) {
        throw handleFirestoreError(error, 'updating premium status');
    }
  };
  
  const updateUserApiPlan = async (uid: string, plan: 'free' | 'developer' | 'business') => {
    try {
        const userRef = db.collection('users').doc(uid);
        await userRef.update({ apiPlan: plan });
    } catch (error) {
        throw handleFirestoreError(error, 'updating API plan');
    }
  };
  
  const deleteUser = async (uid: string) => {
    try {
        const userRef = db.collection('users').doc(uid);
        await userRef.delete();
    } catch (error) {
        throw handleFirestoreError(error, 'deleting user');
    }
  };

  const deleteCurrentUser = async () => {
    const firebaseUser = auth.currentUser;
    if (!firebaseUser) {
        throw new Error("No user is currently signed in to delete.");
    }
    
    try {
        const userRef = db.collection('users').doc(firebaseUser.uid);
        await userRef.delete();
    } catch (error) {
        throw handleFirestoreError(error, 'deleting current user data');
    }
    
    await firebaseUser.delete();
  };
  
  const generateApiKey = async (): Promise<string> => {
    if (!user) throw new Error("You must be logged in.");
    const randomBytes = crypto.getRandomValues(new Uint8Array(32));
    const newApiKey = 'sk_live_' + btoa(String.fromCharCode(...randomBytes)).replace(/[^A-Za-z0-9]/g, '').substring(0, 40);
    
    try {
        const userRef = db.collection('users').doc(user.uid);
        await userRef.update({ apiKey: newApiKey });
        setUser(prevUser => prevUser ? { ...prevUser, apiKey: newApiKey } : null);
        return newApiKey;
    } catch (error) {
        throw handleFirestoreError(error, 'API key generation');
    }
  };
  
  const getApiUsage = async (): Promise<{ count: number; limit: number; resetsIn: string }> => {
    if (!user) throw new Error("You must be logged in.");
    const plan = user.apiPlan || 'free';
    const limits = { free: 100, developer: 1000, business: 10000 };
    return { count: Math.floor(Math.random() * limits[plan]), limit: limits[plan], resetsIn: '23h 59m' };
  };

  const updateTwoFactorStatus = async (enabled: boolean) => {
    if (!user) throw new Error("No user is signed in.");
    try {
        const userRef = db.collection('users').doc(user.uid);
        await userRef.update({ twoFactorEnabled: enabled });
        setUser(prevUser => (prevUser ? { ...prevUser, twoFactorEnabled: enabled } : null));
    } catch (error) {
        throw handleFirestoreError(error, '2FA status update');
    }
  };

  const updateBusinessDetails = async (details: BusinessDetails) => {
    if (!user) throw new Error("No user is signed in.");
    try {
        const userRef = db.collection('users').doc(user.uid);
        await userRef.update({ businessDetails: details });
        setUser(prevUser => prevUser ? { ...prevUser, businessDetails: details } : null);
    } catch (error) {
        throw handleFirestoreError(error, 'business details update');
    }
  };
  
  const submitProblemReport = async (reportData: Omit<ProblemReport, 'id' | 'timestamp' | 'status' | 'userId' | 'userName' | 'notes' | 'screenshotUrl'>) => {
    const report: Omit<ProblemReport, 'id'> = {
        ...reportData,
        timestamp: firebase.firestore.FieldValue.serverTimestamp() as firebase.firestore.Timestamp,
        status: 'New',
        userId: user?.uid,
        userName: user?.username,
    };
    try {
        await db.collection('reports').add(report);
    } catch (error) {
        throw handleFirestoreError(error, 'problem report submission');
    }
  };

  const getProblemReports = async (): Promise<ProblemReport[]> => {
      try {
          const reportsCollectionRef = db.collection('reports').orderBy('timestamp', 'desc');
          const snapshot = await reportsCollectionRef.get();
          return snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() } as ProblemReport));
      } catch (error) {
          throw handleFirestoreError(error, 'fetching problem reports');
      }
  };

  const updateReportStatus = async (reportId: string, status: ProblemReport['status']) => {
      try {
          const reportRef = db.collection('reports').doc(reportId);
          await reportRef.update({ status });
      } catch (error) {
          throw handleFirestoreError(error, 'updating report status');
      }
  };
  
  const deleteProblemReport = async (reportId: string) => {
      try {
          const reportRef = db.collection('reports').doc(reportId);
          await reportRef.delete();
      } catch(error) {
          throw handleFirestoreError(error, 'deleting problem report');
      }
  };

  const sendTaskCompletionEmail = async (toolTitle: string, outputFilename: string) => {
    if (!user || !user.email) {
      console.log("User not logged in, skipping email notification.");
      return;
    }

    try {
      await db.collection('notifications').add({
        to: user.email,
        message: {
          subject: `✅ Your task '${toolTitle}' is complete!`,
          html: `
            <p>Hello ${user.username},</p>
            <p>Your task '<strong>${toolTitle}</strong>' has been successfully completed.</p>
            <p>The output file is named: <strong>${outputFilename}</strong>.</p>
            <p>You can download it from the success screen in the app.</p>
            <p>Thank you for using PDFBullet!</p>
          `,
        },
        createdAt: firebase.firestore.FieldValue.serverTimestamp(),
        userId: user.uid,
      });
    } catch (error) {
      console.error("Error queueing email notification:", error);
    }
  };
  
  const logTask = async (taskData: { toolId: string; toolTitle: string; outputFilename: string; fileBlob: Blob | null }) => {
    if (!user || !taskData.fileBlob) return; 

    try {
        const taskLog = {
            userId: user.uid,
            username: user.username,
            toolId: taskData.toolId,
            toolTitle: taskData.toolTitle,
            outputFilename: taskData.outputFilename,
            timestamp: firebase.firestore.FieldValue.serverTimestamp(),
            fileSize: taskData.fileBlob.size,
        };
        await db.collection('tasks').add(taskLog);
    } catch (error) {
        console.error("Error logging task to Firestore:", error);
    }
  };

  const getTaskHistory = async (): Promise<TaskLog[]> => {
      try {
          const tasksCollectionRef = db.collection('tasks').orderBy('timestamp', 'desc');
          const snapshot = await tasksCollectionRef.get();
          return snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() } as TaskLog));
      } catch (error) {
          throw handleFirestoreError(error, 'fetching task history');
      }
  };

  const deleteTaskRecord = async (taskId: string) => {
      try {
          const taskRef = db.collection('tasks').doc(taskId);
          await taskRef.delete();
      } catch (error) {
          throw handleFirestoreError(error, 'deleting task record');
      }
  };

  const saveFaceDescriptor = async (descriptor: number[]) => {
    if (!user) throw new Error("No user is signed in.");
    try {
        const userRef = db.collection('users').doc(user.uid);
        await userRef.update({ faceDescriptor: descriptor });
        setUser(prevUser => prevUser ? { ...prevUser, faceDescriptor: descriptor } : null);
    } catch (error) {
        throw handleFirestoreError(error, 'saving face descriptor');
    }
  };

  const loginWithFace = async (email: string) => {
    try {
        const usersRef = db.collection('users');
        const q = usersRef.where('email', '==', email).limit(1);
        const snapshot = await q.get();
        
        if (snapshot.empty) {
            throw new Error("No account found with this email address.");
        }
        
        const userData = snapshot.docs[0].data() as User;

        // This is an insecure mock login method for demonstration purposes, as requested.
        // It bypasses Firebase Auth's password/token verification by directly setting
        // the user state in the React context.
        // FOR PRODUCTION: This should be replaced with a secure custom token flow.
        setUser(userData);

    } catch (error) {
        if (error instanceof Error) throw error;
        throw handleFirestoreError(error, 'face login');
    }
  };

  const value: AuthContextType = { user, loading, logout, updateProfileImage, updateUserProfile, getAllUsers, updateUserPremiumStatus, updateUserApiPlan, deleteUser, deleteCurrentUser, loginOrSignupWithGoogle, loginOrSignupWithGithub, signInWithEmail, signUpWithEmail, signInWithCustomToken, generateApiKey, getApiUsage, changePassword, updateTwoFactorStatus, updateBusinessDetails, submitProblemReport, getProblemReports, updateReportStatus, deleteProblemReport, sendTaskCompletionEmail, logTask, getTaskHistory, deleteTaskRecord, auth, saveFaceDescriptor, loginWithFace };

  return <AuthContext.Provider value={value}>{loading ? <Preloader /> : children}</AuthContext.Provider>;
};

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (context === undefined) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
};
