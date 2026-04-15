package com.backend.pingme.ping_me.Repository;

import com.backend.pingme.ping_me.Entity.MessageEntity;
import jakarta.transaction.Transactional;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Modifying;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;


import java.util.List;

public interface MessageRepository extends JpaRepository<MessageEntity,Long> {

    @Query("""
           SELECT m FROM MessageEntity m
           WHERE m.chatRoom.chatId = :chatId
           ORDER BY m.timestamp DESC
           """)
    Page<MessageEntity> getChatHistory(Long chatId, Pageable pageable);

    @Query("SELECT m FROM MessageEntity m WHERE m.chatRoom.chatId = :chatId AND m.senderId = :senderId AND m.status != 'SEEN'")
    List<MessageEntity> getUnreadMessages(@Param("chatId") Long chatId, @Param("senderId") Long senderId);

    @Query("SELECT COUNT(m) FROM MessageEntity m WHERE m.chatRoom.chatId = :chatId AND m.senderId = :senderId AND m.status != 'SEEN'")
    Long countUnreadMessages(@Param("chatId") Long chatId, @Param("senderId") Long senderId);

    @Modifying
    @Transactional
    @Query("UPDATE MessageEntity m SET m.status = 'DELIVERED' WHERE m.chatRoom.chatId = :chatId AND m.senderId = :senderId AND m.status = 'SENT'")
    void markMessagesAsDelivered(@Param("chatId") Long chatId, @Param("senderId") Long senderId);

    @Modifying
    @Transactional
    @Query("UPDATE MessageEntity m SET m.status = 'SEEN' WHERE m.chatRoom.chatId = :chatId AND m.senderId = :senderId AND m.status IN ('SENT', 'DELIVERED')")
    void markMessagesAsSeen(@Param("chatId") Long chatId, @Param("senderId") Long senderId);

    @Modifying
    @Transactional
    @Query("UPDATE MessageEntity m SET m.status = 'DELIVERED' WHERE m.chatRoom.chatId IN (SELECT c.chatId FROM ChatRoomEntity c WHERE c.user1 = :userId OR c.user2 = :userId) AND m.senderId != :userId AND m.status = 'SENT'")
    void markAllOfflineMessagesAsDelivered(@Param("userId") Long userId);

    @Query("SELECT DISTINCT m.senderId FROM MessageEntity m WHERE m.chatRoom.chatId IN (SELECT c.chatId FROM ChatRoomEntity c WHERE c.user1 = :userId OR c.user2 = :userId) AND m.senderId != :userId AND m.status = 'SENT'")
    List<Long> findSendersOfPendingMessages(@Param("userId") Long userId);

    @Query("""
    SELECT m FROM MessageEntity m
    WHERE m.chatRoom.chatId = :chatId
      AND m.status <> 'SEEN'
    """)
    List<MessageEntity> getUnreadMessages(Long chatId);

    @Query("""
    SELECT COUNT(m) FROM MessageEntity m
    WHERE m.chatRoom.chatId = :chatId
      AND m.status <> 'SEEN'
    """)
    Long countUnreadMessages(Long chatId);
}
