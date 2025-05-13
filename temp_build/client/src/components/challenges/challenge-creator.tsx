import { useState } from 'react';
import { useAuth } from '@/hooks/use-auth';
import { useToast } from '@/hooks/use-toast';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import { useMutation, useQueryClient } from '@tanstack/react-query';
import { apiRequest } from '@/lib/queryClient';
import { ChallengeDifficulty } from '@shared/schema';

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
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import { Button } from '@/components/ui/button';
import {
  Card,
  CardContent,
  CardDescription,
  CardFooter,
  CardHeader,
  CardTitle,
} from '@/components/ui/card';
import { Checkbox } from '@/components/ui/checkbox';
import { PlusCircle, Save, Award, Loader2 } from 'lucide-react';

// Define challenge categories
const challengeCategories = [
  'Mindfulness',
  'Physical Activity',
  'Sleep',
  'Nutrition',
  'Social Connection',
  'Gratitude',
  'Stress Reduction',
  'Creativity',
  'Learning',
  'Productivity',
  'Personal Growth',
  'Environmental',
  'Financial Wellbeing',
  'Work-Life Balance',
  'Emotional Intelligence',
];

// Define form validation schema
const challengeFormSchema = z.object({
  title: z.string().min(5, 'Title must be at least 5 characters').max(100, 'Title cannot exceed 100 characters'),
  description: z.string().min(20, 'Description must be at least 20 characters').max(500, 'Description cannot exceed 500 characters'),
  category: z.string().min(1, 'Please select a category'),
  difficulty: z.enum(['easy', 'moderate', 'hard', 'extreme']),
  targetValue: z.number().min(1, 'Target value must be at least 1').max(100, 'Target value cannot exceed 100'),
  isPublic: z.boolean().default(true),
  tags: z.string().optional(),
});

type ChallengeFormValues = z.infer<typeof challengeFormSchema>;

export default function ChallengeCreator() {
  const { user } = useAuth();
  const { toast } = useToast();
  const queryClient = useQueryClient();
  const [isCreatingChallenge, setIsCreatingChallenge] = useState(false);
  
  const form = useForm<ChallengeFormValues>({
    resolver: zodResolver(challengeFormSchema),
    defaultValues: {
      title: '',
      description: '',
      category: '',
      difficulty: 'moderate',
      targetValue: 1,
      isPublic: true,
      tags: '',
    },
  });

  const createChallengeMutation = useMutation({
    mutationFn: async (values: ChallengeFormValues) => {
      return await apiRequest('POST', '/api/challenges/create', values);
    },
    onSuccess: () => {
      toast({
        title: 'Challenge Created',
        description: 'Your challenge has been created successfully. You will earn 3 tokens when someone completes it!',
      });
      form.reset();
      setIsCreatingChallenge(false);
      queryClient.invalidateQueries({ queryKey: ['/api/gamification/challenges'] });
      queryClient.invalidateQueries({ queryKey: ['/api/tokens'] });
    },
    onError: (error: Error) => {
      toast({
        title: 'Failed to Create Challenge',
        description: error.message || 'There was an error creating your challenge. Please try again.',
        variant: 'destructive',
      });
    },
  });

  const onSubmit = (data: ChallengeFormValues) => {
    if (!user?.isPremium) {
      toast({
        title: 'Premium Feature',
        description: 'Challenge creation is a premium feature. Upgrade to create custom challenges.',
        variant: 'destructive',
      });
      return;
    }
    
    createChallengeMutation.mutate(data);
  };

  if (!user?.isPremium && !isCreatingChallenge) {
    return (
      <Card className="border-dashed border-2 border-gray-300 bg-gray-50">
        <CardContent className="pt-6 text-center">
          <Award className="h-12 w-12 text-primary mb-3 mx-auto" />
          <h3 className="text-lg font-medium mb-2">Premium Feature</h3>
          <p className="text-muted-foreground text-sm mb-4">
            Challenge creation is a premium feature that lets you create personalized
            challenges for friends, family, and other users.
          </p>
          <p className="text-muted-foreground text-sm mb-4">
            <span className="font-medium">Earn 3 tokens</span> each time someone completes a challenge you create!
          </p>
          <Button variant="default" disabled>Upgrade to Premium</Button>
        </CardContent>
      </Card>
    );
  }

  if (!isCreatingChallenge) {
    return (
      <Card className="border-dashed border-2 border-primary/20 bg-primary/5">
        <CardContent className="pt-6 text-center">
          <PlusCircle className="h-12 w-12 text-primary mb-3 mx-auto" />
          <h3 className="text-lg font-medium mb-2">Create a Challenge</h3>
          <p className="text-muted-foreground text-sm mb-4">
            Create personalized challenges for friends, family, and other users to improve mental health and wellbeing.
          </p>
          <p className="text-muted-foreground text-sm mb-4">
            <span className="font-medium">Earn 3 tokens</span> each time someone completes a challenge you create!
          </p>
          <Button variant="default" onClick={() => setIsCreatingChallenge(true)}>
            Create Challenge
          </Button>
        </CardContent>
      </Card>
    );
  }

  return (
    <Card>
      <CardHeader>
        <CardTitle>Create a Custom Challenge</CardTitle>
        <CardDescription>
          Design a mental health or wellbeing challenge for the community. You'll earn 3 tokens each time someone completes your challenge!
        </CardDescription>
      </CardHeader>
      <CardContent>
        <Form {...form}>
          <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-6">
            <FormField
              control={form.control}
              name="title"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Challenge Title</FormLabel>
                  <FormControl>
                    <Input placeholder="Enter a catchy title" {...field} />
                  </FormControl>
                  <FormDescription>
                    Be clear and motivating with your title
                  </FormDescription>
                  <FormMessage />
                </FormItem>
              )}
            />

            <FormField
              control={form.control}
              name="description"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Description</FormLabel>
                  <FormControl>
                    <Textarea 
                      placeholder="Describe the challenge, its benefits, and how to complete it" 
                      className="min-h-32" 
                      {...field} 
                    />
                  </FormControl>
                  <FormDescription>
                    Include clear instructions and benefits
                  </FormDescription>
                  <FormMessage />
                </FormItem>
              )}
            />

            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <FormField
                control={form.control}
                name="category"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Category</FormLabel>
                    <Select onValueChange={field.onChange} defaultValue={field.value}>
                      <FormControl>
                        <SelectTrigger>
                          <SelectValue placeholder="Select a category" />
                        </SelectTrigger>
                      </FormControl>
                      <SelectContent>
                        {challengeCategories.map((category) => (
                          <SelectItem key={category} value={category.toLowerCase()}>
                            {category}
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                    <FormMessage />
                  </FormItem>
                )}
              />

              <FormField
                control={form.control}
                name="difficulty"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Difficulty Level</FormLabel>
                    <Select onValueChange={field.onChange} defaultValue={field.value}>
                      <FormControl>
                        <SelectTrigger>
                          <SelectValue placeholder="Select difficulty" />
                        </SelectTrigger>
                      </FormControl>
                      <SelectContent>
                        <SelectItem value="easy">Easy</SelectItem>
                        <SelectItem value="moderate">Moderate</SelectItem>
                        <SelectItem value="hard">Hard</SelectItem>
                        <SelectItem value="extreme">Extreme</SelectItem>
                      </SelectContent>
                    </Select>
                    <FormMessage />
                  </FormItem>
                )}
              />
            </div>

            <FormField
              control={form.control}
              name="targetValue"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Target Value</FormLabel>
                  <FormControl>
                    <Input 
                      type="number" 
                      min={1} 
                      max={100} 
                      placeholder="How many times/days to complete" 
                      {...field} 
                      onChange={(e) => field.onChange(parseInt(e.target.value) || 1)}
                    />
                  </FormControl>
                  <FormDescription>
                    This could be days, repetitions, or minutes depending on your challenge
                  </FormDescription>
                  <FormMessage />
                </FormItem>
              )}
            />

            <FormField
              control={form.control}
              name="tags"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Tags (Optional)</FormLabel>
                  <FormControl>
                    <Input placeholder="Enter comma-separated tags" {...field} />
                  </FormControl>
                  <FormDescription>
                    Add tags to help others find your challenge
                  </FormDescription>
                  <FormMessage />
                </FormItem>
              )}
            />

            <FormField
              control={form.control}
              name="isPublic"
              render={({ field }) => (
                <FormItem className="flex flex-row items-start space-x-3 space-y-0 rounded-md border p-4">
                  <FormControl>
                    <Checkbox
                      checked={field.value}
                      onCheckedChange={field.onChange}
                    />
                  </FormControl>
                  <div className="space-y-1 leading-none">
                    <FormLabel>Make this challenge public</FormLabel>
                    <FormDescription>
                      Public challenges are available to all users. Private challenges are only available to those you share them with.
                    </FormDescription>
                  </div>
                </FormItem>
              )}
            />

            <div className="flex space-x-2">
              <Button variant="outline" type="button" onClick={() => setIsCreatingChallenge(false)}>
                Cancel
              </Button>
              <Button 
                type="submit" 
                disabled={createChallengeMutation.isPending}
              >
                {createChallengeMutation.isPending ? (
                  <>
                    <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                    Creating...
                  </>
                ) : (
                  <>
                    <Save className="mr-2 h-4 w-4" />
                    Create Challenge
                  </>
                )}
              </Button>
            </div>
          </form>
        </Form>
      </CardContent>
    </Card>
  );
}