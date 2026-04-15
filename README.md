# 💬 PingMe — Real-Time Chat Application

PingMe is a **scalable, real-time chat system** built with **React + Spring Boot**, leveraging **WebSockets, Kafka, and Redis** for high-performance messaging and presence tracking.

---

## 🚀 Features

* 🔐 JWT-based Authentication
* 💬 Real-time messaging (WebSocket + STOMP)
* ⚡ Kafka-based async message processing
* 🟢 Online presence tracking (Redis)
* ✍️ Typing indicators
* 📩 Message delivery & seen status
* 🔔 Live notifications
* 🔍 Dynamic user discovery

---

## 🧠 Architecture

```id="arch_main"
Frontend (React + Vite)
        ↓
 REST + WebSocket (STOMP)
        ↓
Backend (Spring Boot)
        ↓
 Kafka (Message Queue)
        ↓
 Database (PostgreSQL)
        ↓
 Redis (Presence + Rate Limiting)
```

---

## 🏗️ Tech Stack

### Frontend

* React (Vite)
* WebSocket (STOMP)
* Custom Hooks

### Backend

* Spring Boot
* Spring Security (JWT) 
* Kafka (Producer + Consumer) 
* Redis (Online users + rate limiting) 
* JPA / Hibernate

---

## 📁 Structure

```id="struct1"
project/
│
├── frontend/
├── backend/
└── README.md
```

---

## ⚙️ Setup

### Backend

```bash id="cmd_b1"
cd backend
./mvnw spring-boot:run
```

---

### Frontend

```bash id="cmd_f1"
cd frontend
npm install
npm run dev
```

---

## 🔌 Endpoints

### Auth

* `POST /auth/register`
* `POST /auth/login`

Handled in: 

---

### Chat

* `GET /chat/history`
* `POST /chat/seen`
* `POST /chat/delivered`

Handled in: 

---

## ⚡ Real-Time Flow

1. User sends message → WebSocket
2. Backend → Kafka Producer
3. Kafka Consumer stores message 
4. Message pushed to receiver via WebSocket
5. Status updates (SENT → DELIVERED → SEEN)

---

## 🧠 Highlights

* Event-driven architecture (Kafka)
* Stateless auth (JWT)
* Real-time presence via Redis
* Optimized DB queries with indexing 

---

## 👨‍💻 Author

**Rahul Rautela**
