import { useDemo } from "@/context/DemoContext";
import { useAuth } from "@/context/AuthContext";
import { useLocation } from "wouter";
import { useEffect } from "react";
import { cn } from "@/lib/utils";

export default function DemoModeTimer() {
  const { demoTimeLeft, isDemoExpiring } = useDemo();
  const { isDemo } = useAuth();
  const [, navigate] = useLocation();
  
  // Format seconds into MM:SS
  const formatTimeLeft = (seconds: number) => {
    const minutes = Math.floor(seconds / 60);
    const remainingSeconds = seconds % 60;
    return `${minutes.toString().padStart(2, '0')}:${remainingSeconds.toString().padStart(2, '0')}`;
  };
  
  // Redirect to sign up page when timer expires
  useEffect(() => {
    if (isDemo && demoTimeLeft === 0) {
      navigate("/auth/signup");
    }
  }, [isDemo, demoTimeLeft, navigate]);
  
  if (!isDemo) return null;
  
  return (
    <div 
      className={cn(
        "fixed top-4 right-4 z-50 px-3 py-2 rounded-lg text-white font-semibold shadow-md flex items-center space-x-2",
        isDemoExpiring 
          ? "bg-red-500 animate-pulse" 
          : "bg-blue-600"
      )}
    >
      <span className="text-xs uppercase">Demo Mode</span>
      <span className="text-sm">
        {formatTimeLeft(demoTimeLeft)}
      </span>
    </div>
  );
}