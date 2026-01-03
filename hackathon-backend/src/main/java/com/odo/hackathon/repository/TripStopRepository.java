package com.odo.hackathon.repository;

import com.odo.hackathon.model.TripStop;
import org.springframework.data.jpa.repository.JpaRepository;
import java.util.List;

public interface TripStopRepository extends JpaRepository<TripStop, Long> {
    List<TripStop> findByTripIdOrderByOrderIndexAsc(Long tripId);
}
