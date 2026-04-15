package com.backend.pingme.ping_me.Service;

import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.data.redis.core.StringRedisTemplate;
import org.springframework.stereotype.Service;

@Service
public class OnlineUserService {

    @Autowired
    private StringRedisTemplate stringRedisTemplate;

    private static final String PREFIX = "online:";

    public void setUserOnline(Long userId){
        stringRedisTemplate.opsForValue().set(PREFIX+userId,"True");
    }

    public void setUserOffline(Long userId){
        stringRedisTemplate.delete(PREFIX+userId);
    }

    public boolean isUserOnline(Long userId){

        return Boolean.TRUE.equals(stringRedisTemplate.hasKey(PREFIX + userId));
    }
}
