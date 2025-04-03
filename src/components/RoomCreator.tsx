
import { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Copy, ArrowRight } from 'lucide-react';
import { useToast } from '@/hooks/use-toast';

interface RoomCreatorProps {
  onJoinRoom: (roomId: string, userName: string) => void;
}

const RoomCreator = ({ onJoinRoom }: RoomCreatorProps) => {
  const [roomId, setRoomId] = useState('');
  const [userName, setUserName] = useState('');
  const [isCreating, setIsCreating] = useState(true);
  const [generatedRoomId, setGeneratedRoomId] = useState('');
  const { toast } = useToast();

  const generateRandomRoomId = () => {
    const id = Math.random().toString(36).substring(2, 8).toUpperCase();
    setGeneratedRoomId(id);
    return id;
  };

  const handleCreateRoom = () => {
    if (!userName.trim()) {
      toast({
        title: "Name required",
        description: "Please enter your name to create a room",
        variant: "destructive"
      });
      return;
    }

    const newRoomId = generateRandomRoomId();
    onJoinRoom(newRoomId, userName);
  };

  const handleJoinRoom = () => {
    if (!roomId.trim()) {
      toast({
        title: "Room ID required",
        description: "Please enter a room ID to join",
        variant: "destructive"
      });
      return;
    }
    
    if (!userName.trim()) {
      toast({
        title: "Name required",
        description: "Please enter your name to join the room",
        variant: "destructive"
      });
      return;
    }

    onJoinRoom(roomId, userName);
  };

  const copyRoomId = () => {
    navigator.clipboard.writeText(generatedRoomId);
    toast({
      title: "Copied!",
      description: "Room ID copied to clipboard"
    });
  };

  return (
    <div className="w-full max-w-md mx-auto bg-zinc-900 rounded-lg shadow-xl p-6">
      <div className="mb-6 text-center">
        <h2 className="text-2xl font-bold text-white mb-2">
          {isCreating ? "Create a new room" : "Join existing room"}
        </h2>
        <p className="text-gray-400 text-sm">
          {isCreating 
            ? "Start a new collaborative coding session" 
            : "Enter a room ID to join an existing session"}
        </p>
      </div>

      <div className="space-y-4">
        <div>
          <label htmlFor="username" className="block text-sm font-medium text-gray-400 mb-1">
            Your Name
          </label>
          <Input
            id="username"
            value={userName}
            onChange={(e) => setUserName(e.target.value)}
            placeholder="Enter your name"
            className="bg-zinc-800 border-zinc-700 text-white"
          />
        </div>

        {isCreating ? (
          <div className="space-y-4">
            {generatedRoomId && (
              <div>
                <label className="block text-sm font-medium text-gray-400 mb-1">
                  Room ID
                </label>
                <div className="flex gap-2">
                  <Input
                    value={generatedRoomId}
                    readOnly
                    className="bg-zinc-800 border-zinc-700 text-white"
                  />
                  <Button 
                    variant="outline" 
                    size="icon" 
                    onClick={copyRoomId}
                    className="border-zinc-700 text-gray-400 hover:text-white"
                  >
                    <Copy size={16} />
                  </Button>
                </div>
                <p className="mt-1 text-xs text-gray-500">Share this ID with others to invite them</p>
              </div>
            )}
            
            <Button 
              onClick={handleCreateRoom} 
              className="w-full bg-purple-600 hover:bg-purple-700"
            >
              {generatedRoomId ? 'Start Coding' : 'Generate Room ID'}
            </Button>
          </div>
        ) : (
          <div className="space-y-4">
            <div>
              <label htmlFor="roomId" className="block text-sm font-medium text-gray-400 mb-1">
                Room ID
              </label>
              <Input
                id="roomId"
                value={roomId}
                onChange={(e) => setRoomId(e.target.value)}
                placeholder="Enter room ID"
                className="bg-zinc-800 border-zinc-700 text-white"
              />
            </div>
            
            <Button 
              onClick={handleJoinRoom} 
              className="w-full bg-purple-600 hover:bg-purple-700"
            >
              Join Room <ArrowRight size={16} className="ml-2" />
            </Button>
          </div>
        )}
      </div>

      <div className="mt-6 text-center">
        <button
          onClick={() => setIsCreating(!isCreating)}
          className="text-sm text-purple-400 hover:text-purple-300"
        >
          {isCreating ? "Join an existing room instead" : "Create a new room instead"}
        </button>
      </div>
    </div>
  );
};

export default RoomCreator;
