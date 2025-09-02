import React, { useState, useRef, useEffect } from 'react';
import html2canvas from 'html2canvas';
import { useAuth } from '../contexts/AuthContext.tsx';
import { UserIcon } from './icons.tsx';

interface SignatureModalProps {
    isOpen: boolean;
    onClose: () => void;
    onSave: (signatureDataUrl: string, initialsDataUrl: string) => void;
}

const SignatureModal: React.FC<SignatureModalProps> = ({ isOpen, onClose, onSave }) => {
    const { user } = useAuth();
    const [activeTab, setActiveTab] = useState<'signature' | 'initials' | 'stamp'>('signature');
    const [fullName, setFullName] = useState(user?.username || 'ilovepdfly');
    const [initials, setInitials] = useState('');

    const fonts = ['Pacifico', 'Dancing Script', 'Caveat', 'Great Vibes', 'Homemade Apple', 'Kalam'];
    const [selectedFont, setSelectedFont] = useState(fonts[0]);
    const [selectedColor, setSelectedColor] = useState('#000000');
    const colors = ['#000000', '#0D6EFD', '#DC3545', '#198754'];

    useEffect(() => {
        if (user?.username) {
            setFullName(user.username);
        }
    }, [user]);
    
    useEffect(() => {
        const words = fullName.trim().split(/\s+/);
        const first = words[0] ? words[0][0] : '';
        const last = words.length > 1 ? words[words.length - 1][0] : '';
        setInitials((first + last).toUpperCase());
    }, [fullName]);
    
    const generateImageFromText = async (text: string, font: string, color: string): Promise<string> => {
        if (!text) return '';
        const renderDiv = document.createElement('div');
        renderDiv.innerText = text;
        renderDiv.style.fontFamily = `'${font}', cursive`;
        renderDiv.style.color = color;
        renderDiv.style.fontSize = '96px';
        renderDiv.style.padding = '30px';
        renderDiv.style.display = 'inline-block';
        document.body.appendChild(renderDiv);
        
        try {
            const canvas = await html2canvas(renderDiv, { backgroundColor: null, scale: 2 });
            return canvas.toDataURL('image/png');
        } finally {
            document.body.removeChild(renderDiv);
        }
    };

    const handleApply = async () => {
        const signatureDataUrl = await generateImageFromText(fullName, selectedFont, selectedColor);
        const initialsDataUrl = await generateImageFromText(initials, selectedFont, selectedColor);
        onSave(signatureDataUrl, initialsDataUrl);
    };
    
    if (!isOpen) return null;

    return (
        <div className="fixed inset-0 bg-black/60 z-50 flex items-center justify-center p-4" onClick={onClose} role="dialog" aria-modal="true" aria-labelledby="signature-details-title">
            <div className="bg-white dark:bg-black w-full max-w-3xl rounded-lg shadow-xl overflow-hidden" onClick={e => e.stopPropagation()}>
                <div className="p-4 border-b border-gray-200 dark:border-gray-700">
                    <h2 id="signature-details-title" className="text-xl font-bold text-center text-gray-800 dark:text-gray-100">Set your signature details</h2>
                </div>
                <div className="p-6">
                    <div className="grid sm:grid-cols-2 gap-6">
                         <div>
                            <label htmlFor="full-name" className="block text-sm font-bold text-gray-700 dark:text-gray-300">Full name:</label>
                             <input
                                type="text"
                                id="full-name"
                                value={fullName}
                                onChange={e => setFullName(e.target.value)}
                                className="w-full mt-1 px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-md focus:ring-brand-red focus:border-brand-red text-gray-800 dark:text-gray-100 bg-white dark:bg-gray-900"
                            />
                        </div>
                        <div>
                            <label htmlFor="initials" className="block text-sm font-bold text-gray-700 dark:text-gray-300">Initials:</label>
                            <input
                                type="text"
                                id="initials"
                                value={initials}
                                readOnly
                                className="w-full mt-1 px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-md bg-gray-100 dark:bg-gray-800 text-gray-800 dark:text-gray-100"
                            />
                        </div>
                    </div>

                    <div className="mt-6 border-b border-gray-200 dark:border-gray-700">
                         <nav className="-mb-px flex space-x-6">
                            <button onClick={() => setActiveTab('signature')} className={`py-3 px-1 border-b-2 font-semibold text-sm ${activeTab === 'signature' ? 'border-brand-red text-brand-red' : 'border-transparent text-gray-500 hover:text-brand-red'}`}>Signature</button>
                            <button onClick={() => setActiveTab('initials')} className={`py-3 px-1 border-b-2 font-semibold text-sm ${activeTab === 'initials' ? 'border-brand-red text-brand-red' : 'border-transparent text-gray-500 hover:text-brand-red'}`}>Initials</button>
                            <button onClick={() => setActiveTab('stamp')} className={`py-3 px-1 border-b-2 font-semibold text-sm ${activeTab === 'stamp' ? 'border-brand-red text-brand-red' : 'border-transparent text-gray-500 hover:text-brand-red'}`}>Company Stamp</button>
                        </nav>
                    </div>

                    <div className="mt-4">
                        <div className="space-y-2 max-h-60 overflow-y-auto pr-2">
                            {fonts.map(font => (
                                <div key={font} className={`p-4 rounded-md border-2 ${selectedFont === font ? 'border-brand-red bg-red-50 dark:bg-red-900/20' : 'border-gray-200 dark:border-gray-700'}`}>
                                    <label className="flex items-center cursor-pointer">
                                        <input type="radio" name="signature-font" value={font} checked={selectedFont === font} onChange={() => setSelectedFont(font)} className="h-5 w-5 text-brand-red focus:ring-brand-red" />
                                        <div style={{ fontFamily: font, color: selectedColor }} className="ml-4 text-3xl text-gray-800 dark:text-gray-100">
                                            {activeTab === 'signature' ? (fullName || "Signature") : (initials || "IN")}
                                        </div>
                                    </label>
                                </div>
                            ))}
                        </div>
                         <div className="mt-4 flex items-center gap-4">
                            <span className="text-sm font-bold mr-3">Color:</span>
                            {colors.map(color => (
                                <button key={color} onClick={() => setSelectedColor(color)} className={`w-6 h-6 rounded-full border-2 transition-transform ${selectedColor === color ? 'border-brand-red scale-125' : 'border-transparent'}`} style={{backgroundColor: color}}></button>
                            ))}
                        </div>
                    </div>

                </div>
                <footer className="flex justify-end items-center gap-4 p-4 bg-gray-50 dark:bg-gray-900/50 rounded-b-lg">
                    <button onClick={onClose} className="text-sm font-semibold text-gray-600 dark:text-gray-300 hover:underline">Cancel</button>
                    <button onClick={handleApply} className="bg-brand-red hover:bg-brand-red-dark text-white font-bold py-2 px-6 rounded-md transition-colors">
                        Apply
                    </button>
                </footer>
            </div>
        </div>
    );
};

export default SignatureModal;
