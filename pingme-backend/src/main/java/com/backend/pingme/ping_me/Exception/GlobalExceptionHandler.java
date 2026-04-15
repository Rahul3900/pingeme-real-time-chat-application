package com.backend.pingme.ping_me.Exception;

import jakarta.servlet.http.HttpServletRequest;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.MethodArgumentNotValidException;
import org.springframework.web.bind.annotation.ControllerAdvice;
import org.springframework.web.bind.annotation.ExceptionHandler;

import java.time.LocalDateTime;
import java.util.Map;
import java.util.concurrent.ConcurrentHashMap;

@ControllerAdvice
public class GlobalExceptionHandler {

    @ExceptionHandler(ResourceNotFound.class)
    public ResponseEntity<Map> resourceNotFound(ResourceNotFound ex, HttpServletRequest request){
        Map<String,Object> map = new ConcurrentHashMap<>();
        map.put("timestamp: ", LocalDateTime.now());
        map.put("status: ", HttpStatus.NOT_FOUND.value());
        map.put("message: ",ex.getMessage());
        map.put("path: ",request.getRequestURI());

        return new ResponseEntity<>(map,HttpStatus.NOT_FOUND);
    }

    @ExceptionHandler(InvalidPasswordException.class)
    public ResponseEntity<Map> invalidPassword(InvalidPasswordException ex, HttpServletRequest request){
        Map<String,Object> map = new ConcurrentHashMap<>();
        map.put("timestamp: ", LocalDateTime.now());
        map.put("status: ", HttpStatus.BAD_REQUEST.value());
        map.put("message: ",ex.getMessage());
        map.put("path: ",request.getRequestURI());

        return new ResponseEntity<>(map,HttpStatus.BAD_REQUEST);
    }

    @ExceptionHandler(LimitExceedException.class)
    public ResponseEntity<Map> limitExceed(LimitExceedException ex, HttpServletRequest request){
        Map<String,Object> map = new ConcurrentHashMap<>();
        map.put("timestamp: ", LocalDateTime.now());
        map.put("status: ", HttpStatus.BANDWIDTH_LIMIT_EXCEEDED.value());
        map.put("message: ",ex.getMessage());
        map.put("path: ",request.getRequestURI());

        return new ResponseEntity<>(map,HttpStatus.BANDWIDTH_LIMIT_EXCEEDED);
    }

    @ExceptionHandler(MethodArgumentNotValidException.class)
    public ResponseEntity<Map> validationException(MethodArgumentNotValidException ex, HttpServletRequest request){
        Map<String,Object> map = new ConcurrentHashMap<>();
        map.put("timestamp: ", LocalDateTime.now());
        map.put("status: ", HttpStatus.NOT_ACCEPTABLE.value());
        map.put("message: ",ex.getBindingResult().getFieldError().getDefaultMessage());
        map.put("path: ",request.getRequestURI());

        return new ResponseEntity<>(map,HttpStatus.NOT_ACCEPTABLE);
    }
}
