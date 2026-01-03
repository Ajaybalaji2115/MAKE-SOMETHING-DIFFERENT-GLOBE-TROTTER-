package com.odo.hackathon.model;

import jakarta.persistence.*;
import lombok.*;
import com.fasterxml.jackson.annotation.JsonIgnore;

@Entity
@Data
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class Activity {
    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "trip_stop_id")
    @JsonIgnore
    private TripStop tripStop;

    private String name;
    private Double cost;
    private String category; // e.g. "Sightseeing", "Food", "Adventure"

    @Column(length = 1000)
    private String description;

    private java.time.LocalTime startTime;
    private Integer durationMinutes; // Duration in minutes
    private Integer dayOffset; // 0 for arrival day, 1 for next day, etc.
}