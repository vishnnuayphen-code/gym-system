# 📱 Mobile API Integration Guide

## ✅ Completed Integration

### 1. **Machine Booking Service Created**
**File**: `/mobile/src/services/machineBookingService.ts`

Provides complete API interface for:
- Book a machine
- Get my bookings
- Get upcoming bookings
- Reschedule booking
- Cancel booking
- Join waitlist
- Get waitlist position
- Leave waitlist

### 2. **Trainee Dashboard Connected to Real API**
**File**: `/mobile/app/(trainee)/home.tsx`

Updated to:
- Import `machineBookingService`
- Call `getUpcomingBookings()` for real-time data
- Display booked machines from backend
- Show loading states

### 3. **API Configuration Updated**
**File**: `/mobile/lib/api.ts`

- Base URL set to `http://localhost:8080`
- Axios interceptor automatically adds JWT token
- Token stored in secure storage

---

## 🚀 Quick Integration Examples

### Example 1: Book a Machine
```typescript
import { machineBookingService } from '@/services/machineBookingService';

const handleBookMachine = async () => {
  try {
    const booking = await machineBookingService.bookMachine({
      machineId: 1,
      bookingDate: '2026-06-11',
      startTime: '15:00',
      endTime: '15:45'
    });
    console.log('Booking successful:', booking);
  } catch (error) {
    console.error('Booking failed:', error);
  }
};
```

### Example 2: Get My Bookings
```typescript
const { data: bookings } = useApiCall(
  () => machineBookingService.getMyBookings(),
  []
);

bookings?.forEach(booking => {
  console.log(`${booking.machineName} on ${booking.bookingDate}`);
});
```

### Example 3: Reschedule a Booking
```typescript
const handleReschedule = async (bookingId: number) => {
  try {
    const updated = await machineBookingService.rescheduleBooking(bookingId, {
      newDate: '2026-06-12',
      newStartTime: '16:00',
      newEndTime: '16:45'
    });
    console.log('Rescheduled:', updated);
  } catch (error) {
    console.error('Reschedule failed:', error);
  }
};
```

### Example 4: Join Waitlist
```typescript
const handleJoinWaitlist = async (machineId: number, date: string) => {
  try {
    const waitlist = await machineBookingService.joinWaitlist({
      machineId,
      requestedDate: date
    });
    console.log(`Added to waitlist at position ${waitlist.position}`);
  } catch (error) {
    console.error('Waitlist join failed:', error);
  }
};
```

### Example 5: Cancel Booking
```typescript
const handleCancel = async (bookingId: number) => {
  try {
    await machineBookingService.cancelBooking(
      bookingId, 
      'User cancelled'
    );
    console.log('Booking cancelled');
  } catch (error) {
    console.error('Cancellation failed:', error);
  }
};
```

---

## 📋 API Endpoints Mapped

| Feature | Method | Endpoint | Status |
|---------|--------|----------|--------|
| Book Machine | POST | `/machines/bookings/book` | ✅ Ready |
| Get My Bookings | GET | `/machines/bookings/my-bookings` | ✅ Ready |
| Get Upcoming | GET | `/machines/bookings/upcoming` | ✅ Ready |
| Reschedule | PUT | `/machines/bookings/{id}/reschedule` | ✅ Ready |
| Cancel | PUT | `/machines/bookings/{id}/cancel` | ✅ Ready |
| Join Waitlist | POST | `/machines/waitlist/join` | ✅ Ready |
| Get Position | GET | `/machines/waitlist/my-position` | ✅ Ready |
| Leave Waitlist | DELETE | `/machines/waitlist/{id}` | ✅ Ready |

---

## 🔐 Authentication

The API automatically includes JWT token in all requests:

```typescript
// Automatically handled by axios interceptor in api.ts
api.interceptors.request.use(async (config) => {
    const token = await SecureStore.getItemAsync('token');
    if (token) {
        config.headers.Authorization = `Bearer ${token}`;
    }
    return config;
});
```

**Token Storage**: Expo Secure Store (encrypted)

---

## 🎯 Next Steps for Full Integration

### 1. **Update Booking Flow Screen**
- Create dedicated machine booking screen
- Use `machineBookingService.bookMachine()`
- Show calendar for date selection
- Display available time slots

### 2. **Add Reschedule/Cancel Handlers**
- Wire up the action buttons in booked machines section
- Add confirmation dialogs
- Handle loading states

### 3. **Implement Waitlist UI**
- Show waitlist option when machine is fully booked
- Display position in queue
- Allow users to leave waitlist

### 4. **Add Notifications Integration**
- Create notification service (when ready)
- Display real-time booking updates
- Show machine availability alerts

### 5. **Error Handling & User Feedback**
- Add try/catch in all API calls
- Show toast messages for success/error
- Display loading skeletons during data fetch

---

## 🛠️ Development Configuration

### For Local Development (Simulator)
```typescript
// In lib/api.ts
const getBaseHost = () => {
    return 'http://localhost:8080';
};
```

### For Physical Device / Expo Go
```typescript
// Get your machine's IP address
// On Mac/Linux: ifconfig | grep inet
// On Windows: ipconfig | grep IPv4

const getBaseHost = () => {
    return 'http://YOUR_IP_ADDRESS:8080';
};
```

---

## ✨ Current Status

✅ Service layer complete  
✅ Dashboard connected to API  
✅ Authentication configured  
✅ All endpoints mapped  
⏳ UI interactions to be wired up  

---

## 📚 Files Reference

- Service: `/mobile/src/services/machineBookingService.ts`
- Dashboard: `/mobile/app/(trainee)/home.tsx`
- API Config: `/mobile/lib/api.ts`
- Auth Store: `/mobile/store/authStore.ts`

---

## 🚨 Common Issues & Solutions

### Issue: "Cannot POST /machines/bookings/book"
**Solution**: Verify backend is running on port 8080

### Issue: "401 Unauthorized"
**Solution**: User is not logged in. Login first, then retry.

### Issue: "No availability slot for this day"
**Solution**: Machine doesn't have availability for the selected date. Check machine availability slots.

### Issue: "Time slot conflicts"
**Solution**: Another user already booked that time slot. Choose a different time.

---

Created: 2026-06-10
Last Updated: 2026-06-10
