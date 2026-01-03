package com.odo.hackathon.service;

import com.odo.hackathon.model.Trip;
import com.odo.hackathon.model.User;
import com.odo.hackathon.repository.TripRepository;
import com.odo.hackathon.repository.UserRepository;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Service;

import java.util.HashMap;
import java.util.List;
import java.util.Map;
import java.util.stream.Collectors;

@Service
public class AdminService {

    @Autowired
    private UserRepository userRepository;

    @Autowired
    private TripRepository tripRepository;

    public Map<String, Object> getDashboardStats() {
        long totalUsers = userRepository.count();
        long totalTrips = tripRepository.count();

        // Count active sessions (simplified as users created recently or just total for
        // now)
        // For hackathon, we can just return totalUsers as active or mock it
        long activeSessions = totalUsers > 0 ? totalUsers / 2 : 0;

        Map<String, Object> stats = new HashMap<>();
        stats.put("totalUsers", totalUsers);
        stats.put("totalTrips", totalTrips);
        stats.put("activeSessions", activeSessions);

        return stats;
    }

    public List<Map<String, Object>> getPopularDestinations() {
        // In a real app, use a custom JPQL query on TripStop.
        // For MVP, we'll fetch trips and aggregate in memory (not efficient for large
        // scale but fine here)
        List<Trip> trips = tripRepository.findAll();

        Map<String, Long> cityCounts = trips.stream()
                .flatMap(trip -> trip.getStops().stream())
                .collect(Collectors.groupingBy(//
                        stop -> stop.getCityName() != null ? stop.getCityName() : "Unknown",
                        Collectors.counting()));

        return cityCounts.entrySet().stream()
                .sorted((e1, e2) -> e2.getValue().compareTo(e1.getValue()))
                .limit(5)
                .map(entry -> {
                    Map<String, Object> data = new HashMap<>();
                    data.put("name", entry.getKey());
                    data.put("trips", entry.getValue());
                    return data;
                })
                .collect(Collectors.toList());
    }

    public List<Map<String, Object>> getPopularActivities() {
        List<Trip> trips = tripRepository.findAll();

        Map<String, Long> activityCounts = trips.stream()
                .flatMap(trip -> trip.getStops().stream())
                .flatMap(stop -> stop.getActivities().stream())
                .collect(Collectors.groupingBy(
                        activity -> activity.getName() != null ? activity.getName() : "Unknown",
                        Collectors.counting()));

        return activityCounts.entrySet().stream()
                .sorted((e1, e2) -> e2.getValue().compareTo(e1.getValue()))
                .limit(5)
                .map(entry -> {
                    Map<String, Object> data = new HashMap<>();
                    data.put("name", entry.getKey());
                    data.put("count", entry.getValue());
                    return data;
                })
                .collect(Collectors.toList());
    }

    public List<User> getAllUsers() {
        return userRepository.findAll();
    }

    public User updateUserStatus(Long userId, boolean enabled) {
        User user = userRepository.findById(userId)
                .orElseThrow(() -> new RuntimeException("User not found"));
        // Prevent disabling the main admin
        if ("bjcreations@gmail.com".equals(user.getEmail()) && !enabled) {
            throw new RuntimeException("Cannot disable the main admin account");
        }
        user.setEnabled(enabled);
        return userRepository.save(user);
    }

    public User updateUserRole(Long userId, String role) {
        User user = userRepository.findById(userId)
                .orElseThrow(() -> new RuntimeException("User not found"));
        // Prevent demoting the main admin
        if ("bjcreations@gmail.com".equals(user.getEmail()) && !"ADMIN".equals(role)) {
            throw new RuntimeException("Cannot change role of the main admin account");
        }
        user.setRole(role);
        return userRepository.save(user);
    }
}
