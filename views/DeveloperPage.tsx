import React, { useState, useEffect, useRef } from 'react';
import { useAuth } from '../contexts/AuthContext.tsx';
import { Link } from 'react-router-dom';
import { KeyIcon, CopyIcon, DollarIcon, CheckIcon, BookOpenIcon, ChartBarIcon, QuestionMarkIcon, RefreshIcon, CodeIcon } from '../components/icons.tsx';
import { getApiCodeSnippet, API_TOOLS_LIST } from '../constants/apiCodeSnippets.ts';

const CodeBlock: React.FC<{ children: React.ReactNode; language?: string }> = ({ children, language }) => (
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
    const [selectedTool, setSelectedTool] = useState('word-to-pdf');

    const dashboardRef = useRef<HTMLDivElement>(null);
    const documentationRef = useRef<HTMLDivElement>(null);
    const pricingRef = useRef<HTMLDivElement>(null);
    const faqRef = useRef<HTMLDivElement>(null);

    const [activeSection, setActiveSection] = useState('dashboard');
    const [selectedLanguage, setSelectedLanguage] = useState<'curl' | 'node' | 'python' | 'php' | 'go'>('curl');

    useEffect(() => {
        document.title = "Developer API | PDFBullet";
        const savedGuestKey = typeof window !== 'undefined' ? localStorage.getItem('pdfbullet_guest_apikey') : null;
        const activeKey = user?.apiKey || savedGuestKey || '';
        if (activeKey) {
            setApiKey(activeKey);
            setGenerationStep(5);
        }
        getApiUsage()
            .then(setUsage)
            .catch(() => {})
            .finally(() => setIsLoading(false));
    }, [user, getApiUsage]);

    const handleRegenerateKey = () => {
        if (typeof window !== 'undefined' && window.confirm('Are you sure? Your old key will be invalidated.')) {
            handleGenerateKey();
        }
    };

    useEffect(() => {
        const observer = new IntersectionObserver((entries) => {
            entries.forEach(entry => {
                if (entry.isIntersecting) {
                    setActiveSection(entry.target.id);
                }
            });
        }, { rootMargin: "-40% 0px -60% 0px", threshold: 0 });

        const targets = [dashboardRef.current, documentationRef.current, pricingRef.current, faqRef.current].filter(Boolean);
        targets.forEach(ref => observer.observe(ref!));

        return () => {
            targets.forEach(ref => observer.unobserve(ref!));
        };
    }, []);

    const handleGenerateKey = async () => {
        setIsLoading(true);
        setError('');
        try {
            const newKey = await generateApiKey();
            setApiKey(newKey);
            getApiUsage().then(setUsage);
            setGenerationStep(5);

            // Fire and forget welcome email
            if (user?.email) {
                fetch('/api/email/welcome-api', {
                    method: 'POST',
                    headers: { 'Content-Type': 'application/json' },
                    body: JSON.stringify({ email: user.email, apiKey: newKey })
                }).catch(e => console.error('Failed to trigger welcome email:', e));
            }
        } catch (err: any) {
            setError(err.message || 'Failed to generate API key.');
            setGenerationStep(4);
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

    const scrollToRef = (ref: React.RefObject<HTMLDivElement>) => {
        ref.current?.scrollIntoView({ behavior: 'smooth', block: 'start' });
    };

    const sidebarLinks = [
        { id: 'dashboard', name: 'Dashboard', icon: CodeIcon, ref: dashboardRef },
        { id: 'documentation', name: 'Documentation', icon: BookOpenIcon, ref: documentationRef },
        { id: 'api-reference', name: 'API Reference', icon: CodeIcon, path: '/docs' },
        { id: 'pricing', name: 'Pricing', icon: DollarIcon, ref: pricingRef },
        { id: 'faq', name: 'FAQ', icon: QuestionMarkIcon, ref: faqRef },
    ];

    const copyIcon = copied ? <CheckIcon className="h-5 w-5 text-green-500" /> : <CopyIcon className="h-5 w-5" />;

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
                        <button onClick={() => scrollToRef(dashboardRef)} className="bg-white text-teal-800 font-bold py-3 px-8 rounded-md hover:bg-gray-200 transition-colors">Get started</button>
                    </div>
                </div>
            </div>

            <div className="px-6 py-12 relative z-10 mt-8">
                <div className="lg:flex lg:gap-12">
                    <aside className="w-full lg:w-64 lg:sticky lg:top-24 self-start mb-8 lg:mb-0">
                        <nav className="space-y-2 bg-white/80 dark:bg-black/70 backdrop-blur-sm p-4 rounded-xl border border-gray-200 dark:border-gray-800">
                            {sidebarLinks.map(link => {
                                const IconComp = link.icon;
                                if (link.path) {
                                    return (
                                        <Link key={link.id} to={link.path} className="w-full flex items-center gap-3 p-3 rounded-lg text-sm font-semibold transition-colors hover:bg-gray-100 dark:hover:bg-gray-800">
                                            <IconComp className="h-5 w-5" />
                                            {link.name}
                                        </Link>
                                    );
                                }
                                return (
                                    <button key={link.id} onClick={() => link.ref && scrollToRef(link.ref)} className={`w-full flex items-center gap-3 p-3 rounded-lg text-sm font-semibold transition-colors ${activeSection === link.id ? 'bg-brand-red/10 text-brand-red' : 'hover:bg-gray-100 dark:hover:bg-gray-800'}`}>
                                        <IconComp className="h-5 w-5" />
                                        {link.name}
                                    </button>
                                );
                            })}
                        </nav>
                    </aside>

                    <main className="w-full lg:flex-grow space-y-24">
                        <section ref={dashboardRef} id="dashboard" className="scroll-mt-24">
                            <h2 className="text-3xl font-extrabold text-gray-800 dark:text-gray-100 mb-6">API Dashboard</h2>
                            <div className="bg-white dark:bg-black border border-gray-200 dark:border-gray-800 rounded-xl shadow-lg p-8 animated-border">
                                {isLoading ? (
                                    <p className="text-center py-8">Loading dashboard...</p>
                                ) : (
                                    <div>
                                        {generationStep === 1 && (
                                            <div className="text-center">
                                                <h3 className="text-xl font-bold">Step 1: Agree to Terms</h3>
                                                <p className="mt-2 text-gray-600 dark:text-gray-400">Review and agree to our API terms of use to proceed.</p>
                                                <div className="my-4 p-4 text-left text-xs h-24 overflow-y-auto bg-gray-100 dark:bg-gray-800 rounded-md border dark:border-gray-700">You agree not to misuse the PDFBullet API... You will not attempt to reverse engineer the services... You will respect rate limits... etc.</div>
                                                <label className="flex items-center justify-center gap-2 cursor-pointer">
                                                    <input type="checkbox" checked={agreedToTerms} onChange={e => setAgreedToTerms(e.target.checked)} /> I have read and agree to the API Terms of Service
                                                </label>
                                                <button onClick={() => setGenerationStep(2)} disabled={!agreedToTerms} className="mt-4 bg-brand-red text-white font-bold py-2 px-6 rounded-lg disabled:bg-gray-400">Next Step &rarr;</button>
                                            </div>
                                        )}

                                        {generationStep === 2 && (
                                            <div className="text-center">
                                                <h3 className="text-xl font-bold">Step 2: Describe Your Project</h3>
                                                <p className="mt-2 text-gray-600 dark:text-gray-400">To help us improve our services, please briefly describe how you plan to use the API.</p>
                                                <textarea value={projectDescription} onChange={e => setProjectDescription(e.target.value)} rows={3} className="w-full mt-4 p-2 bg-white dark:bg-black border rounded-md" placeholder="e.g., I'm building a web app to convert documents to PDF..."></textarea>
                                                <div className="flex gap-4 justify-center mt-4">
                                                    <button onClick={() => setGenerationStep(1)} className="bg-gray-200 dark:bg-gray-700 font-bold py-2 px-6 rounded-lg">Back</button>
                                                    <button onClick={() => setGenerationStep(3)} disabled={!projectDescription} className="bg-brand-red text-white font-bold py-2 px-6 rounded-lg disabled:bg-gray-400">Next Step &rarr;</button>
                                                </div>
                                            </div>
                                        )}
                                        
                                        {generationStep === 3 && (
                                            <div className="text-center">
                                                <h3 className="text-xl font-bold">Step 3: Confirm Details</h3>
                                                <p className="mt-2 text-gray-600 dark:text-gray-400">Please review your project description before generating your key.</p>
                                                <div className="my-4 p-4 text-left text-sm bg-gray-100 dark:bg-gray-800 rounded-md border dark:border-gray-700"><strong>Project Description:</strong> {projectDescription || 'No description provided.'}</div>
                                                <div className="flex gap-4 justify-center mt-4">
                                                    <button onClick={() => setGenerationStep(2)} className="bg-gray-200 dark:bg-gray-700 font-bold py-2 px-6 rounded-lg">Back</button>
                                                    <button onClick={() => setGenerationStep(4)} className="bg-brand-red text-white font-bold py-2 px-6 rounded-lg">Looks Good, Continue</button>
                                                </div>
                                            </div>
                                        )}
                                        
                                        {generationStep === 4 && (
                                            <div className="text-center">
                                                <h3 className="text-xl font-bold">Step 4: Generate Key</h3>
                                                <p className="mt-2 text-gray-600 dark:text-gray-400">You're all set. Click below to generate your unique API key.</p>
                                                <button onClick={handleGenerateKey} disabled={isLoading} className="mt-6 inline-flex items-center gap-2 bg-brand-red hover:bg-brand-red-dark text-white font-bold py-3 px-6 rounded-lg text-lg disabled:bg-red-300 shadow-lg hover:shadow-brand-red/20 transition-all">
                                                    <KeyIcon className="h-5 w-5" />
                                                    {isLoading ? 'Generating...' : 'Generate My API Key'}
                                                </button>
                                                {error && <p className="mt-4 text-sm text-red-500 font-medium">{error}</p>}
                                            </div>
                                        )}
                                        
                                        {generationStep === 5 && apiKey && (
                                            <div className="space-y-6">
                                                {/* Tool API Selector Dropdown */}
                                                <div className="bg-gray-50 dark:bg-gray-900/60 p-4 rounded-xl border border-gray-200 dark:border-gray-800 text-left">
                                                    <label className="block text-xs font-extrabold uppercase tracking-wider text-gray-700 dark:text-gray-300 mb-2">
                                                        ⚡ Select PDFBullet Tool API to Access & Test:
                                                    </label>
                                                    <select
                                                        value={selectedTool}
                                                        onChange={e => setSelectedTool(e.target.value)}
                                                        className="w-full p-3 bg-white dark:bg-black border border-gray-300 dark:border-gray-700 rounded-lg text-sm font-bold text-brand-red dark:text-red-400 shadow-sm focus:outline-none focus:ring-2 focus:ring-brand-red"
                                                    >
                                                        {API_TOOLS_LIST.map(t => (
                                                            <option key={t.id} value={t.id}>
                                                                {t.name} — Endpoint: {t.endpoint}
                                                            </option>
                                                        ))}
                                                    </select>
                                                </div>

                                                <div>
                                                    <label className="block text-sm font-bold text-gray-700 dark:text-gray-300">Your Official Live API Key</label>
                                                    <div className="mt-1.5 flex items-center gap-2">
                                                        <input type="text" readOnly value={apiKey} className="w-full p-3 bg-gray-100 dark:bg-gray-800 border border-gray-300 dark:border-gray-700 rounded-lg font-mono text-sm text-brand-red dark:text-red-400 font-semibold" />
                                                        <button onClick={handleCopy} title="Copy API Key" className="p-3 bg-gray-200 dark:bg-gray-700 rounded-lg hover:bg-gray-300 dark:hover:bg-gray-600 transition">{copyIcon}</button>
                                                        <button onClick={handleRegenerateKey} title="Regenerate API Key" className="p-3 bg-gray-200 dark:bg-gray-700 rounded-lg hover:bg-gray-300 dark:hover:bg-gray-600 transition"><RefreshIcon className="h-5 w-5" /></button>
                                                    </div>
                                                </div>

                                                {usage && (
                                                    <div>
                                                        <h3 className="text-sm font-bold text-gray-700 dark:text-gray-300">API Usage ({user?.apiPlan || 'developer'} plan)</h3>
                                                        <div className="mt-2 p-4 bg-gray-50 dark:bg-gray-900/50 rounded-xl border border-gray-200 dark:border-gray-800">
                                                            <div className="flex justify-between items-center text-xs mb-2">
                                                                <span className="text-gray-600 dark:text-gray-300 font-semibold">{usage.count.toLocaleString()} / {usage.limit.toLocaleString()} requests used</span>
                                                                <span className="text-gray-500">Resets in: {usage.resetsIn}</span>
                                                            </div>
                                                            <div className="w-full bg-gray-200 dark:bg-gray-700 rounded-full h-2.5">
                                                                <div className="bg-brand-red h-2.5 rounded-full" style={{ width: `${Math.min(100, (usage.count / usage.limit) * 100)}%` }}></div>
                                                            </div>
                                                        </div>
                                                    </div>
                                                )}

                                                {/* 0-to-End Integration Guide */}
                                                <div className="mt-8 pt-6 border-t border-gray-200 dark:border-gray-800 text-left">
                                                    <h3 className="text-xl font-extrabold text-gray-900 dark:text-gray-100 mb-2">
                                                        🚀 0-to-End Integration Guide ({API_TOOLS_LIST.find(t => t.id === selectedTool)?.name})
                                                    </h3>
                                                    <p className="text-sm text-gray-600 dark:text-gray-400 mb-4">
                                                        Select your programming language below to view production-ready integration code using your official API key.
                                                    </p>

                                                    {/* Language selector tabs */}
                                                    <div className="flex flex-wrap gap-2 mb-4 border-b border-gray-200 dark:border-gray-800 pb-3">
                                                        {(['curl', 'node', 'python', 'php', 'go'] as const).map(lang => (
                                                            <button
                                                                key={lang}
                                                                onClick={() => setSelectedLanguage(lang)}
                                                                className={`px-4 py-2 text-xs font-bold rounded-lg transition-all ${
                                                                    selectedLanguage === lang
                                                                        ? 'bg-brand-red text-white shadow-md'
                                                                        : 'bg-gray-100 dark:bg-gray-800 text-gray-700 dark:text-gray-300 hover:bg-gray-200 dark:hover:bg-gray-700'
                                                                }`}
                                                            >
                                                                {lang.toUpperCase()}
                                                            </button>
                                                        ))}
                                                    </div>

                                                    {/* Code block */}
                                                    <div className="relative">
                                                        <CodeBlock language={selectedLanguage}>
                                                            {getApiCodeSnippet(selectedLanguage, apiKey, selectedTool)}
                                                        </CodeBlock>
                                                    </div>
                                                </div>
                                            </div>
                                        )}
                                    </div>
                                )}
                            </div>
                        </section>

                        <section ref={documentationRef} id="documentation" className="scroll-mt-24">
                            <h2 className="text-3xl font-extrabold text-gray-800 dark:text-gray-100 mb-6">Official REST API Endpoints</h2>
                            <div className="bg-white dark:bg-black border border-gray-200 dark:border-gray-800 rounded-xl shadow-lg p-8 space-y-8 animated-border">
                                <div className="prose dark:prose-invert max-w-none">
                                    <h3>Getting Started</h3>
                                    <p>Welcome to the official PDFBullet REST API! Integrate word-to-pdf, excel-to-pdf, powerpoint-to-pdf, merging, compression, and AI background removal directly into your application.</p>
                                    
                                    <div className="not-prose overflow-x-auto my-6">
                                        <table className="w-full text-left text-sm border-collapse">
                                            <thead>
                                                <tr className="border-b border-gray-200 dark:border-gray-800 text-gray-700 dark:text-gray-300 font-bold bg-gray-50 dark:bg-gray-900">
                                                    <th className="p-3">Method</th>
                                                    <th className="p-3">Endpoint URL</th>
                                                    <th className="p-3">Description</th>
                                                </tr>
                                            </thead>
                                            <tbody className="divide-y divide-gray-200 dark:divide-gray-800">
                                                <tr>
                                                    <td className="p-3 font-mono text-xs text-green-600 font-bold">POST</td>
                                                    <td className="p-3 font-mono text-xs">/api/convert-word</td>
                                                    <td className="p-3">Converts DOC / DOCX documents to PDF</td>
                                                </tr>
                                                <tr>
                                                    <td className="p-3 font-mono text-xs text-green-600 font-bold">POST</td>
                                                    <td className="p-3 font-mono text-xs">/api/convert-ppt</td>
                                                    <td className="p-3">Converts PPT / PPTX presentations to PDF</td>
                                                </tr>
                                                <tr>
                                                    <td className="p-3 font-mono text-xs text-green-600 font-bold">POST</td>
                                                    <td className="p-3 font-mono text-xs">/api/convert-excel</td>
                                                    <td className="p-3">Converts XLS / XLSX spreadsheets to PDF</td>
                                                </tr>
                                                <tr>
                                                    <td className="p-3 font-mono text-xs text-green-600 font-bold">POST</td>
                                                    <td className="p-3 font-mono text-xs">/api/merge-pdf</td>
                                                    <td className="p-3">Merges multiple PDF files into one</td>
                                                </tr>
                                                <tr>
                                                    <td className="p-3 font-mono text-xs text-green-600 font-bold">POST</td>
                                                    <td className="p-3 font-mono text-xs">/api/compress-pdf</td>
                                                    <td className="p-3">Compresses PDF document size</td>
                                                </tr>
                                                <tr>
                                                    <td className="p-3 font-mono text-xs text-green-600 font-bold">POST</td>
                                                    <td className="p-3 font-mono text-xs">/api/remove-background</td>
                                                    <td className="p-3">Removes image background automatically</td>
                                                </tr>
                                            </tbody>
                                        </table>
                                    </div>

                                    <h3>Authentication Header</h3>
                                    <p>Pass your secret API key in the <code>Authorization</code> header for every API request:</p>
                                    <CodeBlock language="bash">{`Authorization: Bearer ${apiKey || 'pdfbullet_live_sec_your_key_here'}`}</CodeBlock>

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
                        
                        <section ref={pricingRef} id="pricing" className="scroll-mt-24">
                            <h2 className="text-3xl font-extrabold text-gray-800 dark:text-gray-100 mb-6">API Pricing</h2>
                            <div className="bg-white dark:bg-black border border-gray-200 dark:border-gray-800 rounded-xl shadow-lg p-8 text-center animated-border">
                                <h3 className="text-xl font-bold">Find a plan that's right for you</h3>
                                <p className="mt-2 text-gray-600 dark:text-gray-400">Whether you're just starting out or scaling up, we have a plan that fits your needs.</p>
                                <Link to="/api-pricing" className="mt-6 inline-block bg-brand-red hover:bg-brand-red-dark text-white font-bold py-3 px-8 rounded-lg transition-colors">View API Plans</Link>
                            </div>
                        </section>

                        <section ref={faqRef} id="faq" className="scroll-mt-24">
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
