import { useEffect, useState, useCallback } from "react";
import { useAuth } from "@/context/AuthContext";

export default function DemoModeTimer() {
  const { isDemo, logout } = useAuth();
  const [timeLeft, setTimeLeft] = useState(600); // 10 minutes in seconds
  
  // Format the time remaining as MM:SS
  const formatTime = useCallback((seconds: number) => {
    const minutes = Math.floor(seconds / 60);
    const remainingSeconds = seconds % 60;
    return `${minutes.toString().padStart(2, '0')}:${remainingSeconds.toString().padStart(2, '0')}`;
  }, []);
  
  // Handle the timer countdown
  useEffect(() => {
    if (!isDemo) return;
    
    const timer = setInterval(() => {
      setTimeLeft((prev) => {
        if (prev <= 1) {
          clearInterval(timer);
          // Log out when timer reaches zero
          logout();
          return 0;
        }
        return prev - 1;
      });
    }, 1000);
    
    return () => clearInterval(timer);
  }, [isDemo, logout]);
  
  if (!isDemo) return null;
  
  return (
    <div className="fixed top-4 right-4 bg-white shadow-lg rounded-lg px-4 py-3 flex items-center space-x-3 z-50 animate-pulse-slow">
      <i className="fas fa-clock text-primary-500"></i>
      <div>
        <p className="text-xs text-gray-500">Demo mode</p>
        <p className="font-bold text-gray-800">
          <span>{formatTime(timeLeft)}</span> left
        </p>
      </div>
    </div>
  );
}
