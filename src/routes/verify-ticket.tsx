import { useState } from "react";
import { Button } from "../components/ui/button";
import { Card } from "../components/ui/card";
import { mockBookings, mockVehicleQueues, mockVehicles, mockDestinationStations, getStationById } from "../data/mockData";
import { useInit } from "../context/InitProvider";
import { 
  QrCode, 
  Search, 
  CheckCircle, 
  XCircle, 
  User, 
  MapPin, 
  Calendar, 
  Clock,
  Printer,
  PrinterIcon,
  Users,
  Navigation,
  AlertCircle,
  RefreshCw,
  AlertTriangle
} from "lucide-react";

interface TicketInfo {
  booking: any;
  queue: any;
  vehicle: any;
  destinationStation: any;
}

type VerificationStatus = 'success' | 'not_found' | 'already_verified' | 'error';

interface VerificationResult {
  status: VerificationStatus;
  message: string;
}

export default function VerifyTicket() {
  const { systemStatus } = useInit();
  const [verificationCode, setVerificationCode] = useState("");
  const [ticketInfo, setTicketInfo] = useState<TicketInfo | null>(null);
  const [verificationResult, setVerificationResult] = useState<VerificationResult | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  const [isPrinting, setIsPrinting] = useState(false);
  const [verifiedTickets, setVerifiedTickets] = useState<Set<string>>(new Set());

  const handleVerify = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsLoading(true);
    setTicketInfo(null);
    setVerificationResult(null);
    
    // Simulate API call delay
    await new Promise(resolve => setTimeout(resolve, 1000));
    
    // Find booking by verification code
    const booking = mockBookings.find(b => b.verificationCode === verificationCode);
    
    if (!booking) {
      setVerificationResult({
        status: 'not_found',
        message: `Ticket code "${verificationCode}" not found in the system. Please check the code and try again.`
      });
      setIsLoading(false);
      return;
    }

    // Check if ticket is already verified (either in mock data or in our session)
    if (booking.isVerified || verifiedTickets.has(verificationCode)) {
      setVerificationResult({
        status: 'already_verified',
        message: `Ticket "${verificationCode}" has already been verified and printed. Cannot verify again.`
      });
      setIsLoading(false);
      return;
    }

    // Get related queue, vehicle, and destination information
    const queue = mockVehicleQueues.find(q => q.id === booking.queueId);
    const vehicle = queue ? mockVehicles.find(v => v.id === queue.vehicleId) : null;
    const destinationStation = queue ? getStationById(queue.destinationId) : null;

    if (queue && vehicle) {
      setTicketInfo({
        booking,
        queue,
        vehicle,
        destinationStation
      });
      setVerificationResult({
        status: 'success',
        message: 'Ticket verified successfully!'
      });
    } else {
      setVerificationResult({
        status: 'error',
        message: "Ticket data incomplete - missing queue or vehicle information. Please contact support."
      });
    }
    
    setIsLoading(false);
  };

  const handlePrintTicket = async () => {
    if (!ticketInfo) return;
    
    setIsPrinting(true);
    
    if (systemStatus.printerConnected) {
      // Simulate printing process
      await new Promise(resolve => setTimeout(resolve, 2000));
    } else {
      // Simulate manual verification process (shorter delay)
      await new Promise(resolve => setTimeout(resolve, 1000));
    }
    
    // Mark ticket as verified in our session
    setVerifiedTickets(prev => new Set([...prev, ticketInfo.booking.verificationCode]));
    
    // Update ticket info to show as verified
    setTicketInfo({
      ...ticketInfo,
      booking: {
        ...ticketInfo.booking,
        isVerified: true
      }
    });
    
    setIsPrinting(false);
  };

  const resetForm = () => {
    setVerificationCode("");
    setTicketInfo(null);
    setVerificationResult(null);
  };

  const formatTime = (dateString: string) => {
    return new Date(dateString).toLocaleTimeString('en-US', {
      hour: '2-digit',
      minute: '2-digit'
    });
  };

  const getStatusIcon = (status: VerificationStatus) => {
    switch (status) {
      case 'success':
        return <CheckCircle className="h-8 w-8 text-green-500" />;
      case 'not_found':
        return <XCircle className="h-8 w-8 text-red-500" />;
      case 'already_verified':
        return <AlertCircle className="h-8 w-8 text-orange-500" />;
      case 'error':
        return <XCircle className="h-8 w-8 text-red-500" />;
      default:
        return <XCircle className="h-8 w-8 text-red-500" />;
    }
  };

  const getStatusColor = (status: VerificationStatus) => {
    switch (status) {
      case 'success':
        return 'border-green-200 bg-green-50';
      case 'not_found':
        return 'border-red-200 bg-red-50';
      case 'already_verified':
        return 'border-orange-200 bg-orange-50';
      case 'error':
        return 'border-red-200 bg-red-50';
      default:
        return 'border-red-200 bg-red-50';
    }
  };

  const getStatusTextColor = (status: VerificationStatus) => {
    switch (status) {
      case 'success':
        return 'text-green-700';
      case 'not_found':
        return 'text-red-700';
      case 'already_verified':
        return 'text-orange-700';
      case 'error':
        return 'text-red-700';
      default:
        return 'text-red-700';
    }
  };

  const getStatusTitle = (status: VerificationStatus) => {
    switch (status) {
      case 'success':
        return 'Ticket Valid';
      case 'not_found':
        return 'Ticket Not Found';
      case 'already_verified':
        return 'Already Verified';
      case 'error':
        return 'Verification Error';
      default:
        return 'Error';
    }
  };

  return (
    <div className="flex flex-col lg:flex-row h-full w-full p-6 gap-6">
      {/* Left Panel - Verification Form */}
      <div className="flex-1 space-y-6">
        <div>
          <h1 className="text-3xl font-bold">Verify Ticket</h1>
          <p className="text-muted-foreground">Scan QR code or enter verification code to check ticket details</p>
          
          {/* Printer Status Indicator */}
          <div className="mt-4">
            <div className={`inline-flex items-center space-x-2 px-3 py-2 rounded-lg text-sm font-medium ${
              systemStatus.printerConnected 
                ? 'bg-green-100 text-green-700 border border-green-200' 
                : 'bg-yellow-100 text-yellow-700 border border-yellow-200'
            }`}>
              {systemStatus.printerConnected ? (
                <>
                  <Printer className="h-4 w-4" />
                  <span>Thermal Printer Ready</span>
                </>
              ) : (
                <>
                  <PrinterIcon className="h-4 w-4" />
                  <span>Printer Unavailable - Manual Tickets Only</span>
                </>
              )}
            </div>
          </div>
        </div>

        <div className="space-y-6">
          {/* Verification Methods */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <Card className="p-6 text-center space-y-4 hover:shadow-md transition-shadow">
              <QrCode className="h-12 w-12 mx-auto text-primary" />
              <div>
                <h3 className="font-semibold">Scan QR Code</h3>
                <p className="text-sm text-muted-foreground">Use camera to scan ticket QR code</p>
              </div>
              <Button variant="outline" className="w-full" disabled>
                <RefreshCw className="h-4 w-4 mr-2" />
                Open Camera
              </Button>
            </Card>

            <Card className="p-6 text-center space-y-4 hover:shadow-md transition-shadow">
              <Search className="h-12 w-12 mx-auto text-primary" />
              <div>
                <h3 className="font-semibold">Manual Entry</h3>
                <p className="text-sm text-muted-foreground">Enter verification code manually</p>
              </div>
              <p className="text-xs text-muted-foreground">Use form below</p>
            </Card>
          </div>

          {/* Manual Verification Form */}
          <Card className="p-6 hover:shadow-md transition-shadow">
            <h2 className="text-lg font-semibold mb-4">Enter Verification Code</h2>
            
            <form onSubmit={handleVerify} className="space-y-4">
              <div className="space-y-2">
                <label htmlFor="code" className="text-sm font-medium">
                  Verification Code
                </label>
                <div className="relative">
                  <input
                    id="code"
                    type="text"
                    value={verificationCode}
                    onChange={(e) => setVerificationCode(e.target.value.toUpperCase())}
                    placeholder="TN2501A123"
                    className="w-full px-4 py-3 border rounded-lg bg-background font-mono text-lg focus:ring-2 focus:ring-primary focus:border-primary transition-colors"
                    required
                  />
                  {isLoading && (
                    <div className="absolute right-3 top-1/2 transform -translate-y-1/2">
                      <RefreshCw className="h-5 w-5 text-primary animate-spin" />
                    </div>
                  )}
                </div>
                <div className="text-xs text-muted-foreground space-y-1">
                  <p>Demo codes:</p>
                  <div className="flex flex-wrap gap-2">
                    <code className="px-2 py-1 bg-gray-100 rounded text-xs">TN2501A123</code>
                    <code className="px-2 py-1 bg-gray-100 rounded text-xs">TN2501B456</code>
                    <code className="px-2 py-1 bg-gray-100 rounded text-xs">TN2501C789</code>
                    <code className="px-2 py-1 bg-gray-100 rounded text-xs">TN2501D012</code>
                    <code className="px-2 py-1 bg-gray-100 rounded text-xs">TN2501E345</code>
                  </div>
                </div>
              </div>

              <div className="flex space-x-3">
                <Button 
                  type="submit" 
                  disabled={isLoading || !verificationCode}
                  className="flex-1 h-12 text-lg font-semibold"
                >
                  {isLoading ? (
                    <>
                      <RefreshCw className="h-5 w-5 mr-2 animate-spin" />
                      Verifying...
                    </>
                  ) : (
                    "Verify Ticket"
                  )}
                </Button>
                <Button 
                  type="button" 
                  variant="outline" 
                  onClick={resetForm} 
                  className="h-12 px-6"
                  disabled={isLoading}
                >
                  Clear
                </Button>
              </div>
            </form>
          </Card>

          {/* Verification Status */}
          {verificationResult && verificationResult.status !== 'success' && (
            <Card className={`p-6 ${getStatusColor(verificationResult.status)} animate-in slide-in-from-left-5 duration-300`}>
              <div className="flex items-start space-x-3">
                {getStatusIcon(verificationResult.status)}
                <div className="flex-1">
                  <h3 className={`text-lg font-semibold ${getStatusTextColor(verificationResult.status)}`}>
                    {getStatusTitle(verificationResult.status)}
                  </h3>
                  <p className={`text-sm mt-1 ${getStatusTextColor(verificationResult.status)}`}>
                    {verificationResult.message}
                  </p>
                  {verificationResult.status === 'not_found' && (
                    <div className="mt-3 p-3 bg-white rounded-lg border">
                      <p className="text-xs text-muted-foreground">
                        <strong>Tips:</strong> Make sure the code is entered correctly. 
                        Codes are case-sensitive and should be exactly as shown on the ticket.
                      </p>
                    </div>
                  )}
                </div>
              </div>
            </Card>
          )}
        </div>
      </div>

      {/* Right Panel - Ticket Information */}
      {ticketInfo && verificationResult?.status === 'success' && (
        <div className="flex-1 space-y-6 animate-in slide-in-from-right-5 duration-500">
          {/* Ticket Header */}
          <Card className="p-6 bg-gradient-to-r from-green-50 to-blue-50 border-green-200 shadow-lg">
            <div className="flex items-center justify-between mb-4">
              <div className="flex items-center space-x-3">
                <CheckCircle className="h-8 w-8 text-green-500" />
                <div>
                  <h2 className="text-xl font-bold text-green-700">Valid Ticket</h2>
                  <p className="text-sm text-green-600">Code: {ticketInfo.booking.verificationCode}</p>
                </div>
              </div>
              <span className={`px-3 py-1 rounded-full text-sm font-medium ${
                ticketInfo.booking.isVerified || verifiedTickets.has(ticketInfo.booking.verificationCode)
                  ? 'bg-green-100 text-green-700' 
                  : 'bg-yellow-100 text-yellow-700'
              }`}>
                {ticketInfo.booking.isVerified || verifiedTickets.has(ticketInfo.booking.verificationCode) ? 'Verified' : 'Pending Verification'}
              </span>
            </div>
          </Card>

          {/* Essential Ticket Information */}
          <Card className="p-8 shadow-lg">
            <div className="space-y-6">
              {/* Passenger Name */}
              <div className="text-center border-b pb-4">
                <div className="flex items-center justify-center space-x-2 mb-2">
                  <User className="h-6 w-6 text-primary" />
                  <span className="text-lg font-medium text-muted-foreground">Passenger</span>
                </div>
                <h3 className="text-3xl font-bold animate-in fade-in-50 duration-300">{ticketInfo.booking.customerName}</h3>
              </div>

              {/* Seats */}
              <div className="text-center border-b pb-4">
                <div className="flex items-center justify-center space-x-2 mb-2">
                  <Users className="h-6 w-6 text-primary" />
                  <span className="text-lg font-medium text-muted-foreground">Seats Booked</span>
                </div>
                <h3 className="text-4xl font-bold text-blue-600 animate-in zoom-in-50 duration-300">{ticketInfo.booking.seatsBooked}</h3>
              </div>

              {/* Destination */}
              <div className="text-center border-b pb-4">
                <div className="flex items-center justify-center space-x-2 mb-2">
                  <Navigation className="h-6 w-6 text-primary" />
                  <span className="text-lg font-medium text-muted-foreground">Destination</span>
                </div>
                <h3 className="text-2xl font-bold text-green-600 animate-in slide-in-from-bottom-3 duration-300">{ticketInfo.queue.destinationName}</h3>
                {ticketInfo.destinationStation && (
                  <p className="text-sm text-muted-foreground mt-1">
                    {ticketInfo.destinationStation.governorate}
                  </p>
                )}
              </div>

              {/* Departure Time */}
              {ticketInfo.queue.estimatedDeparture && (
                <div className="text-center border-b pb-4">
                  <div className="flex items-center justify-center space-x-2 mb-2">
                    <Clock className="h-6 w-6 text-primary" />
                    <span className="text-lg font-medium text-muted-foreground">Departure Time</span>
                  </div>
                  <h3 className="text-2xl font-bold text-orange-600 animate-in slide-in-from-bottom-3 duration-300">{formatTime(ticketInfo.queue.estimatedDeparture)}</h3>
                </div>
              )}

              {/* Total Amount */}
              <div className="text-center">
                <div className="flex items-center justify-center space-x-2 mb-2">
                  <span className="text-lg font-medium text-muted-foreground">Total Amount</span>
                </div>
                <h3 className="text-2xl font-bold text-purple-600 animate-in slide-in-from-bottom-3 duration-300">{ticketInfo.booking.totalAmount} TND</h3>
              </div>
            </div>
          </Card>

          {/* Printer Status Warning */}
          {!systemStatus.printerConnected && (
            <Card className="p-4 bg-yellow-50 border-yellow-200 shadow-sm">
              <div className="flex items-start space-x-3">
                <AlertTriangle className="h-5 w-5 text-yellow-600 mt-0.5" />
                <div className="flex-1">
                  <h3 className="text-sm font-semibold text-yellow-800">Printer Not Available</h3>
                  <p className="text-xs text-yellow-700 mt-1">
                    The thermal printer is not connected. You can still mark the ticket as verified, but you'll need to issue a manual ticket or stamp.
                  </p>
                </div>
                <PrinterIcon className="h-5 w-5 text-yellow-600" />
              </div>
            </Card>
          )}

          {/* Action Buttons */}
          <div className="space-y-3">
            {!(ticketInfo.booking.isVerified || verifiedTickets.has(ticketInfo.booking.verificationCode)) && (
              <div className="space-y-2">
                <Button 
                  onClick={handlePrintTicket}
                  disabled={isPrinting || !systemStatus.printerConnected}
                  className={`w-full h-12 text-lg font-semibold shadow-lg hover:shadow-xl transition-shadow ${
                    !systemStatus.printerConnected ? 'opacity-50 cursor-not-allowed' : ''
                  }`}
                  title={!systemStatus.printerConnected ? 'Printer not connected - cannot print tickets' : ''}
                >
                  {isPrinting ? (
                    <>
                      <RefreshCw className="h-5 w-5 mr-2 animate-spin" />
                      Printing Ticket...
                    </>
                  ) : (
                    <>
                      <Printer className="h-5 w-5 mr-2" />
                      {systemStatus.printerConnected ? 'Print Ticket & Mark Verified' : 'Print Ticket (Printer Unavailable)'}
                    </>
                  )}
                </Button>
                
                {!systemStatus.printerConnected && (
                  <Button 
                    onClick={handlePrintTicket}
                    variant="outline"
                    disabled={isPrinting}
                    className="w-full h-12 text-lg font-semibold border-yellow-300 text-yellow-700 hover:bg-yellow-50"
                  >
                    {isPrinting ? (
                      <>
                        <RefreshCw className="h-5 w-5 mr-2 animate-spin" />
                        Marking as Verified...
                      </>
                    ) : (
                      <>
                        <CheckCircle className="h-5 w-5 mr-2" />
                        Mark as Verified (Manual Ticket)
                      </>
                    )}
                  </Button>
                )}
              </div>
            )}
            
            {(ticketInfo.booking.isVerified || verifiedTickets.has(ticketInfo.booking.verificationCode)) && (
              <div className="bg-green-50 border border-green-200 rounded-lg p-4 text-center">
                <CheckCircle className="h-8 w-8 text-green-500 mx-auto mb-2" />
                <p className="text-green-700 font-medium">
                  This ticket has been verified{systemStatus.printerConnected ? ' and printed' : ''}
                </p>
                <p className="text-sm text-green-600 mt-1">
                  {systemStatus.printerConnected 
                    ? 'No further action required' 
                    : 'Manual ticket or stamp has been issued'}
                </p>
                {!systemStatus.printerConnected && (
                  <div className="mt-2 p-2 bg-yellow-50 border border-yellow-200 rounded text-xs text-yellow-700">
                    <AlertTriangle className="h-3 w-3 inline mr-1" />
                    Remember to issue a manual ticket or apply verification stamp
                  </div>
                )}
              </div>
            )}

            <Button 
              onClick={resetForm}
              variant="outline"
              className="w-full h-12 text-lg font-semibold"
            >
              Verify Another Ticket
            </Button>
          </div>
        </div>
      )}
    </div>
  );
} 