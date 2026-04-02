import dns from 'dns';
dns.setServers(['8.8.8.8', '8.8.4.4', '1.1.1.1']);
dns.setDefaultResultOrder('ipv4first');
import dotenv from 'dotenv';
dotenv.config();
import axios from 'axios';

async function test() {
  try {
    const url = `https://generativelanguage.googleapis.com/v1beta/models/gemini-1.5-flash:generateContent?key=${process.env.GEMINI_API_KEY}`;
    const response = await axios.post(url, {
      contents: [{ parts: [{ text: "Hi" }] }]
    });
    console.log('REPLY:', JSON.stringify(response.data.candidates[0].content.parts[0].text));
  } catch (err) {
    console.error('ERROR:', err.message);
    if (err.response) {
      console.error('RESPONSE DATA:', JSON.stringify(err.response.data));
    }
  }
}

test();
