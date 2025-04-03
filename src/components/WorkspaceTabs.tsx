
import { Tabs, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Code, PenTool } from 'lucide-react';

interface WorkspaceTabsProps {
  activeTab: string;
  onTabChange: (tab: string) => void;
}

const WorkspaceTabs = ({ activeTab, onTabChange }: WorkspaceTabsProps) => {
  return (
    <div className="px-2 pt-2 bg-zinc-900">
      <Tabs value={activeTab} onValueChange={onTabChange} className="w-full">
        <TabsList className="grid w-60 grid-cols-2">
          <TabsTrigger value="code" className="flex items-center gap-1">
            <Code size={16} />
            <span>Code Editor</span>
          </TabsTrigger>
          <TabsTrigger value="whiteboard" className="flex items-center gap-1">
            <PenTool size={16} />
            <span>Whiteboard</span>
          </TabsTrigger>
        </TabsList>
      </Tabs>
    </div>
  );
};

export default WorkspaceTabs;
