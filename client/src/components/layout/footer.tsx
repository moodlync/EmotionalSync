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
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Dialog, DialogContent, DialogTrigger } from "@/components/ui/dialog";
import FeedbackForm from "@/components/feedback/feedback-form";
import { useAuth } from "@/hooks/use-auth";
import { useToast } from "@/hooks/use-toast";
import logoImage from '@/assets/logo-transparent-png.png';

export default function Footer() {
  const { user } = useAuth();
  const [feedbackDialogOpen, setFeedbackDialogOpen] = useState(false);
  const { toast } = useToast();
  
  const handleFeedbackSubmit = (data: {
    category: string;
    title: string;
    description: string;
    isAnonymous: boolean;
  }) => {
    // In a real app, we'd send this to the backend
    console.log("Feedback submitted:", data);
    setFeedbackDialogOpen(false);
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
    <footer className="bg-background border-t">
      <div className="container max-w-7xl py-10">
        <div className="grid grid-cols-1 md:grid-cols-5 gap-10">
          {/* Logo and main info */}
          <div className="md:col-span-2 space-y-4">
            <div className="flex items-center space-x-2">
              <img src={logoImage} alt="MoodLync Logo" className="h-10 w-auto" />
              <span className="text-2xl font-bold">
                <span className="text-black font-extrabold" style={{ textShadow: '0px 1px 2px rgba(0,0,0,0.1)' }}>Mood</span>
                <span className="text-red-600 font-extrabold" style={{ textShadow: '0px 1px 2px rgba(220,38,38,0.1)' }}>Lync</span>
              </span>
            </div>
            <p className="text-muted-foreground">
              An innovative platform that connects people based on their emotional state,
              fostering authentic conversations and meaningful connections.
            </p>
            <div className="pt-2">
              <Dialog open={feedbackDialogOpen} onOpenChange={setFeedbackDialogOpen}>
                <DialogTrigger asChild>
                  <Button variant="outline" size="sm">
                    <MessageSquare className="h-4 w-4 mr-2" />
                    Share Feedback
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
                          className="text-sm text-muted-foreground hover:text-foreground transition-colors flex items-center"
                        >
                          <ChevronRight className="h-3 w-3 mr-1 text-primary" />
                          {link.name}
                        </button>
                      ) : (
                        <Link
                          href={link.href}
                          className="text-sm text-muted-foreground hover:text-foreground transition-colors flex items-center"
                        >
                          <ChevronRight className="h-3 w-3 mr-1 text-primary" />
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
        
        <div className="border-t mt-10 pt-6">
          <div className="flex flex-col sm:flex-row justify-between items-center gap-4">
            <div className="text-sm text-muted-foreground">
              © 2025 <span className="text-black font-medium">MoodLync</span> | Powered by: <span className="font-medium">Rollover Australia Inc.</span> | All rights reserved.
            </div>
            <div className="flex space-x-4">
              {socialLinks.map((link, index) => (
                <a
                  key={index}
                  href={link.href}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="text-muted-foreground hover:text-foreground transition-colors"
                >
                  {link.icon}
                </a>
              ))}
            </div>
          </div>
        </div>
      </div>
    </footer>
  );
}