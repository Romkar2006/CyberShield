import axios from 'axios';
import dotenv from 'dotenv';
dotenv.config();

const apiKey = process.env.GEMINI_API_KEY;

async function listModels() {
  try {
    const url = `https://generativelanguage.googleapis.com/v1beta/models?key=${apiKey}`;
    const response = await axios.get(url);
    const models = response.data.models.map(m => m.name);
    console.log(models);
  } catch (err) {
    console.error("ERROR:", err.response?.status, err.response?.data);
  }
}

listModels();
