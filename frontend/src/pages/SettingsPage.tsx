import { useState, useCallback } from 'react';
import { useNavigate } from 'react-router-dom';
import { Button } from '@/components/ui/button';
import Header from '@/components/Header';
import { Switch } from '@/components/ui/switch';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Card, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { 
  Compass as CompassIcon, 
  Mic as MicIcon, 
  Globe as GlobeIcon,
  Volume2 as VolumeIcon,
  ChevronLeft
} from 'lucide-react';

interface SettingsPageProps {
  onGoBack: () => void;
}

export default function SettingsPage({ onGoBack }: SettingsPageProps) {
  const navigate = useNavigate();
  const [settings, setSettings] = useState({
    language: 'fr',
    units: 'metric',
    enableSound: true,
    enableVibration: true,
    autoSelectClosest: true,
    maxSearchRadius: '1000',
  });

  const handleGoBack = useCallback(() => {
    navigate(-1);
  }, [navigate]);

  const handleLanguageChange = useCallback((value: string) => {
    setSettings(prev => ({ ...prev, language: value }));
  }, []);

  const handleUnitsChange = useCallback((value: string) => {
    setSettings(prev => ({ ...prev, units: value }));
  }, []);

  const toggleSetting = useCallback((key: keyof typeof settings) => {
    setSettings(prev => ({
      ...prev,
      [key]: !prev[key],
    }));
  }, []);

  const handleRadiusChange = useCallback((value: string) => {
    setSettings(prev => ({ ...prev, maxSearchRadius: value }));
  }, []);

  return (
    <div className="min-h-screen bg-gradient-to-br from-[#667eea] to-[#764ba2] ios-safe-area-top">
      <Header
        title="⚙️ Settings"
        rightContent={
          <Button variant="ghost" size="icon" onClick={handleGoBack}>
            <ChevronLeft className="w-6 h-6" />
          </Button>
        }
      />

      <main className="px-4 py-6">
        <div className="space-y-6">
          {/* Voice Settings */}
          <Card className="bg-white/90 backdrop-blur-sm border-border">
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <MicIcon className="w-5 h-5 text-purple-600" />
                Voice Input
              </CardTitle>
              <CardDescription>
                Configure voice recognition settings
              </CardDescription>
            </CardHeader>
            
            <div className="px-6 pb-6 space-y-4">
              <div className="space-y-2">
                <Label htmlFor="language" className="font-medium">
                  Language
                </Label>
                <Select value={settings.language} onValueChange={handleLanguageChange}>
                  <SelectTrigger className="w-full bg-white">
                    <SelectValue placeholder="Select language" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="fr">Français (French)</SelectItem>
                    <SelectItem value="en">English</SelectItem>
                    <SelectItem value="es">Español (Spanish)</SelectItem>
                    <SelectItem value="de">Deutsch (German)</SelectItem>
                    <SelectItem value="it">Italiano (Italian)</SelectItem>
                  </SelectContent>
                </Select>
              </div>

              <div className="flex items-center justify-between">
                <div className="space-y-1">
                  <Label htmlFor="sound" className="font-medium">
                    Enable Sound Effects
                  </Label>
                  <CardDescription>
                    Play sounds for voice recording
                  </CardDescription>
                </div>
                <Switch
                  id="sound"
                  checked={settings.enableSound}
                  onCheckedChange={() => toggleSetting('enableSound')}
                />
              </div>

              <div className="flex items-center justify-between">
                <div className="space-y-1">
                  <Label htmlFor="vibration" className="font-medium">
                    Enable Vibration
                  </Label>
                  <CardDescription>
                    Vibrate on voice input
                  </CardDescription>
                </div>
                <Switch
                  id="vibration"
                  checked={settings.enableVibration}
                  onCheckedChange={() => toggleSetting('enableVibration')}
                />
              </div>
            </div>
          </Card>

          {/* Display Settings */}
          <Card className="bg-white/90 backdrop-blur-sm border-border">
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <GlobeIcon className="w-5 h-5 text-purple-600" />
                Display
              </CardTitle>
              <CardDescription>
                Configure display preferences
              </CardDescription>
            </CardHeader>
            
            <div className="px-6 pb-6 space-y-4">
              <div className="space-y-2">
                <Label htmlFor="units" className="font-medium">
                  Distance Units
                </Label>
                <Select value={settings.units} onValueChange={handleUnitsChange}>
                  <SelectTrigger className="w-full bg-white">
                    <SelectValue placeholder="Select units" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="metric">Metric (meters, km)</SelectItem>
                    <SelectItem value="imperial">Imperial (feet, miles)</SelectItem>
                  </SelectContent>
                </Select>
              </div>

              <div className="space-y-2">
                <Label htmlFor="radius" className="font-medium">
                  Search Radius
                </Label>
                <Select value={settings.maxSearchRadius} onValueChange={handleRadiusChange}>
                  <SelectTrigger className="w-full bg-white">
                    <SelectValue placeholder="Select radius" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="500">500 meters</SelectItem>
                    <SelectItem value="1000">1 km</SelectItem>
                    <SelectItem value="2000">2 km</SelectItem>
                    <SelectItem value="5000">5 km</SelectItem>
                  </SelectContent>
                </Select>
              </div>
            </div>
          </Card>

          {/* Navigation Settings */}
          <Card className="bg-white/90 backdrop-blur-sm border-border">
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <CompassIcon className="w-5 h-5 text-purple-600" />
                Navigation
              </CardTitle>
              <CardDescription>
                Configure navigation behavior
              </CardDescription>
            </CardHeader>
            
            <div className="px-6 pb-6 space-y-4">
              <div className="flex items-center justify-between">
                <div className="space-y-1">
                  <Label htmlFor="auto-select" className="font-medium">
                    Auto-select Closest Station
                  </Label>
                  <CardDescription>
                    Automatically select the closest station with available docks
                  </CardDescription>
                </div>
                <Switch
                  id="auto-select"
                  checked={settings.autoSelectClosest}
                  onCheckedChange={() => toggleSetting('autoSelectClosest')}
                />
              </div>
            </div>
          </Card>

          {/* About Section */}
          <Card className="bg-white/90 backdrop-blur-sm border-border">
            <CardHeader>
              <CardTitle>About</CardTitle>
              <CardDescription>
                Velib Parking Guide v1.0.0
              </CardDescription>
            </CardHeader>
            <div className="px-6 pb-6 space-y-2">
              <p className="text-sm text-muted-foreground">
                A web app for iPhone that helps you find the closest Velib dock 
                with available parking spots in Paris.
              </p>
              <p className="text-sm text-muted-foreground">
                Uses Mistral Vox for voice-to-text and Mistral LLM for destination extraction.
              </p>
              <div className="pt-4">
                <Button variant="outline" size="sm" onClick={() => window.open('https://github.com', '_blank')}>
                  View Source on GitHub
                </Button>
              </div>
            </div>
          </Card>
        </div>
      </main>
    </div>
  );
}

// Import the components we're using
import { apiClient } from '@/api/client';
import { useVoiceInput } from '@/hooks/useVoiceInput';