import React, { useState, useEffect } from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import { useMutation } from '@tanstack/react-query';
import { apiRequest, queryClient } from '@/lib/queryClient';
import { useToast } from '@/hooks/use-toast';
import { EmotionalImprint, CreateImprintFormData } from '@/types/imprints';
import { emotionOptions, colorOptions, soundOptions, vibrationOptions } from '@/lib/imprints-constants';
import {
  Form,
  FormControl,
  FormDescription,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from '@/components/ui/form';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Button } from '@/components/ui/button';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import { Slider } from '@/components/ui/slider';
import { Switch } from '@/components/ui/switch';
import {
  Card,
  CardContent,
  CardFooter,
  CardHeader,
  CardTitle,
  CardDescription,
} from '@/components/ui/card';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { RadioGroup, RadioGroupItem } from '@/components/ui/radio-group';
import { Label } from '@/components/ui/label';
import { Loader2, Save, Play, Pause, Volume2, VolumeX } from 'lucide-react';
import ImprintViewer from './imprint-viewer';

// Form validation schema
const createImprintSchema = z.object({
  name: z.string().min(3, "Name must be at least 3 characters").max(50, "Name must be less than 50 characters"),
  emotion: z.string().min(1, "Emotion is required"),
  description: z.string().max(200, "Description must be less than 200 characters").optional(),
  intensity: z.number().min(1).max(10).default(5),
  colorCode: z.string().min(1, "Color is required"),
  soundId: z.string().optional(),
  vibrationPattern: z.string().optional(),
  isPrivate: z.boolean().default(false),
});

interface EmotionalImprintCreatorProps {
  existingImprint?: EmotionalImprint;
  onSuccess?: (imprint: EmotionalImprint) => void;
  onCancel?: () => void;
}

const EmotionalImprintCreator: React.FC<EmotionalImprintCreatorProps> = ({
  existingImprint,
  onSuccess,
  onCancel,
}) => {
  const { toast } = useToast();
  const [isPlaying, setIsPlaying] = useState(false);
  const [audio, setAudio] = useState<HTMLAudioElement | null>(null);
  const [isMuted, setIsMuted] = useState(false);
  const [selectedColor, setSelectedColor] = useState<string>(existingImprint?.colorCode || 'joy');
  const [activeTab, setActiveTab] = useState('details');
  const [previewImprint, setPreviewImprint] = useState<EmotionalImprint | null>(null);
  
  const isEditing = !!existingImprint;
  
  // Initialize form
  const form = useForm<CreateImprintFormData>({
    resolver: zodResolver(createImprintSchema),
    defaultValues: {
      name: existingImprint?.name || '',
      emotion: existingImprint?.emotion || '',
      description: existingImprint?.description || '',
      intensity: existingImprint?.intensity || 5,
      colorCode: existingImprint?.colorCode || '',
      soundId: existingImprint?.soundId || '',
      vibrationPattern: existingImprint?.vibrationPattern || '',
      isPrivate: existingImprint?.isPrivate || false,
    },
  });

  // Watch form values for preview
  const formValues = form.watch();
  
  // Set up audio for preview
  useEffect(() => {
    const soundId = form.watch('soundId');
    if (soundId) {
      const audioElement = new Audio(`/sounds/${soundId}.mp3`);
      audioElement.loop = true;
      setAudio(audioElement);
      
      return () => {
        if (audioElement) {
          audioElement.pause();
          audioElement.currentTime = 0;
        }
      };
    } else {
      setAudio(null);
      setIsPlaying(false);
    }
  }, [form.watch('soundId')]);
  
  // Update preview when form values change
  useEffect(() => {
    setPreviewImprint({
      id: existingImprint?.id || 0,
      userId: existingImprint?.userId || 0,
      name: formValues.name || 'Untitled Imprint',
      emotion: formValues.emotion || 'Neutral',
      description: formValues.description || '',
      intensity: formValues.intensity,
      colorCode: formValues.colorCode || '',
      soundId: formValues.soundId,
      vibrationPattern: formValues.vibrationPattern,
      isPrivate: formValues.isPrivate,
      createdAt: existingImprint?.createdAt || new Date(),
      updatedAt: new Date(),
      author: existingImprint?.author,
      interactions: existingImprint?.interactions || [],
    });
  }, [formValues, existingImprint]);
  
  // Toggle play/pause for sound
  const togglePlay = () => {
    if (!audio) return;
    
    if (isPlaying) {
      audio.pause();
    } else {
      audio.play().catch(error => {
        console.error('Error playing sound:', error);
        toast({
          title: 'Sound Playback Error',
          description: 'There was an issue playing the sound. Try again later.',
          variant: 'destructive',
        });
      });
    }
    
    setIsPlaying(!isPlaying);
  };

  // Toggle mute/unmute for sound
  const toggleMute = () => {
    if (!audio) return;
    
    audio.muted = !audio.muted;
    setIsMuted(!isMuted);
  };
  
  // Activate vibration if available
  const activateVibration = () => {
    const pattern = form.watch('vibrationPattern');
    if (!pattern || !navigator.vibrate) return;
    
    // Different vibration patterns
    const patterns = {
      short: [200],
      long: [1000],
      double: [200, 100, 200],
      triple: [200, 100, 200, 100, 200],
      escalating: [100, 50, 200, 50, 300],
      heartbeat: [100, 30, 100, 500, 100, 30, 100],
    };
    
    const vibrationPattern = patterns[pattern as keyof typeof patterns];
    if (vibrationPattern) {
      navigator.vibrate(vibrationPattern);
    }
  };
  
  // Create imprint mutation
  const createMutation = useMutation({
    mutationFn: async (data: CreateImprintFormData) => {
      const response = await apiRequest('POST', '/api/emotional-imprints', data);
      return await response.json();
    },
    onSuccess: (data) => {
      toast({
        title: 'Imprint Created',
        description: 'Your emotional imprint has been created successfully.',
      });
      
      // Invalidate queries to refresh data
      queryClient.invalidateQueries({ queryKey: ['/api/emotional-imprints'] });
      queryClient.invalidateQueries({ queryKey: ['/api/emotional-imprints/my'] });
      
      // Reset form and call success callback
      form.reset();
      if (onSuccess) {
        onSuccess(data);
      }
    },
    onError: (error: Error) => {
      toast({
        title: 'Creation Failed',
        description: `Failed to create imprint: ${error.message}`,
        variant: 'destructive',
      });
    },
  });
  
  // Update imprint mutation
  const updateMutation = useMutation({
    mutationFn: async (data: CreateImprintFormData & { id: number }) => {
      const { id, ...updateData } = data;
      const response = await apiRequest('PUT', `/api/emotional-imprints/${id}`, updateData);
      return await response.json();
    },
    onSuccess: (data) => {
      toast({
        title: 'Imprint Updated',
        description: 'Your emotional imprint has been updated successfully.',
      });
      
      // Invalidate queries to refresh data
      queryClient.invalidateQueries({ queryKey: ['/api/emotional-imprints'] });
      queryClient.invalidateQueries({ queryKey: ['/api/emotional-imprints/my'] });
      queryClient.invalidateQueries({ queryKey: [`/api/emotional-imprints/${data.id}`] });
      
      // Call success callback
      if (onSuccess) {
        onSuccess(data);
      }
    },
    onError: (error: Error) => {
      toast({
        title: 'Update Failed',
        description: `Failed to update imprint: ${error.message}`,
        variant: 'destructive',
      });
    },
  });
  
  // Handle form submission
  const onSubmit = (data: CreateImprintFormData) => {
    if (isEditing && existingImprint) {
      updateMutation.mutate({ ...data, id: existingImprint.id });
    } else {
      createMutation.mutate(data);
    }
  };
  
  // Handle cancel button click
  const handleCancel = () => {
    if (onCancel) {
      onCancel();
    }
  };
  
  return (
    <Card className="w-full max-w-4xl mx-auto">
      <CardHeader>
        <CardTitle>{isEditing ? 'Edit Emotional Imprint' : 'Create Emotional Imprint'}</CardTitle>
        <CardDescription>
          Capture your emotional state through a multi-sensory experience
        </CardDescription>
      </CardHeader>
      
      <CardContent>
        <Tabs value={activeTab} onValueChange={setActiveTab} className="space-y-4">
          <TabsList className="grid grid-cols-3 w-full">
            <TabsTrigger value="details">Basic Details</TabsTrigger>
            <TabsTrigger value="sensory">Sensory Experience</TabsTrigger>
            <TabsTrigger value="preview">Preview</TabsTrigger>
          </TabsList>
          
          <Form {...form}>
            <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-6">
              <TabsContent value="details" className="space-y-4">
                {/* Name Field */}
                <FormField
                  control={form.control}
                  name="name"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Name</FormLabel>
                      <FormControl>
                        <Input 
                          placeholder="Give your emotional imprint a name"
                          {...field}
                        />
                      </FormControl>
                      <FormDescription>
                        A name that describes your emotional state or experience
                      </FormDescription>
                      <FormMessage />
                    </FormItem>
                  )}
                />
                
                {/* Emotion Selection */}
                <FormField
                  control={form.control}
                  name="emotion"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Emotion</FormLabel>
                      <Select onValueChange={field.onChange} value={field.value}>
                        <FormControl>
                          <SelectTrigger>
                            <SelectValue placeholder="Select an emotion" />
                          </SelectTrigger>
                        </FormControl>
                        <SelectContent>
                          {emotionOptions.map(option => (
                            <SelectItem key={option} value={option}>
                              {option}
                            </SelectItem>
                          ))}
                        </SelectContent>
                      </Select>
                      <FormDescription>
                        Select the primary emotion you're experiencing
                      </FormDescription>
                      <FormMessage />
                    </FormItem>
                  )}
                />
                
                {/* Description Field */}
                <FormField
                  control={form.control}
                  name="description"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Description (Optional)</FormLabel>
                      <FormControl>
                        <Textarea 
                          placeholder="Describe your emotional experience..."
                          className="resize-none h-24"
                          {...field}
                          value={field.value || ''}
                        />
                      </FormControl>
                      <FormDescription>
                        A brief description of your emotional state or what triggered it
                      </FormDescription>
                      <FormMessage />
                    </FormItem>
                  )}
                />
                
                {/* Intensity Slider */}
                <FormField
                  control={form.control}
                  name="intensity"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Intensity: {field.value}/10</FormLabel>
                      <FormControl>
                        <Slider
                          min={1}
                          max={10}
                          step={1}
                          defaultValue={[field.value]}
                          onValueChange={(values) => field.onChange(values[0])}
                          className="py-4"
                        />
                      </FormControl>
                      <FormDescription>
                        How strongly are you experiencing this emotion?
                      </FormDescription>
                      <FormMessage />
                    </FormItem>
                  )}
                />
                
                {/* Privacy Setting */}
                <FormField
                  control={form.control}
                  name="isPrivate"
                  render={({ field }) => (
                    <FormItem className="flex flex-row items-center justify-between rounded-lg border p-4">
                      <div className="space-y-0.5">
                        <FormLabel className="text-base">
                          Private Imprint
                        </FormLabel>
                        <FormDescription>
                          Only visible to you and those you explicitly share with
                        </FormDescription>
                      </div>
                      <FormControl>
                        <Switch
                          checked={field.value}
                          onCheckedChange={field.onChange}
                        />
                      </FormControl>
                    </FormItem>
                  )}
                />
              </TabsContent>
              
              <TabsContent value="sensory" className="space-y-4">
                {/* Color Selection */}
                <FormField
                  control={form.control}
                  name="colorCode"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Color</FormLabel>
                      <FormControl>
                        <RadioGroup
                          onValueChange={field.onChange}
                          value={field.value}
                          className="grid grid-cols-4 gap-4 pt-2"
                        >
                          {Object.entries(colorOptions).map(([key, color]) => (
                            <div key={key} className="flex items-center space-x-2">
                              <RadioGroupItem
                                value={key}
                                id={`color-${key}`}
                                className="peer sr-only"
                              />
                              <Label
                                htmlFor={`color-${key}`}
                                className="flex flex-col items-center justify-center rounded-md border-2 border-muted bg-popover p-4 hover:bg-accent hover:text-accent-foreground peer-data-[state=checked]:border-primary transition-all"
                              >
                                <div
                                  className="w-12 h-12 rounded-full mb-2"
                                  style={{ backgroundColor: color }}
                                ></div>
                                <div className="text-sm font-medium">{key}</div>
                              </Label>
                            </div>
                          ))}
                        </RadioGroup>
                      </FormControl>
                      <FormDescription>
                        Select a color that represents your emotion
                      </FormDescription>
                      <FormMessage />
                    </FormItem>
                  )}
                />
                
                {/* Sound Selection */}
                <FormField
                  control={form.control}
                  name="soundId"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Sound (Optional)</FormLabel>
                      <div className="flex items-center space-x-2 mb-2">
                        <Select onValueChange={(value) => {
                          field.onChange(value);
                          setIsPlaying(false);
                        }} value={field.value || ''}>
                          <FormControl>
                            <SelectTrigger className="flex-1">
                              <SelectValue placeholder="Select a sound" />
                            </SelectTrigger>
                          </FormControl>
                          <SelectContent>
                            <SelectItem value="">No Sound</SelectItem>
                            {soundOptions.map(sound => (
                              <SelectItem key={sound.id} value={sound.id}>
                                {sound.name}
                              </SelectItem>
                            ))}
                          </SelectContent>
                        </Select>
                        
                        {field.value && (
                          <>
                            <Button
                              type="button"
                              variant="outline"
                              size="icon"
                              onClick={togglePlay}
                            >
                              {isPlaying ? <Pause className="h-4 w-4" /> : <Play className="h-4 w-4" />}
                            </Button>
                            
                            <Button
                              type="button"
                              variant="outline"
                              size="icon"
                              onClick={toggleMute}
                              disabled={!isPlaying}
                            >
                              {isMuted ? <VolumeX className="h-4 w-4" /> : <Volume2 className="h-4 w-4" />}
                            </Button>
                          </>
                        )}
                      </div>
                      <FormDescription>
                        Choose a sound that complements your emotional state
                      </FormDescription>
                      <FormMessage />
                    </FormItem>
                  )}
                />
                
                {/* Vibration Selection */}
                <FormField
                  control={form.control}
                  name="vibrationPattern"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Vibration Pattern (Optional)</FormLabel>
                      <div className="flex items-center space-x-2">
                        <Select onValueChange={field.onChange} value={field.value || ''}>
                          <FormControl>
                            <SelectTrigger className="flex-1">
                              <SelectValue placeholder="Select a vibration pattern" />
                            </SelectTrigger>
                          </FormControl>
                          <SelectContent>
                            <SelectItem value="">No Vibration</SelectItem>
                            {vibrationOptions.map(vibration => (
                              <SelectItem key={vibration.id} value={vibration.id}>
                                {vibration.name}
                              </SelectItem>
                            ))}
                          </SelectContent>
                        </Select>
                        
                        {field.value && (
                          <Button
                            type="button"
                            variant="outline"
                            size="sm"
                            onClick={activateVibration}
                          >
                            Test
                          </Button>
                        )}
                      </div>
                      <FormDescription>
                        Select a vibration pattern that matches your emotional rhythm
                      </FormDescription>
                      <FormMessage />
                    </FormItem>
                  )}
                />
              </TabsContent>
              
              <TabsContent value="preview" className="py-4">
                <div className="border rounded-lg p-6 bg-accent/10">
                  <h3 className="text-lg font-medium mb-4">Imprint Preview</h3>
                  {previewImprint ? (
                    <ImprintViewer imprint={previewImprint} isPreview={true} />
                  ) : (
                    <p className="text-muted-foreground text-center py-8">
                      Complete the form to see a preview of your emotional imprint
                    </p>
                  )}
                </div>
              </TabsContent>
              
              <div className="flex justify-end gap-2 pt-4">
                <Button
                  type="button"
                  variant="outline"
                  onClick={handleCancel}
                >
                  Cancel
                </Button>
                <Button
                  type="submit"
                  disabled={createMutation.isPending || updateMutation.isPending}
                >
                  {createMutation.isPending || updateMutation.isPending ? (
                    <>
                      <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                      {isEditing ? 'Updating...' : 'Creating...'}
                    </>
                  ) : (
                    <>
                      <Save className="mr-2 h-4 w-4" />
                      {isEditing ? 'Update Imprint' : 'Create Imprint'}
                    </>
                  )}
                </Button>
              </div>
            </form>
          </Form>
        </Tabs>
      </CardContent>
    </Card>
  );
};

export default EmotionalImprintCreator;