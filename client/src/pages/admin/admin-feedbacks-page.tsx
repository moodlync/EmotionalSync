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
    new: "bg-blue-100 text-blue-800 border-blue-200",
    reviewed: "bg-yellow-100 text-yellow-800 border-yellow-200",
    completed: "bg-green-100 text-green-800 border-green-200",
    ignored: "bg-gray-100 text-gray-800 border-gray-200",
  };

  return (
    <AdminLayout>
      <div className="space-y-6">
        <div className="flex justify-between items-center">
          <div>
            <h1 className="text-2xl font-bold tracking-tight">User Feedbacks</h1>
            <p className="text-muted-foreground">
              Manage and respond to user feedback and suggestions
            </p>
          </div>
          <Button onClick={fetchFeedbacks} variant="outline" size="sm">
            <RefreshCw className="h-4 w-4 mr-2" />
            Refresh
          </Button>
        </div>

        <div className="flex items-center justify-between">
          <Tabs defaultValue="all" className="w-[400px]" onValueChange={setFilter}>
            <TabsList>
              <TabsTrigger value="all">All</TabsTrigger>
              <TabsTrigger value="new">New</TabsTrigger>
              <TabsTrigger value="reviewed">In Progress</TabsTrigger>
              <TabsTrigger value="completed">Completed</TabsTrigger>
            </TabsList>
          </Tabs>

          <form onSubmit={handleSearch} className="flex w-full max-w-sm items-center space-x-2">
            <Input
              placeholder="Search feedbacks..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="max-w-[250px]"
            />
            <Button type="submit" size="sm">
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
                <CardTitle>User Suggestions</CardTitle>
                <CardDescription>
                  Review and manage feedback from users
                </CardDescription>
              </CardHeader>
              <CardContent>
                {loading ? (
                  <div className="flex justify-center items-center py-8">
                    <div className="h-8 w-8 animate-spin rounded-full border-4 border-primary border-t-transparent"></div>
                  </div>
                ) : feedbacks.length === 0 ? (
                  <div className="text-center py-8 text-muted-foreground">
                    <MessageSquare className="mx-auto h-12 w-12 opacity-20 mb-2" />
                    <p>No feedbacks found with the current filter</p>
                  </div>
                ) : (
                  <div className="rounded-md border">
                    <Table>
                      <TableHeader>
                        <TableRow>
                          <TableHead className="w-[80px]">ID</TableHead>
                          <TableHead>Feedback</TableHead>
                          <TableHead className="w-[100px]">User</TableHead>
                          <TableHead className="w-[100px]">Status</TableHead>
                          <TableHead className="w-[100px]">Date</TableHead>
                          <TableHead className="w-[100px] text-right">Actions</TableHead>
                        </TableRow>
                      </TableHeader>
                      <TableBody>
                        {feedbacks.map((feedback) => (
                          <TableRow key={feedback.id} className={selectedFeedback?.id === feedback.id ? "bg-muted/50" : ""}>
                            <TableCell>{feedback.id}</TableCell>
                            <TableCell className="font-medium line-clamp-2">
                              {feedback.content}
                            </TableCell>
                            <TableCell>
                              {feedback.username || (feedback.userId ? `User ${feedback.userId}` : "Anonymous")}
                            </TableCell>
                            <TableCell>
                              <Badge variant="outline" className={statusColors[feedback.status] || ""}>
                                {feedback.status}
                              </Badge>
                            </TableCell>
                            <TableCell>
                              {new Date(feedback.createdAt).toLocaleDateString()}
                            </TableCell>
                            <TableCell className="text-right">
                              <Button
                                variant="ghost"
                                size="sm"
                                onClick={() => setSelectedFeedback(feedback)}
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
                        className={currentPage === 1 ? "cursor-not-allowed opacity-50" : "cursor-pointer"}
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
                          >
                            {pageNum}
                          </PaginationLink>
                        </PaginationItem>
                      );
                    })}
                    
                    {totalPages > 5 && currentPage < totalPages - 2 && (
                      <PaginationItem>
                        <PaginationEllipsis />
                      </PaginationItem>
                    )}
                    
                    <PaginationItem>
                      <PaginationNext
                        onClick={() => setCurrentPage(Math.min(totalPages, currentPage + 1))}
                        className={currentPage === totalPages ? "cursor-not-allowed opacity-50" : "cursor-pointer"}
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
                <CardTitle>Feedback Details</CardTitle>
                <CardDescription>
                  View and update feedback status
                </CardDescription>
              </CardHeader>
              <CardContent>
                {selectedFeedback ? (
                  <div className="space-y-4">
                    <div>
                      <h3 className="text-sm font-medium text-muted-foreground">Feedback Content</h3>
                      <p className="mt-1 text-sm">{selectedFeedback.content}</p>
                    </div>
                    
                    <div className="grid grid-cols-2 gap-4">
                      <div>
                        <h3 className="text-sm font-medium text-muted-foreground">Submitted By</h3>
                        <p className="mt-1 text-sm">
                          {selectedFeedback.username || (selectedFeedback.userId ? `User ${selectedFeedback.userId}` : "Anonymous")}
                        </p>
                      </div>
                      <div>
                        <h3 className="text-sm font-medium text-muted-foreground">Submission Date</h3>
                        <p className="mt-1 text-sm">
                          {new Date(selectedFeedback.createdAt).toLocaleDateString()}
                        </p>
                      </div>
                      <div>
                        <h3 className="text-sm font-medium text-muted-foreground">Status</h3>
                        <Badge variant="outline" className={`mt-1 ${statusColors[selectedFeedback.status] || ""}`}>
                          {selectedFeedback.status}
                        </Badge>
                      </div>
                      <div>
                        <h3 className="text-sm font-medium text-muted-foreground">Source</h3>
                        <p className="mt-1 text-sm capitalize">{selectedFeedback.source || "Website"}</p>
                      </div>
                    </div>
                    
                    {selectedFeedback.reviewedAt && (
                      <div>
                        <h3 className="text-sm font-medium text-muted-foreground">Reviewed On</h3>
                        <p className="mt-1 text-sm">
                          {new Date(selectedFeedback.reviewedAt).toLocaleDateString()}
                        </p>
                      </div>
                    )}
                    
                    {selectedFeedback.notes && (
                      <div>
                        <h3 className="text-sm font-medium text-muted-foreground">Admin Notes</h3>
                        <p className="mt-1 text-sm">{selectedFeedback.notes}</p>
                      </div>
                    )}
                    
                    <div>
                      <h3 className="text-sm font-medium text-muted-foreground mb-1">Add Notes</h3>
                      <Input
                        value={adminNotes}
                        onChange={(e) => setAdminNotes(e.target.value)}
                        placeholder="Add your notes about this feedback..."
                        className="mt-1"
                      />
                    </div>

                    <div>
                      <h3 className="text-sm font-medium text-muted-foreground mb-2">Update Status</h3>
                      <div className="flex flex-wrap gap-2">
                        <Button 
                          size="sm" 
                          variant={selectedFeedback.status === "new" ? "default" : "outline"}
                          onClick={() => handleStatusChange(selectedFeedback.id, "new")}
                        >
                          New
                        </Button>
                        <Button 
                          size="sm" 
                          variant={selectedFeedback.status === "reviewed" ? "default" : "outline"}
                          onClick={() => handleStatusChange(selectedFeedback.id, "reviewed")}
                        >
                          In Progress
                        </Button>
                        <Button 
                          size="sm" 
                          variant={selectedFeedback.status === "completed" ? "default" : "outline"}
                          onClick={() => handleStatusChange(selectedFeedback.id, "completed")}
                        >
                          <CheckCircle className="h-4 w-4 mr-1" />
                          Completed
                        </Button>
                        <Button 
                          size="sm" 
                          variant={selectedFeedback.status === "ignored" ? "default" : "outline"}
                          onClick={() => handleStatusChange(selectedFeedback.id, "ignored")}
                        >
                          <XCircle className="h-4 w-4 mr-1" />
                          Ignore
                        </Button>
                      </div>
                    </div>
                  </div>
                ) : (
                  <div className="text-center py-8 text-muted-foreground">
                    <MessageSquare className="mx-auto h-12 w-12 opacity-20 mb-2" />
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