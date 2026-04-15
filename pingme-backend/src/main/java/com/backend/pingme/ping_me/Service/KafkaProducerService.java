package com.backend.pingme.ping_me.Service;

import com.backend.pingme.ping_me.DTO.MessageDTO;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.kafka.core.KafkaTemplate;
import org.springframework.stereotype.Service;

@Service
public class KafkaProducerService {

    @Autowired
    private KafkaTemplate<String, MessageDTO> kafkaTemplate;

    private static final String TOPIC = "chat-topic-v2";

    public void sendMessage(MessageDTO messageDTO){
        kafkaTemplate.send(TOPIC, messageDTO);
    }
}