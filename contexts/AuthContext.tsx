import React, { createContext, useState, useContext, useEffect, ReactNode } from 'react';

// Mock types to mimic Firebase interfaces for compatibility
type MockFirebaseUser = { uid: string; email?: string | null; phoneNumber?: string | null; displayName?: string | null; photoURL?: string | null; metadata: { creationTime?: string } };
type MockConfirmationResult = { confirm: (otp: string) => Promise<{ user: MockFirebaseUser }> };

// User interface for our app
interface User {
  uid: string;
  username: string;
  profileImage?: string;
  isPremium?: boolean;
  creationDate?: string;
  apiKey?: string;
  apiPlan?: 'free' | 'developer' | 'business';
}

// Auth Context Type
interface AuthContextType {
  user: User | null;
  loading: boolean;
  login: (email: string, pass: string) => Promise<MockFirebaseUser>;
  signup: (email: string, pass: string) => Promise<MockFirebaseUser>;
  logout: () => void;
  updateProfileImage: (imageFile: File) => Promise<void>;
  changePassword: (oldPass: string, newPass: string) => Promise<void>;
  getAllUsers: () => Promise<User[]>;
  updateUserPremiumStatus: (uid: string, isPremium: boolean) => Promise<void>;
  updateUserApiPlan: (uid: string, plan: 'free' | 'developer' | 'business') => Promise<void>;
  deleteUser: (uid: string) => Promise<void>;
  loginOrSignupWithGoogle: () => Promise<MockFirebaseUser>;
  generateApiKey: () => Promise<string>;
  getApiUsage: () => Promise<{ count: number; limit: number; resetsIn: string }>;
  sendLoginOtp: (phoneNumber: string) => Promise<MockConfirmationResult>;
  verifyLoginOtp: (confirmationResult: MockConfirmationResult, otp: string) => Promise<MockFirebaseUser>;
  displayedOtp: string | null;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

// Mock data for admin dashboard simulation
let mockUsers: User[] = [
    { uid: 'admin-user-01', username: 'admin@example.com', isPremium: true, creationDate: new Date().toISOString(), apiPlan: 'business', apiKey: 'pdfly-fake-api-key-admin' },
    { uid: 'test-user-02', username: 'test@example.com', isPremium: false, creationDate: new Date().toISOString(), apiPlan: 'free' },
];

export const AuthProvider: React.FC<{ children: ReactNode }> = ({ children }) => {
  const [user, setUser] = useState<User | null>(null);
  const [loading, setLoading] = useState(true);
  const [displayedOtp, setDisplayedOtp] = useState<string | null>(null);

  useEffect(() => {
    // Simulate checking for a logged-in user from localStorage
    try {
      const storedUser = localStorage.getItem('ilovepdfly_user');
      if (storedUser) {
        setUser(JSON.parse(storedUser));
      }
    } catch (e) {
        console.error("Failed to parse user from localStorage", e);
        localStorage.removeItem('ilovepdfly_user');
    }
    setLoading(false);
  }, []);

  const persistUser = (userData: User | null) => {
    if (userData) {
      localStorage.setItem('ilovepdfly_user', JSON.stringify(userData));
      setUser(userData);
    } else {
      localStorage.removeItem('ilovepdfly_user');
      setUser(null);
    }
  };

  const createMockFirebaseUser = (userData: User): MockFirebaseUser => ({
    uid: userData.uid,
    email: userData.username.includes('@') ? userData.username : null,
    phoneNumber: !userData.username.includes('@') ? userData.username : null,
    displayName: userData.username,
    photoURL: userData.profileImage || null,
    metadata: { creationTime: userData.creationDate }
  });

  const signup = async (email: string, pass: string): Promise<MockFirebaseUser> => {
    if (!email || !pass) throw new Error("Email and password are required.");
    if (pass.length < 6) throw new Error("Password must be at least 6 characters long.");
    const newUser: User = {
      uid: `user-${Date.now()}`,
      username: email,
      isPremium: false,
      creationDate: new Date().toISOString(),
      apiPlan: 'free',
    };
    persistUser(newUser);
    return createMockFirebaseUser(newUser);
  };

  const login = async (email: string, pass: string): Promise<MockFirebaseUser> => {
     if (!email || !pass) throw new Error("Email and password are required.");
    const existingUser: User = {
        uid: `user-${Date.now()}`,
        username: email,
        isPremium: email.includes('premium'), // Mock logic
        creationDate: new Date().toISOString(),
        apiPlan: 'free',
        profileImage: 'https://i.pravatar.cc/150'
    };
    persistUser(existingUser);
    return createMockFirebaseUser(existingUser);
  };

  const logout = async () => {
    persistUser(null);
    sessionStorage.removeItem('isAdminAuthenticated');
  };
  
  const sendLoginOtp = async (phoneNumber: string): Promise<MockConfirmationResult> => {
    setDisplayedOtp(null);
    console.log(`Simulating OTP send to ${phoneNumber}`);
    await new Promise(res => setTimeout(res, 1500)); // Simulate network delay
    
    // Generate a secure, random 6-digit OTP
    const generatedOtp = Math.floor(100000 + Math.random() * 900000).toString();
    console.log(`Generated OTP for ${phoneNumber}: ${generatedOtp}`); // For debugging/demo purposes
    
    // Set OTP for display in the UI
    setDisplayedOtp(generatedOtp);

    // Store OTP in session storage to verify later
    sessionStorage.setItem(`otp_${phoneNumber}`, generatedOtp);
    
    return {
      confirm: async (otp: string): Promise<{ user: MockFirebaseUser }> => {
        const storedOtp = sessionStorage.getItem(`otp_${phoneNumber}`);
        sessionStorage.removeItem(`otp_${phoneNumber}`); // OTP can only be used once
        setDisplayedOtp(null);

        if (otp === storedOtp) {
            const newUser: User = {
                uid: `phone-user-${Date.now()}`,
                username: phoneNumber,
                isPremium: false,
                creationDate: new Date().toISOString(),
                apiPlan: 'free',
            };
            persistUser(newUser);
            return { user: createMockFirebaseUser(newUser) };
        } else {
            throw new Error("Invalid OTP code. Please try again.");
        }
      }
    };
  };

  const verifyLoginOtp = async (confirmationResult: MockConfirmationResult, otp: string): Promise<MockFirebaseUser> => {
      const { user: firebaseUser } = await confirmationResult.confirm(otp);
      return firebaseUser;
  };
  
  const loginOrSignupWithGoogle = async (): Promise<MockFirebaseUser> => {
      const googleUser: User = {
          uid: `google-user-${Date.now()}`,
          username: 'google.user@example.com',
          isPremium: false,
          creationDate: new Date().toISOString(),
          apiPlan: 'free',
          profileImage: 'https://i.pravatar.cc/150?u=google'
      };
      persistUser(googleUser);
      return createMockFirebaseUser(googleUser);
  };

  const updateProfileImage = async (imageFile: File) => {
    if (!user) throw new Error("No user is signed in.");
    const reader = new FileReader();
    reader.readAsDataURL(imageFile);
    await new Promise<void>((resolve, reject) => {
        reader.onloadend = () => {
            const downloadURL = reader.result as string;
            const updatedUser = { ...user, profileImage: downloadURL };
            persistUser(updatedUser);
            resolve();
        };
        reader.onerror = reject;
    });
  };

  const changePassword = async (oldPass: string, newPass: string) => {
    if (!oldPass || !newPass) throw new Error("Passwords cannot be empty.");
    if (newPass.length < 6) throw new Error("New password must be at least 6 characters.");
    console.log("Password change simulation successful.");
  };

  // Admin Functions (mocked)
  const getAllUsers = async (): Promise<User[]> => [...mockUsers];
  
  const updateUserPremiumStatus = async (uid: string, isPremium: boolean) => {
    mockUsers = mockUsers.map(u => u.uid === uid ? { ...u, isPremium } : u);
  };
  
  const updateUserApiPlan = async (uid: string, plan: 'free' | 'developer' | 'business') => {
    mockUsers = mockUsers.map(u => u.uid === uid ? { ...u, apiPlan: plan } : u);
  };
  
  const deleteUser = async (uid: string) => {
    mockUsers = mockUsers.filter(u => u.uid !== uid);
  };
  
  const generateApiKey = async (): Promise<string> => {
    if (!user) throw new Error("You must be logged in.");
    const newApiKey = 'pdfly-mock-' + Array.from(crypto.getRandomValues(new Uint8Array(16))).map(b => b.toString(16).padStart(2, '0')).join('');
    const updatedUser = { ...user, apiKey: newApiKey };
    persistUser(updatedUser);
    return newApiKey;
  };
  
  const getApiUsage = async (): Promise<{ count: number; limit: number; resetsIn: string }> => {
    if (!user) throw new Error("You must be logged in.");
    const plan = user.apiPlan || 'free';
    const limits = { free: 100, developer: 1000, business: 10000 };
    return { count: Math.floor(Math.random() * limits[plan]), limit: limits[plan], resetsIn: '23h 59m' };
  };

  const value = { user, loading, login, signup, logout, updateProfileImage, changePassword, getAllUsers, updateUserPremiumStatus, updateUserApiPlan, deleteUser, loginOrSignupWithGoogle, generateApiKey, getApiUsage, sendLoginOtp, verifyLoginOtp, displayedOtp };

  return <AuthContext.Provider value={value}>{!loading && children}</AuthContext.Provider>;
};

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (context === undefined) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
};