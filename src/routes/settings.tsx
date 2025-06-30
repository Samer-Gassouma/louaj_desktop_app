import { useSettingsContext } from "../context/SettingsProvider";
import { Button } from "../components/ui/button";
import { SystemStatus } from "../components/SystemStatus";
import { Moon, Sun } from "lucide-react";

export default function Settings() {
  const { setTheme, theme: currentTheme } = useSettingsContext();

  const toggleTheme = () => {
    setTheme(currentTheme === "light" ? "dark" : "light");
  };

  return (
    <div className="flex flex-col h-full w-full p-6 space-y-6">
      <div className="space-y-2">
        <h1 className="text-2xl font-bold">Settings</h1>
        <p className="text-muted-foreground">
          Customize your station interface preferences.
        </p>
      </div>

      <div className="space-y-4">
        <div className="space-y-2">
          <h2 className="text-lg font-semibold">Appearance</h2>
          <div className="flex items-center space-x-3">
            <Button
              variant="outline"
              size="sm"
              onClick={toggleTheme}
              className="w-24"
            >
              {currentTheme === "light" ? (
                <>
                  <Sun className="h-4 w-4 mr-2" />
                  Light
                </>
              ) : (
                <>
                  <Moon className="h-4 w-4 mr-2" />
                  Dark
                </>
              )}
            </Button>
            <span className="text-sm text-muted-foreground">
              Current theme: {currentTheme}
            </span>
          </div>
        </div>
      </div>

      <SystemStatus />
    </div>
  );
}
