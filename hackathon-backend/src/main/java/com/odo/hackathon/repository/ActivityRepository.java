package com.odo.hackathon.repository;

import com.odo.hackathon.model.Activity;
import org.springframework.data.jpa.repository.JpaRepository;
import java.util.List;

public interface ActivityRepository extends JpaRepository<Activity, Long> {
    List<Activity> findByTripStopId(Long tripStopId);
}
