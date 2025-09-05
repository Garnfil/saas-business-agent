"use client"

import { useState, useEffect } from "react"
import { useRouter, useSearchParams } from "next/navigation"
import { Button } from "@/components/ui/button"
import { Card, CardContent } from "@/components/ui/card"
import { Icons } from "@/components/icons"
import Link from "next/link"

interface PaymentDetails {
  plan: string
  amount: number
  discount?: number
  discountPercentage?: number
  finalAmount: number
  transactionId: string
  date: string
  billingCycle: string
}

export default function PaymentSuccessPage() {
  const router = useRouter()
  const searchParams = useSearchParams()
  const [paymentDetails, setPaymentDetails] = useState<PaymentDetails | null>(null)

  useEffect(() => {
    // Get payment details from URL params or simulate based on plan
    const plan = searchParams.get("plan") || "pro"
    const transactionId = searchParams.get("transaction") || `TXN-${Date.now()}`

    const getPaymentDetails = (planType: string): PaymentDetails => {
      const currentDate = new Date().toLocaleDateString("en-US", {
        weekday: "long",
        year: "numeric",
        month: "long",
        day: "numeric",
      })

      switch (planType) {
        case "premium":
          return {
            plan: "Premium Plan",
            amount: 2999.0,
            discount: 299.8,
            discountPercentage: 10,
            finalAmount: 2699.2,
            transactionId,
            date: currentDate,
            billingCycle: "Monthly",
          }
        case "pro":
          return {
            plan: "Pro Plan",
            amount: 999.0,
            discount: 99.8,
            discountPercentage: 10,
            finalAmount: 899.2,
            transactionId,
            date: currentDate,
            billingCycle: "Monthly",
          }
        default:
          return {
            plan: "Free Plan",
            amount: 0.0,
            finalAmount: 0.0,
            transactionId,
            date: currentDate,
            billingCycle: "Free",
          }
      }
    }

    setPaymentDetails(getPaymentDetails(plan))
  }, []) // Empty dependency array to run only once on mount

  const handleContinue = () => {
    router.push("/onboarding")
  }

  const handleViewBilling = () => {
    router.push("/dashboard/billing")
  }

  if (!paymentDetails) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-slate-900 via-black to-slate-900 flex items-center justify-center">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-white"></div>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-900 via-black to-slate-900 flex items-center justify-center p-4">

      <Card className="relative z-10 w-full max-w-lg bg-slate-800/95 border-slate-700 backdrop-blur-sm">
        <CardContent className="p-8">


          {/* Success Icon */}
          <div className="flex justify-center mb-6">
            <div className="w-16 h-16 bg-green-500 rounded-full flex items-center justify-center">
              <Icons.check className="w-8 h-8 text-white" />
            </div>
          </div>

          {/* Header */}
          <div className="text-center mb-8">
            <h1 className="text-2xl font-bold text-white mb-2">Payment Summary</h1>
            <p className="text-slate-400">Your subscription has been activated successfully!</p>
          </div>

          {/* Payment Details */}
          <div className="space-y-6">
            {/* Plan Information */}
            <div className="space-y-3">
              <div className="flex justify-between items-center">
                <span className="text-slate-400 text-sm">Plan</span>
                <span className="text-white font-medium">{paymentDetails.plan}</span>
              </div>
              <div className="flex justify-between items-center">
                <span className="text-slate-400 text-sm">Billing Cycle</span>
                <span className="text-white">{paymentDetails.billingCycle}</span>
              </div>
              <div className="flex justify-between items-center">
                <span className="text-slate-400 text-sm">Transaction ID</span>
                <span className="text-white font-mono text-sm">{paymentDetails.transactionId}</span>
              </div>
              <div className="flex justify-between items-center">
                <span className="text-slate-400 text-sm">Date</span>
                <span className="text-white">{paymentDetails.date}</span>
              </div>
            </div>

            {/* Pricing Breakdown */}
            <div className="border-t border-slate-700 pt-4 space-y-3">
              <div className="flex justify-between items-center">
                <span className="text-slate-400">Subscription Fee</span>
                <span className="text-white">₱{paymentDetails.amount.toFixed(2)}</span>
              </div>

              {paymentDetails.discount && (
                <div className="flex justify-between items-center">
                  <span className="text-slate-400">First Month Discount ({paymentDetails.discountPercentage}%)</span>
                  <span className="text-green-400">-₱{paymentDetails.discount.toFixed(2)}</span>
                </div>
              )}

              <div className="border-t border-slate-700 pt-3">
                <div className="flex justify-between items-center">
                  <span className="text-slate-400 font-medium">Total Charged</span>
                  <span className="text-2xl font-bold text-green-400">₱{paymentDetails.finalAmount.toFixed(2)}</span>
                </div>
              </div>
            </div>

            {/* Features Included */}
            <div className="bg-slate-900/50 rounded-lg p-4 border border-slate-700">
              <h3 className="text-white font-medium mb-3">What's Included:</h3>
              <div className="space-y-2">
                {paymentDetails.plan === "Premium Plan" && (
                  <>
                    <div className="flex items-center gap-2">
                      <Icons.check className="w-4 h-4 text-green-400" />
                      <span className="text-slate-300 text-sm">Unlimited AI conversations</span>
                    </div>
                    <div className="flex items-center gap-2">
                      <Icons.check className="w-4 h-4 text-green-400" />
                      <span className="text-slate-300 text-sm">Unlimited data sources</span>
                    </div>
                    <div className="flex items-center gap-2">
                      <Icons.check className="w-4 h-4 text-green-400" />
                      <span className="text-slate-300 text-sm">24/7 priority support</span>
                    </div>
                    <div className="flex items-center gap-2">
                      <Icons.check className="w-4 h-4 text-green-400" />
                      <span className="text-slate-300 text-sm">Advanced analytics & reporting</span>
                    </div>
                  </>
                )}
                {paymentDetails.plan === "Pro Plan" && (
                  <>
                    <div className="flex items-center gap-2">
                      <Icons.check className="w-4 h-4 text-green-400" />
                      <span className="text-slate-300 text-sm">5,000 AI conversations/month</span>
                    </div>
                    <div className="flex items-center gap-2">
                      <Icons.check className="w-4 h-4 text-green-400" />
                      <span className="text-slate-300 text-sm">15 data source connections</span>
                    </div>
                    <div className="flex items-center gap-2">
                      <Icons.check className="w-4 h-4 text-green-400" />
                      <span className="text-slate-300 text-sm">Priority email support</span>
                    </div>
                    <div className="flex items-center gap-2">
                      <Icons.check className="w-4 h-4 text-green-400" />
                      <span className="text-slate-300 text-sm">Advanced analytics</span>
                    </div>
                  </>
                )}
              </div>
            </div>
          </div>

          {/* Action Buttons */}
          <div className="space-y-3 mt-8">
            <Link href="/onboarding" >
              <Button
                onClick={handleContinue}
                className="w-full bg-violet-700 hover:bg-violet-800 text-white h-12 font-medium"
              >
                Continue Setup
              </Button>
            </Link>

            <Button
              variant="outline"
              disabled={true}
              onClick={handleViewBilling}
              className="w-full bg-transparent border-slate-600 text-slate-200 hover:bg-slate-700 h-12"
            >
              View Billing Details
            </Button>
          </div>

          {/* Footer Links */}
          <div className="flex justify-center gap-6 mt-6 text-sm">
            <Link href="/dashboard" className="text-slate-400 hover:text-white transition-colors">
              Go to Dashboard
            </Link>
            <Link href="/support" className="text-slate-400 hover:text-white transition-colors">
              Need Help?
            </Link>
          </div>
        </CardContent>
      </Card>
    </div>
  )
}
