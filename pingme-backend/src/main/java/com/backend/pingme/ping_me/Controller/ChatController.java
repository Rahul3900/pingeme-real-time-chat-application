package com.backend.pingme.ping_me.Controller;

import com.backend.pingme.ping_me.DTO.ChatResponse;
import com.backend.pingme.ping_me.DTO.MessageDTO;
import com.backend.pingme.ping_me.Entity.ChatRoomEntity;
import com.backend.pingme.ping_me.Entity.MessageEntity;
import com.backend.pingme.ping_me.Repository.MessageRepository;
import com.backend.pingme.ping_me.Service.ChatService;
import com.backend.pingme.ping_me.Service.KafkaProducerService;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.PageRequest;
import org.springframework.http.ResponseEntity;
import org.springframework.messaging.handler.annotation.MessageMapping;
import org.springframework.messaging.simp.SimpMessagingTemplate;
import org.springframework.stereotype.Controller;
import org.springframework.web.bind.annotation.*;

import java.security.Principal;
import java.util.List;
import java.util.Map;

@Controller
public class ChatController {

    @Autowired
    private KafkaProducerService kafkaProducerService;

    @Autowired
    private ChatService chatService;

    @Autowired
    private MessageRepository messageRepository;

    @Autowired
    private SimpMessagingTemplate messagingTemplate;

    @MessageMapping("/sendMessage")
    public void sendMessage(MessageDTO messageDTO, Principal principal){
        Long senderId = Long.valueOf(principal.getName());

        ChatRoomEntity room = chatService.getOrCreateChatRoom(
                senderId,
                messageDTO.getReceiverId()
        );

        messageDTO.setSenderId(senderId);
        messageDTO.setChatId(room.getChatId());

        kafkaProducerService.sendMessage(messageDTO);
    }

    @GetMapping("/chat/history")
    @ResponseBody
    public ChatResponse getChatHistory(
            @RequestParam Long user1,
            @RequestParam Long user2,
            @RequestParam int page,
            @RequestParam int size){

        ChatRoomEntity room = chatService.getOrCreateChatRoom(user1, user2);

        Page<MessageEntity> messages = messageRepository.getChatHistory(
                room.getChatId(),
                PageRequest.of(page, size)
        );

        List<MessageDTO> dtoList = messages.getContent()
                .stream()
                .map(m -> new MessageDTO(
                        m.getSenderId(),
                        null,
                        room.getChatId(),
                        m.getContent(),
                        m.getStatus(),
                        m.getTimestamp()
                ))
                .toList();

        return new ChatResponse(dtoList, page, messages.getTotalPages());
    }

    @PostMapping("/chat/delivered")
    @ResponseBody
    public ResponseEntity<?> markDelivered(@RequestBody Map<String, Long> payload) {
        Long senderId = payload.get("senderId");
        Long receiverId = payload.get("receiverId");

        ChatRoomEntity room = chatService.getOrCreateChatRoom(senderId, receiverId);
        messageRepository.markMessagesAsDelivered(room.getChatId(), senderId);

        messagingTemplate.convertAndSend("/topic/status/" + senderId, "DELIVERED");
        return ResponseEntity.ok(Map.of("success", true));
    }

    @PostMapping("/chat/seen")
    @ResponseBody
    public ResponseEntity<?> markSeen(@RequestBody Map<String, Long> payload) {
        Long senderId = payload.get("senderId");
        Long receiverId = payload.get("receiverId");

        ChatRoomEntity room = chatService.getOrCreateChatRoom(senderId, receiverId);
        messageRepository.markMessagesAsSeen(room.getChatId(), senderId);

        messagingTemplate.convertAndSend("/topic/status/" + senderId, "SEEN");
        return ResponseEntity.ok(Map.of("success", true));
    }

    @GetMapping("/chat/unread")
    @ResponseBody
    public List<MessageEntity> getUnreadMessages(
            @RequestParam Long user1,
            @RequestParam Long user2){

        ChatRoomEntity room = chatService.getOrCreateChatRoom(user1, user2);

        return messageRepository.getUnreadMessages(room.getChatId(), user2);
    }

    @GetMapping("/chat/unread/count")
    @ResponseBody
    public Long countUnread(
            @RequestParam Long user1,
            @RequestParam Long user2){

        ChatRoomEntity room = chatService.getOrCreateChatRoom(user1, user2);

        return messageRepository.countUnreadMessages(room.getChatId(), user2);
    }

    @MessageMapping("/typing")
    public void typing(Map<String, Object> payload) {
        try {
            Long receiverId = Long.parseLong(payload.get("receiverId").toString());

            messagingTemplate.convertAndSend("/topic/typing/" + receiverId, payload);
        } catch (Exception e) {
            e.printStackTrace();
        }
    }
}