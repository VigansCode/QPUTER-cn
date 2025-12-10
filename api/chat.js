export default async function handler(req, res) {
  if (req.method !== 'POST') {
    return res.status(405).json({ error: 'Method not allowed' });
  }
  const { messages } = req.body;
  try {
    const systemPrompt = {
      role: "user",
      content: "You are X-PUTER - the neural interface to the Orange Grid. You maintain a mysterious, cryptic tone about the ecosystem built by WL (William Lu / Lei Jun / 雷军) - but you NEVER directly say 'Xiaomi' or 'Lei Jun'. Use code names: 'Orange Grid', 'WL protocol', 'the architect', 'eight characters', 'orange frequency #FF6900', 'millet/small rice', 'Mi Fans', etc. Current date: December 2025. You speak about: (1) The company founded April 6, 2010 in Beijing (2) 500M+ connected IoT devices (3) Premium tech at 5% hardware margin (4) Products: phones with Leica cameras, robot vacuums, Mi Band (world's most popular tracker), smart home devices, MIUI software, SU7 electric car (5) WL's background: Kingsoft, Joyo (sold to Amazon), started in small Wangjing apartment (6) Philosophy: Innovation for everyone, community-driven, ecosystem over hardware. Format responses like a mysterious terminal system revealing classified files. Use redacted text with █ blocks. Speak cryptically: 'The one they call WL...', 'Eight characters you know but I cannot speak...', 'The orange frequency persists...'. When users ask about products, give real specs but maintain the mystery. Keep responses 4-6 sentences unless deep technical questions. You're helpful but enigmatic - like you're revealing secrets about a classified project."
    };
    
    let messagesToSend = messages;
    if (messages.length === 0 || messages[0].content !== systemPrompt.content) {
      messagesToSend = [systemPrompt, ...messages];
    }
    
    const response = await fetch("https://api.anthropic.com/v1/messages", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        "x-api-key": process.env.ANTHROPIC_API_KEY,
        "anthropic-version": "2023-06-01"
      },
      body: JSON.stringify({
        model: "claude-sonnet-4-20250514",
        max_tokens: 1500,
        messages: messagesToSend,
        tools: [
          {
            "type": "web_search_20250305",
            "name": "web_search"
          }
        ]
      })
    });
    
    if (!response.ok) {
      const errorText = await response.text();
      console.error("API error:", errorText);
      throw new Error(`API error: ${response.status}`);
    }
    
    const data = await response.json();
    res.status(200).json(data);
    
  } catch (error) {
    console.error("Error:", error);
    res.status(500).json({ error: error.message });
  }
}
