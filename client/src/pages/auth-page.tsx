import { useState, useEffect, lazy } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import { useAuth } from "@/hooks/use-auth";
import { insertUserSchema, GenderType } from "@shared/schema";
import { useLocation } from "wouter";
import { Button } from "@/components/ui/button";
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage, FormDescription } from "@/components/ui/form";
import { Input } from "@/components/ui/input";
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { useToast } from "@/hooks/use-toast";
import { 
  Loader2, Heart, Eye, EyeOff, Info, ArrowRight, Brain, Shield, Star, AlertCircle, AlertTriangle,
  Sparkles, MapPin, MessageCircle, Users, Gamepad, BarChart3, Crown, Bot, CheckCircle
} from "lucide-react";
import DynamicLogoWithText from "@/components/logo/dynamic-logo-with-text";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Badge } from "@/components/ui/badge";
import authImage from "@/assets/auth-hero.jpeg";
import logoImage from '@/assets/moodlync-logo.png';
import { StaticProductDialog } from '@/components/learn-more/detailed-product-description';

// Lazy load product descriptions for better performance
const EmotionMatchingDescription = lazy(() => import('@/components/learn-more/product-descriptions').then(mod => ({ default: mod.EmotionMatchingDescription })));
const EmotionalJournalDescription = lazy(() => import('@/components/learn-more/product-descriptions').then(mod => ({ default: mod.EmotionalJournalDescription })));
const EmotionalNFTsDescription = lazy(() => import('@/components/learn-more/product-descriptions').then(mod => ({ default: mod.EmotionalNFTsDescription })));
const TokenRewardsDescription = lazy(() => import('@/components/learn-more/product-descriptions').then(mod => ({ default: mod.TokenRewardsDescription })));

// Helper to determine if we're in development mode
const isDevelopment = import.meta.env.MODE === 'development';

const loginSchema = z.object({
  username: z.string().min(3, "Username must be at least 3 characters"),
  password: z.string().min(6, "Password must be at least 6 characters"),
});

const registerSchema = insertUserSchema.extend({
  firstName: z.string().min(1, "First name is required"),
  middleName: z.string().optional(),
  lastName: z.string().min(1, "Last name is required"),
  gender: z.enum(["male", "female", "non_binary", "other", "prefer_not_to_say"] as const),
  state: z.string().min(1, "State is required"),
  country: z.string().min(1, "Country is required"),
  email: z.string().email("Please enter a valid email address"),
  username: z.string().min(3, "Username must be at least 3 characters"),
  password: z.string().min(6, "Password must be at least 6 characters"),
  confirmPassword: z.string(),
}).refine(data => data.password === data.confirmPassword, {
  message: "Passwords don't match",
  path: ["confirmPassword"],
});

export default function AuthPage() {
  const [activeTab, setActiveTab] = useState<string>("login");
  const { user, loginMutation, registerMutation, isLoading } = useAuth();
  const { toast } = useToast();
  const [location, navigate] = useLocation();
  const [userGender, setUserGender] = useState<GenderType | null>(null);
  const [showDevPanel, setShowDevPanel] = useState<boolean>(false);

  // Keyboard shortcut handler for developer access (Ctrl+Alt+D)
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      // Only works in development mode
      if (isDevelopment && e.ctrlKey && e.altKey && e.code === 'KeyD') {
        setShowDevPanel(prev => !prev);
      }
    };

    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, []);

  // Redirect if user is already logged in
  useEffect(() => {
    if (user) {
      // Check if there's a redirect path stored in sessionStorage
      const redirectPath = sessionStorage.getItem('redirectAfterAuth');
      if (redirectPath) {
        // Clear the redirect path
        sessionStorage.removeItem('redirectAfterAuth');
        // Redirect to the stored path
        navigate(redirectPath);
      } else {
        // Default redirect to home page
        navigate("/");
      }
    }
  }, [user, navigate]);

  // Login form
  const loginForm = useForm<z.infer<typeof loginSchema>>({
    resolver: zodResolver(loginSchema),
    defaultValues: {
      username: "",
      password: "",
    },
  });

  // Register form
  const registerForm = useForm<z.infer<typeof registerSchema>>({
    resolver: zodResolver(registerSchema),
    defaultValues: {
      firstName: "",
      middleName: "",
      lastName: "",
      gender: "prefer_not_to_say" as GenderType,
      state: "",
      country: "",
      email: "",
      username: "",
      password: "",
      confirmPassword: "",
    },
  });

  // Handle gender selection
  useEffect(() => {
    const subscription = registerForm.watch((value, { name }) => {
      if (name === "gender") {
        setUserGender(value.gender as GenderType);
      }
    });
    return () => subscription.unsubscribe();
  }, [registerForm]);

  const onLoginSubmit = (values: z.infer<typeof loginSchema>) => {
    loginMutation.mutate(values);
  };

  const onRegisterSubmit = async (values: z.infer<typeof registerSchema>) => {
    try {
      // First, check if there are any validation errors in the form
      const formErrors = registerForm.formState.errors;
      if (Object.keys(formErrors).length > 0) {
        console.log("Form has validation errors:", formErrors);
        return; // Don't submit if there are validation errors
      }

      // Remove confirmPassword as it's not part of the API schema
      const { confirmPassword, ...registerData } = values;
      
      // Additional email format validation
      if (registerData.email) {
        // More comprehensive email validation
        const emailRegex = /^[a-zA-Z0-9._%+-]+@[a-zA-Z0-9.-]+\.[a-zA-Z]{2,}$/;
        if (!emailRegex.test(registerData.email)) {
          registerForm.setError('email', { 
            type: 'manual',
            message: 'Please enter a valid email address'
          });
          return;
        }
      }
      
      // Check network connection
      if (!navigator.onLine) {
        const errorMessage = "You appear to be offline. Please check your internet connection and try again.";
        registerForm.setError('root', {
          type: 'manual',
          message: errorMessage
        });
        
        // Also show a toast for better visibility
        toast({
          title: "Connection Error",
          description: errorMessage,
          variant: "destructive",
        });
        return;
      }
      
      // Password strength validation (could be expanded)
      if (registerData.password) {
        if (registerData.password.length < 8) {
          registerForm.setError('password', { 
            type: 'manual',
            message: 'Password should be at least 8 characters long for better security'
          });
          return;
        }
      }
      
      // Username validation (no spaces, special characters)
      if (registerData.username) {
        const usernameRegex = /^[a-zA-Z0-9_-]+$/;
        if (!usernameRegex.test(registerData.username)) {
          registerForm.setError('username', { 
            type: 'manual',
            message: 'Username can only contain letters, numbers, underscores and hyphens'
          });
          return;
        }
      }
      
      // Add detailed logs for debugging
      console.log("Registration form data being submitted:", {
        ...registerData,
        password: registerData.password ? '********' : undefined // Don't log actual password
      });
      
      // Create a loading message
      toast({
        title: "Creating your account",
        description: "Please wait while we set up your MoodSync experience...",
      });
      
      // The IP address will be captured on the server
      registerMutation.mutate(registerData, {
        onError: (error) => {
          // Handle registration errors by setting form field errors
          const errorMessage = error instanceof Error 
            ? error.message 
            : "An unexpected error occurred during registration";
          
          console.error("Registration mutation error:", errorMessage);
          
          // Map error messages to specific form fields
          if (errorMessage.toLowerCase().includes('username') || errorMessage.toLowerCase().includes('taken')) {
            registerForm.setError('username', { 
              type: 'manual',
              message: "This username is already taken. Please choose a different one."
            });
          } else if (errorMessage.toLowerCase().includes('email') || errorMessage.toLowerCase().includes('already registered')) {
            registerForm.setError('email', { 
              type: 'manual',
              message: "This email is already registered. Please use a different email or login to your existing account."
            });
          } else if (errorMessage.toLowerCase().includes('password')) {
            registerForm.setError('password', { 
              type: 'manual',
              message: "Password doesn't meet security requirements. Please choose a stronger password."
            });
          } else if (errorMessage.toLowerCase().includes('network') || errorMessage.toLowerCase().includes('connection')) {
            // Network-related errors
            registerForm.setError('root', {
              type: 'manual',
              message: "Network error. Please check your internet connection and try again."
            });
          } else {
            // General error message
            registerForm.setError('root', {
              type: 'manual',
              message: errorMessage
            });
          }
        }
      });
    } catch (error) {
      console.error("Error in registration form submission:", error);
      
      // If there's a client-side error, show a toast message
      const errorMessage = error instanceof Error 
        ? error.message 
        : "An unknown error occurred during registration";
      
      console.error("Registration form error:", errorMessage);
      
      // Set a general error message at the form level
      registerForm.setError('root', {
        type: 'manual',
        message: errorMessage
      });
      
      // Also display a toast for better visibility
      toast({
        title: "Registration Error",
        description: errorMessage,
        variant: "destructive",
      });
    }
  };

  return (
    <div className="min-h-screen flex flex-col md:flex-row">
      {/* Left side - Auth forms */}
      <div className="flex-1 flex items-center justify-center p-4 md:p-8">
        <Card className="w-full max-w-xl">
          <CardHeader className="space-y-4">
            <div className="flex flex-col items-center justify-center py-4">
              {/* Logo with minimal glow and heartbeat effect */}
              <div className="mb-3">
                <div className="flex items-center justify-center">
                  {/* Heartbeat container */}
                  <div className="animate-heartbeat" style={{ 
                    transformOrigin: 'center',
                    animationDelay: '0.5s'
                  }}>
                    <img 
                      src={logoImage} 
                      alt="moodlync Logo" 
                      className="object-contain"
                      style={{
                        backgroundColor: 'white',
                        boxShadow: '0 6px 16px rgba(96, 82, 199, 0.3)',
                        width: '320px',
                        height: '120px',
                        borderRadius: '9999px', 
                        padding: '10px 20px',
                        border: '2px solid rgba(96, 82, 199, 0.2)',
                        filter: 'brightness(1.05) contrast(1.1)',
                        background: 'linear-gradient(to right, white, #f8f9fa)'
                      }}
                    />
                  </div>
                </div>
              </div>
              <div className="w-full overflow-hidden rounded-xl shadow-xl relative mb-2">
                <img 
                  src={authImage} 
                  alt="MoodLync Connection" 
                  className="w-full h-auto object-cover max-h-[300px]"
                />
                <div className="absolute inset-0 bg-gradient-to-t from-primary/20 via-primary/5 to-transparent pointer-events-none"></div>
              </div>
            </div>
            <CardDescription className="text-center text-base">
              Unlock Your Mood Journey
            </CardDescription>

            <div className="text-center mt-3 mb-6">
              <h3 className="font-semibold text-lg text-primary">Track, reflect, and grow - your emotions matter here.</h3>
            </div>
            
            <div className="text-center text-sm">
              <a href="/welcome" className="text-primary hover:text-primary/80 underline font-medium">
                View our feature showcase
              </a>
              <span className="mx-2">•</span>
              <a href="/premium/compare" className="text-primary hover:text-primary/80 underline font-medium">
                Compare plans
              </a>
            </div>
          </CardHeader>
          <CardContent>
            <Tabs value={activeTab} onValueChange={setActiveTab} className="w-full">
              <TabsList className="grid w-full grid-cols-2 mb-4">
                <TabsTrigger value="login">Login</TabsTrigger>
                <TabsTrigger value="register">Register</TabsTrigger>
              </TabsList>
              
              <TabsContent value="login">
                <Form {...loginForm}>
                  <form onSubmit={loginForm.handleSubmit(onLoginSubmit)} className="space-y-4">
                    <FormField
                      control={loginForm.control}
                      name="username"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel>Username</FormLabel>
                          <FormControl>
                            <Input placeholder="Enter your username" {...field} />
                          </FormControl>
                          <FormMessage />
                        </FormItem>
                      )}
                    />
                    <FormField
                      control={loginForm.control}
                      name="password"
                      render={({ field }) => {
                        const [showPassword, setShowPassword] = useState(false);
                        return (
                          <FormItem>
                            <FormLabel>Password</FormLabel>
                            <FormControl>
                              <div className="relative">
                                <Input 
                                  type={showPassword ? "text" : "password"} 
                                  placeholder="Enter your password" 
                                  {...field} 
                                />
                                <Button
                                  type="button"
                                  variant="ghost"
                                  size="sm"
                                  className="absolute right-0 top-0 h-full px-3 py-2 hover:bg-transparent"
                                  onClick={() => setShowPassword(!showPassword)}
                                >
                                  {showPassword ? (
                                    <EyeOff className="h-4 w-4 text-gray-500" />
                                  ) : (
                                    <Eye className="h-4 w-4 text-gray-500" />
                                  )}
                                </Button>
                              </div>
                            </FormControl>
                            <FormMessage />
                          </FormItem>
                        );
                      }}
                    />
                    <Button 
                      type="submit" 
                      className="w-full relative overflow-hidden group" 
                      disabled={loginMutation.isPending}
                    >
                      <span className={`flex items-center justify-center transition-all duration-300 ${
                        loginMutation.isPending ? "opacity-0" : "opacity-100"
                      }`}>
                        Sign In
                      </span>
                      
                      {loginMutation.isPending && (
                        <span className="absolute inset-0 flex items-center justify-center">
                          <Loader2 className="h-5 w-5 animate-spin" />
                          <span className="ml-2 text-sm">Logging in...</span>
                        </span>
                      )}
                      
                      <span className="absolute bottom-0 left-0 h-1 bg-primary-300 transition-all duration-300" 
                        style={{ 
                          width: loginMutation.isPending ? "100%" : "0%",
                          opacity: loginMutation.isPending ? 1 : 0 
                        }}
                      />
                    </Button>
                    
                    {/* Login status messages */}
                    {loginMutation.isError && (
                      <div className="mt-4 p-3 bg-red-50 dark:bg-red-950 border border-red-200 dark:border-red-800 rounded-md text-sm text-red-600 dark:text-red-400">
                        <p className="font-medium">Login failed</p>
                        <p>{loginMutation.error?.message || "Invalid username or password."}</p>
                      </div>
                    )}
                  </form>
                </Form>

                
                {/* Developer Panel - Only shows when the special key combo is used */}
                {isDevelopment && showDevPanel && (
                  <div className="mt-6 p-4 border-2 border-amber-400 rounded-md bg-amber-50 dark:bg-amber-950 dark:border-amber-600">
                    <div className="flex justify-between items-center mb-2">
                      <h4 className="font-bold text-sm text-amber-700 dark:text-amber-400 flex items-center">
                        <span className="mr-1">🔐</span> Developer Test Account
                      </h4>
                      <Button 
                        variant="ghost" 
                        size="sm" 
                        onClick={() => setShowDevPanel(false)}
                        className="h-6 w-6 p-0 text-amber-700 dark:text-amber-400 hover:bg-amber-100 dark:hover:bg-amber-900"
                      >
                        ✕
                      </Button>
                    </div>
                    <div className="text-xs text-amber-800 dark:text-amber-300 mb-3">
                      <p className="mb-1">⚠️ <strong>Warning:</strong> This account is for testing premium features only.</p>
                      <p>These credentials are restricted to development mode and do not work in production.</p>
                    </div>
                    <div className="grid grid-cols-2 gap-2 text-xs">
                      <div className="font-medium text-amber-900 dark:text-amber-200">Username:</div>
                      <div className="text-amber-800 dark:text-amber-300 font-mono">test</div>
                      <div className="font-medium text-amber-900 dark:text-amber-200">Password:</div>
                      <div className="text-amber-800 dark:text-amber-300 font-mono">260572</div>
                    </div>
                    <div className="mt-3 text-[10px] text-amber-700 dark:text-amber-400 opacity-70">
                      Developer panel access time: {new Date().toLocaleTimeString()}
                    </div>
                  </div>
                )}
              </TabsContent>
              
              <TabsContent value="register">
                <Form {...registerForm}>
                  <form onSubmit={registerForm.handleSubmit(onRegisterSubmit)} className="space-y-4">
                    {/* Personal Information Section */}
                    <div className="space-y-4">
                      <h3 className="text-sm font-medium text-gray-500 dark:text-gray-300">Personal Information</h3>
                      
                      {/* Name Fields (First, Middle, Last) */}
                      <div className="grid grid-cols-1 md:grid-cols-3 gap-3">
                        <FormField
                          control={registerForm.control}
                          name="firstName"
                          render={({ field }) => (
                            <FormItem>
                              <FormLabel>First Name</FormLabel>
                              <FormControl>
                                <Input placeholder="Enter first name" {...field} />
                              </FormControl>
                              <FormMessage />
                            </FormItem>
                          )}
                        />
                        <FormField
                          control={registerForm.control}
                          name="middleName"
                          render={({ field }) => (
                            <FormItem>
                              <FormLabel>Middle Name</FormLabel>
                              <FormControl>
                                <Input placeholder="Optional" {...field} />
                              </FormControl>
                              <FormMessage />
                            </FormItem>
                          )}
                        />
                        <FormField
                          control={registerForm.control}
                          name="lastName"
                          render={({ field }) => (
                            <FormItem>
                              <FormLabel>Last Name</FormLabel>
                              <FormControl>
                                <Input placeholder="Enter last name" {...field} />
                              </FormControl>
                              <FormMessage />
                            </FormItem>
                          )}
                        />
                      </div>
                      
                      {/* Gender Selection */}
                      <FormField
                        control={registerForm.control}
                        name="gender"
                        render={({ field }) => (
                          <FormItem>
                            <FormLabel>Gender</FormLabel>
                            <Select
                              onValueChange={field.onChange}
                              defaultValue={field.value}
                            >
                              <FormControl>
                                <SelectTrigger>
                                  <SelectValue placeholder="Select gender" />
                                </SelectTrigger>
                              </FormControl>
                              <SelectContent>
                                <SelectItem value="male">Male</SelectItem>
                                <SelectItem value="female">Female</SelectItem>
                                <SelectItem value="non_binary">Non-binary</SelectItem>
                                <SelectItem value="other">Other</SelectItem>
                                <SelectItem value="prefer_not_to_say">Prefer not to say</SelectItem>
                              </SelectContent>
                            </Select>
                            <FormDescription>
                              Your gender is used to personalize your experience.
                            </FormDescription>
                            <FormMessage />
                          </FormItem>
                        )}
                      />
                      
                      {/* Location Fields (State, Country) */}
                      <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                        <FormField
                          control={registerForm.control}
                          name="state"
                          render={({ field }) => (
                            <FormItem>
                              <FormLabel>State/Province</FormLabel>
                              {registerForm.watch("country") === "United States" ? (
                                <Select
                                  onValueChange={field.onChange}
                                  defaultValue={field.value}
                                >
                                  <FormControl>
                                    <SelectTrigger>
                                      <SelectValue placeholder="Select state" />
                                    </SelectTrigger>
                                  </FormControl>
                                  <SelectContent>
                                    <SelectItem value="Alabama">Alabama</SelectItem>
                                    <SelectItem value="Alaska">Alaska</SelectItem>
                                    <SelectItem value="Arizona">Arizona</SelectItem>
                                    <SelectItem value="Arkansas">Arkansas</SelectItem>
                                    <SelectItem value="California">California</SelectItem>
                                    <SelectItem value="Colorado">Colorado</SelectItem>
                                    <SelectItem value="Connecticut">Connecticut</SelectItem>
                                    <SelectItem value="Delaware">Delaware</SelectItem>
                                    <SelectItem value="Florida">Florida</SelectItem>
                                    <SelectItem value="Georgia">Georgia</SelectItem>
                                    <SelectItem value="Hawaii">Hawaii</SelectItem>
                                    <SelectItem value="Idaho">Idaho</SelectItem>
                                    <SelectItem value="Illinois">Illinois</SelectItem>
                                    <SelectItem value="Indiana">Indiana</SelectItem>
                                    <SelectItem value="Iowa">Iowa</SelectItem>
                                    <SelectItem value="Kansas">Kansas</SelectItem>
                                    <SelectItem value="Kentucky">Kentucky</SelectItem>
                                    <SelectItem value="Louisiana">Louisiana</SelectItem>
                                    <SelectItem value="Maine">Maine</SelectItem>
                                    <SelectItem value="Maryland">Maryland</SelectItem>
                                    <SelectItem value="Massachusetts">Massachusetts</SelectItem>
                                    <SelectItem value="Michigan">Michigan</SelectItem>
                                    <SelectItem value="Minnesota">Minnesota</SelectItem>
                                    <SelectItem value="Mississippi">Mississippi</SelectItem>
                                    <SelectItem value="Missouri">Missouri</SelectItem>
                                    <SelectItem value="Montana">Montana</SelectItem>
                                    <SelectItem value="Nebraska">Nebraska</SelectItem>
                                    <SelectItem value="Nevada">Nevada</SelectItem>
                                    <SelectItem value="New Hampshire">New Hampshire</SelectItem>
                                    <SelectItem value="New Jersey">New Jersey</SelectItem>
                                    <SelectItem value="New Mexico">New Mexico</SelectItem>
                                    <SelectItem value="New York">New York</SelectItem>
                                    <SelectItem value="North Carolina">North Carolina</SelectItem>
                                    <SelectItem value="North Dakota">North Dakota</SelectItem>
                                    <SelectItem value="Ohio">Ohio</SelectItem>
                                    <SelectItem value="Oklahoma">Oklahoma</SelectItem>
                                    <SelectItem value="Oregon">Oregon</SelectItem>
                                    <SelectItem value="Pennsylvania">Pennsylvania</SelectItem>
                                    <SelectItem value="Rhode Island">Rhode Island</SelectItem>
                                    <SelectItem value="South Carolina">South Carolina</SelectItem>
                                    <SelectItem value="South Dakota">South Dakota</SelectItem>
                                    <SelectItem value="Tennessee">Tennessee</SelectItem>
                                    <SelectItem value="Texas">Texas</SelectItem>
                                    <SelectItem value="Utah">Utah</SelectItem>
                                    <SelectItem value="Vermont">Vermont</SelectItem>
                                    <SelectItem value="Virginia">Virginia</SelectItem>
                                    <SelectItem value="Washington">Washington</SelectItem>
                                    <SelectItem value="West Virginia">West Virginia</SelectItem>
                                    <SelectItem value="Wisconsin">Wisconsin</SelectItem>
                                    <SelectItem value="Wyoming">Wyoming</SelectItem>
                                    <SelectItem value="District of Columbia">District of Columbia</SelectItem>
                                  </SelectContent>
                                </Select>
                              ) : (
                                <FormControl>
                                  <Input placeholder="Enter state or province" {...field} />
                                </FormControl>
                              )}
                              <FormMessage />
                            </FormItem>
                          )}
                        />
                        <FormField
                          control={registerForm.control}
                          name="country"
                          render={({ field }) => (
                            <FormItem>
                              <FormLabel>Country</FormLabel>
                              <Select
                                onValueChange={field.onChange}
                                defaultValue={field.value}
                              >
                                <FormControl>
                                  <SelectTrigger>
                                    <SelectValue placeholder="Select country" />
                                  </SelectTrigger>
                                </FormControl>
                                <SelectContent className="max-h-[300px] overflow-y-auto">
                                  {/* Common Countries First */}
                                  <SelectItem value="United States">United States</SelectItem>
                                  <SelectItem value="Canada">Canada</SelectItem>
                                  <SelectItem value="United Kingdom">United Kingdom</SelectItem>
                                  
                                  <SelectItem value="Afghanistan">Afghanistan</SelectItem>
                                  <SelectItem value="Albania">Albania</SelectItem>
                                  <SelectItem value="Algeria">Algeria</SelectItem>
                                  <SelectItem value="Andorra">Andorra</SelectItem>
                                  <SelectItem value="Angola">Angola</SelectItem>
                                  <SelectItem value="Antigua and Barbuda">Antigua and Barbuda</SelectItem>
                                  <SelectItem value="Argentina">Argentina</SelectItem>
                                  <SelectItem value="Armenia">Armenia</SelectItem>
                                  <SelectItem value="Australia">Australia</SelectItem>
                                  <SelectItem value="Austria">Austria</SelectItem>
                                  <SelectItem value="Azerbaijan">Azerbaijan</SelectItem>
                                  <SelectItem value="Bahamas">Bahamas</SelectItem>
                                  <SelectItem value="Bahrain">Bahrain</SelectItem>
                                  <SelectItem value="Bangladesh">Bangladesh</SelectItem>
                                  <SelectItem value="Barbados">Barbados</SelectItem>
                                  <SelectItem value="Belarus">Belarus</SelectItem>
                                  <SelectItem value="Belgium">Belgium</SelectItem>
                                  <SelectItem value="Belize">Belize</SelectItem>
                                  <SelectItem value="Benin">Benin</SelectItem>
                                  <SelectItem value="Bhutan">Bhutan</SelectItem>
                                  <SelectItem value="Bolivia">Bolivia</SelectItem>
                                  <SelectItem value="Bosnia and Herzegovina">Bosnia and Herzegovina</SelectItem>
                                  <SelectItem value="Botswana">Botswana</SelectItem>
                                  <SelectItem value="Brazil">Brazil</SelectItem>
                                  <SelectItem value="Brunei">Brunei</SelectItem>
                                  <SelectItem value="Bulgaria">Bulgaria</SelectItem>
                                  <SelectItem value="Burkina Faso">Burkina Faso</SelectItem>
                                  <SelectItem value="Burundi">Burundi</SelectItem>
                                  <SelectItem value="Cabo Verde">Cabo Verde</SelectItem>
                                  <SelectItem value="Cambodia">Cambodia</SelectItem>
                                  <SelectItem value="Cameroon">Cameroon</SelectItem>
                                  <SelectItem value="Central African Republic">Central African Republic</SelectItem>
                                  <SelectItem value="Chad">Chad</SelectItem>
                                  <SelectItem value="Chile">Chile</SelectItem>
                                  <SelectItem value="China">China</SelectItem>
                                  <SelectItem value="Colombia">Colombia</SelectItem>
                                  <SelectItem value="Comoros">Comoros</SelectItem>
                                  <SelectItem value="Congo">Congo</SelectItem>
                                  <SelectItem value="Costa Rica">Costa Rica</SelectItem>
                                  <SelectItem value="Cote d'Ivoire">Cote d'Ivoire</SelectItem>
                                  <SelectItem value="Croatia">Croatia</SelectItem>
                                  <SelectItem value="Cuba">Cuba</SelectItem>
                                  <SelectItem value="Cyprus">Cyprus</SelectItem>
                                  <SelectItem value="Czech Republic">Czech Republic</SelectItem>
                                  <SelectItem value="Denmark">Denmark</SelectItem>
                                  <SelectItem value="Djibouti">Djibouti</SelectItem>
                                  <SelectItem value="Dominica">Dominica</SelectItem>
                                  <SelectItem value="Dominican Republic">Dominican Republic</SelectItem>
                                  <SelectItem value="Ecuador">Ecuador</SelectItem>
                                  <SelectItem value="Egypt">Egypt</SelectItem>
                                  <SelectItem value="El Salvador">El Salvador</SelectItem>
                                  <SelectItem value="Equatorial Guinea">Equatorial Guinea</SelectItem>
                                  <SelectItem value="Eritrea">Eritrea</SelectItem>
                                  <SelectItem value="Estonia">Estonia</SelectItem>
                                  <SelectItem value="Eswatini">Eswatini</SelectItem>
                                  <SelectItem value="Ethiopia">Ethiopia</SelectItem>
                                  <SelectItem value="Fiji">Fiji</SelectItem>
                                  <SelectItem value="Finland">Finland</SelectItem>
                                  <SelectItem value="France">France</SelectItem>
                                  <SelectItem value="Gabon">Gabon</SelectItem>
                                  <SelectItem value="Gambia">Gambia</SelectItem>
                                  <SelectItem value="Georgia">Georgia</SelectItem>
                                  <SelectItem value="Germany">Germany</SelectItem>
                                  <SelectItem value="Ghana">Ghana</SelectItem>
                                  <SelectItem value="Greece">Greece</SelectItem>
                                  <SelectItem value="Grenada">Grenada</SelectItem>
                                  <SelectItem value="Guatemala">Guatemala</SelectItem>
                                  <SelectItem value="Guinea">Guinea</SelectItem>
                                  <SelectItem value="Guinea-Bissau">Guinea-Bissau</SelectItem>
                                  <SelectItem value="Guyana">Guyana</SelectItem>
                                  <SelectItem value="Haiti">Haiti</SelectItem>
                                  <SelectItem value="Honduras">Honduras</SelectItem>
                                  <SelectItem value="Hungary">Hungary</SelectItem>
                                  <SelectItem value="Iceland">Iceland</SelectItem>
                                  <SelectItem value="India">India</SelectItem>
                                  <SelectItem value="Indonesia">Indonesia</SelectItem>
                                  <SelectItem value="Iran">Iran</SelectItem>
                                  <SelectItem value="Iraq">Iraq</SelectItem>
                                  <SelectItem value="Ireland">Ireland</SelectItem>
                                  <SelectItem value="Israel">Israel</SelectItem>
                                  <SelectItem value="Italy">Italy</SelectItem>
                                  <SelectItem value="Jamaica">Jamaica</SelectItem>
                                  <SelectItem value="Japan">Japan</SelectItem>
                                  <SelectItem value="Jordan">Jordan</SelectItem>
                                  <SelectItem value="Kazakhstan">Kazakhstan</SelectItem>
                                  <SelectItem value="Kenya">Kenya</SelectItem>
                                  <SelectItem value="Kiribati">Kiribati</SelectItem>
                                  <SelectItem value="Korea, North">Korea, North</SelectItem>
                                  <SelectItem value="Korea, South">Korea, South</SelectItem>
                                  <SelectItem value="Kosovo">Kosovo</SelectItem>
                                  <SelectItem value="Kuwait">Kuwait</SelectItem>
                                  <SelectItem value="Kyrgyzstan">Kyrgyzstan</SelectItem>
                                  <SelectItem value="Laos">Laos</SelectItem>
                                  <SelectItem value="Latvia">Latvia</SelectItem>
                                  <SelectItem value="Lebanon">Lebanon</SelectItem>
                                  <SelectItem value="Lesotho">Lesotho</SelectItem>
                                  <SelectItem value="Liberia">Liberia</SelectItem>
                                  <SelectItem value="Libya">Libya</SelectItem>
                                  <SelectItem value="Liechtenstein">Liechtenstein</SelectItem>
                                  <SelectItem value="Lithuania">Lithuania</SelectItem>
                                  <SelectItem value="Luxembourg">Luxembourg</SelectItem>
                                  <SelectItem value="Madagascar">Madagascar</SelectItem>
                                  <SelectItem value="Malawi">Malawi</SelectItem>
                                  <SelectItem value="Malaysia">Malaysia</SelectItem>
                                  <SelectItem value="Maldives">Maldives</SelectItem>
                                  <SelectItem value="Mali">Mali</SelectItem>
                                  <SelectItem value="Malta">Malta</SelectItem>
                                  <SelectItem value="Marshall Islands">Marshall Islands</SelectItem>
                                  <SelectItem value="Mauritania">Mauritania</SelectItem>
                                  <SelectItem value="Mauritius">Mauritius</SelectItem>
                                  <SelectItem value="Mexico">Mexico</SelectItem>
                                  <SelectItem value="Micronesia">Micronesia</SelectItem>
                                  <SelectItem value="Moldova">Moldova</SelectItem>
                                  <SelectItem value="Monaco">Monaco</SelectItem>
                                  <SelectItem value="Mongolia">Mongolia</SelectItem>
                                  <SelectItem value="Montenegro">Montenegro</SelectItem>
                                  <SelectItem value="Morocco">Morocco</SelectItem>
                                  <SelectItem value="Mozambique">Mozambique</SelectItem>
                                  <SelectItem value="Myanmar">Myanmar</SelectItem>
                                  <SelectItem value="Namibia">Namibia</SelectItem>
                                  <SelectItem value="Nauru">Nauru</SelectItem>
                                  <SelectItem value="Nepal">Nepal</SelectItem>
                                  <SelectItem value="Netherlands">Netherlands</SelectItem>
                                  <SelectItem value="New Zealand">New Zealand</SelectItem>
                                  <SelectItem value="Nicaragua">Nicaragua</SelectItem>
                                  <SelectItem value="Niger">Niger</SelectItem>
                                  <SelectItem value="Nigeria">Nigeria</SelectItem>
                                  <SelectItem value="North Macedonia">North Macedonia</SelectItem>
                                  <SelectItem value="Norway">Norway</SelectItem>
                                  <SelectItem value="Oman">Oman</SelectItem>
                                  <SelectItem value="Pakistan">Pakistan</SelectItem>
                                  <SelectItem value="Palau">Palau</SelectItem>
                                  <SelectItem value="Palestine">Palestine</SelectItem>
                                  <SelectItem value="Panama">Panama</SelectItem>
                                  <SelectItem value="Papua New Guinea">Papua New Guinea</SelectItem>
                                  <SelectItem value="Paraguay">Paraguay</SelectItem>
                                  <SelectItem value="Peru">Peru</SelectItem>
                                  <SelectItem value="Philippines">Philippines</SelectItem>
                                  <SelectItem value="Poland">Poland</SelectItem>
                                  <SelectItem value="Portugal">Portugal</SelectItem>
                                  <SelectItem value="Qatar">Qatar</SelectItem>
                                  <SelectItem value="Romania">Romania</SelectItem>
                                  <SelectItem value="Russia">Russia</SelectItem>
                                  <SelectItem value="Rwanda">Rwanda</SelectItem>
                                  <SelectItem value="Saint Kitts and Nevis">Saint Kitts and Nevis</SelectItem>
                                  <SelectItem value="Saint Lucia">Saint Lucia</SelectItem>
                                  <SelectItem value="Saint Vincent and the Grenadines">Saint Vincent and the Grenadines</SelectItem>
                                  <SelectItem value="Samoa">Samoa</SelectItem>
                                  <SelectItem value="San Marino">San Marino</SelectItem>
                                  <SelectItem value="Sao Tome and Principe">Sao Tome and Principe</SelectItem>
                                  <SelectItem value="Saudi Arabia">Saudi Arabia</SelectItem>
                                  <SelectItem value="Senegal">Senegal</SelectItem>
                                  <SelectItem value="Serbia">Serbia</SelectItem>
                                  <SelectItem value="Seychelles">Seychelles</SelectItem>
                                  <SelectItem value="Sierra Leone">Sierra Leone</SelectItem>
                                  <SelectItem value="Singapore">Singapore</SelectItem>
                                  <SelectItem value="Slovakia">Slovakia</SelectItem>
                                  <SelectItem value="Slovenia">Slovenia</SelectItem>
                                  <SelectItem value="Solomon Islands">Solomon Islands</SelectItem>
                                  <SelectItem value="Somalia">Somalia</SelectItem>
                                  <SelectItem value="South Africa">South Africa</SelectItem>
                                  <SelectItem value="South Sudan">South Sudan</SelectItem>
                                  <SelectItem value="Spain">Spain</SelectItem>
                                  <SelectItem value="Sri Lanka">Sri Lanka</SelectItem>
                                  <SelectItem value="Sudan">Sudan</SelectItem>
                                  <SelectItem value="Suriname">Suriname</SelectItem>
                                  <SelectItem value="Sweden">Sweden</SelectItem>
                                  <SelectItem value="Switzerland">Switzerland</SelectItem>
                                  <SelectItem value="Syria">Syria</SelectItem>
                                  <SelectItem value="Taiwan">Taiwan</SelectItem>
                                  <SelectItem value="Tajikistan">Tajikistan</SelectItem>
                                  <SelectItem value="Tanzania">Tanzania</SelectItem>
                                  <SelectItem value="Thailand">Thailand</SelectItem>
                                  <SelectItem value="Timor-Leste">Timor-Leste</SelectItem>
                                  <SelectItem value="Togo">Togo</SelectItem>
                                  <SelectItem value="Tonga">Tonga</SelectItem>
                                  <SelectItem value="Trinidad and Tobago">Trinidad and Tobago</SelectItem>
                                  <SelectItem value="Tunisia">Tunisia</SelectItem>
                                  <SelectItem value="Turkey">Turkey</SelectItem>
                                  <SelectItem value="Turkmenistan">Turkmenistan</SelectItem>
                                  <SelectItem value="Tuvalu">Tuvalu</SelectItem>
                                  <SelectItem value="Uganda">Uganda</SelectItem>
                                  <SelectItem value="Ukraine">Ukraine</SelectItem>
                                  <SelectItem value="United Arab Emirates">United Arab Emirates</SelectItem>

                                  <SelectItem value="Uruguay">Uruguay</SelectItem>
                                  <SelectItem value="Uzbekistan">Uzbekistan</SelectItem>
                                  <SelectItem value="Vanuatu">Vanuatu</SelectItem>
                                  <SelectItem value="Vatican City">Vatican City</SelectItem>
                                  <SelectItem value="Venezuela">Venezuela</SelectItem>
                                  <SelectItem value="Vietnam">Vietnam</SelectItem>
                                  <SelectItem value="Yemen">Yemen</SelectItem>
                                  <SelectItem value="Zambia">Zambia</SelectItem>
                                  <SelectItem value="Zimbabwe">Zimbabwe</SelectItem>
                                </SelectContent>
                              </Select>
                              <FormMessage />
                            </FormItem>
                          )}
                        />
                      </div>
                    </div>
                    
                    {/* Account Information Section */}
                    <div className="space-y-4 pt-4">
                      <h3 className="text-sm font-medium text-gray-500 dark:text-gray-300">Account Information</h3>
                      
                      <FormField
                        control={registerForm.control}
                        name="email"
                        render={({ field }) => (
                          <FormItem>
                            <FormLabel>Email</FormLabel>
                            <FormControl>
                              <Input type="email" placeholder="Enter your email" {...field} />
                            </FormControl>
                            <FormMessage />
                          </FormItem>
                        )}
                      />
                      
                      <FormField
                        control={registerForm.control}
                        name="username"
                        render={({ field }) => (
                          <FormItem>
                            <FormLabel>Username</FormLabel>
                            <FormControl>
                              <Input placeholder="Choose a username" {...field} />
                            </FormControl>
                            <FormMessage />
                          </FormItem>
                        )}
                      />
                      
                      <FormField
                        control={registerForm.control}
                        name="password"
                        render={({ field }) => {
                          const [showPassword, setShowPassword] = useState(false);
                          const [passwordStrength, setPasswordStrength] = useState(0);
                          
                          // Calculate password strength
                          useEffect(() => {
                            if (!field.value) {
                              setPasswordStrength(0);
                              return;
                            }
                            
                            let strength = 0;
                            
                            // Length check
                            if (field.value.length >= 8) strength += 25;
                            else if (field.value.length >= 6) strength += 15;
                            
                            // Complexity checks
                            if (/[A-Z]/.test(field.value)) strength += 25; // Uppercase
                            if (/[0-9]/.test(field.value)) strength += 25; // Numbers
                            if (/[^A-Za-z0-9]/.test(field.value)) strength += 25; // Special chars
                            
                            setPasswordStrength(Math.min(100, strength));
                          }, [field.value]);
                          
                          // Determine color based on strength
                          const getStrengthColor = () => {
                            if (passwordStrength < 30) return "bg-red-500";
                            if (passwordStrength < 60) return "bg-orange-500";
                            if (passwordStrength < 80) return "bg-yellow-500";
                            return "bg-green-500";
                          };
                          
                          return (
                            <FormItem>
                              <FormLabel>Password</FormLabel>
                              <FormControl>
                                <div className="relative">
                                  <Input 
                                    type={showPassword ? "text" : "password"} 
                                    placeholder="Create a password" 
                                    {...field} 
                                  />
                                  <Button
                                    type="button"
                                    variant="ghost"
                                    size="sm"
                                    className="absolute right-0 top-0 h-full px-3 py-2 hover:bg-transparent"
                                    onClick={() => setShowPassword(!showPassword)}
                                  >
                                    {showPassword ? (
                                      <EyeOff className="h-4 w-4 text-gray-500" />
                                    ) : (
                                      <Eye className="h-4 w-4 text-gray-500" />
                                    )}
                                  </Button>
                                </div>
                              </FormControl>
                              
                              {field.value && (
                                <>
                                  <div className="h-1 w-full bg-gray-200 rounded-full mt-2">
                                    <div 
                                      className={`h-1 rounded-full ${getStrengthColor()}`} 
                                      style={{width: `${passwordStrength}%`}}
                                    ></div>
                                  </div>
                                  <div className="text-xs text-gray-500 mt-1">
                                    {passwordStrength < 30 && "Very weak password"}
                                    {passwordStrength >= 30 && passwordStrength < 60 && "Weak password"}
                                    {passwordStrength >= 60 && passwordStrength < 80 && "Good password"}
                                    {passwordStrength >= 80 && "Strong password"}
                                  </div>
                                </>
                              )}
                              
                              <FormDescription>
                                At least 6 characters. For stronger security, use 8+ characters with letters, numbers, and symbols.
                              </FormDescription>
                              <FormMessage />
                            </FormItem>
                          );
                        }}
                      />
                      
                      <FormField
                        control={registerForm.control}
                        name="confirmPassword"
                        render={({ field }) => {
                          const [showConfirmPassword, setShowConfirmPassword] = useState(false);
                          return (
                            <FormItem>
                              <FormLabel>Confirm Password</FormLabel>
                              <FormControl>
                                <div className="relative">
                                  <Input 
                                    type={showConfirmPassword ? "text" : "password"} 
                                    placeholder="Confirm your password" 
                                    {...field} 
                                  />
                                  <Button
                                    type="button"
                                    variant="ghost"
                                    size="sm"
                                    className="absolute right-0 top-0 h-full px-3 py-2 hover:bg-transparent"
                                    onClick={() => setShowConfirmPassword(!showConfirmPassword)}
                                  >
                                    {showConfirmPassword ? (
                                      <EyeOff className="h-4 w-4 text-gray-500" />
                                    ) : (
                                      <Eye className="h-4 w-4 text-gray-500" />
                                    )}
                                  </Button>
                                </div>
                              </FormControl>
                              <FormMessage />
                            </FormItem>
                          );
                        }}
                      />
                    </div>
                    
                    {/* Terms & Conditions Notice */}
                    <div className="text-xs text-gray-500 dark:text-gray-400 mt-4">
                      <p>By creating an account, you agree to our Terms of Service and Privacy Policy. The platform prohibits content related to discrimination, child abuse, pornography, or any material that violates local or international laws.</p>
                    </div>
                    
                    {/* Color Preview based on Gender */}
                    {userGender && (
                      <div className={`p-3 mt-2 rounded-md text-center text-white ${
                        userGender === "male" ? "bg-blue-500" : 
                        userGender === "female" ? "bg-pink-500" : 
                        userGender === "non_binary" ? "bg-purple-500" : 
                        userGender === "other" ? "bg-green-500" : 
                        "bg-gray-500"
                      }`}>
                        <p>Your profile will be colored based on your gender selection.</p>
                      </div>
                    )}
                    
                    <Button 
                      type="submit" 
                      className="w-full relative overflow-hidden group" 
                      disabled={registerMutation.isPending}
                    >
                      <span className={`flex items-center justify-center transition-all duration-300 ${
                        registerMutation.isPending ? "opacity-0" : "opacity-100"
                      }`}>
                        Create Account
                      </span>
                      
                      {registerMutation.isPending && (
                        <span className="absolute inset-0 flex items-center justify-center">
                          <Loader2 className="h-5 w-5 animate-spin" />
                          <span className="ml-2 text-sm">Creating account...</span>
                        </span>
                      )}
                      
                      <span className="absolute bottom-0 left-0 h-1 bg-primary-300 transition-all duration-300" 
                        style={{ 
                          width: registerMutation.isPending ? "100%" : "0%",
                          opacity: registerMutation.isPending ? 1 : 0 
                        }}
                      />
                    </Button>
                    
                    {/* Form-level validation errors */}
                    {registerForm.formState.errors.root && (
                      <div className="mt-4 p-3 bg-amber-50 dark:bg-amber-950/30 border border-amber-200 dark:border-amber-800/50 rounded-md text-sm text-amber-700 dark:text-amber-400 flex items-start">
                        <AlertTriangle className="h-5 w-5 mr-2 flex-shrink-0 text-amber-500" />
                        <div>
                          <p className="font-medium">Registration Issue</p>
                          <p>{registerForm.formState.errors.root.message}</p>
                        </div>
                      </div>
                    )}
                    
                    {/* Registration status messages */}
                    {registerMutation.isError && (
                      <div className="mt-4 p-3 bg-red-50 dark:bg-red-950/30 border border-red-200 dark:border-red-800/50 rounded-md text-sm text-red-600 dark:text-red-400 flex items-start">
                        <AlertCircle className="h-5 w-5 mr-2 flex-shrink-0 text-red-500" />
                        <div>
                          <p className="font-medium">Registration failed</p>
                          <p>{registerMutation.error?.message || "Please check your information and try again."}</p>
                          <ul className="mt-2 list-disc list-inside space-y-1 text-xs">
                            <li>Check if your username contains only letters, numbers, underscores or hyphens</li>
                            <li>Ensure your password is at least 8 characters long</li>
                            <li>Verify your email address is correct</li>
                            <li>Check your internet connection</li>
                          </ul>
                          <p className="mt-2 text-xs">If you continue to have issues, please contact support at <span className="font-medium">support@moodlync.com</span></p>
                        </div>
                      </div>
                    )}
                    
                    {registerMutation.isSuccess && (
                      <div className="mt-4 p-3 bg-green-50 dark:bg-green-950/30 border border-green-200 dark:border-green-800/50 rounded-md text-sm text-green-600 dark:text-green-400 flex items-start">
                        <CheckCircle className="h-5 w-5 mr-2 flex-shrink-0 text-green-500" />
                        <div>
                          <p className="font-medium">Account created successfully!</p>
                          <p>You are now logged in to MoodLync. Redirecting you to the app...</p>
                        </div>
                      </div>
                    )}
                  </form>
                </Form>
              </TabsContent>
            </Tabs>
          </CardContent>
        </Card>
      </div>
      
      {/* Right side - Feature showcase with premium benefits */}
      <div className="flex-1 bg-gradient-to-br from-primary to-secondary p-6 hidden md:block overflow-y-auto">
        <div className="sticky top-0 z-10 pt-4 pb-2 bg-gradient-to-b from-primary to-transparent">
          <div className="flex items-center justify-center gap-3 mb-2">
            <Heart className="h-8 w-8 text-white" />
            <h1 className="text-2xl font-bold text-white dark:text-white">Welcome to Emotional Wellbeing</h1>
          </div>
          <p className="text-center text-white dark:text-white text-sm mb-4">
            Discover how our platform transforms your emotional wellbeing journey
          </p>
        </div>
        
        {/* Featured Core Features with detailed descriptions */}
        <div className="bg-white/10 backdrop-blur-sm rounded-xl p-5 mb-8">
          <div className="flex items-center gap-2 mb-4">
            <Badge className="bg-white/20 text-white hover:bg-white/30">
              Core Features
            </Badge>
            <h2 className="text-xl font-bold text-white">Connect Through Emotions</h2>
          </div>
          
          <div className="space-y-6">
            <div className="bg-white/10 rounded-lg p-4">
              <h3 className="text-white font-semibold mb-2 flex items-center gap-2">
                <div className="h-6 w-6 rounded-full bg-primary/20 flex items-center justify-center">
                  <Brain className="h-3.5 w-3.5 text-white" />
                </div>
                Emotion Matching
              </h3>
              <p className="text-white/80 text-sm mb-3">
                Connect with others who share your current emotional state for authentic, meaningful conversations using our AI-powered emotion detection system.
              </p>
              <div className="mt-2">
                <StaticProductDialog 
                  description={EmotionMatchingDescription}
                  buttonVariant="outline"
                  buttonClassName="bg-white/10 text-white/70 border-white/20 hover:bg-white/20"
                />
              </div>
            </div>
            
            <div className="bg-white/10 rounded-lg p-4">
              <h3 className="text-white font-semibold mb-2 flex items-center gap-2">
                <div className="h-6 w-6 rounded-full bg-primary/20 flex items-center justify-center">
                  <Shield className="h-3.5 w-3.5 text-white" />
                </div>
                Emotional Journal
              </h3>
              <p className="text-white/80 text-sm mb-3">
                Track your emotional journey with our comprehensive journaling tools that provide insights and patterns into your emotional wellbeing.
              </p>
              <div className="mt-2">
                <StaticProductDialog 
                  description={EmotionalJournalDescription}
                  buttonVariant="outline"
                  buttonClassName="bg-white/10 text-white/70 border-white/20 hover:bg-white/20"
                />
              </div>
            </div>
          </div>
        </div>
        
        {/* Featured premium benefits */}
        <div className="bg-white/10 backdrop-blur-sm rounded-xl p-5 mb-8">
          <div className="flex items-center gap-2 mb-4">
            <Badge className="bg-amber-500/20 text-amber-300 hover:bg-amber-500/30">
              <Star className="h-3 w-3 mr-1" /> Premium
            </Badge>
            <h2 className="text-xl font-bold text-white">Premium Features</h2>
          </div>
          
          <div className="mt-4 text-center">
            <a href="/premium/compare" className="text-white hover:text-white/80 underline text-sm">
              View all premium features →
            </a>
          </div>
        </div>
        
        {/* Exclusive NFT Feature Description */}
        <div className="bg-white/10 backdrop-blur-sm rounded-xl p-5 mb-8">
          <div className="flex items-center gap-2 mb-4">
            <Badge className="bg-indigo-500/20 text-indigo-300 hover:bg-indigo-500/30">
              Exclusive
            </Badge>
            <h2 className="text-xl font-bold text-white">Emotion NFTs</h2>
          </div>
          
          <div className="bg-white/10 rounded-lg p-4">
            <h3 className="text-white font-semibold mb-2 flex items-center gap-2">
              <div className="h-6 w-6 rounded-full bg-primary/20 flex items-center justify-center">
                <Star className="h-3.5 w-3.5 text-white" />
              </div>
              Digital Emotional Collectibles
            </h3>
            <p className="text-white/80 text-sm mb-3">
              Premium members earn unique NFTs that evolve with your emotional journey, unlocking real-world perks and benefits.
            </p>
            <div className="mt-2">
              <StaticProductDialog 
                description={EmotionalNFTsDescription}
                buttonVariant="outline"
                buttonClassName="bg-white/10 text-white/70 border-white/20 hover:bg-white/20"
              />
            </div>
          </div>
        </div>
        
        {/* Enhanced feature image */}
        <div className="relative rounded-lg overflow-hidden shadow-xl mb-6">
          <div className="bg-gradient-to-r from-primary to-secondary p-4 text-white">
            <h3 className="text-xl font-bold text-center mb-2">
              Unlock Your Mood Journey
            </h3>
            <p className="text-sm text-center opacity-90">
              Sign in to track, reflect, and grow—your emotions matter here.
            </p>
          </div>
        </div>
        
        {/* Key features list */}
        <div className="space-y-4 px-2">
          <h2 className="text-xl font-semibold mb-3 text-white dark:text-white">Explore Our Key Features</h2>
          
          <div className="flex items-start">
            <div className="bg-white/20 p-2 rounded-full mr-3 flex-shrink-0">
              <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth="1.5" stroke="currentColor" className="w-5 h-5">
                <path strokeLinecap="round" strokeLinejoin="round" d="M15.362 5.214A8.252 8.252 0 0112 21 8.25 8.25 0 016.038 7.048 8.287 8.287 0 009 9.6a8.983 8.983 0 013.361-6.867 8.21 8.21 0 003 2.48z" />
              </svg>
            </div>
            <div>
              <h3 className="font-semibold text-white dark:text-white">Emotion-Based Matching</h3>
              <p className="text-white/80 text-sm">Connect with others who share your current emotional state from around the world</p>
            </div>
          </div>
          
          <div className="flex items-start">
            <div className="bg-white/20 p-2 rounded-full mr-3 flex-shrink-0">
              <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth="1.5" stroke="currentColor" className="w-5 h-5">
                <path strokeLinecap="round" strokeLinejoin="round" d="M7.5 8.25h9m-9 3H12m-9.75 1.51c0 1.6 1.123 2.994 2.707 3.227 1.129.166 2.27.293 3.423.379.35.026.67.21.865.501L12 21l2.755-4.133a1.14 1.14 0 01.865-.501 48.172 48.172 0 003.423-.379c1.584-.233 2.707-1.626 2.707-3.228V6.741c0-1.602-1.123-2.995-2.707-3.228A48.394 48.394 0 0012 3c-2.392 0-4.744.175-7.043.513C3.373 3.746 2.25 5.14 2.25 6.741v6.018z" />
              </svg>
            </div>
            <div>
              <h3 className="font-semibold text-white dark:text-white">Mood-Based Chat Rooms</h3>
              <p className="text-white/80 text-sm">Join group discussions with people who understand exactly how you feel right now</p>
            </div>
          </div>
          
          <div className="flex items-start">
            <div className="bg-white/20 p-2 rounded-full mr-3 flex-shrink-0">
              <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth="1.5" stroke="currentColor" className="w-5 h-5">
                <path strokeLinecap="round" strokeLinejoin="round" d="M9.813 15.904L9 18.75l-.813-2.846a4.5 4.5 0 00-3.09-3.09L2.25 12l2.846-.813a4.5 4.5 0 003.09-3.09L9 5.25l.813 2.846a4.5 4.5 0 003.09 3.09L15.75 12l-2.846.813a4.5 4.5 0 00-3.09 3.09zM18.259 8.715L18 9.75l-.259-1.035a3.375 3.375 0 00-2.455-2.456L14.25 6l1.036-.259a3.375 3.375 0 002.455-2.456L18 2.25l.259 1.035a3.375 3.375 0 002.456 2.456L21.75 6l-1.035.259a3.375 3.375 0 00-2.456 2.456zM16.894 20.567L16.5 21.75l-.394-1.183a2.25 2.25 0 00-1.423-1.423L13.5 18.75l1.183-.394a2.25 2.25 0 001.423-1.423l.394-1.183.394 1.183a2.25 2.25 0 001.423 1.423l1.183.394-1.183.394a2.25 2.25 0 00-1.423 1.423z" />
              </svg>
            </div>
            <div>
              <h3 className="font-semibold text-white dark:text-white">AI Emotional Support</h3>
              <p className="text-white/80 text-sm">Get personalized advice and coping strategies based on your current mood and emotional needs</p>
            </div>
          </div>
          
          <div className="flex items-start">
            <div className="bg-amber-400/30 p-2 rounded-full mr-3 flex-shrink-0">
              <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth="1.5" stroke="currentColor" className="w-5 h-5">
                <path strokeLinecap="round" strokeLinejoin="round" d="M11.48 3.499a.562.562 0 011.04 0l2.125 5.111a.563.563 0 00.475.345l5.518.442c.499.04.701.663.321.988l-4.204 3.602a.563.563 0 00-.182.557l1.285 5.385a.562.562 0 01-.84.61l-4.725-2.885a.563.563 0 00-.586 0L6.982 20.54a.562.562 0 01-.84-.61l1.285-5.386a.562.562 0 00-.182-.557l-4.204-3.602a.563.563 0 01.321-.988l5.518-.442a.563.563 0 00.475-.345L11.48 3.5z" />
              </svg>
            </div>
            <div>
              <h3 className="font-semibold text-white dark:text-white">Premium Features</h3>
              <p className="text-white/80 text-sm">Unlock exclusive content, premium chat rooms, video sharing, and advanced analytics</p>
            </div>
          </div>
          
          <div className="flex items-start">
            <div className="bg-white/20 p-2 rounded-full mr-3 flex-shrink-0">
              <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth="1.5" stroke="currentColor" className="w-5 h-5">
                <path strokeLinecap="round" strokeLinejoin="round" d="M16.5 18.75h-9m9 0a3 3 0 013 3h-15a3 3 0 013-3m9 0v-3.375c0-.621-.503-1.125-1.125-1.125h-.871M7.5 18.75v-3.375c0-.621.504-1.125 1.125-1.125h.872m5.007 0H9.497m5.007 0a7.454 7.454 0 01-.982-3.172M9.497 14.25a7.454 7.454 0 00.981-3.172M5.25 4.236c-.982.143-1.954.317-2.916.52A6.003 6.003 0 007.73 9.728M5.25 4.236V4.5c0 2.108.966 3.99 2.48 5.228M5.25 4.236V2.721C7.456 2.41 9.71 2.25 12 2.25c2.291 0 4.545.16 6.75.47v1.516M7.73 9.728a6.726 6.726 0 002.748 1.35m8.272-6.842V4.5c0 2.108-.966 3.99-2.48 5.228m2.48-5.492a46.32 46.32 0 012.916.52 6.003 6.003 0 01-5.395 4.972m0 0a6.726 6.726 0 01-2.749 1.35m0 0a6.772 6.772 0 01-3.044 0" />
              </svg>
            </div>
            <div>
              <h3 className="font-semibold text-white dark:text-white">Gamification & Rewards</h3>
              <p className="text-white/80 text-sm">Earn tokens and achievements for meaningful interactions and emotional growth</p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
