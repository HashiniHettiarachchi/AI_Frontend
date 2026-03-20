import React, { useState } from 'react';
import { useChat } from '../context/ChatContext';
import { useAuth } from '../context/AuthContext';
import { getModel } from '../services/aiService';
import { Plus, Search, MessageSquare, Pin, Trash2, ChevronDown, ChevronRight, LogOut } from 'lucide-react';
import './Sidebar.css';

export default function Sidebar() {
  const { chats, activeId, setActiveId, newChat, deleteChat, pinChat } = useChat();
  const { user, logout } = useAuth();
  const [search, setSearch]   = useState('');
  const [showPin, setShowPin] = useState(true);
  const [showRec, setShowRec] = useState(true);
  const [ctx, setCtx]         = useState(null); // { id, x, y }

  const q = search.toLowerCase();
  const all = chats.filter(c => c.title.toLowerCase().includes(q));
  const pinned = all.filter(c => c.pinned);
  const recent = all.filter(c => !c.pinned);

  const close = () => setCtx(null);

  return (
    <aside className="sidebar" onClick={close}>
      {/* Header */}
      <div className="sb-head">
        <div className="sb-brand">
          <span className="sb-title">Multiple AI</span>
        </div>
        <button className="sb-new" onClick={() => newChat()} title="New chat"><Plus size={15}/></button>
      </div>

      {/* Search */}
      <div className="sb-search">
        <Search size={13}/>
        <input placeholder="Search chats…" value={search} onChange={e => setSearch(e.target.value)}/>
      </div>

      {/* Lists */}
      <div className="sb-list">
        {pinned.length > 0 && (
          <Group label="PINNED" open={showPin} onToggle={() => setShowPin(v=>!v)}>
            {pinned.map(c => <ChatRow key={c.id} c={c} active={c.id===activeId}
              onSelect={() => setActiveId(c.id)} onCtx={e => { e.preventDefault(); setCtx({id:c.id,x:e.clientX,y:e.clientY}); }}/>)}
          </Group>
        )}
        <Group label="RECENT" open={showRec} onToggle={() => setShowRec(v=>!v)}>
          {recent.length === 0
            ? <p className="sb-empty">No conversations yet</p>
            : recent.map(c => <ChatRow key={c.id} c={c} active={c.id===activeId}
                onSelect={() => setActiveId(c.id)} onCtx={e => { e.preventDefault(); setCtx({id:c.id,x:e.clientX,y:e.clientY}); }}/>)}
        </Group>
      </div>

      {/* Footer */}
      <div className="sb-footer">
        <div className="sb-user">
          <div className="sb-avatar">{(user?.name||'U')[0].toUpperCase()}</div>
          <div className="sb-uinfo">
            <span className="sb-uname">{user?.name}</span>
            <span className="sb-uemail">{user?.email}</span>
          </div>
        </div>
        <button className="sb-logout" onClick={logout} title="Sign out"><LogOut size={14}/></button>
      </div>

      {/* Context menu */}
      {ctx && (
        <div className="ctx-menu" style={{top:ctx.y, left:ctx.x}} onClick={e=>e.stopPropagation()}>
          <button onClick={() => { pinChat(ctx.id); close(); }}><Pin size={12}/>Pin / Unpin</button>
          <button className="ctx-del" onClick={() => { deleteChat(ctx.id); close(); }}><Trash2 size={12}/>Delete</button>
        </div>
      )}
    </aside>
  );
}

function Group({ label, open, onToggle, children }) {
  return (
    <div className="sb-group">
      <button className="sb-glabel" onClick={onToggle}>
        {open ? <ChevronDown size={11}/> : <ChevronRight size={11}/>} {label}
      </button>
      {open && children}
    </div>
  );
}

function ChatRow({ c, active, onSelect, onCtx }) {
  const model = getModel(c.modelId);
  return (
    <button className={`sb-row ${active ? 'active' : ''}`} onClick={onSelect} onContextMenu={onCtx}>
      <MessageSquare size={13} className="sb-row-icon"/>
      <div className="sb-row-info">
        <span className="sb-row-title">{c.title}</span>
        <span className="sb-row-meta">{model?.name || 'AI'}</span>
      </div>
      {c.pinned && <Pin size={10} className="sb-row-pin"/>}
    </button>
  );
}
