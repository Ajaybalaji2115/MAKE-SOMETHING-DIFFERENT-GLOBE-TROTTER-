package com.odo.hackathon.service;
import jakarta.mail.MessagingException; // Import for JavaMail exception
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional; // Still useful for MongoDB if you define transactions

import com.odo.hackathon.model.Otp;
import com.odo.hackathon.model.User;
import com.odo.hackathon.repository.OtpRepository;
import com.odo.hackathon.repository.UserRepository;

import java.time.LocalDateTime;
import java.util.Optional;
import java.util.Random;

@Service
public class PasswordResetService {

    private final UserRepository userRepository;
    private final OtpRepository otpRepository;
    private final EmailService emailService;
    private final PasswordEncoder passwordEncoder;

    public PasswordResetService(UserRepository userRepository, OtpRepository otpRepository, EmailService emailService, PasswordEncoder passwordEncoder) {
        this.userRepository = userRepository;
        this.otpRepository = otpRepository;
        this.emailService = emailService;
        this.passwordEncoder = passwordEncoder;
    }

    @Transactional
    public String initiatePasswordReset(String email) {
        Optional<User> userOptional = userRepository.findByEmail(email);
        if (userOptional.isEmpty()) {
            return "User not found with this email. Please register.";
        }

        otpRepository.findTopByEmailOrderByExpiryTimeDesc(email).ifPresent(otp -> {
            if (otp.getExpiryTime().isAfter(LocalDateTime.now()) && !otp.isUsed()) {
                otp.setUsed(true); 
                otpRepository.save(otp);
            }
        });

        String otpCode = generateOtp();
        LocalDateTime expiryTime = LocalDateTime.now().plusMinutes(5); 

        Otp otp = Otp.builder()
                .email(email)
                .otpCode(otpCode)
                .expiryTime(expiryTime)
                .used(false)
                .build();
        otpRepository.save(otp);

        try {
            emailService.sendOtpEmail(email, otpCode);
            return "OTP sent to your email. Please check your inbox.";
        } catch (MessagingException e) { 
            System.err.println("Error sending OTP email: " + e.getMessage());
            e.printStackTrace(); 
            return "Failed to send OTP. Please try again later.";
        } catch (Exception e) {
            System.err.println("An unexpected error occurred during OTP sending: " + e.getMessage());
            e.printStackTrace();
            return "An unexpected error occurred. Please try again.";
        }
    }

    @Transactional
    public String resetPassword(String email, String otpCode, String newPassword) {
        Optional<User> userOptional = userRepository.findByEmail(email);
        if (userOptional.isEmpty()) {
           
            return "User not found.";
        }
        User user = userOptional.get();

        Optional<Otp> otpOptional = otpRepository.findByEmailAndOtpCodeAndUsedFalse(email, otpCode);

        if (otpOptional.isEmpty()) {
            return "Invalid or expired OTP.";
        }

        Otp otp = otpOptional.get();

        if (otp.getExpiryTime().isBefore(LocalDateTime.now())) {
            otp.setUsed(true); 
            otpRepository.save(otp);
            return "OTP has expired. Please request a new one.";
        }

        if (otp.isUsed()) {
            return "OTP has already been used.";
        }

        if (passwordEncoder.matches(newPassword, user.getPassword())) {
            return "New password cannot be the same as the old password.";
        }

        user.setPassword(passwordEncoder.encode(newPassword));
        userRepository.save(user);

        otp.setUsed(true);
        otpRepository.save(otp);

        return "Password reset successfully!";
    }

    private String generateOtp() {
        Random random = new Random();
        int otp = 100000 + random.nextInt(900000); 
        return String.valueOf(otp);
    }
}