'use client';

import { CheckCircle2, Circle, ChevronRight } from 'lucide-react';

interface IdentityVerificationProps {
  currentStep: number;
  totalSteps: number;
  onVerify?: () => void;
}

export default function IdentityVerification({ currentStep, totalSteps, onVerify }: IdentityVerificationProps) {
  const steps = [
    {
      title: 'Create your account with a managed wallet',
      description: 'With Welcome items, you have the flexibility to invest as much as you desire into a property and earn a fractional of it. Our platform allows you to seamlessly buy fractional real estate, tokenised into fractional property assets.',
      completed: currentStep > 1,
    },
    {
      title: 'Verify Your Identity',
      description: 'You will need to verify your identity with an ID and passport',
      completed: currentStep > 2,
      current: currentStep === 2,
    },
    {
      title: 'Buy Property',
      description: 'Buy fractional ownership to add time to your Senegal, just trust and purchase',
      completed: currentStep > 3,
      current: currentStep === 3,
    },
  ];

  const progress = (currentStep / totalSteps) * 100;

  return (
    <div className="bg-white rounded-lg shadow-sm p-6">
      <div className="flex items-start gap-3 mb-6">
        <div className="w-8 h-8 rounded-full bg-teal-100 flex items-center justify-center flex-shrink-0">
          <CheckCircle2 size={18} className="text-teal-600" />
        </div>
        <div className="flex-1">
          <p className="text-sm text-gray-500 mb-1">You're Almost there</p>
          <h2 className="text-xl font-semibold text-gray-900">Verify your identity</h2>
          <button className="text-teal-500 text-sm mt-1 hover:text-teal-600">
            Why is this important?
          </button>
        </div>
        <div className="text-right">
          <p className="text-sm text-gray-500">Step {currentStep} of {totalSteps}</p>
          <div className="w-32 h-2 bg-gray-200 rounded-full mt-2 overflow-hidden">
            <div
              className="h-full bg-gray-900 transition-all duration-300"
              style={{ width: `${progress}%` }}
            />
          </div>
        </div>
      </div>

      <div className="space-y-6">
        {steps.map((step, index) => (
          <div key={index} className="flex gap-4">
            <div className="flex flex-col items-center">
              {step.completed ? (
                <CheckCircle2 size={24} className="text-teal-500" />
              ) : (
                <Circle size={24} className={step.current ? 'text-teal-500' : 'text-gray-300'} />
              )}
              {index < steps.length - 1 && (
                <div className="w-0.5 h-16 bg-gray-200 my-2" />
              )}
            </div>
            <div className="flex-1 pb-6">
              <h3 className="font-medium text-gray-900 mb-2">{step.title}</h3>
              <p className="text-sm text-gray-600 leading-relaxed">{step.description}</p>
              {step.current && (
                <button
                  onClick={onVerify}
                  className="mt-4 px-6 py-2 bg-teal-500 text-white rounded-lg hover:bg-teal-600 transition-colors flex items-center gap-2"
                >
                  Start verification
                  <ChevronRight size={16} />
                </button>
              )}
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
