import React, { useState, useEffect, useRef } from 'react';
import { useAuth } from '../../context/AuthContext';
import { getSocket, joinRoom, leaveRoom, sendChatMessage, sendTyping } from '../../services/socket';
import { chatAPI } from '../../services/api';

const ChatBox = ({ room, roomType = 'global', height = '400px' }) => {
  const { user } = useAuth();
  const [messages, setMessages] = useState([]);
  const [input, setInput] = useState('');
  const [typingUsers, setTypingUsers] = useState([]);
  const [viewerCount, setViewerCount] = useState(0);
  const bottomRef = useRef(null);
  const typingTimer = useRef(null);

  useEffect(() => {
    // Load history
    if (user) {
      chatAPI.getMessages(room, { limit: 50 }).then(({ data }) => {
        setMessages(data.messages || []);
      }).catch(() => {});
    }

    joinRoom(room, roomType);
    const socket = getSocket();
    if (!socket) return;

    const onMessage = (msg) => setMessages(prev => [...prev, msg]);
    const onDeleted = ({ messageId }) => setMessages(prev => prev.filter(m => m._id !== messageId));
    const onTyping = ({ username, isTyping }) => {
      setTypingUsers(prev => isTyping
        ? [...prev.filter(u => u !== username), username]
        : prev.filter(u => u !== username)
      );
    };
    const onViewerCount = ({ count }) => setViewerCount(count);
    const onUserCount = ({ count }) => setViewerCount(count);

    socket.on('chat:message', onMessage);
    socket.on('chat:deleted', onDeleted);
    socket.on('chat:typing', onTyping);
    socket.on('stream:viewer_count', onViewerCount);
    socket.on('room:user_count', onUserCount);

    return () => {
      leaveRoom(room);
      socket.off('chat:message', onMessage);
      socket.off('chat:deleted', onDeleted);
      socket.off('chat:typing', onTyping);
      socket.off('stream:viewer_count', onViewerCount);
      socket.off('room:user_count', onUserCount);
    };
  }, [room, roomType, user]);

  useEffect(() => {
    bottomRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages]);

  const handleSend = (e) => {
    e.preventDefault();
    if (!input.trim() || !user) return;
    sendChatMessage(room, input.trim(), roomType);
    setInput('');
    sendTyping(room, false);
  };

  const handleTyping = (e) => {
    setInput(e.target.value);
    if (!user) return;
    sendTyping(room, true);
    clearTimeout(typingTimer.current);
    typingTimer.current = setTimeout(() => sendTyping(room, false), 1500);
  };

  const msgColor = (role) => {
    if (role === 'admin') return 'var(--accent)';
    if (role === 'creator') return 'var(--accent2)';
    return 'var(--text-primary)';
  };

  return (
    <div className="chat-box" style={{ display: 'flex', flexDirection: 'column', height, background: 'var(--bg-card)', border: '1px solid var(--border)', borderRadius: 'var(--radius-lg)', overflow: 'hidden' }}>
      <div className="chat-header" style={{ padding: '12px 16px', borderBottom: '1px solid var(--border)', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
        <span style={{ fontFamily: 'var(--font-display)', fontWeight: 700, fontSize: '0.875rem' }}>
          {roomType === 'stream' ? '🔴 Stream Chat' : '💬 Global Chat'}
        </span>
        {viewerCount > 0 && <span style={{ fontSize: '0.75rem', color: 'var(--text-muted)' }}>👁 {viewerCount}</span>}
      </div>

      <div className="chat-messages" style={{ flex: 1, overflowY: 'auto', padding: '12px 16px', display: 'flex', flexDirection: 'column', gap: '8px' }}>
        {messages.map((msg, i) => (
          <div key={msg._id || i} style={{ display: 'flex', gap: '8px', alignItems: 'flex-start' }}>
            {msg.messageType === 'system' ? (
              <p style={{ color: 'var(--text-muted)', fontSize: '0.75rem', fontStyle: 'italic', width: '100%', textAlign: 'center' }}>{msg.message}</p>
            ) : (
              <>
                <img src={msg.sender?.avatar?.url || 'https://via.placeholder.com/24'} alt="" className="avatar avatar-xs" />
                <div>
                  <span style={{ fontWeight: 700, fontSize: '0.8rem', color: msgColor(msg.sender?.role), marginRight: '6px' }}>
                    {msg.sender?.username}
                  </span>
                  <span style={{ fontSize: '0.875rem', color: 'var(--text-secondary)' }}>{msg.message}</span>
                </div>
              </>
            )}
          </div>
        ))}
        {typingUsers.length > 0 && (
          <p style={{ color: 'var(--text-muted)', fontSize: '0.75rem', fontStyle: 'italic' }}>
            {typingUsers.join(', ')} {typingUsers.length === 1 ? 'is' : 'are'} typing…
          </p>
        )}
        <div ref={bottomRef} />
      </div>

      {user ? (
        <form onSubmit={handleSend} style={{ padding: '12px', borderTop: '1px solid var(--border)', display: 'flex', gap: '8px' }}>
          <input
            className="form-input"
            style={{ flex: 1, fontSize: '0.875rem', padding: '8px 12px' }}
            placeholder="Send a message..."
            value={input}
            onChange={handleTyping}
            maxLength={500}
          />
          <button type="submit" className="btn btn-primary btn-sm" disabled={!input.trim()}>Send</button>
        </form>
      ) : (
        <p style={{ padding: '12px', textAlign: 'center', color: 'var(--text-muted)', fontSize: '0.8rem', borderTop: '1px solid var(--border)' }}>
          <a href="/login" style={{ color: 'var(--accent)' }}>Sign in</a> to chat
        </p>
      )}
    </div>
  );
};

export default ChatBox;
