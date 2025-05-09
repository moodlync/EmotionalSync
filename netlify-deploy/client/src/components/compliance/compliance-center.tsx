import React, { useState } from 'react';
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Card, CardHeader, CardTitle, CardDescription, CardContent } from "@/components/ui/card";
import { Shield, FileText, FileCheck, Scale, Bell, Lock, Cookie, FileInput } from 'lucide-react';
import PrivacyPolicy from './privacy-policy';
import TermsOfService from './terms-of-service';
import DataProcessingAgreement from './data-processing-agreement';
import CookiePolicy from './cookie-policy';
import DataSubjectRequestForm from './data-subject-request-form';

interface ComplianceCenterProps {
  companyName?: string;
  lastUpdated?: string;
}

export function ComplianceCenter({ 
  companyName = 'MoodSync',
  lastUpdated = new Date().toLocaleDateString()
}: ComplianceCenterProps) {
  const [activeTab, setActiveTab] = useState('privacy-policy');

  return (
    <div className="w-full max-w-6xl mx-auto p-4 space-y-8">
      <Card className="border-0 bg-gradient-to-r from-purple-50 to-indigo-50">
        <CardHeader className="pb-4">
          <div className="flex items-center gap-2 mb-2">
            <Shield className="h-6 w-6 text-primary" />
            <CardTitle className="text-2xl">Compliance Center</CardTitle>
          </div>
          <CardDescription>
            Review our legal documents and privacy commitments. We're committed to transparency and data protection.
          </CardDescription>
        </CardHeader>
        <CardContent>
          <Tabs value={activeTab} onValueChange={setActiveTab} className="w-full">
            <TabsList className="grid grid-cols-5 mb-8">
              <TabsTrigger value="privacy-policy" className="flex items-center gap-2">
                <Lock className="h-4 w-4" />
                <span className="hidden sm:inline">Privacy Policy</span>
                <span className="sm:hidden">Privacy</span>
              </TabsTrigger>
              
              <TabsTrigger value="terms-of-service" className="flex items-center gap-2">
                <FileText className="h-4 w-4" />
                <span className="hidden sm:inline">Terms of Service</span>
                <span className="sm:hidden">Terms</span>
              </TabsTrigger>
              
              <TabsTrigger value="cookie-policy" className="flex items-center gap-2">
                <Cookie className="h-4 w-4" />
                <span className="hidden sm:inline">Cookie Policy</span>
                <span className="sm:hidden">Cookies</span>
              </TabsTrigger>
              
              <TabsTrigger value="data-processing" className="flex items-center gap-2">
                <FileCheck className="h-4 w-4" />
                <span className="hidden sm:inline">Data Processing</span>
                <span className="sm:hidden">Processing</span>
              </TabsTrigger>
              
              <TabsTrigger value="data-request" className="flex items-center gap-2">
                <FileInput className="h-4 w-4" />
                <span className="hidden sm:inline">Data Request</span>
                <span className="sm:hidden">Request</span>
              </TabsTrigger>
            </TabsList>
            
            <TabsContent value="privacy-policy" className="mt-0">
              <PrivacyPolicy companyName={companyName} lastUpdated={lastUpdated} />
            </TabsContent>
            
            <TabsContent value="terms-of-service" className="mt-0">
              <TermsOfService companyName={companyName} lastUpdated={lastUpdated} />
            </TabsContent>
            
            <TabsContent value="cookie-policy" className="mt-0">
              <CookiePolicy companyName={companyName} lastUpdated={lastUpdated} />
            </TabsContent>
            
            <TabsContent value="data-processing" className="mt-0">
              <DataProcessingAgreement 
                companyName={companyName} 
                processorName="Your Data Processor" 
                lastUpdated={lastUpdated} 
              />
            </TabsContent>
            
            <TabsContent value="data-request" className="mt-0">
              <DataSubjectRequestForm companyName={companyName} />
            </TabsContent>
          </Tabs>
        </CardContent>
      </Card>
    </div>
  );
}

export default ComplianceCenter;