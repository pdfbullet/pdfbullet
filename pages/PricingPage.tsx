import React, { useState, useEffect } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useAuth } from '../contexts/AuthContext.tsx';
import { CheckIcon, MinusIcon, StarIcon } from '../components/icons.tsx';

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
        answer: "Due to the nature of digital services and the one-time payment structure, we generally do not offer refunds. We recommend starting with our free plan or the 7-day free trial to ensure our tools meet your needs before purchasing."
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
    
    const plans = {
        basic: { name: 'Basic', price: 'Free', features: ['Access to most tools', 'Limited document processing', 'Work on Web'] },
        premium: { name: 'Premium', price: '$5/year', features: ['Full access to all tools', 'Unlimited document processing', 'Work on Web, Mobile and Desktop', 'No Ads', 'Customer support'] },
        pro: { name: 'Pro', price: '$10/lifetime', features: ['All Premium features', 'Largest file size limits', 'Unlimited AI Assistant queries', 'Dedicated servers for faster processing', 'Priority customer support'] }
    };

    const featureComparison = [
        { feature: 'Access to standard tools', basic: true, premium: true, pro: true },
        { feature: 'Access to Premium tools', basic: false, premium: true, pro: true },
        { feature: 'Document processing per day', basic: 'Limited', premium: 'Unlimited', pro: 'Unlimited' },
        { feature: 'File size limits', basic: 'Standard', premium: 'Large', pro: 'Largest' },
        { feature: 'Ads', basic: true, premium: false, pro: false },
        { feature: 'Work on Web', basic: true, premium: true, pro: true },
        { feature: 'Work on Desktop & Mobile', basic: false, premium: true, pro: true },
        { feature: 'AI Assistant Queries', basic: 'Limited', premium: 'Standard', pro: 'Unlimited' },
        { feature: 'Customer Support', basic: false, premium: true, pro: 'Priority' },
        { feature: 'Team Features', basic: false, premium: false, pro: true },
    ];


    return (
        <div className="py-16 md:py-24 bg-gray-50 dark:bg-black">
            <div className="container mx-auto px-6">
                <div className="max-w-4xl mx-auto text-center mb-12">
                    <h1 className="text-4xl md:text-5xl font-extrabold text-gray-800 dark:text-gray-100">Choose the plan that suits you</h1>
                    <p className="mt-4 text-lg text-gray-600 dark:text-gray-300">
                        Start for free and scale up as you grow. Powerful tools for individuals and teams.
                    </p>
                </div>
                
                 <div className="mb-12 p-6 bg-gradient-to-r from-red-500 to-orange-500 text-white rounded-xl shadow-lg text-center">
                    <h2 className="text-2xl font-bold">Try Premium for Free!</h2>
                    <p className="mt-2">New users get a 7-day free trial of all Premium features. No credit card required.</p>
                    <Link to="/signup" className="mt-4 inline-block bg-white text-brand-red font-bold py-2 px-6 rounded-full hover:bg-gray-100 transition-colors">
                        Start Free Trial
                    </Link>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-3 gap-8 max-w-6xl mx-auto animate-fade-in-down">
                    <div className="bg-white dark:bg-black border border-gray-200 dark:border-gray-800 rounded-lg p-8 flex flex-col animated-border">
                        <h2 className="text-2xl font-bold">{plans.basic.name}</h2>
                        <p className="text-4xl font-extrabold my-4">{plans.basic.price}</p>
                        <p className="text-gray-500 dark:text-gray-400 mb-6">For simple, occasional use</p>
                        <ul className="space-y-3 mb-8 flex-grow">
                            {plans.basic.features.map(f => <li key={f} className="flex items-center gap-3"><CheckIcon className="h-5 w-5 text-green-500" /><span>{f}</span></li>)}
                        </ul>
                        <Link to="/signup" className="w-full text-center mt-auto bg-white dark:bg-gray-800 border border-brand-red text-brand-red font-bold py-3 px-6 rounded-lg hover:bg-red-50 dark:hover:bg-brand-red/10">Start for free</Link>
                    </div>
                    <div className="bg-white dark:bg-black border-2 border-brand-red rounded-lg p-8 flex flex-col relative animated-border">
                        <span className="absolute top-0 right-0 bg-brand-red text-white text-xs font-bold px-8 py-1 rounded-bl-lg">Most Popular</span>
                        <h2 className="text-2xl font-bold text-brand-red">{plans.premium.name}</h2>
                        <p className="text-4xl font-extrabold my-4">{plans.premium.price}</p>
                        <p className="text-gray-500 dark:text-gray-400 mb-6">For advanced, regular use</p>
                        <ul className="space-y-3 mb-8 flex-grow">
                            {plans.premium.features.map(f => <li key={f} className="flex items-center gap-3"><CheckIcon className="h-5 w-5 text-green-500" /><span>{f}</span></li>)}
                        </ul>
                        <button onClick={() => handleChoosePlan('premium')} className="w-full text-center mt-auto bg-brand-red hover:bg-brand-red-dark text-white font-bold py-3 px-6 rounded-lg">Go Premium</button>
                    </div>
                    <div className="bg-white dark:bg-black border border-gray-200 dark:border-gray-800 rounded-lg p-8 flex flex-col animated-border">
                        <h2 className="text-2xl font-bold text-blue-600">{plans.pro.name}</h2>
                        <p className="text-4xl font-extrabold my-4">{plans.pro.price}</p>
                        <p className="text-gray-500 dark:text-gray-400 mb-6">For power users and teams</p>
                        <ul className="space-y-3 mb-8 flex-grow">
                            {plans.pro.features.map(f => <li key={f} className="flex items-center gap-3"><CheckIcon className="h-5 w-5 text-green-500" /><span>{f}</span></li>)}
                        </ul>
                        <button onClick={() => handleChoosePlan('pro')} className="w-full text-center mt-auto bg-blue-600 hover:bg-blue-700 text-white font-bold py-3 px-6 rounded-lg">Go Pro</button>
                    </div>
                </div>

                <section className="mt-16 md:mt-24">
                     <h2 className="text-3xl font-extrabold text-gray-800 dark:text-gray-100 text-center mb-8">Feature Comparison</h2>
                     <div className="max-w-6xl mx-auto overflow-x-auto rounded-lg border border-gray-200 dark:border-gray-800">
                         <table className="w-full min-w-[700px] text-sm text-left bg-white dark:bg-black">
                            <thead className="bg-gray-50 dark:bg-gray-900/50">
                                <tr>
                                    <th className="px-6 py-4 font-bold text-lg">Features</th>
                                    <th className="px-6 py-4 font-bold text-center text-lg">Basic</th>
                                    <th className="px-6 py-4 font-bold text-center text-lg text-brand-red">Premium</th>
                                    <th className="px-6 py-4 font-bold text-center text-lg text-blue-600">Pro</th>
                                </tr>
                            </thead>
                            <tbody className="divide-y divide-gray-200 dark:divide-gray-800">
                                {featureComparison.map(item => (
                                    <tr key={item.feature}>
                                        <td className="px-6 py-4 font-semibold text-gray-800 dark:text-gray-100">{item.feature}</td>
                                        <td className="px-6 py-4 text-center">{typeof item.basic === 'boolean' ? (item.basic ? <CheckIcon className="h-5 w-5 text-green-500 mx-auto" /> : <MinusIcon className="h-5 w-5 text-red-400 mx-auto" />) : item.basic}</td>
                                        <td className="px-6 py-4 text-center">{typeof item.premium === 'boolean' ? (item.premium ? <CheckIcon className="h-5 w-5 text-green-500 mx-auto" /> : <MinusIcon className="h-5 w-5 text-red-400 mx-auto" />) : item.premium}</td>
                                        <td className="px-6 py-4 text-center">{typeof item.pro === 'boolean' ? (item.pro ? <CheckIcon className="h-5 w-5 text-green-500 mx-auto" /> : <MinusIcon className="h-5 w-5 text-red-400 mx-auto" />) : item.pro}</td>
                                    </tr>
                                ))}
                            </tbody>
                         </table>
                     </div>
                </section>

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
