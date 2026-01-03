package com.odo.hackathon.controller;

import com.odo.hackathon.model.City;
import com.odo.hackathon.repository.CityRepository;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;

import java.util.Collections;
import java.util.List;
import java.util.stream.Collectors;

@RestController
@RequestMapping("/api/recommendations")
public class RecommendationController {

    @Autowired
    private CityRepository cityRepository;

    @GetMapping("/destinations")
    public List<RecommendedDestinationDto> getRecommendedDestinations() {
        try {
            org.springframework.web.client.RestTemplate restTemplate = new org.springframework.web.client.RestTemplate();

            // 1. Fetch real countries dynamically from PUBLIC API
            // Using Europe region for generally popular tourist destinations
            String url = "https://restcountries.com/v3.1/region/europe";
            java.util.List<java.util.Map> response = restTemplate.getForObject(url, java.util.List.class); // Explicit
                                                                                                           // casting

            if (response != null && !response.isEmpty()) {
                Collections.shuffle(response);
                List<java.util.Map> selectedCountries = response.stream().limit(4).collect(Collectors.toList());

                List<RecommendedDestinationDto> recommendations = new java.util.ArrayList<>();
                for (java.util.Map country : selectedCountries) {
                    java.util.Map nameMap = (java.util.Map) country.get("name");
                    String commonName = (String) nameMap.get("common");

                    // Dynamic Image URL using LoremFlickr (Unsplash source is deprecated)
                    // We add a random lock/sig to ensure browser doesn't cache if names are
                    // repeated or similar
                    int randomId = new java.util.Random().nextInt(1000);
                    String imageUrl = "https://loremflickr.com/800/600/" + commonName.replace(" ", ",")
                            + ",travel/all?lock=" + randomId;

                    recommendations.add(new RecommendedDestinationDto(commonName, "Europe", imageUrl)); // Use "Europe" or fetch region
                }
                return recommendations;
            }
        } catch (Exception e) {
            System.out.println("External API failed: " + e.getMessage());
        }

        // 2. Fallback to Database (only if API breakdown)
        List<City> allCities = cityRepository.findAll();
        Collections.shuffle(allCities);
        return allCities.stream()
                .limit(4)
                .map(city -> new RecommendedDestinationDto(city.getName(), city.getCountry(), city.getImageUrl()))
                .collect(Collectors.toList());
    }

    @lombok.Data
    @lombok.AllArgsConstructor
    static class RecommendedDestinationDto {
        private String name;
        private String country;
        private String imageUrl;
    }
}
