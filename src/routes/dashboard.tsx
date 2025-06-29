import { Card } from "../components/ui/card";
import { IncomingVehicles } from "../components/IncomingVehicles";
import { useVehicleNotifications } from "../components/NotificationToast";
import { 
  getQueueStats, 
  getTodayIncome, 
  getMonthIncome, 
  getTransactionHistory, 
  currentStation,
  clearNewArrivalFlag,
  IncomingVehicle
} from "../data/mockData";
import { 
  Car, 
  Users, 
  Calendar, 
  TrendingUp, 
  DollarSign,
  Clock,
  MapPin,
  User,
  BarChart3
} from "lucide-react";
import { useAuth } from "../context/AuthProvider";
import { useSupervisorMode } from "../context/SupervisorModeProvider";

export default function Dashboard() {
  const { currentStaff } = useAuth();
  const { isSupervisorMode } = useSupervisorMode();
  
  // Check if user is supervisor
  const isSupervisor = currentStaff?.role === 'SUPERVISOR';

  if (isSupervisorMode && isSupervisor) {
    return <SupervisorDashboard />;
  }

  return <RegularDashboard />;
}

function SupervisorDashboard() {
  const todayIncome = getTodayIncome();
  const monthIncome = getMonthIncome();
  const transactions = getTransactionHistory(); // All transactions

  const formatCurrency = (amount: number) => {
    return `${amount.toFixed(2)} TND`;
  };

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString('en-US', {
      month: 'short',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    });
  };

  return (
    <div className="flex flex-col h-full w-full">
      {/* Header and Income Cards */}
      <div className="p-6 border-b bg-gray-50/50">
        <div className="mb-6">
          <h1 className="text-3xl font-bold">Supervisor Dashboard</h1>
          <p className="text-muted-foreground">Station income overview and transaction management</p>
        </div>

        {/* Income Cards */}
        <div className="grid grid-cols-1 lg:grid-cols-2 xl:grid-cols-4 gap-4">
          <Card className="p-4 lg:p-6 bg-gradient-to-br from-green-50 to-green-100 border-green-200">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-green-600">Today's Income</p>
                <p className="text-2xl lg:text-3xl font-bold text-green-700">{formatCurrency(todayIncome)}</p>
                <p className="text-xs text-green-600 mt-1">
                  {new Date().toLocaleDateString('en-US', { 
                    weekday: 'long',
                    month: 'long', 
                    day: 'numeric' 
                  })}
                </p>
              </div>
              <div className="w-10 h-10 lg:w-12 lg:h-12 bg-green-500 rounded-lg flex items-center justify-center">
                <DollarSign className="h-5 w-5 lg:h-6 lg:w-6 text-white" />
              </div>
            </div>
          </Card>

          <Card className="p-4 lg:p-6 bg-gradient-to-br from-blue-50 to-blue-100 border-blue-200">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-blue-600">This Month's Income</p>
                <p className="text-2xl lg:text-3xl font-bold text-blue-700">{formatCurrency(monthIncome)}</p>
                <p className="text-xs text-blue-600 mt-1">
                  {new Date().toLocaleDateString('en-US', { 
                    month: 'long',
                    year: 'numeric'
                  })}
                </p>
              </div>
              <div className="w-10 h-10 lg:w-12 lg:h-12 bg-blue-500 rounded-lg flex items-center justify-center">
                <TrendingUp className="h-5 w-5 lg:h-6 lg:w-6 text-white" />
              </div>
            </div>
          </Card>

          <Card className="p-4 lg:p-6 bg-gradient-to-br from-purple-50 to-purple-100 border-purple-200">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-purple-600">Total Transactions</p>
                <p className="text-2xl lg:text-3xl font-bold text-purple-700">{transactions.length}</p>
                <p className="text-xs text-purple-600 mt-1">All time</p>
              </div>
              <div className="w-10 h-10 lg:w-12 lg:h-12 bg-purple-500 rounded-lg flex items-center justify-center">
                <BarChart3 className="h-5 w-5 lg:h-6 lg:w-6 text-white" />
              </div>
            </div>
          </Card>

          <Card className="p-4 lg:p-6 bg-gradient-to-br from-orange-50 to-orange-100 border-orange-200">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-orange-600">Average Transaction</p>
                <p className="text-2xl lg:text-3xl font-bold text-orange-700">
                  {formatCurrency(transactions.length > 0 ? (todayIncome + monthIncome) / transactions.length : 0)}
                </p>
                <p className="text-xs text-orange-600 mt-1">Per transaction</p>
              </div>
              <div className="w-10 h-10 lg:w-12 lg:h-12 bg-orange-500 rounded-lg flex items-center justify-center">
                <TrendingUp className="h-5 w-5 lg:h-6 lg:w-6 text-white" />
              </div>
            </div>
          </Card>
        </div>
      </div>

      {/* Transaction History - Full Height */}
      <div className="flex-1 p-6 overflow-hidden">
        <Card className="h-full flex flex-col">
          <div className="p-6 border-b">
            <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-2">
              <h2 className="text-xl font-semibold">Transaction History</h2>
              <div className="text-sm text-muted-foreground">
                {transactions.length} total transactions
              </div>
            </div>
          </div>

          <div className="flex-1 overflow-auto">
            <div className="min-w-full">
              <table className="w-full">
                <thead className="sticky top-0 bg-white border-b z-10">
                  <tr className="text-left">
                    <th className="px-6 py-3 text-sm font-medium text-muted-foreground">Route</th>
                    <th className="px-6 py-3 text-sm font-medium text-muted-foreground">Staff</th>
                    <th className="px-6 py-3 text-sm font-medium text-muted-foreground">Amount</th>
                    <th className="px-6 py-3 text-sm font-medium text-muted-foreground">Date</th>
                  </tr>
                </thead>
                <tbody className="divide-y">
                  {transactions.map((transaction) => (
                    <tr key={transaction.id} className="hover:bg-gray-50 transition-colors">
                      <td className="px-6 py-4">
                        <div className="flex items-center space-x-3">
                          <MapPin className="h-4 w-4 text-muted-foreground flex-shrink-0" />
                          <div className="min-w-0">
                            <div className="font-medium text-sm truncate">{transaction.toStation}</div>
                            <div className="text-xs text-muted-foreground truncate">
                              from {transaction.fromStation}
                            </div>
                          </div>
                        </div>
                      </td>
                      <td className="px-6 py-4">
                        <div className="flex items-center space-x-2">
                          <User className="h-4 w-4 text-muted-foreground flex-shrink-0" />
                          <span className="text-sm truncate">{transaction.staffName}</span>
                        </div>
                      </td>
                      <td className="px-6 py-4">
                        <span className="font-bold text-green-600 whitespace-nowrap">
                          {formatCurrency(transaction.amount)}
                        </span>
                      </td>
                      <td className="px-6 py-4">
                        <div className="flex items-center space-x-2">
                          <Clock className="h-4 w-4 text-muted-foreground flex-shrink-0" />
                          <span className="text-sm text-muted-foreground whitespace-nowrap">
                            {formatDate(transaction.createdAt)}
                          </span>
                        </div>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        </Card>
      </div>
    </div>
  );
}

function RegularDashboard() {
  const queueStats = getQueueStats();
  const { notifyVehicleArrival } = useVehicleNotifications();
  
  const totalVehicles = queueStats.reduce((sum, stat) => sum + stat.vehicleCount, 0);
  const totalSeats = queueStats.reduce((sum, stat) => sum + stat.totalSeats, 0);
  const availableSeats = queueStats.reduce((sum, stat) => sum + stat.availableSeats, 0);
  const averageOccupancy = queueStats.length > 0 
    ? queueStats.reduce((sum, stat) => sum + stat.occupancyRate, 0) / queueStats.length 
    : 0;

  const handleVehicleArrival = (vehicle: IncomingVehicle) => {
    // Show notification for new arrival
    notifyVehicleArrival({
      licensePlate: vehicle.licensePlate,
      fromStationName: vehicle.fromStationName,
      driverName: vehicle.driverName
    });
    
    // Clear the new arrival flag after showing notification
    setTimeout(() => {
      clearNewArrivalFlag(vehicle.id);
    }, 1000);
  };

  return (
    <div className="flex flex-col h-screen w-full p-6 space-y-6 overflow-hidden">
      <div className="flex-shrink-0">
        <h1 className="text-3xl font-bold">Dashboard</h1>
        <p className="text-muted-foreground">Welcome to {currentStation.name}</p>
      </div>

      {/* Stats Cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4 flex-shrink-0">
        <Card className="p-6">
          <div className="flex items-center space-x-4">
            <Car className="h-8 w-8 text-blue-500" />
            <div>
              <p className="text-sm font-medium text-muted-foreground">Active Vehicles</p>
              <p className="text-2xl font-bold">{totalVehicles}</p>
            </div>
          </div>
        </Card>

        <Card className="p-6">
          <div className="flex items-center space-x-4">
            <Users className="h-8 w-8 text-green-500" />
            <div>
              <p className="text-sm font-medium text-muted-foreground">Total Seats</p>
              <p className="text-2xl font-bold">{totalSeats}</p>
            </div>
          </div>
        </Card>

        <Card className="p-6">
          <div className="flex items-center space-x-4">
            <Calendar className="h-8 w-8 text-orange-500" />
            <div>
              <p className="text-sm font-medium text-muted-foreground">Available Seats</p>
              <p className="text-2xl font-bold">{availableSeats}</p>
            </div>
          </div>
        </Card>

        <Card className="p-6">
          <div className="flex items-center space-x-4">
            <TrendingUp className="h-8 w-8 text-purple-500" />
            <div>
              <p className="text-sm font-medium text-muted-foreground">Avg Occupancy</p>
              <p className="text-2xl font-bold">{averageOccupancy.toFixed(0)}%</p>
            </div>
          </div>
        </Card>
      </div>

      {/* Main Content - Two Column Layout with Fixed Height */}
      <div className="grid grid-cols-1 xl:grid-cols-3 gap-6 flex-1 min-h-0">
        {/* Left Column - Queue Overview and Summary */}
        <div className="xl:col-span-2 space-y-6">
          <Card className="p-6">
            <h2 className="text-xl font-semibold mb-4">Queue Overview</h2>
            <div className="space-y-4">
              {queueStats.map((stat) => (
                <div key={stat.destination} className="flex items-center justify-between p-3 rounded-lg">
                  <div>
                    <h3 className="font-medium">{stat.destination}</h3>
                    <p className="text-sm text-muted-foreground">{stat.vehicleCount} vehicles</p>
                  </div>
                  <div className="text-right">
                    <p className="font-semibold">{stat.availableSeats}/{stat.totalSeats}</p>
                    <p className="text-sm text-muted-foreground">{stat.occupancyRate.toFixed(0)}% full</p>
                  </div>
                </div>
              ))}
            </div>
          </Card>

          <Card className="p-6">
            <h2 className="text-xl font-semibold mb-4">Today's Summary</h2>
            <div className="space-y-4">
              <div className="flex justify-between items-center">
                <span className="text-muted-foreground">Destinations Active</span>
                <span className="font-semibold">{queueStats.length}</span>
              </div>
              <div className="flex justify-between items-center">
                <span className="text-muted-foreground">Total Capacity</span>
                <span className="font-semibold">{totalSeats} seats</span>
              </div>
              <div className="flex justify-between items-center">
                <span className="text-muted-foreground">Current Availability</span>
                <span className="font-semibold text-green-600">{availableSeats} seats</span>
              </div>
            </div>
          </Card>
        </div>

        {/* Right Column - Incoming Vehicles with Fixed Height */}
        <div className="xl:col-span-1 h-full min-h-0">
          <IncomingVehicles onNewArrival={handleVehicleArrival} />
        </div>
      </div>
    </div>
  );
} 