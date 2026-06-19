package com.gymsystem.controller;

import com.fasterxml.jackson.databind.ObjectMapper;
import com.gymsystem.dto.*;
import com.gymsystem.service.MachineService;
import jakarta.servlet.http.HttpServletRequest;
import jakarta.validation.Valid;
import org.springframework.http.ResponseEntity;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.web.bind.annotation.*;
import org.springframework.web.multipart.MultipartFile;

import java.util.List;

@RestController
@RequestMapping("/api/machines")
public class MachineController {

    private final MachineService machineService;
    private final ObjectMapper objectMapper;

    public MachineController(MachineService machineService, ObjectMapper objectMapper) {
        this.machineService = machineService;
        this.objectMapper = objectMapper;
    }

    private Long getGymId(HttpServletRequest request) {
        Object gymId = request.getAttribute("gymId");
        if (gymId == null) return null;
        return Long.valueOf(gymId.toString());
    }

    @GetMapping
    public ResponseEntity<List<MachineResponse>> getAllMachines(
            @RequestParam(value = "search", required = false) String search,
            HttpServletRequest request) {
        return ResponseEntity.ok(machineService.getAllMachines(getGymId(request), search));
    }

    @GetMapping("/{id:[0-9]+}")
    public ResponseEntity<MachineResponse> getMachineById(@PathVariable("id") Long id, HttpServletRequest request) {
        return ResponseEntity.ok(machineService.getMachineDetail(getGymId(request), id));
    }

    @PostMapping
    @PreAuthorize("hasAnyRole('ADMIN', 'OWNER')")
    public ResponseEntity<MachineResponse> createMachine(
            @RequestParam("machine") String machineJson,
            @RequestPart(value = "image", required = false) MultipartFile image,
            HttpServletRequest servletRequest) throws Exception {
        CreateMachineRequest request = objectMapper.readValue(machineJson, CreateMachineRequest.class);
        return ResponseEntity.ok(machineService.createMachine(getGymId(servletRequest), request, image));
    }

    @PutMapping("/{id:[0-9]+}")
    @PreAuthorize("hasAnyRole('ADMIN', 'OWNER')")
    public ResponseEntity<MachineResponse> updateMachine(
            @PathVariable("id") Long id,
            @RequestBody @Valid UpdateMachineRequest request,
            HttpServletRequest servletRequest) {
        return ResponseEntity.ok(machineService.updateMachine(getGymId(servletRequest), id, request));
    }

    @PostMapping("/{id:[0-9]+}/image")
    @PreAuthorize("hasAnyRole('ADMIN', 'OWNER')")
    public ResponseEntity<MachineResponse> uploadImage(
            @PathVariable("id") Long id,
            @RequestParam("image") MultipartFile image,
            HttpServletRequest request) {
        return ResponseEntity.ok(machineService.uploadMachineImage(getGymId(request), id, image));
    }

    @DeleteMapping("/{id:[0-9]+}")
    @PreAuthorize("hasAnyRole('ADMIN', 'OWNER')")
    public ResponseEntity<Void> deleteMachine(@PathVariable("id") Long id, HttpServletRequest request) {
        machineService.deleteMachine(getGymId(request), id);
        return ResponseEntity.noContent().build();
    }

    // Availability Endpoints
    @GetMapping("/{id:[0-9]+}/availability")
    public ResponseEntity<List<AvailabilitySlotResponse>> getAvailability(
            @PathVariable("id") Long id, 
            HttpServletRequest request) {
        return ResponseEntity.ok(machineService.getMachineAvailability(getGymId(request), id));
    }

    @PostMapping("/{id:[0-9]+}/availability")
    @PreAuthorize("hasAnyRole('ADMIN', 'OWNER')")
    public ResponseEntity<AvailabilitySlotResponse> addSlot(
            @PathVariable("id") Long id,
            @RequestBody @Valid AvailabilitySlotRequest request,
            HttpServletRequest servletRequest) {
        return ResponseEntity.ok(machineService.addAvailabilitySlot(getGymId(servletRequest), id, request));
    }

    @DeleteMapping("/{machineId:[0-9]+}/availability/{slotId:[0-9]+}")
    @PreAuthorize("hasAnyRole('ADMIN', 'OWNER')")
    public ResponseEntity<Void> deleteSlot(
            @PathVariable("machineId") Long machineId,
            @PathVariable("slotId") Long slotId,
            HttpServletRequest request) {
        machineService.deleteAvailabilitySlot(getGymId(request), machineId, slotId);
        return ResponseEntity.noContent().build();
    }
}
