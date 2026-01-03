package com.odo.hackathon.repository;

import org.springframework.data.jpa.repository.JpaRepository;

import com.odo.hackathon.model.User;

import java.util.List;
import java.util.Optional;

public interface UserRepository extends JpaRepository<User, Long> {
    Optional<User> findByEmail(String email);

    List<User> findByRole(String role);

    List<User> findByAssignedTrainerId(Long trainerId);
}
