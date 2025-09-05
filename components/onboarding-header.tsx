import { Icons } from "@/components/icons"
import Image from "next/image"

interface OnboardingHeaderProps {
  currentStep: number
  steps: Array<{
    id: number
    title: string
    description: string
    icon: any
  }>
  progress: number
}

export function OnboardingHeader({ currentStep, steps, progress }: OnboardingHeaderProps) {
  return (
    <div className="text-center mb-8">
      <div className="flex items-center justify-center mb-6">
        <Image width={150} height={150} alt="Sam Logo" src="./sam-logo-white.png" />
      </div>

      <h1 className="text-3xl font-bold text-white mb-2">Welcome to SAM</h1>
      <p className="text-slate-400 mb-8">Let's get your account set up in just a few steps</p>

      {/* Progress Bar */}
      <div className="max-w-md mx-auto mb-8">
        <div className="flex justify-between mb-2">
          {steps.map((step, index) => (
            <div key={step.id} className="flex flex-col items-center">
              <div
                className={`w-10 h-10 rounded-full flex items-center justify-center text-sm font-medium transition-colors ${step.id <= currentStep
                  ? "bg-violet-800 text-white"
                  : "bg-slate-700 text-slate-400"
                  }`}
              >
                {step.id < currentStep ? <Icons.check className="w-5 h-5" /> : <step.icon className="w-5 h-5" />}
              </div>
              <span className="text-xs text-slate-400 mt-2 hidden sm:block">{step.title}</span>
            </div>
          ))}
        </div>

        <div className="w-full bg-slate-700 rounded-full h-2">
          <div
            className="bg-violet-800 h-2 rounded-full transition-all duration-300"
            style={{ width: `${progress}%` }}
          ></div>
        </div>

        <div className="flex justify-between text-xs text-slate-500 mt-2">
          <span>
            Step {currentStep} of {steps.length}
          </span>
          <span>{Math.round(progress)}% Complete</span>
        </div>
      </div>
    </div>
  )
}
