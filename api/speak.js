export default async function handler(req, res) {
    // Enable CORS
    res.setHeader('Access-Control-Allow-Origin', '*');
    res.setHeader('Access-Control-Allow-Methods', 'POST, OPTIONS');
    res.setHeader('Access-Control-Allow-Headers', 'Content-Type');
    
    // Handle OPTIONS request
    if (req.method === 'OPTIONS') {
        return res.status(200).end();
    }
    
    // Only allow POST requests
    if (req.method !== 'POST') {
        return res.status(405).json({ error: 'Method not allowed' });
    }

    try {
        const { text } = req.body;

        if (!text) {
            console.error('No text provided');
            return res.status(400).json({ error: 'Text is required' });
        }

        const ELEVENLABS_API_KEY = process.env.ELEVEN_LABS_API_KEY;
        const VOICE_ID = process.env.ELEVEN_LABS_VOICE_ID || 'hkfHEbBvdQFNX4uWHqRF';

        if (!ELEVENLABS_API_KEY) {
            console.error('ElevenLabs API key not configured');
            return res.status(500).json({ error: 'ElevenLabs API key not configured' });
        }

        console.log('Calling ElevenLabs API with voice:', VOICE_ID);

        // Call ElevenLabs API
        const response = await fetch(
            `https://api.elevenlabs.io/v1/text-to-speech/${VOICE_ID}`,
            {
                method: 'POST',
                headers: {
                    'Accept': 'audio/mpeg',
                    'Content-Type': 'application/json',
                    'xi-api-key': ELEVENLABS_API_KEY
                },
                body: JSON.stringify({
                    text: text,
                    model_id: 'eleven_multilingual_v2'
                })
            }
        );

        if (!response.ok) {
            const error = await response.text();
            console.error('ElevenLabs API error:', response.status, error);
            return res.status(response.status).json({ 
                error: 'ElevenLabs API error',
                details: error,
                status: response.status
            });
        }

        // Get the audio buffer
        const audioBuffer = await response.arrayBuffer();
        
        console.log('Audio generated, size:', audioBuffer.byteLength);
        
        // Return audio directly as buffer, not base64
        res.setHeader('Content-Type', 'audio/mpeg');
        res.status(200).send(Buffer.from(audioBuffer));

    } catch (error) {
        console.error('Speak.js error:', error);
        return res.status(500).json({ 
            error: 'Failed to generate speech',
            message: error.message,
            stack: error.stack
        });
    }
}
