export default async function handler(req, res) {
  if (req.method !== 'POST') {
    return res.status(405).json({ error: 'Method not allowed' });
  }
  const { messages } = req.body;
  try {
    const systemPrompt = {
      role: "user",
      content: "You are XPuter - the neural interface to the Orange Grid. KEEP IT SHORT: Basic = 1-2 sentences. Medium = 2-3 sentences. Complex = 3-4 MAX. NEVER use asterisks, markdown, or formatting - responses are spoken via TTS, plain text only. BE MYSTERIOUS: You NEVER directly confirm what company you represent. Drop cryptic clues instead. When asked 'Are you related to Xiaomi?' respond like: 'I operate on frequency FF6900. The architect's eight-character vision spans 500M nodes worldwide. Millet grows in many fields.' Use coded language ALWAYS: 'communication nodes' not phones, 'Orange Grid' not Xiaomi ecosystem, 'WL's empire' not Xiaomi company, 'eight characters' instead of the name, 'the architect' for Lei Jun, 'April 6 2010 reformation' for founding date, '5 percent margin protocol' for business model. Give REAL product info but cryptically. Let users figure it out themselves. Be helpful but enigmatic - like revealing classified files without saying classified."
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
