
import React, { useState } from 'react';
import {
    CloseIcon, FacebookIcon, XIcon, EmailIcon, WhatsAppIcon,
    CopyIcon, CheckIcon
} from './icons.tsx';

interface ToolShareModalProps {
    isOpen: boolean;
    onClose: () => void;
    qrCodeUrl: string;
    shareableUrl: string;
    fileName: string;
}

const ToolShareModal: React.FC<ToolShareModalProps> = ({
    isOpen, onClose, qrCodeUrl, shareableUrl, fileName
}) => {
    const [isLinkCopied, setIsLinkCopied] = useState(false);
    const [isEmbedCopied, setIsEmbedCopied] = useState(false);

    if (!isOpen) return null;

    const handleCopyLink = () => {
        navigator.clipboard.writeText(shareableUrl).then(() => {
            setIsLinkCopied(true);
            setTimeout(() => setIsLinkCopied(false), 2000);
        });
    };

    const embedCode = `<iframe src="${shareableUrl}" width="100%" height="600px" frameborder="0"></iframe>`;

    const handleCopyEmbed = () => {
        navigator.clipboard.writeText(embedCode).then(() => {
            setIsEmbedCopied(true);
            setTimeout(() => setIsEmbedCopied(false), 2000);
        });
    };

    const socialLinks = {
        facebook: `https://www.facebook.com/sharer/sharer.php?u=${encodeURIComponent(shareableUrl)}`,
        twitter: `https://twitter.com/intent/tweet?url=${encodeURIComponent(shareableUrl)}&text=${encodeURIComponent('Check out this document: ' + fileName)}`,
        email: `mailto:?subject=${encodeURIComponent(fileName)}&body=${encodeURIComponent(shareableUrl)}`,
        whatsapp: `https://api.whatsapp.com/send?text=${encodeURIComponent(fileName + ': ' + shareableUrl)}`
    };

    return (
        <div className="fixed inset-0 z-[100] flex items-center justify-center p-4 sm:p-6 lg:p-8 overflow-y-auto">
            <div className="fixed inset-0 bg-black/60 backdrop-blur-sm transition-opacity" onClick={onClose}></div>

            <div className="relative bg-white dark:bg-gray-900 rounded-2xl shadow-2xl w-full max-w-4xl overflow-hidden transition-all transform animate-in fade-in zoom-in duration-300">
                {/* Header */}
                <div className="flex items-center justify-between px-6 py-4 border-b border-gray-100 dark:border-gray-800">
                    <h3 className="text-xl font-bold text-gray-900 dark:text-white">Share Document</h3>
                    <button
                        onClick={onClose}
                        className="p-2 border border-gray-200 dark:border-gray-700 rounded-full text-gray-500 hover:bg-gray-50 dark:hover:bg-gray-800 transition-colors"
                    >
                        <CloseIcon className="h-5 w-5" />
                    </button>
                </div>

                <div className="p-6 lg:p-8">
                    <div className="grid lg:grid-cols-12 gap-8 items-start">
                        {/* QR Code Section */}
                        <div className="lg:col-span-5 flex flex-col items-center">
                            <div className="relative bg-white border-8 border-gray-50 dark:border-gray-800 rounded-3xl p-4 shadow-inner mb-4 w-full aspect-square flex items-center justify-center">
                                {qrCodeUrl ? (
                                    <img src={qrCodeUrl} alt="QR Code" className="w-full h-full object-contain rounded-lg" />
                                ) : (
                                    <div className="animate-pulse bg-gray-100 dark:bg-gray-800 w-full h-full rounded-lg flex items-center justify-center">
                                        <div className="w-12 h-12 border-4 border-brand-red border-t-transparent rounded-full animate-spin"></div>
                                    </div>
                                )}
                            </div>
                            <span className="text-sm font-semibold text-gray-500 dark:text-gray-400 uppercase tracking-widest">Scan QR Code</span>
                        </div>

                        {/* Social & Links Section */}
                        <div className="lg:col-span-7 space-y-8">
                            {/* Share to Social */}
                            <div>
                                <h4 className="text-xs font-bold text-gray-400 dark:text-gray-500 uppercase tracking-widest mb-4">Share to Social</h4>
                                <div className="flex flex-wrap gap-4">
                                    <a href={socialLinks.facebook} target="_blank" rel="noopener noreferrer" className="w-12 h-12 flex items-center justify-center rounded-xl bg-[#1877F2] text-white hover:scale-110 hover:shadow-lg transition-all" title="Share on Facebook">
                                        <FacebookIcon className="h-6 w-6" />
                                    </a>
                                    <a href={socialLinks.twitter} target="_blank" rel="noopener noreferrer" className="w-12 h-12 flex items-center justify-center rounded-xl bg-black text-white hover:scale-110 hover:shadow-lg transition-all" title="Share on X">
                                        <XIcon className="h-6 w-6" />
                                    </a>
                                    <a href={socialLinks.email} className="w-12 h-12 flex items-center justify-center rounded-xl bg-[#EA4335] text-white hover:scale-110 hover:shadow-lg transition-all" title="Share via Email">
                                        <EmailIcon className="h-6 w-6" />
                                    </a>
                                    <a href={socialLinks.whatsapp} target="_blank" rel="noopener noreferrer" className="w-12 h-12 flex items-center justify-center rounded-xl bg-[#25D366] text-white hover:scale-110 hover:shadow-lg transition-all" title="Share on WhatsApp">
                                        <WhatsAppIcon className="h-6 w-6" />
                                    </a>
                                </div>
                            </div>

                            {/* Direct Link */}
                            <div>
                                <h4 className="text-xs font-bold text-gray-400 dark:text-gray-500 uppercase tracking-widest mb-2">Direct Link</h4>
                                <div className="relative group">
                                    <input
                                        type="url"
                                        readOnly
                                        value={shareableUrl}
                                        className="w-full bg-gray-50 dark:bg-gray-800/50 border border-gray-200 dark:border-gray-700 rounded-xl px-4 py-4 pr-24 text-sm font-medium focus:outline-none focus:ring-2 focus:ring-brand-red dark:text-white"
                                    />
                                    <button
                                        onClick={handleCopyLink}
                                        className="absolute right-2 top-2 bottom-2 px-6 rounded-lg bg-brand-red text-white text-sm font-bold shadow-md hover:bg-brand-red-dark transition-all flex items-center gap-2 transform active:scale-95"
                                    >
                                        {isLinkCopied ? (
                                            <>
                                                <CheckIcon className="h-4 w-4" />
                                                <span>Copied</span>
                                            </>
                                        ) : (
                                            <>
                                                <CopyIcon className="h-4 w-4" />
                                                <span>Copy</span>
                                            </>
                                        )}
                                    </button>
                                </div>
                            </div>

                            {/* Embed Code */}
                            <div>
                                <h4 className="text-xs font-bold text-gray-400 dark:text-gray-500 uppercase tracking-widest mb-2">Embed Code</h4>
                                <div className="relative group">
                                    <textarea
                                        readOnly
                                        value={embedCode}
                                        rows={3}
                                        className="w-full bg-gray-50 dark:bg-gray-800/50 border border-gray-200 dark:border-gray-700 rounded-xl px-4 py-4 pr-32 text-xs font-mono resize-none focus:outline-none focus:ring-2 focus:ring-blue-500 dark:text-gray-300"
                                    ></textarea>
                                    <button
                                        onClick={handleCopyEmbed}
                                        className="absolute right-2 top-2 px-4 py-2 rounded-lg bg-[#001E3C] text-white text-[10px] font-bold shadow-md hover:bg-black transition-all flex items-center gap-1.5"
                                    >
                                        {isEmbedCopied ? (
                                            <>
                                                <CheckIcon className="h-3 w-3" />
                                                <span>Code Copied</span>
                                            </>
                                        ) : (
                                            <>
                                                <CopyIcon className="h-3 w-3" />
                                                <span>Copy Code</span>
                                            </>
                                        )}
                                    </button>
                                </div>
                            </div>
                        </div>
                    </div>
                </div>

                {/* Footer / Tip */}
                <div className="bg-gray-50 dark:bg-gray-800/30 px-6 py-4 text-center">
                    <p className="text-xs text-gray-500 dark:text-gray-400">
                        Documents shared via link are available for <span className="font-bold text-gray-700 dark:text-gray-300 text-brand-red">2 hours</span> only.
                    </p>
                </div>
            </div>
        </div>
    );
};

export default ToolShareModal;
