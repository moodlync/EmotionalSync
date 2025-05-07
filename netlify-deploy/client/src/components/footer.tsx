import { Link } from "wouter";
import { Lock } from "lucide-react";

export default function Footer() {
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