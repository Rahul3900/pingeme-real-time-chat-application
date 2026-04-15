# 💬 PingMe — Frontend

Modern real-time chat UI built with React, supporting WebSocket messaging, presence tracking, and responsive design.

---

## 🚀 Features

* Real-time chat
* Typing indicators
* Online/offline status
* Toast notifications
* Responsive UI

---

## 🧠 Architecture

* WebSocket logic → `useWebSocket` 
* Auth flow → `AuthScreen` 
* Main state → `App.jsx` 

---

## ⚙️ Setup

```bash id="cmd_f2"
npm install
npm run dev
```

---

## 🔌 Config

```js id="api1"
export const API = "http://localhost:8081";
```

File: 

---

## 🌐 WebSocket

```id="ws1"
VITE_WS_URL=ws://localhost:8081/chat
```

---

## 📁 Structure

```id="struct2"
components/
hooks/
utils/
```

