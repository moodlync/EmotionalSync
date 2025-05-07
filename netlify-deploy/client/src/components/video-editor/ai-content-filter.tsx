import { useState } from 'react';
import { useMutation } from '@tanstack/react-query';
import { apiRequest } from '@/lib/queryClient';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from '@/components/ui/card';
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { Progress } from '@/components/ui/progress';
import { Separator } from '@/components/ui/separator';
import { useToast } from '@/hooks/use-toast';
import { AlertCircle, CheckCircle, Shield, XCircle, Info } from 'lucide-react';

interface ContentFilterResult {
  isApproved: boolean;
  safetyScore: number;
  violationCategories: ContentViolationCategory[];
  suggestedActions: string[];
  timestamp: string;
}

interface ContentViolationCategory {
  name: string;
  severity: 'none' | 'low' | 'medium' | 'high';
  confidence: number;
  details: string;
}

interface AIContentFilterProps {
  videoFile?: File;
  onFilterComplete?: (result: ContentFilterResult) => void;
}

export default function AIContentFilter({ videoFile, onFilterComplete }: AIContentFilterProps) {
  const { toast } = useToast();
  const [isDialogOpen, setIsDialogOpen] = useState(false);
  const [scanProgress, setScanProgress] = useState(0);
  const [scanResult, setScanResult] = useState<ContentFilterResult | null>(null);
  
  // Mock content scanning for development purposes
  // In production, this would make API calls to a content moderation service
  const scanContentMutation = useMutation({
    mutationFn: async (file: File) => {
      // Simulate a progressing scan
      return new Promise<ContentFilterResult>((resolve) => {
        let progress = 0;
        const interval = setInterval(() => {
          progress += 5;
          setScanProgress(progress);
          
          if (progress >= 100) {
            clearInterval(interval);
            
            // Sample result - in production this would come from the API
            const result: ContentFilterResult = {
              isApproved: true,
              safetyScore: 92,
              violationCategories: [
                {
                  name: 'Violence',
                  severity: 'none',
                  confidence: 0.98,
                  details: 'No violent content detected'
                },
                {
                  name: 'Adult Content',
                  severity: 'none',
                  confidence: 0.99,
                  details: 'No adult content detected'
                },
                {
                  name: 'Hate Speech',
                  severity: 'low',
                  confidence: 0.75,
                  details: 'Some potentially problematic language detected, but context appears educational'
                },
                {
                  name: 'Harassment',
                  severity: 'none',
                  confidence: 0.97,
                  details: 'No harassment detected'
                },
                {
                  name: 'Self-harm',
                  severity: 'none',
                  confidence: 0.99,
                  details: 'No self-harm content detected'
                }
              ],
              suggestedActions: [
                'Review any potentially problematic language in the educational context',
                'Ensure all claims are factually accurate and properly sourced',
                'Consider adding content warnings if discussing sensitive topics, even in an educational context'
              ],
              timestamp: new Date().toISOString()
            };
            
            resolve(result);
          }
        }, 200);
      });
    },
    onSuccess: (data) => {
      setScanResult(data);
      
      if (onFilterComplete) {
        onFilterComplete(data);
      }
      
      if (data.isApproved) {
        toast({
          title: 'Content Scan Complete',
          description: 'Your content passes our community guidelines.',
          variant: 'default',
        });
      } else {
        toast({
          title: 'Content Policy Issues Found',
          description: 'Please review the detected issues before publishing.',
          variant: 'destructive',
        });
      }
    },
    onError: () => {
      toast({
        title: 'Scan Failed',
        description: 'There was an error scanning your content. Please try again.',
        variant: 'destructive',
      });
    }
  });
  
  const handleScanContent = () => {
    if (!videoFile) {
      toast({
        title: 'No Video Selected',
        description: 'Please add video content before running a content scan.',
        variant: 'destructive',
      });
      return;
    }
    
    setScanProgress(0);
    setScanResult(null);
    setIsDialogOpen(true);
    scanContentMutation.mutate(videoFile);
  };
  
  return (
    <>
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center">
            <Shield className="h-5 w-5 mr-2 text-primary" />
            AI Content Safety Check
          </CardTitle>
          <CardDescription>
            Verify your content meets our community guidelines
          </CardDescription>
        </CardHeader>
        <CardContent>
          <p className="text-sm text-muted-foreground mb-4">
            Our AI system can analyze your video for potentially problematic content that might violate
            our community guidelines or legal requirements. This helps ensure your content is appropriate for all audiences.
          </p>
          
          {scanResult && (
            <div className="mb-4 p-3 rounded-md border bg-card">
              <div className="flex justify-between items-center mb-2">
                <div className="text-sm font-medium">Safety Score</div>
                <div className="text-sm font-medium">{scanResult.safetyScore}%</div>
              </div>
              <Progress value={scanResult.safetyScore} className="h-2 mb-1" />
              <div className="flex items-center mt-2">
                {scanResult.isApproved ? (
                  <>
                    <CheckCircle className="h-4 w-4 text-green-500 mr-2" />
                    <span className="text-sm text-green-500">Content approved</span>
                  </>
                ) : (
                  <>
                    <AlertCircle className="h-4 w-4 text-red-500 mr-2" />
                    <span className="text-sm text-red-500">Issues detected</span>
                  </>
                )}
              </div>
            </div>
          )}
          
          <div className="flex space-x-2">
            <Button 
              onClick={handleScanContent} 
              className="w-full"
              variant="outline"
              disabled={scanContentMutation.isPending || !videoFile}
            >
              <Shield className="h-4 w-4 mr-2" />
              Scan Content
            </Button>
            
            {scanResult && (
              <Button 
                onClick={() => setIsDialogOpen(true)} 
                variant="secondary"
              >
                <Info className="h-4 w-4 mr-2" />
                View Report
              </Button>
            )}
          </div>
        </CardContent>
      </Card>
      
      {/* Content Scan Dialog */}
      <Dialog open={isDialogOpen} onOpenChange={setIsDialogOpen}>
        <DialogContent className="max-w-2xl">
          <DialogHeader>
            <DialogTitle>Content Safety Analysis</DialogTitle>
            <DialogDescription>
              AI-powered analysis of your video content for guideline compliance
            </DialogDescription>
          </DialogHeader>
          
          {scanContentMutation.isPending && (
            <div className="py-8 space-y-4">
              <Progress value={scanProgress} className="w-full h-2" />
              <div className="text-center text-sm text-muted-foreground">
                Analyzing video content...
                {scanProgress < 30 && "Identifying visual elements"}
                {scanProgress >= 30 && scanProgress < 60 && "Analyzing audio content"}
                {scanProgress >= 60 && scanProgress < 90 && "Checking against content policies"}
                {scanProgress >= 90 && "Finalizing report"}
              </div>
            </div>
          )}
          
          {scanResult && (
            <div className="space-y-6">
              <div className="flex items-center justify-between">
                <div className="flex items-center">
                  <div className={`h-12 w-12 rounded-full flex items-center justify-center ${
                    scanResult.isApproved 
                    ? 'bg-green-100 text-green-700' 
                    : 'bg-red-100 text-red-700'
                  }`}>
                    {scanResult.isApproved ? (
                      <CheckCircle className="h-6 w-6" />
                    ) : (
                      <XCircle className="h-6 w-6" />
                    )}
                  </div>
                  <div className="ml-4">
                    <h3 className="text-lg font-medium">
                      {scanResult.isApproved ? 'Content Approved' : 'Issues Detected'}
                    </h3>
                    <p className="text-sm text-muted-foreground">
                      {scanResult.isApproved 
                        ? 'Your content meets our community guidelines' 
                        : 'Please review and address the issues below'}
                    </p>
                  </div>
                </div>
                
                <div className="text-right">
                  <div className="text-2xl font-bold">{scanResult.safetyScore}%</div>
                  <div className="text-sm text-muted-foreground">Safety Score</div>
                </div>
              </div>
              
              <Separator />
              
              <div>
                <h3 className="text-lg font-medium mb-3">Content Categories</h3>
                <div className="space-y-3">
                  {scanResult.violationCategories.map((category) => (
                    <div key={category.name} className="border rounded-md p-3">
                      <div className="flex justify-between items-center mb-1">
                        <div className="font-medium">{category.name}</div>
                        <div className={`text-sm px-2 py-0.5 rounded ${
                          category.severity === 'none' ? 'bg-green-100 text-green-700' :
                          category.severity === 'low' ? 'bg-amber-100 text-amber-700' :
                          category.severity === 'medium' ? 'bg-orange-100 text-orange-700' :
                          'bg-red-100 text-red-700'
                        }`}>
                          {category.severity === 'none' ? 'Clear' : 
                           category.severity === 'low' ? 'Low Severity' :
                           category.severity === 'medium' ? 'Medium Severity' :
                           'High Severity'}
                        </div>
                      </div>
                      <div className="flex justify-between items-center mb-1">
                        <div className="text-sm text-muted-foreground">Confidence</div>
                        <div className="text-sm">{(category.confidence * 100).toFixed(0)}%</div>
                      </div>
                      <Progress 
                        value={category.confidence * 100} 
                        className={`h-1 mb-2 ${
                          category.severity === 'none' ? 'bg-green-100' :
                          category.severity === 'low' ? 'bg-amber-100' :
                          category.severity === 'medium' ? 'bg-orange-100' :
                          'bg-red-100'
                        }`}
                      />
                      <p className="text-sm">{category.details}</p>
                    </div>
                  ))}
                </div>
              </div>
              
              {scanResult.suggestedActions.length > 0 && (
                <>
                  <Separator />
                  
                  <div>
                    <h3 className="text-lg font-medium mb-3">Suggested Actions</h3>
                    <ul className="space-y-2">
                      {scanResult.suggestedActions.map((action, index) => (
                        <li key={index} className="flex items-start">
                          <Info className="h-4 w-4 text-primary mt-0.5 mr-2 flex-shrink-0" />
                          <span className="text-sm">{action}</span>
                        </li>
                      ))}
                    </ul>
                  </div>
                </>
              )}
            </div>
          )}
          
          <DialogFooter>
            <Button onClick={() => setIsDialogOpen(false)}>Close</Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </>
  );
}