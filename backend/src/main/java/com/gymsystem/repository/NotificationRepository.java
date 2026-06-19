package com.gymsystem.repository;

import com.gymsystem.entity.Notification;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;
import org.springframework.stereotype.Repository;

import java.time.LocalDateTime;
import java.util.List;

@Repository
public interface NotificationRepository extends JpaRepository<Notification, Long> {

    List<Notification> findByUserId(Long userId);

    List<Notification> findByUserIdOrderByCreatedAtDesc(Long userId);

    List<Notification> findByStatusAndSendAtLessThanEqual(Notification.NotificationStatus status, LocalDateTime dateTime);

    List<Notification> findByMachineBookingId(Long machineBookingId);

    List<Notification> findByUserIdAndStatus(Long userId, Notification.NotificationStatus status);

    @Query("SELECT n FROM Notification n WHERE n.user.id = :userId AND n.status != 'DELIVERED' ORDER BY n.createdAt DESC")
    List<Notification> findPendingNotificationsForUser(@Param("userId") Long userId);

    long countByUserIdAndStatus(Long userId, Notification.NotificationStatus status);

    @Query("SELECT n FROM Notification n WHERE n.status = 'FAILED' AND n.retryCount < 3 AND n.updatedAt < :retryTime")
    List<Notification> findFailedNotificationsForRetry(@Param("retryTime") LocalDateTime retryTime);
}
