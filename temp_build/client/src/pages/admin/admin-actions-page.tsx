import { useState } from "react";
import { useQuery } from "@tanstack/react-query";
import { Loader2, Search, RefreshCw, Filter, Clock, AlignJustify } from "lucide-react";
import AdminLayout from "@/components/admin/admin-layout";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { useToast } from "@/hooks/use-toast";
import { apiRequest } from "@/lib/queryClient";
import { AdminActionType } from "@shared/schema";

const actionTypes: AdminActionType[] = [
  "login", 
  "user_ban", 
  "user_unban", 
  "content_removal", 
  "warning_issued", 
  "payment_processed", 
  "refund_processed", 
  "account_recovery", 
  "challenge_approval", 
  "support_response",
  "create_admin",
  "update_admin",
  "update_ticket",
  "quote_created",
  "quote_updated"
];

export default function AdminActionsPage() {
  const { toast } = useToast();
  
  const [searchQuery, setSearchQuery] = useState("");
  const [actionTypeFilter, setActionTypeFilter] = useState("");
  const [timeFilter, setTimeFilter] = useState("all");
  const [selectedAction, setSelectedAction] = useState(null);
  
  // Fetch admin actions
  const {
    data: adminActions,
    isLoading,
    error,
    refetch
  } = useQuery({
    queryKey: ["/api/admin/actions"],
    queryFn: async () => {
      const response = await apiRequest("GET", "/api/admin/actions");
      
      if (!response.ok) {
        throw new Error("Failed to fetch admin actions");
      }
      
      return response.json();
    }
  });
  
  // Filter admin actions by search query, action type, and time
  const filteredActions = adminActions ? adminActions.filter(action => {
    // Filter by search query
    const matchesSearch = searchQuery === "" || 
      action.actionType.toLowerCase().includes(searchQuery.toLowerCase()) ||
      (action.actionDetails && action.actionDetails.toLowerCase().includes(searchQuery.toLowerCase())) ||
      (action.reason && action.reason.toLowerCase().includes(searchQuery.toLowerCase())) ||
      action.adminId.toString().includes(searchQuery) || 
      (action.targetId && action.targetId.toString().includes(searchQuery));
    
    // Filter by action type
    const matchesType = actionTypeFilter === "" || action.actionType === actionTypeFilter;
    
    // Filter by time
    let matchesTime = true;
    if (timeFilter !== "all") {
      const now = new Date();
      const actionDate = new Date(action.createdAt);
      const diffHours = (now.getTime() - actionDate.getTime()) / (1000 * 60 * 60);
      
      switch (timeFilter) {
        case "24h":
          matchesTime = diffHours <= 24;
          break;
        case "7d":
          matchesTime = diffHours <= 24 * 7;
          break;
        case "30d":
          matchesTime = diffHours <= 24 * 30;
          break;
      }
    }
    
    return matchesSearch && matchesType && matchesTime;
  }) : [];
  
  const getActionTypeColor = (actionType: string) => {
    switch (actionType) {
      case 'login':
        return "bg-blue-100 text-blue-800";
      case 'user_ban':
      case 'content_removal':
        return "bg-red-100 text-red-800";
      case 'user_unban':
      case 'account_recovery':
        return "bg-green-100 text-green-800";
      case 'payment_processed':
      case 'refund_processed':
        return "bg-amber-100 text-amber-800";
      case 'warning_issued':
        return "bg-orange-100 text-orange-800";
      case 'support_response':
      case 'update_ticket':
        return "bg-purple-100 text-purple-800";
      case 'challenge_approval':
        return "bg-indigo-100 text-indigo-800";
      case 'create_admin':
      case 'update_admin':
        return "bg-teal-100 text-teal-800";
      case 'quote_created':
      case 'quote_updated':
        return "bg-cyan-100 text-cyan-800";
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
          <p>Error loading admin actions</p>
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
            <h1 className="text-3xl font-bold tracking-tight">Admin Actions Log</h1>
            <p className="text-muted-foreground">
              Track all administrative activities on MoodSync
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
        
        <div className="grid gap-2 sm:grid-cols-2 lg:grid-cols-4">
          <div className="relative">
            <Search className="absolute left-2.5 top-2.5 h-4 w-4 text-muted-foreground" />
            <Input
              type="search"
              placeholder="Search actions..."
              className="pl-8"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
            />
          </div>
          
          <div>
            <Select 
              value={actionTypeFilter} 
              onValueChange={setActionTypeFilter}
            >
              <SelectTrigger>
                <SelectValue placeholder="All action types" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="">All action types</SelectItem>
                {actionTypes.map((type) => (
                  <SelectItem key={type} value={type}>
                    <span className="capitalize">{type.replace(/_/g, ' ')}</span>
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>
          
          <div>
            <Select 
              value={timeFilter} 
              onValueChange={setTimeFilter}
            >
              <SelectTrigger>
                <SelectValue placeholder="All time periods" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">All time</SelectItem>
                <SelectItem value="24h">Last 24 hours</SelectItem>
                <SelectItem value="7d">Last 7 days</SelectItem>
                <SelectItem value="30d">Last 30 days</SelectItem>
              </SelectContent>
            </Select>
          </div>
        </div>
        
        <div className="rounded-md border">
          <div className="px-4 py-3 border-b bg-muted/50">
            <div className="grid grid-cols-9 gap-4">
              <div className="col-span-2">
                <span className="font-medium">Admin</span>
              </div>
              <div className="col-span-2">
                <span className="font-medium">Action</span>
              </div>
              <div className="col-span-3 hidden md:block">
                <span className="font-medium">Details</span>
              </div>
              <div className="col-span-2 text-right">
                <span className="font-medium">Timestamp</span>
              </div>
            </div>
          </div>
          
          <div className="divide-y">
            {filteredActions.length > 0 ? (
              filteredActions.map((action) => (
                <div
                  key={action.id}
                  className="px-4 py-3 hover:bg-muted/50 cursor-pointer"
                  onClick={() => setSelectedAction(action)}
                >
                  <div className="grid grid-cols-9 gap-4">
                    <div className="col-span-2">
                      <div className="font-medium">Admin #{action.adminId}</div>
                      <div className="text-xs text-muted-foreground">
                        IP: {action.ipAddress || 'Unknown'}
                      </div>
                    </div>
                    <div className="col-span-2">
                      <span className={`inline-flex items-center rounded-full px-2 py-1 text-xs ${getActionTypeColor(action.actionType)}`}>
                        {action.actionType.replace(/_/g, ' ')}
                      </span>
                      <div className="text-xs text-muted-foreground mt-1">
                        {action.targetType && (
                          <span>
                            {action.targetType} {action.targetId && `#${action.targetId}`}
                          </span>
                        )}
                      </div>
                    </div>
                    <div className="col-span-3 hidden md:block">
                      <div className="text-sm line-clamp-2">
                        {action.actionDetails || action.reason || 'No details provided'}
                      </div>
                    </div>
                    <div className="col-span-2 text-right">
                      <div className="text-sm">
                        {new Date(action.createdAt).toLocaleDateString()}
                      </div>
                      <div className="text-xs text-muted-foreground">
                        {new Date(action.createdAt).toLocaleTimeString()}
                      </div>
                    </div>
                  </div>
                </div>
              ))
            ) : (
              <div className="px-4 py-8 text-center text-muted-foreground">
                No admin actions found
              </div>
            )}
          </div>
        </div>
      </div>
      
      <Dialog open={!!selectedAction} onOpenChange={(open) => !open && setSelectedAction(null)}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Admin Action Details</DialogTitle>
            <DialogDescription>
              Complete information about this administrative action
            </DialogDescription>
          </DialogHeader>
          
          {selectedAction && (
            <div className="space-y-4 py-2">
              <div className="flex flex-col space-y-1.5">
                <h3 className="text-sm font-medium">Action Type</h3>
                <p className="text-sm">
                  <span className={`inline-flex items-center rounded-full px-2 py-1 text-xs ${getActionTypeColor(selectedAction.actionType)}`}>
                    {selectedAction.actionType.replace(/_/g, ' ')}
                  </span>
                </p>
              </div>
              
              <div className="flex flex-col space-y-1.5">
                <h3 className="text-sm font-medium">Performed By</h3>
                <p className="text-sm">Admin #{selectedAction.adminId}</p>
              </div>
              
              {selectedAction.targetType && (
                <div className="flex flex-col space-y-1.5">
                  <h3 className="text-sm font-medium">Target</h3>
                  <p className="text-sm capitalize">
                    {selectedAction.targetType} {selectedAction.targetId && `#${selectedAction.targetId}`}
                  </p>
                </div>
              )}
              
              {selectedAction.actionDetails && (
                <div className="flex flex-col space-y-1.5">
                  <h3 className="text-sm font-medium">Details</h3>
                  <p className="text-sm">{selectedAction.actionDetails}</p>
                </div>
              )}
              
              {selectedAction.reason && (
                <div className="flex flex-col space-y-1.5">
                  <h3 className="text-sm font-medium">Reason</h3>
                  <p className="text-sm">{selectedAction.reason}</p>
                </div>
              )}
              
              <div className="flex flex-col space-y-1.5">
                <h3 className="text-sm font-medium">Date & Time</h3>
                <p className="text-sm">
                  {new Date(selectedAction.createdAt).toLocaleString()}
                </p>
              </div>
              
              <div className="flex flex-col space-y-1.5">
                <h3 className="text-sm font-medium">IP Address</h3>
                <p className="text-sm">{selectedAction.ipAddress || 'Unknown'}</p>
              </div>
              
              {selectedAction.userAgent && (
                <div className="flex flex-col space-y-1.5">
                  <h3 className="text-sm font-medium">User Agent</h3>
                  <p className="text-sm text-muted-foreground text-xs">{selectedAction.userAgent}</p>
                </div>
              )}
            </div>
          )}
        </DialogContent>
      </Dialog>
    </AdminLayout>
  );
}