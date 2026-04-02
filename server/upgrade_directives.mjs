import dns from 'dns';
// Force Google DNS — fixes Windows SRV lookup failures for MongoDB Atlas
dns.setServers(['8.8.8.8', '8.8.4.4', '1.1.1.1']);
dns.setDefaultResultOrder('ipv4first');

import dotenv from 'dotenv';
dotenv.config();

import mongoose from 'mongoose';
import axios from 'axios';
import { KnowledgeArticle } from './models/index.js';

async function upgradeDirectives() {
  try {
    await mongoose.connect(process.env.MONGODB_URI);
    console.log('MongoDB Connected.');

    const articles = await KnowledgeArticle.find({ tags: { $ne: 'citizen-insight' } });
    console.log(`Found ${articles.length} official directives to upgrade.`);

    const apiKey = process.env.GEMINI_API_KEY;
    const modelSequence = ["gemini-2.5-flash", "gemini-2.5-pro", "gemini-2.0-flash"];

    for (let i = 0; i < articles.length; i++) {
        const article = articles[i];
        console.log(`\n[${i+1}/${articles.length}] Upgrading: "${article.title}"...`);

        let content = "";
        for (const modelName of modelSequence) {
            try {
                const url = `https://generativelanguage.googleapis.com/v1beta/models/${modelName}:generateContent?key=${apiKey}`;
                const response = await axios.post(url, {
                    contents: [{ 
                        parts: [{ 
                            text: `Write a highly detailed, comprehensive, and advanced intelligence dossier (article format) about: "${article.title}". 
                                   You must generate at least 800 - 1200 words of deeply informative content to educate citizens completely.
                                   Include the following sections:
                                   1. Executive Overview: An engaging, high-level explanation of the threat or legal issue.
                                   2. Advanced Insights & "Unknown" Tactics: Provide deep technical or psychological insights into exactly HOW and WHY this happens. Expose specific hacker methodologies, social engineering tricks, or hidden technical vulnerabilities that the average citizen does NOT know about.
                                   3. Legal Framework (BNS 2024): Explicitly map this topic to specific BNS (Bharatiya Nyaya Sanhita) 2024 legal sections and explain them clearly.
                                   4. Step-by-Step Response Protocol: A precise action plan for victims or targets (e.g., dialing 1930, preserving headers, etc).
                                   5. Preventative Blueprint: Robust, advanced safety tips for future protection.
                                   Output ONLY clean, readable Markdown using H2 (##) and H3 (###) headers, bullet points, and bold text. Do not output anything outside of the markdown structure. Make it read like a premium, expert-level cybercrime intelligence briefing.`
                        }] 
                    }]
                });

                if (response.data?.candidates?.[0]?.content?.parts?.[0]?.text) {
                    content = response.data.candidates[0].content.parts[0].text;
                    console.log(`✅ Synthesis successful via ${modelName}`);
                    break;
                }
            } catch (err) {
                console.error(`❌ ${modelName} failed`);
            }
        }

        if (content) {
            article.content_markdown = content;
            await article.save();
            console.log(`💾 Saved "${article.title}" successfully.`);
        } else {
            console.error(`🚨 Fatal: Could not generate content for "${article.title}"`);
        }
    }

    console.log('\n✅ All Official Directives Upgraded!');
    process.exit(0);
  } catch(err) {
    console.error(err);
    process.exit(1);
  }
}

upgradeDirectives();
