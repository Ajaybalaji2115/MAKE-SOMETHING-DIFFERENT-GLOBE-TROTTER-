package com.odo.hackathon.controller;

import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.web.bind.annotation.*;

import com.odo.hackathon.dto.LoginRequest;
import com.odo.hackathon.dto.RegisterRequest;
import com.odo.hackathon.model.User;
import com.odo.hackathon.repository.UserRepository;
import com.odo.hackathon.security.JwtUtil;

import java.util.Map;
import java.util.Optional;

@RestController
@RequestMapping("/api/auth")
public class AuthController {

    @Autowired
    public UserRepository userRepository;
    @Autowired
    public PasswordEncoder passwordEncoder;
    @Autowired
    public JwtUtil jwtUtil;

    @Autowired
    public com.odo.hackathon.service.EmailService emailService;
    @Autowired
    public com.odo.hackathon.repository.OtpRepository otpRepository;

    @PostMapping("/register")
    public ResponseEntity<String> register(@RequestBody RegisterRequest request,
            @RequestHeader(value = "Authorization", required = false) String authHeader) {

        if (userRepository.findByEmail(request.getEmail()).isPresent()) {
            return new ResponseEntity<>("Email already registered!", HttpStatus.CONFLICT);
        }

        String role = "CLIENT";

        // Logic for ADMIN creating TRAINER
        if (authHeader != null && authHeader.startsWith("Bearer ")) {
            String token = authHeader.substring(7);
            String creatorRole = jwtUtil.extractRole(token);
            if ("ADMIN".equals(creatorRole)) {
                role = "TRAINER";
            }
        }

        User user = User.builder()
                .name(request.getName())
                .email(request.getEmail())
                .password(passwordEncoder.encode(request.getPassword()))
                .role(role)
                .languagePreference(request.getLanguagePreference())
                .enabled(false) // Initially disabled
                .build();

        userRepository.save(user);

        // Generate and send OTP reusing PasswordResetService logic or duplicating here
        // for simplicity
        // Ideally should be a separate service method, but putting here for speed as
        // per request
        String otpCode = String.valueOf(100000 + new java.util.Random().nextInt(900000));
        com.odo.hackathon.model.Otp otp = com.odo.hackathon.model.Otp.builder()
                .email(request.getEmail())
                .otpCode(otpCode)
                .expiryTime(java.time.LocalDateTime.now().plusMinutes(5))
                .used(false)
                .build();
        otpRepository.save(otp);

        try {
            emailService.sendActivationEmail(request.getEmail(), otpCode);
        } catch (Exception e) {
            e.printStackTrace();
            return new ResponseEntity<>("User registered but failed to send OTP.", HttpStatus.INTERNAL_SERVER_ERROR);
        }

        return new ResponseEntity<>("User registered! Please check email for OTP to activate account.",
                HttpStatus.CREATED);
    }

    @PostMapping("/register/verify")
    public ResponseEntity<String> verifyRegistration(@RequestBody Map<String, String> request) {
        String email = request.get("email");
        String otpCode = request.get("otpCode");

        Optional<User> userOptional = userRepository.findByEmail(email);
        if (userOptional.isEmpty()) {
            return ResponseEntity.badRequest().body("User not found.");
        }
        User user = userOptional.get();
        if (user.isEnabled()) {
            return ResponseEntity.badRequest().body("User already verified.");
        }

        Optional<com.odo.hackathon.model.Otp> otpOptional = otpRepository.findByEmailAndOtpCodeAndUsedFalse(email,
                otpCode);
        if (otpOptional.isEmpty()) {
            return ResponseEntity.badRequest().body("Invalid or expired OTP.");
        }

        com.odo.hackathon.model.Otp otp = otpOptional.get();
        if (otp.getExpiryTime().isBefore(java.time.LocalDateTime.now())) {
            return ResponseEntity.badRequest().body("OTP expired.");
        }

        otp.setUsed(true);
        otpRepository.save(otp);

        user.setEnabled(true);
        userRepository.save(user);

        return ResponseEntity.ok("Account verified successfully! You can now login.");
    }

    @PostMapping("/login")
    public ResponseEntity<?> login(@RequestBody LoginRequest request) {
        Optional<User> optionalUser = userRepository.findByEmail(request.getEmail());
        if (optionalUser.isEmpty() ||
                !passwordEncoder.matches(request.getPassword(), optionalUser.get().getPassword())) {
            return new ResponseEntity<>("Invalid email or password!", HttpStatus.UNAUTHORIZED);
        }

        User user = optionalUser.get();
        if (!user.isEnabled()) {
            return new ResponseEntity<>("Account not verified. Please verify your email.", HttpStatus.FORBIDDEN);
        }

        String token = jwtUtil.generateToken(user.getEmail(), user.getRole(), user.getId());

        return ResponseEntity.ok(
                Map.of("token", token, "role", user.getRole()));
    }

    @PostMapping("/google")
    public ResponseEntity<?> googleLogin(@RequestBody Map<String, String> requestBody) {
        String idTokenString = requestBody.get("token");
        try {
            com.google.api.client.googleapis.auth.oauth2.GoogleIdTokenVerifier verifier = new com.google.api.client.googleapis.auth.oauth2.GoogleIdTokenVerifier.Builder(
                    new com.google.api.client.http.javanet.NetHttpTransport(),
                    new com.google.api.client.json.gson.GsonFactory())
                    .setAudience(java.util.Collections
                            .singletonList("596400670062-ge2o9okc7afst4r103nsss0lkvfiglgn.apps.googleusercontent.com"))
                    .build();

            com.google.api.client.googleapis.auth.oauth2.GoogleIdToken idToken = verifier.verify(idTokenString);
            if (idToken != null) {
                com.google.api.client.googleapis.auth.oauth2.GoogleIdToken.Payload payload = idToken.getPayload();
                String email = payload.getEmail();
                String name = (String) payload.get("name");

                Optional<User> existingUser = userRepository.findByEmail(email);
                User user;
                if (existingUser.isPresent()) {
                    user = existingUser.get();
                    if (!user.isEnabled()) {
                        user.setEnabled(true); // Auto-verify Google users
                        userRepository.save(user);
                    }
                } else {
                    user = User.builder()
                            .email(email)
                            .name(name)
                            .role("CLIENT")
                            .password(passwordEncoder.encode("GOOGLE_AUTH")) // Dummy password
                            .enabled(true)
                            .build();
                    userRepository.save(user);
                }

                String token = jwtUtil.generateToken(user.getEmail(), user.getRole(), user.getId());
                return ResponseEntity.ok(Map.of("token", token, "role", user.getRole()));
            } else {
                return ResponseEntity.badRequest().body("Invalid ID token.");
            }
        } catch (Exception e) {
            e.printStackTrace();
            return ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR).body("Google Auth failed");
        }
    }
}