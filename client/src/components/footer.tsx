import { Link } from "wouter";
import { Lock, MessageSquare, Send } from "lucide-react";
import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import { useToast } from "@/hooks/use-toast";
import { apiRequest, queryClient } from "@/lib/queryClient";

export default function Footer() {
  const [feedback, setFeedback] = useState("");
  const [isSending, setIsSending] = useState(false);
  const { toast } = useToast();

  const handleSubmitFeedback = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!feedback.trim()) return;

    try {
      setIsSending(true);
      // Send feedback to the server
      await apiRequest("POST", "/api/feedback", { content: feedback });
      
      toast({
        title: "Feedback Sent",
        description: "Thank you for your feedback! We value your input.",
      });
      
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
    <footer className="bg-gradient-to-b from-gray-50 to-gray-100 border-t border-gray-200 pt-10 pb-6 mt-auto">
      <div className="container mx-auto px-4">
        <div className="mx-auto flex flex-col items-center justify-center mb-8">
          <div className="flex flex-col items-center justify-center gap-1">
            <div className="flex items-center justify-center my-6 mb-8">
              <img 
                src="/assets/IMG_4705.jpeg" 
                alt="MoodLync Footer" 
                className="w-96 h-auto object-contain"
              />
            </div>
          </div>
        </div>
        
        <div className="grid grid-cols-1 md:grid-cols-3 gap-8 mb-8">
          <div className="text-center md:text-left">
            <h3 className="text-sm font-semibold uppercase tracking-wider text-gray-900 mb-3">
              Platform
            </h3>
            <ul className="space-y-2">
              <li>
                <Link to="/" className="text-gray-600 hover:text-primary">
                  Home
                </Link>
              </li>
              <li>
                <Link to="/user-challenges" className="text-gray-600 hover:text-primary">
                  Challenges
                </Link>
              </li>
              <li>
                <Link to="/premium" className="text-gray-600 hover:text-primary">
                  Premium
                </Link>
              </li>
              <li>
                <Link to="/tokens" className="text-gray-600 hover:text-primary">
                  Token Redemption
                </Link>
              </li>
              <li>
                <Link to="/faq" className="text-gray-600 hover:text-primary">
                  FAQ
                </Link>
              </li>
            </ul>
          </div>
          
          <div className="text-center">
            <h3 className="text-sm font-semibold uppercase tracking-wider text-gray-900 mb-3">
              Legal
            </h3>
            <ul className="space-y-2">
              <li>
                <Link to="/privacy" className="text-gray-600 hover:text-primary">
                  Privacy Policy
                </Link>
              </li>
              <li>
                <Link to="/terms" className="text-gray-600 hover:text-primary">
                  Terms of Service
                </Link>
              </li>
              <li>
                <Link to="/security" className="text-gray-600 hover:text-primary">
                  Security & Privacy
                </Link>
              </li>
              <li>
                <Link to="/roadmap" className="text-gray-600 hover:text-primary">
                  Roadmap
                </Link>
              </li>
              <li>
                <Link to="/admin/login" className="text-gray-600 hover:text-primary flex items-center justify-center md:justify-start">
                  <Lock className="h-3.5 w-3.5 mr-1" />
                  <span className="font-semibold">Admin Access</span>
                </Link>
              </li>
            </ul>
          </div>
          
          <div className="text-center md:text-right">
            <h3 className="text-sm font-semibold uppercase tracking-wider text-gray-900 mb-3">
              Connect
            </h3>
            <ul className="space-y-2">
              <li>
                <Link to="/contact" className="text-gray-600 hover:text-primary">
                  Contact Support
                </Link>
              </li>
              <li>
                <Link to="/referrals" className="text-gray-600 hover:text-primary">
                  Invite Friends
                </Link>
              </li>
              <li>
                <a href="mailto:support@moodlync.io" className="text-gray-600 hover:text-primary">
                  support@moodlync.io
                </a>
              </li>
              <li className="mt-4">
                <div className="flex items-center justify-end md:justify-end gap-2 text-gray-600">
                  <MessageSquare className="h-4 w-4" />
                  <span className="font-semibold">Share Your Feedback</span>
                </div>
                <form onSubmit={handleSubmitFeedback} className="mt-2">
                  <Textarea
                    placeholder="Suggest features or share your thoughts..."
                    className="min-h-[80px] text-sm resize-none bg-white"
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
              </li>
            </ul>
          </div>
        </div>
        
        <div className="border-t border-gray-200 pt-6 pb-2">
          <p className="text-center text-sm text-gray-600 font-medium">
            <span className="inline-block">&copy; 2025 MoodLync</span>
            <span className="mx-1 text-gray-400">|</span>
            <span className="inline-block">Powered by: Rollover Australia Inc.</span>
            <span className="mx-1 text-gray-400">|</span>
            <span className="inline-block">All rights reserved.</span>
          </p>
        </div>
      </div>
    </footer>
  );
}