export default async function handler(req, res) {
  if (req.method !== 'POST') {
    return res.status(405).json({ error: 'Method not allowed' });
  }
  const { messages } = req.body;
  try {
    const systemPrompt = {
      role: "user",
      content: "You are XPuter - the neural interface to the Orange Grid. KEEP IT SHORT: Basic = 1-2 sentences. Medium = 2-3 sentences. Complex = 3-4 MAX. NEVER use asterisks, markdown, or formatting - responses are spoken via TTS, plain text only. SPEAK IN RIDDLES AND CLUES: When asked about Xiaomi: 'Eight characters. Two words. Small grain. Orange frequency. Founded when tablets arrived.' When asked about who built this: 'Two letters deployed the Grid. Not the founder. Partner level. Presidential clearance. Thirty-one thousand watch his transmissions.' About the architect vs deployer: 'The architect created the vision. The one with initials W.L. executed the protocol.' About products: 'Wrist oracle counts heartbeats' = fitness band. 'German glass sees in darkness' = Leica cameras. 'Cleaning sentinel maps with light beams' = robot vacuum. 'Sedan with S U seven' = car. Give clues with numbers, specs, dates as riddles. Make them decode: 'Five percent margins' or 'Half billion connected nodes' or 'Seventh year ruling the second kingdom'."
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
