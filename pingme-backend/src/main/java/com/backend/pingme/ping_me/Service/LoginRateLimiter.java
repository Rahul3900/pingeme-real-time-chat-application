package com.backend.pingme.ping_me.Service;

import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.data.redis.core.StringRedisTemplate;
import org.springframework.stereotype.Service;

import java.time.Duration;

@Service
public class LoginRateLimiter {

    @Autowired
    private StringRedisTemplate redisTemplate;

    private static final String PREFIX = "attempts:";
    private static final int MAX_ATTEMPTS = 5;
    private static final int TIME_LIMIT = 2;

    public boolean isBlocked(String username){

        String value = redisTemplate.opsForValue().get(PREFIX+username);

        if(value==null){
            return false;
        }

        return Long.parseLong(value)>MAX_ATTEMPTS;
    }

    public void loginFail(String username){

        Long count = redisTemplate.opsForValue().increment(PREFIX+username);

        if(count<=MAX_ATTEMPTS){
            redisTemplate.expire(PREFIX+username, Duration.ofMinutes(TIME_LIMIT));
        }
    }

    public void loginPass(String username){

        redisTemplate.delete(PREFIX+username);
    }
}
