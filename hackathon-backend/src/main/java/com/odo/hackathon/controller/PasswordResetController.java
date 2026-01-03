package com.odo.hackathon.controller;


import lombok.Data;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import com.odo.hackathon.service.PasswordResetService;

@RestController
@RequestMapping("/api/auth") 
@CrossOrigin(origins = "http://localhost:5173") 
public class PasswordResetController {

    @Autowired
    public  PasswordResetService passwordResetService;


    @PostMapping("/forgot-password")
    public ResponseEntity<String> forgotPassword(@RequestBody ForgotPasswordRequest request) {
        String result = passwordResetService.initiatePasswordReset(request.getEmail());
        if (result.startsWith("User not found")) {
            return ResponseEntity.badRequest().body(result);
        }
        if (result.startsWith("Failed to send OTP") || result.startsWith("An unexpected error occurred")) {
            return ResponseEntity.internalServerError().body(result);
        }
        return ResponseEntity.ok(result);
    }

    @PostMapping("/reset-password")
    public ResponseEntity<String> resetPassword(@RequestBody ResetPasswordRequest request) {
        String result = passwordResetService.resetPassword(request.getEmail(), request.getOtpCode(), request.getNewPassword());
        if (result.contains("Invalid") || result.contains("expired") || result.contains("used") || result.contains("New password cannot be the same")) {
            return ResponseEntity.badRequest().body(result); 
        }
        if (result.contains("User not found")) { 
            return ResponseEntity.badRequest().body(result);
        }
        return ResponseEntity.ok(result); 
    }

    @Data
    static class ForgotPasswordRequest {
        private String email;
    }

    @Data
    static class ResetPasswordRequest {
        private String email;
        private String otpCode;
        private String newPassword;
    }
}