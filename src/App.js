// 
import React, { useState } from 'react';
import { AuthProvider, useAuth } from './context/AuthContext';
import { ChatProvider } from './context/ChatContext';
import Login from './pages/Login';
import Sidebar from './components/Sidebar';
import ChatWindow from './components/ChatWindow';

function Inner() {
  const { user } = useAuth();
  const [sidebarOpen, setSidebarOpen] = useState(false);

  if (!user) return <Login />;

  return (
    <ChatProvider>
      <div style={{ display: 'flex', height: '100vh', overflow: 'hidden', position: 'relative' }}>
        {sidebarOpen && (
          <div
            onClick={() => setSidebarOpen(false)}
            style={{
              position: 'fixed', inset: 0,
              background: 'rgba(0,0,0,0.6)',
              zIndex: 40,
            }}
          />
        )}
        <Sidebar mobileOpen={sidebarOpen} onClose={() => setSidebarOpen(false)} />
        <ChatWindow onMenuClick={() => setSidebarOpen(true)} />
      </div>
    </ChatProvider>
  );
}

export default function App() {
  return <AuthProvider><Inner /></AuthProvider>;
}