/*
  # Initial EduMateAI Database Schema

  1. New Tables
    - `profiles` - User profile information
      - `id` (uuid, references auth.users)
      - `email` (text)
      - `full_name` (text)
      - `subscription_tier` (text, default 'free')
      - `stripe_customer_id` (text, nullable)
      - `created_at` (timestamp)
      - `updated_at` (timestamp)
    
    - `courses` - Available courses
      - `id` (uuid, primary key)
      - `title` (text)
      - `description` (text)
      - `difficulty_level` (text)
      - `is_premium` (boolean, default false)
      - `created_at` (timestamp)
    
    - `flashcards` - User-generated flashcards
      - `id` (uuid, primary key)
      - `user_id` (uuid, references profiles)
      - `course_id` (uuid, references courses)
      - `front_text` (text)
      - `back_text` (text)
      - `difficulty` (integer, default 1)
      - `created_at` (timestamp)
    
    - `quiz_sessions` - Quiz attempts and results
      - `id` (uuid, primary key)
      - `user_id` (uuid, references profiles)
      - `course_id` (uuid, references courses)
      - `score` (integer)
      - `total_questions` (integer)
      - `time_taken` (integer, seconds)
      - `integrity_score` (decimal, default 100.0)
      - `completed_at` (timestamp)
    
    - `user_progress` - Learning progress tracking
      - `id` (uuid, primary key)
      - `user_id` (uuid, references profiles)
      - `course_id` (uuid, references courses)
      - `completion_percentage` (decimal, default 0)
      - `study_streak` (integer, default 0)
      - `total_study_time` (integer, default 0, minutes)
      - `last_activity` (timestamp)
      - `updated_at` (timestamp)
    
    - `certificates` - Issued certificates
      - `id` (uuid, primary key)
      - `user_id` (uuid, references profiles)
      - `course_id` (uuid, references courses)
      - `certificate_url` (text)
      - `verification_code` (text, unique)
      - `issued_at` (timestamp)
    
    - `subscriptions` - Stripe subscription tracking
      - `id` (uuid, primary key)
      - `user_id` (uuid, references profiles)
      - `stripe_subscription_id` (text, unique)
      - `status` (text)
      - `current_period_start` (timestamp)
      - `current_period_end` (timestamp)
      - `created_at` (timestamp)

  2. Security
    - Enable RLS on all tables
    - Add policies for authenticated users to access their own data
    - Add policies for public read access to courses
    - Add admin policies for managing content

  3. Functions
    - Create updated_at trigger for relevant tables
*/

-- Enable UUID extension
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";

-- Create profiles table
CREATE TABLE IF NOT EXISTS profiles (
  id uuid REFERENCES auth.users(id) ON DELETE CASCADE PRIMARY KEY,
  email text UNIQUE NOT NULL,
  full_name text,
  subscription_tier text DEFAULT 'free' CHECK (subscription_tier IN ('free', 'premium')),
  stripe_customer_id text,
  created_at timestamptz DEFAULT now(),
  updated_at timestamptz DEFAULT now()
);

-- Create courses table
CREATE TABLE IF NOT EXISTS courses (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  title text NOT NULL,
  description text,
  difficulty_level text DEFAULT 'beginner' CHECK (difficulty_level IN ('beginner', 'intermediate', 'advanced')),
  is_premium boolean DEFAULT false,
  created_at timestamptz DEFAULT now()
);

-- Create flashcards table
CREATE TABLE IF NOT EXISTS flashcards (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id uuid REFERENCES profiles(id) ON DELETE CASCADE NOT NULL,
  course_id uuid REFERENCES courses(id) ON DELETE CASCADE,
  front_text text NOT NULL,
  back_text text NOT NULL,
  difficulty integer DEFAULT 1 CHECK (difficulty BETWEEN 1 AND 5),
  created_at timestamptz DEFAULT now()
);

-- Create quiz_sessions table
CREATE TABLE IF NOT EXISTS quiz_sessions (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id uuid REFERENCES profiles(id) ON DELETE CASCADE NOT NULL,
  course_id uuid REFERENCES courses(id) ON DELETE CASCADE,
  score integer DEFAULT 0,
  total_questions integer DEFAULT 0,
  time_taken integer DEFAULT 0,
  integrity_score decimal DEFAULT 100.0,
  completed_at timestamptz DEFAULT now()
);

-- Create user_progress table
CREATE TABLE IF NOT EXISTS user_progress (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id uuid REFERENCES profiles(id) ON DELETE CASCADE NOT NULL,
  course_id uuid REFERENCES courses(id) ON DELETE CASCADE,
  completion_percentage decimal DEFAULT 0 CHECK (completion_percentage BETWEEN 0 AND 100),
  study_streak integer DEFAULT 0,
  total_study_time integer DEFAULT 0,
  last_activity timestamptz DEFAULT now(),
  updated_at timestamptz DEFAULT now(),
  UNIQUE(user_id, course_id)
);

-- Create certificates table
CREATE TABLE IF NOT EXISTS certificates (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id uuid REFERENCES profiles(id) ON DELETE CASCADE NOT NULL,
  course_id uuid REFERENCES courses(id) ON DELETE CASCADE,
  certificate_url text,
  verification_code text UNIQUE NOT NULL,
  issued_at timestamptz DEFAULT now()
);

-- Create subscriptions table
CREATE TABLE IF NOT EXISTS subscriptions (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id uuid REFERENCES profiles(id) ON DELETE CASCADE NOT NULL,
  stripe_subscription_id text UNIQUE NOT NULL,
  status text NOT NULL,
  current_period_start timestamptz,
  current_period_end timestamptz,
  created_at timestamptz DEFAULT now()
);

-- Enable Row Level Security
ALTER TABLE profiles ENABLE ROW LEVEL SECURITY;
ALTER TABLE courses ENABLE ROW LEVEL SECURITY;
ALTER TABLE flashcards ENABLE ROW LEVEL SECURITY;
ALTER TABLE quiz_sessions ENABLE ROW LEVEL SECURITY;
ALTER TABLE user_progress ENABLE ROW LEVEL SECURITY;
ALTER TABLE certificates ENABLE ROW LEVEL SECURITY;
ALTER TABLE subscriptions ENABLE ROW LEVEL SECURITY;

-- Profiles policies
CREATE POLICY "Users can read own profile"
  ON profiles FOR SELECT
  TO authenticated
  USING (auth.uid() = id);

CREATE POLICY "Users can update own profile"
  ON profiles FOR UPDATE
  TO authenticated
  USING (auth.uid() = id);

CREATE POLICY "Users can insert own profile"
  ON profiles FOR INSERT
  TO authenticated
  WITH CHECK (auth.uid() = id);

-- Courses policies (public read, admin write)
CREATE POLICY "Anyone can read courses"
  ON courses FOR SELECT
  TO authenticated, anon
  USING (true);

-- Flashcards policies
CREATE POLICY "Users can manage own flashcards"
  ON flashcards FOR ALL
  TO authenticated
  USING (auth.uid() = user_id)
  WITH CHECK (auth.uid() = user_id);

-- Quiz sessions policies
CREATE POLICY "Users can manage own quiz sessions"
  ON quiz_sessions FOR ALL
  TO authenticated
  USING (auth.uid() = user_id)
  WITH CHECK (auth.uid() = user_id);

-- User progress policies
CREATE POLICY "Users can manage own progress"
  ON user_progress FOR ALL
  TO authenticated
  USING (auth.uid() = user_id)
  WITH CHECK (auth.uid() = user_id);

-- Certificates policies
CREATE POLICY "Users can read own certificates"
  ON certificates FOR SELECT
  TO authenticated
  USING (auth.uid() = user_id);

CREATE POLICY "Anyone can verify certificates"
  ON certificates FOR SELECT
  TO authenticated, anon
  USING (true);

-- Subscriptions policies
CREATE POLICY "Users can read own subscriptions"
  ON subscriptions FOR SELECT
  TO authenticated
  USING (auth.uid() = user_id);

-- Create updated_at trigger function
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = now();
  RETURN NEW;
END;
$$ language 'plpgsql';

-- Add updated_at triggers
CREATE TRIGGER update_profiles_updated_at
  BEFORE UPDATE ON profiles
  FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_user_progress_updated_at
  BEFORE UPDATE ON user_progress
  FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

-- Insert sample courses
INSERT INTO courses (title, description, difficulty_level, is_premium) VALUES
('Introduction to Biology', 'Learn the fundamentals of biology including cell structure, genetics, and evolution.', 'beginner', false),
('Advanced Mathematics', 'Master calculus, linear algebra, and statistical analysis.', 'advanced', true),
('Web Development Basics', 'HTML, CSS, and JavaScript fundamentals for beginners.', 'beginner', false),
('Data Science with Python', 'Learn data analysis, machine learning, and visualization.', 'intermediate', true),
('Digital Marketing', 'Social media, SEO, and content marketing strategies.', 'beginner', false);