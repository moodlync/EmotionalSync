import { Link } from 'wouter';
import { Button } from '@/components/ui/button';

export type SearchResultItem = {
  id: string | number;
  title: string;
  description: string;
  url: string;
  type: 'page' | 'article' | 'user' | 'challenge' | 'nft' | 'feature';
  icon?: string;
};

interface SearchResultsProps {
  results: SearchResultItem[];
  isLoading: boolean;
  onClose: () => void;
}

export default function SearchResults({ results, isLoading, onClose }: SearchResultsProps) {
  if (isLoading) {
    return (
      <div className="p-4 max-h-96 overflow-y-auto bg-white dark:bg-gray-900 rounded-lg shadow-lg border border-gray-200 dark:border-gray-700">
        <div className="flex flex-col gap-2">
          {Array.from({ length: 3 }).map((_, i) => (
            <div key={i} className="animate-pulse">
              <div className="h-5 bg-gray-200 dark:bg-gray-700 rounded w-3/4 mb-1"></div>
              <div className="h-4 bg-gray-100 dark:bg-gray-800 rounded w-full"></div>
            </div>
          ))}
        </div>
      </div>
    );
  }

  if (results.length === 0) {
    return (
      <div className="p-4 max-h-96 overflow-y-auto bg-white dark:bg-gray-900 rounded-lg shadow-lg border border-gray-200 dark:border-gray-700">
        <div className="flex flex-col items-center justify-center py-8">
          <p className="text-gray-500 dark:text-gray-400 mb-4">No results found</p>
          <Button variant="ghost" size="sm" onClick={onClose}>
            Close
          </Button>
        </div>
      </div>
    );
  }

  return (
    <div className="p-2 max-h-96 overflow-y-auto bg-white dark:bg-gray-900 rounded-lg shadow-lg border border-gray-200 dark:border-gray-700">
      <div className="grid gap-2">
        {results.map((result) => (
          <Link
            key={`${result.type}-${result.id}`}
            href={result.url}
            onClick={onClose}
            className="block p-3 hover:bg-gray-100 dark:hover:bg-gray-800 rounded-md transition-colors cursor-pointer"
          >
            <div className="flex items-start gap-3">
              <div className={`p-2 rounded-full ${getBgColorByType(result.type)}`}>
                {getIconByType(result.type)}
              </div>
              <div>
                <h4 className="font-medium text-black dark:text-white">{result.title}</h4>
                <p className="text-sm text-gray-500 dark:text-gray-400 line-clamp-2">{result.description}</p>
                <div className="flex items-center mt-1">
                  <span className="text-xs text-gray-400 dark:text-gray-500 capitalize">{result.type}</span>
                </div>
              </div>
            </div>
          </Link>
        ))}
      </div>
    </div>
  );
}

function getBgColorByType(type: SearchResultItem['type']): string {
  switch (type) {
    case 'page':
      return 'bg-blue-100 dark:bg-blue-900 text-blue-700 dark:text-blue-300';
    case 'article':
      return 'bg-purple-100 dark:bg-purple-900 text-purple-700 dark:text-purple-300';
    case 'user':
      return 'bg-green-100 dark:bg-green-900 text-green-700 dark:text-green-300';
    case 'challenge':
      return 'bg-orange-100 dark:bg-orange-900 text-orange-700 dark:text-orange-300';
    case 'nft':
      return 'bg-amber-100 dark:bg-amber-900 text-amber-700 dark:text-amber-300';
    case 'feature':
      return 'bg-indigo-100 dark:bg-indigo-900 text-indigo-700 dark:text-indigo-300';
    default:
      return 'bg-gray-100 dark:bg-gray-800 text-gray-700 dark:text-gray-300';
  }
}

function getIconByType(type: SearchResultItem['type']) {
  switch (type) {
    case 'page':
      return <span className="text-lg">📄</span>;
    case 'article':
      return <span className="text-lg">📚</span>;
    case 'user':
      return <span className="text-lg">👤</span>;
    case 'challenge':
      return <span className="text-lg">🏆</span>;
    case 'nft':
      return <span className="text-lg">✨</span>;
    case 'feature':
      return <span className="text-lg">⭐</span>;
    default:
      return <span className="text-lg">🔍</span>;
  }
}