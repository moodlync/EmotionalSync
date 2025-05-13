import { Link } from 'wouter';
import Layout from '@/components/layout';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { 
  BarChart3, 
  Calendar, 
  Code2, 
  FileText, 
  GitMerge, 
  LucideIcon, 
  LayoutDashboard, 
  Settings, 
  CheckCircle2,
  Circle,
  ArrowRight, 
  Database,
  Globe,
  Sparkles,
  Rocket
} from 'lucide-react';

export default function RoadmapPage() {
  return (
    <Layout>
      <div className="container py-8 max-w-5xl mx-auto">
        <div className="mb-8">
          <div className="flex items-center gap-2 mb-1">
            <h1 className="text-3xl font-bold">MoodSync Roadmap</h1>
            <span className="px-2 py-0.5 rounded-full bg-accent/50 text-xs font-medium">2025</span>
          </div>
          <p className="text-muted-foreground">Implementation plans and future features</p>
        </div>
        
        <Tabs defaultValue="token-pool">
          <TabsList className="grid w-full grid-cols-4 mb-8">
            <TabsTrigger value="token-pool">
              <BarChart3 className="w-4 h-4 mr-2" />
              Token Pool
            </TabsTrigger>
            <TabsTrigger value="emotional-nfts">
              <Sparkles className="w-4 h-4 mr-2" />
              Emotional NFTs
            </TabsTrigger>
            <TabsTrigger value="platform">
              <Globe className="w-4 h-4 mr-2" />
              Platform
            </TabsTrigger>
            <TabsTrigger value="community">
              <Rocket className="w-4 h-4 mr-2" />
              Community
            </TabsTrigger>
          </TabsList>
          
          <TabsContent value="token-pool" className="space-y-6">
            <TokenPoolRoadmap />
          </TabsContent>
          
          <TabsContent value="emotional-nfts">
            <Card>
              <CardHeader>
                <CardTitle>Emotional NFTs Roadmap</CardTitle>
                <CardDescription>Coming soon</CardDescription>
              </CardHeader>
              <CardContent>
                <p>The roadmap for our Emotional NFTs feature is currently being developed.</p>
              </CardContent>
            </Card>
          </TabsContent>
          
          <TabsContent value="platform">
            <Card>
              <CardHeader>
                <CardTitle>Platform Roadmap</CardTitle>
                <CardDescription>Coming soon</CardDescription>
              </CardHeader>
              <CardContent>
                <p>The roadmap for our platform-wide features is currently being developed.</p>
              </CardContent>
            </Card>
          </TabsContent>
          
          <TabsContent value="community">
            <Card>
              <CardHeader>
                <CardTitle>Community Roadmap</CardTitle>
                <CardDescription>Coming soon</CardDescription>
              </CardHeader>
              <CardContent>
                <p>The roadmap for our community features is currently being developed.</p>
              </CardContent>
            </Card>
          </TabsContent>
        </Tabs>
      </div>
    </Layout>
  );
}

function TokenPoolRoadmap() {
  const phases = [
    {
      title: "Design & Planning",
      startDate: "May 1, 2025",
      endDate: "May 7, 2025",
      icon: LayoutDashboard,
      status: "completed",
      tasks: [
        { name: "Create wireframes in Figma", status: "completed" },
        { name: "Develop user flow diagrams", status: "completed" },
        { name: "Define data structures and relationships", status: "completed" },
        { name: "Conduct initial user testing with prototypes", status: "completed" },
        { name: "Iterate designs based on feedback", status: "completed" }
      ],
      tools: ["Figma", "Miro", "User Testing Platform"],
      deliverables: ["MoodSync Dashboard Wireframe", "User Flow Diagram", "Data Structure Documentation"]
    },
    {
      title: "Backend Development",
      startDate: "May 8, 2025",
      endDate: "May 14, 2025",
      icon: Database,
      status: "in-progress",
      tasks: [
        { name: "Create database schema for token pool system", status: "completed" },
        { name: "Implement token pool service layer", status: "completed" },
        { name: "Develop API endpoints for token pool interactions", status: "in-progress" },
        { name: "Implement contribution tracking logic", status: "in-progress" },
        { name: "Create token distribution algorithm", status: "pending" }
      ],
      tools: ["Node.js", "PostgreSQL", "Drizzle ORM"],
      deliverables: ["Database Schema", "API Documentation", "Token Pool Service Implementation"]
    },
    {
      title: "Realtime Features",
      startDate: "May 15, 2025",
      endDate: "May 21, 2025",
      icon: GitMerge,
      status: "pending",
      tasks: [
        { name: "Set up WebSocket server", status: "pending" },
        { name: "Implement real-time leaderboard updates", status: "pending" },
        { name: "Create real-time notification system for pool events", status: "pending" },
        { name: "Develop live pool progress tracking", status: "pending" },
        { name: "Optimize WebSocket performance", status: "pending" }
      ],
      tools: ["WebSockets", "Socket.IO", "React Query"],
      deliverables: ["WebSocket Implementation", "Real-time Leaderboard Component", "Notification System"]
    },
    {
      title: "Testing & Optimization",
      startDate: "May 22, 2025",
      endDate: "May 28, 2025",
      icon: Settings,
      status: "pending",
      tasks: [
        { name: "Test distribution algorithm with mock data", status: "pending" },
        { name: "Optimize database queries with EXPLAIN ANALYZE", status: "pending" },
        { name: "Perform load testing on WebSocket connections", status: "pending" },
        { name: "Implement database backup system to AWS S3", status: "pending" },
        { name: "Security audit of token pool system", status: "pending" }
      ],
      tools: ["Jest", "Load Testing Tools", "AWS S3", "Security Scanning Tools"],
      deliverables: ["Performance Report", "Security Audit Document", "Backup System Implementation"]
    }
  ];
  
  return (
    <div className="space-y-8">
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center">
            <BarChart3 className="w-5 h-5 mr-2 text-primary" />
            Token Pool System Roadmap
          </CardTitle>
          <CardDescription>
            Four-week implementation plan for the community token pool feature
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="space-y-1 mb-4">
            <p>
              The Token Pool System will enable users to contribute their minted NFTs to a community pool, 
              with rewards distributed to top contributors and donations made to mental health organizations.
            </p>
            <div className="flex items-center gap-4 mt-4 text-sm">
              <div className="flex items-center">
                <div className="w-3 h-3 rounded-full bg-green-500 mr-1.5"></div>
                <span>Completed</span>
              </div>
              <div className="flex items-center">
                <div className="w-3 h-3 rounded-full bg-amber-500 mr-1.5"></div>
                <span>In Progress</span>
              </div>
              <div className="flex items-center">
                <div className="w-3 h-3 rounded-full bg-muted mr-1.5"></div>
                <span>Pending</span>
              </div>
            </div>
          </div>
          
          <div className="space-y-6">
            {phases.map((phase, index) => (
              <PhaseCard 
                key={index} 
                phase={phase} 
                index={index}
                isLast={index === phases.length - 1}
              />
            ))}
          </div>
        </CardContent>
      </Card>
      
      <Card>
        <CardHeader>
          <CardTitle>Tools & Resources</CardTitle>
          <CardDescription>Resources used in the implementation process</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="grid md:grid-cols-3 gap-4">
            <div className="border rounded-lg p-4">
              <h3 className="font-medium mb-2 flex items-center">
                <FileText className="w-4 h-4 mr-2 text-blue-500" />
                Design Resources
              </h3>
              <ul className="space-y-2 text-sm text-muted-foreground">
                <li className="flex items-center">
                  <span className="bg-blue-100 text-blue-800 text-xs font-medium me-2 px-2.5 py-0.5 rounded dark:bg-blue-900 dark:text-blue-300">Figma</span>
                  MoodSync Dashboard Template
                </li>
                <li className="flex items-center">
                  <span className="bg-blue-100 text-blue-800 text-xs font-medium me-2 px-2.5 py-0.5 rounded dark:bg-blue-900 dark:text-blue-300">Figma</span>
                  User Flow Diagrams
                </li>
                <li className="flex items-center">
                  <span className="bg-blue-100 text-blue-800 text-xs font-medium me-2 px-2.5 py-0.5 rounded dark:bg-blue-900 dark:text-blue-300">Miro</span>
                  Token Pool System Map
                </li>
              </ul>
            </div>
            
            <div className="border rounded-lg p-4">
              <h3 className="font-medium mb-2 flex items-center">
                <Code2 className="w-4 h-4 mr-2 text-indigo-500" />
                Development Tools
              </h3>
              <ul className="space-y-2 text-sm text-muted-foreground">
                <li className="flex items-center">
                  <span className="bg-indigo-100 text-indigo-800 text-xs font-medium me-2 px-2.5 py-0.5 rounded dark:bg-indigo-900 dark:text-indigo-300">SQL</span>
                  EXPLAIN ANALYZE for query tuning
                </li>
                <li className="flex items-center">
                  <span className="bg-indigo-100 text-indigo-800 text-xs font-medium me-2 px-2.5 py-0.5 rounded dark:bg-indigo-900 dark:text-indigo-300">React</span>
                  TanStack Query for data fetching
                </li>
                <li className="flex items-center">
                  <span className="bg-indigo-100 text-indigo-800 text-xs font-medium me-2 px-2.5 py-0.5 rounded dark:bg-indigo-900 dark:text-indigo-300">WebSockets</span>
                  Real-time data streaming
                </li>
              </ul>
            </div>
            
            <div className="border rounded-lg p-4">
              <h3 className="font-medium mb-2 flex items-center">
                <Calendar className="w-4 h-4 mr-2 text-violet-500" />
                Project Management
              </h3>
              <ul className="space-y-2 text-sm text-muted-foreground">
                <li className="flex items-center">
                  <span className="bg-violet-100 text-violet-800 text-xs font-medium me-2 px-2.5 py-0.5 rounded dark:bg-violet-900 dark:text-violet-300">AWS</span>
                  S3 Backup System
                </li>
                <li className="flex items-center">
                  <span className="bg-violet-100 text-violet-800 text-xs font-medium me-2 px-2.5 py-0.5 rounded dark:bg-violet-900 dark:text-violet-300">Testing</span>
                  User Testing Platform
                </li>
                <li className="flex items-center">
                  <span className="bg-violet-100 text-violet-800 text-xs font-medium me-2 px-2.5 py-0.5 rounded dark:bg-violet-900 dark:text-violet-300">CI/CD</span>
                  Automated deployment pipeline
                </li>
              </ul>
            </div>
          </div>
        </CardContent>
      </Card>
      
      <div className="text-center">
        <p className="text-muted-foreground mb-4">
          Want to learn more about the token pool system?
        </p>
        <div className="flex flex-wrap justify-center gap-4">
          <Button variant="default" asChild className="gap-2 bg-gradient-to-r from-primary to-primary/80 hover:from-primary/90 hover:to-primary/70">
            <Link to="/token-pool-info">
              <BarChart3 className="w-4 h-4" />
              Token Pool Info
            </Link>
          </Button>
          <Button variant="outline" asChild className="gap-2">
            <Link to="/nft-collection">
              <Sparkles className="w-4 h-4" />
              NFT Collection
            </Link>
          </Button>
        </div>
      </div>
    </div>
  );
}

type PhaseProps = {
  phase: {
    title: string;
    startDate: string;
    endDate: string;
    icon: LucideIcon;
    status: "completed" | "in-progress" | "pending";
    tasks: { name: string; status: "completed" | "in-progress" | "pending" }[];
    tools: string[];
    deliverables: string[];
  };
  index: number;
  isLast: boolean;
};

function PhaseCard({ phase, index, isLast }: PhaseProps) {
  // Status colors
  const statusColors = {
    "completed": "bg-green-500",
    "in-progress": "bg-amber-500",
    "pending": "bg-muted"
  };
  
  const taskStatusIcons = {
    "completed": <CheckCircle2 className="h-4 w-4 text-green-500" />,
    "in-progress": <ArrowRight className="h-4 w-4 text-amber-500" />,
    "pending": <Circle className="h-4 w-4 text-muted-foreground" />
  };
  
  const Icon = phase.icon;
  
  return (
    <div className="relative">
      {!isLast && (
        <div className={`absolute top-12 bottom-0 left-[39px] w-0.5 ${statusColors[phase.status]}`}></div>
      )}
      
      <div className="flex items-start gap-4">
        <div className={`relative z-10 mt-1.5 flex h-10 w-10 shrink-0 items-center justify-center rounded-full ${statusColors[phase.status]}`}>
          <Icon className="h-5 w-5 text-white" />
        </div>
        
        <div className="flex-1">
          <div className="flex flex-wrap items-center justify-between gap-2">
            <div>
              <h3 className="text-lg font-semibold">Phase {index + 1}: {phase.title}</h3>
              <p className="text-sm text-muted-foreground">{phase.startDate} - {phase.endDate}</p>
            </div>
            <div className="flex items-center">
              <span className={`inline-flex items-center rounded-full px-2.5 py-0.5 text-xs font-medium
                ${phase.status === 'completed' ? 'bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-300' : 
                  phase.status === 'in-progress' ? 'bg-amber-100 text-amber-800 dark:bg-amber-900 dark:text-amber-300' : 
                  'bg-gray-100 text-gray-800 dark:bg-gray-700 dark:text-gray-300'}`
              }>
                {phase.status === 'completed' ? 'Completed' : 
                  phase.status === 'in-progress' ? 'In Progress' : 'Pending'}
              </span>
            </div>
          </div>
          
          <div className="mt-4 grid md:grid-cols-7 gap-4">
            <div className="md:col-span-4 space-y-3">
              <h4 className="text-sm font-medium">Tasks</h4>
              <ul className="space-y-2">
                {phase.tasks.map((task, i) => (
                  <li key={i} className="flex items-center text-sm">
                    <span className="mr-2">{taskStatusIcons[task.status]}</span>
                    {task.name}
                  </li>
                ))}
              </ul>
            </div>
            
            <div className="md:col-span-3 space-y-4">
              <div>
                <h4 className="text-sm font-medium mb-2">Tools</h4>
                <div className="flex flex-wrap gap-1.5">
                  {phase.tools.map((tool, i) => (
                    <span 
                      key={i}
                      className="inline-flex items-center rounded-md bg-muted px-2 py-1 text-xs font-medium"
                    >
                      {tool}
                    </span>
                  ))}
                </div>
              </div>
              
              <div>
                <h4 className="text-sm font-medium mb-2">Deliverables</h4>
                <ul className="space-y-1">
                  {phase.deliverables.map((deliverable, i) => (
                    <li key={i} className="text-sm text-muted-foreground">• {deliverable}</li>
                  ))}
                </ul>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}