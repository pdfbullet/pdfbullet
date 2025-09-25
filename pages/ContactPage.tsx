import React, { useState, useEffect } from 'react';
import { EmailIcon, WhatsAppIcon, PhoneIcon } from '../components/icons.tsx';

// FIX: Added JSX return value and default export to make the component valid and lazy-loadable.
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

    // Simulate API call
    setTimeout(() => {
        setSubmitting(false);
        setSubmitted(true);
    }, 1000);
  };
  
  return (
    <div className="py-16 md:py-24 bg-gray-50 dark:bg-black">
      <div className="px-6">
        <div className="max-w-4xl mx-auto text-center mb-16">
          <h1 className="text-4xl md:text-5xl font-extrabold text-gray-800 dark:text-gray-100">Contact Us</h1>
          <p className="mt-4 text-lg text-gray-600 dark:text-gray-300">
            We're here to help. Whether you have a question about our tools, a suggestion, or a business inquiry, we'd love to hear from you.
          </p>
        </div>
        <div className="grid md:grid-cols-2 gap-12 max-w-5xl mx-auto">
          {/* Contact Form */}
          <div className="bg-white dark:bg-black p-8 rounded-lg shadow-lg border border-gray-200 dark:border-gray-800">
            <h2 className="text-2xl font-bold mb-6">Send us a message</h2>
            {submitted ? (
              <div className="text-center p-8 bg-green-50 dark:bg-green-900/20 rounded-lg">
                <h3 className="text-xl font-bold text-green-700 dark:text-green-300">Thank you!</h3>
                <p className="mt-2 text-gray-700 dark:text-gray-300">Your message has been sent. We'll get back to you shortly.</p>
              </div>
            ) : (
              <form onSubmit={handleSubmit} className="space-y-6">
                <div>
                  <label htmlFor="name" className="block text-sm font-medium text-gray-700 dark:text-gray-300">Full Name</label>
                  <input type="text" name="name" id="name" required className="mt-1 block w-full px-3 py-2 bg-white dark:bg-gray-800 border border-gray-300 dark:border-gray-600 rounded-md shadow-sm focus:outline-none focus:ring-brand-red focus:border-brand-red" />
                </div>
                <div>
                  <label htmlFor="email" className="block text-sm font-medium text-gray-700 dark:text-gray-300">Email Address</label>
                  <input type="email" name="email" id="email" required className="mt-1 block w-full px-3 py-2 bg-white dark:bg-gray-800 border border-gray-300 dark:border-gray-600 rounded-md shadow-sm focus:outline-none focus:ring-brand-red focus:border-brand-red" />
                </div>
                <div>
                  <label htmlFor="message" className="block text-sm font-medium text-gray-700 dark:text-gray-300">Message</label>
                  <textarea name="message" id="message" rows={4} required className="mt-1 block w-full px-3 py-2 bg-white dark:bg-gray-800 border border-gray-300 dark:border-gray-600 rounded-md shadow-sm focus:outline-none focus:ring-brand-red focus:border-brand-red"></textarea>
                </div>
                {error && <p className="text-sm text-red-500">{error}</p>}
                <div>
                  <button type="submit" disabled={submitting} className="w-full flex justify-center py-3 px-4 border border-transparent rounded-md shadow-sm text-sm font-medium text-white bg-brand-red hover:bg-brand-red-dark focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-brand-red-dark disabled:bg-red-300">
                    {submitting ? 'Sending...' : 'Send Message'}
                  </button>
                </div>
              </form>
            )}
          </div>
          {/* Contact Info */}
          <div className="space-y-6">
            <div className="bg-white dark:bg-black p-6 rounded-lg shadow-lg border border-gray-200 dark:border-gray-800 flex items-start gap-4">
              <EmailIcon className="h-8 w-8 text-brand-red flex-shrink-0 mt-1" />
              <div>
                <h3 className="text-xl font-bold">Email Us</h3>
                <p className="text-gray-600 dark:text-gray-400">For general inquiries and support.</p>
                <a href="mailto:Support@pdfbullet.com" className="text-brand-red font-semibold hover:underline">Support@pdfbullet.com</a>
              </div>
            </div>
            <div className="bg-white dark:bg-black p-6 rounded-lg shadow-lg border border-gray-200 dark:border-gray-800 flex items-start gap-4">
              <WhatsAppIcon className="h-8 w-8 text-green-500 flex-shrink-0 mt-1" />
              <div>
                <h3 className="text-xl font-bold">Chat on WhatsApp</h3>
                <p className="text-gray-600 dark:text-gray-400">For urgent support and quick questions.</p>
                <a href="https://wa.me/9779827801575" target="_blank" rel="noopener noreferrer" className="text-green-500 font-semibold hover:underline">Chat with us</a>
              </div>
            </div>
            <div className="bg-white dark:bg-black p-6 rounded-lg shadow-lg border border-gray-200 dark:border-gray-800 flex items-start gap-4">
              <PhoneIcon className="h-8 w-8 text-blue-500 flex-shrink-0 mt-1" />
              <div>
                <h3 className="text-xl font-bold">Call Us</h3>
                <p className="text-gray-600 dark:text-gray-400">For business and enterprise inquiries.</p>
                <a href="tel:+9779827801575" className="text-blue-500 font-semibold hover:underline">+977-9827801575</a>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default ContactPage;
