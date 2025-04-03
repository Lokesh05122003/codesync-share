
import { useState, useCallback } from 'react';
import { useSearchParams } from 'react-router-dom';

import RoomCreator from '@/components/RoomCreator';
import CodeShareHeader from '@/components/CodeShareHeader';
import WorkspaceTabs from '@/components/WorkspaceTabs';
import CodeWorkspace from '@/components/CodeWorkspace';

import { useCollaboration } from '@/hooks/useCollaboration';
import { useCodeExecution } from '@/hooks/useCodeExecution';

const CodeShareApp = () => {
  const [searchParams] = useSearchParams();
  const [activeTab, setActiveTab] = useState<string>('code');
  
  // Initialize collaboration with room ID from URL
  const initialRoomId = searchParams.get('room');
  const {
    roomId,
    userId,
    userName,
    users,
    code,
    language,
    handleJoinRoom,
    handleCodeChange,
    handleLanguageChange,
    handleCursorMove
  } = useCollaboration(initialRoomId);
  
  // Initialize code execution hooks
  const {
    output,
    error,
    isRunning,
    executionTime,
    executedBy,
    runCode,
    handleSaveCode,
    clearConsole
  } = useCodeExecution({
    code,
    language,
    roomId,
    userId,
    userName
  });
  
  // Filter out current user from other users list for cursor display
  const otherUsers = users.filter(user => user.id !== userId);
  
  // Handle tab changes
  const handleTabChange = useCallback((tab: string) => {
    setActiveTab(tab);
  }, []);
  
  // If no room is joined yet, show the room creator
  if (!roomId || !userId) {
    return (
      <div className="min-h-screen bg-zinc-950 flex items-center justify-center p-4">
        <RoomCreator onJoinRoom={handleJoinRoom} />
      </div>
    );
  }
  
  return (
    <div className="min-h-screen bg-zinc-950 flex flex-col">
      <CodeShareHeader 
        roomId={roomId}
        language={language}
        onLanguageChange={handleLanguageChange}
        onSaveCode={handleSaveCode}
        users={users}
      />
      
      <WorkspaceTabs 
        activeTab={activeTab}
        onTabChange={handleTabChange}
      />
      
      <div className="flex-1 flex flex-col">
        <CodeWorkspace
          activeTab={activeTab}
          code={code}
          language={language}
          userName={userName}
          roomId={roomId}
          otherUsers={otherUsers}
          onCodeChange={handleCodeChange}
          onCursorMove={handleCursorMove}
          onRunCode={runCode}
          isRunning={isRunning}
          output={output}
          error={error}
          executionTime={executionTime}
          executedBy={executedBy}
          onClearConsole={clearConsole}
        />
      </div>
    </div>
  );
};

export default CodeShareApp;
