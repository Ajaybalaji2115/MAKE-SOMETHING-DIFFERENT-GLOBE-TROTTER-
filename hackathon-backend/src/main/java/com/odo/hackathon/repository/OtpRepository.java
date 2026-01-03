package com.odo.hackathon.repository;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import com.odo.hackathon.model.Otp;

import java.util.Optional;

@Repository
public interface OtpRepository extends JpaRepository<Otp, Long> {
    Optional<Otp> findByEmailAndOtpCodeAndUsedFalse(String email, String otpCode);

    Optional<Otp> findTopByEmailOrderByExpiryTimeDesc(String email);

}