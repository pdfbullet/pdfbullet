
import React, { useState, useEffect } from 'react';
import { EmailIcon, WhatsAppIcon, PhoneIcon } from '../components/icons.tsx';

const ContactPage: React.FC = () => {
  const [submitted, setSubmitted] = useState(false);
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState('');

  useEffect(() => {
    document.title = "Contact Us | PDFBullet Support";
    const metaDesc = document.querySelector('meta[name="description"]');
    if (metaDesc) {
        metaDesc.setAttribute("content", "Get in touch with the PDFBullet team. Contact us for support, suggestions, or any questions you have about our free online PDF tools.");
    }
  }, []);

  const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    setSubmitting(true);
    setError('');

    const form = e.target as HTMLFormElement;
    const data = new FormData(form);

    try {
        const response = await fetch(form.action, {
            method: 'POST',
            body: data,
            headers: {
                'Accept': 'application/json'
            }
        });

        if (response.ok) {
            setSubmitted(true);
            form.reset();
        } else {
            const responseData = await response.json();
            if (responseData.errors) {
                setError(responseData.errors.map((error: any) => error.message).join(", "));
            } else {
                setError("Oops! There was a problem submitting your form.");
            }
        }
    } catch (error) {
        setError("Oops! There was a problem submitting your form.");
    } finally {
        setSubmitting(false);
    }
  };

  return (
    <div className="py-16 md:py-24">
      <div className="px-6">
        <div className="max-w-4xl mx-auto text-center mb-12">
          <h1 className="text-4xl md:text-5xl font-extrabold text-gray-800 dark:text-gray-100">Get In Touch</h1>
          <p className="mt-4 text-lg text-gray-600 dark:text-gray-300">
            Our dedicated support team is here to assist you with any inquiries, feedback, or technical issues. We strive to provide timely and helpful responses to ensure you have the best experience with our tools.
          </p>
        </div>
        
        <div className="max-w-5xl mx-auto mb-8 grid grid-cols-1 md:grid-cols-3 gap-6">
            <div className="bg-white dark:bg-black border border-gray-200 dark:border-gray-800 p-6 rounded-lg shadow-md flex items-center gap-4 border-glow-hover">
                 <div className="flex-shrink-0 bg-brand-red/10 p-3 rounded-full">
                    <EmailIcon className="h-6 w-6 text-brand-red" />
                 </div>
                 <div>
                    <h3 className="font-semibold text-gray-800 dark:text-gray-100">Email Us</h3>
                    <a href="mailto:Support@pdfbullet.com" className="text-brand-red hover:underline">
                        Support@pdfbullet.com
                    </a>
                 </div>
            </div>
            <a href="https://wa.me/message/JYA22CVSYSZ4N1" target="_blank" rel="noopener noreferrer" className="bg-white dark:bg-black border border-gray-200 dark:border-gray-800 p-6 rounded-lg shadow-md flex items-center gap-4 border-glow-hover hover:bg-gray-50 dark:hover:bg-gray-800">
                 <div className="flex-shrink-0 bg-green-500/10 p-3 rounded-full">
                    <WhatsAppIcon className="h-6 w-6 text-green-500" />
                 </div>
                 <div>
                    <h3 className="font-semibold text-gray-800 dark:text-gray-100">WhatsApp</h3>
                    <p className="text-gray-500 dark:text-gray-400">Chat with us</p>
                 </div>
            </a>
            <a href="tel:+9779827801575" className="bg-white dark:bg-black border border-gray-200 dark:border-gray-800 p-6 rounded-lg shadow-md flex items-center gap-4 border-glow-hover hover:bg-gray-50 dark:hover:bg-gray-800">
                 <div className="flex-shrink-0 bg-blue-500/10 p-3 rounded-full">
                    <PhoneIcon className="h-6 w-6 text-blue-500" />
                 </div>
                 <div>
                    <h3 className="font-semibold text-gray-800 dark:text-gray-100">Call Us</h3>
                    <p className="text-gray-500 dark:text-gray-400">+977-9827801575</p>
                 </div>
            </a>
        </div>


        <div className="bg-white dark:bg-black border border-gray-200 dark:border-gray-800 max-w-3xl mx-auto p-8 md:p-12 rounded-lg shadow-lg">
          {submitted ? (
            <div className="text-center">
              <div className="mx-auto flex items-center justify-center h-16 w-16 rounded-full bg-green-100 dark:bg-green-900/50 mb-6">
                <svg className="h-10 w-10 text-green-600 dark:text-green-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M5 13l4 4L19 7" />
                </svg>
              </div>
              <h2 className="text-2xl font-bold text-gray-800 dark:text-gray-100">Thank You!</h2>
              <p className="text-gray-600 dark:text-gray-300 mt-2">Your message has been sent successfully. We'll get back to you shortly.</p>
            </div>
          ) : (
            <form action="https://formspree.io/f/mwpqenrr" method="POST" onSubmit={handleSubmit}>
               <h3 className="text-xl font-bold text-center text-gray-800 dark:text-gray-100 mb-6">Or send us a message directly</h3>
              {error && <p className="text-center text-sm text-red-500 bg-red-100 dark:bg-red-900/30 p-3 rounded-md mb-6">{error}</p>}
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div>
                  <label htmlFor="name" className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">Name</label>
                  <input type="text" id="name" name="name" required className="w-full px-4 py-2 bg-white dark:bg-black border border-gray-300 dark:border-gray-600 rounded-md focus:ring-brand-red focus:border-brand-red text-gray-800 dark:text-gray-200" />
                </div>
                <div>
                  <label htmlFor="email" className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">Email</label>
                  <input type="email" id="email" name="email" required className="w-full px-4 py-2 bg-white dark:bg-black border border-gray-300 dark:border-gray-600 rounded-md focus:ring-brand-red focus:border-brand-red text-gray-800 dark:text-gray-200" />
                </div>
              </div>
              <div className="mt-6">
                <label htmlFor="subject" className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">Subject</label>
                <input type="text" id="subject" name="subject" required className="w-full px-4 py-2 bg-white dark:bg-black border border-gray-300 dark:border-gray-600 rounded-md focus:ring-brand-red focus:border-brand-red text-gray-800 dark:text-gray-200" />
              </div>
              <div className="mt-6">
                <label htmlFor="message" className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">Message</label>
                <textarea id="message" name="message" rows={5} required className="w-full px-4 py-2 bg-white dark:bg-black border border-gray-300 dark:border-gray-600 rounded-md focus:ring-brand-red focus:border-brand-red text-gray-800 dark:text-gray-200"></textarea>
              </div>
              <div className="mt-8 text-center">
                <button type="submit" disabled={submitting} className="bg-brand-red hover:bg-brand-red-dark text-white font-bold py-3 px-10 rounded-md transition-colors text-lg disabled:bg-red-300 dark:disabled:bg-red-800">
                  {submitting ? 'Sending...' : 'Send Message'}
                </button>
              </div>
            </form>
          )}
        </div>
      </div>
    </div>
  );
};

export default ContactPage;
