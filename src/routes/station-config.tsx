import { useState } from "react";
import { Button } from "../components/ui/button";
import { Card } from "../components/ui/card";
import { currentStation } from "../data/mockData";
import { MapPin, Clock, Save, Building, Settings } from "lucide-react";

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
    isOperational: true,
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
    await new Promise((r) => setTimeout(r, 1500));
    console.log("Station configuration updated:", config);
    setIsEditing(false);
    setIsSaving(false);
  };

  const formatTime = (time: string) => {
    const [hours, minutes] = time.split(":");
    const hour = parseInt(hours);
    const ampm = hour >= 12 ? "PM" : "AM";
    const displayHour = hour % 12 || 12;
    return `${displayHour}:${minutes} ${ampm}`;
  };

  const isValidTimeRange = (o: string, c: string) => {
    const [oh, om] = o.split(":").map(Number);
    const [ch, cm] = c.split(":").map(Number);
    return oh * 60 + om < ch * 60 + cm;
  };

  const hasChanges = () =>
    config.name !== originalConfig.name ||
    config.openingTime !== originalConfig.openingTime ||
    config.closingTime !== originalConfig.closingTime ||
    config.isOperational !== originalConfig.isOperational;

  return (
    <div className="flex flex-col h-full w-full p-6 space-y-6">
      <div>
        <h1 className="text-3xl font-bold text-[hsl(var(--foreground))]">
          Station Configuration
        </h1>
        <p className="text-[hsl(var(--muted-foreground))]">
          Manage station settings and operating hours
        </p>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Station Information */}
        <Card className="p-6 bg-[hsl(var(--card))] border-[hsl(var(--border))]">
          <div className="flex items-center justify-between mb-6">
            <div className="flex items-center space-x-3">
              <div
                className="w-10 h-10 rounded-lg flex items-center justify-center"
                style={{ backgroundColor: "hsl(var(--primary))" }}
              >
                <Building className="h-5 w-5 text-white" />
              </div>
              <h2 className="text-xl font-semibold text-[hsl(var(--foreground))]">
                Station Information
              </h2>
            </div>
            {!isEditing && (
              <Button
                onClick={handleEdit}
                variant="outline"
                size="sm"
                className="border-[hsl(var(--accent))] text-[hsl(var(--accent))] hover:bg-[hsl(var(--accent))]/10"
              >
                <Settings className="h-4 w-4 mr-2" />
                Edit
              </Button>
            )}
          </div>

          <div className="space-y-4">
            {/* Name */}
            <div>
              <label className="block text-sm font-medium mb-2 text-[hsl(var(--foreground))]">
                Station Name
              </label>
              {isEditing ? (
                <input
                  type="text"
                  value={config.name}
                  onChange={(e) =>
                    setConfig((p) => ({ ...p, name: e.target.value }))
                  }
                  className="w-full px-3 py-2 border border-[hsl(var(--border))] rounded-lg focus:ring-2 focus:ring-[hsl(var(--ring))] focus:border-[hsl(var(--ring))] bg-[hsl(var(--input))] text-[hsl(var(--foreground))]"
                />
              ) : (
                <div className="flex items-center space-x-2 p-3 bg-[hsl(var(--muted))] rounded-lg">
                  <MapPin className="h-4 w-4 text-[hsl(var(--muted-foreground))]" />
                  <span className="font-medium text-[hsl(var(--foreground))]">
                    {config.name}
                  </span>
                </div>
              )}
            </div>

            {/* Location */}
            <div>
              <label className="block text-sm font-medium mb-2 text-[hsl(var(--foreground))]">
                Location Details
              </label>
              <div className="p-3 bg-[hsl(var(--muted))] rounded-lg">
                <div className="text-sm text-[hsl(var(--muted-foreground))]">
                  <div>
                    {currentStation.governorate},{" "}
                    {currentStation.delegation}
                  </div>
                  <div className="text-xs mt-1">Tunisia</div>
                </div>
              </div>
            </div>

            {/* Status */}
            <div>
              <label className="block text-sm font-medium mb-2 text-[hsl(var(--foreground))]">
                Operational Status
              </label>
              {isEditing ? (
                <div className="flex items-center space-x-3">
                  <label className="flex items-center space-x-2">
                    <input
                      type="radio"
                      name="operational"
                      checked={config.isOperational}
                      onChange={() =>
                        setConfig((p) => ({ ...p, isOperational: true }))
                      }
                      className="text-[hsl(var(--primary))] focus:ring-[hsl(var(--ring))]"
                    />
                    <span className="text-sm text-[hsl(var(--foreground))]">
                      Operational
                    </span>
                  </label>
                  <label className="flex items-center space-x-2">
                    <input
                      type="radio"
                      name="operational"
                      checked={!config.isOperational}
                      onChange={() =>
                        setConfig((p) => ({ ...p, isOperational: false }))
                      }
                      className="text-[hsl(var(--destructive))] focus:ring-[hsl(var(--ring))]"
                    />
                    <span className="text-sm text-[hsl(var(--foreground))]">
                      Closed
                    </span>
                  </label>
                </div>
              ) : (
                <div className="p-3 bg-[hsl(var(--muted))] rounded-lg">
                  <span
                    className={`inline-flex items-center px-2 py-1 rounded-full text-xs font-medium ${config.isOperational
                      ? "bg-[hsl(var(--primary))] text-white"
                      : "bg-[hsl(var(--destructive))] text-white"
                      }`}
                  >
                    {config.isOperational ? "Operational" : "Closed"}
                  </span>
                </div>
              )}
            </div>
          </div>
        </Card>

        {/* Operating Hours */}
        <Card className="p-6 bg-[hsl(var(--card))] border-[hsl(var(--border))]">
          <div className="flex items-center space-x-3 mb-6">
            <div
              className="w-10 h-10 rounded-lg flex items-center justify-center"
              style={{ backgroundColor: "hsl(var(--accent))" }}
            >
              <Clock className="h-5 w-5 text-white" />
            </div>
            <h2 className="text-xl font-semibold text-[hsl(var(--foreground))]">
              Operating Hours
            </h2>
          </div>

          <div className="space-y-4">
            {/* Opening */}
            <div>
              <label className="block text-sm font-medium mb-2 text-[hsl(var(--foreground))]">
                Opening Time
              </label>
              {isEditing ? (
                <input
                  type="time"
                  value={config.openingTime}
                  onChange={(e) =>
                    setConfig((p) => ({
                      ...p,
                      openingTime: e.target.value,
                    }))
                  }
                  className="w-full px-3 py-2 border border-[hsl(var(--border))] rounded-lg focus:ring-2 focus:ring-[hsl(var(--ring))] focus:border-[hsl(var(--ring))] bg-[hsl(var(--input))] text-[hsl(var(--foreground))]"
                />
              ) : (
                <div className="p-3 bg-[hsl(var(--muted))] rounded-lg">
                  <span className="font-medium text-[hsl(var(--primary))]">
                    {formatTime(config.openingTime)}
                  </span>
                </div>
              )}
            </div>

            {/* Closing */}
            <div>
              <label className="block text-sm font-medium mb-2 text-[hsl(var(--foreground))]">
                Closing Time
              </label>
              {isEditing ? (
                <input
                  type="time"
                  value={config.closingTime}
                  onChange={(e) =>
                    setConfig((p) => ({
                      ...p,
                      closingTime: e.target.value,
                    }))
                  }
                  className="w-full px-3 py-2 border border-[hsl(var(--border))] rounded-lg focus:ring-2 focus:ring-[hsl(var(--ring))] focus:border-[hsl(var(--ring))] bg-[hsl(var(--input))] text-[hsl(var(--foreground))]"
                />
              ) : (
                <div className="p-3 bg-[hsl(var(--muted))] rounded-lg">
                  <span className="font-medium text-[hsl(var(--primary))]">
                    {formatTime(config.closingTime)}
                  </span>
                </div>
              )}
            </div>

            {/* Validation */}
            {isEditing && !isValidTimeRange(config.openingTime, config.closingTime) && (
              <div className="p-3 bg-[hsl(var(--destructive))]/10 border border-[hsl(var(--destructive))] rounded-lg">
                <p className="text-sm text-[hsl(var(--destructive))]">
                  Closing time must be after opening time.
                </p>
              </div>
            )}

            {/* Summary */}
            <div>
              <label className="block text-sm font-medium mb-2 text-[hsl(var(--foreground))]">
                Operating Hours
              </label>
              <div className="p-3 bg-[hsl(var(--muted))] rounded-lg">
                <div className="text-sm text-[hsl(var(--foreground))]">
                  <div className="font-medium">
                    {formatTime(config.openingTime)} - {formatTime(config.closingTime)}
                  </div>
                  <div className="text-[hsl(var(--muted-foreground))] mt-1">
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
        <Card className="p-6 bg-[hsl(var(--card))] border-[hsl(var(--border))]">
          <div className="flex items-center justify-between">
            <div className="text-sm text-[hsl(var(--muted-foreground))]">
              {hasChanges() ? "You have unsaved changes" : "No changes made"}
            </div>
            <div className="flex space-x-3">
              <Button
                variant="outline"
                onClick={handleCancel}
                disabled={isSaving}
                className="border-[hsl(var(--destructive))] text-[hsl(var(--destructive))] hover:bg-[hsl(var(--destructive))]/10"
              >
                Cancel
              </Button>
              <Button
                onClick={handleSave}
                disabled={
                  isSaving || !hasChanges() || !isValidTimeRange(config.openingTime, config.closingTime)
                }
                className="min-w-24 bg-[hsl(var(--primary))] text-white hover:bg-[hsl(var(--primary))]/90"
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
      <Card
        className="
          p-6
          bg-gradient-to-r
          from-[hsl(var(--secondary))]
          to-[hsl(var(--accent))]
          border-[hsl(var(--secondary))]
        "
      >
        <h3 className="text-lg font-semibold mb-4 text-[hsl(var(--foreground))]">
          Current Status
        </h3>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          <div className="text-center">
            <div className="text-2xl font-bold text-[hsl(var(--primary))]">
              {config.name}
            </div>
            <div className="text-sm text-[hsl(var(--muted-foreground))]">
              Station Name
            </div>
          </div>
          <div className="text-center">
            <div className="text-2xl font-bold text-[hsl(var(--primary))]">
              {formatTime(config.openingTime)} – {formatTime(config.closingTime)}
            </div>
            <div className="text-sm text-[hsl(var(--muted-foreground))]">
              Operating Hours
            </div>
          </div>
          <div className="text-center">
            <div
              className={`text-2xl font-bold ${config.isOperational
                ? "text-[hsl(var(--primary1))]"
                : "text-[hsl(var(--destructive))]"
                }`}
            >
              {config.isOperational ? "Open" : "Closed"}
            </div>
            <div className="text-sm text-[hsl(var(--muted-foreground))]">
              Current Status
            </div>
          </div>
        </div>
      </Card>
    </div>
  );
}
