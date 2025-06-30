import { useState, useRef, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { useAuth } from '../context/AuthProvider';
import { Button } from '../components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '../components/ui/card';
import { Input } from '../components/ui/input';
import { Loader2, ArrowLeft, Phone, CheckCircle, Clock, Shield, AlertCircle } from "lucide-react";
import { mockStaff } from "../data/mockData";

type VerificationStep = 'cin' | 'phone' | 'success';

export default function LoginScreen() {
  const [step, setStep] = useState<VerificationStep>('cin');
  const [cinDigits, setCinDigits] = useState<string[]>(Array(8).fill(""));
  const [phoneDigits, setPhoneDigits] = useState<string[]>(Array(6).fill(""));
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [foundUser, setFoundUser] = useState<any>(null);
  const [countdown, setCountdown] = useState(0);
  const [showSuccess, setShowSuccess] = useState(false);
  const navigate = useNavigate();
  const { login } = useAuth();

  // Refs for input focus management
  const cinInputRefs = useRef<(HTMLInputElement | null)[]>([]);
  const phoneInputRefs = useRef<(HTMLInputElement | null)[]>([]);

  // Countdown timer effect
  useEffect(() => {
    if (countdown > 0) {
      const timer = setTimeout(() => setCountdown(countdown - 1), 1000);
      return () => clearTimeout(timer);
    }
  }, [countdown]);

  // Handle CIN digit input
  const handleCinDigitChange = (index: number, value: string) => {
    if (!/^\d*$/.test(value)) return;
    
    const newDigits = [...cinDigits];
    newDigits[index] = value.slice(-1);
    setCinDigits(newDigits);
    setError(null);

    // Auto-focus next input
    if (value && index < 7) {
      cinInputRefs.current[index + 1]?.focus();
    }

    // Auto-submit when all 8 digits are filled
    if (newDigits.every(digit => digit !== '') && newDigits.join('').length === 8) {
      handleCinSubmit(newDigits.join(''));
    }
  };

  // Handle phone digit input
  const handlePhoneDigitChange = (index: number, value: string) => {
    if (!/^\d*$/.test(value)) return;
    
    const newDigits = [...phoneDigits];
    newDigits[index] = value.slice(-1);
    setPhoneDigits(newDigits);
    setError(null);

    // Auto-focus next input
    if (value && index < 5) {
      phoneInputRefs.current[index + 1]?.focus();
    }

    // Auto-submit when all 6 digits are filled
    if (newDigits.every(digit => digit !== '') && newDigits.join('').length === 6) {
      handlePhoneSubmit(newDigits.join(''));
    }
  };

  // Handle key down events
  const handleKeyDown = (e: React.KeyboardEvent, index: number, type: 'cin' | 'phone') => {
    const refs = type === 'cin' ? cinInputRefs : phoneInputRefs;
    const maxLength = type === 'cin' ? 8 : 6;
    
    if (e.key === 'Backspace' && index > 0) {
      const currentDigits = type === 'cin' ? cinDigits : phoneDigits;
      if (!currentDigits[index]) {
        refs.current[index - 1]?.focus();
      }
    } else if (e.key === 'ArrowLeft' && index > 0) {
      refs.current[index - 1]?.focus();
    } else if (e.key === 'ArrowRight' && index < maxLength - 1) {
      refs.current[index + 1]?.focus();
    }
  };

  // Handle paste events
  const handlePaste = (e: React.ClipboardEvent, type: 'cin' | 'phone') => {
    e.preventDefault();
    const pasteData = e.clipboardData.getData('text').replace(/\D/g, '');
    const maxLength = type === 'cin' ? 8 : 6;
    
    if (pasteData.length === maxLength) {
      const newDigits = pasteData.split('');
      if (type === 'cin') {
        setCinDigits(newDigits);
        handleCinSubmit(pasteData);
      } else {
        setPhoneDigits(newDigits);
        handlePhoneSubmit(pasteData);
      }
    }
  };

  const handleCinSubmit = async (cin: string) => {
    setIsLoading(true);
    setError(null);

    try {
      // Simulate API delay
      await new Promise(resolve => setTimeout(resolve, 1200));

      // Find user in mock data
      const user = mockStaff.find(staff => staff.cin === cin);
      
      if (user) {
        setFoundUser(user);
        setStep('phone');
        setCountdown(30);
        // Simulate sending SMS
        console.log(`SMS sent to ${user.phoneNumber}`);
      } else {
        setError('CIN number not found in our system. Please verify your number or contact your supervisor.');
        setCinDigits(Array(8).fill(''));
        cinInputRefs.current[0]?.focus();
      }
    } catch (err) {
      setError('Unable to connect to the authentication server. Please try again.');
    } finally {
      setIsLoading(false);
    }
  };

  const handlePhoneSubmit = async (phoneCode: string) => {
    setIsLoading(true);
    setError(null);

    try {
      // Simulate API delay
      await new Promise(resolve => setTimeout(resolve, 800));

      // Extract first 6 digits from user's phone number (after country code)
      const userPhoneDigits = foundUser.phoneNumber.replace(/\D/g, '').slice(3, 9);
      
      if (phoneCode === userPhoneDigits) {
        // Show success state briefly
        setShowSuccess(true);
        setStep('success');
        
        // Wait for success animation then login
        setTimeout(() => {
          login({
            id: foundUser.id,
            cin: foundUser.cin,
            firstName: foundUser.firstName,
            lastName: foundUser.lastName,
            role: foundUser.role,
            phoneNumber: foundUser.phoneNumber,
          });
          navigate('/dashboard');
        }, 1500);
      } else {
        setError('Incorrect verification code. Please check the first 6 digits of your phone number.');
        setPhoneDigits(Array(6).fill(''));
        phoneInputRefs.current[0]?.focus();
      }
    } catch (err) {
      setError('Verification failed. Please try again or request a new code.');
    } finally {
      setIsLoading(false);
    }
  };

  const handleResendCode = () => {
    setCountdown(30);
    setError(null);
    setPhoneDigits(Array(6).fill(''));
    phoneInputRefs.current[0]?.focus();
    // Simulate sending SMS
    console.log(`SMS resent to ${foundUser.phoneNumber}`);
  };

  const handleBackToCin = () => {
    setStep('cin');
    setFoundUser(null);
    setCinDigits(Array(8).fill(''));
    setPhoneDigits(Array(6).fill(''));
    setError(null);
    setCountdown(0);
    setShowSuccess(false);
  };

  const getStepIcon = () => {
    switch (step) {
      case 'cin':
        return <Shield className="w-10 h-10 text-white" />;
      case 'phone':
        return <Phone className="w-10 h-10 text-white" />;
      case 'success':
        return <CheckCircle className="w-10 h-10 text-white" />;
      default:
        return <span className="text-2xl font-bold text-white">L</span>;
    }
  };

  const getStepTitle = () => {
    switch (step) {
      case 'cin':
        return 'Secure Access';
      case 'phone':
        return 'Identity Verification';
      case 'success':
        return 'Access Granted';
      default:
        return 'Louaj Station';
    }
  };

  const getStepDescription = () => {
    switch (step) {
      case 'cin':
        return 'Enter your 8-digit National ID (CIN) to begin authentication';
      case 'phone':
        return `Welcome back, ${foundUser?.firstName}! Please verify your identity`;
      case 'success':
        return 'Authentication successful. Redirecting to your workspace...';
      default:
        return '';
    }
  };

  const maskPhoneNumber = (phoneNumber: string) => {
    // For "+216 20 123 456" -> "+216 20 12x xx"
    const parts = phoneNumber.split(' ');
    if (parts.length === 4) {
      return `${parts[0]} ${parts[1]} ${parts[2].slice(0, 2)}x xx`;
    }
    return phoneNumber;
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 via-blue-50 to-indigo-100 dark:from-slate-900 dark:via-slate-800 dark:to-slate-900 flex items-center justify-center p-4">
      <div className="w-full max-w-lg">
        <Card className={`shadow-2xl border-0 bg-white/95 dark:bg-slate-900/95 backdrop-blur-xl transition-all duration-700 ease-out transform ${
          isLoading ? 'scale-[1.02]' : 'scale-100'
        } ${error ? 'animate-shake' : ''} ${showSuccess ? 'animate-pulse' : ''}`}>
          
          {/* Header Section */}
          <CardHeader className="text-center space-y-4 pb-8 pt-10">
            <div className={`mx-auto w-20 h-20 rounded-2xl flex items-center justify-center mb-6 transition-all duration-500 ${
              step === 'success' 
                ? 'bg-gradient-to-r from-green-500 to-emerald-600 animate-pulse' 
                : 'bg-gradient-to-r from-blue-600 to-indigo-600'
            }`}>
              {getStepIcon()}
            </div>
            
            <div className="space-y-2">
              <CardTitle className="text-3xl font-bold bg-gradient-to-r from-slate-900 to-slate-700 dark:from-white dark:to-slate-300 bg-clip-text text-transparent">
                {getStepTitle()}
              </CardTitle>
              <CardDescription className="text-base text-slate-600 dark:text-slate-400 px-4">
                {getStepDescription()}
              </CardDescription>
            </div>

            {/* Progress Indicator */}
            <div className="flex justify-center space-x-2 pt-4">
              <div className={`w-2 h-2 rounded-full transition-all duration-300 ${
                step === 'cin' ? 'bg-blue-600' : 'bg-green-500'
              }`} />
              <div className={`w-2 h-2 rounded-full transition-all duration-300 ${
                step === 'phone' || step === 'success' ? 'bg-blue-600' : 'bg-slate-300 dark:bg-slate-600'
              }`} />
              <div className={`w-2 h-2 rounded-full transition-all duration-300 ${
                step === 'success' ? 'bg-green-500' : 'bg-slate-300 dark:bg-slate-600'
              }`} />
            </div>
          </CardHeader>

          <CardContent className="space-y-8 px-10 pb-10">
            {step === 'cin' && (
              // CIN Input Step
              <div className="space-y-6">
                <div className="space-y-4">
                  <label className="block text-sm font-medium text-slate-700 dark:text-slate-300 text-center">
                    National Identity Card Number
                  </label>
                  <div className="flex justify-center space-x-2">
                    {cinDigits.map((digit, index) => (
                      <div key={index} className="relative">
                        <Input
                          ref={(el) => (cinInputRefs.current[index] = el)}
                          type="text"
                          inputMode="numeric"
                          maxLength={1}
                          value={digit}
                          onChange={(e) => handleCinDigitChange(index, e.target.value)}
                          onKeyDown={(e) => handleKeyDown(e, index, 'cin')}
                          onPaste={(e) => handlePaste(e, 'cin')}
                          className="w-12 h-14 text-center text-xl font-mono font-semibold border-2 border-slate-200 dark:border-slate-700 focus:border-blue-500 focus:ring-2 focus:ring-blue-500/20 transition-all duration-200 rounded-xl bg-white dark:bg-slate-800 hover:border-slate-300 dark:hover:border-slate-600"
                          disabled={isLoading}
                          aria-label={`CIN digit ${index + 1}`}
                        />
                       
                      </div>
                    ))}
                  </div>
                </div>

                {isLoading && (
                  <div className="flex items-center justify-center space-x-3 text-slate-600 dark:text-slate-400 py-4">
                    <Loader2 className="w-5 h-5 animate-spin" />
                    <span className="font-medium">Authenticating your identity...</span>
                  </div>
                )}
              </div>
            )}

            {step === 'phone' && (
              // Phone Verification Step
              <div className="space-y-6">
                {/* User Welcome Card */}
                <div className="p-6 bg-gradient-to-r from-blue-50 to-indigo-50 dark:from-blue-900/20 dark:to-indigo-900/20 rounded-2xl border border-blue-200 dark:border-blue-800/50">
                  <div className="text-center space-y-2">
                    <h3 className="text-xl font-bold text-slate-900 dark:text-white">
                      {foundUser?.firstName} {foundUser?.lastName}
                    </h3>
                 
                    <div className="flex items-center justify-center space-x-2 text-sm text-slate-500 dark:text-slate-500 mt-3">
                      <Phone className="w-4 h-4" />
                      <span className="font-mono">
                        {maskPhoneNumber(foundUser?.phoneNumber)}
                      </span>
                    </div>
                  </div>
                </div>

                {/* Phone Code Input */}
                <div className="space-y-4">
                  <div className="text-center space-y-2">
                    <label className="block text-sm font-medium text-slate-700 dark:text-slate-300">
                      Phone Number Verification
                    </label>
                    <p className="text-xs text-slate-500 dark:text-slate-500">
                      Enter the first 6 digits of your phone number
                    </p>
                  </div>
                  
                  <div className="flex justify-center space-x-2">
                    {phoneDigits.map((digit, index) => (
                      <div key={index} className="relative">
                        <Input
                          ref={(el) => (phoneInputRefs.current[index] = el)}
                          type="text"
                          inputMode="numeric"
                          maxLength={1}
                          value={digit}
                          onChange={(e) => handlePhoneDigitChange(index, e.target.value)}
                          onKeyDown={(e) => handleKeyDown(e, index, 'phone')}
                          onPaste={(e) => handlePaste(e, 'phone')}
                          className="w-12 h-14 text-center text-xl font-mono font-semibold border-2 border-slate-200 dark:border-slate-700 focus:border-blue-500 focus:ring-2 focus:ring-blue-500/20 transition-all duration-200 rounded-xl bg-white dark:bg-slate-800 hover:border-slate-300 dark:hover:border-slate-600"
                          disabled={isLoading}
                          aria-label={`Phone digit ${index + 1}`}
                        />
                        
                      </div>
                    ))}
                  </div>
                </div>

                {isLoading && (
                  <div className="flex items-center justify-center space-x-3 text-slate-600 dark:text-slate-400 py-4">
                    <Loader2 className="w-5 h-5 animate-spin" />
                    <span className="font-medium">Verifying your phone number...</span>
                  </div>
                )}

                {/* Resend Code Section */}
                <div className="text-center space-y-3 pt-2">
                  {countdown > 0 ? (
                    <div className="flex items-center justify-center space-x-2 text-sm text-slate-500 dark:text-slate-500">
                      <Clock className="w-4 h-4" />
                      <span>Request new code in <span className="font-mono font-bold">{countdown}s</span></span>
                    </div>
                  ) : (
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={handleResendCode}
                      disabled={isLoading}
                      className="border-slate-300 dark:border-slate-600 hover:bg-slate-50 dark:hover:bg-slate-800"
                    >
                      <Phone className="w-4 h-4 mr-2" />
                      Request new verification
                    </Button>
                  )}
                </div>

                {/* Back to CIN */}
                <div className="text-center pt-2">
                  <Button
                    variant="ghost"
                    size="sm"
                    onClick={handleBackToCin}
                    disabled={isLoading}
                    className="text-slate-500 hover:text-slate-700 dark:text-slate-500 dark:hover:text-slate-300"
                  >
                    <ArrowLeft className="w-4 h-4 mr-2" />
                    Change CIN number
                  </Button>
                </div>
              </div>
            )}

            {step === 'success' && (
              // Success Step
              <div className="space-y-6 text-center py-8">
                <div className="animate-bounce">
                  <CheckCircle className="w-16 h-16 text-green-500 mx-auto" />
                </div>
                <div className="space-y-2">
                  <h3 className="text-xl font-bold text-slate-900 dark:text-white">
                    Welcome back, {foundUser?.firstName}!
                  </h3>
                  <p className="text-slate-600 dark:text-slate-400">
                    Taking you to your workspace...
                  </p>
                </div>
                <div className="flex items-center justify-center space-x-2 text-slate-500">
                  <Loader2 className="w-4 h-4 animate-spin" />
                  <span className="text-sm">Loading dashboard</span>
                </div>
              </div>
            )}

            {/* Error Display */}
            {error && (
              <div className="bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-800 rounded-xl p-4">
                <div className="flex items-start space-x-3">
                  <AlertCircle className="w-5 h-5 text-red-500 mt-0.5 flex-shrink-0" />
                  <div className="space-y-1">
                    <p className="text-sm font-medium text-red-800 dark:text-red-200">
                      Authentication Error
                    </p>
                    <p className="text-sm text-red-600 dark:text-red-300">
                      {error}
                    </p>
                  </div>
                </div>
              </div>
            )}
          </CardContent>
        </Card>

        {/* Footer Info */}
        <div className="text-center mt-8 space-y-2">
          <p className="text-xs text-slate-500 dark:text-slate-500">
            Louaj Transportation Management System
          </p>
          <p className="text-xs text-slate-400 dark:text-slate-600">
            Secure • Reliable • Professional
          </p>
        </div>
      </div>
    </div>
  );
} 