import React from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useAuth } from '../contexts/AuthContext.tsx';
import { CheckIcon, MinusIcon, ApiIcon } from '../components/icons.tsx';

const ApiPricingPage: React.FC = () => {
    const { user } = useAuth();
    const navigate = useNavigate();

    const handleChoosePlan = (plan: string) => {
        if (user) {
            navigate('/payment', { state: { plan } });
        } else {
            navigate('/signup', { state: { from: 'pricing', plan } });
        }
    };

    const plans = [
        { 
            name: 'Free', 
            price: '$0',
            period: '/month',
            description: 'For testing and personal projects',
            features: {
                "API Calls": "100 / day",
                "Basic PDF & Image Tools": true,
                "Premium PDF & Image Tools": false,
                "Signature API": false,
                "File Size Limit": "Standard",
                "Processing Speed": "Standard",
                "Support": "Community",
                "No 'Powered By' Branding": false,
            },
            actionText: 'Get Started',
            action: () => navigate('/developer'),
            isPopular: false
        },
        { 
            name: 'Developer',
            price: '$10',
            period: '/month',
            description: 'For production applications',
            features: {
                "API Calls": "1,000 / day",
                "Basic PDF & Image Tools": true,
                "Premium PDF & Image Tools": true,
                "Signature API": false,
                "File Size Limit": "Increased",
                "Processing Speed": "Fast",
                "Support": "Email Support",
                "No 'Powered By' Branding": true,
            },
            actionText: 'Choose Developer',
            action: () => handleChoosePlan('api-developer'),
            isPopular: true
        },
        { 
            name: 'Business',
            price: '$50',
            period: '/month',
            description: 'For large-scale applications',
            features: {
                "API Calls": "10,000 / day",
                "Basic PDF & Image Tools": true,
                "Premium PDF & Image Tools": true,
                "Signature API": true,
                "File Size Limit": "Largest",
                "Processing Speed": "Priority",
                "Support": "Priority Email & Chat",
                "No 'Powered By' Branding": true,
            },
            actionText: 'Choose Business',
            action: () => handleChoosePlan('api-business'),
            isPopular: false
        }
    ];

    const allFeatureKeys = Object.keys(plans[0].features);

    return (
        <div className="py-16 md:py-24 bg-gray-50 dark:bg-black">
            <div className="container mx-auto px-6">
                <div className="max-w-4xl mx-auto text-center mb-12">
                    <ApiIcon className="h-16 w-16 mx-auto text-brand-red mb-4" />
                    <h1 className="text-4xl md:text-5xl font-extrabold text-gray-800 dark:text-gray-100">API Pricing Plans</h1>
                    <p className="mt-4 text-lg text-gray-600 dark:text-gray-300">
                        Powerful, scalable, and reliable API plans to integrate our tools into your workflow.
                    </p>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-3 gap-8 max-w-6xl mx-auto animate-fade-in-down">
                    {plans.map(plan => (
                        <div key={plan.name} className={`bg-white dark:bg-black border rounded-lg p-8 flex flex-col relative ${plan.isPopular ? 'border-2 border-brand-red' : 'border-gray-200 dark:border-gray-800'}`}>
                            {plan.isPopular && <span className="absolute top-0 -translate-y-1/2 left-1/2 -translate-x-1/2 bg-brand-red text-white text-xs font-bold px-4 py-1 rounded-full uppercase tracking-wider">Recommended</span>}
                            <h2 className="text-2xl font-bold">{plan.name}</h2>
                            <div className="my-4">
                                <span className="text-4xl font-extrabold">{plan.price}</span>
                                <span className="text-gray-500 dark:text-gray-400">{plan.period}</span>
                            </div>
                            <p className="text-gray-500 dark:text-gray-400 mb-6 h-10">{plan.description}</p>
                            <ul className="space-y-3 mb-8 flex-grow">
                                {allFeatureKeys.map(key => {
                                    const featureValue = plan.features[key as keyof typeof plan.features];
                                    return (
                                        <li key={key} className="flex items-start gap-3 text-left">
                                            {typeof featureValue === 'boolean' ? (
                                                featureValue ? <CheckIcon className="h-5 w-5 text-green-500 flex-shrink-0 mt-0.5" /> : <MinusIcon className="h-5 w-5 text-gray-400 flex-shrink-0 mt-0.5" />
                                            ) : (
                                                <CheckIcon className="h-5 w-5 text-green-500 flex-shrink-0 mt-0.5" />
                                            )}
                                            <span>
                                                {key === 'API Calls' ? <strong className="text-gray-800 dark:text-white">{featureValue}</strong> : key}
                                                {key !== 'API Calls' && typeof featureValue !== 'boolean' && <span className="block text-xs text-gray-500">{featureValue}</span>}
                                            </span>
                                        </li>
                                    );
                                })}
                            </ul>
                            <button onClick={plan.action} className={`w-full text-center mt-auto font-bold py-3 px-6 rounded-lg transition-colors ${plan.isPopular ? 'bg-brand-red hover:bg-brand-red-dark text-white' : 'bg-white dark:bg-gray-800 border border-brand-red text-brand-red hover:bg-red-50 dark:hover:bg-brand-red/10'}`}>
                                {plan.actionText}
                            </button>
                        </div>
                    ))}
                </div>

                <div className="mt-16 text-center bg-white dark:bg-black p-8 rounded-lg shadow-lg border border-gray-200 dark:border-gray-800 max-w-4xl mx-auto">
                    <h3 className="text-2xl font-bold">Need a custom Enterprise plan?</h3>
                    <p className="text-gray-600 dark:text-gray-400 mt-2">We can create a tailored plan for your specific needs, including higher rate limits, dedicated infrastructure, and premium support.</p>
                    <Link to="/contact" className="mt-6 inline-block font-semibold bg-gray-800 dark:bg-gray-200 text-white dark:text-black py-3 px-8 rounded-lg hover:opacity-90">Contact Sales</Link>
                </div>

            </div>
        </div>
    );
};

export default ApiPricingPage;
