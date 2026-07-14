
import { GoogleGenAI } from '@google/genai';

async function test() {
    const ai = new GoogleGenAI({ apiKey: 'AIzaSyAeHWxmgtAdpUiPkWFhGES9jJt7bfR8bBQ' });
    try {
        const response = await ai.models.generateContent({
            model: 'gemini-pro-latest',
            contents: [{ role: 'user', parts: [{ text: 'Hello' }] }]
        });
        console.log('Gemini Pro Latest Response:', response.text);
    } catch (e) {
        console.log('Gemini Pro Latest Error:', e.message || e);
    }
}
test();
