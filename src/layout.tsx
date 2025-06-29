import { Outlet, Link, useLocation } from "react-router-dom";
import clsx from "clsx";
import { 
  LayoutDashboard,
  Car,
  UserPlus,
  CheckSquare,
  LogOut,
  Settings,
  User,
  Users,
  Shield,
  ShieldCheck,
  DollarSign,
  BarChart3,
  Moon
} from "lucide-react";
import { useAuth } from "./context/AuthProvider";
import { Button } from "./components/ui/button";
import { useSupervisorMode } from "./context/SupervisorModeProvider";

export default function Layout() {
  const location = useLocation();
  const { currentStaff, logout } = useAuth();
  const { isSupervisorMode, toggleSupervisorMode } = useSupervisorMode();

  const selectedClass = "text-primary bg-primary/10";
  const defaultClass = "w-5 h-5";

  // Check if user is supervisor
  const isSupervisor = currentStaff?.role === 'SUPERVISOR';

  // Different nav items based on mode
  const regularNavItems = [
    { path: "/dashboard", icon: LayoutDashboard, label: "Dashboard" },
    { path: "/queue", icon: Car, label: "Queue" },
    { path: "/booking", icon: UserPlus, label: "Booking" },
    { path: "/verify", icon: CheckSquare, label: "Verify" },
  ];

  const supervisorNavItems = [
    { path: "/dashboard", icon: BarChart3, label: "Overview" },
    { path: "/overnight-queue", icon: Moon, label: "Overnight Queue" },
    { path: "/staff-management", icon: Users, label: "Staff" },
    { path: "/station-config", icon: Settings, label: "Station Config" },
  ];

  const navItems = (isSupervisorMode && isSupervisor) ? supervisorNavItems : regularNavItems;

  const handleLogout = () => {
    logout();
  };

  return (
    <div className="flex flex-row min-w-screen min-h-screen">
      <div className="group w-16 hover:w-48 bg-muted flex flex-col gap-2 px-2 py-3 border-r min-h-screen transition-all duration-500 ease-in-out">
        {/* Logo */}
        <div className="w-12 h-12 bg-primary rounded-lg flex items-center justify-center mb-4 group-hover:w-44 transition-all duration-500 ease-in-out">
                      <span className="text-white font-bold text-lg group-hover:hidden transition-opacity duration-300">L</span>
            <span className="text-white font-bold text-sm hidden group-hover:block opacity-0 group-hover:opacity-100 transition-opacity duration-300 delay-200">Louaj Station</span>
        </div>

        {/* Supervisor Mode Toggle */}
        {isSupervisor && (
          <div className="mb-2">
            <Button
              variant={isSupervisorMode ? "default" : "outline"}
              size="sm"
              className="w-12 h-12 p-0 justify-center group-hover:w-44 group-hover:justify-start group-hover:px-3 transition-all duration-500 ease-in-out"
              onClick={toggleSupervisorMode}
              title={isSupervisorMode ? "Exit Supervisor Mode" : "Enter Supervisor Mode"}
            >
              <div className="flex items-center space-x-2">
                {isSupervisorMode ? (
                  <ShieldCheck className="w-5 h-5 flex-shrink-0" />
                ) : (
                  <Shield className="w-5 h-5 flex-shrink-0" />
                )}
                <span className="hidden group-hover:block text-xs font-medium opacity-0 group-hover:opacity-100 transition-opacity duration-300 delay-200">
                  {isSupervisorMode ? "Exit Supervisor" : "Supervisor Mode"}
                </span>
              </div>
            </Button>
          </div>
        )}

        {/* Main Navigation */}
        <div className="space-y-2">
          {navItems.map(item => {
            const Icon = item.icon;
            const isActive = location.pathname === item.path;
            return (
              <Link 
                key={item.path}
                className={clsx(
                  "hover:text-primary hover:bg-primary/5 w-12 h-12 flex items-center justify-center rounded-lg transition-all duration-500 ease-in-out group-hover:w-44 group-hover:justify-start group-hover:px-3",
                  {
                    [selectedClass]: isActive,
                  }
                )}
                to={item.path}
                title={item.label}
              >
                <div className="flex items-center space-x-3">
                  <Icon className={clsx(defaultClass, "flex-shrink-0")} />
                  <span className="hidden group-hover:block text-sm font-medium opacity-0 group-hover:opacity-100 transition-opacity duration-300 delay-200">
                    {item.label}
                  </span>
                </div>
              </Link>
            );
          })}
        </div>

        {/* Spacer */}
        <div className="flex-grow" />
        
        {/* User Info */}
        {currentStaff && (
          <div className="mb-2 px-1">
            <div className={`w-12 h-12 rounded-lg flex items-center justify-center mb-2 group-hover:w-44 group-hover:justify-start group-hover:px-3 transition-all duration-500 ease-in-out ${
              isSupervisorMode ? 'bg-primary text-white' : 'bg-secondary text-secondary-foreground'
            }`} 
            title={`${currentStaff.firstName} ${currentStaff.lastName}${isSupervisorMode ? ' (Supervisor Mode)' : ''}`}>
              <div className="flex items-center space-x-3">
                <User className="w-5 h-5 flex-shrink-0" />
                <div className="hidden group-hover:block text-left opacity-0 group-hover:opacity-100 transition-opacity duration-300 delay-200">
                  <div className="text-xs font-medium">{currentStaff.firstName} {currentStaff.lastName}</div>
                  <div className="text-[10px] opacity-75">
                    {isSupervisorMode ? 'SUPERVISOR MODE' : currentStaff.role}
                  </div>
                </div>
              </div>
            </div>
            <div className="text-xs text-center text-muted-foreground group-hover:hidden">
              <div className="font-medium">{currentStaff.firstName}</div>
              <div className="text-[8px]">
                {isSupervisorMode ? 'SUPERVISOR' : currentStaff.role}
              </div>
            </div>
          </div>
        )}
        
        {/* Bottom Navigation */}
        <div className="space-y-2">
          {/* Settings - only show in regular mode */}
          {!isSupervisorMode && (
            <Link 
              className={clsx(
                "hover:text-primary hover:bg-primary/5 w-12 h-12 flex items-center justify-center rounded-lg transition-all duration-500 ease-in-out group-hover:w-44 group-hover:justify-start group-hover:px-3",
                {
                  [selectedClass]: location.pathname === "/settings",
                }
              )}
              to="/settings"
              title="Settings"
            >
              <div className="flex items-center space-x-3">
                <Settings className={clsx(defaultClass, "flex-shrink-0")} />
                <span className="hidden group-hover:block text-sm font-medium opacity-0 group-hover:opacity-100 transition-opacity duration-300 delay-200">
                  Settings
                </span>
              </div>
            </Link>
          )}
          
          <Button
            variant="ghost"
            size="sm"
            className="w-12 h-12 p-0 justify-center hover:bg-red-50 hover:text-red-600 group-hover:w-44 group-hover:justify-start group-hover:px-3 transition-all duration-500 ease-in-out"
            onClick={handleLogout}
            title="Logout"
          >
            <div className="flex items-center space-x-3">
              <LogOut className="w-5 h-5 flex-shrink-0" />
              <span className="hidden group-hover:block text-sm font-medium opacity-0 group-hover:opacity-100 transition-opacity duration-300 delay-200">
                Logout
              </span>
            </div>
          </Button>
        </div>
      </div>
      
      <div className="flex-1 min-h-screen overflow-auto">
        <Outlet />
      </div>
    </div>
  );
}
