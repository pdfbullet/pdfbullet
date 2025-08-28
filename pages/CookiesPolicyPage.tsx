import React, { useEffect } from 'react';
import { Link } from 'react-router-dom';

const CookiesPolicyPage: React.FC = () => {
    useEffect(() => {
        document.title = "Cookie Policy | I Love PDFLY";
        const metaDesc = document.querySelector('meta[name="description"]');
        if (metaDesc) {
            metaDesc.setAttribute("content", "Learn about how I Love PDFLY uses cookies to improve your experience. Our Cookie Policy explains what cookies are, the types we use, and how you can manage them.");
        }
    }, []);

    return (
        <div className="py-16 md:py-24 bg-gray-50 dark:bg-black">
            <div className="px-6">
                <div className="max-w-4xl mx-auto bg-white dark:bg-black p-8 md:p-12 rounded-lg shadow-lg border border-gray-200 dark:border-gray-800">
                    <h1 className="text-3xl md:text-4xl font-extrabold text-gray-800 dark:text-gray-100 mb-8">Cookie Policy</h1>
                    <div className="prose dark:prose-invert max-w-none text-gray-700 dark:text-gray-300">
                        <p><strong>Last Updated: {new Date().toLocaleDateString()}</strong></p>
                        <p>This Cookie Policy explains how I Love PDFLY ("we", "us", and "our") uses cookies and similar technologies to recognize you when you visit our website at https://ilovepdfly.com. It explains what these technologies are and why we use them, as well as your rights to control our use of them.</p>

                        <h3>What are cookies?</h3>
                        <p>Cookies are small data files that are placed on your computer or mobile device when you visit a website. Cookies are widely used by website owners in order to make their websites work, or to work more efficiently, as well as to provide reporting information.</p>

                        <h3>Why do we use cookies?</h3>
                        <p>We use first-party and third-party cookies for several reasons. Some cookies are required for technical reasons in order for our Website to operate, and we refer to these as "essential" or "strictly necessary" cookies. Other cookies also enable us to track and target the interests of our users to enhance the experience on our Online Properties. Third parties serve cookies through our Website for analytics and other purposes.</p>

                        <h3>Types of cookies we use</h3>
                        <ul>
                            <li><strong>Strictly Necessary Cookies:</strong> These cookies are essential to provide you with services available through our Website and to enable you to use some of its features. For example, they allow you to log in to secure areas of our Website.</li>
                            <li><strong>Functionality Cookies:</strong> These cookies are used to remember choices you make when you use our Website, such as remembering your theme preference (light or dark mode) or your login details. The purpose of these cookies is to provide you with a more personal experience and to avoid you having to re-enter your preferences every time you visit.</li>
                            <li><strong>Analytics and Performance Cookies:</strong> These cookies are used to collect information about traffic to our Website and how users use the Website. The information gathered does not identify any individual visitor. It includes the number of visitors, the websites that referred them, the pages they visited, etc. We use this information to help operate our Website more efficiently, to gather broad demographic information and to monitor the level of activity on our Website.</li>
                        </ul>

                        <h3>How can you control cookies?</h3>
                        <p>You have the right to decide whether to accept or reject cookies. You can exercise your cookie rights by setting your preferences in your browser. Most browsers allow you to refuse to accept cookies and to delete cookies. The methods for doing so vary from browser to browser, and from version to version.</p>
                        <p>Please note, however, that if you block cookies, you may not be able to use all the features on our website.</p>

                        <h3>Changes to this Cookie Policy</h3>
                        <p>We may update this Cookie Policy from time to time in order to reflect, for example, changes to the cookies we use or for other operational, legal or regulatory reasons. Please therefore re-visit this Cookie Policy regularly to stay informed about our use of cookies and related technologies.</p>

                        <h3>Where can you get further information?</h3>
                        <p>If you have any questions about our use of cookies or other technologies, please email us at <a href="mailto:Support@ilovepdfly.com" className="text-brand-red hover:underline">Support@ilovepdfly.com</a> or refer to our <Link to="/privacy-policy" className="text-brand-red hover:underline">Privacy Policy</Link>.</p>
                    </div>
                </div>
            </div>
        </div>
    );
};

export default CookiesPolicyPage;