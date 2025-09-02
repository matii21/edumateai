import './style.css'
import { AuthService } from './lib/auth'
import { AnalyticsService } from './lib/analytics'
import { AuthModal } from './components/AuthModal'
import { Dashboard } from './components/Dashboard'

// Make AuthModal globally available for the landing page
(window as any).AuthModal = AuthModal

class EduMateAI {
  private currentUser: any = null
  private authModal: AuthModal | null = null

  constructor() {
    this.init()
  }

  private async init() {
    // Check authentication state
    AuthService.onAuthStateChange((user) => {
      this.currentUser = user
      this.updateUI()
    })

    // Initialize current user
    this.currentUser = await AuthService.getCurrentUser()
    this.updateUI()

    // Setup landing page interactions
    this.setupLandingPage()

    // Register service worker for PWA
    this.registerServiceWorker()

    // Track page view
    await AnalyticsService.trackEvent('page_view', { page: 'landing' })
  }

  private updateUI() {
    const authButtons = document.querySelectorAll('.auth-required')
    const userElements = document.querySelectorAll('.user-only')
    const guestElements = document.querySelectorAll('.guest-only')

    if (this.currentUser) {
      authButtons.forEach(btn => {
        btn.textContent = '🎯 Go to Dashboard'
        btn.removeEventListener('click', this.showAuthModal)
        btn.addEventListener('click', this.showDashboard.bind(this))
      })
      userElements.forEach(el => (el as HTMLElement).style.display = 'block')
      guestElements.forEach(el => (el as HTMLElement).style.display = 'none')
    } else {
      authButtons.forEach(btn => {
        btn.textContent = '🚀 Start Learning for Free'
        btn.removeEventListener('click', this.showDashboard)
        btn.addEventListener('click', this.showAuthModal.bind(this))
      })
      userElements.forEach(el => (el as HTMLElement).style.display = 'none')
      guestElements.forEach(el => (el as HTMLElement).style.display = 'block')
    }
  }

  private showAuthModal() {
    if (!this.authModal) {
      this.authModal = new AuthModal()
    }
    this.authModal.show()
  }

  private showDashboard() {
    // Hide landing page and show dashboard
    const landingPage = document.querySelector('.landing-page') as HTMLElement
    const dashboardContainer = document.querySelector('#dashboardContainer') as HTMLElement

    if (landingPage) landingPage.style.display = 'none'
    if (dashboardContainer) {
      dashboardContainer.style.display = 'block'
      new Dashboard(dashboardContainer)
    }
  }

  private setupLandingPage() {
    // Mobile menu toggle
    const mobileMenuBtn = document.getElementById('mobileMenuBtn')
    const navLinks = document.getElementById('navLinks')

    mobileMenuBtn?.addEventListener('click', () => {
      navLinks?.classList.toggle('active')
    })

    // Demo tabs functionality (existing code from landing page)
    const demoTabs = document.querySelectorAll('.demo-tab')
    const demoPanels = document.querySelectorAll('.demo-panel')

    demoTabs.forEach(tab => {
      tab.addEventListener('click', () => {
        const targetTab = (tab as HTMLElement).dataset.tab!
        
        demoTabs.forEach(t => t.classList.remove('active'))
        tab.classList.add('active')
        
        demoPanels.forEach(panel => panel.classList.remove('active'))
        document.getElementById(targetTab)?.classList.add('active')
      })
    })

    // Landing page demo interactions
    this.setupLandingDemos()

    // Update analytics periodically
    this.startAnalyticsUpdates()
  }

  private setupLandingDemos() {
    // Flashcard demo
    const generateCardsBtn = document.getElementById('generateCards')
    const notesInput = document.getElementById('notesInput') as HTMLTextAreaElement
    const flashcardsContainer = document.getElementById('flashcardsContainer')

    generateCardsBtn?.addEventListener('click', () => {
      const notes = notesInput.value.trim()
      if (!notes) {
        alert('Please enter some study notes first!')
        return
      }

      generateCardsBtn.innerHTML = '<span class="loading"></span> Generating...'
      
      setTimeout(() => {
        this.generateDemoFlashcards(notes, flashcardsContainer!)
        generateCardsBtn.innerHTML = '✨ Generate Flashcards'
      }, 2000)
    })

    // Quiz demo
    const quizOptions = document.querySelectorAll('.quiz-option')
    const quizFeedback = document.getElementById('quizFeedback')
    let quizAnswered = false

    quizOptions.forEach(option => {
      option.addEventListener('click', () => {
        if (quizAnswered) return

        const isCorrect = (option as HTMLElement).dataset.answer === 'correct'
        quizAnswered = true

        quizOptions.forEach(opt => {
          opt.classList.add('disabled')
          if ((opt as HTMLElement).dataset.answer === 'correct') {
            opt.classList.add('correct')
          } else if (opt === option && !isCorrect) {
            opt.classList.add('incorrect')
          }
        })

        if (quizFeedback) {
          if (isCorrect) {
            quizFeedback.innerHTML = '🎉 Correct! Mitochondria are indeed the powerhouses of cells.'
            quizFeedback.style.color = 'var(--success)'
          } else {
            quizFeedback.innerHTML = '❌ Not quite right. The correct answer is A) Energy production.'
            quizFeedback.style.color = 'var(--error)'
          }
        }
      })
    })

    // Text-to-speech demo
    const playVoiceBtn = document.getElementById('playVoice')
    const pauseVoiceBtn = document.getElementById('pauseVoice')
    const voiceText = document.getElementById('voiceText')

    playVoiceBtn?.addEventListener('click', () => {
      if ('speechSynthesis' in window && voiceText) {
        speechSynthesis.cancel()
        
        const utterance = new SpeechSynthesisUtterance(voiceText.textContent!)
        utterance.rate = 0.8
        utterance.pitch = 1
        
        utterance.onstart = () => {
          playVoiceBtn.innerHTML = '🔊 Speaking...'
          playVoiceBtn.setAttribute('disabled', 'true')
        }
        
        utterance.onend = () => {
          playVoiceBtn.innerHTML = '🔊 Listen'
          playVoiceBtn.removeAttribute('disabled')
        }
        
        speechSynthesis.speak(utterance)
      }
    })

    pauseVoiceBtn?.addEventListener('click', () => {
      if (speechSynthesis.speaking) {
        speechSynthesis.cancel()
        if (playVoiceBtn) {
          playVoiceBtn.innerHTML = '🔊 Listen'
          playVoiceBtn.removeAttribute('disabled')
        }
      }
    })
  }

  private generateDemoFlashcards(notes: string, container: HTMLElement) {
    const flashcards = [
      {
        front: "What is the main concept?",
        back: notes.length > 50 ? notes.substring(0, 50) + "..." : notes
      },
      {
        front: "Key takeaway:",
        back: "Click to reveal the answer!"
      }
    ]

    container.innerHTML = flashcards.map(card => `
      <div class="flashcard" onclick="this.classList.toggle('flipped')">
        <div class="flashcard-inner">
          <div class="flashcard-front">
            <h4>${card.front}</h4>
            <small>Click to flip</small>
          </div>
          <div class="flashcard-back">
            <p>${card.back}</p>
            <small>Click to flip back</small>
          </div>
        </div>
      </div>
    `).join('')
  }

  private async startAnalyticsUpdates() {
    const updateAnalytics = async () => {
      try {
        const analytics = await AnalyticsService.getAnalytics()
        
        const activeUsersEl = document.getElementById('activeUsers')
        const quizAttemptsEl = document.getElementById('quizAttempts')
        const integrityScoreEl = document.getElementById('integrityScore')
        const certificationsEl = document.getElementById('certifications')

        if (activeUsersEl) activeUsersEl.textContent = analytics.activeUsers.toLocaleString()
        if (quizAttemptsEl) quizAttemptsEl.textContent = analytics.quizAttempts.toLocaleString()
        if (integrityScoreEl) integrityScoreEl.textContent = `${analytics.integrityScore}%`
        if (certificationsEl) certificationsEl.textContent = analytics.certificates.toString()
      } catch (error) {
        console.error('Analytics update error:', error)
      }
    }

    // Update immediately and then every 30 seconds
    updateAnalytics()
    setInterval(updateAnalytics, 30000)
  }

  private async registerServiceWorker() {
    if ('serviceWorker' in navigator) {
      try {
        await navigator.serviceWorker.register('/sw.js')
        console.log('🔧 Service Worker registered successfully')
      } catch (error) {
        console.error('Service Worker registration failed:', error)
      }
    }
  }
}

// Initialize the application
new EduMateAI()