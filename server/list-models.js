import dotenv from 'dotenv';
import { GoogleGenerativeAI } from '@google/generative-ai';

dotenv.config();

async function listModels() {
  const apiKey = process.env.GEMINI_API_KEY;
  if (!apiKey) return;

  try {
    // We'll use axios to list models since the GenAI SDK doesn't have a simple listModels method yet in all versions
    const axios = (await import('axios')).default;
    const url = `https://generativelanguage.googleapis.com/v1beta/models?key=${apiKey}`;
    const response = await axios.get(url);
    
    console.log('Available Models:');
    response.data.models.forEach(m => {
      console.log(`- ${m.name} (${m.supportedGenerationMethods.join(', ')})`);
    });
  } catch (err) {
    console.error('Failed to list models:', err.toString());
  }
}

listModels();
