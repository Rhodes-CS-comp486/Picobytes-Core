import { useEffect, useState } from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import Home_Header from './home/home_header';
import SideBar from './home/side_bar';
import './Questions.css';
import './CodingQuestion.css'; // Import the new CSS file
import './code_execution/code_execution.css'; // Import Code Lab CSS

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

const CodingQuestions = ({ toggleDark }: Prop) => {
  const [data, setData] = useState<CodingQuestionData | null>(null);
  const [error, setError] = useState<string>('');
  const [loading, setLoading] = useState(true);
  const navigate = useNavigate();
  const location = useLocation();
  const [activeTab, setActiveTab] = useState<'questions' | 'codelab'>('questions');
  
  // Code Lab States
  const [code, setCode] = useState('// Write your C code here\n// Do not include a main function\n\n');
  const [tests, setTests] = useState('// Write test cases here (optional)\n// Examples:\n// assert(sum(2, 3) == 5);\n// assert(multiply(4, 5) == 20);');
  const [result, setResult] = useState<ExecutionResult | null>(null);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [feedback, setFeedback] = useState('');

  useEffect(() => {
    // Check URL parameters for active tab
    const queryParams = new URLSearchParams(location.search);
    const tabParam = queryParams.get('tab');
    
    if (tabParam === 'codelab') {
      setActiveTab('codelab');
    } else {
      setActiveTab('questions');
    }
  }, [location]);

  useEffect(() => {
    if (activeTab === 'questions') {
      fetchCodingQuestions();
    }
  }, [activeTab]);

  const fetchCodingQuestions = () => {
    setLoading(true);
    fetch('http://127.0.0.1:5000/api/coding-questions')
      .then(response => {
        if (!response.ok) {
          throw new Error('Network response was not ok');
        }
        return response.json();
      })
      .then((responseData) => {
        setData(responseData);
        setLoading(false);
      })
      .catch(error => {
        console.log("Error caught:", error);
        setError(error.message);
        setLoading(false);
      });
  };

  const goToHomepage = () => {
    navigate('/homepage');
  };

  const goToQuestion = (id: number) => {
    navigate(`/coding-question/${id}`);
  };
  
  // Code Lab Functions
  const onCodeChange = (e: React.ChangeEvent<HTMLTextAreaElement>) => {
    setCode(e.target.value);
  };

  const onTestsChange = (e: React.ChangeEvent<HTMLTextAreaElement>) => {
    setTests(e.target.value);
  };

  const executeCode = async () => {
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

      const data = await response.json();

      if (response.ok) {
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
      } else {
        setFeedback(data.error || 'Failed to execute code.');
      }
    } catch (error) {
      console.error('Error executing code:', error);
      setFeedback(`Error: ${error instanceof Error ? error.message : 'Unknown error'}`);
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="coding-question-container">
      <Home_Header toggleOverlay={() => {}} />
      <SideBar toggleDark={toggleDark}/>
      <div className="coding-question-content">
        <div className="coding-lab-tabs">
          <div 
            className={`coding-lab-tab ${activeTab === 'questions' ? 'active' : ''}`} 
            onClick={() => setActiveTab('questions')}
          >
            Practice Questions
          </div>
          <div 
            className={`coding-lab-tab ${activeTab === 'codelab' ? 'active' : ''}`} 
            onClick={() => setActiveTab('codelab')}
          >
            Free Coding
          </div>
        </div>
        
        {activeTab === 'questions' && (
          <>
            <div className="coding-question-header">
              <h2>Coding Practice Questions</h2>
              {data && <div className="question-count">{data.total_questions} available questions</div>}
            </div>
            
            {loading ? (
              <div className="loading-state">Loading coding questions...</div>
            ) : error ? (
              <div className="error-state">Error: {error}</div>
            ) : !data ? (
              <div className="empty-state">No coding questions available</div>
            ) : (
              <>
                <ul className="questions-list">
                  {data.questions.map((question) => (
                    <li 
                      key={question.qid} 
                      className="question-item"
                      onClick={() => goToQuestion(question.qid)}
                    >
                      <div className="question-title">
                        <strong>Question #{question.qid}</strong>
                      </div>
                      <div className="question-text">{question.qtext}</div>
                      <div className="question-meta">
                        <span className="topic">{question.topic}</span>
                        <span className={`difficulty ${question.difficulty.toLowerCase()}`}>
                          {question.difficulty}
                        </span>
                      </div>
                    </li>
                  ))}
                </ul>
              </>
            )}
          </>
        )}
        
        {activeTab === 'codelab' && (
          <div id="code-execution-content">
            <div id="code-execution-title">
              💻 Free Code Lab
              <div>Write, test, and execute C code</div>
            </div>

            <div id="code-editor-section">
              <div className="editor-container">
                <h3>Code Editor</h3>
                <textarea
                  id="code-editor"
                  value={code}
                  onChange={onCodeChange}
                  placeholder="Write your C code here..."
                  disabled={isSubmitting}
                ></textarea>
              </div>

              <div className="editor-container">
                <h3>Test Cases (Optional)</h3>
                <textarea
                  id="test-editor"
                  value={tests}
                  onChange={onTestsChange}
                  placeholder="Write test assertions here (optional)..."
                  disabled={isSubmitting}
                ></textarea>
              </div>
            </div>

            <div id="execution-controls">
              <button 
                id="execute-button"
                onClick={executeCode}
                disabled={isSubmitting || !code.trim()}
              >
                {isSubmitting ? 'Executing...' : 'Execute Code'}
              </button>
            </div>

            {feedback && (
              <div id="execution-feedback" className={
                feedback.includes('successfully') ? 'success-feedback' : 'error-feedback'
              }>
                {feedback}
              </div>
            )}

            {result && (
              <div id="execution-results">
                <h3>Execution Results</h3>
                
                <div className="result-status">
                  <div className="status-item">
                    <span className="status-label">Compilation:</span>
                    <span className={`status-value ${result.compile ? 'status-success' : 'status-error'}`}>
                      {result.compile ? 'Success' : 'Failed'}
                    </span>
                  </div>
                  
                  {result.compile && (
                    <div className="status-item">
                      <span className="status-label">Execution:</span>
                      <span className={`status-value ${result.run ? 'status-success' : 'status-error'}`}>
                        {result.run ? 'Success' : 'Failed'}
                      </span>
                    </div>
                  )}
                  
                  {result.valgrind && result.valgrind !== "Not available" && (
                    <div className="status-item">
                      <span className="status-label">Memory Analysis:</span>
                      <span className="status-value">
                        {result.valgrind}
                      </span>
                    </div>
                  )}
                </div>
                
                <div className="output-container">
                  <h4>Output:</h4>
                  <pre className="output-display">{result.output || 'No output'}</pre>
                </div>
                
                {result.failed_tests && result.failed_tests.length > 0 && (
                  <div className="failed-tests">
                    <h4>Failed Tests:</h4>
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
  );
};

export default CodingQuestions; 