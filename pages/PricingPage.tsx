import React, { useState, useEffect } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useAuth } from '../contexts/AuthContext.tsx';

// Icons
const CheckIcon: React.FC<{ className?: string }> = ({ className }) => (
    <svg className={className} xmlns="http://www.w3.org/2000/svg" viewBox="0 0 20 20" fill="currentColor">
        <path fillRule="evenodd" d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z" clipRule="evenodd" />
    </svg>
);

const MinusIcon: React.FC<{ className?: string }> = ({ className }) => (
    <svg className={className} xmlns="http://www.w3.org/2000/svg" viewBox="0 0 20 20" fill="currentColor">
        <path fillRule="evenodd" d="M3 10a1 1 0 011-1h12a1 1 0 110 2H4a1 1 0 01-1-1z" clipRule="evenodd" />
    </svg>
);

// FAQ Component
const FaqItem: React.FC<{
    item: { question: string, answer: string },
    isOpen: boolean,
    toggle: () => void,
}> = ({ item, isOpen, toggle }) => (
    <div className="border-t border-gray-200 dark:border-gray-700">
        <button onClick={toggle} className="w-full flex justify-between items-center text-left py-5 focus:outline-none">
            <h3 className="text-base font-semibold text-gray-800 dark:text-gray-100">{item.question}</h3>
            <div className={`transform transition-transform duration-300 ${isOpen ? 'rotate-180' : ''}`}>
                 <svg className="w-5 h-5 text-gray-500" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M19 9l-7 7-7-7" /></svg>
            </div>
        </button>
        <div className={`overflow-hidden transition-all duration-300 ease-in-out ${isOpen ? 'max-h-96 pb-5' : 'max-h-0'}`}>
            <p className="text-gray-600 dark:text-gray-400 leading-relaxed pr-4">{item.answer}</p>
        </div>
    </div>
);

// Feature Component for comparison table
const Feature: React.FC<{ children: React.ReactNode }> = ({ children }) => (
    <div className="flex items-center gap-3">
        <CheckIcon className="h-5 w-5 text-green-500 flex-shrink-0" />
        <span>{children}</span>
    </div>
);

const NoFeature: React.FC<{ children: React.ReactNode }> = ({ children }) => (
     <div className="flex items-center gap-3 text-gray-400">
        <MinusIcon className="h-5 w-5 flex-shrink-0" />
        <span>{children}</span>
    </div>
);

// Main Pricing Page Component
const PricingPage: React.FC = () => {
    const [openFaq, setOpenFaq] = useState<number | null>(0);
    const { user } = useAuth();
    const navigate = useNavigate();

    const faqData = [
      {
        question: "How do I pay for a plan?",
        answer: "We currently accept payments through the Fonepay digital wallet. On the payment page, you will find a QR code to scan and complete the payment. After paying, you'll need to upload a screenshot of the transaction confirmation."
      },
      {
        question: "What happens after I pay?",
        answer: "After you upload your payment screenshot and contact our support via WhatsApp, we will verify your payment and activate your plan, usually within a few minutes."
      },
       {
        question: "How long does it take to get Premium access after payment?",
        answer: "Account activation is usually very fast. After you send your payment proof to our support on WhatsApp, we will verify it and activate your Premium plan, typically within a few minutes to an hour."
      },
      {
        question: "What if I pay but don't get access?",
        answer: "This is very rare, but if it happens, please contact us immediately on WhatsApp with your payment details and username. Our support team is available to resolve any issues quickly and ensure you get the access you paid for."
      },
      {
        question: "Can I get a refund?",
        answer: "Due to the nature of digital services and the one-time payment structure, we generally do not offer refunds. We recommend starting with our free plan to ensure our tools meet your needs before purchasing."
      },
    ];

    useEffect(() => {
        document.title = "Pricing Plans | I Love PDFLY";
        const metaDesc = document.querySelector('meta[name="description"]');
        if (metaDesc) {
            metaDesc.setAttribute("content", "Choose the perfect plan for your needs. From our free Basic plan to Premium and Pro, unlock more features and unlimited processing with I Love PDFLY.");
        }
    }, []);

    const handleChoosePlan = (plan: string) => {
        if (user) {
            navigate('/payment', { state: { plan } });
        } else {
            navigate('/signup', { state: { from: 'pricing', plan } });
        }
    };

    const toggleFaq = (index: number) => {
        setOpenFaq(openFaq === index ? null : index);
    };
    
    // Detailed User Plans
    const userPlans = [
        { 
            name: 'Basic', 
            price: 'Free', 
            description: 'For simple, occasional use',
            features: {
                "Document Processing": "Limited tasks per day",
                "File Size": "Standard",
                "Access to Standard Tools": <Feature>Merge, Split, Basic Compress, JPG to PDF, Word to PDF</Feature>,
                "Premium Tools": <NoFeature>Edit, OCR, Sign, Compare, etc.</NoFeature>,
                "Work on Web, Mobile & Desktop": <NoFeature>Web only</NoFeature>,
                "Ads": "Contains Ads",
                "Sign PDF": <NoFeature>Not available</NoFeature>,
                "Workflows": <NoFeature>Not available</NoFeature>,
                "AI Assistant": "Limited queries",
                "Customer Support": <NoFeature>Community support</NoFeature>,
            },
            action: () => navigate('/signup'),
            actionText: 'Start for free',
            isPopular: false,
        },
        { 
            name: 'Premium', 
            price: '$5/year', 
            description: 'For advanced, regular use',
            features: {
                "Document Processing": "Unlimited tasks",
                "File Size": "Increased",
                "Access to Standard Tools": <Feature>All standard tools</Feature>,
                "Premium Tools": <Feature>Full access to all tools (Edit, OCR, etc.)</Feature>,
                "Work on Web, Mobile & Desktop": <Feature>All platforms</Feature>,
                "Ads": <NoFeature>No Ads</NoFeature>,
                "Sign PDF": <Feature>Simple Signatures (5/month)</Feature>,
                "Workflows": <Feature>Up to 5 custom workflows</Feature>,
                "AI Assistant": "Standard access",
                "Customer Support": <Feature>Email & Chat support</Feature>,
            },
            action: () => handleChoosePlan('premium'),
            actionText: 'Go Premium',
            isPopular: true,
        },
        { 
            name: 'Pro', 
            price: '$10/lifetime', 
            description: 'For power users and teams',
             features: {
                "Document Processing": "Unlimited tasks with priority",
                "File Size": "Largest",
                "Access to Standard Tools": <Feature>All standard tools</Feature>,
                "Premium Tools": <Feature>Full access to all tools</Feature>,
                "Work on Web, Mobile & Desktop": <Feature>All platforms with offline access</Feature>,
                "Ads": <NoFeature>No Ads</NoFeature>,
                "Sign PDF": <Feature>Advanced Signatures & Audit Trail (20/month)</Feature>,
                "Workflows": <Feature>Unlimited custom workflows</Feature>,
                "AI Assistant": "Unlimited queries",
                "Customer Support": <Feature>Priority support</Feature>,
            },
            action: () => handleChoosePlan('pro'),
            actionText: 'Go Pro',
            isPopular: false,
        }
    ];

    const allUserFeatureKeys = Object.keys(userPlans[0].features);

    return (
        <div className="py-16 md:py-24 bg-gray-50 dark:bg-black">
            <div className="container mx-auto px-6">
                <div className="max-w-4xl mx-auto text-center mb-12">
                    <h1 className="text-4xl md:text-5xl font-extrabold text-gray-800 dark:text-gray-100">Choose the plan that suits you</h1>
                    <p className="mt-4 text-lg text-gray-600 dark:text-gray-300">
                        Start for free and scale up as you grow. Powerful tools for individuals and developers.
                    </p>
                </div>
                 <section className="text-center mb-12">
                    <h2 className="text-2xl font-bold mb-4">How to Upgrade in 3 Easy Steps</h2>
                    <div className="flex flex-col md:flex-row justify-center items-center gap-4 md:gap-8 text-gray-600 dark:text-gray-300">
                        <div className="flex items-center gap-3 p-2">
                            <div className="flex items-center justify-center w-10 h-10 rounded-full bg-brand-red text-white font-bold text-lg">1</div>
                            <span>Scan Fonepay QR</span>
                        </div>
                        <div className="text-gray-300 dark:text-gray-600 transform rotate-90 md:rotate-0">&rarr;</div>
                        <div className="flex items-center gap-3 p-2">
                            <div className="flex items-center justify-center w-10 h-10 rounded-full bg-brand-red text-white font-bold text-lg">2</div>
                            <span>Upload Screenshot</span>
                        </div>
                        <div className="text-gray-300 dark:text-gray-600 transform rotate-90 md:rotate-0">&rarr;</div>
                        <div className="flex items-center gap-3 p-2">
                            <div className="flex items-center justify-center w-10 h-10 rounded-full bg-brand-red text-white font-bold text-lg">3</div>
                            <span>Confirm via WhatsApp</span>
                        </div>
                    </div>
                </section>
                <div className="flex justify-center mb-12">
                    <div className="p-1 bg-gray-200 dark:bg-gray-800 rounded-full flex gap-1">
                        <button className={`px-6 py-2 text-sm font-semibold rounded-full transition-colors bg-white dark:bg-black text-brand-red`}>User Plans</button>
                        <Link to="/api-pricing" className={`px-6 py-2 text-sm font-semibold rounded-full transition-colors text-gray-600 dark:text-gray-300`}>API Plans</Link>
                    </div>
                </div>

                 <div className="max-w-7xl mx-auto animate-fade-in-down">
                    <div className="hidden lg:grid lg:grid-cols-4 gap-8">
                        <div className="pt-20"> {/* Empty corner */}
                            <ul>
                                {allUserFeatureKeys.map(key => <li key={key} className="h-14 flex items-center font-semibold">{key}</li>)}
                            </ul>
                        </div>
                        {userPlans.map(plan => (
                            <div key={plan.name} className={`p-8 text-center rounded-lg ${plan.isPopular ? 'bg-red-50 dark:bg-red-900/10' : ''}`}>
                                <h2 className={`text-2xl font-bold ${plan.isPopular ? 'text-brand-red' : ''}`}>{plan.name}</h2>
                                <p className="text-4xl font-extrabold my-4">{plan.price}</p>
                                <p className="text-gray-500 dark:text-gray-400 mb-6 h-12">{plan.description}</p>
                                <button onClick={plan.action} className={`w-full text-center mt-auto font-bold py-3 px-6 rounded-lg ${plan.isPopular ? 'bg-brand-red hover:bg-brand-red-dark text-white' : 'bg-white dark:bg-gray-800 border border-brand-red text-brand-red hover:bg-red-50 dark:hover:bg-brand-red/10'}`}>
                                    {plan.actionText}
                                </button>
                                <ul className="mt-8 space-y-3">
                                     {allUserFeatureKeys.map(key => <li key={key} className="h-14 flex items-center justify-center">{plan.features[key as keyof typeof plan.features]}</li>)}
                                </ul>
                            </div>
                        ))}
                    </div>
                    
                    {/* Mobile/Tablet view */}
                    <div className="grid grid-cols-1 md:grid-cols-3 gap-8 lg:hidden">
                         {userPlans.map(plan => (
                            <div key={plan.name} className={`bg-white dark:bg-black border rounded-lg p-8 flex flex-col relative ${plan.isPopular ? 'border-2 border-brand-red' : 'border-gray-200 dark:border-gray-800'}`}>
                                {plan.isPopular && <span className="absolute top-0 -translate-y-1/2 left-1/2 -translate-x-1/2 bg-brand-red text-white text-xs font-bold px-4 py-1 rounded-full uppercase tracking-wider">Most Popular</span>}
                                <h2 className={`text-2xl font-bold text-center ${plan.isPopular ? 'text-brand-red' : ''}`}>{plan.name}</h2>
                                <p className="text-4xl font-extrabold my-4 text-center">{plan.price}</p>
                                <p className="text-gray-500 dark:text-gray-400 mb-6 text-center h-12">{plan.description}</p>
                                <ul className="space-y-3 mb-8 flex-grow">
                                     {allUserFeatureKeys.map(key => <li key={key} className="border-t pt-3 first:border-t-0">{plan.features[key as keyof typeof plan.features]}</li>)}
                                </ul>
                                <button onClick={plan.action} className={`w-full text-center mt-auto font-bold py-3 px-6 rounded-lg ${plan.isPopular ? 'bg-brand-red hover:bg-brand-red-dark text-white' : 'bg-white dark:bg-gray-800 border border-brand-red text-brand-red hover:bg-red-50 dark:hover:bg-brand-red/10'}`}>
                                    {plan.actionText}
                                </button>
                            </div>
                        ))}
                    </div>

                </div>

                <section className="mt-16 md:mt-24">
                    <div className="max-w-4xl mx-auto">
                        <h2 className="text-3xl font-extrabold text-gray-800 dark:text-gray-100 text-center mb-8">Frequently Asked Questions</h2>
                         <div className="bg-white dark:bg-black p-6 rounded-lg shadow-lg border border-gray-200 dark:border-gray-800">
                            {faqData.map((faq, index) => (
                                <FaqItem
                                    key={index}
                                    item={faq}
                                    isOpen={openFaq === index}
                                    toggle={() => toggleFaq(index)}
                                />
                            ))}
                        </div>
                    </div>
                </section>
            </div>
        </div>
    );
};

export default PricingPage;
