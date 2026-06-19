package com.gymsystem.service;

import com.gymsystem.dto.CreateTenantRequest;
import com.gymsystem.dto.UpdateGymRequest;
import com.gymsystem.dto.GymDetailsResponse;
import com.gymsystem.dto.CreateAdminRequest;
import com.gymsystem.dto.UpdateAdminRequest;
import com.gymsystem.entity.Gym;
import com.gymsystem.entity.Payment;
import com.gymsystem.entity.Role;
import com.gymsystem.entity.User;
import com.gymsystem.repository.GymRepository;
import com.gymsystem.repository.RoleRepository;
import com.gymsystem.repository.UserRepository;
import com.gymsystem.repository.PaymentRepository;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.HttpStatus;
import org.springframework.web.server.ResponseStatusException;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.math.BigDecimal;
import java.time.LocalDate;
import java.util.HashMap;
import java.util.List;
import java.util.Map;
import java.util.stream.Collectors;

@Service
public class SuperAdminService {

    @Autowired
    private GymRepository gymRepository;

    @Autowired
    private UserRepository userRepository;

    @Autowired
    private RoleRepository roleRepository;

    @Autowired
    private PasswordEncoder passwordEncoder;

    @Autowired
    private PaymentRepository paymentRepository;

    public Map<String, Object> getDashboardStats() {
        long totalGyms = gymRepository.count();
        long totalMembers = userRepository.countByRoleName("TRAINEE");
        long totalCoaches = userRepository.countByRoleName("COACH");
        
        // Calculate revenue for the current month
        LocalDate monthStart = LocalDate.now().withDayOfMonth(1);
        LocalDate monthEnd = LocalDate.now();
        List<Payment> monthPayments = paymentRepository.findAll().stream()
                .filter(p -> p.getPaymentDate().isAfter(monthStart.minusDays(1)) && p.getPaymentDate().isBefore(monthEnd.plusDays(1)))
                .collect(Collectors.toList());
                
        BigDecimal totalRevenue = monthPayments.stream()
                .map(Payment::getAmount)
                .reduce(BigDecimal.ZERO, BigDecimal::add);
                
        String monthlyRevenue = "$" + totalRevenue.toString();

        List<Gym> recentGyms = gymRepository.findAll().stream()
                .sorted((g1, g2) -> {
                    if (g1.getCreatedAt() == null && g2.getCreatedAt() == null) return 0;
                    if (g1.getCreatedAt() == null) return 1;
                    if (g2.getCreatedAt() == null) return -1;
                    return g2.getCreatedAt().compareTo(g1.getCreatedAt());
                })
                .limit(5)
                .collect(Collectors.toList());

        Map<String, Object> stats = new HashMap<>();
        stats.put("totalGyms", totalGyms);
        stats.put("totalMembers", totalMembers);
        stats.put("totalCoaches", totalCoaches);
        stats.put("monthlyRevenue", monthlyRevenue);
        stats.put("recentGyms", recentGyms);

        return stats;
    }

    public List<Gym> getAllGyms() {
        return gymRepository.findAll();
    }

    @Transactional
    /**
     * Create gym only (without creating owner)
     */
    public Gym createGymOnly(UpdateGymRequest request) {
        Gym gym = new Gym();
        gym.setName(request.getGymName());
        gym.setAddress(request.getGymAddress());
        gym.setPhone(request.getGymPhone());
        gym.setIsActive(true);
        return gymRepository.save(gym);
    }

    public Gym createTenant(CreateTenantRequest request) {
        // 1. Create the Gym
        Gym gym = new Gym();
        gym.setName(request.getGymName());
        gym.setAddress(request.getGymAddress());
        gym.setPhone(request.getGymPhone());
        gym.setIsActive(true);
        Gym savedGym = gymRepository.save(gym);

        // 2. Create the Owner User
        Role ownerRole = roleRepository.findByName("OWNER")
                .orElseGet(() -> roleRepository.save(new Role("OWNER")));

        User owner = new User();
        owner.setName(request.getOwnerName());
        owner.setEmail(request.getOwnerEmail());
        owner.setPasswordHash(passwordEncoder.encode(request.getOwnerPassword()));
        owner.setRole(ownerRole);
        owner.setGym(savedGym);
        userRepository.save(owner);

        return savedGym;
    }

    @Transactional
    public Gym toggleGymStatus(Long gymId) {
        Gym gym = gymRepository.findById(gymId)
                .orElseThrow(() -> new RuntimeException("Gym not found"));
        gym.setIsActive(gym.getIsActive() == null ? false : !gym.getIsActive());
        return gymRepository.save(gym);
    }

    @Transactional
    public Gym updateGym(Long gymId, UpdateGymRequest request) {
        Gym gym = gymRepository.findById(gymId)
                .orElseThrow(() -> new RuntimeException("Gym not found"));
        gym.setName(request.getGymName());
        gym.setAddress(request.getGymAddress());
        gym.setPhone(request.getGymPhone());
        return gymRepository.save(gym);
    }

    public GymDetailsResponse getGymDetails(Long gymId) {
        Gym gym = gymRepository.findById(gymId)
                .orElseThrow(() -> new RuntimeException("Gym not found"));

        long totalMembers = userRepository.countByRoleNameAndGymId("TRAINEE", gymId);
        long totalCoaches = userRepository.countByRoleNameAndGymId("COACH", gymId);

        // Calculate actual revenue from payments
        java.math.BigDecimal totalRevenue = paymentRepository.sumAmountByGymId(gymId);
        String revenue = totalRevenue != null ? "$" + totalRevenue.setScale(0, java.math.RoundingMode.HALF_UP) : "$0";

        // Count active sessions for this gym
        long activeSessions = paymentRepository.countActiveSessionsByGymId(gymId);

        return new GymDetailsResponse(gym, totalMembers, totalCoaches, revenue, (int) activeSessions);
    }

    public List<User> getAllMembers() {
        return userRepository.findByRoleName("TRAINEE");
    }

    public List<User> getAllCoaches() {
        return userRepository.findByRoleName("COACH");
    }

    public List<User> getAllAdmins() {
        return userRepository.findAll().stream()
                .filter(u -> "OWNER".equals(u.getRole().getName()) || "ADMIN".equals(u.getRole().getName()))
                .collect(Collectors.toList());
    }

    @Transactional
    public User createAdmin(CreateAdminRequest request) {
        if (userRepository.existsByEmail(request.getEmail())) {
            throw new ResponseStatusException(HttpStatus.CONFLICT, "Email already exists");
        }
        Gym gym = gymRepository.findById(request.getGymId())
                .orElseThrow(() -> new ResponseStatusException(HttpStatus.NOT_FOUND, "Gym not found"));
        Role adminRole = roleRepository.findByName("ADMIN")
                .orElseGet(() -> roleRepository.save(new Role("ADMIN")));
        
        User admin = new User();
        admin.setName(request.getName());
        admin.setEmail(request.getEmail());
        admin.setPasswordHash(passwordEncoder.encode(request.getPassword()));
        admin.setRole(adminRole);
        admin.setGym(gym);
        return userRepository.save(admin);
    }

    @Transactional
    public User updateAdmin(Long adminId, UpdateAdminRequest request) {
        User admin = userRepository.findById(adminId)
                .orElseThrow(() -> new ResponseStatusException(HttpStatus.NOT_FOUND, "Admin not found"));
        
        if (request.getGymId() != null) {
            Gym gym = gymRepository.findById(request.getGymId())
                    .orElseThrow(() -> new ResponseStatusException(HttpStatus.NOT_FOUND, "Gym not found"));
            admin.setGym(gym);
        }
        if (request.getName() != null) admin.setName(request.getName());
        if (request.getEmail() != null && !request.getEmail().equals(admin.getEmail())) {
            if (userRepository.existsByEmail(request.getEmail())) {
                throw new ResponseStatusException(HttpStatus.CONFLICT, "Email already exists");
            }
            admin.setEmail(request.getEmail());
        }
        if (request.getPassword() != null && !request.getPassword().isEmpty()) {
            admin.setPasswordHash(passwordEncoder.encode(request.getPassword()));
        }
        return userRepository.save(admin);
    }

    @Transactional
    public User toggleAdminStatus(Long adminId) {
        User admin = userRepository.findById(adminId)
                .orElseThrow(() -> new ResponseStatusException(HttpStatus.NOT_FOUND, "Admin not found"));
        admin.setIsActive(admin.getIsActive() == null ? false : !admin.getIsActive());
        return userRepository.save(admin);
    }

    @Transactional
    public User resetAdminPassword(Long adminId, String newPassword) {
        User admin = userRepository.findById(adminId)
                .orElseThrow(() -> new ResponseStatusException(HttpStatus.NOT_FOUND, "Admin not found"));
        admin.setPasswordHash(passwordEncoder.encode(newPassword));
        return userRepository.save(admin);
    }
}
