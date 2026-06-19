package com.gymsystem.service;

import com.gymsystem.dto.GymSettingsRequest;
import com.gymsystem.dto.GymResponse;
import com.gymsystem.entity.Gym;
import com.gymsystem.repository.GymRepository;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.time.LocalTime;

@Service
@Transactional
public class GymService {

    private final GymRepository gymRepository;

    public GymService(GymRepository gymRepository) {
        this.gymRepository = gymRepository;
    }

    public GymResponse getGymSettings(Long gymId) {
        Gym gym = gymRepository.findById(gymId)
                .orElseThrow(() -> new RuntimeException("Gym not found"));
        return mapToResponse(gym);
    }

    public GymResponse updateGymSettings(Long gymId, GymSettingsRequest request) {
        Gym gym = gymRepository.findById(gymId)
                .orElseThrow(() -> new RuntimeException("Gym not found"));

        if (request.getName() != null) {
            gym.setName(request.getName());
        }
        if (request.getAddress() != null) {
            gym.setAddress(request.getAddress());
        }
        if (request.getPhone() != null) {
            gym.setPhone(request.getPhone());
        }
        if (request.getOpeningTime() != null) {
            gym.setOpeningTime(LocalTime.parse(request.getOpeningTime()));
        }
        if (request.getClosingTime() != null) {
            gym.setClosingTime(LocalTime.parse(request.getClosingTime()));
        }

        Gym updated = gymRepository.save(gym);
        return mapToResponse(updated);
    }

    private GymResponse mapToResponse(Gym gym) {
        GymResponse response = new GymResponse();
        response.setId(gym.getId());
        response.setName(gym.getName());
        response.setAddress(gym.getAddress());
        response.setPhone(gym.getPhone());
        response.setOpeningTime(gym.getOpeningTime() != null ? gym.getOpeningTime().toString() : "06:00");
        response.setClosingTime(gym.getClosingTime() != null ? gym.getClosingTime().toString() : "22:00");
        response.setIsActive(gym.getIsActive());
        return response;
    }
}
