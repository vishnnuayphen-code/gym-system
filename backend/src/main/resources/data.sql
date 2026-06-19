-- =============================================
-- Roles Seed Data
-- =============================================
INSERT INTO roles (name) VALUES ('SUPER_ADMIN')
ON CONFLICT (name) DO NOTHING;

INSERT INTO roles (name) VALUES ('ADMIN')
ON CONFLICT (name) DO NOTHING;

INSERT INTO roles (name) VALUES ('OWNER')
ON CONFLICT (name) DO NOTHING;

INSERT INTO roles (name) VALUES ('COACH')
ON CONFLICT (name) DO NOTHING;

INSERT INTO roles (name) VALUES ('TRAINEE')
ON CONFLICT (name) DO NOTHING;

-- =============================================
-- Permissions Seed Data
-- =============================================

-- Insert permissions if they don't exist
INSERT INTO permissions (name, description)
SELECT 'create_coach', 'Can create a new coach'
WHERE NOT EXISTS (SELECT 1 FROM permissions WHERE name = 'create_coach');

INSERT INTO permissions (name, description)
SELECT 'create_trainee', 'Can create a new trainee'
WHERE NOT EXISTS (SELECT 1 FROM permissions WHERE name = 'create_trainee');

INSERT INTO permissions (name, description)
SELECT 'assign_trainee', 'Can assign a trainee to a coach'
WHERE NOT EXISTS (SELECT 1 FROM permissions WHERE name = 'assign_trainee');

INSERT INTO permissions (name, description)
SELECT 'view_trainees', 'Can view list of trainees'
WHERE NOT EXISTS (SELECT 1 FROM permissions WHERE name = 'view_trainees');

INSERT INTO permissions (name, description)
SELECT 'assign_workout', 'Can assign workouts to trainees'
WHERE NOT EXISTS (SELECT 1 FROM permissions WHERE name = 'assign_workout');

INSERT INTO permissions (name, description)
SELECT 'view_workout', 'Can view assigned workouts'
WHERE NOT EXISTS (SELECT 1 FROM permissions WHERE name = 'view_workout');

INSERT INTO permissions (name, description)
SELECT 'manage_sessions', 'Can manage training sessions'
WHERE NOT EXISTS (SELECT 1 FROM permissions WHERE name = 'manage_sessions');

INSERT INTO permissions (name, description)
SELECT 'manage_fees', 'Can manage membership fees'
WHERE NOT EXISTS (SELECT 1 FROM permissions WHERE name = 'manage_fees');

INSERT INTO permissions (name, description)
SELECT 'view_sessions', 'Can view training sessions'
WHERE NOT EXISTS (SELECT 1 FROM permissions WHERE name = 'view_sessions');

INSERT INTO permissions (name, description)
SELECT 'view_fees', 'Can view fee information'
WHERE NOT EXISTS (SELECT 1 FROM permissions WHERE name = 'view_fees');

-- =============================================
-- Assign all permissions to ADMIN
-- =============================================
INSERT INTO role_permissions (role_id, permission_id)
SELECT r.id, p.id
FROM roles r
CROSS JOIN permissions p
WHERE r.name IN ('ADMIN', 'OWNER')
AND NOT EXISTS (
    SELECT 1 FROM role_permissions rp WHERE rp.role_id = r.id AND rp.permission_id = p.id
);

-- =============================================
-- Assign COACH permissions
-- =============================================
INSERT INTO role_permissions (role_id, permission_id)
SELECT r.id, p.id
FROM roles r, permissions p
WHERE r.name = 'COACH'
AND p.name IN ('view_trainees', 'assign_workout', 'view_workout', 'view_sessions')
AND NOT EXISTS (
    SELECT 1 FROM role_permissions rp WHERE rp.role_id = r.id AND rp.permission_id = p.id
);

-- =============================================
-- Assign TRAINEE permissions
-- =============================================
INSERT INTO role_permissions (role_id, permission_id)
SELECT r.id, p.id
FROM roles r, permissions p
WHERE r.name = 'TRAINEE'
AND p.name IN ('view_workout', 'view_sessions', 'view_fees')
AND NOT EXISTS (
    SELECT 1 FROM role_permissions rp WHERE rp.role_id = r.id AND rp.permission_id = p.id
);

-- =============================================
-- Auto-create Super Admin User
-- =============================================
-- Default super admin credentials:
-- Email: superadmin@gymsystem.com
-- Password: password123
-- Using role_id = 1 (SUPER_ADMIN) which is auto-created by Spring
INSERT INTO users (name, email, password_hash, role_id, gym_id, is_active, created_at)
VALUES (
    'System Super Admin',
    'superadmin@gymsystem.com',
    '$2a$10$DehmbOSelPJ5NlAUcb4iBuU.mkRg7ALHCdlpTRQS4RcUFTVmPpzee',
    1,
    NULL,
    true,
    NOW()
)
ON CONFLICT (email) DO NOTHING;

-- =============================================
-- Set Default Gym Hours
-- =============================================
-- Gym hours start as NULL/unconfigured. No default updates.

-- =============================================
-- Auto-create Machine Availability Slots
-- =============================================
-- Ensure all active machines have availability slots for all days of the week
-- Uses gym's opening and closing times as reference
INSERT INTO machine_availability (machine_id, day_of_week, start_time, end_time, max_bookings, is_active)
SELECT
    m.id,
    day_name,
    COALESCE(g.opening_time, '06:00:00'::time),
    COALESCE(g.closing_time, '22:00:00'::time),
    5,
    true
FROM machines m
INNER JOIN gyms g ON m.gym_id = g.id
CROSS JOIN (
    SELECT 'MONDAY' as day_name UNION ALL
    SELECT 'TUESDAY' UNION ALL
    SELECT 'WEDNESDAY' UNION ALL
    SELECT 'THURSDAY' UNION ALL
    SELECT 'FRIDAY' UNION ALL
    SELECT 'SATURDAY' UNION ALL
    SELECT 'SUNDAY'
) days
WHERE m.status = 'ACTIVE'
AND NOT EXISTS (
    SELECT 1 FROM machine_availability ma
    WHERE ma.machine_id = m.id AND ma.day_of_week = days.day_name
)
ON CONFLICT DO NOTHING;
