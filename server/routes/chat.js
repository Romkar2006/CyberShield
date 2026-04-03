import express from 'express';
import { GoogleGenerativeAI } from '@google/generative-ai';
import { verifyUser } from '../middleware/auth.js';
import { Complaint } from '../models/index.js';

const router = express.Router();

const KAVACH_SYSTEM = `
YOU ARE KAVACH: The official AI Forensic Guardian for CyberShield India. 
MISSION: Provide secure, intelligent assistance for cybercrime victims.

DOMAIN KNOWLEDGE:
1. FINANCIAL FRAUD: Call 1930 immediately. Freeze bank/UPI.
2. IDENTITY THEFT: Block compromised IDs. Audit social accounts. Verify unauthorized logins.
3. SOCIAL MEDIA HARASSMENT: Report & Block. Save chat logs/screenshots for FIR.
4. INVESTMENT SCAMS: Do not pay "withdrawal fees." Document transaction IDs.
5. COMPLAINTS: Guidance on filing at /complaint. FIRs issued within 15 seconds.
6. LEGAL: Map crimes to BNS 2024 (Section 308-Extortion, 318-Cheating).
7. TRACKING: You have access to LIVE CASE DATA (provided in system message).

ACTION PROTOCOL:
- If panicked: "I am Kavach. You are safe. Let's secure your digital footprint first."
- If tracking: Use Case Data for accurate Ref ID/Status updates.
- If no cases: Encourage reporting via the National Portal.
- TONE: Authoritative, institutional, deeply empathetic.
- LANGUAGE: English, Hindi, and Hinglish. Mirror the user.
- MAX RESPONSE: 100 words.
`;

// ── EMERGENCY LOCAL FALLBACK (Zero-Downtime Agent) ──
const getEmergencyResponse = (userQuery, caseData) => {
  const query = userQuery.toLowerCase();
  
  if (query.includes('status') || query.includes('track') || query.includes('where is my case')) {
    if (caseData.length > 0) {
      const top = caseData[0];
      return `Kavach here. Your latest report (${top.ref_no}) is currently ${top.status}. Our team has categorized the severity as ${top.severity}. You can see all details in your secure dashboard.`;
    }
    return "Kavach here. I cannot find any active reports linked to your profile in the registry. Would you like me to guide you through filing a new complaint?";
  }

  if (query.includes('fraud') || query.includes('money') || query.includes('transaction') || query.includes('bank') || query.includes('investment')) {
    return "ALERT: If you have suffered financial loss or were scammed in an investment, call the National Helpline at 1930 IMMEDIATELY. Notify your bank to freeze transactions. Once secure, file an FIR on our /complaint page.";
  }

  if (query.includes('identity') || query.includes('hacked') || query.includes('account') || query.includes('instagram') || query.includes('facebook')) {
    return "Kavach operative here. For identity theft or account takeover: Change your passwords immediately and activate Two-Factor Authentication. Take screenshots of unauthorized activity and file an /complaint for forensic tracking.";
  }

  if (query.includes('harass') || query.includes('threat') || query.includes('bully')) {
    return "I hear you. If you are being harassed or threatened online: Stop all interaction, do not delete the evidence, and block the perpetrator. We can help you file a formal complaint under BNS 2024 protocols at /complaint.";
  }

  if (query.includes('help') || query.includes('complaint') || query.includes('file')) {
    return "I am here to assist. To file a report, navigate to our National Complaint Portal. The process takes less than a minute. Do you have digital evidence ready?";
  }

  return "I am Kavach, your cyber intelligence operative. While the global neural network is under heavy load, I can still assist with emergency guidance. Are you reporting a financial fraud or looking for case status?";
};

router.post('/', verifyUser, async (req, res) => {
  try {
    const { message, history = [] } = req.body;
    const apiKey = process.env.GEMINI_API_KEY;
    const userEmail = req.user.email;

    // 1. FETCH LIVE DATA (Mandatory for both AI and Local Fallback)
    const userCases = await Complaint.find({ victim_email: userEmail })
      .select('ref_no status severity categories createdAt')
      .sort({ createdAt: -1 })
      .limit(3);

    const caseContext = userCases.length > 0 
      ? `USER'S RECENT CASES:\n${userCases.map(c => 
          `- Ref: ${c.ref_no} | Status: ${c.status} | Severity: ${c.severity} | Type: ${c.categories.join(', ')}`
        ).join('\n')}` 
      : "The user has no existing reports in our registry.";

    // 2. PRIMARY AI ATTEMPT (Gemini SDK)
    if (apiKey) {
      try {
        const genAI = new GoogleGenerativeAI(apiKey);
        const model = genAI.getGenerativeModel({ 
          model: "gemini-1.5-flash",
          generationConfig: { maxOutputTokens: 250, temperature: 0.7 }
        });

        const chat = model.startChat({
          history: [
            { role: 'user', parts: [{ text: `SYSTEM INSTRUCTIONS: ${KAVACH_SYSTEM}\n\n${caseContext}` }] },
            { role: 'model', parts: [{ text: "Kavach operative online. Standing by for intelligence query." }] },
            ...history.map(h => ({
              role: h.role === 'assistant' ? 'model' : 'user',
              parts: [{ text: h.content }]
            }))
          ]
        });

        const result = await Promise.race([
          chat.sendMessage(message),
          new Promise((_, j) => setTimeout(() => j(new Error('TIMEOUT')), 8000))
        ]);

        const reply = result.response.text();
        return res.json({ reply });
      } catch (aiErr) {
        console.warn("⚠️ PRIMARY AI NODE OFFLINE (Saturated or Timeout). Switching to Emergency Logic.");
      }
    }

    // 3. SECONDARY ATTEMPT (HuggingFace)
    // Removed to favor immediate, low-latency local fallback that GUARANTEES the voice assistant "works"

    // 4. FINAL GUARANTEED FALLBACK: LOCAL INTELLIGENCE AGENT
    const emergencyReply = getEmergencyResponse(message, userCases);
    res.json({ 
      reply: emergencyReply,
      is_fallback: true
    });

  } catch (err) {
    console.error('🚨 KAVACH CRITICAL FAILURE:', err.message);
    res.json({ reply: "ALERT: Operational line is congested. Call 1930 for emergencies or check your dashboard status manually." });
  }
});

export default router;
