import { avatarClass, formatTime } from '../utils/helpers';

export default function MessageBubble({ senderId, myId, content, status, timestamp, senderUsername }) {
  const isSent = senderId === myId;
  const timeStr = formatTime(timestamp);

  let statusIcon = null;
  if (isSent) {
    if (status === 'SEEN') {
      statusIcon = <span className="msg-status seen">✓✓</span>;
    } else if (status === 'DELIVERED') {
      statusIcon = <span className="msg-status">✓✓</span>;
    } else {
      statusIcon = <span className="msg-status">✓</span>;
    }
  }

  if (!isSent) {
    const cls = avatarClass(senderId);
    const initials = senderUsername?.[0]?.toUpperCase() || '?';
    return (
      <div className="msg-row recv">
        <div className={`msg-avatar-small ${cls}`}>{initials}</div>
        <div className="msg-bubble">
          {content}
          <div className="msg-meta">
            <span className="msg-time">{timeStr}</span>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="msg-row sent">
      <div className="msg-bubble">
        {content}
        <div className="msg-meta">
          <span className="msg-time">{timeStr}</span>
          {statusIcon}
        </div>
      </div>
    </div>
  );
}
