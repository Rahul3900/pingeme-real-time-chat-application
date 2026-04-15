# ⚙️ PingMe — Backend

Spring Boot backend powering a real-time chat system with Kafka, Redis, and WebSockets.

---

## 🚀 Features

* JWT Authentication
* WebSocket messaging (STOMP)
* Kafka event-driven processing
* Redis-based presence tracking
* Rate limiting for login attempts
* Message status tracking (SENT / DELIVERED / SEEN)

---

## 🧠 Architecture

* Controller Layer → REST + WebSocket
* Service Layer → Business logic
* Repository Layer → DB access
* Kafka → Async message pipeline

---

## 🔐 Authentication

* JWT-based auth
* Filter: 
* Utility: 

---

## 💬 WebSocket

Configured in: 

* `/topic/messages/{userId}`
* `/topic/typing/{userId}`
* `/topic/status/{userId}`

---

## ⚡ Kafka Flow

* Producer → 
* Consumer → 

---

## 🟢 Redis Usage

* Online users → 
* Rate limiting → 

---

## 🗄️ Database

Entities:

* User → 
* Message → 
* ChatRoom → 

---

## ⚙️ Config

```properties id="props1"
server.port=8081
spring.datasource.url=jdbc:postgresql://localhost:5432/pingme_db
spring.redis.host=localhost
spring.kafka.bootstrap-servers=localhost:9092
```

---

## ▶️ Run

```bash id="cmd_b2"
./mvnw spring-boot:run
```

