import { createContext, useContext, useState, useEffect, ReactNode } from "react";
import { useAuth } from "./AuthContext";

interface DemoContextType {
  demoTimeLeft: number;
  isDemoExpiring: boolean;
}

const DemoContext = createContext<DemoContextType | null>(null);

export function DemoProvider({ children }: { children: ReactNode }) {
  const { isDemo, logout } = useAuth();
  const [demoTimeLeft, setDemoTimeLeft] = useState(600); // 10 minutes in seconds
  const [isDemoExpiring, setIsDemoExpiring] = useState(false);
  
  useEffect(() => {
    if (!isDemo) {
      setDemoTimeLeft(600);
      setIsDemoExpiring(false);
      return;
    }
    
    const timer = setInterval(() => {
      setDemoTimeLeft((prev) => {
        if (prev <= 1) {
          clearInterval(timer);
          // Log out when timer reaches zero, redirect will be handled by the DemoModeTimer component
          logout();
          return 0;
        }
        
        // Set expiring flag when less than 1 minute remains
        if (prev <= 60 && !isDemoExpiring) {
          setIsDemoExpiring(true);
        }
        
        return prev - 1;
      });
    }, 1000);
    
    return () => clearInterval(timer);
  }, [isDemo, logout, isDemoExpiring]);
  
  const value = {
    demoTimeLeft,
    isDemoExpiring,
  };
  
  return <DemoContext.Provider value={value}>{children}</DemoContext.Provider>;
}

export function useDemo() {
  const context = useContext(DemoContext);
  if (!context) {
    throw new Error("useDemo must be used within a DemoProvider");
  }
  return context;
}
