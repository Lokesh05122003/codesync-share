import { useSearchParams } from 'react-router-dom';
import CodeShareApp from './CodeShareApp';
import { Button } from '@/components/ui/button';
import { Code, Share2, Users } from 'lucide-react';

const Index = () => {
  const [searchParams] = useSearchParams();
  const roomId = searchParams.get('room');
  
  if (roomId) {
    return <CodeShareApp />;
  }
  
  return (
    <div className="min-h-screen bg-zinc-950">
      <header className="border-b border-zinc-800">
        <div className="container mx-auto px-4 py-6 flex justify-between items-center">
          <div className="flex items-center space-x-2">
            <Code size={24} className="text-purple-500" />
            <h1 className="text-2xl font-bold text-white">CodeSync</h1>
          </div>
          <nav>
            <Button
              variant="ghost"
              className="text-gray-300 hover:text-white"
              onClick={() => window.location.href = '/?room=DEMO123'}
            >
              Try Demo
            </Button>
          </nav>
        </div>
      </header>
      
      <main>
        <section className="py-20 px-4">
          <div className="container mx-auto text-center">
            <h2 className="text-4xl md:text-5xl font-bold text-white mb-6">
              Code Together. <span className="text-purple-500">In Real-Time.</span>
            </h2>
            <p className="text-xl text-gray-400 max-w-2xl mx-auto mb-10">
              Write, run, and debug code collaboratively with your team. 
              Share a room, code together, and see changes instantly.
            </p>
            <div className="flex flex-col sm:flex-row justify-center gap-4">
              <Button 
                size="lg" 
                className="bg-purple-600 hover:bg-purple-700 text-lg"
                onClick={() => window.location.href = '/?room=NEW'}
              >
                Start Coding Now
              </Button>
            </div>
          </div>
        </section>
        
        <section className="py-16 bg-zinc-900">
          <div className="container mx-auto px-4">
            <h3 className="text-2xl font-bold text-white text-center mb-12">
              Powerful Features for Your Coding Sessions
            </h3>
            
            <div className="grid md:grid-cols-3 gap-8">
              <div className="bg-zinc-800 rounded-lg p-6">
                <div className="w-12 h-12 bg-purple-500/20 rounded-full flex items-center justify-center mb-4">
                  <Code size={24} className="text-purple-500" />
                </div>
                <h4 className="text-xl font-semibold text-white mb-2">Multi-Language Support</h4>
                <p className="text-gray-400">
                  Write and execute code in multiple programming languages including JavaScript, TypeScript, Python, and more.
                </p>
              </div>
              
              <div className="bg-zinc-800 rounded-lg p-6">
                <div className="w-12 h-12 bg-purple-500/20 rounded-full flex items-center justify-center mb-4">
                  <Users size={24} className="text-purple-500" />
                </div>
                <h4 className="text-xl font-semibold text-white mb-2">Collaborative Editing</h4>
                <p className="text-gray-400">
                  Code with your team in real-time. See who's online and watch changes appear as they happen.
                </p>
              </div>
              
              <div className="bg-zinc-800 rounded-lg p-6">
                <div className="w-12 h-12 bg-purple-500/20 rounded-full flex items-center justify-center mb-4">
                  <Share2 size={24} className="text-purple-500" />
                </div>
                <h4 className="text-xl font-semibold text-white mb-2">Instant Sharing</h4>
                <p className="text-gray-400">
                  Generate a unique room ID and share it with anyone to start collaborating instantly.
                </p>
              </div>
            </div>
          </div>
        </section>
        
        <section className="py-20 px-4 bg-gradient-to-b from-zinc-950 to-purple-950">
          <div className="container mx-auto text-center">
            <h3 className="text-3xl font-bold text-white mb-8">
              Ready to start coding together?
            </h3>
            <Button 
              size="lg" 
              className="bg-purple-600 hover:bg-purple-700 text-lg"
              onClick={() => window.location.href = '/?room=NEW'}
            >
              Create a Room
            </Button>
          </div>
        </section>
      </main>
      
      <footer className="bg-zinc-900 border-t border-zinc-800 py-8">
        <div className="container mx-auto px-4 text-center text-gray-500 text-sm">
          <p>© {new Date().getFullYear()} CodeSync. All rights reserved.</p>
        </div>
      </footer>
    </div>
  );
};

export default Index;
