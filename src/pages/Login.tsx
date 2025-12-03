import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { AxiosError } from 'axios';
import { useAuthStore } from '../stores/authStore';
import { Button } from '../components/ui/button';
import { Input } from '../components/ui/input';
import { Label } from '../components/ui/label';
import { Alert, AlertDescription } from '../components/ui/alert';
import { Loader2, Eye, EyeOff, Building2 } from 'lucide-react';

interface ErrorResponse {
  message?: string;
}

export const Login = () => {
  const navigate = useNavigate();
  const { login, isLoading } = useAuthStore();
  const [identifier, setIdentifier] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [isDarkMode, setIsDarkMode] = useState(false);

  // Check dark mode on component mount and listen for changes
  React.useEffect(() => {
    const checkDarkMode = () => {
      setIsDarkMode(document.documentElement.classList.contains('dark'));
    };
    
    // Check immediately
    checkDarkMode();
    
    // Create observer for class changes
    const observer = new MutationObserver(checkDarkMode);
    observer.observe(document.documentElement, {
      attributes: true,
      attributeFilter: ['class']
    });
    
    return () => observer.disconnect();
  }, []);

  const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    setError('');

    try {
      // Determine if identifier is email or username
      const isEmail = identifier. includes('@');
      await login({
        ...(isEmail ? { email: identifier } : { username: identifier }),
        password,
      });
      navigate('/dashboard');
    } catch (err) {
      if (err instanceof AxiosError) {
        const errorMessage = (err.response?.data as ErrorResponse)?.message;
        setError(errorMessage || 'Login failed. Please try again.');
      } else if (err instanceof Error) {
        setError(err.message);
      } else {
        setError('An unexpected error occurred. Please try again.');
      }
    }
  };

  return (
    <div className="min-h-screen bg-gray-50 dark:bg-slate-900 flex relative">
      {/* Full Screen Vignette Effect for Dark Mode */}
      {isDarkMode && (
        <div 
          className="absolute inset-0 pointer-events-none z-30"
          style={{
            background: 'radial-gradient(ellipse at center, transparent 10%, rgba(0,0,0,0.1) 30%, rgba(0,0,0,0.2) 100%)'
          }}
        />
      )}
      {/* Left Side - Login Form */}
      <div className="flex-1 flex items-center justify-center p-8 lg:p-12 relative z-10">
        <div className="w-full max-w-md relative z-40">
          {/* Logo */}
          <div className="mb-8">
            <div className="flex items-center gap-3 mb-2">
              <div className="w-8 h-8 bg-black dark:bg-white rounded-lg flex items-center justify-center">
                <Building2 className="h-5 w-5 text-white dark:text-black" />
              </div>
              <h1 className="text-2xl font-bold text-gray-900 dark:text-white">SPK Promosi Jabatan</h1>
            </div>
          </div>

          {/* Sign In Header */}
          <div className="mb-8">
            <h2 className="text-3xl font-bold text-gray-900 dark:text-white mb-2">Sign In</h2>
            <p className="text-gray-600 dark:text-gray-300">Welcome back! Please enter your details.</p>
          </div>

          {/* Form */}
          <form onSubmit={handleSubmit} className="space-y-6">
            {error && (
              <Alert variant="destructive" className="border-red-200 dark:border-red-800 bg-red-50 dark:bg-red-900/50">
                <AlertDescription className="text-red-800 dark:text-red-200">{error}</AlertDescription>
              </Alert>
            )}

            {/* Email/Username Field */}
            <div className="space-y-2">
              <Label htmlFor="identifier" className="text-sm font-medium text-gray-700 dark:text-gray-300">
                Email or Username
              </Label>
              <Input
                id="identifier"
                type="text"
                placeholder="Enter your email or username"
                value={identifier}
                onChange={(e) => setIdentifier(e.target.value)}
                required
                disabled={isLoading}
                className="h-12 border-gray-300 dark:border-slate-600 dark:bg-slate-800 dark:text-white dark:placeholder-gray-400 focus:border-gray-900 dark:focus:border-slate-400 focus:ring-gray-900 dark:focus:ring-slate-400 rounded-lg"
              />
            </div>

            {/* Password Field */}
            <div className="space-y-2">
              <div className="flex items-center justify-between">
                <Label htmlFor="password" className="text-sm font-medium text-gray-700 dark:text-gray-300">
                  Password
                </Label>
              </div>
              <div className="relative">
                <Input
                  id="password"
                  type={showPassword ? 'text' : 'password'}
                  placeholder="Enter your password"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  required
                  disabled={isLoading}
                  className="h-12 pr-12 border-gray-300 dark:border-slate-600 dark:bg-slate-800 dark:text-white dark:placeholder-gray-400 focus:border-gray-900 dark:focus:border-slate-400 focus:ring-gray-900 dark:focus:ring-slate-400 rounded-lg"
                />
                <Button
                  type="button"
                  variant="ghost"
                  size="sm"
                  className="absolute right-2 top-1/2 transform -translate-y-1/2 h-8 w-8 hover:bg-gray-100 dark:hover:bg-slate-700"
                  onClick={() => setShowPassword(!showPassword)}
                  disabled={isLoading}
                >
                  {showPassword ? (
                    <EyeOff className="h-4 w-4 text-gray-500 dark:text-gray-400" />
                  ) : (
                    <Eye className="h-4 w-4 text-gray-500 dark:text-gray-400" />
                  )}
                </Button>
              </div>
            </div>

            {/* Submit Button */}
            <Button 
              type="submit" 
              className="w-full h-12 bg-black dark:bg-white hover:bg-gray-800 dark:hover:bg-gray-200 text-white dark:text-black font-medium rounded-lg transition-colors"
              disabled={isLoading}
            >
              {isLoading ? (
                <div className="flex items-center gap-2">
                  <Loader2 className="h-4 w-4 animate-spin" />
                  Signing in...
                </div>
              ) : (
                'Sign In'
              )}
            </Button>
          </form>
        </div>
      </div>

      {/* Right Side - Enhanced Pattern */}
      <div className="hidden lg:flex flex-1 bg-transparent items-center justify-center relative overflow-hidden z-10">
        {/* Halftone/Dot Pattern Background for Light Mode */}
        {!isDarkMode && (
          <div className="absolute inset-0 flex items-center justify-center z-20">
            <div 
              className="w-full h-full opacity-80"
              style={{
                background: `
                  radial-gradient(circle at 25% 25%, black 2px, transparent 2px),
                  radial-gradient(circle at 75% 75%, black 2px, transparent 2px),
                  radial-gradient(circle at 25% 75%, black 1.5px, transparent 1.5px),
                  radial-gradient(circle at 75% 25%, black 1.5px, transparent 1.5px),
                  radial-gradient(circle at 50% 50%, black 3px, transparent 3px),
                  radial-gradient(circle at 20% 50%, black 1px, transparent 1px),
                  radial-gradient(circle at 80% 50%, black 1px, transparent 1px),
                  radial-gradient(circle at 50% 20%, black 1px, transparent 1px),
                  radial-gradient(circle at 50% 80%, black 1px, transparent 1px)
                `,
                backgroundSize: `
                  40px 40px, 40px 40px, 60px 60px, 60px 60px, 80px 80px,
                  20px 20px, 20px 20px, 30px 30px, 30px 30px
                `,
                backgroundPosition: `
                  0 0, 20px 20px, 10px 10px, 30px 30px, 0 0,
                  5px 5px, 15px 15px, 25px 25px, 35px 35px
                `
              }}
            />
          </div>
        )}
        
        {/* Star Light Pattern for Dark Mode */}
        {isDarkMode && (
          <div className="absolute inset-0 z-20">
            {/* Main star pattern layer */}
            <div 
              className="w-full h-full opacity-90"
              style={{
                background: `
                  radial-gradient(circle at 15% 20%, rgba(255,255,255,0.9) 0.8px, transparent 1px),
                  radial-gradient(circle at 85% 25%, rgba(255,255,255,0.7) 0.6px, transparent 0.8px),
                  radial-gradient(circle at 25% 60%, rgba(255,255,255,0.8) 1px, transparent 1.2px),
                  radial-gradient(circle at 75% 70%, rgba(255,255,255,0.6) 0.5px, transparent 0.7px),
                  radial-gradient(circle at 40% 30%, rgba(255,255,255,0.85) 0.9px, transparent 1.1px),
                  radial-gradient(circle at 60% 80%, rgba(255,255,255,0.65) 0.7px, transparent 0.9px),
                  radial-gradient(circle at 10% 70%, rgba(255,255,255,0.75) 0.8px, transparent 1px),
                  radial-gradient(circle at 90% 40%, rgba(255,255,255,0.55) 0.4px, transparent 0.6px),
                  radial-gradient(circle at 30% 85%, rgba(255,255,255,0.7) 0.6px, transparent 0.8px),
                  radial-gradient(circle at 70% 15%, rgba(255,255,255,0.8) 0.8px, transparent 1px)
                `,
                backgroundSize: `
                  120px 120px, 80px 80px, 150px 150px, 60px 60px, 100px 100px,
                  90px 90px, 110px 110px, 50px 50px, 70px 70px, 130px 130px
                `,
                backgroundPosition: `
                  0 0, 30px 30px, 60px 60px, 15px 15px, 45px 45px,
                  75px 75px, 20px 20px, 50px 50px, 10px 10px, 40px 40px
                `
              }}
            />
            
            {/* Secondary twinkling layer */}
            <div 
              className="w-full h-full opacity-60"
              style={{
                background: `
                  radial-gradient(circle at 20% 40%, rgba(255,255,255,0.4) 0.3px, transparent 0.5px),
                  radial-gradient(circle at 80% 60%, rgba(255,255,255,0.5) 0.4px, transparent 0.6px),
                  radial-gradient(circle at 45% 15%, rgba(255,255,255,0.35) 0.25px, transparent 0.4px),
                  radial-gradient(circle at 65% 85%, rgba(255,255,255,0.45) 0.35px, transparent 0.5px),
                  radial-gradient(circle at 5% 50%, rgba(255,255,255,0.3) 0.2px, transparent 0.35px)
                `,
                backgroundSize: `
                  40px 40px, 55px 55px, 25px 25px, 35px 35px, 30px 30px
                `,
                backgroundPosition: `
                  5px 5px, 15px 15px, 25px 25px, 10px 10px, 20px 20px
                `
              }}
            />
          </div>
        )}
        
        {/* Gradient Overlay - Light mode */}
        {!isDarkMode && (
          <div 
            className="absolute inset-0 z-25"
            style={{
              background: 'linear-gradient(90deg, rgba(255,255,255,0.9) 0%, rgba(255,255,255,0.3) 30%, rgba(255,255,255,0.1) 70%, rgba(255,255,255,0.8) 100%)'
            }}
          />
        )}
        
        {/* Gradient Overlay - Dark mode for smooth transition */}
        {isDarkMode && (
          <div 
            className="absolute inset-0 z-25"
            style={{
              background: 'linear-gradient(90deg, rgba(15,23,42,0.9) 0%, rgba(15,23,42,0.3) 30%, rgba(15,23,42,0.1) 70%, rgba(15,23,42,0.8) 100%)'
            }}
          />
        )}
        
        {/* Center Logo/Icon */}
        <div className="relative z-40 text-center">
          <div className="w-24 h-24 bg-black dark:bg-white rounded-3xl flex items-center justify-center mb-6 mx-auto shadow-2xl">
            <Building2 className="h-12 w-12 text-white dark:text-black" />
          </div>
          <h3 className="text-2xl font-bold text-gray-900 dark:text-white mb-2">SPK Management</h3>
          <p className="text-gray-800 dark:text-gray-200 max-w-sm font-bold">Streamline your human resources with our comprehensive management system</p>
        </div>
      </div>
    </div>
  );
};