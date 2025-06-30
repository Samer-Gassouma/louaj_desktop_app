import { 
  getAvailableDestinations, 
  getAllOvernightQueues,
  getOvernightQueueByDestination, 
  getVehicleById, 
  addVehicleByCinToOvernightQueue,
  removeFromOvernightQueue,
  OvernightQueue
} from "../data/mockData";
import { Button } from "../components/ui/button";
import { Input } from "../components/ui/input";
import { 
  Car, 
  Clock, 
  Moon, 
  CreditCard,
  Plus,
  Trash2,
  User,
  FileText,
  Shield
} from "lucide-react";
import { useState, useEffect } from "react";
import { useAuth } from "../context/AuthProvider";

// Simple overnight queue item component
interface OvernightItemProps {
  queue: OvernightQueue;
  onRemove: (id: string) => void;
}

function OvernightItem({ queue, onRemove }: OvernightItemProps) {
  const vehicle = getVehicleById(queue.vehicleId);

  return (
    <div className="flex items-center justify-between p-4 bg-card border rounded-lg">
      {/* Position & Vehicle Info */}
      <div className="flex items-center space-x-4">
        {/* Position */}
        <div className="bg-orange-500 text-white rounded-full w-8 h-8 flex items-center justify-center font-bold text-sm">
          {queue.position}
        </div>

        {/* Vehicle Info */}
        <div className="flex items-center space-x-3">
          <Car className="h-5 w-5 text-muted-foreground" />
          <div>
            <p className="font-medium">{vehicle?.licensePlate}</p>
            <p className="text-sm text-muted-foreground">{vehicle?.driverName}</p>
          </div>
        </div>

        {/* Destination */}
        <div className="flex items-center space-x-2">
          <span className="text-sm font-medium text-primary">→ {queue.destinationName}</span>
        </div>

        {/* License & Time */}
        <div className="flex items-center space-x-6">
          <div className="flex items-center space-x-2">
            <CreditCard className="h-4 w-4 text-muted-foreground" />
            <span className="text-sm font-mono">{queue.driverLicenseId}</span>
          </div>
          
          <div className="flex items-center space-x-2">
            <Clock className="h-4 w-4 text-muted-foreground" />
            <span className="text-sm">
              {new Date(queue.enteredAt).toLocaleTimeString('en-US', {
                hour: '2-digit',
                minute: '2-digit'
              })}
            </span>
          </div>
        </div>

        {/* Notes */}
        {queue.notes && (
          <div className="flex items-center space-x-2 max-w-xs">
            <FileText className="h-4 w-4 text-muted-foreground" />
            <span className="text-xs text-muted-foreground truncate">{queue.notes}</span>
          </div>
        )}
      </div>

      {/* Status & Actions */}
      <div className="flex items-center space-x-3">
        <div className={`px-2 py-1 rounded-full text-xs font-medium ${
          queue.status === 'PARKED' ? 'text-blue-600 bg-blue-50' : 'text-green-600 bg-green-50'
        }`}>
          {queue.status}
        </div>

        <Button 
          variant="ghost" 
          size="sm"
          onClick={() => onRemove(queue.id)}
          className="text-red-600 hover:text-red-700 hover:bg-red-50"
        >
          <Trash2 className="h-4 w-4" />
        </Button>
      </div>
    </div>
  );
}

export default function OvernightQueueManagement() {
  const { currentStaff } = useAuth();
  const [selectedDestination, setSelectedDestination] = useState<string | null>(null);
  const [overnightData, setOvernightData] = useState<Record<string, OvernightQueue[]>>({});
  const [showAddForm, setShowAddForm] = useState(false);
  const [driverCin, setDriverCin] = useState('');
  const [message, setMessage] = useState('');
  const [messageType, setMessageType] = useState<'error' | 'success'>('error');
  
  const destinations = getAvailableDestinations();

  // Check if user is supervisor
  if (!currentStaff || currentStaff.role !== 'SUPERVISOR') {
    return (
      <div className="flex flex-col items-center justify-center h-full p-6">
        <Shield className="h-16 w-16 text-muted-foreground mb-4" />
        <h1 className="text-2xl font-bold text-muted-foreground mb-2">Access Restricted</h1>
        <p className="text-muted-foreground">Only supervisors can access the overnight queue management.</p>
      </div>
    );
  }

  // Initialize overnight queue data
  useEffect(() => {
    refreshOvernightData();
  }, []);

  const refreshOvernightData = () => {
    const data: Record<string, OvernightQueue[]> = {};
    destinations.forEach(dest => {
      data[dest] = getOvernightQueueByDestination(dest);
    });
    setOvernightData(data);
  };

  const handleAddVehicle = () => {
    setMessage('');
    
    if (!driverCin.trim()) {
      setMessage('Please enter driver CIN');
      setMessageType('error');
      return;
    }

    // Add vehicle to overnight queue using CIN only
    const result = addVehicleByCinToOvernightQueue(
      driverCin.trim(),
      currentStaff!.id,
      currentStaff!.firstName + ' ' + currentStaff!.lastName
    );

    setMessage(result.message);
    setMessageType(result.success ? 'success' : 'error');

    if (result.success) {
      // Reset form and close
      setDriverCin('');
      setShowAddForm(false);
      refreshOvernightData();
    }
  };

  const handleRemoveVehicle = (overnightId: string) => {
    if (confirm('Are you sure you want to remove this vehicle from the overnight queue?')) {
      removeFromOvernightQueue(overnightId);
      refreshOvernightData();
    }
  };



  return (
    <div className="flex flex-col h-full w-full p-6 space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <div className="flex items-center space-x-3">
            <Moon className="h-8 w-8 text-blue-600" />
            <div>
              <h1 className="text-3xl font-bold">Overnight Queue Management</h1>
              <p className="text-muted-foreground">Add vehicles to overnight queue by driver CIN - automatically transfers to morning queue</p>
            </div>
          </div>
        </div>
        <Button onClick={() => setShowAddForm(!showAddForm)}>
          <Plus className="h-4 w-4 mr-2" />
          Add Vehicle to Overnight
        </Button>
      </div>

      {/* Add Vehicle Form */}
      {showAddForm && (
        <div className="bg-card border rounded-lg p-6">
          <h3 className="text-lg font-semibold mb-4">Add Vehicle to Overnight Queue</h3>
          
          {message && (
            <div className={`mb-4 p-3 border rounded-md text-sm ${
              messageType === 'error' 
                ? 'bg-red-50 border-red-200 text-red-700' 
                : 'bg-green-50 border-green-200 text-green-700'
            }`}>
              {message}
            </div>
          )}
          
          <div className="grid grid-cols-1 gap-4">
            <div>
              <label className="block text-sm font-medium mb-1">Driver CIN *</label>
              <Input 
                placeholder="11223344"
                value={driverCin}
                onChange={(e) => setDriverCin(e.target.value)}
                className="font-mono"
                maxLength={8}
              />
              <p className="text-xs text-muted-foreground mt-1">
                Enter the 8-digit driver CIN number. Vehicle and destination will be auto-detected.
              </p>
            </div>
          </div>
          
          <div className="flex space-x-2 mt-4">
            <Button onClick={handleAddVehicle}>Add to Overnight Queue</Button>
            <Button variant="outline" onClick={() => {
              setShowAddForm(false);
              setMessage('');
              setDriverCin('');
            }}>Cancel</Button>
          </div>
        </div>
      )}

      {/* Destination Selection */}
      <div className="flex space-x-2">
        <Button 
          variant={selectedDestination === null ? "default" : "outline"}
          onClick={() => setSelectedDestination(null)}
        >
          All Destinations
        </Button>
        {destinations.map(dest => (
          <Button
            key={dest}
            variant={selectedDestination === dest ? "default" : "outline"}
            onClick={() => setSelectedDestination(dest)}
          >
            {dest}
          </Button>
        ))}
      </div>

      {/* Overnight Queue Content */}
      <div className="flex-1 space-y-6">
        {destinations
          .filter(dest => selectedDestination === null || dest === selectedDestination)
          .map(destination => {
            const queues = overnightData[destination] || [];
            
            return (
              <div key={destination} className="bg-card rounded-lg border p-6">
                <div className="flex items-center mb-4">
                  <div className="flex items-center space-x-3">
                    <div className="bg-orange-500 text-white rounded-full w-10 h-10 flex items-center justify-center font-semibold">
                      <Moon className="h-5 w-5" />
                    </div>
                    <div>
                      <h2 className="text-xl font-semibold">{destination} - Overnight Queue</h2>
                      <p className="text-sm text-muted-foreground">
                        {queues.length} vehicle{queues.length !== 1 ? 's' : ''} staying overnight (will transfer automatically in the morning)
                      </p>
                    </div>
                  </div>
                </div>

                {/* Overnight Queue List */}
                <div className="space-y-3">
                  {queues.length === 0 ? (
                    <div className="text-center py-8 text-muted-foreground">
                      <Moon className="h-12 w-12 mx-auto mb-2 opacity-50" />
                      <p>No vehicles in overnight queue for {destination}</p>
                      <p className="text-sm">Enter driver CIN to add vehicles</p>
                    </div>
                  ) : (
                    queues.map(queue => (
                      <OvernightItem
                        key={queue.id}
                        queue={queue}
                        onRemove={handleRemoveVehicle}
                      />
                    ))
                  )}
                </div>
              </div>
            );
          })}
      </div>
    </div>
  );
} 