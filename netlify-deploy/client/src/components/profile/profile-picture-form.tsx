import { useState } from 'react';
import { useAuth } from '@/hooks/use-auth';
import { useMutation } from '@tanstack/react-query';
import { apiRequest, queryClient } from '@/lib/queryClient';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { useToast } from '@/hooks/use-toast';
import { Camera, Loader2, User, X } from 'lucide-react';

export default function ProfilePictureForm() {
  const { user } = useAuth();
  const { toast } = useToast();
  const [selectedFile, setSelectedFile] = useState<File | null>(null);
  const [previewUrl, setPreviewUrl] = useState<string | null>(null);

  // Handle file selection
  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files[0]) {
      const file = e.target.files[0];
      
      // Basic validation
      if (!file.type.match('image.*')) {
        toast({
          title: "Invalid file type",
          description: "Please select an image file (JPEG, PNG, etc.)",
          variant: "destructive",
        });
        return;
      }

      if (file.size > 2 * 1024 * 1024) { // 2MB limit
        toast({
          title: "File too large",
          description: "Profile picture must be less than 2MB",
          variant: "destructive",
        });
        return;
      }

      setSelectedFile(file);
      
      // Create preview URL
      const reader = new FileReader();
      reader.onloadend = () => {
        setPreviewUrl(reader.result as string);
      };
      reader.readAsDataURL(file);
    }
  };

  // Clear selected file
  const clearSelectedFile = () => {
    setSelectedFile(null);
    setPreviewUrl(null);
  };

  // Mutation to update profile picture
  const updateProfilePictureMutation = useMutation({
    mutationFn: async (formData: FormData) => {
      const res = await fetch('/api/profile/picture', {
        method: 'POST',
        body: formData,
      });
      return await res.json();
    },
    onSuccess: (data) => {
      // Update the user data in cache
      queryClient.setQueryData(['/api/user'], (oldData: any) => {
        return { ...oldData, profilePicture: data.profilePicture };
      });
      
      toast({
        title: "Success",
        description: "Your profile picture has been updated",
      });

      // Clear the selected file and preview
      clearSelectedFile();
    },
    onError: (error: Error) => {
      toast({
        title: "Failed to update profile picture",
        description: error.message,
        variant: "destructive",
      });
    }
  });

  // Handle form submission
  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!selectedFile) {
      toast({
        title: "No file selected",
        description: "Please select an image to upload",
        variant: "destructive",
      });
      return;
    }

    const formData = new FormData();
    formData.append('profilePicture', selectedFile);
    updateProfilePictureMutation.mutate(formData);
  };

  // Handle profile picture removal
  const removeProfilePicture = () => {
    const formData = new FormData();
    formData.append('remove', 'true');
    updateProfilePictureMutation.mutate(formData);
  };

  const isPending = updateProfilePictureMutation.isPending;

  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <User className="h-5 w-5" />
          Profile Picture
        </CardTitle>
        <CardDescription>
          Update your profile picture or avatar
        </CardDescription>
      </CardHeader>
      <CardContent>
        <form onSubmit={handleSubmit} className="space-y-6">
          <div className="flex flex-col items-center space-y-4">
            <Avatar className="h-32 w-32 border-2 border-primary/20">
              {previewUrl ? (
                <AvatarImage src={previewUrl} alt="Preview" />
              ) : user?.profilePicture ? (
                <AvatarImage src={user.profilePicture} alt={user.username} />
              ) : (
                <AvatarFallback className="text-4xl bg-primary/10">
                  {user?.username.charAt(0).toUpperCase()}
                </AvatarFallback>
              )}
            </Avatar>
            
            {(user?.profilePicture || previewUrl) && (
              <Button 
                type="button" 
                variant="outline" 
                size="sm"
                onClick={removeProfilePicture}
                disabled={isPending}
              >
                <X className="h-4 w-4 mr-1" />
                Remove Picture
              </Button>
            )}
          </div>

          <div className="space-y-2">
            <Label htmlFor="profile-picture">Upload new image</Label>
            <div className="flex gap-2">
              <Input
                id="profile-picture"
                type="file"
                accept="image/*"
                onChange={handleFileChange}
                disabled={isPending}
                className="flex-1"
              />
              {selectedFile && (
                <Button 
                  type="button" 
                  variant="ghost" 
                  size="icon"
                  onClick={clearSelectedFile}
                >
                  <X className="h-4 w-4" />
                </Button>
              )}
            </div>
            <p className="text-xs text-gray-500">
              Maximum file size: 2MB. Supported formats: JPEG, PNG.
            </p>
          </div>

          {selectedFile && (
            <Button 
              type="submit" 
              className="w-full"
              disabled={isPending}
            >
              {isPending ? (
                <>
                  <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                  Uploading...
                </>
              ) : (
                <>
                  <Camera className="h-4 w-4 mr-2" />
                  Update Profile Picture
                </>
              )}
            </Button>
          )}
        </form>
      </CardContent>
    </Card>
  );
}