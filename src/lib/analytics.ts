import { supabase } from './supabase'

export class AnalyticsService {
  static async trackEvent(eventName: string, properties: Record<string, any> = {}) {
    // In production, this would send to analytics service
    console.log('📊 Event tracked:', eventName, properties)
  }

  static async getAnalytics() {
    try {
      // Get active users (users who logged in today)
      const today = new Date()
      today.setHours(0, 0, 0, 0)

      const { count: activeUsers } = await supabase
        .from('profiles')
        .select('*', { count: 'exact', head: true })
        .gte('updated_at', today.toISOString())

      // Get quiz attempts today
      const { count: quizAttempts } = await supabase
        .from('quiz_sessions')
        .select('*', { count: 'exact', head: true })
        .gte('completed_at', today.toISOString())

      // Get certificates issued today
      const { count: certificates } = await supabase
        .from('certificates')
        .select('*', { count: 'exact', head: true })
        .gte('issued_at', today.toISOString())

      // Calculate average integrity score
      const { data: integrityData } = await supabase
        .from('quiz_sessions')
        .select('integrity_score')
        .gte('completed_at', today.toISOString())

      const avgIntegrity = integrityData?.length 
        ? integrityData.reduce((sum, session) => sum + session.integrity_score, 0) / integrityData.length
        : 100

      return {
        activeUsers: activeUsers || 0,
        quizAttempts: quizAttempts || 0,
        certificates: certificates || 0,
        integrityScore: avgIntegrity.toFixed(1),
      }
    } catch (error) {
      console.error('Analytics error:', error)
      return {
        activeUsers: 0,
        quizAttempts: 0,
        certificates: 0,
        integrityScore: '100.0',
      }
    }
  }

  static async getUserStats(userId: string) {
    try {
      // Get user's total study time
      const { data: progressData } = await supabase
        .from('user_progress')
        .select('total_study_time, study_streak')
        .eq('user_id', userId)

      const totalStudyTime = progressData?.reduce((sum, p) => sum + p.total_study_time, 0) || 0
      const maxStreak = Math.max(...(progressData?.map(p => p.study_streak) || [0]))

      // Get quiz performance
      const { data: quizData } = await supabase
        .from('quiz_sessions')
        .select('score, total_questions')
        .eq('user_id', userId)

      const totalQuizzes = quizData?.length || 0
      const avgScore = quizData?.length 
        ? quizData.reduce((sum, q) => sum + (q.score / q.total_questions), 0) / quizData.length * 100
        : 0

      // Get certificates count
      const { count: certificatesCount } = await supabase
        .from('certificates')
        .select('*', { count: 'exact', head: true })
        .eq('user_id', userId)

      return {
        totalStudyTime,
        studyStreak: maxStreak,
        totalQuizzes,
        averageScore: avgScore.toFixed(1),
        certificates: certificatesCount || 0,
      }
    } catch (error) {
      console.error('User stats error:', error)
      return {
        totalStudyTime: 0,
        studyStreak: 0,
        totalQuizzes: 0,
        averageScore: '0.0',
        certificates: 0,
      }
    }
  }
}