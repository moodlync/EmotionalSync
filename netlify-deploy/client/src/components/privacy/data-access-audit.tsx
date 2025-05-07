import React, { useState } from 'react';
import { useQuery } from '@tanstack/react-query';
import { 
  Card, 
  CardContent, 
  CardDescription, 
  CardFooter, 
  CardHeader, 
  CardTitle 
} from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import { 
  Table, 
  TableBody, 
  TableCaption, 
  TableCell, 
  TableHead, 
  TableHeader, 
  TableRow 
} from "@/components/ui/table";
import { 
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { 
  Pagination, 
  PaginationContent, 
  PaginationEllipsis, 
  PaginationItem, 
  PaginationLink, 
  PaginationNext, 
  PaginationPrevious 
} from "@/components/ui/pagination";
import { Activity, Search, Filter, Download, XCircle } from 'lucide-react';
import { useToast } from '@/hooks/use-toast';

interface AccessLog {
  id: number;
  timestamp: string;
  accessType: 'api' | 'web' | 'admin' | 'thirdParty';
  service: string;
  ipAddress: string;
  location: string;
  action: string;
  dataAccessed: string[];
  status: 'success' | 'failed' | 'blocked';
  details: string;
}

export default function DataAccessAudit() {
  const { toast } = useToast();
  const [currentPage, setCurrentPage] = useState(1);
  const [searchTerm, setSearchTerm] = useState('');
  const [filterType, setFilterType] = useState<string>('all');
  const [filterStatus, setFilterStatus] = useState<string>('all');

  // This would be replaced with a real API call in production
  const { data: accessLogs, isLoading } = useQuery({
    queryKey: ['/api/security/access-logs', currentPage, searchTerm, filterType, filterStatus],
    queryFn: async () => {
      // Mock API response
      const mockLogs: AccessLog[] = [
        {
          id: 1,
          timestamp: '2025-05-06T05:12:34Z',
          accessType: 'web',
          service: 'MoodSync Web App',
          ipAddress: '192.168.1.1',
          location: 'New York, USA',
          action: 'View Profile',
          dataAccessed: ['User Profile', 'Emotion History'],
          status: 'success',
          details: 'Normal user login and profile access'
        },
        {
          id: 2,
          timestamp: '2025-05-06T04:45:12Z',
          accessType: 'api',
          service: 'MoodSync Mobile App',
          ipAddress: '203.0.113.45',
          location: 'London, UK',
          action: 'Update Emotion',
          dataAccessed: ['Emotion Data'],
          status: 'success',
          details: 'Emotion update via mobile app'
        },
        {
          id: 3,
          timestamp: '2025-05-05T22:18:03Z',
          accessType: 'thirdParty',
          service: 'EmotionAPI Partners',
          ipAddress: '198.51.100.234',
          location: 'Frankfurt, Germany',
          action: 'Access Anonymized Data',
          dataAccessed: ['Anonymized Emotion Trends'],
          status: 'success',
          details: 'Authorized API access with valid credentials'
        },
        {
          id: 4,
          timestamp: '2025-05-05T14:32:51Z',
          accessType: 'admin',
          service: 'Admin Dashboard',
          ipAddress: '203.0.113.101',
          location: 'San Francisco, USA',
          action: 'User Support',
          dataAccessed: ['Account Details', 'Subscription Info'],
          status: 'success',
          details: 'Customer support helping with account issues'
        },
        {
          id: 5,
          timestamp: '2025-05-04T09:23:42Z',
          accessType: 'web',
          service: 'MoodSync Web App',
          ipAddress: '203.0.113.198',
          location: 'Moscow, Russia',
          action: 'Login Attempt',
          dataAccessed: [],
          status: 'blocked',
          details: 'Suspicious login attempt blocked by security system'
        }
      ];

      // Filter based on search term
      let filteredLogs = mockLogs;
      
      if (searchTerm) {
        filteredLogs = filteredLogs.filter(log => 
          log.service.toLowerCase().includes(searchTerm.toLowerCase()) ||
          log.action.toLowerCase().includes(searchTerm.toLowerCase()) ||
          log.location.toLowerCase().includes(searchTerm.toLowerCase()) ||
          log.ipAddress.includes(searchTerm)
        );
      }
      
      // Filter by access type
      if (filterType !== 'all') {
        filteredLogs = filteredLogs.filter(log => log.accessType === filterType);
      }
      
      // Filter by status
      if (filterStatus !== 'all') {
        filteredLogs = filteredLogs.filter(log => log.status === filterStatus);
      }

      return {
        logs: filteredLogs,
        total: filteredLogs.length,
        page: currentPage,
        totalPages: Math.ceil(filteredLogs.length / 10)
      };
    }
  });

  const handleSearch = (e: React.FormEvent) => {
    e.preventDefault();
    // The search will be triggered by the useQuery hook when searchTerm changes
  };

  const handleExport = () => {
    toast({
      title: "Data Access Log Export",
      description: "Your access log export has been prepared and is ready for download.",
    });
    // This would trigger a log export API call
  };

  const handleRevokeAccess = (id: number) => {
    toast({
      title: "Access Revoked",
      description: `Access ID ${id} has been revoked and the session terminated.`,
      variant: "destructive",
    });
    // This would trigger an API call to revoke the access
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'success':
        return 'bg-green-100 text-green-800';
      case 'failed':
        return 'bg-orange-100 text-orange-800';
      case 'blocked':
        return 'bg-red-100 text-red-800';
      default:
        return 'bg-gray-100 text-gray-800';
    }
  };

  const getAccessTypeColor = (type: string) => {
    switch (type) {
      case 'web':
        return 'bg-blue-100 text-blue-800';
      case 'api':
        return 'bg-purple-100 text-purple-800';
      case 'admin':
        return 'bg-amber-100 text-amber-800';
      case 'thirdParty':
        return 'bg-teal-100 text-teal-800';
      default:
        return 'bg-gray-100 text-gray-800';
    }
  };

  return (
    <div className="space-y-6">
      <div className="flex flex-col md:flex-row justify-between items-start md:items-center mb-6">
        <div>
          <h2 className="text-2xl font-bold">Data Access Audit Log</h2>
          <p className="text-muted-foreground">
            Review who has accessed your data and when
          </p>
        </div>
        <Button onClick={handleExport} className="mt-4 md:mt-0">
          <Download className="mr-2 h-4 w-4" />
          Export Logs
        </Button>
      </div>

      <Card>
        <CardHeader>
          <CardTitle>Access Log Filters</CardTitle>
          <CardDescription>
            Filter and search through your data access logs
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="flex flex-col md:flex-row gap-4">
            <form onSubmit={handleSearch} className="flex-1 flex gap-2">
              <div className="relative flex-1">
                <Search className="absolute left-2.5 top-2.5 h-4 w-4 text-muted-foreground" />
                <Input
                  type="search"
                  placeholder="Search by service, action, location or IP..."
                  className="pl-8"
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                />
              </div>
              <Button type="submit" variant="secondary">
                Search
              </Button>
            </form>
            <div className="flex gap-2">
              <Select value={filterType} onValueChange={setFilterType}>
                <SelectTrigger className="w-[160px]">
                  <Filter className="mr-2 h-4 w-4" />
                  <SelectValue placeholder="Access Type" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">All Types</SelectItem>
                  <SelectItem value="web">Web App</SelectItem>
                  <SelectItem value="api">API</SelectItem>
                  <SelectItem value="admin">Admin</SelectItem>
                  <SelectItem value="thirdParty">Third Party</SelectItem>
                </SelectContent>
              </Select>
              <Select value={filterStatus} onValueChange={setFilterStatus}>
                <SelectTrigger className="w-[160px]">
                  <Activity className="mr-2 h-4 w-4" />
                  <SelectValue placeholder="Status" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">All Statuses</SelectItem>
                  <SelectItem value="success">Success</SelectItem>
                  <SelectItem value="failed">Failed</SelectItem>
                  <SelectItem value="blocked">Blocked</SelectItem>
                </SelectContent>
              </Select>
            </div>
          </div>
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle>Access Records</CardTitle>
          <CardDescription>
            Showing {accessLogs?.logs.length || 0} of {accessLogs?.total || 0} total records
          </CardDescription>
        </CardHeader>
        <CardContent>
          {isLoading ? (
            <div className="flex items-center justify-center py-10">
              <div className="animate-spin h-8 w-8 border-4 border-primary border-t-transparent rounded-full"></div>
            </div>
          ) : accessLogs?.logs.length === 0 ? (
            <div className="flex flex-col items-center justify-center py-10 text-center">
              <XCircle className="h-12 w-12 text-muted-foreground mb-4" />
              <h3 className="text-lg font-medium">No access logs found</h3>
              <p className="text-sm text-muted-foreground mt-1 max-w-md">
                No data access logs match your current filters. Try adjusting your search criteria.
              </p>
            </div>
          ) : (
            <Table>
              <TableCaption>A list of your recent data access logs</TableCaption>
              <TableHeader>
                <TableRow>
                  <TableHead>Date & Time</TableHead>
                  <TableHead>Source</TableHead>
                  <TableHead>Location</TableHead>
                  <TableHead>Action</TableHead>
                  <TableHead>Data Accessed</TableHead>
                  <TableHead>Status</TableHead>
                  <TableHead className="text-right">Actions</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {accessLogs?.logs.map((log) => (
                  <TableRow key={log.id}>
                    <TableCell className="font-medium">
                      {new Date(log.timestamp).toLocaleString()}
                    </TableCell>
                    <TableCell>
                      <div className="flex flex-col gap-1">
                        <Badge variant="outline" className={getAccessTypeColor(log.accessType)}>
                          {log.accessType === 'thirdParty' ? 'Third Party' : 
                           log.accessType === 'api' ? 'API' : 
                           log.accessType === 'admin' ? 'Admin' : 'Web'}
                        </Badge>
                        <span className="text-sm">{log.service}</span>
                        <span className="text-xs text-muted-foreground">{log.ipAddress}</span>
                      </div>
                    </TableCell>
                    <TableCell>{log.location}</TableCell>
                    <TableCell>{log.action}</TableCell>
                    <TableCell>
                      <div className="flex flex-wrap gap-1">
                        {log.dataAccessed.length > 0 ? (
                          log.dataAccessed.map((data, index) => (
                            <Badge key={index} variant="secondary" className="text-xs">
                              {data}
                            </Badge>
                          ))
                        ) : (
                          <span className="text-xs text-muted-foreground">None</span>
                        )}
                      </div>
                    </TableCell>
                    <TableCell>
                      <Badge className={getStatusColor(log.status)}>
                        {log.status.charAt(0).toUpperCase() + log.status.slice(1)}
                      </Badge>
                    </TableCell>
                    <TableCell className="text-right">
                      {log.status === 'success' && log.accessType !== 'admin' && (
                        <Button 
                          variant="destructive" 
                          size="sm"
                          onClick={() => handleRevokeAccess(log.id)}
                        >
                          Revoke
                        </Button>
                      )}
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          )}
        </CardContent>
        <CardFooter className="flex justify-center border-t p-4">
          <Pagination>
            <PaginationContent>
              <PaginationItem>
                <PaginationPrevious 
                  onClick={() => setCurrentPage(p => Math.max(1, p - 1))}
                  className={currentPage === 1 ? 'pointer-events-none opacity-50' : ''}
                />
              </PaginationItem>
              {Array.from({ length: accessLogs?.totalPages || 1 }).map((_, i) => (
                <PaginationItem key={i}>
                  <PaginationLink 
                    isActive={currentPage === i + 1}
                    onClick={() => setCurrentPage(i + 1)}
                  >
                    {i + 1}
                  </PaginationLink>
                </PaginationItem>
              ))}
              <PaginationItem>
                <PaginationNext 
                  onClick={() => setCurrentPage(p => p < (accessLogs?.totalPages || 1) ? p + 1 : p)}
                  className={currentPage === (accessLogs?.totalPages || 1) ? 'pointer-events-none opacity-50' : ''}
                />
              </PaginationItem>
            </PaginationContent>
          </Pagination>
        </CardFooter>
      </Card>
    </div>
  );
}