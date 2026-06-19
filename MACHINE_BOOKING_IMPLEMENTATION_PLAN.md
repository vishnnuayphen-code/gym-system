# MACHINE PRE-BOOKING SYSTEM & DASHBOARD ENHANCEMENT PLAN

## Executive Summary
This plan outlines the implementation of a machine pre-booking system to resolve gym machine scheduling conflicts, combined with enhanced dashboards and AI-powered notifications.

---

## PHASE 1: DATABASE SCHEMA ENHANCEMENTS

### 1.1 Extend MachineBooking Entity
Add fields:
- `bookingStartTime` (LocalTime) - specific time slot start
- `bookingEndTime` (LocalTime) - specific time slot end
- `bookedByCoachId` (ManyToOne to CoachProfile) - track who made the booking
- `notes` (String) - trainer/trainee notes
- `cancellationReason` (String) - reason for cancellation
- `cancelledAt` (LocalDateTime) - when it was cancelled
- `updatedAt` (LocalDateTime) - last modification time

### 1.2 Create New Notification Entity
**Table**: `machine_booking_notifications`
```
- id (Long, PK)
- machineBookingId (FK)
- userId (FK)
- type (BOOKING_CONFIRMED, MACHINE_AVAILABLE, BOOKING_REMINDER, CANCELLATION)
- deliveryMethod (PUSH, EMAIL, VOICE)
- status (PENDING, SENT, FAILED, DELIVERED)
- aiGeneratedMessage (String)
- sendAt (LocalDateTime)
- sentAt (LocalDateTime)
- failureReason (String)
- retryCount (int)
```

### 1.3 Create Booking Waitlist Entity
**Table**: `machine_booking_waitlist`
```
- id (Long, PK)
- traineeId (FK)
- machineId (FK)
- availabilityId (FK)
- requestedDate (LocalDate)
- position (int) - queue position
- status (WAITING, NOTIFIED, BOOKED, EXPIRED)
- createdAt (LocalDateTime)
- expiresAt (LocalDateTime)
```

### 1.4 Create Booking Analytics Entity
**Table**: `machine_booking_analytics`
```
- id (Long, PK)
- machineId (FK)
- date (LocalDate)
- totalBookings (int)
- completedBookings (int)
- cancelledBookings (int)
- peakHours (String, JSON)
- averageUtilization (float)
```

### 1.5 Extend Machine Entity
Add real-time tracking:
- `currentUserId` (FK) - who's using it now
- `usageStartTime` (LocalDateTime) - when started
- `isAvailableNow` (Boolean, transient) - computed availability

---

## PHASE 2: BACKEND API ENDPOINTS

### 2.1 Machine Booking Endpoints
```
POST   /api/machines/bookings/book
       - Book a machine (TRAINEE, COACH)
       - Check availability, reserve slot, create notifications

GET    /api/machines/bookings/my-bookings
       - Get trainee's bookings (TRAINEE)

GET    /api/machines/{machineId}/available-slots
       - Get available time slots (PUBLIC)

PUT    /api/machines/bookings/{bookingId}/cancel
       - Cancel booking (TRAINEE, COACH, ADMIN)
       - Release slot, trigger waitlist

PUT    /api/machines/bookings/{bookingId}/reschedule
       - Reschedule booking (TRAINEE, COACH)

POST   /api/machines/bookings/coach-book
       - Coach pre-books for trainee (COACH, ADMIN)
```

### 2.2 Waitlist Management
```
POST   /api/machines/waitlist/join
       - Join waitlist for unavailable slot

GET    /api/machines/waitlist/my-position
       - Check position in queue

DELETE /api/machines/waitlist/{waitlistId}
       - Leave waitlist
```

### 2.3 Real-time Machine Status
```
GET    /api/machines/{machineId}/real-time-availability
       - Current bookings, occupancy %, available slots

POST   /api/machines/{machineId}/set-current-user
       - Mark machine in use

PUT    /api/machines/{machineId}/release
       - Release machine, notify waitlist
```

---

## PHASE 3: MOBILE FRONTEND COMPONENTS

### New Screens
- **MachineBookingScreen** - Select machine and book time slot
- **MachineAvailabilityCalendar** - Calendar view of availability (green/yellow/red)
- **BookedMachinesWidget** - Show upcoming bookings on trainee home
- **WaitlistPositionComponent** - Show position in queue
- **CoachMachineAssignmentScreen** - Coach assigns machines to trainees

### Dashboard Updates

**Trainee Home** (`/mobile/app/(trainee)/home.tsx`):
- Add "BOOKED MACHINES" section
- Show next 3 upcoming bookings
- Display machine image, name, time, location
- Quick cancel/reschedule buttons
- Add "Book Machine" to quick actions

**Coach Dashboard** (`/mobile/app/(coach)/dashboard.tsx`):
- Add "TRAINEE MACHINE ASSIGNMENTS" section
- Show machines assigned today
- Add "MACHINE UTILIZATION" metrics
- Most booked machines, peak hours

---

## PHASE 4: NOTIFICATION SYSTEM

### 4.1 NotificationService
```java
@Service
public class NotificationService {
  - sendBookingConfirmation(MachineBooking)
  - sendBookingReminder(MachineBooking) // 30 min before
  - notifyWaitlistedUsers(MachineBooking) // on cancellation
  - sendCancellationNotification(MachineBooking)
  - sendVoiceNotification(User, message) // personal sessions
  - sendEmailNotification(User, subject, template)
  - sendPushNotification(User, title, body)
}
```

### 4.2 Notification Delivery Methods
- **Push Notifications**: Firebase Cloud Messaging (FCM)
- **Email**: SMTP configured with HTML templates
- **Voice**: Twilio API for personal training sessions

### 4.3 Scheduled Jobs
- Daily off-peak analysis of waitlisted bookings
- Send smart AI-generated reminders
- Analyze machine usage patterns

---

## PHASE 5: AI AGENT IMPLEMENTATION

### 5.1 AI Integration (Claude API)
```java
@Service
public class AINotificationAgent {
  - generateSmartNotificationMessage(BookingContext) -> String
  - analyzeMachineUsagePatterns(MachineId, dateRange) -> Report
  - suggestOptimalBookingTimes(TraineeId, preferences) -> List<TimeSlot>
  - generatePersonalizedReminder(Booking, userProfile) -> String
}
```

### 5.2 Smart Notification Examples
- "Hey John! Your leg day machine (Leg Press) is available in 15 mins!"
- "Your usual Treadmill time slot (Tue 6-7PM) is free next week"
- "The Smith Machine is now available for immediate booking"

### 5.3 AI-Powered Features
- Pattern analysis (when users book, preferred machines)
- Waitlist intelligence (predict availability, suggest alternatives)
- Personalized reminders (1hr, 30min, morning of)
- Usage analytics (peak times, machine popularity)

---

## PHASE 6: ADMIN DASHBOARD (Frontend Web)

### New Features
```
/dashboard/admin/machines/bookings
  - List all machine bookings
  - Filter by date, machine, trainee, coach
  - View booking details, conflicts
  - Manually override bookings
  - Export booking reports

/dashboard/admin/machines/analytics
  - Total bookings (today/week/month)
  - Machine utilization rate %
  - Top 5 most booked machines
  - Booking vs cancellation ratio
  - Waitlist statistics
  - Peak hours heatmap
```

---

## IMPLEMENTATION SEQUENCE

### Sprint 1 (Week 1-2): Core Backend
- [ ] Extend MachineBooking entity
- [ ] Create Notification, Waitlist, Analytics entities
- [ ] Implement MachineBookingService
- [ ] Create API endpoints
- [ ] Add role-based access control

### Sprint 2 (Week 3-4): Notifications & AI
- [ ] Implement NotificationService
- [ ] Configure Firebase FCM
- [ ] Set up email service
- [ ] Implement AINotificationAgent (Claude API)
- [ ] Create notification templates
- [ ] Add scheduled jobs

### Sprint 3 (Week 5-6): Mobile Frontend
- [ ] Update bookingStore (Zustand)
- [ ] Build MachineBookingScreen
- [ ] Build AvailabilityCalendarScreen
- [ ] Create booking components
- [ ] Integrate with APIs
- [ ] Test booking flows

### Sprint 4 (Week 7-8): Dashboards & Polish
- [ ] Update trainee home dashboard
- [ ] Update coach dashboard
- [ ] Create admin dashboard pages
- [ ] Add analytics visualizations
- [ ] Full integration testing
- [ ] Performance optimization

---

## CRITICAL CONSIDERATIONS

### Race Condition Handling
- Use database-level locking for booking creation
- Implement optimistic locking with version fields
- Test concurrent booking scenarios

### Real-time Updates
- Consider WebSocket for live availability
- Push notifications for slot changes
- Optimistic UI updates with rollback

### Scalability
- Index: (machineId, bookingDate), (traineeId, status)
- Implement caching for availability slots
- Pagination for booking lists

### Data Consistency
- Use transactions for booking + notifications
- Idempotent notification sending
- Archive bookings after 90 days

---

## KEY FILES TO MODIFY

### Backend
- `backend/src/main/java/com/gymsystem/entity/MachineBooking.java`
- `backend/src/main/java/com/gymsystem/controller/MachineController.java`
- `backend/src/main/java/com/gymsystem/service/MachineService.java`

### Mobile
- `mobile/app/(trainee)/home.tsx` - Dashboard
- `mobile/src/stores/bookingStore.ts` - State management
- `mobile/app/(trainee)/booking/` - Booking screens

### Frontend Admin
- `frontend/app/dashboard/page.tsx` - Admin dashboard
- `frontend/components/admin/dashboard/MachineBookingAnalytics.tsx` - New

---

## SUCCESS METRICS

✅ **Functional**
- Trainees can book machines with zero conflicts
- Coaches can pre-assign machines to trainees
- Waitlist automatically notifies users when slots open
- AI generates contextual notifications

✅ **Performance**
- Booking confirmation < 2 seconds
- Machine availability updates < 1 second
- Notification delivery < 30 seconds

✅ **User Experience**
- 95%+ first-time successful booking rate
- No duplicate bookings
- Clear waitlist status indication

---

## NEXT STEPS

1. **Review this plan** with the team
2. **Prioritize features** - phase bookings early
3. **Start Sprint 1** - backend core functionality
4. **Run parallel** - mobile/frontend teams begin UI designs
5. **Integrate** - APIs first, then mobile, then web

---

**Prepared**: 2026-06-10
**Status**: Ready for implementation
**Estimated Duration**: 8 weeks (2 months)
**Team Size Required**: 2-3 backend developers, 2 mobile developers, 1 frontend developer

