
import React, { useState, useRef, useCallback, useEffect } from 'react';
import { useDropzone } from 'react-dropzone';
import html2canvas from 'html2canvas';
import { jsPDF } from 'jspdf';
import { DownloadIcon, PlusIcon, TrashIcon, UploadIcon, UserIcon, BriefcaseIcon, StudentIcon, PuzzleIcon, BrainIcon } from '../components/icons.tsx';
import { TOOLS } from '../constants.ts';
import RichTextEditor from '../components/RichTextEditor.tsx';

// ===================================================================
// CV SPECIFIC TYPES & COMPONENTS
// ===================================================================

type Template = 'classic' | 'modern' | 'minimalist';

interface CVData {
    profilePicture: string | null;
    fullName: string;
    professionalTitle: string;
    summary: string;
    contact: {
        email: string;
        phone: string;
        address: string;
        website: string;
        linkedin: string;
    };
    experiences: {
        id: number;
        jobTitle: string;
        company: string;
        startDate: string;
        endDate: string;
        description: string;
    }[];
    educations: {
        id: number;
        degree: string;
        school: string;
        startDate: string;
        endDate: string;
        description: string;
    }[];
    skills: {
        id: number;
        name: string;
    }[];
    projects: {
        id: number;
        name: string;
        description: string;
    }[];
}

type VisibleSections = {
    experience: boolean;
    education: boolean;
    skills: boolean;
    projects: boolean;
};

const initialData: CVData = {
    profilePicture: null,
    fullName: 'Bishal Mishra',
    professionalTitle: 'Software Engineer',
    summary: 'A passionate software engineer with 5+ years of experience in web development, specializing in building scalable and user-friendly applications with modern technologies. Proven ability to lead projects and collaborate with cross-functional teams to deliver high-quality products.',
    contact: {
        email: 'your.email@example.com',
        phone: '+123 456 7890',
        address: 'Kathmandu, Nepal',
        website: 'yourwebsite.com',
        linkedin: 'linkedin.com/in/yourprofile',
    },
    experiences: [
        { id: 1, jobTitle: 'Senior Frontend Developer', company: 'Innovate Tech', startDate: '2022-01', endDate: 'Present', description: '<li>Lead the development of a new client-facing dashboard using React and TypeScript, improving user engagement by 25%.</li><li>Mentor junior developers and conduct code reviews to maintain high code quality.</li>' },
    ],
    educations: [
        { id: 1, degree: 'Bachelor of Science in Computer Science', school: 'Tribhuvan University', startDate: '2018-08', endDate: '2022-05', description: '<li>Graduated with Distinction.</li><li>Relevant coursework: Data Structures, Algorithms, Web Development, Database Management.</li>' },
    ],
    skills: [
        { id: 1, name: 'JavaScript' }, { id: 2, name: 'React' }, { id: 3, name: 'TypeScript' },
        { id: 4, name: 'Node.js' }, { id: 5, name: 'GraphQL' }, { id: 6, name: 'Jest' },
    ],
    projects: [
        { id: 1, name: 'Personal Portfolio Website', description: '<li>Designed and developed a responsive personal portfolio using Next.js to showcase my skills and projects.</li>' },
    ],
};

const Input: React.FC<React.InputHTMLAttributes<HTMLInputElement>> = (props) => (
    <input {...props} className="w-full p-2 border border-gray-300 dark:border-gray-600 rounded-md bg-white dark:bg-gray-900 focus:ring-brand-red focus:border-brand-red" />
);

const Textarea: React.FC<React.TextareaHTMLAttributes<HTMLTextAreaElement>> = (props) => (
    <textarea {...props} rows={4} className="w-full p-2 border border-gray-300 dark:border-gray-600 rounded-md bg-white dark:bg-gray-900 focus:ring-brand-red focus:border-brand-red" />
);

const FormSection: React.FC<{ title: string; onToggle?: () => void; isVisible?: boolean; children: React.ReactNode }> = ({ title, onToggle, isVisible, children }) => (
    <div className="border border-gray-200 dark:border-gray-700 rounded-lg">
        <div className="p-3 bg-gray-50 dark:bg-gray-800 rounded-t-lg flex justify-between items-center">
            <h3 className="font-bold">{title}</h3>
            {onToggle && (
                <label className="relative inline-flex items-center cursor-pointer">
                    <input type="checkbox" checked={isVisible} onChange={onToggle} className="sr-only peer" />
                    <div className="w-11 h-6 bg-gray-200 peer-focus:outline-none rounded-full peer dark:bg-gray-700 peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all dark:border-gray-600 peer-checked:bg-green-600"></div>
                </label>
            )}
        </div>
        <div className="p-4 space-y-4">
            {children}
        </div>
    </div>
);

const TemplateRenderer: React.FC<{ data: CVData; template: Template; color: string; visibleSections: VisibleSections }> = ({ data, template, color, visibleSections }) => {
    const accentStyle = { color: color };
    const borderStyle = { borderColor: color };
    const backgroundStyle = { backgroundColor: color };

    return (
        <div className="bg-white p-8 shadow-lg text-sm font-sans text-gray-800 w-[210mm] min-h-[297mm]">
            <header className="text-center mb-6">
                {data.profilePicture && <img src={data.profilePicture} alt="Profile" className="w-24 h-24 rounded-full mx-auto mb-4 object-cover" />}
                <h1 className="text-3xl font-bold" style={accentStyle}>{data.fullName}</h1>
                <p className="text-lg text-gray-600">{data.professionalTitle}</p>
                <div className="flex justify-center flex-wrap gap-x-4 gap-y-1 text-xs mt-2 text-gray-500">
                    <span>{data.contact.email}</span>
                    <span>{data.contact.phone}</span>
                    <span>{data.contact.address}</span>
                    {data.contact.website && <span>{data.contact.website}</span>}
                    {data.contact.linkedin && <span>{data.contact.linkedin}</span>}
                </div>
            </header>

            <section className="mb-6">
                <h2 className="text-xl font-bold border-b-2 pb-1 mb-2" style={borderStyle}>Summary</h2>
                <div className="prose prose-sm max-w-none" dangerouslySetInnerHTML={{ __html: data.summary }} />
            </section>

            {visibleSections.experience && data.experiences.length > 0 && (
                <section className="mb-6">
                    <h2 className="text-xl font-bold border-b-2 pb-1 mb-2" style={borderStyle}>Work Experience</h2>
                    {data.experiences.map(exp => (
                        <div key={exp.id} className="mb-4 break-inside-avoid">
                            <div className="flex justify-between">
                                <h3 className="font-bold">{exp.jobTitle}</h3>
                                <p className="text-gray-500 text-xs">{exp.startDate} - {exp.endDate}</p>
                            </div>
                            <p className="italic text-gray-600">{exp.company}</p>
                            <div className="prose prose-sm max-w-none mt-1" dangerouslySetInnerHTML={{ __html: exp.description }} />
                        </div>
                    ))}
                </section>
            )}

            {visibleSections.education && data.educations.length > 0 && (
                 <section className="mb-6">
                     <h2 className="text-xl font-bold border-b-2 pb-1 mb-2" style={borderStyle}>Education</h2>
                     {data.educations.map(edu => (
                         <div key={edu.id} className="mb-4 break-inside-avoid">
                             <div className="flex justify-between">
                                 <h3 className="font-bold">{edu.degree}</h3>
                                 <p className="text-gray-500 text-xs">{edu.startDate} - {edu.endDate}</p>
                             </div>
                             <p className="italic text-gray-600">{edu.school}</p>
                             <div className="prose prose-sm max-w-none mt-1" dangerouslySetInnerHTML={{ __html: edu.description }} />
                         </div>
                     ))}
                 </section>
            )}

            {visibleSections.skills && data.skills.length > 0 && (
                <section className="mb-6">
                    <h2 className="text-xl font-bold border-b-2 pb-1 mb-2" style={borderStyle}>Skills</h2>
                    <div className="flex flex-wrap gap-2">
                        {data.skills.map(skill => (
                            <span key={skill.id} className="px-3 py-1 text-sm rounded-full text-white" style={backgroundStyle}>{skill.name}</span>
                        ))}
                    </div>
                </section>
            )}
            
            {visibleSections.projects && data.projects.length > 0 && (
                <section>
                    <h2 className="text-xl font-bold border-b-2 pb-1 mb-2" style={borderStyle}>Projects</h2>
                    {data.projects.map(proj => (
                        <div key={proj.id} className="mb-4 break-inside-avoid">
                            <h3 className="font-bold">{proj.name}</h3>
                            <div className="prose prose-sm max-w-none mt-1" dangerouslySetInnerHTML={{ __html: proj.description }} />
                        </div>
                    ))}
                </section>
            )}

        </div>
    );
};


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
    const [visibleSections, setVisibleSections] = useState<VisibleSections>({
        experience: true,
        education: true,
        skills: true,
        projects: true,
    });

    useEffect(() => {
      document.title = "Free CV Generator | Create a Professional Resume - PDFBullet";
    }, []);
    
    const handleSectionToggle = (section: keyof VisibleSections) => {
        setVisibleSections(prev => ({ ...prev, [section]: !prev[section] }));
    };

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

                        {activeSection === 'experience' && <FormSection title="Work Experience" onToggle={() => handleSectionToggle('experience')} isVisible={visibleSections.experience}>
                            {data.experiences.map(exp => <div key={exp.id} className="p-3 border rounded-md space-y-2 relative">
                                <button onClick={() => removeFromArray('experiences', exp.id)} className="absolute top-2 right-2 p-1 text-gray-400 hover:text-red-500"><TrashIcon className="h-4 w-4"/></button>
                                <Input placeholder="Job Title" value={exp.jobTitle} onChange={e => handleArrayChange('experiences', exp.id, 'jobTitle', e.target.value)} />
                                <Input placeholder="Company" value={exp.company} onChange={e => handleArrayChange('experiences', exp.id, 'company', e.target.value)} />
                                <div className="flex gap-2">
                                    <Input type="month" placeholder="Start Date" value={exp.startDate} onChange={e => handleArrayChange('experiences', exp.id, 'startDate', e.target.value)} />
                                    <Input type="text" placeholder="End Date" value={exp.endDate} onChange={e => handleArrayChange('experiences', exp.id, 'endDate', e.target.value)} />
                                </div>
                                <RichTextEditor placeholder="Description" value={exp.description} onChange={val => handleArrayChange('experiences', exp.id, 'description', val)} />
                            </div>)}
                            <button onClick={() => addToArray('experiences', { jobTitle: '', company: '', startDate: '', endDate: '', description: '' })} className="flex items-center gap-2 text-sm font-semibold text-brand-red"><PlusIcon className="h-5 w-5"/> Add Experience</button>
                        </FormSection>}

                        {activeSection === 'education' && <FormSection title="Education" onToggle={() => handleSectionToggle('education')} isVisible={visibleSections.education}>
                             {data.educations.map(edu => <div key={edu.id} className="p-3 border rounded-md space-y-2 relative">
                                <button onClick={() => removeFromArray('educations', edu.id)} className="absolute top-2 right-2 p-1 text-gray-400 hover:text-red-500"><TrashIcon className="h-4 w-4"/></button>
                                <Input placeholder="Degree" value={edu.degree} onChange={e => handleArrayChange('educations', edu.id, 'degree', e.target.value)} />
                                <Input placeholder="School/University" value={edu.school} onChange={e => handleArrayChange('educations', edu.id, 'school', e.target.value)} />
                                <div className="flex gap-2">
                                    <Input type="month" placeholder="Start Date" value={edu.startDate} onChange={e => handleArrayChange('educations', edu.id, 'startDate', e.target.value)} />
                                    <Input type="month" placeholder="End Date" value={edu.endDate} onChange={e => handleArrayChange('educations', edu.id, 'endDate', e.target.value)} />
                                </div>
                                <RichTextEditor placeholder="Description" value={edu.description} onChange={val => handleArrayChange('educations', edu.id, 'description', val)} />
                            </div>)}
                            <button onClick={() => addToArray('educations', { degree: '', school: '', startDate: '', endDate: '', description: '' })} className="flex items-center gap-2 text-sm font-semibold text-brand-red"><PlusIcon className="h-5 w-5"/> Add Education</button>
                        </FormSection>}
                        
                        {activeSection === 'skills' && <FormSection title="Skills" onToggle={() => handleSectionToggle('skills')} isVisible={visibleSections.skills}>
                             {data.skills.map(skill => <div key={skill.id} className="flex items-center gap-2">
                                <Input placeholder="Skill (e.g., React)" value={skill.name} onChange={e => handleArrayChange('skills', skill.id, 'name', e.target.value)} />
                                <button onClick={() => removeFromArray('skills', skill.id)} className="p-1 text-gray-400 hover:text-red-500"><TrashIcon className="h-4 w-4"/></button>
                            </div>)}
                            <button onClick={() => addToArray('skills', { name: '' })} className="flex items-center gap-2 text-sm font-semibold text-brand-red"><PlusIcon className="h-5 w-5"/> Add Skill</button>
                        </FormSection>}

                         {activeSection === 'projects' && <FormSection title="Projects" onToggle={() => handleSectionToggle('projects')} isVisible={visibleSections.projects}>
                             {data.projects.map(proj => <div key={proj.id} className="p-3 border rounded-md space-y-2 relative">
                                <button onClick={() => removeFromArray('projects', proj.id)} className="absolute top-2 right-2 p-1 text-gray-400 hover:text-red-500"><TrashIcon className="h-4 w-4"/></button>
                                <Input placeholder="Project Name" value={proj.name} onChange={e => handleArrayChange('projects', proj.id, 'name', e.target.value)} />
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
                       <TemplateRenderer data={data} template={template} color={color} visibleSections={visibleSections} />
                    </div>
                </main>
            </div>
        </div>
    );
};

export default CVGeneratorPage;
