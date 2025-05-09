import { useState, useRef, useEffect } from 'react';
import { useToast } from '@/hooks/use-toast';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Button } from '@/components/ui/button';
import { Card, CardContent } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Separator } from '@/components/ui/separator';
import { Slider } from '@/components/ui/slider';
import { Badge } from '@/components/ui/badge';
import { Progress } from '@/components/ui/progress';
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog';
import { 
  Upload, 
  Play, 
  Pause, 
  SkipBack, 
  SkipForward, 
  Save, 
  Share, 
  Scissors, 
  Volume2, 
  Image as ImageIcon, 
  Loader2,
  VideoIcon,
  Music,
  Text,
  Paintbrush,
  Move,
  RotateCcw,
  Lightbulb,
  Wand2
} from 'lucide-react';

import VideoEditorTimeline from './video-editor-timeline';
import VideoEditorAITools from './video-editor-ai-tools';
import AIContentFilter from './ai-content-filter';
import CommunityGuidelinesModal from './community-guidelines-modal';

interface VideoClip {
  id: string;
  src: string;
  type: 'video' | 'image';
  startTime: number;
  endTime: number;
  duration: number;
  volume: number;
  speed: number;
  trim: { start: number; end: number };
  position: { x: number; y: number };
  scale: number;
  rotation: number;
  opacity: number;
}

interface AudioTrack {
  id: string;
  src: string;
  name: string;
  startTime: number;
  endTime: number;
  volume: number;
  isMuted: boolean;
}

interface TextOverlay {
  id: string;
  text: string;
  font: string;
  fontSize: number;
  color: string;
  backgroundColor: string;
  position: { x: number; y: number };
  startTime: number;
  duration: number;
  opacity: number;
  animation: string;
}

interface Transition {
  id: string;
  type: string;
  duration: number;
  position: number;
}

export default function VideoEditor() {
  const { toast } = useToast();
  const videoRef = useRef<HTMLVideoElement>(null);
  const videoFileInputRef = useRef<HTMLInputElement>(null);
  
  const [isPlaying, setIsPlaying] = useState(false);
  const [currentTime, setCurrentTime] = useState(0);
  const [duration, setDuration] = useState(0);
  const [volume, setVolume] = useState(100);
  const [zoom, setZoom] = useState(1);
  const [selectedTool, setSelectedTool] = useState<string | null>(null);
  const [projectTitle, setProjectTitle] = useState('Untitled Project');
  const [isLoading, setIsLoading] = useState(false);
  const [videoFile, setVideoFile] = useState<File | null>(null);
  const [showGuidelines, setShowGuidelines] = useState(true);
  
  // Timeline elements
  const [clips, setClips] = useState<VideoClip[]>([]);
  const [audioTracks, setAudioTracks] = useState<AudioTrack[]>([]);
  const [textOverlays, setTextOverlays] = useState<TextOverlay[]>([]);
  const [transitions, setTransitions] = useState<Transition[]>([]);
  
  // Handle file selection
  const handleFileSelect = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    
    if (!file.type.includes('video/')) {
      toast({
        title: 'Invalid File Type',
        description: 'Please select a video file.',
        variant: 'destructive',
      });
      return;
    }
    
    setIsLoading(true);
    setVideoFile(file);
    
    // Create a URL for the video file
    const url = URL.createObjectURL(file);
    
    // Create a video element to get the duration
    const video = document.createElement('video');
    video.src = url;
    video.onloadedmetadata = () => {
      // Create a new clip
      const newClip: VideoClip = {
        id: `clip-${Date.now()}`,
        src: url,
        type: 'video',
        startTime: 0,
        endTime: video.duration,
        duration: video.duration,
        volume: 100,
        speed: 1,
        trim: { start: 0, end: video.duration },
        position: { x: 0, y: 0 },
        scale: 1,
        rotation: 0,
        opacity: 1,
      };
      
      setClips([newClip]);
      setDuration(video.duration);
      setIsLoading(false);
      
      // If there's a video element on the page, update it
      if (videoRef.current) {
        videoRef.current.src = url;
      }
    };
    
    video.onerror = () => {
      toast({
        title: 'Error Loading Video',
        description: 'Unable to load the video file. Please try another file.',
        variant: 'destructive',
      });
      setIsLoading(false);
    };
  };
  
  // Play/pause video
  const togglePlay = () => {
    if (videoRef.current) {
      if (isPlaying) {
        videoRef.current.pause();
      } else {
        videoRef.current.play();
      }
      setIsPlaying(!isPlaying);
    }
  };
  
  // Seek to a specific time
  const handleSeek = (time: number) => {
    if (videoRef.current) {
      videoRef.current.currentTime = time;
      setCurrentTime(time);
    }
  };
  
  // Update current time as video plays
  const handleTimeUpdate = () => {
    if (videoRef.current) {
      setCurrentTime(videoRef.current.currentTime);
    }
  };
  
  // Handle volume change
  const handleVolumeChange = (value: number[]) => {
    const newVolume = value[0];
    setVolume(newVolume);
    
    if (videoRef.current) {
      videoRef.current.volume = newVolume / 100;
    }
  };
  
  // Handle community guidelines acceptance
  const handleAcceptGuidelines = () => {
    setShowGuidelines(false);
    toast({
      title: 'Guidelines Accepted',
      description: 'Thank you for agreeing to our community guidelines.',
    });
  };
  
  // Handle save project
  const handleSaveProject = () => {
    toast({
      title: 'Project Saved',
      description: 'Your video project has been saved successfully.',
    });
  };
  
  // Handle export video
  const handleExportVideo = () => {
    setIsLoading(true);
    
    // Simulate export process
    setTimeout(() => {
      setIsLoading(false);
      
      toast({
        title: 'Video Exported',
        description: 'Your video has been exported successfully.',
      });
    }, 3000);
  };
  
  // Handle video upload/publish
  const handlePublishVideo = () => {
    setIsLoading(true);
    
    // Simulate export process
    setTimeout(() => {
      setIsLoading(false);
      
      toast({
        title: 'Video Published',
        description: 'Your video has been published to the platform.',
      });
    }, 2000);
  };
  
  return (
    <div className="flex flex-col h-full">
      {/* Header */}
      <div className="flex justify-between items-center mb-4">
        <div className="flex items-center space-x-4">
          <div>
            <Input
              value={projectTitle}
              onChange={(e) => setProjectTitle(e.target.value)}
              className="text-lg font-medium h-auto py-2"
            />
          </div>
          <Badge variant="outline" className="text-xs">
            Draft
          </Badge>
        </div>
        
        <div className="flex space-x-2">
          <Button variant="outline" size="sm" onClick={handleSaveProject}>
            <Save className="h-4 w-4 mr-2" />
            Save
          </Button>
          <Dialog>
            <DialogTrigger asChild>
              <Button size="sm">
                <Share className="h-4 w-4 mr-2" />
                Export & Publish
              </Button>
            </DialogTrigger>
            <DialogContent>
              <DialogHeader>
                <DialogTitle>Export and Publish Video</DialogTitle>
                <DialogDescription>
                  Export your video and share it with the MoodSync community.
                </DialogDescription>
              </DialogHeader>
              
              <div className="space-y-4 py-2">
                <div className="space-y-2">
                  <Label>Video Title</Label>
                  <Input value={projectTitle} onChange={(e) => setProjectTitle(e.target.value)} />
                </div>
                
                <div className="space-y-2">
                  <Label>Description</Label>
                  <Input placeholder="Describe your video" />
                </div>
                
                <div className="space-y-2">
                  <Label>Category</Label>
                  <Input placeholder="e.g., Wellness, Education, Mindfulness" />
                </div>
                
                <div className="space-y-2">
                  <Label>Tags</Label>
                  <Input placeholder="e.g., wellness, mood, tutorial" />
                </div>
              </div>
              
              <DialogFooter className="flex flex-col sm:flex-row space-y-2 sm:space-y-0 sm:space-x-2">
                <Button
                  variant="outline"
                  onClick={handleExportVideo}
                  disabled={isLoading}
                >
                  {isLoading ? (
                    <Loader2 className="h-4 w-4 animate-spin mr-2" />
                  ) : (
                    <VideoIcon className="h-4 w-4 mr-2" />
                  )}
                  Export Only
                </Button>
                <Button 
                  onClick={handlePublishVideo}
                  disabled={isLoading}
                >
                  {isLoading ? (
                    <Loader2 className="h-4 w-4 animate-spin mr-2" />
                  ) : (
                    <Share className="h-4 w-4 mr-2" />
                  )}
                  Publish to MoodSync
                </Button>
              </DialogFooter>
            </DialogContent>
          </Dialog>
        </div>
      </div>
      
      {/* Main Editor */}
      <div className="flex flex-grow space-x-4 h-[calc(100%-3rem)]">
        {/* Left Tools Panel */}
        <div className="w-64 bg-card border rounded-md shadow-sm p-4 space-y-4">
          {/* Upload Section */}
          <div className="space-y-2">
            <h3 className="text-sm font-medium">Media</h3>
            <Button 
              variant="outline" 
              className="w-full"
              onClick={() => videoFileInputRef.current?.click()}
            >
              <Upload className="h-4 w-4 mr-2" />
              Upload Media
            </Button>
            <input
              ref={videoFileInputRef}
              type="file"
              accept="video/*,image/*"
              className="hidden"
              onChange={handleFileSelect}
            />
          </div>
          
          <Separator />
          
          {/* AI Tools */}
          <VideoEditorAITools />
          
          <Separator />
          
          {/* Content Safety */}
          <AIContentFilter 
            videoFile={videoFile || undefined} 
            onFilterComplete={(result) => {
              if (!result.isApproved) {
                toast({
                  title: 'Content Warning',
                  description: 'Please review and address the content policy issues before publishing.',
                  variant: 'destructive',
                });
              }
            }}
          />
        </div>
        
        {/* Center Preview and Timeline */}
        <div className="flex-grow flex flex-col bg-card border rounded-md shadow-sm overflow-hidden">
          {/* Video Preview */}
          <div className="flex-grow relative bg-black flex items-center justify-center">
            {clips.length === 0 ? (
              <div className="text-white text-center p-6 bg-muted/10 rounded-md">
                <VideoIcon className="h-12 w-12 mx-auto opacity-40 mb-2" />
                <p>No media added yet</p>
                <p className="text-sm text-muted-foreground mt-1">
                  Upload a video or image to get started
                </p>
                <Button 
                  variant="outline"
                  className="mt-4"
                  onClick={() => videoFileInputRef.current?.click()}
                >
                  <Upload className="h-4 w-4 mr-2" />
                  Upload Media
                </Button>
              </div>
            ) : (
              <div className="w-full h-full flex flex-col justify-center">
                <video
                  ref={videoRef}
                  className="max-h-full max-w-full"
                  onTimeUpdate={handleTimeUpdate}
                  onEnded={() => setIsPlaying(false)}
                  controls={false}
                />
                
                {/* Video Controls */}
                <div className="absolute bottom-0 left-0 right-0 bg-gradient-to-t from-black/80 to-transparent p-4">
                  <div className="flex items-center justify-between mb-2">
                    <div className="text-white text-sm">
                      {formatTime(currentTime)} / {formatTime(duration)}
                    </div>
                    <div className="text-white text-sm flex items-center">
                      <Volume2 className="h-4 w-4 mr-1" />
                      <Slider
                        value={[volume]}
                        onValueChange={handleVolumeChange}
                        min={0}
                        max={100}
                        step={1}
                        className="w-24"
                      />
                    </div>
                  </div>
                  
                  <Progress 
                    value={(currentTime / duration) * 100} 
                    className="h-1 mb-2"
                    onClick={(e) => {
                      const rect = e.currentTarget.getBoundingClientRect();
                      const percent = (e.clientX - rect.left) / rect.width;
                      handleSeek(percent * duration);
                    }}
                  />
                  
                  <div className="flex justify-center space-x-2">
                    <Button variant="ghost" size="icon" className="text-white">
                      <SkipBack className="h-4 w-4" />
                    </Button>
                    <Button 
                      variant="ghost" 
                      size="icon" 
                      className="text-white" 
                      onClick={togglePlay}
                    >
                      {isPlaying ? (
                        <Pause className="h-4 w-4" />
                      ) : (
                        <Play className="h-4 w-4" />
                      )}
                    </Button>
                    <Button variant="ghost" size="icon" className="text-white">
                      <SkipForward className="h-4 w-4" />
                    </Button>
                  </div>
                </div>
              </div>
            )}
          </div>
          
          {/* Timeline */}
          <div className="h-52 border-t">
            <VideoEditorTimeline
              clips={clips}
              audioTracks={audioTracks}
              textOverlays={textOverlays}
              transitions={transitions}
              duration={duration}
              currentTime={currentTime}
              zoom={zoom}
              onSeek={handleSeek}
              onZoomChange={setZoom}
            />
          </div>
        </div>
        
        {/* Right Properties Panel */}
        <div className="w-64 bg-card border rounded-md shadow-sm p-4 space-y-4">
          <Tabs defaultValue="clip">
            <TabsList className="grid w-full grid-cols-3">
              <TabsTrigger value="clip">
                <VideoIcon className="h-3.5 w-3.5 mr-1" />
                <span className="text-xs">Clip</span>
              </TabsTrigger>
              <TabsTrigger value="audio">
                <Music className="h-3.5 w-3.5 mr-1" />
                <span className="text-xs">Audio</span>
              </TabsTrigger>
              <TabsTrigger value="text">
                <Text className="h-3.5 w-3.5 mr-1" />
                <span className="text-xs">Text</span>
              </TabsTrigger>
            </TabsList>
            
            <TabsContent value="clip" className="space-y-4 pt-4">
              {clips.length > 0 ? (
                <>
                  <div className="space-y-2">
                    <Label>Trim</Label>
                    <div className="flex space-x-2">
                      <Button variant="outline" size="sm" className="w-full">
                        <Scissors className="h-3.5 w-3.5 mr-1" />
                        Start
                      </Button>
                      <Button variant="outline" size="sm" className="w-full">
                        <Scissors className="h-3.5 w-3.5 mr-1" />
                        End
                      </Button>
                    </div>
                  </div>
                  
                  <div className="space-y-2">
                    <Label>Speed</Label>
                    <Slider
                      defaultValue={[1]}
                      min={0.25}
                      max={2}
                      step={0.25}
                      className="w-full"
                    />
                    <div className="flex justify-between text-xs text-muted-foreground">
                      <span>0.25x</span>
                      <span>1x</span>
                      <span>2x</span>
                    </div>
                  </div>
                  
                  <div className="space-y-2">
                    <Label>Volume</Label>
                    <Slider
                      defaultValue={[100]}
                      min={0}
                      max={100}
                      step={1}
                      className="w-full"
                    />
                  </div>
                  
                  <div className="space-y-2">
                    <Label>Position</Label>
                    <div className="grid grid-cols-3 gap-2">
                      <Button variant="outline" size="sm">
                        <Move className="h-3.5 w-3.5" />
                      </Button>
                      <Button variant="outline" size="sm">
                        <RotateCcw className="h-3.5 w-3.5" />
                      </Button>
                      <Button variant="outline" size="sm">
                        <Paintbrush className="h-3.5 w-3.5" />
                      </Button>
                    </div>
                  </div>
                </>
              ) : (
                <div className="text-center text-muted-foreground py-8">
                  <VideoIcon className="h-12 w-12 mx-auto opacity-40 mb-2" />
                  <p className="text-sm">No clip selected</p>
                </div>
              )}
            </TabsContent>
            
            <TabsContent value="audio" className="space-y-4 pt-4">
              <div className="text-center text-muted-foreground py-8">
                <Music className="h-12 w-12 mx-auto opacity-40 mb-2" />
                <p className="text-sm">No audio tracks</p>
                <p className="text-xs text-muted-foreground">
                  Use the AI tools to generate audio
                </p>
              </div>
            </TabsContent>
            
            <TabsContent value="text" className="space-y-4 pt-4">
              <div className="text-center text-muted-foreground py-8">
                <Text className="h-12 w-12 mx-auto opacity-40 mb-2" />
                <p className="text-sm">No text overlays</p>
                <Button variant="outline" size="sm" className="mt-2">
                  <Text className="h-3.5 w-3.5 mr-1" />
                  Add Text Overlay
                </Button>
              </div>
            </TabsContent>
          </Tabs>
          
          <Separator />
          
          <div className="space-y-2">
            <h3 className="text-sm font-medium">AI Enhancements</h3>
            <Button 
              variant="outline" 
              className="w-full"
              onClick={() => {
                toast({
                  title: 'AI Enhancement',
                  description: 'Applying smart enhancements to your video...',
                });
              }}
            >
              <Wand2 className="h-4 w-4 mr-2" />
              Auto-Enhance
            </Button>
            <Button 
              variant="outline" 
              className="w-full"
              onClick={() => {
                toast({
                  title: 'Smart Suggestions',
                  description: 'Analyzing your content for improvement suggestions...',
                });
              }}
            >
              <Lightbulb className="h-4 w-4 mr-2" />
              Smart Suggestions
            </Button>
          </div>
        </div>
      </div>
      
      {/* Community Guidelines Modal */}
      <CommunityGuidelinesModal
        isOpen={showGuidelines}
        onAccept={handleAcceptGuidelines}
        onClose={() => setShowGuidelines(false)}
      />
    </div>
  );
}

// Helper for formatting time in MM:SS format
function formatTime(seconds: number): string {
  const mins = Math.floor(seconds / 60);
  const secs = Math.floor(seconds % 60);
  return `${mins}:${secs.toString().padStart(2, '0')}`;
}