import React, { useState, useRef, useCallback, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useDropzone } from 'react-dropzone';
import html2canvas from 'html2canvas';
import { jsPDF } from 'jspdf';
import {
  DownloadIcon, PlusIcon, TrashIcon, UploadIcon,
  UserIcon, BriefcaseIcon, StudentIcon, PuzzleIcon,
  BrainIcon, LeftArrowIcon
} from '../components/icons.tsx';
import RichTextEditor from '../components/RichTextEditor.tsx';

// ===================================================================
// TYPES
// ===================================================================
type TemplateId =
  | 'classic' | 'modern' | 'elegant' | 'minimalist'
  | 'executive' | 'creative' | 'corporate' | 'bold'
  | 'compact' | 'apex' | 'linear' | 'atlas';

interface CVData {
  profilePicture: string | null;
  fullName: string;
  professionalTitle: string;
  summary: string;
  contact: { email: string; phone: string; address: string; website: string; linkedin: string; };
  experiences: { id: number; jobTitle: string; company: string; startDate: string; endDate: string; description: string; }[];
  educations: { id: number; degree: string; school: string; startDate: string; endDate: string; description: string; }[];
  skills: { id: number; name: string; }[];
  projects: { id: number; name: string; description: string; }[];
}
type VisibleSections = { experience: boolean; education: boolean; skills: boolean; projects: boolean; };

const initialData: CVData = {
  profilePicture: null,
  fullName: 'Your Full Name',
  professionalTitle: 'Software Engineer',
  summary: 'Results-driven software engineer with 5+ years of experience building scalable web applications. Passionate about clean code, performance optimization, and delivering exceptional user experiences.',
  contact: { email: 'your@email.com', phone: '+1 234 567 890', address: 'City, Country', website: 'yoursite.com', linkedin: 'linkedin.com/in/you' },
  experiences: [
    { id: 1, jobTitle: 'Senior Software Engineer', company: 'Innovate Corp', startDate: '2021-03', endDate: 'Present', description: '<li>Led development of microservices architecture reducing API response time by 40%.</li><li>Mentored a team of 4 junior engineers, running weekly code reviews and technical sessions.</li><li>Shipped 12 major product features used by over 200,000 active users.</li>' },
    { id: 2, jobTitle: 'Software Engineer', company: 'StartupXYZ', startDate: '2019-06', endDate: '2021-02', description: '<li>Built customer-facing React dashboard from scratch, increasing user retention by 25%.</li><li>Integrated third-party payment gateway processing $2M+ monthly transactions.</li>' },
  ],
  educations: [
    { id: 1, degree: 'Bachelor of Science, Computer Science', school: 'State University', startDate: '2015-08', endDate: '2019-05', description: '<li>Graduated with 3.8 GPA. Dean\'s List 3 consecutive years.</li><li>Relevant coursework: Data Structures, Algorithms, Database Systems, Software Engineering.</li>' },
  ],
  skills: [
    { id: 1, name: 'TypeScript' }, { id: 2, name: 'React' }, { id: 3, name: 'Node.js' },
    { id: 4, name: 'PostgreSQL' }, { id: 5, name: 'Docker' }, { id: 6, name: 'AWS' },
  ],
  projects: [
    { id: 1, name: 'Open Source CLI Tool', description: '<li>Built a developer CLI tool with 2,000+ GitHub stars and 500+ weekly npm downloads.</li>' },
  ],
};

// ===================================================================
// INLINE SVG ICONS FOR CV TEMPLATES (no emoji)
// ===================================================================
const IconEmail = () => (
  <svg width="10" height="10" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" className="inline-block align-middle mr-1"><rect x="2" y="4" width="20" height="16" rx="2" /><path d="m22 7-8.97 5.7a1.94 1.94 0 0 1-2.06 0L2 7" /></svg>
);
const IconPhone = () => (
  <svg width="10" height="10" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" className="inline-block align-middle mr-1"><path d="M22 16.92v3a2 2 0 0 1-2.18 2 19.79 19.79 0 0 1-8.63-3.07A19.5 19.5 0 0 1 4.15 13.5a19.79 19.79 0 0 1-3.07-8.67A2 2 0 0 1 3.06 2.72h3a2 2 0 0 1 2 1.72c.127.96.361 1.903.7 2.81a2 2 0 0 1-.45 2.11L7.09 10.91a16 16 0 0 0 6 6l1.27-1.27a2 2 0 0 1 2.11-.45c.907.339 1.85.573 2.81.7A2 2 0 0 1 21 18z" /></svg>
);
const IconLocation = () => (
  <svg width="10" height="10" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" className="inline-block align-middle mr-1"><path d="M20 10c0 6-8 12-8 12s-8-6-8-12a8 8 0 0 1 16 0Z" /><circle cx="12" cy="10" r="3" /></svg>
);
const IconWeb = () => (
  <svg width="10" height="10" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" className="inline-block align-middle mr-1"><circle cx="12" cy="12" r="10" /><path d="M12 2a14.5 14.5 0 0 0 0 20 14.5 14.5 0 0 0 0-20" /><path d="M2 12h20" /></svg>
);
const IconLinkedIn = () => (
  <svg width="10" height="10" viewBox="0 0 24 24" fill="currentColor" className="inline-block align-middle mr-1"><path d="M16 8a6 6 0 0 1 6 6v7h-4v-7a2 2 0 0 0-2-2 2 2 0 0 0-2 2v7h-4v-7a6 6 0 0 1 6-6z" /><rect x="2" y="9" width="4" height="12" /><circle cx="4" cy="4" r="2" /></svg>
);

// ===================================================================
// INLINE EDIT COMPONENTS
// ===================================================================
const InlineEdit: React.FC<{
  value: string;
  onChange: (val: string) => void;
  placeholder?: string;
  className?: string;
  style?: React.CSSProperties;
  tagName?: 'div' | 'span' | 'h1' | 'h2' | 'p' | 'strong';
}> = ({ value, onChange, placeholder = 'Click to edit', className = '', style, tagName = 'span' }) => {
  const Tag = tagName;
  const handleBlur = (e: React.FocusEvent<HTMLSpanElement>) => {
    onChange(e.currentTarget.innerText || '');
  };
  return (
    <Tag
      contentEditable
      suppressContentEditableWarning
      onBlur={handleBlur}
      onKeyDown={(e) => {
        if (e.key === 'Enter' && tagName !== 'div' && tagName !== 'p') {
          e.preventDefault();
          e.currentTarget.blur();
        }
      }}
      className={`hover:bg-gray-100 dark:hover:bg-zinc-800/40 focus:bg-gray-100 dark:focus:bg-zinc-800 focus:outline-none rounded px-1 transition cursor-text inline-block max-w-full truncate print:hover:bg-transparent print:focus:bg-transparent ${className}`}
      style={style}
      title="Click directly to edit text visually"
    >
      {value || placeholder}
    </Tag>
  );
};

const InlineRichEdit: React.FC<{
  html: string;
  onChange: (val: string) => void;
  className?: string;
  style?: React.CSSProperties;
}> = ({ html, onChange, className = '', style }) => {
  const handleBlur = (e: React.FocusEvent<HTMLDivElement>) => {
    onChange(e.currentTarget.innerHTML);
  };
  return (
    <div
      contentEditable
      suppressContentEditableWarning
      onBlur={handleBlur}
      className={`hover:bg-gray-100 dark:hover:bg-zinc-800/40 focus:bg-gray-100 dark:focus:bg-zinc-800 focus:outline-none rounded px-1 py-0.5 transition cursor-text print:hover:bg-transparent print:focus:bg-transparent ${className}`}
      style={style}
      dangerouslySetInnerHTML={{ __html: html || '<li>Click to add list items</li>' }}
      title="Click directly to edit list points visually"
    />
  );
};

interface TemplateProps {
  d: CVData;
  c: string;
  v: VisibleSections;
  onUpdatePersonal: (field: string, val: string) => void;
  onUpdateContact: (field: string, val: string) => void;
  onUpdateExp: (id: number, field: string, val: string) => void;
  onUpdateEdu: (id: number, field: string, val: string) => void;
  onUpdateSkill: (id: number, val: string) => void;
  onUpdateProj: (id: number, field: string, val: string) => void;
}

// ===================================================================
// TEMPLATES WITH FULL VISUAL EDITING
// ===================================================================

// 1. CLASSIC
const TClassic: React.FC<TemplateProps> = ({ d, c, v, onUpdatePersonal, onUpdateContact, onUpdateExp, onUpdateEdu, onUpdateSkill, onUpdateProj }) => (
  <div style={{ background: '#fff', padding: '40px', fontFamily: 'Georgia, serif', fontSize: '11px', color: '#222', lineHeight: 1.55 }} className="paper-a4">
    <div style={{ textAlign: 'center', borderBottom: `2px solid ${c}`, paddingBottom: '16px', marginBottom: '16px' }}>
      {d.profilePicture && <img src={d.profilePicture} style={{ width: 72, height: 72, borderRadius: '50%', objectFit: 'cover', marginBottom: 8 }} alt="" />}
      <div>
        <InlineEdit value={d.fullName} onChange={(val) => onUpdatePersonal('fullName', val)} tagName="span" style={{ fontSize: 24, fontWeight: 700, color: c, letterSpacing: 1 }} />
      </div>
      <div>
        <InlineEdit value={d.professionalTitle} onChange={(val) => onUpdatePersonal('professionalTitle', val)} tagName="span" style={{ fontSize: 13, color: '#666', marginTop: 4 }} />
      </div>
      <div style={{ display: 'flex', justifyContent: 'center', flexWrap: 'wrap', gap: '0 16px', marginTop: 8, color: '#888', fontSize: '10px' }}>
        <span className="inline-flex items-center gap-1"><IconEmail /><InlineEdit value={d.contact.email} onChange={(val) => onUpdateContact('email', val)} /></span>
        <span className="inline-flex items-center gap-1"><IconPhone /><InlineEdit value={d.contact.phone} onChange={(val) => onUpdateContact('phone', val)} /></span>
        <span className="inline-flex items-center gap-1"><IconLocation /><InlineEdit value={d.contact.address} onChange={(val) => onUpdateContact('address', val)} /></span>
        <span className="inline-flex items-center gap-1"><IconWeb /><InlineEdit value={d.contact.website} onChange={(val) => onUpdateContact('website', val)} /></span>
        <span className="inline-flex items-center gap-1"><IconLinkedIn /><InlineEdit value={d.contact.linkedin} onChange={(val) => onUpdateContact('linkedin', val)} /></span>
      </div>
    </div>
    {d.summary && (
      <div style={{ marginBottom: 16 }}>
        <div style={{ fontWeight: 700, fontSize: '9px', textTransform: 'uppercase', letterSpacing: 2, color: c, marginBottom: 6 }}>Professional Summary</div>
        <InlineEdit value={d.summary} onChange={(val) => onUpdatePersonal('summary', val)} tagName="p" className="w-full text-gray-700" />
      </div>
    )}
    {v.experience && d.experiences.length > 0 && (
      <div style={{ marginBottom: 16 }}>
        <div style={{ fontWeight: 700, fontSize: '9px', textTransform: 'uppercase', letterSpacing: 2, color: c, borderBottom: `1px solid ${c}`, paddingBottom: 4, marginBottom: 8 }}>Work Experience</div>
        {d.experiences.map(e => (
          <div key={e.id} style={{ marginBottom: 12 }}>
            <div style={{ display: 'flex', justifyContent: 'space-between' }}>
              <InlineEdit value={e.jobTitle} onChange={(val) => onUpdateExp(e.id, 'jobTitle', val)} tagName="strong" />
              <InlineEdit value={e.startDate + ' – ' + e.endDate} onChange={(val) => {
                const parts = val.split('–');
                onUpdateExp(e.id, 'startDate', parts[0]?.trim() || '');
                onUpdateExp(e.id, 'endDate', parts[1]?.trim() || '');
              }} style={{ color: '#999', fontSize: '9px' }} />
            </div>
            <div style={{ color: '#555', fontStyle: 'italic', fontSize: '10px' }}>
              <InlineEdit value={e.company} onChange={(val) => onUpdateExp(e.id, 'company', val)} />
            </div>
            <InlineRichEdit html={e.description} onChange={(val) => onUpdateExp(e.id, 'description', val)} className="mt-1 ml-4 list-disc prose prose-xs max-w-none text-gray-700" />
          </div>
        ))}
      </div>
    )}
    {v.education && d.educations.length > 0 && (
      <div style={{ marginBottom: 16 }}>
        <div style={{ fontWeight: 700, fontSize: '9px', textTransform: 'uppercase', letterSpacing: 2, color: c, borderBottom: `1px solid ${c}`, paddingBottom: 4, marginBottom: 8 }}>Education</div>
        {d.educations.map(e => (
          <div key={e.id} style={{ marginBottom: 10 }}>
            <div style={{ display: 'flex', justifyContent: 'space-between' }}>
              <InlineEdit value={e.degree} onChange={(val) => onUpdateEdu(e.id, 'degree', val)} tagName="strong" />
              <InlineEdit value={e.startDate + ' – ' + e.endDate} onChange={(val) => {
                const parts = val.split('–');
                onUpdateEdu(e.id, 'startDate', parts[0]?.trim() || '');
                onUpdateEdu(e.id, 'endDate', parts[1]?.trim() || '');
              }} style={{ color: '#999', fontSize: '9px' }} />
            </div>
            <div style={{ color: '#555', fontStyle: 'italic', fontSize: '10px' }}>
              <InlineEdit value={e.school} onChange={(val) => onUpdateEdu(e.id, 'school', val)} />
            </div>
            <InlineRichEdit html={e.description} onChange={(val) => onUpdateEdu(e.id, 'description', val)} className="mt-1 ml-4 list-disc prose prose-xs max-w-none text-gray-700" />
          </div>
        ))}
      </div>
    )}
    {v.skills && d.skills.length > 0 && (
      <div style={{ marginBottom: 16 }}>
        <div style={{ fontWeight: 700, fontSize: '9px', textTransform: 'uppercase', letterSpacing: 2, color: c, borderBottom: `1px solid ${c}`, paddingBottom: 4, marginBottom: 8 }}>Skills</div>
        <div style={{ display: 'flex', flexWrap: 'wrap', gap: 6 }}>
          {d.skills.map(s => (
            <span key={s.id} style={{ background: c, color: '#fff', padding: '2px 10px', borderRadius: 20, fontSize: '10px' }}>
              <InlineEdit value={s.name} onChange={(val) => onUpdateSkill(s.id, val)} />
            </span>
          ))}
        </div>
      </div>
    )}
    {v.projects && d.projects.length > 0 && (
      <div>
        <div style={{ fontWeight: 700, fontSize: '9px', textTransform: 'uppercase', letterSpacing: 2, color: c, borderBottom: `1px solid ${c}`, paddingBottom: 4, marginBottom: 8 }}>Projects</div>
        {d.projects.map(p => (
          <div key={p.id} style={{ marginBottom: 8 }}>
            <InlineEdit value={p.name} onChange={(val) => onUpdateProj(p.id, 'name', val)} tagName="strong" />
            <InlineRichEdit html={p.description} onChange={(val) => onUpdateProj(p.id, 'description', val)} className="mt-1 ml-4 list-disc prose prose-xs max-w-none text-gray-700" />
          </div>
        ))}
      </div>
    )}
  </div>
);

// 2. MODERN
const TModern: React.FC<TemplateProps> = ({ d, c, v, onUpdatePersonal, onUpdateContact, onUpdateExp, onUpdateEdu, onUpdateSkill, onUpdateProj }) => (
  <div style={{ background: '#fff', fontFamily: 'Arial, sans-serif', fontSize: '11px', color: '#222', lineHeight: 1.5 }} className="paper-a4">
    <div style={{ background: c, color: '#fff', padding: '32px 36px 24px' }}>
      <div style={{ display: 'flex', alignItems: 'center', gap: 20 }}>
        {d.profilePicture && <img src={d.profilePicture} style={{ width: 80, height: 80, borderRadius: '50%', objectFit: 'cover', border: '3px solid rgba(255,255,255,0.3)' }} alt="" />}
        <div>
          <div>
            <InlineEdit value={d.fullName} onChange={(val) => onUpdatePersonal('fullName', val)} tagName="span" style={{ fontSize: 26, fontWeight: 800, letterSpacing: 0.5 }} />
          </div>
          <div>
            <InlineEdit value={d.professionalTitle} onChange={(val) => onUpdatePersonal('professionalTitle', val)} tagName="span" style={{ fontSize: 13, opacity: 0.8, marginTop: 4 }} />
          </div>
          <div style={{ display: 'flex', flexWrap: 'wrap', gap: '4px 20px', marginTop: 10, fontSize: '9.5px', opacity: 0.75 }}>
            <span className="inline-flex items-center gap-1"><IconEmail /><InlineEdit value={d.contact.email} onChange={(val) => onUpdateContact('email', val)} /></span>
            <span className="inline-flex items-center gap-1"><IconPhone /><InlineEdit value={d.contact.phone} onChange={(val) => onUpdateContact('phone', val)} /></span>
            <span className="inline-flex items-center gap-1"><IconLocation /><InlineEdit value={d.contact.address} onChange={(val) => onUpdateContact('address', val)} /></span>
            <span className="inline-flex items-center gap-1"><IconWeb /><InlineEdit value={d.contact.website} onChange={(val) => onUpdateContact('website', val)} /></span>
          </div>
        </div>
      </div>
    </div>
    <div style={{ padding: '24px 36px' }}>
      {d.summary && (
        <div style={{ background: '#f8f8f8', borderLeft: `4px solid ${c}`, padding: '10px 14px', marginBottom: 20, borderRadius: '0 6px 6px 0', color: '#444', fontStyle: 'italic' }}>
          <InlineEdit value={d.summary} onChange={(val) => onUpdatePersonal('summary', val)} tagName="p" />
        </div>
      )}
      {v.experience && d.experiences.length > 0 && (
        <div style={{ marginBottom: 20 }}>
          <div style={{ fontWeight: 800, fontSize: '9px', textTransform: 'uppercase', letterSpacing: 2, marginBottom: 10 }}>Work Experience</div>
          {d.experiences.map(e => (
            <div key={e.id} style={{ borderLeft: `2px solid ${c}`, paddingLeft: 12, marginBottom: 14 }}>
              <div style={{ display: 'flex', justifyContent: 'space-between' }}>
                <InlineEdit value={e.jobTitle} onChange={(val) => onUpdateExp(e.id, 'jobTitle', val)} tagName="strong" style={{ fontSize: 12 }} />
                <InlineEdit value={e.startDate + ' – ' + e.endDate} onChange={(val) => {
                  const parts = val.split('–');
                  onUpdateExp(e.id, 'startDate', parts[0]?.trim() || '');
                  onUpdateExp(e.id, 'endDate', parts[1]?.trim() || '');
                }} style={{ background: '#f0f0f0', padding: '1px 8px', borderRadius: 20, fontSize: '9px', color: '#666' }} />
              </div>
              <div style={{ color: c, fontWeight: 600, fontSize: '10px', marginTop: 2 }}>
                <InlineEdit value={e.company} onChange={(val) => onUpdateExp(e.id, 'company', val)} />
              </div>
              <InlineRichEdit html={e.description} onChange={(val) => onUpdateExp(e.id, 'description', val)} className="mt-1 ml-2 prose prose-xs max-w-none text-gray-700" />
            </div>
          ))}
        </div>
      )}
      <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 20 }}>
        <div>
          {v.education && d.educations.length > 0 && (
            <div style={{ marginBottom: 16 }}>
              <div style={{ fontWeight: 800, fontSize: '9px', textTransform: 'uppercase', letterSpacing: 2, marginBottom: 10 }}>Education</div>
              {d.educations.map(e => (
                <div key={e.id} style={{ borderLeft: `2px solid ${c}`, paddingLeft: 12, marginBottom: 10 }}>
                  <InlineEdit value={e.degree} onChange={(val) => onUpdateEdu(e.id, 'degree', val)} tagName="strong" />
                  <div style={{ color: c, fontSize: '10px' }}>
                    <InlineEdit value={e.school} onChange={(val) => onUpdateEdu(e.id, 'school', val)} />
                  </div>
                  <InlineEdit value={e.startDate + ' – ' + e.endDate} onChange={(val) => {
                    const parts = val.split('–');
                    onUpdateEdu(e.id, 'startDate', parts[0]?.trim() || '');
                    onUpdateEdu(e.id, 'endDate', parts[1]?.trim() || '');
                  }} style={{ color: '#999', fontSize: '9px' }} />
                </div>
              ))}
            </div>
          )}
        </div>
        <div>
          {v.skills && d.skills.length > 0 && (
            <div style={{ marginBottom: 16 }}>
              <div style={{ fontWeight: 800, fontSize: '9px', textTransform: 'uppercase', letterSpacing: 2, marginBottom: 10 }}>Skills</div>
              <div style={{ display: 'flex', flexWrap: 'wrap', gap: 5 }}>
                {d.skills.map(s => (
                  <span key={s.id} style={{ background: c + '18', color: c, padding: '3px 10px', borderRadius: 4, fontSize: '10px', fontWeight: 600 }}>
                    <InlineEdit value={s.name} onChange={(val) => onUpdateSkill(s.id, val)} />
                  </span>
                ))}
              </div>
            </div>
          )}
          {v.projects && d.projects.length > 0 && (
            <div>
              <div style={{ fontWeight: 800, fontSize: '9px', textTransform: 'uppercase', letterSpacing: 2, marginBottom: 10 }}>Projects</div>
              {d.projects.map(p => (
                <div key={p.id} style={{ marginBottom: 8 }}>
                  <InlineEdit value={p.name} onChange={(val) => onUpdateProj(p.id, 'name', val)} tagName="strong" />
                  <InlineRichEdit html={p.description} onChange={(val) => onUpdateProj(p.id, 'description', val)} className="mt-0.5 ml-2 prose prose-xs max-w-none text-gray-700" />
                </div>
              ))}
            </div>
          )}
        </div>
      </div>
    </div>
  </div>
);

// 3. ELEGANT
const TElegant: React.FC<TemplateProps> = ({ d, c, v, onUpdatePersonal, onUpdateContact, onUpdateExp, onUpdateEdu, onUpdateSkill, onUpdateProj }) => (
  <div style={{ background: '#fff', fontFamily: 'Helvetica, sans-serif', fontSize: '11px', color: '#222', lineHeight: 1.5, display: 'flex' }} className="paper-a4">
    <div style={{ width: '200px', background: c, color: '#fff', padding: '32px 20px', flexShrink: 0 }}>
      {d.profilePicture && <img src={d.profilePicture} style={{ width: 80, height: 80, borderRadius: '50%', objectFit: 'cover', margin: '0 auto 16px', display: 'block', border: '3px solid rgba(255,255,255,0.25)' }} alt="" />}
      <div style={{ textTransform: 'none', textAlign: 'center' }}>
        <InlineEdit value={d.fullName} onChange={(val) => onUpdatePersonal('fullName', val)} tagName="span" style={{ fontSize: 14, fontWeight: 700 }} />
      </div>
      <div style={{ textTransform: 'none', textAlign: 'center', marginTop: 4, marginBottom: 20 }}>
        <InlineEdit value={d.professionalTitle} onChange={(val) => onUpdatePersonal('professionalTitle', val)} tagName="span" style={{ fontSize: '10px', opacity: 0.7 }} />
      </div>
      <div style={{ fontSize: '9.5px', opacity: 0.9, marginBottom: 20 }}>
        <div style={{ fontWeight: 700, fontSize: '8px', textTransform: 'uppercase', letterSpacing: 2, opacity: 0.6, marginBottom: 8 }}>Contact</div>
        <div style={{ marginBottom: 4, display: 'flex', alignItems: 'center', gap: 5 }}><IconEmail /><InlineEdit value={d.contact.email} onChange={(val) => onUpdateContact('email', val)} /></div>
        <div style={{ marginBottom: 4, display: 'flex', alignItems: 'center', gap: 5 }}><IconPhone /><InlineEdit value={d.contact.phone} onChange={(val) => onUpdateContact('phone', val)} /></div>
        <div style={{ marginBottom: 4, display: 'flex', alignItems: 'center', gap: 5 }}><IconLocation /><InlineEdit value={d.contact.address} onChange={(val) => onUpdateContact('address', val)} /></div>
        {d.contact.website && <div style={{ marginBottom: 4, display: 'flex', alignItems: 'center', gap: 5 }}><IconWeb /><InlineEdit value={d.contact.website} onChange={(val) => onUpdateContact('website', val)} /></div>}
        {d.contact.linkedin && <div style={{ marginBottom: 4, display: 'flex', alignItems: 'center', gap: 5 }}><IconLinkedIn /><InlineEdit value={d.contact.linkedin} onChange={(val) => onUpdateContact('linkedin', val)} /></div>}
      </div>
      {v.skills && d.skills.length > 0 && (
        <div>
          <div style={{ fontWeight: 700, fontSize: '8px', textTransform: 'uppercase', letterSpacing: 2, opacity: 0.6, marginBottom: 8 }}>Skills</div>
          {d.skills.map(s => (
            <div key={s.id} style={{ background: 'rgba(255,255,255,0.15)', borderRadius: 4, padding: '3px 8px', marginBottom: 4, fontSize: '10px' }}>
              <InlineEdit value={s.name} onChange={(val) => onUpdateSkill(s.id, val)} />
            </div>
          ))}
        </div>
      )}
    </div>
    <div style={{ flex: 1, padding: '32px 28px', overflow: 'hidden' }}>
      {d.summary && (
        <div style={{ marginBottom: 18 }}>
          <div style={{ fontWeight: 700, fontSize: '9px', textTransform: 'uppercase', letterSpacing: 2, color: c, borderBottom: `1.5px solid ${c}`, paddingBottom: 5, marginBottom: 8 }}>About Me</div>
          <InlineEdit value={d.summary} onChange={(val) => onUpdatePersonal('summary', val)} tagName="p" style={{ color: '#555', fontStyle: 'italic', fontSize: '10.5px' }} />
        </div>
      )}
      {v.experience && d.experiences.length > 0 && (
        <div style={{ marginBottom: 18 }}>
          <div style={{ fontWeight: 700, fontSize: '9px', textTransform: 'uppercase', letterSpacing: 2, color: c, borderBottom: `1.5px solid ${c}`, paddingBottom: 5, marginBottom: 8 }}>Experience</div>
          {d.experiences.map(e => (
            <div key={e.id} style={{ marginBottom: 12 }}>
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'baseline' }}>
                <InlineEdit value={e.jobTitle} onChange={(val) => onUpdateExp(e.id, 'jobTitle', val)} tagName="strong" style={{ fontSize: 11 }} />
                <InlineEdit value={e.startDate + ' – ' + e.endDate} onChange={(val) => {
                  const parts = val.split('–');
                  onUpdateExp(e.id, 'startDate', parts[0]?.trim() || '');
                  onUpdateExp(e.id, 'endDate', parts[1]?.trim() || '');
                }} style={{ fontSize: '9px', color: '#999' }} />
              </div>
              <div style={{ color: c, fontWeight: 600, fontSize: '10px' }}>
                <InlineEdit value={e.company} onChange={(val) => onUpdateExp(e.id, 'company', val)} />
              </div>
              <InlineRichEdit html={e.description} onChange={(val) => onUpdateExp(e.id, 'description', val)} className="mt-0.5 ml-2 prose prose-xs max-w-none text-[10px] text-gray-700" />
            </div>
          ))}
        </div>
      )}
      {v.education && d.educations.length > 0 && (
        <div style={{ marginBottom: 18 }}>
          <div style={{ fontWeight: 700, fontSize: '9px', textTransform: 'uppercase', letterSpacing: 2, color: c, borderBottom: `1.5px solid ${c}`, paddingBottom: 5, marginBottom: 8 }}>Education</div>
          {d.educations.map(e => (
            <div key={e.id} style={{ marginBottom: 10 }}>
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'baseline' }}>
                <InlineEdit value={e.degree} onChange={(val) => onUpdateEdu(e.id, 'degree', val)} tagName="strong" style={{ fontSize: 11 }} />
                <InlineEdit value={e.startDate + ' – ' + e.endDate} onChange={(val) => {
                  const parts = val.split('–');
                  onUpdateEdu(e.id, 'startDate', parts[0]?.trim() || '');
                  onUpdateEdu(e.id, 'endDate', parts[1]?.trim() || '');
                }} style={{ fontSize: '9px', color: '#999' }} />
              </div>
              <div style={{ color: c, fontSize: '10px', fontWeight: 600 }}>
                <InlineEdit value={e.school} onChange={(val) => onUpdateEdu(e.id, 'school', val)} />
              </div>
              <InlineRichEdit html={e.description} onChange={(val) => onUpdateEdu(e.id, 'description', val)} className="mt-0.5 ml-2 prose prose-xs max-w-none text-[10px] text-gray-700" />
            </div>
          ))}
        </div>
      )}
      {v.projects && d.projects.length > 0 && (
        <div>
          <div style={{ fontWeight: 700, fontSize: '9px', textTransform: 'uppercase', letterSpacing: 2, color: c, borderBottom: `1.5px solid ${c}`, paddingBottom: 5, marginBottom: 8 }}>Projects</div>
          {d.projects.map(p => (
            <div key={p.id} style={{ marginBottom: 8 }}>
              <InlineEdit value={p.name} onChange={(val) => onUpdateProj(p.id, 'name', val)} tagName="strong" style={{ fontSize: 11 }} />
              <InlineRichEdit html={p.description} onChange={(val) => onUpdateProj(p.id, 'description', val)} className="mt-0.5 ml-2 prose prose-xs max-w-none text-[10px] text-gray-700" />
            </div>
          ))}
        </div>
      )}
    </div>
  </div>
);

// 4. MINIMALIST
const TMinimalist: React.FC<TemplateProps> = ({ d, c, v, onUpdatePersonal, onUpdateContact, onUpdateExp, onUpdateEdu, onUpdateSkill, onUpdateProj }) => (
  <div style={{ background: '#fff', padding: '48px 40px', fontFamily: '"Helvetica Neue", sans-serif', fontSize: '11px', color: '#333', lineHeight: 1.6 }} className="paper-a4">
    <div style={{ marginBottom: 32 }}>
      <div>
        <InlineEdit value={d.fullName} onChange={(val) => onUpdatePersonal('fullName', val)} tagName="span" style={{ fontSize: 30, fontWeight: 300, letterSpacing: 2, color: '#111' }} />
      </div>
      <div>
        <InlineEdit value={d.professionalTitle} onChange={(val) => onUpdatePersonal('professionalTitle', val)} tagName="span" style={{ fontSize: 13, color: c, fontWeight: 500, marginTop: 4 }} />
      </div>
      <div style={{ display: 'flex', flexWrap: 'wrap', gap: '2px 24px', marginTop: 12, fontSize: '9px', color: '#888' }}>
        <span className="inline-flex items-center gap-1"><IconEmail /><InlineEdit value={d.contact.email} onChange={(val) => onUpdateContact('email', val)} /></span>
        <span className="inline-flex items-center gap-1"><IconPhone /><InlineEdit value={d.contact.phone} onChange={(val) => onUpdateContact('phone', val)} /></span>
        <span className="inline-flex items-center gap-1"><IconLocation /><InlineEdit value={d.contact.address} onChange={(val) => onUpdateContact('address', val)} /></span>
        {d.contact.website && <span className="inline-flex items-center gap-1"><IconWeb /><InlineEdit value={d.contact.website} onChange={(val) => onUpdateContact('website', val)} /></span>}
      </div>
    </div>
    <div style={{ height: 1, background: c, marginBottom: 28 }} />
    {d.summary && (
      <div style={{ marginBottom: 24, color: '#555', fontStyle: 'italic', fontSize: '10.5px', maxWidth: '85%' }}>
        <InlineEdit value={d.summary} onChange={(val) => onUpdatePersonal('summary', val)} tagName="p" />
      </div>
    )}
    {v.experience && d.experiences.length > 0 && (
      <div style={{ marginBottom: 24 }}>
        <div style={{ fontSize: '9px', fontWeight: 700, textTransform: 'uppercase', letterSpacing: 3, color: c, marginBottom: 16 }}>Experience</div>
        {d.experiences.map(e => (
          <div key={e.id} style={{ display: 'grid', gridTemplateColumns: '90px 1fr', gap: '0 20px', marginBottom: 16 }}>
            <div style={{ color: '#aaa', fontSize: '9px', paddingTop: 2, textAlign: 'right' }}>
              <InlineEdit value={e.startDate + ' – ' + e.endDate} onChange={(val) => {
                const parts = val.split('–');
                onUpdateExp(e.id, 'startDate', parts[0]?.trim() || '');
                onUpdateExp(e.id, 'endDate', parts[1]?.trim() || '');
              }} />
            </div>
            <div>
              <InlineEdit value={e.jobTitle} onChange={(val) => onUpdateExp(e.id, 'jobTitle', val)} tagName="strong" style={{ fontSize: '12px', color: '#111' }} />
              <div style={{ color: '#777', fontSize: '10px' }}>
                <InlineEdit value={e.company} onChange={(val) => onUpdateExp(e.id, 'company', val)} />
              </div>
              <InlineRichEdit html={e.description} onChange={(val) => onUpdateExp(e.id, 'description', val)} className="mt-1 ml-4 list-disc prose prose-xs max-w-none text-[10px] text-gray-600" />
            </div>
          </div>
        ))}
      </div>
    )}
    {v.education && d.educations.length > 0 && (
      <div style={{ marginBottom: 24 }}>
        <div style={{ fontSize: '9px', fontWeight: 700, textTransform: 'uppercase', letterSpacing: 3, color: c, marginBottom: 16 }}>Education</div>
        {d.educations.map(e => (
          <div key={e.id} style={{ display: 'grid', gridTemplateColumns: '90px 1fr', gap: '0 20px', marginBottom: 12 }}>
            <div style={{ color: '#aaa', fontSize: '9px', textAlign: 'right' }}>
              <InlineEdit value={e.startDate + ' – ' + e.endDate} onChange={(val) => {
                const parts = val.split('–');
                onUpdateEdu(e.id, 'startDate', parts[0]?.trim() || '');
                onUpdateEdu(e.id, 'endDate', parts[1]?.trim() || '');
              }} />
            </div>
            <div>
              <InlineEdit value={e.degree} onChange={(val) => onUpdateEdu(e.id, 'degree', val)} tagName="strong" />
              <div style={{ color: '#777', fontSize: '10px' }}>
                <InlineEdit value={e.school} onChange={(val) => onUpdateEdu(e.id, 'school', val)} />
              </div>
            </div>
          </div>
        ))}
      </div>
    )}
    {v.skills && d.skills.length > 0 && (
      <div style={{ marginBottom: 24 }}>
        <div style={{ fontSize: '9px', fontWeight: 700, textTransform: 'uppercase', letterSpacing: 3, color: c, marginBottom: 12 }}>Skills</div>
        <div style={{ display: 'flex', flexWrap: 'wrap', gap: '4px 20px', fontSize: '10.5px', color: '#444' }}>
          {d.skills.map(s => (
            <span key={s.id}>
              <InlineEdit value={s.name} onChange={(val) => onUpdateSkill(s.id, val)} />
            </span>
          ))}
        </div>
      </div>
    )}
    {v.projects && d.projects.length > 0 && (
      <div>
        <div style={{ fontSize: '9px', fontWeight: 700, textTransform: 'uppercase', letterSpacing: 3, color: c, marginBottom: 16 }}>Projects</div>
        {d.projects.map(p => (
          <div key={p.id} style={{ display: 'grid', gridTemplateColumns: '90px 1fr', gap: '0 20px', marginBottom: 12 }}>
            <div />
            <div>
              <InlineEdit value={p.name} onChange={(val) => onUpdateProj(p.id, 'name', val)} tagName="strong" />
              <InlineRichEdit html={p.description} onChange={(val) => onUpdateProj(p.id, 'description', val)} className="mt-1 ml-4 list-disc prose prose-xs max-w-none text-[10px] text-gray-600" />
            </div>
          </div>
        ))}
      </div>
    )}
  </div>
);

// 5. EXECUTIVE
const TExecutive: React.FC<TemplateProps> = ({ d, c, v, onUpdatePersonal, onUpdateContact, onUpdateExp, onUpdateEdu, onUpdateSkill, onUpdateProj }) => (
  <div style={{ background: '#fff', padding: '40px 44px', fontFamily: 'Palatino, Georgia, serif', fontSize: '11px', color: '#1a1a1a', lineHeight: 1.55 }} className="paper-a4">
    <div style={{ borderTop: `4px solid ${c}`, borderBottom: `1px solid ${c}`, padding: '16px 0', marginBottom: 20, textAlign: 'center' }}>
      {d.profilePicture && <img src={d.profilePicture} style={{ width: 64, height: 64, borderRadius: '50%', objectFit: 'cover', marginBottom: 8 }} alt="" />}
      <div>
        <InlineEdit value={d.fullName} onChange={(val) => onUpdatePersonal('fullName', val)} tagName="span" style={{ fontSize: 28, fontWeight: 700, letterSpacing: 3, textTransform: 'uppercase', color: '#111' }} />
      </div>
      <div>
        <InlineEdit value={d.professionalTitle} onChange={(val) => onUpdatePersonal('professionalTitle', val)} tagName="span" style={{ fontSize: 12, color: c, fontWeight: 600, marginTop: 4, letterSpacing: 1 }} />
      </div>
      <div style={{ display: 'flex', justifyContent: 'center', flexWrap: 'wrap', gap: '2px 20px', marginTop: 10, fontSize: '9px', color: '#888' }}>
        <span className="inline-flex items-center gap-1"><IconEmail /><InlineEdit value={d.contact.email} onChange={(val) => onUpdateContact('email', val)} /></span>
        <span className="inline-flex items-center gap-1"><IconPhone /><InlineEdit value={d.contact.phone} onChange={(val) => onUpdateContact('phone', val)} /></span>
        <span className="inline-flex items-center gap-1"><IconLocation /><InlineEdit value={d.contact.address} onChange={(val) => onUpdateContact('address', val)} /></span>
        {d.contact.website && <span className="inline-flex items-center gap-1"><IconWeb /><InlineEdit value={d.contact.website} onChange={(val) => onUpdateContact('website', val)} /></span>}
      </div>
    </div>
    {d.summary && (
      <div style={{ marginBottom: 18, textAlign: 'center', color: '#555', fontStyle: 'italic', borderBottom: '1px solid #ddd', paddingBottom: 16 }}>
        <InlineEdit value={d.summary} onChange={(val) => onUpdatePersonal('summary', val)} tagName="p" />
      </div>
    )}
    {v.experience && d.experiences.length > 0 && (
      <div style={{ marginBottom: 18 }}>
        <div style={{ fontSize: '10px', fontWeight: 700, textTransform: 'uppercase', letterSpacing: 3, color: c, marginBottom: 10, textAlign: 'center' }}>Professional Experience</div>
        {d.experiences.map(e => (
          <div key={e.id} style={{ marginBottom: 14 }}>
            <div style={{ display: 'flex', justifyContent: 'space-between' }}>
              <span style={{ fontSize: 12 }}><InlineEdit value={e.jobTitle} onChange={(val) => onUpdateExp(e.id, 'jobTitle', val)} tagName="strong" /> — <InlineEdit value={e.company} onChange={(val) => onUpdateExp(e.id, 'company', val)} /></span>
              <InlineEdit value={e.startDate + ' – ' + e.endDate} onChange={(val) => {
                const parts = val.split('–');
                onUpdateExp(e.id, 'startDate', parts[0]?.trim() || '');
                onUpdateExp(e.id, 'endDate', parts[1]?.trim() || '');
              }} style={{ color: '#999', fontSize: '9px' }} />
            </div>
            <InlineRichEdit html={e.description} onChange={(val) => onUpdateExp(e.id, 'description', val)} className="mt-1 ml-4 list-disc prose prose-xs max-w-none text-gray-700" />
          </div>
        ))}
      </div>
    )}
    {v.education && d.educations.length > 0 && (
      <div style={{ marginBottom: 18 }}>
        <div style={{ fontSize: '10px', fontWeight: 700, textTransform: 'uppercase', letterSpacing: 3, color: c, marginBottom: 10, textAlign: 'center' }}>Education</div>
        {d.educations.map(e => (
          <div key={e.id} style={{ marginBottom: 10, textAlign: 'center' }}>
            <InlineEdit value={e.degree} onChange={(val) => onUpdateEdu(e.id, 'degree', val)} tagName="strong" />, <em><InlineEdit value={e.school} onChange={(val) => onUpdateEdu(e.id, 'school', val)} /></em> <InlineEdit value={e.startDate + ' – ' + e.endDate} onChange={(val) => {
              const parts = val.split('–');
              onUpdateEdu(e.id, 'startDate', parts[0]?.trim() || '');
              onUpdateEdu(e.id, 'endDate', parts[1]?.trim() || '');
            }} style={{ color: '#999', fontSize: '9px' }} />
          </div>
        ))}
      </div>
    )}
    {v.skills && d.skills.length > 0 && (
      <div style={{ borderTop: '1px solid #ddd', paddingTop: 14 }}>
        <div style={{ fontSize: '10px', fontWeight: 700, textTransform: 'uppercase', letterSpacing: 3, color: c, marginBottom: 10, textAlign: 'center' }}>Core Competencies</div>
        <div style={{ display: 'flex', justifyContent: 'center', flexWrap: 'wrap', gap: '4px 16px' }}>
          {d.skills.map(s => (
            <span key={s.id} style={{ fontSize: '10px' }}>
              <InlineEdit value={s.name} onChange={(val) => onUpdateSkill(s.id, val)} />
            </span>
          ))}
        </div>
      </div>
    )}
  </div>
);

// 6. CREATIVE
const TCreative: React.FC<TemplateProps> = ({ d, c, v, onUpdatePersonal, onUpdateContact, onUpdateExp, onUpdateEdu, onUpdateSkill, onUpdateProj }) => (
  <div style={{ background: '#fff', fontFamily: 'Arial, sans-serif', fontSize: '11px', color: '#222', lineHeight: 1.5, display: 'flex' }} className="paper-a4">
    <div style={{ width: 8, background: c, flexShrink: 0 }} />
    <div style={{ flex: 1, padding: '36px 36px 36px 28px' }}>
      <div style={{ marginBottom: 24 }}>
        {d.profilePicture && <img src={d.profilePicture} style={{ width: 72, height: 72, borderRadius: '50%', objectFit: 'cover', float: 'right', marginLeft: 16 }} alt="" />}
        <div>
          <InlineEdit value={d.fullName} onChange={(val) => onUpdatePersonal('fullName', val)} tagName="span" style={{ fontSize: 32, fontWeight: 900, color: '#111', lineHeight: 1 }} />
        </div>
        <div>
          <InlineEdit value={d.professionalTitle} onChange={(val) => onUpdatePersonal('professionalTitle', val)} tagName="span" style={{ fontSize: 14, color: c, fontWeight: 600, marginTop: 6 }} />
        </div>
        <div style={{ display: 'flex', flexWrap: 'wrap', gap: '3px 18px', marginTop: 10, fontSize: '9.5px', color: '#666', clear: 'both' }}>
          <span className="inline-flex items-center gap-1"><IconEmail /><InlineEdit value={d.contact.email} onChange={(val) => onUpdateContact('email', val)} /></span>
          <span className="inline-flex items-center gap-1"><IconPhone /><InlineEdit value={d.contact.phone} onChange={(val) => onUpdateContact('phone', val)} /></span>
          <span className="inline-flex items-center gap-1"><IconLocation /><InlineEdit value={d.contact.address} onChange={(val) => onUpdateContact('address', val)} /></span>
          {d.contact.website && <span className="inline-flex items-center gap-1"><IconWeb /><InlineEdit value={d.contact.website} onChange={(val) => onUpdateContact('website', val)} /></span>}
        </div>
      </div>
      {d.summary && (
        <div style={{ background: '#f5f5f5', padding: '10px 14px', borderRadius: 6, marginBottom: 20, color: '#444', fontSize: '10.5px' }}>
          <InlineEdit value={d.summary} onChange={(val) => onUpdatePersonal('summary', val)} tagName="p" />
        </div>
      )}
      {v.experience && d.experiences.length > 0 && (
        <div style={{ marginBottom: 18 }}>
          <div style={{ fontWeight: 900, fontSize: '11px', textTransform: 'uppercase', letterSpacing: 1, marginBottom: 10, color: '#111' }}>Experience</div>
          {d.experiences.map(e => (
            <div key={e.id} style={{ marginBottom: 14, paddingLeft: 12, borderLeft: `3px solid ${c}` }}>
              <span style={{ fontSize: 12 }}><InlineEdit value={e.jobTitle} onChange={(val) => onUpdateExp(e.id, 'jobTitle', val)} tagName="strong" /> <span style={{ color: c, fontWeight: 600 }}>@ <InlineEdit value={e.company} onChange={(val) => onUpdateExp(e.id, 'company', val)} /></span></span>
              <div style={{ color: '#999', fontSize: '9px', marginTop: 1 }}>
                <InlineEdit value={e.startDate + ' – ' + e.endDate} onChange={(val) => {
                  const parts = val.split('–');
                  onUpdateExp(e.id, 'startDate', parts[0]?.trim() || '');
                  onUpdateExp(e.id, 'endDate', parts[1]?.trim() || '');
                }} />
              </div>
              <InlineRichEdit html={e.description} onChange={(val) => onUpdateExp(e.id, 'description', val)} className="mt-1 ml-4 prose prose-xs max-w-none text-gray-700" />
            </div>
          ))}
        </div>
      )}
      <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 20 }}>
        <div>
          {v.education && d.educations.length > 0 && (
            <div>
              <div style={{ fontWeight: 900, fontSize: '11px', textTransform: 'uppercase', letterSpacing: 1, marginBottom: 10, color: '#111' }}>Education</div>
              {d.educations.map(e => (
                <div key={e.id} style={{ marginBottom: 10 }}>
                  <InlineEdit value={e.degree} onChange={(val) => onUpdateEdu(e.id, 'degree', val)} tagName="strong" />
                  <div style={{ color: c, fontSize: '10px' }}>
                    <InlineEdit value={e.school} onChange={(val) => onUpdateEdu(e.id, 'school', val)} />
                  </div>
                  <InlineEdit value={e.startDate + ' – ' + e.endDate} onChange={(val) => {
                    const parts = val.split('–');
                    onUpdateEdu(e.id, 'startDate', parts[0]?.trim() || '');
                    onUpdateEdu(e.id, 'endDate', parts[1]?.trim() || '');
                  }} style={{ color: '#999', fontSize: '9px' }} />
                </div>
              ))}
            </div>
          )}
        </div>
        <div>
          {v.skills && d.skills.length > 0 && (
            <div>
              <div style={{ fontWeight: 900, fontSize: '11px', textTransform: 'uppercase', letterSpacing: 1, marginBottom: 10, color: '#111' }}>Skills</div>
              <div style={{ display: 'flex', flexWrap: 'wrap', gap: 5 }}>
                {d.skills.map(s => (
                  <span key={s.id} style={{ background: c, color: '#fff', padding: '2px 10px', borderRadius: 3, fontSize: '10px', fontWeight: 600 }}>
                    <InlineEdit value={s.name} onChange={(val) => onUpdateSkill(s.id, val)} />
                  </span>
                ))}
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  </div>
);

// 7. CORPORATE
const TCorporate: React.FC<TemplateProps> = ({ d, c, v, onUpdatePersonal, onUpdateContact, onUpdateExp, onUpdateEdu, onUpdateSkill, onUpdateProj }) => (
  <div style={{ background: '#fff', padding: '32px 36px', fontFamily: 'Calibri, Arial, sans-serif', fontSize: '11px', color: '#1a1a1a', lineHeight: 1.5 }} className="paper-a4">
    <table style={{ width: '100%', borderBottom: `3px solid ${c}`, marginBottom: 20, paddingBottom: 14 }} cellPadding={0} cellSpacing={0}>
      <tbody>
        <tr>
          <td style={{ width: 72 }}>{d.profilePicture && <img src={d.profilePicture} style={{ width: 72, height: 72, objectFit: 'cover' }} alt="" />}</td>
          <td style={{ paddingLeft: 16 }}>
            <div>
              <InlineEdit value={d.fullName} onChange={(val) => onUpdatePersonal('fullName', val)} tagName="span" style={{ fontSize: 22, fontWeight: 700, color: '#111' }} />
            </div>
            <div>
              <InlineEdit value={d.professionalTitle} onChange={(val) => onUpdatePersonal('professionalTitle', val)} tagName="span" style={{ fontSize: 13, color: c, fontWeight: 600, marginTop: 3 }} />
            </div>
          </td>
          <td style={{ textAlign: 'right', fontSize: '9.5px', color: '#555' }}>
            <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'flex-end', gap: 5 }}><IconEmail /><InlineEdit value={d.contact.email} onChange={(val) => onUpdateContact('email', val)} /></div>
            <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'flex-end', gap: 5 }}><IconPhone /><InlineEdit value={d.contact.phone} onChange={(val) => onUpdateContact('phone', val)} /></div>
            <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'flex-end', gap: 5 }}><IconLocation /><InlineEdit value={d.contact.address} onChange={(val) => onUpdateContact('address', val)} /></div>
          </td>
        </tr>
      </tbody>
    </table>
    {d.summary && (
      <div style={{ border: `1px solid ${c}`, borderLeft: `4px solid ${c}`, padding: '10px 14px', marginBottom: 18, borderRadius: '0 4px 4px 0', color: '#444' }}>
        <InlineEdit value={d.summary} onChange={(val) => onUpdatePersonal('summary', val)} tagName="p" />
      </div>
    )}
    {v.experience && d.experiences.length > 0 && (
      <div style={{ marginBottom: 18 }}>
        <div style={{ background: c, color: '#fff', fontWeight: 700, fontSize: '10px', textTransform: 'uppercase', letterSpacing: 2, padding: '4px 10px', marginBottom: 10 }}>Work Experience</div>
        {d.experiences.map(e => (
          <div key={e.id} style={{ marginBottom: 12 }}>
            <div style={{ display: 'flex', justifyContent: 'space-between' }}>
              <InlineEdit value={e.jobTitle} onChange={(val) => onUpdateExp(e.id, 'jobTitle', val)} tagName="strong" />
              <InlineEdit value={e.startDate + ' – ' + e.endDate} onChange={(val) => {
                const parts = val.split('–');
                onUpdateExp(e.id, 'startDate', parts[0]?.trim() || '');
                onUpdateExp(e.id, 'endDate', parts[1]?.trim() || '');
              }} style={{ color: '#999', fontSize: '9px' }} />
            </div>
            <div style={{ color: c, fontSize: '10px', fontWeight: 600 }}>
              <InlineEdit value={e.company} onChange={(val) => onUpdateExp(e.id, 'company', val)} />
            </div>
            <InlineRichEdit html={e.description} onChange={(val) => onUpdateExp(e.id, 'description', val)} className="mt-1 ml-4 list-disc prose prose-xs max-w-none text-gray-700" />
          </div>
        ))}
      </div>
    )}
    <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 18 }}>
      <div>
        {v.education && d.educations.length > 0 && (
          <div>
            <div style={{ background: c, color: '#fff', fontWeight: 700, fontSize: '10px', textTransform: 'uppercase', letterSpacing: 2, padding: '4px 10px', marginBottom: 10 }}>Education</div>
            {d.educations.map(e => (
              <div key={e.id} style={{ marginBottom: 8 }}>
                <InlineEdit value={e.degree} onChange={(val) => onUpdateEdu(e.id, 'degree', val)} tagName="strong" />
                <div style={{ color: c, fontSize: '10px' }}>
                  <InlineEdit value={e.school} onChange={(val) => onUpdateEdu(e.id, 'school', val)} />
                </div>
                <InlineEdit value={e.startDate + ' – ' + e.endDate} onChange={(val) => {
                  const parts = val.split('–');
                  onUpdateEdu(e.id, 'startDate', parts[0]?.trim() || '');
                  onUpdateEdu(e.id, 'endDate', parts[1]?.trim() || '');
                }} style={{ color: '#999', fontSize: '9px' }} />
              </div>
            ))}
          </div>
        )}
      </div>
      <div>
        {v.skills && d.skills.length > 0 && (
          <div>
            <div style={{ background: c, color: '#fff', fontWeight: 700, fontSize: '10px', textTransform: 'uppercase', letterSpacing: 2, padding: '4px 10px', marginBottom: 10 }}>Skills</div>
            <div style={{ display: 'flex', flexWrap: 'wrap', gap: 5 }}>
              {d.skills.map(s => (
                <span key={s.id} style={{ border: `1px solid ${c}`, color: c, padding: '2px 8px', borderRadius: 3, fontSize: '10px' }}>
                  <InlineEdit value={s.name} onChange={(val) => onUpdateSkill(s.id, val)} />
                </span>
              ))}
            </div>
          </div>
        )}
      </div>
    </div>
  </div>
);

// 8. BOLD
const TBold: React.FC<TemplateProps> = ({ d, c, v, onUpdatePersonal, onUpdateContact, onUpdateExp, onUpdateEdu, onUpdateSkill, onUpdateProj }) => (
  <div style={{ background: '#fff', fontFamily: 'Arial Black, Arial, sans-serif', fontSize: '11px', color: '#111', lineHeight: 1.5 }} className="paper-a4">
    <div style={{ background: '#111', color: '#fff', padding: '32px 36px' }}>
      <div>
        <InlineEdit value={d.fullName} onChange={(val) => onUpdatePersonal('fullName', val)} tagName="span" style={{ fontSize: 34, fontWeight: 900, letterSpacing: -1, lineHeight: 1 }} />
      </div>
      <div>
        <InlineEdit value={d.professionalTitle} onChange={(val) => onUpdatePersonal('professionalTitle', val)} tagName="span" style={{ fontSize: 14, color: c, fontWeight: 700, marginTop: 8 }} />
      </div>
      <div style={{ display: 'flex', flexWrap: 'wrap', gap: '3px 20px', marginTop: 14, fontSize: '9.5px', color: '#aaa', fontFamily: 'Arial, sans-serif' }}>
        <span className="inline-flex items-center gap-1"><IconEmail /><InlineEdit value={d.contact.email} onChange={(val) => onUpdateContact('email', val)} /></span>
        <span className="inline-flex items-center gap-1"><IconPhone /><InlineEdit value={d.contact.phone} onChange={(val) => onUpdateContact('phone', val)} /></span>
        <span className="inline-flex items-center gap-1"><IconLocation /><InlineEdit value={d.contact.address} onChange={(val) => onUpdateContact('address', val)} /></span>
      </div>
    </div>
    <div style={{ padding: '24px 36px', fontFamily: 'Arial, sans-serif' }}>
      {d.summary && (
        <div style={{ borderLeft: `4px solid ${c}`, paddingLeft: 14, marginBottom: 20, color: '#444', fontStyle: 'italic' }}>
          <InlineEdit value={d.summary} onChange={(val) => onUpdatePersonal('summary', val)} tagName="p" />
        </div>
      )}
      {v.experience && d.experiences.length > 0 && (
        <div style={{ marginBottom: 20 }}>
          <div style={{ fontWeight: 900, fontSize: '12px', textTransform: 'uppercase', letterSpacing: 2, marginBottom: 10, color: c, fontFamily: 'Arial Black, sans-serif' }}>Experience</div>
          {d.experiences.map(e => (
            <div key={e.id} style={{ marginBottom: 14 }}>
              <div style={{ display: 'flex', justifyContent: 'space-between' }}>
                <InlineEdit value={e.jobTitle} onChange={(val) => onUpdateExp(e.id, 'jobTitle', val)} tagName="strong" style={{ fontSize: 12 }} />
                <InlineEdit value={e.startDate + ' – ' + e.endDate} onChange={(val) => {
                  const parts = val.split('–');
                  onUpdateExp(e.id, 'startDate', parts[0]?.trim() || '');
                  onUpdateExp(e.id, 'endDate', parts[1]?.trim() || '');
                }} style={{ color: '#999', fontSize: '9px', background: '#f0f0f0', padding: '1px 8px', borderRadius: 20 }} />
              </div>
              <div style={{ color: c, fontWeight: 700, fontSize: '10px' }}>
                <InlineEdit value={e.company} onChange={(val) => onUpdateExp(e.id, 'company', val)} />
              </div>
              <InlineRichEdit html={e.description} onChange={(val) => onUpdateExp(e.id, 'description', val)} className="mt-1 ml-4 list-disc prose prose-xs max-w-none text-gray-700" />
            </div>
          ))}
        </div>
      )}
      <div style={{ display: 'grid', gridTemplateColumns: '1.4fr 1fr', gap: 20 }}>
        <div>
          {v.education && d.educations.length > 0 && (
            <div style={{ marginBottom: 16 }}>
              <div style={{ fontWeight: 900, fontSize: '12px', textTransform: 'uppercase', letterSpacing: 2, marginBottom: 10, color: c, fontFamily: 'Arial Black, sans-serif' }}>Education</div>
              {d.educations.map(e => (
                <div key={e.id} style={{ marginBottom: 10 }}>
                  <InlineEdit value={e.degree} onChange={(val) => onUpdateEdu(e.id, 'degree', val)} tagName="strong" />
                  <div style={{ color: '#666', fontSize: '10px' }}>
                    <InlineEdit value={e.school} onChange={(val) => onUpdateEdu(e.id, 'school', val)} /> (<InlineEdit value={e.startDate + ' – ' + e.endDate} onChange={(val) => {
                      const parts = val.split('–');
                      onUpdateEdu(e.id, 'startDate', parts[0]?.trim() || '');
                      onUpdateEdu(e.id, 'endDate', parts[1]?.trim() || '');
                    }} />)
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
        <div>
          {v.skills && d.skills.length > 0 && (
            <div>
              <div style={{ fontWeight: 900, fontSize: '12px', textTransform: 'uppercase', letterSpacing: 2, marginBottom: 10, color: c, fontFamily: 'Arial Black, sans-serif' }}>Skills</div>
              <div style={{ display: 'flex', flexDirection: 'column', gap: 5 }}>
                {d.skills.map(s => (
                  <div key={s.id} style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
                    <div style={{ width: 8, height: 8, background: c, borderRadius: '50%', flexShrink: 0 }} />
                    <span style={{ fontSize: '10.5px' }}>
                      <InlineEdit value={s.name} onChange={(val) => onUpdateSkill(s.id, val)} />
                    </span>
                  </div>
                ))}
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  </div>
);

// 9. COMPACT
const TCompact: React.FC<TemplateProps> = ({ d, c, v, onUpdatePersonal, onUpdateContact, onUpdateExp, onUpdateEdu, onUpdateSkill, onUpdateProj }) => (
  <div style={{ background: '#fff', fontFamily: 'Tahoma, Arial, sans-serif', fontSize: '10px', color: '#1a1a1a', lineHeight: 1.45 }} className="paper-a4">
    <div style={{ background: c, color: '#fff', padding: '18px 28px' }}>
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
        <div>
          <InlineEdit value={d.fullName} onChange={(val) => onUpdatePersonal('fullName', val)} tagName="span" style={{ fontSize: 20, fontWeight: 700 }} />
          <div style={{ fontSize: 11, opacity: 0.8, marginTop: 2 }}>
            <InlineEdit value={d.professionalTitle} onChange={(val) => onUpdatePersonal('professionalTitle', val)} tagName="span" />
          </div>
        </div>
        {d.profilePicture && <img src={d.profilePicture} style={{ width: 56, height: 56, borderRadius: '50%', objectFit: 'cover', border: '2px solid rgba(255,255,255,0.3)' }} alt="" />}
      </div>
      <div style={{ display: 'flex', flexWrap: 'wrap', gap: '2px 16px', marginTop: 10, fontSize: '8.5px', opacity: 0.75 }}>
        <span className="inline-flex items-center gap-1"><IconEmail /><InlineEdit value={d.contact.email} onChange={(val) => onUpdateContact('email', val)} /></span>
        <span className="inline-flex items-center gap-1"><IconPhone /><InlineEdit value={d.contact.phone} onChange={(val) => onUpdateContact('phone', val)} /></span>
        <span className="inline-flex items-center gap-1"><IconLocation /><InlineEdit value={d.contact.address} onChange={(val) => onUpdateContact('address', val)} /></span>
      </div>
    </div>
    <div style={{ display: 'grid', gridTemplateColumns: '1.6fr 1fr', gap: 0 }}>
      <div style={{ padding: '18px 20px 18px 28px', borderRight: '1px solid #eee' }}>
        {d.summary && (
          <div style={{ marginBottom: 14, fontSize: '9.5px', color: '#444', borderBottom: '1px solid #f0f0f0', paddingBottom: 10 }}>
            <InlineEdit value={d.summary} onChange={(val) => onUpdatePersonal('summary', val)} tagName="p" />
          </div>
        )}
        {v.experience && d.experiences.length > 0 && (
          <div style={{ marginBottom: 14 }}>
            <div style={{ fontWeight: 700, fontSize: '8.5px', textTransform: 'uppercase', letterSpacing: 2, color: c, marginBottom: 6 }}>Experience</div>
            {d.experiences.map(e => (
              <div key={e.id} style={{ marginBottom: 10 }}>
                <div style={{ display: 'flex', justifyContent: 'space-between' }}>
                  <InlineEdit value={e.jobTitle} onChange={(val) => onUpdateExp(e.id, 'jobTitle', val)} tagName="strong" style={{ fontSize: '10.5px' }} />
                  <InlineEdit value={e.startDate + ' – ' + e.endDate} onChange={(val) => {
                    const parts = val.split('–');
                    onUpdateExp(e.id, 'startDate', parts[0]?.trim() || '');
                    onUpdateExp(e.id, 'endDate', parts[1]?.trim() || '');
                  }} style={{ color: '#aaa', fontSize: '8px' }} />
                </div>
                <div style={{ color: c, fontSize: '9px' }}>
                  <InlineEdit value={e.company} onChange={(val) => onUpdateExp(e.id, 'company', val)} />
                </div>
                <InlineRichEdit html={e.description} onChange={(val) => onUpdateExp(e.id, 'description', val)} className="mt-1 ml-4 prose prose-xs max-w-none text-gray-700" />
              </div>
            ))}
          </div>
        )}
      </div>
      <div style={{ padding: '18px 20px' }}>
        {v.education && d.educations.length > 0 && (
          <div style={{ marginBottom: 14 }}>
            <div style={{ fontWeight: 700, fontSize: '8.5px', textTransform: 'uppercase', letterSpacing: 2, color: c, marginBottom: 6 }}>Education</div>
            {d.educations.map(e => (
              <div key={e.id} style={{ marginBottom: 10 }}>
                <InlineEdit value={e.degree} onChange={(val) => onUpdateEdu(e.id, 'degree', val)} tagName="strong" style={{ fontSize: '10.5px' }} />
                <div style={{ color: c, fontSize: '9px', marginTop: 1 }}>
                  <InlineEdit value={e.school} onChange={(val) => onUpdateEdu(e.id, 'school', val)} />
                </div>
                <InlineEdit value={e.startDate + ' – ' + e.endDate} onChange={(val) => {
                  const parts = val.split('–');
                  onUpdateEdu(e.id, 'startDate', parts[0]?.trim() || '');
                  onUpdateEdu(e.id, 'endDate', parts[1]?.trim() || '');
                }} style={{ color: '#aaa', fontSize: '8.5px' }} />
              </div>
            ))}
          </div>
        )}
        {v.skills && d.skills.length > 0 && (
          <div>
            <div style={{ fontWeight: 700, fontSize: '8.5px', textTransform: 'uppercase', letterSpacing: 2, color: c, marginBottom: 6 }}>Skills</div>
            <div style={{ display: 'flex', flexDirection: 'column', gap: 3 }}>
              {d.skills.map(s => (
                <div key={s.id} style={{ background: '#f5f5f5', padding: '3px 8px', borderRadius: 3, fontSize: '9.5px' }}>
                  <InlineEdit value={s.name} onChange={(val) => onUpdateSkill(s.id, val)} />
                </div>
              ))}
            </div>
          </div>
        )}
      </div>
    </div>
  </div>
);

// 10. APEX
const TApex: React.FC<TemplateProps> = ({ d, c, v, onUpdatePersonal, onUpdateContact, onUpdateExp, onUpdateEdu, onUpdateSkill, onUpdateProj }) => (
  <div style={{ background: '#fff', fontFamily: 'Segoe UI, Arial, sans-serif', fontSize: '11px', color: '#222', lineHeight: 1.55 }} className="paper-a4">
    <div style={{ background: `linear-gradient(135deg, #111 0%, ${c} 100%)`, color: '#fff', padding: '36px 40px 28px' }}>
      <div style={{ display: 'flex', alignItems: 'flex-end', gap: 20 }}>
        {d.profilePicture && <img src={d.profilePicture} style={{ width: 88, height: 88, borderRadius: 8, objectFit: 'cover', border: '3px solid rgba(255,255,255,0.2)' }} alt="" />}
        <div style={{ flex: 1 }}>
          <div>
            <InlineEdit value={d.fullName} onChange={(val) => onUpdatePersonal('fullName', val)} tagName="span" style={{ fontSize: 28, fontWeight: 700, letterSpacing: 0.5 }} />
          </div>
          <div>
            <InlineEdit value={d.professionalTitle} onChange={(val) => onUpdatePersonal('professionalTitle', val)} tagName="span" style={{ fontSize: 13, opacity: 0.8, marginTop: 4 }} />
          </div>
        </div>
      </div>
      <div style={{ display: 'flex', flexWrap: 'wrap', gap: '4px 20px', marginTop: 16, fontSize: '9px', opacity: 0.7, borderTop: '1px solid rgba(255,255,255,0.2)', paddingTop: 12 }}>
        <span className="inline-flex items-center gap-1"><IconEmail /><InlineEdit value={d.contact.email} onChange={(val) => onUpdateContact('email', val)} /></span>
        <span className="inline-flex items-center gap-1"><IconPhone /><InlineEdit value={d.contact.phone} onChange={(val) => onUpdateContact('phone', val)} /></span>
        <span className="inline-flex items-center gap-1"><IconLocation /><InlineEdit value={d.contact.address} onChange={(val) => onUpdateContact('address', val)} /></span>
      </div>
    </div>
    <div style={{ padding: '24px 40px' }}>
      {d.summary && (
        <div style={{ marginBottom: 20, padding: '12px 16px', background: '#f8f8f8', borderRadius: 8, color: '#555', fontStyle: 'italic' }}>
          <InlineEdit value={d.summary} onChange={(val) => onUpdatePersonal('summary', val)} tagName="p" />
        </div>
      )}
      {v.experience && d.experiences.length > 0 && (
        <div style={{ marginBottom: 20 }}>
          <div style={{ fontWeight: 700, fontSize: '9px', textTransform: 'uppercase', letterSpacing: 2, color: c, marginBottom: 12, paddingBottom: 6, borderBottom: `2px solid ${c}` }}>Work Experience</div>
          {d.experiences.map(e => (
            <div key={e.id} style={{ marginBottom: 14, paddingLeft: 16, borderLeft: `3px solid ${c}33` }}>
              <div style={{ display: 'flex', justifyContent: 'space-between' }}>
                <InlineEdit value={e.jobTitle} onChange={(val) => onUpdateExp(e.id, 'jobTitle', val)} tagName="strong" style={{ fontSize: 12 }} />
                <InlineEdit value={e.startDate + ' – ' + e.endDate} onChange={(val) => {
                  const parts = val.split('–');
                  onUpdateExp(e.id, 'startDate', parts[0]?.trim() || '');
                  onUpdateExp(e.id, 'endDate', parts[1]?.trim() || '');
                }} style={{ background: `${c}15`, color: c, padding: '1px 8px', borderRadius: 20, fontSize: '9px', fontWeight: 600 }} />
              </div>
              <div style={{ color: c, fontSize: '10px', fontWeight: 600, marginTop: 2 }}>
                <InlineEdit value={e.company} onChange={(val) => onUpdateExp(e.id, 'company', val)} />
              </div>
              <InlineRichEdit html={e.description} onChange={(val) => onUpdateExp(e.id, 'description', val)} className="mt-1 ml-4 list-disc prose prose-xs max-w-none text-gray-700" />
            </div>
          ))}
        </div>
      )}
      <div style={{ display: 'grid', gridTemplateColumns: '1.2fr 1fr', gap: 24 }}>
        <div>
          {v.education && d.educations.length > 0 && (
            <div style={{ marginBottom: 16 }}>
              <div style={{ fontWeight: 700, fontSize: '9px', textTransform: 'uppercase', letterSpacing: 2, color: c, marginBottom: 10, paddingBottom: 6, borderBottom: `2px solid ${c}` }}>Education</div>
              {d.educations.map(e => (
                <div key={e.id} style={{ marginBottom: 10 }}>
                  <InlineEdit value={e.degree} onChange={(val) => onUpdateEdu(e.id, 'degree', val)} tagName="strong" />
                  <div style={{ color: c, fontSize: '10px', fontWeight: 600 }}>
                    <InlineEdit value={e.school} onChange={(val) => onUpdateEdu(e.id, 'school', val)} />
                  </div>
                  <InlineEdit value={e.startDate + ' – ' + e.endDate} onChange={(val) => {
                    const parts = val.split('–');
                    onUpdateEdu(e.id, 'startDate', parts[0]?.trim() || '');
                    onUpdateEdu(e.id, 'endDate', parts[1]?.trim() || '');
                  }} style={{ color: '#aaa', fontSize: '9px' }} />
                </div>
              ))}
            </div>
          )}
        </div>
        <div>
          {v.skills && d.skills.length > 0 && (
            <div>
              <div style={{ fontWeight: 700, fontSize: '9px', textTransform: 'uppercase', letterSpacing: 2, color: c, marginBottom: 10, paddingBottom: 6, borderBottom: `2px solid ${c}` }}>Skills</div>
              <div style={{ display: 'flex', flexWrap: 'wrap', gap: 5 }}>
                {d.skills.map(s => (
                  <span key={s.id} style={{ background: `${c}15`, color: c, padding: '3px 10px', borderRadius: 20, fontSize: '10px', fontWeight: 600, border: `1px solid ${c}33` }}>
                    <InlineEdit value={s.name} onChange={(val) => onUpdateSkill(s.id, val)} />
                  </span>
                ))}
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  </div>
);

// 11. LINEAR
const TLinear: React.FC<TemplateProps> = ({ d, c, v, onUpdatePersonal, onUpdateContact, onUpdateExp, onUpdateEdu, onUpdateSkill, onUpdateProj }) => (
  <div style={{ background: '#fff', padding: '36px 40px', fontFamily: 'Roboto, Arial, sans-serif', fontSize: '11px', color: '#333', lineHeight: 1.55 }} className="paper-a4">
    <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: 24, paddingBottom: 18, borderBottom: `1px solid #eee` }}>
      <div>
        {d.profilePicture && <img src={d.profilePicture} style={{ width: 72, height: 72, borderRadius: '50%', objectFit: 'cover', marginBottom: 12 }} alt="" />}
        <div>
          <InlineEdit value={d.fullName} onChange={(val) => onUpdatePersonal('fullName', val)} tagName="span" style={{ fontSize: 26, fontWeight: 700, color: '#111' }} />
        </div>
        <div>
          <InlineEdit value={d.professionalTitle} onChange={(val) => onUpdatePersonal('professionalTitle', val)} tagName="span" style={{ fontSize: 13, color: c, fontWeight: 600, marginTop: 4 }} />
        </div>
      </div>
      <div style={{ textAlign: 'right', fontSize: '9.5px', color: '#666', lineHeight: 1.8 }}>
        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'flex-end', gap: 5 }}><IconEmail /><InlineEdit value={d.contact.email} onChange={(val) => onUpdateContact('email', val)} /></div>
        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'flex-end', gap: 5 }}><IconPhone /><InlineEdit value={d.contact.phone} onChange={(val) => onUpdateContact('phone', val)} /></div>
        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'flex-end', gap: 5 }}><IconLocation /><InlineEdit value={d.contact.address} onChange={(val) => onUpdateContact('address', val)} /></div>
      </div>
    </div>
    {d.summary && (
      <div style={{ marginBottom: 20, color: '#555' }}>
        <InlineEdit value={d.summary} onChange={(val) => onUpdatePersonal('summary', val)} tagName="p" />
      </div>
    )}
    {v.experience && d.experiences.length > 0 && (
      <div style={{ marginBottom: 20 }}>
        <div style={{ fontWeight: 700, fontSize: '9px', textTransform: 'uppercase', letterSpacing: 2, color: c, marginBottom: 12 }}>Work Experience</div>
        {d.experiences.map(e => (
          <div key={e.id} style={{ display: 'flex', gap: 16, marginBottom: 14 }}>
            <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center' }}>
              <div style={{ width: 12, height: 12, borderRadius: '50%', background: c, marginTop: 2, flexShrink: 0 }} />
              <div style={{ width: 2, flex: 1, background: `${c}30`, marginTop: 4 }} />
            </div>
            <div style={{ flex: 1 }}>
              <div style={{ display: 'flex', justifyContent: 'space-between' }}>
                <InlineEdit value={e.jobTitle} onChange={(val) => onUpdateExp(e.id, 'jobTitle', val)} tagName="strong" />
                <InlineEdit value={e.startDate + ' – ' + e.endDate} onChange={(val) => {
                  const parts = val.split('–');
                  onUpdateExp(e.id, 'startDate', parts[0]?.trim() || '');
                  onUpdateExp(e.id, 'endDate', parts[1]?.trim() || '');
                }} style={{ color: '#aaa', fontSize: '9px' }} />
              </div>
              <div style={{ color: c, fontSize: '10px', fontWeight: 600 }}>
                <InlineEdit value={e.company} onChange={(val) => onUpdateExp(e.id, 'company', val)} />
              </div>
              <InlineRichEdit html={e.description} onChange={(val) => onUpdateExp(e.id, 'description', val)} className="mt-1 ml-4 list-disc prose prose-xs max-w-none text-gray-700" />
            </div>
          </div>
        ))}
      </div>
    )}
    <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 20 }}>
      {v.education && d.educations.length > 0 && (
        <div>
          <div style={{ fontWeight: 700, fontSize: '9px', textTransform: 'uppercase', letterSpacing: 2, color: c, marginBottom: 10 }}>Education</div>
          {d.educations.map(e => (
            <div key={e.id} style={{ display: 'flex', gap: 12, marginBottom: 10 }}>
              <div style={{ width: 10, height: 10, borderRadius: '50%', background: c, marginTop: 2, flexShrink: 0 }} />
              <div>
                <InlineEdit value={e.degree} onChange={(val) => onUpdateEdu(e.id, 'degree', val)} tagName="strong" />
                <div style={{ color: '#777', fontSize: '10px' }}>
                  <InlineEdit value={e.school} onChange={(val) => onUpdateEdu(e.id, 'school', val)} />
                </div>
                <InlineEdit value={e.startDate + ' – ' + e.endDate} onChange={(val) => {
                  const parts = val.split('–');
                  onUpdateEdu(e.id, 'startDate', parts[0]?.trim() || '');
                  onUpdateEdu(e.id, 'endDate', parts[1]?.trim() || '');
                }} style={{ color: '#aaa', fontSize: '9px' }} />
              </div>
            </div>
          ))}
        </div>
      )}
      <div>
        {v.skills && d.skills.length > 0 && (
          <div style={{ marginBottom: 14 }}>
            <div style={{ fontWeight: 700, fontSize: '9px', textTransform: 'uppercase', letterSpacing: 2, color: c, marginBottom: 10 }}>Skills</div>
            <div style={{ display: 'flex', flexWrap: 'wrap', gap: 5 }}>
              {d.skills.map(s => (
                <span key={s.id} style={{ background: '#f0f0f0', color: '#333', padding: '3px 10px', borderRadius: 4, fontSize: '10px', borderLeft: `3px solid ${c}` }}>
                  <InlineEdit value={s.name} onChange={(val) => onUpdateSkill(s.id, val)} />
                </span>
              ))}
            </div>
          </div>
        )}
      </div>
    </div>
  </div>
);

// 12. ATLAS
const TAtlas: React.FC<TemplateProps> = ({ d, c, v, onUpdatePersonal, onUpdateContact, onUpdateExp, onUpdateEdu, onUpdateSkill, onUpdateProj }) => (
  <div style={{ background: '#fafafa', fontFamily: 'Georgia, serif', fontSize: '11px', color: '#222', lineHeight: 1.55, display: 'flex', minHeight: '100%' }} className="paper-a4">
    <div style={{ width: '190px', padding: '36px 20px', background: '#fff', borderRight: `1px solid #e8e8e8`, flexShrink: 0 }}>
      {d.profilePicture && <img src={d.profilePicture} style={{ width: 100, height: 100, borderRadius: '50%', objectFit: 'cover', display: 'block', margin: '0 auto 16px', border: `3px solid ${c}` }} alt="" />}
      <div style={{ textAlign: 'center', marginBottom: 20 }}>
        <div>
          <InlineEdit value={d.fullName} onChange={(val) => onUpdatePersonal('fullName', val)} tagName="span" style={{ fontSize: 16, fontWeight: 700, color: '#111' }} />
        </div>
        <div>
          <InlineEdit value={d.professionalTitle} onChange={(val) => onUpdatePersonal('professionalTitle', val)} tagName="span" style={{ fontSize: '10px', color: c, fontWeight: 600, marginTop: 4 }} />
        </div>
      </div>
      <div style={{ fontSize: '9.5px', color: '#555', marginBottom: 20 }}>
        <div style={{ fontWeight: 700, fontSize: '8px', textTransform: 'uppercase', letterSpacing: 2, color: c, marginBottom: 8 }}>Contact</div>
        <div style={{ display: 'flex', alignItems: 'flex-start', gap: 6, marginBottom: 5 }}><IconEmail /><span style={{ wordBreak: 'break-all' }}><InlineEdit value={d.contact.email} onChange={(val) => onUpdateContact('email', val)} /></span></div>
        <div style={{ display: 'flex', alignItems: 'center', gap: 6, marginBottom: 5 }}><IconPhone /><InlineEdit value={d.contact.phone} onChange={(val) => onUpdateContact('phone', val)} /></div>
        <div style={{ display: 'flex', alignItems: 'center', gap: 6, marginBottom: 5 }}><IconLocation /><InlineEdit value={d.contact.address} onChange={(val) => onUpdateContact('address', val)} /></div>
        {d.contact.website && <div style={{ display: 'flex', alignItems: 'center', gap: 6, marginBottom: 5 }}><IconWeb /><InlineEdit value={d.contact.website} onChange={(val) => onUpdateContact('website', val)} /></div>}
        {d.contact.linkedin && <div style={{ display: 'flex', alignItems: 'flex-start', gap: 6, marginBottom: 5 }}><IconLinkedIn /><span style={{ wordBreak: 'break-all' }}><InlineEdit value={d.contact.linkedin} onChange={(val) => onUpdateContact('linkedin', val)} /></span></div>}
      </div>
      {v.skills && d.skills.length > 0 && (
        <div>
          <div style={{ fontWeight: 700, fontSize: '8px', textTransform: 'uppercase', letterSpacing: 2, color: c, marginBottom: 8 }}>Skills</div>
          {d.skills.map(s => (
            <div key={s.id} style={{ marginBottom: 4, fontSize: '10px', color: '#444', borderBottom: '1px solid #eee', paddingBottom: 3 }}>
              <InlineEdit value={s.name} onChange={(val) => onUpdateSkill(s.id, val)} />
            </div>
          ))}
        </div>
      )}
    </div>
    <div style={{ flex: 1, padding: '36px 28px', background: '#fafafa' }}>
      {d.summary && (
        <div style={{ marginBottom: 20 }}>
          <div style={{ fontWeight: 700, fontSize: '8.5px', textTransform: 'uppercase', letterSpacing: 2, color: c, marginBottom: 8, paddingBottom: 5, borderBottom: `1.5px solid ${c}` }}>Profile</div>
          <InlineEdit value={d.summary} onChange={(val) => onUpdatePersonal('summary', val)} tagName="p" style={{ color: '#555', fontStyle: 'italic' }} />
        </div>
      )}
      {v.experience && d.experiences.length > 0 && (
        <div style={{ marginBottom: 18 }}>
          <div style={{ fontWeight: 700, fontSize: '8.5px', textTransform: 'uppercase', letterSpacing: 2, color: c, marginBottom: 8, paddingBottom: 5, borderBottom: `1.5px solid ${c}` }}>Experience</div>
          {d.experiences.map(e => (
            <div key={e.id} style={{ marginBottom: 14 }}>
              <div style={{ display: 'flex', justifyContent: 'space-between' }}>
                <InlineEdit value={e.jobTitle} onChange={(val) => onUpdateExp(e.id, 'jobTitle', val)} tagName="strong" style={{ fontSize: 12 }} />
                <InlineEdit value={e.startDate + ' – ' + e.endDate} onChange={(val) => {
                  const parts = val.split('–');
                  onUpdateExp(e.id, 'startDate', parts[0]?.trim() || '');
                  onUpdateExp(e.id, 'endDate', parts[1]?.trim() || '');
                }} style={{ color: '#aaa', fontSize: '9px' }} />
              </div>
              <div style={{ color: c, fontStyle: 'italic', fontSize: '10px' }}>
                <InlineEdit value={e.company} onChange={(val) => onUpdateExp(e.id, 'company', val)} />
              </div>
              <InlineRichEdit html={e.description} onChange={(val) => onUpdateExp(e.id, 'description', val)} className="mt-1 ml-4 list-disc prose prose-xs max-w-none text-gray-700" />
            </div>
          ))}
        </div>
      )}
      {v.education && d.educations.length > 0 && (
        <div style={{ marginBottom: 18 }}>
          <div style={{ fontWeight: 700, fontSize: '8.5px', textTransform: 'uppercase', letterSpacing: 2, color: c, marginBottom: 8, paddingBottom: 5, borderBottom: `1.5px solid ${c}` }}>Education</div>
          {d.educations.map(e => (
            <div key={e.id} style={{ marginBottom: 10 }}>
              <div style={{ display: 'flex', justifyContent: 'space-between' }}>
                <InlineEdit value={e.degree} onChange={(val) => onUpdateEdu(e.id, 'degree', val)} tagName="strong" />
                <InlineEdit value={e.startDate + ' – ' + e.endDate} onChange={(val) => {
                  const parts = val.split('–');
                  onUpdateEdu(e.id, 'startDate', parts[0]?.trim() || '');
                  onUpdateEdu(e.id, 'endDate', parts[1]?.trim() || '');
                }} style={{ color: '#aaa', fontSize: '9px' }} />
              </div>
              <div style={{ color: c, fontStyle: 'italic', fontSize: '10px' }}>
                <InlineEdit value={e.school} onChange={(val) => onUpdateEdu(e.id, 'school', val)} />
              </div>
              <InlineRichEdit html={e.description} onChange={(val) => onUpdateEdu(e.id, 'description', val)} className="mt-1 ml-4 list-disc prose prose-xs max-w-none text-gray-700" />
            </div>
          ))}
        </div>
      )}
    </div>
  </div>
);

const TemplateRenderer: React.FC<{
  data: CVData;
  color: string;
  visibleSections: VisibleSections;
  template: TemplateId;
  onUpdatePersonal: (field: string, val: string) => void;
  onUpdateContact: (field: string, val: string) => void;
  onUpdateExp: (id: number, field: string, val: string) => void;
  onUpdateEdu: (id: number, field: string, val: string) => void;
  onUpdateSkill: (id: number, val: string) => void;
  onUpdateProj: (id: number, field: string, val: string) => void;
}> = ({ template, data, color, visibleSections, ...props }) => {
  const templateProps = { d: data, c: color, v: visibleSections, ...props };
  switch (template) {
    case 'modern':     return <TModern {...templateProps} />;
    case 'elegant':    return <TElegant {...templateProps} />;
    case 'minimalist': return <TMinimalist {...templateProps} />;
    case 'executive':  return <TExecutive {...templateProps} />;
    case 'creative':   return <TCreative {...templateProps} />;
    case 'corporate':  return <TCorporate {...templateProps} />;
    case 'bold':       return <TBold {...templateProps} />;
    case 'compact':    return <TCompact {...templateProps} />;
    case 'apex':       return <TApex {...templateProps} />;
    case 'linear':     return <TLinear {...templateProps} />;
    case 'atlas':      return <TAtlas {...templateProps} />;
    default:           return <TClassic {...templateProps} />;
  }
};

const TEMPLATES: { id: TemplateId; label: string; desc: string }[] = [
  { id: 'classic',    label: 'Classic',    desc: 'Centered, serif, timeless' },
  { id: 'modern',     label: 'Modern',     desc: 'Colored header, bold impact' },
  { id: 'elegant',    label: 'Elegant',    desc: 'Dark sidebar, two-column' },
  { id: 'minimalist', label: 'Minimalist', desc: 'Ultra-clean whitespace grid' },
  { id: 'executive',  label: 'Executive',  desc: 'Formal double-rule header' },
  { id: 'creative',   label: 'Creative',   desc: 'Bold name, accent bar left' },
  { id: 'corporate',  label: 'Corporate',  desc: 'Boxed sections, table layout' },
  { id: 'bold',       label: 'Bold',       desc: 'Dark header, strong typography' },
  { id: 'compact',    label: 'Compact',    desc: 'Dense two-column, fits more' },
  { id: 'apex',       label: 'Apex',       desc: 'Gradient header, modern edge' },
  { id: 'linear',     label: 'Linear',     desc: 'Timeline dots, structured' },
  { id: 'atlas',      label: 'Atlas',      desc: 'Profile sidebar, clean body' },
];

const ACCENT_COLORS = ['#111111', '#1e293b', '#1d4ed8', '#047857', '#7c3aed', '#b45309', '#0e7490', '#be185d', '#dc2626', '#475569'];

const AiBtn: React.FC<{ onClick: () => void; loading: boolean; label?: string }> = ({ onClick, loading, label = 'AI Enhance' }) => (
  <button onClick={onClick} disabled={loading} className="flex items-center gap-1 text-xs font-semibold px-2 py-1 rounded bg-violet-50 dark:bg-violet-900/30 text-violet-600 dark:text-violet-400 hover:bg-violet-100 transition disabled:opacity-50 border border-violet-200 dark:border-violet-800">
    <svg width="10" height="10" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" className="inline-block align-middle mr-1"><path d="M12 2l3.09 6.26L22 9.27l-5 4.87 1.18 6.88L12 17.77l-6.18 3.25L7 14.14 2 9.27l6.91-1.01L12 2z" /></svg>
    {loading ? 'Working...' : label}
  </button>
);

const Toggle: React.FC<{ checked: boolean; onChange: () => void }> = ({ checked, onChange }) => (
  <label className="relative inline-flex items-center cursor-pointer">
    <input type="checkbox" checked={checked} onChange={onChange} className="sr-only peer" />
    <div className="w-9 h-5 bg-gray-300 rounded-full peer peer-checked:after:translate-x-full after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:rounded-full after:h-4 after:w-4 after:transition-all peer-checked:bg-indigo-600" />
  </label>
);

// ===================================================================
// MAIN PAGE
// ===================================================================
const CVGeneratorPage: React.FC = () => {
  const navigate = useNavigate();
  const [data, setData] = useState<CVData>(initialData);
  const [activeSection, setActiveSection] = useState('personal');
  const [template, setTemplate] = useState<TemplateId>('classic');
  const [color, setColor] = useState('#111111');
  const cvPreviewRef = useRef<HTMLDivElement>(null);
  const [isDownloading, setIsDownloading] = useState(false);
  const [aiLoadingKey, setAiLoadingKey] = useState('');
  const [visibleSections, setVisibleSections] = useState<VisibleSections>({ experience: true, education: true, skills: true, projects: true });

  useEffect(() => { document.title = 'CV / Resume Builder | PDFBullet'; }, []);

  const toggleSection = (s: keyof VisibleSections) => setVisibleSections(p => ({ ...p, [s]: !p[s] }));

  const onDrop = useCallback((files: File[]) => {
    if (files[0]) {
      const r = new FileReader();
      r.onload = () => setData(d => ({ ...d, profilePicture: r.result as string }));
      r.readAsDataURL(files[0]);
    }
  }, []);
  const { getRootProps, getInputProps, isDragActive } = useDropzone({ onDrop, accept: { 'image/*': [] } });

  const callAI = async (action: string, payload: any, onResult: (r: string) => void) => {
    setAiLoadingKey(action);
    try {
      const res = await fetch('/api/enhance-cv', { method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify({ action, data: payload }) });
      const json = await res.json();
      if (!res.ok) throw new Error(json.error);
      onResult(json.result);
    } catch (e: any) { alert('AI error: ' + e.message); }
    finally { setAiLoadingKey(''); }
  };

  const genSummary = () => callAI('generate-summary', { name: data.fullName, title: data.professionalTitle, skills: data.skills.map(s => s.name), experiences: data.experiences }, r => setData(d => ({ ...d, summary: r })));
  const suggestSkills = () => callAI('suggest-skills', { title: data.professionalTitle, experiences: data.experiences }, r => { try { const p = JSON.parse(r); if (Array.isArray(p)) setData(d => ({ ...d, skills: [...d.skills, ...p.map((n: string, i: number) => ({ id: Date.now() + i, name: n }))] })); } catch { } });
  const improveExp = (id: number) => { const e = data.experiences.find(x => x.id === id); if (!e) return; callAI('improve-experience', { jobTitle: e.jobTitle, company: e.company, description: e.description }, r => setData(d => ({ ...d, experiences: d.experiences.map(x => x.id === id ? { ...x, description: r } : x) }))); };
  const improveEdu = (id: number) => { const e = data.educations.find(x => x.id === id); if (!e) return; callAI('improve-education', { degree: e.degree, school: e.school, description: e.description }, r => setData(d => ({ ...d, educations: d.educations.map(x => x.id === id ? { ...x, description: r } : x) }))); };

  const downloadPDF = async () => {
    const el = cvPreviewRef.current; if (!el) return;
    setIsDownloading(true);
    try {
      const canvas = await html2canvas(el, { scale: 3, useCORS: true, backgroundColor: '#ffffff' });
      const img = canvas.toDataURL('image/png');
      const pdf = new jsPDF('p', 'mm', 'a4');
      const w = pdf.internal.pageSize.getWidth();
      pdf.addImage(img, 'PNG', 0, 0, w, (canvas.height * w) / canvas.width);
      pdf.save(`${data.fullName.replace(/\s+/g, '-')}-CV.pdf`);
    } finally { setIsDownloading(false); }
  };

  // State update handlers
  const handleUpdatePersonal = (field: string, val: string) => setData(p => ({ ...p, [field]: val }));
  const handleUpdateContact = (field: string, val: string) => setData(p => ({ ...p, contact: { ...p.contact, [field]: val } }));
  const handleUpdateExp = (id: number, field: string, val: string) => setData(p => ({ ...p, experiences: p.experiences.map(x => x.id === id ? { ...x, [field]: val } : x) }));
  const handleUpdateEdu = (id: number, field: string, val: string) => setData(p => ({ ...p, educations: p.educations.map(x => x.id === id ? { ...x, [field]: val } : x) }));
  const handleUpdateSkill = (id: number, val: string) => setData(p => ({ ...p, skills: p.skills.map(x => x.id === id ? { ...x, name: val } : x) }));
  const handleUpdateProj = (id: number, field: string, val: string) => setData(p => ({ ...p, projects: p.projects.map(x => x.id === id ? { ...x, [field]: val } : x) }));

  const arr = <K extends keyof CVData>(key: K, id: number, field: string, val: any) =>
    setData(p => ({ ...p, [key]: (p[key] as any[]).map(x => x.id === id ? { ...x, [field]: val } : x) }));
  const addArr = (key: keyof CVData, item: any) =>
    setData(p => ({ ...p, [key]: [...(p[key] as any[]), { id: Date.now(), ...item }] }));
  const delArr = (key: keyof CVData, id: number) =>
    setData(p => ({ ...p, [key]: (p[key] as any[]).filter((x: any) => x.id !== id) }));

  const navItems = [
    { id: 'personal', label: 'Info', Icon: UserIcon },
    { id: 'experience', label: 'Work', Icon: BriefcaseIcon },
    { id: 'education', label: 'Education', Icon: StudentIcon },
    { id: 'skills', label: 'Skills', Icon: BrainIcon },
    { id: 'projects', label: 'Projects', Icon: PuzzleIcon },
    { id: 'design', label: 'Design', Icon: null },
  ];

  return (
    <div className="min-h-screen bg-gray-100 dark:bg-zinc-950 text-gray-900 dark:text-gray-100 flex flex-col">
      {/* Header */}
      <header className="bg-white dark:bg-zinc-900 border-b border-gray-200 dark:border-zinc-800 px-5 py-3 flex justify-between items-center flex-shrink-0">
        <div className="flex items-center gap-3">
          <button onClick={() => navigate('/')} className="p-2 rounded-lg hover:bg-gray-100 dark:hover:bg-zinc-800 text-gray-500 transition">
            <LeftArrowIcon className="h-5 w-5" />
          </button>
          <span className="font-bold text-lg text-gray-900 dark:text-white">CV / Resume Builder</span>
          <span className="hidden sm:inline text-xs bg-violet-100 dark:bg-violet-900/30 text-violet-700 dark:text-violet-400 px-2 py-0.5 rounded-full font-semibold">AI Powered</span>
        </div>
        <button
          id="download-cv-pdf-btn"
          onClick={downloadPDF}
          disabled={isDownloading}
          className="flex items-center gap-2 bg-gray-900 hover:bg-gray-700 dark:bg-white dark:hover:bg-gray-200 text-white dark:text-gray-900 font-semibold py-2 px-5 rounded-lg transition text-sm disabled:opacity-60 shadow-sm"
        >
          <DownloadIcon className="h-4 w-4" />
          {isDownloading ? 'Generating PDF...' : 'Download PDF'}
        </button>
      </header>

      <div className="flex flex-1 overflow-hidden">
        {/* Sidebar */}
        <aside className="w-72 xl:w-80 bg-white dark:bg-zinc-900 border-r border-gray-200 dark:border-zinc-800 flex flex-col overflow-hidden flex-shrink-0">
          {/* Nav tabs */}
          <div className="flex border-b border-gray-200 dark:border-zinc-800 overflow-x-auto flex-shrink-0">
            {navItems.map(s => (
              <button key={s.id} onClick={() => setActiveSection(s.id)} className={`flex-shrink-0 flex items-center gap-1.5 px-3 py-2.5 text-xs font-semibold border-b-2 transition-colors whitespace-nowrap ${activeSection === s.id ? 'border-gray-900 dark:border-white text-gray-900 dark:text-white' : 'border-transparent text-gray-400 hover:text-gray-600 dark:hover:text-gray-300'}`}>
                {s.Icon && <s.Icon className="h-3.5 w-3.5" />} {s.label}
              </button>
            ))}
          </div>

          {/* Content */}
          <div className="flex-1 overflow-y-auto p-4 space-y-4">

            {activeSection === 'personal' && <>
              <div {...getRootProps()} className={`p-5 border-2 border-dashed rounded-xl text-center cursor-pointer transition-colors ${isDragActive ? 'border-indigo-500 bg-indigo-50' : 'border-gray-200 dark:border-zinc-700 hover:border-gray-400'}`}>
                <input {...getInputProps()} />
                {data.profilePicture
                  ? <img src={data.profilePicture} alt="" className="w-16 h-16 rounded-full mx-auto object-cover" />
                  : <div className="flex flex-col items-center gap-2 text-gray-400 text-xs"><UploadIcon className="h-7 w-7" /><span>Upload profile photo</span></div>}
              </div>
              <div className="space-y-1.5">
                <label className="text-xs font-semibold text-gray-500">Full Name</label>
                <input value={data.fullName} onChange={e => setData(d => ({ ...d, fullName: e.target.value }))} className="w-full px-3 py-2 text-sm border border-gray-200 dark:border-zinc-700 rounded-lg bg-white dark:bg-zinc-800 text-gray-800 dark:text-gray-100 focus:ring-2 focus:ring-indigo-500 transition" />
              </div>
              <div className="space-y-1.5">
                <label className="text-xs font-semibold text-gray-500">Professional Title</label>
                <input value={data.professionalTitle} onChange={e => setData(d => ({ ...d, professionalTitle: e.target.value }))} className="w-full px-3 py-2 text-sm border border-gray-200 dark:border-zinc-700 rounded-lg bg-white dark:bg-zinc-800 text-gray-800 dark:text-gray-100 focus:ring-2 focus:ring-indigo-500 transition" />
              </div>
              <div>
                <div className="flex items-center justify-between mb-1.5">
                  <label className="text-xs font-semibold text-gray-500 dark:text-gray-400">Summary</label>
                  <AiBtn onClick={genSummary} loading={aiLoadingKey === 'generate-summary'} label="Write with AI" />
                </div>
                <textarea value={data.summary} onChange={e => setData(d => ({ ...d, summary: e.target.value }))} rows={4} className="w-full px-3 py-2 text-sm border border-gray-200 dark:border-zinc-700 rounded-lg bg-white dark:bg-zinc-800 text-gray-800 dark:text-gray-100 focus:ring-2 focus:ring-indigo-500 transition resize-none placeholder-gray-400" placeholder="Professional summary..." />
              </div>
              <div className="space-y-2">
                <p className="text-xs font-semibold text-gray-500 dark:text-gray-400 uppercase tracking-wider">Contact</p>
                <input placeholder="Email address" value={data.contact.email} onChange={e => setData(d => ({ ...d, contact: { ...d.contact, email: e.target.value } }))} className="w-full px-3 py-2 text-sm border border-gray-200 dark:border-zinc-700 rounded-lg bg-white dark:bg-zinc-800 text-gray-800 dark:text-gray-100 focus:ring-2 focus:ring-indigo-500 transition" />
                <input placeholder="Phone number" value={data.contact.phone} onChange={e => setData(d => ({ ...d, contact: { ...d.contact, phone: e.target.value } }))} className="w-full px-3 py-2 text-sm border border-gray-200 dark:border-zinc-700 rounded-lg bg-white dark:bg-zinc-800 text-gray-800 dark:text-gray-100 focus:ring-2 focus:ring-indigo-500 transition" />
                <input placeholder="City, Country" value={data.contact.address} onChange={e => setData(d => ({ ...d, contact: { ...d.contact, address: e.target.value } }))} className="w-full px-3 py-2 text-sm border border-gray-200 dark:border-zinc-700 rounded-lg bg-white dark:bg-zinc-800 text-gray-800 dark:text-gray-100 focus:ring-2 focus:ring-indigo-500 transition" />
                <input placeholder="Website (optional)" value={data.contact.website} onChange={e => setData(d => ({ ...d, contact: { ...d.contact, website: e.target.value } }))} className="w-full px-3 py-2 text-sm border border-gray-200 dark:border-zinc-700 rounded-lg bg-white dark:bg-zinc-800 text-gray-800 dark:text-gray-100 focus:ring-2 focus:ring-indigo-500 transition" />
                <input placeholder="LinkedIn URL (optional)" value={data.contact.linkedin} onChange={e => setData(d => ({ ...d, contact: { ...d.contact, linkedin: e.target.value } }))} className="w-full px-3 py-2 text-sm border border-gray-200 dark:border-zinc-700 rounded-lg bg-white dark:bg-zinc-800 text-gray-800 dark:text-gray-100 focus:ring-2 focus:ring-indigo-500 transition" />
              </div>
            </>}

            {activeSection === 'experience' && <>
              <div className="flex items-center justify-between">
                <p className="text-xs font-semibold text-gray-500 uppercase tracking-wider">Show on CV</p>
                <Toggle checked={visibleSections.experience} onChange={() => toggleSection('experience')} />
              </div>
              {data.experiences.map(exp => (
                <div key={exp.id} className="p-4 border border-gray-200 dark:border-zinc-700 rounded-xl bg-gray-50 dark:bg-zinc-800/50 space-y-2.5 relative">
                  <button onClick={() => delArr('experiences', exp.id)} className="absolute top-3 right-3 text-gray-300 hover:text-red-500 transition"><TrashIcon className="h-4 w-4" /></button>
                  <input placeholder="Job Title" value={exp.jobTitle} onChange={e => arr('experiences', exp.id, 'jobTitle', e.target.value)} className="w-full px-3 py-2 text-sm border border-gray-200 dark:border-zinc-700 rounded-lg bg-white dark:bg-zinc-800 text-gray-800 dark:text-gray-100 focus:ring-2 focus:ring-indigo-500 transition" />
                  <input placeholder="Company Name" value={exp.company} onChange={e => arr('experiences', exp.id, 'company', e.target.value)} className="w-full px-3 py-2 text-sm border border-gray-200 dark:border-zinc-700 rounded-lg bg-white dark:bg-zinc-800 text-gray-800 dark:text-gray-100 focus:ring-2 focus:ring-indigo-500 transition" />
                  <div className="flex gap-2">
                    <input type="month" value={exp.startDate} onChange={e => arr('experiences', exp.id, 'startDate', e.target.value)} className="w-full px-3 py-2 text-sm border border-gray-200 dark:border-zinc-700 rounded-lg bg-white dark:bg-zinc-800 text-gray-800 dark:text-gray-100 focus:ring-2 focus:ring-indigo-500 transition" />
                    <input placeholder="End / Present" value={exp.endDate} onChange={e => arr('experiences', exp.id, 'endDate', e.target.value)} className="w-full px-3 py-2 text-sm border border-gray-200 dark:border-zinc-700 rounded-lg bg-white dark:bg-zinc-800 text-gray-800 dark:text-gray-100 focus:ring-2 focus:ring-indigo-500 transition" />
                  </div>
                  <div>
                    <div className="flex justify-between mb-1.5">
                      <span className="text-xs text-gray-400">Description</span>
                      <AiBtn onClick={() => improveExp(exp.id)} loading={aiLoadingKey === 'improve-experience'} label="AI Improve" />
                    </div>
                    <RichTextEditor value={exp.description} onChange={v => arr('experiences', exp.id, 'description', v)} placeholder="Key achievements and responsibilities..." />
                  </div>
                </div>
              ))}
              <button onClick={() => addArr('experiences', { jobTitle: '', company: '', startDate: '', endDate: '', description: '' })} className="flex items-center gap-2 text-sm font-semibold text-gray-600 dark:text-gray-400 hover:text-gray-900 dark:hover:text-white transition">
                <PlusIcon className="h-4 w-4" /> Add Experience
              </button>
            </>}

            {activeSection === 'education' && <>
              <div className="flex items-center justify-between">
                <p className="text-xs font-semibold text-gray-500 uppercase tracking-wider">Show on CV</p>
                <Toggle checked={visibleSections.education} onChange={() => toggleSection('education')} />
              </div>
              {data.educations.map(edu => (
                <div key={edu.id} className="p-4 border border-gray-200 dark:border-zinc-700 rounded-xl bg-gray-50 dark:bg-zinc-800/50 space-y-2.5 relative">
                  <button onClick={() => delArr('educations', edu.id)} className="absolute top-3 right-3 text-gray-300 hover:text-red-500 transition"><TrashIcon className="h-4 w-4" /></button>
                  <input placeholder="Degree / Qualification" value={edu.degree} onChange={e => arr('educations', edu.id, 'degree', e.target.value)} className="w-full px-3 py-2 text-sm border border-gray-200 dark:border-zinc-700 rounded-lg bg-white dark:bg-zinc-800 text-gray-800 dark:text-gray-100 focus:ring-2 focus:ring-indigo-500 transition" />
                  <input placeholder="School / University" value={edu.school} onChange={e => arr('educations', edu.id, 'school', e.target.value)} className="w-full px-3 py-2 text-sm border border-gray-200 dark:border-zinc-700 rounded-lg bg-white dark:bg-zinc-800 text-gray-800 dark:text-gray-100 focus:ring-2 focus:ring-indigo-500 transition" />
                  <div className="flex gap-2">
                    <input type="month" value={edu.startDate} onChange={e => arr('educations', edu.id, 'startDate', e.target.value)} className="w-full px-3 py-2 text-sm border border-gray-200 dark:border-zinc-700 rounded-lg bg-white dark:bg-zinc-800 text-gray-800 dark:text-gray-100 focus:ring-2 focus:ring-indigo-500 transition" />
                    <input type="month" value={edu.endDate} onChange={e => arr('educations', edu.id, 'endDate', e.target.value)} className="w-full px-3 py-2 text-sm border border-gray-200 dark:border-zinc-700 rounded-lg bg-white dark:bg-zinc-800 text-gray-800 dark:text-gray-100 focus:ring-2 focus:ring-indigo-500 transition" />
                  </div>
                  <div>
                    <div className="flex justify-between mb-1.5">
                      <span className="text-xs text-gray-400">Notes</span>
                      <AiBtn onClick={() => improveEdu(edu.id)} loading={aiLoadingKey === 'improve-education'} label="AI Improve" />
                    </div>
                    <RichTextEditor value={edu.description} onChange={v => arr('educations', edu.id, 'description', v)} placeholder="GPA, honors, coursework..." />
                  </div>
                </div>
              ))}
              <button onClick={() => addArr('educations', { degree: '', school: '', startDate: '', endDate: '', description: '' })} className="flex items-center gap-2 text-sm font-semibold text-gray-600 dark:text-gray-400 hover:text-gray-900 dark:hover:text-white transition">
                <PlusIcon className="h-4 w-4" /> Add Education
              </button>
            </>}

            {activeSection === 'skills' && <>
              <div className="flex items-center justify-between">
                <p className="text-xs font-semibold text-gray-500 uppercase tracking-wider">Show on CV</p>
                <Toggle checked={visibleSections.skills} onChange={() => toggleSection('skills')} />
              </div>
              <button onClick={suggestSkills} disabled={aiLoadingKey === 'suggest-skills'} className="w-full flex items-center justify-center gap-2 text-sm font-semibold py-2.5 px-4 rounded-lg border-2 border-dashed border-violet-300 dark:border-violet-700 text-violet-600 dark:text-violet-400 hover:border-violet-500 transition disabled:opacity-50">
                <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><path d="M12 2l3.09 6.26L22 9.27l-5 4.87 1.18 6.88L12 17.77l-6.18 3.25L7 14.14 2 9.27l6.91-1.01L12 2z" /></svg>
                {aiLoadingKey === 'suggest-skills' ? 'Suggesting skills...' : 'Suggest Skills for my Role with AI'}
              </button>
              {data.skills.map(skill => (
                <div key={skill.id} className="flex items-center gap-2">
                  <input placeholder="Skill" value={skill.name} onChange={e => arr('skills', skill.id, 'name', e.target.value)} className="w-full px-3 py-2 text-sm border border-gray-200 dark:border-zinc-700 rounded-lg bg-white dark:bg-zinc-800 text-gray-800 dark:text-gray-100 focus:ring-2 focus:ring-indigo-500 transition" />
                  <button onClick={() => delArr('skills', skill.id)} className="text-gray-300 hover:text-red-500 transition flex-shrink-0"><TrashIcon className="h-4 w-4" /></button>
                </div>
              ))}
              <button onClick={() => addArr('skills', { name: '' })} className="flex items-center gap-2 text-sm font-semibold text-gray-600 dark:text-gray-400 hover:text-gray-900 dark:hover:text-white transition">
                <PlusIcon className="h-4 w-4" /> Add Skill
              </button>
            </>}

            {activeSection === 'projects' && <>
              <div className="flex items-center justify-between">
                <p className="text-xs font-semibold text-gray-500 uppercase tracking-wider">Show on CV</p>
                <Toggle checked={visibleSections.projects} onChange={() => toggleSection('projects')} />
              </div>
              {data.projects.map(proj => (
                <div key={proj.id} className="p-4 border border-gray-200 dark:border-zinc-700 rounded-xl bg-gray-50 dark:bg-zinc-800/50 space-y-2.5 relative">
                  <button onClick={() => delArr('projects', proj.id)} className="absolute top-3 right-3 text-gray-300 hover:text-red-500 transition"><TrashIcon className="h-4 w-4" /></button>
                  <input placeholder="Project Name" value={proj.name} onChange={e => arr('projects', proj.id, 'name', e.target.value)} className="w-full px-3 py-2 text-sm border border-gray-200 dark:border-zinc-700 rounded-lg bg-white dark:bg-zinc-800 text-gray-800 dark:text-gray-100 focus:ring-2 focus:ring-indigo-500 transition" />
                  <RichTextEditor value={proj.description} onChange={v => arr('projects', proj.id, 'description', v)} placeholder="Describe the project, tech used, impact..." />
                </div>
              ))}
              <button onClick={() => addArr('projects', { name: '', description: '' })} className="flex items-center gap-2 text-sm font-semibold text-gray-600 dark:text-gray-400 hover:text-gray-900 dark:hover:text-white transition">
                <PlusIcon className="h-4 w-4" /> Add Project
              </button>
            </>}

            {activeSection === 'design' && <>
              <div>
                <p className="text-xs font-semibold text-gray-500 dark:text-gray-400 uppercase tracking-wider mb-3">Template</p>
                <div className="space-y-2">
                  {TEMPLATES.map(t => (
                    <button key={t.id} onClick={() => setTemplate(t.id)} className={`w-full text-left px-4 py-3 rounded-xl border-2 transition-all ${template === t.id ? 'border-gray-900 dark:border-white bg-gray-50 dark:bg-zinc-800' : 'border-gray-100 dark:border-zinc-800 hover:border-gray-300 dark:hover:border-zinc-600'}`}>
                      <div className="flex items-center justify-between">
                        <div>
                          <p className="font-semibold text-sm text-gray-800 dark:text-gray-100">{t.label}</p>
                          <p className="text-xs text-gray-400 mt-0.5">{t.desc}</p>
                        </div>
                        {template === t.id && <div className="w-2 h-2 rounded-full bg-gray-900 dark:bg-white flex-shrink-0" />}
                      </div>
                    </button>
                  ))}
                </div>
              </div>
              <div>
                <p className="text-xs font-semibold text-gray-500 dark:text-gray-400 uppercase tracking-wider mb-3">Accent Color</p>
                <div className="grid grid-cols-5 gap-2">
                  {ACCENT_COLORS.map(c => (
                    <button key={c} onClick={() => setColor(c)} title={c} className={`h-10 rounded-lg border-2 transition-transform hover:scale-110 ${color === c ? 'border-white shadow-lg ring-2 ring-offset-1 ring-gray-400 scale-110' : 'border-transparent'}`} style={{ background: c }} />
                  ))}
                </div>
                <div className="mt-3 flex items-center gap-3">
                  <span className="text-xs text-gray-500">Custom color:</span>
                  <input type="color" value={color} onChange={e => setColor(e.target.value)} className="h-8 w-14 rounded-md border border-gray-300 cursor-pointer p-0.5" />
                  <span className="text-xs font-mono text-gray-400">{color}</span>
                </div>
              </div>
            </>}

          </div>
        </aside>

        {/* Preview */}
        <main className="flex-1 bg-zinc-300 dark:bg-zinc-800 overflow-auto flex items-start justify-center p-8">
          <div ref={cvPreviewRef} className="shadow-2xl" style={{ maxWidth: '210mm' }}>
            <TemplateRenderer
              data={data}
              template={template}
              color={color}
              visibleSections={visibleSections}
              onUpdatePersonal={handleUpdatePersonal}
              onUpdateContact={handleUpdateContact}
              onUpdateExp={handleUpdateExp}
              onUpdateEdu={handleUpdateEdu}
              onUpdateSkill={handleUpdateSkill}
              onUpdateProj={handleUpdateProj}
            />
          </div>
        </main>
      </div>
    </div>
  );
};

export default CVGeneratorPage;