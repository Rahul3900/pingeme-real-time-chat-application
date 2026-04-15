import { avatarClass } from '../utils/helpers';

export default function TypingIndicator({ show, user }) {
  if (!show || !user) return null;

  const cls = avatarClass(user.id);
  const initials = user.username?.[0]?.toUpperCase() || '?';

  return (
    <div className="typing-indicator-wrap">
      <div className="typing-indicator">
        <div className={`msg-avatar-small ${cls}`}>{initials}</div>
        <div className="typing-dots">
          <div className="typing-dot" />
          <div className="typing-dot" />
          <div className="typing-dot" />
        </div>
      </div>
    </div>
  );
}
