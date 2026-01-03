package com.odo.hackathon.controller;

import com.odo.hackathon.model.City;
import com.odo.hackathon.repository.CityRepository;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@RestController
@RequestMapping("/api/cities")
@CrossOrigin(origins = "http://localhost:5173")
public class SearchController {

    @Autowired
    private CityRepository cityRepository;

    @GetMapping("/search")
    public ResponseEntity<List<City>> searchCities(@RequestParam String query) {
        // Simple search by name
        List<City> cities = cityRepository.findByNameContainingIgnoreCase(query);
        return ResponseEntity.ok(cities);
    }

    @GetMapping
    public ResponseEntity<List<City>> getAllCities() {
        return ResponseEntity.ok(cityRepository.findAll());
    }
}