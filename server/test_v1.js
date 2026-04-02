import axios from 'axios';
import dotenv from 'dotenv';
dotenv.config();

const apiKey = process.env.GEMINI_API_KEY;

async function testV1() {
  try {
    const url = `https://generativelanguage.googleapis.com/v1/models/gemini-1.5-flash:generateContent?key=${apiKey}`;
    const response = await axios.post(url, {
      contents: [{ parts: [{ text: "hi" }] }]
    });
    console.log("V1 SUCCESS:", response.data?.candidates?.[0]?.content?.parts?.[0]?.text);
  } catch (err) {
    console.error("V1 ERROR:", err.response?.status, err.response?.data);
  }
}

async function testV1Beta() {
  try {
    const url = `https://generativelanguage.googleapis.com/v1beta/models/gemini-1.5-flash:generateContent?key=${apiKey}`;
    const response = await axios.post(url, {
      contents: [{ parts: [{ text: "hi" }] }]
    });
    console.log("V1BETA SUCCESS:", response.data?.candidates?.[0]?.content?.parts?.[0]?.text);
  } catch (err) {
    console.error("V1BETA ERROR:", err.response?.status, err.response?.data);
  }
}

testV1().then(testV1Beta);
