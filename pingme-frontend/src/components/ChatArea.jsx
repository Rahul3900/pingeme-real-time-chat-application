import { useState, useRef, useEffect, useCallback } from 'react';
import { avatarClass, API } from '../utils/helpers';
import MessageBubble from './MessageBubble';
import TypingIndicator from './TypingIndicator';

export default function ChatArea({
  myId,
  selectedUser,
  token,
  wsRef,
  isOnline,
  onBack,
  onMessageSent,
}) {
  const [messages,     setMessages]     = useState([]);
  const [msgLoading,   setMsgLoading]   = useState(false);
  const [isTyping,     setIsTyping]     = useState(false);
  const [currentPage,  setCurrentPage]  = useState(0);
  const [totalPages,   setTotalPages]   = useState(0);
  const [loadingMore,  setLoadingMore]  = useState(false);
  const [showFab,      setShowFab]      = useState(false);
  const [inputValue,   setInputValue]   = useState('');

  const messagesWrapRef    = useRef(null);
  const typingTimerRef     = useRef(null);
  const isTypingNowRef     = useRef(false);
  const textareaRef        = useRef(null);
  const selectedUserRef    = useRef(selectedUser);

  useEffect(() => { selectedUserRef.current = selectedUser; }, [selectedUser]);

  useEffect(() => {
    if (wsRef) {
      wsRef.handleIncoming    = handleIncomingMessage;
      wsRef.handleStatusUpdate = handleStatusUpdate;
      wsRef.handleTypingEvent  = handleTypingEvent;
    }
  });

  useEffect(() => {
    if (!selectedUser) return;
    setMessages([]);
    setIsTyping(false);
    setCurrentPage(0);
    setTotalPages(0);
    setInputValue('');
    if (textareaRef.current) textareaRef.current.style.height = '';
    
    loadHistory(0, true);
    
    setTimeout(() => textareaRef.current?.focus(), 100);

    fetch(`${API}/chat/seen`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json', Authorization: `Bearer ${token}` },
      body: JSON.stringify({ senderId: selectedUser.id, receiverId: myId })
    }).catch(() => {});
    
  }, [selectedUser?.id]);

  const loadHistory = useCallback(
    async (page, initial = false) => {
      if (!selectedUser) return;
      if (initial) setMsgLoading(true);
      else setLoadingMore(true);

      try {
        const res  = await fetch(
          `${API}/chat/history?user1=${myId}&user2=${selectedUser.id}&page=${page}&size=30`,
          { headers: { Authorization: `Bearer ${token}` } }
        );
        const data = await res.json();
        setTotalPages(data.totalPages);

        const msgs = [...data.messages].reverse().map((m, i) => ({
          id:        `hist-${page}-${i}`,
          senderId:  m.senderId,
          content:   m.content,
          status:    m.status || 'SENT',
          timestamp: m.timestamp,
        }));

        if (initial) {
          setMessages(msgs);
          setTimeout(() => scrollToBottom(true), 50);
        } else {
          setMessages(prev => [...msgs, ...prev]);
        }
      } catch {  } finally {
        setMsgLoading(false);
        setLoadingMore(false);
      }
    },
    [selectedUser, myId, token]
  );

  function handleIncomingMessage(msg) {
    if (selectedUserRef.current?.id !== msg.senderId) return;
    
    appendMessage(msg.senderId, msg.content, 'SEEN', new Date().toISOString());
    scrollToBottom();
    
    fetch(`${API}/chat/seen`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json', Authorization: `Bearer ${token}` },
      body: JSON.stringify({ senderId: msg.senderId, receiverId: myId })
    }).catch(() => {});
  }

  function handleStatusUpdate(status) {
    setTimeout(() => {
      setMessages(prev => {
        return prev.map(m => {
          if (m.senderId === myId && m.status === 'SENT' && status === 'DELIVERED') {
            return { ...m, status };
          }
          if (m.senderId === myId && status === 'SEEN') {
            return { ...m, status };
          }
          return m;
        });
      });
    }, 150);
  }

  function handleTypingEvent(data) {
    if (selectedUserRef.current?.id !== data.senderId) return;
    setIsTyping(data.typing);
    if (data.typing) scrollToBottom();
  }

  function appendMessage(senderId, content, status, timestamp) {
    setMessages(prev => [
      ...prev,
      { id: `msg-${Date.now()}-${Math.random()}`, senderId, content, status, timestamp },
    ]);
  }

  function sendMessage() {
    const content = inputValue.trim();
    if (!content || !selectedUser || !wsRef?.isConnected()) return;

    wsRef.send('/app/sendMessage', { receiverId: selectedUser.id, content });
    appendMessage(myId, content, 'SENT', new Date().toISOString());
    onMessageSent?.(selectedUser.id, content);
    scrollToBottom();

    setInputValue('');
    if (textareaRef.current) textareaRef.current.style.height = '';

    if (isTypingNowRef.current) {
      isTypingNowRef.current = false;
      wsRef.send('/app/typing', { receiverId: selectedUser.id, typing: false });
    }
  }

  function handleInputChange(e) {
    setInputValue(e.target.value);
    const ta = e.target;
    ta.style.height = 'auto';
    ta.style.height = Math.min(ta.scrollHeight, 120) + 'px';

    if (!selectedUser || !wsRef?.isConnected()) return;
    if (!isTypingNowRef.current) {
      isTypingNowRef.current = true;
      wsRef.send('/app/typing', { receiverId: selectedUser.id, typing: true });
    }
    clearTimeout(typingTimerRef.current);
    typingTimerRef.current = setTimeout(() => {
      isTypingNowRef.current = false;
      wsRef.send('/app/typing', { receiverId: selectedUser.id, typing: false });
    }, 2000);
  }

  function handleKeyDown(e) {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      sendMessage();
    }
  }

  function scrollToBottom(instant = false) {
    const wrap = messagesWrapRef.current;
    if (!wrap) return;
    wrap.scrollTo({ top: wrap.scrollHeight, behavior: instant ? 'instant' : 'smooth' });
  }

  function handleScroll() {
    const wrap = messagesWrapRef.current;
    if (!wrap) return;
    setShowFab(wrap.scrollHeight - wrap.scrollTop - wrap.clientHeight > 200);
  }

  function loadMore() {
    const next = currentPage + 1;
    setCurrentPage(next);
    loadHistory(next, false);
  }

  if (!selectedUser) {
    return (
      <div className="chat-area">
        <div className="chat-empty">
          <div className="chat-empty-icon">💬</div>
          <h3>Start a Conversation</h3>
          <p>Search for someone to begin chatting</p>
        </div>
      </div>
    );
  }

  const cls      = avatarClass(selectedUser.id);
  const initials = selectedUser.username?.[0]?.toUpperCase() || '?';

  return (
    <div className="chat-area">
      <div className="active-chat">
        {/* Header */}
        <div className="chat-header">
          <button className="back-btn" onClick={onBack}>←</button>
          <div className={`chat-header-avatar ${cls}`}>
            {initials}
            {isOnline && <div className="chat-header-online-dot" />}
          </div>
          <div>
            <div className="chat-header-name">{selectedUser.username}</div>
            <div className={`chat-header-status${isOnline ? ' online' : ''}`}>
              {isOnline ? '● online' : 'offline'}
            </div>
          </div>
        </div>

        {/* Messages */}
        <div className="messages-wrap" ref={messagesWrapRef} onScroll={handleScroll}>
          {msgLoading && (
            <div className="msg-loading">
              <div className="spinner" /> Loading messages…
            </div>
          )}

          {!msgLoading && currentPage < totalPages - 1 && (
            <button className="load-more-btn" onClick={loadMore} disabled={loadingMore}>
              {loadingMore ? '…' : '↑ Load earlier messages'}
            </button>
          )}

          {!msgLoading && messages.length === 0 && (
            <div className="date-divider">No messages yet — say hello! 👋</div>
          )}

          {messages.map(m => (
            <MessageBubble
              key={m.id}
              senderId={m.senderId}
              myId={myId}
              content={m.content}
              status={m.status}
              timestamp={m.timestamp}
              senderUsername={selectedUser.username}
            />
          ))}
        </div>

        <TypingIndicator show={isTyping} user={selectedUser} />

        {/* Input */}
        <div className="chat-input-area">
          <div className="chat-input-row">
            <textarea
              ref={textareaRef}
              className="msg-input"
              placeholder="Type a message…"
              rows={1}
              value={inputValue}
              onChange={handleInputChange}
              onKeyDown={handleKeyDown}
            />
            <button
              className="send-btn"
              onClick={sendMessage}
              disabled={!inputValue.trim()}
              title="Send"
            >
              ➤
            </button>
          </div>
        </div>
      </div>

      <div
        className={`scroll-fab${showFab ? ' show' : ''}`}
        onClick={() => scrollToBottom()}
      >↓</div>
    </div>
  );
}