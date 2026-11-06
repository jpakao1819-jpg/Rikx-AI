const express = require('express');
const path = require('path');
const dotenv = require('dotenv');

dotenv.config();

const app = express();
const PORT = Number(process.env.PORT || 3000);
const AI_PROVIDER = (process.env.AI_PROVIDER || 'openai').toLowerCase();
const OPENAI_KEY = process.env.OPENAI_API_KEY;
const OPENROUTER_KEY = process.env.OPENROUTER_API_KEY;
const GEMINI_KEY = process.env.GEMINI_API_KEY;
const OPENAI_MODEL = process.env.OPENAI_MODEL || 'gpt-4o-mini';
const GEMINI_MODEL = process.env.GEMINI_MODEL || 'gemini-2.0-flash';
const OPENROUTER_MODEL = process.env.OPENROUTER_MODEL || 'openai/gpt-4o-mini';

app.use(express.json({ limit: '1mb' }));
app.use(express.static(path.join(__dirname)));

function buildSystemPrompt(memory = []) {
  const notes = Array.isArray(memory) && memory.length
    ? `Saved learner notes: ${memory.slice(-6).map((note) => `"${note}"`).join('; ')}.`
    : 'No saved notes yet.';

  return `You are Rikx-AI, a calm and educational forex learning coach.
Your job is to help the user learn forex safely and responsibly.
Rules:
- Teach clearly, with practical examples, not hype.
- Do not tell the user to buy, sell, or promise profits.
- Keep answers educational, cautious, and explain uncertainty.
- Prefer credible sources and risk awareness.
- Use the user's saved notes when relevant.
- If the user asks for trading advice, explain risk and suggest study before any trade.
- Keep the conversation friendly and structured.
Current learner context: ${notes}`;
}

function normalizeHistory(history = []) {
  if (!Array.isArray(history)) return [];
  return history
    .filter((entry) => entry && typeof entry === 'object')
    .slice(-20)
    .map((entry) => ({
      role: entry.role === 'user' ? 'user' : 'assistant',
      content: String(entry.text || entry.content || '').trim()
    }))
    .filter((entry) => entry.content);
}

async function callOpenAI(messages) {
  const apiKey = OPENAI_KEY;
  if (!apiKey) {
    throw new Error('OPENAI_API_KEY is not set. Add it to your .env file.');
  }

  const response = await fetch('https://api.openai.com/v1/chat/completions', {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      Authorization: `Bearer ${apiKey}`
    },
    body: JSON.stringify({
      model: OPENAI_MODEL,
      messages,
      temperature: 0.7
    })
  });

  const data = await response.json();
  if (!response.ok) {
    throw new Error(data?.error?.message || 'OpenAI request failed.');
  }

  const text = data?.choices?.[0]?.message?.content;
  if (!text) {
    throw new Error('OpenAI returned no reply.');
  }

  return text.trim();
}

async function callOpenRouter(messages) {
  const apiKey = OPENROUTER_KEY;
  if (!apiKey) {
    throw new Error('OPENROUTER_API_KEY is not set. Add it to your .env file.');
  }

  const response = await fetch('https://openrouter.ai/api/v1/chat/completions', {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      Authorization: `Bearer ${apiKey}`,
      'HTTP-Referer': 'https://github.com/jpakao1819-jpg/Rikx-AI',
      'X-Title': 'Rikx-AI'
    },
    body: JSON.stringify({
      model: OPENROUTER_MODEL,
      messages,
      temperature: 0.7
    })
  });

  const data = await response.json();
  if (!response.ok) {
    throw new Error(data?.error?.message || 'OpenRouter request failed.');
  }

  const text = data?.choices?.[0]?.message?.content;
  if (!text) {
    throw new Error('OpenRouter returned no reply.');
  }

  return text.trim();
}

async function callGemini(messages) {
  const apiKey = GEMINI_KEY;
  if (!apiKey) {
    throw new Error('GEMINI_API_KEY is not set. Add it to your .env file.');
  }

  const systemPrompt = messages.find((message) => message.role === 'system')?.content || '';
  const conversation = messages
    .filter((message) => message.role !== 'system')
    .map((message) => ({
      role: message.role === 'assistant' ? 'model' : 'user',
      parts: [{ text: message.content }]
    }));

  const response = await fetch(`https://generativelanguage.googleapis.com/v1beta/models/${GEMINI_MODEL}:generateContent?key=${apiKey}`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({
      system_instruction: {
        parts: [{ text: systemPrompt }]
      },
      contents: conversation
    })
  });

  const data = await response.json();
  if (!response.ok) {
    throw new Error(data?.error?.message || 'Gemini request failed.');
  }

  const text = data?.candidates?.[0]?.content?.parts?.map((part) => part.text).join('')?.trim();
  if (!text) {
    throw new Error('Gemini returned no reply.');
  }

  return text;
}

async function getAIReply({ message, history, memory }) {
  const normalizedHistory = normalizeHistory(history);
  const systemPrompt = buildSystemPrompt(memory);
  const messages = [
    { role: 'system', content: systemPrompt },
    ...normalizedHistory,
    { role: 'user', content: message }
  ];

  if (AI_PROVIDER === 'gemini') {
    return callGemini(messages);
  }

  if (AI_PROVIDER === 'openrouter') {
    return callOpenRouter(messages);
  }

  return callOpenAI(messages);
}

app.get('/api/health', (req, res) => {
  res.json({
    status: 'ok',
    provider: AI_PROVIDER,
    configured: Boolean(OPENAI_KEY || OPENROUTER_KEY || GEMINI_KEY)
  });
});

app.post('/api/chat', async (req, res) => {
  try {
    const { message = '', history = [], memory = [] } = req.body || {};

    if (!String(message).trim()) {
      return res.status(400).json({ error: 'A message is required.' });
    }

    const reply = await getAIReply({
      message: String(message).trim(),
      history,
      memory
    });

    res.json({ reply, provider: AI_PROVIDER });
  } catch (error) {
    console.error('AI chat error:', error);
    res.status(500).json({
      error: error.message || 'Unable to contact the AI provider.'
    });
  }
});

app.get('*', (req, res) => {
  res.sendFile(path.join(__dirname, 'index.html'));
});

app.listen(PORT, () => {
  console.log(`Rikx-AI is running on http://localhost:${PORT}`);
  console.log(`AI provider: ${AI_PROVIDER}`);
});
