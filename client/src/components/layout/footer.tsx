import { useState } from "react";
import { Link } from "wouter";
import {
  MessageSquare,
  Heart,
  User,
  Users,
  Gift,
  Video,
  PenTool,
  Gamepad2,
  FileText,
  Mail,
  Github,
  Twitter,
  Instagram,
  Facebook,
  Linkedin,
  Youtube,
  ExternalLink,
  ChevronRight,
  MessageCircle,
  Sparkles,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Dialog, DialogContent, DialogTrigger } from "@/components/ui/dialog";
import FeedbackForm from "@/components/feedback/feedback-form";
import { useAuth } from "@/hooks/use-auth";
import { useToast } from "@/hooks/use-toast";

export default function Footer() {
  const { user } = useAuth();
  const [feedbackDialogOpen, setFeedbackDialogOpen] = useState(false);
  const { toast } = useToast();

  const handleFeedbackSubmit = async (data: {
    category: string;
    title: string;
    description: string;
    isAnonymous: boolean;
  }) => {
    try {
      // Format content for API
      const content = `${data.title}\n\nCategory: ${data.category}\n\n${data.description}${data.isAnonymous ? '\n\n[Submitted anonymously]' : ''}`;
      
      // Send to the API
      const response = await fetch('/api/feedback', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ content }),
        credentials: 'include'
      });
      
      if (!response.ok) {
        throw new Error('Failed to submit feedback');
      }
      
      toast({
        title: "Feedback submitted successfully",
        description: "Thank you for helping us improve MoodLync!",
        variant: "default",
      });
      
      setFeedbackDialogOpen(false);
    } catch (error) {
      console.error('Error submitting feedback:', error);
      toast({
        title: "Failed to submit feedback",
        description: "Please try again later or contact support.",
        variant: "destructive",
      });
    }
  };

  const footerLinks = [
    {
      title: "Features",
      links: [
        { name: "Emotion Journal", href: "/" },
        { name: "Mood Games", href: "/mood-games" },
        { name: "Friend Book", href: "/friends" },
        { name: "Video Sharing", href: "/videos" },
        { name: "Challenge Dashboard", href: "/user-challenges" },
      ],
    },
    {
      title: "Rewards",
      links: [
        { name: "Token Redemption", href: "/tokens" },
        { name: "Token Milestones", href: "/milestones" },
        { name: "Referral Program", href: "/referrals" },
      ],
    },
    {
      title: "Premium",
      links: [
        { name: "Premium Features", href: "/premium" },
        { name: "Family Plan", href: "/family" },
        { name: "Video Editor", href: "/video-editor" },
        { name: "Premium Chat", href: "/premium/chat" },
      ],
    },
    {
      title: "Support",
      links: [
        { name: "Contact Us", href: "/contact" },
        { name: "Privacy Policy", href: "#" },
        { name: "Terms of Service", href: "#" },
        {
          name: "Feedback",
          onClick: () => setFeedbackDialogOpen(true),
          href: "#",
        },
        { name: "Admin Panel", href: "/admin/login" },
      ],
    },
  ];

  const socialLinks = [
    { icon: <Twitter className="h-5 w-5" />, href: "#" },
    { icon: <Facebook className="h-5 w-5" />, href: "#" },
    { icon: <Instagram className="h-5 w-5" />, href: "#" },
    { icon: <Youtube className="h-5 w-5" />, href: "#" },
    { icon: <Linkedin className="h-5 w-5" />, href: "#" },
  ];

  return (
    <div className="footer-wrapper">
      {/* Colored divider between content and footer */}
      <div className="w-full h-2 bg-gradient-to-r from-indigo-500 via-purple-500 to-indigo-500"></div>
      
      <footer className="bg-gradient-to-b from-slate-50 to-slate-100 dark:from-slate-900 dark:to-slate-950 border-t border-slate-200 dark:border-slate-800">
        <div className="container max-w-7xl py-10">
        <div className="grid grid-cols-1 md:grid-cols-5 gap-10">
          {/* Logo and main info */}
          <div className="md:col-span-2 space-y-4">
            <div className="flex items-center space-x-2">
              <div className="h-10 w-10 flex items-center justify-center bg-blue-500 text-white font-bold rounded-full">
                <span className="text-sm">ML</span>
              </div>
              <span className="text-2xl font-bold">
                <span className="text-slate-900 dark:text-slate-100 font-extrabold" style={{ textShadow: '0px 1px 2px rgba(0,0,0,0.05)' }}>Mood</span>
                <span className="text-indigo-600 dark:text-indigo-400 font-extrabold" style={{ textShadow: '0px 1px 2px rgba(79,70,229,0.05)' }}>Lync</span>
              </span>
            </div>
            <p className="text-slate-600 dark:text-slate-300">
              An innovative platform that connects people based on their emotional state,
              fostering authentic conversations and meaningful connections.
            </p>
            <div className="pt-2 flex space-x-3">
              <a href="#" className="text-sm text-slate-600 dark:text-slate-300 hover:text-indigo-600 dark:hover:text-indigo-400 flex items-center">
                <Heart className="h-4 w-4 mr-1.5 text-pink-500" />
                <span>About Us</span>
              </a>
              <a href="#" className="text-sm text-slate-600 dark:text-slate-300 hover:text-indigo-600 dark:hover:text-indigo-400 flex items-center">
                <Users className="h-4 w-4 mr-1.5 text-indigo-500" />
                <span>Careers</span>
              </a>
            </div>
          </div>

          {/* Footer links */}
          <div className="md:col-span-3 grid grid-cols-2 sm:grid-cols-4 gap-8">
            {footerLinks.map((group) => (
              <div key={group.title} className="space-y-3">
                <h3 className="text-sm font-medium">{group.title}</h3>
                <ul className="space-y-2">
                  {group.links.map((link) => (
                    <li key={link.name}>
                      {link.onClick ? (
                        <button
                          onClick={link.onClick}
                          className="text-sm text-slate-600 dark:text-slate-400 hover:text-indigo-600 dark:hover:text-indigo-400 transition-colors flex items-center"
                        >
                          <ChevronRight className="h-3 w-3 mr-1 text-indigo-600 dark:text-indigo-400" />
                          {link.name}
                        </button>
                      ) : (
                        <Link
                          href={link.href}
                          className="text-sm text-slate-600 dark:text-slate-400 hover:text-indigo-600 dark:hover:text-indigo-400 transition-colors flex items-center"
                        >
                          <ChevronRight className="h-3 w-3 mr-1 text-indigo-600 dark:text-indigo-400" />
                          {link.name}
                        </Link>
                      )}
                    </li>
                  ))}
                </ul>
              </div>
            ))}
          </div>
        </div>

        {/* Customer Support Section */}
        <div className="mt-12 p-6 rounded-xl bg-gradient-to-br from-indigo-50 to-purple-50 dark:from-indigo-950/30 dark:to-purple-950/30 border border-indigo-100 dark:border-indigo-800/20 shadow-sm">
          <h3 className="text-lg font-semibold mb-4 text-slate-900 dark:text-white flex items-center">
            <Heart className="h-5 w-5 mr-2 text-pink-500" />
            We're Here To Help
          </h3>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            {/* Contact Options */}
            <div className="md:col-span-2 grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div className="p-3 bg-white/80 dark:bg-slate-800/80 rounded-lg border border-indigo-100 dark:border-slate-700 hover:shadow-md transition-shadow">
                <Mail className="h-5 w-5 text-indigo-500 mb-2" />
                <h4 className="font-medium mb-1 text-slate-900 dark:text-slate-100">Email Support</h4>
                <p className="text-sm text-slate-500 dark:text-slate-400">support@moodlync.com</p>
                <p className="text-xs text-slate-400 dark:text-slate-500 mt-2">Response within 24 hours</p>
              </div>
              <div className="p-3 bg-white/80 dark:bg-slate-800/80 rounded-lg border border-indigo-100 dark:border-slate-700 hover:shadow-md transition-shadow">
                <MessageCircle className="h-5 w-5 text-indigo-500 mb-2" />
                <h4 className="font-medium mb-1 text-slate-900 dark:text-slate-100">Live Chat</h4>
                <p className="text-sm text-slate-500 dark:text-slate-400">Available 24/7</p>
                <p className="text-xs text-slate-400 dark:text-slate-500 mt-2">Typical response in 5 minutes</p>
              </div>
              <div className="p-3 bg-white/80 dark:bg-slate-800/80 rounded-lg border border-indigo-100 dark:border-slate-700 hover:shadow-md transition-shadow">
                <FileText className="h-5 w-5 text-indigo-500 mb-2" />
                <h4 className="font-medium mb-1 text-slate-900 dark:text-slate-100">Help Center</h4>
                <p className="text-sm text-slate-500 dark:text-slate-400">Browse our documentation</p>
                <p className="text-xs text-slate-400 dark:text-slate-500 mt-2">Find answers to common questions</p>
              </div>
            </div>
            
            {/* Feedback Section */}
            <div className="bg-gradient-to-r from-indigo-100 to-purple-100 dark:from-indigo-900/40 dark:to-purple-900/40 p-4 rounded-lg border border-indigo-200 dark:border-indigo-800/30">
              <div className="text-center mb-3">
                <Sparkles className="h-6 w-6 text-indigo-600 dark:text-indigo-400 mx-auto mb-2" />
                <h3 className="font-semibold text-slate-900 dark:text-white">Share Your Feedback</h3>
                <p className="text-sm text-slate-600 dark:text-slate-300 mb-3">
                  Help us improve your experience
                </p>
                <Dialog open={feedbackDialogOpen} onOpenChange={setFeedbackDialogOpen}>
                  <DialogTrigger asChild>
                    <Button variant="outline" className="w-full bg-white dark:bg-slate-800 border-indigo-200 dark:border-indigo-800 hover:bg-indigo-50 dark:hover:bg-indigo-900/30">
                      <MessageSquare className="h-4 w-4 mr-2 text-indigo-500" />
                      Give Feedback
                    </Button>
                  </DialogTrigger>
                  <DialogContent className="sm:max-w-[550px]">
                    <FeedbackForm 
                      onSubmit={handleFeedbackSubmit} 
                      isAuthenticated={!!user}
                    />
                  </DialogContent>
                </Dialog>
              </div>
            </div>
          </div>
        </div>

        <div className="border-t mt-10 pt-6">
          <div className="flex flex-col sm:flex-row justify-between items-center gap-4">
            <div className="text-sm text-slate-600 dark:text-slate-400">
              © 2025 <span className="text-slate-900 dark:text-white font-medium">MoodLync</span> | Powered by: <span className="font-medium text-indigo-700 dark:text-indigo-400">Rollover Australia Inc.</span> | All rights reserved.
            </div>
            <div className="flex space-x-4">
              {socialLinks.map((link, index) => (
                <a
                  key={index}
                  href={link.href}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="text-slate-500 dark:text-slate-400 hover:text-indigo-600 dark:hover:text-indigo-400 transition-colors"
                >
                  {link.icon}
                </a>
              ))}
            </div>
          </div>
        </div>
      </div>
    </footer>
    </div>
  );
}