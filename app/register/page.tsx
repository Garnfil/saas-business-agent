"use client"

import React, { Suspense, useState } from "react"
import Link from "next/link"
import { useRouter } from "next/navigation"
import { useSearchParams } from "next/navigation"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Checkbox } from "@/components/ui/checkbox"
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select"
import { Icons } from "@/components/icons"
import { useToast } from "@/hooks/use-toast"
import { Eye } from "lucide-react"
import Image from "next/image"
import { register } from "@/lib/actions/auth/register"

// This is a workaround for the useSearchParams() hook in Next.js 13+
// We need to wrap the component that uses useSearchParams in a Suspense boundary
// and make it a separate client component
export default function RegisterPage() {
  return (
    <Suspense fallback={
      <div className="flex items-center justify-center min-h-screen">
        <Icons.spinner className="h-8 w-8 animate-spin" />
      </div>
    }>
      <RegisterForm />
    </Suspense>
  )
}

// Main component that uses useSearchParams must be a client component
function RegisterForm() {
  const [isLoading, setIsLoading] = useState(false)
  const [step, setStep] = useState(1)
  const [formData, setFormData] = useState({
    organizationName: "",
    organizationSize: "",
    industry: "",
    firstName: "",
    lastName: "",
    email: "",
    password: "",
    confirmPassword: "",
    agreeToTerms: false,
  })
  const router = useRouter()
  const searchParams = useSearchParams()
  const plan = searchParams.get("plan") || "free"
  const { toast } = useToast()

  const getPlanInfo = (planType: string) => {
    switch (planType) {
      case "pro":
        return {
          name: "Pro Plan",
          price: "999/month",
          description: "Perfect for growing businesses",
          features: ["Advanced AI features", "Priority support", "10 team members"],
        }
      case "premium":
        return {
          name: "Premium Plan",
          price: "2999/month",
          description: "For medium organizations",
          features: ["Unlimited AI features", "24/7 support", "Unlimited team members"],
        }
      default:
        return {
          name: "Free Plan",
          price: "Free forever",
          description: "Get started with basic features",
          features: ["Basic AI features", "Email support", "3 team members"],
        }
    }
  }

  const planInfo = getPlanInfo(plan)

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()

    if (step === 1) {
      // Basic validation for step 1
      if (!formData.email || !formData.password || !formData.confirmPassword) {
        toast({
          title: "Missing fields",
          description: "Please fill in email and both password fields.",
          variant: "destructive"
        })
        return
      }
      if (formData.password.length < 8) {
        toast({
          title: "Weak password",
          description: "Password must be at least 8 characters.",
          variant: "destructive"
        })
        return
      }
      if (formData.password !== formData.confirmPassword) {
        toast({
          title: "Password mismatch",
          description: "Passwords do not match.",
          variant: "destructive"
        })
        return
      }
      setStep(2)
      return
    }

    // Step 2 validation (on submit)
    if (!formData.organizationName || !formData.organizationSize || !formData.industry) {
      toast({
        title: "Missing organization details",
        description: "Please complete organization name, size, and industry.",
        variant: "destructive"
      })
      return
    }
    if (!formData.agreeToTerms) {
      toast({
        title: "Agree to terms",
        description: "Please accept the Terms and Privacy Policy to continue.",
        variant: "destructive"
      })
      return
    }

    setIsLoading(true)

    try {
      const payload = {
        organization_name: formData.organizationName,
        organization_size: formData.organizationSize,
        industry: formData.industry,
        first_name: formData.firstName,
        last_name: formData.lastName,
        email: formData.email,
        password: formData.password,
        confirm_password: formData.confirmPassword,
        plan: plan, // Using the plan from URL params
        role: 'user', // Default role for new organization owners
        agree_terms: formData.agreeToTerms,
      }

      const result = await register(payload)

      if (result.status === "success") {
        toast({
          title: "Registration successful",
          description: `Welcome to ${formData.organizationName}! Your account has been created.`,
        })
        router.push(`/payment/success?transaction_type=subscription&plan=${plan}`)
      } else {
        toast({
          title: "Registration failed",
          description: result.response?.message || "Please try again.",
          variant: "destructive",
        })
      }
    } catch (error) {
      console.error("Registration error:", error)
      toast({
        title: "Error",
        description: "An unexpected error occurred. Please try again.",
        variant: "destructive",
      })
    } finally {
      setIsLoading(false)
    }
  }

  const handleInputChange = (field: string, value: string | boolean) => {
    setFormData((prev) => ({ ...prev, [field]: value }))
  }

  const handleSocialLogin = (provider: string) => {
    toast({
      title: `${provider} login`,
      description: `${provider} authentication would be implemented here.`,
    })
  }

  return (
    <Suspense fallback={<div className="min-h-screen flex items-center justify-center text-white">Loading...</div>}>
      <div className="min-h-screen flex">
        {/* Left Side - Branding */}
        <div className="hidden lg:flex lg:w-1/2 relative overflow-hidden">
          <div className="p-3">

          </div>
          <div className="absolute inset-0">

            <div className="absolute inset-0 bg-gradient-to-br from-slate-900 via-black to-slate-900"></div>
          </div>
          <div className="w-full py-10 relative z-10 flex flex-col justify-center items-center text-center px-12 text-white">
            <div className="mb-8 space-y-2 flex flex-col items-center">
              <Image src="/sam-logo-white.png" alt="Logo" width={150} height={150} />
              <h1 className="text-4xl font-bold mb-4">SAM - AI Business Assistant</h1>
              <p className="text-xl text-purple-100 mb-12">Complete these easy steps to register your account.</p>
            </div>

            <div className="space-y-4 w-full max-w-sm">
              <div className="border-violet-500 bg-violet-50 dark:bg-violet-900/20 backdrop-blur-sm rounded-xl p-4 border border-white/20">
                <div className="flex items-center gap-3">
                  <div className="w-8 h-8 bg-white rounded-full flex items-center justify-center text-purple-600 font-bold text-sm">
                    1
                  </div>
                  <span className="font-medium">Sign up your account</span>
                </div>
              </div>
              <div className="border-violet-500 bg-violet-50 dark:bg-violet-900/20 backdrop-blur-sm rounded-xl p-4 border border-white/10">
                <div className="flex items-center gap-3">
                  <div className="w-8 h-8 bg-white/20 rounded-full flex items-center justify-center text-white font-bold text-sm">
                    2
                  </div>
                  <span className="font-medium text-white/70">Set up your organization</span>
                </div>
              </div>
              <div className="border-violet-500 bg-violet-50 dark:bg-violet-900/20 backdrop-blur-sm rounded-xl p-4 border border-white/10">
                <div className="flex items-center gap-3">
                  <div className="w-8 h-8 bg-white/20 rounded-full flex items-center justify-center text-white font-bold text-sm">
                    3
                  </div>
                  <span className="font-medium text-white/70">Set up your profile</span>
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Right Side - Form */}
        <div className="w-full lg:w-1/2 bg-black flex items-center justify-center p-8">
          <div className="w-full max-w-lg space-y-8">
            <div className="text-center">
              <h2 className="text-3xl font-bold text-white mb-2">Sign Up Account</h2>
              <p className="text-gray-400">Enter your personal data to create your account.</p>
            </div>

            {/* Plan Section */}
            <div className="bg-gray-900/50 border border-gray-700 rounded-xl p-4">
              <div className="flex items-center justify-between mb-2">
                <div>
                  <h3 className="text-white font-semibold">{planInfo.name}</h3>
                  <p className="text-gray-400 text-sm">{planInfo.description}</p>
                </div>
                <div className="text-right">
                  <p className="text-white font-bold">{planInfo.price}</p>
                </div>
              </div>
              <div className="flex items-center justify-between">
                <div className="flex flex-wrap gap-1">
                  {planInfo.features.slice(0, 2).map((feature, index) => (
                    <span key={index} className="text-xs bg-gray-800 text-gray-300 px-2 py-1 rounded">
                      {feature}
                    </span>
                  ))}
                </div>
                <Link href="/plans" className="text-white hover:text-gray-300 flex items-center text-sm">
                  View Plans
                  <Icons.arrowRight className="w-4 h-4 ml-1" />
                </Link>
              </div>
            </div>

            {/* Social Login Buttons */}
            {/* <div className="space-y-3">
            <Button
              variant="outline"
              className="w-full bg-transparent border-gray-700 text-white hover:bg-gray-800 h-12"
              onClick={() => handleSocialLogin("Google")}
            >
              <svg className="w-5 h-5 mr-3" viewBox="0 0 24 24">
                <path
                  fill="currentColor"
                  d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z"
                />
                <path
                  fill="currentColor"
                  d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z"
                />
                <path
                  fill="currentColor"
                  d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z"
                />
                <path
                  fill="currentColor"
                  d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z"
                />
              </svg>
              Google
            </Button>
            <Button
              variant="outline"
              className="w-full bg-transparent border-gray-700 text-white hover:bg-gray-800 h-12"
              onClick={() => handleSocialLogin("Github")}
            >
              <Icons.bot className="w-5 h-5 mr-3" />
              Github
            </Button>
          </div> */}

            <form onSubmit={handleSubmit} className="space-y-6">
              {step === 1 ? (
                <>
                  <div className="grid grid-cols-2 gap-4">
                    <div className="space-y-2">
                      <Label htmlFor="firstName" className="text-gray-300 text-sm">First Name</Label>
                      <Input
                        id="firstName"
                        type="text"
                        placeholder="John"
                        value={formData.firstName}
                        onChange={(e) => handleInputChange("firstName", e.target.value)}
                        className="bg-gray-900 border-gray-700 text-white placeholder:text-gray-500 h-12"
                        required
                      />
                    </div>
                    <div className="space-y-2">
                      <Label htmlFor="lastName" className="text-gray-300 text-sm">Last Name</Label>
                      <Input
                        id="lastName"
                        type="text"
                        placeholder="Doe"
                        value={formData.lastName}
                        onChange={(e) => handleInputChange("lastName", e.target.value)}
                        className="bg-gray-900 border-gray-700 text-white placeholder:text-gray-500 h-12"
                        required
                      />
                    </div>
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="email" className="text-gray-300 text-sm">Email</Label>
                    <Input
                      id="email"
                      type="email"
                      placeholder="eg. john.doe@example.com"
                      value={formData.email}
                      onChange={(e) => handleInputChange("email", e.target.value)}
                      className="bg-gray-900 border-gray-700 text-white placeholder:text-gray-500 h-12"
                      required
                    />
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="password" className="text-gray-300 text-sm">Password</Label>
                    <div className="relative">
                      <Input
                        id="password"
                        type="password"
                        placeholder="Enter your password"
                        value={formData.password}
                        onChange={(e) => handleInputChange("password", e.target.value)}
                        className="bg-gray-900 border-gray-700 text-white placeholder:text-gray-500 h-12 pr-10"
                        required
                      />
                      <button type="button" className="absolute inset-y-0 right-0 pr-3 flex items-center text-gray-400 hover:text-gray-300">
                        <Eye className="h-4 w-4" />
                      </button>
                    </div>
                    <p className="text-xs text-gray-500">Must be at least 8 characters.</p>
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="confirmPassword" className="text-gray-300 text-sm">Confirm Password</Label>
                    <Input
                      id="confirmPassword"
                      type="password"
                      placeholder="Confirm your password"
                      value={formData.confirmPassword}
                      onChange={(e) => handleInputChange("confirmPassword", e.target.value)}
                      className="bg-gray-900 border-gray-700 text-white placeholder:text-gray-500 h-12"
                      required
                    />
                  </div>
                  <div className="flex gap-2">
                    <Button type="submit" className="w-full bg-violet-700 text-white hover:bg-violet-800 h-12 font-medium" disabled={isLoading}>
                      {isLoading && <Icons.spinner className="mr-2 h-4 w-4 animate-spin" />}
                      Continue
                    </Button>
                  </div>
                </>
              ) : (
                <>
                  <div className="space-y-2">
                    <Label htmlFor="organizationName" className="text-gray-300 text-sm">Organization Name</Label>
                    <Input
                      id="organizationName"
                      placeholder="Acme Corporation"
                      value={formData.organizationName}
                      onChange={(e) => handleInputChange("organizationName", e.target.value)}
                      className="bg-gray-900 border-gray-700 text-white placeholder:text-gray-500 h-12"
                      required
                    />
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="organizationSize" className="text-gray-300 text-sm">Organization Size</Label>
                    <Select value={formData.organizationSize} onValueChange={(value) => handleInputChange("organizationSize", value)}>
                      <SelectTrigger className="bg-gray-900 border-gray-700 text-white h-12">
                        <SelectValue placeholder="Select organization size" />
                      </SelectTrigger>
                      <SelectContent className="bg-gray-900 border-gray-700 text-white">
                        <SelectItem value="1-10">1-10 employees</SelectItem>
                        <SelectItem value="11-50">11-50 employees</SelectItem>
                        <SelectItem value="51-200">51-200 employees</SelectItem>
                        <SelectItem value="201-1000">201-1000 employees</SelectItem>
                        <SelectItem value="1000+">1000+ employees</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="industry" className="text-gray-300 text-sm">Industry</Label>
                    <Select value={formData.industry} onValueChange={(value) => handleInputChange("industry", value)}>
                      <SelectTrigger className="bg-gray-900 border-gray-700 text-white h-12">
                        <SelectValue placeholder="Select your industry" />
                      </SelectTrigger>
                      <SelectContent className="bg-gray-900 border-gray-700 text-white">
                        <SelectItem value="technology">Technology</SelectItem>
                        <SelectItem value="finance">Finance</SelectItem>
                        <SelectItem value="healthcare">Healthcare</SelectItem>
                        <SelectItem value="retail">Retail</SelectItem>
                        <SelectItem value="manufacturing">Manufacturing</SelectItem>
                        <SelectItem value="education">Education</SelectItem>
                        <SelectItem value="other">Other</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>
                  <div className="flex items-center space-x-2">
                    <Checkbox
                      id="terms"
                      checked={formData.agreeToTerms}
                      onCheckedChange={(checked) => handleInputChange("agreeToTerms", checked as boolean)}
                      className="border-gray-700 data-[state=checked]:bg-white data-[state=checked]:text-black"
                    />
                    <Label htmlFor="terms" className="text-sm text-gray-300">
                      I agree to the{" "}
                      <Link href="/terms" className="text-white hover:underline">Terms of Service</Link>{" "}
                      and{" "}
                      <Link href="/privacy" className="text-white hover:underline">Privacy Policy</Link>
                    </Label>
                  </div>
                  <div className="flex gap-2">
                    <Button type="button" variant="outline" className="flex-1 bg-transparent border-gray-700 h-13 text-gray-200 hover:bg-gray-800" onClick={() => setStep(1)}>Back</Button>
                    <Button type="submit" className="flex-1 bg-violet-700 text-white hover:bg-violet-800 h-12 font-medium" disabled={isLoading || !formData.agreeToTerms}>
                      {isLoading && <Icons.spinner className="mr-2 h-4 w-4 animate-spin" />}
                      Create Account
                    </Button>
                  </div>
                </>
              )}

              <p className="text-center text-sm text-gray-400">
                Already have an account?{" "}
                <Link href="/login" className="text-white hover:underline font-medium">
                  Log in
                </Link>
              </p>
            </form>
          </div>
        </div>
      </div>
    </Suspense>
  )
}
