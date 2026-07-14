import React, { useState, useEffect } from 'react';
import * as QRCode from 'qrcode';
import {
    CloseIcon, CopyIcon, CheckIcon, ShareIcon, FacebookIcon, XIcon, WhatsAppIcon, EmailIcon, PinterestIcon, RedditIcon, PlusIcon
} from './icons.tsx';

interface ShareModalProps {
    isOpen: boolean;
    onClose: () => void;
    url: string;
    title: string;
    coverUrl: string;
}

const ShareModal: React.FC<ShareModalProps> = ({ isOpen, onClose, url, title, coverUrl }) => {
    const [qrCodeDataUrl, setQrCodeDataUrl] = useState('');
    const [isCopiedLink, setIsCopiedLink] = useState(false);
    const [isCopiedEmbed, setIsCopiedEmbed] = useState(false);
    
    const encodedUrl = encodeURIComponent(url);
    const encodedTitle = encodeURIComponent(title);

    const socialLinks = [
        { name: 'Facebook', icon: FacebookIcon, href: `https://www.facebook.com/sharer/sharer.php?u=${encodedUrl}`, color: 'bg-blue-600' },
        { name: 'Twitter', icon: XIcon, href: `https://twitter.com/intent/tweet?url=${encodedUrl}&text=${encodedTitle}`, color: 'bg-black' },
        { name: 'Email', icon: EmailIcon, href: `mailto:?subject=${encodedTitle}&body=Check%20out%20this%20flipbook:%20${encodedUrl}`, color: 'bg-gray-500' },
        { name: 'WhatsApp', icon: WhatsAppIcon, href: `https://api.whatsapp.com/send?text=${encodedTitle}%20${encodedUrl}`, color: 'bg-green-500' },
        { name: 'Pinterest', icon: PinterestIcon, href: `https://pinterest.com/pin/create/button/?url=${encodedUrl}&media=${encodeURIComponent(coverUrl)}&description=${encodedTitle}`, color: 'bg-red-600' },
        { name: 'Reddit', icon: RedditIcon, href: `https://www.reddit.com/submit?url=${encodedUrl}&title=${encodedTitle}`, color: 'bg-orange-500' },
    ];

    const embedCode = `<iframe src="${url}?embed=true" width="800" height="600" frameborder="0" allow="fullscreen"></iframe>`;

    useEffect(() => {
        if (isOpen) {
            setIsCopiedEmbed(false);
            setIsCopiedLink(false);
            QRCode.toDataURL(url, { width: 160, margin: 2, errorCorrectionLevel: 'H' })
                .then(setQrCodeDataUrl)
                .catch(err => console.error('Failed to generate QR code', err));
        }
    }, [isOpen, url]);

    if (!isOpen) return null;

    const copyToClipboard = (text: string, type: 'link' | 'embed') => {
        navigator.clipboard.writeText(text).then(() => {
            if (type === 'link') setIsCopiedLink(true);
            if (type === 'embed') setIsCopiedEmbed(true);
            setTimeout(() => {
                setIsCopiedLink(false);
                setIsCopiedEmbed(false);
            }, 2000);
        });
    };

    return (
        <div className="fixed inset-0 bg-black/60 z-[110] flex items-center justify-center p-4 animate-fade-in-down" style={{animationDuration: '300ms'}} onClick={onClose}>
            <div className="bg-slate-100 dark:bg-slate-800 w-full max-w-2xl rounded-xl shadow-xl" onClick={e => e.stopPropagation()}>
                <div className="p-4 border-b border-slate-200 dark:border-slate-700 flex justify-between items-center">
                    <h2 className="text-xl font-bold text-gray-800 dark:text-gray-100 flex items-center gap-2"><ShareIcon className="h-5 w-5"/> Share</h2>
                    <button onClick={onClose} className="p-1 rounded-full hover:bg-slate-200 dark:hover:bg-slate-700"><CloseIcon className="h-6 w-6" /></button>
                </div>
                <div className="p-6 grid md:grid-cols-2 gap-6">
                    <div className="flex flex-col items-center justify-center text-center">
                        {qrCodeDataUrl ? (
                            <img src={qrCodeDataUrl} alt="QR Code" className="w-40 h-40 rounded-lg border-4 border-white" />
                        ) : (
                            <div className="w-40 h-40 bg-gray-200 animate-pulse rounded-lg"></div>
                        )}
                        <p className="mt-2 text-sm font-semibold text-gray-700 dark:text-gray-300">Scan QR Code</p>
                    </div>
                    <div className="space-y-4">
                        <div>
                            <h3 className="font-semibold mb-2 text-gray-800 dark:text-gray-100">Share it:</h3>
                            <div className="flex flex-wrap gap-3">
                                {socialLinks.map(link => (
                                    <a key={link.name} href={link.href} target="_blank" rel="noopener noreferrer" title={`Share on ${link.name}`} className={`w-10 h-10 rounded-full flex items-center justify-center text-white transition-transform hover:scale-110 ${link.color}`}>
                                        <link.icon className="h-5 w-5" />
                                    </a>
                                ))}
                                 <button onClick={() => alert("More share options coming soon!")} className="w-10 h-10 rounded-full flex items-center justify-center text-white transition-transform hover:scale-110 bg-gray-400">
                                    <PlusIcon className="h-5 w-5" />
                                </button>
                            </div>
                        </div>
                        <div>
                            <div className="relative">
                                <input type="text" readOnly value={url} className="w-full bg-white text-gray-900 dark:bg-gray-800 dark:text-gray-200 p-2 pr-20 rounded-md border border-slate-300 dark:border-slate-600 text-sm" />
                                <button onClick={() => copyToClipboard(url, 'link')} className="absolute right-1 top-1/2 -translate-y-1/2 px-3 py-1 bg-gray-600 text-white rounded-md text-sm font-semibold hover:bg-gray-700">
                                    {isCopiedLink ? 'Copied!' : 'Copy'}
                                </button>
                            </div>
                        </div>
                         <div>
                             <div className="relative">
                                <textarea readOnly value={embedCode} rows={3} className="w-full bg-white text-gray-900 dark:bg-gray-800 dark:text-gray-200 p-2 pr-20 rounded-md border border-slate-300 dark:border-slate-600 font-mono text-xs share-modal-textarea" />
                                <button onClick={() => copyToClipboard(embedCode, 'embed')} className="absolute right-1 top-1 px-3 py-1 bg-gray-600 text-white rounded-md text-sm font-semibold hover:bg-gray-700">
                                    {isCopiedEmbed ? 'Copied!' : 'Copy'}
                                </button>
                             </div>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
};

export default ShareModal;
