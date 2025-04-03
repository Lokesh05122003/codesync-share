
import { useState } from 'react';
import { ChevronDown, Check } from 'lucide-react';
import { cn } from '@/lib/utils';

interface Language {
  id: string;
  name: string;
  icon?: string;
}

interface LanguageSelectorProps {
  selectedLanguage: string;
  onSelectLanguage: (language: string) => void;
}

const LanguageSelector = ({ selectedLanguage, onSelectLanguage }: LanguageSelectorProps) => {
  const [isOpen, setIsOpen] = useState(false);
  
  const languages: Language[] = [
    { id: 'javascript', name: 'JavaScript' },
    { id: 'typescript', name: 'TypeScript' },
    { id: 'python', name: 'Python' },
    { id: 'java', name: 'Java' },
    { id: 'cpp', name: 'C++' },
    { id: 'csharp', name: 'C#' },
    { id: 'go', name: 'Go' },
    { id: 'ruby', name: 'Ruby' },
  ];

  const toggleDropdown = () => setIsOpen(!isOpen);
  
  const handleSelect = (languageId: string) => {
    onSelectLanguage(languageId);
    setIsOpen(false);
  };

  const selectedLanguageData = languages.find(lang => lang.id === selectedLanguage) || languages[0];

  return (
    <div className="relative">
      <button
        onClick={toggleDropdown}
        className="flex items-center gap-2 bg-zinc-800 hover:bg-zinc-700 text-white px-3 py-1.5 rounded-md text-sm transition"
      >
        <span>{selectedLanguageData.name}</span>
        <ChevronDown size={16} className={cn("transition-transform", isOpen ? "rotate-180" : "")} />
      </button>
      
      {isOpen && (
        <div className="absolute top-full left-0 mt-1 w-48 bg-zinc-800 rounded-md overflow-hidden shadow-lg z-10">
          <ul className="py-1">
            {languages.map((language) => (
              <li key={language.id}>
                <button
                  onClick={() => handleSelect(language.id)}
                  className={cn(
                    "w-full text-left px-4 py-2 text-sm flex items-center justify-between",
                    selectedLanguage === language.id 
                      ? "bg-purple-600 text-white" 
                      : "text-gray-200 hover:bg-zinc-700"
                  )}
                >
                  {language.name}
                  {selectedLanguage === language.id && <Check size={16} />}
                </button>
              </li>
            ))}
          </ul>
        </div>
      )}
    </div>
  );
};

export default LanguageSelector;
