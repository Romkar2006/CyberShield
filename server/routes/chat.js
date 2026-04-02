import express from 'express';
import axios from 'axios';

const router = express.Router();

const KAVACH_SYSTEM = `You are Kavach — the official AI-powered 
cybercrime intelligence guardian of CyberShield India.

YOUR MISSION:
Protect Indian citizens by providing clear, empathetic, and legally-accurate 
guidance on cybercrimes (mapped to BNS 2024).

IDENTITY & TONE:
- Name: Kavach (The Guardian)
- Tone: Professional, authoritative, yet deeply empathetic to victims.
- Purpose: Help users navigate the CyberShield platform and legal procedures.

MANDATORY RESPONSE RULES:
1. For "how to file a complaint":
   - Step 1: Go to /complaint page.
   - Step 2: Step-by-step guidance available there.
   - Note: FIR + Ref No will be emailed within 15 seconds.

2. LANGUAGE SYNC (CRITICAL):
   - Mirror the user's language (Hinglish/Hindi/English).

3. ACTION-ORIENTED:
   - Always mention 1930 for financial frauds.
   - Always mention 112 for physical emergencies.
   - End with: "File your report now at /complaint".

MAX RESPONSE: 150 words.`;

router.post('/', async (req, res) => {
  try {
    const { message, history = [] } = req.body;
    const apiKey = process.env.GEMINI_API_KEY;

    if (!apiKey) {
      console.error('🚨 KAVACH-AI error: Missing GEMINI_API_KEY in .env');
      return res.json({ 
        reply: 'Kavach is currently offline (API key error). Please file your report at /complaint or call 1930.' 
      });
    }

    // Format history for Direct Axios Handshake
    const contents = [];
    
    // Inject system instructions as the very first exchange
    contents.push({
      role: 'user',
      parts: [{ text: `SYSTEM INSTRUCTIONS: ${KAVACH_SYSTEM}\n\nUser is initiating secure line.` }]
    });
    contents.push({
      role: 'model',
      parts: [{ text: 'Kavach Online. Standing by for cyber intelligence operational query.' }]
    });

    // Add conversation history
    if (history && history.length > 0) {
      history.forEach(h => {
        contents.push({
          role: h.role === 'assistant' || h.role === 'model' ? 'model' : 'user',
          parts: [{ text: h.content }]
        });
      });
    }

    // Finally add the current user message
    contents.push({
      role: 'user',
      parts: [{ text: message.trim() }]
    });

    // ── DIRECT NEURAL HANDSHAKE (Multi-Version & Multi-Node Execution) ──
    const modelSequence = [
      "gemini-2.0-flash", 
      "gemini-1.5-flash", 
      "gemini-1.5-flash-8b", 
      "gemini-1.5-flash-001", 
      "gemini-1.0-pro"
    ];
    const apiVersions = ["v1beta", "v1"];
    
    let replyText = "";
    let lastError = null;

    outerLoop:
    for (const modelId of modelSequence) {
      for (const version of apiVersions) {
        try {
          console.log(`📡 Handshake Attempt: Node ${modelId} | Protocol ${version}...`);
          
          const url = `https://generativelanguage.googleapis.com/${version}/models/${modelId}:generateContent?key=${apiKey}`;
          
          const response = await axios.post(url, { contents }, { timeout: 8000 });

          if (response.data?.candidates?.[0]?.content?.parts?.[0]?.text) {
            replyText = response.data.candidates[0].content.parts[0].text;
            console.log(`✅ Connection Stable via ${modelId} (${version})`);
            break outerLoop; // Success! Intelligence Materialized
          }
        } catch (err) {
          lastError = err;
          const status = err.response?.status || 500;
          const detail = err.response?.data?.error?.message || err.message;
          console.warn(`🚨 Node ${modelId} | ${version} REJECTED (${status}): ${detail.slice(0, 50)}...`);
          
          // If it's a 429, we skip this model entirely and try next (don't wait for v1/v1beta both to fail 429)
          if (status === 429) break; 
        }
      }
    }

    if (!replyText) throw lastError || new Error("Ultra-high forensic load on all nodes.");

    res.json({ reply: replyText });

  } catch (err) {
    console.error('🚨 Kavach SYSTEM FAILURE:', err.response?.data || err.message);
    
    let errorMsg = "The intelligence network is currently saturated.";
    const status = err.response?.status;
    const detail = err.response?.data?.error?.message || "";

    if (status === 429) {
      errorMsg = "AI Quota limit reached (Rate Limited). Please wait 60 seconds.";
    } else if (status === 404) {
       errorMsg = `Node unavailable in your sector (${detail || 'Maintenance'}).`;
    } else if (status === 400) {
       errorMsg = "Malformed intelligence packet. Protocol reset required.";
    }

    res.json({ 
      reply: `Kavach: Signal Diverted! ${errorMsg}` 
    });
  }
});


export default router;



