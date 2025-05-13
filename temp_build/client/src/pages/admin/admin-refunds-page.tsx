import { useState } from "react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { Loader2, Search, RefreshCw, CheckCircle2, XCircle } from "lucide-react";
import AdminLayout from "@/components/admin/admin-layout";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Textarea } from "@/components/ui/textarea";
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle, DialogTrigger, DialogClose } from "@/components/ui/dialog";
import { useToast } from "@/hooks/use-toast";
import { apiRequest } from "@/lib/queryClient";

export default function AdminRefundsPage() {
  const { toast } = useToast();
  const queryClient = useQueryClient();
  
  const [selectedRefund, setSelectedRefund] = useState(null);
  const [statusFilter, setStatusFilter] = useState("");
  const [searchQuery, setSearchQuery] = useState("");
  const [processingNotes, setProcessingNotes] = useState("");
  const [refundDialogOpen, setRefundDialogOpen] = useState(false);
  const [processingAction, setProcessingAction] = useState("");
  
  // Fetch refunds
  const {
    data: refunds,
    isLoading,
    error,
    refetch
  } = useQuery({
    queryKey: ["/api/admin/refunds", statusFilter],
    queryFn: async () => {
      const params = new URLSearchParams();
      if (statusFilter) params.append("status", statusFilter);
      
      const response = await apiRequest(
        "GET", 
        `/api/admin/refunds${params.toString() ? `?${params.toString()}` : ""}`
      );
      
      if (!response.ok) {
        throw new Error("Failed to fetch refund requests");
      }
      
      return response.json();
    }
  });
  
  // Get refund details
  const {
    data: refundDetails,
    isLoading: isLoadingDetails
  } = useQuery({
    queryKey: ["/api/admin/refunds", selectedRefund],
    queryFn: async () => {
      if (!selectedRefund) return null;
      
      const response = await apiRequest(
        "GET",
        `/api/admin/refunds/${selectedRefund}`
      );
      
      if (!response.ok) {
        throw new Error("Failed to fetch refund details");
      }
      
      return response.json();
    },
    enabled: !!selectedRefund
  });
  
  // Update refund status mutation
  const updateRefundMutation = useMutation({
    mutationFn: async ({ refundId, status, notes }) => {
      const response = await apiRequest(
        "PATCH",
        `/api/admin/refunds/${refundId}`,
        { status, notes }
      );
      
      if (!response.ok) {
        throw new Error("Failed to update refund request");
      }
      
      return response.json();
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["/api/admin/refunds"] });
      queryClient.invalidateQueries({ queryKey: ["/api/admin/refunds", selectedRefund] });
      toast({
        title: "Refund request updated",
        description: "The refund request has been updated successfully",
      });
      setRefundDialogOpen(false);
      setProcessingNotes("");
      setProcessingAction("");
    },
    onError: (error) => {
      toast({
        title: "Update failed",
        description: error instanceof Error ? error.message : "Failed to update refund request",
        variant: "destructive",
      });
    }
  });
  
  const filteredRefunds = refunds ? refunds.filter(refund => {
    if (searchQuery === "") return true;
    
    const query = searchQuery.toLowerCase();
    return (
      refund.reason.toLowerCase().includes(query) ||
      refund.id.toString().includes(query) ||
      refund.userId.toString().includes(query) ||
      (refund.transactionId && refund.transactionId.toLowerCase().includes(query))
    );
  }) : [];
  
  const handleProcessRefund = (refundId, action) => {
    setSelectedRefund(refundId);
    setProcessingAction(action);
    setRefundDialogOpen(true);
  };
  
  const confirmRefundProcess = async () => {
    const status = processingAction === "approve" ? "approved" : 
                  processingAction === "reject" ? "rejected" : 
                  processingAction === "process" ? "processed" : "pending";
                  
    await updateRefundMutation.mutateAsync({
      refundId: selectedRefund,
      status,
      notes: processingNotes
    });
  };
  
  const getStatusBadgeColor = (status) => {
    switch (status) {
      case 'pending':
        return "bg-amber-100 text-amber-800";
      case 'approved':
        return "bg-green-100 text-green-800";
      case 'rejected':
        return "bg-red-100 text-red-800";
      case 'processed':
        return "bg-blue-100 text-blue-800";
      default:
        return "bg-gray-100 text-gray-800";
    }
  };
  
  if (isLoading) {
    return (
      <AdminLayout>
        <div className="flex justify-center items-center h-[80vh]">
          <Loader2 className="h-8 w-8 animate-spin text-primary" />
        </div>
      </AdminLayout>
    );
  }
  
  if (error) {
    return (
      <AdminLayout>
        <div className="rounded-lg border border-destructive p-4 text-destructive">
          <p>Error loading refund requests</p>
          <p className="text-sm">{error instanceof Error ? error.message : "Unknown error"}</p>
        </div>
      </AdminLayout>
    );
  }
  
  return (
    <AdminLayout>
      <div className="flex flex-col gap-6">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
          <div>
            <h1 className="text-3xl font-bold tracking-tight">Refund Requests</h1>
            <p className="text-muted-foreground">
              Manage refund requests from users
            </p>
          </div>
          <div className="flex items-center gap-2">
            <Button 
              variant="outline" 
              size="sm" 
              onClick={() => refetch()}
              className="h-8 gap-1"
            >
              <RefreshCw className="h-3.5 w-3.5" />
              <span className="hidden sm:inline">Refresh</span>
            </Button>
          </div>
        </div>
        
        <div className="flex flex-col gap-4 md:flex-row">
          <div className="flex-1 space-y-2">
            <div className="flex flex-col sm:flex-row gap-2">
              <div className="relative flex-1">
                <Search className="absolute left-2.5 top-2.5 h-4 w-4 text-muted-foreground" />
                <Input
                  type="search"
                  placeholder="Search refunds..."
                  className="pl-8"
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                />
              </div>
              <div className="flex items-center gap-2">
                <Select 
                  value={statusFilter} 
                  onValueChange={setStatusFilter}
                >
                  <SelectTrigger className="w-[140px]">
                    <SelectValue placeholder="All statuses" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="">All statuses</SelectItem>
                    <SelectItem value="pending">Pending</SelectItem>
                    <SelectItem value="approved">Approved</SelectItem>
                    <SelectItem value="rejected">Rejected</SelectItem>
                    <SelectItem value="processed">Processed</SelectItem>
                  </SelectContent>
                </Select>
              </div>
            </div>
            
            <div className="rounded-md border">
              <div className="px-4 py-3 border-b bg-muted/50">
                <div className="flex justify-between">
                  <div className="flex gap-4">
                    <span className="font-medium">Refund Details</span>
                  </div>
                  <div className="flex gap-4">
                    <span className="font-medium text-right">Amount</span>
                    <span className="font-medium hidden md:block">Status</span>
                    <span className="font-medium hidden md:block">Date</span>
                  </div>
                </div>
              </div>
              
              <div className="divide-y">
                {filteredRefunds.length > 0 ? (
                  filteredRefunds.map((refund) => (
                    <div
                      key={refund.id}
                      className="px-4 py-3 cursor-pointer hover:bg-muted/50"
                      onClick={() => setSelectedRefund(refund.id)}
                    >
                      <div className="flex justify-between items-center">
                        <div className="flex gap-4">
                          <div className="space-y-1">
                            <div className="font-medium">Request #{refund.id}</div>
                            <div className="text-xs text-muted-foreground line-clamp-1">
                              {refund.reason}
                            </div>
                            <div className="text-xs text-muted-foreground">
                              User ID: #{refund.userId}
                            </div>
                            {refund.transactionId && (
                              <div className="text-xs text-muted-foreground">
                                Transaction: {refund.transactionId}
                              </div>
                            )}
                          </div>
                        </div>
                        <div className="flex gap-4 items-center">
                          <span className="font-medium whitespace-nowrap">
                            ${parseFloat(refund.amount).toFixed(2)} {refund.currency}
                          </span>
                          <span className={`text-xs px-2 py-1 rounded-full ${getStatusBadgeColor(refund.status)} hidden md:inline-block`}>
                            {refund.status}
                          </span>
                          <span className="text-xs text-muted-foreground whitespace-nowrap hidden md:block">
                            {new Date(refund.createdAt).toLocaleString('en-US', { 
                              year: 'numeric', 
                              month: 'short', 
                              day: 'numeric',
                              hour: '2-digit',
                              minute: '2-digit'
                            })}
                          </span>
                        </div>
                      </div>
                    </div>
                  ))
                ) : (
                  <div className="px-4 py-8 text-center text-muted-foreground">
                    No refund requests found
                  </div>
                )}
              </div>
            </div>
          </div>
          
          {selectedRefund && refundDetails && (
            <div className="w-full md:w-[400px]">
              <Card className="sticky top-6">
                <CardHeader>
                  <div className="flex justify-between items-start">
                    <div>
                      <CardTitle>Refund Request #{refundDetails.id}</CardTitle>
                      <CardDescription>User ID: #{refundDetails.userId}</CardDescription>
                    </div>
                    <div className="flex flex-col gap-1 items-end">
                      <span className={`text-xs px-2 py-1 rounded-full ${getStatusBadgeColor(refundDetails.status)}`}>
                        {refundDetails.status}
                      </span>
                      <span className="text-xs text-muted-foreground">
                        {new Date(refundDetails.createdAt).toLocaleString('en-US', { 
                          year: 'numeric', 
                          month: 'short', 
                          day: 'numeric',
                          hour: '2-digit',
                          minute: '2-digit'
                        })}
                      </span>
                    </div>
                  </div>
                </CardHeader>
                <CardContent className="space-y-4">
                  <div>
                    <h3 className="text-sm font-medium mb-1">Reason</h3>
                    <p className="text-sm">{refundDetails.reason}</p>
                  </div>
                  
                  <div>
                    <h3 className="text-sm font-medium mb-1">Amount</h3>
                    <p className="text-sm font-semibold">
                      ${parseFloat(refundDetails.amount).toFixed(2)} {refundDetails.currency}
                    </p>
                  </div>
                  
                  {refundDetails.transactionId && (
                    <div>
                      <h3 className="text-sm font-medium mb-1">Transaction ID</h3>
                      <p className="text-sm">{refundDetails.transactionId}</p>
                    </div>
                  )}
                  
                  {refundDetails.paymentMethod && (
                    <div>
                      <h3 className="text-sm font-medium mb-1">Payment Method</h3>
                      <p className="text-sm capitalize">{refundDetails.paymentMethod}</p>
                    </div>
                  )}
                  
                  {refundDetails.ticketId && (
                    <div>
                      <h3 className="text-sm font-medium mb-1">Related Ticket</h3>
                      <p className="text-sm">#{refundDetails.ticketId}</p>
                    </div>
                  )}
                  
                  {refundDetails.notes && (
                    <div>
                      <h3 className="text-sm font-medium mb-1">Notes</h3>
                      <p className="text-sm">{refundDetails.notes}</p>
                    </div>
                  )}
                  
                  {refundDetails.evidence && refundDetails.evidence.length > 0 && (
                    <div>
                      <h3 className="text-sm font-medium mb-1">Evidence</h3>
                      <ul className="text-sm list-disc pl-5">
                        {refundDetails.evidence.map((item, index) => (
                          <li key={index}>{item}</li>
                        ))}
                      </ul>
                    </div>
                  )}
                  
                  {refundDetails.processedBy && (
                    <div>
                      <h3 className="text-sm font-medium mb-1">Processed By</h3>
                      <p className="text-sm">Admin #{refundDetails.processedBy}</p>
                    </div>
                  )}
                  
                  {refundDetails.processedAt && (
                    <div>
                      <h3 className="text-sm font-medium mb-1">Processed On</h3>
                      <p className="text-sm">
                        {new Date(refundDetails.processedAt).toLocaleString('en-US', { 
                          year: 'numeric', 
                          month: 'short', 
                          day: 'numeric',
                          hour: '2-digit',
                          minute: '2-digit'
                        })}
                      </p>
                    </div>
                  )}
                  
                  {refundDetails.status === 'pending' && (
                    <div className="pt-2 flex flex-col gap-3">
                      <div className="grid grid-cols-2 gap-2">
                        <Button 
                          variant="outline" 
                          className="w-full"
                          onClick={() => handleProcessRefund(refundDetails.id, "approve")}
                        >
                          <CheckCircle2 className="mr-2 h-4 w-4 text-green-500" />
                          Approve
                        </Button>
                        <Button
                          variant="outline"
                          className="w-full"
                          onClick={() => handleProcessRefund(refundDetails.id, "reject")}
                        >
                          <XCircle className="mr-2 h-4 w-4 text-red-500" />
                          Reject
                        </Button>
                      </div>
                    </div>
                  )}
                  
                  {refundDetails.status === 'approved' && (
                    <div className="pt-2">
                      <Button 
                        className="w-full"
                        onClick={() => handleProcessRefund(refundDetails.id, "process")}
                      >
                        Mark as Processed
                      </Button>
                    </div>
                  )}
                </CardContent>
              </Card>
            </div>
          )}
        </div>
      </div>
      
      <Dialog open={refundDialogOpen} onOpenChange={setRefundDialogOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>
              {processingAction === "approve" 
                ? "Approve Refund Request" 
                : processingAction === "reject"
                ? "Reject Refund Request"
                : "Process Refund"}
            </DialogTitle>
            <DialogDescription>
              {processingAction === "approve" 
                ? "The user will be notified that their refund request has been approved." 
                : processingAction === "reject"
                ? "The user will be notified that their refund request has been rejected."
                : "This will mark the refund as processed in the system."}
            </DialogDescription>
          </DialogHeader>
          
          <div className="space-y-4 py-2">
            <div className="space-y-2">
              <h3 className="text-sm font-medium">Add Processing Notes</h3>
              <Textarea
                placeholder="Add any notes or comments about this decision..."
                value={processingNotes}
                onChange={(e) => setProcessingNotes(e.target.value)}
                className="min-h-[100px]"
              />
            </div>
          </div>
          
          <DialogFooter>
            <Button variant="outline" onClick={() => setRefundDialogOpen(false)}>
              Cancel
            </Button>
            <Button 
              onClick={confirmRefundProcess}
              disabled={updateRefundMutation.isPending}
              variant={processingAction === "reject" ? "destructive" : "default"}
            >
              {updateRefundMutation.isPending ? (
                <>
                  <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                  Processing...
                </>
              ) : (
                processingAction === "approve" 
                  ? "Approve Request" 
                  : processingAction === "reject"
                  ? "Reject Request"
                  : "Mark as Processed"
              )}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </AdminLayout>
  );
}