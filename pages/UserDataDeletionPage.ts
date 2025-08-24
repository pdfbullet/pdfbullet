import React, { useEffect } from 'react';

const UserDataDeletionPage: React.FC = () => {
    useEffect(() => {
        document.title = "User Data Deletion | I Love PDFLY";
    }, []);

    return (
        <div className="py-16 md:py-24 bg-gray-50 dark:bg-black">
            <div className="container mx-auto px-6">
                <div className="max-w-4xl mx-auto bg-white dark:bg-black p-8 md:p-12 rounded-lg shadow-lg border border-gray-200 dark:border-gray-800">
                    <h1 className="text-3xl md:text-4xl font-extrabold text-gray-800 dark:text-gray-100 mb-8">User Data Deletion Request</h1>
                    <div className="prose dark:prose-invert max-w-none text-gray-700 dark:text-gray-300">
                        <p>We are committed to protecting your privacy and giving you control over your personal data. If you wish to delete your account and all associated data from our systems, please follow the instructions below.</p>
                        
                        <h3>How to Request Data Deletion</h3>
                        <p>To request the deletion of your user data, please send an email to our support team with the subject line "Data Deletion Request".</p>
                        <p>
                            <strong>Email:</strong> <a href="mailto:Support@ilovepdfly.com" className="text-brand-red hover:underline">Support@ilovepdfly.com</a>
                        </p>
                        <p>In the body of your email, please include the following information to help us identify your account:</p>
                        <ul>
                            <li>The username associated with your account.</li>
                            <li>The email address you used to register.</li>
                        </ul>

                        <h3>What Happens Next?</h3>
                        <p>Once we receive your request, our team will:</p>
                        <ol>
                            <li>Verify your identity to ensure the security of your account. We may contact you to confirm the request.</li>
                            <li>Permanently delete all of your personal data from our active databases, including your user profile, uploaded files (if any are stored), and usage history.</li>
                            <li>Confirm with you via email once the deletion process is complete. This process typically takes up to 30 days.</li>
                        </ol>
                        
                        <h3>What Data is Deleted?</h3>
                        <p>The deletion process will remove:</p>
                        <ul>
                            <li>Your user account and profile information (username, email, profile picture, etc.).</li>
                            <li>Any content you have created or saved within your account.</li>
                            <li>Your API key and associated usage data.</li>
                        </ul>
                        <p>Please note that some anonymous, aggregated usage data that is not linked to your personal identity may be retained for analytical purposes.</p>

                        <p>If you have any questions about this process, please do not hesitate to contact us.</p>
                    </div>
                </div>
            </div>
        </div>
    );
};

export default UserDataDeletionPage;
