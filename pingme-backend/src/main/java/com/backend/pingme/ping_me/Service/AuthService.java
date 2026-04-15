package com.backend.pingme.ping_me.Service;

import com.backend.pingme.ping_me.Entity.UserEntity;
import com.backend.pingme.ping_me.Exception.InvalidPasswordException;
import com.backend.pingme.ping_me.Exception.LimitExceedException;
import com.backend.pingme.ping_me.Exception.ResourceNotFound;
import com.backend.pingme.ping_me.Repository.UserRepository;
import com.backend.pingme.ping_me.Util.JwtUtil;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.stereotype.Service;

@Service
public class AuthService {

    @Autowired
    private UserRepository userRepository;

    @Autowired
    private LoginRateLimiter loginRateLimiter;

    @Autowired
    private PasswordEncoder passwordEncoder;

    @Autowired
    private JwtUtil jwtUtil;

    public String authenticateUser(String username, String password){

        if(loginRateLimiter.isBlocked(username)){
            throw new LimitExceedException("Too many attempts, please try again after 2 minutes!");
        }

        UserEntity userEntity = userRepository.findByUsername(username)
                               .orElseThrow(()-> new ResourceNotFound(username+" not found!!"));

        if (!passwordEncoder.matches(password, userEntity.getPassword())) {
            loginRateLimiter.loginFail(username);
            throw new InvalidPasswordException("Invalid password!!");
        }

        loginRateLimiter.loginPass(username);

        return jwtUtil.generateToken(userEntity.getUserId());
    }
}
