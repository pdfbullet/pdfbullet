import React, { useEffect } from 'react';
import { Link } from 'react-router-dom';
import { ChartBarIcon, LockIcon, BrainIcon, CheckIcon } from '../components/icons.tsx';

const EducationPage: React.FC = () => {
    const benefitCards = [
        {
            Icon: ChartBarIcon,
            title: 'Increase productivity',
            description: 'As efficiency is crucial on the road to success, PDFBullet brings powerful tools for teachers and students alike.',
            color: 'text-blue-500'
        },
        {
            Icon: LockIcon,
            title: 'Keep your projects safe',
            description: 'Your data matters to us. PDFBullet is built with security, compliance and privacy in mind.',
            color: 'text-gray-500'
        },
        {
            Icon: BrainIcon,
            title: 'Make your student life easy',
            description: 'Keep your schoolwork in order like never before. Stay on top of your assignments in a seamless way.',
            color: 'text-orange-500'
        }
    ];

    const features = [
        { title: 'Access everywhere', description: 'Edit and organize your documents on every device you own, on your smartphone, and on the web.' },
        { title: 'Stay organized', description: 'Get rid of clutter in your smartphone. Organize your documents in the Library Manager.' },
        { title: 'Turn data into information', description: 'Extract information from scanned documents with OCR (Optical Character Recognition).' },
        { title: 'Mark what matters', description: 'Mark up PDFs with arrows, shapes, and comments to highlight key details with our Mobile App.' },
        { title: 'Jump hurdles', description: 'Break down barriers to file management. Modify and optimize documents from one place.' },
        { title: 'Achieve more', description: 'Integration with Google Drive and Dropbox means that you can work directly from the Cloud.' }
    ];

    return (
        <div className="bg-white dark:bg-black overflow-x-hidden">
            {/* Hero Section */}
            <section className="bg-gray-50 dark:bg-black py-20 md:py-24">
                <div className="px-6">
                    <div className="grid md:grid-cols-2 gap-12 items-center">
                        <div>
                            <p className="text-brand-red font-semibold">PDFBullet Education</p>
                            <h1 className="text-4xl md:text-5xl lg:text-6xl font-extrabold text-gray-800 dark:text-gray-100 mt-2">
                                Boosting productivity in education
                            </h1>
                            <p className="mt-6 text-lg text-gray-600 dark:text-gray-300">
                                PDFBullet Education version boosts academic productivity by addressing the unique needs of students, teachers and education professionals, driving document efficiency across the entire institution. Register now and enjoy a full year on us.
                            </p>
                            <div className="mt-8">
                                <Link to="/signup" className="inline-block bg-brand-red hover:bg-brand-red-dark text-white font-bold py-3 px-8 rounded-lg text-lg transition-colors">
                                    Sign Up Now
                                </Link>
                            </div>
                        </div>
                        <div className="relative">
                            <img src="https://www.ilovepdf.com/img/education/productivity.png" alt="Students collaborating" className="rounded-lg shadow-xl" width="570" height="427" loading="lazy" decoding="async"/>
                             {/* Decorative elements */}
                             <div className="absolute -top-4 -left-4 w-16 h-16 bg-yellow-300 rounded-lg -z-10 animate-float-1"></div>
                             <div className="absolute -bottom-4 -right-4 w-20 h-20 bg-blue-300 rounded-full -z-10 animate-float-2"></div>
                             <div className="absolute top-1/2 -right-8 w-10 h-10 bg-green-300 rounded-full -z-10 animate-float-3"></div>
                        </div>
                    </div>
                </div>
            </section>

            {/* Simplification Section */}
            <section className="py-20 md:py-24">
                <div className="px-6 text-center">
                    <div className="max-w-4xl mx-auto">
                        <h2 className="text-3xl md:text-4xl font-extrabold text-gray-800 dark:text-gray-100">
                            Simplifying document workflow for students & faculty
                        </h2>
                        <p className="mt-4 text-lg text-gray-600 dark:text-gray-300">
                            PDFBullet breaks down barriers to file management, making it effortless to modify and optimize documents
                        </p>
                    </div>
                    <div className="mt-16 grid sm:grid-cols-2 lg:grid-cols-3 gap-8 text-left">
                        {benefitCards.map((card, index) => (
                            <div key={index} className="bg-gray-50 dark:bg-black border border-gray-200 dark:border-gray-800 p-8 rounded-xl shadow-lg border-glow-hover">
                                <div className={`inline-block p-3 rounded-lg bg-white dark:bg-black`}>
                                    <card.Icon className={`h-8 w-8 ${card.color}`} />
                                </div>
                                <h3 className="mt-4 text-xl font-bold text-gray-800 dark:text-gray-100">{card.title}</h3>
                                <p className="mt-2 text-gray-600 dark:text-gray-400">{card.description}</p>
                            </div>
                        ))}
                    </div>
                </div>
            </section>
            
            {/* Image Banner */}
            <section className="px-6">
                <div className="w-full h-64 md:h-80 bg-cover bg-center rounded-lg shadow-lg overflow-hidden" style={{ backgroundImage: `url('https://www.ilovepdf.com/img/education/school.jpg')` }}>
                    <div className="w-full h-full bg-black/30"></div>
                </div>
            </section>

            {/* Powerful Features Section */}
            <section className="py-20 md:py-24">
                <div className="px-6">
                     <div className="max-w-4xl mx-auto text-center">
                        <h2 className="text-3xl md:text-4xl font-extrabold text-gray-800 dark:text-gray-100">
                            Powerful features to help you stay on top of your work
                        </h2>
                        <p className="mt-4 text-lg text-gray-600 dark:text-gray-400">
                            Our tools enhance learning & speed up educational chores
                        </p>
                    </div>
                    <div className="mt-16 max-w-5xl mx-auto grid md:grid-cols-2 gap-x-12 gap-y-8">
                        {features.map((feature, index) => (
                            <div key={index} className="flex gap-4 items-start">
                                <CheckIcon className="h-6 w-6 text-green-500 mt-1 flex-shrink-0" />
                                <div>
                                    <h3 className="font-bold text-lg text-gray-800 dark:text-gray-100">{feature.title}</h3>
                                    <p className="text-gray-600 dark:text-gray-400">{feature.description}</p>
                                </div>
                            </div>
                        ))}
                    </div>
                </div>
            </section>

            {/* CTA Section */}
            <section className="bg-gray-50 dark:bg-black py-20 md:py-24">
                <div className="px-6">
                    <div className="max-w-4xl mx-auto grid md:grid-cols-2 gap-12 text-center md:text-left">
                        <div>
                            <h3 className="text-2xl font-bold text-gray-800 dark:text-gray-100">For Students & Teachers</h3>
                            <p className="mt-2 text-gray-600 dark:text-gray-300">Upgrade your academic performance. Join our Student Program and enjoy a year of Premium features for free.</p>
                            <div className="mt-6">
                                <Link to="/signup" className="inline-block bg-brand-red hover:bg-brand-red-dark text-white font-bold py-3 px-6 rounded-md transition-colors">
                                    Sign Up Now
                                </Link>
                            </div>
                        </div>
                        <div>
                            <h3 className="text-2xl font-bold text-gray-800 dark:text-gray-100">For Institutions</h3>
                            <p className="mt-2 text-gray-600 dark:text-gray-300">Get a Full Education License and bring PDFBullet to your school.</p>
                            <div className="mt-6">
                                <Link to="/contact" className="inline-block bg-white dark:bg-gray-800 border-2 border-brand-red text-brand-red font-bold py-3 px-6 rounded-md hover:bg-red-50 dark:hover:bg-red-900/20 transition-colors">
                                    Contact Us
                                </Link>
                            </div>
                        </div>
                    </div>
                </div>
            </section>

             {/* Final CTA Section */}
            <section className="py-20">
                <div className="px-6 text-center">
                    <div className="text-brand-red text-4xl mb-4">♥</div>
                     <p className="text-xl md:text-2xl font-semibold text-gray-700 dark:text-gray-300 max-w-2xl mx-auto">
                        Because every PDF problem you might now have can be our next challenge
                     </p>
                </div>
            </section>
        </div>
    );
};

// FIX: Added a default export to the EducationPage component. This is necessary for React.lazy to work correctly in App.tsx.
export default EducationPage;
