import React, { useState } from 'react';
import { useQuery } from '@tanstack/react-query';
import { getQueryFn } from '@/lib/queryClient';
import { EmotionalImprint } from '@/types/imprints';
import { useToast } from '@/hooks/use-toast';
import { useAuth } from '@/hooks/use-auth';
import ImprintViewer from './imprint-viewer';
import ImprintShare from './imprint-share';
import { Dialog, DialogContent, DialogTrigger } from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Loader2, SearchIcon, Filter, SlidersHorizontal, Grid2X2, Grid3X3 } from 'lucide-react';
import { emotionCategories } from '@/lib/imprints-constants';

interface ImprintGridProps {
  imprints: EmotionalImprint[] | undefined;
  isLoading?: boolean;
  emptyMessage?: string;
  isUserImprints?: boolean;
  onEdit?: (imprint: EmotionalImprint) => void;
}

const ImprintGrid: React.FC<ImprintGridProps> = ({
  imprints,
  isLoading = false,
  emptyMessage = "No emotional imprints found",
  isUserImprints = false,
  onEdit,
}) => {
  const { toast } = useToast();
  const { user } = useAuth();
  const [searchTerm, setSearchTerm] = useState('');
  const [emotionFilter, setEmotionFilter] = useState('all');
  const [gridCols, setGridCols] = useState<2 | 3>(3);
  const [sharingImprint, setSharingImprint] = useState<EmotionalImprint | null>(null);
  const [isShareDialogOpen, setIsShareDialogOpen] = useState(false);

  // Filter imprints based on search term and emotion filter
  const filteredImprints = imprints?.filter(imprint => {
    // Search filter
    const matchesSearch = searchTerm === '' ||
      imprint.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
      (imprint.description && imprint.description.toLowerCase().includes(searchTerm.toLowerCase())) ||
      imprint.emotion.toLowerCase().includes(searchTerm.toLowerCase());
    
    // Emotion category filter
    const matchesEmotion =
      emotionFilter === 'all' ||
      (emotionFilter === 'positive' && emotionCategories.positive.includes(imprint.emotion)) ||
      (emotionFilter === 'negative' && emotionCategories.negative.includes(imprint.emotion)) ||
      (emotionFilter === 'neutral' && emotionCategories.neutral.includes(imprint.emotion)) ||
      imprint.emotion.toLowerCase() === emotionFilter.toLowerCase();
    
    return matchesSearch && matchesEmotion;
  });

  // Handle sharing an imprint
  const handleShare = (imprint: EmotionalImprint) => {
    setSharingImprint(imprint);
    setIsShareDialogOpen(true);
  };

  // Handle commenting on an imprint
  const handleComment = (imprint: EmotionalImprint) => {
    // For now, just show a toast until we implement comments
    toast({
      title: 'Comments Coming Soon',
      description: 'The ability to comment on emotional imprints will be available soon.',
    });
  };

  // Handle editing an imprint
  const handleEdit = (imprint: EmotionalImprint) => {
    if (onEdit) {
      onEdit(imprint);
    }
  };

  return (
    <div className="space-y-4">
      {/* Filters and Search */}
      <div className="flex flex-col md:flex-row gap-4 mb-6">
        <div className="relative flex-1">
          <SearchIcon className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
          <Input
            placeholder="Search imprints..."
            value={searchTerm}
            onChange={e => setSearchTerm(e.target.value)}
            className="pl-10"
          />
        </div>
        
        <div className="flex gap-2">
          <Select value={emotionFilter} onValueChange={setEmotionFilter}>
            <SelectTrigger className="w-[180px]">
              <SlidersHorizontal className="mr-2 h-4 w-4" />
              <span>
                {emotionFilter === 'all' ? 'All Emotions' :
                  emotionFilter === 'positive' ? 'Positive' :
                  emotionFilter === 'negative' ? 'Negative' :
                  emotionFilter === 'neutral' ? 'Neutral' :
                  emotionFilter}
              </span>
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">All Emotions</SelectItem>
              <SelectItem value="positive">Positive</SelectItem>
              <SelectItem value="negative">Negative</SelectItem>
              <SelectItem value="neutral">Neutral</SelectItem>
              {emotionCategories.positive.map(emotion => (
                <SelectItem key={emotion} value={emotion.toLowerCase()}>
                  {emotion}
                </SelectItem>
              ))}
              {emotionCategories.negative.map(emotion => (
                <SelectItem key={emotion} value={emotion.toLowerCase()}>
                  {emotion}
                </SelectItem>
              ))}
              {emotionCategories.neutral.map(emotion => (
                <SelectItem key={emotion} value={emotion.toLowerCase()}>
                  {emotion}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
          
          <div className="flex rounded-md border">
            <Button
              variant="ghost"
              size="icon"
              className={`h-10 w-10 ${gridCols === 2 ? 'bg-accent' : ''}`}
              onClick={() => setGridCols(2)}
              aria-label="Two columns"
            >
              <Grid2X2 className="h-4 w-4" />
            </Button>
            <Button
              variant="ghost"
              size="icon"
              className={`h-10 w-10 ${gridCols === 3 ? 'bg-accent' : ''}`}
              onClick={() => setGridCols(3)}
              aria-label="Three columns"
            >
              <Grid3X3 className="h-4 w-4" />
            </Button>
          </div>
        </div>
      </div>
      
      {isLoading ? (
        <div className="flex justify-center items-center h-60">
          <Loader2 className="h-10 w-10 animate-spin text-primary" />
        </div>
      ) : filteredImprints && filteredImprints.length > 0 ? (
        <div className={`grid grid-cols-1 md:grid-cols-${gridCols} gap-6`}>
          {filteredImprints.map(imprint => (
            <div key={imprint.id} className="h-full">
              <ImprintViewer
                imprint={imprint}
                onShare={handleShare}
                onComment={handleComment}
              />
              
              {/* Edit button for user's own imprints */}
              {isUserImprints && onEdit && (
                <div className="mt-2 flex justify-end">
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={() => handleEdit(imprint)}
                  >
                    Edit
                  </Button>
                </div>
              )}
            </div>
          ))}
        </div>
      ) : (
        <Card className="border-dashed">
          <CardHeader className="flex flex-row items-center justify-center pb-2">
            <CardTitle className="text-xl font-medium text-center text-muted-foreground">
              {emptyMessage}
            </CardTitle>
          </CardHeader>
          <CardContent className="flex justify-center p-6">
            <div className="flex flex-col items-center text-center max-w-md">
              <p className="text-sm text-muted-foreground mb-6">
                {isUserImprints
                  ? "You haven't created any emotional imprints yet. Create one to start capturing your emotional experiences."
                  : "No emotional imprints match your search criteria. Try adjusting your filters or search term."}
              </p>
            </div>
          </CardContent>
        </Card>
      )}
      
      {/* Sharing Dialog */}
      <Dialog open={isShareDialogOpen} onOpenChange={setIsShareDialogOpen}>
        <DialogContent className="sm:max-w-md">
          {sharingImprint && (
            <ImprintShare 
              imprint={sharingImprint} 
              onSuccess={() => {
                setIsShareDialogOpen(false);
                setSharingImprint(null);
              }}
            />
          )}
        </DialogContent>
      </Dialog>
    </div>
  );
};

export default ImprintGrid;