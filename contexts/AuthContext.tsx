import React, { createContext, useState, useContext, useEffect, ReactNode } from 'react';

// NOTE: This is a mock authentication system.
// In a real-world app, this would be handled by a secure backend.

interface User {
  username: string;
  profileImage?: string; // Stored as base64 string
  isPremium?: boolean;
  creationDate?: string; // ISO string
  apiKey?: string;
  apiPlan?: 'free' | 'developer' | 'business';
}

interface ApiUsage {
    count: number;
    lastReset: number; // timestamp
}

interface GoogleUserPayload {
    email: string;
    name: string;
    picture?: string;
}

interface AuthContextType {
  user: User | null;
  loading: boolean;
  login: (username: string, pass: string) => Promise<User>;
  signup: (username: string, pass: string) => Promise<User>;
  logout: () => void;
  updateProfileImage: (username: string, image: string) => Promise<void>;
  changePassword: (username: string, oldPass: string, newPass: string) => Promise<void>;
  getAllUsers: () => { [username: string]: any };
  updateUserPremiumStatus: (username: string, isPremium: boolean) => Promise<void>;
  updateUserApiPlan: (username: string, plan: 'free' | 'developer' | 'business') => Promise<void>;
  deleteUser: (username: string) => Promise<void>;
  loginOrSignupWithGoogle: (payload: GoogleUserPayload) => Promise<User>;
  generateApiKey: () => Promise<string>;
  getApiUsage: () => Promise<{ count: number; limit: number; resetsIn: string }>;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

const USERS_STORAGE_KEY = 'ilovepdfly_users_v2';
const SESSION_STORAGE_KEY = 'ilovepdfly_session_v2';

// Helper to get users from storage
const getStoredUsers = () => {
    try {
        return JSON.parse(localStorage.getItem(USERS_STORAGE_KEY) || '{}');
    } catch (e) {
        return {};
    }
};

// Helper to save users to storage
const setStoredUsers = (users: any) => {
    localStorage.setItem(USERS_STORAGE_KEY, JSON.stringify(users));
};

export const AuthProvider: React.FC<{ children: ReactNode }> = ({ children }) => {
  const [user, setUser] = useState<User | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    // Check for an active session on initial load
    try {
        const savedSession = localStorage.getItem(SESSION_STORAGE_KEY);
        if (savedSession) {
          setUser(JSON.parse(savedSession));
        }
    } catch (e) {
        console.error("Failed to parse session data:", e);
        localStorage.removeItem(SESSION_STORAGE_KEY);
    } finally {
        setLoading(false);
    }
  }, []);

  const login = async (username: string, pass: string): Promise<User> => {
    const storedUsers = getStoredUsers();
    const userData = storedUsers[username];
    if (userData && userData.password === pass) {
      const loggedInUser: User = { 
        username,
        profileImage: userData.profileImage,
        isPremium: userData.isPremium || false,
        creationDate: userData.creationDate,
        apiKey: userData.apiKey,
        apiPlan: userData.apiPlan || 'free',
      };
      setUser(loggedInUser);
      localStorage.setItem(SESSION_STORAGE_KEY, JSON.stringify(loggedInUser));
      return loggedInUser;
    } else {
      throw new Error('Invalid username or password');
    }
  };

  const signup = async (username: string, pass: string): Promise<User> => {
    const storedUsers = getStoredUsers();
    if (storedUsers[username]) {
      throw new Error('Username already exists');
    }
    const creationDate = new Date().toISOString();
    storedUsers[username] = { password: pass, profileImage: undefined, isPremium: false, creationDate, apiPlan: 'free' };
    setStoredUsers(storedUsers);
    
    const loggedInUser: User = { username, isPremium: false, creationDate, apiPlan: 'free' };
    setUser(loggedInUser);
    localStorage.setItem(SESSION_STORAGE_KEY, JSON.stringify(loggedInUser));
    return loggedInUser;
  };

  const loginOrSignupWithGoogle = async (payload: GoogleUserPayload): Promise<User> => {
    const storedUsers = getStoredUsers();
    const username = payload.email; 
    let userData = storedUsers[username];

    if (!userData) {
      const creationDate = new Date().toISOString();
      const randomPassword = Math.random().toString(36).slice(-8);
      storedUsers[username] = { 
          password: randomPassword, 
          profileImage: payload.picture, 
          isPremium: false, 
          creationDate,
          apiPlan: 'free',
      };
      setStoredUsers(storedUsers);
      userData = storedUsers[username];
    }
    
    const loggedInUser: User = { 
      username,
      profileImage: userData.profileImage || payload.picture,
      isPremium: userData.isPremium || false,
      creationDate: userData.creationDate,
      apiKey: userData.apiKey,
      apiPlan: userData.apiPlan || 'free',
    };
    setUser(loggedInUser);
    localStorage.setItem(SESSION_STORAGE_KEY, JSON.stringify(loggedInUser));
    return loggedInUser;
  };

  const logout = () => {
    setUser(null);
    localStorage.removeItem(SESSION_STORAGE_KEY);
    sessionStorage.removeItem('isAdminAuthenticated');
  };

  const updateProfileImage = async (username: string, image: string): Promise<void> => {
      const storedUsers = getStoredUsers();
      if (storedUsers[username]) {
          storedUsers[username].profileImage = image;
          setStoredUsers(storedUsers);

          const updatedUser = { ...user, profileImage: image } as User;
          setUser(updatedUser);
          localStorage.setItem(SESSION_STORAGE_KEY, JSON.stringify(updatedUser));
      } else {
          throw new Error("User not found.");
      }
  };

  const changePassword = async (username: string, oldPass: string, newPass: string): Promise<void> => {
    const storedUsers = getStoredUsers();
    const userData = storedUsers[username];
    if (userData && userData.password === oldPass) {
        if (newPass.length < 6) {
            throw new Error("New password must be at least 6 characters long.");
        }
        storedUsers[username].password = newPass;
        setStoredUsers(storedUsers);
    } else {
        throw new Error("Incorrect old password.");
    }
  };
  
  const getAllUsers = () => {
      const storedUsers = getStoredUsers();
      const safeUsers: { [username: string]: any } = {};
      for (const username in storedUsers) {
          const { password, ...rest } = storedUsers[username];
          safeUsers[username] = rest;
      }
      return safeUsers;
  }
  
  const updateUserPremiumStatus = async (username: string, isPremium: boolean): Promise<void> => {
      const storedUsers = getStoredUsers();
      if (storedUsers[username]) {
          storedUsers[username].isPremium = isPremium;
          setStoredUsers(storedUsers);
          if (user && user.username === username) {
              const updatedUser = { ...user, isPremium };
              setUser(updatedUser);
              localStorage.setItem(SESSION_STORAGE_KEY, JSON.stringify(updatedUser));
          }
      } else {
          throw new Error("User not found.");
      }
  }

  const updateUserApiPlan = async (username: string, plan: 'free' | 'developer' | 'business'): Promise<void> => {
    const storedUsers = getStoredUsers();
    if (storedUsers[username]) {
        storedUsers[username].apiPlan = plan;
        setStoredUsers(storedUsers);
        if (user && user.username === username) {
            const updatedUser = { ...user, apiPlan: plan };
            setUser(updatedUser);
            localStorage.setItem(SESSION_STORAGE_KEY, JSON.stringify(updatedUser));
        }
    } else {
        throw new Error("User not found.");
    }
  };

  const deleteUser = async (username: string): Promise<void> => {
      const storedUsers = getStoredUsers();
      if (storedUsers[username]) {
          if (user && user.username === username) {
              throw new Error("Admins cannot delete their own account from the dashboard.");
          }
          delete storedUsers[username];
          setStoredUsers(storedUsers);
      } else {
          throw new Error("User not found.");
      }
  };

  const generateApiKey = async (): Promise<string> => {
    if (!user) throw new Error("You must be logged in.");
    const storedUsers = getStoredUsers();
    const userData = storedUsers[user.username];
    
    const newApiKey = 'pdfly-' + Array.from(crypto.getRandomValues(new Uint8Array(16))).map(b => b.toString(16).padStart(2, '0')).join('');
    userData.apiKey = newApiKey;
    if (!userData.apiUsage) {
        userData.apiUsage = { count: 0, lastReset: Date.now() };
    }
    if (!userData.apiPlan) {
        userData.apiPlan = 'free';
    }
    setStoredUsers(storedUsers);
    
    const updatedUser = { ...user, apiKey: newApiKey, apiPlan: userData.apiPlan };
    setUser(updatedUser);
    localStorage.setItem(SESSION_STORAGE_KEY, JSON.stringify(updatedUser));
    
    return newApiKey;
  };
  
  const getApiUsage = async (): Promise<{ count: number; limit: number; resetsIn: string }> => {
    if (!user) throw new Error("You must be logged in to view API usage.");
    const storedUsers = getStoredUsers();
    const userData = storedUsers[user.username];

    const plan = user.apiPlan || 'free';
    const limits = { free: 100, developer: 1000, business: 10000 };
    const limit = limits[plan];

    if (!userData.apiKey || !userData.apiUsage) {
        return { count: 0, limit, resetsIn: '24h 0m' };
    }
    
    const now = Date.now();
    const oneDay = 24 * 60 * 60 * 1000;
    const timeSinceReset = now - userData.apiUsage.lastReset;

    if (timeSinceReset > oneDay) {
        userData.apiUsage.count = 0;
        userData.apiUsage.lastReset = now;
        setStoredUsers(storedUsers);
    }
    
    const timeLeft = oneDay - timeSinceReset;
    const hours = Math.max(0, Math.floor(timeLeft / (60 * 60 * 1000)));
    const minutes = Math.max(0, Math.floor((timeLeft % (60 * 60 * 1000)) / (60 * 1000)));
    const resetsIn = `${hours}h ${minutes}m`;

    return { count: userData.apiUsage.count, limit, resetsIn };
  };

  return (
    <AuthContext.Provider value={{ user, loading, login, signup, logout, updateProfileImage, changePassword, getAllUsers, updateUserPremiumStatus, updateUserApiPlan, deleteUser, loginOrSignupWithGoogle, generateApiKey, getApiUsage }}>
      {children}
    </AuthContext.Provider>
  );
};

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (context === undefined) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
};