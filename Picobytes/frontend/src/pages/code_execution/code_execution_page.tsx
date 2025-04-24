/// Code Execution Page TSX ///////////////////////////////////////////////

import { useState, useEffect } from 'react';
import './code_execution.css';
import Home_Header from '../home/home_header';
import Home_Prof_Overlay from '../home/home_prof_overlay';
import SideBar from '../home/side_bar';
import { useSidebar } from '../home/side_bar_context';

/// INTERFACES /////////////////////////////////////////////////////////////
interface Prop {
    toggleDark: () => void;
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

/**
 * CodeExecutionPage component - Allows users to write and execute C code
 */
const CodeExecutionPage = ({ toggleDark }: Prop) => {
    /// CONSTANTS ////////////////////////////////////////////////////////
    const [showOverlay, setShowOverlay] = useState(false);
    const [code, setCode] = useState('// Write your C code here\n// Do not include a main function\n\n');
    const [tests, setTests] = useState('// Write test cases here (optional)\n// Examples:\n// assert(sum(2, 3) == 5);\n// assert(multiply(4, 5) == 20);');
    const [result, setResult] = useState<ExecutionResult | null>(null);
    const [isSubmitting, setIsSubmitting] = useState(false);
    const [feedback, setFeedback] = useState('');

    const { isVisible } = useSidebar();

    const toggleOverlay = () => {
        setShowOverlay(!showOverlay);
    };

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

    /// MAIN CONTENT ////////////////////////////////////////////////////
    return (
        <div className={`code-execution-container ${isVisible ? "sidebar-expanded" : "sidebar-collapsed"}`}>
            {/* Header */}
            <Home_Header toggleOverlay={toggleOverlay} />
            {showOverlay && <Home_Prof_Overlay />}

            {/* Left Sidebar */}
            <SideBar toggleDark={toggleDark}></SideBar>

            {/* MAIN CONTENT */}
            <div className="code-execution-content">
                <div id="code-execution-title">
                    💻 Free Code Lab
                    <div>Write, test, and execute C code</div>
                </div>

                <div id="code-instructions">
                    <h3>Instructions</h3>
                    <p>Write C code in the editor below. The code will be compiled and executed on the server. You can also write test cases to verify your code works correctly.</p>
                    <p><strong>Note:</strong> Do not include a main function in your code. Functions will be called automatically based on your test cases.</p>
                </div>

                <div id="code-editor-section">
                    <div className="editor-container">
                        <h3>Code Editor</h3>
                        <textarea
                            id="code-editor"
                            value={code}
                            onChange={onCodeChange}
                            placeholder="// Write your C code here
// Do not include a main function

int sum(int a, int b) {
    return a + b;
}

int multiply(int a, int b) {
    return a * b;
}"
                            disabled={isSubmitting}
                        ></textarea>
                    </div>

                    <div className="editor-container">
                        <h3>Test Cases (Optional)</h3>
                        <textarea
                            id="test-editor"
                            value={tests}
                            onChange={onTestsChange}
                            placeholder="// Write test cases here (optional)
// Examples:
// assert(sum(2, 3) == 5);
// assert(multiply(4, 5) == 20);"
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
        </div>
    );
};

export default CodeExecutionPage; 