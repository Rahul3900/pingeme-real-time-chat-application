package com.backend.pingme.ping_me.Controller;

import com.backend.pingme.ping_me.DTO.UserDTO;
import com.backend.pingme.ping_me.Entity.ApiResponse;
import com.backend.pingme.ping_me.Entity.UserEntity;
import com.backend.pingme.ping_me.Repository.UserRepository;
import com.backend.pingme.ping_me.Service.AuthService;
import com.backend.pingme.ping_me.Service.OnlineUserService;
import jakarta.validation.Valid;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.ResponseEntity;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.web.bind.annotation.*;

import java.util.HashMap;
import java.util.List;
import java.util.Map;
import java.util.stream.Collectors;

@RestController
@RequestMapping("/auth")
public class AuthController {

    @Autowired
    private AuthService authService;

    @Autowired
    private UserRepository userRepository;

    @Autowired
    private PasswordEncoder passwordEncoder;

    @Autowired
    private OnlineUserService onlineUserService;

    @PostMapping("/register")
    public ResponseEntity<ApiResponse> registerUser(@Valid @RequestBody UserDTO userDTO){

        boolean userExists = userRepository.findAll().stream()
                .anyMatch(u -> u.getUsername().equalsIgnoreCase(userDTO.getUsername()));

        if (userExists) {
            return ResponseEntity.badRequest().body(new ApiResponse<>(false, "username already exists", null));
        }

        UserEntity user = new UserEntity();
        user.setUsername(userDTO.getUsername());
        user.setPassword(passwordEncoder.encode(userDTO.getPassword()));
        userRepository.save(user);

        return ResponseEntity.ok(new ApiResponse<>(true, "User registered successfully", null));
    }

    @PostMapping("/login")
    public ResponseEntity<ApiResponse> authUser(@RequestBody UserEntity userEntity){
        try {
            String token = authService.authenticateUser(userEntity.getUsername(), userEntity.getPassword());
            return ResponseEntity.ok(new ApiResponse<>(true, "Login successful", token));
        } catch (Exception e) {
            return ResponseEntity.badRequest().body(new ApiResponse<>(false, "username/password is wrong", null));
        }
    }

    @GetMapping("/users")
    public List<Map<String, Object>> getAllUsers() {
        return userRepository.findAll()
                .stream()
                .map(user -> {
                    Map<String, Object> map = new HashMap<>();
                    map.put("id", user.getUserId());
                    map.put("username", user.getUsername());
                    map.put("isOnline", onlineUserService.isUserOnline(user.getUserId()));
                    return map;
                })
                .collect(Collectors.toList());
    }
}