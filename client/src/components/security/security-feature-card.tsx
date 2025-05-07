import React from 'react';
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { LucideIcon } from 'lucide-react';

interface SecurityFeatureCardProps {
  title: string;
  description: string;
  icon: LucideIcon;
  status: 'active' | 'inactive' | 'premium';
  action?: () => void;
  actionLabel?: string;
  secondaryAction?: () => void;
  secondaryActionLabel?: string;
}

export default function SecurityFeatureCard({
  title,
  description,
  icon: Icon,
  status,
  action,
  actionLabel = 'Enable',
  secondaryAction,
  secondaryActionLabel = 'Learn More'
}: SecurityFeatureCardProps) {
  return (
    <Card className="border overflow-hidden transition-all duration-300 hover:shadow-md">
      <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
        <div className="flex items-center space-x-3">
          <div className={`rounded-full p-2 ${
            status === 'active' ? 'bg-green-100 text-green-700' : 
            status === 'premium' ? 'bg-amber-100 text-amber-700' : 
            'bg-gray-100 text-gray-700'
          }`}>
            <Icon className="h-5 w-5" />
          </div>
          <CardTitle className="text-xl">{title}</CardTitle>
        </div>
        <Badge variant={
            status === 'active' ? 'default' : 
            status === 'premium' ? 'outline' : 
            'secondary'
          }
          className={
            status === 'active' ? 'bg-green-600' : 
            status === 'premium' ? 'border-amber-500 text-amber-600' : 
            'bg-gray-200 text-gray-600'
          }
        >
          {status === 'active' ? 'Active' : 
           status === 'premium' ? 'Premium' : 
           'Inactive'}
        </Badge>
      </CardHeader>
      <CardContent>
        <CardDescription className="text-base pt-2 min-h-[60px]">{description}</CardDescription>
      </CardContent>
      <CardFooter className="flex justify-between">
        {action && (
          <Button 
            onClick={action}
            variant={status === 'premium' ? 'outline' : 'default'}
            disabled={status === 'premium'}
          >
            {status === 'premium' ? 'Premium Feature' : actionLabel}
          </Button>
        )}
        {secondaryAction && (
          <Button 
            onClick={secondaryAction} 
            variant="ghost"
          >
            {secondaryActionLabel}
          </Button>
        )}
      </CardFooter>
    </Card>
  );
}