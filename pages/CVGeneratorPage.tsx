import React, { useState, useRef, useCallback, useEffect } from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import { useDropzone } from 'react-dropzone';
import html2canvas from 'html2canvas';
import { jsPDF } from 'jspdf';
import { useAuth } from '../contexts/AuthContext.tsx';
import { DownloadIcon, PlusIcon, EditIcon, TrashIcon, UploadIcon, UserIcon, BriefcaseIcon, StudentIcon, PuzzleIcon, BrainIcon } from '../components/icons.tsx';
import { TOOLS } from '../constants.ts';
// FIX: Import RichTextEditor to be used for description fields.
import RichTextEditor from '../components/RichTextEditor.tsx';

// ===================================================================
// TYPES & INITIAL DATA
// ===================================================================

type Experience = { id: number; jobTitle: string; company: string; startDate: string; endDate: string; description: string; };
type Education = { id: number; degree: string; school: string; startDate: string; endDate: string; description: string; };
type Project = { id: number; name: string; description: string; };
type Skill = { id: number; name: string; };
type Template = 'classic' | 'modern' | 'minimalist';

type CVData = {
    profilePicture: string | null;
    fullName: string;
    professionalTitle: string;
    summary: string;
    contact: { email: string; phone: string; address: string; website: string; linkedin: string; };
    experiences: Experience[];
    educations: Education[];
    projects: Project[];
    skills: Skill[];
};


const initialData: CVData = {
    profilePicture: null,
    fullName: "Bishal Mishra",
    professionalTitle: "Senior Frontend Engineer",
    summary: "A passionate and creative senior frontend engineer with over 10 years of experience in building modern, responsive, and user-friendly web applications. Proficient in React, TypeScript, and modern web technologies. Committed to writing clean, high-quality code and creating exceptional user experiences.",
    contact: { email: "bishal@example.com", phone: "+1 234 567 890", address: "Kathmandu, Nepal", website: "bishal.dev", linkedin: "linkedin.com/in/bishal" },
    experiences: [{ id: 1, jobTitle: "Senior Frontend Engineer", company: "Tech Solutions Inc.", startDate: "2020-01", endDate: "Present", description: "<ul><li>Led development of a large-scale React application.</li><li>Mentored junior developers and conducted code reviews.</li></ul>" }],
    educations: [{ id: 1, degree: "Bachelor of Science in Computer Science", school: "University of Technology", startDate: "2016-08", endDate: "2020-05", description: "Graduated with Honors, GPA: 3.8/4.0" }],
    projects: [{ id: 1, name: "I Love PDFLY", description: "A comprehensive suite of online PDF tools with a focus on privacy and client-side processing." }],
    skills: [{ id: 1, name: "React" }, { id: 2, name: "TypeScript" }, { id: 3, name: "UI/UX Design" }, { id: 4, name: "Node.js" }],
};

// ===================================================================
// HELPER COMPONENTS & FUNCTIONS
// ===================================================================

const formatCurrency = (amount: number, currencySymbol: string) => {
    return `${currencySymbol}${amount.toFixed(2)}`;
};

const EditableField: React.FC<{ value: string; onChange: (value: string) => void; placeholder?: string; isTextarea?: boolean; className?: string; type?: string }> = ({ value, onChange, placeholder, isTextarea, className, type = 'text' }) => {
    const Component = isTextarea ? 'textarea' : 'input';
    return (
        <Component
            value={value}
            onChange={(e) => onChange(e.target.value)}
            placeholder={placeholder}
            className={`bg-transparent w-full focus:outline-none focus:bg-gray-100 dark:focus:bg-gray-800 rounded p-1 text-sm ${className}`}
            rows={isTextarea ? 2 : undefined}
            type={type}
        />
    );
};

// ===================================================================
// TEMPLATE COMPONENTS
// ===================================================================

const TemplateRenderer: React.FC<{ data: CVData, template: Template, color: string }> = ({ data, template, color }) => {
    const textColor = 'text-gray-800';

    const sectionTitleStyle: React.CSSProperties = {
        color: color,
        borderBottom: `2px solid ${color}80`, // Hex with alpha for opacity
    };

    return (
        <div className={`p-8 bg-white ${textColor} font-sans text-sm A4-size-simulation`}>
            {/* Header */}
            <header className="flex items-center gap-6 mb-8">
                {data.profilePicture && <img src={data.profilePicture} alt="Profile" className="h-28 w-28 rounded-full object-cover border-4 border-gray-200" />}
                <div>
                    <h1 className="text-4xl font-bold text-gray-900">{data.fullName}</h1>
                    <h2 className="text-xl font-semibold" style={{ color }}>{data.professionalTitle}</h2>
                </div>
            </header>
            
            <div className="grid grid-cols-3 gap-8">
                {/* Left Column (Contact, Skills) */}
                <aside className="col-span-1 space-y-6">
                    <section>
                        <h3 className="font-bold text-lg border-b-2 pb-1 mb-3" style={sectionTitleStyle}>Contact</h3>
                        <div className="space-y-2 text-xs">
                            <p><strong>Email:</strong> {data.contact.email}</p>
                            <p><strong>Phone:</strong> {data.contact.phone}</p>
                            <p><strong>Address:</strong> {data.contact.address}</p>
                            <p><strong>Website:</strong> {data.contact.website}</p>
                            <p><strong>LinkedIn:</strong> {data.contact.linkedin}</p>
                        </div>
                    </section>
                    <section>
                        <h3 className="font-bold text-lg border-b-2 pb-1 mb-3" style={sectionTitleStyle}>Skills</h3>
                        <ul className="flex flex-wrap gap-2">
                            {data.skills.map(skill => <li key={skill.id} style={{ backgroundColor: `${color}1A`, color }} className="text-xs font-semibold px-3 py-1 rounded-full">{skill.name}</li>)}
                        </ul>
                    </section>
                </aside>
                
                {/* Right Column (Summary, Experience, Education, Projects) */}
                <main className="col-span-2 space-y-6">
                    <section>
                        <h3 className="font-bold text-lg border-b-2 pb-1 mb-3" style={sectionTitleStyle}>Summary</h3>
                        <p className="text-sm leading-relaxed">{data.summary}</p>
                    </section>
                     <section>
                        <h3 className="font-bold text-lg border-b-2 pb-1 mb-3" style={sectionTitleStyle}>Work Experience</h3>
                        <div className="space-y-4">
                            {data.experiences.map(exp => (
                                <div key={exp.id}>
                                    <div className="flex justify-between items-baseline">
                                        <h4 className="font-bold text-base">{exp.jobTitle}</h4>
                                        <p className="text-xs font-mono">{exp.startDate} - {exp.endDate}</p>
                                    </div>
                                    <p className="text-sm font-semibold italic text-gray-600">{exp.company}</p>
                                    <div className="prose prose-sm max-w-none mt-1" dangerouslySetInnerHTML={{ __html: exp.description }} />
                                </div>
                            ))}
                        </div>
                    </section>
                    <section>
                        <h3 className="font-bold text-lg border-b-2 pb-1 mb-3" style={sectionTitleStyle}>Education</h3>
                        <div className="space-y-4">
                            {data.educations.map(edu => (
                                <div key={edu.id}>
                                    <div className="flex justify-between items-baseline">
                                        <h4 className="font-bold text-base">{edu.degree}</h4>
                                        <p className="text-xs font-mono">{edu.startDate} - {edu.endDate}</p>
                                    </div>
                                    <p className="text-sm font-semibold italic text-gray-600">{edu.school}</p>
                                    <div className="prose prose-sm max-w-none mt-1" dangerouslySetInnerHTML={{ __html: edu.description }} />
                                </div>
                            ))}
                        </div>
                    </section>
                    <section>
                        <h3 className="font-bold text-lg border-b-2 pb-1 mb-3" style={sectionTitleStyle}>Projects</h3>
                         <div className="space-y-4">
                            {data.projects.map(proj => (
                                <div key={proj.id}>
                                    <h4 className="font-bold text-base">{proj.name}</h4>
                                    <div className="prose prose-sm max-w-none mt-1" dangerouslySetInnerHTML={{ __html: proj.description }} />
                                </div>
                            ))}
                        </div>
                    </section>
                </main>
            </div>
        </div>
    );
};

// ===================================================================
// FORM COMPONENTS
// ===================================================================
const FormSection: React.FC<{ title: string; children: React.ReactNode }> = ({ title, children }) => (
    <div className="space-y-4">
        <h3 className="text-lg font-bold border-b pb-2 mb-4">{title}</h3>
        {children}
    </div>
);
const Input: React.FC<React.InputHTMLAttributes<HTMLInputElement>> = (props) => (
    <input {...props} className="w-full p-2 bg-gray-50 dark:bg-gray-800 border border-gray-300 dark:border-gray-600 rounded-md text-sm" />
);
const Textarea: React.FC<React.TextareaHTMLAttributes<HTMLTextAreaElement>> = (props) => (
    <textarea {...props} rows={4} className="w-full p-2 bg-gray-50 dark:bg-gray-800 border border-gray-300 dark:border-gray-600 rounded-md text-sm" />
);

// ===================================================================
// MAIN PAGE COMPONENT
// ===================================================================
const CVGeneratorPage: React.FC = () => {
    const tool = TOOLS.find(t => t.id === 'cv-generator');
    const [data, setData] = useState<CVData>(initialData);
    const [activeSection, setActiveSection] = useState('personal');
    const [template, setTemplate] = useState<Template>('classic');
    const [color, setColor] = useState('#e53935'); // Default to brand-red
    const cvPreviewRef = useRef<HTMLDivElement>(null);
    const [isDownloading, setIsDownloading] = useState(false);

    useEffect(() => {
      document.title = "Free CV Generator | Create a Professional Resume - I Love PDFLY";
    }, []);

    const onDrop = useCallback((acceptedFiles: File[]) => {
        if (acceptedFiles[0]) {
            const reader = new FileReader();
            reader.onload = () => setData(d => ({ ...d, profilePicture: reader.result as string }));
            reader.readAsDataURL(acceptedFiles[0]);
        }
    }, []);
    const { getRootProps, getInputProps, isDragActive } = useDropzone({ onDrop, accept: { 'image/*': [] } });
    
    const handleDownloadPdf = async () => {
        const element = cvPreviewRef.current;
        if (!element) return;
        setIsDownloading(true);
        const canvas = await html2canvas(element, { scale: 3 });
        const imgData = canvas.toDataURL('image/png');
        const pdf = new jsPDF('p', 'mm', 'a4');
        const pdfWidth = pdf.internal.pageSize.getWidth();
        const pdfHeight = (canvas.height * pdfWidth) / canvas.width;
        pdf.addImage(imgData, 'PNG', 0, 0, pdfWidth, pdfHeight);
        pdf.save(`${data.fullName}-CV.pdf`);
        setIsDownloading(false);
    };

    const sections = [
        { id: 'personal', name: 'Personal', icon: UserIcon },
        { id: 'experience', name: 'Experience', icon: BriefcaseIcon },
        { id: 'education', name: 'Education', icon: StudentIcon },
        { id: 'skills', name: 'Skills', icon: BrainIcon },
        { id: 'projects', name: 'Projects', icon: PuzzleIcon },
    ];

    const handleArrayChange = <K extends 'experiences' | 'educations' | 'projects' | 'skills'>(
        key: K, 
        id: number, 
        field: keyof CVData[K][0], 
        value: any
    ) => {
        setData(prev => {
            const newArray = (prev[key] as any[]).map(item => 
                item.id === id ? { ...item, [field]: value } : item
            );
            return { ...prev, [key]: newArray };
        });
    };

    const addToArray = <K extends 'experiences' | 'educations' | 'projects' | 'skills'>(
        key: K, 
        newItem: Omit<CVData[K][0], 'id'>
    ) => {
        setData(prev => ({ 
            ...prev, 
            [key]: [...(prev[key] as any[]), { id: Date.now(), ...newItem }] 
        }));
    };

    const removeFromArray = (key: 'experiences' | 'educations' | 'projects' | 'skills', id: number) => {
        setData(prev => ({ ...prev, [key]: (prev[key] as {id: number}[]).filter(item => item.id !== id) }));
    };

    return (
        <div className="min-h-screen text-gray-800 dark:text-gray-100">
            <header className="bg-white dark:bg-black p-4 shadow-md flex justify-between items-center">
                <div className="flex items-center gap-3">
                    {tool && <tool.Icon className={`h-8 w-8 ${tool.textColor}`} />}
                    <h1 className="text-2xl font-bold">CV Generator</h1>
                </div>
                <button onClick={handleDownloadPdf} disabled={isDownloading} className="flex items-center gap-2 bg-brand-red hover:bg-brand-red-dark text-white font-bold py-2 px-6 rounded-lg transition-colors disabled:bg-red-300">
                    <DownloadIcon className="h-5 w-5"/> {isDownloading ? 'Downloading...' : 'Download PDF'}
                </button>
            </header>

            <div className="flex flex-col lg:flex-row">
                {/* Controls Panel */}
                <aside className="w-full lg:w-1/3 xl:w-1/4 bg-white dark:bg-black p-4 overflow-y-auto" style={{ height: 'calc(100vh - 68px)' }}>
                    <div className="space-y-6">
                        {/* Section Navigation */}
                        <div className="flex flex-wrap gap-1">
                            {sections.map(s => <button key={s.id} onClick={() => setActiveSection(s.id)} className={`flex items-center gap-2 p-2 rounded-md text-sm font-semibold transition-colors ${activeSection === s.id ? 'bg-brand-red/10 text-brand-red' : 'hover:bg-gray-100 dark:hover:bg-gray-800'}`}><s.icon className="h-4 w-4" /> {s.name}</button>)}
                        </div>
                        
                        {activeSection === 'personal' && <FormSection title="Personal Details">
                            <div {...getRootProps()} className={`p-4 border-2 border-dashed rounded text-center cursor-pointer ${isDragActive ? 'border-brand-red' : 'border-gray-300 dark:border-gray-600'}`}>
                                <input {...getInputProps()} />
                                {data.profilePicture ? <img src={data.profilePicture} alt="Preview" className="h-20 w-20 rounded-full mx-auto" /> : <div className="flex flex-col items-center gap-2 text-sm"><UploadIcon className="h-6 w-6"/> Upload Photo</div>}
                            </div>
                            <Input placeholder="Full Name" value={data.fullName} onChange={e => setData(d => ({ ...d, fullName: e.target.value }))} />
                            <Input placeholder="Professional Title" value={data.professionalTitle} onChange={e => setData(d => ({ ...d, professionalTitle: e.target.value }))} />
                            <Textarea placeholder="Summary" value={data.summary} onChange={e => setData(d => ({ ...d, summary: e.target.value }))} />
                            <Input type="email" placeholder="Email" value={data.contact.email} onChange={e => setData(d => ({ ...d, contact: {...d.contact, email: e.target.value} }))} />
                            <Input type="tel" placeholder="Phone" value={data.contact.phone} onChange={e => setData(d => ({ ...d, contact: {...d.contact, phone: e.target.value} }))} />
                            <Input placeholder="Address" value={data.contact.address} onChange={e => setData(d => ({ ...d, contact: {...d.contact, address: e.target.value} }))} />
                            <Input placeholder="Website" value={data.contact.website} onChange={e => setData(d => ({ ...d, contact: {...d.contact, website: e.target.value} }))} />
                            <Input placeholder="LinkedIn" value={data.contact.linkedin} onChange={e => setData(d => ({ ...d, contact: {...d.contact, linkedin: e.target.value} }))} />
                        </FormSection>}

                        {activeSection === 'experience' && <FormSection title="Work Experience">
                            {data.experiences.map(exp => <div key={exp.id} className="p-3 border rounded-md space-y-2 relative">
                                <button onClick={() => removeFromArray('experiences', exp.id)} className="absolute top-2 right-2 p-1 text-gray-400 hover:text-red-500"><TrashIcon className="h-4 w-4"/></button>
                                <Input placeholder="Job Title" value={exp.jobTitle} onChange={e => handleArrayChange('experiences', exp.id, 'jobTitle', e.target.value)} />
                                <Input placeholder="Company" value={exp.company} onChange={e => handleArrayChange('experiences', exp.id, 'company', e.target.value)} />
                                <div className="flex gap-2">
                                    <Input type="month" placeholder="Start Date" value={exp.startDate} onChange={e => handleArrayChange('experiences', exp.id, 'startDate', e.target.value)} />
                                    <Input type="text" placeholder="End Date" value={exp.endDate} onChange={e => handleArrayChange('experiences', exp.id, 'endDate', e.target.value)} />
                                </div>
                                {/* FIX: Use RichTextEditor for description fields requiring formatting. */}
                                <RichTextEditor placeholder="Description" value={exp.description} onChange={val => handleArrayChange('experiences', exp.id, 'description', val)} />
                            </div>)}
                            <button onClick={() => addToArray('experiences', { jobTitle: '', company: '', startDate: '', endDate: '', description: '' })} className="flex items-center gap-2 text-sm font-semibold text-brand-red"><PlusIcon className="h-5 w-5"/> Add Experience</button>
                        </FormSection>}

                        {activeSection === 'education' && <FormSection title="Education">
                             {data.educations.map(edu => <div key={edu.id} className="p-3 border rounded-md space-y-2 relative">
                                <button onClick={() => removeFromArray('educations', edu.id)} className="absolute top-2 right-2 p-1 text-gray-400 hover:text-red-500"><TrashIcon className="h-4 w-4"/></button>
                                <Input placeholder="Degree" value={edu.degree} onChange={e => handleArrayChange('educations', edu.id, 'degree', e.target.value)} />
                                <Input placeholder="School/University" value={edu.school} onChange={e => handleArrayChange('educations', edu.id, 'school', e.target.value)} />
                                <div className="flex gap-2">
                                    <Input type="month" placeholder="Start Date" value={edu.startDate} onChange={e => handleArrayChange('educations', edu.id, 'startDate', e.target.value)} />
                                    <Input type="month" placeholder="End Date" value={edu.endDate} onChange={e => handleArrayChange('educations', edu.id, 'endDate', e.target.value)} />
                                </div>
                                {/* FIX: Use RichTextEditor for description fields requiring formatting. */}
                                <RichTextEditor placeholder="Description" value={edu.description} onChange={val => handleArrayChange('educations', edu.id, 'description', val)} />
                            </div>)}
                            <button onClick={() => addToArray('educations', { degree: '', school: '', startDate: '', endDate: '', description: '' })} className="flex items-center gap-2 text-sm font-semibold text-brand-red"><PlusIcon className="h-5 w-5"/> Add Education</button>
                        </FormSection>}
                        
                        {activeSection === 'skills' && <FormSection title="Skills">
                             {data.skills.map(skill => <div key={skill.id} className="flex items-center gap-2">
                                <Input placeholder="Skill (e.g., React)" value={skill.name} onChange={e => handleArrayChange('skills', skill.id, 'name', e.target.value)} />
                                <button onClick={() => removeFromArray('skills', skill.id)} className="p-1 text-gray-400 hover:text-red-500"><TrashIcon className="h-4 w-4"/></button>
                            </div>)}
                            <button onClick={() => addToArray('skills', { name: '' })} className="flex items-center gap-2 text-sm font-semibold text-brand-red"><PlusIcon className="h-5 w-5"/> Add Skill</button>
                        </FormSection>}

                         {activeSection === 'projects' && <FormSection title="Projects">
                             {data.projects.map(proj => <div key={proj.id} className="p-3 border rounded-md space-y-2 relative">
                                <button onClick={() => removeFromArray('projects', proj.id)} className="absolute top-2 right-2 p-1 text-gray-400 hover:text-red-500"><TrashIcon className="h-4 w-4"/></button>
                                <Input placeholder="Project Name" value={proj.name} onChange={e => handleArrayChange('projects', proj.id, 'name', e.target.value)} />
                                {/* FIX: Use RichTextEditor for description fields requiring formatting. */}
                                <RichTextEditor placeholder="Project Description" value={proj.description} onChange={val => handleArrayChange('projects', proj.id, 'description', val)} />
                            </div>)}
                            <button onClick={() => addToArray('projects', { name: '', description: '' })} className="flex items-center gap-2 text-sm font-semibold text-brand-red"><PlusIcon className="h-5 w-5"/> Add Project</button>
                        </FormSection>}

                        {/* Design Controls */}
                        <FormSection title="Design">
                            <label className="block text-sm font-semibold mb-2">Accent Color</label>
                            <input type="color" value={color} onChange={e => setColor(e.target.value)} className="w-full h-10 p-1 border rounded-md" />
                        </FormSection>

                    </div>
                </aside>

                {/* Preview Panel */}
                <main className="w-full lg:w-2/3 xl:w-3/4 bg-gray-100 dark:bg-gray-900 p-4 sm:p-8 flex justify-center items-start overflow-auto" style={{ height: 'calc(100vh - 68px)' }}>
                    <div ref={cvPreviewRef} className="w-full max-w-3xl transform origin-top" style={{ transform: 'scale(0.9)' }}>
                       <TemplateRenderer data={data} template={template} color={color} />
                    </div>
                </main>
            </div>
        </div>
    );
};

export default CVGeneratorPage;