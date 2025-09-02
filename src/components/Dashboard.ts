import { AuthService } from '../lib/auth'
import { LearningService } from '../lib/learning'
import { AnalyticsService } from '../lib/analytics'
import { PaymentService } from '../lib/payments'
import { PaymentModal } from './PaymentModal'

export class Dashboard {
  private container: HTMLElement
  private user: any
  private profile: any

  constructor(container: HTMLElement) {
    this.container = container
    this.init()
  }

  private async init() {
    this.user = await AuthService.getCurrentUser()
    if (!this.user) {
      this.showLoginPrompt()
      return
    }

    try {
      this.profile = await AuthService.getProfile(this.user.id)
      await this.render()
      await this.loadUserData()
    } catch (error) {
      console.error('Dashboard init error:', error)
    }
  }

  private showLoginPrompt() {
    this.container.innerHTML = `
      <div class="login-prompt">
        <h2>Welcome to EduMateAI</h2>
        <p>Please sign in to access your personalized dashboard</p>
        <button class="btn btn-primary" id="showAuthModal">Sign In / Sign Up</button>
      </div>
    `

    const showAuthBtn = this.container.querySelector('#showAuthModal') as HTMLElement
    showAuthBtn.addEventListener('click', () => {
      const authModal = new (window as any).AuthModal()
      authModal.show()
    })
  }

  private async render() {
    this.container.innerHTML = `
      <div class="dashboard">
        <div class="dashboard-header">
          <div class="user-info">
            <h1>Welcome back, ${this.profile.full_name || 'Learner'}!</h1>
            <div class="subscription-status">
              <span class="badge ${this.profile.subscription_tier === 'premium' ? 'badge-premium' : 'badge-free'}">
                ${this.profile.subscription_tier === 'premium' ? '👑 Premium' : '🆓 Free'}
              </span>
              ${this.profile.subscription_tier === 'free' ? 
                '<button class="btn btn-primary btn-sm" id="upgradeBtn">Upgrade to Premium</button>' : 
                '<button class="btn btn-secondary btn-sm" id="manageBtn">Manage Subscription</button>'
              }
            </div>
          </div>
          <button class="btn btn-secondary" id="signOutBtn">Sign Out</button>
        </div>

        <div class="dashboard-tabs">
          <button class="dashboard-tab active" data-tab="overview">📊 Overview</button>
          <button class="dashboard-tab" data-tab="flashcards">🃏 Flashcards</button>
          <button class="dashboard-tab" data-tab="quizzes">🧠 Quizzes</button>
          <button class="dashboard-tab" data-tab="courses">📚 Courses</button>
          <button class="dashboard-tab" data-tab="certificates">🎓 Certificates</button>
        </div>

        <div class="dashboard-content">
          <div class="dashboard-panel active" id="overview">
            <div class="stats-grid">
              <div class="stat-card">
                <div class="stat-icon">🔥</div>
                <div class="stat-value" id="studyStreak">0</div>
                <div class="stat-label">Day Streak</div>
              </div>
              <div class="stat-card">
                <div class="stat-icon">⏱️</div>
                <div class="stat-value" id="totalTime">0h</div>
                <div class="stat-label">Total Study Time</div>
              </div>
              <div class="stat-card">
                <div class="stat-icon">🎯</div>
                <div class="stat-value" id="avgScore">0%</div>
                <div class="stat-label">Average Score</div>
              </div>
              <div class="stat-card">
                <div class="stat-icon">🏆</div>
                <div class="stat-value" id="certificates">0</div>
                <div class="stat-label">Certificates</div>
              </div>
            </div>
            
            <div class="recent-activity">
              <h3>Recent Activity</h3>
              <div id="activityList" class="activity-list">
                <div class="activity-item">
                  <div class="activity-icon">📚</div>
                  <div class="activity-content">
                    <div class="activity-title">Welcome to EduMateAI!</div>
                    <div class="activity-time">Just now</div>
                  </div>
                </div>
              </div>
            </div>
          </div>

          <div class="dashboard-panel" id="flashcards">
            <div class="panel-header">
              <h3>Your Flashcards</h3>
              <button class="btn btn-primary" id="createFlashcardBtn">Create New</button>
            </div>
            
            <div class="flashcard-generator">
              <textarea id="notesInput" class="input textarea" placeholder="Paste your study notes here to generate flashcards..."></textarea>
              <button class="btn btn-primary" id="generateFlashcardsBtn">✨ Generate with AI</button>
            </div>
            
            <div id="flashcardsList" class="flashcards-grid"></div>
          </div>

          <div class="dashboard-panel" id="quizzes">
            <div class="panel-header">
              <h3>Practice Quizzes</h3>
              <div class="quiz-stats">
                <span>Integrity Score: <strong id="integrityScore">100%</strong></span>
              </div>
            </div>
            
            <div id="quizContainer" class="quiz-container">
              <div class="quiz-placeholder">
                <p>Select a course to start practicing</p>
              </div>
            </div>
          </div>

          <div class="dashboard-panel" id="courses">
            <div class="panel-header">
              <h3>Available Courses</h3>
              <div class="course-filters">
                <button class="filter-btn active" data-filter="all">All</button>
                <button class="filter-btn" data-filter="free">Free</button>
                <button class="filter-btn" data-filter="premium">Premium</button>
              </div>
            </div>
            
            <div id="coursesList" class="courses-grid"></div>
          </div>

          <div class="dashboard-panel" id="certificates">
            <div class="panel-header">
              <h3>Your Certificates</h3>
              <p>Verifiable credentials for your achievements</p>
            </div>
            
            <div id="certificatesList" class="certificates-grid">
              <div class="certificate-placeholder">
                <div class="certificate-icon">🎓</div>
                <h4>No certificates yet</h4>
                <p>Complete courses with 80%+ score to earn certificates</p>
              </div>
            </div>
          </div>
        </div>
      </div>
    `

    // Add dashboard styles
    const style = document.createElement('style')
    style.textContent = `
      .dashboard {
        max-width: 1200px;
        margin: 0 auto;
        padding: 24px;
      }

      .dashboard-header {
        display: flex;
        justify-content: space-between;
        align-items: center;
        margin-bottom: 32px;
        padding-bottom: 24px;
        border-bottom: 2px solid #dee2e6;
      }

      .user-info h1 {
        margin-bottom: 8px;
      }

      .subscription-status {
        display: flex;
        align-items: center;
        gap: 12px;
      }

      .badge-premium {
        background: linear-gradient(135deg, #4361ee, #7209b7);
        color: white;
      }

      .badge-free {
        background: #6c757d;
        color: white;
      }

      .btn-sm {
        padding: 6px 12px;
        font-size: 14px;
      }

      .dashboard-tabs {
        display: flex;
        gap: 8px;
        margin-bottom: 24px;
        border-bottom: 2px solid #dee2e6;
        overflow-x: auto;
      }

      .dashboard-tab {
        padding: 12px 20px;
        background: none;
        border: none;
        cursor: pointer;
        font-weight: 600;
        color: #6c757d;
        border-bottom: 3px solid transparent;
        transition: all 0.2s ease;
        white-space: nowrap;
      }

      .dashboard-tab.active {
        color: #4361ee;
        border-bottom-color: #4361ee;
      }

      .dashboard-tab:hover {
        color: #4361ee;
      }

      .dashboard-content {
        min-height: 400px;
      }

      .dashboard-panel {
        display: none;
      }

      .dashboard-panel.active {
        display: block;
        animation: fadeIn 0.3s ease;
      }

      .panel-header {
        display: flex;
        justify-content: space-between;
        align-items: center;
        margin-bottom: 24px;
      }

      .stats-grid {
        display: grid;
        grid-template-columns: repeat(auto-fit, minmax(200px, 1fr));
        gap: 20px;
        margin-bottom: 32px;
      }

      .stat-card {
        background: white;
        padding: 24px;
        border-radius: 12px;
        box-shadow: 0 4px 6px -1px rgba(0, 0, 0, 0.1);
        text-align: center;
        transition: transform 0.2s ease;
      }

      .stat-card:hover {
        transform: translateY(-2px);
      }

      .stat-icon {
        font-size: 2rem;
        margin-bottom: 12px;
      }

      .stat-value {
        font-size: 2rem;
        font-weight: 700;
        color: #4361ee;
        margin-bottom: 4px;
      }

      .stat-label {
        color: #6c757d;
        font-size: 14px;
      }

      .recent-activity {
        background: white;
        padding: 24px;
        border-radius: 12px;
        box-shadow: 0 4px 6px -1px rgba(0, 0, 0, 0.1);
      }

      .activity-list {
        display: flex;
        flex-direction: column;
        gap: 16px;
      }

      .activity-item {
        display: flex;
        align-items: center;
        gap: 16px;
        padding: 16px;
        background: #f8f9fa;
        border-radius: 8px;
      }

      .activity-icon {
        font-size: 1.5rem;
      }

      .activity-title {
        font-weight: 600;
        margin-bottom: 4px;
      }

      .activity-time {
        font-size: 12px;
        color: #6c757d;
      }

      .flashcard-generator {
        background: white;
        padding: 24px;
        border-radius: 12px;
        box-shadow: 0 4px 6px -1px rgba(0, 0, 0, 0.1);
        margin-bottom: 24px;
      }

      .flashcards-grid {
        display: grid;
        grid-template-columns: repeat(auto-fill, minmax(300px, 1fr));
        gap: 20px;
      }

      .courses-grid {
        display: grid;
        grid-template-columns: repeat(auto-fill, minmax(300px, 1fr));
        gap: 20px;
      }

      .course-card {
        background: white;
        padding: 24px;
        border-radius: 12px;
        box-shadow: 0 4px 6px -1px rgba(0, 0, 0, 0.1);
        transition: transform 0.2s ease;
      }

      .course-card:hover {
        transform: translateY(-2px);
      }

      .course-premium {
        border: 2px solid #4361ee;
      }

      .course-filters {
        display: flex;
        gap: 8px;
      }

      .filter-btn {
        padding: 8px 16px;
        background: #f8f9fa;
        border: none;
        border-radius: 20px;
        cursor: pointer;
        transition: all 0.2s ease;
      }

      .filter-btn.active {
        background: #4361ee;
        color: white;
      }

      .certificates-grid {
        display: grid;
        grid-template-columns: repeat(auto-fill, minmax(300px, 1fr));
        gap: 20px;
      }

      .certificate-placeholder {
        text-align: center;
        padding: 48px;
        background: white;
        border-radius: 12px;
        box-shadow: 0 4px 6px -1px rgba(0, 0, 0, 0.1);
      }

      .certificate-icon {
        font-size: 4rem;
        margin-bottom: 16px;
        opacity: 0.5;
      }

      @media (max-width: 768px) {
        .dashboard-header {
          flex-direction: column;
          align-items: flex-start;
          gap: 16px;
        }

        .subscription-status {
          flex-direction: column;
          align-items: flex-start;
        }

        .stats-grid {
          grid-template-columns: repeat(2, 1fr);
        }
      }
    `
    document.head.appendChild(style)

    this.setupEventListeners()
  }

  private setupEventListeners() {
    // Tab switching
    const tabs = this.container.querySelectorAll('.dashboard-tab')
    const panels = this.container.querySelectorAll('.dashboard-panel')

    tabs.forEach(tab => {
      tab.addEventListener('click', () => {
        const targetTab = (tab as HTMLElement).dataset.tab!
        
        tabs.forEach(t => t.classList.remove('active'))
        tab.classList.add('active')
        
        panels.forEach(panel => panel.classList.remove('active'))
        this.container.querySelector(`#${targetTab}`)?.classList.add('active')
      })
    })

    // Sign out
    const signOutBtn = this.container.querySelector('#signOutBtn')
    signOutBtn?.addEventListener('click', async () => {
      await AuthService.signOut()
      window.location.reload()
    })

    // Upgrade button
    const upgradeBtn = this.container.querySelector('#upgradeBtn')
    upgradeBtn?.addEventListener('click', () => {
      const paymentModal = new PaymentModal(this.user.id)
      paymentModal.show()
    })

    // Generate flashcards
    const generateBtn = this.container.querySelector('#generateFlashcardsBtn')
    const notesInput = this.container.querySelector('#notesInput') as HTMLTextAreaElement

    generateBtn?.addEventListener('click', async () => {
      const notes = notesInput.value.trim()
      if (!notes) {
        alert('Please enter some study notes first!')
        return
      }

      try {
        generateBtn.textContent = 'Generating...'
        const flashcards = await LearningService.generateFlashcards(notes, this.user.id)
        await this.loadFlashcards()
        notesInput.value = ''
        await AnalyticsService.trackEvent('flashcards_generated', { count: flashcards.length })
      } catch (error: any) {
        alert(`Error: ${error.message}`)
      } finally {
        generateBtn.textContent = '✨ Generate with AI'
      }
    })
  }

  private async loadUserData() {
    try {
      // Load user stats
      const stats = await AnalyticsService.getUserStats(this.user.id)
      
      const studyStreakEl = this.container.querySelector('#studyStreak')
      const totalTimeEl = this.container.querySelector('#totalTime')
      const avgScoreEl = this.container.querySelector('#avgScore')
      const certificatesEl = this.container.querySelector('#certificates')

      if (studyStreakEl) studyStreakEl.textContent = stats.studyStreak.toString()
      if (totalTimeEl) totalTimeEl.textContent = `${Math.floor(stats.totalStudyTime / 60)}h`
      if (avgScoreEl) avgScoreEl.textContent = `${stats.averageScore}%`
      if (certificatesEl) certificatesEl.textContent = stats.certificates.toString()

      // Load courses
      await this.loadCourses()
      
      // Load flashcards
      await this.loadFlashcards()

    } catch (error) {
      console.error('Error loading user data:', error)
    }
  }

  private async loadCourses() {
    try {
      const isPremium = this.profile.subscription_tier === 'premium'
      const courses = await LearningService.getCourses(isPremium)
      
      const coursesList = this.container.querySelector('#coursesList')
      if (!coursesList) return

      coursesList.innerHTML = courses.map(course => `
        <div class="course-card ${course.is_premium ? 'course-premium' : ''}">
          <div class="course-header">
            <h4>${course.title}</h4>
            ${course.is_premium ? '<span class="badge badge-premium">Premium</span>' : ''}
          </div>
          <p>${course.description}</p>
          <div class="course-meta">
            <span class="difficulty-badge difficulty-${course.difficulty_level}">
              ${course.difficulty_level}
            </span>
          </div>
          <button class="btn ${course.is_premium && !isPremium ? 'btn-secondary' : 'btn-primary'}" 
                  data-course-id="${course.id}"
                  ${course.is_premium && !isPremium ? 'disabled' : ''}>
            ${course.is_premium && !isPremium ? '🔒 Premium Required' : '📚 Start Learning'}
          </button>
        </div>
      `).join('')

      // Add course interaction
      coursesList.querySelectorAll('button[data-course-id]').forEach(btn => {
        btn.addEventListener('click', (e) => {
          const courseId = (e.target as HTMLElement).dataset.courseId!
          this.startCourse(courseId)
        })
      })

    } catch (error) {
      console.error('Error loading courses:', error)
    }
  }

  private async loadFlashcards() {
    try {
      const flashcards = await LearningService.getUserFlashcards(this.user.id)
      
      const flashcardsList = this.container.querySelector('#flashcardsList')
      if (!flashcardsList) return

      if (flashcards.length === 0) {
        flashcardsList.innerHTML = `
          <div class="flashcard-placeholder">
            <p>No flashcards yet. Generate some from your study notes!</p>
          </div>
        `
        return
      }

      flashcardsList.innerHTML = flashcards.map(card => `
        <div class="flashcard-item" onclick="this.classList.toggle('flipped')">
          <div class="flashcard-inner">
            <div class="flashcard-front">
              <h4>${card.front_text}</h4>
              <small>Click to reveal answer</small>
            </div>
            <div class="flashcard-back">
              <p>${card.back_text}</p>
              <small>Click to flip back</small>
            </div>
          </div>
        </div>
      `).join('')

    } catch (error) {
      console.error('Error loading flashcards:', error)
    }
  }

  private async startCourse(courseId: string) {
    await AnalyticsService.trackEvent('course_started', { courseId, userId: this.user.id })
    
    // Switch to quiz tab and load course quiz
    const quizTab = this.container.querySelector('[data-tab="quizzes"]') as HTMLElement
    quizTab.click()
    
    // Load quiz for this course
    await this.loadCourseQuiz(courseId)
  }

  private async loadCourseQuiz(courseId: string) {
    const quizContainer = this.container.querySelector('#quizContainer')
    if (!quizContainer) return

    // Sample quiz questions - in production, these would come from the database
    const questions = [
      {
        question: "What is the primary function of mitochondria in cells?",
        options: [
          "Energy production (ATP synthesis)",
          "Protein synthesis",
          "DNA replication",
          "Waste removal"
        ],
        correct: 0
      },
      {
        question: "Which process converts light energy into chemical energy?",
        options: [
          "Cellular respiration",
          "Photosynthesis",
          "Fermentation",
          "Glycolysis"
        ],
        correct: 1
      }
    ]

    let currentQuestion = 0
    let score = 0
    let startTime = Date.now()
    let integrityViolations = 0

    const renderQuestion = () => {
      const question = questions[currentQuestion]
      quizContainer.innerHTML = `
        <div class="quiz-question-container">
          <div class="quiz-progress">
            <div class="progress-bar">
              <div class="progress-fill" style="width: ${((currentQuestion + 1) / questions.length) * 100}%"></div>
            </div>
            <span>Question ${currentQuestion + 1} of ${questions.length}</span>
          </div>
          
          <div class="quiz-question">
            <h3>${question.question}</h3>
          </div>
          
          <div class="quiz-options">
            ${question.options.map((option, index) => `
              <button class="quiz-option" data-answer="${index}">
                ${String.fromCharCode(65 + index)}) ${option}
              </button>
            `).join('')}
          </div>
          
          <div class="quiz-integrity">
            <div class="integrity-status">
              🛡️ Anti-cheat: <span id="integrityStatus">Active</span>
              <div class="integrity-score">Violations: ${integrityViolations}</div>
            </div>
          </div>
        </div>
      `

      // Add option click handlers
      quizContainer.querySelectorAll('.quiz-option').forEach((option, index) => {
        option.addEventListener('click', () => {
          if (index === question.correct) {
            score++
            option.classList.add('correct')
          } else {
            option.classList.add('incorrect')
            quizContainer.querySelector(`[data-answer="${question.correct}"]`)?.classList.add('correct')
          }

          // Disable all options
          quizContainer.querySelectorAll('.quiz-option').forEach(opt => {
            opt.setAttribute('disabled', 'true')
          })

          // Move to next question after delay
          setTimeout(() => {
            currentQuestion++
            if (currentQuestion < questions.length) {
              renderQuestion()
            } else {
              this.finishQuiz(courseId, score, questions.length, startTime, integrityViolations)
            }
          }, 1500)
        })
      })
    }

    // Start integrity monitoring
    this.startIntegrityMonitoring(() => {
      integrityViolations++
      const statusEl = quizContainer.querySelector('#integrityStatus')
      if (statusEl) statusEl.textContent = `${integrityViolations} violations detected`
    })

    renderQuestion()
  }

  private async finishQuiz(courseId: string, score: number, total: number, startTime: number, violations: number) {
    const timeTaken = Math.floor((Date.now() - startTime) / 1000)
    const integrityScore = Math.max(0, 100 - (violations * 10))

    try {
      await LearningService.submitQuizSession(
        this.user.id,
        courseId,
        score,
        total,
        timeTaken,
        integrityScore
      )

      const quizContainer = this.container.querySelector('#quizContainer')
      if (quizContainer) {
        quizContainer.innerHTML = `
          <div class="quiz-results">
            <div class="results-header">
              <h3>Quiz Complete! 🎉</h3>
            </div>
            <div class="results-stats">
              <div class="result-stat">
                <div class="result-value">${score}/${total}</div>
                <div class="result-label">Score</div>
              </div>
              <div class="result-stat">
                <div class="result-value">${Math.floor(timeTaken / 60)}:${(timeTaken % 60).toString().padStart(2, '0')}</div>
                <div class="result-label">Time</div>
              </div>
              <div class="result-stat">
                <div class="result-value">${integrityScore}%</div>
                <div class="result-label">Integrity</div>
              </div>
            </div>
            ${score / total >= 0.8 ? `
              <div class="certificate-earned">
                <h4>🏆 Certificate Earned!</h4>
                <button class="btn btn-primary" id="downloadCert">Download Certificate</button>
              </div>
            ` : ''}
            <button class="btn btn-secondary" onclick="location.reload()">Take Another Quiz</button>
          </div>
        `

        // Handle certificate download
        const downloadBtn = quizContainer.querySelector('#downloadCert')
        downloadBtn?.addEventListener('click', async () => {
          try {
            await LearningService.generateCertificate(this.user.id, courseId)
            alert('Certificate generated! Check your certificates tab.')
          } catch (error: any) {
            alert(`Error: ${error.message}`)
          }
        })
      }

      await AnalyticsService.trackEvent('quiz_completed', {
        courseId,
        score,
        total,
        timeTaken,
        integrityScore,
        userId: this.user.id
      })

    } catch (error) {
      console.error('Error submitting quiz:', error)
    }
  }

  private startIntegrityMonitoring(onViolation: () => void) {
    // Monitor tab visibility
    document.addEventListener('visibilitychange', () => {
      if (document.hidden) {
        onViolation()
        AnalyticsService.trackEvent('integrity_violation', { 
          type: 'tab_switch',
          userId: this.user.id 
        })
      }
    })

    // Monitor window focus
    window.addEventListener('blur', () => {
      onViolation()
      AnalyticsService.trackEvent('integrity_violation', { 
        type: 'window_blur',
        userId: this.user.id 
      })
    })

    // Monitor right-click (prevent cheating)
    document.addEventListener('contextmenu', (e) => {
      e.preventDefault()
      onViolation()
      AnalyticsService.trackEvent('integrity_violation', { 
        type: 'right_click',
        userId: this.user.id 
      })
    })
  }
}