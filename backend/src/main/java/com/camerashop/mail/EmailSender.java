package com.camerashop.mail;

public interface EmailSender {

    void send(String from, String to, String subject, String text);
}
