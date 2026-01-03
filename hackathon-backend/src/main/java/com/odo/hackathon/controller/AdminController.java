package com.odo.hackathon.controller;

import com.odo.hackathon.model.User;
import com.odo.hackathon.service.AdminService;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;

import java.util.List;
import java.util.Map;

@RestController
@RequestMapping("/api/admin")
public class AdminController {

    @Autowired
    private AdminService adminService;

    @GetMapping("/stats")
    public ResponseEntity<Map<String, Object>> getStats() {
        return ResponseEntity.ok(adminService.getDashboardStats());
    }

    @GetMapping("/popular-destinations")
    public ResponseEntity<List<Map<String, Object>>> getPopularDestinations() {
        return ResponseEntity.ok(adminService.getPopularDestinations());
    }

    @GetMapping("/popular-activities")
    public ResponseEntity<List<Map<String, Object>>> getPopularActivities() {
        return ResponseEntity.ok(adminService.getPopularActivities());
    }

    @GetMapping("/users")
    public ResponseEntity<List<User>> getAllUsers() {
        return ResponseEntity.ok(adminService.getAllUsers());
    }

    @org.springframework.web.bind.annotation.PutMapping("/users/{id}/status")
    public ResponseEntity<User> updateUserStatus(@org.springframework.web.bind.annotation.PathVariable Long id,
            @org.springframework.web.bind.annotation.RequestParam boolean enabled) {
        return ResponseEntity.ok(adminService.updateUserStatus(id, enabled));
    }

    @org.springframework.web.bind.annotation.PutMapping("/users/{id}/role")
    public ResponseEntity<User> updateUserRole(@org.springframework.web.bind.annotation.PathVariable Long id,
            @org.springframework.web.bind.annotation.RequestParam String role) {
        return ResponseEntity.ok(adminService.updateUserRole(id, role));
    }
}
