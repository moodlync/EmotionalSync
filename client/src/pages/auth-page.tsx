import { useState, useEffect } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import { useAuth } from "@/hooks/use-auth";
import { insertUserSchema, GenderType } from "@shared/schema";
import { useLocation } from "wouter";
import { Button } from "@/components/ui/button";
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage, FormDescription } from "@/components/ui/form";
import { Input } from "@/components/ui/input";
import { Card, CardContent } from "@/components/ui/card";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { useToast } from "@/hooks/use-toast";
import { isNetlifyEnvironment, isReplitEnvironment } from "@/lib/netlify-auth-config";
import { 
  Loader2, Heart, Eye, EyeOff, Info, ArrowRight, Brain, Shield, Star, AlertCircle, AlertTriangle,
  Sparkles, MapPin, MessageCircle, Users, Gamepad, BarChart3, Crown, Bot, CheckCircle,
  Mail, User, Lock, ShieldCheck, Check
} from "lucide-react";
import AuthPageLogo from "@/components/logo/auth-page-logo";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";

// Helper to determine if we're in development mode
const isDevelopment = import.meta.env.MODE === 'development';

// Login form schema
const loginSchema = z.object({
  username: z.string().min(3, "Username must be at least 3 characters"),
  password: z.string().min(8, "Password must be at least 8 characters"),
  rememberMe: z.boolean().default(false),
});

// Simplified registration schema with only essential fields
const registerSchema = z.object({
  username: z.string()
    .min(3, "Username must be at least 3 characters")
    .regex(/^[a-zA-Z0-9_-]+$/, "Username can only contain letters, numbers, underscores and hyphens"),
  email: z.string().email("Please enter a valid email address"),
  password: z.string().min(8, "Password must be at least 8 characters"),
  confirmPassword: z.string(),
  firstName: z.string().min(1, "First name is required"),
  lastName: z.string().min(1, "Last name is required"),
  gender: z.enum(["male", "female", "non_binary", "other", "prefer_not_to_say"] as const).default("prefer_not_to_say"),
  // Make these optional with empty defaults
  middleName: z.string().optional().default(""),
  state: z.string().optional().default(""),
  country: z.string().optional().default(""),
}).refine(data => data.password === data.confirmPassword, {
  message: "Passwords don't match",
  path: ["confirmPassword"],
});

export default function AuthPage() {
  const [activeTab, setActiveTab] = useState<string>("login");
  const { user, loginMutation, registerMutation, isLoading } = useAuth();
  const [, navigate] = useLocation();
  const { toast } = useToast();
  
  // For showing/hiding password
  const [showPassword, setShowPassword] = useState(false);
  
  // For gender display (used in registration preview)
  const [userGender, setUserGender] = useState<GenderType | null>(null);

  // Login form
  const loginForm = useForm<z.infer<typeof loginSchema>>({
    resolver: zodResolver(loginSchema),
    defaultValues: {
      username: "",
      password: "",
      rememberMe: false,
    },
  });

  // Register form with simplified fields
  const registerForm = useForm<z.infer<typeof registerSchema>>({
    resolver: zodResolver(registerSchema),
    defaultValues: {
      username: "",
      email: "",
      password: "",
      confirmPassword: "",
      firstName: "",
      lastName: "",
      middleName: "",
      gender: "prefer_not_to_say" as GenderType,
      state: "",
      country: "",
    },
  });

  // Handle gender selection
  useEffect(() => {
    const subscription = registerForm.watch((value, { name }) => {
      if (name === 'gender') {
        setUserGender(value.gender as GenderType);
      }
    });
    return () => subscription.unsubscribe();
  }, [registerForm]);

  // Force light mode in auth page
  useEffect(() => {
    // Save previous theme for restoration when navigating away
    const prevTheme = document.documentElement.classList.contains('dark') ? 'dark' : 'light';
    localStorage.setItem('prev-theme', prevTheme);
    
    // Force light mode
    document.documentElement.classList.remove('dark');
    
    return () => {
      // Restore previous theme when unmounting
      const savedTheme = localStorage.getItem('prev-theme');
      if (savedTheme === 'dark') {
        document.documentElement.classList.add('dark');
      }
    };
  }, []);

  // Auto-login and redirect to home page
  useEffect(() => {
    if (user) {
      navigate("/");
    } else {
      // Auto-login with default credentials (authentication removed)
      const defaultCredentials = {
        username: "moodlync_user",
        password: "password123",
        rememberMe: true
      };
      
      // Set the form values for display purposes
      loginForm.setValue("username", defaultCredentials.username);
      loginForm.setValue("password", defaultCredentials.password);
      loginForm.setValue("rememberMe", defaultCredentials.rememberMe);
      
      // Automatically trigger login after a short delay
      const timer = setTimeout(() => {
        loginMutation.mutate(defaultCredentials);
        // Force navigation after login attempt regardless of success/failure
        setTimeout(() => {
          if (!user) {
            console.log("Auto-navigating to home page after login attempt");
            navigate("/");
          }
        }, 500);
      }, 1000);
      
      return () => clearTimeout(timer);
    }
  }, [user, navigate, loginForm, loginMutation]);

  // Handle Enter key in the login form
  const handleKeyDown = (e: KeyboardEvent) => {
    if (e.key === 'Enter' && activeTab === 'login') {
      loginForm.handleSubmit(onLoginSubmit)();
    }
  };

  useEffect(() => {
    document.addEventListener('keydown', handleKeyDown);
    return () => {
      document.removeEventListener('keydown', handleKeyDown);
    };
  }, [activeTab]);

  // Login form submission
  const onLoginSubmit = async (values: z.infer<typeof loginSchema>) => {
    try {
      const isNetlify = isNetlifyEnvironment();
      const isReplit = isReplitEnvironment();
      console.log(`Login submission - hostname: ${window.location.hostname}, origin: ${window.location.origin}`);
      console.log(`Environment detection: Netlify: ${isNetlify}, Replit: ${isReplit}`);
      loginMutation.mutate(values, {
        onSuccess: () => {
          // Toast notification
          toast({
            title: "Login successful",
            description: "Welcome back to MoodLync!",
          });
        },
        onError: (error) => {
          // Set form error
          loginForm.setError("root", {
            message: error instanceof Error 
              ? error.message 
              : "An error occurred during login. Please try again."
          });
        }
      });
    } catch (error) {
      console.error("Login form error:", error);
      
      toast({
        title: "Login Error",
        description: "We encountered an issue. Please try again.",
        variant: "destructive",
      });
    }
  };

  // Enhanced registration submission function
  const onRegisterSubmit = async (values: z.infer<typeof registerSchema>) => {
    try {
      // Remove confirmPassword as it's not part of the API schema
      const { confirmPassword, ...registerData } = values;
      
      // Check network connection
      if (!navigator.onLine) {
        toast({
          title: "Connection Error",
          description: "You appear to be offline. Please check your internet connection and try again.",
          variant: "destructive",
        });
        return;
      }

      // Log the data being submitted for debugging
      console.log("Submitting registration data:", registerData);
      console.log(`Registration submission - hostname: ${window.location.hostname}, origin: ${window.location.origin}`);
      
      // Show loading toast
      toast({
        title: "Creating your account",
        description: "Please wait while we set up your MoodLync experience...",
      });
      
      // Ensure all required fields are present
      const submissionData = {
        ...registerData,
        // Make sure optional fields are provided with defaults if not set
        middleName: registerData.middleName || "",
        gender: registerData.gender || "prefer_not_to_say",
        state: registerData.state || "",
        country: registerData.country || "",
      };
      
      // Submit registration data
      registerMutation.mutate(submissionData, {
        onSuccess: () => {
          toast({
            title: "Success!",
            description: "Your account has been created successfully!",
            variant: "default",
          });
        },
        onError: (error) => {
          // Handle registration errors
          const errorMessage = error instanceof Error 
            ? error.message 
            : "An unexpected error occurred during registration";
          
          console.error("Registration error:", errorMessage);
          
          // Handle common error types
          if (errorMessage.toLowerCase().includes('username') || errorMessage.toLowerCase().includes('taken')) {
            registerForm.setError('username', { 
              message: "This username is already taken. Please choose a different one."
            });
          } else if (errorMessage.toLowerCase().includes('email') || errorMessage.toLowerCase().includes('already registered')) {
            registerForm.setError('email', { 
              message: "This email is already registered. Please use a different email or login."
            });
          } else if (errorMessage.toLowerCase().includes('password')) {
            registerForm.setError('password', { 
              message: "Password doesn't meet security requirements."
            });
          } else {
            // Generic error
            registerForm.setError('root', {
              message: "Registration could not be completed. Please try again."
            });
            
            toast({
              title: "Registration Failed",
              description: "We couldn't complete your registration. Please try again.",
              variant: "destructive",
            });
          }
        }
      });
    } catch (error) {
      console.error("Registration form error:", error);
      
      toast({
        title: "Registration Error",
        description: "We encountered an issue. Please try again.",
        variant: "destructive",
      });
    }
  };

  return (
    <div className="min-h-screen w-full relative overflow-hidden bg-gradient-to-b from-white to-gray-50 dark:from-gray-950 dark:to-gray-900">
      <div className="container max-w-screen-xl mx-auto px-4 sm:px-6 py-12 md:flex items-center justify-between">
        <Card className="w-full max-w-[480px] mx-auto md:mx-0 border-none shadow-lg md:shadow-xl">
          <CardContent className="p-6 md:p-8">
            <div className="flex flex-col items-center mb-6">
              <AuthPageLogo className="h-8" />
              <p className="text-sm text-muted-foreground mt-2">Emotion-driven social connections</p>
            </div>
            
            <Tabs defaultValue="login" value={activeTab} onValueChange={setActiveTab} className="w-full">
              <TabsList className="grid w-full grid-cols-2 mb-8">
                <TabsTrigger value="login">Log In</TabsTrigger>
                <TabsTrigger value="register">Sign Up</TabsTrigger>
              </TabsList>
              
              <TabsContent value="login">
                <Form {...loginForm}>
                  <form onSubmit={loginForm.handleSubmit(onLoginSubmit)} className="space-y-4">
                    {/* Display form-level errors */}
                    {loginForm.formState.errors.root && (
                      <div className="bg-destructive/10 p-3 rounded-md mb-4 border border-destructive/20">
                        <div className="flex gap-2 items-start">
                          <AlertCircle className="h-5 w-5 text-destructive shrink-0 mt-0.5" />
                          <div className="text-destructive text-sm font-medium">
                            {loginForm.formState.errors.root.message}
                          </div>
                        </div>
                      </div>
                    )}
                    
                    <FormField
                      control={loginForm.control}
                      name="username"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel>Username</FormLabel>
                          <FormControl>
                            <div className="relative">
                              <Input
                                placeholder="Enter your username"
                                className="pl-10"
                                {...field}
                              />
                              <User className="h-5 w-5 text-muted-foreground absolute left-3 top-1/2 transform -translate-y-1/2" />
                            </div>
                          </FormControl>
                          <FormMessage />
                        </FormItem>
                      )}
                    />
                    
                    <FormField
                      control={loginForm.control}
                      name="password"
                      render={({ field }) => (
                        <FormItem>
                          <div className="flex items-center justify-between">
                            <FormLabel>Password</FormLabel>
                            <a 
                              href="#" 
                              onClick={(e) => { 
                                e.preventDefault();
                                toast({
                                  title: "Password Reset",
                                  description: "If you've forgotten your password, please contact support.",
                                });
                              }}
                              className="text-xs text-primary hover:underline"
                            >
                              Forgot password?
                            </a>
                          </div>
                          <FormControl>
                            <div className="relative">
                              <Input
                                type={showPassword ? "text" : "password"}
                                placeholder="Enter your password"
                                className="pl-10"
                                {...field}
                              />
                              <Lock className="h-5 w-5 text-muted-foreground absolute left-3 top-1/2 transform -translate-y-1/2" />
                              <Button
                                type="button"
                                variant="ghost"
                                size="sm"
                                className="absolute right-0 top-0 h-full px-3 py-2"
                                onClick={() => setShowPassword(!showPassword)}
                              >
                                {showPassword ? (
                                  <EyeOff className="h-4 w-4" />
                                ) : (
                                  <Eye className="h-4 w-4" />
                                )}
                              </Button>
                            </div>
                          </FormControl>
                          <FormMessage />
                        </FormItem>
                      )}
                    />
                    
                    <FormField
                      control={loginForm.control}
                      name="rememberMe"
                      render={({ field }) => (
                        <div className="flex items-center space-x-2 mt-2">
                          <input
                            type="checkbox"
                            id="rememberMe"
                            checked={field.value}
                            onChange={field.onChange}
                            className="h-4 w-4 rounded border-gray-300 text-primary focus:ring-primary"
                          />
                          <label htmlFor="rememberMe" className="text-sm text-gray-600 dark:text-gray-400">
                            Remember me for 30 days
                          </label>
                        </div>
                      )}
                    />
                    
                    <Button type="submit" className="w-full" disabled={loginMutation.isPending}>
                      {loginMutation.isPending ? (
                        <div className="flex items-center">
                          <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                          <span>Logging in...</span>
                        </div>
                      ) : (
                        "Log in"
                      )}
                    </Button>
                    
                    {isDevelopment && (
                      <div className="mt-4 p-3 bg-blue-50 dark:bg-blue-950/30 border border-blue-200 dark:border-blue-800/50 rounded-md">
                        <div className="flex items-start">
                          <Info className="h-5 w-5 text-blue-500 mr-2 flex-shrink-0" />
                          <div>
                            <p className="text-xs font-medium text-blue-700 dark:text-blue-400">Development Credentials</p>
                            <p className="text-xs mt-1 text-gray-600 dark:text-gray-400">Username: <span className="font-mono bg-gray-100 dark:bg-gray-800 px-1 py-0.5 rounded">test</span></p>
                            <p className="text-xs text-gray-600 dark:text-gray-400">Password: <span className="font-mono bg-gray-100 dark:bg-gray-800 px-1 py-0.5 rounded">password123</span></p>
                          </div>
                        </div>
                      </div>
                    )}
                  </form>
                </Form>
              </TabsContent>
              
              <TabsContent value="register">
                <div className="text-center mb-6">
                  <h2 className="text-2xl font-bold bg-gradient-to-r from-primary to-purple-500 bg-clip-text text-transparent">Join Moodlync — Your Emotions, Understood</h2>
                  <p className="text-muted-foreground mt-1">Get started with a secure account.</p>
                </div>
                
                <Form {...registerForm}>
                  <form onSubmit={registerForm.handleSubmit(onRegisterSubmit)} className="space-y-5">
                    {/* Display form-level errors */}
                    {registerForm.formState.errors.root && (
                      <div className="bg-destructive/10 p-3 rounded-md mb-4 border border-destructive/20">
                        <div className="flex gap-2 items-start">
                          <AlertCircle className="h-5 w-5 text-destructive shrink-0 mt-0.5" />
                          <div className="text-destructive text-sm font-medium">
                            {registerForm.formState.errors.root.message}
                          </div>
                        </div>
                      </div>
                    )}
                    
                    {/* Email Field */}
                    <FormField
                      control={registerForm.control}
                      name="email"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel>Email address</FormLabel>
                          <FormControl>
                            <div className="relative">
                              <Input 
                                type="email" 
                                placeholder="name@example.com" 
                                autoCapitalize="off"
                                className={`pl-10 ${registerForm.formState.errors.email ? 'border-red-500 focus:ring-red-500' : ''}`}
                                {...field} 
                              />
                              <Mail className="h-5 w-5 text-muted-foreground absolute left-3 top-1/2 transform -translate-y-1/2" />
                            </div>
                          </FormControl>
                          <FormMessage />
                        </FormItem>
                      )}
                    />
                    
                    {/* Username Field */}
                    <FormField
                      control={registerForm.control}
                      name="username"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel>Username</FormLabel>
                          <FormControl>
                            <div className="relative">
                              <Input 
                                placeholder="Choose a unique username" 
                                className="pl-10"
                                {...field} 
                              />
                              <User className="h-5 w-5 text-muted-foreground absolute left-3 top-1/2 transform -translate-y-1/2" />
                            </div>
                          </FormControl>
                          <FormDescription className="text-xs">
                            Letters, numbers, underscores and hyphens only.
                          </FormDescription>
                          <FormMessage />
                        </FormItem>
                      )}
                    />
                    
                    {/* Name Fields */}
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
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
                    
                    {/* Password Section */}
                    <div className="space-y-4 pt-2">
                      <h3 className="text-sm font-medium text-gray-500 dark:text-gray-300">Password</h3>
                      
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
                              <FormLabel>Create password</FormLabel>
                              <FormControl>
                                <div className="relative">
                                  <Input 
                                    type={showPassword ? "text" : "password"} 
                                    placeholder="Minimum 8 characters" 
                                    className="pl-10 pr-14"
                                    {...field} 
                                  />
                                  <Lock className="h-5 w-5 text-muted-foreground absolute left-3 top-1/2 transform -translate-y-1/2" />
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
                                      className={`h-1 rounded-full ${getStrengthColor()} transition-all duration-300`} 
                                      style={{width: `${passwordStrength}%`}}
                                    ></div>
                                  </div>
                                  <div className="text-xs text-gray-500 mt-1 flex justify-between">
                                    <span>
                                      {passwordStrength < 30 && "Very weak"}
                                      {passwordStrength >= 30 && passwordStrength < 60 && "Weak"}
                                      {passwordStrength >= 60 && passwordStrength < 80 && "Good"}
                                      {passwordStrength >= 80 && "Strong"}
                                    </span>
                                    <span>{Math.round(passwordStrength)}%</span>
                                  </div>
                                </>
                              )}
                              
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
                              <FormLabel>Confirm password</FormLabel>
                              <FormControl>
                                <div className="relative">
                                  <Input 
                                    type={showConfirmPassword ? "text" : "password"} 
                                    placeholder="Re-enter your password" 
                                    className="pl-10 pr-14"
                                    {...field} 
                                  />
                                  <ShieldCheck className="h-5 w-5 text-muted-foreground absolute left-3 top-1/2 transform -translate-y-1/2" />
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
                    
                    {/* Creation Button */}
                    <div className="pt-2">
                      <Button 
                        type="submit" 
                        className="w-full h-11 text-base relative overflow-hidden"
                        disabled={registerMutation.isPending}
                      >
                        <span className={`flex items-center justify-center transition-all duration-300 ${
                          registerMutation.isPending ? "opacity-0" : "opacity-100"
                        }`}>
                          Create Your Account
                        </span>
                        
                        {registerMutation.isPending && (
                          <span className="absolute inset-0 flex items-center justify-center">
                            <Loader2 className="h-5 w-5 animate-spin mr-2" />
                            <span>Creating account...</span>
                          </span>
                        )}
                      </Button>
                      
                      {/* Conversion booster text */}
                      <p className="text-xs text-center text-muted-foreground mt-3">
                        Join 500K+ users tracking their emotions. 
                        <br />We hate spam too. Unsubscribe anytime.
                      </p>
                    </div>
                    
                    {/* Social Login Options */}
                    <div className="mt-6 relative">
                      <div className="absolute inset-0 flex items-center">
                        <div className="w-full border-t border-gray-300 dark:border-gray-700"></div>
                      </div>
                      <div className="relative flex justify-center text-xs">
                        <span className="px-2 bg-white dark:bg-card text-muted-foreground">
                          Or continue with
                        </span>
                      </div>
                    </div>
                    
                    <div className="grid grid-cols-2 gap-3 mt-6">
                      <Button 
                        type="button" 
                        variant="outline" 
                        className="flex items-center justify-center gap-2"
                        onClick={() => {
                          toast({
                            title: "Google Sign-up",
                            description: "Google authentication will be available soon!",
                          });
                        }}
                      >
                        <svg xmlns="http://www.w3.org/2000/svg" width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="none">
                          <path d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z" fill="#4285F4"/>
                          <path d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z" fill="#34A853"/>
                          <path d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z" fill="#FBBC05"/>
                          <path d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z" fill="#EA4335"/>
                        </svg>
                        Google
                      </Button>
                      
                      <Button 
                        type="button" 
                        variant="outline" 
                        className="flex items-center justify-center gap-2"
                        onClick={() => {
                          toast({
                            title: "Apple Sign-up",
                            description: "Apple authentication will be available soon!",
                          });
                        }}
                      >
                        <svg xmlns="http://www.w3.org/2000/svg" width="18" height="18" viewBox="0 0 24 24" fill="currentColor">
                          <path d="M16.5 3c-2.08 0-3.75 1.7-3.75 3.8 0 .17.01.33.03.5h-.03c-1.49 0-2.97 1.4-3.7 2.9-.52 1.02-.74 2.1-.74 3.2 0 3.54 2.64 7.6 4.69 7.6.78 0 1.61-.7 2.5-.7.91 0 1.59.7 2.5.7 2.08 0 4.75-4.06 4.75-7.6 0-2.28-1.27-4.03-3.25-4.7-1.12-1.91-2.13-5.5-3-5.5zm-.4-3c.79 0 1.68.9 2.65 2.91.87.17 3.25 1.05 3.25 4.39 0 4.47-3.4 8.7-5.75 8.7-1.19 0-2.02-.7-3-.7-.93 0-1.85.7-3 .7-2.49 0-5.75-4.47-5.75-8.7 0-1.29.27-2.57.85-3.75.9-1.89 2.65-3.55 4.65-3.55h.04c.72-1.76 2.48-3 4.51-3h1.55z"/>
                        </svg>
                        Apple
                      </Button>
                    </div>

                    {/* Email Verification UI (conditionally shown) */}
                    {registerMutation.isSuccess && (
                      <div className="mt-6 p-5 bg-primary/5 rounded-lg border border-primary/20 text-center">
                        <div className="mx-auto w-16 h-16 mb-4 bg-primary/10 rounded-full flex items-center justify-center">
                          <Mail className="h-8 w-8 text-primary animate-pulse" />
                        </div>
                        <h3 className="text-lg font-semibold">Email Verification Required</h3>
                        <p className="text-sm text-muted-foreground mb-3">
                          We've sent a magic link to your inbox. Click it to unlock:
                        </p>
                        <div className="text-sm">
                          <div className="flex items-center justify-center mb-2">
                            <Check className="h-4 w-4 text-green-500 mr-2" /> Full mood tracking
                          </div>
                          <div className="flex items-center justify-center mb-2">
                            <Check className="h-4 w-4 text-green-500 mr-2" /> Social connections
                          </div>
                          <div className="flex items-center justify-center">
                            <Check className="h-4 w-4 text-green-500 mr-2" /> AI insights
                          </div>
                        </div>
                        
                        {/* Progress bar */}
                        <div className="mt-4 mb-3">
                          <div className="h-1 w-full bg-gray-200 rounded-full">
                            <div className="h-1 bg-primary rounded-full w-1/2"></div>
                          </div>
                          <div className="text-xs text-muted-foreground mt-1 flex justify-between">
                            <span>1/2: Verify email</span>
                            <span>2/2: Welcome!</span>
                          </div>
                        </div>
                        
                        {/* Resend option */}
                        <div className="mt-4 text-sm">
                          <p>No email? Check spam or 
                            <Button variant="link" className="p-0 h-auto text-sm font-medium ml-1">
                              Resend Link
                            </Button>
                          </p>
                        </div>
                      </div>
                    )}
                    
                    {/* Registration Error Message */}
                    {registerMutation.isError && (
                      <div className="mt-4 p-3 bg-red-50 dark:bg-red-950/30 border border-red-200 dark:border-red-800/50 rounded-md text-sm text-red-600 dark:text-red-400 flex items-start">
                        <AlertCircle className="h-5 w-5 mr-2 flex-shrink-0 text-red-500" />
                        <div>
                          {registerMutation.error?.message?.toLowerCase().includes('email already exists') ? (
                            <>
                              <p className="font-medium">Email already exists</p>
                              <p className="mb-2">This email address is already registered with us.</p>
                              <Button 
                                variant="outline" 
                                size="sm" 
                                className="text-xs border-red-200 hover:bg-red-50"
                                onClick={() => setActiveTab("login")}
                              >
                                Log in instead
                              </Button>
                            </>
                          ) : (
                            <>
                              <p className="font-medium">Registration failed</p>
                              <p>{registerMutation.error?.message || "Please check your information and try again."}</p>
                            </>
                          )}
                        </div>
                      </div>
                    )}
                  </form>
                </Form>
              </TabsContent>
            </Tabs>
          </CardContent>
        </Card>
        
        {/* Right side decorative content */}
        <div className="hidden md:block md:w-[55%] lg:w-[60%] md:ml-8 lg:ml-12">
          <div className="max-w-xl">
            <h2 className="text-2xl md:text-3xl lg:text-4xl font-bold text-gray-800 dark:text-white mb-6">
              Connect Through <span className="text-primary">Emotions</span>, Not Profiles
            </h2>
            
            <div className="space-y-5 md:space-y-6">
              <div className="bg-white/10 backdrop-blur-sm rounded-lg p-4 border border-gray-100/20">
                <div className="flex items-start">
                  <div className="bg-primary/20 p-2 rounded-full mr-3 flex-shrink-0">
                    <Heart className="h-5 w-5 text-primary" />
                  </div>
                  <div>
                    <h3 className="font-semibold text-gray-900 dark:text-white">Emotion-First Matching</h3>
                    <p className="text-gray-600 dark:text-gray-300 text-sm mt-1">Connect with people feeling the same way you do right now</p>
                  </div>
                </div>
              </div>
              
              <div className="bg-white/10 backdrop-blur-sm rounded-lg p-4 border border-gray-100/20">
                <div className="flex items-start">
                  <div className="bg-blue-500/20 p-2 rounded-full mr-3 flex-shrink-0">
                    <Shield className="h-5 w-5 text-blue-500" />
                  </div>
                  <div>
                    <h3 className="font-semibold text-gray-900 dark:text-white">Safe & Anonymous</h3>
                    <p className="text-gray-600 dark:text-gray-300 text-sm mt-1">Express yourself freely without judgment in our moderated environment</p>
                  </div>
                </div>
              </div>
              
              <div className="bg-white/10 backdrop-blur-sm rounded-lg p-4 border border-gray-100/20">
                <div className="flex items-start">
                  <div className="bg-green-500/20 p-2 rounded-full mr-3 flex-shrink-0">
                    <Brain className="h-5 w-5 text-green-500" />
                  </div>
                  <div>
                    <h3 className="font-semibold text-gray-900 dark:text-white">AI-Powered Insights</h3>
                    <p className="text-gray-600 dark:text-gray-300 text-sm mt-1">Gain valuable insights about your emotional patterns and trends</p>
                  </div>
                </div>
              </div>
              
              <div className="bg-white/10 backdrop-blur-sm rounded-lg p-4 border border-gray-100/20">
                <div className="flex items-start">
                  <div className="bg-yellow-500/20 p-2 rounded-full mr-3 flex-shrink-0">
                    <Star className="h-5 w-5 text-yellow-500" />
                  </div>
                  <div>
                    <h3 className="font-semibold text-gray-900 dark:text-white">Earn as You Engage</h3>
                    <p className="text-gray-600 dark:text-gray-300 text-sm mt-1">Collect tokens for activities and redeem for exclusive rewards</p>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}