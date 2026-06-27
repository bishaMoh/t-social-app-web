import { createContext, useCallback, useContext, useEffect, useRef, useState } from 'react';
import { io } from 'socket.io-client';
import { conversations as conversationsApi, SOCKET_URL } from '../api/client';
import { useAuth } from './AuthContext';

const ChatContext = createContext(null);

export function ChatProvider({ children }) {
  const { isAuthenticated, user } = useAuth();
  const [conversationList, setConversationList] = useState([]);
  const [unreadCount, setUnreadCount] = useState(0);
  const [activeConversationId, setActiveConversationId] = useState(null);
  const [messagesByConversation, setMessagesByConversation] = useState({});
  const [typingUsers, setTypingUsers] = useState({});
  const [connected, setConnected] = useState(false);
  const socketRef = useRef(null);

  const refreshConversations = useCallback(async () => {
    if (!isAuthenticated) return;
    const data = await conversationsApi.list();
    setConversationList(data);
  }, [isAuthenticated]);

  const refreshUnreadCount = useCallback(async () => {
    if (!isAuthenticated) return;
    const data = await conversationsApi.unreadCount();
    setUnreadCount(data.count);
  }, [isAuthenticated]);

  useEffect(() => {
    if (!isAuthenticated) {
      setConversationList([]);
      setUnreadCount(0);
      setMessagesByConversation({});
      setActiveConversationId(null);
      socketRef.current?.disconnect();
      socketRef.current = null;
      setConnected(false);
      return;
    }

    refreshConversations();
    refreshUnreadCount();

    const token = localStorage.getItem('token');
    const socket = io(SOCKET_URL, {
      auth: { token },
      transports: ['websocket', 'polling'],
    });

    socketRef.current = socket;

    socket.on('connect', () => setConnected(true));
    socket.on('disconnect', () => setConnected(false));

    socket.on('message:new', ({ conversationId, message }) => {
      setMessagesByConversation((prev) => ({
        ...prev,
        [conversationId]: [...(prev[conversationId] || []), message],
      }));
      refreshConversations();
      refreshUnreadCount();
    });

    socket.on('conversation:updated', () => {
      refreshConversations();
      refreshUnreadCount();
    });

    socket.on('typing:start', ({ conversationId, user: typingUser }) => {
      setTypingUsers((prev) => ({
        ...prev,
        [conversationId]: typingUser,
      }));
    });

    socket.on('typing:stop', ({ conversationId }) => {
      setTypingUsers((prev) => {
        const next = { ...prev };
        delete next[conversationId];
        return next;
      });
    });

    return () => {
      socket.disconnect();
      socketRef.current = null;
    };
  }, [isAuthenticated, refreshConversations, refreshUnreadCount]);

  async function openConversation(conversationId) {
    setActiveConversationId(conversationId);
    socketRef.current?.emit('conversation:join', { conversationId });

    if (!messagesByConversation[conversationId]) {
      const messages = await conversationsApi.messages(conversationId);
      setMessagesByConversation((prev) => ({ ...prev, [conversationId]: messages }));
    }

    await conversationsApi.markRead(conversationId);
    socketRef.current?.emit('conversation:read', { conversationId });
    refreshConversations();
    refreshUnreadCount();
  }

  async function startConversationWith(userId) {
    const conversation = await conversationsApi.start(userId);
    setConversationList((prev) => {
      const exists = prev.some((c) => c.id === conversation.id);
      return exists ? prev : [conversation, ...prev];
    });
    setActiveConversationId(conversation.id);
    socketRef.current?.emit('conversation:join', { conversationId: conversation.id });
    if (!messagesByConversation[conversation.id]) {
      setMessagesByConversation((prev) => ({ ...prev, [conversation.id]: [] }));
    }
    return conversation;
  }

  function sendMessage(conversationId, text) {
    if (!text.trim()) return;
    socketRef.current?.emit('message:send', { conversationId, text: text.trim() });
  }

  function emitTypingStart(conversationId) {
    socketRef.current?.emit('typing:start', { conversationId });
  }

  function emitTypingStop(conversationId) {
    socketRef.current?.emit('typing:stop', { conversationId });
  }

  return (
    <ChatContext.Provider
      value={{
        conversationList,
        unreadCount,
        activeConversationId,
        setActiveConversationId,
        messagesByConversation,
        typingUsers,
        connected,
        openConversation,
        startConversationWith,
        sendMessage,
        emitTypingStart,
        emitTypingStop,
        refreshConversations,
        currentUserId: user?.id,
      }}
    >
      {children}
    </ChatContext.Provider>
  );
}

export function useChat() {
  const context = useContext(ChatContext);
  if (!context) {
    throw new Error('useChat must be used within ChatProvider');
  }
  return context;
}
