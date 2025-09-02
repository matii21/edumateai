import { createClient } from '@supabase/supabase-js'

const supabaseUrl = import.meta.env.VITE_SUPABASE_URL
const supabaseAnonKey = import.meta.env.VITE_SUPABASE_ANON_KEY

if (!supabaseUrl || !supabaseAnonKey) {
  throw new Error('Missing Supabase environment variables')
}

export const supabase = createClient(supabaseUrl, supabaseAnonKey)

// Database types
export interface Profile {
  id: string
  email: string
  full_name?: string
  subscription_tier: 'free' | 'premium'
  stripe_customer_id?: string
  created_at: string
  updated_at: string
}

export interface Course {
  id: string
  title: string
  description?: string
  difficulty_level: 'beginner' | 'intermediate' | 'advanced'
  is_premium: boolean
  created_at: string
}

export interface Flashcard {
  id: string
  user_id: string
  course_id?: string
  front_text: string
  back_text: string
  difficulty: number
  created_at: string
}

export interface QuizSession {
  id: string
  user_id: string
  course_id?: string
  score: number
  total_questions: number
  time_taken: number
  integrity_score: number
  completed_at: string
}

export interface UserProgress {
  id: string
  user_id: string
  course_id: string
  completion_percentage: number
  study_streak: number
  total_study_time: number
  last_activity: string
  updated_at: string
}

export interface Certificate {
  id: string
  user_id: string
  course_id: string
  certificate_url?: string
  verification_code: string
  issued_at: string
}