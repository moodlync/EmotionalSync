import { useState } from 'react';
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { PremiumUpgradeButton } from "@/components/ui/premium-upgrade-button";
import { Switch } from "@/components/ui/switch";
import { Slider } from "@/components/ui/slider";
import { Badge } from "@/components/ui/badge";
import { Label } from "@/components/ui/label";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { 
  HomeIcon, Lightbulb, Music, Thermometer, Wind, 
  Lock, AlertCircle, Check, Power, Palette, RefreshCw, Plus
} from "lucide-react";
import { useToast } from '@/hooks/use-toast';
import { EmotionType, emotions } from '@/lib/emotions';

// Device types
type DeviceType = 'lights' | 'music' | 'thermostat' | 'aromatherapy' | 'lock';

interface SmartDevice {
  id: string;
  name: string;
  type: DeviceType;
  connected: boolean;
  status: {
    power: boolean;
    brightness?: number;
    color?: string;
    temperature?: number;
    volume?: number;
    scent?: string;
    locked?: boolean;
  };
}

// Mock smart home devices
const mockDevices: SmartDevice[] = [
  {
    id: 'light-1',
    name: 'Bedroom Lights',
    type: 'lights',
    connected: true,
    status: {
      power: true,
      brightness: 70,
      color: '#FFFFFF'
    }
  },
  {
    id: 'light-2',
    name: 'Living Room Lights',
    type: 'lights',
    connected: true,
    status: {
      power: false,
      brightness: 50,
      color: '#FFF4E0'
    }
  },
  {
    id: 'speaker-1',
    name: 'Living Room Speaker',
    type: 'music',
    connected: true,
    status: {
      power: false,
      volume: 40
    }
  },
  {
    id: 'thermostat-1',
    name: 'Home Thermostat',
    type: 'thermostat',
    connected: false,
    status: {
      power: false,
      temperature: 72
    }
  },
  {
    id: 'aroma-1',
    name: 'Bedroom Diffuser',
    type: 'aromatherapy',
    connected: true,
    status: {
      power: true,
      scent: 'Lavender'
    }
  },
  {
    id: 'lock-1',
    name: 'Front Door',
    type: 'lock',
    connected: false,
    status: {
      power: true,
      locked: true
    }
  }
];

// Emotion-based presets
const emotionPresets = {
  happy: {
    name: 'Bright & Energetic',
    lights: { color: '#FFEB3B', brightness: 100 },
    music: 'Upbeat Playlist',
    thermostat: 72,
    aromatherapy: 'Citrus'
  },
  sad: {
    name: 'Calm & Soothing',
    lights: { color: '#64B5F6', brightness: 40 },
    music: 'Relaxing Acoustics',
    thermostat: 74,
    aromatherapy: 'Lavender'
  },
  angry: {
    name: 'Cool & Calming',
    lights: { color: '#80DEEA', brightness: 60 },
    music: 'Nature Sounds',
    thermostat: 70,
    aromatherapy: 'Eucalyptus'
  },
  anxious: {
    name: 'Gentle & Reassuring',
    lights: { color: '#B39DDB', brightness: 30 },
    music: 'Meditation Tones',
    thermostat: 73,
    aromatherapy: 'Chamomile'
  },
  excited: {
    name: 'Vibrant & Dynamic',
    lights: { color: '#FF4081', brightness: 85 },
    music: 'Party Mix',
    thermostat: 71,
    aromatherapy: 'Mint'
  },
  neutral: {
    name: 'Balanced & Focused',
    lights: { color: '#FFFFFF', brightness: 80 },
    music: 'Ambient Focus',
    thermostat: 72,
    aromatherapy: 'Sandalwood'
  }
};

// Device type icons
const deviceTypeIcons = {
  lights: <Lightbulb className="h-5 w-5" />,
  music: <Music className="h-5 w-5" />,
  thermostat: <Thermometer className="h-5 w-5" />,
  aromatherapy: <Wind className="h-5 w-5" />,
  lock: <Lock className="h-5 w-5" />
};

export default function SmartHomeFeature() {
  const { toast } = useToast();
  const [devices, setDevices] = useState<SmartDevice[]>(mockDevices);
  const [activeTab, setActiveTab] = useState<DeviceType>('lights');
  const [selectedEmotion, setSelectedEmotion] = useState<EmotionType>('neutral');
  const [isPremium, setIsPremium] = useState(false);
  
  const handleToggleDevice = (id: string) => {
    if (!isPremium) {
      toast({
        title: "Premium Feature",
        description: "Upgrade to premium to control smart home devices",
        variant: "destructive",
      });
      return;
    }
    
    setDevices(devices.map(device => {
      if (device.id === id) {
        return {
          ...device,
          status: {
            ...device.status,
            power: !device.status.power
          }
        };
      }
      return device;
    }));
    
    toast({
      title: "Device Updated",
      description: `${devices.find(d => d.id === id)?.name} ${devices.find(d => d.id === id)?.status.power ? 'turned off' : 'turned on'}.`,
    });
  };
  
  const handleBrightnessChange = (id: string, value: number[]) => {
    if (!isPremium) {
      toast({
        title: "Premium Feature",
        description: "Upgrade to premium to control smart home devices",
        variant: "destructive",
      });
      return;
    }
    
    setDevices(devices.map(device => {
      if (device.id === id) {
        return {
          ...device,
          status: {
            ...device.status,
            brightness: value[0]
          }
        };
      }
      return device;
    }));
  };
  
  const handleVolumeChange = (id: string, value: number[]) => {
    if (!isPremium) {
      toast({
        title: "Premium Feature",
        description: "Upgrade to premium to control smart home devices",
        variant: "destructive",
      });
      return;
    }
    
    setDevices(devices.map(device => {
      if (device.id === id) {
        return {
          ...device,
          status: {
            ...device.status,
            volume: value[0]
          }
        };
      }
      return device;
    }));
  };
  
  const handleTemperatureChange = (id: string, value: number[]) => {
    if (!isPremium) {
      toast({
        title: "Premium Feature",
        description: "Upgrade to premium to control smart home devices",
        variant: "destructive",
      });
      return;
    }
    
    setDevices(devices.map(device => {
      if (device.id === id) {
        return {
          ...device,
          status: {
            ...device.status,
            temperature: value[0]
          }
        };
      }
      return device;
    }));
  };
  
  const handleApplyPreset = (emotion: EmotionType) => {
    if (!isPremium) {
      toast({
        title: "Premium Feature",
        description: "Upgrade to premium to apply emotion-based presets",
        variant: "destructive",
      });
      return;
    }
    
    setSelectedEmotion(emotion);
    const preset = emotionPresets[emotion];
    
    // In a real app, this would communicate with the smart home devices
    toast({
      title: "Mood Environment Applied",
      description: `${preset.name} environment has been applied to your connected devices.`,
    });
  };
  
  // Filter devices based on active tab
  const tabDevices = devices.filter(device => device.type === activeTab);
  
  return (
    <Card className="mb-6">
      <CardHeader>
        <div className="flex items-center gap-2">
          <HomeIcon className="h-5 w-5 text-primary" />
          <CardTitle>Smart Home Integration</CardTitle>
        </div>
        <CardDescription>
          Control your smart devices based on your emotional state
        </CardDescription>
      </CardHeader>
      <CardContent>
        <div className="space-y-6">
          {/* Mood Presets */}
          <div>
            <h3 className="font-medium mb-3">Mood-Based Environment Presets</h3>
            <div className="grid grid-cols-2 md:grid-cols-3 gap-3">
              {Object.entries(emotions).map(([key, emotion]) => (
                <button 
                  key={key}
                  onClick={() => handleApplyPreset(key as EmotionType)}
                  className={`border rounded-lg p-3 text-left transition hover:bg-gray-50 ${
                    selectedEmotion === key ? 'border-primary' : ''
                  }`}
                >
                  <div className="flex items-center justify-between mb-2">
                    <div className="flex items-center gap-2">
                      <div className={`w-4 h-4 rounded-full ${emotion.backgroundColor}`}></div>
                      <span className="font-medium">{emotion.name}</span>
                    </div>
                    {selectedEmotion === key && 
                      <Badge variant="outline" className="bg-primary/10 text-primary">Active</Badge>
                    }
                  </div>
                  <p className="text-xs text-muted-foreground">
                    {emotionPresets[key as EmotionType].name}
                  </p>
                </button>
              ))}
            </div>
          </div>
          
          {/* Device Controls */}
          <div>
            <div className="flex justify-between items-center mb-3">
              <h3 className="font-medium">Connected Devices</h3>
              <Button variant="outline" size="sm" className="h-8">
                <RefreshCw className="h-3 w-3 mr-1" />
                <span>Refresh</span>
              </Button>
            </div>
            
            <Tabs defaultValue="lights" value={activeTab} onValueChange={(value) => setActiveTab(value as DeviceType)}>
              <TabsList className="grid grid-cols-5">
                <TabsTrigger value="lights" className="flex items-center gap-1">
                  <Lightbulb className="h-4 w-4" />
                  <span>Lights</span>
                </TabsTrigger>
                <TabsTrigger value="music" className="flex items-center gap-1">
                  <Music className="h-4 w-4" />
                  <span>Music</span>
                </TabsTrigger>
                <TabsTrigger value="thermostat" className="flex items-center gap-1">
                  <Thermometer className="h-4 w-4" />
                  <span>Climate</span>
                </TabsTrigger>
                <TabsTrigger value="aromatherapy" className="flex items-center gap-1">
                  <Wind className="h-4 w-4" />
                  <span>Scent</span>
                </TabsTrigger>
                <TabsTrigger value="lock" className="flex items-center gap-1">
                  <Lock className="h-4 w-4" />
                  <span>Security</span>
                </TabsTrigger>
              </TabsList>
              
              {/* Content for each device type */}
              <TabsContent value={activeTab} className="mt-4">
                <div className="space-y-4">
                  {tabDevices.length > 0 ? (
                    <>
                      {tabDevices.map((device) => (
                        <div key={device.id} className={`border rounded-lg p-4 ${!device.connected ? 'opacity-50' : ''}`}>
                          <div className="flex justify-between items-start mb-4">
                            <div className="flex items-center gap-2">
                              {deviceTypeIcons[device.type]}
                              <div>
                                <h4 className="font-medium">{device.name}</h4>
                                <div className="flex items-center gap-1 text-xs text-muted-foreground">
                                  <span className={`w-2 h-2 rounded-full ${device.connected ? 'bg-green-500' : 'bg-gray-300'}`}></span>
                                  <span>{device.connected ? 'Connected' : 'Disconnected'}</span>
                                </div>
                              </div>
                            </div>
                            <Button 
                              variant={device.status.power ? "default" : "outline"}
                              size="sm"
                              className="h-8 w-8 p-0 rounded-full"
                              onClick={() => handleToggleDevice(device.id)}
                              disabled={!device.connected}
                            >
                              <Power className="h-4 w-4" />
                            </Button>
                          </div>
                          
                          {device.connected && device.status.power && (
                            <div className="pt-2 border-t space-y-4">
                              {/* Lights controls */}
                              {device.type === 'lights' && device.status.brightness !== undefined && (
                                <div className="space-y-2">
                                  <div className="flex justify-between">
                                    <Label className="text-sm">Brightness</Label>
                                    <span className="text-sm">{device.status.brightness}%</span>
                                  </div>
                                  <Slider
                                    value={[device.status.brightness]}
                                    min={0}
                                    max={100}
                                    step={1}
                                    onValueChange={(value) => handleBrightnessChange(device.id, value)}
                                  />
                                  
                                  <div className="flex justify-between mt-4">
                                    <Label className="text-sm">Color</Label>
                                    <div className="flex items-center gap-1">
                                      <div 
                                        className="w-4 h-4 rounded-full border"
                                        style={{ backgroundColor: device.status.color || '#FFFFFF' }}
                                      ></div>
                                      <Button variant="outline" size="sm" className="h-6 text-xs">
                                        <Palette className="h-3 w-3 mr-1" />
                                        Change
                                      </Button>
                                    </div>
                                  </div>
                                </div>
                              )}
                              
                              {/* Music controls */}
                              {device.type === 'music' && device.status.volume !== undefined && (
                                <div className="space-y-2">
                                  <div className="flex justify-between">
                                    <Label className="text-sm">Volume</Label>
                                    <span className="text-sm">{device.status.volume}%</span>
                                  </div>
                                  <Slider
                                    value={[device.status.volume]}
                                    min={0}
                                    max={100}
                                    step={1}
                                    onValueChange={(value) => handleVolumeChange(device.id, value)}
                                  />
                                  <div className="flex items-center justify-between mt-4">
                                    <span className="text-sm font-medium">Now Playing</span>
                                    <span className="text-xs text-muted-foreground">
                                      {emotionPresets[selectedEmotion].music}
                                    </span>
                                  </div>
                                </div>
                              )}
                              
                              {/* Thermostat controls */}
                              {device.type === 'thermostat' && device.status.temperature !== undefined && (
                                <div className="space-y-2">
                                  <div className="flex justify-between">
                                    <Label className="text-sm">Temperature</Label>
                                    <span className="text-sm">{device.status.temperature}°F</span>
                                  </div>
                                  <Slider
                                    value={[device.status.temperature]}
                                    min={65}
                                    max={85}
                                    step={1}
                                    onValueChange={(value) => handleTemperatureChange(device.id, value)}
                                  />
                                </div>
                              )}
                              
                              {/* Aromatherapy controls */}
                              {device.type === 'aromatherapy' && device.status.scent && (
                                <div className="space-y-2">
                                  <div className="flex justify-between">
                                    <Label className="text-sm">Active Scent</Label>
                                    <span className="text-sm">{device.status.scent}</span>
                                  </div>
                                  <div className="flex justify-between mt-2">
                                    <span className="text-xs text-muted-foreground">
                                      Recommended: {emotionPresets[selectedEmotion].aromatherapy}
                                    </span>
                                    <Button variant="outline" size="sm" className="h-6 text-xs">
                                      Change
                                    </Button>
                                  </div>
                                </div>
                              )}
                              
                              {/* Lock controls */}
                              {device.type === 'lock' && device.status.locked !== undefined && (
                                <div className="flex justify-between items-center">
                                  <span className="text-sm font-medium">Door Status</span>
                                  <Button 
                                    variant={device.status.locked ? "default" : "destructive"}
                                    size="sm"
                                  >
                                    {device.status.locked ? 'Locked' : 'Unlocked'}
                                  </Button>
                                </div>
                              )}
                            </div>
                          )}
                        </div>
                      ))}
                      
                      <Button variant="outline" className="w-full flex items-center justify-center">
                        <Plus className="h-4 w-4 mr-1" />
                        <span>Add {activeTab.charAt(0).toUpperCase() + activeTab.slice(1)}</span>
                      </Button>
                    </>
                  ) : (
                    <div className="text-center py-8 border rounded-lg">
                      <AlertCircle className="h-10 w-10 mx-auto text-muted-foreground mb-2" />
                      <h3 className="text-lg font-medium">No devices found</h3>
                      <p className="text-sm text-muted-foreground mb-4">
                        You don't have any {activeTab} devices connected yet.
                      </p>
                      <Button>
                        <Plus className="h-4 w-4 mr-1" />
                        <span>Add {activeTab.charAt(0).toUpperCase() + activeTab.slice(1)}</span>
                      </Button>
                    </div>
                  )}
                </div>
              </TabsContent>
            </Tabs>
          </div>
          
          {/* Premium Info */}
          {!isPremium && (
            <div className="bg-amber-50 border border-amber-100 rounded-lg p-4 mt-4">
              <div className="flex items-start gap-3">
                <div className="bg-amber-100 rounded-full p-2">
                  <HomeIcon className="h-5 w-5 text-amber-600" />
                </div>
                <div>
                  <h3 className="font-medium text-amber-800 mb-1">Smart Home Integration</h3>
                  <p className="text-sm text-amber-700 mb-2">
                    Upgrade to premium to control your smart home devices based on your emotional state.
                    Connect lights, music, thermostat, and more for a fully immersive emotional experience.
                  </p>
                  <PremiumUpgradeButton size="sm">
                    Upgrade to Control Devices
                  </PremiumUpgradeButton>
                </div>
              </div>
            </div>
          )}
        </div>
      </CardContent>
      <CardFooter className="flex justify-between">
        <div className="text-xs text-muted-foreground">
          {isPremium ? (
            <span className="flex items-center">
              <Check className="h-3 w-3 mr-1 text-green-500" />
              Smart home integration enabled
            </span>
          ) : (
            <span className="flex items-center">
              <AlertCircle className="h-3 w-3 mr-1 text-amber-500" />
              Preview mode only
            </span>
          )}
        </div>
      </CardFooter>
    </Card>
  );
}