
import { Share2, Save } from 'lucide-react';
import { Button } from '@/components/ui/button';
import LanguageSelector from './LanguageSelector';
import UserPresence from './UserPresence';
import { useToast } from '@/hooks/use-toast';

interface CodeShareHeaderProps {
  roomId: string;
  language: string;
  onLanguageChange: (language: string) => void;
  onSaveCode: () => void;
  users: { id: string; name: string; }[];
}

const CodeShareHeader = ({
  roomId,
  language,
  onLanguageChange,
  onSaveCode,
  users
}: CodeShareHeaderProps) => {
  const { toast } = useToast();

  const handleShareClick = () => {
    const shareUrl = `${window.location.origin}?room=${roomId}`;
    navigator.clipboard.writeText(shareUrl);
    
    toast({
      title: "Link copied!",
      description: "Share this link with others to collaborate"
    });
  };

  return (
    <div className="bg-zinc-800 border-b border-zinc-700 p-3 flex items-center justify-between">
      <div className="flex items-center gap-3">
        <div className="hidden sm:block">
          <div className="text-xs text-gray-400">Room ID</div>
          <div className="text-white font-semibold">{roomId}</div>
        </div>
        
        <LanguageSelector 
          selectedLanguage={language}
          onSelectLanguage={onLanguageChange}
        />
      </div>
      
      <div className="flex items-center gap-3">
        <UserPresence users={users} />
        
        <div className="flex gap-2">
          <Button 
            variant="outline" 
            size="sm" 
            className="border-zinc-700 text-gray-300 hover:text-white"
            onClick={handleShareClick}
          >
            <Share2 size={16} className="mr-1" />
            <span className="hidden sm:inline">Share</span>
          </Button>
          
          <Button 
            variant="outline" 
            size="sm" 
            className="border-zinc-700 text-gray-300 hover:text-white"
            onClick={onSaveCode}
          >
            <Save size={16} className="mr-1" />
            <span className="hidden sm:inline">Save</span>
          </Button>
        </div>
      </div>
    </div>
  );
};

export default CodeShareHeader;
