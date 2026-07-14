import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { TOOLS } from '../constants.ts';
import { CopyIcon, DownloadIcon, BookOpenIcon, LeftArrowIcon } from '../components/icons.tsx';

// Simple markdown-to-HTML renderer for the lesson plan output
const renderMarkdown = (text: string): string => {
  return text
    .replace(/\*\*(.+?)\*\*/g, '<strong>$1</strong>')
    .replace(/^- (.+)$/gm, '<li class="ml-4 list-disc">$1</li>')
    .replace(/^(\d+)\. (.+)$/gm, '<li class="ml-4 list-decimal">$2</li>')
    .replace(/\n\n/g, '</p><p class="mb-3">')
    .replace(/\n/g, '<br/>');
};

const LessonPlanCreatorPage: React.FC = () => {
  const tool = TOOLS.find(t => t.id === 'lesson-plan-creator');

  const [grade, setGrade] = useState('');
  const [subject, setSubject] = useState('');
  const [topic, setTopic] = useState('');
  const [duration, setDuration] = useState('45');
  const [style, setStyle] = useState('');
  const [lessonPlan, setLessonPlan] = useState('');

  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState('');
  const [copiedTooltip, setCopiedTooltip] = useState(false);

  useEffect(() => {
    document.title = 'AI Lesson Plan Creator | PDFBullet';
    const metaDesc = document.querySelector('meta[name="description"]');
    if (metaDesc) {
      metaDesc.setAttribute('content', 'Generate detailed, engaging lesson plans for any subject in seconds using AI. Activities, assessments, homework — all included.');
    }
  }, []);

  const handleGenerate = async () => {
    if (!grade || !subject || !topic) {
      setError('Please fill in Grade Level, Subject, and Topic.');
      return;
    }

    setIsLoading(true);
    setError('');
    setLessonPlan('');

    try {
      const res = await fetch('/api/generate-lesson-plan', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ grade, subject, topic, duration, style }),
      });

      const data = await res.json();

      if (!res.ok) {
        throw new Error(data.error || 'Failed to generate lesson plan.');
      }

      setLessonPlan(data.lessonPlan);
    } catch (e: any) {
      console.error('Lesson Plan Error:', e);
      setError(e.message || 'An error occurred. Please try again.');
    } finally {
      setIsLoading(false);
    }
  };

  const handleCopy = () => {
    navigator.clipboard.writeText(lessonPlan).then(() => {
      setCopiedTooltip(true);
      setTimeout(() => setCopiedTooltip(false), 2000);
    });
  };

  const handleDownloadTxt = () => {
    const blob = new Blob([lessonPlan], { type: 'text/plain' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `lesson-plan-${topic.replace(/\s+/g, '-').toLowerCase()}.txt`;
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    setTimeout(() => URL.revokeObjectURL(url), 1000);
  };

  const handleDownloadPdf = async () => {
    try {
      const { default: jsPDF } = await import('jspdf');
      const pdf = new jsPDF({ unit: 'mm', format: 'a4' });
      const pageWidth = pdf.internal.pageSize.getWidth();
      const margin = 15;
      const maxWidth = pageWidth - margin * 2;

      // Title
      pdf.setFontSize(18);
      pdf.setFont('helvetica', 'bold');
      pdf.text(`Lesson Plan: ${topic}`, margin, 20);

      // Meta
      pdf.setFontSize(11);
      pdf.setFont('helvetica', 'normal');
      pdf.text(`Grade: ${grade} | Subject: ${subject} | Duration: ${duration} min`, margin, 30);

      // Content
      pdf.setFontSize(10);
      const lines = pdf.splitTextToSize(lessonPlan.replace(/\*\*/g, ''), maxWidth);
      let y = 40;
      for (const line of lines) {
        if (y > 280) {
          pdf.addPage();
          y = 15;
        }
        pdf.text(line, margin, y);
        y += 5;
      }

      pdf.save(`lesson-plan-${topic.replace(/\s+/g, '-').toLowerCase()}.pdf`);
    } catch (e) {
      console.error('PDF download error:', e);
      handleDownloadTxt();
    }
  };

  return (
    <div className="min-h-[calc(100vh-200px)] flex flex-col py-10 px-4 sm:px-6 bg-gray-50 dark:bg-black">
      {/* Back link */}
      <div className="w-full max-w-6xl mx-auto mb-6">
        <Link
          to="/"
          className="inline-flex items-center gap-2 text-gray-600 dark:text-gray-400 hover:text-brand-red dark:hover:text-brand-red transition-colors font-medium"
        >
          <LeftArrowIcon className="h-5 w-5" />
          <span>Back to All Tools</span>
        </Link>
      </div>

      {/* Header */}
      <div className="text-center mb-10">
        <h1 className={`text-4xl font-extrabold ${tool?.textColor || 'text-indigo-600'}`}>
          AI Lesson Plan Creator
        </h1>
        <p className="mt-2 text-lg text-gray-600 dark:text-gray-300 max-w-3xl mx-auto">
          Generate detailed, ready-to-use lesson plans for any subject in seconds — powered by AI.
        </p>
      </div>

      <div className="w-full max-w-6xl mx-auto grid lg:grid-cols-3 gap-8">

        {/* Input Form */}
        <div className="lg:col-span-1 bg-white dark:bg-zinc-900 border border-gray-200 dark:border-gray-800 rounded-xl p-6 shadow-lg h-fit lg:sticky lg:top-24">
          <h2 className="text-xl font-bold mb-5 text-gray-800 dark:text-gray-100">📋 Lesson Details</h2>
          <div className="space-y-4">
            <div>
              <label htmlFor="grade" className="block text-sm font-bold text-gray-700 dark:text-gray-300 mb-1">
                Grade Level <span className="text-red-500">*</span>
              </label>
              <input
                type="text" id="grade" value={grade}
                onChange={e => setGrade(e.target.value)}
                className="w-full px-3 py-2 bg-gray-50 dark:bg-zinc-800 border border-gray-300 dark:border-zinc-700 rounded-lg text-sm focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 dark:text-gray-100"
                placeholder="e.g., Grade 8, Year 10, University"
              />
            </div>
            <div>
              <label htmlFor="subject" className="block text-sm font-bold text-gray-700 dark:text-gray-300 mb-1">
                Subject <span className="text-red-500">*</span>
              </label>
              <input
                type="text" id="subject" value={subject}
                onChange={e => setSubject(e.target.value)}
                className="w-full px-3 py-2 bg-gray-50 dark:bg-zinc-800 border border-gray-300 dark:border-zinc-700 rounded-lg text-sm focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 dark:text-gray-100"
                placeholder="e.g., Biology, Mathematics, History"
              />
            </div>
            <div>
              <label htmlFor="topic" className="block text-sm font-bold text-gray-700 dark:text-gray-300 mb-1">
                Topic <span className="text-red-500">*</span>
              </label>
              <input
                type="text" id="topic" value={topic}
                onChange={e => setTopic(e.target.value)}
                className="w-full px-3 py-2 bg-gray-50 dark:bg-zinc-800 border border-gray-300 dark:border-zinc-700 rounded-lg text-sm focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 dark:text-gray-100"
                placeholder="e.g., Photosynthesis, Algebra, World War II"
              />
            </div>
            <div>
              <label htmlFor="duration" className="block text-sm font-bold text-gray-700 dark:text-gray-300 mb-1">
                Duration (minutes)
              </label>
              <input
                type="number" id="duration" value={duration} min="15" max="180"
                onChange={e => setDuration(e.target.value)}
                className="w-full px-3 py-2 bg-gray-50 dark:bg-zinc-800 border border-gray-300 dark:border-zinc-700 rounded-lg text-sm focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 dark:text-gray-100"
              />
            </div>
            <div>
              <label htmlFor="style" className="block text-sm font-bold text-gray-700 dark:text-gray-300 mb-1">
                Teaching Style / Notes <span className="text-gray-400 font-normal">(Optional)</span>
              </label>
              <textarea
                id="style" rows={3} value={style}
                onChange={e => setStyle(e.target.value)}
                className="w-full px-3 py-2 bg-gray-50 dark:bg-zinc-800 border border-gray-300 dark:border-zinc-700 rounded-lg text-sm focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 dark:text-gray-100 resize-none"
                placeholder="e.g., Project-based, visual learners, include lab activity"
              />
            </div>

            {error && (
              <p className="text-sm text-red-500 bg-red-50 dark:bg-red-900/20 p-2 rounded-lg">{error}</p>
            )}

            <button
              id="generate-lesson-plan-btn"
              onClick={handleGenerate}
              disabled={isLoading}
              className="w-full bg-indigo-600 hover:bg-indigo-700 text-white font-bold py-3 px-8 rounded-xl text-base transition-all flex items-center justify-center gap-2 disabled:opacity-60 shadow-md hover:shadow-indigo-500/30"
            >
              {isLoading ? (
                <>
                  <svg className="animate-spin h-5 w-5 text-white" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                    <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
                    <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z" />
                  </svg>
                  Generating...
                </>
              ) : (
                <><BookOpenIcon className="h-5 w-5" /> Generate Lesson Plan</>
              )}
            </button>
          </div>
        </div>

        {/* Output */}
        <div className="lg:col-span-2 bg-white dark:bg-zinc-900 border border-gray-200 dark:border-gray-800 rounded-xl p-6 shadow-lg">
          <div className="flex justify-between items-center mb-4">
            <h2 className="text-xl font-bold text-gray-800 dark:text-gray-100">📄 Generated Lesson Plan</h2>
            {lessonPlan && (
              <div className="flex items-center gap-3">
                <div className="relative">
                  <button
                    id="copy-lesson-plan-btn"
                    onClick={handleCopy}
                    className="flex items-center gap-1 text-sm font-semibold text-gray-600 dark:text-gray-300 hover:text-brand-red transition-colors"
                  >
                    <CopyIcon className="h-4 w-4" /> Copy
                  </button>
                  {copiedTooltip && (
                    <span className="absolute -top-8 left-1/2 -translate-x-1/2 text-xs bg-black text-white px-2 py-1 rounded shadow-lg z-10 whitespace-nowrap">
                      Copied!
                    </span>
                  )}
                </div>
                <button
                  id="download-lesson-plan-txt-btn"
                  onClick={handleDownloadTxt}
                  className="flex items-center gap-1 text-sm font-semibold text-gray-600 dark:text-gray-300 hover:text-brand-red transition-colors"
                >
                  <DownloadIcon className="h-4 w-4" /> TXT
                </button>
                <button
                  id="download-lesson-plan-pdf-btn"
                  onClick={handleDownloadPdf}
                  className="flex items-center gap-1 text-sm font-semibold px-3 py-1.5 bg-indigo-600 hover:bg-indigo-700 text-white rounded-lg transition-colors"
                >
                  <DownloadIcon className="h-4 w-4" /> PDF
                </button>
              </div>
            )}
          </div>

          {lessonPlan ? (
            <div className="prose prose-sm dark:prose-invert max-w-none">
              <div
                className="text-sm leading-relaxed text-gray-800 dark:text-gray-200 space-y-2 p-4 bg-gray-50 dark:bg-zinc-800 rounded-xl border border-gray-100 dark:border-zinc-700 overflow-auto max-h-[70vh]"
                style={{ whiteSpace: 'pre-wrap', fontFamily: 'inherit' }}
              >
                {lessonPlan.split('\n').map((line, i) => {
                  const isBold = line.startsWith('**') && line.includes('**', 2);
                  const isBullet = line.trim().startsWith('- ');
                  const isNumbered = /^\d+\./.test(line.trim());

                  if (isBold) {
                    const cleaned = line.replace(/\*\*/g, '');
                    return <p key={i} className="font-bold text-indigo-700 dark:text-indigo-400 mt-4 mb-1 text-base">{cleaned}</p>;
                  }
                  if (isBullet) {
                    return <p key={i} className="ml-4 text-gray-700 dark:text-gray-300">{'• ' + line.trim().slice(2)}</p>;
                  }
                  if (isNumbered) {
                    return <p key={i} className="ml-4 text-gray-700 dark:text-gray-300">{line.trim()}</p>;
                  }
                  if (!line.trim()) return <div key={i} className="h-1" />;
                  return <p key={i} className="text-gray-700 dark:text-gray-300">{line}</p>;
                })}
              </div>
            </div>
          ) : (
            <div className="text-center text-gray-400 dark:text-gray-600 py-24">
              {isLoading ? (
                <div className="flex flex-col items-center gap-3">
                  <svg className="animate-spin h-10 w-10 text-indigo-500" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                    <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
                    <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z" />
                  </svg>
                  <p className="text-lg font-semibold text-gray-600 dark:text-gray-300">Generating your lesson plan...</p>
                  <p className="text-sm">This takes about 5-10 seconds</p>
                </div>
              ) : (
                <>
                  <div className="text-6xl mb-4">📚</div>
                  <p className="text-lg font-semibold">Your lesson plan will appear here</p>
                  <p className="text-sm mt-1">Fill in the details on the left and click Generate</p>
                </>
              )}
            </div>
          )}
        </div>
      </div>

      {/* Back link bottom */}
      <div className="mt-12 text-center">
        <Link to="/" className="text-gray-600 dark:text-gray-400 hover:text-brand-red dark:hover:text-brand-red font-medium transition-colors">
          ← Back to all tools
        </Link>
      </div>
    </div>
  );
};

export default LessonPlanCreatorPage;