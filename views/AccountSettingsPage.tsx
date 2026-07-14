 import React, { useState, useEffect } from 'react';
 import { Link } from 'react-router-dom';
 import { useAuth } from '../contexts/AuthContext.tsx';
 import { UserIcon, StarIcon, ApiIcon, WarningIcon, KeyIcon, LockIcon, PlusIcon, TrashIcon, PasskeyIcon, UserCircleIcon } from '../components/icons.tsx';
 import ChangePasswordModal from '../components/ChangePasswordModal.tsx';
 import TwoFactorAuthModal from '../components/TwoFactorAuthModal.tsx';
 import { useWebAuthn, StoredCredential } from '../hooks/useWebAuthn.ts';
 
 const countries = [
   { code: 'AF', name: 'Afghanistan', flag: '🇦🇫' }, { code: 'AL', name: 'Albania', flag: '🇦🇱' },
   { code: 'DZ', name: 'Algeria', flag: '🇩🇿' }, { code: 'AD', name: 'Andorra', flag: '🇦🇩' },
   { code: 'AO', name: 'Angola', flag: '🇦🇴' }, { code: 'AG', name: 'Antigua & Barbuda', flag: '🇦🇬' },
   { code: 'AR', name: 'Argentina', flag: '🇦🇷' }, { code: 'AM', name: 'Armenia', flag: '🇦🇲' },
   { code: 'AU', name: 'Australia', flag: '🇦🇺' }, { code: 'AT', name: 'Austria', flag: '🇦🇹' },
   { code: 'AZ', name: 'Azerbaijan', flag: '🇦🇿' }, { code: 'BS', name: 'Bahamas', flag: '🇧🇸' },
   { code: 'BH', name: 'Bahrain', flag: '🇧🇭' }, { code: 'BD', name: 'Bangladesh', flag: '🇧🇩' },
   { code: 'BB', name: 'Barbados', flag: '🇧🇧' }, { code: 'BY', name: 'Belarus', flag: '🇧🇾' },
   { code: 'BE', name: 'Belgium', flag: '🇧🇪' }, { code: 'BZ', name: 'Belize', flag: '🇧🇿' },
   { code: 'BJ', name: 'Benin', flag: '🇧🇯' }, { code: 'BT', name: 'Bhutan', flag: '🇧🇹' },
   { code: 'BO', name: 'Bolivia', flag: '🇧🇴' }, { code: 'BA', name: 'Bosnia & Herzegovina', flag: '🇧🇦' },
   { code: 'BW', name: 'Botswana', flag: '🇧🇼' }, { code: 'BR', name: 'Brazil', flag: '🇧🇷' },
   { code: 'BN', name: 'Brunei', flag: '🇧🇳' }, { code: 'BG', name: 'Bulgaria', flag: '🇧🇬' },
   { code: 'BF', name: 'Burkina Faso', flag: '🇧🇫' }, { code: 'BI', name: 'Burundi', flag: '🇧🇮' },
   { code: 'CV', name: 'Cape Verde', flag: '🇨🇻' }, { code: 'KH', name: 'Cambodia', flag: '🇰🇭' },
   { code: 'CM', name: 'Cameroon', flag: '🇨🇲' }, { code: 'CA', name: 'Canada', flag: '🇨🇦' },
   { code: 'CF', name: 'Central African Republic', flag: '🇨🇫' }, { code: 'TD', name: 'Chad', flag: '🇹🇩' },
   { code: 'CL', name: 'Chile', flag: '🇨🇱' }, { code: 'CN', name: 'China', flag: '🇨🇳' },
   { code: 'CO', name: 'Colombia', flag: '🇨🇴' }, { code: 'KM', name: 'Comoros', flag: '🇰🇲' },
   { code: 'CG', name: 'Congo', flag: '🇨🇬' }, { code: 'CR', name: 'Costa Rica', flag: '🇨🇷' },
   { code: 'HR', name: 'Croatia', flag: '🇭🇷' }, { code: 'CU', name: 'Cuba', flag: '🇨🇺' },
   { code: 'CY', name: 'Cyprus', flag: '🇨🇾' }, { code: 'CZ', name: 'Czech Republic', flag: '🇨🇿' },
   { code: 'DK', name: 'Denmark', flag: '🇩🇰' }, { code: 'DJ', name: 'Djibouti', flag: '🇩🇯' },
   { code: 'DM', name: 'Dominica', flag: '🇩🇲' }, { code: 'DO', name: 'Dominican Republic', flag: '🇩🇴' },
   { code: 'EC', name: 'Ecuador', flag: '🇪🇨' }, { code: 'EG', name: 'Egypt', flag: '🇪🇬' },
   { code: 'SV', name: 'El Salvador', flag: '🇸🇻' }, { code: 'GQ', name: 'Equatorial Guinea', flag: '🇬🇶' },
   { code: 'ER', name: 'Eritrea', flag: '🇪🇷' }, { code: 'EE', name: 'Estonia', flag: '🇪🇪' },
   { code: 'SZ', name: 'Eswatini', flag: '🇸🇿' }, { code: 'ET', name: 'Ethiopia', flag: '🇪🇹' },
   { code: 'FJ', name: 'Fiji', flag: '🇫🇯' }, { code: 'FI', name: 'Finland', flag: '🇫🇮' },
   { code: 'FR', name: 'France', flag: '🇫🇷' }, { code: 'GA', name: 'Gabon', flag: '🇬🇦' },
   { code: 'GM', name: 'Gambia', flag: '🇬🇲' }, { code: 'GE', name: 'Georgia', flag: '🇬🇪' },
   { code: 'DE', name: 'Germany', flag: '🇩🇪' }, { code: 'GH', name: 'Ghana', flag: '🇬🇭' },
   { code: 'GR', name: 'Greece', flag: '🇬🇷' }, { code: 'GD', name: 'Grenada', flag: '🇬🇩' },
   { code: 'GT', name: 'Guatemala', flag: '🇬🇹' }, { code: 'GN', name: 'Guinea', flag: '🇬🇳' },
   { code: 'GY', name: 'Guyana', flag: '🇬🇾' }, { code: 'HT', name: 'Haiti', flag: '🇭🇹' },
   { code: 'HN', name: 'Honduras', flag: '🇭🇳' }, { code: 'HU', name: 'Hungary', flag: '🇭🇺' },
   { code: 'IS', name: 'Iceland', flag: '🇮🇸' }, { code: 'IN', name: 'India', flag: '🇮🇳' },
   { code: 'ID', name: 'Indonesia', flag: '🇮🇩' }, { code: 'IR', name: 'Iran', flag: '🇮🇷' },
   { code: 'IQ', name: 'Iraq', flag: '🇮🇶' }, { code: 'IE', name: 'Ireland', flag: '🇮🇪' },
   { code: 'IL', name: 'Israel', flag: '🇮🇱' }, { code: 'IT', name: 'Italy', flag: '🇮🇹' },
   { code: 'JM', name: 'Jamaica', flag: '🇯🇲' }, { code: 'JP', name: 'Japan', flag: '🇯🇵' },
   { code: 'JO', name: 'Jordan', flag: '🇯🇴' }, { code: 'KZ', name: 'Kazakhstan', flag: '🇰🇿' },
   { code: 'KE', name: 'Kenya', flag: '🇰🇪' }, { code: 'KW', name: 'Kuwait', flag: '🇰🇼' },
   { code: 'KG', name: 'Kyrgyzstan', flag: '🇰🇬' }, { code: 'LA', name: 'Laos', flag: '🇱🇦' },
   { code: 'LV', name: 'Latvia', flag: '🇱🇻' }, { code: 'LB', name: 'Lebanon', flag: '🇱🇧' },
   { code: 'LS', name: 'Lesotho', flag: '🇱🇸' }, { code: 'LR', name: 'Liberia', flag: '🇱🇷' },
   { code: 'LY', name: 'Libya', flag: '🇱🇾' }, { code: 'LI', name: 'Liechtenstein', flag: '🇱🇮' },
   { code: 'LT', name: 'Lithuania', flag: '🇱🇹' }, { code: 'LU', name: 'Luxembourg', flag: '🇱🇺' },
   { code: 'MG', name: 'Madagascar', flag: '🇲🇬' }, { code: 'MW', name: 'Malawi', flag: '🇲🇼' },
   { code: 'MY', name: 'Malaysia', flag: '🇲🇾' }, { code: 'MV', name: 'Maldives', flag: '🇲🇻' },
   { code: 'ML', name: 'Mali', flag: '🇲🇱' }, { code: 'MT', name: 'Malta', flag: '🇲🇹' },
   { code: 'MR', name: 'Mauritania', flag: '🇲🇷' }, { code: 'MU', name: 'Mauritius', flag: '🇲🇺' },
   { code: 'MX', name: 'Mexico', flag: '🇲🇽' }, { code: 'MD', name: 'Moldova', flag: '🇲🇩' },
   { code: 'MC', name: 'Monaco', flag: '🇲🇨' }, { code: 'MN', name: 'Mongolia', flag: '🇲🇳' },
   { code: 'ME', name: 'Montenegro', flag: '🇲🇪' }, { code: 'MA', name: 'Morocco', flag: '🇲🇦' },
   { code: 'MZ', name: 'Mozambique', flag: '🇲🇿' }, { code: 'MM', name: 'Myanmar', flag: '🇲🇲' },
   { code: 'NA', name: 'Namibia', flag: '🇳🇦' }, { code: 'NP', name: 'Nepal', flag: '🇳🇵' },
   { code: 'NL', name: 'Netherlands', flag: '🇳🇱' }, { code: 'NZ', name: 'New Zealand', flag: '🇳🇿' },
   { code: 'NI', name: 'Nicaragua', flag: '🇳🇮' }, { code: 'NE', name: 'Niger', flag: '🇳🇪' },
   { code: 'NG', name: 'Nigeria', flag: '🇳🇬' }, { code: 'MK', name: 'North Macedonia', flag: '🇲🇰' },
   { code: 'NO', name: 'Norway', flag: '🇳🇴' }, { code: 'OM', name: 'Oman', flag: '🇴🇲' },
   { code: 'PK', name: 'Pakistan', flag: '🇵🇰' }, { code: 'PA', name: 'Panama', flag: '🇵🇦' },
   { code: 'PY', name: 'Paraguay', flag: '🇵🇾' }, { code: 'PE', name: 'Peru', flag: '🇵🇪' },
   { code: 'PH', name: 'Philippines', flag: '🇵🇭' }, { code: 'PL', name: 'Poland', flag: '🇵🇱' },
   { code: 'PT', name: 'Portugal', flag: '🇵🇹' }, { code: 'QA', name: 'Qatar', flag: '🇶🇦' },
   { code: 'RO', name: 'Romania', flag: '🇷🇴' }, { code: 'RU', name: 'Russia', flag: '🇷🇺' },
   { code: 'RW', name: 'Rwanda', flag: '🇷🇼' }, { code: 'SA', name: 'Saudi Arabia', flag: '🇸🇦' },
   { code: 'SN', name: 'Senegal', flag: '🇸🇳' }, { code: 'RS', name: 'Serbia', flag: '🇷🇸' },
   { code: 'SL', name: 'Sierra Leone', flag: '🇸🇱' }, { code: 'SG', name: 'Singapore', flag: '🇸🇬' },
   { code: 'SK', name: 'Slovakia', flag: '🇸🇰' }, { code: 'SI', name: 'Slovenia', flag: '🇸🇮' },
   { code: 'SO', name: 'Somalia', flag: '🇸🇴' }, { code: 'ZA', name: 'South Africa', flag: '🇿🇦' },
   { code: 'KR', name: 'South Korea', flag: '🇰🇷' }, { code: 'ES', name: 'Spain', flag: '🇪🇸' },
   { code: 'LK', name: 'Sri Lanka', flag: '🇱🇰' }, { code: 'SD', name: 'Sudan', flag: '🇸🇩' },
   { code: 'SE', name: 'Sweden', flag: '🇸🇪' }, { code: 'CH', name: 'Switzerland', flag: '🇨🇭' },
   { code: 'SY', name: 'Syria', flag: '🇸🇾' }, { code: 'TW', name: 'Taiwan', flag: '🇹🇼' },
   { code: 'TZ', name: 'Tanzania', flag: '🇹🇿' }, { code: 'TH', name: 'Thailand', flag: '🇹🇭' },
   { code: 'TG', name: 'Togo', flag: '🇹🇬' }, { code: 'TN', name: 'Tunisia', flag: '🇹🇳' },
   { code: 'TR', name: 'Turkey', flag: '🇹🇷' }, { code: 'UG', name: 'Uganda', flag: '🇺🇬' },
   { code: 'UA', name: 'Ukraine', flag: '🇺🇦' }, { code: 'AE', name: 'United Arab Emirates', flag: '🇦🇪' },
   { code: 'GB', name: 'United Kingdom', flag: '🇬🇧' }, { code: 'US', name: 'United States', flag: '🇺🇸' },
   { code: 'UY', name: 'Uruguay', flag: '🇺🇾' }, { code: 'UZ', name: 'Uzbekistan', flag: '🇺🇿' },
   { code: 'VE', name: 'Venezuela', flag: '🇻🇪' }, { code: 'VN', name: 'Vietnam', flag: '🇻🇳' },
   { code: 'YE', name: 'Yemen', flag: '🇾🇪' }, { code: 'ZM', name: 'Zambia', flag: '🇿🇲' },
   { code: 'ZW', name: 'Zimbabwe', flag: '🇿🇼' },
 ];
 
 const AccountSettingsPage: React.FC = () => {
     const { user, updateUserProfile, deleteCurrentUser, auth, updateTwoFactorStatus } = useAuth();
     const { isWebAuthnSupported, register: registerPasskey, getCredentials, removeCredential } = useWebAuthn();
     
     const [firstName, setFirstName] = useState('');
     const [lastName, setLastName] = useState('');
     const [country, setCountry] = useState('');
     const [isLoading, setIsLoading] = useState(false);
     const [message, setMessage] = useState('');
 
     const [isChangePasswordModalOpen, setChangePasswordModalOpen] = useState(false);
     const [isTwoFactorModalOpen, setIsTwoFactorModalOpen] = useState(false);
     const [isDisabling2FA, setIsDisabling2FA] = useState(false);
     
     const [credentials, setCredentials] = useState<StoredCredential[]>([]);
     const [isRegisteringPasskey, setIsRegisteringPasskey] = useState(false);
     const [securityError, setSecurityError] = useState('');
     const [securitySuccess, setSecuritySuccess] = useState('');
     
     const hasPasswordProvider = auth.currentUser?.providerData.some(p => p.providerId === 'password');
     const isPremium = user?.isToolsPremium || user?.isFlipbookPremium;
 
     useEffect(() => {
         if (user) {
             setFirstName(user.firstName || '');
             setLastName(user.lastName || '');
             setCountry(user.country || '');
             getCredentials().then(setCredentials);
         }
     }, [user, getCredentials]);
 
     const handleSaveProfile = async (e: React.FormEvent) => {
         e.preventDefault();
         setIsLoading(true);
         setMessage('');
         try {
             await updateUserProfile({ firstName, lastName, country });
             setMessage('Profile updated successfully!');
             setTimeout(() => setMessage(''), 3000);
         } catch (error) {
             setMessage('Failed to update profile.');
         } finally {
             setIsLoading(false);
         }
     };
 
     const handleDeleteAccount = async () => {
         if (window.confirm('Are you sure you want to permanently delete your account? This action cannot be undone.')) {
             try {
                 await deleteCurrentUser();
             } catch (error) {
                 alert('Failed to delete account. Please try again or contact support.');
             }
         }
     };
 
     const handleDisable2FA = async () => {
        if (window.confirm("Are you sure you want to disable Two-Factor Authentication?")) {
            setIsDisabling2FA(true);
            setSecurityError('');
            try {
                await updateTwoFactorStatus(false);
            } catch (err: any) {
                setSecurityError(err.message || 'Failed to disable 2FA.');
            } finally {
                setIsDisabling2FA(false);
            }
        }
    };
    
    const handleRegisterPasskey = async () => {
        if (!user || !user.email) return;
        setIsRegisteringPasskey(true);
        setSecurityError('');
        setSecuritySuccess('');
        try {
            await registerPasskey(user.email);
            setSecuritySuccess('New passkey added successfully!');
            getCredentials().then(setCredentials);
        } catch(err: any) {
            setSecurityError(err.message || 'Failed to register passkey.');
        } finally {
            setIsRegisteringPasskey(false);
        }
    };
    
    const handleRemoveCredential = async (id: string) => {
        if (window.confirm("Are you sure you want to remove this passkey?")) {
            setSecurityError('');
            try {
                await removeCredential(id);
                getCredentials().then(setCredentials);
            } catch (err: any) {
                setSecurityError(err.message || 'Could not remove passkey.');
            }
        }
    };
 
     return (
         <>
             <div className="w-full space-y-8 animate-fade-in-up">
                 {/* Header Card */}
                 <div className={`account-header-card ${isPremium ? 'premium' : ''}`}>
                     {user?.profileImage ? (
                         <img src={user.profileImage} alt="Profile" className="profile-pic" />
                     ) : (
                         <div className="w-20 h-20 rounded-full bg-gray-200 dark:bg-gray-700 flex items-center justify-center border-4 border-white dark:border-gray-800">
                             <UserCircleIcon className="w-full h-full text-gray-400 dark:text-gray-500" />
                         </div>
                     )}
                     <div className="user-info">
                         <h3>{user?.username}</h3>
                         <p>{user?.email}</p>
                     </div>
                     <div className="status-badge">
                         {isPremium ? (
                             <span className="premium-badge"><StarIcon className="h-5 w-5"/> Premium Member</span>
                         ) : (
                             <span>Free Plan</span>
                         )}
                     </div>
                 </div>
 
                 {/* Personal Info */}
                 <div className="account-section">
                     <h2><UserIcon className="h-6 w-6" /> Personal Information</h2>
                     <form onSubmit={handleSaveProfile} className="space-y-4">
                         <div className="form-grid">
                             <div>
                                 <label htmlFor="firstName" className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">First name</label>
                                 <input type="text" id="firstName" value={firstName} onChange={e => setFirstName(e.target.value)} />
                             </div>
                             <div>
                                 <label htmlFor="lastName" className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">Last name</label>
                                 <input type="text" id="lastName" value={lastName} onChange={e => setLastName(e.target.value)} />
                             </div>
                         </div>
                         <div>
                             <label htmlFor="country" className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">Country</label>
                             <select id="country" value={country} onChange={e => setCountry(e.target.value)}>
                                 <option value="">Select country</option>
                                 {countries.map(c => <option key={c.code} value={c.name}>{c.flag} {c.name}</option>)}
                             </select>
                         </div>
                         {message && <p className={`mt-2 text-sm ${message.includes('success') ? 'text-green-600' : 'text-red-500'}`}>{message}</p>}
                         <div className="text-right">
                             <button type="submit" disabled={isLoading} className="bg-brand-red text-white font-bold py-2 px-6 rounded-md disabled:bg-red-300">{isLoading ? 'Saving...' : 'Save'}</button>
                         </div>
                     </form>
                 </div>
 
                 {/* Security */}
                 <div className="account-section">
                    <h2><LockIcon className="h-6 w-6" /> Security</h2>
                    {securityError && <p className="mb-4 text-sm text-red-500">{securityError}</p>}
                    {securitySuccess && <p className="mb-4 text-sm text-green-500">{securitySuccess}</p>}
                    <div className="space-y-6">
                        {hasPasswordProvider && <div className="flex justify-between items-center"><p>Change your account password.</p><button onClick={() => setChangePasswordModalOpen(true)} className="text-brand-red font-semibold hover:underline">Change Password</button></div>}
                        <div className="flex justify-between items-center"><p>Enable two-factor authentication for added security.</p><button onClick={user?.twoFactorEnabled ? handleDisable2FA : () => setIsTwoFactorModalOpen(true)} className="text-brand-red font-semibold hover:underline">{user?.twoFactorEnabled ? (isDisabling2FA ? 'Disabling...' : 'Disable 2FA') : 'Enable 2FA'}</button></div>
                        <div>
                            <h3 className="font-bold mb-2">Passkeys</h3>
                            <ul className="space-y-2 mb-3">
                                {credentials.map(c => <li key={c.id} className="flex justify-between items-center p-2 bg-gray-100 dark:bg-gray-800/50 rounded-md"><div className="flex items-center gap-2"><PasskeyIcon className="h-5 w-5" /><span>{c.name}</span></div><button onClick={() => handleRemoveCredential(c.id)}><TrashIcon className="h-4 w-4 text-gray-400 hover:text-red-500"/></button></li>)}
                            </ul>
                            <button onClick={handleRegisterPasskey} disabled={isRegisteringPasskey || !isWebAuthnSupported} className="flex items-center gap-2 text-sm font-semibold text-brand-red hover:underline disabled:opacity-50"><PlusIcon className="h-4 w-4"/> {isRegisteringPasskey ? 'Follow device prompts...' : 'Add a new passkey'}</button>
                        </div>
                    </div>
                 </div>
 
                 {/* Subscription & API */}
                 <div className="account-section">
                    <h2><StarIcon className="h-6 w-6" /> Subscription & API</h2>
                    <div className="space-y-4">
                        <div className="flex justify-between items-center"><p>Tools Plan: <span className="font-bold">{user?.isToolsPremium ? 'Premium' : 'Free'}</span></p><Link to="/pricing" className="text-brand-red font-semibold hover:underline">Manage</Link></div>
                        <div className="flex justify-between items-center"><p>Flipbook Plan: <span className="font-bold">{user?.isFlipbookPremium ? 'Premium' : 'Free'}</span></p><Link to="/pricing" className="text-brand-red font-semibold hover:underline">Manage</Link></div>
                        <div className="flex justify-between items-center"><p>API Plan: <span className="font-bold">{user?.apiPlan || 'free'}</span></p><Link to="/api-pricing" className="text-brand-red font-semibold hover:underline">Manage API</Link></div>
                    </div>
                 </div>
 
                 {/* Danger Zone */}
                 <div className="account-section danger-zone">
                     <h2><WarningIcon className="h-6 w-6" /> Danger Zone</h2>
                     <div className="flex justify-between items-center">
                         <div>
                             <p className="font-semibold">Delete your account</p>
                             <p className="text-sm text-gray-500">Once you delete your account, there is no going back. Please be certain.</p>
                         </div>
                         <button onClick={handleDeleteAccount} className="bg-red-600 text-white font-bold py-2 px-4 rounded-md hover:bg-red-700">Delete My Account</button>
                     </div>
                 </div>
             </div>
             <ChangePasswordModal isOpen={isChangePasswordModalOpen} onClose={() => setChangePasswordModalOpen(false)} />
             <TwoFactorAuthModal isOpen={isTwoFactorModalOpen} onClose={() => setIsTwoFactorModalOpen(false)} />
         </>
     );
 };
 export default AccountSettingsPage;
