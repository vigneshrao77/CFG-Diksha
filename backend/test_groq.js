require('dotenv').config({ path: './.env' });

const apiKey = process.env.GROQ_API_KEY;

console.log('--- INDEPENDENT GROQ WHISPER STT TEST ---');
console.log('1. Checking GROQ_API_KEY loaded from .env...');

if (!apiKey) {
  console.error('❌ GROQ_API_KEY is missing from backend/.env');
  process.exit(1);
}

console.log('✅ GROQ_API_KEY is loaded correctly (Key prefix: ' + apiKey.substring(0, 8) + '...)');

async function testGroqConnection() {
  console.log('\n2. Testing Groq API Endpoint Connection (https://api.groq.com/openai/v1/models)...');
  try {
    const res = await fetch('https://api.groq.com/openai/v1/models', {
      headers: {
        'Authorization': 'Bearer ' + apiKey.trim()
      }
    });

    if (!res.ok) {
      const errText = await res.text();
      console.error('❌ Groq API connection failed. HTTP ' + res.status + ':', errText);
      return;
    }

    const data = await res.json();
    const whisperModels = data.data ? data.data.map(m => m.id).filter(id => id.includes('whisper')) : [];
    console.log('✅ Groq API Connected Successfully! HTTP ' + res.status);
    console.log('   Available Whisper STT Models:', whisperModels.join(', '));
  } catch (err) {
    console.error('❌ Exception connecting to Groq API:', err.message);
  }
}

testGroqConnection();
