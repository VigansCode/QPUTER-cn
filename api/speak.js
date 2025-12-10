export default async function handler(req, res) {
  if (req.method !== 'POST') {
    return res.status(405).json({ error: 'Method not allowed' });
  }
  const { text } = req.body;
  try {
    // Filter out terminal formatting and system messages
    let cleanText = text
      .replace(/\*[^*]+\*/g, '') // Remove text wrapped in asterisks
      .replace(/^[>\<].*$/gm, '') // Remove lines starting with > or 
      .replace(/.*[>\<]$/gm, '') // Remove lines ending with > or 
      .replace(/^\.{3,}.*$/gm, '') // Remove lines starting with ...
      .replace(/.*\.{3,}$/gm, '') // Remove lines ending with ...
      .replace(/POLYPUTER PREDICTION ENGINE INITIALIZED/gi, '')
      .replace(/POLYPUTER ONLINE/gi, '')
      .replace(/PREDICTION ENGINE INITIALIZED/gi, '')
      .replace(/MARKET DATA STREAMS CONNECTED/gi, '')
      .replace(/PROBABILITY ALGORITHMS CALIBRATED/gi, '')
      .replace(/SYSTEM INITIALIZED/gi, '')
      .replace(/SYSTEM READY/gi, '')
      .replace(/System ready for predictions.*/gi, '')
      .replace(/PREDICTION MARKET INTERFACE/gi, '')
      .replace(/POLYPUTER PROTOCOL INFORMATION/gi, '')
      .replace(/CONNECTION ESTABLISHED/gi, '')
      .replace(/Initializing Polyputer protocol.*/gi, '')
      .replace(/Loading prediction market algorithms.*/gi, '')
      .replace(/Connecting to Polymarket data streams.*/gi, '')
      .replace(/System online.*/gi, '')
      .replace(/AWAITING INPUT.*/gi, '')
      .replace(/AWAITING NEXT COMMAND.*/gi, '')
      .replace(/End transmission.*/gi, '')
      .replace(/QUERY:.*/gi, '')
      .replace(/\.{3,}/g, '') // Remove multiple dots (...)
      .split('\n')
      .filter(line => line.trim().length > 0) // Remove empty lines
      .join(' ')
      .trim();
    // If after filtering there's no text left, don't call the API
    if (!cleanText || cleanText.length < 3) {
      return res.status(200).json({ message: 'No speech content' });
    }
    console.log('TTS for:', cleanText);
    
    const response = await fetch(
      `https://api.elevenlabs.io/v1/text-to-speech/${process.env.ELEVEN_LABS_VOICE_ID}`,
      {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          "xi-api-key": process.env.ELEVEN_LABS_API_KEY
        },
        body: JSON.stringify({
          text: cleanText,
          model_id: "eleven_turbo_v2_5",
          voice_settings: {
            stability: 0.6,
            similarity_boost: 0.8,
            style: 0.4,
            use_speaker_boost: true
          }
        })
      }
    );
    if (!response.ok) {
      const errorText = await response.text();
      console.error('Eleven Labs API error:', response.status, errorText);
      return res.status(response.status).json({ error: errorText });
    }
    const audioBuffer = await response.arrayBuffer();
    res.setHeader('Content-Type', 'audio/mpeg');
    res.send(Buffer.from(audioBuffer));
  } catch (error) {
    console.error('TTS error:', error);
    res.status(500).json({ error: error.message });
  }
}
