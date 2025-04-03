
// This is a mock service that simulates real-time collaboration
// In a real application, this would use WebSockets or a similar technology

import { v4 as uuidv4 } from 'uuid';

type CollaborationCallback = (data: any) => void;
type CollaborationEventType = 'code_change' | 'user_join' | 'user_leave' | 'cursor_move' | 'whiteboard_update' | 'language_change' | 'execution_result';

interface User {
  id: string;
  name: string;
  activeStatus?: 'idle' | 'typing' | 'executing';
  cursorPosition?: {
    line: number;
    column: number;
  };
}

// Mock users storage
const roomUsers: Record<string, User[]> = {};
const roomCodes: Record<string, string> = {};
const roomLanguages: Record<string, string> = {};
const callbacks: Record<string, CollaborationCallback[]> = {};
const whiteboardCallbacks: Record<string, CollaborationCallback[]> = {};

// Generate a session ID for this browser instance
const sessionId = uuidv4();

const broadcastToRoom = (roomId: string, eventType: CollaborationEventType, data: any) => {
  // Simulate network delay for realism
  setTimeout(() => {
    const roomCallbacks = callbacks[roomId] || [];
    roomCallbacks.forEach(callback => {
      callback({
        type: eventType,
        senderId: sessionId,
        timestamp: new Date().toISOString(),
        data
      });
    });
  }, Math.random() * 100); // Random delay between 0-100ms
};

export const joinRoom = (roomId: string, userName: string): string => {
  const userId = sessionId;
  
  // Initialize room if it doesn't exist
  if (!roomUsers[roomId]) {
    roomUsers[roomId] = [];
    callbacks[roomId] = [];
    whiteboardCallbacks[roomId] = [];
  }
  
  // Add user to room
  roomUsers[roomId].push({ 
    id: userId, 
    name: userName,
    activeStatus: 'idle'
  });
  
  // Broadcast join event
  broadcastToRoom(roomId, 'user_join', { 
    user: { id: userId, name: userName },
    users: roomUsers[roomId]
  });
  
  return userId;
};

export const leaveRoom = (roomId: string, userId: string): void => {
  if (!roomUsers[roomId]) return;
  
  // Remove user from room
  roomUsers[roomId] = roomUsers[roomId].filter(user => user.id !== userId);
  
  // Broadcast leave event
  broadcastToRoom(roomId, 'user_leave', { 
    userId,
    users: roomUsers[roomId]
  });
};

export const updateCode = (roomId: string, code: string): void => {
  roomCodes[roomId] = code;
  
  // Update user status to typing
  updateUserStatus(roomId, sessionId, 'typing');
  
  // Broadcast code change event
  broadcastToRoom(roomId, 'code_change', { code });
  
  // Reset status to idle after short delay
  setTimeout(() => {
    updateUserStatus(roomId, sessionId, 'idle');
  }, 1500);
};

export const updateUserStatus = (roomId: string, userId: string, status: 'idle' | 'typing' | 'executing'): void => {
  if (!roomUsers[roomId]) return;
  
  const user = roomUsers[roomId].find(u => u.id === userId);
  if (user) {
    user.activeStatus = status;
    
    // Broadcast status change
    broadcastToRoom(roomId, 'user_join', {
      users: roomUsers[roomId]
    });
  }
};

export const updateLanguage = (roomId: string, language: string): void => {
  roomLanguages[roomId] = language;
  
  // Broadcast language change
  broadcastToRoom(roomId, 'language_change', { language });
};

export const broadcastExecutionResult = (
  roomId: string, 
  userId: string, 
  result: { output: string, error?: string, executionTime?: number }
): void => {
  broadcastToRoom(roomId, 'execution_result', {
    userId,
    result
  });
  
  // Update user status back to idle
  updateUserStatus(roomId, userId, 'idle');
};

export const subscribeToRoom = (roomId: string, callback: CollaborationCallback): () => void => {
  if (!callbacks[roomId]) {
    callbacks[roomId] = [];
  }
  
  callbacks[roomId].push(callback);
  
  // Return unsubscribe function
  return () => {
    callbacks[roomId] = callbacks[roomId].filter(cb => cb !== callback);
  };
};

export const getUsers = (roomId: string): User[] => {
  return roomUsers[roomId] || [];
};

// Cursor position tracking
export const updateCursorPosition = (roomId: string, userId: string, position: { line: number, column: number }): void => {
  if (!roomUsers[roomId]) return;
  
  const user = roomUsers[roomId].find(u => u.id === userId);
  if (user) {
    user.cursorPosition = position;
  }
  
  broadcastToRoom(roomId, 'cursor_move', { userId, position });
};

// Whiteboard collaboration functions
export const broadcastWhiteboardUpdate = (roomId: string, data: any): void => {
  if (!whiteboardCallbacks[roomId]) {
    whiteboardCallbacks[roomId] = [];
    return;
  }
  
  // Simulate network delay for realism
  setTimeout(() => {
    whiteboardCallbacks[roomId].forEach(callback => {
      callback(data);
    });
  }, Math.random() * 100); // Random delay between 0-100ms
};

export const subscribeToWhiteboardUpdates = (roomId: string, callback: CollaborationCallback): () => void => {
  if (!whiteboardCallbacks[roomId]) {
    whiteboardCallbacks[roomId] = [];
  }
  
  whiteboardCallbacks[roomId].push(callback);
  
  // Return unsubscribe function
  return () => {
    if (whiteboardCallbacks[roomId]) {
      whiteboardCallbacks[roomId] = whiteboardCallbacks[roomId].filter(cb => cb !== callback);
    }
  };
};
