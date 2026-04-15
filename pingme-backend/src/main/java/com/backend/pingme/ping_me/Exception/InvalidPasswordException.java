package com.backend.pingme.ping_me.Exception;

public class InvalidPasswordException extends RuntimeException{

    public InvalidPasswordException(String message){
        super(message);
    }
}
