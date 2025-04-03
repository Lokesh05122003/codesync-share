
// This is a mock service that simulates code execution without actually running the code
// In a real application, this would connect to a secure backend service like Judge0 API

interface ExecuteCodeResult {
  output: string;
  error?: string;
}

export const executeCode = async (code: string, language: string): Promise<ExecuteCodeResult> => {
  // Add a small delay to simulate network request
  await new Promise(resolve => setTimeout(resolve, 800));
  
  // Simple handling for JavaScript - this is just a simulation
  if (language === 'javascript') {
    try {
      // Extract console.log statements and their content
      const logPattern = /console\.log\((.*?)\);/g;
      let match;
      let output = '';
      
      while ((match = logPattern.exec(code)) !== null) {
        let logContent = match[1];
        
        // Safely handle string literals
        try {
          // Simple evaluation of basic expressions
          if (logContent.startsWith('"') || logContent.startsWith("'") || logContent.startsWith('`')) {
            // It's a string literal, so just extract it
            logContent = logContent.substring(1, logContent.length - 1);
          } else if (!isNaN(Number(logContent))) {
            // It's a number
            logContent = logContent;
          } else {
            // For simplicity, we'll handle some basic arithmetic
            const arithmeticPattern = /(\d+)\s*([+\-*/])\s*(\d+)/;
            const arithmeticMatch = logContent.match(arithmeticPattern);
            
            if (arithmeticMatch) {
              const num1 = Number(arithmeticMatch[1]);
              const operator = arithmeticMatch[2];
              const num2 = Number(arithmeticMatch[3]);
              
              switch (operator) {
                case '+': logContent = (num1 + num2).toString(); break;
                case '-': logContent = (num1 - num2).toString(); break;
                case '*': logContent = (num1 * num2).toString(); break;
                case '/': logContent = (num1 / num2).toString(); break;
                default: logContent = 'undefined';
              }
            } else {
              // If we can't evaluate, just show it as is
              logContent = `(Unable to evaluate: ${logContent})`;
            }
          }
        } catch (e) {
          logContent = `(Evaluation error: ${logContent})`;
        }
        
        output += logContent + '\n';
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
  } else {
    // For other languages, provide a placeholder response
    return {
      output: `(Simulated) Code executed in ${language}. This is a simulation and doesn't actually run the code.`,
    };
  }
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
  
  return {
    code: savedCode || '// Welcome to CodeShare!\n\n// Write your code here and share it with others using the room ID.\n// Try writing a simple program, like:\n\nconsole.log("Hello, collaborative coding world!");',
    language: savedLanguage || 'javascript'
  };
};
