"use client"

import { useState } from "react"
import { Card } from "../ui/card"
import { Button } from "../ui/button"
import { CheckCircle, Circle, ArrowRight } from "lucide-react"
import { cn } from "@/app/lib/utils"

interface KYCStep {
  id: string
  title: string
  description: string
  completed: boolean
}

const kycSteps: KYCStep[] = [
  {
    id: "identity",
    title: "Verify your identity",
    description: "We need to verify your identity with all ID document.",
    completed: false,
  },
  {
    id: "invest",
    title: "Time to Invest!",
    description: "We're all set! Now you can start investing.",
    completed: false,
  },
]

export function KYCFlow() {
  const [currentStep, setCurrentStep] = useState(0)
  const [completedSteps, setCompletedSteps] = useState<Set<number>>(new Set())

  const handleStepComplete = () => {
    setCompletedSteps(prev => new Set(prev).add(currentStep))
    if (currentStep < kycSteps.length - 1) {
      setCurrentStep(currentStep + 1)
    }
  }

  const currentStepData = kycSteps[currentStep]

  return (
    <div className="min-h-screen bg-gray-50 flex">
      {/* Progress Sidebar */}
      <div className="w-80 bg-white border-r p-6 flex flex-col">
        <div className="mb-8">
          <div className="flex items-center gap-2 mb-4">
            <div className="h-2 w-2 rounded-full bg-primary"></div>
            <span className="text-sm text-gray-800">You're Almost there</span>
          </div>
          <h2 className="text-xl font-semibold">{currentStepData.title}</h2>
          <p className="text-sm text-gray-800 mt-2">{currentStepData.description}</p>
        </div>

        {/* Step Progress */}
        <div className="flex-1">
          <div className="relative">
            {/* Progress Line */}
            <div className="absolute left-4 top-8 bottom-0 w-0.5 bg-gray-200"></div>

            {kycSteps.map((step, index) => (
              <div key={step.id} className="relative flex items-start gap-3 pb-8">
                <div className={cn(
                  "relative z-10 flex h-8 w-8 items-center justify-center rounded-full border-2",
                  completedSteps.has(index)
                    ? "border-primary bg-primary text-white"
                    : index === currentStep
                    ? "border-primary bg-white text-primary"
                    : "border-gray-300 bg-white text-gray-600"
                )}>
                  {completedSteps.has(index) ? (
                    <CheckCircle className="h-5 w-5" />
                  ) : (
                    <Circle className="h-5 w-5" />
                  )}
                </div>
                <div>
                  <h3 className={cn(
                    "font-medium",
                    completedSteps.has(index) || index === currentStep
                      ? "text-gray-900"
                      : "text-gray-600"
                  )}>
                    {step.title}
                  </h3>
                  <p className={cn(
                    "text-sm mt-1",
                    completedSteps.has(index) || index === currentStep
                      ? "text-gray-700"
                      : "text-gray-600"
                  )}>
                    {step.description}
                  </p>
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Bottom Actions */}
        <div className="space-y-4">
          <Button
            onClick={handleStepComplete}
            className="w-full"
            disabled={currentStep >= kycSteps.length}
          >
            {currentStep === 0 ? "Verify Your Identity" : "Get Started"}
            <ArrowRight className="ml-2 h-4 w-4" />
          </Button>

          <div className="text-center">
            <p className="text-sm text-gray-800 mb-4">Buy Property</p>
            <p className="text-xs text-gray-700">
              Buy fractional ownership to land using{" "}
              <br />
              Nairobi and land investment.
            </p>
          </div>
        </div>
      </div>

      {/* Main Content */}
      <div className="flex-1 flex items-center justify-center p-8">
        <Card className="w-full max-w-md p-6 text-center">
          {currentStep === 0 ? (
            <IdentityVerificationForm onComplete={handleStepComplete} />
          ) : (
            <InvestmentReadyForm onComplete={handleStepComplete} />
          )}
        </Card>
      </div>
    </div>
  )
}

function IdentityVerificationForm({ onComplete }: { onComplete: () => void }) {
  return (
    <div className="space-y-6">
      <div className="flex justify-center">
        <div className="h-16 w-16 rounded-full bg-primary/10 flex items-center justify-center">
          <CheckCircle className="h-8 w-8 text-primary" />
        </div>
      </div>

      <div>
        <h3 className="text-lg font-semibold mb-2">Verify Your Identity</h3>
        <p className="text-sm text-gray-800">
          You'll need to verify your identity with an ID document.
        </p>
      </div>

      <div className="text-left space-y-4">
        <div>
          <h4 className="font-medium mb-2">Create your account with a managed wallet</h4>
          <p className="text-sm text-gray-800">
            With Welcome Home, you have the flexibility to use an existing wallet or connect a new one.
            We need an address so you can get to your investments. We use your email to ensure the experience
            by accepting the wallet that's managed for you.
          </p>
        </div>
      </div>

      <Button onClick={onComplete} className="w-full">
        Continue with managed wallet
      </Button>
    </div>
  )
}

function InvestmentReadyForm({ onComplete }: { onComplete: () => void }) {
  return (
    <div className="space-y-6">
      <div className="flex justify-center">
        <div className="h-16 w-16 rounded-full bg-green-100 flex items-center justify-center">
          <CheckCircle className="h-8 w-8 text-green-600" />
        </div>
      </div>

      <div>
        <h3 className="text-lg font-semibold mb-2 text-green-600">All Set!</h3>
        <h4 className="text-xl font-bold mb-2">Time to Invest!</h4>
        <p className="text-sm text-gray-800">
          We're all set up and ready! Now you can start investing.
        </p>
      </div>

      <div className="text-left space-y-4">
        <div>
          <h4 className="font-medium mb-2">Create your account with a managed wallet</h4>
          <p className="text-sm text-gray-800">
            With Welcome Home, you have the flexibility to use an existing wallet or connect a new one.
            We need an address so you can get to your investments. We use your email to ensure the experience
            by accepting the wallet that's managed for you.
          </p>
        </div>
      </div>

      <Button onClick={() => window.location.href = '/dashboard'} className="w-full">
        Get Started
      </Button>
    </div>
  )
}