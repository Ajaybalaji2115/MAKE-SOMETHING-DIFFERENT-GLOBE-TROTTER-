package com.odo.hackathon.dto;

import lombok.Data;
import java.time.LocalDate;

@Data
public class TripDto {
    private Long id;
    private String name;
    private String description;
    private LocalDate startDate;
    private LocalDate endDate;
    private Double budget;
    private String coverPhotoUrl;
}
