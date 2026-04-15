package com.backend.pingme.ping_me.WebSocket;

import com.backend.pingme.ping_me.Repository.MessageRepository;
import com.backend.pingme.ping_me.Service.OnlineUserService;
import com.backend.pingme.ping_me.Util.JwtUtil;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.context.event.EventListener;
import org.springframework.messaging.simp.SimpMessagingTemplate;
import org.springframework.messaging.simp.stomp.StompHeaderAccessor;
import org.springframework.stereotype.Component;
import org.springframework.web.socket.messaging.SessionConnectEvent;
import org.springframework.web.socket.messaging.SessionDisconnectEvent;

import java.util.HashMap;
import java.util.List;
import java.util.Map;
import java.util.concurrent.ConcurrentHashMap;

@Component
public class WebSocketEventListener {

    @Autowired
    private OnlineUserService onlineUserService;

    @Autowired
    private JwtUtil jwtUtil;

    @Autowired
    private MessageRepository messageRepository;

    @Autowired
    private SimpMessagingTemplate messagingTemplate;

    private static final Map<String,String> map = new ConcurrentHashMap<>();

    @EventListener
    public void socketConnectEvent(SessionConnectEvent connectEvent){

        StompHeaderAccessor headerAccessor = StompHeaderAccessor.wrap(connectEvent.getMessage());
        String session = headerAccessor.getSessionId();

        if (headerAccessor.getUser() != null) {
            String userIdStr = headerAccessor.getUser().getName();
            Long userId = Long.parseLong(userIdStr);

            map.put(session, userIdStr);
            onlineUserService.setUserOnline(userId);

            List<Long> pendingSenderIds = messageRepository.findSendersOfPendingMessages(userId);

            messageRepository.markAllOfflineMessagesAsDelivered(userId);

            for (Long senderId : pendingSenderIds) {
                messagingTemplate.convertAndSend("/topic/status/" + senderId, "DELIVERED");
            }

            Map<String, Object> payload = new HashMap<>();
            payload.put("userId", userId);
            payload.put("status", "ONLINE");
            messagingTemplate.convertAndSend("/topic/public", payload);
        }
    }

    @EventListener
    public void socketDisconnectEvent(SessionDisconnectEvent disconnectEvent){

        StompHeaderAccessor stompHeaderAccessor = StompHeaderAccessor.wrap(disconnectEvent.getMessage());
        String session = stompHeaderAccessor.getSessionId();
        String userId = map.get(session);

        if(userId!=null) {
            Long id = Long.parseLong(userId);
            onlineUserService.setUserOffline(id);
            map.remove(session);

            Map<String, Object> payload = new HashMap<>();
            payload.put("userId", id);
            payload.put("status", "OFFLINE");
            messagingTemplate.convertAndSend("/topic/public", payload);
        }
    }
}