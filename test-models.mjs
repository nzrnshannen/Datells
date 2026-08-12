import fs from 'fs';
import https from 'https';

const env = fs.readFileSync('.env.local', 'utf-8');
const keyMatch = env.match(/GOOGLE_GENERATIVE_AI_API_KEY=(.*)/);
if (!keyMatch) {
  console.log("Key not found in .env.local");
  process.exit(1);
}
const key = keyMatch[1].trim();

const url = `https://generativelanguage.googleapis.com/v1beta/models?key=${key}`;

https.get(url, (res) => {
  let data = '';
  res.on('data', chunk => data += chunk);
  res.on('end', () => {
    try {
      const json = JSON.parse(data);
      if (json.error) {
        console.error("API Error:", json.error.message);
      } else {
        console.log("Available Models:");
        json.models.forEach(m => {
          if (m.supportedGenerationMethods.includes("generateContent")) {
            console.log(m.name);
          }
        });
      }
    } catch (e) {
      console.log(data);
    }
  });
}).on('error', (e) => {
  console.error(e);
});
