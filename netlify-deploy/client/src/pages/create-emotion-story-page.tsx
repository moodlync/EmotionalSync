import { useState } from "react";
import { useLocation } from "wouter";
import { useMutation } from "@tanstack/react-query";
import { zodResolver } from "@hookform/resolvers/zod";
import { useForm } from "react-hook-form";
import { z } from "zod";
import { insertEmotionStorySchema } from "@shared/emotion-story-schema";
import { queryClient, apiRequest } from "@/lib/queryClient";

import { Button } from "@/components/ui/button";
import {
  Form,
  FormControl,
  FormDescription,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from "@/components/ui/form";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Switch } from "@/components/ui/switch";
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { X, Plus } from "lucide-react";
import { toast } from "@/hooks/use-toast";
import { useAuth } from "@/hooks/use-auth";

// Create a form schema based on the emotion story schema
const formSchema = insertEmotionStorySchema
  .omit({ userId: true })
  .extend({
    tags: z.array(z.string()).optional().default([]),
    emotionalArc: z
      .object({
        start: z.string().optional(),
        peak: z.string().optional(),
        end: z.string().optional(),
        resolution: z.string().optional(),
      })
      .optional()
      .default({}),
  });

type FormValues = z.infer<typeof formSchema>;

export default function CreateEmotionStoryPage() {
  const [, navigate] = useLocation();
  const { user } = useAuth();
  const [tagInput, setTagInput] = useState("");

  // Set up form with default values
  const form = useForm<FormValues>({
    resolver: zodResolver(formSchema),
    defaultValues: {
      title: "",
      description: "",
      coverImage: "",
      isPublic: 1,
      allowComments: 1,
      tags: [],
      theme: "default",
      emotionalArc: {
        start: "",
        peak: "",
        end: "",
        resolution: "",
      },
    },
  });

  // Set up mutation for creating a story
  const createStoryMutation = useMutation({
    mutationFn: async (data: FormValues) => {
      const res = await apiRequest("POST", "/api/emotion-stories", data);
      if (!res.ok) {
        const errorData = await res.json();
        throw new Error(errorData.error || "Failed to create story");
      }
      return res.json();
    },
    onSuccess: () => {
      // Invalidate the stories query to refresh the list
      queryClient.invalidateQueries({ queryKey: ["/api/emotion-stories"] });
      queryClient.invalidateQueries({ queryKey: ["/api/emotion-stories/my"] });
      
      toast({
        title: "Story created successfully",
        description: "You can now add emotional moments to your story.",
      });
      
      // Navigate to the stories page
      navigate("/emotion-stories");
    },
    onError: (error: Error) => {
      toast({
        title: "Failed to create story",
        description: error.message,
        variant: "destructive",
      });
    },
  });

  // Handle form submission
  const onSubmit = (data: FormValues) => {
    createStoryMutation.mutate(data);
  };

  // Add a tag to the list
  const addTag = () => {
    if (!tagInput.trim()) return;
    
    const currentTags = form.getValues("tags") || [];
    
    // Don't add duplicates
    if (currentTags.includes(tagInput.trim())) {
      setTagInput("");
      return;
    }
    
    form.setValue("tags", [...currentTags, tagInput.trim()]);
    setTagInput("");
  };

  // Remove a tag from the list
  const removeTag = (tagToRemove: string) => {
    const currentTags = form.getValues("tags") || [];
    form.setValue(
      "tags",
      currentTags.filter((tag) => tag !== tagToRemove)
    );
  };

  // Handle tag input key press (Enter to add)
  const handleTagKeyPress = (e: React.KeyboardEvent) => {
    if (e.key === "Enter") {
      e.preventDefault();
      addTag();
    }
  };

  return (
    <div className="container py-8 max-w-3xl">
      <div className="mb-8">
        <h1 className="text-3xl font-bold tracking-tight">Create Emotion Story</h1>
        <p className="text-muted-foreground mt-1">
          Start crafting your emotional journey by creating a new story
        </p>
      </div>

      <Card>
        <CardContent className="pt-6">
          <Form {...form}>
            <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-6">
              <FormField
                control={form.control}
                name="title"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Story Title</FormLabel>
                    <FormControl>
                      <Input placeholder="My Emotional Journey" {...field} />
                    </FormControl>
                    <FormDescription>
                      Give your emotional story a meaningful title
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
                        placeholder="Describe what this emotional journey is about..."
                        className="min-h-[100px]"
                        {...field}
                      />
                    </FormControl>
                    <FormDescription>
                      Provide context for your emotional journey
                    </FormDescription>
                    <FormMessage />
                  </FormItem>
                )}
              />

              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <FormField
                  control={form.control}
                  name="emotionalArc.start"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Starting Emotion</FormLabel>
                      <FormControl>
                        <Input placeholder="e.g., Anxious" {...field} />
                      </FormControl>
                      <FormDescription>
                        How did your emotional journey begin?
                      </FormDescription>
                      <FormMessage />
                    </FormItem>
                  )}
                />

                <FormField
                  control={form.control}
                  name="emotionalArc.end"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Ending Emotion</FormLabel>
                      <FormControl>
                        <Input placeholder="e.g., Content" {...field} />
                      </FormControl>
                      <FormDescription>
                        How does your emotional journey conclude?
                      </FormDescription>
                      <FormMessage />
                    </FormItem>
                  )}
                />
              </div>

              <div>
                <FormLabel htmlFor="tags">Tags</FormLabel>
                <div className="flex mt-1.5 mb-2">
                  <Input
                    id="tagInput"
                    value={tagInput}
                    onChange={(e) => setTagInput(e.target.value)}
                    onKeyDown={handleTagKeyPress}
                    className="rounded-r-none"
                    placeholder="Add a tag..."
                  />
                  <Button
                    type="button"
                    variant="secondary"
                    className="rounded-l-none"
                    onClick={addTag}
                  >
                    <Plus className="h-4 w-4" />
                  </Button>
                </div>
                <FormDescription>
                  Add tags to categorize your story (e.g., "growth", "challenge", "work")
                </FormDescription>

                <div className="flex flex-wrap gap-1 mt-3">
                  {form.watch("tags")?.map((tag, index) => (
                    <Badge key={index} variant="secondary" className="py-1">
                      {tag}
                      <button
                        type="button"
                        onClick={() => removeTag(tag)}
                        className="ml-1 rounded-full hover:bg-muted p-1"
                      >
                        <X className="h-3 w-3" />
                      </button>
                    </Badge>
                  ))}
                </div>
              </div>

              <div className="flex flex-col space-y-3">
                <FormField
                  control={form.control}
                  name="isPublic"
                  render={({ field }) => (
                    <FormItem className="flex flex-row items-center justify-between p-3 rounded-md border">
                      <div className="space-y-0.5">
                        <FormLabel>Make Story Public</FormLabel>
                        <FormDescription>
                          Allow others to see and interact with your story
                        </FormDescription>
                      </div>
                      <FormControl>
                        <Switch
                          checked={field.value === 1}
                          onCheckedChange={(checked) =>
                            field.onChange(checked ? 1 : 0)
                          }
                        />
                      </FormControl>
                    </FormItem>
                  )}
                />

                <FormField
                  control={form.control}
                  name="allowComments"
                  render={({ field }) => (
                    <FormItem className="flex flex-row items-center justify-between p-3 rounded-md border">
                      <div className="space-y-0.5">
                        <FormLabel>Allow Comments</FormLabel>
                        <FormDescription>
                          Let others comment on your emotional journey
                        </FormDescription>
                      </div>
                      <FormControl>
                        <Switch
                          checked={field.value === 1}
                          onCheckedChange={(checked) =>
                            field.onChange(checked ? 1 : 0)
                          }
                        />
                      </FormControl>
                    </FormItem>
                  )}
                />
              </div>

              <div className="flex justify-between pt-4">
                <Button
                  type="button"
                  variant="outline"
                  onClick={() => navigate("/emotion-stories")}
                >
                  Cancel
                </Button>
                <Button 
                  type="submit" 
                  disabled={createStoryMutation.isPending}
                >
                  {createStoryMutation.isPending ? "Creating..." : "Create Story"}
                </Button>
              </div>
            </form>
          </Form>
        </CardContent>
      </Card>
    </div>
  );
}