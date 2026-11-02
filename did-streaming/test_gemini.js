const config = require('./api.json');

const gemini_key = config.openai_key;
const GEMINI_ENDPOINT = `https://generativelanguage.googleapis.com/v1beta/models/gemini-1.5-flash-latest:generateContent?key=${gemini_key}`;

async function main() {
    const fetch = await import('node-fetch').then(module => module.default);

    async function fetchGeminiResponse(prompt) {
        const response = await fetch(GEMINI_ENDPOINT, {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
            },
            body: JSON.stringify({
                contents: [{
                    parts: [{
                        text: prompt
                    }]
                }],
                generationConfig: {
                    temperature: 0.7,
                    maxOutputTokens: 100,
                }
            }),
        });

        if (!response.ok) {
            const errorData = await response.json();
            throw new Error(`Gemini error: ${errorData.error?.message || 'Unknown error'}`);
        }

        const data = await response.json();
        return data.candidates[0].content.parts[0].text.trim();
    }

    const userInput = "Who is the CEO of Tesla?";
    const geminiResponse = await fetchGeminiResponse(userInput);

    console.log("User Input:", userInput);
    console.log("Gemini Response:", geminiResponse);
}

main().catch(error => console.error(error));
