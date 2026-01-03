package com.odo.hackathon.controller;

import com.odo.hackathon.model.Activity;
import com.odo.hackathon.model.TripStop;
import com.odo.hackathon.service.ItineraryService;
import lombok.Data;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.time.Duration;
import java.time.LocalDate;
import java.time.LocalTime;

@RestController
@RequestMapping("/api/trips")
@CrossOrigin(origins = "http://localhost:5173")
public class ItineraryController {

    @Autowired
    private ItineraryService itineraryService;

    @PostMapping("/{tripId}/stops")
    public ResponseEntity<TripStop> addStop(@PathVariable Long tripId, @RequestBody AddStopRequest request) {
        TripStop stop = itineraryService.addStop(tripId, request.getCityId(), request.getCityName(),
                request.getArrivalDate(), request.getDepartureDate(), request.getTransportCost(),
                request.getTransportMode());
        return ResponseEntity.ok(stop);
    }

    @DeleteMapping("/{tripId}/stops/{stopId}")
    public ResponseEntity<Void> removeStop(@PathVariable Long tripId, @PathVariable Long stopId) {
        itineraryService.removeStop(stopId);
        return ResponseEntity.ok().build();
    }

    @PutMapping("/{tripId}/stops/{stopId}")
    public ResponseEntity<TripStop> updateStop(@PathVariable Long tripId, @PathVariable Long stopId,
            @RequestBody AddStopRequest request) {
        TripStop stop = itineraryService.updateStop(stopId, request.getCityName(), request.getArrivalDate(),
                request.getDepartureDate(), request.getTransportCost(), request.getTransportMode());
        return ResponseEntity.ok(stop);
    }

    @PostMapping("/{tripId}/stops/{stopId}/activities")
    public ResponseEntity<Activity> addActivity(@PathVariable Long tripId, @PathVariable Long stopId,
            @RequestBody AddActivityRequest request) {
        // Map Frontend fields to Backend fields
        String category = request.getType(); // Frontend sends 'type'
        String description = request.getNotes(); // Frontend sends 'notes'
        Integer duration = calculateDuration(request.getStartTime(), request.getEndTime());

        Activity activity = itineraryService.addActivity(stopId, request.getName(), request.getCost(),
                category, description, request.getStartTime(), duration, request.getDayOffset());
        return ResponseEntity.ok(activity);
    }

    @DeleteMapping("/{tripId}/stops/{stopId}/activities/{activityId}")
    public ResponseEntity<Void> removeActivity(@PathVariable Long tripId, @PathVariable Long stopId,
            @PathVariable Long activityId) {
        itineraryService.removeActivity(activityId);
        return ResponseEntity.ok().build();
    }

    @PutMapping("/{tripId}/stops/{stopId}/activities/{activityId}")
    public ResponseEntity<Activity> updateActivity(@PathVariable Long tripId, @PathVariable Long stopId,
            @PathVariable Long activityId, @RequestBody AddActivityRequest request) {
        String category = request.getType();
        String description = request.getNotes();
        Integer duration = calculateDuration(request.getStartTime(), request.getEndTime());

        Activity activity = itineraryService.updateActivity(activityId, request.getName(), request.getCost(),
                category, description, request.getStartTime(), duration, request.getDayOffset());
        return ResponseEntity.ok(activity);
    }

    private Integer calculateDuration(LocalTime start, LocalTime end) {
        if (start == null || end == null)
            return null;
        if (end.isBefore(start))
            return null; // Handle overnight? For now simple.
        return (int) Duration.between(start, end).toMinutes();
    }

    @Data
    static class AddStopRequest {
        private Long cityId;
        private String cityName;
        private LocalDate arrivalDate;
        private LocalDate departureDate;
        private Double transportCost;
        private String transportMode;
    }

    @Data
    static class AddActivityRequest {
        private String name;
        private Double cost;
        private String type; // Replaces category
        private String notes; // Replaces description
        private LocalTime startTime;
        private LocalTime endTime;
        private Integer dayOffset;
    }
}