package com.odo.hackathon.service;

import com.odo.hackathon.model.User;
import com.odo.hackathon.repository.UserRepository;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.stereotype.Service;

import java.util.ArrayList;
import java.util.List;

@Service
public class UserService {

    @Autowired
    private UserRepository userRepository;

    public User getUserById(Long id) {
        return userRepository.findById(id).orElseThrow(() -> new RuntimeException("User not found"));
    }

    public User getUserByEmail(String email) {
        return userRepository.findByEmail(email).orElseThrow(() -> new RuntimeException("User not found"));
    }

    public User updateProfile(Long userId, String name, String profilePhotoUrl, String languagePreference) {
        User user = getUserById(userId);
        if (name != null && !name.isEmpty())
            user.setName(name);
        if (profilePhotoUrl != null)
            user.setProfilePhotoUrl(profilePhotoUrl);
        if (languagePreference != null)
            user.setLanguagePreference(languagePreference);
        return userRepository.save(user);
    }

    public void deleteUser(Long userId) {
        userRepository.deleteById(userId);
    }

    public User addSavedDestination(Long userId, String destination) {
        User user = getUserById(userId);
        if (user.getSavedDestinations() == null) {
            user.setSavedDestinations(new ArrayList<>());
        }
        if (!user.getSavedDestinations().contains(destination)) {
            user.getSavedDestinations().add(destination);
        }
        return userRepository.save(user);
    }

    public User removeSavedDestination(Long userId, String destination) {
        User user = getUserById(userId);
        if (user.getSavedDestinations() != null) {
            user.getSavedDestinations().remove(destination);
        }
        return userRepository.save(user);
    }
}
