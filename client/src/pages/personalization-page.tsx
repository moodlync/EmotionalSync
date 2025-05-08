import { useAuth } from "@/hooks/use-auth";
import { CustomMoodTags } from "@/components/personalization/custom-mood-tags";
import { WeeklyMoodReports } from "@/components/insights/weekly-mood-reports";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Loader2 } from "lucide-react";
import { Redirect } from "wouter";
import { 
  PageHeader, 
  PageHeaderDescription, 
  PageHeaderHeading
} from "@/components/page-header";

export default function PersonalizationPage() {
  const { user, isLoading } = useAuth();

  if (isLoading) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <Loader2 className="h-8 w-8 animate-spin text-border" />
      </div>
    );
  }

  if (!user) {
    return <Redirect to="/auth" />;
  }

  return (
    <div className="container mx-auto py-6 space-y-8">
      <PageHeader>
        <PageHeaderHeading>Personalization & Insights</PageHeaderHeading>
        <PageHeaderDescription>
          Customize your experience and gain insights into your emotional journey
        </PageHeaderDescription>
      </PageHeader>

      <Tabs defaultValue="personalization" className="w-full">
        <TabsList className="w-full justify-start mb-6">
          <TabsTrigger value="personalization">Personalization</TabsTrigger>
          <TabsTrigger value="insights">Insights & Reports</TabsTrigger>
        </TabsList>
        
        <TabsContent value="personalization" className="space-y-6">
          <CustomMoodTags />
          {/* Other personalization components can be added here */}
        </TabsContent>
        
        <TabsContent value="insights" className="space-y-6">
          <WeeklyMoodReports />
          {/* Other insights components can be added here */}
        </TabsContent>
      </Tabs>
    </div>
  );
}