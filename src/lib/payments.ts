import { loadStripe } from '@stripe/stripe-js'
import { supabase } from './supabase'

const stripePromise = loadStripe(import.meta.env.VITE_STRIPE_PUBLISHABLE_KEY)

export class PaymentService {
  static async createSubscription(priceId: string, userId: string) {
    try {
      const { data, error } = await supabase.functions.invoke('create-payment-intent', {
        body: { priceId, userId }
      })

      if (error) throw error

      const stripe = await stripePromise
      if (!stripe) throw new Error('Stripe failed to load')

      const { error: stripeError } = await stripe.confirmPayment({
        clientSecret: data.clientSecret,
        confirmParams: {
          return_url: `${window.location.origin}/dashboard?success=true`,
        },
      })

      if (stripeError) throw stripeError

      return data
    } catch (error) {
      console.error('Payment error:', error)
      throw error
    }
  }

  static async getSubscriptionStatus(userId: string) {
    const { data, error } = await supabase
      .from('subscriptions')
      .select('*')
      .eq('user_id', userId)
      .eq('status', 'active')
      .single()

    if (error && error.code !== 'PGRST116') throw error
    return data
  }

  static async cancelSubscription(subscriptionId: string) {
    // This would typically call a Supabase function to cancel via Stripe API
    const { data, error } = await supabase.functions.invoke('cancel-subscription', {
      body: { subscriptionId }
    })

    if (error) throw error
    return data
  }
}

// Stripe price IDs (these would be from your Stripe dashboard)
export const STRIPE_PRICES = {
  premium_monthly: 'price_premium_monthly', // Replace with actual price ID
  premium_yearly: 'price_premium_yearly',   // Replace with actual price ID
}