import { useEffect, useRef, useState } from 'react';
import { Link } from 'react-router-dom';
import { useChat } from '../context/ChatContext';
import { useAuth } from '../context/AuthContext';
import PageHeader from '../components/PageHeader';
import { Avatar, AvatarFallback, AvatarImage } from '../components/ui/avatar';
import { Button } from '../components/ui/button';
import { Input } from '../components/ui/input';
import Badge from '../components/ui/badge';
import { ArrowLeft, Send, Wifi, WifiOff } from 'lucide-react';

function ConversationListItem({ conversation, active, onSelect }) {
  const { otherUser, lastMessage, unreadCount } = conversation;
  const preview = lastMessage?.text || 'Start a conversation';
  const time = lastMessage
    ? new Date(lastMessage.createdAt).toLocaleTimeString(undefined, { hour: '2-digit', minute: '2-digit' })
    : '';

  return (
    <button
      type="button"
      onClick={() => onSelect(conversation.id)}
      className={`w-full flex items-center gap-3 px-4 py-3 text-left transition-colors border-b hover:bg-secondary/40 ${
        active ? 'bg-secondary/60' : ''
      }`}
    >
      <Avatar className="h-11 w-11 shrink-0">
        <AvatarImage src={otherUser?.profilePicture} alt={otherUser?.name} />
        <AvatarFallback>{otherUser?.name?.[0]?.toUpperCase() || '?'}</AvatarFallback>
      </Avatar>
      <div className="flex-1 min-w-0">
        <div className="flex items-center justify-between gap-2">
          <span className="font-semibold text-sm truncate">{otherUser?.name}</span>
          <span className="text-[11px] text-muted-foreground shrink-0">{time}</span>
        </div>
        <div className="flex items-center justify-between gap-2 mt-0.5">
          <p className="text-sm text-muted-foreground truncate">{preview}</p>
          {unreadCount > 0 && <Badge variant="destructive">{unreadCount}</Badge>}
        </div>
      </div>
    </button>
  );
}

function ChatPanel({ conversationId, onBack }) {
  const { user } = useAuth();
  const {
    conversationList,
    messagesByConversation,
    typingUsers,
    sendMessage,
    emitTypingStart,
    emitTypingStop,
    openConversation,
    currentUserId,
  } = useChat();
  const [text, setText] = useState('');
  const [typingTimeout, setTypingTimeout] = useState(null);
  const bottomRef = useRef(null);

  const conversation = conversationList.find((c) => c.id === conversationId);
  const messages = messagesByConversation[conversationId] || [];
  const typingUser = typingUsers[conversationId];

  useEffect(() => {
    if (conversationId) openConversation(conversationId);
  }, [conversationId, openConversation]);

  useEffect(() => {
    bottomRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages, typingUser]);

  function handleChange(value) {
    setText(value);
    emitTypingStart(conversationId);
    if (typingTimeout) clearTimeout(typingTimeout);
    setTypingTimeout(
      setTimeout(() => emitTypingStop(conversationId), 1200),
    );
  }

  function handleSubmit(e) {
    e.preventDefault();
    if (!text.trim()) return;
    sendMessage(conversationId, text);
    emitTypingStop(conversationId);
    setText('');
  }

  if (!conversation) {
    return (
      <div className="flex-1 flex items-center justify-center text-muted-foreground p-8 text-center">
        Select a conversation to start chatting.
      </div>
    );
  }

  return (
    <div className="flex flex-col flex-1 min-h-0">
      <div className="flex items-center gap-3 px-4 py-3 border-b bg-background/90 backdrop-blur-md">
        {onBack && (
          <Button variant="ghost" size="icon" className="rounded-full md:hidden" onClick={onBack}>
            <ArrowLeft className="h-5 w-5" />
          </Button>
        )}
        <Avatar className="h-9 w-9">
          <AvatarImage src={conversation.otherUser?.profilePicture} alt={conversation.otherUser?.name} />
          <AvatarFallback>{conversation.otherUser?.name?.[0]?.toUpperCase()}</AvatarFallback>
        </Avatar>
        <div className="min-w-0">
          <p className="font-semibold truncate">{conversation.otherUser?.name}</p>
          <p className="text-xs text-muted-foreground truncate">@{conversation.otherUser?.username}</p>
        </div>
        <Link to={`/users/${conversation.otherUser?.id}`} className="ml-auto text-xs text-muted-foreground hover:underline">
          View profile
        </Link>
      </div>

      <div className="flex-1 overflow-y-auto px-4 py-4 space-y-3">
        {messages.length === 0 && (
          <p className="text-center text-sm text-muted-foreground py-8">
            Say hello to {conversation.otherUser?.name}!
          </p>
        )}
        {messages.map((message) => {
          const isMine = message.senderId === currentUserId || message.sender?.id === user?.id;
          return (
            <div key={message.id} className={`flex ${isMine ? 'justify-end' : 'justify-start'}`}>
              <div
                className={`max-w-[80%] rounded-2xl px-4 py-2 text-sm leading-relaxed ${
                  isMine
                    ? 'bg-foreground text-background rounded-br-md'
                    : 'bg-secondary text-secondary-foreground rounded-bl-md'
                }`}
              >
                <p>{message.text}</p>
                <p className={`text-[10px] mt-1 ${isMine ? 'text-background/70' : 'text-muted-foreground'}`}>
                  {new Date(message.createdAt).toLocaleTimeString(undefined, { hour: '2-digit', minute: '2-digit' })}
                </p>
              </div>
            </div>
          );
        })}
        {typingUser && (
          <p className="text-xs text-muted-foreground animate-pulse">{typingUser.name} is typing…</p>
        )}
        <div ref={bottomRef} />
      </div>

      <form onSubmit={handleSubmit} className="border-t p-3 flex items-center gap-2 bg-background">
        <Input
          value={text}
          onChange={(e) => handleChange(e.target.value)}
          placeholder="Write a message…"
          className="rounded-full"
        />
        <Button type="submit" size="icon" className="rounded-full shrink-0" disabled={!text.trim()}>
          <Send className="h-4 w-4" />
        </Button>
      </form>
    </div>
  );
}

export default function MessagesPage() {
  const { conversationList, activeConversationId, setActiveConversationId, connected } = useChat();
  const [mobileShowChat, setMobileShowChat] = useState(false);

  function handleSelect(id) {
    setActiveConversationId(id);
    setMobileShowChat(true);
  }

  return (
    <div className="flex flex-col min-h-screen">
      <PageHeader
        title="Messages"
        subtitle={connected ? 'Real-time chat with people you follow' : 'Connecting…'}
      >
        {connected ? (
          <Wifi className="h-4 w-4 text-muted-foreground" />
        ) : (
          <WifiOff className="h-4 w-4 text-muted-foreground" />
        )}
      </PageHeader>

      <div className="flex flex-1 min-h-0">
        <aside
          className={`w-full md:w-[320px] md:border-r flex flex-col min-h-0 ${
            mobileShowChat ? 'hidden md:flex' : 'flex'
          }`}
        >
          {conversationList.length === 0 ? (
            <div className="p-8 text-center text-muted-foreground text-sm">
              No conversations yet. Message someone from their profile.
            </div>
          ) : (
            conversationList.map((conversation) => (
              <ConversationListItem
                key={conversation.id}
                conversation={conversation}
                active={conversation.id === activeConversationId}
                onSelect={handleSelect}
              />
            ))
          )}
        </aside>

        <section
          className={`flex-1 flex flex-col min-h-0 ${
            mobileShowChat ? 'flex' : 'hidden md:flex'
          }`}
        >
          {activeConversationId ? (
            <ChatPanel
              conversationId={activeConversationId}
              onBack={() => setMobileShowChat(false)}
            />
          ) : (
            <div className="flex-1 hidden md:flex items-center justify-center text-muted-foreground p-8 text-center">
              Pick a conversation from the list, or start one from a user profile.
            </div>
          )}
        </section>
      </div>
    </div>
  );
}
