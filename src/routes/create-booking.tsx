import { useState } from "react";
import { Button } from "../components/ui/button";
import { getAvailableDestinations, getVehicleQueuesByDestination } from "../data/mockData";
import { useInit } from "../context/InitProvider";
import { Users, MapPin, CreditCard, Ticket, PrinterIcon, AlertTriangle } from "lucide-react";

export default function CreateBooking() {
  const { systemStatus } = useInit();
  const [selectedDestination, setSelectedDestination] = useState("");
  const [customerName, setCustomerName] = useState("");
  const [customerPhone, setCustomerPhone] = useState("");
  const [seatsRequested, setSeatsRequested] = useState(1);
  const [selectedQueue, setSelectedQueue] = useState("");

  const destinations = getAvailableDestinations();
  const availableQueues = selectedDestination ? getVehicleQueuesByDestination(selectedDestination) : [];

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    // TODO: Create booking logic
    console.log("Creating booking...", {
      selectedDestination,
      customerName,
      customerPhone,
      seatsRequested,
      selectedQueue
    });
  };

  return (
    <div className="flex flex-col h-full w-full p-6 space-y-6">
      <div>
        <h1 className="text-3xl font-bold">Create New Booking</h1>
        <p className="text-muted-foreground">Book tickets for walk-in customers</p>
        
        {/* Printer Status Indicator */}
        <div className="mt-4">
          <div className={`inline-flex items-center space-x-2 px-3 py-2 rounded-lg text-sm font-medium ${
            systemStatus.printerConnected 
              ? 'bg-green-100 text-green-700 border border-green-200' 
              : 'bg-red-100 text-red-700 border border-red-200'
          }`}>
            {systemStatus.printerConnected ? (
              <>
                <Ticket className="h-4 w-4" />
                <span>Printer Ready - Tickets can be issued</span>
              </>
            ) : (
              <>
                <PrinterIcon className="h-4 w-4" />
                <span>Printer Unavailable - Booking temporarily disabled</span>
              </>
            )}
          </div>
        </div>
      </div>

      {/* Printer Warning */}
      {!systemStatus.printerConnected && (
        <div className="max-w-2xl">
          <div className="bg-red-50 border border-red-200 rounded-lg p-4">
            <div className="flex items-start space-x-3">
              <AlertTriangle className="h-5 w-5 text-red-600 mt-0.5" />
              <div className="flex-1">
                <h3 className="text-sm font-semibold text-red-800">Booking Temporarily Unavailable</h3>
                <p className="text-xs text-red-700 mt-1">
                  The thermal printer is not connected, so tickets cannot be printed. Please ensure the printer is connected and functioning before creating bookings.
                </p>
                <p className="text-xs text-red-700 mt-2">
                  <strong>Note:</strong> Bookings require immediate ticket printing for customer verification.
                </p>
              </div>
            </div>
          </div>
        </div>
      )}

      <div className="max-w-2xl">
        <form onSubmit={handleSubmit} className="space-y-6">
          {/* Customer Information */}
          <div className="bg-card rounded-lg border p-6 space-y-4">
            <h2 className="text-lg font-semibold flex items-center">
              <Users className="h-5 w-5 mr-2" />
              Customer Information
            </h2>
            
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div className="space-y-2">
                <label className="text-sm font-medium">Full Name *</label>
                <input
                  type="text"
                  value={customerName}
                  onChange={(e) => setCustomerName(e.target.value)}
                  placeholder="Enter customer name"
                  className="w-full px-3 py-2 border rounded-md bg-background"
                  required
                />
              </div>
              
              <div className="space-y-2">
                <label className="text-sm font-medium">Phone Number</label>
                <input
                  type="tel"
                  value={customerPhone}
                  onChange={(e) => setCustomerPhone(e.target.value)}
                  placeholder="+216 XX XXX XXX"
                  className="w-full px-3 py-2 border rounded-md bg-background"
                />
              </div>
            </div>
          </div>

          {/* Destination Selection */}
          <div className="bg-card rounded-lg border p-6 space-y-4">
            <h2 className="text-lg font-semibold flex items-center">
              <MapPin className="h-5 w-5 mr-2" />
              Destination
            </h2>
            
            <div className="space-y-2">
              <label className="text-sm font-medium">Select Destination *</label>
              <select
                value={selectedDestination}
                onChange={(e) => setSelectedDestination(e.target.value)}
                className="w-full px-3 py-2 border rounded-md bg-background"
                required
              >
                <option value="">Choose destination...</option>
                {destinations.map(dest => (
                  <option key={dest} value={dest}>{dest}</option>
                ))}
              </select>
            </div>
          </div>

          {/* Vehicle Selection */}
          {selectedDestination && (
            <div className="bg-card rounded-lg border p-6 space-y-4">
              <h2 className="text-lg font-semibold flex items-center">
                <Ticket className="h-5 w-5 mr-2" />
                Available Vehicles
              </h2>
              
              <div className="space-y-3">
                {availableQueues.length === 0 ? (
                  <p className="text-muted-foreground">No vehicles available for {selectedDestination}</p>
                ) : (
                  availableQueues.map(queue => (
                    <div 
                      key={queue.id}
                      className={`p-4 border rounded-lg cursor-pointer transition-colors ${
                        selectedQueue === queue.id ? 'border-primary bg-primary/5' : 'hover:bg-muted'
                      }`}
                      onClick={() => setSelectedQueue(queue.id)}
                    >
                      <div className="flex items-center justify-between">
                        <div>
                          <p className="font-medium">Position {queue.queuePosition}</p>
                          <p className="text-sm text-muted-foreground">
                            {queue.availableSeats}/{queue.totalSeats} seats available
                          </p>
                        </div>
                        <div className="text-right">
                          <p className="font-semibold">{queue.basePrice} TND/seat</p>
                          <p className="text-sm text-muted-foreground">{queue.status}</p>
                        </div>
                      </div>
                    </div>
                  ))
                )}
              </div>
            </div>
          )}

          {/* Booking Details */}
          {selectedQueue && (
            <div className="bg-card rounded-lg border p-6 space-y-4">
              <h2 className="text-lg font-semibold flex items-center">
                <CreditCard className="h-5 w-5 mr-2" />
                Booking Details
              </h2>
              
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="space-y-2">
                  <label className="text-sm font-medium">Number of Seats *</label>
                  <input
                    type="number"
                    min="1"
                    max="10"
                    value={seatsRequested}
                    onChange={(e) => setSeatsRequested(parseInt(e.target.value))}
                    className="w-full px-3 py-2 border rounded-md bg-background"
                    required
                  />
                </div>
                
                <div className="space-y-2">
                  <label className="text-sm font-medium">Total Amount</label>
                  <div className="text-2xl font-bold">
                    {(seatsRequested * (availableQueues.find(q => q.id === selectedQueue)?.basePrice || 0)).toFixed(2)} TND
                  </div>
                </div>
              </div>
            </div>
          )}

          {/* Actions */}
          <div className="flex space-x-3">
            <Button 
              type="submit" 
              disabled={!customerName || !selectedDestination || !selectedQueue || !systemStatus.printerConnected}
              className={`flex-1 ${!systemStatus.printerConnected ? 'opacity-50 cursor-not-allowed' : ''}`}
              title={!systemStatus.printerConnected ? 'Printer must be connected to create bookings' : ''}
            >
              {systemStatus.printerConnected ? (
                <>
                  <Ticket className="h-4 w-4 mr-2" />
                  Create Booking
                </>
              ) : (
                <>
                  <PrinterIcon className="h-4 w-4 mr-2" />
                  Booking Unavailable
                </>
              )}
            </Button>
            <Button type="button" variant="outline">
              Cancel
            </Button>
          </div>
        </form>
      </div>
    </div>
  );
} 