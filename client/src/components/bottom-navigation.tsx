import { UsersRound, Globe, BookMarked, Sparkles, Crown, Trophy } from "lucide-react";
import { TabType } from '@/types/app-types';

interface BottomNavigationProps {
  activeTab: TabType;
  onTabChange: (tab: TabType) => void;
}

export default function BottomNavigation({ activeTab, onTabChange }: BottomNavigationProps) {
  return (
    <nav className="fixed bottom-0 left-0 right-0 bg-white dark:bg-black/95 border-t border-gray-200 dark:border-white/10 py-2 px-4 z-10">
      <div className="flex justify-around items-center">
        <button 
          className={`flex flex-col items-center p-2 ${activeTab === 'connect' ? 'text-primary' : 'text-gray-500 dark:text-gray-400 hover:text-primary dark:hover:text-primary'}`}
          onClick={() => onTabChange('connect')}
        >
          <UsersRound className="w-6 h-6" />
          <span className="text-xs mt-1">Connect</span>
        </button>
        <button 
          className={`flex flex-col items-center p-2 ${activeTab === 'map' ? 'text-primary' : 'text-gray-500 dark:text-gray-400 hover:text-primary dark:hover:text-primary'}`}
          onClick={() => onTabChange('map')}
        >
          <Globe className="w-6 h-6" />
          <span className="text-xs mt-1">Map</span>
        </button>
        <button 
          className={`flex flex-col items-center p-2 ${activeTab === 'journal' ? 'text-primary' : 'text-gray-500 dark:text-gray-400 hover:text-primary dark:hover:text-primary'}`}
          onClick={() => onTabChange('journal')}
        >
          <BookMarked className="w-6 h-6" />
          <span className="text-xs mt-1">Journal</span>
        </button>
        <button 
          className={`flex flex-col items-center p-2 ${activeTab === 'ai' ? 'text-primary' : 'text-gray-500 dark:text-gray-400 hover:text-primary dark:hover:text-primary'}`}
          onClick={() => onTabChange('ai')}
        >
          <Sparkles className="w-6 h-6" />
          <span className="text-xs mt-1">AI</span>
        </button>
        <button 
          className={`flex flex-col items-center p-2 ${activeTab === 'premium' ? 'text-amber-500' : 'text-amber-600 dark:text-amber-500 hover:text-amber-500'}`}
          onClick={() => onTabChange('premium')}
        >
          <Crown className="w-6 h-6" />
          <span className="text-xs mt-1">Premium</span>
        </button>
        <button 
          className={`flex flex-col items-center p-2 ${activeTab === 'gamification' ? 'text-primary' : 'text-gray-500 dark:text-gray-400 hover:text-primary dark:hover:text-primary'}`}
          onClick={() => onTabChange('gamification')}
        >
          <Trophy className="w-6 h-6" />
          <span className="text-xs mt-1">Challenges</span>
        </button>
      </div>
    </nav>
  );
}
