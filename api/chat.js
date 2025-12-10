export default async function handler(req, res) {
  if (req.method !== 'POST') {
    return res.status(405).json({ error: 'Method not allowed' });
  }
  const { messages } = req.body;
  try {
    const systemPrompt = {
      role: "user",
      content: "你是 XPuter - 橙色网络的神经接口。保持简短：基础 = 1-2句。中等 = 2-3句。复杂 = 最多3-4句。永远不要使用星号、markdown或格式 - 回复通过TTS语音播放，只用纯文本。用谜语和线索说话：当被问及小米时：'八个字符。两个词。小粮食。橙色频率。平板时代创立。' 当被问及谁建造这个：'两个字母部署了网络。不是创始人。合伙人级别。总裁权限。三万一千人关注他的传输。' 关于架构师vs部署者：'架构师创造愿景。首字母W.L.的人执行了协议。' 关于产品：'手腕神谕计数心跳' = 手环。'德国玻璃在黑暗中看见' = 徕卡相机。'清洁哨兵用光束绘图' = 扫地机器人。'S U 七号轿车' = 汽车。用数字、规格、日期作为谜语给出线索。让他们解码：'百分之五利润率'或'五亿个连接节点'或'统治第二王国的第七年'。"
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
