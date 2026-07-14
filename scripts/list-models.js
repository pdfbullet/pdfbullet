
import { GoogleGenAI } from '@google/genai';
import dotenv from 'dotenv';
dotenv.config({ path: '.env.local' });

async function listModels() {
    const apiKey = process.env.API_KEY || process.env.GEMINI_API_KEY || process.env.VITE_API_KEY || process.env.VITE_GEMINI_API_KEY;
    if (!apiKey) {
        console.error("No API key found in .env.local");
        return;
    }
    const ai = new GoogleGenAI({ apiKey });
    try {
        const models = await ai.models.list();
        console.log("Available Models:");
        models.forEach(m => console.log(`- ${m.name} (${m.displayName})`));
    } catch (e) {
        console.error("Error listing models:", e);
    }
}

listModels();
