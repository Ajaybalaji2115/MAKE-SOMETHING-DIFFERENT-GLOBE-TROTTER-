package com.odo.hackathon.service;

import com.odo.hackathon.dto.TripDto;
import com.odo.hackathon.model.Trip;
import com.odo.hackathon.model.User;
import com.odo.hackathon.repository.TripRepository;
import com.odo.hackathon.repository.UserRepository;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Service;

import java.util.List;
import java.util.stream.Collectors;

@Service
public class TripService {

    @Autowired
    private TripRepository tripRepository;

    @Autowired
    private UserRepository userRepository;

    public Trip createTrip(TripDto tripDto, Long userId) {
        User user = userRepository.findById(userId)
                .orElseThrow(() -> new RuntimeException("User not found"));

        Trip trip = Trip.builder()
                .name(tripDto.getName())
                .description(tripDto.getDescription())
                .startDate(tripDto.getStartDate())
                .endDate(tripDto.getEndDate())
                .budget(tripDto.getBudget())
                .coverPhotoUrl(tripDto.getCoverPhotoUrl())
                .user(user)
                .build();

        return tripRepository.save(trip);
    }

    public List<Trip> getUserTrips(Long userId) {
        return tripRepository.findByUserId(userId);
    }

    public Trip getTripById(Long tripId) {
        return tripRepository.findById(tripId)
                .orElseThrow(() -> new RuntimeException("Trip not found"));
    }

    public void deleteTrip(Long tripId) {
        tripRepository.deleteById(tripId);
    }

    public Trip updateTrip(Long tripId, TripDto tripDto) {
        Trip trip = getTripById(tripId);
        trip.setName(tripDto.getName());
        trip.setDescription(tripDto.getDescription());
        trip.setStartDate(tripDto.getStartDate());
        trip.setEndDate(tripDto.getEndDate());
        trip.setBudget(tripDto.getBudget());
        trip.setCoverPhotoUrl(tripDto.getCoverPhotoUrl());
        return tripRepository.save(trip);
    }

    public Trip copyTrip(Long tripId, Long userId) {
        Trip originalTrip = getTripById(tripId);
        User user = userRepository.findById(userId)
                .orElseThrow(() -> new RuntimeException("User not found"));

        Trip newTrip = Trip.builder()
                .name("Copy of " + originalTrip.getName())
                .description(originalTrip.getDescription())
                .startDate(originalTrip.getStartDate())
                .endDate(originalTrip.getEndDate())
                .budget(originalTrip.getBudget())
                .coverPhotoUrl(originalTrip.getCoverPhotoUrl())
                .user(user)
                .build();

        // Save first to get ID
        newTrip = tripRepository.save(newTrip);

        // Deep copy stops
        if (originalTrip.getStops() != null) {
            final Trip finalTrip = newTrip;
            List<com.odo.hackathon.model.TripStop> newStops = originalTrip.getStops().stream().map(stop -> {
                com.odo.hackathon.model.TripStop newStop = com.odo.hackathon.model.TripStop.builder()
                        .city(stop.getCity()) // Link to same city object
                        .cityName(stop.getCityName())
                        .country(stop.getCountry())
                        .arrivalDate(stop.getArrivalDate())
                        .departureDate(stop.getDepartureDate())
                        .transportCost(stop.getTransportCost())
                        .transportMode(stop.getTransportMode())
                        .trip(finalTrip)
                        .orderIndex(stop.getOrderIndex())
                        .build();

                if (stop.getActivities() != null) {
                    List<com.odo.hackathon.model.Activity> newActivities = stop.getActivities().stream()
                            .map(act -> com.odo.hackathon.model.Activity.builder()
                                    .name(act.getName())
                                    .cost(act.getCost())
                                    .category(act.getCategory())
                                    .description(act.getDescription())
                                    .startTime(act.getStartTime())
                                    .durationMinutes(act.getDurationMinutes())
                                    .dayOffset(act.getDayOffset())
                                    .tripStop(newStop)
                                    .build())
                            .collect(Collectors.toList());
                    newStop.setActivities(newActivities);
                }
                return newStop;
            }).collect(Collectors.toList());

            newTrip.setStops(newStops);
            return tripRepository.save(newTrip);
        }

        return newTrip;
    }
}
