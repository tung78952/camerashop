// Sends one email (plain text + optional HTML); implementations: SMTP (dev) and Brevo HTTPS API (production).

package com.camerashop.mail;

public interface EmailSender {

    void send(String from, String to, String subject, String text, String html);
}
