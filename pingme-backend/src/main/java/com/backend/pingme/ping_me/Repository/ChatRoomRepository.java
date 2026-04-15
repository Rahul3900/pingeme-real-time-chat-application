package com.backend.pingme.ping_me.Repository;

import com.backend.pingme.ping_me.Entity.ChatRoomEntity;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;

import java.util.List;

public interface ChatRoomRepository extends JpaRepository<ChatRoomEntity, Long> {

    @Query("SELECT c FROM ChatRoomEntity c WHERE (c.user1 = :u1 AND c.user2 = :u2) OR (c.user1 = :u2 AND c.user2 = :u1)")
    List<ChatRoomEntity> findExistingChatRooms(@Param("u1") Long u1, @Param("u2") Long u2);
}