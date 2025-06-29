import React from 'react';
import { Card, CardContent, CardHeader, CardTitle } from './ui/card';
import { Badge } from './ui/badge';
import { Button } from './ui/button';
import { 
  Wifi, 
  WifiOff, 
  User, 
  UserX, 
  Printer, 
  PrinterIcon, 
  Download, 
  CheckCircle, 
  XCircle, 
  AlertTriangle,
  RefreshCw
} from 'lucide-react';
import { useInit } from '../context/InitProvider';

interface StatusItemProps {
  title: string;
  status: boolean;
  connectedText: string;
  disconnectedText: string;
  ConnectedIcon: React.ComponentType<{ className?: string }>;
  DisconnectedIcon: React.ComponentType<{ className?: string }>;
  canRetry?: boolean;
  onRetry?: () => void;
}

const StatusItem: React.FC<StatusItemProps> = ({
  title,
  status,
  connectedText,
  disconnectedText,
  ConnectedIcon,
  DisconnectedIcon,
  canRetry = false,
  onRetry
}) => {
  return (
    <div className="flex items-center justify-between p-3 rounded-lg border">
      <div className="flex items-center space-x-3">
        <div className="flex-shrink-0">
          {status ? (
            <ConnectedIcon className="w-5 h-5 text-green-500" />
          ) : (
            <DisconnectedIcon className="w-5 h-5 text-red-500" />
          )}
        </div>
        <div>
          <div className="text-sm font-medium">{title}</div>
          <div className="text-xs text-muted-foreground">
            {status ? connectedText : disconnectedText}
          </div>
        </div>
      </div>
      <div className="flex items-center space-x-2">
        <Badge variant={status ? "default" : "destructive"}>
          {status ? "Connected" : "Disconnected"}
        </Badge>
        {canRetry && !status && (
          <Button size="sm" variant="outline" onClick={onRetry}>
            <RefreshCw className="w-4 h-4" />
          </Button>
        )}
      </div>
    </div>
  );
};

export const SystemStatus: React.FC = () => {
  const { systemStatus, resetInitialization } = useInit();

  const handleRetryInitialization = () => {
    resetInitialization();
    // This will trigger the app to re-run the initialization process
    window.location.reload();
  };

  const handleRetryPrinter = () => {
    // In a real app, this would attempt to reconnect to the printer
    console.log('Attempting to reconnect to printer...');
  };

  const handleCheckUpdates = () => {
    // In a real app, this would check for app updates
    console.log('Checking for app updates...');
  };

  const overallHealth = Object.values(systemStatus).every(status => status);

  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center space-x-2">
          {overallHealth ? (
            <CheckCircle className="w-5 h-5 text-green-500" />
          ) : (
            <AlertTriangle className="w-5 h-5 text-yellow-500" />
          )}
          <span>System Status</span>
        </CardTitle>
      </CardHeader>
      <CardContent className="space-y-4">
        <StatusItem
          title="Network Connection"
          status={systemStatus.networkConnected}
          connectedText="Connected to local server (192.168.1.100)"
          disconnectedText="Cannot reach local server"
          ConnectedIcon={Wifi}
          DisconnectedIcon={WifiOff}
          canRetry={true}
          onRetry={handleRetryInitialization}
        />
        
        <StatusItem
          title="User Authentication"
          status={systemStatus.authValid}
          connectedText="User session is active and valid"
          disconnectedText="Authentication required"
          ConnectedIcon={User}
          DisconnectedIcon={UserX}
        />
        
        <StatusItem
          title="Ticket Printer"
          status={systemStatus.printerConnected}
          connectedText="Thermal printer ready (USB001)"
          disconnectedText="Printer not detected - manual tickets only"
          ConnectedIcon={Printer}
          DisconnectedIcon={PrinterIcon}
          canRetry={true}
          onRetry={handleRetryPrinter}
        />
        
        <StatusItem
          title="App Updates"
          status={systemStatus.appUpToDate}
          connectedText="App is up to date (v2.1.2)"
          disconnectedText="Update available (v2.1.3)"
          ConnectedIcon={CheckCircle}
          DisconnectedIcon={Download}
          canRetry={true}
          onRetry={handleCheckUpdates}
        />

        {!overallHealth && (
          <div className="pt-4 border-t">
            <Button 
              onClick={handleRetryInitialization}
              className="w-full"
              variant="outline"
            >
              <RefreshCw className="w-4 h-4 mr-2" />
              Restart System Check
            </Button>
          </div>
        )}
      </CardContent>
    </Card>
  );
}; 