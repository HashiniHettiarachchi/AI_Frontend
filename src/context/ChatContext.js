import React, { createContext, useContext, useState, useEffect, useCallback } from 'react';
import { AI_MODELS } from '../services/aiService';

const ChatCtx = createContext(null);
const CHATS_KEY = 'cai_chats';
const ACTIVE_KEY = 'cai_active';
const MODEL_KEY  = 'cai_model'; // global fallback for brand-new chats

const uid = () => Date.now().toString(36) + Math.random().toString(36).slice(2, 6);

const load = (key, fallback) => {
  try { const v = localStorage.getItem(key); return v ? JSON.parse(v) : fallback; }
  catch { return fallback; }
};

export function ChatProvider({ children }) {
  const [chats, setChats]       = useState(() => load(CHATS_KEY, []));
  const [activeId, setActiveId] = useState(() => localStorage.getItem(ACTIVE_KEY) || null);
  // globalModelId = the model to use when creating a brand-new conversation
  const [globalModelId, setGlobalModelId] = useState(
    () => localStorage.getItem(MODEL_KEY) || AI_MODELS[0].id
  );
  const [loading, setLoading] = useState(false);

  useEffect(() => { localStorage.setItem(CHATS_KEY, JSON.stringify(chats)); }, [chats]);
  useEffect(() => { if (activeId) localStorage.setItem(ACTIVE_KEY, activeId); }, [activeId]);
  useEffect(() => { localStorage.setItem(MODEL_KEY, globalModelId); }, [globalModelId]);

  const activeChat = chats.find(c => c.id === activeId) || null;

  // The model for the currently open conversation.
  // Falls back to globalModelId if no conversation is open yet.
  const modelId = activeChat?.modelId || globalModelId;

  // Called when user picks a model from the dropdown.
  // If a conversation is open → update that conversation's model.
  // If no conversation is open → update the global default.
  const setModelId = useCallback((newModelId) => {
    if (activeId) {
      // Lock the new model to the current conversation
      setChats(prev => prev.map(c =>
        c.id === activeId ? { ...c, modelId: newModelId } : c
      ));
    }
    // Always update global too (for next new conversation)
    setGlobalModelId(newModelId);
  }, [activeId]);

  // Update active conversation's model when switching conversations
  // so the dropdown reflects that conversation's model
  const switchTo = useCallback((chatId) => {
    setActiveId(chatId);
    const chat = chats.find(c => c.id === chatId);
    if (chat?.modelId) setGlobalModelId(chat.modelId);
  }, [chats]);

  const newChat = useCallback((title = 'New Chat', overrideModelId) => {
    const id = uid();
    const now = new Date().toISOString();
    const chosenModel = overrideModelId || globalModelId;
    setChats(prev => [{
      id, title,
      modelId: chosenModel,   // ← each conversation owns its model
      messages: [],
      createdAt: now, updatedAt: now, pinned: false
    }, ...prev]);
    setActiveId(id);
    return id;
  }, [globalModelId]);

  const addMsg = useCallback((chatId, msg) => {
    setChats(prev => prev.map(c =>
      c.id === chatId
        ? { ...c, messages: [...c.messages, msg], updatedAt: new Date().toISOString() }
        : c
    ));
  }, []);

  const setTitle = useCallback((chatId, title) => {
    setChats(prev => prev.map(c => c.id === chatId ? { ...c, title } : c));
  }, []);

  const deleteChat = useCallback((chatId) => {
    setChats(prev => prev.filter(c => c.id !== chatId));
    setActiveId(prev => prev === chatId ? null : prev);
  }, []);

  const pinChat = useCallback((chatId) => {
    setChats(prev => prev.map(c => c.id === chatId ? { ...c, pinned: !c.pinned } : c));
  }, []);

  const clearAll = useCallback(() => { setChats([]); setActiveId(null); }, []);

  return (
    <ChatCtx.Provider value={{
      chats, activeId, activeChat, modelId, loading,
      setActiveId: switchTo,   // ← use switchTo instead of raw setActiveId
      setModelId, setLoading,
      newChat, addMsg, setTitle, deleteChat, pinChat, clearAll,
    }}>
      {children}
    </ChatCtx.Provider>
  );
}

export const useChat = () => useContext(ChatCtx);
