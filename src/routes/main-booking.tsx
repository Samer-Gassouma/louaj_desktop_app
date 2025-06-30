import { useState, useEffect } from 'react';
import { useAuth } from '../context/AuthProvider';
import { useInit } from '../context/InitProvider';
import { Button } from '../components/ui/button';
import { Card, CardContent } from '../components/ui/card';
import { Input } from '../components/ui/input';
import { 
  MapPin, 
  Plus,
  Minus,
  Ticket,
  CheckCircle,
  Loader2,
  X,
  PrinterIcon,
  AlertTriangle,
  Printer
} from 'lucide-react';
import {
  getAvailableGovernorates,
  getDelegationsByGovernorate,
  getStationsByFilters,
  Station,
  currentStation
} from '../data/mockData';

interface BookingData {
  seats: number;
}

export default function MainBooking() {
  const { currentStaff } = useAuth();
  const { systemStatus } = useInit();
  const [selectedGovernorate, setSelectedGovernorate] = useState<string>('');
  const [selectedDelegation, setSelectedDelegation] = useState<string>('');
  const [filteredStations, setFilteredStations] = useState<Station[]>([]);
  const [selectedStation, setSelectedStation] = useState<Station | null>(null);
  const [bookingData, setBookingData] = useState<BookingData>({
    seats: 1,
  });
  const [isProcessing, setIsProcessing] = useState(false);
  const [showSuccess, setShowSuccess] = useState(false);

  const governorates = getAvailableGovernorates();
  const delegations = selectedGovernorate ? getDelegationsByGovernorate(selectedGovernorate) : [];

  // Update filtered stations when filters change
  useEffect(() => {
    const stations = getStationsByFilters(
      selectedGovernorate || undefined,
      selectedDelegation || undefined
    );
    setFilteredStations(stations);
  }, [selectedGovernorate, selectedDelegation]);

  // Initialize with all stations
  useEffect(() => {
    setFilteredStations(getStationsByFilters());
  }, []);

  const handleGovernorateChange = (value: string) => {
    setSelectedGovernorate(value);
    setSelectedDelegation('');
  };

  const handleStationSelect = (station: Station) => {
    setSelectedStation(station);
    setShowSuccess(false);
    // Reset form when selecting new station
    setBookingData({
      seats: 1,
    });
  };

  const handleSeatsChange = (change: number) => {
    setBookingData(prev => ({
      seats: Math.max(1, Math.min(8, prev.seats + change))
    }));
  };

  const calculateTotal = () => {
    if (!selectedStation) return 0;
    return (selectedStation.basePrice || 0) * bookingData.seats;
  };

  const handleBooking = async () => {
    if (!selectedStation) {
      return;
    }

    setIsProcessing(true);
    
    // Simulate booking process
    await new Promise(resolve => setTimeout(resolve, 1000));
    
    setIsProcessing(false);
    setShowSuccess(true);
    
    // Clear form after success and auto-close
    setTimeout(() => {
      setBookingData({
        seats: 1,
      });
      setShowSuccess(false);
      setSelectedStation(null);
    }, 2000);
  };

  const canBook = selectedStation && !isProcessing && systemStatus.printerConnected;

  return (
    <div className="min-h-screen bg-gray-50 dark:bg-gray-900 overflow-auto">
      {/* Header with Filters */}
      <div className="sticky top-0 z-10 bg-white dark:bg-gray-800 border-b border-gray-200 dark:border-gray-700 p-4 sm:p-6">
        <div className="max-w-7xl mx-auto">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between mb-4 gap-4">
            <div>
              <h1 className="text-2xl sm:text-3xl font-bold">Book Tickets</h1>
              <p className="text-gray-600 dark:text-gray-400">
                From {currentStation.name} • {filteredStations.length} destinations
              </p>
              
              {/* Printer Status Indicator */}
              <div className="mt-2">
                <div className={`inline-flex items-center space-x-2 px-3 py-1 rounded-lg text-xs font-medium ${
                  systemStatus.printerConnected 
                    ? 'bg-green-100 text-green-700 border border-green-200' 
                    : 'bg-red-100 text-red-700 border border-red-200'
                }`}>
                  {systemStatus.printerConnected ? (
                    <>
                      <Printer className="h-3 w-3" />
                      <span>Printer Ready</span>
                    </>
                  ) : (
                    <>
                      <PrinterIcon className="h-3 w-3" />
                      <span>Printer Unavailable</span>
                    </>
                  )}
                </div>
              </div>
            </div>
            
            {currentStaff && (
              <div className="text-left sm:text-right">
                <p className="font-semibold">{currentStaff.firstName} {currentStaff.lastName}</p>
                <p className="text-sm text-gray-600 dark:text-gray-400">{currentStaff.role}</p>
              </div>
            )}
          </div>
          
          {/* Compact Filters */}
          <div className="flex flex-col sm:flex-row items-start sm:items-center space-y-2 sm:space-y-0 sm:space-x-4">
            <div className="flex flex-col sm:flex-row items-start sm:items-center space-y-2 sm:space-y-0 sm:space-x-2 w-full sm:w-auto">
              <label className="text-sm font-medium whitespace-nowrap">Filter:</label>
              <select 
                className="w-full sm:w-auto px-3 py-2 border rounded-lg bg-white dark:bg-gray-800"
                value={selectedGovernorate} 
                onChange={(e) => handleGovernorateChange(e.target.value)}
              >
                <option value="">All</option>
                {governorates.map(gov => (
                  <option key={gov} value={gov}>{gov}</option>
                ))}
              </select>
            </div>
            
            {selectedGovernorate && (
              <select 
                className="w-full sm:w-auto px-3 py-2 border rounded-lg bg-white dark:bg-gray-800"
                value={selectedDelegation} 
                onChange={(e) => setSelectedDelegation(e.target.value)}
              >
                <option value="">All Delegations</option>
                {delegations.map(del => (
                  <option key={del} value={del}>{del}</option>
                ))}
              </select>
            )}
            
            {(selectedGovernorate || selectedDelegation) && (
              <Button 
                variant="outline" 
                size="sm"
                className="w-full sm:w-auto"
                onClick={() => {
                  setSelectedGovernorate('');
                  setSelectedDelegation('');
                }}
              >
                Clear Filters
              </Button>
            )}
          </div>
        </div>
      </div>

      <div className={`max-w-7xl mx-auto p-4 sm:p-6 ${selectedStation ? 'pb-48 sm:pb-36' : 'pb-6'}`}>
        {/* Stations Grid */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4 mb-6">
          {filteredStations.map((station: Station) => (
            <Card
              key={station.id}
              className={`cursor-pointer transition-all duration-200 hover:shadow-lg hover:scale-105 ${
                selectedStation?.id === station.id 
                  ? 'ring-2 ring-blue-500 bg-blue-50 dark:bg-blue-900/20' 
                  : 'hover:bg-gray-50 dark:hover:bg-gray-700'
              }`}
              onClick={() => handleStationSelect(station)}
            >
              <CardContent className="p-4">
                <div className="space-y-2">
                  <div className="flex items-start justify-between">
                    <h3 className="font-bold text-lg leading-tight">{station.name}</h3>
                    {selectedStation?.id === station.id && (
                      <CheckCircle className="w-5 h-5 text-blue-600 flex-shrink-0" />
                    )}
                  </div>
                  
                  <p className="text-sm text-gray-600 dark:text-gray-400">
                    {station.governorate} • {station.delegation}
                  </p>
                  
                  <div className="flex justify-end">
                    <Button size="sm" variant="outline">
                      Select
                    </Button>
                  </div>
                </div>
              </CardContent>
            </Card>
          ))}
        </div>

        {/* Empty State */}
        {filteredStations.length === 0 && (
          <div className="text-center py-12">
            <MapPin className="w-16 h-16 text-gray-400 mx-auto mb-4" />
            <h3 className="text-xl font-semibold text-gray-600 dark:text-gray-400 mb-2">
              No destinations found
            </h3>
            <p className="text-gray-500">
              Try adjusting your filters to see available destinations
            </p>
          </div>
        )}
      </div>

            {/* Floating Booking Panel */}
      {selectedStation && (
        <div className="fixed bottom-0 left-0 right-0 bg-white dark:bg-gray-800 border-t border-gray-200 dark:border-gray-700 shadow-xl max-h-80 overflow-y-auto">
          <div className="max-w-4xl mx-auto p-4 sm:p-6">
            <div className="flex flex-col sm:flex-row sm:items-center justify-between mb-4 gap-2">
              <div className="flex-1">
                <h2 className="text-lg sm:text-xl font-bold">
                  {currentStation.name} → {selectedStation.name}
                </h2>
                <p className="text-gray-600 dark:text-gray-400">
                  {selectedStation.basePrice?.toFixed(2)} TND per seat
                </p>
              </div>
              
              <Button 
                variant="ghost" 
                size="sm"
                onClick={() => setSelectedStation(null)}
                className="self-end sm:self-center"
              >
                <X className="w-4 h-4" />
              </Button>
            </div>

            {showSuccess ? (
              <div className="text-center py-6 sm:py-8">
                <CheckCircle className="w-12 h-12 text-green-600 mx-auto mb-4" />
                <h3 className="text-lg font-bold text-green-600 mb-2">Booking Successful!</h3>
                <p className="text-gray-600">Tickets generated and ready for printing</p>
              </div>
            ) : (
              <>
                {/* Printer Warning */}
                {!systemStatus.printerConnected && (
                  <div className="mb-4 bg-red-50 border border-red-200 rounded-lg p-3">
                    <div className="flex items-start space-x-2">
                      <AlertTriangle className="h-4 w-4 text-red-600 mt-0.5 flex-shrink-0" />
                      <div className="flex-1">
                        <h3 className="text-sm font-semibold text-red-800">Booking Unavailable</h3>
                        <p className="text-xs text-red-700 mt-1">
                          Printer is not connected. Tickets cannot be issued without a working printer.
                        </p>
                      </div>
                    </div>
                  </div>
                )}
              </>
            )}
            
            {!showSuccess && (
              <div className="flex flex-col sm:grid sm:grid-cols-2 gap-4 sm:gap-6">
                
                {/* Seats Counter */}
                <div className="space-y-3">
                  <label className="block text-sm font-medium">Seats</label>
                  <div className="flex items-center justify-center space-x-3">
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={() => handleSeatsChange(-1)}
                      disabled={bookingData.seats <= 1 || isProcessing}
                    >
                      <Minus className="w-4 h-4" />
                    </Button>
                    
                    <div className="w-16 text-center">
                      <span className="text-2xl font-bold">{bookingData.seats}</span>
                    </div>
                    
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={() => handleSeatsChange(1)}
                      disabled={bookingData.seats >= 8 || isProcessing}
                    >
                      <Plus className="w-4 h-4" />
                    </Button>
                  </div>
                  
                  <div className="text-center">
                    <div className="text-lg font-bold text-blue-600">
                      {calculateTotal().toFixed(2)} TND
                    </div>
                    <div className="text-xs text-gray-500">Total amount</div>
                  </div>
                </div>

                {/* Book Button */}
                <div className="flex items-end">
                  <Button
                    onClick={handleBooking}
                    disabled={!canBook}
                    className={`w-full h-16 sm:h-20 text-base sm:text-lg ${
                      !systemStatus.printerConnected ? 'opacity-50 cursor-not-allowed' : ''
                    }`}
                    size="lg"
                    title={!systemStatus.printerConnected ? 'Printer must be connected to book tickets' : ''}
                  >
                    {isProcessing ? (
                      <>
                        <Loader2 className="w-5 h-5 mr-2 animate-spin" />
                        Processing...
                      </>
                    ) : systemStatus.printerConnected ? (
                      <>
                        <Ticket className="w-5 h-5 mr-2" />
                        Book {bookingData.seats} Ticket{bookingData.seats > 1 ? 's' : ''}
                      </>
                    ) : (
                      <>
                        <PrinterIcon className="w-5 h-5 mr-2" />
                        Booking Unavailable
                      </>
                    )}
                  </Button>
                </div>
              </div>
            )}
          </div>
        </div>
      )}
    </div>
  );
} 