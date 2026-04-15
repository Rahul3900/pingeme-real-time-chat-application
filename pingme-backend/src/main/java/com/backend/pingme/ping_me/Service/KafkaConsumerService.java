package com.backend.pingme.ping_me.Service;

import com.backend.pingme.ping_me.DTO.MessageDTO;
import com.backend.pingme.ping_me.ENUM.MessageStatus;
import com.backend.pingme.ping_me.Entity.ChatRoomEntity;
import com.backend.pingme.ping_me.Entity.MessageEntity;
import com.backend.pingme.ping_me.Repository.ChatRoomRepository;
import com.backend.pingme.ping_me.Repository.MessageRepository;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.kafka.annotation.KafkaListener;
import org.springframework.messaging.simp.SimpMessagingTemplate;
import org.springframework.stereotype.Service;

import java.time.LocalDateTime;

@Service
public class KafkaConsumerService {

    @Autowired
    private MessageRepository messageRepository;

    @Autowired
    private ChatRoomRepository chatRoomRepository;

    @Autowired
    private SimpMessagingTemplate messagingTemplate;

    @KafkaListener(topics = "chat-topic-v2", groupId = "group-chat-v2")
    public void consume(MessageDTO messageDTO){

        ChatRoomEntity room = chatRoomRepository
                .findById(messageDTO.getChatId())
                .orElseThrow();

        MessageEntity messageEntity = new MessageEntity();
        messageEntity.setSenderId(messageDTO.getSenderId());
        messageEntity.setChatRoom(room);
        messageEntity.setContent(messageDTO.getContent());
        messageEntity.setTimestamp(LocalDateTime.now());

        messageEntity.setStatus(MessageStatus.SENT.name());

        messageRepository.save(messageEntity);

        messageDTO.setTimestamp(messageEntity.getTimestamp());
        messageDTO.setStatus(messageEntity.getStatus());

        messagingTemplate.convertAndSend(
                "/topic/messages/" + messageDTO.getReceiverId(),
                messageDTO);
    }
}