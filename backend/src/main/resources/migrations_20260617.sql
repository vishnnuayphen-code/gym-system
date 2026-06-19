-- Migration: Add Gym Opening and Closing Times
-- Date: 2026-06-17

ALTER TABLE gyms ADD COLUMN IF NOT EXISTS opening_time TIME;
ALTER TABLE gyms ADD COLUMN IF NOT EXISTS closing_time TIME;
