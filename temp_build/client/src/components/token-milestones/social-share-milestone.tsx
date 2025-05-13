import React, { useState } from 'react';
import { Share2, Twitter, Facebook, Linkedin, MessageCircle, Send, Mail, Copy, X, Check } from 'lucide-react';
import {
  Card,
  CardContent,
  CardFooter,
  CardHeader,
  CardTitle,
} from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from '@/components/ui/dialog';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { useMutation } from '@tanstack/react-query';
import { apiRequest } from '@/lib/queryClient';
import { useToast } from '@/hooks/use-toast';
import { v4 as uuidv4 } from 'uuid';
import AnimatedShareButton from '../share/animated-share-button';

interface SocialShareMilestoneProps {
  milestone: number;
  isAchieved: boolean;
  currentTokens: number;
  title: string;
  description: string;
  className?: string;
}

export default function SocialShareMilestone({
  milestone,
  isAchieved,
  currentTokens,
  title,
  description,
  className,
}: SocialShareMilestoneProps) {
  const [open, setOpen] = useState(false);
  const [shareMessage, setShareMessage] = useState('');
  const [linkCopied, setLinkCopied] = useState(false);
  const { toast } = useToast();

  // Generate the default share message based on milestone status
  const defaultShareMessage = isAchieved
    ? `I've reached the ${milestone} tokens milestone on MoodSync! ${title}`
    : `I'm working toward the ${milestone} tokens milestone on MoodSync! ${Math.round((currentTokens / milestone) * 100)}% there so far!`;

  // Reset the form when the dialog opens
  const handleOpenChange = (open: boolean) => {
    if (open) {
      setShareMessage(defaultShareMessage);
      setLinkCopied(false);
    }
    setOpen(open);
  };

  // Generate the share URL
  const shareUrl = `${window.location.origin}/milestones/${milestone}`;

  // Share mutation
  const shareMutation = useMutation({
    mutationFn: async (data: { platform: string; shareUrl: string; shareMessage?: string; milestone: number; trackingId: string }) => {
      const response = await apiRequest("POST", "/api/milestone-shares", data);
      return response.json();
    },
    onSuccess: (data) => {
      if (data.tokensAwarded > 0) {
        toast({
          title: "Token reward!",
          description: data.message,
          variant: "success",
        });
      }
    },
    onError: (error) => {
      toast({
        title: "Share error",
        description: error instanceof Error ? error.message : "Failed to record share",
        variant: "destructive",
      });
    },
  });

  const handleCopyLink = () => {
    navigator.clipboard.writeText(shareUrl);
    setLinkCopied(true);
    setTimeout(() => setLinkCopied(false), 2000);

    // Create a unique tracking ID for this share
    const trackingId = uuidv4();
    
    // Record the share in the database
    shareMutation.mutate({
      platform: "copy_link",
      shareUrl,
      shareMessage,
      milestone,
      trackingId
    });
    
    toast({
      title: "Link copied!",
      description: "The milestone share link has been copied to your clipboard.",
      variant: "success",
    });
  };

  return (
    <div className={className}>
      <Card className="overflow-hidden border-gradient">
        <CardHeader className="pb-2">
          <CardTitle className="text-lg font-medium">Share Your Milestone</CardTitle>
        </CardHeader>
        <CardContent className="pt-0">
          <p className="text-sm text-gray-500 mb-4">
            Share your token milestone progress with friends and earn additional tokens!
          </p>
          
          <div className="grid grid-cols-1 gap-2">
            <AnimatedShareButton
              url={shareUrl}
              title={`${title} - MoodSync Milestone`}
              message={defaultShareMessage}
              milestone={milestone}
            />
            
            <Dialog open={open} onOpenChange={handleOpenChange}>
              <DialogTrigger asChild>
                <Button variant="outline" className="gap-2">
                  <Share2 className="h-4 w-4" />
                  Customize Share
                </Button>
              </DialogTrigger>
              <DialogContent className="sm:max-w-md">
                <DialogHeader>
                  <DialogTitle>Share Milestone</DialogTitle>
                  <DialogDescription>
                    Customize your message before sharing your milestone.
                  </DialogDescription>
                </DialogHeader>
                <div className="grid gap-4 py-4">
                  <div className="grid gap-2">
                    <Label htmlFor="message">Share message</Label>
                    <Textarea
                      id="message"
                      value={shareMessage}
                      onChange={(e) => setShareMessage(e.target.value)}
                      className="resize-none"
                      rows={3}
                    />
                  </div>
                  <div className="grid gap-2">
                    <Label htmlFor="link">Link</Label>
                    <div className="flex items-center space-x-2">
                      <Input
                        id="link"
                        value={shareUrl}
                        readOnly
                        className="flex-1"
                      />
                      <Button
                        type="button"
                        size="sm"
                        className="px-3"
                        onClick={handleCopyLink}
                      >
                        {linkCopied ? (
                          <Check className="h-4 w-4" />
                        ) : (
                          <Copy className="h-4 w-4" />
                        )}
                        <span className="sr-only">Copy link</span>
                      </Button>
                    </div>
                  </div>
                </div>
                <DialogFooter className="flex flex-col sm:flex-row">
                  <div className="grid grid-cols-4 gap-2 w-full sm:w-auto">
                    {[
                      { name: 'twitter', icon: <Twitter className="h-4 w-4" />, label: 'Twitter' },
                      { name: 'facebook', icon: <Facebook className="h-4 w-4" />, label: 'Facebook' },
                      { name: 'linkedin', icon: <Linkedin className="h-4 w-4" />, label: 'LinkedIn' },
                      { name: 'whatsapp', icon: <MessageCircle className="h-4 w-4" />, label: 'WhatsApp' },
                    ].map((platform) => (
                      <Button
                        key={platform.name}
                        type="button"
                        variant="outline"
                        size="sm"
                        className="flex flex-col items-center p-2 h-auto gap-1"
                        onClick={() => {
                          // Create a unique tracking ID for this share
                          const trackingId = uuidv4();
                          
                          let shareUrl = '';
                          switch (platform.name) {
                            case 'twitter':
                              shareUrl = `https://twitter.com/intent/tweet?text=${encodeURIComponent(shareMessage)}`;
                              break;
                            case 'facebook':
                              shareUrl = `https://www.facebook.com/sharer/sharer.php?u=${encodeURIComponent(window.location.href)}`;
                              break;
                            case 'linkedin':
                              shareUrl = `https://www.linkedin.com/sharing/share-offsite/?url=${encodeURIComponent(window.location.href)}&title=${encodeURIComponent(shareMessage)}`;
                              break;
                            case 'whatsapp':
                              shareUrl = `https://api.whatsapp.com/send?text=${encodeURIComponent(`${shareMessage} ${window.location.href}`)}`;
                              break;
                          }
                          
                          // Record the share in the database
                          shareMutation.mutate({
                            platform: platform.name,
                            shareUrl: window.location.href,
                            shareMessage,
                            milestone,
                            trackingId
                          });
                          
                          // Open the share URL in a new window
                          window.open(shareUrl, '_blank');
                          
                          // Close the dialog
                          setOpen(false);
                        }}
                      >
                        {platform.icon}
                        <span className="text-xs">{platform.label}</span>
                      </Button>
                    ))}
                  </div>
                </DialogFooter>
              </DialogContent>
            </Dialog>
          </div>
        </CardContent>
        <CardFooter className="bg-gray-50 dark:bg-gray-800/50 p-3">
          <div className="text-xs text-gray-500 w-full text-center">
            {isAchieved ? 'Share your achievement to earn tokens!' : 'Share your progress to earn tokens!'}
          </div>
        </CardFooter>
      </Card>
    </div>
  );
}