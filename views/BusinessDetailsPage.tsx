import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { useAuth } from '../contexts/AuthContext.tsx';
import { StarIcon } from '../components/icons.tsx';
import type { BusinessDetails } from '../contexts/AuthContext.tsx';

// List of countries for the dropdown
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

// Define components outside of the main component to prevent re-creation on render.
const DetailRow: React.FC<{ label: string, value: string | undefined }> = ({ label, value }) => (
    <div className="py-3">
        <span className="text-sm text-gray-500 dark:text-gray-400">{label}</span>
        <p className="font-semibold text-gray-800 dark:text-gray-100 mt-1">{value || '-'}</p>
    </div>
);

const EditRow: React.FC<{ label: string; name: keyof Omit<BusinessDetails, 'country'>; value: string; onChange: (e: React.ChangeEvent<HTMLInputElement>) => void; }> = ({ label, name, value, onChange }) => (
    <div className="py-2">
        <label htmlFor={name} className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">{label}</label>
        <input
            type="text"
            id={name}
            name={name}
            value={value}
            onChange={onChange}
            className="w-full px-3 py-2 bg-gray-50 dark:bg-gray-800 border border-gray-300 dark:border-gray-600 rounded-md focus:ring-brand-red focus:border-brand-red"
        />
    </div>
);

const initialDetails: BusinessDetails = {
  companyName: '',
  vatId: '',
  country: '',
  stateProvince: '',
  city: '',
  address: '',
  zipCode: '',
};

const BusinessDetailsPage: React.FC = () => {
    const { user, updateBusinessDetails, loading } = useAuth();
    const [isEditing, setIsEditing] = useState(false);
    const [formState, setFormState] = useState<BusinessDetails>(initialDetails);
    const [isSaving, setIsSaving] = useState(false);
    const [message, setMessage] = useState('');

    useEffect(() => {
        if (user) {
            const userDetails = user.businessDetails;
            setFormState(userDetails || initialDetails);
            // If there are no business details at all, start in editing mode.
            if (!userDetails) {
                setIsEditing(true);
            }
        }
    }, [user]);

    const handleInputChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>) => {
        const { name, value } = e.target;
        setFormState(prevState => ({
            ...prevState,
            [name]: value,
        }));
    };

    const handleSave = async (e: React.FormEvent) => {
        e.preventDefault();
        setIsSaving(true);
        setMessage('');
        try {
            await updateBusinessDetails(formState);
            setMessage('Details saved successfully!');
            setIsEditing(false);
            setTimeout(() => setMessage(''), 3000);
        } catch (error) {
            setMessage('Failed to save details.');
        } finally {
            setIsSaving(false);
        }
    };

    const handleCancel = () => {
        // Reset form to original state
        setFormState(user?.businessDetails || initialDetails);
        // Only exit edit mode if there were details to begin with
        if (user?.businessDetails) {
            setIsEditing(false);
        }
    };

    return (
        <div className="w-full">
            <div className="flex justify-between items-center mb-8">
                <h1 className="text-3xl md:text-4xl font-extrabold text-gray-800 dark:text-gray-100">Business details</h1>
                 <Link
                    to="/pricing"
                    className="bg-yellow-400 hover:bg-yellow-500 text-yellow-900 font-bold py-2 px-4 rounded-md flex items-center gap-2 transition-colors text-sm"
                >
                    <StarIcon className="h-5 w-5" />
                    <span>Upgrade to Premium</span>
                </Link>
            </div>

            <div className="bg-white dark:bg-surface-dark p-8 rounded-lg shadow-lg border border-gray-200 dark:border-gray-800">
                <div className="flex justify-between items-center mb-4">
                    <h2 className="text-xl font-bold">Billing details</h2>
                    {!isEditing && user?.businessDetails && (
                        <button onClick={() => setIsEditing(true)} className="text-brand-red font-semibold hover:underline">
                            Change
                        </button>
                    )}
                </div>
                <p className="text-sm text-gray-500 dark:text-gray-400 mb-6">
                    Invoices will be issued with your Billing information
                </p>

                {loading ? (
                    <p>Loading details...</p>
                ) : isEditing ? (
                    <form onSubmit={handleSave} className="space-y-4">
                        <EditRow label="Company name" name="companyName" value={formState.companyName} onChange={handleInputChange} />
                        <EditRow label="VAT ID" name="vatId" value={formState.vatId} onChange={handleInputChange} />
                        <div className="py-2">
                            <label htmlFor="country" className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">Country</label>
                            <select
                                id="country"
                                name="country"
                                value={formState.country}
                                onChange={handleInputChange}
                                className="w-full px-3 py-2 bg-gray-50 dark:bg-gray-800 border border-gray-300 dark:border-gray-600 rounded-md focus:ring-brand-red focus:border-brand-red"
                            >
                                <option value="">Select a country</option>
                                {countries.map(c => (
                                    <option key={c.code} value={c.name}>{c.flag} {c.name}</option>
                                ))}
                            </select>
                        </div>
                        <EditRow label="State/Province" name="stateProvince" value={formState.stateProvince} onChange={handleInputChange} />
                        <EditRow label="City" name="city" value={formState.city} onChange={handleInputChange} />
                        <EditRow label="Address" name="address" value={formState.address} onChange={handleInputChange} />
                        <EditRow label="Zip Code" name="zipCode" value={formState.zipCode} onChange={handleInputChange} />
                        
                        <div className="flex justify-end gap-4 pt-4">
                            {user?.businessDetails && (
                                <button type="button" onClick={handleCancel} className="bg-gray-200 dark:bg-gray-700 font-semibold py-2 px-6 rounded-lg">
                                    Cancel
                                </button>
                            )}
                            <button type="submit" disabled={isSaving} className="bg-brand-red text-white font-semibold py-2 px-6 rounded-lg disabled:bg-red-300">
                                {isSaving ? 'Saving...' : 'Save'}
                            </button>
                        </div>
                    </form>
                ) : (
                    <div className="divide-y divide-gray-200 dark:divide-gray-700">
                        <DetailRow label="Company name:" value={user?.businessDetails?.companyName} />
                        <DetailRow label="VAT ID:" value={user?.businessDetails?.vatId} />
                        <DetailRow label="Country:" value={user?.businessDetails?.country} />
                        <DetailRow label="State/Province:" value={user?.businessDetails?.stateProvince} />
                        <DetailRow label="City:" value={user?.businessDetails?.city} />
                        <DetailRow label="Address:" value={user?.businessDetails?.address} />
                        <DetailRow label="Zip Code:" value={user?.businessDetails?.zipCode} />
                    </div>
                )}
                 {message && <p className={`mt-4 text-sm font-semibold ${message.includes('successfully') ? 'text-green-600' : 'text-red-500'}`}>{message}</p>}
            </div>
        </div>
    );
};

export default BusinessDetailsPage;
