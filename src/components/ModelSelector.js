import React, { useState } from 'react';
import { useChat } from '../context/ChatContext';
import { AI_MODELS, getModel } from '../services/aiService';
import { ChevronDown, Check } from 'lucide-react';
import './ModelSelector.css';

export default function ModelSelector({ onModelChange }) {
  const { modelId } = useChat();
  const [open, setOpen] = useState(false);
  const cur = getModel(modelId);

  const grouped = AI_MODELS.reduce((acc, m) => {
    (acc[m.provider] = acc[m.provider] || []).push(m);
    return acc;
  }, {});

  const handleSelect = (newModelId) => {
    setOpen(false);
    if (newModelId === modelId) return; // no-op if same model
    if (onModelChange) {
      // Let ChatWindow decide what to do (banner or direct switch)
      onModelChange(newModelId);
    }
  };

  return (
    <div className="ms-root" onClick={e => e.stopPropagation()}>
      <button className="ms-trigger" onClick={() => setOpen(v => !v)}>
        <span className="ms-dot" style={{ background: cur.color }}/>
        <span className="ms-name">{cur.name}</span>
        <ChevronDown size={12} className={`ms-chevron${open ? ' open' : ''}`}/>
      </button>

      {open && <>
        <div className="ms-overlay" onClick={() => setOpen(false)}/>
        <div className="ms-dropdown">
          {Object.entries(grouped).map(([provider, models]) => (
            <div key={provider} className="ms-group">
              <span className="ms-provider">{provider}</span>
              {models.map(m => (
                <button
                  key={m.id}
                  className={`ms-item${m.id === modelId ? ' sel' : ''}`}
                  onClick={() => handleSelect(m.id)}
                >
                  <span className="ms-dot" style={{ background: m.color }}/>
                  <span className="ms-iname">{m.name}</span>
                  {m.id === modelId && <Check size={12} className="ms-check"/>}
                </button>
              ))}
            </div>
          ))}
        </div>
      </>}
    </div>
  );
}
