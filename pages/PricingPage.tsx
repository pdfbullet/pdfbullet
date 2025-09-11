
import React, { useState, useEffect } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useAuth } from '../contexts/AuthContext.tsx';

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

const PricingPage: React.FC = () => {
    const [planType, setPlanType] = useState<'user' | 'api'>('user');
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

        const faqSchema = {
            "@context": "https://schema.org",
            "@type": "FAQPage",
            "mainEntity": faqData.map(faq => ({
                "@type": "Question",
                "name": faq.question,
                "acceptedAnswer": {
                    "@type": "Answer",
                    "text": faq.answer
                }
            }))
        };
        
        const scriptId = 'faq-schema-pricing';
        let script = document.getElementById(scriptId) as HTMLScriptElement | null;
        if (!script) {
            script = document.createElement('script');
            script.id = scriptId;
            script.type = 'application/ld+json';
            document.head.appendChild(script);
        }
        script.textContent = JSON.stringify(faqSchema);

        return () => {
            const scriptToRemove = document.getElementById(scriptId);
            if (scriptToRemove) {
                scriptToRemove.remove();
            }
        };
    }, [faqData]);

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
    
    const userPlans = {
        basic: { name: 'Basic', price: 'Free', features: ['Access to most tools', '100 uses per day', 'Work on Web'] },
        premium: { name: 'Premium', price: '$5/year', features: ['Full access to all tools', 'Unlimited document processing', 'Work on Web, Mobile and Desktop', 'No Ads', 'Customer support'] },
        pro: { name: 'Pro', price: '$10/lifetime', features: ['All Premium features', 'Largest file size limits', 'Unlimited AI Assistant queries', 'Dedicated servers for faster processing', 'Priority customer support'] }
    };
    
    const apiPlans = {
        free: { name: 'Free', price: '$0/month', features: ['100 API calls/day', 'Access to standard tools', 'Community support'] },
        developer: { name: 'Developer', price: '$10/month', features: ['1,000 API calls/day', 'Access to all tools', 'Email support', 'No "Powered by" branding'] },
        business: { name: 'Business', price: '$50/month', features: ['10,000 API calls/day', 'Access to all tools', 'Priority email & chat support', 'Custom integrations available'] }
    };

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
                        <button onClick={() => setPlanType('user')} className={`px-6 py-2 text-sm font-semibold rounded-full transition-colors ${planType === 'user' ? 'bg-white dark:bg-black text-brand-red' : 'text-gray-600 dark:text-gray-300'}`}>User Plans</button>
                        <button onClick={() => setPlanType('api')} className={`px-6 py-2 text-sm font-semibold rounded-full transition-colors ${planType === 'api' ? 'bg-white dark:bg-black text-brand-red' : 'text-gray-600 dark:text-gray-300'}`}>API Plans</button>
                    </div>
                </div>

                {planType === 'user' && (
                    <div className="grid grid-cols-1 md:grid-cols-3 gap-8 max-w-6xl mx-auto animate-fade-in-down">
                        <div className="bg-white dark:bg-black border border-gray-200 dark:border-gray-800 rounded-lg p-8 flex flex-col animated-border">
                            <h2 className="text-2xl font-bold">{userPlans.basic.name}</h2>
                            <p className="text-4xl font-extrabold my-4">{userPlans.basic.price}</p>
                            <p className="text-gray-500 dark:text-gray-400 mb-6">For simple, occasional use</p>
                            <ul className="space-y-3 mb-8 flex-grow">
                                {userPlans.basic.features.map(f => <li key={f} className="flex items-center gap-3"><CheckIcon className="h-5 w-5 text-green-500" /><span>{f}</span></li>)}
                            </ul>
                            <Link to="/signup" className="w-full text-center mt-auto bg-white dark:bg-gray-800 border border-brand-red text-brand-red font-bold py-3 px-6 rounded-lg hover:bg-red-50 dark:hover:bg-brand-red/10">Start for free</Link>
                        </div>
                        <div className="bg-white dark:bg-black border-2 border-brand-red rounded-lg p-8 flex flex-col relative animated-border">
                            <span className="absolute top-0 right-0 bg-brand-red text-white text-xs font-bold px-8 py-1 rounded-bl-lg">Most Popular</span>
                            <h2 className="text-2xl font-bold text-brand-red">{userPlans.premium.name}</h2>
                            <p className="text-4xl font-extrabold my-4">{userPlans.premium.price}</p>
                            <p className="text-gray-500 dark:text-gray-400 mb-6">For advanced, regular use</p>
                            <ul className="space-y-3 mb-8 flex-grow">
                                {userPlans.premium.features.map(f => <li key={f} className="flex items-center gap-3"><CheckIcon className="h-5 w-5 text-green-500" /><span>{f}</span></li>)}
                            </ul>
                            <button onClick={() => handleChoosePlan('premium')} className="w-full text-center mt-auto bg-brand-red hover:bg-brand-red-dark text-white font-bold py-3 px-6 rounded-lg">Go Premium</button>
                        </div>
                        <div className="bg-white dark:bg-black border border-gray-200 dark:border-gray-800 rounded-lg p-8 flex flex-col animated-border">
                            <h2 className="text-2xl font-bold text-blue-600">{userPlans.pro.name}</h2>
                            <p className="text-4xl font-extrabold my-4">{userPlans.pro.price}</p>
                            <p className="text-gray-500 dark:text-gray-400 mb-6">For power users and teams</p>
                            <ul className="space-y-3 mb-8 flex-grow">
                                {userPlans.pro.features.map(f => <li key={f} className="flex items-center gap-3"><CheckIcon className="h-5 w-5 text-green-500" /><span>{f}</span></li>)}
                            </ul>
                            <button onClick={() => handleChoosePlan('pro')} className="w-full text-center mt-auto bg-blue-600 hover:bg-blue-700 text-white font-bold py-3 px-6 rounded-lg">Go Pro</button>
                        </div>
                    </div>
                )}
                
                 {planType === 'api' && (
                    <div className="grid grid-cols-1 md:grid-cols-3 gap-8 max-w-6xl mx-auto animate-fade-in-down">
                        <div className="bg-white dark:bg-black border border-gray-200 dark:border-gray-800 rounded-lg p-8 flex flex-col animated-border">
                            <h2 className="text-2xl font-bold">{apiPlans.free.name}</h2>
                            <p className="text-4xl font-extrabold my-4">{apiPlans.free.price}</p>
                            <p className="text-gray-500 dark:text-gray-400 mb-6">For testing and personal projects</p>
                            <ul className="space-y-3 mb-8 flex-grow">
                                {apiPlans.free.features.map(f => <li key={f} className="flex items-center gap-3"><CheckIcon className="h-5 w-5 text-green-500" /><span>{f}</span></li>)}
                            </ul>
                            <Link to="/developer" className="w-full text-center mt-auto bg-white dark:bg-gray-800 border border-brand-red text-brand-red font-bold py-3 px-6 rounded-lg hover:bg-red-50 dark:hover:bg-brand-red/10">Get Started</Link>
                        </div>
                        <div className="bg-white dark:bg-black border-2 border-brand-red rounded-lg p-8 flex flex-col relative animated-border">
                             <span className="absolute top-0 right-0 bg-brand-red text-white text-xs font-bold px-8 py-1 rounded-bl-lg">Recommended</span>
                            <h2 className="text-2xl font-bold text-brand-red">{apiPlans.developer.name}</h2>
                            <p className="text-4xl font-extrabold my-4">{apiPlans.developer.price}</p>
                            <p className="text-gray-500 dark:text-gray-400 mb-6">For production applications</p>
                            <ul className="space-y-3 mb-8 flex-grow">
                                {apiPlans.developer.features.map(f => <li key={f} className="flex items-center gap-3"><CheckIcon className="h-5 w-5 text-green-500" /><span>{f}</span></li>)}
                            </ul>
                            <button onClick={() => handleChoosePlan('api-developer')} className="w-full text-center mt-auto bg-brand-red hover:bg-brand-red-dark text-white font-bold py-3 px-6 rounded-lg">Choose Developer</button>
                        </div>
                        <div className="bg-white dark:bg-black border border-gray-200 dark:border-gray-800 rounded-lg p-8 flex flex-col animated-border">
                            <h2 className="text-2xl font-bold text-blue-600">{apiPlans.business.name}</h2>
                            <p className="text-4xl font-extrabold my-4">{apiPlans.business.price}</p>
                            <p className="text-gray-500 dark:text-gray-400 mb-6">For large-scale applications</p>
                            <ul className="space-y-3 mb-8 flex-grow">
                                {apiPlans.business.features.map(f => <li key={f} className="flex items-center gap-3"><CheckIcon className="h-5 w-5 text-green-500" /><span>{f}</span></li>)}
                            </ul>
                            <button onClick={() => handleChoosePlan('api-business')} className="w-full text-center mt-auto bg-blue-600 hover:bg-blue-700 text-white font-bold py-3 px-6 rounded-lg">Choose Business</button>
                        </div>
                    </div>
                )}

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
