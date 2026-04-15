import { useState } from 'react';
import { avatarClass, formatTime } from '../utils/helpers';
import UserItem from './UserItem';

export default function Sidebar({
  myId, myUsername,
  contacts,       
  allUsers,       
  selectedUser,
  unreadMap,
  onlineUsers,
  onSelectUser,
  onLogout,
  mobileShow,
}) {
  const [search, setSearch]       = useState('');
  const [showSearch, setShowSearch] = useState(false);

  const displayList = search.trim()
    ? allUsers.filter(u =>
        u.username.toLowerCase().includes(search.toLowerCase()) &&
        u.id !== myId
      )
    : contacts;

  function handleSelectUser(user) {
    setSearch('');
    setShowSearch(false);
    onSelectUser(user);
  }

  return (
    <div className={`sidebar${mobileShow ? ' mobile-show' : ''}`}>
      <div className="sidebar-header">
        <div className="sidebar-top">
          <div className="sidebar-logo">
            💬 PingMe
            <div className="sidebar-logo-dot" />
          </div>
        </div>

        <div className="sidebar-user-info">
          <div className={`sidebar-avatar ${avatarClass(myId)}`}>
            {myUsername?.[0]?.toUpperCase()}
          </div>
          <span className="sidebar-username">{myUsername}</span>
          <button className="logout-btn" title="Logout" onClick={onLogout}>⎋</button>
        </div>

        <div className="search-box">
          <span className="search-icon">🔍</span>
          <input
            className="search-input"
            placeholder="Search or start new chat…"
            value={search}
            onChange={e => { setSearch(e.target.value); setShowSearch(true); }}
            onFocus={() => setShowSearch(true)}
          />
          {search && (
            <button
              className="search-clear"
              onClick={() => { setSearch(''); setShowSearch(false); }}
            >✕</button>
          )}
        </div>
      </div>

      <div className="user-list">
        {!search && (
          <div className="users-label">
            {contacts.length === 0 ? 'No chats yet' : 'Chats'}
          </div>
        )}

        {!search && contacts.length === 0 && (
          <div className="no-users">
            <div style={{ fontSize: 32, marginBottom: 8 }}>💬</div>
            Search for someone above to start chatting
          </div>
        )}

        {search && (
          <div className="users-label">People</div>
        )}

        {displayList.length === 0 && search && (
          <div className="no-users">No users found</div>
        )}

        {displayList.map(u => (
          <UserItem
            key={u.id}
            user={u}
            isActive={selectedUser?.id === u.id}
            isOnline={onlineUsers.has(u.id)}
            lastMsg={u.lastMsg || null}
            lastTime={u.lastTime || null}
            unreadCount={unreadMap[u.id] || 0}
            onClick={() => handleSelectUser(u)}
          />
        ))}
      </div>
    </div>
  );
}
