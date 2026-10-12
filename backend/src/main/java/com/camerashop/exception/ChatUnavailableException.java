// AI assistant temporarily unavailable (missing key, provider error or quota) -> HTTP 503.

package com.camerashop.exception;

public class ChatUnavailableException extends RuntimeException {

    public ChatUnavailableException(String message) {
        super(message);
    }
}
