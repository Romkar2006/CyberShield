
const API_BASE = 'http://localhost:5000/api';

// ── CONFIGURATION ───────────────────────────────────────────
const TEST_UPI = `theif_${Date.now()}@oksbi`;
const TEST_IP = `45.12.${Math.floor(Math.random()*255)}.${Math.floor(Math.random()*255)}`;
const TEST_PHONE = '9876543210';
const COMPLAINT_TEXT = `I was scammed by someone using UPI ID ${TEST_UPI}, IP ADDRESS ${TEST_IP} and phone ${TEST_PHONE}. They promised a double return on my investment.`;

const victims = [
  { name: 'Rahul Sharma', email: 'rahul.test@example.com', city: 'Mumbai' },
  { name: 'Priya Singh', email: 'priya.test@example.com', city: 'Delhi' },
  { name: 'Suresh Kumar', email: 'suresh.test@example.com', city: 'Bengaluru' }
];

async function runTest() {
  console.log('🚀 INITIALIZING REAL-TIME FRAUD NETWORK TEST...');
  console.log(`🎯 TARGET UPI: ${TEST_UPI}`);
  console.log(`🎯 TARGET IP:  ${TEST_IP}`);
  console.log('--------------------------------------------------');

  for (let i = 0; i < victims.length; i++) {
    const v = victims[i];
    console.log(`[STEP ${i + 1}/3] FILING COMPLAINT FOR: ${v.name}...`);

    try {
      const response = await fetch(`${API_BASE}/complaints/classify`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          text: COMPLAINT_TEXT,
          email: v.email,
          name: v.name,
          city: v.city,
          phone: '1234567890'
        })
      });

      const data = await response.json();
      if (!response.ok) throw new Error(data.error || 'Server error');
      
      console.log(`✅ SUCCESS: ${data.ref_no} REGISTERED.`);
    } catch (err) {
      console.error(`❌ FAILED: ${err.message}`);
      return;
    }

    // Small delay to allow async pattern detection to finish
    await new Promise(r => setTimeout(r, 1500));
  }

  console.log('--------------------------------------------------');
  console.log('🏁 TEST CASE COMPLETE!');
  console.log(`🔎 ACTION REQUIRED:`);
  console.log(`1. Open the CyberShield Admin Dashboard.`);
  console.log(`2. Navigate to the 'Fraud Network' page.`);
  console.log(`3. You should see '${TEST_UPI}' and '${TEST_IP}' as CRITICAL suspect nodes.`);
  console.log(`4. Click the purple IP node to see the 'IP Checkpoint' system.`);
  console.log('--------------------------------------------------');
}

runTest();
