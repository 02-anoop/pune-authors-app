import React from 'react';
import { AuthorRegistrationPage } from './AuthorRegistrationPage';

export function AuthorOnboardingWizard() {
  return (
    <div className="w-full relative min-h-screen bg-[#F8FAFC]">
      <div className="w-full pb-10 pt-4">
        <AuthorRegistrationPage hideNavbar={false} />
      </div>
    </div>
  );
}
