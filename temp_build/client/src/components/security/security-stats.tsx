import React from 'react';
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Shield, Lock, AlertTriangle, Activity } from 'lucide-react';

interface SecurityStatsProps {
  activeFeatures: number;
  securityScore: number;
  vulnerabilities: number;
  lastAudit: string;
}

export default function SecurityStats({ 
  activeFeatures, 
  securityScore, 
  vulnerabilities, 
  lastAudit 
}: SecurityStatsProps) {
  // Determine security score color
  const getScoreColor = (score: number) => {
    if (score >= 80) return 'text-green-500';
    if (score >= 60) return 'text-amber-500';
    return 'text-red-500';
  };

  return (
    <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
      <Card>
        <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
          <CardTitle className="text-sm font-medium">
            Active Security Features
          </CardTitle>
          <Shield className="h-4 w-4 text-blue-600" />
        </CardHeader>
        <CardContent>
          <div className="text-2xl font-bold">{activeFeatures}</div>
        </CardContent>
      </Card>
      
      <Card>
        <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
          <CardTitle className="text-sm font-medium">
            Security Score
          </CardTitle>
          <Lock className="h-4 w-4 text-indigo-600" />
        </CardHeader>
        <CardContent>
          <div className={`text-2xl font-bold ${getScoreColor(securityScore)}`}>
            {securityScore}%
          </div>
        </CardContent>
      </Card>
      
      <Card>
        <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
          <CardTitle className="text-sm font-medium">
            Detected Vulnerabilities
          </CardTitle>
          <AlertTriangle className="h-4 w-4 text-orange-500" />
        </CardHeader>
        <CardContent>
          <div className={`text-2xl font-bold ${vulnerabilities > 0 ? 'text-red-500' : 'text-green-500'}`}>
            {vulnerabilities}
          </div>
        </CardContent>
      </Card>
      
      <Card>
        <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
          <CardTitle className="text-sm font-medium">
            Last Security Audit
          </CardTitle>
          <Activity className="h-4 w-4 text-teal-600" />
        </CardHeader>
        <CardContent>
          <div className="text-2xl font-medium">
            {lastAudit}
          </div>
        </CardContent>
      </Card>
    </div>
  );
}