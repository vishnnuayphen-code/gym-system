-- Add Machine Availability Slots for All Machines
-- This script creates availability slots for all active machines

-- Get the gym ID (update this if you have a specific gym)
SET @gym_id = (SELECT id FROM gyms LIMIT 1);

-- Insert availability slots for all machines in the gym for each day of the week (6 AM to 10 PM)
INSERT INTO machine_availability (machine_id, day_of_week, start_time, end_time, max_bookings, is_active)
SELECT
    m.id,
    day_name,
    '06:00:00',
    '22:00:00',
    5,
    true
FROM machines m
CROSS JOIN (
    SELECT 'MONDAY' as day_name UNION
    SELECT 'TUESDAY' UNION
    SELECT 'WEDNESDAY' UNION
    SELECT 'THURSDAY' UNION
    SELECT 'FRIDAY' UNION
    SELECT 'SATURDAY' UNION
    SELECT 'SUNDAY'
) days
WHERE m.gym_id = @gym_id
AND m.status = 'ACTIVE'
AND NOT EXISTS (
    SELECT 1 FROM machine_availability ma
    WHERE ma.machine_id = m.id AND ma.day_of_week = days.day_name
);
