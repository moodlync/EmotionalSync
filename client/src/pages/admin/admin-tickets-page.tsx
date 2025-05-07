import { useState } from "react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { Loader2, Search, Filter, Plus, RefreshCw } from "lucide-react";
import AdminLayout from "@/components/admin/admin-layout";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Select, SelectContent, SelectGroup, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card";
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { Badge } from "@/components/ui/badge";
import { useToast } from "@/hooks/use-toast";
import { apiRequest } from "@/lib/queryClient";

interface AdminTicketsPageProps {
  defaultStatus?: string;
}

export default function AdminTicketsPage({ defaultStatus }: AdminTicketsPageProps) {
  const { toast } = useToast();
  const queryClient = useQueryClient();
  
  const [selectedTicket, setSelectedTicket] = useState(null);
  const [statusFilter, setStatusFilter] = useState(defaultStatus || "");
  const [categoryFilter, setCategoryFilter] = useState("");
  const [priorityFilter, setPriorityFilter] = useState("");
  const [searchQuery, setSearchQuery] = useState("");
  
  // Fetch tickets
  const {
    data: tickets,
    isLoading,
    error,
    refetch
  } = useQuery({
    queryKey: ["/api/admin/tickets", statusFilter, categoryFilter, priorityFilter],
    queryFn: async () => {
      const params = new URLSearchParams();
      if (statusFilter) params.append("status", statusFilter);
      if (categoryFilter) params.append("category", categoryFilter);
      if (priorityFilter) params.append("priority", priorityFilter);
      
      const response = await apiRequest(
        "GET", 
        `/api/admin/tickets${params.toString() ? `?${params.toString()}` : ""}`
      );
      
      if (!response.ok) {
        throw new Error("Failed to fetch tickets");
      }
      
      return response.json();
    }
  });
  
  // Update ticket status mutation
  const updateTicketMutation = useMutation({
    mutationFn: async ({ ticketId, status }) => {
      const response = await apiRequest(
        "PATCH",
        `/api/admin/tickets/${ticketId}`,
        { status }
      );
      
      if (!response.ok) {
        throw new Error("Failed to update ticket");
      }
      
      return response.json();
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["/api/admin/tickets"] });
      toast({
        title: "Ticket updated",
        description: "The ticket status has been updated successfully",
      });
    },
    onError: (error) => {
      toast({
        title: "Update failed",
        description: error instanceof Error ? error.message : "Failed to update ticket",
        variant: "destructive",
      });
    }
  });
  
  // Get ticket details and responses
  const {
    data: ticketDetails,
    isLoading: isLoadingDetails
  } = useQuery({
    queryKey: ["/api/admin/tickets", selectedTicket],
    queryFn: async () => {
      if (!selectedTicket) return null;
      
      const response = await apiRequest(
        "GET",
        `/api/admin/tickets/${selectedTicket}`
      );
      
      if (!response.ok) {
        throw new Error("Failed to fetch ticket details");
      }
      
      return response.json();
    },
    enabled: !!selectedTicket
  });
  
  // Add ticket response mutation
  const addResponseMutation = useMutation({
    mutationFn: async ({ ticketId, content }) => {
      const response = await apiRequest(
        "POST",
        `/api/admin/tickets/${ticketId}/responses`,
        { content }
      );
      
      if (!response.ok) {
        throw new Error("Failed to add response");
      }
      
      return response.json();
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["/api/admin/tickets", selectedTicket] });
      toast({
        title: "Response added",
        description: "Your response has been added to the ticket",
      });
    },
    onError: (error) => {
      toast({
        title: "Failed to add response",
        description: error instanceof Error ? error.message : "Failed to add response",
        variant: "destructive",
      });
    }
  });
  
  const filteredTickets = tickets ? tickets.filter(ticket => {
    if (searchQuery === "") return true;
    
    const query = searchQuery.toLowerCase();
    return (
      ticket.subject.toLowerCase().includes(query) ||
      ticket.description.toLowerCase().includes(query) ||
      ticket.id.toString().includes(query)
    );
  }) : [];
  
  const handleStatusChange = async (ticketId, newStatus) => {
    await updateTicketMutation.mutateAsync({ ticketId, status: newStatus });
  };
  
  const handleAddResponse = async (e, ticketId) => {
    e.preventDefault();
    const form = e.target;
    const content = form.response.value;
    
    if (!content.trim()) {
      toast({
        title: "Empty response",
        description: "Please enter a response",
        variant: "destructive",
      });
      return;
    }
    
    await addResponseMutation.mutateAsync({ 
      ticketId, 
      content
    });
    
    form.reset();
  };
  
  const getStatusBadgeColor = (status) => {
    switch (status) {
      case 'open':
        return "bg-blue-100 text-blue-800";
      case 'in_progress':
        return "bg-amber-100 text-amber-800";
      case 'resolved':
        return "bg-green-100 text-green-800";
      case 'closed':
        return "bg-gray-100 text-gray-800";
      case 'escalated':
        return "bg-red-100 text-red-800";
      default:
        return "bg-gray-100 text-gray-800";
    }
  };
  
  const getPriorityBadgeColor = (priority) => {
    switch (priority) {
      case 'low':
        return "bg-blue-100 text-blue-800";
      case 'medium':
        return "bg-amber-100 text-amber-800";
      case 'high':
        return "bg-orange-100 text-orange-800";
      case 'urgent':
        return "bg-red-100 text-red-800";
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
          <p>Error loading tickets</p>
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
            <h1 className="text-3xl font-bold tracking-tight">Support Tickets</h1>
            <p className="text-muted-foreground">
              Manage and respond to user support tickets
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
                  placeholder="Search tickets..."
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
                    <SelectItem value="open">Open</SelectItem>
                    <SelectItem value="in_progress">In Progress</SelectItem>
                    <SelectItem value="resolved">Resolved</SelectItem>
                    <SelectItem value="closed">Closed</SelectItem>
                    <SelectItem value="escalated">Escalated</SelectItem>
                  </SelectContent>
                </Select>
                
                <Select 
                  value={priorityFilter} 
                  onValueChange={setPriorityFilter}
                >
                  <SelectTrigger className="w-[140px]">
                    <SelectValue placeholder="All priorities" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="">All priorities</SelectItem>
                    <SelectItem value="low">Low</SelectItem>
                    <SelectItem value="medium">Medium</SelectItem>
                    <SelectItem value="high">High</SelectItem>
                    <SelectItem value="urgent">Urgent</SelectItem>
                  </SelectContent>
                </Select>
              </div>
            </div>
            
            <div className="rounded-md border">
              <div className="px-4 py-3 border-b bg-muted/50">
                <div className="flex justify-between">
                  <div className="flex gap-4">
                    <span className="font-medium">Ticket</span>
                  </div>
                  <div className="flex gap-4">
                    <span className="font-medium hidden md:block">Status</span>
                    <span className="font-medium hidden md:block">Priority</span>
                    <span className="font-medium hidden md:block">Date</span>
                  </div>
                </div>
              </div>
              
              <div className="divide-y">
                {filteredTickets.length > 0 ? (
                  filteredTickets.map((ticket) => (
                    <div
                      key={ticket.id}
                      className="px-4 py-3 cursor-pointer hover:bg-muted/50"
                      onClick={() => setSelectedTicket(ticket.id)}
                    >
                      <div className="flex justify-between items-center">
                        <div className="flex gap-4">
                          <div className="space-y-1">
                            <div className="font-medium">{ticket.subject}</div>
                            <div className="text-xs text-muted-foreground line-clamp-1">
                              {ticket.description}
                            </div>
                            <div className="text-xs text-muted-foreground">
                              User ID: #{ticket.userId}
                            </div>
                          </div>
                        </div>
                        <div className="flex gap-4 items-center">
                          <span className={`text-xs px-2 py-1 rounded-full ${getStatusBadgeColor(ticket.status)}`}>
                            {ticket.status}
                          </span>
                          <span className={`text-xs px-2 py-1 rounded-full ${getPriorityBadgeColor(ticket.priority)} hidden md:inline-block`}>
                            {ticket.priority}
                          </span>
                          <span className="text-xs text-muted-foreground whitespace-nowrap hidden md:block">
                            {new Date(ticket.createdAt).toLocaleString('en-US', { 
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
                    No tickets found
                  </div>
                )}
              </div>
            </div>
          </div>
          
          {selectedTicket && ticketDetails && (
            <div className="w-full md:w-[400px]">
              <Card className="sticky top-6">
                <CardHeader>
                  <div className="flex justify-between items-start">
                    <div>
                      <CardTitle>{ticketDetails.ticket.subject}</CardTitle>
                      <CardDescription>Ticket #{ticketDetails.ticket.id}</CardDescription>
                    </div>
                    <div className="flex flex-col gap-1 items-end">
                      <span className={`text-xs px-2 py-1 rounded-full ${getStatusBadgeColor(ticketDetails.ticket.status)}`}>
                        {ticketDetails.ticket.status}
                      </span>
                      <span className="text-xs text-muted-foreground">
                        {new Date(ticketDetails.ticket.createdAt).toLocaleString('en-US', { 
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
                    <h3 className="text-sm font-medium mb-1">Description</h3>
                    <p className="text-sm">{ticketDetails.ticket.description}</p>
                  </div>
                  
                  <div>
                    <h3 className="text-sm font-medium mb-1">User ID</h3>
                    <p className="text-sm">#{ticketDetails.ticket.userId}</p>
                  </div>
                  
                  <div>
                    <h3 className="text-sm font-medium mb-1">Category</h3>
                    <p className="text-sm capitalize">{ticketDetails.ticket.category}</p>
                  </div>
                  
                  <div>
                    <h3 className="text-sm font-medium mb-1">Priority</h3>
                    <p className="text-sm capitalize">{ticketDetails.ticket.priority}</p>
                  </div>
                  
                  <div>
                    <h3 className="text-sm font-medium mb-1">Status</h3>
                    <Select 
                      value={ticketDetails.ticket.status} 
                      onValueChange={(value) => handleStatusChange(ticketDetails.ticket.id, value)}
                      disabled={updateTicketMutation.isPending}
                    >
                      <SelectTrigger>
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="open">Open</SelectItem>
                        <SelectItem value="in_progress">In Progress</SelectItem>
                        <SelectItem value="resolved">Resolved</SelectItem>
                        <SelectItem value="closed">Closed</SelectItem>
                        <SelectItem value="escalated">Escalated</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>
                  
                  <div>
                    <h3 className="text-sm font-medium mb-2">Responses</h3>
                    {ticketDetails.responses && ticketDetails.responses.length > 0 ? (
                      <div className="space-y-3 max-h-[300px] overflow-y-auto pr-2">
                        {ticketDetails.responses.map((response) => (
                          <div 
                            key={response.id} 
                            className={`p-3 rounded-lg text-sm ${
                              response.isAdminResponse 
                                ? "bg-primary/10 ml-4" 
                                : "bg-muted mr-4"
                            }`}
                          >
                            <div className="flex justify-between items-start mb-1">
                              <span className="font-medium">
                                {response.isAdminResponse ? "Admin" : "User"}
                              </span>
                              <span className="text-xs text-muted-foreground">
                                {new Date(response.createdAt).toLocaleString('en-US', { 
                                  year: 'numeric', 
                                  month: 'short', 
                                  day: 'numeric',
                                  hour: '2-digit',
                                  minute: '2-digit'
                                })}
                              </span>
                            </div>
                            <p>{response.content}</p>
                          </div>
                        ))}
                      </div>
                    ) : (
                      <p className="text-sm text-muted-foreground">No responses yet</p>
                    )}
                  </div>
                  
                  <form onSubmit={(e) => handleAddResponse(e, ticketDetails.ticket.id)}>
                    <h3 className="text-sm font-medium mb-2">Add Response</h3>
                    <div className="space-y-2">
                      <textarea
                        name="response"
                        className="min-h-[100px] w-full rounded-md border border-input bg-background px-3 py-2 text-sm"
                        placeholder="Type your response here..."
                        disabled={addResponseMutation.isPending}
                      />
                      <Button 
                        type="submit" 
                        disabled={addResponseMutation.isPending}
                        className="w-full"
                      >
                        {addResponseMutation.isPending ? (
                          <>
                            <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                            Sending...
                          </>
                        ) : (
                          "Send Response"
                        )}
                      </Button>
                    </div>
                  </form>
                </CardContent>
              </Card>
            </div>
          )}
        </div>
      </div>
    </AdminLayout>
  );
}