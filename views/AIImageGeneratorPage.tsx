import React, { useState, useRef, useEffect, useContext } from 'react';
import { Link } from 'react-router-dom';
import { ImageIcon, LeftArrowIcon } from '../components/icons.tsx';
import { LayoutContext } from '../App.tsx';
import { GoogleGenAI } from '@google/genai';

const STYLES = [
  { label: 'Realistic', value: 'realistic photo, ultra detailed, 8k, professional photography' },
  { label: 'Anime', value: 'anime style, vibrant colors, detailed artwork, Studio Ghibli' },
  { label: 'Oil Painting', value: 'oil painting, artistic, textured brushstrokes, masterpiece' },
  { label: 'Watercolor', value: 'watercolor painting, soft colors, artistic, dreamy' },
  { label: 'Pixel Art', value: 'pixel art style, 16-bit, retro game aesthetic, crisp' },
  { label: 'Cinematic', value: 'cinematic, dramatic lighting, film still, movie quality, anamorphic lens' },
  { label: 'Fantasy', value: 'fantasy art, magical, epic, detailed illustration, concept art' },
  { label: '3D Render', value: '3d render, CGI, octane render, volumetric lighting, ultra realistic' },
  { label: 'Logo / Graphic', value: 'clean vector logo, minimalist graphic design, flat icon, solid color background, sharp edges, professional branding' },
];

const SIZES = [
  { label: 'Square 1:1', width: 1024, height: 1024 },
  { label: 'Landscape 16:9', width: 1280, height: 720 },
  { label: 'Portrait 9:16', width: 720, height: 1280 },
  { label: 'Wide 2:1', width: 1280, height: 640 },
];

// Use flux-schnell model for fast generation
const buildImageUrl = (promptText: string, style: typeof STYLES[0], size: typeof SIZES[0], seed: number) => {
  const fullPrompt = `${promptText}, ${style.value}`;
  const encoded = encodeURIComponent(fullPrompt);
  return `https://image.pollinations.ai/prompt/${encoded}?width=${size.width}&height=${size.height}&seed=${seed}&nologo=true&model=flux&enhance=false`;
};

const AIImageGeneratorPage: React.FC = () => {
  const [prompt, setPrompt] = useState('');
  const [selectedStyle, setSelectedStyle] = useState(STYLES[0]);
  const [selectedSize, setSelectedSize] = useState(SIZES[0]);
  const [imageUrl, setImageUrl] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState('');
  const [currentSeed, setCurrentSeed] = useState(0);
  const [enhancePrompt, setEnhancePrompt] = useState(true);
  const [isEnhancing, setIsEnhancing] = useState(false);
  const [enhancedPromptText, setEnhancedPromptText] = useState('');
  const [engine, setEngine] = useState<'imagen' | 'pollinations'>('imagen');
  const imgRef = useRef<HTMLImageElement>(null);

  const { setShowFooter } = useContext(LayoutContext) as { setShowFooter: (show: boolean) => void };

  useEffect(() => {
    document.title = 'AI Image Generator | Free Text to Image - PDFBullet';
    const metaDesc = document.querySelector('meta[name="description"]');
    if (metaDesc) {
      metaDesc.setAttribute('content', 'Generate stunning AI images from text prompts for free. Multiple styles, instant generation.');
    }
    setShowFooter(false);
    return () => setShowFooter(true);
  }, [setShowFooter]);

  const handleGenerate = async () => {
    if (!prompt.trim()) {
      setError('Please enter a prompt.');
      return;
    }
    setError('');
    setIsLoading(true);
    setImageUrl('');
    setEnhancedPromptText('');

    let finalPrompt = prompt;
    const apiKey = process.env.API_KEY;

    if (enhancePrompt && apiKey) {
      setIsEnhancing(true);
      try {
        const ai = new GoogleGenAI({ apiKey });
        const systemInstruction = `You are an expert AI prompt engineer for image generation. Take the user's short prompt and rewrite it into an optimized prompt for the image generation model.
In your expansion, make sure to:
1. If the prompt contains text or words to display (like a brand name or logo), keep the description extremely simple, short, and focused (under 25 words). Specify the exact text inside double quotes (e.g., "Bishal Codes") and instruct the model to write ONLY those exact words with perfect spelling on a simple background. Do NOT write long descriptions when text is involved, as too much detail ruins the spelling.
2. For image prompts without text, describe the key subjects in detail.
3. If the user refers to specific cultural, geographical, or national symbols (like a flag, landmark, or emblem), describe its correct colors, shapes, patterns, and geometric features explicitly (for example, if they say "Nepal flag", explicitly describe it as "the unique non-rectangular double-triangle/double-pennant shape in crimson red with a thick dark blue border, featuring a white crescent moon on the top triangle and a white 12-pointed sun on the bottom triangle").
4. Ensure the output style looks professional, clean, and hand-crafted by a human designer or professional photographer. Avoid typical "AI-art" tells like over-saturated plasticky surfaces, hyper-complex cluttered backgrounds, or excessive generic neon glow, unless explicitly requested.
5. Specify realistic textures, natural lighting, and balanced composition. For design assets like logos, emphasize clean solid colors, minimalist vector styling, matte textures, and flat design principles.
6. Keep the output relatively concise but descriptive (under 60 words).
7. Output ONLY the expanded prompt text. Do not include any introductory or concluding text, explanations, quotes, or markdown formatting.`;

        const response = await ai.models.generateContent({
          model: 'gemini-flash-latest',
          contents: `User prompt to expand: "${prompt}"`,
          config: {
            systemInstruction,
            temperature: 0.7,
          }
        });

        if (response.text) {
          finalPrompt = response.text.trim();
          setEnhancedPromptText(finalPrompt);
        }
      } catch (e) {
        console.error("Failed to enhance prompt with Gemini:", e);
      } finally {
        setIsEnhancing(false);
      }
    }

    const newSeed = Math.floor(Math.random() * 999999);
    setCurrentSeed(newSeed);

    // Auto-detect logo/icon keywords to bypass photograph styles
    let activeStyle = selectedStyle;
    const lowerPrompt = prompt.toLowerCase();
    if (lowerPrompt.includes('logo') || lowerPrompt.includes('icon') || lowerPrompt.includes('brand') || lowerPrompt.includes('text')) {
      const logoStyle = STYLES.find(s => s.label === 'Logo / Graphic');
      if (logoStyle) {
        activeStyle = logoStyle;
      }
    }

    if (engine === 'imagen' && apiKey) {
      try {
        const ai = new GoogleGenAI({ apiKey });
        let aspectVal: '1:1' | '16:9' | '9:16' | '4:3' = '1:1';
        if (selectedSize.label.includes('16:9')) aspectVal = '16:9';
        else if (selectedSize.label.includes('9:16')) aspectVal = '9:16';
        else if (selectedSize.label.includes('Wide')) aspectVal = '4:3';

        const imagenResponse = await ai.models.generateImages({
          model: 'imagen-3.0-generate-002',
          prompt: `${finalPrompt}, ${activeStyle.value}`,
          config: {
            numberOfImages: 1,
            outputMimeType: 'image/jpeg',
            aspectRatio: aspectVal,
          }
        });

        const imgObj = imagenResponse.generatedImages?.[0];
        if (imgObj?.image?.imageBytes) {
          const base64Data = `data:image/jpeg;base64,${imgObj.image.imageBytes}`;
          setImageUrl(base64Data);
          setIsLoading(false);
          return;
        }
      } catch (e: any) {
        console.error("Imagen 3 generation failed, falling back to Pollinations:", e);
        if (e.message?.includes('SAFETY')) {
          setError('Google safety filter blocked this prompt. Falling back to public generator.');
        }
      }
    }

    // Fallback to Pollinations AI
    setImageUrl(buildImageUrl(finalPrompt, activeStyle, selectedSize, newSeed));
  };

  const handleRegenerate = async () => {
    if (!prompt.trim()) return;
    setIsLoading(true);
    setImageUrl('');
    const newSeed = Math.floor(Math.random() * 999999);
    setCurrentSeed(newSeed);

    const apiKey = process.env.API_KEY;
    const finalPrompt = enhancedPromptText || prompt;

    // Auto-detect logo/icon keywords to bypass photograph styles
    let activeStyle = selectedStyle;
    const lowerPrompt = prompt.toLowerCase();
    if (lowerPrompt.includes('logo') || lowerPrompt.includes('icon') || lowerPrompt.includes('brand') || lowerPrompt.includes('text')) {
      const logoStyle = STYLES.find(s => s.label === 'Logo / Graphic');
      if (logoStyle) {
        activeStyle = logoStyle;
      }
    }

    if (engine === 'imagen' && apiKey) {
      try {
        const ai = new GoogleGenAI({ apiKey });
        let aspectVal: '1:1' | '16:9' | '9:16' | '4:3' = '1:1';
        if (selectedSize.label.includes('16:9')) aspectVal = '16:9';
        else if (selectedSize.label.includes('9:16')) aspectVal = '9:16';
        else if (selectedSize.label.includes('Wide')) aspectVal = '4:3';

        const imagenResponse = await ai.models.generateImages({
          model: 'imagen-3.0-generate-002',
          prompt: `${finalPrompt}, ${activeStyle.value}`,
          config: {
            numberOfImages: 1,
            outputMimeType: 'image/jpeg',
            aspectRatio: aspectVal,
          }
        });

        const imgObj = imagenResponse.generatedImages?.[0];
        if (imgObj?.image?.imageBytes) {
          const base64Data = `data:image/jpeg;base64,${imgObj.image.imageBytes}`;
          setImageUrl(base64Data);
          setIsLoading(false);
          return;
        }
      } catch (e) {
        console.error("Imagen 3 regeneration failed, falling back to Pollinations:", e);
      }
    }

    // Fallback to Pollinations AI
    setImageUrl(buildImageUrl(finalPrompt, activeStyle, selectedSize, newSeed));
  };

  const handleDownload = async () => {
    if (!imageUrl) return;
    if (imageUrl.startsWith('data:')) {
      const a = document.createElement('a');
      a.href = imageUrl;
      a.download = `ai-image-${currentSeed}.jpg`;
      document.body.appendChild(a);
      a.click();
      document.body.removeChild(a);
      return;
    }
    try {
      const response = await fetch(imageUrl);
      const blob = await response.blob();
      const blobUrl = URL.createObjectURL(blob);
      const a = document.createElement('a');
      a.href = blobUrl;
      a.download = `ai-image-${currentSeed}.jpg`;
      document.body.appendChild(a);
      a.click();
      document.body.removeChild(a);
      setTimeout(() => URL.revokeObjectURL(blobUrl), 1000);
    } catch {
      // Fallback: open in same tab with download hint
      const a = document.createElement('a');
      a.href = imageUrl;
      a.download = `ai-image-${currentSeed}.jpg`;
      document.body.appendChild(a);
      a.click();
      document.body.removeChild(a);
    }
  };

  return (
    <div className="flex flex-col min-h-[calc(100vh-64px)] bg-gray-50 dark:bg-zinc-950">

      {/* Top bar */}
      <div className="w-full px-6 pt-5 pb-2 flex items-center justify-between">
        <Link
          to="/"
          className="inline-flex items-center gap-2 text-gray-500 dark:text-gray-400 hover:text-pink-500 dark:hover:text-pink-400 transition-colors text-sm font-medium"
        >
          <LeftArrowIcon className="h-4 w-4" />
          Back to All Tools
        </Link>
        <div className="text-center">
          <h1 className="text-2xl font-extrabold text-pink-500">AI Image Generator</h1>
          <p className="text-xs text-gray-500 dark:text-gray-400 mt-0.5">Turn text into stunning images instantly</p>
        </div>
        <div className="w-28" /> {/* spacer */}
      </div>

      {/* Main layout */}
      <div className="flex flex-1 w-full gap-0">

        {/* Left panel — controls */}
        <div className="w-full max-w-xs xl:max-w-sm flex-shrink-0 bg-white dark:bg-zinc-900 border-r border-gray-200 dark:border-zinc-800 p-5 flex flex-col gap-4 overflow-y-auto">

          {/* Prompt */}
          <div>
            <label htmlFor="img-prompt" className="block text-xs font-bold text-gray-600 dark:text-gray-300 uppercase tracking-wide mb-1.5">
              ✏️ Prompt
            </label>
            <textarea
              id="img-prompt"
              rows={5}
              value={prompt}
              onChange={e => setPrompt(e.target.value)}
              onKeyDown={e => { if (e.key === 'Enter' && e.ctrlKey) handleGenerate(); }}
              className="w-full px-3 py-2.5 bg-gray-50 dark:bg-zinc-800 border border-gray-200 dark:border-zinc-700 rounded-lg focus:ring-2 focus:ring-pink-500 focus:border-pink-500 text-gray-800 dark:text-gray-100 text-sm resize-none transition placeholder-gray-400 dark:placeholder-gray-500"
              placeholder="A majestic dragon flying over a castle at sunset..."
            />
            <p className="text-xs text-gray-400 mt-1">Ctrl+Enter to generate</p>
          </div>

          {/* Auto-Enhance Toggle */}
          <div className="flex items-center justify-between bg-pink-50 dark:bg-pink-950/20 p-2.5 rounded-lg border border-pink-100 dark:border-pink-900/30">
            <div className="flex flex-col pr-2">
              <span className="text-xs font-bold text-pink-700 dark:text-pink-400 flex items-center gap-1">
                ✨ Auto-Enhance with Gemini
              </span>
              <span className="text-[10px] text-gray-500 dark:text-gray-400">
                Corrects flag details, anatomy & style automatically
              </span>
            </div>
            <label className="relative inline-flex items-center cursor-pointer flex-shrink-0">
              <input
                type="checkbox"
                checked={enhancePrompt}
                onChange={e => setEnhancePrompt(e.target.checked)}
                className="sr-only peer"
              />
              <div className="w-9 h-5 bg-gray-200 dark:bg-zinc-700 peer-focus:outline-none rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-4 after:w-4 after:transition-all peer-checked:bg-pink-500"></div>
            </label>
          </div>

          {/* Generation Engine */}
          <div>
            <label className="block text-xs font-bold text-gray-600 dark:text-gray-300 uppercase tracking-wide mb-1.5">
              🤖 Generation Engine
            </label>
            <div className="flex flex-col gap-1.5">
              <button
                onClick={() => setEngine('imagen')}
                className={`px-3 py-2 rounded-lg text-xs font-semibold border transition-all text-left flex items-center justify-between ${
                  engine === 'imagen'
                    ? 'bg-pink-500 text-white border-pink-500 shadow'
                    : 'bg-gray-50 dark:bg-zinc-800 text-gray-700 dark:text-gray-300 border-gray-200 dark:border-zinc-700 hover:border-pink-400 hover:text-pink-500'
                }`}
              >
                <span>✨ Google Imagen 3 (High Quality)</span>
                <span className="text-[10px] opacity-80">(Recommended)</span>
              </button>
              <button
                onClick={() => setEngine('pollinations')}
                className={`px-3 py-2 rounded-lg text-xs font-semibold border transition-all text-left flex items-center justify-between ${
                  engine === 'pollinations'
                    ? 'bg-pink-500 text-white border-pink-500 shadow'
                    : 'bg-gray-50 dark:bg-zinc-800 text-gray-700 dark:text-gray-300 border-gray-200 dark:border-zinc-700 hover:border-pink-400 hover:text-pink-500'
                }`}
              >
                <span>⚡ Pollinations / Flux (Fast, Free)</span>
                <span className="text-[10px] opacity-80">Unlimited</span>
              </button>
            </div>
          </div>

          {/* Style */}
          <div>
            <label className="block text-xs font-bold text-gray-600 dark:text-gray-300 uppercase tracking-wide mb-1.5">🎨 Style</label>
            <div className="grid grid-cols-2 gap-1.5">
              {STYLES.map(style => (
                <button
                  key={style.label}
                  onClick={() => setSelectedStyle(style)}
                  className={`px-2 py-1.5 rounded-lg text-xs font-semibold border transition-all ${
                    selectedStyle.label === style.label
                      ? 'bg-pink-500 text-white border-pink-500 shadow'
                      : 'bg-gray-50 dark:bg-zinc-800 text-gray-700 dark:text-gray-300 border-gray-200 dark:border-zinc-700 hover:border-pink-400 hover:text-pink-500'
                  }`}
                >
                  {style.label}
                </button>
              ))}
            </div>
          </div>

          {/* Size */}
          <div>
            <label className="block text-xs font-bold text-gray-600 dark:text-gray-300 uppercase tracking-wide mb-1.5">📐 Size</label>
            <div className="grid grid-cols-2 gap-1.5">
              {SIZES.map(size => (
                <button
                  key={size.label}
                  onClick={() => setSelectedSize(size)}
                  className={`px-2 py-1.5 rounded-lg text-xs font-semibold border transition-all ${
                    selectedSize.label === size.label
                      ? 'bg-pink-500 text-white border-pink-500 shadow'
                      : 'bg-gray-50 dark:bg-zinc-800 text-gray-700 dark:text-gray-300 border-gray-200 dark:border-zinc-700 hover:border-pink-400 hover:text-pink-500'
                  }`}
                >
                  {size.label}
                </button>
              ))}
            </div>
          </div>

          {/* Generate button */}
          <button
            id="generate-image-btn"
            onClick={handleGenerate}
            disabled={isLoading}
            className="w-full bg-gradient-to-r from-pink-500 to-purple-600 hover:from-pink-600 hover:to-purple-700 text-white font-bold py-3 rounded-xl text-sm transition-all flex items-center justify-center gap-2 disabled:opacity-60 shadow-lg hover:shadow-pink-500/30 mt-auto"
          >
            {isLoading ? (
              <>
                <svg className="animate-spin h-4 w-4 text-white" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                  <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
                  <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z" />
                </svg>
                Generating...
              </>
            ) : (
              <><ImageIcon className="h-4 w-4" /> Generate Image</>
            )}
          </button>

          {error && <p className="text-xs text-red-500 bg-red-50 dark:bg-red-900/20 p-2 rounded-lg text-center">{error}</p>}
        </div>

        {/* Right panel — full image canvas */}
        <div className="flex-1 flex flex-col bg-zinc-100 dark:bg-zinc-950 relative">

          {/* Action bar */}
          {imageUrl && !isLoading && (
            <div className="absolute top-16 right-4 z-10 flex gap-2">
              <button
                id="regenerate-image-btn"
                onClick={handleRegenerate}
                className="flex items-center gap-1.5 text-xs font-semibold px-3 py-1.5 rounded-lg bg-white/90 dark:bg-zinc-800/90 backdrop-blur border border-gray-200 dark:border-zinc-700 text-gray-700 dark:text-gray-200 hover:border-pink-400 hover:text-pink-500 transition shadow"
              >
                🔄 Regenerate
              </button>
              <button
                id="download-image-btn"
                onClick={handleDownload}
                className="flex items-center gap-1.5 text-xs font-semibold px-3 py-1.5 rounded-lg bg-pink-500 hover:bg-pink-600 text-white transition shadow"
              >
                ⬇️ Download
              </button>
            </div>
          )}

          {/* Image area */}
          <div className="flex-1 flex items-center justify-center p-6">
            {!imageUrl && !isLoading && (
              <div className="text-center text-gray-400 dark:text-gray-600 select-none">
                <div className="text-7xl mb-4">🖼️</div>
                <p className="text-lg font-semibold">Your image will appear here</p>
                <p className="text-sm mt-1">Enter a prompt and click Generate Image</p>
              </div>
            )}
            {isLoading && (
              <div className="text-center text-gray-500 dark:text-gray-400 select-none">
                <div className="text-7xl mb-4 animate-pulse">✨</div>
                <p className="text-lg font-semibold">
                  {isEnhancing ? 'Gemini is enhancing your prompt...' : 'Creating your image...'}
                </p>
                <p className="text-sm mt-1">
                  {isEnhancing ? 'Rewriting prompt for correct details and style...' : 'Usually takes 3–8 seconds'}
                </p>
              </div>
            )}
            {imageUrl && (
              <img
                ref={imgRef}
                src={imageUrl}
                alt="AI Generated"
                className="max-w-full max-h-[70vh] object-contain rounded-2xl shadow-2xl animate-fade-in select-none pointer-events-none"
                style={{ display: isLoading ? 'none' : 'block' }}
                onLoad={() => setIsLoading(false)}
                onError={() => {
                  setIsLoading(false);
                  setError('Failed to generate image. Please try a different prompt.');
                  setImageUrl('');
                }}
                onContextMenu={e => e.preventDefault()}
                draggable={false}
              />
            )}
          </div>

          {/* Bottom info */}
          {imageUrl && !isLoading && (
            <div className="w-full max-w-2xl mx-auto px-6 text-center pb-4">
              {enhancedPromptText && (
                <div className="mb-3 p-3 bg-white/70 dark:bg-zinc-900/70 backdrop-blur rounded-xl border border-gray-200/50 dark:border-zinc-800/50 text-left shadow-sm">
                  <span className="text-[10px] font-bold text-pink-500 uppercase tracking-wider block mb-1">✨ Gemini Enhanced Prompt</span>
                  <p className="text-xs text-gray-600 dark:text-gray-300 italic">"{enhancedPromptText}"</p>
                </div>
              )}
              <p className="text-xs text-gray-400 dark:text-gray-600">
                {selectedSize.width}×{selectedSize.height}px · {selectedStyle.label} · Seed: {currentSeed}
              </p>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default AIImageGeneratorPage;
