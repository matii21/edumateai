import { AuthService } from '../lib/auth'
import { AnalyticsService } from '../lib/analytics'

export class AuthModal {
  private modal: HTMLElement
  private isSignUp: boolean = true

  constructor() {
    this.modal = this.createModal()
    document.body.appendChild(this.modal)
    this.setupEventListeners()
  }

  private createModal(): HTMLElement {
    const modal = document.createElement('div')
    modal.className = 'auth-modal'
    modal.innerHTML = `
      <div class="auth-modal-overlay">
        <div class="auth-modal-content">
          <button class="auth-modal-close">&times;</button>
          <div class="auth-modal-header">
            <h2 id="authTitle">Create Your Account</h2>
            <p id="authSubtitle">Start your learning journey today</p>
          </div>
          <form id="authForm" class="auth-form">
            <div class="form-group" id="nameGroup">
              <label for="fullName">Full Name</label>
              <input type="text" id="fullName" name="fullName" required>
            </div>
            <div class="form-group">
              <label for="email">Email</label>
              <input type="email" id="email" name="email" required>
            </div>
            <div class="form-group">
              <label for="password">Password</label>
              <input type="password" id="password" name="password" required minlength="6">
            </div>
            <button type="submit" class="btn btn-primary auth-submit" id="authSubmit">
              Create Account
            </button>
            <div class="auth-error" id="authError"></div>
          </form>
          <div class="auth-toggle">
            <span id="authToggleText">Already have an account?</span>
            <button type="button" class="auth-toggle-btn" id="authToggleBtn">Sign In</button>
          </div>
        </div>
      </div>
    `

    // Add styles
    const style = document.createElement('style')
    style.textContent = `
      .auth-modal {
        position: fixed;
        top: 0;
        left: 0;
        right: 0;
        bottom: 0;
        z-index: 10000;
        display: none;
      }

      .auth-modal.active {
        display: flex;
        align-items: center;
        justify-content: center;
      }

      .auth-modal-overlay {
        position: absolute;
        top: 0;
        left: 0;
        right: 0;
        bottom: 0;
        background: rgba(0, 0, 0, 0.5);
        backdrop-filter: blur(4px);
        display: flex;
        align-items: center;
        justify-content: center;
        padding: 20px;
      }

      .auth-modal-content {
        background: white;
        border-radius: 16px;
        padding: 32px;
        width: 100%;
        max-width: 400px;
        position: relative;
        box-shadow: 0 20px 25px -5px rgba(0, 0, 0, 0.1);
        animation: modalSlideIn 0.3s ease;
      }

      @keyframes modalSlideIn {
        from {
          opacity: 0;
          transform: translateY(-20px) scale(0.95);
        }
        to {
          opacity: 1;
          transform: translateY(0) scale(1);
        }
      }

      .auth-modal-close {
        position: absolute;
        top: 16px;
        right: 16px;
        background: none;
        border: none;
        font-size: 24px;
        cursor: pointer;
        color: #6c757d;
        width: 32px;
        height: 32px;
        display: flex;
        align-items: center;
        justify-content: center;
        border-radius: 50%;
        transition: all 0.2s ease;
      }

      .auth-modal-close:hover {
        background: #f8f9fa;
        color: #212529;
      }

      .auth-modal-header {
        text-align: center;
        margin-bottom: 24px;
      }

      .auth-modal-header h2 {
        margin-bottom: 8px;
        color: #212529;
      }

      .auth-modal-header p {
        color: #6c757d;
        margin: 0;
      }

      .auth-form {
        display: flex;
        flex-direction: column;
        gap: 20px;
      }

      .form-group {
        display: flex;
        flex-direction: column;
        gap: 8px;
      }

      .form-group label {
        font-weight: 600;
        color: #212529;
      }

      .form-group input {
        padding: 12px;
        border: 2px solid #dee2e6;
        border-radius: 8px;
        font-size: 16px;
        transition: border-color 0.2s ease;
      }

      .form-group input:focus {
        outline: none;
        border-color: #4361ee;
      }

      .auth-submit {
        width: 100%;
        margin-top: 8px;
      }

      .auth-error {
        color: #ef476f;
        font-size: 14px;
        text-align: center;
        margin-top: 8px;
        display: none;
      }

      .auth-error.show {
        display: block;
      }

      .auth-toggle {
        text-align: center;
        margin-top: 24px;
        padding-top: 24px;
        border-top: 1px solid #dee2e6;
      }

      .auth-toggle-btn {
        background: none;
        border: none;
        color: #4361ee;
        font-weight: 600;
        cursor: pointer;
        text-decoration: underline;
        margin-left: 8px;
      }

      .auth-toggle-btn:hover {
        color: #3651d4;
      }
    `
    document.head.appendChild(style)

    return modal
  }

  private setupEventListeners() {
    const closeBtn = this.modal.querySelector('.auth-modal-close') as HTMLElement
    const overlay = this.modal.querySelector('.auth-modal-overlay') as HTMLElement
    const form = this.modal.querySelector('#authForm') as HTMLFormElement
    const toggleBtn = this.modal.querySelector('#authToggleBtn') as HTMLElement

    closeBtn.addEventListener('click', () => this.hide())
    overlay.addEventListener('click', (e) => {
      if (e.target === overlay) this.hide()
    })

    form.addEventListener('submit', (e) => this.handleSubmit(e))
    toggleBtn.addEventListener('click', () => this.toggleMode())

    // Close on escape key
    document.addEventListener('keydown', (e) => {
      if (e.key === 'Escape' && this.modal.classList.contains('active')) {
        this.hide()
      }
    })
  }

  private async handleSubmit(e: Event) {
    e.preventDefault()
    
    const form = e.target as HTMLFormElement
    const formData = new FormData(form)
    const email = formData.get('email') as string
    const password = formData.get('password') as string
    const fullName = formData.get('fullName') as string

    const submitBtn = this.modal.querySelector('#authSubmit') as HTMLElement
    const errorDiv = this.modal.querySelector('#authError') as HTMLElement

    try {
      submitBtn.textContent = 'Processing...'
      submitBtn.setAttribute('disabled', 'true')
      errorDiv.classList.remove('show')

      if (this.isSignUp) {
        await AuthService.signUp(email, password, fullName)
        await AnalyticsService.trackEvent('user_signup', { email })
      } else {
        await AuthService.signIn(email, password)
        await AnalyticsService.trackEvent('user_signin', { email })
      }

      this.hide()
      window.location.reload() // Refresh to update UI state
    } catch (error: any) {
      errorDiv.textContent = error.message
      errorDiv.classList.add('show')
    } finally {
      submitBtn.textContent = this.isSignUp ? 'Create Account' : 'Sign In'
      submitBtn.removeAttribute('disabled')
    }
  }

  private toggleMode() {
    this.isSignUp = !this.isSignUp
    
    const title = this.modal.querySelector('#authTitle') as HTMLElement
    const subtitle = this.modal.querySelector('#authSubtitle') as HTMLElement
    const nameGroup = this.modal.querySelector('#nameGroup') as HTMLElement
    const submitBtn = this.modal.querySelector('#authSubmit') as HTMLElement
    const toggleText = this.modal.querySelector('#authToggleText') as HTMLElement
    const toggleBtn = this.modal.querySelector('#authToggleBtn') as HTMLElement

    if (this.isSignUp) {
      title.textContent = 'Create Your Account'
      subtitle.textContent = 'Start your learning journey today'
      nameGroup.style.display = 'flex'
      submitBtn.textContent = 'Create Account'
      toggleText.textContent = 'Already have an account?'
      toggleBtn.textContent = 'Sign In'
    } else {
      title.textContent = 'Welcome Back'
      subtitle.textContent = 'Continue your learning journey'
      nameGroup.style.display = 'none'
      submitBtn.textContent = 'Sign In'
      toggleText.textContent = "Don't have an account?"
      toggleBtn.textContent = 'Sign Up'
    }
  }

  show() {
    this.modal.classList.add('active')
    document.body.style.overflow = 'hidden'
  }

  hide() {
    this.modal.classList.remove('active')
    document.body.style.overflow = ''
  }
}