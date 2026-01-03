package com.odo.hackathon.service;

import com.odo.hackathon.model.Activity;
import com.odo.hackathon.model.City;
import com.odo.hackathon.model.Trip;
import com.odo.hackathon.model.TripStop;
import com.odo.hackathon.repository.ActivityRepository;
import com.odo.hackathon.repository.CityRepository;
import com.odo.hackathon.repository.TripRepository;
import com.odo.hackathon.repository.TripStopRepository;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Service;

import java.time.LocalDate;
import java.util.List;

@Service
public class ItineraryService {

    @Autowired
    private TripRepository tripRepository;
    @Autowired
    private TripStopRepository tripStopRepository;
    @Autowired
    private ActivityRepository activityRepository;
    @Autowired
    private CityRepository cityRepository;

    public TripStop addStop(Long tripId, Long cityId, String cityName, LocalDate arrival, LocalDate departure, Double transportCost, String transportMode) {
        Trip trip = tripRepository.findById(tripId).orElseThrow(() -> new RuntimeException("Trip not found"));
        
        // Validation: Dates
        if (arrival.isBefore(trip.getStartDate()) || departure.isAfter(trip.getEndDate())) {
            throw new RuntimeException("Stop dates must be within trip dates (" + trip.getStartDate() + " to " + trip.getEndDate() + ")");
        }
        
        // Validation: Overlap
        // Check if any existing stop overlaps with new dates
        // Allow connecting trips: New Arrival can be same as Old Departure
        boolean overlap = trip.getStops().stream().anyMatch(s -> 
            !((!arrival.isBefore(s.getDepartureDate())) || (!departure.isAfter(s.getArrivalDate())))
        );
        if (overlap) {
            throw new RuntimeException("Stop dates overlap with an existing stop (connecting dates allowed).");
        }

        City city = null;
        if (cityId != null) {
            city = cityRepository.findById(cityId).orElse(null);
        }

        String finalCityName = (city != null) ? city.getName() : (cityName != null ? cityName : "Unknown");
        String finalCountry = (city != null) ? city.getCountry() : "";

        TripStop stop = TripStop.builder()
                .trip(trip)
                .city(city)
                .cityName(finalCityName)
                .country(finalCountry)
                .arrivalDate(arrival)
                .departureDate(departure)
                .transportCost(transportCost) 
                .transportMode(transportMode)
                .orderIndex(0) 
                .build();

        return tripStopRepository.save(stop);
    }

    public void removeStop(Long stopId) {
        tripStopRepository.deleteById(stopId);
    }

    public TripStop updateStop(Long stopId, String cityName, LocalDate arrival, LocalDate departure, Double transportCost, String transportMode) {
        TripStop stop = tripStopRepository.findById(stopId).orElseThrow(() -> new RuntimeException("Stop not found"));
        
        // Simple update without heavy validation for now to avoid blocking user edits, 
        // real-world app should re-validate overlap excluding self.
        if (cityName != null) stop.setCityName(cityName);
        if (arrival != null) stop.setArrivalDate(arrival);
        if (departure != null) stop.setDepartureDate(departure);
        if (transportCost != null) stop.setTransportCost(transportCost);
        if (transportMode != null) stop.setTransportMode(transportMode);

        return tripStopRepository.save(stop);
    }

    public Activity addActivity(Long stopId, String name, Double cost, String category, String description, java.time.LocalTime startTime, Integer durationMinutes, Integer dayOffset) {
        TripStop stop = tripStopRepository.findById(stopId).orElseThrow(() -> new RuntimeException("Stop not found"));

        Activity activity = Activity.builder()
                .tripStop(stop)
                .name(name)
                .cost(cost)
                .category(category)
                .description(description)
                .startTime(startTime)
                .durationMinutes(durationMinutes)
                .dayOffset(dayOffset)
                .build();

        return activityRepository.save(activity);
    }

    public void removeActivity(Long activityId) {
        activityRepository.deleteById(activityId);
    }

    public Activity updateActivity(Long id, String name, Double cost, String category, String description, java.time.LocalTime startTime, Integer durationMinutes, Integer dayOffset) {
        Activity activity = activityRepository.findById(id).orElseThrow(() -> new RuntimeException("Activity not found"));
        if(name != null) activity.setName(name);
        if(cost != null) activity.setCost(cost);
        if(category != null) activity.setCategory(category);
        if(description != null) activity.setDescription(description);
        
        // Time fields
        activity.setStartTime(startTime);
        activity.setDurationMinutes(durationMinutes);
        activity.setDayOffset(dayOffset);

        return activityRepository.save(activity);
    }
}