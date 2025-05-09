import React from 'react';
import { useAuth } from '@/hooks/use-auth';
import { ComplianceCenter } from '@/components/compliance/compliance-center';
import { Button } from '@/components/ui/button';
import { Card } from '@/components/ui/card';
import { FileText, Shield, Lock, Scale, Download, PieChart } from 'lucide-react';
import { useToast } from '@/hooks/use-toast';

export default function CompliancePage() {
  const { user } = useAuth();
  const { toast } = useToast();
  
  const handleDataExport = () => {
    if (!user) {
      toast({
        title: "Authentication Required",
        description: "Please log in to export your data.",
        variant: "destructive",
      });
      return;
    }
    
    toast({
      title: "Data Export Requested",
      description: "Your data export has been initiated. You will receive an email with download instructions shortly.",
    });
    
    // In a real implementation, this would call an API endpoint
    // to initiate the data export process
  };

  const additionalResources = [
    {
      title: "Data Subject Rights",
      description: "Learn about your rights under GDPR, CCPA, and other privacy regulations and how to exercise them.",
      icon: <Shield className="h-8 w-8 text-purple-600" />,
      action: () => {}
    },
    {
      title: "Data Protection Reports",
      description: "View our transparency reports on government requests, data breaches, and other privacy metrics.",
      icon: <PieChart className="h-8 w-8 text-blue-600" />,
      action: () => {}
    },
    {
      title: "Export Your Data",
      description: "Download a copy of all your personal data that we have collected in a machine-readable format.",
      icon: <Download className="h-8 w-8 text-green-600" />,
      action: handleDataExport
    },
    {
      title: "Security Standards",
      description: "Details about our security practices, certifications, and compliance with industry standards.",
      icon: <Lock className="h-8 w-8 text-amber-600" />,
      action: () => {}
    },
  ];

  return (
    <div className="container mx-auto px-4 py-8 space-y-10">
      <div className="text-center space-y-4 mb-8">
        <div className="inline-flex items-center justify-center p-2 bg-primary/10 rounded-full mb-4">
          <Scale className="h-6 w-6 text-primary" />
        </div>
        <h1 className="text-4xl font-bold">Legal & Compliance</h1>
        <p className="text-gray-600 max-w-2xl mx-auto">
          Our commitment to transparency, data protection, and legal compliance. Review our policies 
          and learn how we protect your personal information.
        </p>
      </div>
      
      <ComplianceCenter 
        companyName="MoodSync" 
        lastUpdated="May 1, 2025" 
      />
      
      <div className="mt-12">
        <h2 className="text-2xl font-bold mb-6 text-center">Additional Resources</h2>
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
          {additionalResources.map((resource, index) => (
            <Card key={index} className="p-6 hover:shadow-md transition-shadow">
              <div className="flex flex-col items-center text-center space-y-4">
                <div className="rounded-full bg-gray-100 p-4">
                  {resource.icon}
                </div>
                <h3 className="text-lg font-semibold">{resource.title}</h3>
                <p className="text-gray-600 text-sm">{resource.description}</p>
                <Button 
                  variant="outline" 
                  className="mt-4 w-full"
                  onClick={resource.action}
                >
                  View Details
                </Button>
              </div>
            </Card>
          ))}
        </div>
      </div>
      
      <div className="mt-20 border-t pt-10">
        <h2 className="text-2xl font-bold mb-6 text-center">Contact Information</h2>
        <div className="max-w-2xl mx-auto text-center">
          <p className="mb-4">
            For questions about our privacy practices, data collection, or to exercise your rights:
          </p>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6 text-left">
            <div className="bg-gray-50 p-6 rounded-lg">
              <h3 className="font-semibold mb-2">Data Protection Officer</h3>
              <p className="text-sm text-gray-600">Email: dpo@moodsync.com</p>
              <p className="text-sm text-gray-600">Phone: +1 (555) 123-4567</p>
            </div>
            <div className="bg-gray-50 p-6 rounded-lg">
              <h3 className="font-semibold mb-2">Legal Department</h3>
              <p className="text-sm text-gray-600">Email: legal@moodsync.com</p>
              <p className="text-sm text-gray-600">MoodSync Inc., 123 Emotion Street, San Francisco, CA 94103</p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}