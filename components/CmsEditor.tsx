import React, { useState, useEffect, useRef, useCallback } from 'react';
import { TrashIcon, EditIcon, CheckCircleIcon, CloseIcon, UploadCloudIcon, PlusIcon, RefreshIcon, SettingsIcon } from './icons.tsx';

// ─────────────────────────────────────────
// Clean SVG Icons to replace emojis
// ─────────────────────────────────────────
const HomeIcon: React.FC<{ className?: string }> = ({ className = 'h-4 w-4' }) => (
    <svg className={className} fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
        <path strokeLinecap="round" strokeLinejoin="round" d="M3 12l2-2m0 0l7-7 7 7M5 10v10a1 1 0 001 1h3m10-11l2 2m-2-2v10a1 1 0 01-1 1h-3m-6 0a1 1 0 001-1v-4a1 1 0 011-1h2a1 1 0 011 1v4a1 1 0 001 1m-6 0h6" />
    </svg>
);

const InfoIcon: React.FC<{ className?: string }> = ({ className = 'h-4 w-4' }) => (
    <svg className={className} fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
        <path strokeLinecap="round" strokeLinejoin="round" d="M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
    </svg>
);

const CreditCardIcon: React.FC<{ className?: string }> = ({ className = 'h-4 w-4' }) => (
    <svg className={className} fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
        <path strokeLinecap="round" strokeLinejoin="round" d="M3 10h18M7 15h1m4 0h1m-7 4h12a3 3 0 003-3V8a3 3 0 00-3-3H6a3 3 0 00-3 3v8a3 3 0 003 3z" />
    </svg>
);

const PhoneIcon: React.FC<{ className?: string }> = ({ className = 'h-4 w-4' }) => (
    <svg className={className} fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
        <path strokeLinecap="round" strokeLinejoin="round" d="M3 5a2 2 0 012-2h3.28a1 1 0 01.94.725l.548 2.2a1 1 0 01-.321.988l-1.305.98a10.582 10.582 0 004.872 4.872l.98-1.305a1 1 0 01.988-.321l2.2.548a1 1 0 01.725.94V19a2 2 0 01-2 2h-1C9.716 21 3 14.284 3 6V5z" />
    </svg>
);

const BoltIcon: React.FC<{ className?: string }> = ({ className = 'h-4 w-4' }) => (
    <svg className={className} fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
        <path strokeLinecap="round" strokeLinejoin="round" d="M13 10V3L4 14h7v7l9-11h-7z" />
    </svg>
);

const ShieldCheckIcon: React.FC<{ className?: string }> = ({ className = 'h-4 w-4' }) => (
    <svg className={className} fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
        <path strokeLinecap="round" strokeLinejoin="round" d="M9 12l2 2 4-4m5.618-4.016A11.955 11.955 0 0112 2.944a11.955 11.955 0 01-8.618 3.04A12.02 12.02 0 003 9c0 5.591 3.824 10.29 9 11.622 5.176-1.332 9-6.03 9-11.622 0-1.042-.133-2.052-.382-3.016z" />
    </svg>
);

const QuestionMarkIcon: React.FC<{ className?: string }> = ({ className = 'h-4 w-4' }) => (
    <svg className={className} fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
        <path strokeLinecap="round" strokeLinejoin="round" d="M8.228 9c.549-1.165 2.03-2 3.772-2 2.21 0 4 1.343 4 3 0 1.4-1.278 2.575-3.006 2.907-.542.104-.994.54-.994 1.093m0 3h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
    </svg>
);

const NewspaperIcon: React.FC<{ className?: string }> = ({ className = 'h-4 w-4' }) => (
    <svg className={className} fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
        <path strokeLinecap="round" strokeLinejoin="round" d="M19 20H5a2 2 0 01-2-2V6a2 2 0 012-2h10a2 2 0 012 2v1m2 13a2 2 0 01-2-2V7m2 13a2 2 0 002-2V9a2 2 0 00-2-2h-2m-4-3H9M7 16h6M7 8h6v4H7V8z" />
    </svg>
);

const AcademicCapIcon: React.FC<{ className?: string }> = ({ className = 'h-4 w-4' }) => (
    <svg className={className} fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
        <path strokeLinecap="round" strokeLinejoin="round" d="M12 14l9-5-9-5-9 5 9 5zm0 0l6.16-3.422a12.083 12.083 0 01.665 6.479A11.952 11.952 0 0012 20.055a11.952 11.952 0 00-6.824-2.998 12.078 12.078 0 01.665-6.479L12 14zm-4 6v-7.5l4-2.222" />
    </svg>
);

const BriefcaseIcon: React.FC<{ className?: string }> = ({ className = 'h-4 w-4' }) => (
    <svg className={className} fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
        <path strokeLinecap="round" strokeLinejoin="round" d="M21 13.255A23.931 23.931 0 0112 15c-3.183 0-6.22-.62-9-1.745M16 6V4a2 2 0 00-2-2h-4a2 2 0 00-2 2v2m4 6h.01M5 20h14a2 2 0 002-2V8a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z" />
    </svg>
);

const TerminalIcon: React.FC<{ className?: string }> = ({ className = 'h-4 w-4' }) => (
    <svg className={className} fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
        <path strokeLinecap="round" strokeLinejoin="round" d="M8 9l3 3-3 3m5 0h3M5 20h14a2 2 0 002-2V6a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z" />
    </svg>
);

const BookOpenIcon: React.FC<{ className?: string }> = ({ className = 'h-4 w-4' }) => (
    <svg className={className} fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
        <path strokeLinecap="round" strokeLinejoin="round" d="M12 6.253v13m0-13C10.832 5.477 9.246 5 7.5 5S4.168 5.477 3 6.253v13C4.168 18.477 5.754 18 7.5 18s3.332.477 4.5 1.253m0-13C13.168 5.477 14.754 5 16.5 5c1.747 0 3.332.477 4.5 1.253v13C19.832 18.477 18.247 18 16.5 18c-1.746 0-3.332.477-4.5 1.253" />
    </svg>
);

const StarIcon: React.FC<{ className?: string }> = ({ className = 'h-4 w-4' }) => (
    <svg className={className} fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
        <path strokeLinecap="round" strokeLinejoin="round" d="M11.049 2.927c.3-.921 1.603-.921 1.902 0l1.519 4.674a1 1 0 00.95.69h4.907c.961 0 1.36 1.252.583 1.828l-3.978 2.89a1 1 0 00-.364 1.118l1.518 4.674c.3.922-.755 1.688-1.538 1.118l-3.978-2.89a1 1 0 00-1.175 0l-3.978 2.89c-.783.57-1.838-.197-1.538-1.118l1.518-4.674a1 1 0 00-.364-1.118l-3.978-2.89c-.77-.576-.38-1.828.582-1.828h4.908a1 1 0 00.951-.69l1.519-4.674z" />
    </svg>
);

const ChartBarIcon: React.FC<{ className?: string }> = ({ className = 'h-4 w-4' }) => (
    <svg className={className} fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
        <path strokeLinecap="round" strokeLinejoin="round" d="M9 19v-6a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2a2 2 0 002-2zm0 0V9a2 2 0 012-2h2a2 2 0 012 2v10m-6 0a2 2 0 002 2h2a2 2 0 002-2m0 0V5a2 2 0 012-2h2a2 2 0 012 2v14a2 2 0 002 2h2a2 2 0 002-2z" />
    </svg>
);

const DocumentTextIcon: React.FC<{ className?: string }> = ({ className = 'h-4 w-4' }) => (
    <svg className={className} fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
        <path strokeLinecap="round" strokeLinejoin="round" d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
    </svg>
);

// ─────────────────────────────────────────
// Types
// ─────────────────────────────────────────
interface BlogPost {
    slug: string;
    title: string;
    date: string;
    excerpt: string;
    coverImage?: string;
    category?: string;
    author?: string;
    content?: string;
    published?: boolean;
}

interface SiteContent {
    hero: any;
    advantage: any;
    guide: any;
    impact: any;
    ecosystem: any;
    testimonials: any;
    premium: any;
    faq: any;
    blogSection: any;
    trustpilot: any;
    aboutPage?: any;
    pricingPage?: any;
    contactPage?: any;
    featuresPage?: any;
    securityPage?: any;
    faqPage?: any;
    pressPage?: any;
    educationPage?: any;
    businessPage?: any;
    developerPage?: any;
    howToUsePage?: any;
}

// ─────────────────────────────────────────
// Cloudinary Upload Hook
// ─────────────────────────────────────────
function useCloudinaryUpload() {
    const [uploading, setUploading] = useState(false);
    const [progress, setProgress] = useState<string>('');

    const upload = useCallback(async (file: File, folder = 'pdfbullet'): Promise<string> => {
        setUploading(true);
        setProgress('Uploading to Cloudinary...');
        try {
            const formData = new FormData();
            formData.append('file', file);
            formData.append('folder', folder);
            const res = await fetch('/api/upload', { method: 'POST', body: formData });
            if (!res.ok) {
                const err = await res.json();
                throw new Error(err.error || 'Upload failed');
            }
            const data = await res.json();
            setProgress('✅ Upload complete!');
            setTimeout(() => setProgress(''), 2000);
            return data.url;
        } finally {
            setUploading(false);
        }
    }, []);

    return { upload, uploading, progress };
}

// ─────────────────────────────────────────
// ImageUploader Component
// ─────────────────────────────────────────
const ImageUploader: React.FC<{
    value: string;
    onChange: (url: string) => void;
    label?: string;
    folder?: string;
}> = ({ value, onChange, label = 'Image', folder = 'pdfbullet/sections' }) => {
    const { upload, uploading, progress } = useCloudinaryUpload();
    const inputRef = useRef<HTMLInputElement>(null);

    const handleFile = async (e: React.ChangeEvent<HTMLInputElement>) => {
        const file = e.target.files?.[0];
        if (!file) return;
        const url = await upload(file, folder);
        onChange(url);
    };

    return (
        <div className="space-y-2">
            <label className="block text-[10px] font-black text-gray-400 uppercase tracking-widest">{label}</label>
            {value && (
                <div className="relative group w-full h-32 rounded-xl overflow-hidden border border-gray-200 dark:border-gray-800 bg-gray-50 dark:bg-black">
                    <img src={value} alt="preview" className="w-full h-full object-cover" />
                    <button
                        onClick={() => onChange('')}
                        className="absolute top-2 right-2 p-1.5 bg-black/60 hover:bg-red-600 text-white rounded-lg opacity-0 group-hover:opacity-100 transition-all"
                        title="Remove image"
                    >
                        <CloseIcon className="h-3 w-3" />
                    </button>
                </div>
            )}
            <input ref={inputRef} type="file" accept="image/*,video/*" onChange={handleFile} className="hidden" />
            <button
                onClick={() => inputRef.current?.click()}
                disabled={uploading}
                className="w-full flex items-center justify-center gap-2 px-4 py-3 border-2 border-dashed border-gray-300 dark:border-gray-700 hover:border-brand-red dark:hover:border-brand-red rounded-xl text-sm font-semibold text-gray-500 hover:text-brand-red transition-all disabled:opacity-50"
            >
                <UploadCloudIcon className="h-4 w-4" />
                {uploading ? 'Uploading...' : value ? 'Replace Image' : 'Upload to Cloudinary'}
            </button>
            {progress && <p className="text-xs text-center text-green-500 font-semibold">{progress}</p>}
        </div>
    );
};

// ─────────────────────────────────────────
// Field Components
// ─────────────────────────────────────────
const Field: React.FC<{ label: string; children: React.ReactNode; hint?: string }> = ({ label, children, hint }) => (
    <div className="space-y-1.5">
        <label className="block text-[10px] font-black text-gray-400 uppercase tracking-widest">{label}</label>
        {children}
        {hint && <p className="text-[10px] text-gray-400 italic">{hint}</p>}
    </div>
);

const Input: React.FC<{ value: string; onChange: (v: string) => void; placeholder?: string; className?: string }> = ({
    value, onChange, placeholder, className = ''
}) => (
    <input
        type="text"
        value={value || ''}
        onChange={(e) => onChange(e.target.value)}
        placeholder={placeholder}
        className={`w-full p-3 bg-gray-50 dark:bg-black border border-gray-200 dark:border-gray-800 rounded-xl focus:ring-2 focus:ring-brand-red outline-none text-sm transition-all ${className}`}
    />
);

const Textarea: React.FC<{ value: string; onChange: (v: string) => void; rows?: number; placeholder?: string; monospace?: boolean }> = ({
    value, onChange, rows = 3, placeholder, monospace
}) => (
    <textarea
        value={value || ''}
        onChange={(e) => onChange(e.target.value)}
        rows={rows}
        placeholder={placeholder}
        className={`w-full p-3 bg-gray-50 dark:bg-black border border-gray-200 dark:border-gray-800 rounded-xl focus:ring-2 focus:ring-brand-red outline-none text-sm transition-all resize-none ${monospace ? 'font-mono text-xs' : ''}`}
    />
);

const SectionCard: React.FC<{ title: string; icon: React.ReactNode; children: React.ReactNode }> = ({ title, icon, children }) => (
    <div className="bg-white dark:bg-black border border-gray-100 dark:border-gray-800 rounded-2xl shadow-sm overflow-hidden">
        <div className="px-6 py-4 border-b border-gray-100 dark:border-gray-800 bg-gray-50/50 dark:bg-gray-900/50 flex items-center gap-3">
            <span className="text-gray-500 dark:text-gray-400">{icon}</span>
            <h3 className="font-extrabold text-base tracking-tight text-gray-800 dark:text-gray-100">{title}</h3>
        </div>
        <div className="p-6 space-y-5">{children}</div>
    </div>
);

// ─────────────────────────────────────────
// Site Content Editor
// ─────────────────────────────────────────
export const SiteContentEditor: React.FC = () => {
    const [content, setContent] = useState<SiteContent | null>(null);
    const [loading, setLoading] = useState(true);
    const [saving, setSaving] = useState(false);
    const [status, setStatus] = useState('');
    
    // Switch between "homepage" (and its sections) vs other static pages
    const [currentPage, setCurrentPage] = useState<'homepage' | 'about' | 'pricing' | 'contact' | 'features' | 'security' | 'faq' | 'press' | 'education' | 'business' | 'developer' | 'how-to-use'>('homepage');
    const [activeSection, setActiveSection] = useState('hero');

    useEffect(() => {
        fetch('/api/site-content')
            .then((r) => r.json())
            .then((data) => { setContent(data); setLoading(false); })
            .catch(() => { setStatus('Failed to load content'); setLoading(false); });
    }, []);

    const set = (section: string, key: string, value: any) => {
        setContent((prev: any) => {
            if (!prev) return prev;
            return {
                ...prev,
                [section]: {
                    ...(prev[section] || {}),
                    [key]: value
                }
            };
        });
    };

    const setDeep = (section: string, arrKey: string, idx: number, field: string, value: any) => {
        setContent((prev: any) => {
            if (!prev) return prev;
            const arr = [...(prev[section]?.[arrKey] || [])];
            arr[idx] = { ...arr[idx], [field]: value };
            return { ...prev, [section]: { ...prev[section], [arrKey]: arr } };
        });
    };

    const addItem = (section: string, arrKey: string, template: any) => {
        setContent((prev: any) => {
            if (!prev) return prev;
            const arr = [...(prev[section]?.[arrKey] || []), template];
            return { ...prev, [section]: { ...prev[section], [arrKey]: arr } };
        });
    };

    const removeItem = (section: string, arrKey: string, idx: number) => {
        setContent((prev: any) => {
            if (!prev) return prev;
            const arr = (prev[section]?.[arrKey] || []).filter((_: any, i: number) => i !== idx);
            return { ...prev, [section]: { ...prev[section], [arrKey]: arr } };
        });
    };

    const handleSave = async () => {
        setSaving(true);
        setStatus('Saving...');
        try {
            const res = await fetch('/api/site-content', {
                method: 'PUT',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify(content),
            });
            if (!res.ok) throw new Error('Save failed');
            setStatus('✅ All changes saved!');
        } catch {
            setStatus('❌ Save failed. Try again.');
        } finally {
            setSaving(false);
            setTimeout(() => setStatus(''), 4000);
        }
    };

    const handleReset = async () => {
        if (!window.confirm('Reset ALL content to defaults? This cannot be undone.')) return;
        const res = await fetch('/api/site-content', { method: 'DELETE' });
        if (res.ok) {
            const data = await fetch('/api/site-content').then((r) => r.json());
            setContent(data);
            setStatus('✅ Content reset to defaults.');
            setTimeout(() => setStatus(''), 3000);
        }
    };

    const homepageSections = [
        { id: 'hero', label: 'Hero Banner', icon: <HomeIcon /> },
        { id: 'advantage', label: 'Advantage', icon: <BoltIcon /> },
        { id: 'guide', label: 'Guide Steps', icon: <BookOpenIcon /> },
        { id: 'impact', label: 'Stats/Impact', icon: <ChartBarIcon /> },
        { id: 'ecosystem', label: 'Ecosystem', icon: <BoltIcon /> },
        { id: 'testimonials', label: 'Testimonials', icon: <StarIcon /> },
        { id: 'premium', label: 'Premium', icon: <CreditCardIcon /> },
        { id: 'faq', label: 'FAQ', icon: <QuestionMarkIcon /> },
        { id: 'blogSection', label: 'Blog Section', icon: <NewspaperIcon /> },
        { id: 'trustpilot', label: 'Trustpilot', icon: <StarIcon /> },
    ];

    const pages = [
        { id: 'homepage', label: 'Homepage Sections', icon: <HomeIcon className="h-4 w-4 flex-shrink-0" /> },
        { id: 'about', label: 'About Page', icon: <InfoIcon className="h-4 w-4 flex-shrink-0" /> },
        { id: 'pricing', label: 'Pricing Page', icon: <CreditCardIcon className="h-4 w-4 flex-shrink-0" /> },
        { id: 'contact', label: 'Contact Page', icon: <PhoneIcon className="h-4 w-4 flex-shrink-0" /> },
        { id: 'features', label: 'Features Page', icon: <BoltIcon className="h-4 w-4 flex-shrink-0" /> },
        { id: 'security', label: 'Security Page', icon: <ShieldCheckIcon className="h-4 w-4 flex-shrink-0" /> },
        { id: 'faq', label: 'FAQ Page', icon: <QuestionMarkIcon className="h-4 w-4 flex-shrink-0" /> },
        { id: 'press', label: 'Press Page', icon: <NewspaperIcon className="h-4 w-4 flex-shrink-0" /> },
        { id: 'education', label: 'Education Page', icon: <AcademicCapIcon className="h-4 w-4 flex-shrink-0" /> },
        { id: 'business', label: 'Business Page', icon: <BriefcaseIcon className="h-4 w-4 flex-shrink-0" /> },
        { id: 'developer', label: 'Developer API Page', icon: <TerminalIcon className="h-4 w-4 flex-shrink-0" /> },
        { id: 'how-to-use', label: 'How To Use Guide', icon: <BookOpenIcon className="h-4 w-4 flex-shrink-0" /> }
    ];

    if (loading) {
        return (
            <div className="flex items-center justify-center h-64">
                <div className="text-center">
                    <RefreshIcon className="h-8 w-8 animate-spin text-brand-red mx-auto mb-3" />
                    <p className="text-gray-500 font-semibold">Loading site content...</p>
                </div>
            </div>
        );
    }

    if (!content) return <div className="text-red-500 text-center py-20">Failed to load content. Check server.</div>;

    return (
        <div className="space-y-6">
            {/* Header */}
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 bg-white dark:bg-black border border-gray-100 dark:border-gray-800 rounded-2xl p-6 shadow-sm">
                <div className="flex items-center gap-3">
                    <div className="p-3 bg-brand-red/10 text-brand-red rounded-xl">
                        <EditIcon className="h-6 w-6" />
                    </div>
                    <div>
                        <h2 className="text-2xl font-extrabold tracking-tight text-gray-800 dark:text-gray-100">
                            Whole Site Content & Page Editor
                        </h2>
                        <p className="text-sm text-gray-500 mt-1">Select any page of PDFBullet to configure sections, copy, images, and SEO items.</p>
                    </div>
                </div>
                <div className="flex items-center gap-3">
                    <button
                        onClick={handleReset}
                        className="px-4 py-2.5 border border-gray-200 dark:border-gray-700 rounded-xl text-sm font-bold text-gray-500 hover:text-red-500 hover:border-red-300 transition-all"
                    >
                        Reset Defaults
                    </button>
                    <button
                        onClick={handleSave}
                        disabled={saving}
                        className="flex items-center gap-2 px-6 py-2.5 bg-brand-red hover:bg-red-700 text-white font-extrabold rounded-xl transition-all shadow-lg shadow-brand-red/20 disabled:opacity-50 text-sm"
                    >
                        <CheckCircleIcon className="h-4 w-4" />
                        {saving ? 'Saving...' : 'Save All Changes'}
                    </button>
                </div>
            </div>

            {status && (
                <div className={`px-5 py-3 rounded-xl text-sm font-bold text-center ${status.includes('❌') ? 'bg-red-50 text-red-600 dark:bg-red-950/20 dark:text-red-400' : 'bg-green-50 text-green-600 dark:bg-green-950/20 dark:text-green-400'}`}>
                    {status}
                </div>
            )}

            {/* Page Selector Tabs */}
            <div className="space-y-2">
                <label className="block text-[10px] font-black text-gray-400 uppercase tracking-widest">Select Page to Edit</label>
                <div className="flex flex-wrap gap-2">
                    {pages.map((p: any) => (
                        <button
                            key={p.id}
                            onClick={() => setCurrentPage(p.id)}
                            className={`flex items-center gap-2 px-4 py-2.5 rounded-xl text-xs font-black transition-all ${currentPage === p.id ? 'bg-brand-red text-white shadow-md shadow-brand-red/20' : 'bg-white dark:bg-black border border-gray-200 dark:border-gray-800 text-gray-600 dark:text-gray-400 hover:border-brand-red hover:text-brand-red'}`}
                        >
                            {p.icon}
                            <span>{p.label}</span>
                        </button>
                    ))}
                </div>
            </div>

            {/* ====== 1. HOMEPAGE CONFIGURATION ====== */}
            {currentPage === 'homepage' && (
                <div className="space-y-6">
                    {/* Section tabs for homepage */}
                    <div className="flex flex-wrap gap-2 pt-2 border-t border-gray-150 dark:border-gray-800">
                        {homepageSections.map((s) => (
                            <button
                                key={s.id}
                                onClick={() => setActiveSection(s.id)}
                                className={`flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-[11px] font-bold transition-all ${activeSection === s.id ? 'bg-gray-800 text-white dark:bg-gray-200 dark:text-black' : 'bg-gray-100 dark:bg-gray-900 border border-transparent text-gray-600 dark:text-gray-400 hover:bg-gray-200'}`}
                            >
                                {s.icon}
                                <span>{s.label}</span>
                            </button>
                        ))}
                    </div>

                    {activeSection === 'hero' && (
                        <SectionCard title="Hero Banner" icon={<HomeIcon className="h-5 w-5" />}>
                            <div className="grid grid-cols-1 lg:grid-cols-2 gap-5">
                                <Field label="Badge Text"><Input value={content.hero.badge} onChange={(v) => set('hero', 'badge', v)} /></Field>
                                <Field label="Stats Label"><Input value={content.hero.statsLabel} onChange={(v) => set('hero', 'statsLabel', v)} /></Field>
                                <Field label="Primary CTA Button"><Input value={content.hero.ctaPrimary} onChange={(v) => set('hero', 'ctaPrimary', v)} /></Field>
                                <Field label="Secondary CTA Button"><Input value={content.hero.ctaSecondary} onChange={(v) => set('hero', 'ctaSecondary', v)} /></Field>
                            </div>
                            <Field label="Main Headline" hint="Use \n for line breaks"><Textarea value={content.hero.headline} onChange={(v) => set('hero', 'headline', v)} rows={2} /></Field>
                            <Field label="Subheadline"><Textarea value={content.hero.subheadline} onChange={(v) => set('hero', 'subheadline', v)} rows={3} /></Field>
                        </SectionCard>
                    )}

                    {activeSection === 'advantage' && (
                        <SectionCard title="The PDFBullet Advantage" icon={<BoltIcon className="h-5 w-5" />}>
                            <div className="grid grid-cols-1 lg:grid-cols-2 gap-5">
                                <Field label="Section Badge"><Input value={content.advantage.sectionBadge} onChange={(v) => set('advantage', 'sectionBadge', v)} /></Field>
                                <Field label="Section Headline"><Input value={content.advantage.headline} onChange={(v) => set('advantage', 'headline', v)} /></Field>
                            </div>
                            <Field label="Subheadline"><Textarea value={content.advantage.subheadline} onChange={(v) => set('advantage', 'subheadline', v)} /></Field>
                            <div className="space-y-3">
                                <div className="flex items-center justify-between"><p className="text-xs font-black text-gray-400 uppercase tracking-widest">Feature Cards</p>
                                    <button onClick={() => addItem('advantage', 'features', { icon: '⭐', title: 'New Feature', description: 'Description here' })}
                                        className="flex items-center gap-1 text-xs font-bold text-brand-red hover:underline"><PlusIcon className="h-3 w-3" /> Add Feature</button>
                                </div>
                                {(content.advantage.features || []).map((f: any, i: number) => (
                                    <div key={i} className="p-4 bg-gray-50 dark:bg-gray-900/50 rounded-xl border border-gray-100 dark:border-gray-800 grid grid-cols-12 gap-3 items-start">
                                        <div className="col-span-1"><Input value={f.icon} onChange={(v) => setDeep('advantage', 'features', i, 'icon', v)} className="text-center text-xl" /></div>
                                        <div className="col-span-4"><Input value={f.title} onChange={(v) => setDeep('advantage', 'features', i, 'title', v)} placeholder="Feature title" /></div>
                                        <div className="col-span-6"><Input value={f.description} onChange={(v) => setDeep('advantage', 'features', i, 'description', v)} placeholder="Description" /></div>
                                        <button onClick={() => removeItem('advantage', 'features', i)} className="col-span-1 p-2.5 text-red-400 hover:text-red-600 hover:bg-red-50 rounded-lg"><TrashIcon className="h-4 w-4" /></button>
                                    </div>
                                ))}
                            </div>
                        </SectionCard>
                    )}

                    {activeSection === 'guide' && (
                        <SectionCard title="Guide Steps" icon={<BookOpenIcon className="h-5 w-5" />}>
                            <div className="grid grid-cols-1 lg:grid-cols-2 gap-5">
                                <Field label="Section Badge"><Input value={content.guide.sectionBadge} onChange={(v) => set('guide', 'sectionBadge', v)} /></Field>
                                <Field label="Headline"><Input value={content.guide.headline} onChange={(v) => set('guide', 'headline', v)} /></Field>
                            </div>
                            <Field label="Subheadline"><Textarea value={content.guide.subheadline} onChange={(v) => set('guide', 'subheadline', v)} /></Field>
                            <div className="space-y-3">
                                <div className="flex items-center justify-between"><p className="text-xs font-black text-gray-400 uppercase tracking-widest">Steps</p>
                                    <button onClick={() => addItem('guide', 'steps', { step: `0${(content.guide.steps?.length || 0) + 1}`, title: 'New Step', description: '' })}
                                        className="flex items-center gap-1 text-xs font-bold text-brand-red hover:underline"><PlusIcon className="h-3 w-3" /> Add Step</button>
                                </div>
                                {(content.guide.steps || []).map((s: any, i: number) => (
                                    <div key={i} className="p-4 bg-gray-50 dark:bg-gray-900/50 rounded-xl border border-gray-100 dark:border-gray-800 grid grid-cols-12 gap-3 items-start">
                                        <div className="col-span-1"><Input value={s.step} onChange={(v) => setDeep('guide', 'steps', i, 'step', v)} /></div>
                                        <div className="col-span-4"><Input value={s.title} onChange={(v) => setDeep('guide', 'steps', i, 'title', v)} /></div>
                                        <div className="col-span-6"><Input value={s.description} onChange={(v) => setDeep('guide', 'steps', i, 'description', v)} /></div>
                                        <button onClick={() => removeItem('guide', 'steps', i)} className="col-span-1 p-2.5 text-red-400 hover:text-red-600 rounded-lg"><TrashIcon className="h-4 w-4" /></button>
                                    </div>
                                ))}
                            </div>
                        </SectionCard>
                    )}

                    {activeSection === 'impact' && (
                        <SectionCard title="Impact Numbers" icon={<ChartBarIcon className="h-5 w-5" />}>
                            <div className="grid grid-cols-1 lg:grid-cols-2 gap-5">
                                <Field label="Section Badge"><Input value={content.impact.sectionBadge} onChange={(v) => set('impact', 'sectionBadge', v)} /></Field>
                                <Field label="Headline"><Input value={content.impact.headline} onChange={(v) => set('impact', 'headline', v)} /></Field>
                            </div>
                            <div className="space-y-3">
                                {(content.impact.stats || []).map((s: any, i: number) => (
                                    <div key={i} className="p-4 bg-gray-50 dark:bg-gray-900/50 rounded-xl border border-gray-100 dark:border-gray-800 grid grid-cols-12 gap-3 items-start">
                                        <div className="col-span-2"><Input value={s.value} onChange={(v) => setDeep('impact', 'stats', i, 'value', v)} /></div>
                                        <div className="col-span-4"><Input value={s.label} onChange={(v) => setDeep('impact', 'stats', i, 'label', v)} /></div>
                                        <div className="col-span-5"><Input value={s.description} onChange={(v) => setDeep('impact', 'stats', i, 'description', v)} /></div>
                                        <button onClick={() => removeItem('impact', 'stats', i)} className="col-span-1 p-2.5 text-red-400 hover:text-red-600 rounded-lg"><TrashIcon className="h-4 w-4" /></button>
                                    </div>
                                ))}
                            </div>
                        </SectionCard>
                    )}

                    {activeSection === 'ecosystem' && (
                        <SectionCard title="Ecosystem" icon={<BoltIcon className="h-5 w-5" />}>
                            <Field label="Headline"><Input value={content.ecosystem.headline} onChange={(v) => set('ecosystem', 'headline', v)} /></Field>
                            <Field label="CTA Button Text"><Input value={content.ecosystem.ctaText} onChange={(v) => set('ecosystem', 'ctaText', v)} /></Field>
                            <Field label="Subheadline"><Textarea value={content.ecosystem.subheadline} onChange={(v) => set('ecosystem', 'subheadline', v)} /></Field>
                        </SectionCard>
                    )}

                    {activeSection === 'testimonials' && (
                        <SectionCard title="Testimonials" icon={<StarIcon className="h-5 w-5" />}>
                            <div className="grid grid-cols-1 lg:grid-cols-2 gap-5">
                                <Field label="Headline"><Input value={content.testimonials.headline} onChange={(v) => set('testimonials', 'headline', v)} /></Field>
                                <Field label="Subheadline"><Textarea value={content.testimonials.subheadline} onChange={(v) => set('testimonials', 'subheadline', v)} /></Field>
                            </div>
                            <div className="space-y-4">
                                {(content.testimonials.items || []).map((t: any, i: number) => (
                                    <div key={i} className="p-4 bg-gray-50 dark:bg-gray-900 rounded-xl border border-gray-150 space-y-3">
                                        <div className="grid grid-cols-3 gap-3">
                                            <Field label="Name"><Input value={t.name} onChange={(v) => setDeep('testimonials', 'items', i, 'name', v)} /></Field>
                                            <Field label="Role"><Input value={t.role} onChange={(v) => setDeep('testimonials', 'items', i, 'role', v)} /></Field>
                                            <Field label="Company"><Input value={t.company} onChange={(v) => setDeep('testimonials', 'items', i, 'company', v)} /></Field>
                                        </div>
                                        <Field label="Review"><Textarea value={t.review} onChange={(v) => setDeep('testimonials', 'items', i, 'review', v)} /></Field>
                                    </div>
                                ))}
                            </div>
                        </SectionCard>
                    )}

                    {activeSection === 'premium' && (
                        <SectionCard title="Premium Info" icon={<CreditCardIcon className="h-5 w-5" />}>
                            <Field label="Headline"><Input value={content.premium.headline} onChange={(v) => set('premium', 'headline', v)} /></Field>
                            <Field label="Subheadline"><Textarea value={content.premium.subheadline} onChange={(v) => set('premium', 'subheadline', v)} /></Field>
                        </SectionCard>
                    )}

                    {activeSection === 'faq' && (
                        <SectionCard title="Frequently Asked Questions" icon={<QuestionMarkIcon className="h-5 w-5" />}>
                            <div className="space-y-4">
                                {(content.faq.items || []).map((faq: any, i: number) => (
                                    <div key={i} className="p-4 bg-gray-50 dark:bg-gray-900 rounded-xl border border-gray-150 space-y-3">
                                        <Field label="Question"><Input value={faq.q} onChange={(v) => setDeep('faq', 'items', i, 'q', v)} /></Field>
                                        <Field label="Answer"><Textarea value={faq.a} onChange={(v) => setDeep('faq', 'items', i, 'a', v)} /></Field>
                                    </div>
                                ))}
                            </div>
                        </SectionCard>
                    )}

                    {activeSection === 'blogSection' && (
                        <SectionCard title="Blog Heading" icon={<NewspaperIcon className="h-5 w-5" />}>
                            <Field label="Headline"><Input value={content.blogSection.headline} onChange={(v) => set('blogSection', 'headline', v)} /></Field>
                            <Field label="Subheadline"><Textarea value={content.blogSection.subheadline} onChange={(v) => set('blogSection', 'subheadline', v)} /></Field>
                        </SectionCard>
                    )}

                    {activeSection === 'trustpilot' && (
                        <SectionCard title="Trustpilot Banner" icon={<StarIcon className="h-5 w-5" />}>
                            <Field label="Headline"><Input value={content.trustpilot.headline} onChange={(v) => set('trustpilot', 'headline', v)} /></Field>
                            <Field label="Subheadline"><Textarea value={content.trustpilot.subheadline} onChange={(v) => set('trustpilot', 'subheadline', v)} /></Field>
                            <Field label="CTA Text"><Input value={content.trustpilot.ctaText} onChange={(v) => set('trustpilot', 'ctaText', v)} /></Field>
                        </SectionCard>
                    )}
                </div>
            )}

            {/* ====== 2. ABOUT PAGE ====== */}
            {currentPage === 'about' && content.aboutPage && (
                <SectionCard title="About Page Editor" icon={<InfoIcon className="h-5 w-5" />}>
                    <Field label="Hero Title"><Input value={content.aboutPage.heroHeadline} onChange={(v) => set('aboutPage', 'heroHeadline', v)} /></Field>
                    <Field label="Hero Subtitle"><Textarea value={content.aboutPage.heroSubheadline} onChange={(v) => set('aboutPage', 'heroSubheadline', v)} /></Field>
                    <Field label="Story Section Title"><Input value={content.aboutPage.ourStoryTitle} onChange={(v) => set('aboutPage', 'ourStoryTitle', v)} /></Field>
                    <Field label="Story Content (Paragraph 1)"><Textarea value={content.aboutPage.ourStoryContent1} onChange={(v) => set('aboutPage', 'ourStoryContent1', v)} rows={4} /></Field>
                    <Field label="Story Content (Paragraph 2)"><Textarea value={content.aboutPage.ourStoryContent2} onChange={(v) => set('aboutPage', 'ourStoryContent2', v)} rows={4} /></Field>
                    <Field label="Story Content (Paragraph 3)"><Textarea value={content.aboutPage.ourStoryContent3} onChange={(v) => set('aboutPage', 'ourStoryContent3', v)} rows={4} /></Field>
                    <Field label="Technology Section Title"><Input value={content.aboutPage.technologyTitle} onChange={(v) => set('aboutPage', 'technologyTitle', v)} /></Field>
                    <Field label="Technology Intro text"><Textarea value={content.aboutPage.technologyContent1} onChange={(v) => set('aboutPage', 'technologyContent1', v)} rows={3} /></Field>
                    <Field label="Client-side Technology Details"><Textarea value={content.aboutPage.technologyContent2} onChange={(v) => set('aboutPage', 'technologyContent2', v)} rows={3} /></Field>
                    <Field label="Server-side Technology Details"><Textarea value={content.aboutPage.technologyContent3} onChange={(v) => set('aboutPage', 'technologyContent3', v)} rows={3} /></Field>
                </SectionCard>
            )}

            {/* ====== 3. PRICING PAGE ====== */}
            {currentPage === 'pricing' && content.pricingPage && (
                <SectionCard title="Pricing Page Editor" icon={<CreditCardIcon className="h-5 w-5" />}>
                    <Field label="Hero Headline"><Input value={content.pricingPage.heroHeadline} onChange={(v) => set('pricingPage', 'heroHeadline', v)} /></Field>
                    <Field label="Hero Subheadline"><Textarea value={content.pricingPage.heroSubheadline} onChange={(v) => set('pricingPage', 'heroSubheadline', v)} /></Field>
                    <Field label="Badge / Promo text"><Input value={content.pricingPage.badgeText} onChange={(v) => set('pricingPage', 'badgeText', v)} /></Field>
                    <Field label="FAQ Section Title"><Input value={content.pricingPage.faqTitle} onChange={(v) => set('pricingPage', 'faqTitle', v)} /></Field>
                    <Field label="FAQ Subtitle"><Input value={content.pricingPage.faqSubtitle} onChange={(v) => set('pricingPage', 'faqSubtitle', v)} /></Field>
                    <Field label="CTA Banner Title"><Input value={content.pricingPage.ctaTitle} onChange={(v) => set('pricingPage', 'ctaTitle', v)} /></Field>
                    <Field label="CTA Subtitle"><Input value={content.pricingPage.ctaSubtitle} onChange={(v) => set('pricingPage', 'ctaSubtitle', v)} /></Field>
                </SectionCard>
            )}

            {/* ====== 4. CONTACT PAGE ====== */}
            {currentPage === 'contact' && content.contactPage && (
                <SectionCard title="Contact Page Editor" icon={<PhoneIcon className="h-5 w-5" />}>
                    <Field label="Hero Headline"><Input value={content.contactPage.heroHeadline} onChange={(v) => set('contactPage', 'heroHeadline', v)} /></Field>
                    <Field label="Hero Subheadline"><Textarea value={content.contactPage.heroSubheadline} onChange={(v) => set('contactPage', 'heroSubheadline', v)} /></Field>
                    <div className="grid grid-cols-2 gap-4">
                        <Field label="Email Widget Title"><Input value={content.contactPage.emailTitle} onChange={(v) => set('contactPage', 'emailTitle', v)} /></Field>
                        <Field label="Email Address"><Input value={content.contactPage.emailValue} onChange={(v) => set('contactPage', 'emailValue', v)} /></Field>
                        <Field label="WhatsApp Title"><Input value={content.contactPage.whatsappTitle} onChange={(v) => set('contactPage', 'whatsappTitle', v)} /></Field>
                        <Field label="WhatsApp Value"><Input value={content.contactPage.whatsappValue} onChange={(v) => set('contactPage', 'whatsappValue', v)} /></Field>
                        <Field label="Office Location Title"><Input value={content.contactPage.addressTitle} onChange={(v) => set('contactPage', 'addressTitle', v)} /></Field>
                        <Field label="Office Location Address"><Input value={content.contactPage.addressValue} onChange={(v) => set('contactPage', 'addressValue', v)} /></Field>
                    </div>
                    <Field label="Form Heading"><Input value={content.contactPage.formTitle} onChange={(v) => set('contactPage', 'formTitle', v)} /></Field>
                    <Field label="Average Response Info"><Input value={content.contactPage.responseTimeText} onChange={(v) => set('contactPage', 'responseTimeText', v)} /></Field>
                </SectionCard>
            )}

            {/* ====== 5. FEATURES PAGE ====== */}
            {currentPage === 'features' && content.featuresPage && (
                <SectionCard title="Features Overview Editor" icon={<BoltIcon className="h-5 w-5" />}>
                    <Field label="Hero Headline"><Input value={content.featuresPage.heroHeadline} onChange={(v) => set('featuresPage', 'heroHeadline', v)} /></Field>
                    <Field label="Hero Subheadline"><Textarea value={content.featuresPage.heroSubheadline} onChange={(v) => set('featuresPage', 'heroSubheadline', v)} /></Field>
                </SectionCard>
            )}

            {/* ====== 6. SECURITY PAGE ====== */}
            {currentPage === 'security' && content.securityPage && (
                <SectionCard title="Security Page Editor" icon={<ShieldCheckIcon className="h-5 w-5" />}>
                    <Field label="Hero Headline"><Input value={content.securityPage.heroHeadline} onChange={(v) => set('securityPage', 'heroHeadline', v)} /></Field>
                    <Field label="Hero Subheadline"><Textarea value={content.securityPage.heroSubheadline} onChange={(v) => set('securityPage', 'heroSubheadline', v)} /></Field>
                    <Field label="Intro section Headline"><Input value={content.securityPage.introTitle} onChange={(v) => set('securityPage', 'introTitle', v)} /></Field>
                    <Field label="Intro Body Text"><Textarea value={content.securityPage.introBody} onChange={(v) => set('securityPage', 'introBody', v)} rows={4} /></Field>
                </SectionCard>
            )}

            {/* ====== 7. FAQ PAGE ====== */}
            {currentPage === 'faq' && content.faqPage && (
                <SectionCard title="Help Center FAQ Editor" icon={<QuestionMarkIcon className="h-5 w-5" />}>
                    <Field label="Hero Headline"><Input value={content.faqPage.heroHeadline} onChange={(v) => set('faqPage', 'heroHeadline', v)} /></Field>
                    <Field label="Hero Subheadline"><Textarea value={content.faqPage.heroSubheadline} onChange={(v) => set('faqPage', 'heroSubheadline', v)} /></Field>
                </SectionCard>
            )}

            {/* ====== 8. PRESS PAGE ====== */}
            {currentPage === 'press' && content.pressPage && (
                <SectionCard title="Press & News Editor" icon={<NewspaperIcon className="h-5 w-5" />}>
                    <Field label="Hero Headline"><Input value={content.pressPage.heroHeadline} onChange={(v) => set('pressPage', 'heroHeadline', v)} /></Field>
                    <Field label="Hero Subheadline"><Textarea value={content.pressPage.heroSubheadline} onChange={(v) => set('pressPage', 'heroSubheadline', v)} /></Field>
                    <Field label="Press Contact Email"><Input value={content.pressPage.pressEmail} onChange={(v) => set('pressPage', 'pressEmail', v)} /></Field>
                </SectionCard>
            )}

            {/* ====== 9. EDUCATION PAGE ====== */}
            {currentPage === 'education' && content.educationPage && (
                <SectionCard title="Education Plan Editor" icon={<AcademicCapIcon className="h-5 w-5" />}>
                    <Field label="Hero Headline"><Input value={content.educationPage.heroHeadline} onChange={(v) => set('educationPage', 'heroHeadline', v)} /></Field>
                    <Field label="Hero Subheadline"><Textarea value={content.educationPage.heroSubheadline} onChange={(v) => set('educationPage', 'heroSubheadline', v)} /></Field>
                    <Field label="CTA Card Headline"><Input value={content.educationPage.ctaTitle} onChange={(v) => set('educationPage', 'ctaTitle', v)} /></Field>
                    <Field label="CTA Description text"><Input value={content.educationPage.ctaText} onChange={(v) => set('educationPage', 'ctaText', v)} /></Field>
                </SectionCard>
            )}

            {/* ====== 10. BUSINESS PAGE ====== */}
            {currentPage === 'business' && content.businessPage && (
                <SectionCard title="Business Plan Editor" icon={<BriefcaseIcon className="h-5 w-5" />}>
                    <Field label="Hero Headline"><Input value={content.businessPage.heroHeadline} onChange={(v) => set('businessPage', 'heroHeadline', v)} /></Field>
                    <Field label="Hero Subheadline"><Textarea value={content.businessPage.heroSubheadline} onChange={(v) => set('businessPage', 'heroSubheadline', v)} /></Field>
                </SectionCard>
            )}

            {/* ====== 11. DEVELOPER PAGE ====== */}
            {currentPage === 'developer' && content.developerPage && (
                <SectionCard title="Developer API Page Editor" icon={<TerminalIcon className="h-5 w-5" />}>
                    <Field label="Hero Headline"><Input value={content.developerPage.heroHeadline} onChange={(v) => set('developerPage', 'heroHeadline', v)} /></Field>
                    <Field label="Hero Subheadline"><Textarea value={content.developerPage.heroSubheadline} onChange={(v) => set('developerPage', 'heroSubheadline', v)} /></Field>
                </SectionCard>
            )}

            {/* ====== 12. HOW TO USE GUIDE ====== */}
            {currentPage === 'how-to-use' && content.howToUsePage && (
                <SectionCard title="How To Use Guide Editor" icon={<BookOpenIcon className="h-5 w-5" />}>
                    <Field label="Hero Headline"><Input value={content.howToUsePage.heroHeadline} onChange={(v) => set('howToUsePage', 'heroHeadline', v)} /></Field>
                    <Field label="Hero Subheadline"><Textarea value={content.howToUsePage.heroSubheadline} onChange={(v) => set('howToUsePage', 'heroSubheadline', v)} /></Field>
                </SectionCard>
            )}
        </div>
    );
};

// ─────────────────────────────────────────
// Blog Manager Component
// ─────────────────────────────────────────
export const BlogManager: React.FC = () => {
    const [posts, setPosts] = useState<BlogPost[]>([]);
    const [loading, setLoading] = useState(true);
    const [status, setStatus] = useState('');
    const [editingPost, setEditingPost] = useState<BlogPost | null>(null);
    const [isCreating, setIsCreating] = useState(false);
    const { upload, uploading } = useCloudinaryUpload();
    const coverInputRef = useRef<HTMLInputElement>(null);

    const fetchPosts = async () => {
        setLoading(true);
        try {
            const res = await fetch('/api/blogs?full=0');
            const data = await res.json();
            setPosts(Array.isArray(data) ? data : []);
        } catch {
            setStatus('Failed to load posts');
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => { fetchPosts(); }, []);

    const showStatus = (msg: string) => {
        setStatus(msg);
        setTimeout(() => setStatus(''), 4000);
    };

    const handleNew = () => {
        setEditingPost({
            slug: '',
            title: '',
            date: new Date().toLocaleDateString('en-US', { year: 'numeric', month: 'long', day: 'numeric' }),
            excerpt: '',
            coverImage: '',
            category: 'General',
            author: 'PDFBullet Team',
            content: '<p>Write your article content here...</p>',
            published: true,
        });
        setIsCreating(true);
    };

    const handleEdit = async (slug: string) => {
        const res = await fetch(`/api/blogs?slug=${slug}&full=1`);
        const post = await res.json();
        setEditingPost(post);
        setIsCreating(false);
    };

    const handleSave = async () => {
        if (!editingPost) return;
        try {
            const method = isCreating ? 'POST' : 'PUT';
            const res = await fetch('/api/blogs', {
                method,
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify(editingPost),
            });
            if (!res.ok) {
                const err = await res.json();
                throw new Error(err.error || 'Save failed');
            }
            showStatus(`✅ Post ${isCreating ? 'created' : 'updated'} successfully!`);
            setEditingPost(null);
            await fetchPosts();
        } catch (e: any) {
            showStatus(`❌ ${e.message}`);
        }
    };

    const handleDelete = async (slug: string, title: string) => {
        if (!window.confirm(`Delete "${title}"? This cannot be undone.`)) return;
        const res = await fetch(`/api/blogs?slug=${slug}`, { method: 'DELETE' });
        if (res.ok) {
            showStatus('✅ Post deleted.');
            setPosts((prev) => prev.filter((p) => p.slug !== slug));
        } else {
            showStatus('❌ Delete failed.');
        }
    };

    const handleTogglePublish = async (post: BlogPost) => {
        const res = await fetch('/api/blogs', {
            method: 'PUT',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ ...post, published: !post.published }),
        });
        if (res.ok) {
            setPosts((prev) => prev.map((p) => p.slug === post.slug ? { ...p, published: !p.published } : p));
        }
    };

    const handleCoverUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
        const file = e.target.files?.[0];
        if (!file || !editingPost) return;
        const url = await upload(file, 'pdfbullet/blog-covers');
        setEditingPost((prev) => prev ? { ...prev, coverImage: url } : null);
    };

    if (editingPost) {
        return (
            <div className="space-y-6">
                <div className="flex items-center justify-between bg-white dark:bg-black border border-gray-100 dark:border-gray-800 rounded-2xl p-6 shadow-sm">
                    <div className="flex items-center gap-3">
                        <div className="p-3 bg-brand-red/10 text-brand-red rounded-xl">
                            <DocumentTextIcon className="h-6 w-6" />
                        </div>
                        <div>
                            <h2 className="text-2xl font-extrabold text-gray-800 dark:text-gray-100">{isCreating ? 'Write New Article' : 'Edit Article'}</h2>
                            <p className="text-sm text-gray-500 mt-1">{isCreating ? 'Create and publish a new blog post' : `Editing: ${editingPost.slug}`}</p>
                        </div>
                    </div>
                    <div className="flex items-center gap-3">
                        <button onClick={() => setEditingPost(null)} className="px-4 py-2.5 border border-gray-200 dark:border-gray-700 rounded-xl text-sm font-bold text-gray-500 hover:text-red-500 transition-all">Cancel</button>
                        <button onClick={handleSave} className="flex items-center gap-2 px-6 py-2.5 bg-brand-red text-white font-extrabold rounded-xl shadow-lg shadow-brand-red/20 text-sm">
                            <CheckCircleIcon className="h-4 w-4" /> {isCreating ? 'Publish Post' : 'Save Changes'}
                        </button>
                    </div>
                </div>

                {status && <div className={`p-3 rounded-xl text-sm font-bold text-center ${status.includes('❌') ? 'bg-red-50 text-red-600' : 'bg-green-50 text-green-600'}`}>{status}</div>}

                <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
                    {/* Main form */}
                    <div className="lg:col-span-2 space-y-5">
                        <SectionCard title="Article Content" icon={<DocumentTextIcon className="h-5 w-5" />}>
                            <Field label="Post Title">
                                <Input value={editingPost.title} onChange={(v) => setEditingPost((p) => p ? { ...p, title: v, slug: p.slug || v.toLowerCase().replace(/\s+/g, '-').replace(/[^a-z0-9-]/g, '') } : null)} placeholder="Your article title..." />
                            </Field>
                            <Field label="Excerpt / Short Description">
                                <Textarea value={editingPost.excerpt} onChange={(v) => setEditingPost((p) => p ? { ...p, excerpt: v } : null)} rows={2} placeholder="Short summary shown on blog list..." />
                            </Field>
                            <Field label="Full Content (HTML supported)" hint="Use standard HTML tags: <h2>, <p>, <ul>, <li>, <strong>, <em>, <img>, etc.">
                                <Textarea value={editingPost.content || ''} onChange={(v) => setEditingPost((p) => p ? { ...p, content: v } : null)} rows={20} monospace placeholder="<h2>Article Heading</h2><p>Your content here...</p>" />
                            </Field>
                        </SectionCard>
                    </div>

                    {/* Sidebar */}
                    <div className="space-y-5">
                        <SectionCard title="Post Settings" icon={<SettingsIcon className="h-5 w-5" />}>
                            <Field label="URL Slug" hint="Auto-generated from title. Must be unique.">
                                <Input value={editingPost.slug} onChange={(v) => setEditingPost((p) => p ? { ...p, slug: v } : null)} placeholder="url-slug-here" />
                            </Field>
                            <Field label="Publish Date">
                                <Input value={editingPost.date} onChange={(v) => setEditingPost((p) => p ? { ...p, date: v } : null)} placeholder="July 14, 2026" />
                            </Field>
                            <Field label="Author Name">
                                <Input value={editingPost.author || ''} onChange={(v) => setEditingPost((p) => p ? { ...p, author: v } : null)} />
                            </Field>
                            <Field label="Category">
                                <Input value={editingPost.category || ''} onChange={(v) => setEditingPost((p) => p ? { ...p, category: v } : null)} placeholder="General, Tutorial, News..." />
                            </Field>
                            <div className="flex items-center justify-between p-3 bg-gray-50 dark:bg-gray-900 rounded-xl border border-gray-200 dark:border-gray-800">
                                <span className="text-sm font-bold">Published</span>
                                <button
                                    onClick={() => setEditingPost((p) => p ? { ...p, published: !p.published } : null)}
                                    className={`relative w-12 h-6 rounded-full transition-colors ${editingPost.published ? 'bg-green-500' : 'bg-gray-300 dark:bg-gray-700'}`}
                                >
                                    <div className={`absolute top-1 w-4 h-4 bg-white rounded-full shadow transition-transform ${editingPost.published ? 'translate-x-7' : 'translate-x-1'}`} />
                                </button>
                            </div>
                        </SectionCard>

                        <SectionCard title="Cover Image" icon={<UploadCloudIcon className="h-5 w-5" />}>
                            <input ref={coverInputRef} type="file" accept="image/*" onChange={handleCoverUpload} className="hidden" />
                            {editingPost.coverImage && (
                                <div className="relative rounded-xl overflow-hidden h-40 mb-3 group">
                                    <img src={editingPost.coverImage} alt="cover" className="w-full h-full object-cover" />
                                    <button onClick={() => setEditingPost((p) => p ? { ...p, coverImage: '' } : null)}
                                        className="absolute top-2 right-2 p-1.5 bg-black/60 hover:bg-red-600 text-white rounded-lg opacity-0 group-hover:opacity-100 transition-all">
                                        <CloseIcon className="h-3 w-3" />
                                    </button>
                                </div>
                            )}
                            <button
                                onClick={() => coverInputRef.current?.click()}
                                disabled={uploading}
                                className="w-full flex items-center justify-center gap-2 px-4 py-4 border-2 border-dashed border-gray-300 dark:border-gray-700 hover:border-brand-red rounded-xl text-sm font-bold text-gray-500 hover:text-brand-red transition-all"
                            >
                                <UploadCloudIcon className="h-5 w-5" />
                                {uploading ? 'Uploading...' : 'Upload Cover to Cloudinary'}
                            </button>
                            <p className="text-[10px] text-gray-400 text-center">Or paste a URL below:</p>
                            <Input value={editingPost.coverImage || ''} onChange={(v) => setEditingPost((p) => p ? { ...p, coverImage: v } : null)} placeholder="https://..." />
                        </SectionCard>
                    </div>
                </div>
            </div>
        );
    }

    return (
        <div className="space-y-6">
            {/* Header */}
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 bg-white dark:bg-black border border-gray-100 dark:border-gray-800 rounded-2xl p-6 shadow-sm">
                <div className="flex items-center gap-3">
                    <div className="p-3 bg-brand-red/10 text-brand-red rounded-xl">
                        <NewspaperIcon className="h-6 w-6" />
                    </div>
                    <div>
                        <h2 className="text-2xl font-extrabold tracking-tight text-gray-800 dark:text-gray-100">
                            Blog Post Manager
                        </h2>
                        <p className="text-sm text-gray-500 mt-1">{posts.length} articles · Images stored on Cloudinary</p>
                    </div>
                </div>
                <div className="flex items-center gap-3">
                    <button onClick={fetchPosts} className="p-2.5 border border-gray-200 dark:border-gray-700 rounded-xl hover:bg-gray-50 dark:hover:bg-gray-900 transition-all">
                        <RefreshIcon className="h-5 w-5" />
                    </button>
                    <button onClick={handleNew} className="flex items-center gap-2 px-6 py-2.5 bg-brand-red text-white font-extrabold rounded-xl shadow-lg shadow-brand-red/20 text-sm">
                        <PlusIcon className="h-4 w-4" /> Write New Article
                    </button>
                </div>
            </div>

            {status && <div className={`p-3 rounded-xl text-sm font-bold text-center ${status.includes('❌') ? 'bg-red-50 text-red-600' : 'bg-green-50 text-green-600'}`}>{status}</div>}

            {/* Posts List */}
            <div className="bg-white dark:bg-black border border-gray-100 dark:border-gray-800 rounded-2xl shadow-sm overflow-hidden">
                {loading ? (
                    <div className="flex items-center justify-center py-20">
                        <RefreshIcon className="h-8 w-8 animate-spin text-brand-red" />
                    </div>
                ) : posts.length === 0 ? (
                    <div className="text-center py-20">
                        <p className="text-4xl mb-4">📝</p>
                        <p className="text-gray-500 font-semibold">No blog posts yet.</p>
                        <button onClick={handleNew} className="mt-4 px-6 py-2.5 bg-brand-red text-white font-bold rounded-xl text-sm">Write First Article</button>
                    </div>
                ) : (
                    <table className="w-full text-left">
                        <thead className="bg-gray-50/50 dark:bg-gray-900/50 text-[10px] font-bold text-gray-400 uppercase tracking-widest border-b border-gray-100 dark:border-gray-800">
                            <tr>
                                <th className="px-6 py-4">Article</th>
                                <th className="px-6 py-4">Category</th>
                                <th className="px-6 py-4">Date</th>
                                <th className="px-6 py-4 text-center">Status</th>
                                <th className="px-6 py-4 text-center">Actions</th>
                            </tr>
                        </thead>
                        <tbody className="divide-y divide-gray-50 dark:divide-gray-900">
                            {posts.map((post) => (
                                <tr key={post.slug} className="hover:bg-gray-50/50 dark:hover:bg-gray-900/30 transition-colors">
                                    <td className="px-6 py-4">
                                        <div className="flex items-center gap-4">
                                            {post.coverImage ? (
                                                <img src={post.coverImage} alt="" className="w-14 h-10 object-cover rounded-lg flex-shrink-0 border border-gray-100 dark:border-gray-800" />
                                            ) : (
                                                <div className="w-14 h-10 bg-gray-100 dark:bg-gray-800 rounded-lg flex items-center justify-center text-xl flex-shrink-0">📄</div>
                                            )}
                                            <div className="min-w-0">
                                                <p className="font-bold text-sm truncate max-w-xs">{post.title}</p>
                                                <p className="text-[10px] text-gray-400 font-mono">/{post.slug}</p>
                                            </div>
                                        </div>
                                    </td>
                                    <td className="px-6 py-4">
                                        <span className="text-xs font-bold bg-blue-50 dark:bg-blue-900/20 text-blue-600 dark:text-blue-400 px-2.5 py-1 rounded-full">{post.category || 'General'}</span>
                                    </td>
                                    <td className="px-6 py-4 text-xs text-gray-500 font-medium">{post.date}</td>
                                    <td className="px-6 py-4 text-center">
                                        <button onClick={() => handleTogglePublish(post)} className={`text-xs font-extrabold px-3 py-1.5 rounded-full transition-all ${post.published ? 'bg-green-100 text-green-700 dark:bg-green-900/30 dark:text-green-400' : 'bg-gray-100 text-gray-500 dark:bg-gray-800'}`}>
                                            {post.published ? 'Published' : 'Draft'}
                                        </button>
                                    </td>
                                    <td className="px-6 py-4">
                                        <div className="flex items-center justify-center gap-2">
                                            <button onClick={() => handleEdit(post.slug)} className="p-2 text-blue-500 hover:bg-blue-50 dark:hover:bg-blue-900/20 rounded-lg transition-all" title="Edit">
                                                <EditIcon className="h-4 w-4" />
                                            </button>
                                            <button onClick={() => handleDelete(post.slug, post.title)} className="p-2 text-red-400 hover:bg-red-50 dark:hover:bg-red-900/20 rounded-lg transition-all" title="Delete">
                                                <TrashIcon className="h-4 w-4" />
                                            </button>
                                        </div>
                                    </td>
                                </tr>
                            ))}
                        </tbody>
                    </table>
                )}
            </div>
        </div>
    );
};
