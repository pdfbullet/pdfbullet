
import { GoogleGenAI } from '@google/genai';

async function test() {
    const ai = new GoogleGenAI({ apiKey: process.env.GEMINI_API_KEY });
    try {
        const response = await ai.models.generateContent({
            model: 'gemini-2.0-flash',
            contents: [{ role: 'user', parts: [{ text: 'Hello' }] }]
        });
        console.log('Response:', response.text);
    } catch (e) {
        console.log('Gemini 1.5 Flash Error:', e.message || e);
    }
}
test();
