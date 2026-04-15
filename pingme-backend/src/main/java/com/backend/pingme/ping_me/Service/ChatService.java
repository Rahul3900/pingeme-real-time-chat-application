package com.backend.pingme.ping_me.Service;

import com.backend.pingme.ping_me.Entity.ChatRoomEntity;
import com.backend.pingme.ping_me.Repository.ChatRoomRepository;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Service;

import java.util.List;

@Service
public class ChatService {

    @Autowired
    private ChatRoomRepository chatRoomRepository;

    public ChatRoomEntity getOrCreateChatRoom(Long user1, Long user2){

        List<ChatRoomEntity> rooms = chatRoomRepository.findExistingChatRooms(user1, user2);

        if (!rooms.isEmpty()) {
            return rooms.get(0);
        }

        ChatRoomEntity room = new ChatRoomEntity();
        room.setUser1(user1);
        room.setUser2(user2);
        return chatRoomRepository.save(room);
    }
}