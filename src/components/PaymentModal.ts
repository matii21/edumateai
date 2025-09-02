import { PaymentService, STRIPE_PRICES } from '../lib/payments'
import { AnalyticsService } from '../lib/analytics'

export class PaymentModal {
  private modal: HTMLElement
  private userId: string

  constructor(userId: string) {
    this.userId = userId
    this.modal = this.createModal()
    document.body.appendChild(this.modal)
    this.setupEventListeners()
  }

  private createModal(): HTMLElement {
    const modal = document.createElement('div')
    modal.className = 'payment-modal'
    modal.innerHTML = `
      <div class="payment-modal-overlay">
        <div class="payment-modal-content">
          <button class="payment-modal-close">&times;</button>
          <div class="payment-modal-header">
            <h2>Upgrade to Premium</h2>
            <p>Unlock unlimited learning potential</p>
          </div>
          
          <div class="pricing-plans">
            <div class="pricing-plan" data-price-id="${STRIPE_PRICES.premium_monthly}">
              <h3>Monthly Premium</h3>
              <div class="price">$9.99<span>/month</span></div>
              <ul class="features">
                <li>✅ Unlimited AI flashcards</li>
                <li>✅ Advanced anti-cheat quizzes</li>
                <li>✅ Verified certificates</li>
                <li>✅ Voice interactions</li>
                <li>✅ Priority support</li>
              </ul>
              <button class="btn btn-primary select-plan">Select Monthly</button>
            </div>
            
            <div class="pricing-plan featured" data-price-id="${STRIPE_PRICES.premium_yearly}">
              <div class="popular-badge">Most Popular</div>
              <h3>Yearly Premium</h3>
              <div class="price">$99.99<span>/year</span></div>
              <div class="savings">Save $19.89!</div>
              <ul class="features">
                <li>✅ Everything in Monthly</li>
                <li>✅ 2 months free</li>
                <li>✅ Exclusive yearly content</li>
                <li>✅ Advanced analytics</li>
                <li>✅ Tutor marketplace access</li>
              </ul>
              <button class="btn btn-primary select-plan">Select Yearly</button>
            </div>
          </div>
          
          <div class="payment-security">
            <div class="security-badges">
              <span class="security-badge">🔒 SSL Secured</span>
              <span class="security-badge">💳 Stripe Protected</span>
              <span class="security-badge">🛡️ PCI Compliant</span>
            </div>
            <p>Your payment information is encrypted and secure</p>
          </div>
        </div>
      </div>
    `

    // Add styles
    const style = document.createElement('style')
    style.textContent = `
      .payment-modal {
        position: fixed;
        top: 0;
        left: 0;
        right: 0;
        bottom: 0;
        z-index: 10001;
        display: none;
      }

      .payment-modal.active {
        display: flex;
        align-items: center;
        justify-content: center;
      }

      .payment-modal-overlay {
        position: absolute;
        top: 0;
        left: 0;
        right: 0;
        bottom: 0;
        background: rgba(0, 0, 0, 0.6);
        backdrop-filter: blur(4px);
        display: flex;
        align-items: center;
        justify-content: center;
        padding: 20px;
      }

      .payment-modal-content {
        background: white;
        border-radius: 16px;
        padding: 32px;
        width: 100%;
        max-width: 800px;
        max-height: 90vh;
        overflow-y: auto;
        position: relative;
        box-shadow: 0 20px 25px -5px rgba(0, 0, 0, 0.1);
        animation: modalSlideIn 0.3s ease;
      }

      .payment-modal-close {
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

      .payment-modal-close:hover {
        background: #f8f9fa;
        color: #212529;
      }

      .payment-modal-header {
        text-align: center;
        margin-bottom: 32px;
      }

      .payment-modal-header h2 {
        margin-bottom: 8px;
        color: #212529;
      }

      .payment-modal-header p {
        color: #6c757d;
        margin: 0;
      }

      .pricing-plans {
        display: grid;
        grid-template-columns: repeat(auto-fit, minmax(300px, 1fr));
        gap: 24px;
        margin-bottom: 32px;
      }

      .pricing-plan {
        border: 2px solid #dee2e6;
        border-radius: 12px;
        padding: 24px;
        text-align: center;
        position: relative;
        transition: all 0.3s ease;
      }

      .pricing-plan:hover {
        border-color: #4361ee;
        transform: translateY(-4px);
        box-shadow: 0 10px 15px -3px rgba(0, 0, 0, 0.1);
      }

      .pricing-plan.featured {
        border-color: #4361ee;
        background: linear-gradient(135deg, rgba(67, 97, 238, 0.05) 0%, rgba(114, 9, 183, 0.05) 100%);
      }

      .popular-badge {
        position: absolute;
        top: -12px;
        left: 50%;
        transform: translateX(-50%);
        background: #4361ee;
        color: white;
        padding: 4px 16px;
        border-radius: 20px;
        font-size: 12px;
        font-weight: 600;
      }

      .pricing-plan h3 {
        margin-bottom: 16px;
        color: #212529;
      }

      .price {
        font-size: 2.5rem;
        font-weight: 700;
        color: #4361ee;
        margin-bottom: 8px;
      }

      .price span {
        font-size: 1rem;
        color: #6c757d;
      }

      .savings {
        color: #06d6a0;
        font-weight: 600;
        margin-bottom: 16px;
      }

      .features {
        list-style: none;
        padding: 0;
        margin: 24px 0;
        text-align: left;
      }

      .features li {
        padding: 8px 0;
        border-bottom: 1px solid #f8f9fa;
      }

      .features li:last-child {
        border-bottom: none;
      }

      .select-plan {
        width: 100%;
        margin-top: 16px;
      }

      .payment-security {
        text-align: center;
        padding-top: 24px;
        border-top: 1px solid #dee2e6;
      }

      .security-badges {
        display: flex;
        justify-content: center;
        gap: 16px;
        margin-bottom: 12px;
        flex-wrap: wrap;
      }

      .security-badge {
        background: #f8f9fa;
        padding: 4px 12px;
        border-radius: 20px;
        font-size: 12px;
        color: #6c757d;
      }

      .payment-security p {
        color: #6c757d;
        font-size: 14px;
        margin: 0;
      }

      @media (max-width: 768px) {
        .pricing-plans {
          grid-template-columns: 1fr;
        }
        
        .security-badges {
          flex-direction: column;
          align-items: center;
        }
      }
    `
    document.head.appendChild(style)

    return modal
  }

  private setupEventListeners() {
    const closeBtn = this.modal.querySelector('.payment-modal-close') as HTMLElement
    const overlay = this.modal.querySelector('.payment-modal-overlay') as HTMLElement
    const selectBtns = this.modal.querySelectorAll('.select-plan')

    closeBtn.addEventListener('click', () => this.hide())
    overlay.addEventListener('click', (e) => {
      if (e.target === overlay) this.hide()
    })

    selectBtns.forEach(btn => {
      btn.addEventListener('click', (e) => this.handlePlanSelection(e))
    })
  }

  private async handlePlanSelection(e: Event) {
    const button = e.target as HTMLElement
    const plan = button.closest('.pricing-plan') as HTMLElement
    const priceId = plan.dataset.priceId!

    try {
      button.textContent = 'Processing...'
      button.setAttribute('disabled', 'true')

      await AnalyticsService.trackEvent('payment_initiated', { 
        priceId, 
        userId: this.userId 
      })

      await PaymentService.createSubscription(priceId, this.userId)
      
      // Success will be handled by Stripe redirect
    } catch (error: any) {
      alert(`Payment failed: ${error.message}`)
      await AnalyticsService.trackEvent('payment_failed', { 
        priceId, 
        userId: this.userId,
        error: error.message 
      })
    } finally {
      button.textContent = button.textContent.includes('Monthly') ? 'Select Monthly' : 'Select Yearly'
      button.removeAttribute('disabled')
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

  destroy() {
    this.modal.remove()
  }
}