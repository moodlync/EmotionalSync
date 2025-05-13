import { useState } from "react";
import { useQuery, useMutation } from "@tanstack/react-query";
import { useAuth } from "@/hooks/use-auth";
import { Coins, Plus } from "lucide-react";
import { Button } from "@/components/ui/button";
import { EmotionType, emotions } from "@/lib/emotions";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import { apiRequest, queryClient } from "@/lib/queryClient";
import { Textarea } from "@/components/ui/textarea";
import JournalEntry from "./journal-entry";
import { useRewards } from "@/hooks/use-rewards";

interface JournalEntry {
  id: number;
  userId: number;
  emotion: EmotionType;
  note: string;
  createdAt: string;
}

export default function JournalTab() {
  const { user } = useAuth();
  const { showTokenEarnedToast } = useRewards();
  const [timeRange, setTimeRange] = useState<string>("week");
  const [newEmotion, setNewEmotion] = useState<EmotionType>("neutral");
  const [newNote, setNewNote] = useState<string>("");
  const [isDialogOpen, setIsDialogOpen] = useState(false);

  // Fetch journal entries
  const { data: journalEntries = [], isLoading } = useQuery<JournalEntry[]>({
    queryKey: ['/api/journal', user?.id],
    initialData: [
      {
        id: 1,
        userId: user?.id || 0,
        emotion: 'happy',
        note: 'Got a promotion at work today! Feeling on top of the world.',
        createdAt: 'Yesterday, 3:45 PM'
      },
      {
        id: 2,
        userId: user?.id || 0,
        emotion: 'anxious',
        note: 'Big presentation tomorrow. Can\'t stop worrying about it.',
        createdAt: '2 days ago, 11:20 AM'
      },
      {
        id: 3,
        userId: user?.id || 0,
        emotion: 'neutral',
        note: 'Regular day, nothing special. Just going with the flow.',
        createdAt: '5 days ago, 9:15 AM'
      }
    ]
  });

  // Mutation to add a new journal entry
  const addEntryMutation = useMutation({
    mutationFn: async (newEntry: { emotion: EmotionType; note: string }) => {
      const res = await apiRequest('POST', '/api/journal', newEntry);
      return await res.json();
    },
    onSuccess: (response) => {
      const { entry, tokensEarned } = response;
      
      // Update journal entries list
      queryClient.setQueryData<JournalEntry[]>(
        ['/api/journal', user?.id],
        (old = []) => [entry, ...old]
      );
      
      // Show tokens earned notification
      if (tokensEarned > 0) {
        showTokenEarnedToast(
          tokensEarned, 
          `creating a journal entry about feeling ${entry.emotion}`
        );
        
        // Invalidate token-related queries to refresh token display in header
        queryClient.invalidateQueries({ queryKey: ['/api/tokens'] });
        queryClient.invalidateQueries({ queryKey: ['/api/rewards/history'] });
      }
      
      // Reset form
      setNewNote("");
      setNewEmotion("neutral");
      setIsDialogOpen(false);
    }
  });

  const handleAddEntry = () => {
    if (newNote.trim()) {
      addEntryMutation.mutate({
        emotion: newEmotion,
        note: newNote
      });
    }
  };

  // Calculate emotion counts for the chart
  const emotionCounts = journalEntries.reduce((acc, entry) => {
    acc[entry.emotion] = (acc[entry.emotion] || 0) + 1;
    return acc;
  }, {} as Record<EmotionType, number>);

  // Get the highest count for scaling
  const maxCount = Math.max(...Object.values(emotionCounts), 1);

  return (
    <section>
      <div className="mb-6">
        <div className="flex justify-between items-center mb-4">
          <h2 className="font-poppins font-semibold text-xl">Your Emotion Journal</h2>
          <Dialog open={isDialogOpen} onOpenChange={setIsDialogOpen}>
            <DialogTrigger asChild>
              <Button size="icon" className="rounded-full">
                <Plus className="h-5 w-5" />
              </Button>
            </DialogTrigger>
            <DialogContent>
              <DialogHeader>
                <DialogTitle>Add Journal Entry</DialogTitle>
              </DialogHeader>
              <div className="space-y-4 mt-2">
                <div className="space-y-2">
                  <label className="text-sm font-medium">How are you feeling?</label>
                  <Select 
                    value={newEmotion} 
                    onValueChange={(value) => setNewEmotion(value as EmotionType)}
                  >
                    <SelectTrigger>
                      <SelectValue placeholder="Select emotion" />
                    </SelectTrigger>
                    <SelectContent>
                      {Object.values(emotions).map((emotion) => (
                        <SelectItem key={emotion.id} value={emotion.id}>
                          {emotion.name}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>
                <div className="space-y-2">
                  <label className="text-sm font-medium">Add a note</label>
                  <Textarea 
                    placeholder="How are you feeling today?" 
                    value={newNote}
                    onChange={(e) => setNewNote(e.target.value)}
                    rows={4}
                  />
                </div>
                <Button 
                  className="w-full" 
                  onClick={handleAddEntry}
                  disabled={addEntryMutation.isPending || !newNote.trim()}
                >
                  Save Entry
                </Button>
              </div>
            </DialogContent>
          </Dialog>
        </div>
        
        <div className="bg-white p-4 rounded-xl shadow-sm mb-4">
          <div className="flex justify-between items-center mb-3">
            <h3 className="font-medium">Your Mood Trends</h3>
            <Select value={timeRange} onValueChange={setTimeRange}>
              <SelectTrigger className="w-32">
                <SelectValue placeholder="This Week" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="week">This Week</SelectItem>
                <SelectItem value="month">This Month</SelectItem>
                <SelectItem value="year">All Time</SelectItem>
              </SelectContent>
            </Select>
          </div>
          
          <div className="h-48 bg-gray-50 rounded-lg p-3 flex items-end space-x-2">
            {/* Chart implementation */}
            {Object.entries(emotions).map(([key, emotion]) => {
              const count = emotionCounts[key as EmotionType] || 0;
              const height = count ? `${(count / maxCount) * 100}%` : '10%';
              
              return (
                <div 
                  key={key}
                  className="flex-1 flex flex-col items-center"
                  title={`${emotion.name}: ${count} entries`}
                >
                  <div style={{ height }} className={`w-full ${emotion.backgroundColor} rounded-t-lg`}></div>
                  <span className="text-xs mt-2">{emotion.name}</span>
                </div>
              );
            })}
          </div>
        </div>
        
        <div className="bg-white rounded-xl shadow-sm overflow-hidden">
          <div className="px-4 py-3 border-b border-gray-100 flex justify-between items-center">
            <h3 className="font-medium">Recent Entries</h3>
            <button className="text-primary text-sm font-medium">View All</button>
          </div>
          
          <div>
            {journalEntries.map((entry) => (
              <JournalEntry 
                key={entry.id}
                emotion={entry.emotion}
                note={entry.note}
                timestamp={entry.createdAt}
              />
            ))}
          </div>
        </div>
      </div>
    </section>
  );
}
