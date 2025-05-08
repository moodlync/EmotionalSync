import { useState, useEffect } from 'react';
import { useAuth } from '@/hooks/use-auth';
import { useMutation } from '@tanstack/react-query';
import { apiRequest, queryClient } from '@/lib/queryClient';
import { useToast } from '@/hooks/use-toast';
import { zodResolver } from '@hookform/resolvers/zod';
import { useForm } from 'react-hook-form';
import { z } from 'zod';
import {
  Form,
  FormControl,
  FormDescription,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from '@/components/ui/form';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Loader2, Lock, Check, Info, User, PenLine, RefreshCcw } from 'lucide-react';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import { 
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from '@/components/ui/tooltip';
import {
  Card,
  CardContent,
  CardDescription,
  CardFooter,
  CardHeader,
  CardTitle,
} from '@/components/ui/card';
import { Switch } from '@/components/ui/switch';
import { Badge } from '@/components/ui/badge';
import { Separator } from '@/components/ui/separator';

// Define form schema with Zod
const profileFormSchema = z.object({
  displayName: z.string()
    .min(2, { message: "Display name must be at least 2 characters." })
    .max(30, { message: "Display name must be no more than 30 characters." })
    .regex(/^[a-zA-Z0-9\s_\-\.]+$/, { 
      message: "Display name can only contain letters, numbers, spaces, underscores, hyphens, and periods." 
    })
    .optional(),
  bio: z.string()
    .max(250, { message: "Bio must be no more than 250 characters." })
    .optional(),
  theme: z.enum(['light', 'dark', 'system']).optional(),
  language: z.enum(['en', 'es', 'fr', 'de', 'zh', 'ja', 'ko', 'ru']).optional(),
  dailyReminder: z.boolean().optional(),
  weeklyInsights: z.boolean().optional(),
  publicProfileLink: z.string()
    .regex(/^[a-zA-Z0-9_]+$/, { 
      message: "Custom URL can only contain letters, numbers, and underscores" 
    })
    .min(3, { message: "Custom URL must be at least 3 characters." })
    .max(30, { message: "Custom URL must be no more than 30 characters." })
    .optional(),
  moodGoal: z.enum(['improve_mindfulness', 'track_stress', 'better_sleep', 'reduce_anxiety', 'increase_happiness']).optional(),
  dailyCheckInTime: z.string().optional(),
});

type ProfileFormValues = z.infer<typeof profileFormSchema>;

export default function ProfileInformationForm() {
  const { user } = useAuth();
  const { toast } = useToast();
  const [isEditing, setIsEditing] = useState(false);

  // Define form with default values
  const form = useForm<ProfileFormValues>({
    resolver: zodResolver(profileFormSchema),
    defaultValues: {
      displayName: user?.displayName || '',
      bio: user?.bio || '',
      theme: (user?.theme as any) || 'system',
      language: (user?.language as any) || 'en',
      dailyReminder: user?.notificationSettings?.dailyReminder || false,
      weeklyInsights: user?.notificationSettings?.weeklyInsights || false,
      publicProfileLink: user?.publicProfileLink || '',
      moodGoal: (user?.moodGoal as any) || undefined,
      dailyCheckInTime: user?.dailyCheckInTime || '08:00',
    },
  });

  // Update form values when user data changes
  useEffect(() => {
    if (user) {
      form.reset({
        displayName: user.displayName || '',
        bio: user.bio || '',
        theme: (user?.theme as any) || 'system',
        language: (user?.language as any) || 'en',
        dailyReminder: user?.notificationSettings?.dailyReminder || false,
        weeklyInsights: user?.notificationSettings?.weeklyInsights || false,
        publicProfileLink: user?.publicProfileLink || '',
        moodGoal: (user?.moodGoal as any) || undefined,
        dailyCheckInTime: user?.dailyCheckInTime || '08:00',
      });
    }
  }, [user, form]);

  // Mutation to update profile information
  const updateProfileMutation = useMutation({
    mutationFn: async (data: ProfileFormValues) => {
      const response = await apiRequest('POST', '/api/profile/update', data);
      return response.json();
    },
    onSuccess: (data) => {
      // Update user data in cache
      queryClient.setQueryData(['/api/user'], (oldData: any) => {
        return { ...oldData, ...data };
      });
      
      toast({
        title: "Profile Updated",
        description: "Your profile information has been updated successfully",
      });
      
      setIsEditing(false);
    },
    onError: (error: Error) => {
      toast({
        title: "Failed to update profile",
        description: error.message,
        variant: "destructive",
      });
    }
  });

  // Handle form submission
  const onSubmit = (data: ProfileFormValues) => {
    updateProfileMutation.mutate(data);
  };
  
  // Handle reverting changes
  const handleRevertChanges = () => {
    if (user) {
      form.reset({
        displayName: user.displayName || '',
        bio: user.bio || '',
        theme: (user?.theme as any) || 'system',
        language: (user?.language as any) || 'en',
        dailyReminder: user?.notificationSettings?.dailyReminder || false,
        weeklyInsights: user?.notificationSettings?.weeklyInsights || false,
        publicProfileLink: user?.publicProfileLink || '',
        moodGoal: (user?.moodGoal as any) || undefined,
        dailyCheckInTime: user?.dailyCheckInTime || '08:00',
      });
      toast({
        title: "Changes Reverted",
        description: "Your changes have been discarded and the original values restored",
      });
    }
  };

  const formattedUsername = user?.username || '';
  const memberSince = user?.createdAt ? new Date(user.createdAt).toLocaleDateString('en-US', {
    year: 'numeric',
    month: 'long',
    day: 'numeric',
  }) : 'Unknown';
  
  const isPending = updateProfileMutation.isPending;

  return (
    <Card>
      <CardHeader>
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2">
            <User className="h-5 w-5" />
            <CardTitle>Account Information</CardTitle>
          </div>
          <Button
            variant={isEditing ? "outline" : "default"}
            size="sm"
            onClick={() => setIsEditing(!isEditing)}
            disabled={isPending}
          >
            {isEditing ? (
              <>
                <RefreshCcw className="h-4 w-4 mr-2" />
                Cancel
              </>
            ) : (
              <>
                <PenLine className="h-4 w-4 mr-2" />
                Edit Profile
              </>
            )}
          </Button>
        </div>
        <CardDescription>
          {isEditing ? 
            "Edit your personal details and preferences" : 
            "Your personal details and account preferences"}
        </CardDescription>
      </CardHeader>
      <CardContent>
        <Form {...form}>
          <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-6">
            {/* Personal Information Section */}
            <div>
              <h3 className="text-lg font-medium mb-4">Personal Information</h3>
              
              {/* Display Only Fields */}
              {!isEditing && (
                <div className="space-y-6">
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div className="space-y-2">
                      <h4 className="text-sm font-medium text-muted-foreground">Username</h4>
                      <div className="flex items-center gap-2">
                        <p className="text-lg font-medium">{formattedUsername}</p>
                        <TooltipProvider>
                          <Tooltip>
                            <TooltipTrigger asChild>
                              <Badge variant="outline" className="ml-2 cursor-help">
                                <Lock className="h-3 w-3 mr-1" />
                                Locked
                              </Badge>
                            </TooltipTrigger>
                            <TooltipContent>
                              <p className="text-xs">Username cannot be changed for security reasons</p>
                            </TooltipContent>
                          </Tooltip>
                        </TooltipProvider>
                      </div>
                    </div>
                    
                    <div className="space-y-2">
                      <h4 className="text-sm font-medium text-muted-foreground">Member Since</h4>
                      <div className="flex items-center gap-2">
                        <p className="text-lg font-medium">{memberSince}</p>
                        <TooltipProvider>
                          <Tooltip>
                            <TooltipTrigger asChild>
                              <Badge variant="outline" className="ml-2 cursor-help">
                                <Lock className="h-3 w-3 mr-1" />
                                Locked
                              </Badge>
                            </TooltipTrigger>
                            <TooltipContent>
                              <p className="text-xs">Account creation date is automatically recorded</p>
                            </TooltipContent>
                          </Tooltip>
                        </TooltipProvider>
                      </div>
                    </div>
                  </div>

                  <div className="space-y-2">
                    <h4 className="text-sm font-medium text-muted-foreground">Display Name</h4>
                    <p className="text-lg font-medium">{form.getValues().displayName || formattedUsername}</p>
                  </div>
                  
                  <div className="space-y-2">
                    <h4 className="text-sm font-medium text-muted-foreground">Bio</h4>
                    <p className="text-gray-700 dark:text-gray-300">{form.getValues().bio || "No bio provided."}</p>
                  </div>
                </div>
              )}
              
              {/* Editable Fields */}
              {isEditing && (
                <div className="space-y-6">
                  {/* Username and Creation Date - Read Only */}
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div className="space-y-2">
                      <FormLabel className="flex items-center gap-1">
                        Username
                        <Lock className="h-3 w-3 ml-1 text-muted-foreground" />
                      </FormLabel>
                      <Input value={formattedUsername} disabled className="bg-muted" />
                      <p className="text-xs text-muted-foreground">
                        Username cannot be changed for security reasons
                      </p>
                    </div>
                    
                    <div className="space-y-2">
                      <FormLabel className="flex items-center gap-1">
                        Member Since
                        <Lock className="h-3 w-3 ml-1 text-muted-foreground" />
                      </FormLabel>
                      <Input value={memberSince} disabled className="bg-muted" />
                      <p className="text-xs text-muted-foreground">
                        Account creation date is automatically recorded
                      </p>
                    </div>
                  </div>
                  
                  {/* Display Name */}
                  <FormField
                    control={form.control}
                    name="displayName"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Display Name</FormLabel>
                        <FormControl>
                          <Input placeholder="Enter a display name" {...field} />
                        </FormControl>
                        <FormDescription>
                          This is how your name will appear across the platform
                        </FormDescription>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                  
                  {/* Bio */}
                  <FormField
                    control={form.control}
                    name="bio"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Bio</FormLabel>
                        <FormControl>
                          <Textarea 
                            placeholder="Tell us a little about yourself"
                            className="min-h-[100px]" 
                            {...field} 
                          />
                        </FormControl>
                        <FormDescription className="flex justify-between">
                          <span>A brief description about yourself</span>
                          <span>{field.value?.length || 0}/250</span>
                        </FormDescription>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                </div>
              )}
            </div>
            
            <Separator />
            
            {/* Preferences Section */}
            <div>
              <h3 className="text-lg font-medium mb-4">Preferences</h3>
              
              {!isEditing ? (
                <div className="space-y-4">
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div className="space-y-2">
                      <h4 className="text-sm font-medium text-muted-foreground">Theme</h4>
                      <p className="text-lg font-medium capitalize">{form.getValues().theme || "System"}</p>
                    </div>
                    
                    <div className="space-y-2">
                      <h4 className="text-sm font-medium text-muted-foreground">Language</h4>
                      <p className="text-lg font-medium">{getLanguageName(form.getValues().language || "en")}</p>
                    </div>
                  </div>
                  
                  <div className="space-y-2">
                    <h4 className="text-sm font-medium text-muted-foreground">Daily Check-In Time</h4>
                    <p className="text-lg font-medium">
                      {formatTime(form.getValues().dailyCheckInTime || "08:00")}
                    </p>
                  </div>
                  
                  <div className="space-y-2">
                    <h4 className="text-sm font-medium text-muted-foreground">Mood Goal</h4>
                    <p className="text-lg font-medium capitalize">
                      {form.getValues().moodGoal ? form.getValues().moodGoal.replace(/_/g, ' ') : "Not Set"}
                    </p>
                  </div>
                  
                  <div className="space-y-2">
                    <h4 className="text-sm font-medium text-muted-foreground">Notification Preferences</h4>
                    <div className="space-y-2">
                      <div className="flex items-center justify-between">
                        <span>Daily Mood Reminders</span>
                        <Badge variant={form.getValues().dailyReminder ? "default" : "outline"}>
                          {form.getValues().dailyReminder ? "Enabled" : "Disabled"}
                        </Badge>
                      </div>
                      <div className="flex items-center justify-between">
                        <span>Weekly Insights</span>
                        <Badge variant={form.getValues().weeklyInsights ? "default" : "outline"}>
                          {form.getValues().weeklyInsights ? "Enabled" : "Disabled"}
                        </Badge>
                      </div>
                    </div>
                  </div>
                </div>
              ) : (
                <div className="space-y-6">
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    {/* Theme */}
                    <FormField
                      control={form.control}
                      name="theme"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel>Theme</FormLabel>
                          <Select
                            onValueChange={field.onChange}
                            defaultValue={field.value}
                          >
                            <FormControl>
                              <SelectTrigger>
                                <SelectValue placeholder="Select a theme" />
                              </SelectTrigger>
                            </FormControl>
                            <SelectContent>
                              <SelectItem value="light">Light</SelectItem>
                              <SelectItem value="dark">Dark</SelectItem>
                              <SelectItem value="system">System</SelectItem>
                            </SelectContent>
                          </Select>
                          <FormDescription>
                            Choose your preferred visual theme
                          </FormDescription>
                          <FormMessage />
                        </FormItem>
                      )}
                    />
                    
                    {/* Language */}
                    <FormField
                      control={form.control}
                      name="language"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel>Language</FormLabel>
                          <Select
                            onValueChange={field.onChange}
                            defaultValue={field.value}
                          >
                            <FormControl>
                              <SelectTrigger>
                                <SelectValue placeholder="Select a language" />
                              </SelectTrigger>
                            </FormControl>
                            <SelectContent>
                              <SelectItem value="en">English</SelectItem>
                              <SelectItem value="es">Spanish (Español)</SelectItem>
                              <SelectItem value="fr">French (Français)</SelectItem>
                              <SelectItem value="de">German (Deutsch)</SelectItem>
                              <SelectItem value="zh">Chinese (中文)</SelectItem>
                              <SelectItem value="ja">Japanese (日本語)</SelectItem>
                              <SelectItem value="ko">Korean (한국어)</SelectItem>
                              <SelectItem value="ru">Russian (Русский)</SelectItem>
                            </SelectContent>
                          </Select>
                          <FormDescription>
                            Choose your preferred language
                          </FormDescription>
                          <FormMessage />
                        </FormItem>
                      )}
                    />
                  </div>
                  
                  {/* Daily Check-In Time */}
                  <FormField
                    control={form.control}
                    name="dailyCheckInTime"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Daily Check-In Time</FormLabel>
                        <FormControl>
                          <Input type="time" {...field} />
                        </FormControl>
                        <FormDescription>
                          Set your preferred daily mood check-in time
                        </FormDescription>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                  
                  {/* Mood Goal */}
                  <FormField
                    control={form.control}
                    name="moodGoal"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Mood Goal</FormLabel>
                        <Select
                          onValueChange={field.onChange}
                          defaultValue={field.value}
                        >
                          <FormControl>
                            <SelectTrigger>
                              <SelectValue placeholder="Select a mood goal" />
                            </SelectTrigger>
                          </FormControl>
                          <SelectContent>
                            <SelectItem value="improve_mindfulness">Improve Mindfulness</SelectItem>
                            <SelectItem value="track_stress">Track Stress Triggers</SelectItem>
                            <SelectItem value="better_sleep">Better Sleep</SelectItem>
                            <SelectItem value="reduce_anxiety">Reduce Anxiety</SelectItem>
                            <SelectItem value="increase_happiness">Increase Happiness</SelectItem>
                          </SelectContent>
                        </Select>
                        <FormDescription>
                          Set a primary goal for your mood tracking
                        </FormDescription>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                  
                  {/* Notification Preferences */}
                  <div className="space-y-4">
                    <FormLabel>Notification Preferences</FormLabel>
                    
                    <FormField
                      control={form.control}
                      name="dailyReminder"
                      render={({ field }) => (
                        <FormItem className="flex flex-row items-center justify-between rounded-lg border p-3 shadow-sm">
                          <div className="space-y-0.5">
                            <FormLabel className="text-base">Daily Mood Reminders</FormLabel>
                            <FormDescription>
                              Receive daily notifications to track your mood
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
                    
                    <FormField
                      control={form.control}
                      name="weeklyInsights"
                      render={({ field }) => (
                        <FormItem className="flex flex-row items-center justify-between rounded-lg border p-3 shadow-sm">
                          <div className="space-y-0.5">
                            <FormLabel className="text-base">Weekly Insights</FormLabel>
                            <FormDescription>
                              Receive weekly reports on your emotional trends
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
                  </div>
                </div>
              )}
            </div>
            
            <Separator />
            
            {/* Social Integration Section */}
            <div>
              <h3 className="text-lg font-medium mb-4">Social Integration</h3>
              
              {!isEditing ? (
                <div className="space-y-4">
                  <div className="space-y-2">
                    <h4 className="text-sm font-medium text-muted-foreground">Public Profile Link</h4>
                    <p className="text-lg font-medium">
                      {form.getValues().publicProfileLink ? 
                        `moodsync.com/@${form.getValues().publicProfileLink}` : 
                        "Not set"}
                    </p>
                  </div>
                </div>
              ) : (
                <div className="space-y-6">
                  {/* Custom URL */}
                  <FormField
                    control={form.control}
                    name="publicProfileLink"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Custom Profile URL</FormLabel>
                        <div className="flex items-center">
                          <span className="bg-muted px-3 py-2 rounded-l-md border border-r-0 border-input text-muted-foreground">
                            moodsync.com/@
                          </span>
                          <FormControl>
                            <Input 
                              className="rounded-l-none" 
                              placeholder="username" 
                              {...field} 
                            />
                          </FormControl>
                        </div>
                        <FormDescription>
                          Create a custom URL for your public profile (letters, numbers, underscores only)
                        </FormDescription>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                </div>
              )}
            </div>
            
            {/* Security Message - Only visible when editing */}
            {isEditing && (
              <div className="mt-6 p-3 border rounded-md bg-slate-50 dark:bg-slate-900 dark:border-slate-800">
                <div className="flex items-center gap-2 text-amber-600">
                  <Info className="h-4 w-4" />
                  <p className="text-sm font-medium">Security Assurance</p>
                </div>
                <p className="text-xs text-slate-600 dark:text-slate-400 mt-1">
                  Your security is our priority. Locked fields protect your account from unauthorized changes. 
                  Your username and account creation date cannot be modified for security reasons.
                </p>
              </div>
            )}
            
            {/* Form Actions */}
            {isEditing && (
              <div className="flex flex-wrap gap-3 mt-6">
                <Button 
                  type="button" 
                  variant="outline" 
                  onClick={() => setIsEditing(false)}
                  disabled={isPending}
                  className="mr-auto"
                >
                  <RefreshCcw className="h-4 w-4 mr-2" />
                  Cancel
                </Button>
                
                <Button 
                  type="button" 
                  variant="secondary" 
                  onClick={handleRevertChanges}
                  disabled={isPending || !form.formState.isDirty}
                >
                  <RefreshCcw className="h-4 w-4 mr-2" />
                  Revert Changes
                </Button>
                
                <Button 
                  type="submit"
                  disabled={isPending || !form.formState.isDirty}
                >
                  {isPending ? (
                    <>
                      <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                      Saving...
                    </>
                  ) : (
                    <>
                      <Check className="h-4 w-4 mr-2" />
                      Save Changes
                    </>
                  )}
                </Button>
              </div>
            )}
          </form>
        </Form>
      </CardContent>
    </Card>
  );
}

// Helper functions
function getLanguageName(code: string): string {
  const languages = {
    en: 'English',
    es: 'Spanish (Español)',
    fr: 'French (Français)',
    de: 'German (Deutsch)',
    zh: 'Chinese (中文)',
    ja: 'Japanese (日本語)',
    ko: 'Korean (한국어)',
    ru: 'Russian (Русский)',
  };
  
  return languages[code as keyof typeof languages] || code;
}

function formatTime(timeString: string): string {
  try {
    const [hours, minutes] = timeString.split(':');
    const date = new Date();
    date.setHours(parseInt(hours, 10));
    date.setMinutes(parseInt(minutes, 10));
    
    return date.toLocaleTimeString('en-US', {
      hour: 'numeric',
      minute: '2-digit',
      hour12: true,
    });
  } catch (e) {
    return timeString;
  }
}