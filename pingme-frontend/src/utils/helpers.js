export const API = "http://localhost:8081";

const COLORS = ['av-0','av-1','av-2','av-3','av-4','av-5','av-6','av-7'];
export function avatarClass(id) {
  return COLORS[Math.abs(id || 0) % COLORS.length];
}

export function escHtml(s) {
  return String(s)
    .replace(/&/g,'&amp;').replace(/</g,'&lt;')
    .replace(/>/g,'&gt;').replace(/"/g,'&quot;');
}

export function formatTime(ts) {
  if (!ts) return '';
  try {
    let d;
    if (typeof ts === 'number') {
      d = new Date(ts);
    } else if (Array.isArray(ts)) {
      d = new Date(ts[0], ts[1] - 1, ts[2], ts[3] || 0, ts[4] || 0, ts[5] || 0);
    } else {
      d = new Date(ts);
    }
    if (isNaN(d)) return '';

    const now   = new Date();
    const diffMs = now - d;
    const diffD  = Math.floor(diffMs / 86400000);

    if (diffD === 0) {
      return d.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });
    } else if (diffD === 1) {
      return 'Yesterday';
    } else if (diffD < 7) {
      return d.toLocaleDateString([], { weekday: 'short' });
    } else {
      return d.toLocaleDateString([], { day: '2-digit', month: '2-digit' });
    }
  } catch {
    return '';
  }
}

export function parseJwtId(jwt) {
  try {
    const payload = JSON.parse(atob(jwt.split('.')[1]));
    return parseInt(payload.sub);
  } catch {
    return null;
  }
}
