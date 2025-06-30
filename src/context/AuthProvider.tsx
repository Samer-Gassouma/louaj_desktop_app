import React, { createContext, useState, useContext, useEffect, ReactNode } from "react";

interface AuthContextInterface {
  isAuthenticated: boolean;
  currentStaff: any | null;
  login: (staff: any) => void;
  logout: () => void;
  isLoading: boolean;
}

const AuthContext = createContext<AuthContextInterface>({
  isAuthenticated: false,
  currentStaff: null,
  login: () => {},
  logout: () => {},
  isLoading: true,
});

export const useAuth = () => useContext(AuthContext);

export const AuthProvider = ({ children }: { children: ReactNode }) => {
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const [currentStaff, setCurrentStaff] = useState<any | null>(null);
  const [isLoading, setIsLoading] = useState(true);

  // Check for existing authentication on app start
  useEffect(() => {
    const checkAuth = () => {
      try {
        const authStatus = localStorage.getItem('isAuthenticated');
        const staffData = localStorage.getItem('currentStaff');
        
        if (authStatus === 'true' && staffData) {
          setIsAuthenticated(true);
          setCurrentStaff(JSON.parse(staffData));
        }
      } catch (error) {
        console.error('Error checking authentication:', error);
        // Clear invalid data
        localStorage.removeItem('isAuthenticated');
        localStorage.removeItem('currentStaff');
      } finally {
        setIsLoading(false);
      }
    };

    checkAuth();
  }, []);

  const login = (staff: any) => {
    setIsAuthenticated(true);
    setCurrentStaff(staff);
    localStorage.setItem('isAuthenticated', 'true');
    localStorage.setItem('currentStaff', JSON.stringify(staff));
  };

  const logout = () => {
    setIsAuthenticated(false);
    setCurrentStaff(null);
    localStorage.removeItem('isAuthenticated');
    localStorage.removeItem('currentStaff');
  };

  return (
    <AuthContext.Provider value={{
      isAuthenticated,
      currentStaff,
      login,
      logout,
      isLoading
    }}>
      {children}
    </AuthContext.Provider>
  );
}; 