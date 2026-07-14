import React, { useState, useEffect, useRef } from 'react';
import * as QRCode from 'qrcode';
import { EditIcon, CodeIcon, QrCodeIcon, CloseIcon, PhoneIcon, UserIcon, GoogleIcon, FacebookIcon, XIcon } from '../../components/icons.tsx';
import { useAuth } from '../../contexts/AuthContext.tsx';
import { getFlipbooksForUser, Flipbook } from '../../hooks/useFlipbooks.ts';
import { Link } from 'react-router-dom';
import { storage } from '../../firebase/config.ts';

const HomepageView: React.FC = () => {
    const { user, updateUserProfile } = useAuth();
    const [flipbooks, setFlipbooks] = useState<Flipbook[]>([]);
    const [qrCodeDataUrl, setQrCodeDataUrl] = useState('');
    const [activeTab, setActiveTab] = useState<'home' | 'about'>('home');
    
    const [isEditing, setIsEditing] = useState(false);
    const [aboutData, setAboutData] = useState({ about: '', company: '', website: '' });
    const [bannerPreview, setBannerPreview] = useState<string | null>(null);
    const [bannerFile, setBannerFile] = useState<File | null>(null);
    
    const [isSaving, setIsSaving] = useState(false);
    const [message, setMessage] = useState('');

    const [isEmbedModalOpen, setIsEmbedModalOpen] = useState(false);
    const bannerInputRef = useRef<HTMLInputElement>(null);

    useEffect(() => {
        if (user) {
            getFlipbooksForUser(user.uid).then(setFlipbooks);
            const userProfileUrl = `${window.location.origin}/flipbooks/user/${user.uid}`;
            QRCode.toDataURL(userProfileUrl, { width: 96, margin: 1 }).then(setQrCodeDataUrl);
            setAboutData({
                about: user.about || 'Tell us something about yourself...',
                company: user.company || '',
                website: user.website || '',
            });
        }
    }, [user]);

    const handleAboutChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
        const { name, value } = e.target;
        setAboutData(prev => ({ ...prev, [name]: value }));
    };
    
    const handleBannerFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        const file = e.target.files?.[0];
        if (file) {
            setBannerFile(file);
            const reader = new FileReader();
            reader.onload = () => setBannerPreview(reader.result as string);
            reader.readAsDataURL(file);
        }
    };

    const handleSaveHomepage = async () => {
        if (!user) return;
        setIsSaving(true);
        setMessage('');
        try {
            let updatedBannerUrl = user.bannerUrl;
            if (bannerFile) {
                // Add a timestamp to the file path to prevent caching issues
                const storageRef = storage.ref(`users/${user.uid}/bannerImage-${Date.now()}`);
                const uploadTask = await storageRef.put(bannerFile);
                updatedBannerUrl = await uploadTask.ref.getDownloadURL();
            }
            
            const updatedProfileData = { 
                about: aboutData.about, 
                company: aboutData.company, 
                website: aboutData.website, 
                bannerUrl: updatedBannerUrl 
            };
            
            await updateUserProfile(updatedProfileData);
            
            setMessage('Your information has been saved.');
            setIsEditing(false);
            setBannerFile(null);
            setBannerPreview(null);
            setTimeout(() => setMessage(''), 3000);
        } catch (error) {
            console.error("Failed to save homepage settings:", error);
            setMessage('Failed to save. Please try again.');
        } finally {
            setIsSaving(false);
        }
    };
    
    const handleCancelEdit = () => {
        setIsEditing(false);
        setBannerPreview(null);
        setBannerFile(null);
        if (user) {
            setAboutData({
                about: user.about || 'Tell us something about yourself...',
                company: user.company || '',
                website: user.website || '',
            });
        }
    };

    const embedCode = user ? `<iframe src="${window.location.origin}/flipbooks/public?user=${user.username}" width="100%" height="600" frameborder="0"></iframe>` : '';
    const currentBannerUrl = bannerPreview || user?.bannerUrl || 'https://images.unsplash.com/photo-1506794778202-cad84cf45f1d?q=80&w=1887&auto=format&fit=crop';

    return (
        <div className="space-y-4">
            {/* Top Info Bar */}
            <div className="bg-gray-900/70 p-3 rounded-lg">
                <div className="flex flex-wrap justify-between items-center gap-4">
                    <div className="flex gap-4 text-gray-200">
                        <span><strong>0</strong> follower</span>
                        <span><strong>{flipbooks.length}</strong> book(s)</span>
                    </div>
                    <div className="flex flex-wrap gap-2 text-sm">
                         {isEditing ? (
                            <>
                                <button onClick={handleSaveHomepage} disabled={isSaving} className="flex items-center gap-2 px-3 py-2 bg-green-600 hover:bg-green-700 rounded-md text-white">{isSaving ? 'Saving...' : 'Save Changes'}</button>
                                <button onClick={handleCancelEdit} className="flex items-center gap-2 px-3 py-2 bg-gray-600 hover:bg-gray-500 rounded-md text-white">Cancel</button>
                            </>
                        ) : (
                             <button onClick={() => setIsEditing(true)} className="flex items-center gap-2 px-3 py-2 bg-gray-700 hover:bg-gray-600 rounded-md text-white">
                                <EditIcon className="h-4 w-4" /> Edit Homepage
                            </button>
                        )}
                        <button onClick={() => setIsEmbedModalOpen(true)} className="flex items-center gap-2 px-3 py-2 bg-gray-700 hover:bg-gray-600 rounded-md text-white"><CodeIcon className="h-4 w-4" /> Bookcase Embed</button>
                        <button onClick={() => alert('Mobile view coming soon!')} className="flex items-center gap-2 px-3 py-2 bg-gray-700 hover:bg-gray-600 rounded-md text-white"><PhoneIcon className="h-4 w-4" /> View as mobile</button>
                        <a href={`/flipbooks/public`} target="_blank" rel="noopener noreferrer" className="flex items-center gap-2 px-3 py-2 bg-gray-700 hover:bg-gray-600 rounded-md text-white"><UserIcon className="h-4 w-4" /> View as public</a>
                    </div>
                </div>
            </div>

            {/* Main container for banner + profile info */}
            <div className="bg-black/50 rounded-lg overflow-hidden">
                {/* Banner Section */}
                <div className="relative h-48 md:h-64 bg-cover bg-center" style={{ backgroundImage: `url('${currentBannerUrl}')` }}>
                    <div className="absolute inset-0 bg-black/40"></div>
                    {isEditing && (
                        <div className="absolute inset-0 bg-black/50 flex items-center justify-center">
                            <button onClick={() => bannerInputRef.current?.click()} className="bg-white/80 text-black font-bold py-2 px-4 rounded-md hover:bg-white">
                                Change Banner
                            </button>
                            <input type="file" ref={bannerInputRef} onChange={handleBannerFileChange} className="hidden" accept="image/*" />
                        </div>
                    )}
                    <div className="absolute top-4 right-4 flex flex-col items-center gap-2">
                        {qrCodeDataUrl && <img src={qrCodeDataUrl} alt="QR Code" className="w-24 h-24 bg-white p-1 rounded-md" />}
                        <div className="flex gap-2 p-1 bg-white/20 rounded-md">
                            <a href="#" className="text-white hover:text-gray-300"><GoogleIcon className="h-5 w-5" /></a>
                            <a href="#" className="text-white hover:text-gray-300"><FacebookIcon className="h-5 w-5" /></a>
                            <a href="#" className="text-white hover:text-gray-300"><XIcon className="h-5 w-5" /></a>
                        </div>
                    </div>
                </div>

                {/* Profile Info Section */}
                <div className="p-4">
                    <div className="flex items-end -mt-20 md:-mt-24 relative z-10">
                         <img 
                            src={user?.profileImage || "https://i.ibb.co/RpStGhqm/IMG-5251-Original.jpg"}
                            alt="Profile" 
                            className="w-24 h-24 md:w-32 md:h-32 rounded-md shadow-lg object-cover border-4 border-gray-800 bg-gray-700"
                        />
                        <div className="ml-4">
                            <h2 className="text-xl md:text-2xl font-bold text-white">{user?.username || 'Bishal Mishra'}</h2>
                        </div>
                    </div>
                    
                    <div className="mt-4">
                        <div className="flex border-b border-gray-700">
                            <button onClick={() => setActiveTab('home')} className={`px-4 py-2 border-b-2 font-semibold ${activeTab === 'home' ? 'border-orange-500 text-orange-500' : 'border-transparent text-gray-400 hover:text-orange-500'}`}>Home</button>
                            <button onClick={() => setActiveTab('about')} className={`px-4 py-2 border-b-2 font-semibold ${activeTab === 'about' ? 'border-orange-500 text-orange-500' : 'border-transparent text-gray-400 hover:text-orange-500'}`}>About</button>
                        </div>
                        <div className="pt-4">
                            {activeTab === 'home' && (
                                <>
                                    <h3 className="font-bold text-lg mb-4 text-white">My Publications</h3>
                                    {flipbooks.length > 0 ? (
                                        <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 gap-4">
                                            {flipbooks.map(fb => (
                                                <Link to={`/flip/${fb.id}`} key={fb.id} className="group">
                                                    <div className="aspect-[3/4] bg-gray-700 rounded-md overflow-hidden shadow-md group-hover:shadow-xl transition-shadow">
                                                        <img src={fb.pageUrls[0]} alt={fb.title} className="w-full h-full object-cover"/>
                                                    </div>
                                                    <p className="text-sm font-semibold mt-2 truncate group-hover:text-blue-400 text-gray-200">{fb.title}</p>
                                                </Link>
                                            ))}
                                        </div>
                                    ) : (
                                        <p className="text-gray-400">No publications yet.</p>
                                    )}
                                </>
                            )}
                            {activeTab === 'about' && (
                                <div className="prose prose-invert max-w-none text-gray-200">
                                    {isEditing ? (
                                        <div className="space-y-4">
                                            <div>
                                                <label className="block text-sm font-bold">About Me</label>
                                                <textarea name="about" value={aboutData.about} onChange={handleAboutChange} rows={5} className="w-full p-2 border rounded-md bg-gray-700 border-gray-600" />
                                            </div>
                                             <div>
                                                <label className="block text-sm font-bold">Company</label>
                                                <input name="company" value={aboutData.company} onChange={handleAboutChange} className="w-full p-2 border rounded-md bg-gray-700 border-gray-600" />
                                            </div>
                                            <div>
                                                <label className="block text-sm font-bold">Website</label>
                                                <input name="website" value={aboutData.website} onChange={handleAboutChange} className="w-full p-2 border rounded-md bg-gray-700 border-gray-600" />
                                            </div>
                                            {message && <p className="text-sm text-green-400">{message}</p>}
                                        </div>
                                    ) : (
                                        <>
                                            <p>{user?.about || 'No information provided.'}</p>
                                            {user?.company && <p><strong>Company:</strong> {user.company}</p>}
                                            {user?.website && <p><strong>Website:</strong> <a href={user.website} target="_blank" rel="noopener noreferrer" className="text-blue-400 hover:underline">{user.website}</a></p>}
                                        </>
                                    )}
                                </div>
                            )}
                        </div>
                    </div>
                </div>
            </div>

            {isEmbedModalOpen && <div className="fixed inset-0 bg-black/50 z-50 flex items-center justify-center p-4" onClick={() => setIsEmbedModalOpen(false)}><div className="bg-gray-800 p-6 rounded-lg w-full max-w-lg shadow-xl text-white" onClick={e => e.stopPropagation()}><div className="flex justify-between items-center mb-4"><h3 className="font-bold text-lg">Embed Your Bookcase</h3><button onClick={() => setIsEmbedModalOpen(false)}><CloseIcon className="h-5 w-5" /></button></div><p className="text-sm mb-2">Copy this code to embed your public flipbooks on your website:</p><textarea readOnly value={embedCode} className="w-full h-24 p-2 font-mono text-xs bg-gray-900 text-gray-100 rounded-md" /></div></div>}
        </div>
    );
};

export default HomepageView;