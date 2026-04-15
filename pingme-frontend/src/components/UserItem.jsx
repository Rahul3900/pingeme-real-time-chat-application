import { avatarClass, formatTime } from '../utils/helpers';

export default function UserItem({ user, isActive, isOnline, lastMsg, lastTime, unreadCount, onClick }) {
  const cls       = avatarClass(user.id);
  const initials  = user.username[0].toUpperCase();
  const showBadge = unreadCount > 0;
  const timeStr   = lastTime ? formatTime(lastTime) : '';

  return (
    <div className={`user-item${isActive ? ' active' : ''}`} onClick={onClick}>
      <div className="user-avatar-wrap">
        <div className={`user-avatar ${cls}`}>{initials}</div>
        {isOnline && <div className="online-dot" />}
      </div>

      <div className="user-info">
        <div className="user-item-top">
          <span className="user-name">{user.username}</span>
          {timeStr && <span className="user-time">{timeStr}</span>}
        </div>
        <div className="user-item-bottom">
          <span className={`user-preview${showBadge ? ' unread-text' : ''}`}>
            {lastMsg || 'Tap to chat'}
          </span>
          {showBadge && (
            <span className="unread-badge">
              {unreadCount > 99 ? '99+' : unreadCount}
            </span>
          )}
        </div>
      </div>
    </div>
  );
}
