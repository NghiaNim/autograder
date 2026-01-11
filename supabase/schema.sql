-- Goblins Auto-Grader Schema
-- Run this in Supabase SQL Editor to set up the database

-- Enable UUID extension
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";

-- Assignments table
CREATE TABLE assignments (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  title TEXT NOT NULL,
  description TEXT NOT NULL,
  teacher_id UUID NOT NULL,
  share_code TEXT UNIQUE NOT NULL,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

CREATE INDEX idx_assignments_share_code ON assignments(share_code);
CREATE INDEX idx_assignments_teacher ON assignments(teacher_id);

-- Rubrics table (1:1 with assignments)
CREATE TABLE rubrics (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  assignment_id UUID UNIQUE NOT NULL REFERENCES assignments(id) ON DELETE CASCADE,
  criteria JSONB NOT NULL DEFAULT '[]',
  problems JSONB NOT NULL DEFAULT '[]',
  total_points INTEGER NOT NULL,
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- Students table
CREATE TABLE students (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  name TEXT NOT NULL,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- Submissions table
CREATE TABLE submissions (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  assignment_id UUID NOT NULL REFERENCES assignments(id) ON DELETE CASCADE,
  student_id UUID NOT NULL REFERENCES students(id) ON DELETE CASCADE,
  problem_index INTEGER NOT NULL,
  whiteboard_data JSONB NOT NULL DEFAULT '{}',
  submitted_at TIMESTAMPTZ DEFAULT NOW(),
  UNIQUE(assignment_id, student_id, problem_index)
);

CREATE INDEX idx_submissions_assignment ON submissions(assignment_id);
CREATE INDEX idx_submissions_student ON submissions(student_id);

-- Scores table
CREATE TABLE scores (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  submission_id UUID NOT NULL REFERENCES submissions(id) ON DELETE CASCADE,
  rubric_id UUID NOT NULL REFERENCES rubrics(id) ON DELETE CASCADE,
  points_earned INTEGER NOT NULL,
  feedback TEXT NOT NULL DEFAULT '',
  graded_at TIMESTAMPTZ DEFAULT NOW()
);

CREATE INDEX idx_scores_submission ON scores(submission_id);

-- Row Level Security (optional - enable if using auth)
-- ALTER TABLE assignments ENABLE ROW LEVEL SECURITY;
-- ALTER TABLE rubrics ENABLE ROW LEVEL SECURITY;
-- ALTER TABLE students ENABLE ROW LEVEL SECURITY;
-- ALTER TABLE submissions ENABLE ROW LEVEL SECURITY;
-- ALTER TABLE scores ENABLE ROW LEVEL SECURITY;

-- For MVP, allow all operations (disable RLS or use permissive policies)
-- When ready for production, enable RLS with proper policies
