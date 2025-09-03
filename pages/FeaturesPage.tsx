import React, { useEffect } from 'react';
import { 
    FileIcon, ProtectIcon,
    GoogleDriveIcon, DropboxIcon, IOSIcon, AndroidIcon, WindowsIcon, MacOSIcon,
    UsersIcon
} from '../components/icons.tsx';

const FeaturesPage: React.FC = () => {
    useEffect(() => {
        document.title = "Features | I Love PDFLY";
        const metaDesc = document.querySelector('meta[name="description"]');
        if (metaDesc) {
            metaDesc.setAttribute("content", "Discover all the features of I Love PDFLY. Learn about our easy-to-use tools, security measures, premium benefits, and multi-platform support.");
        }
    }, []);

    return (
        <div className="bg-gray-50 dark:bg-black text-gray-800 dark:text-gray-200">
            {/* Our Features Section */}
            <section className="py-20 md:py-28">
                <div className="container mx-auto px-6">
                    <div className="grid md:grid-cols-2 gap-12 items-center">
                        <div>
                            <h1 className="text-4xl md:text-5xl font-extrabold">Our features</h1>
                            <p className="mt-6 text-lg text-gray-600 dark:text-gray-400">
                                Not so computer-savvy? No problem. Even if it's your first time using iLovePDFLY, we made it extremely simple. Our interface is user friendly. Our tools know how to do their job. So you shouldn't encounter any setbacks.
                            </p>
                        </div>
                        <div className="flex justify-center">
                             {/* Image from user request */}
                            <img src="https://www.ilovepdf.com/img/features/features.svg" alt="User-friendly interface illustration" className="w-full max-w-lg h-auto" />
                        </div>
                    </div>
                </div>
            </section>

            {/* Wiser Use of Time Section */}
            <section className="py-20 md:py-28 bg-white dark:bg-black">
                <div className="container mx-auto px-6">
                    <div className="grid md:grid-cols-2 gap-12 items-center">
                        <div className="flex justify-center order-2 md:order-1">
                            {/* Image from user request */}
                           <img src="https://www.ilovepdf.com/img/features/files.svg" alt="Time saving illustration" className="w-full max-w-lg h-auto" />
                        </div>
                        <div className="order-1 md:order-2">
                            <h2 className="text-4xl md:text-5xl font-extrabold">Enjoy a wiser use of time</h2>
                            <p className="mt-4 text-lg text-gray-600 dark:text-gray-400">
                                We have created an entire suite of optimal tools which will speed up your document processes.
                            </p>
                            <div className="mt-8 space-y-6">
                                <div>
                                    <h3 className="text-xl font-bold">We help you save your precious time</h3>
                                    <p className="mt-2 text-gray-600 dark:text-gray-400">You can batch edit your files instead of painfully dealing with them one at a time. Your files are processed at high speed, so no need to wait, well.. as long as you have a proper Internet connection.</p>
                                </div>
                                <div>
                                    <h3 className="text-xl font-bold">Freedom to manage your files</h3>
                                    <p className="mt-2 text-gray-600 dark:text-gray-400">Arrange them alphabetically or in inverse alphabetical order. Forgot one? You can add more, remove some of them, or rotate them after uploading. Because dealing with files can be a messy business.</p>
                                </div>
                            </div>
                        </div>
                    </div>
                </div>
            </section>
            
            {/* What Matters to You Section */}
            <section className="py-20 md:py-28">
                 <div className="container mx-auto px-6 text-center">
                    <h2 className="text-4xl md:text-5xl font-extrabold">What matters to you, matters to us</h2>
                    <p className="mt-4 max-w-3xl mx-auto text-lg text-gray-600 dark:text-gray-400">
                        When it comes to dealing with your files, it is our task and duty to provide the best possible service.
                    </p>
                    <div className="mt-12 grid sm:grid-cols-2 gap-8 max-w-4xl mx-auto text-left">
                        <div className="bg-white dark:bg-black p-8 rounded-lg shadow-lg border border-gray-200 dark:border-gray-800">
                            <FileIcon className="h-8 w-8 text-green-500 mb-4" />
                            <h3 className="text-xl font-bold">The importance of a file</h3>
                            <p className="mt-2 text-gray-600 dark:text-gray-400">We strive to bring you the smallest file size possible while maintaining the quality at its best.</p>
                        </div>
                         <div className="bg-white dark:bg-black p-8 rounded-lg shadow-lg border border-gray-200 dark:border-gray-800">
                            <ProtectIcon className="h-8 w-8 text-blue-500 mb-4" />
                            <h3 className="text-xl font-bold">Your security is our concern</h3>
                            <p className="mt-2 text-gray-600 dark:text-gray-400">In order to combat file theft, we automatically eliminate all your archives within two hours.</p>
                        </div>
                    </div>
                </div>
            </section>

            {/* Premium Section */}
             <section className="py-20 md:py-28 bg-white dark:bg-black">
                <div className="container mx-auto px-6">
                    <div className="grid md:grid-cols-2 gap-12 items-center">
                         <div className="flex justify-center">
                           {/* Image from user request */}
                            <img src="https://www.ilovepdf.com/img/features/team.png" alt="Team features illustration" className="w-full max-w-lg h-auto" />
                        </div>
                        <div>
                             <h2 className="text-4xl md:text-5xl font-extrabold">Get even more with Premium</h2>
                            <p className="mt-4 text-lg text-gray-600 dark:text-gray-400">
                                Sometimes you just require a little something extra. Upgrade your iLovePDFLY experience and boost your document productivity.
                            </p>
                            <div className="mt-8 space-y-6">
                                <div>
                                    <h3 className="text-xl font-bold">Create a team</h3>
                                    <p className="mt-2 text-gray-600 dark:text-gray-400">Premium features include managing your own team to share default actions. Adding a watermark with your corporate logo or setting a page number format are just a couple of ideas.</p>
                                </div>
                                <div>
                                    <h3 className="text-xl font-bold">Power up your tools</h3>
                                    <p className="mt-2 text-gray-600 dark:text-gray-400">Take our tools to the next level and get the job done faster by increasing file size barriers and incrementing batch numbers per process. Offering ads-free workspace and unlimited access to all our services.</p>
                                </div>
                            </div>
                        </div>
                    </div>
                </div>
            </section>

            {/* Platform Freedom Section */}
            <section className="py-20 md:py-28">
                <div className="container mx-auto px-6">
                     <div className="grid md:grid-cols-2 gap-12 items-center">
                        <div>
                             <h2 className="text-4xl md:text-5xl font-extrabold">Freedom to choose your platform</h2>
                             <p className="mt-4 text-lg text-gray-600 dark:text-gray-400">
                                Keep up with your work from your favorite device. Our tools are accessible from the web, mobile and desktop.
                            </p>
                            <div className="mt-8 space-y-6">
                                <div>
                                    <h3 className="text-xl font-bold">Work from the cloud</h3>
                                    <p className="mt-2 text-gray-600 dark:text-gray-400">We are integrated with Google Drive and Dropbox. This allows you to take your files from the cloud and, once processed, save them back to your cloud storage accounts.</p>
                                </div>
                                <div>
                                    <h3 className="text-xl font-bold">Edit on the go</h3>
                                    <p className="mt-2 text-gray-600 dark:text-gray-400">Because business doesn't stop while you are on the go, you can edit and convert your PDFs on your smartphone with iLovePDFLY Mobile App. Available for iOS and Android.</p>
                                </div>
                                 <div>
                                    <h3 className="text-xl font-bold">Bring our tools to your Desktop</h3>
                                    <p className="mt-2 text-gray-600 dark:text-gray-400">Compress, merge, split, convert and edit your PDF files offline for maximum privacy with iLovePDFLY Desktop. Process your files directly on your computer and speed up editing performance.</p>
                                </div>
                            </div>
                        </div>
                        <div className="flex justify-center">
                             {/* Image from user request */}
                            <img src="https://www.ilovepdf.com/img/features/mobile.svg" alt="Multi-platform support illustration" className="w-full max-w-lg h-auto" />
                        </div>
                    </div>
                </div>
            </section>
            
            <section className="py-16 bg-white dark:bg-black">
                <div className="container mx-auto px-6 text-center">
                    <p className="text-2xl font-semibold text-gray-700 dark:text-gray-300">
                        Because every PDF problem you might now have can be our next challenge ❤️
                    </p>
                </div>
            </section>

        </div>
    );
};

export default FeaturesPage;
