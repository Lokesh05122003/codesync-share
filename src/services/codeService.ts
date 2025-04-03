
// This service handles code execution for multiple programming languages
// In a production app, this would connect to a secure backend service

import { toast } from "@/components/ui/use-toast";

export interface ExecuteCodeResult {
  output: string;
  error?: string;
  executionTime?: number;
}

interface LanguageConfig {
  runCommand: string;
  fileExtension: string;
  setup?: () => void;
}

const languageConfigs: Record<string, LanguageConfig> = {
  javascript: {
    runCommand: "node",
    fileExtension: "js"
  },
  typescript: {
    runCommand: "ts-node",
    fileExtension: "ts"
  },
  python: {
    runCommand: "python",
    fileExtension: "py"
  },
  java: {
    runCommand: "java",
    fileExtension: "java"
  },
  cpp: {
    runCommand: "g++",
    fileExtension: "cpp"
  },
  ruby: {
    runCommand: "ruby",
    fileExtension: "rb"
  },
  go: {
    runCommand: "go run",
    fileExtension: "go"
  },
  csharp: {
    runCommand: "dotnet run",
    fileExtension: "cs"
  }
};

// Simulated execution environments for different users
const executionEnvironments: Record<string, Record<string, boolean>> = {};

export const executeCode = async (
  code: string, 
  language: string,
  roomId: string,
  userId: string
): Promise<ExecuteCodeResult> => {
  // Initialize execution environment for this room if it doesn't exist
  if (!executionEnvironments[roomId]) {
    executionEnvironments[roomId] = {};
  }
  
  // Check if the user is already executing code
  if (executionEnvironments[roomId][userId]) {
    toast({
      title: "Execution in progress",
      description: "Please wait for your current execution to finish",
      variant: "destructive"
    });
    
    return {
      output: "",
      error: "Another execution is already in progress. Please try again after it completes."
    };
  }
  
  // Mark this user as currently executing code
  executionEnvironments[roomId][userId] = true;
  
  // Add a small delay to simulate network request and code execution
  const startTime = performance.now();
  
  try {
    // Record execution start time for performance tracking
    const result = await simulateCodeExecution(code, language);
    const executionTime = Math.round((performance.now() - startTime) / 10) / 100;
    
    return {
      ...result,
      executionTime
    };
  } finally {
    // Always release the execution lock when done
    setTimeout(() => {
      if (executionEnvironments[roomId]) {
        executionEnvironments[roomId][userId] = false;
      }
    }, 500);
  }
};

// Simulate code execution for different languages
const simulateCodeExecution = async (code: string, language: string): Promise<ExecuteCodeResult> => {
  // Add a delay to simulate processing time (varies by language)
  const processingTime = 500 + Math.random() * 1500;
  await new Promise(resolve => setTimeout(resolve, processingTime));
  
  // Get language configuration or use JavaScript as fallback
  const config = languageConfigs[language] || languageConfigs.javascript;
  
  switch (language) {
    case 'javascript':
      return executeJavaScript(code);
    case 'python':
      return executePython(code);
    case 'java':
      return executeJava(code);
    case 'cpp':
      return executeCpp(code);
    case 'ruby':
      return executeRuby(code);
    case 'go':
      return executeGo(code);
    default:
      return {
        output: `Running ${code.substring(0, 100)}... with ${config.runCommand}\n` +
                `[Simulated output for ${language}]\n` +
                `This is a simulation - in a real environment, code would execute on a secure server.`,
      };
  }
};

// Language-specific execution simulators
const executeJavaScript = (code: string): ExecuteCodeResult => {
  try {
    // Extract console.log statements and their content
    const logPattern = /console\.log\((.*?)\);/g;
    let match;
    let output = '';
    
    while ((match = logPattern.exec(code)) !== null) {
      let logContent = match[1];
      
      try {
        // Simple evaluation of basic expressions
        if (logContent.startsWith('"') || logContent.startsWith("'") || logContent.startsWith('`')) {
          // String literal
          output += logContent.substring(1, logContent.length - 1) + '\n';
        } else if (!isNaN(Number(logContent))) {
          // Number
          output += logContent + '\n';
        } else {
          // Basic arithmetic
          const arithmeticPattern = /(\d+)\s*([+\-*/])\s*(\d+)/;
          const arithmeticMatch = logContent.match(arithmeticPattern);
          
          if (arithmeticMatch) {
            const num1 = Number(arithmeticMatch[1]);
            const operator = arithmeticMatch[2];
            const num2 = Number(arithmeticMatch[3]);
            
            switch (operator) {
              case '+': output += (num1 + num2).toString() + '\n'; break;
              case '-': output += (num1 - num2).toString() + '\n'; break;
              case '*': output += (num1 * num2).toString() + '\n'; break;
              case '/': output += (num1 / num2).toString() + '\n'; break;
              default: output += 'undefined\n';
            }
          } else {
            output += `(Simulated: ${logContent})\n`;
          }
        }
      } catch (e) {
        output += `(Evaluation error: ${logContent})\n`;
      }
    }
    
    // Detect syntax errors
    if (code.includes('{') && !code.includes('}')) {
      return {
        output: '',
        error: 'SyntaxError: missing closing curly brace'
      };
    }
    
    if (code.includes('(') && !code.includes(')')) {
      return {
        output: '',
        error: 'SyntaxError: missing closing parenthesis'
      };
    }
    
    return {
      output: output || 'Code executed successfully with no output.',
    };
  } catch (error) {
    return {
      output: '',
      error: `Execution error: ${error instanceof Error ? error.message : String(error)}`
    };
  }
};

const executePython = (code: string): ExecuteCodeResult => {
  try {
    // Extract print statements
    const printPattern = /print\((.*?)\)/g;
    let match;
    let output = '';
    
    while ((match = printPattern.exec(code)) !== null) {
      let printContent = match[1];
      output += printContent.replace(/["']/g, '') + '\n';
    }
    
    // Check for common Python errors
    if (code.includes('    ') && code.includes('  ')) {
      return {
        output: '',
        error: 'IndentationError: inconsistent use of tabs and spaces in indentation'
      };
    }
    
    // Check for missing colons in Python blocks
    if (/\b(if|for|while|def|class)\b[^:]*$/.test(code)) {
      return {
        output: '',
        error: 'SyntaxError: expected ":"'
      };
    }
    
    return {
      output: output || 'Code executed successfully with no output.',
    };
  } catch (error) {
    return {
      output: '',
      error: `Execution error: ${error instanceof Error ? error.message : String(error)}`
    };
  }
};

const executeJava = (code: string): ExecuteCodeResult => {
  // Simple Java simulation
  if (!code.includes('class')) {
    return {
      output: '',
      error: 'Error: Java code must define a class'
    };
  }
  
  if (!code.includes('public static void main')) {
    return {
      output: '',
      error: 'Error: Java code must include a main method'
    };
  }
  
  // Extract System.out.println statements
  const printPattern = /System\.out\.println\((.*?)\);/g;
  let match;
  let output = '';
  
  while ((match = printPattern.exec(code)) !== null) {
    output += match[1].replace(/["']/g, '') + '\n';
  }
  
  return {
    output: output || 'Java code compiled and executed successfully with no output.',
  };
};

const executeCpp = (code: string): ExecuteCodeResult => {
  // Check for C++ includes
  if (!code.includes('#include')) {
    return {
      output: 'Warning: No #include directives found.\n',
    };
  }
  
  // Check for main function
  if (!code.includes('int main')) {
    return {
      output: '',
      error: 'Error: No main function found. C++ programs require a main function.'
    };
  }
  
  // Extract cout statements
  const coutPattern = /cout\s*<<\s*(.*?)(<<|;)/g;
  let match;
  let output = '';
  
  while ((match = coutPattern.exec(code)) !== null) {
    output += match[1].replace(/["']/g, '').trim() + ' ';
  }
  
  return {
    output: output || 'C++ code compiled and executed successfully with no output.',
  };
};

const executeRuby = (code: string): ExecuteCodeResult => {
  // Extract puts statements
  const putsPattern = /puts\s+(.*?)($|\n)/g;
  let match;
  let output = '';
  
  while ((match = putsPattern.exec(code)) !== null) {
    output += match[1].replace(/["']/g, '') + '\n';
  }
  
  // Check for common Ruby syntax errors
  if (code.includes('def') && !code.includes('end')) {
    return {
      output: '',
      error: 'SyntaxError: unexpected end-of-input, expecting keyword_end'
    };
  }
  
  return {
    output: output || 'Ruby code executed successfully with no output.',
  };
};

const executeGo = (code: string): ExecuteCodeResult => {
  // Check for package main
  if (!code.includes('package main')) {
    return {
      output: '',
      error: 'Error: Go programs must start with "package main"'
    };
  }
  
  // Check for main function
  if (!code.includes('func main')) {
    return {
      output: '',
      error: 'Error: Go programs require a main function'
    };
  }
  
  // Extract fmt.Println statements
  const printPattern = /fmt\.Println\((.*?)\)/g;
  let match;
  let output = '';
  
  while ((match = printPattern.exec(code)) !== null) {
    output += match[1].replace(/["']/g, '') + '\n';
  }
  
  return {
    output: output || 'Go code compiled and executed successfully with no output.',
  };
};

export const saveCode = async (code: string, language: string, roomId: string): Promise<void> => {
  // This is a mock implementation that just simulates saving
  console.log('Saving code:', { code, language, roomId });
  
  // Simulate network delay
  await new Promise(resolve => setTimeout(resolve, 500));
  
  // In a real implementation, this would save to a database or file storage
  localStorage.setItem(`code_${roomId}`, code);
  localStorage.setItem(`language_${roomId}`, language);
  
  return Promise.resolve();
};

export const loadCode = (roomId: string): { code: string, language: string } => {
  const savedCode = localStorage.getItem(`code_${roomId}`);
  const savedLanguage = localStorage.getItem(`language_${roomId}`);
  
  // Default code templates by language
  const defaultCodeTemplates: Record<string, string> = {
    javascript: '// Welcome to CodeShare JavaScript!\n\nconsole.log("Hello, collaborative coding world!");',
    python: '# Welcome to CodeShare Python!\n\nprint("Hello, collaborative coding world!")',
    java: '// Welcome to CodeShare Java!\n\npublic class Main {\n    public static void main(String[] args) {\n        System.out.println("Hello, collaborative coding world!");\n    }\n}',
    cpp: '#include <iostream>\n\nint main() {\n    std::cout << "Hello, collaborative coding world!" << std::endl;\n    return 0;\n}',
    ruby: '# Welcome to CodeShare Ruby!\n\nputs "Hello, collaborative coding world!"',
    go: 'package main\n\nimport "fmt"\n\nfunc main() {\n    fmt.Println("Hello, collaborative coding world!")\n}',
    typescript: '// Welcome to CodeShare TypeScript!\n\ninterface Greeting {\n    message: string;\n}\n\nconst greeting: Greeting = {\n    message: "Hello, collaborative coding world!"\n};\n\nconsole.log(greeting.message);',
    csharp: 'using System;\n\nclass Program {\n    static void Main() {\n        Console.WriteLine("Hello, collaborative coding world!");\n    }\n}'
  };
  
  const defaultCode = '// Welcome to CodeShare!\n\n// Write your code here and share it with others using the room ID.\n// Try writing a simple program, like:\n\nconsole.log("Hello, collaborative coding world!");';
  
  return {
    code: savedCode || defaultCodeTemplates[savedLanguage || 'javascript'] || defaultCode,
    language: savedLanguage || 'javascript'
  };
};
