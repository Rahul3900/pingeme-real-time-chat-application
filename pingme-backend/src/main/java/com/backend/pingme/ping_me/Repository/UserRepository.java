package com.backend.pingme.ping_me.Repository;

import com.backend.pingme.ping_me.Entity.UserEntity;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;

import java.util.List;
import java.util.Optional;

public interface UserRepository extends JpaRepository<UserEntity,Long> {

    Optional<UserEntity> findByUsername(String username);

    @Query("""
        SELECT u FROM UserEntity u 
        WHERE u.userId != :myId AND (
            u.userId IN (SELECT c.user1 FROM ChatRoomEntity c WHERE c.user2 = :myId)
            OR 
            u.userId IN (SELECT c.user2 FROM ChatRoomEntity c WHERE c.user1 = :myId)
        )
    """)
    List<UserEntity> findConnectedUsers(@Param("myId") Long myId);
}
