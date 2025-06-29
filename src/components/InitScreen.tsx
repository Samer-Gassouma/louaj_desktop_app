import React, { useState, useEffect } from 'react';
import { Loader2, Wifi, WifiOff, Printer, User, Download, CheckCircle, XCircle, AlertCircle } from 'lucide-react';
import { Card, CardContent } from './ui/card';

interface SystemCheck {
  name: string;
  status: 'pending' | 'success' | 'error' | 'warning';
  message: string;
  icon: React.ReactNode;
}

interface InitScreenProps {
  onInitComplete: (shouldShowLogin: boolean) => void;
}

export const InitScreen: React.FC<InitScreenProps> = ({ onInitComplete }) => {
  const [currentStep, setCurrentStep] = useState(0);
  const [checks, setChecks] = useState<SystemCheck[]>([
    {
      name: 'Network Connection',
      status: 'pending',
      message: 'Checking connection to local server...',
      icon: <Wifi className="w-5 h-5" />
    },
    {
      name: 'Authentication',
      status: 'pending',
      message: 'Verifying user session...',
      icon: <User className="w-5 h-5" />
    },
    {
      name: 'Ticket Printer',
      status: 'pending',
      message: 'Detecting printer connection...',
      icon: <Printer className="w-5 h-5" />
    },
    {
      name: 'App Updates',
      status: 'pending',
      message: 'Checking for updates...',
      icon: <Download className="w-5 h-5" />
    }
  ]);

  const getStatusIcon = (status: SystemCheck['status']) => {
    switch (status) {
      case 'success':
        return <CheckCircle className="w-5 h-5 text-green-500" />;
      case 'error':
        return <XCircle className="w-5 h-5 text-red-500" />;
      case 'warning':
        return <AlertCircle className="w-5 h-5 text-yellow-500" />;
      default:
        return <Loader2 className="w-5 h-5 animate-spin text-blue-500" />;
    }
  };

  const updateCheck = (index: number, status: SystemCheck['status'], message: string) => {
    setChecks(prev => prev.map((check, i) => 
      i === index ? { ...check, status, message } : check
    ));
  };

  const performChecks = async () => {
    // Check 1: Network Connection
    setCurrentStep(0);
    await new Promise(resolve => setTimeout(resolve, 1500));
    
    // Simulate network check (90% success rate)
    const networkSuccess = Math.random() > 0.1;
    if (networkSuccess) {
      updateCheck(0, 'success', 'Connected to local server (192.168.1.100)');
    } else {
      updateCheck(0, 'error', 'Failed to connect to local server');
    }

    // Check 2: Authentication
    setCurrentStep(1);
    await new Promise(resolve => setTimeout(resolve, 1200));
    
    // Check if user is already logged in (from localStorage)
    const storedAuth = localStorage.getItem('louaj_auth');
    const isLoggedIn = storedAuth && JSON.parse(storedAuth).isAuthenticated;
    
    if (isLoggedIn) {
      updateCheck(1, 'success', 'User session active');
    } else {
      updateCheck(1, 'warning', 'No active session - login required');
    }

    // Check 3: Printer Connection
    setCurrentStep(2);
    await new Promise(resolve => setTimeout(resolve, 1000));
    
    // Simulate printer check (70% success rate)
    const printerConnected = Math.random() > 0.3;
    if (printerConnected) {
      updateCheck(2, 'success', 'Thermal printer ready (USB001)');
    } else {
      updateCheck(2, 'warning', 'Printer not detected - manual tickets only');
    }

    // Check 4: App Updates
    setCurrentStep(3);
    await new Promise(resolve => setTimeout(resolve, 800));
    
    // Simulate update check (95% up to date)
    const needsUpdate = Math.random() > 0.95;
    if (needsUpdate) {
      updateCheck(3, 'warning', 'Update available (v2.1.3)');
    } else {
      updateCheck(3, 'success', 'App is up to date (v2.1.2)');
    }

    // Wait a bit before completing
    await new Promise(resolve => setTimeout(resolve, 1000));
    
    // Complete initialization
    const shouldShowLogin = !isLoggedIn || !networkSuccess;
    onInitComplete(shouldShowLogin);
  };

  useEffect(() => {
    performChecks();
  }, []);

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 to-indigo-100 dark:from-gray-900 dark:to-gray-800 flex items-center justify-center p-4">
      <Card className="w-full max-w-md">
        <CardContent className="p-8">
          {/* Logo and Title */}
          <div className="text-center mb-8">
            <div className="w-16 h-16 bg-primary rounded-xl flex items-center justify-center mx-auto mb-4">
              <span className="text-white font-bold text-2xl">L</span>
            </div>
            <h1 className="text-2xl font-bold text-gray-900 dark:text-white mb-2">
              Louaj Station
            </h1>
            <p className="text-sm text-gray-600 dark:text-gray-400">
              Initializing system...
            </p>
          </div>

          {/* System Checks */}
          <div className="space-y-4">
            {checks.map((check, index) => (
              <div
                key={check.name}
                className={`flex items-center space-x-3 p-3 rounded-lg transition-all duration-300 ${
                  index <= currentStep
                    ? 'bg-white dark:bg-gray-800 shadow-sm'
                    : 'bg-gray-50 dark:bg-gray-700 opacity-50'
                }`}
              >
                <div className="flex-shrink-0">
                  {index <= currentStep ? getStatusIcon(check.status) : check.icon}
                </div>
                <div className="flex-1 min-w-0">
                  <div className="text-sm font-medium text-gray-900 dark:text-white">
                    {check.name}
                  </div>
                  <div className="text-xs text-gray-500 dark:text-gray-400 truncate">
                    {check.message}
                  </div>
                </div>
              </div>
            ))}
          </div>

          {/* Progress Bar */}
          <div className="mt-6">
            <div className="flex justify-between text-xs text-gray-500 dark:text-gray-400 mb-2">
              <span>Initializing</span>
              <span>{Math.round(((currentStep + 1) / checks.length) * 100)}%</span>
            </div>
            <div className="w-full bg-gray-200 dark:bg-gray-700 rounded-full h-2">
              <div
                className="bg-primary h-2 rounded-full transition-all duration-500 ease-out"
                style={{
                  width: `${((currentStep + 1) / checks.length) * 100}%`
                }}
              />
            </div>
          </div>

          {/* Loading Animation */}
          <div className="flex items-center justify-center mt-6">
            <Loader2 className="w-6 h-6 animate-spin text-primary mr-2" />
            <span className="text-sm text-gray-600 dark:text-gray-400">
              Please wait...
            </span>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}; 