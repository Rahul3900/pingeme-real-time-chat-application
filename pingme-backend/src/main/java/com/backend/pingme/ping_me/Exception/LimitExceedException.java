package com.backend.pingme.ping_me.Exception;

public class LimitExceedException extends RuntimeException{

    public LimitExceedException(String message){
        super(message);
    }
}
