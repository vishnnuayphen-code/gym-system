import React from 'react';

interface OnboardingGuardProps {
  children: React.ReactNode;
}

/**
 * Onboarding was disabled by request.
 * Trainees can now access the dashboard immediately and edit their profile later natively.
 */
export const OnboardingGuard = ({ children }: OnboardingGuardProps) => {
  return <>{children}</>;
};
