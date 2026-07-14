import React, { useState } from 'react';
import { useSignatureSettings, SignatureSettings } from '../hooks/useSignatureSettings.ts';
import { CheckCircleIcon, QrCodeIcon, TagIcon, EmailIcon, RefreshIcon, ProtectIcon, GlobeIcon, EditIcon, UsersIcon, CalendarIconSimple, KeyIcon } from '../components/icons.tsx';

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
        <div className={`p-6 border-b border-gray-200 dark:border-gray-700 last:border-b-0 ${children ? 'pb-4' : ''}`}>
            <div className="flex items-start gap-4">
                 <div className="flex-shrink-0 mt-1">
                    {checked ? <CheckCircleIcon className="h-6 w-6 text-green-500" /> : <Icon className="h-6 w-6 text-gray-500 dark:text-gray-400" /> }
                </div>
                <div className="flex-grow">
                    <div className="flex items-center gap-3">
                        <h3 className="font-bold text-gray-800 dark:text-gray-100">{title}</h3>
                        {isPremium && <span className="text-xs font-bold text-yellow-800 bg-yellow-300 px-2 py-0.5 rounded-full">Premium</span>}
                    </div>
                    <p className="text-sm text-gray-600 dark:text-gray-400 mt-1">{description}</p>
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


const SignatureSettingsPage: React.FC = () => {
    const { settings, setSettings } = useSignatureSettings();
    const [saveStatus, setSaveStatus] = useState<'idle' | 'saving' | 'saved'>('idle');

    const handleToggle = (key: keyof SignatureSettings) => {
        setSettings(prev => ({ ...prev, [key]: !prev[key] }));
    };
    
    const handleInputChange = (key: keyof SignatureSettings, value: string | number) => {
        setSettings(prev => ({...prev, [key]: value}));
    };

    const handleSave = () => {
        setSaveStatus('saving');
        setTimeout(() => {
            setSaveStatus('saved');
            setTimeout(() => setSaveStatus('idle'), 2000);
        }, 500);
    };

    return (
        <div className="w-full">
             <div className="flex justify-between items-center mb-6">
                <h1 className="text-3xl md:text-4xl font-extrabold text-gray-800 dark:text-gray-100">Settings</h1>
                <button
                    onClick={handleSave}
                    className="bg-brand-red hover:bg-brand-red-dark text-white font-bold py-2 px-6 rounded-md transition-colors w-28 h-10"
                >
                    {saveStatus === 'saved' ? 'Saved!' : saveStatus === 'saving' ? '...' : 'Save'}
                </button>
            </div>

            <div className="space-y-8">
                {/* First Card from screenshots */}
                <div className="bg-white dark:bg-surface-dark rounded-lg shadow-lg border border-gray-200 dark:border-gray-800 overflow-hidden">
                    <SettingsRow
                        Icon={KeyIcon}
                        title="UUID (recommended)"
                        description="Show the Unique Signer Identifier code that appears below the signatures to help validate the signature on the Audit Trail. It is recommended that you keep this activated, otherwise it lowers the legal weight of the end document."
                        checked={settings.uuid}
                        onChange={() => handleToggle('uuid')}
                    />
                     <SettingsRow
                        Icon={QrCodeIcon}
                        title="Signature verification code"
                        description="Digitally verify the integrity of the printed document using a QR code and a unique password that are provided in the Audit Trail."
                        checked={settings.verificationCode}
                        onChange={() => handleToggle('verificationCode')}
                    />
                     <SettingsRow
                        Icon={TagIcon}
                        title="Email branding"
                        description="Include the company name and logo in the signature request email. Both are required to apply your settings."
                        checked={settings.emailBranding}
                        onChange={() => handleToggle('emailBranding')}
                        isPremium
                    />
                </div>
                
                {/* Second Card from screenshots */}
                <div className="bg-white dark:bg-surface-dark rounded-lg shadow-lg border border-gray-200 dark:border-gray-800 overflow-hidden">
                     <SettingsRow
                        Icon={EmailIcon}
                        title="Enable email notifications"
                        description="You will receive an email notification when a receiver has completed their request."
                        checked={settings.emailNotifications}
                        onChange={() => handleToggle('emailNotifications')}
                    />
                    <SettingsRow
                        Icon={RefreshIcon}
                        title="Enable reminders"
                        description="Send a reminder to the participants every specified number of days."
                        checked={settings.reminders}
                        onChange={() => handleToggle('reminders')}
                    >
                       <div className="flex items-center gap-2 text-sm">
                           <span>Send a reminder to the participants every</span>
                           <input 
                            type="number" 
                            min="1"
                            value={settings.reminderFrequency} 
                            onChange={(e) => handleInputChange('reminderFrequency', parseInt(e.target.value) || 1)}
                            className="w-16 p-1 border border-gray-300 dark:border-gray-600 rounded-md bg-white dark:bg-gray-800 text-center"
                           />
                           <span>days.</span>
                       </div>
                    </SettingsRow>
                    <SettingsRow
                        Icon={ProtectIcon}
                        title="Digital Signature"
                        description="A signed Certified Hash and a Qualified Timestamp is embedded to the signed documents, ensuring the future integrity of the document and signature. Certified signatures are eIDAS, ESIGN & UETA compliant."
                        checked={settings.digitalSignature}
                        onChange={() => handleToggle('digitalSignature')}
                        isPremium
                    />
                     <SettingsRow
                        Icon={GlobeIcon}
                        title="Set language"
                        description={`Notifications will be sent in English.`}
                        checked={true}
                        onChange={() => {}} // Dummy, this is not a real toggle
                    />
                     <SettingsRow
                        Icon={EditIcon}
                        title="Customize the request email"
                        description="Edit the text you want to appear in the subject and body of the signature request email."
                        checked={settings.customizeEmail}
                        onChange={() => handleToggle('customizeEmail')}
                    />
                </div>

                {/* Third Card from screenshots */}
                 <div className="bg-white dark:bg-surface-dark rounded-lg shadow-lg border border-gray-200 dark:border-gray-800 overflow-hidden">
                      <SettingsRow
                        Icon={UsersIcon}
                        title="Set the order of receivers"
                        description="Select this option to set a signing order. A signer won't receive a request until the previous person has completed their document."
                        checked={settings.signingOrder}
                        onChange={() => handleToggle('signingOrder')}
                    />
                    <SettingsRow
                        Icon={CalendarIconSimple}
                        title="Change expiration date"
                        description={`The document will expire in ${settings.expirationDays} days.`}
                        checked={settings.expiration}
                        onChange={() => handleToggle('expiration')}
                    >
                        <div className="flex items-center gap-2 text-sm">
                           <span>The document will expire in</span>
                           <input 
                            type="number" 
                            min="1"
                            value={settings.expirationDays} 
                            onChange={(e) => handleInputChange('expirationDays', parseInt(e.target.value) || 1)}
                            className="w-16 p-1 border border-gray-300 dark:border-gray-600 rounded-md bg-white dark:bg-gray-800 text-center"
                           />
                           <span>days.</span>
                           <span className="text-gray-500 text-xs">(Expires on: {new Date(Date.now() + settings.expirationDays * 24 * 60 * 60 * 1000).toLocaleDateString()})</span>
                        </div>
                    </SettingsRow>
                    <SettingsRow
                        Icon={UsersIcon}
                        title="Multiple requests"
                        description="This option will allow each signer to receive a unique and separate request to sign individually."
                        checked={settings.multipleRequests}
                        onChange={() => handleToggle('multipleRequests')}
                        isPremium
                    />
                 </div>
            </div>
        </div>
    );
};

export default SignatureSettingsPage;