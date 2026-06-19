package com.gymsystem.repository;

import com.gymsystem.entity.User;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.util.Optional;

@Repository
public interface UserRepository extends JpaRepository<User, Long> {
    Optional<User> findByEmail(String email);
    boolean existsByEmail(String email);
    long countByRoleName(String roleName);
    long countByRoleNameAndGymId(String roleName, Long gymId);
    java.util.List<User> findByRoleName(String roleName);
    java.util.List<User> findTop10ByGymIdOrderByCreatedAtDesc(Long gymId);
}
