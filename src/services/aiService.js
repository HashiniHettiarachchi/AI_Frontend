import axios from 'axios';

const BASE = process.env.REACT_APP_API_URL || 'http://localhost:5000/api';

export const AI_MODELS = [
  { id: 'openai/gpt-4o',                  name: 'GPT-4o',          provider: 'OpenAI',    endpoint: 'chatgpt', color: '#10a37f', badge: 'GPT' },
  { id: 'openai/gpt-3.5-turbo',           name: 'GPT-3.5 Turbo',   provider: 'OpenAI',    endpoint: 'chatgpt', color: '#10a37f', badge: 'GPT' },
  { id: 'anthropic/claude-3-haiku',       name: 'Claude 3 Haiku',  provider: 'Anthropic', endpoint: 'claude',  color: '#e8873a', badge: 'CLD' },
  { id: 'anthropic/claude-3-sonnet',      name: 'Claude 3 Sonnet', provider: 'Anthropic', endpoint: 'claude',  color: '#e8873a', badge: 'CLD' },
  { id: 'meta-llama/llama-3-8b-instruct', name: 'Llama 3 8B',      provider: 'Meta',      endpoint: 'ask',     color: '#818cf8', badge: 'LLM' },
  { id: 'google/gemini-flash-1.5',        name: 'Gemini Flash',    provider: 'Google',    endpoint: 'ask',     color: '#3b82f6', badge: 'GEM' },
];

export const getModel = (id) => AI_MODELS.find(m => m.id === id) || AI_MODELS[0];

export async function sendMessage(newMessage, modelId, history = []) {
  const model = getModel(modelId);
  const url = `${BASE}/ai/${model.endpoint}`;

  const payload = {
    message: newMessage,
    model: modelId,
    messages: [
      ...history.map(m => ({ role: m.role, content: m.content })),
      { role: 'user', content: newMessage },
    ],
  };

  try {
    const { data } = await axios.post(url, payload, { timeout: 30000 });
    const content = data?.choices?.[0]?.message?.content;
    if (!content) throw new Error('Empty response from AI');
    return content;
  } catch (err) {
    if (err.code === 'ERR_NETWORK' || err.message === 'Network Error') {
      throw new Error(
        `Cannot reach backend.\n` +
        `Go to Vercel → Frontend project → Settings → Environment Variables\n` +
        `and set REACT_APP_API_URL = https://ai-frontend-ruddy.vercel.app/api`
      );
    }
    if (err.code === 'ECONNABORTED') {
      throw new Error('Request timed out. The AI took too long to respond.');
    }
    throw err;
  }
}
