import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { GoogleGenAI } from '@google/genai';
import { TOOLS } from '../constants.ts';
import { ImageIcon } from '../components/icons.tsx';

const ImageGeneratorPage: React.FC = () => {
    const tool = TOOLS.find(t => t.id === 'ai-image-generator');
    
    const [prompt, setPrompt] = useState<string>('');
    const [images, setImages] = useState<string[]>([]); // Will store data URLs
    const [isLoading, setIsLoading] = useState(false);
    const [error, setError] = useState('');

    useEffect(() => {
      document.title = "AI Image Generator | Create Images from Text - PDFBullet";
      const metaDesc = document.querySelector('meta[name="description"]');
      if (metaDesc) {
          metaDesc.setAttribute("content", "Turn your text descriptions into stunning, unique images with the power of AI. Describe what you want to see and our AI image generator will create it for you.");
      }
    }, []);

    const handleGenerate = async () => {
        if (!prompt) {
            setError('Please enter a prompt to generate an image.');
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
        setImages([]);

        try {
            const ai = new GoogleGenAI({ apiKey });
            const response = await ai.models.generateImages({
                model: 'imagen-4.0-generate-001',
                prompt: prompt,
                config: {
                  numberOfImages: 1,
                  outputMimeType: 'image/jpeg',
                  aspectRatio: '1:1',
                },
            });
            
            if (response.generatedImages && response.generatedImages.length > 0) {
                const base64ImageBytes = response.generatedImages[0].image.imageBytes;
                const imageUrl = `data:image/jpeg;base64,${base64ImageBytes}`;
                setImages([imageUrl]);
            } else {
                 throw new Error("The AI did not return any images. This could be due to a safety policy violation or an issue with the prompt. Please try a different, more specific prompt.");
            }

        } catch (e: any) {
            console.error("AI Generation Error:", e);
            
            let userFriendlyError = 'An error occurred while generating the image. Please try again with a different prompt.';
            const errorMessage = (e.message || '').toLowerCase();

            if (errorMessage.includes('did not return any images')) {
                userFriendlyError = e.message; // Use the more specific custom error
            } else if (errorMessage.includes('api key')) {
                userFriendlyError = 'The image generation service is currently unavailable. Please check your API key and try again later.';
            } else if (errorMessage.includes('safety')) {
                userFriendlyError = 'Your prompt may have violated our safety policy. Please modify your prompt and try again.';
            } else if (errorMessage.includes('fetch')) {
                 userFriendlyError = 'A network error occurred. Please check your connection and try again.';
            }
            
            setError(userFriendlyError);
        } finally {
            setIsLoading(false);
        }
    };

    const handleDownload = (imageUrl: string, index: number) => {
        const link = document.createElement('a');
        link.href = imageUrl;
        
        const shortPrompt = prompt.substring(0, 30).replace(/\s/g, '_');
        link.download = `pdfbullet_img_${shortPrompt}_${index + 1}.jpeg`;
        
        document.body.appendChild(link);
        link.click();
        document.body.removeChild(link);
    };

    if (!tool) {
        return <div>Tool not found.</div>;
    }

    return (
        <div className="min-h-[calc(100vh-200px)] flex flex-col items-center py-12 px-4 sm:px-6 bg-gray-50 dark:bg-black">
            <div className="text-center mb-10">
                <h1 className={`text-4xl font-extrabold ${tool.textColor}`}>{tool.title}</h1>
                <p className="mt-2 text-lg text-gray-600 dark:text-gray-300 max-w-2xl">{tool.description}</p>
                 <p className="mt-2 text-sm text-gray-500">Powered by Google's Imagen 3 Model</p>
            </div>
            
            <div className="w-full max-w-4xl space-y-6">
                <div className="bg-white dark:bg-black border border-gray-200 dark:border-gray-800 rounded-lg p-6 shadow-lg">
                    {/* Prompt Input */}
                    <div>
                        <label htmlFor="prompt" className="block text-sm font-bold text-gray-700 dark:text-gray-300 mb-2">Your Prompt</label>
                        <textarea
                            id="prompt"
                            rows={3}
                            value={prompt}
                            onChange={e => setPrompt(e.target.value)}
                            className="w-full px-4 py-2 bg-white dark:bg-black border border-gray-300 dark:border-gray-600 rounded-md focus:ring-brand-red focus:border-brand-red text-gray-800 dark:text-gray-200"
                            placeholder="e.g., A cinematic shot of a robot holding a red skateboard on Mars"
                        />
                    </div>

                    {/* Generate Button */}
                    <div className="mt-6">
                        <button
                            onClick={handleGenerate}
                            disabled={isLoading}
                            className={`w-full ${tool.color} ${tool.hoverColor} text-white font-bold py-3 px-8 rounded-lg text-lg transition-colors flex items-center justify-center disabled:bg-violet-300 dark:disabled:bg-violet-800`}
                        >
                            {isLoading ? (
                                <>
                                    <svg className="animate-spin -ml-1 mr-3 h-5 w-5 text-white" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24"><circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle><path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path></svg>
                                    Generating...
                                </>
                            ) : (
                                <><ImageIcon className="h-6 w-6 mr-2" /> Generate Image</>
                            )}
                        </button>
                    </div>
                </div>

                {error && <p className="text-center text-sm text-red-500 bg-red-100 dark:bg-red-900/30 p-3 rounded-md">{error}</p>}

                {/* Image Display */}
                {isLoading && (
                    <div className="text-center py-12">
                        <div className="flex items-center justify-center gap-3 text-xl font-bold text-gray-800 dark:text-gray-200">
                            <svg className="animate-spin h-8 w-8 text-brand-red" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                                <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                                <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                            </svg>
                            <span>Generating Image...</span>
                        </div>
                        <p className="mt-2 text-sm text-gray-500">This can take a moment, please be patient.</p>
                    </div>
                )}
                {images.length > 0 && (
                    <div className="grid grid-cols-1 gap-6">
                        {images.map((imgUrl, index) => (
                            <div key={index} className="bg-white dark:bg-black border border-gray-200 dark:border-gray-800 rounded-lg p-4 shadow-lg group relative">
                                <img
                                    src={imgUrl}
                                    alt={`Generated image ${index + 1} for prompt: ${prompt}`}
                                    className="rounded-md w-full h-auto"
                                />
                                <div className="absolute inset-0 bg-black/50 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center">
                                    <button onClick={() => handleDownload(imgUrl, index)} className="bg-white/80 text-black font-bold py-2 px-4 rounded-md hover:bg-white">
                                        Download
                                    </button>
                                </div>
                            </div>
                        ))}
                    </div>
                )}
            </div>

            <div className="mt-12 text-center">
                <Link to="/" className="text-gray-600 dark:text-gray-400 hover:text-brand-red dark:hover:text-brand-red font-medium transition-colors">
                    &larr; Back to all tools
                </Link>
            </div>
        </div>
    );
};

export default ImageGeneratorPage;