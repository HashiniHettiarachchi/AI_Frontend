import axios from 'axios';

const BASE = process.env.REACT_APP_API_URL || 'https://ai-backend-jet.vercel.app/api';


export const AI_MODELS = [
  { id: 'openai/gpt-4o',              name: 'GPT-4o',          provider: 'OpenAI',    endpoint: 'chatgpt', color: '#10a37f', badge: 'GPT' },
  { id: 'openai/gpt-3.5-turbo',       name: 'GPT-3.5 Turbo',   provider: 'OpenAI',    endpoint: 'chatgpt', color: '#10a37f', badge: 'GPT' },
  { id: 'anthropic/claude-3-haiku',   name: 'Claude 3 Haiku',  provider: 'Anthropic', endpoint: 'claude',  color: '#e8873a', badge: 'CLD' },
  { id: 'anthropic/claude-3-sonnet',  name: 'Claude 3 Sonnet', provider: 'Anthropic', endpoint: 'claude',  color: '#e8873a', badge: 'CLD' },
  { id: 'meta-llama/llama-3-8b-instruct', name: 'Llama 3 8B', provider: 'Meta',      endpoint: 'ask',     color: '#818cf8', badge: 'LLM' },
  { id: 'google/gemini-flash-1.5',    name: 'Gemini Flash',    provider: 'Google',    endpoint: 'ask',     color: '#3b82f6', badge: 'GEM' },
];

export const getModel = (id) => AI_MODELS.find(m => m.id === id) || AI_MODELS[0];

/**
 * Send a message to your backend.
 * Supports full conversation history for memory.
 * @param {string} newMessage
 * @param {string} modelId
 * @param {Array}  history  — [{role, content}, ...]
 */
export async function sendMessage(newMessage, modelId, history = []) {
  const model = getModel(modelId);
  const url = `${BASE}/ai/${model.endpoint}`;

  // Your backend accepts { message, model } — we also send history as messages[]
  // for future multi-turn support (no backend change needed for single-turn)
  const payload = {
    message: newMessage,
    model: modelId,
    // also send full messages array in case you upgrade aiController later
    messages: [
      ...history.map(m => ({ role: m.role, content: m.content })),
      { role: 'user', content: newMessage },
    ],
  };

  const { data } = await axios.post(url, payload);
  const content = data?.choices?.[0]?.message?.content;
  if (!content) throw new Error('No response from AI');
  return content;
}
