
import { User } from 'lucide-react';

interface UserPresenceProps {
  users: {
    id: string;
    name: string;
    color?: string;
  }[];
}

const UserPresence = ({ users }: UserPresenceProps) => {
  // Generate a color based on user id if not provided
  const getUserColor = (userId: string, providedColor?: string) => {
    if (providedColor) return providedColor;
    
    const colors = [
      "bg-purple-500",
      "bg-blue-500", 
      "bg-green-500", 
      "bg-yellow-500", 
      "bg-red-500", 
      "bg-pink-500",
    ];
    
    const index = userId.split('').reduce((acc, char) => acc + char.charCodeAt(0), 0) % colors.length;
    return colors[index];
  };

  return (
    <div className="flex items-center space-x-1">
      {users.length > 0 ? (
        <>
          <div className="flex -space-x-2">
            {users.slice(0, 3).map((user) => (
              <div 
                key={user.id}
                className={`${getUserColor(user.id, user.color)} flex items-center justify-center w-8 h-8 rounded-full border-2 border-zinc-800 text-white text-xs font-medium`}
                title={user.name}
              >
                {user.name.charAt(0).toUpperCase()}
              </div>
            ))}
          </div>
          
          {users.length > 3 && (
            <div className="bg-zinc-700 w-8 h-8 rounded-full border-2 border-zinc-800 flex items-center justify-center text-white text-xs">
              +{users.length - 3}
            </div>
          )}
        </>
      ) : (
        <div className="flex items-center text-gray-400 text-sm">
          <User size={16} className="mr-1" />
          <span>No users</span>
        </div>
      )}
    </div>
  );
};

export default UserPresence;
