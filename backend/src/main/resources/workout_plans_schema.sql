-- Workout Plan Builder Tables
-- Date: 2026-03-17

CREATE TABLE IF NOT EXISTS workout_plans (
    id SERIAL PRIMARY KEY,
    title VARCHAR(255) NOT NULL,
    description TEXT,
    coach_id BIGINT NOT NULL REFERENCES users(id),
    trainee_id BIGINT NOT NULL REFERENCES users(id),
    start_date DATE,
    end_date DATE,
    status VARCHAR(30) NOT NULL DEFAULT 'ACTIVE',
    created_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP
);

CREATE TABLE IF NOT EXISTS workout_days (
    id SERIAL PRIMARY KEY,
    day_label VARCHAR(50) NOT NULL,
    focus_area VARCHAR(255),
    workout_plan_id BIGINT NOT NULL REFERENCES workout_plans(id) ON DELETE CASCADE
);

CREATE TABLE IF NOT EXISTS exercises (
    id SERIAL PRIMARY KEY,
    name VARCHAR(255) NOT NULL,
    sets INTEGER NOT NULL,
    reps INTEGER NOT NULL,
    rest_seconds INTEGER,
    notes TEXT,
    video_url VARCHAR(255),
    workout_day_id BIGINT NOT NULL REFERENCES workout_days(id) ON DELETE CASCADE
);
