package com.odo.hackathon.controller;

import com.odo.hackathon.model.User;
import com.odo.hackathon.service.UserService;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.ResponseEntity;
import org.springframework.security.core.Authentication;
import org.springframework.security.core.context.SecurityContextHolder;
import org.springframework.web.bind.annotation.*;

import java.util.Map;

@RestController
@RequestMapping("/api/user")
@CrossOrigin(origins = "http://localhost:5173")
public class UserController {

    @Autowired
    private UserService userService;

    private Long getCurrentUserId() {
        Authentication auth = SecurityContextHolder.getContext().getAuthentication();
        String email = auth.getName();
        return userService.getUserByEmail(email).getId();
    }

    @GetMapping("/profile")
    public ResponseEntity<User> getProfile() {
        return ResponseEntity.ok(userService.getUserById(getCurrentUserId()));
    }

    @PutMapping("/profile")
    public ResponseEntity<User> updateProfile(@RequestBody UpdateProfileRequest request) {
        return ResponseEntity.ok(userService.updateProfile(getCurrentUserId(), request.getName(),
                request.getProfilePhotoUrl(), request.getLanguagePreference()));
    }

    @DeleteMapping("/profile")
    public ResponseEntity<Void> deleteAccount() {
        userService.deleteUser(getCurrentUserId());
        return ResponseEntity.ok().build();
    }

    @PostMapping("/saved-destinations")
    public ResponseEntity<User> addSavedDestination(@RequestBody Map<String, String> body) {
        return ResponseEntity.ok(userService.addSavedDestination(getCurrentUserId(), body.get("destination")));
    }

    @DeleteMapping("/saved-destinations")
    public ResponseEntity<User> removeSavedDestination(@RequestBody Map<String, String> body) {
        return ResponseEntity.ok(userService.removeSavedDestination(getCurrentUserId(), body.get("destination")));
    }

    @lombok.Data
    static class UpdateProfileRequest {
        private String name;
        private String profilePhotoUrl;
        private String languagePreference;
    }
}
