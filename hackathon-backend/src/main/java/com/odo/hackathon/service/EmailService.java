package com.odo.hackathon.service;

import jakarta.mail.MessagingException;
import jakarta.mail.internet.MimeMessage;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.mail.javamail.JavaMailSender;
import org.springframework.mail.javamail.MimeMessageHelper;
import org.springframework.stereotype.Service;

import java.io.UnsupportedEncodingException;

@Service
public class EmailService {

    private final JavaMailSender mailSender;

    @Value("${app.email.sender.address}")
    private String senderEmailAddress;

    @Value("${app.email.sender.name}")
    private String senderName;

    public EmailService(JavaMailSender mailSender) {
        this.mailSender = mailSender;
    }

    public void sendOtpEmail(String toEmail, String otpCode) throws MessagingException, UnsupportedEncodingException {
        MimeMessage message = mailSender.createMimeMessage();
        MimeMessageHelper helper = new MimeMessageHelper(message, true, "UTF-8");

        helper.setFrom(senderEmailAddress, senderName); 
        helper.setTo(toEmail);
        helper.setSubject("Password Reset OTP for Your Account");

        String htmlContent =
                "<html><body><p>Hello,</p>" +
                        "<p>Your One-Time Password (OTP) for password reset is: <strong>" + otpCode + "</strong></p>" +
                        "<p>This OTP is valid for 5 minutes. Please do not share it with anyone.</p>" +
                        "<p>If you did not request a password reset, please ignore this email.</p>" +
                        "<p>Thanks,<br/>Globetrotter Management System Team</p></body></html>";

        helper.setText(htmlContent, true);

        mailSender.send(message);
    }
}