import { useState, useEffect } from "react";
import { useToast } from "@/hooks/use-toast";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { apiRequest } from "@/lib/queryClient";
import AdminLayout from "@/components/admin/admin-layout";
import { 
  Card, 
  CardContent, 
  CardDescription, 
  CardFooter, 
  CardHeader, 
  CardTitle 
} from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { DataTable } from "@/components/ui/data-table";
import { ColumnDef } from "@tanstack/react-table";
import { Download, RotateCcw, Database, Check, Clock, AlertCircle, XCircle } from "lucide-react";
import { format } from "date-fns";

interface SystemBackup {
  id: number;
  backupId: string;
  backupType: string;
  destination: string;
  initiatedBy: number;
  initiatedAt: string;
  completedAt: string | null;
  status: "IN_PROGRESS" | "COMPLETED" | "FAILED";
  fileSize: number | null;
  encryptionStatus: string;
  storageLocation: string;
  retentionPeriod: number;
}

export default function AdminBackupPage() {
  const { toast } = useToast();
  const queryClient = useQueryClient();
  const [backupInProgress, setBackupInProgress] = useState(false);
  
  // Get the list of system backups
  const { data: backupsData, isLoading: isLoadingBackups } = useQuery({
    queryKey: ["/api/admin/system/backups"],
    queryFn: async () => {
      const response = await apiRequest("GET", "/api/admin/system/backups");
      if (!response.ok) throw new Error("Failed to fetch backups");
      return await response.json();
    }
  });
  
  // Check if there's an ongoing backup
  useEffect(() => {
    if (backupsData?.data) {
      const inProgressBackup = backupsData.data.find(
        (backup: SystemBackup) => backup.status === "IN_PROGRESS"
      );
      setBackupInProgress(!!inProgressBackup);
    }
  }, [backupsData]);
  
  // Mutation to initiate a backup
  const initiateBackupMutation = useMutation({
    mutationFn: async () => {
      const response = await apiRequest("POST", "/api/admin/system/backup");
      if (!response.ok) throw new Error("Failed to initiate backup");
      return await response.json();
    },
    onSuccess: () => {
      toast({
        title: "Backup initiated",
        description: "System backup has been started and will be available shortly.",
      });
      setBackupInProgress(true);
      // Refetch backups after a short delay to allow the server to create the record
      setTimeout(() => {
        queryClient.invalidateQueries({ queryKey: ["/api/admin/system/backups"] });
      }, 500);
    },
    onError: (error) => {
      toast({
        title: "Backup failed",
        description: error instanceof Error ? error.message : "Failed to initiate backup",
        variant: "destructive",
      });
    }
  });
  
  // Mutation to get download URL for a backup
  const getBackupDownloadUrlMutation = useMutation({
    mutationFn: async (backupId: string) => {
      const response = await apiRequest("GET", `/api/admin/system/backups/${backupId}/download`);
      if (!response.ok) throw new Error("Failed to get download URL");
      return await response.json();
    },
    onSuccess: (data) => {
      // In a real implementation, this would trigger a file download
      // For this demo, we'll just show a toast
      toast({
        title: "Download started",
        description: "Your backup file download has started.",
      });
    },
    onError: (error) => {
      toast({
        title: "Download failed",
        description: error instanceof Error ? error.message : "Failed to get download URL",
        variant: "destructive",
      });
    }
  });
  
  const getStatusBadge = (status: string) => {
    switch (status) {
      case "COMPLETED":
        return (
          <Badge className="bg-green-500 hover:bg-green-600">
            <Check className="h-3 w-3 mr-1" /> Completed
          </Badge>
        );
      case "IN_PROGRESS":
        return (
          <Badge className="bg-blue-500 hover:bg-blue-600">
            <Clock className="h-3 w-3 mr-1" /> In Progress
          </Badge>
        );
      case "FAILED":
        return (
          <Badge className="bg-red-500 hover:bg-red-600">
            <XCircle className="h-3 w-3 mr-1" /> Failed
          </Badge>
        );
      default:
        return (
          <Badge variant="outline">
            <AlertCircle className="h-3 w-3 mr-1" /> {status}
          </Badge>
        );
    }
  };
  
  const formatFileSize = (bytes: number | null) => {
    if (bytes === null) return "N/A";
    const sizes = ["Bytes", "KB", "MB", "GB", "TB"];
    if (bytes === 0) return "0 Byte";
    const i = Math.floor(Math.log(bytes) / Math.log(1024));
    return Math.round((bytes / Math.pow(1024, i)) * 100) / 100 + " " + sizes[i];
  };
  
  const columns: ColumnDef<SystemBackup>[] = [
    {
      accessorKey: "backupId",
      header: "Backup ID",
      cell: ({ row }) => <div className="font-medium">{row.getValue("backupId")}</div>,
    },
    {
      accessorKey: "backupType",
      header: "Type",
    },
    {
      accessorKey: "initiatedAt",
      header: "Initiated At",
      cell: ({ row }) => {
        const initiatedAt = row.getValue("initiatedAt") as string;
        return initiatedAt ? format(new Date(initiatedAt), "MMM dd, yyyy HH:mm:ss") : "N/A";
      },
    },
    {
      accessorKey: "completedAt",
      header: "Completed At",
      cell: ({ row }) => {
        const completedAt = row.getValue("completedAt") as string | null;
        return completedAt ? format(new Date(completedAt), "MMM dd, yyyy HH:mm:ss") : "—";
      },
    },
    {
      accessorKey: "status",
      header: "Status",
      cell: ({ row }) => getStatusBadge(row.getValue("status")),
    },
    {
      accessorKey: "fileSize",
      header: "Size",
      cell: ({ row }) => formatFileSize(row.getValue("fileSize") as number | null),
    },
    {
      id: "actions",
      header: "Actions",
      cell: ({ row }) => {
        const backup = row.original;
        const isCompleted = backup.status === "COMPLETED";
        
        return (
          <Button
            variant="outline"
            size="sm"
            onClick={() => getBackupDownloadUrlMutation.mutate(backup.backupId)}
            disabled={!isCompleted || getBackupDownloadUrlMutation.isPending}
          >
            <Download className="h-4 w-4 mr-1" />
            Download
          </Button>
        );
      },
    },
  ];
  
  return (
    <AdminLayout>
      <div className="mx-auto max-w-7xl">
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-3xl font-bold tracking-tight">System Backup</h1>
            <p className="text-muted-foreground mt-1">
              Manage system backups and data recovery
            </p>
          </div>
          <Button
            onClick={() => initiateBackupMutation.mutate()}
            disabled={backupInProgress || initiateBackupMutation.isPending}
            className="gap-2"
          >
            {initiateBackupMutation.isPending ? (
              <RotateCcw className="h-4 w-4 animate-spin" />
            ) : (
              <Database className="h-4 w-4" />
            )}
            {backupInProgress
              ? "Backup in progress..."
              : initiateBackupMutation.isPending
              ? "Starting backup..."
              : "Create Backup"}
          </Button>
        </div>

        <div className="mt-6 grid gap-6">
          <Card>
            <CardHeader>
              <CardTitle>Backup History</CardTitle>
              <CardDescription>Recent system backups and their status</CardDescription>
            </CardHeader>
            <CardContent>
              {isLoadingBackups ? (
                <div className="flex justify-center py-8">
                  <RotateCcw className="h-8 w-8 animate-spin text-muted-foreground" />
                </div>
              ) : (
                <DataTable 
                  columns={columns} 
                  data={backupsData?.data || []} 
                  defaultPageSize={5}
                />
              )}
            </CardContent>
            <CardFooter className="flex justify-between text-sm text-muted-foreground">
              <div>
                <span className="font-medium">Note:</span> Backups are retained for 30 days by default.
              </div>
              <div>
                <span className="font-medium">Total:</span> {backupsData?.data?.length || 0} backups
              </div>
            </CardFooter>
          </Card>
        </div>
      </div>
    </AdminLayout>
  );
}