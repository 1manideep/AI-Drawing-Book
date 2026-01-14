const functions = require('firebase-functions');
const admin = require('firebase-admin');
const OpenAI = require('openai');

admin.initializeApp();

// Initialize OpenAI with key from environment configuration
// Run: firebase functions:config:set openai.key="YOUR_KEY"
const openai = new OpenAI({
    apiKey: functions.config().openai.key
});

exports.generateImage = functions.https.onCall(async (data, context) => {
    // Check authentication
    if (!context.auth) {
        throw new functions.https.HttpsError(
            'unauthenticated',
            'The function must be called while authenticated.'
        );
    }

    const promptText = data.prompt;
    if (!promptText) {
        throw new functions.https.HttpsError(
            'invalid-argument',
            'The function must be called with a "prompt" argument.'
        );
    }

    try {
        const fullPrompt = `Minimalist vector line art suitable for a children's coloring page of ${promptText}. Use thick, uniform, continuous contour lines. The entire image should be composed only of closed black line loops on a white canvas. Zero shading, zero gradients, and absolutely no solid filled areas. Focus on the main subject with little to no background.`;

        const response = await openai.images.generate({
            model: "dall-e-3",
            prompt: fullPrompt,
            n: 1,
            size: "1024x1024",
            response_format: "b64_json"
        });

        return {
            b64_json: response.data[0].b64_json
        };

    } catch (error) {
        console.error("OpenAI Error:", error);
        throw new functions.https.HttpsError(
            'internal',
            'Failed to generate image.',
            error.message
        );
    }
});
