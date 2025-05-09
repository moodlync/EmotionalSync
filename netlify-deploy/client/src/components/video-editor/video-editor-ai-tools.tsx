import { useState } from 'react';
import { useMutation } from '@tanstack/react-query';
import { apiRequest } from '@/lib/queryClient';
import { Button } from '@/components/ui/button';
import { Card } from '@/components/ui/card';
import { Separator } from '@/components/ui/separator';
import { Textarea } from '@/components/ui/textarea';
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Progress } from '@/components/ui/progress';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Badge } from '@/components/ui/badge';
import { useToast } from '@/hooks/use-toast';
import { 
  MessageSquareText, 
  Wand2, 
  Sparkles, 
  Music, 
  FileAudio, 
  PenLine, 
  ClipboardEdit, 
  Languages, 
  Zap,
  Text,
  Type,
  TextSelect,
  FileText,
  Image as ImageIcon,
  Loader2,
  LayoutTemplate
} from 'lucide-react';

export default function VideoEditorAITools() {
  const { toast } = useToast();
  const [activeTab, setActiveTab] = useState('captions');
  const [isDialogOpen, setIsDialogOpen] = useState(false);
  const [dialogType, setDialogType] = useState<'caption' | 'summary' | 'script' | 'audio' | 'voiceover'>('caption');
  const [isGenerating, setIsGenerating] = useState(false);
  const [generationProgress, setGenerationProgress] = useState(0);
  
  // Handle opening the AI tool dialog
  const handleOpenDialog = (type: 'caption' | 'summary' | 'script' | 'audio' | 'voiceover') => {
    setDialogType(type);
    setIsDialogOpen(true);
  };
  
  // Mock AI generation process
  const handleGenerate = () => {
    setIsGenerating(true);
    setGenerationProgress(0);
    
    const interval = setInterval(() => {
      setGenerationProgress(prev => {
        const newProgress = prev + 5;
        if (newProgress >= 100) {
          clearInterval(interval);
          setIsGenerating(false);
          
          toast({
            title: 'AI Generation Complete',
            description: `Your ${dialogType === 'caption' ? 'captions' : 
                           dialogType === 'summary' ? 'content summary' : 
                           dialogType === 'script' ? 'script' : 
                           dialogType === 'audio' ? 'background music' : 
                           'voiceover'} has been generated successfully.`,
            variant: 'default',
          });
        }
        return newProgress;
      });
    }, 150);
  };
  
  // Dialog content based on type
  const renderDialogContent = () => {
    switch (dialogType) {
      case 'caption':
        return (
          <>
            <DialogHeader>
              <DialogTitle>Generate AI Captions</DialogTitle>
              <DialogDescription>
                Automatically create accurate captions for your video
              </DialogDescription>
            </DialogHeader>
            
            <div className="space-y-4">
              <div className="space-y-2">
                <Label>Caption Style</Label>
                <Select defaultValue="standard">
                  <SelectTrigger>
                    <SelectValue placeholder="Select style" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="standard">Standard</SelectItem>
                    <SelectItem value="cinematic">Cinematic</SelectItem>
                    <SelectItem value="minimal">Minimal</SelectItem>
                    <SelectItem value="animated">Animated</SelectItem>
                  </SelectContent>
                </Select>
              </div>
              
              <div className="space-y-2">
                <Label>Caption Position</Label>
                <Select defaultValue="bottom">
                  <SelectTrigger>
                    <SelectValue placeholder="Select position" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="top">Top</SelectItem>
                    <SelectItem value="bottom">Bottom</SelectItem>
                    <SelectItem value="top-left">Top Left</SelectItem>
                    <SelectItem value="top-right">Top Right</SelectItem>
                    <SelectItem value="bottom-left">Bottom Left</SelectItem>
                    <SelectItem value="bottom-right">Bottom Right</SelectItem>
                  </SelectContent>
                </Select>
              </div>
              
              <div className="space-y-2">
                <div className="flex items-center justify-between">
                  <Label>Language</Label>
                  <Badge variant="outline" className="text-xs">Auto-Detect</Badge>
                </div>
                <Select defaultValue="en">
                  <SelectTrigger>
                    <SelectValue placeholder="Select language" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="en">English</SelectItem>
                    <SelectItem value="es">Spanish</SelectItem>
                    <SelectItem value="fr">French</SelectItem>
                    <SelectItem value="de">German</SelectItem>
                    <SelectItem value="zh">Chinese</SelectItem>
                    <SelectItem value="ja">Japanese</SelectItem>
                    <SelectItem value="ko">Korean</SelectItem>
                    <SelectItem value="ru">Russian</SelectItem>
                    <SelectItem value="ar">Arabic</SelectItem>
                    <SelectItem value="hi">Hindi</SelectItem>
                  </SelectContent>
                </Select>
              </div>
              
              {isGenerating ? (
                <div className="space-y-4 py-4">
                  <Progress value={generationProgress} className="w-full" />
                  <div className="text-center text-sm text-muted-foreground space-y-2">
                    <p>Analyzing audio and generating captions...</p>
                    <p>
                      {generationProgress < 30 && "Transcribing speech"}
                      {generationProgress >= 30 && generationProgress < 60 && "Synchronizing with video"}
                      {generationProgress >= 60 && generationProgress < 90 && "Formatting captions"}
                      {generationProgress >= 90 && "Finalizing output"}
                    </p>
                  </div>
                </div>
              ) : null}
            </div>
            
            <DialogFooter>
              <Button variant="outline" onClick={() => setIsDialogOpen(false)} disabled={isGenerating}>
                Cancel
              </Button>
              <Button onClick={handleGenerate} disabled={isGenerating}>
                {isGenerating ? (
                  <>
                    <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                    Generating
                  </>
                ) : (
                  <>
                    <Wand2 className="mr-2 h-4 w-4" />
                    Generate Captions
                  </>
                )}
              </Button>
            </DialogFooter>
          </>
        );
        
      case 'summary':
        return (
          <>
            <DialogHeader>
              <DialogTitle>Generate Content Summary</DialogTitle>
              <DialogDescription>
                Create a concise summary of your video content
              </DialogDescription>
            </DialogHeader>
            
            <div className="space-y-4">
              <div className="space-y-2">
                <Label>Summary Type</Label>
                <Select defaultValue="paragraph">
                  <SelectTrigger>
                    <SelectValue placeholder="Select type" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="paragraph">Paragraph</SelectItem>
                    <SelectItem value="bullet">Bullet Points</SelectItem>
                    <SelectItem value="outline">Outline</SelectItem>
                    <SelectItem value="keypoints">Key Points</SelectItem>
                  </SelectContent>
                </Select>
              </div>
              
              <div className="space-y-2">
                <Label>Length</Label>
                <Select defaultValue="medium">
                  <SelectTrigger>
                    <SelectValue placeholder="Select length" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="short">Short (1-2 sentences)</SelectItem>
                    <SelectItem value="medium">Medium (1 paragraph)</SelectItem>
                    <SelectItem value="long">Long (Multiple paragraphs)</SelectItem>
                  </SelectContent>
                </Select>
              </div>
              
              <div className="space-y-2">
                <Label>Focus</Label>
                <Select defaultValue="general">
                  <SelectTrigger>
                    <SelectValue placeholder="Select focus" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="general">General Content</SelectItem>
                    <SelectItem value="educational">Educational Value</SelectItem>
                    <SelectItem value="emotional">Emotional Themes</SelectItem>
                    <SelectItem value="practical">Practical Applications</SelectItem>
                  </SelectContent>
                </Select>
              </div>
              
              {isGenerating ? (
                <div className="space-y-4 py-4">
                  <Progress value={generationProgress} className="w-full" />
                  <div className="text-center text-sm text-muted-foreground space-y-2">
                    <p>Analyzing video content and generating summary...</p>
                    <p>
                      {generationProgress < 30 && "Extracting key information"}
                      {generationProgress >= 30 && generationProgress < 60 && "Identifying main themes"}
                      {generationProgress >= 60 && generationProgress < 90 && "Drafting summary"}
                      {generationProgress >= 90 && "Refining content"}
                    </p>
                  </div>
                </div>
              ) : null}
            </div>
            
            <DialogFooter>
              <Button variant="outline" onClick={() => setIsDialogOpen(false)} disabled={isGenerating}>
                Cancel
              </Button>
              <Button onClick={handleGenerate} disabled={isGenerating}>
                {isGenerating ? (
                  <>
                    <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                    Generating
                  </>
                ) : (
                  <>
                    <FileText className="mr-2 h-4 w-4" />
                    Generate Summary
                  </>
                )}
              </Button>
            </DialogFooter>
          </>
        );
        
      case 'script':
        return (
          <>
            <DialogHeader>
              <DialogTitle>Generate Script from Outline</DialogTitle>
              <DialogDescription>
                Create a detailed script based on your outline or topic
              </DialogDescription>
            </DialogHeader>
            
            <div className="space-y-4">
              <div className="space-y-2">
                <Label>Outline or Topic</Label>
                <Textarea 
                  placeholder="Enter your video outline or topic here..."
                  rows={4}
                />
              </div>
              
              <div className="space-y-2">
                <Label>Tone</Label>
                <Select defaultValue="conversational">
                  <SelectTrigger>
                    <SelectValue placeholder="Select tone" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="conversational">Conversational</SelectItem>
                    <SelectItem value="educational">Educational</SelectItem>
                    <SelectItem value="professional">Professional</SelectItem>
                    <SelectItem value="inspirational">Inspirational</SelectItem>
                    <SelectItem value="supportive">Supportive</SelectItem>
                  </SelectContent>
                </Select>
              </div>
              
              <div className="space-y-2">
                <Label>Target Duration</Label>
                <Select defaultValue="5">
                  <SelectTrigger>
                    <SelectValue placeholder="Select duration" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="2">2 minutes</SelectItem>
                    <SelectItem value="5">5 minutes</SelectItem>
                    <SelectItem value="10">10 minutes</SelectItem>
                    <SelectItem value="15">15 minutes</SelectItem>
                    <SelectItem value="20">20+ minutes</SelectItem>
                  </SelectContent>
                </Select>
              </div>
              
              {isGenerating ? (
                <div className="space-y-4 py-4">
                  <Progress value={generationProgress} className="w-full" />
                  <div className="text-center text-sm text-muted-foreground space-y-2">
                    <p>Creating your script...</p>
                    <p>
                      {generationProgress < 30 && "Developing key points"}
                      {generationProgress >= 30 && generationProgress < 60 && "Creating narrative flow"}
                      {generationProgress >= 60 && generationProgress < 90 && "Adding transitions and details"}
                      {generationProgress >= 90 && "Finalizing script structure"}
                    </p>
                  </div>
                </div>
              ) : null}
            </div>
            
            <DialogFooter>
              <Button variant="outline" onClick={() => setIsDialogOpen(false)} disabled={isGenerating}>
                Cancel
              </Button>
              <Button onClick={handleGenerate} disabled={isGenerating}>
                {isGenerating ? (
                  <>
                    <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                    Generating
                  </>
                ) : (
                  <>
                    <ClipboardEdit className="mr-2 h-4 w-4" />
                    Generate Script
                  </>
                )}
              </Button>
            </DialogFooter>
          </>
        );
        
      case 'audio':
        return (
          <>
            <DialogHeader>
              <DialogTitle>Generate Background Music</DialogTitle>
              <DialogDescription>
                Create copyright-free music that enhances your video
              </DialogDescription>
            </DialogHeader>
            
            <div className="space-y-4">
              <div className="space-y-2">
                <Label>Music Genre</Label>
                <Select defaultValue="ambient">
                  <SelectTrigger>
                    <SelectValue placeholder="Select genre" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="ambient">Ambient / Atmospheric</SelectItem>
                    <SelectItem value="classical">Classical Instrumental</SelectItem>
                    <SelectItem value="jazz">Soft Jazz</SelectItem>
                    <SelectItem value="meditation">Meditation / Relaxation</SelectItem>
                    <SelectItem value="uplifting">Uplifting / Inspirational</SelectItem>
                    <SelectItem value="cinematic">Cinematic</SelectItem>
                  </SelectContent>
                </Select>
              </div>
              
              <div className="space-y-2">
                <Label>Emotional Tone</Label>
                <Select defaultValue="calm">
                  <SelectTrigger>
                    <SelectValue placeholder="Select tone" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="calm">Calm</SelectItem>
                    <SelectItem value="joyful">Joyful</SelectItem>
                    <SelectItem value="reflective">Reflective</SelectItem>
                    <SelectItem value="hopeful">Hopeful</SelectItem>
                    <SelectItem value="curious">Curious</SelectItem>
                    <SelectItem value="focused">Focused</SelectItem>
                  </SelectContent>
                </Select>
              </div>
              
              <div className="space-y-2">
                <Label>Duration</Label>
                <Select defaultValue="match">
                  <SelectTrigger>
                    <SelectValue placeholder="Select duration" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="match">Match Video Length</SelectItem>
                    <SelectItem value="30">30 seconds</SelectItem>
                    <SelectItem value="60">1 minute</SelectItem>
                    <SelectItem value="120">2 minutes</SelectItem>
                    <SelectItem value="300">5 minutes</SelectItem>
                    <SelectItem value="loop">Loopable Segment</SelectItem>
                  </SelectContent>
                </Select>
              </div>
              
              <div className="space-y-2">
                <Label>Instruments</Label>
                <Select defaultValue="piano">
                  <SelectTrigger>
                    <SelectValue placeholder="Select primary instrument" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="piano">Piano</SelectItem>
                    <SelectItem value="strings">Strings</SelectItem>
                    <SelectItem value="guitar">Acoustic Guitar</SelectItem>
                    <SelectItem value="synth">Synthesizer</SelectItem>
                    <SelectItem value="orchestra">Full Orchestra</SelectItem>
                    <SelectItem value="mixed">Mixed Ensemble</SelectItem>
                  </SelectContent>
                </Select>
              </div>
              
              {isGenerating ? (
                <div className="space-y-4 py-4">
                  <Progress value={generationProgress} className="w-full" />
                  <div className="text-center text-sm text-muted-foreground space-y-2">
                    <p>Composing your music...</p>
                    <p>
                      {generationProgress < 30 && "Creating melodic structure"}
                      {generationProgress >= 30 && generationProgress < 60 && "Developing harmonies"}
                      {generationProgress >= 60 && generationProgress < 90 && "Adding dynamics and texture"}
                      {generationProgress >= 90 && "Finalizing composition"}
                    </p>
                  </div>
                </div>
              ) : null}
            </div>
            
            <DialogFooter>
              <Button variant="outline" onClick={() => setIsDialogOpen(false)} disabled={isGenerating}>
                Cancel
              </Button>
              <Button onClick={handleGenerate} disabled={isGenerating}>
                {isGenerating ? (
                  <>
                    <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                    Generating
                  </>
                ) : (
                  <>
                    <Music className="mr-2 h-4 w-4" />
                    Generate Music
                  </>
                )}
              </Button>
            </DialogFooter>
          </>
        );
        
      case 'voiceover':
        return (
          <>
            <DialogHeader>
              <DialogTitle>Generate AI Voiceover</DialogTitle>
              <DialogDescription>
                Create professional voiceovers for your video
              </DialogDescription>
            </DialogHeader>
            
            <div className="space-y-4">
              <div className="space-y-2">
                <Label>Voice Script</Label>
                <Textarea 
                  placeholder="Enter the script for your voiceover here..."
                  rows={4}
                />
              </div>
              
              <div className="space-y-2">
                <Label>Voice Style</Label>
                <Select defaultValue="conversational">
                  <SelectTrigger>
                    <SelectValue placeholder="Select voice style" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="conversational">Conversational</SelectItem>
                    <SelectItem value="professional">Professional</SelectItem>
                    <SelectItem value="friendly">Friendly</SelectItem>
                    <SelectItem value="supportive">Supportive</SelectItem>
                    <SelectItem value="energetic">Energetic</SelectItem>
                    <SelectItem value="calm">Calm and Soothing</SelectItem>
                  </SelectContent>
                </Select>
              </div>
              
              <div className="space-y-2">
                <Label>Voice Type</Label>
                <Select defaultValue="female1">
                  <SelectTrigger>
                    <SelectValue placeholder="Select voice" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="female1">Female Voice 1</SelectItem>
                    <SelectItem value="female2">Female Voice 2</SelectItem>
                    <SelectItem value="male1">Male Voice 1</SelectItem>
                    <SelectItem value="male2">Male Voice 2</SelectItem>
                    <SelectItem value="neutral">Gender Neutral</SelectItem>
                  </SelectContent>
                </Select>
              </div>
              
              <div className="space-y-2">
                <Label>Language</Label>
                <Select defaultValue="en">
                  <SelectTrigger>
                    <SelectValue placeholder="Select language" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="en">English</SelectItem>
                    <SelectItem value="es">Spanish</SelectItem>
                    <SelectItem value="fr">French</SelectItem>
                    <SelectItem value="de">German</SelectItem>
                    <SelectItem value="zh">Chinese</SelectItem>
                    <SelectItem value="ja">Japanese</SelectItem>
                    <SelectItem value="ko">Korean</SelectItem>
                    <SelectItem value="ru">Russian</SelectItem>
                    <SelectItem value="ar">Arabic</SelectItem>
                    <SelectItem value="hi">Hindi</SelectItem>
                  </SelectContent>
                </Select>
              </div>
              
              {isGenerating ? (
                <div className="space-y-4 py-4">
                  <Progress value={generationProgress} className="w-full" />
                  <div className="text-center text-sm text-muted-foreground space-y-2">
                    <p>Creating your voiceover...</p>
                    <p>
                      {generationProgress < 30 && "Analyzing text"}
                      {generationProgress >= 30 && generationProgress < 60 && "Generating speech patterns"}
                      {generationProgress >= 60 && generationProgress < 90 && "Adding natural inflections"}
                      {generationProgress >= 90 && "Finalizing audio"}
                    </p>
                  </div>
                </div>
              ) : null}
            </div>
            
            <DialogFooter>
              <Button variant="outline" onClick={() => setIsDialogOpen(false)} disabled={isGenerating}>
                Cancel
              </Button>
              <Button onClick={handleGenerate} disabled={isGenerating}>
                {isGenerating ? (
                  <>
                    <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                    Generating
                  </>
                ) : (
                  <>
                    <FileAudio className="mr-2 h-4 w-4" />
                    Generate Voiceover
                  </>
                )}
              </Button>
            </DialogFooter>
          </>
        );
    }
  };
  
  return (
    <div className="space-y-4">
      <h3 className="text-sm font-medium">AI Video Tools</h3>
      
      <Tabs defaultValue={activeTab} onValueChange={setActiveTab} className="w-full">
        <TabsList className="grid grid-cols-3 w-full mb-2">
          <TabsTrigger value="captions">
            <Text className="h-3.5 w-3.5 mr-1.5" />
            <span className="text-xs">Text</span>
          </TabsTrigger>
          <TabsTrigger value="audio">
            <Music className="h-3.5 w-3.5 mr-1.5" />
            <span className="text-xs">Audio</span>
          </TabsTrigger>
          <TabsTrigger value="enhance">
            <Sparkles className="h-3.5 w-3.5 mr-1.5" />
            <span className="text-xs">Enhance</span>
          </TabsTrigger>
        </TabsList>
        
        <TabsContent value="captions" className="space-y-2">
          <Button 
            variant="outline" 
            size="sm" 
            className="w-full justify-start"
            onClick={() => handleOpenDialog('caption')}
          >
            <MessageSquareText className="h-4 w-4 mr-2" />
            Generate Captions
          </Button>
          <Button 
            variant="outline" 
            size="sm" 
            className="w-full justify-start"
            onClick={() => handleOpenDialog('summary')}
          >
            <FileText className="h-4 w-4 mr-2" />
            Create Content Summary
          </Button>
          <Button 
            variant="outline" 
            size="sm" 
            className="w-full justify-start"
            onClick={() => handleOpenDialog('script')}
          >
            <ClipboardEdit className="h-4 w-4 mr-2" />
            Generate Script
          </Button>
        </TabsContent>
        
        <TabsContent value="audio" className="space-y-2">
          <Button 
            variant="outline" 
            size="sm" 
            className="w-full justify-start"
            onClick={() => handleOpenDialog('audio')}
          >
            <Music className="h-4 w-4 mr-2" />
            Generate Background Music
          </Button>
          <Button 
            variant="outline" 
            size="sm" 
            className="w-full justify-start"
            onClick={() => handleOpenDialog('voiceover')}
          >
            <FileAudio className="h-4 w-4 mr-2" />
            Create AI Voiceover
          </Button>
        </TabsContent>
        
        <TabsContent value="enhance" className="space-y-2">
          <Button 
            variant="outline" 
            size="sm" 
            className="w-full justify-start"
            onClick={() => {
              toast({
                title: 'Video Enhancement',
                description: 'Your video quality enhancement has started. This may take a few minutes.',
                variant: 'default',
              });
            }}
          >
            <Wand2 className="h-4 w-4 mr-2" />
            Enhance Video Quality
          </Button>
          <Button 
            variant="outline" 
            size="sm" 
            className="w-full justify-start"
            onClick={() => {
              toast({
                title: 'Background Removal',
                description: 'Background removal processing has started. This may take a few minutes.',
                variant: 'default',
              });
            }}
          >
            <LayoutTemplate className="h-4 w-4 mr-2" />
            Remove Background
          </Button>
          <Button 
            variant="outline" 
            size="sm" 
            className="w-full justify-start"
            onClick={() => {
              toast({
                title: 'Color Correction',
                description: 'AI color correction has started. Analyzing and optimizing your video colors.',
                variant: 'default',
              });
            }}
          >
            <ImageIcon className="h-4 w-4 mr-2" />
            Color Correction
          </Button>
        </TabsContent>
      </Tabs>
      
      <Badge variant="outline" className="w-full justify-center bg-primary/5 text-primary text-xs py-1 font-normal">
        <Zap className="h-3 w-3 mr-1.5" />
        Premium AI Tools Included
      </Badge>
      
      {/* AI Tool Dialog */}
      <Dialog open={isDialogOpen} onOpenChange={setIsDialogOpen}>
        <DialogContent className="max-w-md">
          {renderDialogContent()}
        </DialogContent>
      </Dialog>
    </div>
  );
}