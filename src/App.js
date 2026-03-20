import React from 'react';
import { AuthProvider, useAuth } from './context/AuthContext';
import { ChatProvider } from './context/ChatContext';
import Login from './pages/Login';
import Sidebar from './components/Sidebar';
import ChatWindow from './components/ChatWindow';

function Inner() {
  const { user } = useAuth();
  if (!user) return <Login />;
  return (
    <ChatProvider>
      <div style={{ display: 'flex', height: '100vh', overflow: 'hidden' }}>
        <Sidebar />
        <ChatWindow />
      </div>
    </ChatProvider>
  );
}

export default function App() {
  return <AuthProvider><Inner /></AuthProvider>;
}
