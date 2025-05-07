import Header from '@/components/header';
import { ArrowLeft } from 'lucide-react';
import { useLocation } from 'wouter';
import { Button } from '@/components/ui/button';

interface MainLayoutProps {
  children: React.ReactNode;
  showBackButton?: boolean;
  title?: string;
}

export default function MainLayout({ children, showBackButton = false, title }: MainLayoutProps) {
  const [_, navigate] = useLocation();

  const handleBack = () => {
    window.history.back();
  };

  return (
    <div className="flex flex-col min-h-screen">
      <Header />
      
      {(showBackButton || title) && (
        <div className="container max-w-7xl px-4 pt-4 flex items-center">
          {showBackButton && (
            <Button 
              variant="ghost" 
              size="sm" 
              onClick={handleBack}
              className="mr-4 flex items-center gap-1 hover:bg-gray-100 dark:hover:bg-gray-800"
            >
              <ArrowLeft className="h-4 w-4" />
              <span>Back</span>
            </Button>
          )}
          
          {title && <h1 className="text-2xl font-bold">{title}</h1>}
        </div>
      )}
      
      <main className="flex-grow">
        {children}
      </main>
    </div>
  );
}