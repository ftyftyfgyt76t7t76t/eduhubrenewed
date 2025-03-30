import { useState } from "react";
import { useForm } from "react-hook-form";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Checkbox } from "@/components/ui/checkbox";
import { apiRequest } from "@/lib/queryClient";
import { useToast } from "@/hooks/use-toast";
import { useAuth } from "@/context/AuthContext";

interface LoginFormProps {
  onSwitchToSignup: () => void;
  onDemoMode: () => void;
}

interface LoginFormData {
  email: string;
  password: string;
  rememberMe: boolean;
}

export default function LoginForm({ onSwitchToSignup, onDemoMode }: LoginFormProps) {
  const [isLoading, setIsLoading] = useState(false);
  const { setUser } = useAuth();
  const { toast } = useToast();
  
  const {
    register,
    handleSubmit,
    formState: { errors },
  } = useForm<LoginFormData>({
    defaultValues: {
      email: "",
      password: "",
      rememberMe: false,
    },
  });
  
  const onSubmit = async (data: LoginFormData) => {
    setIsLoading(true);
    
    try {
      const response = await apiRequest("POST", "/api/auth/login", {
        email: data.email,
        password: data.password,
      });
      
      const user = await response.json();
      setUser(user);
      
      if (data.rememberMe) {
        // Set a longer session expiry in a real app
        // For now, we're just storing this in localStorage
        localStorage.setItem("rememberMe", "true");
      } else {
        localStorage.removeItem("rememberMe");
      }
      
      toast({
        title: "Welcome back!",
        description: "You have successfully logged in.",
      });
    } catch (error) {
      console.error("Login error:", error);
      toast({
        title: "Login failed",
        description: "Invalid email or password. Please try again.",
        variant: "destructive",
      });
    } finally {
      setIsLoading(false);
    }
  };
  
  return (
    <form onSubmit={handleSubmit(onSubmit)} className="space-y-5">
      <div>
        <Label htmlFor="email" className="text-sm font-medium text-gray-700 mb-1">
          Email Address
        </Label>
        <Input
          id="email"
          type="email"
          placeholder="Enter your email"
          className="w-full px-4 py-3 rounded-lg"
          {...register("email", {
            required: "Email is required",
            pattern: {
              value: /^[A-Z0-9._%+-]+@[A-Z0-9.-]+\.[A-Z]{2,}$/i,
              message: "Invalid email address",
            },
          })}
        />
        {errors.email && (
          <p className="mt-1 text-sm text-red-600">{errors.email.message}</p>
        )}
      </div>
      
      <div>
        <Label htmlFor="password" className="text-sm font-medium text-gray-700 mb-1">
          Password
        </Label>
        <Input
          id="password"
          type="password"
          placeholder="Enter your password"
          className="w-full px-4 py-3 rounded-lg"
          {...register("password", {
            required: "Password is required",
          })}
        />
        {errors.password && (
          <p className="mt-1 text-sm text-red-600">{errors.password.message}</p>
        )}
      </div>
      
      <div className="flex items-center justify-between">
        <div className="flex items-center">
          <Checkbox
            id="remember-me"
            {...register("rememberMe")}
          />
          <Label htmlFor="remember-me" className="ml-2 text-sm text-gray-700">
            Remember me
          </Label>
        </div>
        <div>
          <a href="#" className="text-sm font-medium text-primary-600 hover:text-primary-700">
            Forgot password?
          </a>
        </div>
      </div>
      
      <Button
        type="submit"
        disabled={isLoading}
        className="w-full py-3 px-4 bg-primary-500 hover:bg-primary-600 text-white font-medium rounded-lg shadow-md hover:shadow-lg transition duration-300 ease-in-out transform hover:-translate-y-0.5"
      >
        {isLoading ? "Signing in..." : "Sign In"}
      </Button>
      
      <div className="mt-4 text-center">
        <Button
          type="button"
          variant="ghost"
          onClick={onDemoMode}
          className="text-sm font-medium text-primary-600 hover:text-primary-700"
        >
          Try 10-minute demo mode
        </Button>
      </div>
    </form>
  );
}
