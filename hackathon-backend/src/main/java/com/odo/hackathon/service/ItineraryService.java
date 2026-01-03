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

    public TripStop addStop(Long tripId, Long cityId, String cityName, LocalDate arrival, LocalDate departure) {
        Trip trip = tripRepository.findById(tripId).orElseThrow(() -> new RuntimeException("Trip not found"));
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
                .orderIndex(0) // Logic to determine order needed, simplifed for now
                .build();

        return tripStopRepository.save(stop);
    }

    public void removeStop(Long stopId) {
        tripStopRepository.deleteById(stopId);
    }

    public Activity addActivity(Long stopId, String name, Double cost, String category, String description) {
        TripStop stop = tripStopRepository.findById(stopId).orElseThrow(() -> new RuntimeException("Stop not found"));

        Activity activity = Activity.builder()
                .tripStop(stop)
                .name(name)
                .cost(cost)
                .category(category)
                .description(description)
                .build();

        return activityRepository.save(activity);
    }

    public void removeActivity(Long activityId) {
        activityRepository.deleteById(activityId);
    }
}
