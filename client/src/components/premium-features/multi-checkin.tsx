import { useState } from 'react';
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Calendar, Clock, LineChart, AlertCircle, Check } from "lucide-react";
import { EmotionType, emotions } from '@/lib/emotions';
import { useToast } from '@/hooks/use-toast';

// Mock data structure for a day's emotion entries
interface EmotionEntry {
  id: string;
  time: string;
  emotion: EmotionType;
  note?: string;
}

interface DayEntries {
  date: string;
  entries: EmotionEntry[];
}

// Mock data
const mockEntries: DayEntries[] = [
  {
    date: 'Today',
    entries: [
      { id: '1', time: '09:30 AM', emotion: 'neutral', note: 'Starting the day' },
      { id: '2', time: '12:45 PM', emotion: 'happy', note: 'Lunch with friends' },
      { id: '3', time: '03:20 PM', emotion: 'anxious', note: 'Project deadline approaching' },
    ]
  },
  {
    date: 'Yesterday',
    entries: [
      { id: '4', time: '08:15 AM', emotion: 'excited', note: 'Early workout' },
      { id: '5', time: '01:30 PM', emotion: 'sad', note: 'Difficult meeting' },
      { id: '6', time: '07:45 PM', emotion: 'happy', note: 'Family dinner' },
    ]
  }
];

// Time slots for new check-ins
const timeSlots = [
  '06:00 AM', '09:00 AM', '12:00 PM', 
  '03:00 PM', '06:00 PM', '09:00 PM'
];

export default function MultiCheckinFeature() {
  const { toast } = useToast();
  const [entries, setEntries] = useState<DayEntries[]>(mockEntries);
  const [isPremium, setIsPremium] = useState(false);
  
  const handleAddCheckIn = (time: string) => {
    if (!isPremium) {
      toast({
        title: "Premium Feature",
        description: "Upgrade to premium to log multiple emotions per day",
        variant: "destructive",
      });
      return;
    }
    
    // In a real app, this would open a modal to select emotion and add note
    toast({
      title: "Add Check-in",
      description: `You can now add your current emotion for ${time}`,
    });
  };
  
  // Calculate how many check-ins are left today
  const checkInsToday = entries[0]?.entries.length || 0;
  const checkInsLeft = isPremium ? 6 - checkInsToday : 1 - checkInsToday;
  
  return (
    <Card className="mb-6">
      <CardHeader>
        <div className="flex items-center gap-2">
          <Calendar className="h-5 w-5 text-primary" />
          <CardTitle>Multiple Daily Check-ins</CardTitle>
        </div>
        <CardDescription>
          Track your emotional changes throughout the day
        </CardDescription>
      </CardHeader>
      <CardContent>
        <div className="space-y-6">
          {/* Today's Status */}
          <div className="bg-gray-50 p-4 rounded-lg">
            <h3 className="font-medium mb-2">Today's Check-ins</h3>
            <div className="flex justify-between items-center">
              <div className="flex items-center gap-1 text-sm">
                <LineChart className="h-4 w-4 text-primary" />
                <span>{checkInsToday} check-ins recorded</span>
              </div>
              <div className="flex items-center gap-1 text-sm">
                <Clock className="h-4 w-4 text-amber-500" />
                <span>{checkInsLeft} {checkInsLeft === 1 ? 'check-in' : 'check-ins'} remaining today</span>
              </div>
            </div>
            
            {!isPremium && (
              <div className="mt-4 flex items-center gap-2 text-sm text-amber-600 bg-amber-50 p-2 rounded-md">
                <AlertCircle className="h-4 w-4" />
                <span>Upgrade to premium for unlimited daily check-ins</span>
              </div>
            )}
          </div>
          
          {/* Scheduled Check-in Times */}
          <div>
            <h3 className="font-medium mb-3">Scheduled Check-in Times</h3>
            <div className="grid grid-cols-3 gap-3">
              {timeSlots.map((time) => (
                <button 
                  key={time}
                  onClick={() => handleAddCheckIn(time)} 
                  className="border border-gray-200 rounded-md p-2 hover:bg-gray-50 flex flex-col items-center"
                >
                  <Clock className="h-5 w-5 text-gray-500 mb-1" />
                  <span className="text-sm font-medium">{time}</span>
                </button>
              ))}
            </div>
          </div>
          
          {/* Recent Check-ins */}
          <div>
            <h3 className="font-medium mb-3">Recent Entries</h3>
            <div className="space-y-4">
              {entries.map((day) => (
                <div key={day.date}>
                  <h4 className="text-sm font-semibold mb-2">{day.date}</h4>
                  <div className="space-y-2">
                    {day.entries.map((entry) => (
                      <div key={entry.id} className="border rounded-md p-3 flex items-center">
                        <div className={`w-10 h-10 rounded-full ${emotions[entry.emotion].backgroundColor} flex items-center justify-center mr-3`}>
                          <svg 
                            xmlns="http://www.w3.org/2000/svg" 
                            fill="none" 
                            viewBox="0 0 24 24" 
                            strokeWidth="1.5" 
                            stroke="currentColor" 
                            className={`w-6 h-6 ${entry.emotion === 'happy' ? 'text-yellow-800' : 'text-white'}`}
                          >
                            <path strokeLinecap="round" strokeLinejoin="round" d={emotions[entry.emotion].icon} />
                          </svg>
                        </div>
                        <div className="flex-1">
                          <div className="flex justify-between items-center mb-1">
                            <span className="font-medium">{emotions[entry.emotion].name}</span>
                            <span className="text-xs text-gray-500">{entry.time}</span>
                          </div>
                          {entry.note && <p className="text-sm text-gray-600">{entry.note}</p>}
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>
      </CardContent>
      <CardFooter className="flex justify-between">
        <div className="text-xs text-muted-foreground">
          {isPremium ? (
            <span className="flex items-center">
              <Check className="h-3 w-3 mr-1 text-green-500" />
              Premium feature active
            </span>
          ) : (
            <span className="flex items-center">
              <AlertCircle className="h-3 w-3 mr-1 text-amber-500" />
              Limited to 1 check-in per day
            </span>
          )}
        </div>
        {!isPremium && (
          <Button variant="outline" className="border-amber-500 text-amber-600">
            Upgrade to Enable
          </Button>
        )}
      </CardFooter>
    </Card>
  );
}