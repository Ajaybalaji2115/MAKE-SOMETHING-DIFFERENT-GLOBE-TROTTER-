package com.odo.hackathon.model;

import jakarta.persistence.GenerationType;
import jakarta.persistence.Id;
import lombok.*;
import jakarta.persistence.Entity;
import jakarta.persistence.GeneratedValue;

@Entity
@Data
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class User {
    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;
    private String name;
    private String email;
    private String password;
    private String role;

    private Long assignedTrainerId;

    private boolean enabled; // For OTP verification

    private String profilePhotoUrl;
    private String languagePreference;

    @jakarta.persistence.ElementCollection
    private java.util.List<String> savedDestinations;
}
