package com.backend.pingme.ping_me.DTO;

import lombok.AllArgsConstructor;
import lombok.Data;
import lombok.NoArgsConstructor;

import java.time.LocalDateTime;

@Data
@NoArgsConstructor
@AllArgsConstructor
public class MessageDTO {

    private Long senderId;

    private Long receiverId;

    private Long chatId;

    private String content;

    private String status;

    private LocalDateTime timestamp;
}
