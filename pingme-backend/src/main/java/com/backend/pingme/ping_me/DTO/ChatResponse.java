package com.backend.pingme.ping_me.DTO;

import lombok.AllArgsConstructor;
import lombok.Data;

import java.util.List;

@Data
@AllArgsConstructor
public class ChatResponse {
    private List<MessageDTO> messages;
    private int page;
    private int totalPages;
}
