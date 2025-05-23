import { Link } from "wouter";
import { Lock, MessageSquare, Send, Sparkles } from "lucide-react";
import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import { useToast } from "@/hooks/use-toast";
import { apiRequest, queryClient } from "@/lib/queryClient";

export default function Footer() {
  const [feedback, setFeedback] = useState("");
  const [isSending, setIsSending] = useState(false);
  const [feedbackSubmitted, setFeedbackSubmitted] = useState(false);
  const { toast } = useToast();

  const handleSubmitFeedback = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!feedback.trim()) return;

    try {
      setIsSending(true);
      // Send feedback to the server
      await apiRequest("POST", "/api/feedback", { content: feedback });
      
      // Show more detailed thank you message
      setFeedbackSubmitted(true);
      
      // Reset form
      setFeedback("");
    } catch (error) {
      toast({
        title: "Error",
        description: "Unable to send feedback. Please try again later.",
        variant: "destructive",
      });
    } finally {
      setIsSending(false);
    }
  };
  return (
    <footer className="bg-primary border-t border-primary/30 pt-10 pb-6 mt-auto text-white">
      <div className="container mx-auto px-4">
        <div className="mx-auto flex flex-col items-center justify-center mb-6">
          <div className="flex flex-col items-center justify-center gap-1">
            <div className="flex flex-col items-center justify-center my-6">
              <div className="flex items-center gap-3 mb-2">
                {/* SVG version of the logo */}
                <div className="flex items-center justify-center">
                  <img 
                    src="/assets/moodlync-logo-resized.jpg" 
                    alt="MoodLync Logo" 
                    width="50" 
                    height="50" 
                    className="rounded-sm object-contain"
                  />
                </div>
                
                <div className="flex flex-col ml-2">
                  <div className="font-extrabold tracking-tight text-lg leading-none">
                    <span className="text-black">MOOD</span>
                    <span className="text-red-600">LYNC</span>
                  </div>
                  <div className="text-white/80 text-xs leading-tight font-medium">
                    Connect - Detect - Reflect
                  </div>
                </div>
              </div>
            </div>
            
            {/* Feedback heading with icon */}
            <div className="flex items-center justify-center gap-2 mt-2 mb-1">
              <Sparkles className="h-5 w-5 text-yellow-300" />
              <h3 className="font-semibold text-white text-lg">Share your feedback</h3>
            </div>
            
            {/* Feedback form below the footer image */}
            {feedbackSubmitted ? (
              <div className="mt-6 p-4 bg-green-50 dark:bg-green-900 rounded-lg border border-green-200 dark:border-green-800 text-center w-full max-w-md mx-auto">
                <h4 className="text-green-700 dark:text-green-300 font-semibold mb-2">Thank you for your feedback!</h4>
                <p className="text-green-600 dark:text-green-400 text-sm">We will take your suggestions into account and will start working on it right away.</p>
                <Button 
                  className="mt-3 bg-green-600 hover:bg-green-700 text-white"
                  onClick={() => setFeedbackSubmitted(false)}
                >
                  Submit another feedback
                </Button>
              </div>
            ) : (
              <form onSubmit={handleSubmitFeedback} className="mt-4 w-full max-w-md">
                <Textarea
                  placeholder="Share your feedback or suggest features..."
                  className="min-h-[80px] text-sm resize-none bg-white dark:bg-gray-800 text-black dark:text-white border border-gray-300 dark:border-gray-700 placeholder:text-gray-500 dark:placeholder:text-gray-400"
                  value={feedback}
                  onChange={(e) => setFeedback(e.target.value)}
                />
                <Button 
                  type="submit" 
                  className="mt-2 w-full bg-gradient-to-r from-primary to-primary-foreground/90 hover:opacity-90"
                  disabled={isSending || !feedback.trim()}
                >
                  {isSending ? (
                    <span className="flex items-center gap-1">
                      <span className="h-4 w-4 animate-spin rounded-full border-2 border-t-transparent" />
                      Sending...
                    </span>
                  ) : (
                    <span className="flex items-center gap-1">
                      <Send className="h-3.5 w-3.5" />
                      Send Feedback
                    </span>
                  )}
                </Button>
              </form>
            )}
          </div>
        </div>
        
        <div className="grid grid-cols-1 md:grid-cols-3 gap-8 mb-8">
          <div className="text-center md:text-left">
            <h3 className="text-sm font-semibold uppercase tracking-wider text-white mb-3">
              Platform
            </h3>
            <ul className="space-y-2">
              <li>
                <Link to="/" className="text-gray-200 hover:text-white hover:underline transition-colors">
                  Home
                </Link>
              </li>
              <li>
                <Link to="/user-challenges" className="text-gray-200 hover:text-white hover:underline transition-colors">
                  Challenges
                </Link>
              </li>
              <li>
                <Link to="/premium" className="text-gray-200 hover:text-white hover:underline transition-colors">
                  Premium
                </Link>
              </li>
              <li>
                <Link to="/tokens" className="text-gray-200 hover:text-white hover:underline transition-colors">
                  Token Redemption
                </Link>
              </li>
              <li>
                <Link to="/faq" className="text-gray-200 hover:text-white hover:underline transition-colors">
                  FAQ
                </Link>
              </li>
            </ul>
          </div>
          
          <div className="text-center">
            <h3 className="text-sm font-semibold uppercase tracking-wider text-white mb-3">
              Legal
            </h3>
            <ul className="space-y-2">
              <li>
                <Link to="/privacy" className="text-gray-200 hover:text-white hover:underline transition-colors">
                  Privacy Policy
                </Link>
              </li>
              <li>
                <Link to="/terms" className="text-gray-200 hover:text-white hover:underline transition-colors">
                  Terms of Service
                </Link>
              </li>
              <li>
                <Link to="/security" className="text-gray-200 hover:text-white hover:underline transition-colors">
                  Security & Privacy
                </Link>
              </li>
              <li>
                <Link to="/roadmap" className="text-gray-200 hover:text-white hover:underline transition-colors">
                  Roadmap
                </Link>
              </li>
              <li>
                <Link to="/admin/login" className="text-gray-200 hover:text-white hover:underline transition-colors flex items-center justify-center md:justify-start">
                  <Lock className="h-3.5 w-3.5 mr-1" />
                  <span className="font-semibold">Admin Access</span>
                </Link>
              </li>
            </ul>
          </div>
          
          <div className="text-center md:text-right">
            <h3 className="text-sm font-semibold uppercase tracking-wider text-white mb-3">
              Connect
            </h3>
            <ul className="space-y-2">
              <li>
                <Link to="/contact" className="text-gray-200 hover:text-white hover:underline transition-colors">
                  Contact Support
                </Link>
              </li>
              <li>
                <Link to="/referrals" className="text-gray-200 hover:text-white hover:underline transition-colors">
                  Invite Friends
                </Link>
              </li>
              <li>
                <a href="mailto:support@moodlync.io" className="text-gray-200 hover:text-white hover:underline transition-colors">
                  support@moodlync.io
                </a>
              </li>
            </ul>
          </div>
        </div>
        
        <div className="border-t border-gray-300 dark:border-gray-400 pt-6 pb-2">
          <p className="text-center text-sm text-white font-medium">
            <span className="inline-block">&copy; 2025 MoodLync</span>
            <span className="mx-1 text-gray-300">|</span>
            <span className="inline-block">Powered by: Rollover Australia Inc.</span>
            <span className="mx-1 text-gray-300">|</span>
            <span className="inline-block">All rights reserved.</span>
          </p>
        </div>
      </div>
    </footer>
  );
}