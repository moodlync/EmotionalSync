import { useState } from 'react';
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Switch } from "@/components/ui/switch";
import { Input } from "@/components/ui/input";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Label } from "@/components/ui/label";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Bell, SmartphoneIcon, Mail, MessageSquare, Clock, Calendar, AlertCircle, Check, SettingsIcon } from "lucide-react";
import { useToast } from '@/hooks/use-toast';

// Notification channel types
type NotificationChannel = 'app' | 'email' | 'sms' | 'whatsapp';

interface NotificationSetting {
  id: string;
  name: string;
  description: string;
  channels: Record<NotificationChannel, boolean>;
  frequency: 'daily' | 'weekly' | 'custom';
  customTime?: string;
  active: boolean;
  isPremium: boolean;
}

// Mock notification settings
const defaultSettings: NotificationSetting[] = [
  {
    id: 'daily-checkin',
    name: 'Daily Emotion Check-in',
    description: 'Reminder to record your emotion once a day',
    channels: { app: true, email: false, sms: false, whatsapp: false },
    frequency: 'daily',
    customTime: '09:00',
    active: true,
    isPremium: false
  },
  {
    id: 'multi-checkin',
    name: 'Multiple Daily Check-ins',
    description: 'Set reminders throughout the day to track emotion changes',
    channels: { app: true, email: true, sms: false, whatsapp: false },
    frequency: 'custom',
    active: false,
    isPremium: true
  },
  {
    id: 'journal-reminder',
    name: 'Journal Reminder',
    description: 'Reminder to write in your emotion journal',
    channels: { app: true, email: false, sms: false, whatsapp: false },
    frequency: 'daily',
    customTime: '20:00',
    active: false,
    isPremium: false
  },
  {
    id: 'weekly-insights',
    name: 'Weekly Emotional Insights',
    description: 'Get a summary of your emotional patterns from the past week',
    channels: { app: true, email: true, sms: false, whatsapp: false },
    frequency: 'weekly',
    active: false,
    isPremium: true
  },
  {
    id: 'emotion-alerts',
    name: 'Negative Emotion Alerts',
    description: 'Get notified when your emotions are consistently negative',
    channels: { app: true, email: false, sms: true, whatsapp: true },
    frequency: 'custom',
    active: false,
    isPremium: true
  }
];

export default function NotificationsFeature() {
  const { toast } = useToast();
  const [settings, setSettings] = useState<NotificationSetting[]>(defaultSettings);
  const [isPremium, setIsPremium] = useState(false);
  const [activeTab, setActiveTab] = useState<NotificationChannel>('app');
  const [phoneNumber, setPhoneNumber] = useState('');
  const [email, setEmail] = useState('');
  const [whatsappNumber, setWhatsappNumber] = useState('');
  
  const handleToggleNotification = (id: string) => {
    const setting = settings.find(s => s.id === id);
    
    if (setting?.isPremium && !isPremium) {
      toast({
        title: "Premium Feature",
        description: "Upgrade to premium to enable this notification",
        variant: "destructive",
      });
      return;
    }
    
    setSettings(settings.map(s => 
      s.id === id ? { ...s, active: !s.active } : s
    ));
    
    toast({
      title: `Notification ${settings.find(s => s.id === id)?.active ? 'Disabled' : 'Enabled'}`,
      description: `${settings.find(s => s.id === id)?.name} has been ${settings.find(s => s.id === id)?.active ? 'disabled' : 'enabled'}.`,
    });
  };
  
  const handleChannelChange = (id: string, channel: NotificationChannel, value: boolean) => {
    const setting = settings.find(s => s.id === id);
    
    if (setting?.isPremium && !isPremium && channel !== 'app') {
      toast({
        title: "Premium Feature",
        description: "Upgrade to premium to enable multi-channel notifications",
        variant: "destructive",
      });
      return;
    }
    
    setSettings(settings.map(s => 
      s.id === id ? { 
        ...s, 
        channels: { ...s.channels, [channel]: value } 
      } : s
    ));
  };
  
  const handleFrequencyChange = (id: string, frequency: 'daily' | 'weekly' | 'custom') => {
    setSettings(settings.map(s => 
      s.id === id ? { ...s, frequency } : s
    ));
  };
  
  const handleTimeChange = (id: string, time: string) => {
    setSettings(settings.map(s => 
      s.id === id ? { ...s, customTime: time } : s
    ));
  };
  
  const handleSaveContactInfo = () => {
    toast({
      title: "Contact Information Saved",
      description: "Your notification preferences have been updated.",
    });
  };
  
  // Filter settings based on active tab
  const tabSettings = settings.filter(setting => setting.channels[activeTab]);
  
  return (
    <Card className="mb-6">
      <CardHeader>
        <div className="flex items-center gap-2">
          <Bell className="h-5 w-5 text-primary" />
          <CardTitle>Notification Preferences</CardTitle>
        </div>
        <CardDescription>
          Customize how and when you receive reminders and alerts
        </CardDescription>
      </CardHeader>
      <CardContent>
        <div className="space-y-6">
          {/* Channel Tabs */}
          <Tabs defaultValue="app" value={activeTab} onValueChange={(value) => setActiveTab(value as NotificationChannel)}>
            <TabsList className="grid grid-cols-4">
              <TabsTrigger value="app" className="flex items-center gap-1">
                <SmartphoneIcon className="h-4 w-4" />
                <span>App</span>
              </TabsTrigger>
              <TabsTrigger value="email" className="flex items-center gap-1">
                <Mail className="h-4 w-4" />
                <span>Email</span>
              </TabsTrigger>
              <TabsTrigger value="sms" className="flex items-center gap-1">
                <MessageSquare className="h-4 w-4" />
                <span>SMS</span>
              </TabsTrigger>
              <TabsTrigger value="whatsapp" className="flex items-center gap-1">
                <MessageSquare className="h-4 w-4" />
                <span>WhatsApp</span>
              </TabsTrigger>
            </TabsList>
            
            <TabsContent value="app">
              <div className="pt-4 pb-2">
                <p className="text-sm text-muted-foreground">
                  Configure in-app notifications and reminders
                </p>
              </div>
            </TabsContent>
            
            <TabsContent value="email">
              <div className="py-4 space-y-4">
                <div className="grid gap-2">
                  <Label htmlFor="email">Your Email Address</Label>
                  <Input 
                    id="email" 
                    placeholder="your.email@example.com" 
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                  />
                </div>
                <Button onClick={handleSaveContactInfo} size="sm">Save Email Preferences</Button>
              </div>
            </TabsContent>
            
            <TabsContent value="sms">
              <div className="py-4 space-y-4">
                <div className="grid gap-2">
                  <Label htmlFor="phone">Your Phone Number</Label>
                  <Input 
                    id="phone" 
                    placeholder="+1 (555) 123-4567" 
                    value={phoneNumber}
                    onChange={(e) => setPhoneNumber(e.target.value)}
                  />
                </div>
                <Button onClick={handleSaveContactInfo} size="sm">Save SMS Preferences</Button>
              </div>
            </TabsContent>
            
            <TabsContent value="whatsapp">
              <div className="py-4 space-y-4">
                <div className="grid gap-2">
                  <Label htmlFor="whatsapp">Your WhatsApp Number</Label>
                  <Input 
                    id="whatsapp" 
                    placeholder="+1 (555) 123-4567" 
                    value={whatsappNumber}
                    onChange={(e) => setWhatsappNumber(e.target.value)}
                  />
                </div>
                <Button onClick={handleSaveContactInfo} size="sm">Save WhatsApp Preferences</Button>
              </div>
            </TabsContent>
          </Tabs>
          
          {/* Notification Settings */}
          <div className="space-y-4">
            <div className="flex justify-between items-center">
              <h3 className="font-medium">Notification Settings</h3>
              <Button variant="ghost" size="sm" className="flex items-center gap-1 h-8">
                <SettingsIcon className="h-4 w-4" />
                <span>Configure All</span>
              </Button>
            </div>
            
            {tabSettings.length > 0 ? (
              <div className="space-y-4">
                {tabSettings.map((setting) => (
                  <div key={setting.id} className={`border rounded-lg p-4 ${setting.isPremium && !isPremium ? 'opacity-70' : ''}`}>
                    <div className="flex justify-between items-start mb-2">
                      <div>
                        <div className="flex items-center gap-2">
                          <h3 className="font-medium">{setting.name}</h3>
                          {setting.isPremium && (
                            <span className="text-xs bg-amber-100 text-amber-800 px-2 py-0.5 rounded-full">
                              Premium
                            </span>
                          )}
                        </div>
                        <p className="text-sm text-muted-foreground">{setting.description}</p>
                      </div>
                      <Switch
                        checked={setting.active}
                        onCheckedChange={() => handleToggleNotification(setting.id)}
                      />
                    </div>
                    
                    {setting.active && (
                      <div className="mt-4 space-y-4 pt-4 border-t">
                        <div className="flex flex-wrap gap-4">
                          <div className="space-y-1">
                            <Label htmlFor={`frequency-${setting.id}`}>Frequency</Label>
                            <Select
                              value={setting.frequency}
                              onValueChange={(value) => handleFrequencyChange(setting.id, value as any)}
                            >
                              <SelectTrigger className="w-36">
                                <SelectValue placeholder="Select" />
                              </SelectTrigger>
                              <SelectContent>
                                <SelectItem value="daily">Daily</SelectItem>
                                <SelectItem value="weekly">Weekly</SelectItem>
                                <SelectItem value="custom">Custom</SelectItem>
                              </SelectContent>
                            </Select>
                          </div>
                          
                          {(setting.frequency === 'daily' || setting.frequency === 'custom') && (
                            <div className="space-y-1">
                              <Label htmlFor={`time-${setting.id}`}>Time</Label>
                              <Input
                                id={`time-${setting.id}`}
                                type="time"
                                value={setting.customTime}
                                onChange={(e) => handleTimeChange(setting.id, e.target.value)}
                                className="w-36"
                              />
                            </div>
                          )}
                        </div>
                        
                        <div className="flex flex-wrap gap-3">
                          <div className="flex items-center space-x-2">
                            <Label htmlFor={`app-${setting.id}`} className="text-sm">App</Label>
                            <Switch
                              id={`app-${setting.id}`}
                              checked={setting.channels.app}
                              onCheckedChange={(checked) => handleChannelChange(setting.id, 'app', checked)}
                            />
                          </div>
                          
                          <div className="flex items-center space-x-2">
                            <Label htmlFor={`email-${setting.id}`} className="text-sm">Email</Label>
                            <Switch
                              id={`email-${setting.id}`}
                              checked={setting.channels.email}
                              onCheckedChange={(checked) => handleChannelChange(setting.id, 'email', checked)}
                            />
                          </div>
                          
                          <div className="flex items-center space-x-2">
                            <Label htmlFor={`sms-${setting.id}`} className="text-sm">SMS</Label>
                            <Switch
                              id={`sms-${setting.id}`}
                              checked={setting.channels.sms}
                              onCheckedChange={(checked) => handleChannelChange(setting.id, 'sms', checked)}
                            />
                          </div>
                          
                          <div className="flex items-center space-x-2">
                            <Label htmlFor={`whatsapp-${setting.id}`} className="text-sm">WhatsApp</Label>
                            <Switch
                              id={`whatsapp-${setting.id}`}
                              checked={setting.channels.whatsapp}
                              onCheckedChange={(checked) => handleChannelChange(setting.id, 'whatsapp', checked)}
                            />
                          </div>
                        </div>
                      </div>
                    )}
                  </div>
                ))}
              </div>
            ) : (
              <div className="text-center py-8 border rounded-lg">
                <AlertCircle className="h-10 w-10 mx-auto text-muted-foreground mb-2" />
                <h3 className="text-lg font-medium">No notifications configured</h3>
                <p className="text-sm text-muted-foreground">
                  You don't have any notifications set up for this channel.
                </p>
              </div>
            )}
          </div>
          
          {/* Premium Info */}
          {!isPremium && (
            <div className="bg-amber-50 border border-amber-100 rounded-lg p-4 mt-4">
              <div className="flex items-start gap-3">
                <div className="bg-amber-100 rounded-full p-2">
                  <Bell className="h-5 w-5 text-amber-600" />
                </div>
                <div>
                  <h3 className="font-medium text-amber-800 mb-1">Enhanced Notification Options</h3>
                  <p className="text-sm text-amber-700 mb-2">
                    Upgrade to premium for multi-channel notifications via SMS, WhatsApp, 
                    email, and get personalized reminders throughout the day.
                  </p>
                  <Button size="sm" className="bg-amber-500 hover:bg-amber-600">
                    Upgrade for Enhanced Notifications
                  </Button>
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
              Multi-channel notifications enabled
            </span>
          ) : (
            <span className="flex items-center">
              <AlertCircle className="h-3 w-3 mr-1 text-amber-500" />
              Limited to app notifications only
            </span>
          )}
        </div>
      </CardFooter>
    </Card>
  );
}