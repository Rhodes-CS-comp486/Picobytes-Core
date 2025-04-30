import { useEffect, useState, useRef } from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import ReactMarkdown from 'react-markdown';
import Home_Header from './home/home_header';
import SideBar from './home/side_bar';
import { useSidebar } from './home/side_bar_context';
import './Questions.css';
import './CodingQuestion.css';

interface Prop {
  toggleDark: () => void;
}

interface CodingQuestion {
  qid: number;
  qtext: string;
  topic: string;
  difficulty: string;
  function_template: string;
}

interface CodingQuestionData {
  questions: CodingQuestion[];
  total_questions: number;
}

interface ExecutionResult {
  compile: boolean;
  run: boolean;
  output: string;
  error?: string;
  build?: boolean;
  valgrind?: string;
  failed_tests?: string[];
  original_error?: string;
}

// Loading Spinner Component
const LoadingSpinner = () => (
  <div className="loading-spinner">
    <div className="spinner"></div>
  </div>
);

const CodingQuestions = ({ toggleDark }: Prop) => {
  const [data, setData] = useState<CodingQuestionData | null>(null);
  const [error, setError] = useState<string>('');
  const [loading, setLoading] = useState(true);
  const [tabLoading, setTabLoading] = useState(false);
  const navigate = useNavigate();
  const location = useLocation();
  const { isVisible } = useSidebar();
  
  // Initialize the activeTab state based on URL parameters
  const initialTab = new URLSearchParams(location.search).get('tab') === 'codelab' ? 'codelab' : 'questions';
  const [activeTab, setActiveTab] = useState<'questions' | 'codelab'>(initialTab);
  const activeTabRef = useRef(activeTab);
  
  // Update ref when activeTab changes
  useEffect(() => {
    activeTabRef.current = activeTab;
  }, [activeTab]);
  
  // Code Lab States
  const [code, setCode] = useState('// Write your C code here\n// Do not include a main function\n\n');
  const [tests, setTests] = useState('// Write test cases here (optional)\n// Examples:\n// assert(sum(2, 3) == 5);\n// assert(multiply(4, 5) == 20);');
  const [result, setResult] = useState<ExecutionResult | null>(null);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [feedback, setFeedback] = useState('');

  // Monitor URL parameter changes
  useEffect(() => {
    const queryParams = new URLSearchParams(location.search);
    const tabParam = queryParams.get('tab');
    
    // Only update the active tab if the URL parameter explicitly indicates a tab
    if (tabParam === 'codelab' || tabParam === 'questions') {
      if (tabParam !== activeTab) {
        setActiveTab(tabParam as 'codelab' | 'questions');
      }
    }
  }, [location, activeTab]);

  // Update URL when tab changes using router navigation instead of history API
  const updateUrl = (tab: string) => {
    // Use navigate to change the URL without a full page reload
    navigate(`?tab=${tab}`, { replace: true });
  };

  // Handle tab switching
  const handleTabChange = (tab: 'questions' | 'codelab') => {
    if (tab === activeTab) return;
    
    // Start loading animation
    setTabLoading(true);
    
    // Update state
    setActiveTab(tab);
    
    // Update URL
    updateUrl(tab);
    
    // Finish loading after a short delay for UI smoothness
    setTimeout(() => {
      setTabLoading(false);
    }, 300);
  };

  // Load saved code and tests from localStorage when component mounts
  useEffect(() => {
    const savedCode = localStorage.getItem('codelab_code');
    const savedTests = localStorage.getItem('codelab_tests');
    
    if (savedCode) {
      setCode(savedCode);
    }
    
    if (savedTests) {
      setTests(savedTests);
    }
  }, []);

  // Load data for the active tab
  useEffect(() => {
    // Fetch questions when on the questions tab
    if (activeTab === 'questions') {
      setTabLoading(true);
      fetchCodingQuestions().finally(() => {
        setTabLoading(false);
      });
    }
  }, [activeTab]); // Only run when activeTab changes

  // Save code and tests to localStorage when they change
  useEffect(() => {
    localStorage.setItem('codelab_code', code);
  }, [code]);

  useEffect(() => {
    localStorage.setItem('codelab_tests', tests);
  }, [tests]);

  const fetchCodingQuestions = (retryCount = 0) => {
    if (activeTab !== 'questions') return Promise.resolve(); // Don't fetch if not on questions tab
    
    setLoading(true);
    return fetch('http://127.0.0.1:5000/api/coding-questions')
      .then(response => {
        if (!response.ok) {
          throw new Error(`Network response was not ok: ${response.status} ${response.statusText}`);
        }
        return response.json();
      })
      .then((responseData) => {
        setData(responseData);
        setLoading(false);
        setError('');
      })
      .catch(error => {
        console.log("Error caught:", error);
        setError(error.message);
        setLoading(false);
        
        // Add retry logic for network errors (but not for 4xx/5xx errors)
        if (retryCount < 2 && error.message.includes('fetch')) {
          console.log(`Retrying fetch attempt ${retryCount + 1}...`);
          // Wait increasing time before each retry
          setTimeout(() => {
            fetchCodingQuestions(retryCount + 1);
          }, 1000 * (retryCount + 1));
        }
      });
  };

  const goToHomepage = () => {
    navigate('/homepage');
  };

  const goToQuestion = (id: number) => {
    navigate(`/coding-question/${id}`);
  };
  
  // Code Lab Functions with enhanced error handling
  const onCodeChange = (e: React.ChangeEvent<HTMLTextAreaElement>) => {
    setCode(e.target.value);
  };

  const onTestsChange = (e: React.ChangeEvent<HTMLTextAreaElement>) => {
    setTests(e.target.value);
  };

  const executeCode = async (retryCount = 0) => {
    setIsSubmitting(true);
    setFeedback('');
    setResult(null);

    try {
      const response = await fetch('http://localhost:5000/api/test-code-execution', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          code,
          tests: tests.trim() ? tests : undefined
        }),
      });

      if (!response.ok) {
        const errorData = await response.json().catch(() => ({}));
        throw new Error(errorData.error || `Server error: ${response.status}`);
      }

      const data = await response.json();

      setResult(data.result);
          
      if (data.result.compile && !data.result.error) {
        if (data.result.failed_tests && data.result.failed_tests.length > 0) {
          setFeedback('Code compiled but some tests failed.');
        } else {
          setFeedback('Code compiled and executed successfully!');
        }
      } else {
        setFeedback(data.result.error || 'An error occurred during execution.');
      }
    } catch (error) {
      console.error('Error executing code:', error);
      
      // Check if it's a network error (not a server response error)
      const isNetworkError = error instanceof Error && 
        (error.message.includes('NetworkError') || 
         error.message.includes('Failed to fetch') ||
         error.message.includes('Network request failed'));
      
      // Retry logic for network errors only
      if (isNetworkError && retryCount < 2) {
        setFeedback(`Network issue detected. Retrying (${retryCount + 1}/3)...`);
        
        // Wait with exponential backoff before retrying
        setTimeout(() => {
          executeCode(retryCount + 1);
        }, 1000 * Math.pow(2, retryCount));
        
        return; // Exit early, the retry will call setIsSubmitting(false)
      }
      
      setFeedback(`Error: ${error instanceof Error ? error.message : 'Connection error or service unavailable'}`);
    } finally {
      setIsSubmitting(false);
    }
  };

  // Add helper function after the imports
  const getPreviewText = (text: string): string => {
    // First remove any markdown headers
    const cleanText = text.replace(/^#+ +.*$/gm, '').trim();
    
    // Get the first paragraph or segment
    const firstParagraph = cleanText.split('\n\n')[0];
    
    // Limit to 150 characters
    if (firstParagraph.length > 150) {
      return `${firstParagraph.substring(0, 150)}...`;
    }
    
    return firstParagraph;
  };

  return (
    <div className={`coding-question-container ${isVisible ? "sidebar-expanded" : "sidebar-collapsed"}`}>
      {/* Left Sidebar */}
      <SideBar toggleDark={toggleDark} />
      
      <div className="right-content-wrapper">
        {/* Header */}
        <Home_Header toggleOverlay={() => {}} />
        
        <div className="coding-question-content">
          <div className="coding-lab-tabs">
            <div 
              className={`coding-lab-tab ${activeTab === 'questions' ? 'active' : ''}`} 
              onClick={() => handleTabChange('questions')}
              data-testid="questions-tab"
            >
              Practice Questions
            </div>
            <div 
              className={`coding-lab-tab ${activeTab === 'codelab' ? 'active' : ''}`} 
              onClick={() => handleTabChange('codelab')}
              data-testid="codelab-tab"
            >
              Free Coding
            </div>
          </div>
          
          {tabLoading && <LoadingSpinner />}
          
          {!tabLoading && activeTab === 'questions' && (
            <div key="questions-panel" data-testid="questions-panel">
              <div className="coding-question-header">
                <h2>Coding Practice Questions</h2>
                {data && <div className="question-count">{data.total_questions} available questions</div>}
              </div>
              
              {loading && <div className="loading-state">Loading questions...</div>}
              {error && <div className="error-state">Error: {error}</div>}
              
              {!loading && !error && data && (
                <ul className="questions-list">
                  {data.questions.map((question) => (
                    <li key={question.qid} className="question-item" onClick={() => goToQuestion(question.qid)}>
                      <div className="question-title">
                        <strong>Question {question.qid}</strong>
                        
                        <div className="question-meta">
                          <span className="topic">{question.topic}</span>
                          <span className={`difficulty ${question.difficulty.toLowerCase()}`}>
                            {question.difficulty}
                          </span>
                        </div>
                      </div>
                      <div className="question-text">
                        <ReactMarkdown>
                          {getPreviewText(question.qtext)}
                        </ReactMarkdown>
                      </div>
                    </li>
                  ))}
                </ul>
              )}
            </div>
          )}
          
          {!tabLoading && activeTab === 'codelab' && (
            <div key="codelab-panel" data-testid="codelab-panel" className="codelab-panel-content">
              <div className="coding-question-header">
                <h2>💻 Free Code Lab</h2>
                <div className="question-count">Write, test, and execute C code</div>
              </div>

              <div className="problem-statement">
                <h3>Instructions</h3>
                <p>Write C code in the editor below. The code will be compiled and executed on the server. You can also write test cases to verify your code works correctly.</p>
                <p>Note: Do not include a main function in your code. Functions will be called automatically based on your test cases.</p>
              </div>

              <div className="code-editor-section">
                <div className="editor-container">
                  <h3>Code Editor</h3>
                  <textarea
                    className="code-editor"
                    value={code}
                    onChange={onCodeChange}
                    placeholder="// Write your C code here..."
                    disabled={isSubmitting}
                  ></textarea>
                </div>

                <div className="editor-container">
                  <h3>Test Cases (Optional)</h3>
                  <textarea
                    className="code-editor"
                    value={tests}
                    onChange={onTestsChange}
                    placeholder="// Write test assertions here (optional)...\n// Example: assert(sum(2, 3) == 5);"
                    disabled={isSubmitting}
                  ></textarea>
                </div>
              </div>

              <div className="execution-controls">
                <button 
                  className="submit-button"
                  onClick={() => executeCode(0)}
                  disabled={isSubmitting || !code.trim()}
                >
                  {isSubmitting ? 'Executing...' : 'Execute Code'}
                </button>
              </div>

              {isSubmitting && <LoadingSpinner />}

              {feedback && (
                <div className={`execution-feedback ${feedback.includes('successfully') ? 'success-feedback' : 'error-feedback'}`}>
                  {feedback}
                </div>
              )}

              {result && (
                <div className="execution-results">
                  <h3>Execution Results</h3>
                  <div className="result-status">
                    <div className="status-item">
                      <span className="status-label">Compilation:</span>
                      <span className={`status-value ${result.compile ? "status-success" : "status-error"}`}>
                        {result.compile ? "Successful" : "Failed"}
                      </span>
                    </div>
                    {result.compile && (
                      <div className="status-item">
                        <span className="status-label">Execution:</span>
                        <span className={`status-value ${!result.error ? "status-success" : "status-error"}`}>
                          {!result.error ? "Successful" : "Failed"}
                        </span>
                      </div>
                    )}
                  </div>

                  {result.compile && result.output && (
                    <div className="output-container">
                      <h4>Output:</h4>
                      <pre className="output-display">{result.output || '(No output)'}</pre>
                    </div>
                  )}

                  {result.error && (
                    <div className="output-container">
                      <h4>Errors:</h4>
                      <pre className="output-display error-output">{result.error}</pre>
                    </div>
                  )}

                  {result.failed_tests && result.failed_tests.length > 0 && (
                    <div className="failed-tests">
                      <h4>Failed Tests ({result.failed_tests.length}):</h4>
                      <ul>
                        {result.failed_tests.map((test, index) => (
                          <li key={index}>{test}</li>
                        ))}
                      </ul>
                    </div>
                  )}
                </div>
              )}
            </div>
          )}
          
          <div className="navigation-buttons">
            <button className="home-button" onClick={goToHomepage}>
              Back to Home
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};

export default CodingQuestions;