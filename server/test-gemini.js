import dotenv from 'dotenv';
import { GoogleGenerativeAI } from '@google/generative-ai';

dotenv.config();

async function testGemini() {
  const apiKey = process.env.GEMINI_API_KEY;
  if (!apiKey) {
    console.error('ERROR: GEMINI_API_KEY is not set in .env');
    return;
  }

  console.log('Testing Gemini API with key:', apiKey.substring(0, 10) + '...');
  
  try {
    const genAI = new GoogleGenerativeAI(apiKey);
    const model = genAI.getGenerativeModel({ model: "gemini-1.5-flash" });
    
    console.log('Fetching model response for "Hello, how are you?"...');
    const result = await model.generateContent("Hello, how are you?");
    const response = await result.response;
    const text = response.text();
    
    console.log('SUCCESS! Gemini response:');
    console.log(text);
  } catch (err) {
    console.error('FAILED! Gemini API error details:');
    console.error(err.toString());
  }
}

testGemini();
