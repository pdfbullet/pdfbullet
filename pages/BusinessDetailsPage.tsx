import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { useAuth } from '../contexts/AuthContext.tsx';
import { StarIcon } from '../components/icons.tsx';
import type { BusinessDetails } from '../contexts/AuthContext.tsx';

const initialDetails: BusinessDetails = {
  companyName: 'ilovepdfly',
  vatId: '',
  country: 'Nepal',
  stateProvince: '',
  city: '',
  address: '',
  zipCode: '',
};

const BusinessDetailsPage: React.FC = () => {
    const { user, updateBusinessDetails, loading } = useAuth();
    const [isEditing, setIsEditing] = useState(false);
    const [formState, setFormState] = useState<BusinessDetails>(user?.businessDetails || initialDetails);
    const [isSaving, setIsSaving] = useState(false);
    const [message, setMessage] = useState('');

    useEffect(() => {
        if (user) {
            setFormState(user.businessDetails || initialDetails);
        }
    }, [user]);

    const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
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
        setFormState(user?.businessDetails || initialDetails);
        setIsEditing(false);
    };
    
    const DetailRow: React.FC<{ label: string, value: string | undefined }> = ({ label, value }) => (
        <div className="flex justify-between py-3">
            <span className="text-gray-500 dark:text-gray-400">{label}</span>
            <span className="font-semibold text-gray-800 dark:text-gray-100">{value || '-'}</span>
        </div>
    );
    
    const EditRow: React.FC<{ label: string; name: keyof BusinessDetails; value: string; onChange: (e: React.ChangeEvent<HTMLInputElement>) => void; }> = ({ label, name, value, onChange }) => (
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
                    {!isEditing && (
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
                        <EditRow label="Country" name="country" value={formState.country} onChange={handleInputChange} />
                        <EditRow label="State/Province" name="stateProvince" value={formState.stateProvince} onChange={handleInputChange} />
                        <EditRow label="City" name="city" value={formState.city} onChange={handleInputChange} />
                        <EditRow label="Address" name="address" value={formState.address} onChange={handleInputChange} />
                        <EditRow label="Zip Code" name="zipCode" value={formState.zipCode} onChange={handleInputChange} />
                        
                        <div className="flex justify-end gap-4 pt-4">
                            <button type="button" onClick={handleCancel} className="bg-gray-200 dark:bg-gray-700 font-semibold py-2 px-6 rounded-lg">
                                Cancel
                            </button>
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
