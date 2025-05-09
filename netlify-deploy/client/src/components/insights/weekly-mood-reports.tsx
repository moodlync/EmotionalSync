import { useState } from "react";
import { 
  Card, 
  CardContent, 
  CardDescription, 
  CardFooter, 
  CardHeader, 
  CardTitle 
} from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { 
  useMutation, 
  useQuery, 
  useQueryClient 
} from "@tanstack/react-query";
import { apiRequest } from "@/lib/queryClient";
import { 
  Loader2, 
  FileDown, 
  BarChart2, 
  FileText, 
  Calendar, 
  Download,
  RefreshCw
} from "lucide-react";
import { useToast } from "@/hooks/use-toast";
import {
  Accordion,
  AccordionContent,
  AccordionItem,
  AccordionTrigger,
} from "@/components/ui/accordion";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { format } from "date-fns";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Badge } from "@/components/ui/badge";

// Define weekly mood report interface
interface WeeklyMoodReport {
  id: number;
  userId: number;
  startDate: string;
  endDate: string;
  moodSummary: string;
  averageMood: string;
  moodDistribution: Record<string, number>;
  moodTrends: string;
  recommendations: string;
  insights: string;
  createdAt: string;
}

export function WeeklyMoodReports() {
  const { toast } = useToast();
  const queryClient = useQueryClient();
  const [selectedReport, setSelectedReport] = useState<WeeklyMoodReport | null>(null);
  const [isReportDialogOpen, setIsReportDialogOpen] = useState(false);

  // Query for fetching the user's weekly mood reports
  const { data: reports, isLoading: isLoadingReports } = useQuery({
    queryKey: ["/api/weekly-mood-reports"],
    queryFn: async () => {
      const response = await apiRequest("GET", "/api/weekly-mood-reports");
      return await response.json();
    },
  });

  // Query for fetching the latest weekly mood report
  const { data: latestReport, isLoading: isLoadingLatest } = useQuery({
    queryKey: ["/api/weekly-mood-reports/latest"],
    queryFn: async () => {
      try {
        const response = await apiRequest("GET", "/api/weekly-mood-reports/latest");
        if (response.status === 404) {
          return null;
        }
        return await response.json();
      } catch (error) {
        // Return null if no reports exist yet (404)
        return null;
      }
    },
  });

  // Mutation for generating a new weekly report
  const generateReportMutation = useMutation({
    mutationFn: async () => {
      const response = await apiRequest("POST", "/api/weekly-mood-reports/generate");
      return await response.json();
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["/api/weekly-mood-reports"] });
      queryClient.invalidateQueries({ queryKey: ["/api/weekly-mood-reports/latest"] });
      toast({
        title: "Report Generated",
        description: "Your weekly mood report has been successfully generated.",
      });
    },
    onError: (error: any) => {
      toast({
        title: "Error",
        description: error.message || "Failed to generate weekly report. Please try again.",
        variant: "destructive",
      });
    }
  });

  // Handle report generation
  const handleGenerateReport = () => {
    generateReportMutation.mutate();
  };

  // Open report details dialog
  const openReportDetails = (report: WeeklyMoodReport) => {
    setSelectedReport(report);
    setIsReportDialogOpen(true);
  };

  // Helper function to format dates
  const formatReportDate = (dateString: string) => {
    return format(new Date(dateString), 'MMM d, yyyy');
  };

  // Handle report download (dummy function - would generate PDF in real implementation)
  const handleDownloadReport = (report: WeeklyMoodReport) => {
    // In a real implementation, this would generate a PDF or other document
    // For now, we'll just show a toast
    toast({
      title: "Report Download",
      description: `Report for ${formatReportDate(report.startDate)} - ${formatReportDate(report.endDate)} would be downloaded here.`,
    });
  };

  // Get mood badge color based on mood name
  const getMoodColor = (mood: string) => {
    const moodColors: Record<string, string> = {
      happy: "#A6FF6F",
      sad: "#6F9CFF",
      angry: "#FF6F6F",
      anxious: "#FFCC6F",
      excited: "#FF6FE8",
      neutral: "#E0E0E0",
    };
    
    return moodColors[mood.toLowerCase()] || "#A6FF6F";
  };

  return (
    <Card className="w-full">
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <BarChart2 className="h-5 w-5" />
          Weekly Mood Reports
        </CardTitle>
        <CardDescription>
          View insights and trends from your emotional journey over time
        </CardDescription>
      </CardHeader>
      <CardContent>
        {isLoadingReports || isLoadingLatest ? (
          <div className="flex justify-center py-8">
            <Loader2 className="h-8 w-8 animate-spin text-muted-foreground" />
          </div>
        ) : !reports || reports.length === 0 ? (
          <div className="text-center py-8">
            <p className="text-muted-foreground">You don't have any weekly mood reports yet.</p>
            <p className="text-sm text-muted-foreground mt-1">
              Generate your first report to gain insights into your emotional patterns.
            </p>
          </div>
        ) : (
          <div className="space-y-4">
            {/* Latest Report Summary Card */}
            {latestReport && (
              <Card>
                <CardHeader className="pb-2">
                  <CardTitle className="text-lg">Your Latest Report</CardTitle>
                  <CardDescription>
                    {formatReportDate(latestReport.startDate)} - {formatReportDate(latestReport.endDate)}
                  </CardDescription>
                </CardHeader>
                <CardContent className="pb-2">
                  <div className="space-y-2">
                    <div>
                      <span className="text-sm font-medium">Average Mood:</span>
                      <Badge 
                        className="ml-2"
                        style={{ backgroundColor: getMoodColor(latestReport.averageMood) }}
                      >
                        {latestReport.averageMood}
                      </Badge>
                    </div>
                    <div>
                      <span className="text-sm font-medium">Summary:</span>
                      <p className="text-sm text-muted-foreground mt-1">{latestReport.moodSummary}</p>
                    </div>
                  </div>
                </CardContent>
                <CardFooter>
                  <Button 
                    variant="outline" 
                    className="w-full"
                    onClick={() => openReportDetails(latestReport)}
                  >
                    <FileText className="mr-2 h-4 w-4" />
                    View Full Report
                  </Button>
                </CardFooter>
              </Card>
            )}

            {/* All Reports Accordion */}
            <Accordion type="single" collapsible className="w-full">
              <AccordionItem value="reports">
                <AccordionTrigger>
                  <div className="flex items-center">
                    <Calendar className="mr-2 h-4 w-4" />
                    Previous Reports
                  </div>
                </AccordionTrigger>
                <AccordionContent>
                  {reports.length > 0 ? (
                    <div className="space-y-2">
                      {reports.map((report: WeeklyMoodReport) => (
                        <div 
                          key={report.id}
                          className="flex items-center justify-between p-2 border rounded-md"
                        >
                          <div>
                            <p className="text-sm font-medium">
                              {formatReportDate(report.startDate)} - {formatReportDate(report.endDate)}
                            </p>
                            <Badge 
                              className="mt-1"
                              style={{ backgroundColor: getMoodColor(report.averageMood) }}
                            >
                              {report.averageMood}
                            </Badge>
                          </div>
                          <div className="flex gap-1">
                            <Button 
                              variant="ghost" 
                              size="icon" 
                              onClick={() => openReportDetails(report)}
                            >
                              <FileText className="h-4 w-4" />
                            </Button>
                            <Button 
                              variant="ghost" 
                              size="icon" 
                              onClick={() => handleDownloadReport(report)}
                            >
                              <Download className="h-4 w-4" />
                            </Button>
                          </div>
                        </div>
                      ))}
                    </div>
                  ) : (
                    <p className="text-sm text-muted-foreground">No previous reports found.</p>
                  )}
                </AccordionContent>
              </AccordionItem>
            </Accordion>
          </div>
        )}
      </CardContent>
      <CardFooter className="flex justify-center">
        <Button 
          className="w-full sm:w-auto"
          onClick={handleGenerateReport}
          disabled={generateReportMutation.isPending}
        >
          {generateReportMutation.isPending ? (
            <Loader2 className="mr-2 h-4 w-4 animate-spin" />
          ) : (
            <RefreshCw className="mr-2 h-4 w-4" />
          )}
          Generate New Report
        </Button>
      </CardFooter>

      {/* Report Details Dialog */}
      {selectedReport && (
        <Dialog open={isReportDialogOpen} onOpenChange={setIsReportDialogOpen}>
          <DialogContent className="max-w-3xl">
            <DialogHeader>
              <DialogTitle>Weekly Mood Report</DialogTitle>
              <DialogDescription>
                {formatReportDate(selectedReport.startDate)} - {formatReportDate(selectedReport.endDate)}
              </DialogDescription>
            </DialogHeader>
            
            <Tabs defaultValue="overview" className="w-full">
              <TabsList className="w-full justify-start">
                <TabsTrigger value="overview">Overview</TabsTrigger>
                <TabsTrigger value="insights">Insights</TabsTrigger>
                <TabsTrigger value="recommendations">Recommendations</TabsTrigger>
              </TabsList>
              
              <ScrollArea className="max-h-[60vh]">
                <TabsContent value="overview" className="pt-4 space-y-4">
                  <div>
                    <h3 className="text-lg font-semibold">Mood Summary</h3>
                    <p className="text-sm mt-1">{selectedReport.moodSummary}</p>
                  </div>
                  
                  <div>
                    <h3 className="text-lg font-semibold">Average Mood</h3>
                    <Badge 
                      className="mt-1"
                      style={{ backgroundColor: getMoodColor(selectedReport.averageMood) }}
                    >
                      {selectedReport.averageMood}
                    </Badge>
                  </div>
                  
                  <div>
                    <h3 className="text-lg font-semibold">Mood Distribution</h3>
                    <div className="grid grid-cols-2 sm:grid-cols-3 gap-2 mt-1">
                      {Object.entries(selectedReport.moodDistribution).map(([mood, count]) => (
                        <div key={mood} className="p-2 border rounded-md">
                          <Badge 
                            style={{ backgroundColor: getMoodColor(mood) }}
                          >
                            {mood}
                          </Badge>
                          <p className="text-sm mt-1">{count} instances</p>
                        </div>
                      ))}
                    </div>
                  </div>
                  
                  <div>
                    <h3 className="text-lg font-semibold">Mood Trends</h3>
                    <p className="text-sm mt-1">{selectedReport.moodTrends}</p>
                  </div>
                </TabsContent>
                
                <TabsContent value="insights" className="pt-4">
                  <div>
                    <h3 className="text-lg font-semibold">Insights</h3>
                    <p className="text-sm mt-1">{selectedReport.insights}</p>
                  </div>
                </TabsContent>
                
                <TabsContent value="recommendations" className="pt-4">
                  <div>
                    <h3 className="text-lg font-semibold">Recommendations</h3>
                    <p className="text-sm mt-1">{selectedReport.recommendations}</p>
                  </div>
                </TabsContent>
              </ScrollArea>
            </Tabs>
            
            <div className="flex justify-end">
              <Button 
                variant="outline" 
                onClick={() => handleDownloadReport(selectedReport)}
              >
                <FileDown className="mr-2 h-4 w-4" />
                Download Report
              </Button>
            </div>
          </DialogContent>
        </Dialog>
      )}
    </Card>
  );
}