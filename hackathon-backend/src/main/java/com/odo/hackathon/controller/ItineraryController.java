package com.odo.hackathon.controller;

import com.odo.hackathon.model.Activity;
import com.odo.hackathon.model.TripStop;
import com.odo.hackathon.service.ItineraryService;
import lombok.Data;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.time.LocalDate;

@RestController
@RequestMapping("/api/itinerary")
@CrossOrigin(origins = "http://localhost:5173")
public class ItineraryController {

    @Autowired
    private ItineraryService itineraryService;

    @PostMapping("/stops")
    public ResponseEntity<TripStop> addStop(@RequestBody AddStopRequest request) {
        TripStop stop = itineraryService.addStop(request.getTripId(), request.getCityId(), request.getCityName(),
                request.getArrivalDate(), request.getDepartureDate());
        return ResponseEntity.ok(stop);
    }

    @DeleteMapping("/stops/{id}")
    public ResponseEntity<Void> removeStop(@PathVariable Long id) {
        itineraryService.removeStop(id);
        return ResponseEntity.ok().build();
    }

    @PostMapping("/activities")
    public ResponseEntity<Activity> addActivity(@RequestBody AddActivityRequest request) {
        Activity activity = itineraryService.addActivity(request.getStopId(), request.getName(), request.getCost(),
                request.getCategory(), request.getDescription());
        return ResponseEntity.ok(activity);
    }

    @DeleteMapping("/activities/{id}")
    public ResponseEntity<Void> removeActivity(@PathVariable Long id) {
        itineraryService.removeActivity(id);
        return ResponseEntity.ok().build();
    }

    @Data
    static class AddStopRequest {
        private Long tripId;
        private Long cityId;
        private String cityName;
        private LocalDate arrivalDate;
        private LocalDate departureDate;
    }

    @Data
    static class AddActivityRequest {
        private Long stopId;
        private String name;
        private Double cost;
        private String category;
        private String description;
    }
}
