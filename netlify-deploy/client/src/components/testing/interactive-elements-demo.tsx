import React, { useState } from 'react';
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from '@/components/ui/card';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { InteractiveButton } from '@/components/ui/interactive-button';
import { InteractiveToggle } from '@/components/ui/interactive-toggle';
import { Label } from '@/components/ui/label';
import { useInteractiveState } from '@/hooks/use-interactive-state';
import { Button } from '@/components/ui/button';
import { useForm } from 'react-hook-form';
import { useFormSubmission } from '@/hooks/use-form-submission';
import { Input } from '@/components/ui/input';
import { Form, FormControl, FormDescription, FormField, FormItem, FormLabel, FormMessage } from '@/components/ui/form';
import { z } from 'zod';
import { zodResolver } from '@hookform/resolvers/zod';

// Mock form schema
const formSchema = z.object({
  name: z.string().min(2, { message: "Name must be at least 2 characters." }),
  email: z.string().email({ message: "Please enter a valid email address." }),
});

function InteractiveElementsDemo() {
  // Interactive button demo
  const handleButtonClick = async () => {
    // Simulate API call
    await new Promise(resolve => setTimeout(resolve, 2000));
    return { success: true };
  };
  
  const handleFailingButtonClick = async () => {
    // Simulate API call failure
    await new Promise(resolve => setTimeout(resolve, 2000));
    throw new Error("API call failed");
  };
  
  // Interactive toggle demo
  const handleToggleChange = async (checked: boolean) => {
    // Simulate API call
    await new Promise(resolve => setTimeout(resolve, 2000));
    console.log('Toggle changed to:', checked);
  };
  
  const handleFailingToggleChange = async (checked: boolean) => {
    // Simulate API call failure
    await new Promise(resolve => setTimeout(resolve, 2000));
    throw new Error("Toggle API call failed");
  };
  
  // Interactive state demo
  const {
    value: counterValue,
    setValue: setCounterValue,
    isLoading: isCounterLoading,
  } = useInteractiveState({
    initialValue: 0,
    onUpdate: async (newValue) => {
      // Simulate API call
      await new Promise(resolve => setTimeout(resolve, 2000));
      return newValue;
    },
    successMessage: "Counter updated successfully!",
  });
  
  // Form submission demo
  const form = useForm({
    resolver: zodResolver(formSchema),
    defaultValues: {
      name: "",
      email: "",
    },
  });
  
  const { handleSubmit, isSubmitting } = useFormSubmission({
    form,
    onSubmit: async (data) => {
      // Simulate API call
      await new Promise(resolve => setTimeout(resolve, 2000));
      console.log('Form submitted:', data);
      return data;
    },
    successMessage: "Form submitted successfully!",
    errorMessage: "Could not submit form. Please try again.",
  });
  
  return (
    <div className="container mx-auto py-8">
      <h1 className="text-4xl font-bold mb-8">Interactive Elements Demo</h1>
      
      <Tabs defaultValue="buttons" className="mb-8">
        <TabsList className="mb-4">
          <TabsTrigger value="buttons">Buttons</TabsTrigger>
          <TabsTrigger value="toggles">Toggles</TabsTrigger>
          <TabsTrigger value="state">State</TabsTrigger>
          <TabsTrigger value="forms">Forms</TabsTrigger>
        </TabsList>
        
        {/* Interactive Buttons */}
        <TabsContent value="buttons">
          <Card>
            <CardHeader>
              <CardTitle>Interactive Buttons</CardTitle>
              <CardDescription>
                Buttons with built-in loading states, success animations, error handling, and retry functionality.
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div>
                <InteractiveButton
                  onClick={handleButtonClick}
                  loadingMessage="Processing..."
                  successMessage="Action completed successfully!"
                  className="mb-4"
                >
                  Regular Button (Success)
                </InteractiveButton>
              </div>
              
              <div>
                <InteractiveButton
                  onClick={handleFailingButtonClick}
                  loadingMessage="Processing..."
                  errorMessage="Action failed. Retrying..."
                  autoRetry={true}
                  retryCount={2}
                  variant="destructive"
                >
                  Failing Button with Auto-Retry
                </InteractiveButton>
              </div>
            </CardContent>
          </Card>
        </TabsContent>
        
        {/* Interactive Toggles */}
        <TabsContent value="toggles">
          <Card>
            <CardHeader>
              <CardTitle>Interactive Toggles</CardTitle>
              <CardDescription>
                Toggle components with built-in loading states, success/error animations, and retry functionality.
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-6">
              <div className="flex items-center justify-between">
                <Label htmlFor="toggle1">Regular Toggle</Label>
                <InteractiveToggle
                  defaultChecked={false}
                  onCheckedChange={handleToggleChange}
                  successMessage="Setting updated!"
                />
              </div>
              
              <div className="flex items-center justify-between">
                <Label htmlFor="toggle2">Failing Toggle</Label>
                <InteractiveToggle
                  defaultChecked={false}
                  onCheckedChange={handleFailingToggleChange}
                  errorMessage="Could not update setting"
                  autoRetry={true}
                  retryCount={1}
                />
              </div>
              
              <div className="flex items-center justify-between">
                <Label htmlFor="toggle3">Button-style Toggle</Label>
                <InteractiveToggle
                  component="toggle"
                  defaultChecked={false}
                  onCheckedChange={handleToggleChange}
                  successMessage="Mode changed!"
                >
                  Dark Mode
                </InteractiveToggle>
              </div>
            </CardContent>
          </Card>
        </TabsContent>
        
        {/* Interactive State */}
        <TabsContent value="state">
          <Card>
            <CardHeader>
              <CardTitle>Interactive State</CardTitle>
              <CardDescription>
                State management with asynchronous updates, loading indicators, and error handling.
              </CardDescription>
            </CardHeader>
            <CardContent>
              <div className="flex items-center gap-4">
                <Button
                  onClick={() => setCounterValue(counterValue - 1)}
                  disabled={isCounterLoading}
                  variant="outline"
                >
                  -
                </Button>
                
                <span className="text-2xl font-bold">
                  {isCounterLoading ? '...' : counterValue}
                </span>
                
                <Button
                  onClick={() => setCounterValue(counterValue + 1)}
                  disabled={isCounterLoading}
                  variant="outline"
                >
                  +
                </Button>
              </div>
            </CardContent>
          </Card>
        </TabsContent>
        
        {/* Form Submission */}
        <TabsContent value="forms">
          <Card>
            <CardHeader>
              <CardTitle>Form Submission</CardTitle>
              <CardDescription>
                Form handling with validation, loading states, and error handling.
              </CardDescription>
            </CardHeader>
            <CardContent>
              <Form {...form}>
                <form onSubmit={handleSubmit} className="space-y-4">
                  <FormField
                    control={form.control}
                    name="name"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Name</FormLabel>
                        <FormControl>
                          <Input placeholder="John Doe" {...field} />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                  
                  <FormField
                    control={form.control}
                    name="email"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Email</FormLabel>
                        <FormControl>
                          <Input placeholder="john@example.com" {...field} />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                  
                  <InteractiveButton
                    type="submit"
                    disabled={isSubmitting}
                    loadingMessage="Submitting form..."
                  >
                    Submit
                  </InteractiveButton>
                </form>
              </Form>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  );
}

export default InteractiveElementsDemo;