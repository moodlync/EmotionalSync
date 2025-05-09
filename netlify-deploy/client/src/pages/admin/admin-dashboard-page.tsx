import { useQuery } from "@tanstack/react-query";
import AdminLayout from "@/components/admin/admin-layout";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Loader2, Users, TicketCheck, BadgeDollarSign, TrendingUp } from "lucide-react";
import { useEffect } from "react";

export default function AdminDashboardPage() {
  // We don't need to check if user is admin, the AdminRoute component already did that
  const { data: stats, isLoading, error } = useQuery({
    queryKey: ["/api/admin/dashboard"],
  });
  
  // Get the admin user from the stats since it's included in the dashboard response
  const adminUser = stats?.adminUser;
  
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
          <p>Error loading dashboard data</p>
          <p className="text-sm">{error instanceof Error ? error.message : "Unknown error"}</p>
        </div>
      </AdminLayout>
    );
  }
  
  return (
    <AdminLayout>
      <div className="flex flex-col gap-6">
        <div>
          <h1 className="text-3xl font-bold tracking-tight">Dashboard</h1>
          <p className="text-muted-foreground">
            Welcome to the admin dashboard, {adminUser?.username}
          </p>
        </div>
        
        <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Total Users</CardTitle>
              <Users className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{stats?.totalUsers || 0}</div>
              <p className="text-xs text-muted-foreground">
                {stats?.activeUsers || 0} active in the last 30 days
              </p>
            </CardContent>
          </Card>
          
          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Premium Users</CardTitle>
              <BadgeDollarSign className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{stats?.premiumUsers || 0}</div>
              <p className="text-xs text-muted-foreground">
                {stats?.premiumUsers && stats?.totalUsers 
                  ? Math.round((stats.premiumUsers / stats.totalUsers) * 100)
                  : 0}% of total users
              </p>
            </CardContent>
          </Card>
          
          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Open Tickets</CardTitle>
              <TicketCheck className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{stats?.openTickets || 0}</div>
              <p className="text-xs text-muted-foreground">
                {stats?.pendingRefunds || 0} pending refunds
              </p>
            </CardContent>
          </Card>
          
          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Total Revenue</CardTitle>
              <TrendingUp className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">
                ${stats?.totalRevenue?.toFixed(2) || "0.00"}
              </div>
              <p className="text-xs text-muted-foreground">
                From premium subscriptions
              </p>
            </CardContent>
          </Card>
        </div>
        
        <div className="grid gap-4 md:grid-cols-2">
          <Card>
            <CardHeader>
              <CardTitle>Recent Tickets</CardTitle>
              <CardDescription>
                Last 5 support tickets submitted
              </CardDescription>
            </CardHeader>
            <CardContent>
              {stats?.recentTickets?.length ? (
                <div className="space-y-4">
                  {stats.recentTickets.map(ticket => (
                    <div key={ticket.id} className="border-b pb-4 last:border-0 last:pb-0">
                      <div className="flex justify-between items-start">
                        <div>
                          <p className="font-medium">{ticket.subject}</p>
                          <p className="text-sm text-muted-foreground line-clamp-1">
                            {ticket.description}
                          </p>
                        </div>
                        <div className="text-right">
                          <span className={`text-xs px-2 py-1 rounded-full ${
                            ticket.status === 'open'
                              ? 'bg-blue-100 text-blue-800'
                              : ticket.status === 'in_progress'
                              ? 'bg-amber-100 text-amber-800' 
                              : ticket.status === 'resolved'
                              ? 'bg-green-100 text-green-800'
                              : 'bg-gray-100 text-gray-800'
                          }`}>
                            {ticket.status}
                          </span>
                        </div>
                      </div>
                      <div className="flex justify-between mt-2 text-xs text-muted-foreground">
                        <span>ID: #{ticket.id}</span>
                        <span>
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
                  ))}
                </div>
              ) : (
                <p className="text-sm text-muted-foreground">No recent tickets</p>
              )}
            </CardContent>
          </Card>
          
          <Card>
            <CardHeader>
              <CardTitle>Recent Refunds</CardTitle>
              <CardDescription>
                Last 5 refund requests
              </CardDescription>
            </CardHeader>
            <CardContent>
              {stats?.recentRefunds?.length ? (
                <div className="space-y-4">
                  {stats.recentRefunds.map(refund => (
                    <div key={refund.id} className="border-b pb-4 last:border-0 last:pb-0">
                      <div className="flex justify-between items-start">
                        <div>
                          <p className="font-medium">
                            ${parseFloat(refund.amount).toFixed(2)} {refund.currency}
                          </p>
                          <p className="text-sm text-muted-foreground line-clamp-1">
                            {refund.reason}
                          </p>
                        </div>
                        <div className="text-right">
                          <span className={`text-xs px-2 py-1 rounded-full ${
                            refund.status === 'pending'
                              ? 'bg-amber-100 text-amber-800'
                              : refund.status === 'approved'
                              ? 'bg-green-100 text-green-800' 
                              : refund.status === 'rejected'
                              ? 'bg-red-100 text-red-800'
                              : 'bg-gray-100 text-gray-800'
                          }`}>
                            {refund.status}
                          </span>
                        </div>
                      </div>
                      <div className="flex justify-between mt-2 text-xs text-muted-foreground">
                        <span>User ID: #{refund.userId}</span>
                        <span>
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
                  ))}
                </div>
              ) : (
                <p className="text-sm text-muted-foreground">No recent refunds</p>
              )}
            </CardContent>
          </Card>
        </div>
        
        <Card>
          <CardHeader>
            <CardTitle>User Emotions Distribution</CardTitle>
            <CardDescription>
              Current emotional state of users on the platform
            </CardDescription>
          </CardHeader>
          <CardContent>
            {stats?.usersByEmotion ? (
              <div className="grid grid-cols-6 gap-4">
                {Object.entries(stats.usersByEmotion).map(([emotion, count]) => (
                  <div key={emotion} className="flex flex-col items-center">
                    <div className={`w-full h-32 rounded-md flex items-end mb-2 ${
                      emotion === 'happy' ? 'bg-yellow-100' :
                      emotion === 'sad' ? 'bg-blue-100' :
                      emotion === 'angry' ? 'bg-red-100' :
                      emotion === 'anxious' ? 'bg-purple-100' :
                      emotion === 'excited' ? 'bg-green-100' :
                      'bg-gray-100'
                    }`}>
                      <div 
                        className={`w-full ${
                          emotion === 'happy' ? 'bg-yellow-400' :
                          emotion === 'sad' ? 'bg-blue-400' :
                          emotion === 'angry' ? 'bg-red-400' :
                          emotion === 'anxious' ? 'bg-purple-400' :
                          emotion === 'excited' ? 'bg-green-400' :
                          'bg-gray-400'
                        } rounded-b-md transition-all duration-300`} 
                        style={{ 
                          height: `${Math.max(
                            5, 
                            Math.min(
                              100, 
                              count / (Math.max(...Object.values(stats.usersByEmotion)) || 1) * 100
                            )
                          )}%` 
                        }}
                      />
                    </div>
                    <span className="capitalize font-medium text-sm">{emotion}</span>
                    <span className="text-xs text-muted-foreground">{count} users</span>
                  </div>
                ))}
              </div>
            ) : (
              <p className="text-sm text-muted-foreground">No emotion data available</p>
            )}
          </CardContent>
        </Card>
      </div>
    </AdminLayout>
  );
}