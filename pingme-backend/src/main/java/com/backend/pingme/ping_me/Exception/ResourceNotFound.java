package com.backend.pingme.ping_me.Exception;

public class ResourceNotFound extends RuntimeException{

    public ResourceNotFound(String message){
        super(message);
    }
}
