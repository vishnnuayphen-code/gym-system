-- Machine Booking System Implementation
-- Date: 2026-06-10
-- Purpose: Add machine booking, notifications, waitlist, and analytics tables

-- ============================================================================
-- 1. ALTER EXISTING TABLE: machine_bookings
-- ============================================================================

ALTER TABLE machine_bookings
ADD COLUMN IF NOT EXISTS booking_start_time TIME,
ADD COLUMN IF NOT EXISTS booking_end_time TIME,
ADD COLUMN IF NOT EXISTS booked_by_coach_id BIGINT,
ADD COLUMN IF NOT EXISTS notes TEXT,
ADD COLUMN IF NOT EXISTS cancellation_reason TEXT,
ADD COLUMN IF NOT EXISTS cancelled_at TIMESTAMP,
ADD COLUMN IF NOT EXISTS updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP;

-- Add foreign key constraint for coach
ALTER TABLE machine_bookings
ADD CONSTRAINT IF NOT EXISTS fk_machine_booking_coach
FOREIGN KEY (booked_by_coach_id) REFERENCES coach_profiles(id) ON DELETE SET NULL;

-- ============================================================================
-- 2. CREATE TABLE: machine_booking_notifications
-- ============================================================================

CREATE TABLE IF NOT EXISTS machine_booking_notifications (
    id BIGSERIAL PRIMARY KEY,
    machine_booking_id BIGINT,
    user_id BIGINT NOT NULL,
    type VARCHAR(50) NOT NULL CHECK (type IN ('BOOKING_CONFIRMED', 'MACHINE_AVAILABLE', 'BOOKING_REMINDER', 'CANCELLATION')),
    delivery_method VARCHAR(50) NOT NULL CHECK (delivery_method IN ('PUSH', 'EMAIL', 'VOICE')),
    status VARCHAR(50) NOT NULL DEFAULT 'PENDING' CHECK (status IN ('PENDING', 'SENT', 'FAILED', 'DELIVERED')),
    ai_generated_message TEXT,
    send_at TIMESTAMP,
    sent_at TIMESTAMP,
    failure_reason TEXT,
    retry_count INTEGER DEFAULT 0,
    created_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT fk_notification_booking FOREIGN KEY (machine_booking_id) REFERENCES machine_bookings(id) ON DELETE CASCADE,
    CONSTRAINT fk_notification_user FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE
);

-- Create indexes for notifications
CREATE INDEX IF NOT EXISTS idx_notifications_user_id ON machine_booking_notifications(user_id);
CREATE INDEX IF NOT EXISTS idx_notifications_user_created ON machine_booking_notifications(user_id, created_at DESC);
CREATE INDEX IF NOT EXISTS idx_notifications_status_send_at ON machine_booking_notifications(status, send_at);
CREATE INDEX IF NOT EXISTS idx_notifications_booking_id ON machine_booking_notifications(machine_booking_id);

-- ============================================================================
-- 3. CREATE TABLE: machine_booking_waitlist
-- ============================================================================

CREATE TABLE IF NOT EXISTS machine_booking_waitlist (
    id BIGSERIAL PRIMARY KEY,
    trainee_id BIGINT NOT NULL,
    machine_id BIGINT NOT NULL,
    availability_id BIGINT,
    requested_date DATE NOT NULL,
    position INTEGER NOT NULL,
    status VARCHAR(50) NOT NULL DEFAULT 'WAITING' CHECK (status IN ('WAITING', 'NOTIFIED', 'BOOKED', 'EXPIRED')),
    notified_at TIMESTAMP,
    booked_as_id BIGINT,
    expires_at TIMESTAMP,
    created_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT fk_waitlist_trainee FOREIGN KEY (trainee_id) REFERENCES trainee_profiles(id) ON DELETE CASCADE,
    CONSTRAINT fk_waitlist_machine FOREIGN KEY (machine_id) REFERENCES machines(id) ON DELETE CASCADE,
    CONSTRAINT fk_waitlist_availability FOREIGN KEY (availability_id) REFERENCES machine_availability(id) ON DELETE SET NULL,
    CONSTRAINT fk_waitlist_booking FOREIGN KEY (booked_as_id) REFERENCES machine_bookings(id) ON DELETE SET NULL
);

-- Create indexes for waitlist
CREATE INDEX IF NOT EXISTS idx_waitlist_machine_date_status ON machine_booking_waitlist(machine_id, requested_date, status);
CREATE INDEX IF NOT EXISTS idx_waitlist_trainee_status ON machine_booking_waitlist(trainee_id, status);
CREATE INDEX IF NOT EXISTS idx_waitlist_status_expires ON machine_booking_waitlist(status, expires_at);
CREATE INDEX IF NOT EXISTS idx_waitlist_trainee_created ON machine_booking_waitlist(trainee_id, created_at DESC);

-- ============================================================================
-- 4. CREATE TABLE: machine_booking_analytics
-- ============================================================================

CREATE TABLE IF NOT EXISTS machine_booking_analytics (
    id BIGSERIAL PRIMARY KEY,
    machine_id BIGINT NOT NULL,
    date DATE NOT NULL,
    total_bookings INTEGER DEFAULT 0,
    completed_bookings INTEGER DEFAULT 0,
    cancelled_bookings INTEGER DEFAULT 0,
    peak_hours TEXT,
    average_utilization REAL DEFAULT 0.0,
    total_hours_available REAL DEFAULT 0.0,
    total_hours_booked REAL DEFAULT 0.0,
    created_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT fk_analytics_machine FOREIGN KEY (machine_id) REFERENCES machines(id) ON DELETE CASCADE,
    CONSTRAINT uk_analytics_machine_date UNIQUE (machine_id, date)
);

-- Create indexes for analytics
CREATE INDEX IF NOT EXISTS idx_analytics_machine_date ON machine_booking_analytics(machine_id, date DESC);
CREATE INDEX IF NOT EXISTS idx_analytics_date_utilization ON machine_booking_analytics(date, average_utilization DESC);

-- ============================================================================
-- 5. CREATE INDEXES ON EXISTING machine_bookings TABLE
-- ============================================================================

CREATE INDEX IF NOT EXISTS idx_machine_booking_trainee_status ON machine_bookings(trainee_id, status);
CREATE INDEX IF NOT EXISTS idx_machine_booking_trainee_date ON machine_bookings(trainee_id, booking_date);
CREATE INDEX IF NOT EXISTS idx_machine_booking_machine_date_status ON machine_bookings(machine_id, booking_date, status);

-- ============================================================================
-- 6. UPDATE TRIGGER FOR updated_at TIMESTAMP (if using PostgreSQL)
-- ============================================================================

-- Create function to update updated_at column (if it doesn't exist)
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
    NEW.updated_at = CURRENT_TIMESTAMP;
    RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Create triggers for all new tables
DROP TRIGGER IF EXISTS trigger_update_notifications_updated_at ON machine_booking_notifications;
CREATE TRIGGER trigger_update_notifications_updated_at
BEFORE UPDATE ON machine_booking_notifications
FOR EACH ROW
EXECUTE FUNCTION update_updated_at_column();

DROP TRIGGER IF EXISTS trigger_update_waitlist_updated_at ON machine_booking_waitlist;
CREATE TRIGGER trigger_update_waitlist_updated_at
BEFORE UPDATE ON machine_booking_waitlist
FOR EACH ROW
EXECUTE FUNCTION update_updated_at_column();

DROP TRIGGER IF EXISTS trigger_update_analytics_updated_at ON machine_booking_analytics;
CREATE TRIGGER trigger_update_analytics_updated_at
BEFORE UPDATE ON machine_booking_analytics
FOR EACH ROW
EXECUTE FUNCTION update_updated_at_column();

DROP TRIGGER IF EXISTS trigger_update_machine_booking_updated_at ON machine_bookings;
CREATE TRIGGER trigger_update_machine_booking_updated_at
BEFORE UPDATE ON machine_bookings
FOR EACH ROW
EXECUTE FUNCTION update_updated_at_column();

-- ============================================================================
-- Migration Complete
-- ============================================================================
