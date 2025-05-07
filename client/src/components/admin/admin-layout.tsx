import { ReactNode, useState, useEffect } from "react";
import { Link, useLocation } from "wouter";
import { 
  Users, 
  TicketCheck, 
  RotateCcw, 
  Quote, 
  BarChart3, 
  ClipboardList,
  ChevronRight,
  LogOut,
  Menu,
  X
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Sheet, SheetContent, SheetTrigger } from "@/components/ui/sheet";
import { useToast } from "@/hooks/use-toast";
import { apiRequest } from "@/lib/queryClient";

const sidebarItems = [
  {
    title: "Dashboard",
    href: "/admin",
    icon: BarChart3
  },
  {
    title: "Tickets",
    href: "/admin/tickets",
    icon: TicketCheck
  },
  {
    title: "Refunds",
    href: "/admin/refunds",
    icon: RotateCcw
  },
  {
    title: "Users",
    href: "/admin/users",
    icon: Users
  },
  {
    title: "Actions Log",
    href: "/admin/actions",
    icon: ClipboardList
  },
  {
    title: "Quotes",
    href: "/admin/quotes",
    icon: Quote
  }
];

interface AdminLayoutProps {
  children: ReactNode;
}

export default function AdminLayout({ children }: AdminLayoutProps) {
  const [location, setLocation] = useLocation();
  const { toast } = useToast();
  const [adminUser, setAdminUser] = useState<any>(null);
  const [open, setOpen] = useState(false);
  
  // Fetch admin user details on mount
  useEffect(() => {
    async function fetchAdminData() {
      try {
        const response = await apiRequest("GET", "/api/admin/dashboard");
        if (response.ok) {
          const data = await response.json();
          setAdminUser(data.adminUser);
        }
      } catch (error) {
        console.error("Error fetching admin user data:", error);
      }
    }
    
    fetchAdminData();
  }, []);
  
  const handleLogout = async () => {
    try {
      // Log out by making a POST request to the logout endpoint
      const response = await apiRequest("POST", "/api/admin/logout");
      
      if (response.ok) {
        toast({
          title: "Logged out",
          description: "You have been logged out of the admin panel",
        });
        
        // Redirect to login page
        setLocation("/admin/login");
      } else {
        throw new Error("Logout request failed");
      }
    } catch (error) {
      toast({
        title: "Logout failed",
        description: error instanceof Error ? error.message : "Failed to log out",
        variant: "destructive",
      });
    }
  };
  
  const SidebarContent = () => (
    <div className="flex h-full flex-col border-r bg-background">
      <div className="border-b p-4">
        <Link href="/admin" className="flex items-center gap-2 font-semibold">
          <span className="text-xl font-bold">
            <span className="text-black font-extrabold" style={{ textShadow: '0px 1px 2px rgba(0,0,0,0.1)' }}>Mood</span>
            <span className="text-red-600 font-extrabold" style={{ textShadow: '0px 1px 2px rgba(220,38,38,0.1)' }}>Sync</span>
            <span className="ml-1 text-gray-700">Admin</span>
          </span>
        </Link>
      </div>
      <ScrollArea className="flex-1 px-3 py-2">
        <div className="space-y-1 py-2">
          {sidebarItems.map((item) => (
            <Link
              key={item.href}
              href={item.href}
              onClick={() => setOpen(false)}
            >
              <div 
                className={`group flex cursor-pointer items-center rounded-md px-3 py-2 text-sm font-medium hover:bg-accent hover:text-accent-foreground ${
                  (location === item.href || 
                   (item.href !== "/admin" && location.startsWith(item.href)))
                    ? "bg-accent text-accent-foreground"
                    : "transparent"
                }`}
              >
                <item.icon className="mr-2 h-5 w-5" />
                <span>{item.title}</span>
                <ChevronRight className="ml-auto h-4 w-4 opacity-0 group-hover:opacity-100" />
              </div>
            </Link>
          ))}
        </div>
      </ScrollArea>
      <div className="mt-auto border-t p-4">
        <div className="flex items-center gap-3 py-2">
          <div>
            <p className="text-sm font-medium">{adminUser?.username || "Admin"}</p>
            <p className="text-xs text-muted-foreground">Admin Panel</p>
          </div>
          <Button 
            variant="ghost" 
            size="icon" 
            className="ml-auto" 
            onClick={handleLogout}
          >
            <LogOut className="h-5 w-5" />
          </Button>
        </div>
      </div>
    </div>
  );

  return (
    <div className="grid min-h-screen w-full lg:grid-cols-[280px_1fr]">
      <div className="hidden border-r lg:block">
        <SidebarContent />
      </div>
      <div className="flex flex-col">
        <header className="sticky top-0 z-10 flex h-16 items-center gap-4 border-b bg-background px-6 lg:hidden">
          <Sheet open={open} onOpenChange={setOpen}>
            <SheetTrigger asChild>
              <Button variant="outline" size="icon" className="lg:hidden">
                <Menu className="h-6 w-6" />
                <span className="sr-only">Toggle navigation menu</span>
              </Button>
            </SheetTrigger>
            <SheetContent side="left" className="w-[280px] p-0">
              <SidebarContent />
            </SheetContent>
          </Sheet>
          <span className="text-xl font-bold">
            <span className="text-black font-extrabold" style={{ textShadow: '0px 1px 2px rgba(0,0,0,0.1)' }}>Mood</span>
            <span className="text-red-600 font-extrabold" style={{ textShadow: '0px 1px 2px rgba(220,38,38,0.1)' }}>Sync</span>
            <span className="ml-1 text-gray-700">Admin</span>
          </span>
        </header>
        <main className="flex-1 p-6">
          {children}
        </main>
      </div>
    </div>
  );
}