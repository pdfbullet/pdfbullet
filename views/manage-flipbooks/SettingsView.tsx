import React, { useState, useEffect, useCallback } from 'react';
import { useAuth, User } from '../../contexts/AuthContext.tsx';
import { useDropzone } from 'react-dropzone';
import { UploadIcon, CheckIcon, EmailIcon, StarIcon, InfoIcon, CheckCircleIcon } from '../../components/icons.tsx';

const countries = [
    'United States', 'Canada', 'Mexico', 'United Kingdom', 'Germany', 'France', 'Australia', 'Nepal', 'India'
];

type FormData = Pick<User, 'username' | 'about' | 'company' | 'website' | 'city' | 'stateProvince' | 'country' | 'address' | 'postalCode' | 'phone'>;

// Reusable toggle switch component
const ToggleSwitch: React.FC<{ checked: boolean; onChange: (e: React.ChangeEvent<HTMLInputElement>) => void; disabled?: boolean }> = ({ checked, onChange, disabled }) => (
    <label className="relative inline-flex items-center cursor-pointer">
        <input type="checkbox" checked={checked} onChange={onChange} disabled={disabled} className="sr-only peer" />
        <div className="w-11 h-6 bg-gray-200 peer-focus:outline-none rounded-full peer dark:bg-gray-700 peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all dark:border-gray-600 peer-checked:bg-green-600 peer-disabled:opacity-50"></div>
    </label>
);

const SettingsRow: React.FC<{
    Icon: React.FC<{ className?: string }>;
    title: string;
    description: React.ReactNode;
    checked: boolean;
    onChange: (e: React.ChangeEvent<HTMLInputElement>) => void;
    isPremium?: boolean;
    children?: React.ReactNode;
}> = ({ Icon, title, description, checked, onChange, isPremium, children }) => {
    return (
        <div className={`p-6 border-b border-gray-400/50 dark:border-gray-600/50 last:border-b-0 ${children ? 'pb-4' : ''}`}>
            <div className="flex items-start gap-4">
                 <div className="flex-shrink-0 mt-1">
                    {checked ? <CheckCircleIcon className="h-6 w-6 text-green-500" /> : <Icon className="h-6 w-6 text-gray-200 dark:text-gray-300" /> }
                </div>
                <div className="flex-grow">
                    <div className="flex items-center gap-3">
                        <h3 className="font-bold text-white dark:text-gray-100">{title}</h3>
                        {isPremium && <span className="text-xs font-bold text-yellow-800 bg-yellow-300 px-2 py-0.5 rounded-full">Premium</span>}
                    </div>
                    <p className="text-sm text-gray-200 dark:text-gray-300 mt-1">{description}</p>
                </div>
                <div className="flex-shrink-0">
                    <ToggleSwitch checked={checked} onChange={onChange} />
                </div>
            </div>
            {checked && children && (
                 <div className="pl-16 pt-4">
                    {children}
                </div>
            )}
        </div>
    );
};


const SettingsView: React.FC = () => {
    const [activeTab, setActiveTab] = useState('profile');
    const { user, updateUserProfile, auth } = useAuth();
    
    // States for each section
    const [formData, setFormData] = useState<FormData>({ username: '', about: '', company: '', website: '', city: '', stateProvince: '', country: '', address: '', postalCode: '', phone: '' });
    const [customDomain, setCustomDomain] = useState('');
    const [bookLogo, setBookLogo] = useState<string | null>(null);
    const [notificationSettings, setNotificationSettings] = useState({ comments: true, updates: true, summary: false });
    const [resetEmail, setResetEmail] = useState('');
    
    // UI state for messages and loading
    const [profileMessage, setProfileMessage] = useState('');
    const [domainMessage, setDomainMessage] = useState('');
    const [logoMessage, setLogoMessage] = useState('');
    const [resetMessage, setResetMessage] = useState({ type: '', text: ''});
    const [notificationsMessage, setNotificationsMessage] = useState('');
    const [isLoading, setIsLoading] = useState<Record<string, boolean>>({});

    // Populate state from user object
    useEffect(() => {
        if (user) {
            setFormData({
                username: user.username || '', about: user.about || '', company: user.company || '', website: user.website || '', city: user.city || '', stateProvince: user.stateProvince || '', country: user.country || '', address: user.address || '', postalCode: user.postalCode || '', phone: user.phone || '',
            });
            setCustomDomain(user.customDomain || '');
            setBookLogo(user.bookLogo || null);
            setNotificationSettings({
                comments: user.notificationSettings?.comments ?? true,
                updates: user.notificationSettings?.updates ?? true,
                summary: user.notificationSettings?.summary ?? false,
            });
            setResetEmail(user.email || '');
        }
    }, [user]);

    const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>) => {
        const { name, value } = e.target;
        setFormData(prev => ({ ...prev, [name]: value }));
    };

    // Generic save handler
    const handleSave = async (section: string, data: Partial<User>) => {
        setIsLoading(prev => ({ ...prev, [section]: true }));
        const setMessage = (msg: string) => {
            if (section === 'profile') setProfileMessage(msg);
            else if (section === 'domain') setDomainMessage(msg);
            else if (section === 'logo') setLogoMessage(msg);
            else if (section === 'notifications') setNotificationsMessage(msg);
        };
        
        try {
            await updateUserProfile(data);
            setMessage('Saved successfully!');
            setTimeout(() => setMessage(''), 3000);
        } catch (error) {
            setMessage('Failed to save settings.');
        } finally {
            setIsLoading(prev => ({ ...prev, [section]: false }));
        }
    };

    // Book Logo upload logic
    const onDrop = useCallback((acceptedFiles: File[]) => {
        if (acceptedFiles[0]) {
            const reader = new FileReader();
            reader.onload = () => setBookLogo(reader.result as string);
            reader.readAsDataURL(acceptedFiles[0]);
        }
    }, []);
    const { getRootProps, getInputProps } = useDropzone({ onDrop, accept: {'image/*': []} });

    // Password Reset logic
    const handlePasswordReset = async (e: React.FormEvent) => {
        e.preventDefault();
        setResetMessage({ type: '', text: '' });
        setIsLoading(prev => ({ ...prev, reset: true }));
        try {
            await auth.sendPasswordResetEmail(resetEmail);
            setResetMessage({ type: 'success', text: `Password reset link sent to ${resetEmail}.` });
        } catch (err: any) {
            setResetMessage({ type: 'error', text: err.message || 'Failed to send reset email.' });
        } finally {
            setIsLoading(prev => ({ ...prev, reset: false }));
        }
    };
    
    const renderContent = () => {
        switch (activeTab) {
            case 'profile':
                return (
                    <form onSubmit={(e) => { e.preventDefault(); handleSave('profile', formData); }} className="space-y-8">
                        {/* Public Information */}
                        <div>
                            <h3 className="text-lg font-bold text-white dark:text-gray-100">Public Information</h3>
                            <div className="space-y-4 mt-4">
                                <div><label className="block text-sm font-semibold text-gray-200 dark:text-gray-200">Display name</label><input type="text" name="username" value={formData.username} onChange={handleChange} className="w-full p-2 border rounded-md mt-1 bg-white/50 dark:bg-black/50 border-gray-400 dark:border-gray-500 text-white dark:text-gray-100" /></div>
                                <div><label className="block text-sm font-semibold text-gray-200 dark:text-gray-200">About</label><textarea name="about" value={formData.about} onChange={handleChange} rows={4} className="w-full p-2 border rounded-md bg-white/50 dark:bg-black/50 border-gray-400 dark:border-gray-500 text-white dark:text-gray-100"></textarea></div>
                                <div><label className="block text-sm font-semibold text-gray-200 dark:text-gray-200">Company</label><input type="text" name="company" value={formData.company} onChange={handleChange} className="w-full p-2 border rounded-md bg-white/50 dark:bg-black/50 border-gray-400 dark:border-gray-500 text-white dark:text-gray-100" /></div>
                                <div><label className="block text-sm font-semibold text-gray-200 dark:text-gray-200">Website / Blog</label><input type="text" name="website" value={formData.website} onChange={handleChange} className="w-full p-2 border rounded-md bg-white/50 dark:bg-black/50 border-gray-400 dark:border-gray-500 text-white dark:text-gray-100" /></div>
                            </div>
                        </div>
                        {/* Personal Information */}
                        <div>
                             <h3 className="text-lg font-bold text-white dark:text-gray-100">Personal Information</h3>
                            <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mt-4">
                                <div><label className="block text-sm font-semibold text-gray-200 dark:text-gray-200">City</label><input type="text" name="city" value={formData.city} onChange={handleChange} className="w-full p-2 border rounded-md bg-white/50 dark:bg-black/50 border-gray-400 dark:border-gray-500 text-white dark:text-gray-100" /></div>
                                <div><label className="block text-sm font-semibold text-gray-200 dark:text-gray-200">State</label><input type="text" name="stateProvince" value={formData.stateProvince} onChange={handleChange} className="w-full p-2 border rounded-md bg-white/50 dark:bg-black/50 border-gray-400 dark:border-gray-500 text-white dark:text-gray-100" /></div>
                                <div className="md:col-span-2"><label className="block text-sm font-semibold text-gray-200 dark:text-gray-200">Country</label><select name="country" value={formData.country} onChange={handleChange} className="w-full p-2 border rounded-md bg-white/50 dark:bg-black/50 border-gray-400 dark:border-gray-500 text-white dark:text-gray-100"><option>Please select your country</option>{countries.map(c => <option key={c}>{c}</option>)}</select></div>
                                <div className="md:col-span-2"><label className="block text-sm font-semibold text-gray-200 dark:text-gray-200">Address</label><textarea name="address" value={formData.address} onChange={handleChange} rows={3} className="w-full p-2 border rounded-md bg-white/50 dark:bg-black/50 border-gray-400 dark:border-gray-500 text-white dark:text-gray-100"></textarea></div>
                                <div><label className="block text-sm font-semibold text-gray-200 dark:text-gray-200">Postal Code</label><input type="text" name="postalCode" value={formData.postalCode} onChange={handleChange} className="w-full p-2 border rounded-md bg-white/50 dark:bg-black/50 border-gray-400 dark:border-gray-500 text-white dark:text-gray-100" /></div>
                                <div><label className="block text-sm font-semibold text-gray-200 dark:text-gray-200">Phone #</label><input type="text" name="phone" value={formData.phone} onChange={handleChange} className="w-full p-2 border rounded-md bg-white/50 dark:bg-black/50 border-gray-400 dark:border-gray-500 text-white dark:text-gray-100" /></div>
                            </div>
                        </div>
                        <div className="flex justify-end items-center">{profileMessage && <p className="text-sm mr-4 text-green-400 dark:text-green-400">{profileMessage}</p>}<button type="submit" disabled={isLoading.profile} className="bg-green-500 text-white font-bold py-2 px-6 rounded-md hover:bg-green-600 disabled:bg-green-300">{isLoading.profile ? 'Saving...' : 'Save'}</button></div>
                    </form>
                );
            case 'domain':
                return (
                    <form onSubmit={(e) => { e.preventDefault(); handleSave('domain', { customDomain }); }}>
                        <h3 className="text-lg font-bold text-white dark:text-gray-100 flex items-center gap-2">Custom Domain <StarIcon className="h-5 w-5 text-yellow-400" /></h3>
                        <p className="text-sm text-gray-200 dark:text-gray-300 mb-4">Set up a custom domain to brand your flipbook URLs.</p>
                        {!user?.isFlipbookPremium && (
                            <div className="p-4 bg-yellow-900/20 border-l-4 border-yellow-400 rounded-md text-sm mb-4">This is a Premium feature. <a href="/pricing" className="font-bold underline">Upgrade your plan</a> to enable it.</div>
                        )}
                        <div><label className="block text-sm font-semibold text-gray-200 dark:text-gray-200">Your Domain</label><input type="text" value={customDomain} onChange={e => setCustomDomain(e.target.value)} placeholder="my-flipbooks.com" className="w-full p-2 border rounded-md bg-white/50 dark:bg-black/50 border-gray-400 dark:border-gray-500 text-white dark:text-gray-100" /></div>
                        
                        <div className="mt-8 p-6 bg-blue-900/10 dark:bg-blue-900/20 border border-blue-200 dark:border-blue-800 rounded-lg space-y-6">
                            <h3 className="text-xl font-bold text-white dark:text-gray-100">About the Custom Domain Feature</h3>
                            
                            <div>
                                <h4 className="font-semibold text-lg text-gray-100 dark:text-gray-200">What is it?</h4>
                                <p className="mt-1 text-gray-200 dark:text-gray-300">
                                    The Custom Domain feature allows you to replace the standard `pdfbullet.com` part of your flipbook URLs with your own domain name (e.g., `catalog.yourcompany.com`). This makes your flipbooks appear as if they are hosted directly on your own website.
                                </p>
                            </div>
                            
                            <div>
                                <h4 className="font-semibold text-lg text-gray-100 dark:text-gray-200">What are the benefits?</h4>
                                <ul className="mt-2 space-y-2 list-disc list-inside text-gray-200 dark:text-gray-300">
                                    <li><strong>Branding & Professionalism:</strong> Reinforce your brand identity and present your publications in a more polished, professional manner.</li>
                                    <li><strong>Increased Trust:</strong> Users are more likely to trust and engage with links that use a familiar, branded domain name.</li>
                                    <li><strong>Memorability & Marketing:</strong> Create easy-to-remember links for your marketing campaigns (e.g., `my-flipbooks.com/summer-sale`).</li>
                                </ul>
                            </div>

                            <div>
                                <h4 className="font-semibold text-lg text-gray-100 dark:text-gray-200">How to set it up:</h4>
                                <ol className="mt-2 list-decimal list-inside space-y-2 text-gray-200 dark:text-gray-300">
                                    <li><strong>Own a Domain:</strong> You must first own a domain name. If you don't have one, you can purchase one from any domain registrar.</li>
                                    <li>
                                        <strong>Create a CNAME Record:</strong> In your domain provider's DNS settings, create a new `CNAME` record. Point your chosen domain (e.g., `flipbooks.yourcompany.com`) to the following value:
                                        <code className="block mt-1 p-2 bg-black/10 dark:bg-white/10 rounded text-sm font-mono">domains.pdfbullet.com</code>
                                    </li>
                                    <li><strong>Save & Wait:</strong> Save the domain in the field above. DNS changes can take up to 24 hours to propagate across the internet.</li>
                                </ol>
                            </div>
                        </div>

                        <div className="flex justify-end items-center mt-6">{domainMessage && <p className="text-sm mr-4 text-green-400 dark:text-green-400">{domainMessage}</p>}<button type="submit" disabled={isLoading.domain} className="bg-green-500 text-white font-bold py-2 px-6 rounded-md">{isLoading.domain ? 'Saving...' : 'Save'}</button></div>
                    </form>
                );
            case 'logo':
                return (
                     <div>
                        <h3 className="text-lg font-bold text-white dark:text-gray-100 flex items-center gap-2">Book Logo <StarIcon className="h-5 w-5 text-yellow-400" /></h3>
                        <p className="text-sm text-gray-200 dark:text-gray-300 mb-4">Upload a logo to display on your flipbooks.</p>
                        <div className="flex flex-col md:flex-row items-center gap-6">
                            <div {...getRootProps()} className="w-40 h-40 border-2 border-dashed rounded-lg flex flex-col items-center justify-center cursor-pointer hover:border-brand-red border-white/50 dark:border-gray-500">
                                <input {...getInputProps()} />
                                <UploadIcon className="h-8 w-8 text-gray-400" />
                                <p className="text-xs text-center mt-2 text-gray-300 dark:text-gray-400">Click or drag file to upload</p>
                            </div>
                            {bookLogo && (
                                <div className="text-center">
                                    <p className="text-sm font-semibold mb-2 text-white dark:text-gray-200">Current Logo:</p>
                                    <div className="p-2 border rounded-md inline-block bg-white/50 dark:bg-black/50 border-gray-400 dark:border-gray-500">
                                        <img src={bookLogo} alt="Book logo preview" className="h-20 w-auto" />
                                    </div>
                                    <button onClick={() => setBookLogo(null)} className="mt-2 text-xs text-red-400 hover:underline">Remove Logo</button>
                                </div>
                            )}
                        </div>
                         <div className="flex justify-end items-center mt-6">{logoMessage && <p className="text-sm mr-4 text-green-400 dark:text-green-400">{logoMessage}</p>}<button onClick={() => handleSave('logo', { bookLogo })} disabled={isLoading.logo} className="bg-green-500 text-white font-bold py-2 px-6 rounded-md">{isLoading.logo ? 'Saving...' : 'Save'}</button></div>
                    </div>
                );
            case 'password':
                return (
                     <form onSubmit={handlePasswordReset}>
                        <h3 className="text-lg font-bold text-white dark:text-gray-100">Reset Password</h3>
                        <p className="text-sm text-gray-200 dark:text-gray-300 mb-4">We will send a password reset link to your registered email address.</p>
                         {resetMessage.text && <p className={`mb-4 text-sm p-3 rounded-md ${resetMessage.type === 'success' ? 'bg-green-900/30 text-green-300' : 'bg-red-900/30 text-red-300'}`}>{resetMessage.text}</p>}
                         <div className="flex items-center gap-3">
                            <div className="relative flex-grow">
                                <EmailIcon className="h-5 w-5 text-gray-400 absolute left-3 top-1/2 -translate-y-1/2" />
                                <input type="email" value={resetEmail} readOnly className="w-full p-2 pl-10 border rounded-md bg-black/10 dark:bg-white/10 text-gray-200" />
                            </div>
                            <button type="submit" disabled={isLoading.reset || !!resetMessage.text} className="bg-brand-red text-white font-bold py-2 px-6 rounded-md hover:bg-brand-red-dark disabled:bg-red-300">{isLoading.reset ? 'Sending...' : 'Send Reset Link'}</button>
                        </div>
                    </form>
                );
            case 'notifications':
                return (
                    <form onSubmit={(e) => { e.preventDefault(); handleSave('notifications', { notificationSettings }); }}>
                        <h3 className="text-lg font-bold text-white dark:text-gray-100">Notifications</h3>
                        <p className="text-sm text-gray-200 dark:text-gray-300 mb-4">Manage your email notification preferences.</p>
                        <div className="space-y-4">
                            <div className="flex justify-between items-center p-3 border border-gray-400/50 dark:border-gray-600/50 rounded-md">
                                <div><h4 className="font-semibold text-white dark:text-gray-100">Comments & Mentions</h4><p className="text-xs text-gray-300 dark:text-gray-400">Notify me when someone comments on my flipbooks.</p></div>
                                <ToggleSwitch checked={notificationSettings.comments} onChange={e => setNotificationSettings(p => ({...p, comments: e.target.checked}))} />
                            </div>
                             <div className="flex justify-between items-center p-3 border border-gray-400/50 dark:border-gray-600/50 rounded-md">
                                <div><h4 className="font-semibold text-white dark:text-gray-100">Product Updates</h4><p className="text-xs text-gray-300 dark:text-gray-400">Receive news about new features and updates.</p></div>
                                <ToggleSwitch checked={notificationSettings.updates} onChange={e => setNotificationSettings(p => ({...p, updates: e.target.checked}))} />
                            </div>
                             <div className="flex justify-between items-center p-3 border border-gray-400/50 dark:border-gray-600/50 rounded-md">
                                <div><h4 className="font-semibold text-white dark:text-gray-100">Weekly Summary</h4><p className="text-xs text-gray-300 dark:text-gray-400">Get a weekly summary of your flipbook activity.</p></div>
                                <ToggleSwitch checked={notificationSettings.summary} onChange={e => setNotificationSettings(p => ({...p, summary: e.target.checked}))} />
                            </div>
                        </div>
                        <div className="flex justify-end items-center mt-6">{notificationsMessage && <p className="text-sm mr-4 text-green-400 dark:text-green-400">{notificationsMessage}</p>}<button type="submit" disabled={isLoading.notifications} className="bg-green-500 text-white font-bold py-2 px-6 rounded-md">{isLoading.notifications ? 'Saving...' : 'Save'}</button></div>
                    </form>
                );
            default:
                return null;
        }
    };

    return (
        <div className="bg-white/10 dark:bg-black/50 backdrop-blur-lg border border-white/20 dark:border-gray-700/50 p-6 rounded-lg shadow-xl">
            <div className="flex flex-wrap border-b mb-6 text-sm font-semibold border-gray-400/50 dark:border-gray-600/50">
                <button onClick={() => setActiveTab('profile')} className={`px-4 py-2 ${activeTab === 'profile' ? 'border-b-2 border-orange-500 text-orange-500' : 'text-white dark:text-gray-200 hover:text-orange-500'}`}>Profile</button>
                <button onClick={() => setActiveTab('domain')} className={`px-4 py-2 ${activeTab === 'domain' ? 'border-b-2 border-orange-500 text-orange-500' : 'text-white dark:text-gray-200 hover:text-orange-500'}`}>Custom Domain</button>
                <button onClick={() => setActiveTab('logo')} className={`px-4 py-2 ${activeTab === 'logo' ? 'border-b-2 border-orange-500 text-orange-500' : 'text-white dark:text-gray-200 hover:text-orange-500'}`}>Book Logo</button>
                <button onClick={() => setActiveTab('password')} className={`px-4 py-2 ${activeTab === 'password' ? 'border-b-2 border-orange-500 text-orange-500' : 'text-white dark:text-gray-200 hover:text-orange-500'}`}>Reset Password</button>
                <button onClick={() => setActiveTab('notifications')} className={`px-4 py-2 ${activeTab === 'notifications' ? 'border-b-2 border-orange-500 text-orange-500' : 'text-white dark:text-gray-200 hover:text-orange-500'}`}>Notifications</button>
            </div>
            {renderContent()}
        </div>
    );
};

export default SettingsView;