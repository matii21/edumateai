# 🎓 EduMateAI - Your Personal AI Tutor

> **Learn faster, play smarter with AI-powered education. Get certified anytime, anywhere.**

EduMateAI is a comprehensive educational platform that leverages AI to create personalized learning experiences. Built with modern web technologies and designed for scalability, security, and user engagement.

## 🌟 Features

### 🤖 AI-Powered Learning
- **Smart Flashcard Generation**: Convert study notes into interactive flashcards using AI
- **Adaptive Quizzes**: Intelligent quiz system that adapts to user performance
- **Voice Learning**: Text-to-speech functionality for accessibility and multi-modal learning
- **Progress Tracking**: Comprehensive analytics and learning streak monitoring

### 🛡️ Anti-Cheat System
- **Real-time Integrity Monitoring**: Detects tab switching, window focus loss, and suspicious behavior
- **Integrity Scoring**: Maintains academic honesty with violation tracking
- **Secure Assessment Environment**: Prevents common cheating methods during quizzes

### 🎓 Certification System
- **Verifiable Certificates**: Generate blockchain-style verification codes
- **Achievement Tracking**: Unlock certificates upon course completion (80%+ score required)
- **Shareable Credentials**: Professional certificates for LinkedIn and portfolios

### 💳 Subscription Management
- **Stripe Integration**: Secure payment processing with industry-standard security
- **Tiered Access**: Free and Premium subscription models
- **Automatic Billing**: Seamless subscription management and renewals

### 📊 Analytics Dashboard
- **Real-time Metrics**: Live tracking of user engagement and platform health
- **Learning Analytics**: Detailed insights into study patterns and performance
- **Integrity Monitoring**: Platform-wide academic honesty statistics

## 🏗️ Technology Stack

### Frontend
- **TypeScript** - Type-safe development
- **Vite** - Fast build tool and development server
- **Vanilla JS/TS** - Lightweight, no framework dependencies
- **CSS3** - Modern styling with CSS variables and animations
- **PWA** - Progressive Web App with offline capabilities

### Backend
- **Supabase** - Complete backend-as-a-service
  - PostgreSQL database with Row Level Security (RLS)
  - Real-time subscriptions
  - Edge Functions for serverless computing
  - Built-in authentication system

### Payment Processing
- **Stripe** - Secure payment processing
  - Subscription management
  - Webhook handling
  - Customer portal integration

### Deployment
- **Bolt.new** - Instant deployment platform
- **Edge Functions** - Serverless function deployment
- **CDN** - Global content delivery

## 🚀 Quick Start

### Prerequisites
- Node.js 18+ installed
- Supabase account
- Stripe account (for payments)

### 1. Clone and Install
```bash
git clone <repository-url>
cd edumate-ai
npm install
```

### 2. Environment Setup
Copy the example environment file and configure your keys:
```bash
cp .env.example .env
```

Update `.env` with your credentials:
```env
# Supabase Configuration
VITE_SUPABASE_URL=your_supabase_project_url
VITE_SUPABASE_ANON_KEY=your_supabase_anon_key

# Stripe Configuration
VITE_STRIPE_PUBLISHABLE_KEY=your_stripe_publishable_key
STRIPE_SECRET_KEY=your_stripe_secret_key
STRIPE_WEBHOOK_SECRET=your_stripe_webhook_secret
```

### 3. Database Setup
The database schema is automatically created through Supabase migrations. The schema includes:
- User profiles with subscription tiers
- Course management system
- Flashcard storage
- Quiz session tracking
- Certificate generation
- Subscription management

### 4. Stripe Configuration
1. Create products in your Stripe dashboard:
   - Premium Monthly ($9.99/month)
   - Premium Yearly ($99.99/year)
2. Update the price IDs in `src/lib/payments.ts`
3. Configure webhook endpoints for subscription events

### 5. Run Development Server
```bash
npm run dev
```

Visit `http://localhost:3000` to see the application.

## 📱 PWA Installation

EduMateAI is a Progressive Web App that can be installed on any device:

1. **Desktop**: Click the install button in your browser's address bar
2. **Mobile**: Use "Add to Home Screen" from your browser menu
3. **Offline Support**: Core functionality works without internet connection

## 🔧 Development

### Project Structure
```
src/
├── components/          # Reusable UI components
│   ├── AuthModal.ts    # Authentication modal
│   ├── PaymentModal.ts # Stripe payment interface
│   └── Dashboard.ts    # Main user dashboard
├── lib/                # Core business logic
│   ├── auth.ts         # Authentication service
│   ├── payments.ts     # Stripe payment handling
│   ├── learning.ts     # Learning management
│   ├── analytics.ts    # Analytics and tracking
│   └── supabase.ts     # Database client and types
├── main.ts             # Application entry point
└── style.css           # Global styles

supabase/
├── functions/          # Edge Functions
│   ├── create-payment-intent/
│   └── stripe-webhook/
└── migrations/         # Database migrations
```

### Key Services

#### AuthService
Handles user authentication, profile management, and session state.

#### PaymentService
Manages Stripe subscriptions, payment processing, and billing.

#### LearningService
Core educational features including flashcard generation, quiz management, and progress tracking.

#### AnalyticsService
Real-time analytics, user behavior tracking, and platform metrics.

### Database Schema

The application uses a comprehensive PostgreSQL schema with:
- **profiles**: User information and subscription status
- **courses**: Educational content and difficulty levels
- **flashcards**: AI-generated study materials
- **quiz_sessions**: Assessment results and integrity scores
- **user_progress**: Learning analytics and achievements
- **certificates**: Verifiable completion credentials
- **subscriptions**: Stripe subscription management

All tables include Row Level Security (RLS) policies for data protection.

## 🔒 Security Features

### Authentication
- Email/password authentication via Supabase Auth
- Secure session management
- Profile-based access control

### Payment Security
- PCI-compliant payment processing via Stripe
- Secure webhook validation
- Customer data encryption

### Academic Integrity
- Real-time cheating detection
- Tab switching monitoring
- Window focus tracking
- Right-click prevention during assessments
- Integrity score calculation

### Data Protection
- Row Level Security (RLS) on all database tables
- User data isolation
- Secure API endpoints
- CORS protection

## 💰 Monetization

### Subscription Tiers

**Free Tier:**
- 5 AI-generated flashcards per day
- Basic quiz functionality
- Progress tracking
- Text-to-speech support

**Premium Tier ($9.99/month):**
- Unlimited AI flashcards
- Advanced anti-cheat quizzes
- Detailed analytics
- Voice interactions
- Verified certificates
- Priority support

### Revenue Features
- Stripe subscription management
- Automatic billing and renewals
- Customer portal integration
- Usage-based limitations
- Premium content gating

## 📊 Analytics & Monitoring

### Real-time Metrics
- Active user count
- Daily quiz attempts
- Platform integrity score
- Certificate issuance tracking

### User Analytics
- Study time tracking
- Learning streak monitoring
- Performance analytics
- Achievement systems

## 🌍 SDG 4 Alignment

EduMateAI directly addresses **UN Sustainable Development Goal 4: Quality Education** by:

- **Inclusive Access**: Free tier ensures basic education access for all
- **Quality Assurance**: Anti-cheat system maintains educational integrity
- **Skill Development**: Comprehensive learning tools and certification
- **Technology Integration**: Modern AI-powered educational methods
- **Accessibility**: PWA support and voice features for diverse learners

## 🚀 Deployment

### Bolt.new Deployment
The application is optimized for deployment on Bolt.new:

1. **Automatic Build**: Vite handles the build process
2. **Edge Functions**: Supabase functions deploy automatically
3. **Environment Variables**: Configured through Bolt.new interface
4. **CDN Distribution**: Global content delivery for optimal performance

### Manual Deployment
For other platforms:

```bash
# Build for production
npm run build

# Preview production build
npm run preview
```

## 🔧 Configuration

### Supabase Setup
1. Create a new Supabase project
2. Run the provided migrations to set up the database schema
3. Configure authentication settings
4. Deploy edge functions for payment processing

### Stripe Setup
1. Create Stripe products and prices
2. Configure webhook endpoints
3. Set up customer portal
4. Update price IDs in the application

### Environment Variables
All required environment variables are documented in `.env.example`. The application includes validation to ensure all required variables are present.

## 🧪 Testing

### Manual Testing Checklist
- [ ] User registration and login
- [ ] Flashcard generation from notes
- [ ] Quiz functionality with integrity monitoring
- [ ] Payment flow (test mode)
- [ ] Certificate generation
- [ ] Progress tracking
- [ ] PWA installation

### Anti-Cheat Testing
- [ ] Tab switching detection
- [ ] Window focus monitoring
- [ ] Right-click prevention
- [ ] Integrity score calculation

## 🤝 Contributing

### Development Guidelines
1. Follow TypeScript best practices
2. Maintain modular file organization
3. Ensure all database operations use RLS
4. Test payment flows in Stripe test mode
5. Validate accessibility features

### Code Organization
- Keep files under 300 lines
- Use proper imports/exports
- Maintain clear separation of concerns
- Follow consistent naming conventions

## 📄 License

This project is built for the Vibe Coding Hackathon and demonstrates a complete full-stack educational platform with modern web technologies.

## 🆘 Support

### Common Issues

**Service Worker Errors**: Service Workers are not supported in StackBlitz environment - this is expected and doesn't affect functionality.

**Payment Testing**: Use Stripe test cards for development:
- Success: `4242 4242 4242 4242`
- Decline: `4000 0000 0000 0002`

**Database Connection**: Ensure Supabase environment variables are correctly configured and the database migrations have been applied.

### Getting Help
1. Check the browser console for detailed error messages
2. Verify all environment variables are set
3. Ensure Supabase project is properly configured
4. Test Stripe integration in test mode first

---

**Built with ❤️ for quality education and powered by modern web technologies.**