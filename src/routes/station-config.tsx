import { useState } from "react";
import { Button } from "../components/ui/button";
import { Card } from "../components/ui/card";
import { currentStation } from "../data/mockData";
import { 
  MapPin, 
  Clock, 
  Save, 
  Building,
  Settings
} from "lucide-react";

interface StationConfig {
  name: string;
  openingTime: string;
  closingTime: string;
  isOperational: boolean;
}

export default function StationConfiguration() {
  const [config, setConfig] = useState<StationConfig>({
    name: currentStation.name,
    openingTime: "06:00",
    closingTime: "22:00",
    isOperational: true
  });
  const [isEditing, setIsEditing] = useState(false);
  const [isSaving, setIsSaving] = useState(false);
  const [originalConfig, setOriginalConfig] = useState(config);

  const handleEdit = () => {
    setOriginalConfig(config);
    setIsEditing(true);
  };

  const handleCancel = () => {
    setConfig(originalConfig);
    setIsEditing(false);
  };

  const handleSave = async () => {
    setIsSaving(true);
    
    // Simulate API call
    await new Promise(resolve => setTimeout(resolve, 1500));
    
    // TODO: In real app, this would update the station configuration via API
    console.log('Station configuration updated:', config);
    
    setIsEditing(false);
    setIsSaving(false);
  };

  const formatTime = (time: string) => {
    const [hours, minutes] = time.split(':');
    const hour = parseInt(hours);
    const ampm = hour >= 12 ? 'PM' : 'AM';
    const displayHour = hour % 12 || 12;
    return `${displayHour}:${minutes} ${ampm}`;
  };

  const isValidTimeRange = (opening: string, closing: string) => {
    const [openHour, openMin] = opening.split(':').map(Number);
    const [closeHour, closeMin] = closing.split(':').map(Number);
    const openMinutes = openHour * 60 + openMin;
    const closeMinutes = closeHour * 60 + closeMin;
    return openMinutes < closeMinutes;
  };

  const hasChanges = () => {
    return (
      config.name !== originalConfig.name ||
      config.openingTime !== originalConfig.openingTime ||
      config.closingTime !== originalConfig.closingTime ||
      config.isOperational !== originalConfig.isOperational
    );
  };

  return (
    <div className="flex flex-col h-full w-full p-6 space-y-6">
      <div>
        <h1 className="text-3xl font-bold">Station Configuration</h1>
        <p className="text-muted-foreground">Manage station settings and operating hours</p>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Station Information Card */}
        <Card className="p-6">
          <div className="flex items-center justify-between mb-6">
            <div className="flex items-center space-x-3">
              <div className="w-10 h-10 bg-blue-500 rounded-lg flex items-center justify-center">
                <Building className="h-5 w-5 text-white" />
              </div>
              <h2 className="text-xl font-semibold">Station Information</h2>
            </div>
            {!isEditing && (
              <Button onClick={handleEdit} variant="outline" size="sm">
                <Settings className="h-4 w-4 mr-2" />
                Edit
              </Button>
            )}
          </div>

          <div className="space-y-4">
            <div>
              <label className="block text-sm font-medium mb-2">Station Name</label>
              {isEditing ? (
                <input
                  type="text"
                  value={config.name}
                  onChange={(e) => setConfig(prev => ({ ...prev, name: e.target.value }))}
                  className="w-full px-3 py-2 border rounded-lg focus:ring-2 focus:ring-primary focus:border-primary"
                  placeholder="Enter station name"
                />
              ) : (
                <div className="flex items-center space-x-2 p-3 bg-gray-50 rounded-lg">
                  <MapPin className="h-4 w-4 text-muted-foreground" />
                  <span className="font-medium">{config.name}</span>
                </div>
              )}
            </div>

            <div>
              <label className="block text-sm font-medium mb-2">Location Details</label>
              <div className="p-3 bg-gray-50 rounded-lg">
                <div className="text-sm text-muted-foreground">
                  <div>{currentStation.governorate}, {currentStation.delegation}</div>
                  <div className="text-xs mt-1">Tunisia</div>
                </div>
              </div>
            </div>

            <div>
              <label className="block text-sm font-medium mb-2">Operational Status</label>
              {isEditing ? (
                <div className="flex items-center space-x-3">
                  <label className="flex items-center space-x-2">
                    <input
                      type="radio"
                      name="operational"
                      checked={config.isOperational}
                      onChange={() => setConfig(prev => ({ ...prev, isOperational: true }))}
                      className="text-primary focus:ring-primary"
                    />
                    <span className="text-sm">Operational</span>
                  </label>
                  <label className="flex items-center space-x-2">
                    <input
                      type="radio"
                      name="operational"
                      checked={!config.isOperational}
                      onChange={() => setConfig(prev => ({ ...prev, isOperational: false }))}
                      className="text-primary focus:ring-primary"
                    />
                    <span className="text-sm">Closed</span>
                  </label>
                </div>
              ) : (
                <div className="p-3 bg-gray-50 rounded-lg">
                  <span className={`inline-flex items-center px-2 py-1 rounded-full text-xs font-medium ${
                    config.isOperational 
                      ? 'bg-green-100 text-green-700' 
                      : 'bg-red-100 text-red-700'
                  }`}>
                    {config.isOperational ? 'Operational' : 'Closed'}
                  </span>
                </div>
              )}
            </div>
          </div>
        </Card>

        {/* Operating Hours Card */}
        <Card className="p-6">
          <div className="flex items-center space-x-3 mb-6">
            <div className="w-10 h-10 bg-green-500 rounded-lg flex items-center justify-center">
              <Clock className="h-5 w-5 text-white" />
            </div>
            <h2 className="text-xl font-semibold">Operating Hours</h2>
          </div>

          <div className="space-y-4">
            <div>
              <label className="block text-sm font-medium mb-2">Opening Time</label>
              {isEditing ? (
                <input
                  type="time"
                  value={config.openingTime}
                  onChange={(e) => setConfig(prev => ({ ...prev, openingTime: e.target.value }))}
                  className="w-full px-3 py-2 border rounded-lg focus:ring-2 focus:ring-primary focus:border-primary"
                />
              ) : (
                <div className="p-3 bg-gray-50 rounded-lg">
                  <span className="font-medium text-green-600">{formatTime(config.openingTime)}</span>
                </div>
              )}
            </div>

            <div>
              <label className="block text-sm font-medium mb-2">Closing Time</label>
              {isEditing ? (
                <input
                  type="time"
                  value={config.closingTime}
                  onChange={(e) => setConfig(prev => ({ ...prev, closingTime: e.target.value }))}
                  className="w-full px-3 py-2 border rounded-lg focus:ring-2 focus:ring-primary focus:border-primary"
                />
              ) : (
                <div className="p-3 bg-gray-50 rounded-lg">
                  <span className="font-medium text-red-600">{formatTime(config.closingTime)}</span>
                </div>
              )}
            </div>

            {isEditing && !isValidTimeRange(config.openingTime, config.closingTime) && (
              <div className="p-3 bg-red-50 border border-red-200 rounded-lg">
                <p className="text-sm text-red-600">
                  Closing time must be after opening time.
                </p>
              </div>
            )}

            <div>
              <label className="block text-sm font-medium mb-2">Operating Hours</label>
              <div className="p-3 bg-gray-50 rounded-lg">
                <div className="text-sm">
                  <div className="font-medium">
                    {formatTime(config.openingTime)} - {formatTime(config.closingTime)}
                  </div>
                  <div className="text-muted-foreground mt-1">
                    Daily operating schedule
                  </div>
                </div>
              </div>
            </div>
          </div>
        </Card>
      </div>

      {/* Action Buttons */}
      {isEditing && (
        <Card className="p-6">
          <div className="flex items-center justify-between">
            <div className="text-sm text-muted-foreground">
              {hasChanges() ? 'You have unsaved changes' : 'No changes made'}
            </div>
            <div className="flex space-x-3">
              <Button 
                variant="outline" 
                onClick={handleCancel}
                disabled={isSaving}
              >
                Cancel
              </Button>
              <Button 
                onClick={handleSave}
                disabled={isSaving || !hasChanges() || !isValidTimeRange(config.openingTime, config.closingTime)}
                className="min-w-24"
              >
                {isSaving ? (
                  <>
                    <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white mr-2"></div>
                    Saving...
                  </>
                ) : (
                  <>
                    <Save className="h-4 w-4 mr-2" />
                    Save Changes
                  </>
                )}
              </Button>
            </div>
          </div>
        </Card>
      )}

      {/* Current Status Summary */}
      <Card className="p-6 bg-gradient-to-r from-blue-50 to-green-50 border-blue-200">
        <h3 className="text-lg font-semibold mb-4">Current Status</h3>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          <div className="text-center">
            <div className="text-2xl font-bold text-blue-600">{config.name}</div>
            <div className="text-sm text-muted-foreground">Station Name</div>
          </div>
          <div className="text-center">
            <div className="text-2xl font-bold text-green-600">
              {formatTime(config.openingTime)} - {formatTime(config.closingTime)}
            </div>
            <div className="text-sm text-muted-foreground">Operating Hours</div>
          </div>
          <div className="text-center">
            <div className={`text-2xl font-bold ${config.isOperational ? 'text-green-600' : 'text-red-600'}`}>
              {config.isOperational ? 'Open' : 'Closed'}
            </div>
            <div className="text-sm text-muted-foreground">Current Status</div>
          </div>
        </div>
      </Card>
    </div>
  );
} 