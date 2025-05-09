import { useState, useEffect } from "react";
import { 
  Card, 
  CardContent, 
  CardDescription, 
  CardFooter, 
  CardHeader, 
  CardTitle 
} from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import { Switch } from "@/components/ui/switch";
import { Checkbox } from "@/components/ui/checkbox";
import { FormDescription } from "@/components/ui/form";
import { 
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import { Label } from "@/components/ui/label";
import { 
  useMutation, 
  useQuery, 
  useQueryClient 
} from "@tanstack/react-query";
import { apiRequest } from "@/lib/queryClient";
import { Loader2, PlusCircle, Edit, Trash2, Tag } from "lucide-react";
import { useToast } from "@/hooks/use-toast";
import { z } from "zod";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from "@/components/ui/form";
import { HexColorPicker } from "react-colorful";

// Define custom mood tag interface
interface CustomMoodTag {
  id: number;
  userId: number;
  tagName: string;
  tagDescription?: string;
  baseEmotion?: string;
  color: string;
  icon?: string;
  isActive?: boolean;
  createdAt: string;
  updatedAt?: string;
}

// Define schema for tag validation
const tagSchema = z.object({
  tagName: z.string().min(1, "Tag name is required").max(30, "Tag name must be less than 30 characters"),
  tagDescription: z.string().max(100, "Description must be less than 100 characters").optional(),
  baseEmotion: z.string().optional(),
  color: z.string().regex(/^#[0-9A-F]{6}$/i, "Must be a valid hex color"),
  icon: z.string().optional(),
  isActive: z.boolean().optional().default(true)
});

type TagFormValues = z.infer<typeof tagSchema>;

export function CustomMoodTags() {
  const { toast } = useToast();
  const queryClient = useQueryClient();
  const [editingTag, setEditingTag] = useState<CustomMoodTag | null>(null);
  const [isDeleteDialogOpen, setIsDeleteDialogOpen] = useState(false);
  const [tagToDelete, setTagToDelete] = useState<CustomMoodTag | null>(null);
  const [isAddDialogOpen, setIsAddDialogOpen] = useState(false);
  const [isEditDialogOpen, setIsEditDialogOpen] = useState(false);

  // Query for fetching the user's custom mood tags
  const { data: tags, isLoading } = useQuery({
    queryKey: ["/api/custom-mood-tags"],
    queryFn: async () => {
      const response = await apiRequest("GET", "/api/custom-mood-tags");
      return await response.json();
    },
  });

  // Mutation for creating a new tag
  const createTagMutation = useMutation({
    mutationFn: async (newTag: TagFormValues) => {
      const response = await apiRequest("POST", "/api/custom-mood-tags", newTag);
      return await response.json();
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["/api/custom-mood-tags"] });
      toast({
        title: "Tag Created",
        description: "Your new mood tag has been created successfully.",
      });
      setIsAddDialogOpen(false);
    },
    onError: (error: any) => {
      toast({
        title: "Error",
        description: error.message || "Failed to create tag. Please try again.",
        variant: "destructive",
      });
    }
  });

  // Mutation for updating a tag
  const updateTagMutation = useMutation({
    mutationFn: async ({ id, data }: { id: number, data: TagFormValues }) => {
      const response = await apiRequest("PATCH", `/api/custom-mood-tags/${id}`, data);
      return await response.json();
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["/api/custom-mood-tags"] });
      toast({
        title: "Tag Updated",
        description: "Your mood tag has been updated successfully.",
      });
      setIsEditDialogOpen(false);
      setEditingTag(null);
    },
    onError: (error: any) => {
      toast({
        title: "Error",
        description: error.message || "Failed to update tag. Please try again.",
        variant: "destructive",
      });
    }
  });

  // Mutation for deleting a tag
  const deleteTagMutation = useMutation({
    mutationFn: async (id: number) => {
      await apiRequest("DELETE", `/api/custom-mood-tags/${id}`);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["/api/custom-mood-tags"] });
      toast({
        title: "Tag Deleted",
        description: "Your mood tag has been deleted successfully.",
      });
      setIsDeleteDialogOpen(false);
      setTagToDelete(null);
    },
    onError: (error: any) => {
      toast({
        title: "Error",
        description: error.message || "Failed to delete tag. Please try again.",
        variant: "destructive",
      });
    }
  });

  // Form for adding a new tag
  const addForm = useForm<TagFormValues>({
    resolver: zodResolver(tagSchema),
    defaultValues: {
      tagName: "",
      tagDescription: "",
      baseEmotion: "",
      color: "#A6FF6F", // Default color that matches our app's accent color
      icon: "😊",
      isActive: true
    }
  });

  // Form for editing a tag
  const editForm = useForm<TagFormValues>({
    resolver: zodResolver(tagSchema),
    defaultValues: {
      tagName: editingTag?.tagName || "",
      color: editingTag?.color || "#A6FF6F",
      icon: editingTag?.icon || "😊"
    }
  });

  // Update edit form when editing tag changes
  useEffect(() => {
    if (editingTag) {
      editForm.reset({
        tagName: editingTag.tagName,
        tagDescription: editingTag.tagDescription || "",
        baseEmotion: editingTag.baseEmotion || "",
        color: editingTag.color,
        icon: editingTag.icon || "😊",
        isActive: editingTag.isActive ?? true
      });
    }
  }, [editingTag, editForm]);

  // Handle creating a new tag
  const handleCreateTag = (values: TagFormValues) => {
    createTagMutation.mutate(values);
  };

  // Handle updating a tag
  const handleUpdateTag = (values: TagFormValues) => {
    if (editingTag) {
      updateTagMutation.mutate({ id: editingTag.id, data: values });
    }
  };

  // Handle deleting a tag
  const handleDeleteTag = () => {
    if (tagToDelete) {
      deleteTagMutation.mutate(tagToDelete.id);
    }
  };

  // Open edit dialog with the selected tag data
  const openEditDialog = (tag: CustomMoodTag) => {
    setEditingTag(tag);
    editForm.reset({
      tagName: tag.tagName,
      tagDescription: tag.tagDescription,
      baseEmotion: tag.baseEmotion,
      color: tag.color,
      icon: tag.icon || "😊",
      isActive: tag.isActive ?? true
    });
    setIsEditDialogOpen(true);
  };

  // Open delete confirmation dialog
  const openDeleteDialog = (tag: CustomMoodTag) => {
    setTagToDelete(tag);
    setIsDeleteDialogOpen(true);
  };

  return (
    <Card className="w-full">
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <Tag className="h-5 w-5" />
          Custom Mood Tags
        </CardTitle>
        <CardDescription>
          Create personalized tags to better express your unique emotional states
        </CardDescription>
      </CardHeader>
      <CardContent>
        {isLoading ? (
          <div className="flex justify-center py-8">
            <Loader2 className="h-8 w-8 animate-spin text-muted-foreground" />
          </div>
        ) : !tags || tags.length === 0 ? (
          <div className="text-center py-8">
            <p className="text-muted-foreground">You haven't created any custom mood tags yet.</p>
            <p className="text-sm text-muted-foreground mt-1">
              Create your first tag to better track and express your emotions.
            </p>
          </div>
        ) : (
          <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-2">
            {tags.map((tag: CustomMoodTag) => (
              <div 
                key={tag.id}
                className={`flex items-center justify-between p-2 border rounded-md ${!tag.isActive ? 'opacity-60' : ''}`}
              >
                <div className="flex items-center gap-2">
                  <span className="text-lg">{tag.icon || "😊"}</span>
                  <Badge 
                    style={{ backgroundColor: tag.color, color: isLightColor(tag.color) ? '#000' : '#fff' }}
                    className="px-3 py-1"
                  >
                    {tag.tagName}
                  </Badge>
                  {tag.baseEmotion && (
                    <span className="text-xs text-muted-foreground">
                      Based on: {tag.baseEmotion}
                    </span>
                  )}
                </div>
                <div className="flex gap-1">
                  <Button 
                    variant="ghost" 
                    size="icon" 
                    onClick={() => openEditDialog(tag)}
                  >
                    <Edit className="h-4 w-4" />
                  </Button>
                  <Button 
                    variant="ghost" 
                    size="icon" 
                    onClick={() => openDeleteDialog(tag)}
                  >
                    <Trash2 className="h-4 w-4" />
                  </Button>
                </div>
              </div>
            ))}
          </div>
        )}
      </CardContent>
      <CardFooter className="flex justify-center">
        <Dialog open={isAddDialogOpen} onOpenChange={setIsAddDialogOpen}>
          <DialogTrigger asChild>
            <Button className="w-full sm:w-auto">
              <PlusCircle className="mr-2 h-4 w-4" />
              Create New Mood Tag
            </Button>
          </DialogTrigger>
          <DialogContent>
            <DialogHeader>
              <DialogTitle>Create New Mood Tag</DialogTitle>
              <DialogDescription>
                Add a custom mood tag to better express your emotional state
              </DialogDescription>
            </DialogHeader>
            <Form {...addForm}>
              <form onSubmit={addForm.handleSubmit(handleCreateTag)} className="space-y-4">
                <FormField
                  control={addForm.control}
                  name="tagName"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Tag Name</FormLabel>
                      <FormControl>
                        <Input 
                          placeholder="e.g., Energized, Contemplative, etc." 
                          {...field} 
                        />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
                <FormField
                  control={addForm.control}
                  name="tagDescription"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Description</FormLabel>
                      <FormControl>
                        <Input
                          placeholder="Describe what this mood feels like"
                          {...field}
                          value={field.value || ''}
                        />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
                <FormField
                  control={addForm.control}
                  name="baseEmotion"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Base Emotion (Optional)</FormLabel>
                      <FormControl>
                        <Input
                          placeholder="e.g., Happy, Sad, etc."
                          {...field}
                          value={field.value || ''}
                        />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
                <FormField
                  control={addForm.control}
                  name="icon"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Icon</FormLabel>
                      <FormControl>
                        <Input
                          placeholder="Emoji (e.g., 😊, 😎)"
                          {...field}
                          value={field.value || '😊'}
                        />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
                <FormField
                  control={addForm.control}
                  name="color"
                  render={({ field }) => (
                    <FormItem className="space-y-2">
                      <FormLabel>Tag Color</FormLabel>
                      <FormControl>
                        <>
                          <div className="flex items-center gap-2 mb-2">
                            <div 
                              className="w-10 h-10 rounded-md border" 
                              style={{ backgroundColor: field.value }} 
                            />
                            <Input 
                              value={field.value}
                              onChange={(e) => {
                                // Ensure valid hex format
                                const value = e.target.value;
                                if (/^#[0-9A-F]{0,6}$/i.test(value) || value === "#") {
                                  field.onChange(value);
                                }
                              }}
                              className="font-mono"
                            />
                          </div>
                          <HexColorPicker 
                            color={field.value} 
                            onChange={field.onChange} 
                          />
                        </>
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
                
                <FormField
                  control={addForm.control}
                  name="isActive"
                  render={({ field }) => (
                    <FormItem className="flex flex-row items-start space-x-3 space-y-0 rounded-md border p-4">
                      <FormControl>
                        <Checkbox
                          checked={field.value}
                          onCheckedChange={field.onChange}
                        />
                      </FormControl>
                      <div className="space-y-1 leading-none">
                        <FormLabel>
                          Active
                        </FormLabel>
                        <FormDescription>
                          Set whether this tag is currently active and available for use
                        </FormDescription>
                      </div>
                    </FormItem>
                  )}
                />
                <DialogFooter>
                  <Button 
                    type="button" 
                    variant="outline" 
                    onClick={() => setIsAddDialogOpen(false)}
                  >
                    Cancel
                  </Button>
                  <Button 
                    type="submit" 
                    disabled={createTagMutation.isPending}
                  >
                    {createTagMutation.isPending && (
                      <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                    )}
                    Create Tag
                  </Button>
                </DialogFooter>
              </form>
            </Form>
          </DialogContent>
        </Dialog>
      </CardFooter>

      {/* Edit Tag Dialog */}
      <Dialog open={isEditDialogOpen} onOpenChange={setIsEditDialogOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Edit Mood Tag</DialogTitle>
            <DialogDescription>
              Update your custom mood tag
            </DialogDescription>
          </DialogHeader>
          <Form {...editForm}>
            <form onSubmit={editForm.handleSubmit(handleUpdateTag)} className="space-y-4">
              <FormField
                control={editForm.control}
                name="tagName"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Tag Name</FormLabel>
                    <FormControl>
                      <Input 
                        placeholder="e.g., Energized, Contemplative, etc." 
                        {...field} 
                      />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
              <FormField
                control={editForm.control}
                name="tagDescription"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Description</FormLabel>
                    <FormControl>
                      <Input
                        placeholder="Describe what this mood feels like"
                        {...field}
                        value={field.value || ''}
                      />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
              <FormField
                control={editForm.control}
                name="baseEmotion"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Base Emotion (Optional)</FormLabel>
                    <FormControl>
                      <Input
                        placeholder="e.g., Happy, Sad, etc."
                        {...field}
                        value={field.value || ''}
                      />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
              <FormField
                control={editForm.control}
                name="icon"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Icon</FormLabel>
                    <FormControl>
                      <Input
                        placeholder="Emoji (e.g., 😊, 😎)"
                        {...field}
                        value={field.value || '😊'}
                      />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
              <FormField
                control={editForm.control}
                name="color"
                render={({ field }) => (
                  <FormItem className="space-y-2">
                    <FormLabel>Tag Color</FormLabel>
                    <FormControl>
                      <>
                        <div className="flex items-center gap-2 mb-2">
                          <div 
                            className="w-10 h-10 rounded-md border" 
                            style={{ backgroundColor: field.value }} 
                          />
                          <Input 
                            value={field.value}
                            onChange={(e) => {
                              // Ensure valid hex format
                              const value = e.target.value;
                              if (/^#[0-9A-F]{0,6}$/i.test(value) || value === "#") {
                                field.onChange(value);
                              }
                            }}
                            className="font-mono"
                          />
                        </div>
                        <HexColorPicker 
                          color={field.value} 
                          onChange={field.onChange} 
                        />
                      </>
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
              <FormField
                control={editForm.control}
                name="isActive"
                render={({ field }) => (
                  <FormItem className="flex flex-row items-center justify-between rounded-lg border p-3 shadow-sm">
                    <div className="space-y-0.5">
                      <FormLabel>Active</FormLabel>
                      <FormDescription>
                        Tag will appear in mood selection if active
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
              <DialogFooter>
                <Button 
                  type="button" 
                  variant="outline" 
                  onClick={() => setIsEditDialogOpen(false)}
                >
                  Cancel
                </Button>
                <Button 
                  type="submit" 
                  disabled={updateTagMutation.isPending}
                >
                  {updateTagMutation.isPending && (
                    <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                  )}
                  Save Changes
                </Button>
              </DialogFooter>
            </form>
          </Form>
        </DialogContent>
      </Dialog>

      {/* Delete Confirmation Dialog */}
      <Dialog open={isDeleteDialogOpen} onOpenChange={setIsDeleteDialogOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Confirm Deletion</DialogTitle>
            <DialogDescription>
              Are you sure you want to delete the tag "{tagToDelete?.tagName}"? This action cannot be undone.
            </DialogDescription>
          </DialogHeader>
          <DialogFooter>
            <Button 
              type="button" 
              variant="outline" 
              onClick={() => setIsDeleteDialogOpen(false)}
            >
              Cancel
            </Button>
            <Button 
              variant="destructive" 
              onClick={handleDeleteTag} 
              disabled={deleteTagMutation.isPending}
            >
              {deleteTagMutation.isPending && (
                <Loader2 className="mr-2 h-4 w-4 animate-spin" />
              )}
              Delete Tag
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </Card>
  );
}

// Helper function to determine if a color is light or dark
function isLightColor(color: string) {
  // Convert hex to RGB
  const hex = color.replace('#', '');
  const r = parseInt(hex.substring(0, 2), 16);
  const g = parseInt(hex.substring(2, 4), 16);
  const b = parseInt(hex.substring(4, 6), 16);
  
  // Calculate perceived brightness (YIQ formula)
  const yiq = ((r * 299) + (g * 587) + (b * 114)) / 1000;
  
  // Light colors have YIQ > 128
  return yiq >= 128;
}