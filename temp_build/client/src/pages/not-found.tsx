import { Card, CardContent, CardFooter } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { AlertCircle, Home, ArrowLeft } from "lucide-react";
import { Link, useLocation } from "wouter";
import { useEffect } from "react";

export default function NotFound() {
  const [, setLocation] = useLocation();

  // Log the 404 for debugging purposes
  useEffect(() => {
    console.log(`404 - Page not found: ${window.location.pathname}`);
  }, []);

  // Go back to the previous page
  const goBack = () => {
    window.history.back();
  };

  // Go to home page
  const goHome = () => {
    setLocation("/");
  };

  return (
    <div className="min-h-screen w-full flex items-center justify-center bg-muted/20 dark:bg-muted/5">
      <Card className="w-full max-w-md mx-4 shadow-lg border-muted">
        <CardContent className="pt-6">
          <div className="flex flex-col items-center text-center mb-6">
            <AlertCircle className="h-16 w-16 text-destructive mb-4" />
            <h1 className="text-3xl font-bold text-foreground">Page Not Found</h1>
            <p className="mt-2 text-muted-foreground">
              Looks like you've followed a broken link or entered a URL that doesn't exist on this site.
            </p>
          </div>
        </CardContent>
        <CardFooter className="flex justify-between gap-4">
          <Button 
            variant="outline" 
            className="flex-1 gap-2" 
            onClick={goBack}>
            <ArrowLeft className="h-4 w-4" />
            Go Back
          </Button>
          <Button 
            className="flex-1 gap-2" 
            onClick={goHome}>
            <Home className="h-4 w-4" />
            Home
          </Button>
        </CardFooter>
      </Card>
    </div>
  );
}
