import React, { useEffect, useState } from 'react';
import { useNavigate } from 'react-router';
import axios from 'axios';
import { AuthorRegistrationPage } from './AuthorRegistrationPage';

export function AuthorOnboardingWizard() {
  const navigate = useNavigate();
  const [isChecking, setIsChecking] = useState(true);

  useEffect(() => {
    const userRole = localStorage.getItem("userRole");
    const token = localStorage.getItem("token");
    
    if (token && (userRole === "AUTHOR" || userRole === "ADMIN")) {
      axios.get(`${import.meta.env.VITE_API_URL || 'http://localhost:3001'}/api/author/dashboard-data`, {
        headers: { Authorization: `Bearer ${token}` }
      })
      .then(() => {
        // Profile already exists! Redirect to dashboard so they can't re-register.
        navigate("/dashboard");
      })
      .catch((err) => {
        // Profile doesn't exist yet (404) -> let them finish the form!
        setIsChecking(false);
      });
    } else {
      // User is not logged in! Force them to sign up & verify OTP first.
      navigate("/signup?role=AUTHOR");
    }
  }, [navigate]);

  if (isChecking) {
    return <div className="min-h-screen flex items-center justify-center bg-[#F8FAFC]">Loading...</div>;
  }


  return (
    <div className="w-full relative min-h-screen bg-[#F8FAFC]">
      <div className="w-full pb-10 pt-4">
        <AuthorRegistrationPage hideNavbar={false} />
      </div>
    </div>
  );
}
