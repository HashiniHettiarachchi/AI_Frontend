import React, { useState, useRef, useEffect } from 'react';
import { useChat } from '../context/ChatContext';
import { sendMessage, getModel } from '../services/aiService';
import ModelSelector from './ModelSelector';
import MessageBubble from './MessageBubble';
import { Send, Sparkles, AlertCircle } from 'lucide-react';
import './ChatWindow.css';

const SUGGESTIONS = [
  'Explain machine learning in simple terms',
  'Write a REST API in Node.js',
  'Summarise the benefits of React hooks',
  'Debug this: undefined is not a function',
];

function Welcome({ onSend }) {
  const { modelId } = useChat();
  const m = getModel(modelId);
  return (
    <div className="cw-welcome">
      <div className="cw-welcome-glow"/>
      <div className="cw-welcome-icon">
        <svg width="34" height="34" viewBox="0 0 28 28" fill="none">
          <path d="M14 2L24 8V20L14 26L4 20V8L14 2Z" fill="#4f80ff" opacity=".9"/>
          <path d="M14 7L20 10.5V17.5L14 21L8 17.5V10.5L14 7Z" fill="#080b12"/>
          <circle cx="14" cy="14" r="3" fill="#4f80ff"/>
        </svg>
      </div>
      <h2 className="cw-welcome-h">What can I help with?</h2>
      <p className="cw-welcome-sub">
        Using <span style={{color:m.color, fontWeight:600}}>{m.name}</span> · {m.provider}
      </p>
      <div className="cw-chips">
        {SUGGESTIONS.map((s,i) => (
          <button key={i} className="cw-chip" onClick={() => onSend(s)}>
            <Sparkles size={11}/> {s}
          </button>
        ))}
      </div>
    </div>
  );
}

function SwitchBanner({ fromModel, toModel, onStay, onSwitch }) {
  return (
    <div className="cw-switch-banner">
      <AlertCircle size={14} className="cw-switch-icon"/>
      <div className="cw-switch-text">
        <strong>Switch to {toModel.name}?</strong>
        <span>
          This conversation uses {fromModel.name}. Switch to start a new {toModel.name} conversation,
          or stay to keep chatting with {fromModel.name}.
        </span>
      </div>
      <div className="cw-switch-btns">
        <button className="csb-stay"   onClick={onStay}>Stay with {fromModel.name}</button>
        <button className="csb-switch" onClick={onSwitch} style={{borderColor: toModel.color, color: toModel.color}}>
          New {toModel.name} chat
        </button>
      </div>
    </div>
  );
}

export default function ChatWindow() {
  const {
    activeId, activeChat, modelId,
    newChat, addMsg, setTitle, setModelId,
    loading, setLoading,
  } = useChat();

  const [input, setInput]         = useState('');
  const [busy, setBusy]           = useState(false);
  // pendingModel = model user wants to switch to, waiting for confirmation
  const [pendingModel, setPending] = useState(null);
  const textareaRef               = useRef(null);
  const bottomRef                 = useRef(null);

  // Scroll on new messages
  useEffect(() => {
    bottomRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [activeChat?.messages?.length, loading]);

  // Auto-resize textarea
  useEffect(() => {
    const ta = textareaRef.current;
    if (!ta) return;
    ta.style.height = 'auto';
    ta.style.height = Math.min(ta.scrollHeight, 160) + 'px';
  }, [input]);

  // Clear pending banner when conversation changes
  useEffect(() => {
    setPending(null);
  }, [activeId]);

  // Called by ModelSelector when user picks a different model
  const handleModelChange = (newModelId) => {
    const hasMessages = activeChat?.messages?.length > 0;

    if (!hasMessages) {
      // Empty conversation — just update the model directly, no banner needed
      setModelId(newModelId);
      setPending(null);
      return;
    }

    // Has messages — check if it's actually a different model
    const currentModelId = activeChat?.modelId || modelId;
    if (newModelId === currentModelId) return;

    // Show the confirmation banner
    setPending(newModelId);
  };

  // User confirms: start a brand-new conversation with the new model
  const confirmSwitch = () => {
    if (!pendingModel) return;
    setModelId(pendingModel);   // update global default
    newChat('New Chat', pendingModel); // create fresh conversation
    setPending(null);
  };

  // User cancels: revert the model selector back to this conversation's model
  const cancelSwitch = () => {
    const convModel = activeChat?.modelId || modelId;
    setModelId(convModel);
    setPending(null);
  };

  const doSend = async (override) => {
    const text = (override || input).trim();
    if (!text || busy) return;

    // If there's a pending switch, dismiss it
    setPending(null);
    setInput('');

    // Use the conversation's own model (not global)
    const convModelId = activeChat?.modelId || modelId;

    let chatId = activeId;
    if (!chatId) chatId = newChat(text.slice(0, 42), convModelId);

    const history = (activeChat?.messages || []).filter(
      m => m.role === 'user' || m.role === 'assistant'
    );

    if (!activeChat?.messages?.length) {
      setTitle(chatId, text.slice(0, 44) + (text.length > 44 ? '…' : ''));
    }

    addMsg(chatId, {
      id: Date.now() + 'u', role: 'user',
      content: text, ts: new Date().toISOString(), modelId: convModelId,
    });

    setBusy(true);
    setLoading(true);

    try {
      const reply = await sendMessage(text, convModelId, history);
      addMsg(chatId, {
        id: Date.now() + 'a', role: 'assistant',
        content: reply, ts: new Date().toISOString(), modelId: convModelId,
      });
    } catch (err) {
      const msg = err?.response?.data?.error?.message
        || err?.response?.data?.error
        || err.message
        || 'Could not reach the AI. Make sure your backend is running on port 5000.';
      addMsg(chatId, {
        id: Date.now() + 'e', role: 'error',
        content: String(msg), ts: new Date().toISOString(), modelId: convModelId,
      });
    } finally {
      setBusy(false);
      setLoading(false);
    }
  };

  const onKey = e => {
    if (e.key === 'Enter' && !e.shiftKey) { e.preventDefault(); doSend(); }
  };

  const msgs = activeChat?.messages || [];

  // The model currently locked to this conversation (for display)
  const convModel = getModel(activeChat?.modelId || modelId);
  // The pending model the user wants to switch to
  const wantModel = pendingModel ? getModel(pendingModel) : null;

  return (
    <div className="cw-root">
      {/* Header */}
      <div className="cw-header">
        <div className="cw-header-left">
          <h3 className="cw-chat-title">{activeChat?.title || 'New Chat'}</h3>
        </div>
        <div className="cw-header-mid">
          {/* Pass onModelChange so the selector calls our handler, not setModelId directly */}
          <ModelSelector onModelChange={handleModelChange}/>
        </div>
        <div className="cw-header-right">
          <div className="cw-provider-badge">
            <span className="cw-pd" style={{background: convModel.color}}/>
            {convModel.provider}
          </div>
        </div>
      </div>

      {/* Switch confirmation banner */}
      {pendingModel && wantModel && (
        <SwitchBanner
          fromModel={convModel}
          toModel={wantModel}
          onStay={cancelSwitch}
          onSwitch={confirmSwitch}
        />
      )}

      {/* Messages */}
      <div className="cw-messages">
        {msgs.length === 0
          ? <Welcome onSend={doSend}/>
          : msgs.map(m => <MessageBubble key={m.id} message={m}/>)
        }
        {busy && (
          <div className="cw-typing">
            <div className="cw-typing-av" style={{background: convModel.color+'1a', border:`1px solid ${convModel.color}35`}}>
              <span className="mb-badge" style={{color: convModel.color}}>{convModel.badge}</span>
            </div>
            <div className="cw-dots"><span/><span/><span/></div>
          </div>
        )}
        <div ref={bottomRef}/>
      </div>

      {/* Input */}
      <div className="cw-input-area">
        <div className="cw-input-box">
          <textarea
            ref={textareaRef}
            className="cw-ta"
            rows={1}
            placeholder={`Message ${convModel.name}…`}
            value={input}
            onChange={e => setInput(e.target.value)}
            onKeyDown={onKey}
          />
          <button
            className={`cw-send${input.trim() ? ' on' : ''}`}
            onClick={() => doSend()}
            disabled={!input.trim() || busy}
          >
            <Send size={14}/>
          </button>
        </div>
        <p className="cw-hint">Enter to send · Shift+Enter for new line · Hover AI messages to copy</p>
      </div>
    </div>
  );
}
