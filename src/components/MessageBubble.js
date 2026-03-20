import React, { useState } from 'react';
import { getModel } from '../services/aiService';
import { Copy, Check, AlertTriangle } from 'lucide-react';
import './MessageBubble.css';

/* Very lightweight markdown renderer — no extra deps needed */
function renderContent(text) {
  // escape HTML first
  const esc = s => s.replace(/&/g,'&amp;').replace(/</g,'&lt;').replace(/>/g,'&gt;');

  // fenced code blocks
  let html = text.replace(/```(\w*)\n?([\s\S]*?)```/g, (_,lang,code) =>
    `<div class="cb-wrap"><div class="cb-lang">${lang||'code'}</div><pre class="cb-pre"><code>${esc(code.trim())}</code></pre></div>`
  );
  
  html = html.replace(/`([^`\n]+)`/g, '<code class="ic">$1</code>');
  
  html = html.replace(/\*\*([^*]+)\*\*/g, '<strong>$1</strong>');
  
  html = html.replace(/\*([^*\n]+)\*/g, '<em>$1</em>');
  
  html = html.replace(/\n/g, '<br/>');
  return html;
}

export default function MessageBubble({ message }) {
  const [copied, setCopied] = useState(false);
  const isUser  = message.role === 'user';
  const isError = message.role === 'error';
  const model   = getModel(message.modelId);

  const copy = () => {
    navigator.clipboard.writeText(message.content).catch(()=>{});
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  const time = new Date(message.ts).toLocaleTimeString([], { hour:'2-digit', minute:'2-digit' });

  return (
    <div className={`mb-row ${isUser ? 'user' : 'ai'}`}>
      <div className="mb-inner">
        {/* AI avatar */}
        {!isUser && (
          <div className="mb-av ai-av"
            style={{ background: model.color + '1a', border: `1px solid ${model.color}35` }}>
            <span className="mb-badge" style={{ color: model.color }}>{model.badge}</span>
          </div>
        )}

        {/* Bubble */}
        <div className={`mb-bubble ${isUser ? 'ub' : 'ab'} ${isError ? 'eb' : ''}`}>
          {!isUser && !isError && (
            <div className="mb-model" style={{ color: model.color }}>{model.name}</div>
          )}
          {isError && (
            <div className="mb-errhead"><AlertTriangle size={13}/> Error</div>
          )}
          <div className="mb-text"
            dangerouslySetInnerHTML={{ __html: renderContent(message.content) }}
          />
          <div className="mb-foot">
            <span className="mb-time">{time}</span>
            {!isUser && (
              <button className="mb-copy" onClick={copy}>
                {copied ? <Check size={11}/> : <Copy size={11}/>}
              </button>
            )}
          </div>
        </div>

        {/* User avatar */}
        {isUser && (
          <div className="mb-av user-av">U</div>
        )}
      </div>
    </div>
  );
}
