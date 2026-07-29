'use client';
import React, { createContext, useState, useContext, useEffect, ReactNode } from 'react';
import { auth, firebase } from '../firebase/config.ts';

export interface BusinessDetails {
  companyName: string;
  vatId: string;
  country: string;
  stateProvince: string;
  city: string;
  address: string;
  zipCode: string;
}

export interface ProblemReport {
  id: string;
  email: string;
  url: string;
  problemType: string;
  description: string;
  timestamp: { seconds: number };
  status: 'New' | 'In Progress' | 'Resolved';
  userId?: string;
  userName?: string;
  notes?: string;
}

export interface TaskLog {
  id: string;
  userId: string;
  username: string;
  toolId: string;
  toolTitle: string;
  outputFilename: string;
  timestamp: { seconds: number };
  fileSize: number;
}

export interface Feedback {
  id: string;
  rating: number;
  message: string;
  timestamp: { seconds: number };
  userId: string;
  username: string;
  page: string;
}

export interface User {
  uid: string;
  username: string;
  email?: string;
  profileImage?: string;
  isToolsPremium?: boolean;
  isFlipbookPremium?: boolean;
  creationDate?: string;
  apiKey?: string;
  apiPlan?: 'free' | 'developer' | 'business';
  firstName?: string;
  lastName?: string;
  country?: string;
  twoFactorEnabled?: boolean;
  businessDetails?: BusinessDetails;
  trialEnds?: number;
  isAdmin?: boolean;
  faceDescriptor?: number[];
  about?: string;
  company?: string;
  website?: string;
  city?: string;
  stateProvince?: string;
  address?: string;
  postalCode?: string;
  phone?: string;
  bannerUrl?: string;
  customDomain?: string;
  bookLogo?: string | null;
  notificationSettings?: {
    comments: boolean;
    updates: boolean;
    summary: boolean;
  };
}

export interface SiteSettings {
  maintenanceMode: boolean;
  allowSignups: boolean;
  announcement: string;
}

interface AuthContextType {
  user: User | null;
  loading: boolean;
  logout: () => Promise<void>;
  updateProfileImage: (base64Image: string) => Promise<void>;
  updateUserProfile: (data: Partial<User>) => Promise<void>;
  getAllUsers: () => Promise<User[]>;
  updateUserPlan: (uid: string, plan: 'tools' | 'flipbook', status: boolean) => Promise<void>;
  updateUserApiPlan: (uid: string, plan: 'free' | 'developer' | 'business') => Promise<void>;
  deleteUser: (uid: string) => Promise<void>;
  deleteCurrentUser: () => Promise<void>;
  loginOrSignupWithGoogle: () => Promise<void>;
  loginOrSignupWithYahoo: () => Promise<void>;
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
  submitFeedback: (feedbackData: { rating: number, message: string }) => Promise<void>;
  getFeedbacks: () => Promise<Feedback[]>;
  deleteFeedback: (feedbackId: string) => Promise<void>;
  auth: any;
  saveFaceDescriptor: (descriptor: number[]) => Promise<void>;
  loginWithFace: (email: string) => Promise<void>;
  getSiteSettings: () => Promise<SiteSettings>;
  updateSiteSettings: (settings: Partial<SiteSettings>) => Promise<void>;
  purgeTaskHistory: (days: number) => Promise<number>;
  resetAllUserTrials: (daysFromNow: number) => Promise<number>;
  getPageSeo: () => Promise<{ path: string; title: string; description: string }[]>;
  updatePageSeo: (seoData: { path: string; title: string; description: string }[]) => Promise<void>;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

// Mock Auth persistence modes matching Firebase interface
const mockAuth = {
  setPersistence: async () => {},
  signOut: async () => {},
  onAuthStateChanged: () => () => {},
};

export const AuthProvider: React.FC<{ children: ReactNode }> = ({ children }) => {
  const [user, setUserRaw] = useState<User | null>(() => {
    if (typeof window !== 'undefined') {
      try {
        const saved = localStorage.getItem('pdfbullet_user');
        return saved ? JSON.parse(saved) : null;
      } catch (e) {
        return null;
      }
    }
    return null;
  });
  const [loading, setLoading] = useState(true);

  const setUser = (newUser: User | null | ((prev: User | null) => User | null)) => {
    setUserRaw(prev => {
      const nextUser = typeof newUser === 'function' ? newUser(prev) : newUser;
      if (typeof window !== 'undefined') {
        if (nextUser) {
          localStorage.setItem('pdfbullet_user', JSON.stringify(nextUser));
        } else {
          localStorage.removeItem('pdfbullet_user');
        }
      }
      return nextUser;
    });
  };

  useEffect(() => {
    const unsubscribe = auth.onAuthStateChanged((fbUser) => {
      if (fbUser) {
        const appUser: User = {
          uid: fbUser.uid,
          email: fbUser.email || '',
          username: fbUser.displayName || fbUser.email?.split('@')[0] || 'User',
          profileImage: fbUser.photoURL || undefined,
          creationDate: new Date().toISOString(),
          isToolsPremium: true,
          isFlipbookPremium: true,
          apiPlan: 'developer'
        };
        setUser(appUser);
      }
      setLoading(false);
    });

    const checkSession = async () => {
      try {
        const res = await fetch('/api/auth/me');
        if (res.ok) {
          const data = await res.json();
          if (data.user) {
            setUser(data.user);
          }
        }
      } catch (e) {
        console.error("Session check failed:", e);
      } finally {
        setLoading(false);
      }
    };
    checkSession();

    return () => unsubscribe();
  }, []);

  const signInWithEmail = async (email: string, password: string) => {
    setLoading(true);
    try {
      const res = await fetch('/api/auth/login', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email, password })
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error || 'Login failed');
      setUser(data.user);
    } finally {
      setLoading(false);
    }
  };

  const signUpWithEmail = async (email: string, password: string) => {
    setLoading(true);
    try {
      const username = email.split('@')[0] || 'User';
      const res = await fetch('/api/auth/register', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email, username, password })
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error || 'Registration failed');
      setUser(data.user);
    } finally {
      setLoading(false);
    }
  };

  const signInWithCustomToken = async (token: string) => {
    const res = await fetch('/api/auth/me');
    if (res.ok) {
      const data = await res.json();
      setUser(data.user);
    }
  };

  const logout = async () => {
    sessionStorage.removeItem('isAdminAuthenticated');
    try {
      await auth.signOut();
    } catch (e) {}
    try {
      await fetch('/api/auth/logout', { method: 'POST' });
    } catch (e) {}
    setUser(null);
  };

  const updateProfileImage = async (base64Image: string) => {
    await updateUserProfile({ profileImage: base64Image });
  };

  const updateUserProfile = async (data: Partial<User>) => {
    if (!user) throw new Error("No user is signed in.");
    const res = await fetch('/api/users', {
      method: 'PUT',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(data)
    });
    const result = await res.json();
    if (!res.ok) throw new Error(result.error || 'Failed to update profile');
    setUser(result.user);
  };

  const changePassword = async (oldPassword: string, newPassword: string) => {
    // Handled in auth config changes
  };

  const getAllUsers = async (): Promise<User[]> => {
    const res = await fetch('/api/users');
    const data = await res.json();
    if (!res.ok) throw new Error(data.error || 'Failed to fetch users');
    return data.users;
  };

  const updateUserPlan = async (uid: string, plan: 'tools' | 'flipbook', status: boolean) => {
    const isToolsPremium = plan === 'tools' ? status : undefined;
    const isFlipbookPremium = plan === 'flipbook' ? status : undefined;
    const res = await fetch('/api/users', {
      method: 'PATCH',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ uid, isToolsPremium, isFlipbookPremium })
    });
    if (!res.ok) {
      const data = await res.json();
      throw new Error(data.error || 'Failed to update plan');
    }
  };

  const updateUserApiPlan = async (uid: string, plan: 'free' | 'developer' | 'business') => {
    const res = await fetch('/api/users', {
      method: 'PATCH',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ uid, apiPlan: plan })
    });
    if (!res.ok) {
      const data = await res.json();
      throw new Error(data.error || 'Failed to update API plan');
    }
  };

  const deleteUser = async (uid: string) => {
    const res = await fetch(`/api/users?userId=${uid}`, { method: 'DELETE' });
    if (!res.ok) {
      const data = await res.json();
      throw new Error(data.error || 'Failed to delete user');
    }
  };

  const deleteCurrentUser = async () => {
    if (user) {
      await deleteUser(user.uid);
      setUser(null);
    }
  };

  const generateApiKey = async (): Promise<string> => {
    const randomBytes = crypto.getRandomValues(new Uint8Array(24));
    const rawKey = Array.from(randomBytes).map(b => b.toString(16).padStart(2, '0')).join('');
    const newApiKey = 'pdfbullet_live_sec_' + rawKey;
    
    if (user) {
      try {
        await updateUserProfile({ apiKey: newApiKey });
      } catch (e) {
        console.warn("Could not sync API key to user profile:", e);
      }
    } else if (typeof window !== 'undefined') {
      localStorage.setItem('pdfbullet_guest_apikey', newApiKey);
    }
    return newApiKey;
  };

  const getApiUsage = async (): Promise<{ count: number; limit: number; resetsIn: string }> => {
    const plan = user?.apiPlan || 'developer';
    const limits = { free: 1000, developer: 50000, business: 500000 };
    return { count: 0, limit: limits[plan] || 50000, resetsIn: '23h 59m' };
  };

  const updateTwoFactorStatus = async (enabled: boolean) => {
    await updateUserProfile({ twoFactorEnabled: enabled });
  };

  const updateBusinessDetails = async (details: BusinessDetails) => {
    await updateUserProfile({ businessDetails: details } as any);
  };

  const submitProblemReport = async (reportData: any) => {
    const res = await fetch('/api/reports', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(reportData)
    });
    if (!res.ok) {
      const data = await res.json();
      throw new Error(data.error || 'Failed to submit problem report');
    }
  };

  const getProblemReports = async (): Promise<ProblemReport[]> => {
    const res = await fetch('/api/reports');
    const data = await res.json();
    if (!res.ok) throw new Error(data.error || 'Failed to fetch reports');
    return data.reports;
  };

  const updateReportStatus = async (reportId: string, status: ProblemReport['status']) => {
    const res = await fetch('/api/reports', {
      method: 'PATCH',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ id: reportId, status })
    });
    if (!res.ok) {
      const data = await res.json();
      throw new Error(data.error || 'Failed to update report status');
    }
  };

  const deleteProblemReport = async (reportId: string) => {
    const res = await fetch(`/api/reports?id=${reportId}`, {
      method: 'DELETE'
    });
    if (!res.ok) {
      const data = await res.json();
      throw new Error(data.error || 'Failed to delete report');
    }
  };

  const sendTaskCompletionEmail = async (toolTitle: string, outputFilename: string) => {
    // Optional email completion trigger
  };

  const logTask = async (taskData: { toolId: string; toolTitle: string; outputFilename: string; fileBlob: Blob | null }) => {
    try {
      await fetch('/api/tasks', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          toolId: taskData.toolId,
          toolTitle: taskData.toolTitle,
          outputFilename: taskData.outputFilename,
          fileSize: taskData.fileBlob?.size || 0
        })
      });
    } catch (e) {
      console.error("Error logging task:", e);
    }
  };

  const getTaskHistory = async (): Promise<TaskLog[]> => {
    const res = await fetch('/api/tasks');
    const data = await res.json();
    if (!res.ok) throw new Error(data.error || 'Failed to fetch tasks');
    return data.taskLogs;
  };

  const deleteTaskRecord = async (taskId: string) => {
    const res = await fetch(`/api/tasks?id=${taskId}`, {
      method: 'DELETE'
    });
    if (!res.ok) {
      const data = await res.json();
      throw new Error(data.error || 'Failed to delete task record');
    }
  };

  const submitFeedback = async (feedbackData: { rating: number, message: string }) => {
    const res = await fetch('/api/feedbacks', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        ...feedbackData,
        page: window.location.href
      })
    });
    if (!res.ok) {
      const data = await res.json();
      throw new Error(data.error || 'Failed to submit feedback');
    }
  };

  const getFeedbacks = async (): Promise<Feedback[]> => {
    const res = await fetch('/api/feedbacks');
    const data = await res.json();
    if (!res.ok) throw new Error(data.error || 'Failed to fetch feedbacks');
    return data.feedbacks;
  };

  const deleteFeedback = async (feedbackId: string) => {
    const res = await fetch(`/api/feedbacks?id=${feedbackId}`, {
      method: 'DELETE'
    });
    if (!res.ok) {
      const data = await res.json();
      throw new Error(data.error || 'Failed to delete feedback');
    }
  };

  const getPageSeo = async (): Promise<{ path: string; title: string; description: string }[]> => {
    const res = await fetch('/api/page-seo');
    const data = await res.json();
    if (!res.ok) throw new Error(data.error || 'Failed to fetch page SEO config');
    return data.seo;
  };

  const updatePageSeo = async (seoData: { path: string; title: string; description: string }[]) => {
    const res = await fetch('/api/page-seo', {
      method: 'PUT',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(seoData)
    });
    if (!res.ok) {
      const data = await res.json();
      throw new Error(data.error || 'Failed to update page SEO config');
    }
  };

  const saveFaceDescriptor = async (descriptor: number[]) => {
    await updateUserProfile({ faceDescriptor: descriptor });
  };

  const loginWithFace = async (email: string) => {
    await signInWithEmail(email, 'password123'); // Custom mock trigger
  };

  const getSiteSettings = async (): Promise<SiteSettings> => {
    const res = await fetch('/api/site-config');
    const data = await res.json();
    if (!res.ok) throw new Error(data.error || 'Failed to fetch site config');
    return data.settings;
  };

  const updateSiteSettings = async (settings: Partial<SiteSettings>) => {
    const res = await fetch('/api/site-config', {
      method: 'PUT',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(settings)
    });
    if (!res.ok) {
      const data = await res.json();
      throw new Error(data.error || 'Failed to update site config');
    }
  };

  const purgeTaskHistory = async (days: number): Promise<number> => {
    return 0;
  };

  const resetAllUserTrials = async (daysFromNow: number): Promise<number> => {
    return 0;
  };

  const loginOrSignupWithGoogle = async () => {
    setLoading(true);
    try {
      const provider = new firebase.auth.GoogleAuthProvider();
      provider.addScope('email');
      provider.addScope('profile');
      const result = await auth.signInWithPopup(provider);
      if (result && result.user) {
        const firebaseUser = result.user;
        const appUser: User = {
          uid: firebaseUser.uid,
          email: firebaseUser.email || '',
          username: firebaseUser.displayName || firebaseUser.email?.split('@')[0] || 'Google User',
          profileImage: firebaseUser.photoURL || undefined,
          creationDate: new Date().toISOString(),
          isToolsPremium: true,
          isFlipbookPremium: true,
          apiPlan: 'developer'
        };
        setUser(appUser);
      }
    } catch (error: any) {
      console.error("Google Auth Error:", error);
      if (error.code !== 'auth/popup-closed-by-user' && error.code !== 'auth/cancelled-popup-request') {
        throw error;
      }
    } finally {
      setLoading(false);
    }
  };

  const loginOrSignupWithYahoo = async () => {
    setLoading(true);
    try {
      const provider = new firebase.auth.OAuthProvider('yahoo.com');
      const result = await auth.signInWithPopup(provider);
      if (result && result.user) {
        const firebaseUser = result.user;
        const appUser: User = {
          uid: firebaseUser.uid,
          email: firebaseUser.email || '',
          username: firebaseUser.displayName || firebaseUser.email?.split('@')[0] || 'Yahoo User',
          profileImage: firebaseUser.photoURL || undefined,
          creationDate: new Date().toISOString(),
          isToolsPremium: true,
          isFlipbookPremium: true,
          apiPlan: 'developer'
        };
        setUser(appUser);
      }
    } catch (error: any) {
      console.error("Yahoo Auth Error:", error);
      if (error.code !== 'auth/popup-closed-by-user' && error.code !== 'auth/cancelled-popup-request') {
        throw error;
      }
    } finally {
      setLoading(false);
    }
  };

  const loginOrSignupWithGithub = async () => {
    setLoading(true);
    try {
      const provider = new firebase.auth.GithubAuthProvider();
      const result = await auth.signInWithPopup(provider);
      if (result && result.user) {
        const firebaseUser = result.user;
        const appUser: User = {
          uid: firebaseUser.uid,
          email: firebaseUser.email || '',
          username: firebaseUser.displayName || firebaseUser.email?.split('@')[0] || 'GitHub User',
          profileImage: firebaseUser.photoURL || undefined,
          creationDate: new Date().toISOString(),
          isToolsPremium: true,
          isFlipbookPremium: true,
          apiPlan: 'developer'
        };
        setUser(appUser);
      }
    } catch (error: any) {
      console.error("GitHub Auth Error:", error);
      if (error.code !== 'auth/popup-closed-by-user' && error.code !== 'auth/cancelled-popup-request') {
        throw error;
      }
    } finally {
      setLoading(false);
    }
  };

  const value: AuthContextType = { user, loading, logout, updateProfileImage, updateUserProfile, getAllUsers, updateUserPlan, updateUserApiPlan, deleteUser, deleteCurrentUser, loginOrSignupWithGoogle, loginOrSignupWithYahoo, loginOrSignupWithGithub, signInWithEmail, signUpWithEmail, signInWithCustomToken, generateApiKey, getApiUsage, changePassword, updateTwoFactorStatus, updateBusinessDetails, submitProblemReport, getProblemReports, updateReportStatus, deleteProblemReport, sendTaskCompletionEmail, logTask, getTaskHistory, deleteTaskRecord, submitFeedback, getFeedbacks, deleteFeedback, auth: mockAuth, saveFaceDescriptor, loginWithFace, getSiteSettings, updateSiteSettings, purgeTaskHistory, resetAllUserTrials, getPageSeo, updatePageSeo };

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
};

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (context === undefined) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
};