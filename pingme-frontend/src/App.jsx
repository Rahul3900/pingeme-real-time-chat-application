import { useState, useCallback, useRef, useEffect, useMemo } from 'react';
import AuthScreen from './components/AuthScreen';
import Sidebar from './components/Sidebar';
import ChatArea from './components/ChatArea';
import { useWebSocket } from './hooks/useWebSocket';
import { useToast } from './hooks/useToast';
import { API } from './utils/helpers';

export default function App() {
  const [auth, setAuth] = useState(() => {
    try { return JSON.parse(sessionStorage.getItem('pingme_auth')); } catch { return null; }
  });
  const [showApp, setShowApp] = useState(!!auth);
  const [allUsers, setAllUsers] = useState([]);
  const [contacts, setContacts] = useState([]);
  
  const [selectedUser, setSelectedUser] = useState(() => {
    try { return JSON.parse(sessionStorage.getItem('pingme_selected')); } catch { return null; }
  });
  
  const [unreadMap, setUnreadMap]     = useState({});
  const [onlineUsers, setOnlineUsers] = useState(new Set());
  
  const [mobileSidebarOpen, setMobileSidebarOpen] = useState(
    !JSON.parse(sessionStorage.getItem('pingme_selected') || 'null')
  );

  const showToast     = useToast();
  const ws            = useWebSocket();
  const chatBridgeRef = useRef({});

  useEffect(() => {
    if (auth) {
      loadContacts(auth.token, auth.myId);
      connectWS(auth.token, auth.myId);
    }
  }, []);

  useEffect(() => {
    if (selectedUser && allUsers.length > 0) {
      const realUser = allUsers.find(u => u.id === selectedUser.id);
      if (realUser && realUser.username !== selectedUser.username) {
        setSelectedUser(realUser);
        sessionStorage.setItem('pingme_selected', JSON.stringify(realUser));
      }
    }
  }, [allUsers, selectedUser?.id]);

  const handleLogin = useCallback(({ token, myId, myUsername }) => {
    const authData = { token, myId, myUsername };
    setAuth(authData);
    sessionStorage.setItem('pingme_auth', JSON.stringify(authData));
    setShowApp(true);
    loadContacts(token, myId);
    connectWS(token, myId);
  }, []);

  async function loadContacts(token, myId) {
    try {
      const res    = await fetch(`${API}/auth/users`, { headers: { Authorization: `Bearer ${token}` } });
      const data   = await res.json();
      const others = data.filter(u => u.id !== myId);
      setAllUsers(others);

      const currentlyOnlineIds = others.filter(u => u.isOnline).map(u => u.id);
      setOnlineUsers(new Set(currentlyOnlineIds));

      const results = await Promise.allSettled(
        others.map(u => fetchContactInfo(token, myId, u.id))
      );

      const contactList = [];
      const newUnread   = {};

      results.forEach((r, i) => {
        const u = others[i];
        if (r.status === 'fulfilled') {
          const { unread, lastMsg, lastTime, hasHistory } = r.value;
          newUnread[u.id] = unread;
          if (hasHistory) {
            contactList.push({ ...u, lastMsg, lastTime: lastTime || 0 });
          }
        }
      });

      contactList.sort((a, b) => b.lastTime - a.lastTime);
      setContacts(contactList);
      setUnreadMap(newUnread);
    } catch {
      showToast('Could not load contacts', 'error');
    }
  }

  async function fetchContactInfo(token, myId, userId) {
    const [unreadRes, histRes] = await Promise.allSettled([
      fetch(`${API}/chat/unread/count?user1=${myId}&user2=${userId}`, { headers: { Authorization: `Bearer ${token}` } }),
      fetch(`${API}/chat/history?user1=${myId}&user2=${userId}&page=0&size=1`,  { headers: { Authorization: `Bearer ${token}` } }),
    ]);

    let unread = 0;
    if (unreadRes.status === 'fulfilled' && unreadRes.value.ok) {
      unread = await unreadRes.value.json();
    }

    let lastMsg = null, lastTime = 0, hasHistory = (unread > 0);
    if (histRes.status === 'fulfilled' && histRes.value.ok) {
      const d = await histRes.value.json();
      if (d.messages && d.messages.length > 0) {
        hasHistory       = true;
        const m          = d.messages[d.messages.length - 1];
        lastMsg          = m.content;
        const raw        = m.timestamp;
        lastTime         = raw
          ? new Date(Array.isArray(raw) ? new Date(...raw) : raw).getTime()
          : Date.now();
      }
    }
    return { unread, lastMsg, lastTime, hasHistory };
  }

  function connectWS(token, myId) {
    ws.connect(token, myId, {
      onMessage: msg => {
        const senderId = msg.senderId;
        const now      = Date.now();

        setTimeout(() => {
          fetch(`${API}/chat/delivered`, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json', Authorization: `Bearer ${token}` },
            body: JSON.stringify({ senderId: senderId, receiverId: myId })
          }).catch(() => {});
        }, 100);

        const isUnknown = !chatBridgeRef.current.getUserById?.(senderId);

        setContacts(prev => {
          const existing = prev.find(c => c.id === senderId);
          const base     = existing || chatBridgeRef.current.getUserById?.(senderId) || { id: senderId, username: `User ${senderId}` };
          const updated  = { ...base, lastMsg: msg.content, lastTime: now };
          return [updated, ...prev.filter(c => c.id !== senderId)];
        });

        if (chatBridgeRef.current.handleIncoming) {
          chatBridgeRef.current.handleIncoming(msg);
        }

        const selectedId = chatBridgeRef.current.selectedUserId;
        if (selectedId !== senderId) {
          setUnreadMap(prev => ({ ...prev, [senderId]: (prev[senderId] || 0) + 1 }));
          const username = chatBridgeRef.current.getUsernameById?.(senderId);
          showToast(`💬 ${username || `User ${senderId}`}: ${msg.content.slice(0, 40)}`, 'success');
        }

        if (isUnknown) {
          fetch(`${API}/auth/users`, { headers: { Authorization: `Bearer ${token}` } })
            .then(res => res.json())
            .then(data => {
              const others = data.filter(u => u.id !== myId);
              setAllUsers(others); 
              const realUser = others.find(u => u.id === senderId);
              if (realUser) {
                setContacts(prev => prev.map(c => c.id === senderId ? { ...c, username: realUser.username } : c));
              }
            }).catch(() => {});
        }
      },
      onStatus:   s => chatBridgeRef.current.handleStatusUpdate?.(s),
      onTyping:   d => chatBridgeRef.current.handleTypingEvent?.(d),
      onPresence: d => {
        setOnlineUsers(prev => {
          const s = new Set(prev);
          const uid = Number(d.userId); 
          d.status === 'ONLINE' ? s.add(uid) : s.delete(uid);
          return s;
        });
      },
      onConnected: () => {
        fetch(`${API}/auth/users`, { headers: { Authorization: `Bearer ${token}` } })
          .then(r => r.json())
          .then(data => {
            const others    = data.filter(u => u.id !== myId);
            const onlineIds = others.filter(u => u.isOnline).map(u => Number(u.id));
            setOnlineUsers(new Set(onlineIds));
          })
          .catch(() => {});
      },
    });
  }

  function selectUser(user) {
    setSelectedUser(user);
    sessionStorage.setItem('pingme_selected', JSON.stringify(user));
    setUnreadMap(prev => ({ ...prev, [user.id]: 0 }));
    setMobileSidebarOpen(false);
    chatBridgeRef.current.selectedUserId = user.id;
  }

  function onMessageSent(userId, content) {
    const now = Date.now();
    setContacts(prev => {
      const existing = prev.find(c => c.id === userId);
      const base     = existing || allUsers.find(u => u.id === userId) || { id: userId, username: `User ${userId}` };
      const updated  = { ...base, lastMsg: `You: ${content}`, lastTime: now };
      return [updated, ...prev.filter(c => c.id !== userId)];
    });
  }

  function logout() {
    ws.disconnect();
    setAuth(null);
    sessionStorage.removeItem('pingme_auth');
    sessionStorage.removeItem('pingme_selected');
    setShowApp(false);
    setAllUsers([]);
    setContacts([]);
    setSelectedUser(null);
    setUnreadMap({});
    setOnlineUsers(new Set());
    setMobileSidebarOpen(true);
    chatBridgeRef.current = {};
  }

  chatBridgeRef.current.getUsernameById = id => allUsers.find(u => u.id === id)?.username;
  chatBridgeRef.current.getUserById     = id => allUsers.find(u => u.id === id);

  const wsBridgeProps = useMemo(() => ({
    send: ws.send,
    isConnected: ws.isConnected,
    get handleIncoming()       { return chatBridgeRef.current.handleIncoming; },
    set handleIncoming(fn)     { chatBridgeRef.current.handleIncoming = fn; },
    get handleStatusUpdate()   { return chatBridgeRef.current.handleStatusUpdate; },
    set handleStatusUpdate(fn) { chatBridgeRef.current.handleStatusUpdate = fn; },
    get handleTypingEvent()    { return chatBridgeRef.current.handleTypingEvent; },
    set handleTypingEvent(fn)  { chatBridgeRef.current.handleTypingEvent = fn; },
  }), [ws.send, ws.isConnected]);

  return (
    <>
      <AuthScreen onLogin={handleLogin} hidden={showApp} />
      {showApp && auth && (
        <div className="app">
          <Sidebar
            myId={auth.myId}
            myUsername={auth.myUsername}
            contacts={contacts}
            allUsers={allUsers}
            selectedUser={selectedUser}
            unreadMap={unreadMap}
            onlineUsers={onlineUsers}
            onSelectUser={selectUser}
            onLogout={logout}
            mobileShow={mobileSidebarOpen}
          />
          <ChatArea
            myId={auth.myId}
            selectedUser={selectedUser}
            token={auth.token}
            wsRef={wsBridgeProps}
            isOnline={onlineUsers.has(selectedUser?.id)}
            onBack={() => setMobileSidebarOpen(true)}
            onMessageSent={onMessageSent}
          />
        </div>
      )}
    </>
  );
}