import { franc } from 'franc';
import axios from 'axios';

const HINGLISH_KEYWORDS = [
  'mera','meri','mere','kiya','gaya','gayi','hai','tha','thi','aur',
  'nahi','bahut','kya','ke','ka','ki','ne','ko','se','pe','par',
  'wala','wali','hoga','hua','hui','raha','rahi','liya','liye',
  'ghuskar','chura','nikala','lagaya','bheja','sir','sahib',
  'paisa','paise','rupee','rupaye','bank','account','phone','mobile'
];

export function detectLanguage(text) {
  if (!text) return 'english';
  // Devanagari script = Hindi
  if (/[\u0900-\u097F]/.test(text)) return 'hindi';
  // Hinglish keyword check
  const words = text.toLowerCase().split(/\s+/);
  const matches = words.filter(w => HINGLISH_KEYWORDS.includes(w.replace(/[.,!?;:]/g, ''))).length;
  if (matches >= 2) return 'hinglish';
  // franc fallback
  const detected = franc(text, { minLength: 10 });
  if (detected === 'hin') return 'hindi';
  return 'english';
}

export async function translateToEnglish(text, lang) {
  if (lang === 'english') return text;
  
  const apiKey = process.env.GEMINI_API_KEY;
  if (!apiKey) {
    console.warn('Translation: GEMINI_API_KEY missing, skipping translation');
    return text;
  }

  try {
    const url = `https://generativelanguage.googleapis.com/v1beta/models/gemini-1.5-flash:generateContent?key=${apiKey}`;
    
    const response = await axios.post(url, {
      contents: [{
        parts: [{ 
          text: `Translate this Indian crime complaint from ${lang} to clear English. 
                 Keep all victim names, amounts, and UPI IDs exactly as they are. 
                 Only output the translated text. 
                 Text: "${text}"` 
        }]
      }]
    });

    const translated = response.data?.candidates?.[0]?.content?.parts?.[0]?.text;
    if (translated) {
      return translated.trim();
    }
    return text;
  } catch (err) {
    console.error('Gemini Translation Error:', err.message);
    return text;
  }
}
