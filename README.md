# 💬 PingMe — Real-Time Chat Application

<p align="center">
  <b>Scalable • Real-time • Event-driven Chat System</b>
</p>

<p align="center">
  <img src="https://img.shields.io/badge/Frontend-React-blue?style=for-the-badge" />
  <img src="https://img.shields.io/badge/Backend-SpringBoot-green?style=for-the-badge" />
  <img src="https://img.shields.io/badge/WebSocket-STOMP-orange?style=for-the-badge" />
  <img src="https://img.shields.io/badge/Kafka-Streaming-black?style=for-the-badge" />
  <img src="https://img.shields.io/badge/Redis-Caching-red?style=for-the-badge" />
</p>

---

## 🚀 Overview

PingMe is a **scalable, real-time chat system** built with **React + Spring Boot**, leveraging **WebSockets, Kafka, and Redis** for high-performance messaging and presence tracking.

It leverages:

* ⚡ WebSockets for instant communication
* 🔄 Kafka for asynchronous message processing
* 🟢 Redis for presence tracking & rate limiting
* 🔐 JWT for secure authentication

---

## 📸 Screenshots

### 🔐 Login & Chat

| Login                      | Chat                             |
| -------------------------- | -------------------------------- |
| ![](screenshots/login.png) | ![](screenshots/chat-window.png) |

---

### 📱 Mobile Views

| Chat                             | Login                             | Users                            |
| -------------------------------- | --------------------------------- | -------------------------------- |
| ![](screenshots/mobile-chat.png) | ![](screenshots/mobile-login.png) | ![](screenshots/mobile-user.png) |

---

## 🧠 System Design

### 🔷 Architecture

```mermaid
flowchart LR
    A[React Frontend] -->|REST + WebSocket| B[Spring Boot Backend]
    B --> C[Kafka Producer]
    C --> D[Kafka Topic]
    D --> E[Kafka Consumer]
    E --> F[Database - PostgreSQL]
    B --> G[Redis]
```

---

### 🔷 Message Flow

```mermaid
sequenceDiagram
    participant A as Sender
    participant B as Backend
    participant K as Kafka
    participant C as Consumer
    participant DB as Database
    participant R as Receiver

    A->>B: Send message
    B->>K: Publish event
    K->>C: Consume event
    C->>DB: Save message
    C->>R: Push via WebSocket
```

---

## ✨ Features

* 🔐 JWT Authentication
* 💬 Real-time messaging
* ✍️ Typing indicators
* 🟢 Online/offline presence
* 📩 Message delivery & seen status
* 🔔 Live notifications
* ⚡ Kafka-based event processing
* 🚀 Redis rate limiting

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
* Redis (Presence + Rate Limiting)
* JPA / Hibernate

---

## 📁 Project Structure

```
pingme/
│
├── pingme-frontend/
├── pingme-backend/
├── screenshots/
└── README.md
```

---

## ⚙️ Local Setup

### 1️⃣ Backend

```
cd pingme-backend
./mvnw spring-boot:run
```

---

### 2️⃣ Frontend

```
cd pingme-frontend
npm install
npm run dev
```

---

## 🔌 Configuration

### Frontend

```
API=http://localhost:8081
```

---

### Backend

```
server.port=8081
spring.datasource.url=jdbc:postgresql://localhost:5432/pingme_db
spring.redis.host=localhost
spring.kafka.bootstrap-servers=localhost:9092
```

---

## ⚡ Real-Time Flow

1. User sends message → WebSocket
2. Backend → Kafka Producer
3. Kafka Consumer stores message
4. Message pushed to receiver
5. Status updated (SENT → DELIVERED → SEEN)

---

## 🧠 Key Highlights

* Event-driven architecture (Kafka)
* Stateless authentication (JWT)
* Redis-based presence tracking
* Optimized DB queries

---

## 👨‍💻 Author

**Rahul Rautela**

