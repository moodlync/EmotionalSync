import { useState, useRef, useEffect } from 'react';
import { Button } from '@/components/ui/button';
import { Slider } from '@/components/ui/slider';
import { ZoomIn, ZoomOut, Layers } from 'lucide-react';

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

interface VideoEditorTimelineProps {
  clips: VideoClip[];
  audioTracks: AudioTrack[];
  textOverlays: TextOverlay[];
  transitions: Transition[];
  duration: number;
  currentTime: number;
  zoom: number;
  onSeek: (time: number) => void;
  onZoomChange: (zoom: number) => void;
}

export default function VideoEditorTimeline({
  clips,
  audioTracks,
  textOverlays,
  transitions,
  duration,
  currentTime,
  zoom,
  onSeek,
  onZoomChange,
}: VideoEditorTimelineProps) {
  const timelineRef = useRef<HTMLDivElement>(null);
  const [isDragging, setIsDragging] = useState(false);
  const [timelineWidth, setTimelineWidth] = useState(0);
  
  // Calculate timeline width on mount and resize
  useEffect(() => {
    const updateWidth = () => {
      if (timelineRef.current) {
        setTimelineWidth(timelineRef.current.clientWidth);
      }
    };
    
    updateWidth();
    window.addEventListener('resize', updateWidth);
    
    return () => {
      window.removeEventListener('resize', updateWidth);
    };
  }, []);
  
  // Draw timeline markers (time indicators)
  const renderTimeMarkers = () => {
    if (duration <= 0) return null;
    
    const markers = [];
    const step = Math.max(1, Math.floor(duration / 10)); // Show markers every step seconds
    
    for (let i = 0; i <= duration; i += step) {
      const leftPosition = (i / duration) * 100;
      
      markers.push(
        <div 
          key={i} 
          className="absolute top-0 h-full" 
          style={{ left: `${leftPosition}%` }}
        >
          <div className="h-3 border-l border-border"></div>
          <div className="text-xs text-muted-foreground mt-1">{formatTime(i)}</div>
        </div>
      );
    }
    
    return markers;
  };
  
  // Format time from seconds to MM:SS
  const formatTime = (seconds: number) => {
    const mins = Math.floor(seconds / 60);
    const secs = Math.floor(seconds % 60);
    return `${mins}:${secs.toString().padStart(2, '0')}`;
  };
  
  // Handle timeline click for seeking
  const handleTimelineClick = (e: React.MouseEvent<HTMLDivElement>) => {
    if (!timelineRef.current || duration <= 0) return;
    
    const rect = timelineRef.current.getBoundingClientRect();
    const clickPosition = e.clientX - rect.left;
    const percentage = clickPosition / rect.width;
    const newTime = percentage * duration;
    
    onSeek(Math.max(0, Math.min(newTime, duration)));
  };
  
  // Handle mouse drag for seeking
  const handleMouseDown = (e: React.MouseEvent<HTMLDivElement>) => {
    setIsDragging(true);
    handleTimelineClick(e);
    
    const handleMouseMove = (e: MouseEvent) => {
      if (isDragging && timelineRef.current) {
        const rect = timelineRef.current.getBoundingClientRect();
        const clickPosition = e.clientX - rect.left;
        const percentage = clickPosition / rect.width;
        const newTime = percentage * duration;
        
        onSeek(Math.max(0, Math.min(newTime, duration)));
      }
    };
    
    const handleMouseUp = () => {
      setIsDragging(false);
      document.removeEventListener('mousemove', handleMouseMove);
      document.removeEventListener('mouseup', handleMouseUp);
    };
    
    document.addEventListener('mousemove', handleMouseMove);
    document.addEventListener('mouseup', handleMouseUp);
  };
  
  // Zoom in/out handlers
  const handleZoomIn = () => {
    onZoomChange(Math.min(zoom + 0.25, 4));
  };
  
  const handleZoomOut = () => {
    onZoomChange(Math.max(zoom - 0.25, 0.5));
  };
  
  return (
    <div className="flex flex-col h-full">
      <div className="p-2 border-b border-border flex justify-between items-center">
        <div className="text-sm font-medium">Timeline</div>
        <div className="flex items-center space-x-2">
          <Button
            variant="ghost"
            size="icon"
            onClick={handleZoomOut}
            disabled={zoom <= 0.5}
          >
            <ZoomOut className="h-4 w-4" />
          </Button>
          
          <div className="text-xs text-muted-foreground w-12 text-center">
            {zoom.toFixed(1)}x
          </div>
          
          <Button
            variant="ghost"
            size="icon"
            onClick={handleZoomIn}
            disabled={zoom >= 4}
          >
            <ZoomIn className="h-4 w-4" />
          </Button>
        </div>
      </div>
      
      <div className="flex-1 overflow-auto relative">
        <div className="h-full flex flex-col">
          {/* Timeline ruler */}
          <div 
            className="h-8 border-b border-border relative"
            ref={timelineRef}
            onClick={handleTimelineClick}
            onMouseDown={handleMouseDown}
          >
            {renderTimeMarkers()}
            
            {/* Playhead indicator */}
            <div 
              className="absolute top-0 bottom-0 w-0.5 bg-primary z-10"
              style={{ left: `${(currentTime / duration) * 100}%` }}
            >
              <div className="w-3 h-3 bg-primary rounded-full -ml-1.5 -mt-1.5"></div>
            </div>
          </div>
          
          {/* Tracks */}
          <div 
            className="flex-1 overflow-y-auto"
            style={{ width: `${100 * zoom}%` }}
          >
            {/* Video track */}
            <div className="border-b border-border">
              <div className="py-1 px-2 bg-muted/30 text-xs font-medium flex items-center">
                <Layers className="h-3 w-3 mr-1" />
                Video Track
              </div>
              <div className="h-16 relative">
                {clips.map((clip) => (
                  <div 
                    key={clip.id}
                    className={`absolute top-2 h-12 rounded border ${clip.type === 'video' ? 'bg-blue-100/30 border-blue-200/70' : 'bg-amber-100/30 border-amber-200/70'}`}
                    style={{ 
                      left: `${(clip.startTime / duration) * 100}%`,
                      width: `${((clip.endTime - clip.startTime) / duration) * 100}%`
                    }}
                  >
                    <div className="px-2 py-1 text-xs truncate">
                      {clip.type === 'video' ? 'Video' : 'Image'}
                    </div>
                  </div>
                ))}
              </div>
            </div>
            
            {/* Audio tracks */}
            {audioTracks.length > 0 && (
              <div className="border-b border-border">
                <div className="py-1 px-2 bg-muted/30 text-xs font-medium">
                  Audio Tracks
                </div>
                <div className="h-12 relative">
                  {audioTracks.map((track) => (
                    <div 
                      key={track.id}
                      className="absolute top-2 h-8 rounded border bg-green-100/30 border-green-200/70"
                      style={{ 
                        left: `${(track.startTime / duration) * 100}%`,
                        width: `${((track.endTime - track.startTime) / duration) * 100}%`
                      }}
                    >
                      <div className="px-2 py-1 text-xs truncate">
                        {track.name}
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            )}
            
            {/* Text overlays */}
            {textOverlays.length > 0 && (
              <div className="border-b border-border">
                <div className="py-1 px-2 bg-muted/30 text-xs font-medium">
                  Text Overlays
                </div>
                <div className="h-10 relative">
                  {textOverlays.map((overlay) => (
                    <div 
                      key={overlay.id}
                      className="absolute top-2 h-6 rounded border bg-purple-100/30 border-purple-200/70"
                      style={{ 
                        left: `${(overlay.startTime / duration) * 100}%`,
                        width: `${(overlay.duration / duration) * 100}%`
                      }}
                    >
                      <div className="px-2 text-xs truncate">
                        {overlay.text}
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            )}
            
            {/* Transitions */}
            {transitions.length > 0 && (
              <div className="border-b border-border">
                <div className="py-1 px-2 bg-muted/30 text-xs font-medium">
                  Transitions
                </div>
                <div className="h-8 relative">
                  {transitions.map((transition) => (
                    <div 
                      key={transition.id}
                      className="absolute top-2 h-4 rounded border bg-orange-100/30 border-orange-200/70"
                      style={{ 
                        left: `${(transition.position / duration) * 100}%`,
                        width: `${(transition.duration / duration) * 100}%`
                      }}
                    >
                      <div className="px-1 text-[10px] truncate">
                        {transition.type}
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}