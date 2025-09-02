import { supabase } from './supabase'
import type { Flashcard, QuizSession, UserProgress } from './supabase'

export class LearningService {
  static async generateFlashcards(notes: string, userId: string, courseId?: string): Promise<Flashcard[]> {
    // Simulate AI processing - in production, this would call an AI service
    const concepts = this.extractConcepts(notes)
    const flashcards: Omit<Flashcard, 'id' | 'created_at'>[] = concepts.map(concept => ({
      user_id: userId,
      course_id: courseId || null,
      front_text: `What is ${concept.term}?`,
      back_text: concept.definition,
      difficulty: Math.floor(Math.random() * 3) + 1,
    }))

    const { data, error } = await supabase
      .from('flashcards')
      .insert(flashcards)
      .select()

    if (error) throw error
    return data
  }

  static async getUserFlashcards(userId: string, courseId?: string) {
    let query = supabase
      .from('flashcards')
      .select('*')
      .eq('user_id', userId)
      .order('created_at', { ascending: false })

    if (courseId) {
      query = query.eq('course_id', courseId)
    }

    const { data, error } = await query
    if (error) throw error
    return data
  }

  static async submitQuizSession(
    userId: string,
    courseId: string,
    score: number,
    totalQuestions: number,
    timeTaken: number,
    integrityScore: number = 100
  ) {
    const { data, error } = await supabase
      .from('quiz_sessions')
      .insert({
        user_id: userId,
        course_id: courseId,
        score,
        total_questions: totalQuestions,
        time_taken: timeTaken,
        integrity_score: integrityScore,
      })
      .select()
      .single()

    if (error) throw error

    // Update user progress
    await this.updateProgress(userId, courseId, score, totalQuestions, timeTaken)

    return data
  }

  static async updateProgress(
    userId: string,
    courseId: string,
    score: number,
    totalQuestions: number,
    studyTime: number
  ) {
    const completionPercentage = (score / totalQuestions) * 100

    const { data: existingProgress } = await supabase
      .from('user_progress')
      .select('*')
      .eq('user_id', userId)
      .eq('course_id', courseId)
      .single()

    if (existingProgress) {
      // Update existing progress
      const newCompletionPercentage = Math.max(
        existingProgress.completion_percentage,
        completionPercentage
      )

      const { error } = await supabase
        .from('user_progress')
        .update({
          completion_percentage: newCompletionPercentage,
          total_study_time: existingProgress.total_study_time + studyTime,
          last_activity: new Date().toISOString(),
        })
        .eq('id', existingProgress.id)

      if (error) throw error
    } else {
      // Create new progress record
      const { error } = await supabase
        .from('user_progress')
        .insert({
          user_id: userId,
          course_id: courseId,
          completion_percentage: completionPercentage,
          total_study_time: studyTime,
          study_streak: 1,
        })

      if (error) throw error
    }
  }

  static async getUserProgress(userId: string) {
    const { data, error } = await supabase
      .from('user_progress')
      .select(`
        *,
        courses (
          title,
          difficulty_level
        )
      `)
      .eq('user_id', userId)

    if (error) throw error
    return data
  }

  static async getCourses(isPremiumUser: boolean = false) {
    let query = supabase
      .from('courses')
      .select('*')
      .order('created_at', { ascending: false })

    if (!isPremiumUser) {
      query = query.eq('is_premium', false)
    }

    const { data, error } = await query
    if (error) throw error
    return data
  }

  static async generateCertificate(userId: string, courseId: string) {
    // Check if user has completed the course (>= 80% completion)
    const { data: progress } = await supabase
      .from('user_progress')
      .select('completion_percentage')
      .eq('user_id', userId)
      .eq('course_id', courseId)
      .single()

    if (!progress || progress.completion_percentage < 80) {
      throw new Error('Course completion requirement not met (80% minimum)')
    }

    // Generate verification code
    const verificationCode = this.generateVerificationCode()

    const { data, error } = await supabase
      .from('certificates')
      .insert({
        user_id: userId,
        course_id: courseId,
        verification_code: verificationCode,
      })
      .select()
      .single()

    if (error) throw error
    return data
  }

  private static extractConcepts(notes: string) {
    // Simple concept extraction - in production, this would use AI
    const sentences = notes.split(/[.!?]+/).filter(s => s.trim().length > 10)
    const concepts = []

    for (const sentence of sentences.slice(0, 3)) {
      const words = sentence.trim().split(' ')
      if (words.length > 5) {
        const term = words.slice(0, 3).join(' ')
        const definition = sentence.trim()
        concepts.push({ term, definition })
      }
    }

    return concepts.length > 0 ? concepts : [
      { term: 'Key Concept', definition: notes.substring(0, 100) + '...' }
    ]
  }

  private static generateVerificationCode(): string {
    return 'CERT-' + Math.random().toString(36).substring(2, 15).toUpperCase()
  }
}