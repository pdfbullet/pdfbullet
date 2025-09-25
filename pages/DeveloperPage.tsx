import React, { useState, useEffect, useRef } from 'react';
import { useAuth } from '../contexts/AuthContext.tsx';
import { Link } from 'react-router-dom';
import { KeyIcon, CopyIcon, DollarIcon, ApiIcon, CheckIcon, BookOpenIcon, ChartBarIcon, QuestionMarkIcon, GavelIcon, CodeIcon, RefreshIcon } from '../components/icons.tsx';

const CodeBlock: React.FC<{ children: React.ReactNode, language?: string }> = ({ children, language }) => (
    <pre className="bg-gray-100 dark:bg-gray-800 p-4 rounded-md overflow-x-auto text-sm text-left my-4 relative group">
        <code className={`font-mono language-${language}`}>{children}</code>
    </pre>
);

const DeveloperPage: React.FC = () => {
    const { user, generateApiKey, getApiUsage } = useAuth();
    const [apiKey, setApiKey] = useState('');
    const [usage, setUsage] = useState<{ count: number; limit: number; resetsIn: string } | null>(null);
    const [isLoading, setIsLoading] = useState(true);
    const [error, setError] = useState('');
    const [copied, setCopied] = useState(false);
    const [generationStep, setGenerationStep] = useState(1);
    const [agreedToTerms, setAgreedToTerms] = useState(false);
    const [projectDescription, setProjectDescription] = useState('');

    const sections = {
        dashboard: useRef<HTMLDivElement>(null),
        documentation: useRef<HTMLDivElement>(null),
        pricing: useRef<HTMLDivElement>(null),
        faq: useRef<HTMLDivElement>(null),
    };
    const [activeSection, setActiveSection] = useState('dashboard');

    useEffect(() => {
        document.title = "Developer API | PDFBullet";
        if (user) {
            const userApiKey = user.apiKey || '';
            setApiKey(userApiKey);
            if (userApiKey) {
                setGenerationStep(5); // User already has a key, show dashboard
            }
            getApiUsage()
                .then(setUsage)
                .catch(() => setError('Could not fetch API usage.'))
                .finally(() => setIsLoading(false));
        } else {
            setIsLoading(false);
        }
    }, [user, getApiUsage]);
    
    useEffect(() => {
        const observer = new IntersectionObserver((entries) => {
            entries.forEach(entry => {
                if (entry.isIntersecting) {
                    setActiveSection(entry.target.id);
                }
            });
        }, { rootMargin: "-40% 0px -60% 0px", threshold: 0 });

        const currentRefs = Object.values(sections).map(ref => ref.current).filter(Boolean);
        currentRefs.forEach(ref => observer.observe(ref!));

        return () => {
            currentRefs.forEach(ref => observer.unobserve(ref!));
        };
    }, []);

    const handleGenerateKey = async () => {
        setIsLoading(true);
        setError('');
        try {
            const newKey = await generateApiKey();
            setApiKey(newKey);
            getApiUsage().then(setUsage);
            setGenerationStep(5); // Move to dashboard
        } catch (err: any) {
            setError(err.message || 'Failed to generate API key.');
            setGenerationStep(4); // Go back to generation step on error
        } finally {
            setIsLoading(false);
        }
    };

    const handleCopy = () => {
        if (!apiKey) return;
        navigator.clipboard.writeText(apiKey).then(() => {
            setCopied(true);
            setTimeout(() => setCopied(false), 2000);
        });
    };
    
    const scrollTo = (ref: React.RefObject<HTMLDivElement>) => {
        ref.current?.scrollIntoView({ behavior: 'smooth', block: 'start' });
    };

    const sidebarLinks = [
        { id: 'dashboard', name: 'Dashboard', icon: ChartBarIcon, ref: sections.dashboard },
        { id: 'documentation', name: 'Documentation', icon: BookOpenIcon, ref: sections.documentation },
        { id: 'pricing', name: 'Pricing', icon: DollarIcon, ref: sections.pricing },
        { id: 'faq', name: 'FAQ', icon: QuestionMarkIcon, ref: sections.faq },
    ];

    return (
        <div className="bg-gray-50 dark:bg-black">
            <div className="relative bg-teal-800 h-[60vh] text-white">
                <img 
                    src="https://ik.imagekit.io/fonepay/imgi_25_home.png?updatedAt=1753968278321" 
                    alt="Abstract teal background" 
                    className="absolute inset-0 w-full h-full object-cover opacity-30"
                    width="1920"
                    height="1280"
                    loading="lazy"
                    decoding="async"
                />
                <div className="relative z-10 h-full flex flex-col items-center justify-center text-center px-6">
                    <h1 className="text-4xl md:text-5xl font-extrabold">All our tools in a REST API for developers</h1>
                    <p className="mt-4 max-w-2xl text-lg text-gray-200">Whether you are a small startup or a large business, PDFBullet API is here to help you automate document processes.</p>
                    <div className="mt-6 flex flex-wrap justify-center items-center gap-x-4 gap-y-2 text-sm font-semibold">
                        <Link to="/api-pdf" className="hover:underline">PHP</Link>
                        <span>-</span>
                        <Link to="/api-pdf" className="hover:underline">.NET</Link>
                        <span>-</span>
                        <Link to="/api-pdf" className="hover:underline">RUBY</Link>
                        <span>-</span>
                        <Link to="/api-pdf" className="hover:underline">NODE.JS</Link>
                        <span>-</span>
                        <Link to="/api-reference" className="hover:underline uppercase">API Reference</Link>
                    </div>
                    <div className="mt-8">
                        <button onClick={() => scrollTo(sections.dashboard)} className="bg-white text-teal-800 font-bold py-3 px-8 rounded-md hover:bg-gray-200 transition-colors">Get started</button>
                    </div>
                </div>
            </div>

            <div className="px-6 py-12 relative z-10 -mt-24">
                <div className="lg:flex lg:gap-12">
                    <aside className="w-full lg:w-64 lg:sticky lg:top-24 self-start mb-8 lg:mb-0">
                        <nav className="space-y-2 bg-white/80 dark:bg-black/70 backdrop-blur-sm p-4 rounded-xl border border-gray-200 dark:border-gray-800">
                            {sidebarLinks.map(link => (
                                <button key={link.id} onClick={() => scrollTo(link.ref)} className={`w-full flex items-center gap-3 p-3 rounded-lg text-sm font-semibold transition-colors ${activeSection === link.id ? 'bg-brand-red/10 text-brand-red' : 'hover:bg-gray-100 dark:hover:bg-gray-800'}`}>
                                    <link.icon className="h-5 w-5" />
                                    {link.name}
                                </button>
                            ))}
                        </nav>
                    </aside>

                    <main className="w-full lg:flex-grow space-y-24">
                        <section ref={sections.dashboard} id="dashboard" className="scroll-mt-24">
                            <h2 className="text-3xl font-extrabold text-gray-800 dark:text-gray-100 mb-6">API Dashboard</h2>
                            <div className="bg-white dark:bg-black border border-gray-200 dark:border-gray-800 rounded-xl shadow-lg p-8 animated-border">
                                {isLoading ? <p>Loading dashboard...</p> : !user ? (
                                    <div className="text-center">
                                        <p className="text-lg text-gray-600 dark:text-gray-300">Please log in or create an account to get your API key.</p>
                                        <div className="mt-6 flex justify-center gap-4">
                                            <Link to="/login" state={{ from: '/developer' }} className="font-semibold text-brand-red hover:underline">Log In</Link>
                                            <Link to="/signup" state={{ from: '/developer' }} className="bg-brand-red hover:bg-brand-red-dark text-white font-bold py-2 px-4 rounded-md">Sign Up</Link>
                                        </div>
                                    </div>
                                ) : (
                                    <div>
                                        {generationStep === 1 && <div className="text-center">
                                            <h3 className="text-xl font-bold">Step 1: Agree to Terms</h3>
                                            <p className="mt-2 text-gray-600 dark:text-gray-400">Review and agree to our API terms of use to proceed.</p>
                                            <div className="my-4 p-4 text-left text-xs h-24 overflow-y-auto bg-gray-100 dark:bg-gray-800 rounded-md border dark:border-gray-700">You agree not to misuse the PDFBullet API... You will not attempt to reverse engineer the services... You will respect rate limits... etc.</div>
                                            <label className="flex items-center justify-center gap-2 cursor-pointer"><input type="checkbox" checked={agreedToTerms} onChange={e => setAgreedToTerms(e.target.checked)} /> I have read and agree to the API Terms of Service</label>
                                            <button onClick={() => setGenerationStep(2)} disabled={!agreedToTerms} className="mt-4 bg-brand-red text-white font-bold py-2 px-6 rounded-lg disabled:bg-gray-400">Next Step &rarr;</button>
                                        </div>}

                                        {generationStep === 2 && <div className="text-center">
                                            <h3 className="text-xl font-bold">Step 2: Describe Your Project</h3>
                                            <p className="mt-2 text-gray-600 dark:text-gray-400">To help us improve our services, please briefly describe how you plan to use the API.</p>
                                            <textarea value={projectDescription} onChange={e => setProjectDescription(e.target.value)} rows={3} className="w-full mt-4 p-2 bg-white dark:bg-black border rounded-md" placeholder="e.g., I'm building a mobile app to manage student documents..."></textarea>
                                            <div className="flex gap-4 justify-center mt-4">
                                                <button onClick={() => setGenerationStep(1)} className="bg-gray-200 dark:bg-gray-700 font-bold py-2 px-6 rounded-lg">Back</button>
                                                <button onClick={() => setGenerationStep(3)} disabled={!projectDescription} className="bg-brand-red text-white font-bold py-2 px-6 rounded-lg disabled:bg-gray-400">Next Step &rarr;</button>
                                            </div>
                                        </div>}
                                        
                                        {generationStep === 3 && <div className="text-center">
                                            <h3 className="text-xl font-bold">Step 3: Confirm Details</h3>
                                            <p className="mt-2 text-gray-600 dark:text-gray-400">Please review your project description before generating your key.</p>
                                            <div className="my-4 p-4 text-left text-sm bg-gray-100 dark:bg-gray-800 rounded-md border dark:border-gray-700"><strong>Project Description:</strong> {projectDescription || 'No description provided.'}</div>
                                            <div className="flex gap-4 justify-center mt-4">
                                                <button onClick={() => setGenerationStep(2)} className="bg-gray-200 dark:bg-gray-700 font-bold py-2 px-6 rounded-lg">Back</button>
                                                <button onClick={() => setGenerationStep(4)} className="bg-brand-red text-white font-bold py-2 px-6 rounded-lg">Looks Good, Continue</button>
                                            </div>
                                        </div>}
                                        
                                        {generationStep === 4 && <div className="text-center">
                                            <h3 className="text-xl font-bold">Step 4: Generate Key</h3>
                                            <p className="mt-2 text-gray-600 dark:text-gray-400">You're all set. Click below to generate your unique API key.</p>
                                            <button onClick={handleGenerateKey} disabled={isLoading} className="mt-6 inline-flex items-center gap-2 bg-brand-red hover:bg-brand-red-dark text-white font-bold py-3 px-6 rounded-lg text-lg disabled:bg-red-300">
                                                <KeyIcon className="h-5 w-5" />
                                                {isLoading ? 'Generating...' : 'Generate My API Key'}
                                            </button>
                                            {error && <p className="mt-4 text-sm text-red-500">{error}</p>}
                                        </div>}
                                        
                                        {generationStep === 5 && apiKey && (
                                             <div className="space-y-6">
                                                <div>
                                                    <label className="block text-sm font-bold text-gray-700 dark:text-gray-300">Your API Key</label>
                                                    <div className="mt-1 flex items-center gap-2">
                                                        <input type="text" readOnly value={apiKey} className="w-full p-3 bg-gray-100 dark:bg-gray-800 border border-gray-300 dark:border-gray-700 rounded-md font-mono" />
                                                        <button onClick={handleCopy} title="Copy API Key" className="p-3 bg-gray-200 dark:bg-gray-700 rounded-md hover:bg-gray-300 dark:hover:bg-gray-600">{copied ? <CheckIcon className="h-5 w-5 text-green-500" /> : <CopyIcon className="h-5 w-5" />}</button>
                                                        <button onClick={() => { if(confirm('Are you sure? Your old key will be invalidated.')) handleGenerateKey(); }} title="Regenerate API Key" className="p-3 bg-gray-200 dark:bg-gray-700 rounded-md hover:bg-gray-300 dark:hover:bg-gray-600"><RefreshIcon className="h-5 w-5" /></button>
                                                    </div>
                                                </div>
                                                {usage && (
                                                    <div>
                                                        <h3 className="text-lg font-bold">API Usage ({user.apiPlan || 'free'} plan)</h3>
                                                        <div className="mt-2 p-4 bg-gray-50 dark:bg-gray-900/50 rounded-lg border dark:border-gray-700">
                                                            <div className="flex justify-between items-center text-sm mb-2"><span className="text-gray-600 dark:text-gray-300">{usage.count.toLocaleString()} / {usage.limit.toLocaleString()} calls used</span><span>Resets in: {usage.resetsIn}</span></div>
                                                            <div className="w-full bg-gray-200 dark:bg-gray-700 rounded-full h-2.5"><div className="bg-brand-red h-2.5 rounded-full" style={{ width: `${Math.min(100, (usage.count / usage.limit) * 100)}%` }}></div></div>
                                                        </div>
                                                    </div>
                                                )}
                                            </div>
                                        )}
                                    </div>
                                )}
                            </div>
                        </section>

                        <section ref={sections.documentation} id="documentation" className="scroll-mt-24">
                            <h2 className="text-3xl font-extrabold text-gray-800 dark:text-gray-100 mb-6">API Documentation</h2>
                             <div className="bg-white dark:bg-black border border-gray-200 dark:border-gray-800 rounded-xl shadow-lg p-8 space-y-8 animated-border">
                                <div className="prose dark:prose-invert max-w-none">
                                    <h3>Getting Started</h3>
                                    <p>Welcome to the PDFBullet API! Our API provides programmatic access to our suite of PDF tools, allowing you to integrate powerful document processing directly into your applications. All endpoints are secured via HTTPS and authenticated using Bearer tokens.</p>
                                    <h3>Explore our APIs</h3>
                                    <p>Our API is organized into logical categories. Explore the detailed documentation for each category to find the endpoints, parameters, and code examples you need.</p>
                                    <div className="not-prose grid grid-cols-1 md:grid-cols-3 gap-4 my-6">
                                        <Link to="/api-pdf" className="block p-6 bg-gray-100 dark:bg-gray-800 rounded-lg text-center font-bold text-gray-800 dark:text-gray-100 hover:bg-gray-200 dark:hover:bg-gray-700 transition-colors">PDF REST API</Link>
                                        <Link to="/api-image" className="block p-6 bg-gray-100 dark:bg-gray-800 rounded-lg text-center font-bold text-gray-800 dark:text-gray-100 hover:bg-gray-200 dark:hover:bg-gray-700 transition-colors">Image REST API</Link>
                                        <Link to="/api-signature" className="block p-6 bg-gray-100 dark:bg-gray-800 rounded-lg text-center font-bold text-gray-800 dark:text-gray-100 hover:bg-gray-200 dark:hover:bg-gray-700 transition-colors">Signature REST API</Link>
                                    </div>

                                    <h3>Authentication</h3>
                                    <p>Authenticate your API requests by including your secret API key in the <code>Authorization</code> header. You must use the <code>Bearer</code> schema.</p>
                                    <CodeBlock language="bash">{`Authorization: Bearer YOUR_API_KEY`}</CodeBlock>

                                    <h3>Error Codes</h3>
                                    <p>Our API uses standard HTTP status codes to indicate the success or failure of a request.</p>
                                    <ul className="list-disc pl-5">
                                        <li><strong>400 Bad Request:</strong> Your request is malformed (e.g., missing parameters).</li>
                                        <li><strong>401 Unauthorized:</strong> Your API key is missing or invalid.</li>
                                        <li><strong>403 Forbidden:</strong> Your API key does not have permission for this action.</li>
                                        <li><strong>429 Too Many Requests:</strong> You have exceeded your daily rate limit.</li>
                                        <li><strong>500 Internal Server Error:</strong> We had a problem with our server. Try again later.</li>
                                    </ul>
                                    <h3>Rate Limits</h3>
                                    <p>Your API access is subject to a daily rate limit based on your plan. Check your dashboard for your current usage. The rate limit resets every 24 hours.</p>
                                </div>
                            </div>
                        </section>
                        
                        <section ref={sections.pricing} id="pricing" className="scroll-mt-24">
                            <h2 className="text-3xl font-extrabold text-gray-800 dark:text-gray-100 mb-6">API Pricing</h2>
                            <div className="bg-white dark:bg-black border border-gray-200 dark:border-gray-800 rounded-xl shadow-lg p-8 text-center animated-border">
                                <h3 className="text-xl font-bold">Find a plan that's right for you</h3>
                                <p className="mt-2 text-gray-600 dark:text-gray-400">Whether you're just starting out or scaling up, we have a plan that fits your needs.</p>
                                <Link to="/api-pricing" className="mt-6 inline-block bg-brand-red hover:bg-brand-red-dark text-white font-bold py-3 px-8 rounded-lg transition-colors">View API Plans</Link>
                            </div>
                        </section>

                        <section ref={sections.faq} id="faq" className="scroll-mt-24">
                            <h2 className="text-3xl font-extrabold text-gray-800 dark:text-gray-100 mb-6">API FAQ</h2>
                             <div className="bg-white dark:bg-black border border-gray-200 dark:border-gray-800 rounded-xl shadow-lg p-8 space-y-6 animated-border">
                                 <div>
                                     <h4 className="font-bold">What are the API rate limits?</h4>
                                     <p className="text-gray-600 dark:text-gray-400">Rate limits depend on your plan. The Free plan includes 100 calls/day, Developer has 1,000 calls/day, and Business has 10,000 calls/day. Exceeding your limit will result in a 429 Too Many Requests error.</p>
                                 </div>
                                  <div>
                                     <h4 className="font-bold">How are API calls counted?</h4>
                                     <p className="text-gray-600 dark:text-gray-400">Each successful request to an API endpoint counts as one call, regardless of the file size or number of pages.</p>
                                 </div>
                                  <div>
                                     <h4 className="font-bold">How do I upgrade my API plan?</h4>
                                     <p className="text-gray-600 dark:text-gray-400">You can upgrade your plan at any time from our <Link to="/api-pricing" className="text-brand-red hover:underline">API Pricing page</Link>. Your new limits will be applied immediately after payment confirmation.</p>
                                 </div>
                                  <div>
                                     <h4 className="font-bold">Can I use the API for a commercial project on the Free plan?</h4>
                                     <p className="text-gray-600 dark:text-gray-400">Yes, you can use the Free plan for commercial projects, but you will be subject to the 100 calls/day limit. For higher volume needs, we strongly recommend upgrading to a paid plan.</p>
                                 </div>
                                  <div>
                                     <h4 className="font-bold">How should I keep my API key secure?</h4>
                                     <p className="text-gray-600 dark:text-gray-400">Treat your API key like a password. Do not expose it in client-side code (like public JavaScript). Store it securely in an environment variable on your server. If you believe your key has been compromised, regenerate it immediately from your dashboard.</p>
                                 </div>
                             </div>
                        </section>
                    </main>
                </div>
            </div>
        </div>
    );
};

export default DeveloperPage;