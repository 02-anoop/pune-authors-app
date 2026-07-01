import React, { useEffect } from 'react';
import { useNavigate } from 'react-router';
import { AuthorRegistrationPage } from './AuthorRegistrationPage';

export function AuthorOnboardingWizard() {
  const navigate = useNavigate();

  useEffect(() => {
    const userRole = localStorage.getItem("userRole");
    const token = localStorage.getItem("token");
    if (token && (userRole === "AUTHOR" || userRole === "ADMIN")) {
      navigate("/dashboard");
    }
  }, [navigate]);

  return (
    <div className="w-full relative min-h-screen bg-[#F8FAFC]">
      <div className="w-full pb-10 pt-4">
        <AuthorRegistrationPage hideNavbar={false} />
      </div>
    </div>
  );
}
