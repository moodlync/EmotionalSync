import { useState, useEffect } from "react";
import AdminLayout from "@/components/admin/admin-layout";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import { Tabs, TabsList, TabsTrigger, TabsContent } from "@/components/ui/tabs";
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert";
import { Pagination, PaginationContent, PaginationItem, PaginationLink, PaginationEllipsis, PaginationNext, PaginationPrevious } from "@/components/ui/pagination";
import { CheckCircle, XCircle, MessageSquare, Search, AlertTriangle, MoreHorizontal, RefreshCw } from "lucide-react";
import { apiRequest } from "@/lib/queryClient";
import { useToast } from "@/hooks/use-toast";

type Feedback = {
  id: number;
  content: string;
  userId: number | null;
  status: "new" | "reviewed" | "completed" | "ignored";
  source: string;
  category?: string;
  createdAt: string;
  reviewedAt: string | null;
  reviewedBy: number | null;
  notes: string | null;
  username?: string;
};

export default function AdminFeedbacksPage() {
  const [feedbacks, setFeedbacks] = useState<Feedback[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [filter, setFilter] = useState<string>("all");
  const [selectedFeedback, setSelectedFeedback] = useState<Feedback | null>(null);
  const [searchQuery, setSearchQuery] = useState("");
  const [currentPage, setCurrentPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  const [adminNotes, setAdminNotes] = useState("");
  const { toast } = useToast();

  const fetchFeedbacks = async () => {
    setLoading(true);
    setError(null);
    
    try {
      const response = await apiRequest(
        "GET", 
        `/api/admin/feedbacks?status=${filter}&page=${currentPage}&search=${encodeURIComponent(searchQuery)}`
      );
      
      if (!response.ok) {
        throw new Error("Failed to fetch user feedbacks");
      }
      
      const data = await response.json();
      setFeedbacks(data.feedbacks);
      setTotalPages(Math.ceil(data.total / data.pageSize));
    } catch (err) {
      setError(err instanceof Error ? err.message : "An error occurred");
      toast({
        variant: "destructive",
        title: "Error",
        description: "Failed to load user feedbacks",
      });
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchFeedbacks();
  }, [filter, currentPage, searchQuery]);

  const handleStatusChange = async (feedbackId: number, newStatus: string) => {
    try {
      const response = await apiRequest("PATCH", `/api/admin/feedbacks/${feedbackId}`, {
        status: newStatus,
        notes: adminNotes,
      });
      
      if (!response.ok) {
        throw new Error("Failed to update feedback status");
      }
      
      toast({
        title: "Status Updated",
        description: `Feedback status changed to ${newStatus}`,
      });
      
      // Refresh feedbacks
      fetchFeedbacks();
      
      // Reset selected feedback
      setSelectedFeedback(null);
      setAdminNotes("");
    } catch (err) {
      toast({
        variant: "destructive",
        title: "Error",
        description: err instanceof Error ? err.message : "Failed to update feedback status",
      });
    }
  };

  const handleSearch = (e: React.FormEvent) => {
    e.preventDefault();
    setCurrentPage(1); // Reset to first page when searching
    fetchFeedbacks();
  };

  const statusColors = {
    new: "bg-blue-100 dark:bg-blue-900 text-blue-800 dark:text-blue-300 border-blue-200 dark:border-blue-800",
    reviewed: "bg-yellow-100 dark:bg-yellow-900 text-yellow-800 dark:text-yellow-300 border-yellow-200 dark:border-yellow-800",
    completed: "bg-green-100 dark:bg-green-900 text-green-800 dark:text-green-300 border-green-200 dark:border-green-800",
    ignored: "bg-gray-100 dark:bg-gray-800 text-gray-800 dark:text-gray-300 border-gray-200 dark:border-gray-700",
  };

  return (
    <AdminLayout>
      <div className="space-y-6">
        <div className="flex justify-between items-center">
          <div>
            <h1 className="text-2xl font-bold tracking-tight dark:text-white">User Feedbacks</h1>
            <p className="text-muted-foreground dark:text-gray-300">
              Manage and respond to user feedback and suggestions
            </p>
          </div>
          <Button 
            onClick={fetchFeedbacks} 
            variant="outline" 
            size="sm"
            className="dark:bg-gray-800 dark:text-gray-200 dark:hover:bg-gray-700 dark:border-gray-700"
          >
            <RefreshCw className="h-4 w-4 mr-2" />
            Refresh
          </Button>
        </div>

        <div className="flex items-center justify-between">
          <Tabs defaultValue="all" className="w-[400px]" onValueChange={setFilter}>
            <TabsList className="dark:bg-gray-800">
              <TabsTrigger 
                value="all" 
                className="dark:data-[state=active]:bg-primary dark:data-[state=active]:text-primary-foreground dark:text-gray-300"
              >
                All
              </TabsTrigger>
              <TabsTrigger 
                value="new"
                className="dark:data-[state=active]:bg-primary dark:data-[state=active]:text-primary-foreground dark:text-gray-300"
              >
                New
              </TabsTrigger>
              <TabsTrigger 
                value="reviewed"
                className="dark:data-[state=active]:bg-primary dark:data-[state=active]:text-primary-foreground dark:text-gray-300"
              >
                In Progress
              </TabsTrigger>
              <TabsTrigger 
                value="completed"
                className="dark:data-[state=active]:bg-primary dark:data-[state=active]:text-primary-foreground dark:text-gray-300"
              >
                Completed
              </TabsTrigger>
            </TabsList>
          </Tabs>

          <form onSubmit={handleSearch} className="flex w-full max-w-sm items-center space-x-2">
            <Input
              placeholder="Search feedbacks..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="max-w-[250px] dark:bg-gray-800 dark:text-white dark:placeholder:text-gray-400 dark:border-gray-700"
            />
            <Button type="submit" size="sm" className="dark:bg-primary dark:text-white dark:hover:bg-primary/90">
              <Search className="h-4 w-4 mr-1" />
              Search
            </Button>
          </form>
        </div>

        {error && (
          <Alert variant="destructive">
            <AlertTriangle className="h-4 w-4" />
            <AlertTitle>Error</AlertTitle>
            <AlertDescription>{error}</AlertDescription>
          </Alert>
        )}

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          {/* Feedback List */}
          <div className="lg:col-span-2">
            <Card>
              <CardHeader>
                <CardTitle className="dark:text-white">User Suggestions</CardTitle>
                <CardDescription className="dark:text-gray-300">
                  Review and manage feedback from users
                </CardDescription>
              </CardHeader>
              <CardContent>
                {loading ? (
                  <div className="flex justify-center items-center py-8">
                    <div className="h-8 w-8 animate-spin rounded-full border-4 border-primary dark:border-primary-foreground border-t-transparent"></div>
                  </div>
                ) : feedbacks.length === 0 ? (
                  <div className="text-center py-8 text-muted-foreground dark:text-gray-400">
                    <MessageSquare className="mx-auto h-12 w-12 opacity-20 dark:opacity-15 mb-2" />
                    <p>No feedbacks found with the current filter</p>
                  </div>
                ) : (
                  <div className="rounded-md border dark:border-gray-700">
                    <Table>
                      <TableHeader className="dark:bg-gray-800">
                        <TableRow className="dark:border-gray-700">
                          <TableHead className="w-[80px] dark:text-gray-300">ID</TableHead>
                          <TableHead className="dark:text-gray-300">Feedback</TableHead>
                          <TableHead className="w-[100px] dark:text-gray-300">User</TableHead>
                          <TableHead className="w-[100px] dark:text-gray-300">Status</TableHead>
                          <TableHead className="w-[100px] dark:text-gray-300">Date</TableHead>
                          <TableHead className="w-[100px] text-right dark:text-gray-300">Actions</TableHead>
                        </TableRow>
                      </TableHeader>
                      <TableBody>
                        {feedbacks.map((feedback) => (
                          <TableRow 
                            key={feedback.id} 
                            className={`dark:border-gray-700 dark:hover:bg-gray-800/50 ${
                              selectedFeedback?.id === feedback.id ? "bg-muted/50 dark:bg-gray-800/70" : ""
                            }`}
                          >
                            <TableCell className="dark:text-gray-300">{feedback.id}</TableCell>
                            <TableCell className="font-medium line-clamp-2 dark:text-white">
                              {feedback.content}
                            </TableCell>
                            <TableCell className="dark:text-gray-300">
                              {feedback.username || (feedback.userId ? `User ${feedback.userId}` : "Anonymous")}
                            </TableCell>
                            <TableCell>
                              <Badge variant="outline" className={statusColors[feedback.status] || ""}>
                                {feedback.status}
                              </Badge>
                            </TableCell>
                            <TableCell className="dark:text-gray-300">
                              {new Date(feedback.createdAt).toLocaleDateString()}
                            </TableCell>
                            <TableCell className="text-right">
                              <Button
                                variant="ghost"
                                size="sm"
                                onClick={() => setSelectedFeedback(feedback)}
                                className="dark:hover:bg-gray-700 dark:text-gray-300"
                              >
                                <MoreHorizontal className="h-4 w-4" />
                                <span className="sr-only">Details</span>
                              </Button>
                            </TableCell>
                          </TableRow>
                        ))}
                      </TableBody>
                    </Table>
                  </div>
                )}

                {/* Pagination */}
                <Pagination className="mt-4">
                  <PaginationContent>
                    <PaginationItem>
                      <PaginationPrevious
                        onClick={() => setCurrentPage(Math.max(1, currentPage - 1))}
                        className={`${currentPage === 1 ? "cursor-not-allowed opacity-50" : "cursor-pointer"} dark:text-gray-300 dark:hover:text-white dark:hover:bg-gray-800`}
                      />
                    </PaginationItem>
                    
                    {Array.from({ length: Math.min(5, totalPages) }, (_, i) => {
                      // Logic to show appropriate page numbers
                      let pageNum = i + 1;
                      if (totalPages > 5 && currentPage > 3) {
                        pageNum = currentPage - 3 + i;
                      }
                      if (pageNum > totalPages) return null;
                      
                      return (
                        <PaginationItem key={pageNum}>
                          <PaginationLink
                            isActive={currentPage === pageNum}
                            onClick={() => setCurrentPage(pageNum)}
                            className="dark:text-gray-300 dark:hover:text-white dark:hover:bg-gray-800 dark:data-[active=true]:bg-primary dark:data-[active=true]:text-white"
                          >
                            {pageNum}
                          </PaginationLink>
                        </PaginationItem>
                      );
                    })}
                    
                    {totalPages > 5 && currentPage < totalPages - 2 && (
                      <PaginationItem>
                        <PaginationEllipsis className="dark:text-gray-400" />
                      </PaginationItem>
                    )}
                    
                    <PaginationItem>
                      <PaginationNext
                        onClick={() => setCurrentPage(Math.min(totalPages, currentPage + 1))}
                        className={`${currentPage === totalPages ? "cursor-not-allowed opacity-50" : "cursor-pointer"} dark:text-gray-300 dark:hover:text-white dark:hover:bg-gray-800`}
                      />
                    </PaginationItem>
                  </PaginationContent>
                </Pagination>
              </CardContent>
            </Card>
          </div>

          {/* Feedback Details */}
          <div className="lg:col-span-1">
            <Card>
              <CardHeader>
                <CardTitle className="dark:text-white">Feedback Details</CardTitle>
                <CardDescription className="dark:text-gray-300">
                  View and update feedback status
                </CardDescription>
              </CardHeader>
              <CardContent>
                {selectedFeedback ? (
                  <div className="space-y-4">
                    <div>
                      <h3 className="text-sm font-medium text-muted-foreground dark:text-gray-300">Feedback Content</h3>
                      <p className="mt-1 text-sm dark:text-white">{selectedFeedback.content}</p>
                    </div>
                    
                    <div className="grid grid-cols-2 gap-4">
                      <div>
                        <h3 className="text-sm font-medium text-muted-foreground dark:text-gray-300">Submitted By</h3>
                        <p className="mt-1 text-sm dark:text-white">
                          {selectedFeedback.username || (selectedFeedback.userId ? `User ${selectedFeedback.userId}` : "Anonymous")}
                        </p>
                      </div>
                      <div>
                        <h3 className="text-sm font-medium text-muted-foreground dark:text-gray-300">Submission Date</h3>
                        <p className="mt-1 text-sm dark:text-white">
                          {new Date(selectedFeedback.createdAt).toLocaleDateString()}
                        </p>
                      </div>
                      <div>
                        <h3 className="text-sm font-medium text-muted-foreground dark:text-gray-300">Status</h3>
                        <Badge variant="outline" className={`mt-1 ${statusColors[selectedFeedback.status] || ""}`}>
                          {selectedFeedback.status}
                        </Badge>
                      </div>
                      <div>
                        <h3 className="text-sm font-medium text-muted-foreground dark:text-gray-300">Source</h3>
                        <p className="mt-1 text-sm dark:text-white capitalize">{selectedFeedback.source || "Website"}</p>
                      </div>
                    </div>
                    
                    {selectedFeedback.reviewedAt && (
                      <div>
                        <h3 className="text-sm font-medium text-muted-foreground dark:text-gray-300">Reviewed On</h3>
                        <p className="mt-1 text-sm dark:text-white">
                          {new Date(selectedFeedback.reviewedAt).toLocaleDateString()}
                        </p>
                      </div>
                    )}
                    
                    {selectedFeedback.notes && (
                      <div>
                        <h3 className="text-sm font-medium text-muted-foreground dark:text-gray-300">Admin Notes</h3>
                        <p className="mt-1 text-sm dark:text-white">{selectedFeedback.notes}</p>
                      </div>
                    )}
                    
                    <div>
                      <h3 className="text-sm font-medium text-muted-foreground dark:text-gray-300 mb-1">Add Notes</h3>
                      <Input
                        value={adminNotes}
                        onChange={(e) => setAdminNotes(e.target.value)}
                        placeholder="Add your notes about this feedback..."
                        className="mt-1 dark:bg-gray-800 dark:text-white dark:placeholder:text-gray-400"
                      />
                    </div>

                    <div>
                      <h3 className="text-sm font-medium text-muted-foreground dark:text-gray-300 mb-2">Update Status</h3>
                      <div className="flex flex-wrap gap-2">
                        <Button 
                          size="sm" 
                          variant={selectedFeedback.status === "new" ? "default" : "outline"}
                          onClick={() => handleStatusChange(selectedFeedback.id, "new")}
                          className={selectedFeedback.status === "new" 
                            ? "dark:bg-primary dark:text-white" 
                            : "dark:bg-gray-800 dark:text-gray-200 dark:border-gray-700 dark:hover:bg-gray-700"}
                        >
                          New
                        </Button>
                        <Button 
                          size="sm" 
                          variant={selectedFeedback.status === "reviewed" ? "default" : "outline"}
                          onClick={() => handleStatusChange(selectedFeedback.id, "reviewed")}
                          className={selectedFeedback.status === "reviewed" 
                            ? "dark:bg-primary dark:text-white" 
                            : "dark:bg-gray-800 dark:text-gray-200 dark:border-gray-700 dark:hover:bg-gray-700"}
                        >
                          In Progress
                        </Button>
                        <Button 
                          size="sm" 
                          variant={selectedFeedback.status === "completed" ? "default" : "outline"}
                          onClick={() => handleStatusChange(selectedFeedback.id, "completed")}
                          className={selectedFeedback.status === "completed" 
                            ? "dark:bg-primary dark:text-white" 
                            : "dark:bg-gray-800 dark:text-gray-200 dark:border-gray-700 dark:hover:bg-gray-700"}
                        >
                          <CheckCircle className="h-4 w-4 mr-1" />
                          Completed
                        </Button>
                        <Button 
                          size="sm" 
                          variant={selectedFeedback.status === "ignored" ? "default" : "outline"}
                          onClick={() => handleStatusChange(selectedFeedback.id, "ignored")}
                          className={selectedFeedback.status === "ignored" 
                            ? "dark:bg-primary dark:text-white" 
                            : "dark:bg-gray-800 dark:text-gray-200 dark:border-gray-700 dark:hover:bg-gray-700"}
                        >
                          <XCircle className="h-4 w-4 mr-1" />
                          Ignore
                        </Button>
                      </div>
                    </div>
                  </div>
                ) : (
                  <div className="text-center py-8 text-muted-foreground dark:text-gray-400">
                    <MessageSquare className="mx-auto h-12 w-12 opacity-20 dark:opacity-15 mb-2" />
                    <p>Select a feedback to view details</p>
                  </div>
                )}
              </CardContent>
            </Card>
          </div>
        </div>
      </div>
    </AdminLayout>
  );
}