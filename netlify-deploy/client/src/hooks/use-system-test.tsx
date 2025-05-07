import { useMutation, useQuery } from "@tanstack/react-query";
import { apiRequest, queryClient } from "@/lib/queryClient";
import { useToast } from "@/hooks/use-toast";

export interface TestResult {
  component: string;
  success: boolean;
  message: string;
  details?: any;
  timestamp: string;
}

export interface BackupInfo {
  id: string;
  timestamp: string;
  description: string;
  size: string;
  components: string[];
}

export function useSystemTest() {
  const { toast } = useToast();
  
  // Run system tests
  const runTestsMutation = useMutation({
    mutationFn: async () => {
      try {
        const res = await apiRequest("POST", "/api/system/test");
        return await res.json() as TestResult[];
      } catch (error) {
        // Handle unauthorized errors
        if (error instanceof Error && error.message.includes("401")) {
          toast({
            title: "Authentication Required",
            description: "Please login to run system tests",
            variant: "destructive",
          });
          return [] as TestResult[];
        }
        throw error;
      }
    },
    onSuccess: (data) => {
      if (data.length > 0) {
        toast({
          title: "System tests completed",
          description: "All tests have been completed successfully",
        });
      }
    },
    onError: (error: Error) => {
      toast({
        title: "Test execution failed",
        description: error.message,
        variant: "destructive",
      });
    },
  });
  
  // Get all backups
  const { 
    data: backups, 
    isLoading: isLoadingBackups,
    error: backupsError,
    refetch: refetchBackups 
  } = useQuery<BackupInfo[]>({
    queryKey: ["/api/system/backups"],
    queryFn: async () => {
      try {
        const res = await apiRequest("GET", "/api/system/backups");
        return await res.json();
      } catch (error) {
        // Return empty array if unauthorized or other error
        if (error instanceof Error && error.message.includes("401")) {
          return [];
        }
        throw error;
      }
    },
    enabled: true,
  });
  
  // Create backup
  const createBackupMutation = useMutation({
    mutationFn: async (description: string = "Manual backup") => {
      try {
        const res = await apiRequest("POST", "/api/system/backup", { description });
        return await res.json() as BackupInfo;
      } catch (error) {
        // Handle unauthorized errors
        if (error instanceof Error && error.message.includes("401")) {
          toast({
            title: "Authentication Required",
            description: "Please login to create backups",
            variant: "destructive",
          });
          return null as unknown as BackupInfo;
        }
        throw error;
      }
    },
    onSuccess: (data) => {
      if (data) {
        toast({
          title: "Backup created",
          description: "System backup has been created successfully",
        });
        // Refresh backups list
        queryClient.invalidateQueries({ queryKey: ["/api/system/backups"] });
      }
    },
    onError: (error: Error) => {
      toast({
        title: "Backup creation failed",
        description: error.message,
        variant: "destructive",
      });
    },
  });
  
  // Restore from backup
  const restoreBackupMutation = useMutation({
    mutationFn: async (backupId: string) => {
      try {
        const res = await apiRequest("POST", `/api/system/restore/${backupId}`);
        return await res.json();
      } catch (error) {
        // Handle unauthorized errors
        if (error instanceof Error && error.message.includes("401")) {
          toast({
            title: "Authentication Required",
            description: "Please login to restore from backups",
            variant: "destructive",
          });
          return null;
        }
        throw error;
      }
    },
    onSuccess: (data) => {
      if (data) {
        toast({
          title: "System restored",
          description: "System has been restored from backup successfully",
        });
        // Invalidate all queries to refresh data
        queryClient.invalidateQueries();
      }
    },
    onError: (error: Error) => {
      toast({
        title: "Restore failed",
        description: error.message,
        variant: "destructive",
      });
    },
  });
  
  return {
    // Test functions
    runTests: runTestsMutation.mutate,
    isRunningTests: runTestsMutation.isPending,
    testResults: runTestsMutation.data || [],
    
    // Backup functions
    backups: backups || [],
    isLoadingBackups,
    backupsError,
    refetchBackups,
    
    // Create backup
    createBackup: createBackupMutation.mutate,
    isCreatingBackup: createBackupMutation.isPending,
    
    // Restore backup
    restoreBackup: restoreBackupMutation.mutate,
    isRestoringBackup: restoreBackupMutation.isPending,
  };
}