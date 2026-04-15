package com.backend.pingme.ping_me.Entity;

import jakarta.persistence.*;
import lombok.AllArgsConstructor;
import lombok.Data;
import lombok.NoArgsConstructor;

import java.time.LocalDateTime;

@Data
@NoArgsConstructor
@AllArgsConstructor
@Entity
@Table(name = "message_table",
        indexes = {
                @Index(name = "chat_idx", columnList = "chat_id"),
                @Index(name = "sender_idx", columnList = "senderId")
        })
public class MessageEntity {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long messageId;

    private String content;

    private Long senderId;

    @ManyToOne
    @JoinColumn(name = "chat_id")
    private ChatRoomEntity chatRoom;

    private String status;

    private LocalDateTime timestamp;
}