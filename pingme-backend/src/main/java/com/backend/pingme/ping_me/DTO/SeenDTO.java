package com.backend.pingme.ping_me.DTO;

import lombok.AllArgsConstructor;
import lombok.Data;

@Data
@AllArgsConstructor
public class SeenDTO {

    private Long senderId;

    private Long receiverId;
}
