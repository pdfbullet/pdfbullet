
import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { GoogleGenAI } from '@google/genai';
import { Packer, Document, Paragraph, TextRun } from 'docx';
import jsPDF from 'jspdf';

import { TOOLS } from '../constants.ts';
import { CopyIcon, DownloadIcon, BookOpenIcon } from '../components/icons.tsx';

const AIQuizGenerator: React.FC<{ lessonPlan: string }> = ({ lessonPlan }) => {
    const [quiz, setQuiz] = useState('');
    const [isLoading, setIsLoading] = useState(false);
    const [error, setError] = useState('');
    const [copied, setCopied] = useState(false);

    const handleGenerateQuiz = async () => {
        setIsLoading(true);
        setError('');
        
        const apiKey = process.env.API_KEY;
        if (!apiKey) {
            setError("API Key not found. Please ensure it is set up correctly in your environment configuration.");
            setIsLoading(false);
            return;
        }

        try {
            const ai = new GoogleGenAI({ apiKey });
            const prompt = `Based on the following lesson plan, generate a 5-question multiple-choice quiz with an answer key at the end.\n\nLesson Plan:\n${lessonPlan}`;
            
            const response = await ai.models.generateContent({
                model: 'gemini-2.5-flash',
                contents: prompt,
            });

            setQuiz(response.text);
        } catch (e: any) {
            setError(`Failed to generate quiz. ${e.message}`);
        } finally {
            setIsLoading(false);
        }
    };
    
     const handleCopy = () => {
        navigator.clipboard.writeText(quiz).then(() => {
            setCopied(true);
            setTimeout(() => setCopied(false), 2000);
        });
    };

    return (
        <div className="mt-6 p-4 border-2 border-dashed border-purple-300 dark:border-purple-700 rounded-lg">
            <h3 className="text-xl font-bold text-purple-600 dark:text-purple-400">Need a Quiz?</h3>
            <p className="text-sm text-gray-600 dark:text-gray-400 mb-4">Generate a quick quiz based on the lesson plan above.</p>
            <button onClick={handleGenerateQuiz} disabled={isLoading} className="bg-purple-600 hover:bg-purple-700 text-white font-bold py-2 px-4 rounded-lg transition-colors disabled:bg-purple-300">
                {isLoading ? 'Generating Quiz...' : 'Generate Quiz'}
            </button>
            {error && <p className="mt-2 text-sm text-red-500">{error}</p>}
            {quiz && (
                <div className="mt-4 p-4 bg-gray-50 dark:bg-black rounded-md">
                    <div className="flex justify-between items-center mb-2">
                         <h4 className="font-semibold">Generated Quiz:</h4>
                         <button onClick={handleCopy} className="flex items-center gap-1 text-sm text-gray-500 hover:text-brand-red">
                             <CopyIcon className="h-4 w-4" /> {copied ? 'Copied!' : 'Copy'}
                         </button>
                    </div>
                    <pre className="whitespace-pre-wrap text-sm font-sans">{quiz}</pre>
                </div>
            )}
        </div>
    );
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
      document.title = "AI Lesson Plan Creator | PDFBullet";
      const metaDesc = document.querySelector('meta[name="description"]');
      if (metaDesc) {
          metaDesc.setAttribute("content", "Generate detailed, engaging lesson plans for any subject in seconds. Let AI build a plan with activities, assessments, and homework, saving you valuable time.");
      }
    }, []);

    const handleGenerate = async () => {
        if (!grade || !subject || !topic) {
            setError('Please fill in Grade, Subject, and Topic.');
            return;
        }

        const apiKey = process.env.API_KEY;
        if (!apiKey) {
            setError("API Key not found. Please ensure it is set up correctly in your environment configuration.");
            setIsLoading(false);
            return;
        }
        
        setIsLoading(true);
        setError('');
        setLessonPlan('');

        try {
            const ai = new GoogleGenAI({ apiKey });
            const prompt = `Create a detailed lesson plan for a ${duration}-minute class.
            - Grade Level: ${grade}
            - Subject: ${subject}
            - Topic: ${topic}
            ${style ? `- Teaching Style/Notes: ${style}` : ''}
            
            Please structure the output with clear headings for:
            1.  **Lesson Objectives:** What students should be able to do by the end of the lesson.
            2.  **Materials:** A list of required materials.
            3.  **Introduction (Hook):** An engaging opening activity (~5-10 mins).
            4.  **Main Activities:** Step-by-step teaching and student activities (~20-25 mins).
            5.  **Assessment/Check for Understanding:** How to gauge student comprehension (~5-10 mins).
            6.  **Conclusion & Homework:** A wrap-up and homework assignment.`;
            
            const response = await ai.models.generateContent({
                model: 'gemini-2.5-flash',
                contents: prompt,
            });

            setLessonPlan(response.text);
        } catch (e: any) {
            console.error("AI Lesson Plan Error:", e);
            const errorMessage = e.message || '';
            let userFriendlyError = 'An error occurred while generating the lesson plan. Please try again.';

            if (errorMessage.toLowerCase().includes('api key')) {
                userFriendlyError = 'The AI service is currently unavailable. Please check your API key configuration.';
            } else if (errorMessage.toLowerCase().includes('safety')) {
                userFriendlyError = 'Your input may have violated our safety policy. Please modify your input and try again.';
            } else {
                userFriendlyError = `Failed to generate lesson plan. ${errorMessage}`;
            }
            setError(userFriendlyError);
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
    
    const handleDownload = (format: 'pdf' | 'docx') => {
        if (format === 'pdf') {
            const pdf = new jsPDF();
            const lines = pdf.splitTextToSize(lessonPlan, 180);
            pdf.text(lines, 10, 10);
            pdf.save(`lesson-plan-${topic.replace(/\s/g, '_')}.pdf`);
        } else {
            const paragraphs = lessonPlan.split('\n').map(p => new Paragraph({
                children: [new TextRun(p)]
            }));
            const doc = new Document({ sections: [{ children: paragraphs }] });
            Packer.toBlob(doc).then(blob => {
                 const url = URL.createObjectURL(blob);
                 const a = document.createElement('a');
                 a.href = url;
                 a.download = `lesson-plan-${topic.replace(/\s/g, '_')}.docx`;
                 a.click();
                 URL.revokeObjectURL(url);
            });
        }
    };

    if (!tool) return null;

    return (
        <div className="min-h-[calc(100vh-200px)] flex flex-col py-12 px-4 sm:px-6 bg-gray-50 dark:bg-black">
            <div className="text-center mb-10">
                <h1 className={`text-4xl font-extrabold ${tool.textColor}`}>{tool.title}</h1>
                <p className="mt-2 text-lg text-gray-600 dark:text-gray-300 max-w-3xl mx-auto">{tool.description}</p>
            </div>
            
            <div className="w-full max-w-6xl mx-auto grid lg:grid-cols-3 gap-8">
                {/* Input Form */}
                <div className="lg:col-span-1 bg-white dark:bg-black border border-gray-200 dark:border-gray-800 rounded-lg p-6 shadow-lg h-fit lg:sticky lg:top-24">
                    <h2 className="text-2xl font-bold mb-4">Lesson Details</h2>
                    <div className="space-y-4">
                        <div>
                            <label htmlFor="grade" className="block text-sm font-bold text-gray-700 dark:text-gray-300">Grade Level*</label>
                            <input type="text" id="grade" value={grade} onChange={e => setGrade(e.target.value)} className="w-full mt-1 p-2 border rounded-md" placeholder="e.g., Grade 10" />
                        </div>
                        <div>
                            <label htmlFor="subject" className="block text-sm font-bold text-gray-700 dark:text-gray-300">Subject*</label>
                            <input type="text" id="subject" value={subject} onChange={e => setSubject(e.target.value)} className="w-full mt-1 p-2 border rounded-md" placeholder="e.g., Science" />
                        </div>
                        <div>
                            <label htmlFor="topic" className="block text-sm font-bold text-gray-700 dark:text-gray-300">Topic*</label>
                            <input type="text" id="topic" value={topic} onChange={e => setTopic(e.target.value)} className="w-full mt-1 p-2 border rounded-md" placeholder="e.g., Photosynthesis" />
                        </div>
                         <div>
                            <label htmlFor="duration" className="block text-sm font-bold text-gray-700 dark:text-gray-300">Duration (minutes)</label>
                            <input type="number" id="duration" value={duration} onChange={e => setDuration(e.target.value)} className="w-full mt-1 p-2 border rounded-md" />
                        </div>
                         <div>
                            <label htmlFor="style" className="block text-sm font-bold text-gray-700 dark:text-gray-300">Teaching Style / Notes (Optional)</label>
                            <textarea id="style" rows={3} value={style} onChange={e => setStyle(e.target.value)} className="w-full mt-1 p-2 border rounded-md" placeholder="e.g., Interactive, hands-on activities"></textarea>
                        </div>
                        {error && <p className="text-sm text-red-500">{error}</p>}
                        <button
                            onClick={handleGenerate}
                            disabled={isLoading}
                            className={`w-full ${tool.color} ${tool.hoverColor} text-white font-bold py-3 px-8 rounded-lg text-lg transition-colors flex items-center justify-center disabled:bg-indigo-300`}
                        >
                             {isLoading ? (
                                <>
                                    <svg className="animate-spin -ml-1 mr-3 h-5 w-5 text-white" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24"><circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle><path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path></svg>
                                    Generating...
                                </>
                            ) : (
                                <><BookOpenIcon className="h-6 w-6 mr-2" /> Generate Plan</>
                            )}
                        </button>
                    </div>
                </div>
                
                {/* Output */}
                <div className="lg:col-span-2 bg-white dark:bg-black border border-gray-200 dark:border-gray-800 rounded-lg p-6 shadow-lg">
                    <h2 className="text-2xl font-bold mb-4">Generated Lesson Plan</h2>
                    
                    {lessonPlan ? (
                        <div>
                             <div className="flex justify-end items-center gap-4 mb-4">
                                <div className="relative">
                                    <button onClick={handleCopy} className="flex items-center gap-1 text-sm font-semibold text-gray-600 dark:text-gray-300 hover:text-brand-red">
                                        <CopyIcon className="h-5 w-5"/> Copy
                                    </button>
                                     {copiedTooltip && <span className="absolute -top-8 left-1/2 -translate-x-1/2 text-xs bg-black text-white px-2 py-1 rounded shadow-lg z-10">Copied!</span>}
                                </div>
                                <div className="flex gap-2">
                                     <button onClick={() => handleDownload('pdf')} className="flex items-center gap-1 text-sm font-semibold text-gray-600 dark:text-gray-300 hover:text-brand-red">
                                        <DownloadIcon className="h-5 w-5"/> PDF
                                    </button>
                                     <button onClick={() => handleDownload('docx')} className="flex items-center gap-1 text-sm font-semibold text-gray-600 dark:text-gray-300 hover:text-brand-red">
                                        <DownloadIcon className="h-5 w-5"/> DOCX
                                    </button>
                                </div>
                            </div>
                            <div className="prose dark:prose-invert max-w-none text-sm whitespace-pre-wrap font-sans p-4 bg-gray-50 dark:bg-black rounded-md border">
                                {lessonPlan}
                            </div>
                            <AIQuizGenerator lessonPlan={lessonPlan} />
                        </div>
                    ) : (
                         <div className="text-center text-gray-500 py-20">
                           {isLoading ? (
                               <div className="py-12">
                                   <div className="flex items-center justify-center gap-3 text-xl font-bold text-gray-800 dark:text-gray-200">
                                        <svg className="animate-spin h-8 w-8 text-brand-red" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                                            <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                                            <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                                        </svg>
                                        <span>Generating your lesson plan...</span>
                                   </div>
                               </div>
                           ) : (
                               <p>Your generated lesson plan will appear here.</p>
                           )}
                        </div>
                    )}
                </div>
            </div>
             <div className="mt-12 text-center">
                <Link to="/" className="text-gray-600 dark:text-gray-400 hover:text-brand-red dark:hover:text-brand-red font-medium transition-colors">
                    &larr; Back to all tools
                </Link>
            </div>
        </div>
    );
};

export default LessonPlanCreatorPage;
