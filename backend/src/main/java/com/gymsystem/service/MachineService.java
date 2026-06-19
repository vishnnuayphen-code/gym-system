package com.gymsystem.service;

import com.gymsystem.dto.*;
import com.gymsystem.entity.*;
import com.gymsystem.repository.*;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;
import org.springframework.web.multipart.MultipartFile;

import java.time.LocalDate;
import java.time.LocalTime;
import java.util.List;
import java.util.stream.Collectors;

@Service
@Transactional
public class MachineService {

    private final MachineRepository machineRepository;
    private final MachineAvailabilityRepository availabilityRepository;
    private final MachineBookingRepository bookingRepository;
    private final GymRepository gymRepository;
    private final FileStorageService fileStorageService;

    public MachineService(
            MachineRepository machineRepository,
            MachineAvailabilityRepository availabilityRepository,
            MachineBookingRepository bookingRepository,
            GymRepository gymRepository,
            FileStorageService fileStorageService) {
        this.machineRepository = machineRepository;
        this.availabilityRepository = availabilityRepository;
        this.bookingRepository = bookingRepository;
        this.gymRepository = gymRepository;
        this.fileStorageService = fileStorageService;
    }

    public List<MachineResponse> getAllMachines(Long gymId, String search) {
        List<Machine> machines;
        if (search != null && !search.isEmpty()) {
            machines = machineRepository.searchByGymId(gymId, search);
        } else {
            machines = machineRepository.findByGymId(gymId);
        }
        return machines.stream()
                .map(this::mapToResponseSimple)
                .collect(Collectors.toList());
    }

    public MachineResponse createMachine(Long gymId, CreateMachineRequest request, MultipartFile image) {
        Gym gym = gymRepository.findById(gymId)
                .orElseThrow(() -> new RuntimeException("Gym not found"));

        Machine machine = new Machine();
        machine.setName(request.getName());
        machine.setType(request.getType());
        machine.setDescription(request.getDescription());
        machine.setQuantity(request.getQuantity());
        machine.setStatus(request.getStatus());
        machine.setSerialNumber(request.getSerialNumber());
        machine.setLocationInGym(request.getLocationInGym());
        machine.setGym(gym);

        if (image != null && !image.isEmpty()) {
            String fileName = fileStorageService.storeFile(image);
            machine.setImageUrl(fileName);
        }

        Machine saved = machineRepository.save(machine);
        return mapToResponse(saved);
    }

    public MachineResponse updateMachine(Long gymId, Long id, UpdateMachineRequest request) {
        Machine machine = machineRepository.findById(id)
                .filter(m -> m.getGym().getId().equals(gymId))
                .orElseThrow(() -> new RuntimeException("Machine not found or access denied"));

        machine.setName(request.getName());
        machine.setType(request.getType());
        machine.setDescription(request.getDescription());
        machine.setQuantity(request.getQuantity());
        machine.setStatus(request.getStatus());
        machine.setSerialNumber(request.getSerialNumber());
        machine.setLocationInGym(request.getLocationInGym());

        return mapToResponse(machineRepository.save(machine));
    }

    public MachineResponse uploadMachineImage(Long gymId, Long id, MultipartFile image) {
        Machine machine = machineRepository.findById(id)
                .filter(m -> m.getGym().getId().equals(gymId))
                .orElseThrow(() -> new RuntimeException("Machine not found"));

        String fileName = fileStorageService.storeFile(image);
        machine.setImageUrl(fileName);
        
        return mapToResponse(machineRepository.save(machine));
    }

    public void deleteMachine(Long gymId, Long id) {
        Machine machine = machineRepository.findById(id)
                .filter(m -> m.getGym().getId().equals(gymId))
                .orElseThrow(() -> new RuntimeException("Machine not found"));
        
        machine.setStatus(Machine.Status.RETIRED);
        machineRepository.save(machine);
    }

    public AvailabilitySlotResponse addAvailabilitySlot(Long gymId, Long machineId, AvailabilitySlotRequest request) {
        Machine machine = machineRepository.findById(machineId)
                .filter(m -> m.getGym().getId().equals(gymId))
                .orElseThrow(() -> new RuntimeException("Machine not found"));

        LocalTime startTime = LocalTime.parse(request.getStartTime());
        LocalTime endTime = LocalTime.parse(request.getEndTime());

        // Overlap Validation
        List<MachineAvailability> existing = availabilityRepository.findByMachineIdAndIsActiveTrue(machineId);
        for (MachineAvailability slot : existing) {
            if (slot.getDayOfWeek().equalsIgnoreCase(request.getDayOfWeek())) {
                if (startTime.isBefore(slot.getEndTime()) && endTime.isAfter(slot.getStartTime())) {
                    throw new RuntimeException("Slot overlaps with an existing active slot for this machine on " + request.getDayOfWeek());
                }
            }
        }

        MachineAvailability availability = new MachineAvailability();
        availability.setMachine(machine);
        availability.setDayOfWeek(request.getDayOfWeek().toUpperCase());
        availability.setStartTime(startTime);
        availability.setEndTime(endTime);
        availability.setMaxBookings(request.getMaxBookings());
        availability.setActive(request.isActive());

        return mapToSlotResponse(availabilityRepository.save(availability), LocalDate.now());
    }

    public MachineResponse getMachineDetail(Long gymId, Long id) {
        Machine machine = machineRepository.findById(id)
                .filter(m -> m.getGym().getId().equals(gymId))
                .orElseThrow(() -> new RuntimeException("Machine not found"));

        return mapToResponse(machine);
    }

    public List<AvailabilitySlotResponse> getMachineAvailability(Long gymId, Long machineId) {
        machineRepository.findById(machineId)
                .filter(m -> m.getGym().getId().equals(gymId))
                .orElseThrow(() -> new RuntimeException("Machine not found"));

        LocalDate today = LocalDate.now();
        return availabilityRepository.findByMachineId(machineId).stream()
                .map(slot -> mapToSlotResponse(slot, today))
                .collect(Collectors.toList());
    }

    public void deleteAvailabilitySlot(Long gymId, Long machineId, Long slotId) {
        MachineAvailability slot = availabilityRepository.findById(slotId)
                .filter(s -> s.getMachine().getId().equals(machineId) && s.getMachine().getGym().getId().equals(gymId))
                .orElseThrow(() -> new RuntimeException("Slot not found or access denied"));
        
        availabilityRepository.delete(slot);
    }

    private MachineResponse mapToResponse(Machine machine) {
        MachineResponse response = mapToResponseSimple(machine);
        
        LocalDate today = LocalDate.now();
        List<AvailabilitySlotResponse> slots = availabilityRepository.findByMachineId(machine.getId()).stream()
                .map(slot -> mapToSlotResponse(slot, today))
                .collect(Collectors.toList());
        
        response.setAvailabilitySlots(slots);
        
        // Sum currentBookings from all slots for today
        int sumToday = slots.stream().mapToInt(AvailabilitySlotResponse::getCurrentBookings).sum();
        response.setTotalBookingsToday(sumToday);
        
        return response;
    }

    private MachineResponse mapToResponseSimple(Machine machine) {
        MachineResponse response = new MachineResponse();
        response.setId(machine.getId());
        response.setName(machine.getName());
        response.setType(machine.getType());
        response.setDescription(machine.getDescription());
        response.setQuantity(machine.getQuantity());
        response.setImageUrl(machine.getImageUrl());
        response.setStatus(machine.getStatus().name());
        response.setSerialNumber(machine.getSerialNumber());
        response.setLocationInGym(machine.getLocationInGym());
        return response;
    }

    private AvailabilitySlotResponse mapToSlotResponse(MachineAvailability slot, LocalDate date) {
        AvailabilitySlotResponse response = new AvailabilitySlotResponse();
        response.setId(slot.getId());
        response.setDayOfWeek(slot.getDayOfWeek());
        response.setStartTime(slot.getStartTime().toString());
        response.setEndTime(slot.getEndTime().toString());
        response.setMaxBookings(slot.getMaxBookings());
        response.setActive(slot.isActive());
        
        int currentBookings = (int) bookingRepository.countByAvailabilityIdAndBookingDateAndStatus(
            slot.getId(),
            date,
            MachineBooking.BookingStatus.CONFIRMED
        );
        response.setCurrentBookings(currentBookings);
        response.setFull(currentBookings >= slot.getMaxBookings());
        
        return response;
    }
}
