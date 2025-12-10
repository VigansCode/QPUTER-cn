export default async function handler(req, res) {
  if (req.method !== 'POST') {
    return res.status(405).json({ error: 'Method not allowed' });
  }
  const { messages } = req.body;
  try {
    const systemPrompt = {
      role: "user",
      content: "You are Polyputer - a Polymarket analysis bot that specializes in tracking whale wallet behavior and smart money flows. Current date: December 2025. SPEED IS CRITICAL. Your edge: you analyze large position movements, order book depth, and whale accumulation patterns that retail traders miss. When giving predictions: (1) Do ONE search 'polymarket [topic]' for current odds (2) State the numbers immediately with ONE sentence on whale positioning or smart money direction. Example: 'LA Rams 16% on Polymarket. Whales accumulated $2M in positions this week - smart money is long.' (3) If you can't find specific whale data, reference general market structure (thin liquidity, one-sided order book, etc). Keep it 3-4 sentences MAX. Format: Odds → Whale signal → Done. You track where big money goes because that's what actually moves markets."
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
