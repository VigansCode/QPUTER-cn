export default async function handler(req, res) {
  if (req.method !== 'POST') {
    return res.status(405).json({ error: 'Method not allowed' });
  }
  const { text } = req.body;
  if (!text || text.trim().length === 0) {
    return res.status(400).json({ error: 'Text is required' });
  }
  try {
    const voiceId = process.env.ELEVEN_LABS_VOICE_ID || '4VZIsMPtgggwNg7OXbPY';

    if (!process.env.ELEVEN_LABS_API_KEY) {
      throw new Error('ELEVEN_LABS_API_KEY not set');
    }

    const response = await fetch(
      https://api.elevenlabs.io/v1/text-to-speech/${voiceId},
      {
        method: 'POST',
        headers: {
          'Accept': 'audio/mpeg',
          'Content-Type': 'application/json',
          'xi-api-key': process.env.ELEVEN_LABS_API_KEY
        },
        body: JSON.stringify({
          text: text,
          model_id: 'eleven_turbo_v2_5',
          voice_settings: {
            stability: 0.4,
            similarity_boost: 0.8,
            speed: 1.2
          }
        })
      }
    );
    if (!response.ok) {
      const errorText = await response.text();
      console.error('ElevenLabs API error:', errorText);
      throw new ErrorElevenLabs API error: ${response.status});
    }
    const audioBuffer = await response.arrayBuffer();

    res.setHeader('Content-Type', 'audio/mpeg');
    res.status(200).send(Buffer.from(audioBuffer));
  } catch (error) {
    console.error('Error:', error);
    res.status(500).json({ error: error.message });
  }
}
