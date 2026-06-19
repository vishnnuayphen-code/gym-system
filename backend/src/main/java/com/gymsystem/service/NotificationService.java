package com.gymsystem.service;

import com.google.auth.oauth2.GoogleCredentials;
import com.google.firebase.FirebaseApp;
import com.google.firebase.FirebaseOptions;
import com.google.firebase.messaging.FirebaseMessaging;
import com.google.firebase.messaging.Message;
import com.google.firebase.messaging.Notification;
import com.gymsystem.entity.MachineBooking;
import com.gymsystem.entity.User;
import com.gymsystem.repository.NotificationRepository;
import jakarta.annotation.PostConstruct;
import org.springframework.core.io.ClassPathResource;
import org.springframework.stereotype.Service;

import java.io.IOException;
import java.time.LocalDate;
import java.time.format.DateTimeFormatter;

@Service
public class NotificationService {

    private final NotificationRepository notificationRepository;

    public NotificationService(NotificationRepository notificationRepository) {
        this.notificationRepository = notificationRepository;
    }

    @PostConstruct
    public void initialize() {
        try {
            FirebaseOptions options = FirebaseOptions.builder()
                    .setCredentials(GoogleCredentials.fromStream(new ClassPathResource("firebase-service-account.json").getInputStream()))
                    .build();

            if (FirebaseApp.getApps().isEmpty()) {
                FirebaseApp.initializeApp(options);
                System.out.println("Firebase Application has been initialized");
            }
        } catch (IOException e) {
            System.err.println("Error initializing Firebase: " + e.getMessage());
        }
    }

    public void sendNotification(String token, String title, String body) {
        try {
            Message message = Message.builder()
                    .setToken(token)
                    .setNotification(Notification.builder()
                            .setTitle(title)
                            .setBody(body)
                            .build())
                    .build();

            String response = FirebaseMessaging.getInstance().send(message);
            System.out.println("Successfully sent message: " + response);
        } catch (Exception e) {
            System.err.println("Error sending FCM message: " + e.getMessage());
        }
    }

    public void sendTopicNotification(String topic, String title, String body) {
        try {
            Message message = Message.builder()
                    .setTopic(topic)
                    .setNotification(Notification.builder()
                            .setTitle(title)
                            .setBody(body)
                            .build())
                    .build();

            String response = FirebaseMessaging.getInstance().send(message);
            System.out.println("Successfully sent topic message: " + response);
        } catch (Exception e) {
            System.err.println("Error sending FCM topic message: " + e.getMessage());
        }
    }

    // Machine Booking Notifications

    public void sendBookingConfirmation(MachineBooking booking) {
        String title = "Booking Confirmed! 🎉";
        String body = String.format("Your %s booking for %s is confirmed",
                booking.getMachine().getName(),
                booking.getBookingDate());

        User user = booking.getTrainee().getUser();
        com.gymsystem.entity.Notification notification = new com.gymsystem.entity.Notification(
                user,
                com.gymsystem.entity.Notification.NotificationType.BOOKING_CONFIRMED,
                com.gymsystem.entity.Notification.DeliveryMethod.PUSH
        );
        notification.setMachineBooking(booking);
        notification.setAiGeneratedMessage(body);
        notificationRepository.save(notification);

        sendNotificationToUser(user, title, body);
    }

    public void sendCancellationNotification(MachineBooking booking) {
        String title = "Booking Cancelled";
        String body = String.format("Your %s booking for %s has been cancelled",
                booking.getMachine().getName(),
                booking.getBookingDate());

        User user = booking.getTrainee().getUser();
        com.gymsystem.entity.Notification notification = new com.gymsystem.entity.Notification(
                user,
                com.gymsystem.entity.Notification.NotificationType.CANCELLATION,
                com.gymsystem.entity.Notification.DeliveryMethod.PUSH
        );
        notification.setMachineBooking(booking);
        notification.setAiGeneratedMessage(body);
        notificationRepository.save(notification);

        sendNotificationToUser(user, title, body);
    }

    public void sendRescheduleNotification(MachineBooking booking) {
        String title = "Booking Rescheduled ✏️";
        String body = String.format("Your %s booking has been rescheduled to %s",
                booking.getMachine().getName(),
                booking.getBookingDate());

        User user = booking.getTrainee().getUser();
        com.gymsystem.entity.Notification notification = new com.gymsystem.entity.Notification(
                user,
                com.gymsystem.entity.Notification.NotificationType.BOOKING_CONFIRMED,
                com.gymsystem.entity.Notification.DeliveryMethod.PUSH
        );
        notification.setMachineBooking(booking);
        notification.setAiGeneratedMessage(body);
        notificationRepository.save(notification);

        sendNotificationToUser(user, title, body);
    }

    public void sendMachineAvailableNotification(User user, Long machineId, LocalDate date) {
        String title = "Machine Available! ⚡";
        String body = String.format("A machine you were waiting for is now available on %s", date);

        com.gymsystem.entity.Notification notification = new com.gymsystem.entity.Notification(
                user,
                com.gymsystem.entity.Notification.NotificationType.MACHINE_AVAILABLE,
                com.gymsystem.entity.Notification.DeliveryMethod.PUSH
        );
        notification.setAiGeneratedMessage(body);
        notificationRepository.save(notification);

        sendNotificationToUser(user, title, body);
    }

    public void sendBookingReminder(MachineBooking booking) {
        String title = "Upcoming Booking Reminder 🔔";
        String body = String.format("Your %s booking starts soon at %s",
                booking.getMachine().getName(),
                booking.getBookingStartTime());

        User user = booking.getTrainee().getUser();
        com.gymsystem.entity.Notification notification = new com.gymsystem.entity.Notification(
                user,
                com.gymsystem.entity.Notification.NotificationType.BOOKING_REMINDER,
                com.gymsystem.entity.Notification.DeliveryMethod.PUSH
        );
        notification.setMachineBooking(booking);
        notification.setAiGeneratedMessage(body);
        notificationRepository.save(notification);

        sendNotificationToUser(user, title, body);
    }

    private void sendNotificationToUser(User user, String title, String body) {
        if (user.getFcmToken() != null && !user.getFcmToken().isEmpty()) {
            sendNotification(user.getFcmToken(), title, body);
        }
    }
}
