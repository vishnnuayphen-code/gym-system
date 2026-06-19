-- Test Data for Machine Booking System
-- Date: 2026-06-10
-- This file adds sample users, gyms, machines, and bookings for testing

-- ============================================================================
-- 1. Insert Test Gym
-- ============================================================================

INSERT INTO gyms (name, address, phone, created_at, is_active)
SELECT 'FitCore Ultra Gym', '123 Main St, New York, NY 10001', '555-0001', NOW(), true
WHERE NOT EXISTS (SELECT 1 FROM gyms WHERE name = 'FitCore Ultra Gym');

-- Get the gym ID for use in other inserts
-- (Using subqueries for gym ID to support PostgreSQL)

-- Test Trainee 1: John Doe
INSERT INTO users (name, email, password_hash, role_id, gym_id, fcm_token, created_at, is_active)
SELECT
    'John Doe',
    'john.trainee@test.com',
    '$2a$10$DehmbOSelPJ5NlAUcb4iBuU.mkRg7ALHCdlpTRQS4RcUFTVmPpzee', -- password: password123
    (SELECT id FROM roles WHERE name = 'TRAINEE'),
    (SELECT id FROM gyms WHERE name = 'FitCore Ultra Gym' LIMIT 1),
    'token_john_trainee',
    NOW(),
    true
WHERE NOT EXISTS (SELECT 1 FROM users WHERE email = 'john.trainee@test.com');

-- Test Trainee 2: Sarah Smith
INSERT INTO users (name, email, password_hash, role_id, gym_id, fcm_token, created_at, is_active)
SELECT
    'Sarah Smith',
    'sarah.trainee@test.com',
    '$2a$10$DehmbOSelPJ5NlAUcb4iBuU.mkRg7ALHCdlpTRQS4RcUFTVmPpzee', -- password: password123
    (SELECT id FROM roles WHERE name = 'TRAINEE'),
    (SELECT id FROM gyms WHERE name = 'FitCore Ultra Gym' LIMIT 1),
    'token_sarah_trainee',
    NOW(),
    true
WHERE NOT EXISTS (SELECT 1 FROM users WHERE email = 'sarah.trainee@test.com');

-- Test Owner: FitCore Owner
INSERT INTO users (name, email, password_hash, role_id, gym_id, fcm_token, created_at, is_active)
SELECT
    'FitCore Owner',
    'owner@test.com',
    '$2a$10$DehmbOSelPJ5NlAUcb4iBuU.mkRg7ALHCdlpTRQS4RcUFTVmPpzee', -- password: password123
    (SELECT id FROM roles WHERE name = 'OWNER'),
    (SELECT id FROM gyms WHERE name = 'FitCore Ultra Gym' LIMIT 1),
    'token_owner',
    NOW(),
    true
WHERE NOT EXISTS (SELECT 1 FROM users WHERE email = 'owner@test.com');

-- ============================================================================
-- 4. Insert Test Users (Coaches)
-- ============================================================================


-- Test Coach 1: Mike Coach
INSERT INTO users (name, email, password_hash, role_id, gym_id, fcm_token, created_at, is_active)
SELECT
    'Mike Coach',
    'mike.coach@test.com',
    '$2a$10$DehmbOSelPJ5NlAUcb4iBuU.mkRg7ALHCdlpTRQS4RcUFTVmPpzee', -- password: password123
    (SELECT id FROM roles WHERE name = 'COACH'),
    (SELECT id FROM gyms WHERE name = 'FitCore Ultra Gym' LIMIT 1),
    'token_mike_coach',
    NOW(),
    true
WHERE NOT EXISTS (SELECT 1 FROM users WHERE email = 'mike.coach@test.com');

-- Test Coach 2: Lisa Coach
INSERT INTO users (name, email, password_hash, role_id, gym_id, fcm_token, created_at, is_active)
SELECT
    'Lisa Coach',
    'lisa.coach@test.com',
    '$2a$10$DehmbOSelPJ5NlAUcb4iBuU.mkRg7ALHCdlpTRQS4RcUFTVmPpzee', -- password: password123
    (SELECT id FROM roles WHERE name = 'COACH'),
    (SELECT id FROM gyms WHERE name = 'FitCore Ultra Gym' LIMIT 1),
    'token_lisa_coach',
    NOW(),
    true
WHERE NOT EXISTS (SELECT 1 FROM users WHERE email = 'lisa.coach@test.com');

-- ============================================================================
-- 5. Create Trainee Profiles
-- ============================================================================

INSERT INTO trainee_profiles (user_id, height, weight, fitness_goal)
SELECT
    u.id,
    180.0,
    75.0,
    'GENERAL'
FROM users u
WHERE u.email = 'john.trainee@test.com'
AND NOT EXISTS (SELECT 1 FROM trainee_profiles tp WHERE tp.user_id = u.id);

INSERT INTO trainee_profiles (user_id, height, weight, fitness_goal)
SELECT
    u.id,
    165.0,
    65.0,
    'WEIGHT_LOSS'
FROM users u
WHERE u.email = 'sarah.trainee@test.com'
AND NOT EXISTS (SELECT 1 FROM trainee_profiles tp WHERE tp.user_id = u.id);

-- ============================================================================
-- 6. Create Coach Profiles
-- ============================================================================

INSERT INTO coach_profiles (user_id, specialization, experience_years, certification_name)
SELECT
    u.id,
    'Strength Training',
    5,
    'NASM Certified'
FROM users u
WHERE u.email = 'mike.coach@test.com'
AND NOT EXISTS (SELECT 1 FROM coach_profiles cp WHERE cp.user_id = u.id);

INSERT INTO coach_profiles (user_id, specialization, experience_years, certification_name)
SELECT
    u.id,
    'Cardio & CrossFit',
    3,
    'CrossFit Level 2'
FROM users u
WHERE u.email = 'lisa.coach@test.com'
AND NOT EXISTS (SELECT 1 FROM coach_profiles cp WHERE cp.user_id = u.id);

-- ============================================================================
-- 7. Insert Test Machines
-- ============================================================================

INSERT INTO machines (name, type, description, quantity, status, gym_id, serial_number, location_in_gym, created_at)
SELECT
    'Treadmill Pro',
    'Cardio',
    'High-speed treadmill for running',
    3,
    'ACTIVE',
    (SELECT id FROM gyms WHERE name = 'FitCore Ultra Gym' LIMIT 1),
    'TR-001',
    'Cardio Zone',
    NOW()
WHERE NOT EXISTS (SELECT 1 FROM machines WHERE serial_number = 'TR-001');

INSERT INTO machines (name, type, description, quantity, status, gym_id, serial_number, location_in_gym, created_at)
SELECT
    'Leg Press Machine',
    'Strength',
    'Heavy-duty leg press for lower body',
    2,
    'ACTIVE',
    (SELECT id FROM gyms WHERE name = 'FitCore Ultra Gym' LIMIT 1),
    'LP-001',
    'Strength Zone',
    NOW()
WHERE NOT EXISTS (SELECT 1 FROM machines WHERE serial_number = 'LP-001');

INSERT INTO machines (name, type, description, quantity, status, gym_id, serial_number, location_in_gym, created_at)
SELECT
    'Chest Press Machine',
    'Strength',
    'Chest and upper body press',
    2,
    'ACTIVE',
    (SELECT id FROM gyms WHERE name = 'FitCore Ultra Gym' LIMIT 1),
    'CP-001',
    'Strength Zone',
    NOW()
WHERE NOT EXISTS (SELECT 1 FROM machines WHERE serial_number = 'CP-001');

INSERT INTO machines (name, type, description, quantity, status, gym_id, serial_number, location_in_gym, created_at)
SELECT
    'Rowing Machine',
    'Cardio',
    'Full-body cardio machine',
    1,
    'ACTIVE',
    (SELECT id FROM gyms WHERE name = 'FitCore Ultra Gym' LIMIT 1),
    'RM-001',
    'Cardio Zone',
    NOW()
WHERE NOT EXISTS (SELECT 1 FROM machines WHERE serial_number = 'RM-001');

-- ============================================================================
-- 8. Insert Machine Availability Slots
-- ============================================================================

INSERT INTO machine_availability (machine_id, day_of_week, start_time, end_time, max_bookings, is_active)
SELECT
    m.id,
    'MONDAY',
    '06:00:00',
    '22:00:00',
    5,
    true
FROM machines m
WHERE m.serial_number IN ('TR-001', 'LP-001', 'CP-001', 'RM-001')
AND NOT EXISTS (
    SELECT 1 FROM machine_availability ma
    WHERE ma.machine_id = m.id AND ma.day_of_week = 'MONDAY'
);

-- Do this for all days
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
    SELECT 'TUESDAY' as day_name UNION
    SELECT 'WEDNESDAY' UNION
    SELECT 'THURSDAY' UNION
    SELECT 'FRIDAY' UNION
    SELECT 'SATURDAY' UNION
    SELECT 'SUNDAY'
) days
WHERE m.serial_number IN ('TR-001', 'LP-001', 'CP-001', 'RM-001')
AND NOT EXISTS (
    SELECT 1 FROM machine_availability ma
    WHERE ma.machine_id = m.id AND ma.day_of_week = days.day_name
);

-- ============================================================================
-- Sample Bookings (for testing)
-- ============================================================================

INSERT INTO machine_bookings (
    machine_id,
    trainee_id,
    availability_id,
    booking_date,
    booking_start_time,
    booking_end_time,
    status,
    created_at
)
SELECT
    m.id,
    tp.id,
    ma.id,
    (CURRENT_DATE + INTERVAL '1 day'),
    '15:00:00',
    '16:00:00',
    'CONFIRMED',
    NOW()
FROM machines m
JOIN trainee_profiles tp ON tp.user_id = (SELECT id FROM users WHERE email = 'john.trainee@test.com')
JOIN machine_availability ma ON ma.machine_id = m.id AND ma.day_of_week = trim(to_char(CURRENT_DATE + INTERVAL '1 day', 'DAY'))
WHERE m.serial_number = 'LP-001'
AND NOT EXISTS (
    SELECT 1 FROM machine_bookings mb
    WHERE mb.machine_id = m.id
    AND mb.trainee_id = tp.id
    AND mb.booking_date = (CURRENT_DATE + INTERVAL '1 day')
)
LIMIT 1;

-- ============================================================================
-- End of Test Data
-- ============================================================================
