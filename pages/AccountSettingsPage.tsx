
import React, { useState, useEffect } from 'react';
import { useAuth } from '../contexts/AuthContext.tsx';
import { UserIcon, StarIcon, ApiIcon, WarningIcon } from '../components/icons.tsx';

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
    const { user, updateUserProfile, deleteCurrentUser } = useAuth();
    const [firstName, setFirstName] = useState('');
    const [lastName, setLastName] = useState('');
    const [country, setCountry] = useState('');
    const [isLoading, setIsLoading] = useState(false);
    const [message, setMessage] = useState('');

    useEffect(() => {
        if (user) {
            setFirstName(user.firstName || '');
            setLastName(user.lastName || '');
            setCountry(user.country || '');
        }
    }, [user]);

    const handleSave = async (e: React.FormEvent) => {
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
                // User will be logged out and redirected by AuthContext
            } catch (error) {
                alert('Failed to delete account. Please try again or contact support.');
            }
        }
    };

    return (
        <div className="w-full space-y-8">
            <h1 className="text-3xl md:text-4xl font-extrabold text-gray-800 dark:text-gray-100">My account</h1>
            
            {/* Personal Info */}
            <div className="bg-white dark:bg-surface-dark p-8 rounded-lg shadow-lg border border-gray-200 dark:border-gray-800">
                <h2 className="text-xl font-bold mb-4 flex items-center gap-2"><UserIcon className="h-6 w-6" /> Personal information</h2>
                <form onSubmit={handleSave} className="space-y-4">
                    <div className="grid md:grid-cols-2 gap-6">
                        <div>
                            <label htmlFor="firstName" className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">First name</label>
                            <input type="text" id="firstName" value={firstName} onChange={e => setFirstName(e.target.value)} className="w-full p-2 border rounded-md" />
                        </div>
                        <div>
                            <label htmlFor="lastName" className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">Last name</label>
                            <input type="text" id="lastName" value={lastName} onChange={e => setLastName(e.target.value)} className="w-full p-2 border rounded-md" />
                        </div>
                    </div>
                    <div>
                        <label htmlFor="country" className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">Country</label>
                        <select id="country" value={country} onChange={e => setCountry(e.target.value)} className="w-full p-2 border rounded-md">
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

            {/* Subscription */}
            <div className="bg-white dark:bg-surface-dark p-8 rounded-lg shadow-lg border border-gray-200 dark:border-gray-800">
                <h2 className="text-xl font-bold mb-4 flex items-center gap-2"><StarIcon className="h-6 w-6" /> Subscription</h2>
                <div className="flex justify-between items-center">
                    <p>You are on the <span className="font-bold">{user?.isPremium ? 'Premium' : 'Free'}</span> plan.</p>
                    <button className="text-brand-red font-semibold hover:underline">Manage subscription</button>
                </div>
            </div>

            {/* API Access */}
            <div className="bg-white dark:bg-surface-dark p-8 rounded-lg shadow-lg border border-gray-200 dark:border-gray-800">
                <h2 className="text-xl font-bold mb-4 flex items-center gap-2"><ApiIcon className="h-6 w-6" /> API Access</h2>
                <div className="flex justify-between items-center">
                    <p>Your API plan is: <span className="font-bold">{user?.apiPlan || 'free'}</span>.</p>
                    <button className="text-brand-red font-semibold hover:underline">Manage API Plan</button>
                </div>
            </div>

            {/* Danger Zone */}
            <div className="bg-white dark:bg-surface-dark p-8 rounded-lg shadow-lg border-2 border-red-500/50">
                <h2 className="text-xl font-bold text-red-600 dark:text-red-400 mb-4 flex items-center gap-2"><WarningIcon className="h-6 w-6" /> Danger Zone</h2>
                <div className="flex justify-between items-center">
                    <div>
                        <p className="font-semibold">Delete your account</p>
                        <p className="text-sm text-gray-500">Once you delete your account, there is no going back. Please be certain.</p>
                    </div>
                    <button onClick={handleDeleteAccount} className="bg-red-600 text-white font-bold py-2 px-4 rounded-md hover:bg-red-700">Delete My Account</button>
                </div>
            </div>
        </div>
    );
};
// FIX: Add default export to the component.
export default AccountSettingsPage;
