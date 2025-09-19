import React, { useState, useEffect, useRef, useMemo } from 'react';
import { Link, useLocation } from 'react-router-dom';
import { TOOLS } from '../constants.ts';
import { useI18n } from '../contexts/I18nContext.tsx';

// Helper components for styling
const ParamTag: React.FC<{ type: 'required' | 'optional' | 'type' | string; children: React.ReactNode }> = ({ type, children }) => {
    const styles = {
        required: 'bg-red-100 text-red-800 border-red-300 dark:bg-red-900/50 dark:text-red-300 dark:border-red-700',
        optional: 'bg-green-100 text-green-800 border-green-300 dark:bg-green-900/50 dark:text-green-300 dark:border-green-700',
        type: 'bg-gray-200 text-gray-700 border-gray-300 dark:bg-gray-700 dark:text-gray-200 dark:border-gray-600',
    };
    const styleClass = styles[type as keyof typeof styles] || styles.type;
    return <span className={`text-xs font-mono font-semibold px-2 py-0.5 rounded-md border ${styleClass}`}>{children}</span>;
};

const ParamLine: React.FC<{ name: string; type: string; isRequired?: boolean | string; children: React.ReactNode }> = ({ name, type, isRequired, children }) => (
    <div className="py-4 border-b border-gray-200 dark:border-gray-700 last:border-b-0">
        <div className="flex flex-wrap items-center gap-3 mb-1">
            <code className="font-bold text-gray-800 dark:text-gray-100">{name}</code>
            <ParamTag type="type">{type}</ParamTag>
            {isRequired ? (
                <ParamTag type="required">{typeof isRequired === 'string' ? isRequired : 'REQUIRED'}</ParamTag>
            ) : (
                <ParamTag type="optional">OPTIONAL</ParamTag>
            )}
        </div>
        <div className="text-sm text-gray-600 dark:text-gray-400 pl-1 space-y-2">{children}</div>
    </div>
);

const EndpointCard: React.FC<{ method: 'GET' | 'POST' | 'DELETE' | 'PUT'; path: string; children: React.ReactNode }> = ({ method, path, children }) => {
    const methodColors = {
        GET: 'bg-blue-100 text-blue-800 dark:bg-blue-900/50 dark:text-blue-300',
        POST: 'bg-green-100 text-green-800 dark:bg-green-900/50 dark:text-green-300',
        DELETE: 'bg-red-100 text-red-800 dark:bg-red-900/50 dark:text-red-300',
        PUT: 'bg-orange-100 text-orange-800 dark:bg-orange-900/50 dark:text-orange-300'
    }
    return (
        <div className="border border-gray-200 dark:border-gray-700 rounded-lg my-6">
            <div className="p-4 bg-gray-50 dark:bg-gray-900/50 rounded-t-lg">
                <span className={`px-3 py-1 font-mono font-bold text-sm rounded-md ${methodColors[method]}`}>{method}</span>
                <code className="ml-4 font-mono text-gray-800 dark:text-gray-100 break-all">{path}</code>
            </div>
            <div className="p-4 text-sm text-gray-600 dark:text-gray-400">{children}</div>
        </div>
    );
};

const ResponseCard: React.FC<{ children: React.ReactNode }> = ({ children }) => (
    <div className="my-6">
        <h4 className="font-bold mb-2">Response</h4>
        <div className="bg-gray-800 text-white p-4 rounded-lg text-xs font-mono overflow-x-auto">
            <pre><code>{children}</code></pre>
        </div>
    </div>
);

const ApiSection: React.FC<{ id: string; title: string; children: React.ReactNode, refProp: React.RefObject<HTMLDivElement> }> = ({ id, title, children, refProp }) => (
    <section id={id} ref={refProp} className="scroll-mt-24 py-4">
        <h2 className="text-3xl font-extrabold text-gray-800 dark:text-gray-100 border-b border-gray-200 dark:border-gray-700 pb-2 mb-4">{title}</h2>
        <div className="prose dark:prose-invert max-w-none text-gray-700 dark:text-gray-300 leading-relaxed">
            {children}
        </div>
    </section>
);


const ApiReferencePage: React.FC = () => {
    const [activeSection, setActiveSection] = useState('introduction');
    const location = useLocation();
    const { t } = useI18n();

    const sectionsRefs = useMemo(() => {
        const refs: { [key: string]: React.RefObject<HTMLDivElement> } = {
            introduction: React.createRef(),
            quickstart: React.createRef(),
            authentication: React.createRef(),
            'pdf-image': React.createRef(),
            'request-workflow': React.createRef(),
            start: React.createRef(),
            upload: React.createRef(),
            process: React.createRef(),
            download: React.createRef(),
            task: React.createRef(),
            signatures: React.createRef(),
            create_signature_request: React.createRef(),
            list_signatures: React.createRef(),
            get_signature_status: React.createRef(),
            get_receiver_info: React.createRef(),
            download_audit: React.createRef(),
            download_original_files: React.createRef(),
            download_signed_files: React.createRef(),
            fix_receiver_email: React.createRef(),
            fix_signer_phone: React.createRef(),
            send_reminders: React.createRef(),
            void_signature: React.createRef(),
            increase_expiration_days: React.createRef(),
            topics: React.createRef(),
            security: React.createRef(),
            errors: React.createRef(),
            testing: React.createRef(),
            credit_consumption: React.createRef(),
            webhooks: React.createRef(),
            fonts_compatibility: React.createRef(),
        };
        TOOLS.forEach(tool => {
            if(tool.api) refs[tool.id] = React.createRef();
        });
        return refs;
    }, []);

    useEffect(() => {
        document.title = "API Reference | I Love PDFLY";
        if (location.hash) {
            const id = location.hash.substring(1);
            setTimeout(() => {
                document.getElementById(id)?.scrollIntoView({ behavior: 'smooth' });
            }, 100);
        }
    }, [location]);
    
    useEffect(() => {
        const observer = new IntersectionObserver((entries) => {
            entries.forEach(entry => {
                if (entry.isIntersecting) {
                    setActiveSection(entry.target.id);
                }
            });
        }, { rootMargin: "-40% 0px -60% 0px", threshold: 0.1 });

        Object.values(sectionsRefs).forEach(ref => {
            if (ref.current) observer.observe(ref.current);
        });

        return () => {
            Object.values(sectionsRefs).forEach(ref => {
                if (ref.current) observer.unobserve(ref.current);
            });
        };
    }, [sectionsRefs]);
    
    const scrollTo = (id: string) => {
        document.getElementById(id)?.scrollIntoView({ behavior: 'smooth', block: 'start' });
    };

    const sidebarLinks = [
        { id: 'introduction', title: 'Introduction' },
        { id: 'quickstart', title: 'Quick Start' },
        { id: 'authentication', title: 'Authentication' },
        { id: 'pdf-image-header', title: 'PDF & Image', isHeader: true },
        { id: 'request-workflow', title: 'Request Workflow' },
        { id: 'start', title: 'Start' },
        { id: 'upload', title: 'Upload' },
        { id: 'process', title: 'Process', isSubHeader: true },
// FIX: The `t` variable inside the `map` was shadowing the `t` function from `useI18n`. Renamed the variable to `tool` to resolve the conflict.
        ...TOOLS.filter(t => t.api && ['pdf', 'image'].includes(t.api.category)).map(tool => ({ id: tool.id, title: t(tool.title), isTool: true })),
        { id: 'download', title: 'Download' },
        { id: 'task', title: 'Task' },
        { id: 'signatures-header', title: 'Signatures', isHeader: true },
        { id: 'create_signature_request', title: 'Create Signature request' },
        { id: 'list_signatures', title: 'List Signatures' },
        { id: 'get_signature_status', title: 'Get Signature status' },
        { id: 'get_receiver_info', title: 'Get Receiver info' },
        { id: 'download_audit', title: 'Download Audit' },
        { id: 'download_original_files', title: 'Download Original files' },
        { id: 'download_signed_files', title: 'Download Signed files' },
        { id: 'fix_receiver_email', title: 'Fix Receiver Email' },
        { id: 'fix_signer_phone', title: 'Fix Signer Phone' },
        { id: 'send_reminders', title: 'Send Reminders' },
        { id: 'void_signature', title: 'Void Signature' },
        { id: 'increase_expiration_days', title: 'Increase Expiration Days' },
        { id: 'topics-header', title: 'Topics', isHeader: true },
        { id: 'security', title: 'Security' },
        { id: 'errors', title: 'Errors' },
        { id: 'testing', title: 'Testing' },
        { id: 'credit_consumption', title: 'Credit consumption' },
        { id: 'webhooks', title: 'Webhooks' },
        { id: 'fonts_compatibility', title: 'Fonts compatibility' },
    ];
    
    const NestedParam: React.FC<{ name: string; type: string; isRequired?: boolean | string; children: React.ReactNode }> = ({ name, type, isRequired, children }) => (
        <div className="py-2">
            <div className="flex flex-wrap items-center gap-3 mb-1">
                <code className="font-bold text-gray-800 dark:text-gray-100">{name}</code>
                <ParamTag type="type">{type}</ParamTag>
                {isRequired ? <ParamTag type="required">{typeof isRequired === 'string' ? isRequired : 'REQUIRED'}</ParamTag> : <ParamTag type="optional">OPTIONAL</ParamTag>}
            </div>
            <p className="text-sm text-gray-600 dark:text-gray-400 pl-1">{children}</p>
        </div>
    );

    return (
        <div>
            <div className="container mx-auto px-6 py-12">
                 <div className="lg:flex lg:gap-12">
                    <aside className="w-full lg:w-72 lg:sticky lg:top-24 self-start mb-8 lg:mb-0">
                        <nav className="space-y-1 bg-white/80 dark:bg-black/70 backdrop-blur-sm p-4 rounded-xl border border-gray-200 dark:border-gray-800 max-h-[calc(100vh-8rem)] overflow-y-auto">
                            {sidebarLinks.map(link => {
                                if ('isHeader' in link && link.isHeader) {
                                    return <h3 key={link.id} className="font-bold text-lg p-2 text-gray-800 dark:text-gray-100 mt-4 first:mt-0">{link.title}</h3>
                                }
                                if('isSubHeader' in link && link.isSubHeader) {
                                    return <h4 key={link.id} onClick={() => scrollTo(link.id)} className={`w-full text-left p-2 rounded-lg text-sm font-bold transition-colors cursor-pointer ${activeSection === link.id ? 'text-brand-red' : 'hover:bg-gray-100 dark:hover:bg-gray-800'}`}>{link.title}</h4>
                                }
                                return (
                                    <button key={link.id} onClick={() => scrollTo(link.id)} className={`w-full text-left p-2 rounded-lg text-sm font-semibold transition-colors ${('isTool' in link && link.isTool) ? 'pl-6' : ''} ${activeSection === link.id ? 'bg-brand-red/10 text-brand-red' : 'hover:bg-gray-100 dark:hover:bg-gray-800'}`}>
                                        {link.title}
                                    </button>
                                );
                            })}
                        </nav>
                    </aside>
                    <main className="w-full lg:flex-grow">
                        <ApiSection id="introduction" title="Introduction" refProp={sectionsRefs.introduction}>
                            <p>The I Love PDFLY API is organized around REST, has predictable resource-oriented URLs, accepts form-encoded request bodies, returns JSON-encoded responses, and uses standard HTTP response codes, authentication, and verbs.</p>
                            <p>You can use the I Love PDFLY API in test mode, which does not affect your live data or interact with the banking networks. The API key you use to authenticate the request determines whether the request is live mode or test mode.</p>
                            <h4>Libraries</h4>
                            <p>We have client libraries in many languages to help you get started.</p>
                            <div className="grid grid-cols-2 gap-4 my-4">
                                <div className="p-4 bg-gray-100 dark:bg-gray-800 rounded-lg">PHP</div>
                                <div className="p-4 bg-gray-100 dark:bg-gray-800 rounded-lg">.NET</div>
                                <div className="p-4 bg-gray-100 dark:bg-gray-800 rounded-lg">Ruby</div>
                                <div className="p-4 bg-gray-100 dark:bg-gray-800 rounded-lg">Node.js</div>
                            </div>
                        </ApiSection>

                        <ApiSection id="quickstart" title="Quick Start" refProp={sectionsRefs.quickstart}>
                            <p>This is a quick reference for developers. The quickest way to start is to:</p>
                            <ol>
                                <li>Register as a developer.</li>
                                <li>Get a Project ID and its related Secret Key from the API Keys section of your console.</li>
                                <li>Download one of our API Libraries.</li>
                                <li>Try out our demos in the API Library.</li>
                                <li>Remember to read this documentation!</li>
                            </ol>
                        </ApiSection>

                        <ApiSection id="authentication" title="Authentication" refProp={sectionsRefs.authentication}>
                            <p>We use a very simple but effective Authentication method: <strong>JSON Web Tokens</strong>. It consists of sending a Bearer Header in every request with a signed token by your Secret Key provided in your I Love PDFLY Developer Account.</p>
                            <EndpointCard method="POST" path="/v1/auth">Authenticate</EndpointCard>
                            <ParamLine name="public_key" type="string" isRequired>Project public key that you can find in admin panel.</ParamLine>
                            <ResponseCard>{`{
  "token": "eyJ0eXAiOiJKV1Q..."
}`}</ResponseCard>
                        </ApiSection>
                        
                        <ApiSection id="pdf-image" title="PDF & Image" refProp={sectionsRefs['pdf-image']}>
                           <p>Tools for PDF and Image manipulation.</p>
                        </ApiSection>

                        <ApiSection id="request-workflow" title="Request Workflow" refProp={sectionsRefs['request-workflow']}>
                            <p>The PDF and Image processing workflow with I Love PDFLY API is very simple and consists of 4 basic request instructions: Start task, Upload files, Process files and Download files. Once the API has executed these four steps, your PDF and Image files will have been processed with your desired tool and downloaded anywhere you like.</p>
                            <img src="https://i.imgur.com/eB3b6Y6.png" alt="API Workflow Diagram" className="my-4 rounded-lg"/>
                        </ApiSection>
                        
                        <ApiSection id="start" title="Start" refProp={sectionsRefs.start}>
                            <p>Retrieve the information about which server will be your assigned server and which Task ID to use. The request must contain the tool you want to access.</p>
                            <EndpointCard method="GET" path={"/v1/start/{tool}/{region?}"}>Get Server & Task ID</EndpointCard>
                            <ParamLine name="tool" type="string" isRequired>A comma separated list of tools to use.</ParamLine>
                            <ResponseCard>{`{
  "server": "api11.ilovepdfly.com",
  "task": "2704efghitmeage...",
  "remaining_credits": 1234
}`}</ResponseCard>
                        </ApiSection>

                        <ApiSection id="upload" title="Upload" refProp={sectionsRefs.upload}>
                           <p>This is the second step of the Task. Here is where you upload your files for a given task. The files will be uploaded and stored in the server until the process order is sent (Step 3 of a Task).</p>
                           <EndpointCard method="POST" path="/v1/upload">Upload File</EndpointCard>
                           <ParamLine name="task" type="string" isRequired>Task ID where the files must be uploaded.</ParamLine>
                           <ParamLine name="file" type="file" isRequired>File to be uploaded.</ParamLine>
                           <ParamLine name="chunk" type="integer" isRequired={false}>If it is a chunk upload this number indicates the number of chunks being uploaded.</ParamLine>
                           <ResponseCard>{`{
  "server_filename": "cd20201ebe...5257c95d843.pdf"
}`}</ResponseCard>
                        </ApiSection>

                        <ApiSection id="process" title="Process" refProp={sectionsRefs.process}>
                            <p>Once the files are uploaded for the Task, this resource initiates the processing of all files. In the request, you must specify which files you want to process from the uploaded ones in Step 2 (upload). This means that you can request to process fewer files than the uploaded ones. If some files have an error while processing, you can check their status in the table of File Status Types.</p>
                            <p>The tool to use and its options are set in this request. All tools options are optional, and will take default values if they are not defined. Find below the options for each tool.</p>
                            <EndpointCard method="POST" path="/v1/process">Process files</EndpointCard>
                             <ParamLine name="task" type="string" isRequired>Task ID to be processed.</ParamLine>
                             <ParamLine name="tool" type="string" isRequired>Accepted values vary by file type. E.g., for PDF: merge, split, compress, pdfjpg, imagepdf, unlock, pagenumber...</ParamLine>
                             <ParamLine name="files" type="array" isRequired>Files to process. The order of the array will be the order that files will be processed.</ParamLine>
                             <ParamLine name="webhook" type="string" isRequired={false}>Callback URL. If you don't want to maintain the connection open until the task processing is finished, send webhook equal and a valid URL. The API will close the connection immediately and will POST all the /task resource information to the URL provided. The behaviour will be the same but no callback will be sent, this is useful if you don't want to wait the process to end or receive callbacks giving you the freedom of send periodic GET calls to /task/{'task'} to know the status of that task and if it has been completed.</ParamLine>
                             <ResponseCard>{`{
  "download_filename": "output.zip",
  "filesize": 0,
  "output_filesize": 0,
  "output_filenumber": 2,
  "output_extensions": ["pdf"],
  "timer": "0.028",
  "status": "TaskSuccess"
}`}</ResponseCard>
                        </ApiSection>

                        <ApiSection id="merge-pdf" title={t('tool.merge-pdf.title')} refProp={sectionsRefs['merge-pdf']}>
                            <p>Merge PDF has no extra options.</p>
                        </ApiSection>

                        <ApiSection id="split-pdf" title={t('tool.split-pdf.title')} refProp={sectionsRefs['split-pdf']}>
                            <ParamLine name="mode" type="string" isRequired={false}>
                                <p>Choose the split mode. Accepted values:</p>
                                <ul><li><code>ranges</code>: Split by ranges of pages.</li><li><code>fixed</code>: Split in a fixed range of pages.</li></ul>
                                <p>Default: <code>ranges</code></p>
                            </ParamLine>
                            <ParamLine name="ranges" type="string" isRequired="REQUIRED IF MODE IS RANGES">The ranges of pages to split. For example: "1,3,5-8".</ParamLine>
                        </ApiSection>

                        <ApiSection id="compress-pdf" title={t('tool.compress-pdf.title')} refProp={sectionsRefs['compress-pdf']}>
                            <ParamLine name="compression_level" type="string" isRequired>
                                <p>Compression level. Accepted values: <code>extreme</code>=Extreme compression, <code>recommended</code>=Recommended compression, <code>low</code>=Low compression.</p>
                                <p>Default: <code>recommended</code></p>
                            </ParamLine>
                        </ApiSection>

                        <ApiSection id="ocr-pdf" title={t('tool.ocr-pdf.title')} refProp={sectionsRefs['ocr-pdf']}>
                           <ParamLine name="ocr_language" type="string" isRequired={false}>The language of the document. Default: <code>eng</code></ParamLine>
                        </ApiSection>
                        
                        <ApiSection id="pdf-to-jpg" title={t('tool.pdf-to-jpg.title')} refProp={sectionsRefs['pdf-to-jpg']}>
                            <ParamLine name="mode" type="string" isRequired={false}>
                                <p>Choose the convert mode. Accepted values:</p>
                                <ul><li><code>pages</code>: Convert every page to a JPG file.</li><li><code>extract</code>: Extract all images from PDF.</li></ul>
                                <p>Default: <code>pages</code></p>
                            </ParamLine>
                            <ParamLine name="dpi" type="integer" isRequired={false}>
                                <p>Dots per inch of the output images. Accepted integer range: 1-300.</p>
                                <p>Default: <code>150</code></p>
                            </ParamLine>
                        </ApiSection>

                        <ApiSection id="pdf-to-png" title={t('tool.pdf-to-png.title')} refProp={sectionsRefs['pdf-to-png']}>
                            <p>Converts PDF pages to PNG images.</p>
                            <ParamLine name="mode" type="string" isRequired={false}>
                                <p>Choose the convert mode. Accepted values:</p>
                                <ul><li><code>pages</code>: Convert every page to a PNG file.</li></ul>
                                <p>Default: <code>pages</code></p>
                            </ParamLine>
                            <ParamLine name="dpi" type="integer" isRequired={false}>
                                <p>Dots per inch of the output images. Accepted integer range: 1-300.</p>
                                <p>Default: <code>150</code></p>
                            </ParamLine>
                        </ApiSection>

                        <ApiSection id="jpg-to-pdf" title={t('tool.jpg-to-pdf.title')} refProp={sectionsRefs['jpg-to-pdf']}>
                           <ParamLine name="margin" type="integer" isRequired={false}>Margin in pixels. Default: <code>0</code></ParamLine>
                           <ParamLine name="pagesize" type="string" isRequired={false}>Accepted values: <code>fit</code>, <code>A4</code>, <code>letter</code>. Default: <code>fit</code></ParamLine>
                           <ParamLine name="orientation" type="string" isRequired={false}>Accepted values: <code>portrait</code>, <code>landscape</code>. Default: <code>portrait</code></ParamLine>
                           <ParamLine name="merge_after" type="boolean" isRequired={false}>If true, it will merge the generated PDF with the file from a previous task. Default: <code>false</code></ParamLine>
                        </ApiSection>

                        <ApiSection id="psd-to-pdf" title={t('tool.psd-to-pdf.title')} refProp={sectionsRefs['psd-to-pdf']}>
                            <p>Converts a Photoshop document (PSD) to a PDF file.</p>
                            <ParamLine name="conformance" type="string" isRequired={false}>If set to <code>pdfa</code>, it will output a PDF/A compliant file. Default: <code>null</code></ParamLine>
                        </ApiSection>
                        
                        <ApiSection id="unlock-pdf" title={t('tool.unlock-pdf.title')} refProp={sectionsRefs['unlock-pdf']}>
                           <ParamLine name="password" type="string" isRequired>The password to unlock the PDF.</ParamLine>
                        </ApiSection>

                        <ApiSection id="page-numbers" title={t('tool.page-numbers.title')} refProp={sectionsRefs['page-numbers']}>
                            <ParamLine name="pages" type="string" isRequired={false}>Pages to apply the numbers. e.g. "1,3-5,8". Default: <code>all</code></ParamLine>
                            <ParamLine name="vertical_position" type="string" isRequired={false}>Values: <code>top</code>, <code>bottom</code>. Default: <code>bottom</code></ParamLine>
                            <ParamLine name="horizontal_position" type="string" isRequired={false}>Values: <code>left</code>, <code>right</code>, <code>center</code>. Default: <code>center</code></ParamLine>
                            <ParamLine name="starting_number" type="integer" isRequired={false}>The first page number. Default: <code>1</code></ParamLine>
                            <ParamLine name="text" type="string" isRequired={false}>Format text. {"{n}"} is page number, {"{p}"} is total pages. e.g. "Page {"{n}"} of {"{p}"}". Default: <code>{"{n}"}</code></ParamLine>
                            <ParamLine name="font_family" type="string" isRequired={false}>Default: <code>Arial</code></ParamLine>
                            <ParamLine name="font_style" type="string" isRequired={false}>Default: <code>null</code> (Regular)</ParamLine>
                            <ParamLine name="font_size" type="integer" isRequired={false}>Default: <code>14</code></ParamLine>
                            <ParamLine name="font_color" type="string" isRequired={false}>Hex color. Default: <code>#000000</code></ParamLine>
                        </ApiSection>

                        <ApiSection id="watermark-pdf" title={t('tool.watermark-pdf.title')} refProp={sectionsRefs['watermark-pdf']}>
                           <ParamLine name="mode" type="string" isRequired>Values: <code>text</code>, <code>image</code>.</ParamLine>
                           <ParamLine name="text" type="string" isRequired="REQUIRED IF MODE IS TEXT">Text to stamp.</ParamLine>
                           <ParamLine name="image" type="string" isRequired="REQUIRED IF MODE IS IMAGE">Server filename of uploaded image.</ParamLine>
                           <ParamLine name="pages" type="string" isRequired={false}>Pages to apply watermark. Default: <code>all</code></ParamLine>
                           <ParamLine name="layer" type="string" isRequired={false}>Values: <code>below</code>, <code>above</code>. Default: <code>below</code></ParamLine>
                        </ApiSection>
                        
                        <ApiSection id="powerpoint-to-pdf" title={t('tool.powerpoint-to-pdf.title')} refProp={sectionsRefs['powerpoint-to-pdf']}>
                            <p>Converts a PowerPoint presentation (PPTX) to a PDF file.</p>
                            <ParamLine name="conformance" type="string" isRequired={false}>If set to <code>pdfa</code>, it will output a PDF/A compliant file. Default: <code>null</code></ParamLine>
                        </ApiSection>

                        <ApiSection id="excel-to-pdf" title={t('tool.excel-to-pdf.title')} refProp={sectionsRefs['excel-to-pdf']}>
                            <p>Converts an Excel spreadsheet (XLSX) to a PDF file.</p>
                            <ParamLine name="conformance" type="string" isRequired={false}>If set to <code>pdfa</code>, it will output a PDF/A compliant file. Default: <code>null</code></ParamLine>
                        </ApiSection>

                        <ApiSection id="pdf-to-word" title={t('tool.pdf-to-word.title')} refProp={sectionsRefs['pdf-to-word']}>
                            <p>Converts a PDF file to an editable Word document (DOCX). This tool extracts text content.</p>
                            <p>This tool has no extra options.</p>
                        </ApiSection>

                        <ApiSection id="pdf-to-powerpoint" title={t('tool.pdf-to-powerpoint.title')} refProp={sectionsRefs['pdf-to-powerpoint']}>
                            <p>Converts each page of a PDF file into an image and places it on a separate slide in a PowerPoint presentation (PPTX).</p>
                            <p>This tool has no extra options.</p>
                        </ApiSection>

                        <ApiSection id="pdf-to-excel" title={t('tool.pdf-to-excel.title')} refProp={sectionsRefs['pdf-to-excel']}>
                            <p>Extracts text content from each page of a PDF and organizes it into separate sheets in an Excel spreadsheet (XLSX).</p>
                            <p>This tool has no extra options.</p>
                        </ApiSection>

                        <ApiSection id="repair-pdf" title={t('tool.repair-pdf.title')} refProp={sectionsRefs['repair-pdf']}>
                            <p>Repair tool has no options.</p>
                        </ApiSection>

                        <ApiSection id="rotate-pdf" title={t('tool.rotate-pdf.title')} refProp={sectionsRefs['rotate-pdf']}>
                            <p>Rotate tool has no options, just set <code>rotation</code> property in file.</p>
                        </ApiSection>
                        
                        <ApiSection id="protect-pdf" title={t('tool.protect-pdf.title')} refProp={sectionsRefs['protect-pdf']}>
                            <ParamLine name="password" type="string" isRequired>Password to protect the file.</ParamLine>
                            <ParamLine name="encryption" type="string" isRequired={false}>Values: <code>aes_256</code>, <code>aes_128</code>. Default: <code>aes_256</code></ParamLine>
                            <ParamLine name="allow_print" type="string" isRequired={false}>Values: <code>all</code>, <code>none</code>. Default: <code>all</code></ParamLine>
                            <ParamLine name="allow_copy" type="string" isRequired={false}>Values: <code>all</code>, <code>none</code>. Default: <code>all</code></ParamLine>
                            <ParamLine name="allow_edit" type="string" isRequired={false}>Values: <code>all</code>, <code>none</code>. Default: <code>all</code></ParamLine>
                        </ApiSection>

                        <ApiSection id="pdf-to-pdfa" title={t('tool.pdf-to-pdfa.title')} refProp={sectionsRefs['pdf-to-pdfa']}>
                            <ParamLine name="conformance" type="string" isRequired>Values: <code>pdfa-1b</code>, <code>pdfa-2b</code>, <code>pdfa-3b</code>.</ParamLine>
                        </ApiSection>

                        <ApiSection id="html-to-pdf" title={t('tool.html-to-pdf.title')} refProp={sectionsRefs['html-to-pdf']}>
                            <ParamLine name="single_page" type="boolean" isRequired={false}>If true, it generates a single page PDF. Default: <code>false</code></ParamLine>
                        </ApiSection>
                        
                        <ApiSection id="extract-text" title={t('tool.extract-text.title')} refProp={sectionsRefs['extract-text']}>
                            <p>Extract text tool has no extra parameters.</p>
                        </ApiSection>
                        
                        <ApiSection id="edit-pdf" title={t('tool.edit-pdf.title')} refProp={sectionsRefs['edit-pdf']}>
                             <ParamLine name="elements" type="array" isRequired>
                                <p>An array of elements to add to the PDF.</p>
                             </ParamLine>
                        </ApiSection>

                        <ApiSection id="crop-pdf" title={t('tool.crop-pdf.title')} refProp={sectionsRefs['crop-pdf']}>
                            <p>Crops the pages of a PDF file by the specified margins.</p>
                            <ParamLine name="crop_box" type="string" isRequired>
                                <p>The margins to crop from each side, in points (1 point = 1/72 inch). Format is "top right bottom left".</p>
                                <p>Example: <code>"72 36 72 36"</code></p>
                            </ParamLine>
                        </ApiSection>
                        
                        <ApiSection id="remove-background" title={t('tool.remove-background.title')} refProp={sectionsRefs['remove-background']}>
                            <p>Automatically removes the background from an image using AI. The output is a PNG file with a transparent background.</p>
                            <p>This tool has no extra options.</p>
                        </ApiSection>

                        <ApiSection id="resize-image" title={t('tool.resize-image.title')} refProp={sectionsRefs['resize-image']}>
                           <ParamLine name="resize_mode" type="string" isRequired={false}>
                                <p>Choose the resize mode. Accepted values:</p>
                                <ul><li><code>pixels</code>: the resize will be set using pixels.</li><li><code>percentage</code>: the resize will be set as a percentage of the original image.</li></ul>
                                <p>Default: <code>pixels</code></p>
                           </ParamLine>
                           <ParamLine name="pixels_width" type="integer" isRequired={"REQUIRED IF RESIZE_MODE IS PIXELS"}>The width in pixels of the resized image.</ParamLine>
                           <ParamLine name="pixels_height" type="integer" isRequired={"REQUIRED IF RESIZE_MODE IS PIXELS"}>The height in pixels of the resized image.</ParamLine>
                           <ParamLine name="percentage" type="integer" isRequired={"REQUIRED IF RESIZE_MODE IS PERCENTAGE"}>The percentage value to resize.</ParamLine>
                           <ParamLine name="maintain_ratio" type="boolean" isRequired={false}>If set as true, resize will keep aspect ratio and images will not be distort. Default: <code>true</code></ParamLine>
                           <ParamLine name="no_enlarge_if_smaller" type="boolean" isRequired={false}>Controls if the image can be bigger than the original on resize. Default: <code>true</code></ParamLine>
                        </ApiSection>

                        <ApiSection id="crop-image" title={t('tool.crop-image.title')} refProp={sectionsRefs['crop-image']}>
                           <ParamLine name="width" type="integer" isRequired>The width in pixels of the area to crop.</ParamLine>
                           <ParamLine name="height" type="integer" isRequired>The height in pixels of the area to crop.</ParamLine>
                           <ParamLine name="x" type="integer" isRequired={false}>The horizontal point where start to crop. Default: <code>0</code></ParamLine>
                           <ParamLine name="y" type="integer" isRequired={false}>The vertical point where start to crop. Default: <code>0</code></ParamLine>
                        </ApiSection>

                        <ApiSection id="compress-image" title={t('tool.compress-image.title')} refProp={sectionsRefs['compress-image']}>
                            <ParamLine name="compression_level" type="string" isRequired>
                                <p>Compression level. Accepted values: <code>extreme</code>=Extreme compression, <code>recommended</code>=Recommended compression, <code>low</code>=Low compression.</p>
                                <p>Default: <code>recommended</code></p>
                           </ParamLine>
                        </ApiSection>
                        
                        <ApiSection id="convert-from-jpg" title={t('tool.convert-from-jpg.title')} refProp={sectionsRefs['convert-from-jpg']}>
                            <ParamLine name="to" type="string" isRequired={false}>
                                <p>The format to convert to. Accepted values are <code>jpg</code>, <code>png</code>, <code>gif</code>, <code>gif_animation</code> (static or animated) and <code>heic</code>. Convert to jpg can be (almost) from any image format. Convert to png and gif can be only from jpg images.</p>
                                <p>Default: <code>jpg</code></p>
                           </ParamLine>
                           <ParamLine name="gif_time" type="integer" isRequired={"REQUIRED IF TO IS GIF_ANIMATED"}>
                                <p>Only for gif_animation, define the seconds per image, in hundredths of a second.</p>
                                <p>Default: <code>50</code></p>
                           </ParamLine>
                           <ParamLine name="gif_loop" type="integer" isRequired={"REQUIRED IF TO IS GIF_ANIMATED"}>
                                <p>Set if animation stops at the end or loops forever.</p>
                                <p>Default: <code>true</code></p>
                           </ParamLine>
                        </ApiSection>
                        
                        <ApiSection id="watermark-image" title={t('tool.watermark-image.title')} refProp={sectionsRefs['watermark-image']}>
                            <ParamLine name="elements" type="array" isRequired>
                                <p>An array of elements to stamp. This means you can set multiple elements to stamp.</p>
                                <div className="pl-4 mt-2 border-l-2 dark:border-gray-700 space-y-4">
                                    <NestedParam name="type" type="string" isRequired={false}>The type for the element. Accepted values: <code>image</code> or <code>text</code>. Default: <code>text</code></NestedParam>
                                    <NestedParam name="text" type="string" isRequired="REQUIRED IF TYPE IS TEXT">The text to stamp</NestedParam>
                                    <NestedParam name="image" type="string" isRequired="REQUIRED IF TYPE IS IMAGE">The stamp image must be uploaded in the Upload resource. This image parameter must refer to the server_filename (JPG or PNG).</NestedParam>
                                    <NestedParam name="gravity" type="string" isRequired={false}>Accepted values: <code>North</code>, <code>NorthEast</code>, <code>NorthWest</code>, <code>Center</code>, <code>CenterEast</code>, <code>CenterWest</code>, <code>East</code>, <code>West</code>, <code>South</code>, <code>SouthEast</code>, <code>SouthWest</code>. Default: <code>Center</code></NestedParam>
                                    <NestedParam name="vertical_adjustment_percent" type="integer" isRequired={false}>Adjust how much space must modify the position of the position defined in <code>gravity</code>, based on a percent of the base image, it accepts positive and negative values. Default: <code>0</code></NestedParam>
                                    <NestedParam name="horizontal_adjustment_percent" type="integer" isRequired={false}>Adjust how much space must modify the position of the position defined in <code>gravity</code>, based on a percent of the base image, it accepts positive and negative values. Default: <code>0</code></NestedParam>
                                    <NestedParam name="rotation" type="integer" isRequired={false}>Angle of rotation. Accepted integer range: 0-360. Default: <code>0</code></NestedParam>
                                    <NestedParam name="font_family" type="string" isRequired={false}>Accepted values: <code>Arial</code>, <code>Arial Unicode MS</code>, <code>Verdana</code>, <code>Courier</code>, <code>Times New Roman</code>, <code>Comic Sans MS</code>, <code>WenQuanYi Zen Hei</code>, <code>Lohit Marathi</code>. Default: <code>Arial</code></NestedParam>
                                    <NestedParam name="font_style" type="string" isRequired={false}>Accepted values: <code>null</code> (Regular/Normal), <code>Bold</code>, <code>Italic</code>. Default: <code>null</code></NestedParam>
                                    <NestedParam name="font_size" type="integer" isRequired={false}>Default: <code>14</code></NestedParam>
                                    <NestedParam name="font_color" type="string" isRequired={false}>Hexadecimal color. Default: <code>#000000</code></NestedParam>
                                    <NestedParam name="transparency" type="integer" isRequired={false}>Percentage of opacity for stamping text or image. Accepted integer range 1-100. Default: <code>100</code></NestedParam>
                                    <NestedParam name="mosaic" type="boolean" isRequired={false}>If <code>true</code>, this value overrides all position parameters and stamps the image or text 9 times per page. Default: <code>false</code></NestedParam>
                                </div>
                            </ParamLine>
                        </ApiSection>

                        <ApiSection id="download" title="Download" refProp={sectionsRefs.download}>
                            <p>Download the output files for the given task. If there is only one output file, it is served directly. If there is more than one file, they are served in a compressed ZIP folder. If there is more than one processed file, there will be multiple output files for every processed file. The ZIP will contain a folder for every processed file.</p>
                             <EndpointCard method="GET" path={"https://{server}/v1/download/{task}"}>Download output files</EndpointCard>
                             <ResponseCard>{`// ArrayBuffer`}</ResponseCard>
                        </ApiSection>

                        <ApiSection id="task" title="Task" refProp={sectionsRefs.task}>
                            <p>The <code>/task</code> resource gives information about processed tasks and the metadata related of their uploaded and result files. For security reasons, only can be accessed by server side code providing your <code>secret_key</code> as a parameter.</p>
                            
                            <h4>List and filter all tasks</h4>
                            <EndpointCard method="POST" path="https://api.ilovepdfly.com/v1/task">
                                <p>Lists all tasks. Results are offered paginated in 50 results per page.</p>
                            </EndpointCard>
                            <ParamLine name="secret_key" type="string" isRequired>Your project secret key.</ParamLine>
                            <ParamLine name="page" type="integer" isRequired={false}>Results are offered paginated in 50 results per page. Default: <code>1</code></ParamLine>
                            <ParamLine name="tool" type="string" isRequired={false}>Filter tasks by tool.</ParamLine>
                            <ParamLine name="status" type="string" isRequired={false}>Filter tasks by task status type, for example TaskSuccess.</ParamLine>
                            <ParamLine name="custom_int" type="integer" isRequired={false}>Filter tasks by <code>custom_int</code>.</ParamLine>

                            <h4 className="mt-8">Task status types</h4>
                            <div className="grid grid-cols-[auto_1fr] gap-x-4 gap-y-2 my-4">
                                <strong>TaskWaiting</strong> <span>Files for the task have been uploaded but processing order has not been received yet.</span>
                                <strong>TaskProcessing</strong> <span>The task is currently processing files.</span>
                                <strong>TaskSuccess</strong> <span>The task has already been processed successfully.</span>
                                <strong>TaskSuccessWithWarnings</strong> <span>The task has already been processed successfully with warnings.</span>
                                <strong>TaskError</strong> <span>The task has been processed unsuccessfully.</span>
                                <strong>TaskDeleted</strong> <span>The task has already been deleted.</span>
                                <strong>TaskNotFound</strong> <span>Task not found.</span>
                            </div>

                            <h4 className="mt-8">Delete task</h4>
                            <p>All tasks and their related files are deleted after two hours of being processed. However, if you need to delete the task and all related files immediately, you can do so by sending a DELETE request to /task.</p>
                            <EndpointCard method="DELETE" path={"https://{server}/v1/task/{task}"}>Delete Task</EndpointCard>
                            
                            <h4 className="mt-8">Connect task</h4>
                            <p>If you need to apply different tools on the same files, <strong>connected task</strong> resource will allow you to execute a new task on the files resulting from the previous tool. Using this resource means that you don't need to upload your files again.</p>
                            <EndpointCard method="POST" path={"https://{server}/v1/task/next"}>Connect Task</EndpointCard>
                            <ParamLine name="task" type="string" isRequired>The parent task id.</ParamLine>
                            <ParamLine name="tool" type="string" isRequired>The tool for the next task.</ParamLine>
                        </ApiSection>

                        <ApiSection id="signatures" title="Signatures" refProp={sectionsRefs.signatures}>
                            <p>The Signatures API allows you to create and manage electronic signature requests.</p>
                        </ApiSection>

                        <ApiSection id="create_signature_request" title="Create signature request" refProp={sectionsRefs.create_signature_request}>
                             <EndpointCard method="POST" path={"https://{server}/v1/signature"}>
                                <p>This endpoint is used to create a signature request.</p>
                             </EndpointCard>
                             <ParamLine name="task" type="string" isRequired>Use the same task ID obtained when calling the <code>start</code> API call.</ParamLine>
                             <ParamLine name="files" type="array" isRequired>Files to be signed. The order of the array is the same order as the receivers will see it. Maximum number allowed is 5.</ParamLine>
                             <ParamLine name="brand_name" type="string" isRequired={false}>Name of your brand.</ParamLine>
                             <ParamLine name="brand_logo" type="string" isRequired={false}>Server filename of the uploaded logo file. See files.</ParamLine>
                             <ParamLine name="signers" type="array" isRequired>Receivers that participate in the signature process. Each signer has the following attributes...</ParamLine>
                             <ParamLine name="files" type="array" isRequired>Files that a receiver of type <code>signer</code> needs to sign.</ParamLine>
                             <ParamLine name="elements" type="array" isRequired>Definition of the elements in a PDF document.</ParamLine>
                        </ApiSection>

                        <ApiSection id="list_signatures" title="List Signatures" refProp={sectionsRefs.list_signatures}>
                             <p>List all created signature requests.</p>
                             <EndpointCard method="GET" path="https://api.ilovepdfly.com/v1/signature/list?page=0&per-page=100">List all created signature requests</EndpointCard>
                             <ParamLine name="page" type="integer" isRequired={false}>Lookup page. Default: <code>0</code></ParamLine>
                             <ParamLine name="per-page" type="integer" isRequired={false}>Paginator size. Accepted values are in the range [1, 100]. Default: <code>20</code></ParamLine>
                        </ApiSection>

                        <ApiSection id="get_signature_status" title="Get Signature status" refProp={sectionsRefs.get_signature_status}>
                            <EndpointCard method="GET" path="https://api.ilovepdfly.com/v1/signature/requestreview/<token_requester>">Get Signature status</EndpointCard>
                        </ApiSection>
                        
                        <ApiSection id="get_receiver_info" title="Get Receiver info" refProp={sectionsRefs.get_receiver_info}>
                            <EndpointCard method="GET" path="https://api.ilovepdfly.com/v1/signature/receiver/info/<receiver_token_requester>">Get Receiver info</EndpointCard>
                        </ApiSection>
                        
                        <ApiSection id="download_audit" title="Download Audit" refProp={sectionsRefs.download_audit}>
                            <p>It downloads the audit PDF file.</p>
                            <EndpointCard method="GET" path={"https://{server}/v1/signature/<token_requester>/download-audit"}>Download Audit</EndpointCard>
                        </ApiSection>
                        
                        <ApiSection id="download_original_files" title="Download Original files" refProp={sectionsRefs.download_original_files}>
                             <p>It downloads the original files. It returns a PDF file if a single file was uploaded. Otherwise a zip file with all uploaded files is returned.</p>
                            <EndpointCard method="GET" path={"https://{server}/v1/signature/<token_requester>/download-original"}>Download Original files</EndpointCard>
                        </ApiSection>
                        
                        <ApiSection id="download_signed_files" title="Download Signed files" refProp={sectionsRefs.download_signed_files}>
                            <p>It downloads the signed files. It returns a PDF file if a single file was uploaded. Otherwise a zip file with all uploaded files is returned.</p>
                            <EndpointCard method="GET" path={"https://{server}/v1/signature/<token_requester>/download-signed"}>Download Signed files</EndpointCard>
                        </ApiSection>

                        <ApiSection id="fix_receiver_email" title="Fix Receiver Email" refProp={sectionsRefs.fix_receiver_email}>
                             <p>Use this endpoint to correct the receiver's email address in the event that the email was not delivered to a valid email address.</p>
                             <EndpointCard method="PUT" path="https://api.ilovepdfly.com/v1/signature/receiver/fix-email/<receiver_token_requester>">Fix Receiver Email</EndpointCard>
                             <ParamLine name="email" type="string" isRequired>New valid email for the receiver.</ParamLine>
                        </ApiSection>

                        <ApiSection id="fix_signer_phone" title="Fix Signer Phone" refProp={sectionsRefs.fix_signer_phone}>
                            <p>Use this endpoint to correct the signer's mobile number in the event that the SMS was not delivered to a valid mobile number.</p>
                            <EndpointCard method="PUT" path="https://api.ilovepdfly.com/v1/signature/fix/phone/<signer_token_requester>">Fix Signer Phone</EndpointCard>
                            <ParamLine name="phone" type="string" isRequired>New valid mobile number for the signer.</ParamLine>
                        </ApiSection>

                        <ApiSection id="send_reminders" title="Send Reminders" refProp={sectionsRefs.send_reminders}>
                            <p>When this endpoint is called, sends an email reminder to the receivers that did not finished its action.</p>
                            <EndpointCard method="POST" path="https://api.ilovepdfly.com/v1/signature/sendReminder/<token_requester>">Send Reminder</EndpointCard>
                        </ApiSection>
                        
                        <ApiSection id="void_signature" title="Void Signature" refProp={sectionsRefs.void_signature}>
                            <p>It voids a signature that it is currently in progress. Once voided, it will not be accessible for any receiver of the request.</p>
                            <EndpointCard method="PUT" path="https://api.ilovepdfly.com/v1/signature/void/<token_requester>">Void Signature</EndpointCard>
                        </ApiSection>
                        
                        <ApiSection id="increase_expiration_days" title="Increase Expiration Days" refProp={sectionsRefs.increase_expiration_days}>
                            <p>Increase the number of days in order to prevent the request from expiring and give receivers extra time to perform remaining actions.</p>
                            <EndpointCard method="PUT" path="https://api.ilovepdfly.com/v1/signature/increase-expiration-days/<token_requester>">Increase Expiration Days</EndpointCard>
                            <ParamLine name="days" type="integer" isRequired>The number of days to increase: a minimum of 1 and a maximum of 130.</ParamLine>
                        </ApiSection>

                        <ApiSection id="topics" title="Topics" refProp={sectionsRefs.topics}>
                            <p>General topics regarding the API.</p>
                        </ApiSection>
                        
                        <ApiSection id="security" title="Security" refProp={sectionsRefs.security}>
                            <p>As an API user, you will only have access to your tasks and files. The original and processed files are deleted after an hour (depending on your tier, it can be more). After processing and downloading the output files you can also remove the task and the files involved in the process.</p>
                        </ApiSection>

                         <ApiSection id="errors" title="Errors" refProp={sectionsRefs.errors}>
                            <p>I Love PDFLY API uses conventional HTTP response codes to indicate the success or failure of an API request. In general, codes in the 2xx range indicate success, codes in the 4xx range indicate an error that failed due to the information provided (e.g. a required parameter was omitted, a process failed, etc.), and codes in the 5xx range indicate an error with I Love PDFLY's servers. All error responses have the same structure, and you'll find all the arguments and errors specified in the param.</p>
                        </ApiSection>

                        <ApiSection id="testing" title="Testing" refProp={sectionsRefs.testing}>
                            <h4>Debug parameter</h4>
                            <p>Any resource can be called with an additional parameter <code>debug</code>. When sending the debug parameter equal <code>true</code> the resource won't process the request but it will output the parameters received in the request.</p>
                            <p>Just make sure to add in the payload of your request the parameter <code>debug</code> equal to <code>true</code>.</p>
                        </ApiSection>
                        
                        <ApiSection id="credit_consumption" title="Credit consumption" refProp={sectionsRefs.credit_consumption}>
                            <h4>How does credit consumption work?</h4>
                            <p>I Love PDFLY's subscriptions and pre-paid packages work using credits. These credits allow you to process Files, use Digital signatures, and add SMS authentication to Signature Requests.</p>
                            <h4>How are the credits consumed?</h4>
                            <p>I Love PDF provides credits for PDF & Image processing, Digital Signatures, and SMS authentication. Depending on the tool, the credits consumed vary based on number of files, number of tasks or number of pages. Please refer to the pricing page for detailed information.</p>
                        </ApiSection>

                        <ApiSection id="webhooks" title="Webhooks" refProp={sectionsRefs.webhooks}>
                           <p>You can configure the specific URLs to which you want to receive webhooks, ensuring that each event type is directed to the appropriate endpoint within your application from your user area. Additionally, you have the flexibility to select which events your webhook should subscribe to, allowing you to tailor the notifications to suit your application's needs. This configurability ensures precise and relevant data delivery, optimizing your system's interaction with our service.</p>
                        </ApiSection>
                        
                        <ApiSection id="fonts_compatibility" title="Fonts compatibility" refProp={sectionsRefs.fonts_compatibility}>
                            <p>For tools such as Add Page Numbers and Add Watermark, which allow you to set a font family for its content, there is a list of compatible fonts to use with any content, there is a list of compatible fonts to use with any content on this list, it could cause spelling issues.</p>
                        </ApiSection>
                    </main>
                 </div>
            </div>
        </div>
    );
};

export default ApiReferencePage;
