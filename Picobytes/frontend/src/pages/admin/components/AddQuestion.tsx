import React, { useState } from 'react';
import './AddQuestion.css';

interface AddQuestionProps {
  onQuestionAdded: () => void;
}

const AddQuestion: React.FC<AddQuestionProps> = ({ onQuestionAdded }) => {
  const [questionType, setQuestionType] = useState<string>('multiple_choice');
  const [questionText, setQuestionText] = useState<string>('');
  const [questionLevel, setQuestionLevel] = useState<string>('easy');
  const [questionTopic, setQuestionTopic] = useState<string>('');

  // Multiple choice state
  const [option1, setOption1] = useState<string>('');
  const [option2, setOption2] = useState<string>('');
  const [option3, setOption3] = useState<string>('');
  const [option4, setOption4] = useState<string>('');
  const [correctMCAnswer, setCorrectMCAnswer] = useState<number>(1);

  // True/False state
  const [correctTFAnswer, setCorrectTFAnswer] = useState<boolean>(true);

  // Code blocks state (10 blocks)
  const [codeBlocks, setCodeBlocks] = useState<{ [key: string]: string }>({
    block1: '', block2: '', block3: '', block4: '', block5: '',
    block6: '', block7: '', block8: '', block9: '', block10: ''
  });
  const [blockOrder, setBlockOrder] = useState<string>('');

  // Free response state
  const [profAnswer, setProfAnswer] = useState<string>('');

  // Coding question state
  const [starter, setStarter] = useState<string>('');
  const [testcases, setTestcases] = useState<string>('');
  const [correctCode, setCorrectCode] = useState<string>('');

  const [isSubmitting, setIsSubmitting] = useState<boolean>(false);
  const [feedback, setFeedback] = useState<{ message: string; type: 'success' | 'error' } | null>(null);

  const resetForm = () => {
    setQuestionText('');
    setQuestionLevel('easy');
    setQuestionTopic('');
    setOption1(''); setOption2(''); setOption3(''); setOption4(''); setCorrectMCAnswer(1);
    setCorrectTFAnswer(true);
    setCodeBlocks({ block1: '', block2: '', block3: '', block4: '', block5: '', block6: '', block7: '', block8: '', block9: '', block10: '' });
    setBlockOrder('');
    setProfAnswer('');
    setStarter(''); setTestcases(''); setCorrectCode('');
    setFeedback(null);
  };

  const validateForm = (): boolean => {
    if (!questionText.trim()) {
      setFeedback({ message: 'Question text is required', type: 'error' }); return false;
    }
    if (!questionTopic.trim()) {
      setFeedback({ message: 'Question topic is required', type: 'error' }); return false;
    }
    switch (questionType) {
      case 'multiple_choice':
        if (!option1.trim() || !option2.trim() || !option3.trim() || !option4.trim()) {
          setFeedback({ message: 'All four options are required', type: 'error' }); return false;
        }
        break;
      case 'true_false':
        // no extra validation
        break;
      case 'code_blocks':
        if (!blockOrder.trim()) {
          setFeedback({ message: 'Block order is required', type: 'error' }); return false;
        }
        break;
      case 'free_response':
        if (!profAnswer.trim()) {
          setFeedback({ message: 'Model answer is required', type: 'error' }); return false;
        }
        break;
      case 'coding':
        if (!starter.trim() || !testcases.trim() || !correctCode.trim()) {
          setFeedback({ message: 'Starter, testcases, and correct code are required', type: 'error' }); return false;
        }
        break;
      default:
        break;
    }
    return true;
  };

  const handleCodeBlockChange = (i: number, val: string) => {
    setCodeBlocks(prev => ({ ...prev, [`block${i}`]: val }));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!validateForm()) return;
    setIsSubmitting(true); setFeedback(null);
    try {
      const base = { qtext: questionText, qtype: questionType, qlevel: questionLevel, qtopic: questionTopic, qactive: true };
      let questionData: Record<string, any>;
      switch (questionType) {
        case 'multiple_choice':
          questionData = { ...base, option1, option2, option3, option4, answer: correctMCAnswer };
          break;
        case 'true_false':
          questionData = { ...base, correct: correctTFAnswer };
          break;
        case 'code_blocks': {
          const blocksPayload: Record<string, string> = {};
          for (let i = 1; i <= 10; i++) {
            blocksPayload[`block${i}`] = codeBlocks[`block${i}`].trim() || '-1000';
          }
          questionData = { ...base, ...blocksPayload, answer: blockOrder.trim() };
          break;
        }
        case 'free_response':
          questionData = { ...base, prof_answer: profAnswer };
          break;
        case 'coding':
          questionData = { ...base, starter, testcases, correctcode: correctCode };
          break;
        default:
          throw new Error('Unsupported question type');
      }
      const res = await fetch('http://127.0.0.1:5000/api/admin/add_question', {
        method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify(questionData)
      });
      if (!res.ok) throw new Error((await res.json()).error || 'Failed to add');
      const data = await res.json();
      setFeedback({ message: `Added! QID: ${data.qid}`, type: 'success' });
      resetForm(); onQuestionAdded();
    } catch (err) {
      setFeedback({ message: err instanceof Error ? err.message : 'Unknown error', type: 'error' });
    } finally { setIsSubmitting(false); }
  };

  return (
    <div className="add-question-container">
      <form onSubmit={handleSubmit} className="question-form">
        {feedback && <div className={`feedback-message ${feedback.type}`}>{feedback.message}</div>}
        <div className="form-group">
          <label>Question Type</label>
          <select value={questionType} onChange={e => setQuestionType(e.target.value)} disabled={isSubmitting}>
            <option value="multiple_choice">Multiple Choice</option>
            <option value="true_false">True/False</option>
            <option value="code_blocks">Code Blocks</option>
            <option value="free_response">Free Response</option>
            <option value="coding">Coding</option>
          </select>
        </div>
        <div className="form-group">
          <label>Question Text</label>
          <textarea value={questionText} onChange={e => setQuestionText(e.target.value)} rows={3} disabled={isSubmitting} required />
        </div>
        <div className="form-row">
          <div className="form-group">
            <label>Difficulty Level</label>
            <select value={questionLevel} onChange={e => setQuestionLevel(e.target.value)} disabled={isSubmitting}>
              <option value="easy">Easy</option>
              <option value="medium">Medium</option>
              <option value="hard">Hard</option>
            </select>
          </div>
          <div className="form-group">
            <label>Topic</label>
            <input type="text" value={questionTopic} onChange={e => setQuestionTopic(e.target.value)} placeholder="e.g. C Basics" disabled={isSubmitting} required />
          </div>
        </div>
        {questionType === 'multiple_choice' && (
          <div className="options-container">
            <h3>Multiple Choice Options</h3>
            {['option1','option2','option3','option4'].map((opt, idx)=>(
              <div key={opt} className="form-group">
                <label>Option {idx+1}</label>
                <input type="text" value={[option1,option2,option3,option4][idx]}
                  onChange={e=>[setOption1,setOption2,setOption3,setOption4][idx](e.target.value)} disabled={isSubmitting} required />
              </div>
            ))}
            <div className="form-group">
              <label>Correct Answer</label>
              <select value={correctMCAnswer} onChange={e=>setCorrectMCAnswer(Number(e.target.value))} disabled={isSubmitting}>
                {[1,2,3,4].map(i=><option key={i} value={i}>Option {i}</option>)}
              </select>
            </div>
          </div>
        )}
        {questionType === 'true_false' && (
          <div className="options-container">
            <h3>True/False</h3>
            <div className="form-group">
              <label>Correct Answer</label>
              <select value={correctTFAnswer.toString()} onChange={e=>setCorrectTFAnswer(e.target.value==='true')} disabled={isSubmitting}>
                <option value="true">True</option>
                <option value="false">False</option>
              </select>
            </div>
          </div>
        )}
        {questionType === 'code_blocks' && (
          <div className="options-container">
            <h3>Code Blocks</h3>
            {Array.from({length:10}).map((_,i)=>(
              <div key={i} className="form-group">
                <label>Block {i+1}</label>
                <textarea rows={3} value={codeBlocks[`block${i+1}`]} onChange={e=>handleCodeBlockChange(i+1,e.target.value)} disabled={isSubmitting} />
              </div>
            ))}
            <div className="form-group">
              <label>Block Order (e.g. "1,4,5,2,3")</label>
              <input type="text" value={blockOrder} onChange={e=>setBlockOrder(e.target.value)} disabled={isSubmitting} required />
            </div>
          </div>
        )}
        {questionType === 'free_response' && (
          <div className="options-container">
            <h3>Free Response</h3>
            <div className="form-group">
              <label>Model Answer</label>
              <textarea rows={4} value={profAnswer} onChange={e=>setProfAnswer(e.target.value)} disabled={isSubmitting} required />
            </div>
          </div>
        )}
        {questionType === 'coding' && (
          <div className="options-container">
            <h3>Coding Question</h3>
            <div className="form-group">
              <label>Starter Code</label>
              <textarea rows={4} value={starter} onChange={e=>setStarter(e.target.value)} disabled={isSubmitting} required />
            </div>
            <div className="form-group">
              <label>Test Cases</label>
              <textarea rows={4} value={testcases} onChange={e=>setTestcases(e.target.value)} disabled={isSubmitting} required />
            </div>
            <div className="form-group">
              <label>Correct Code</label>
              <textarea rows={4} value={correctCode} onChange={e=>setCorrectCode(e.target.value)} disabled={isSubmitting} required />
            </div>
          </div>
        )}
        <div className="form-actions">
          <button type="submit" disabled={isSubmitting} className="submit-button">
            {isSubmitting ? 'Adding...' : 'Add Question'}
          </button>
          <button type="button" onClick={resetForm} disabled={isSubmitting} className="reset-button">
            Reset
          </button>
        </div>
      </form>
    </div>
  );
};

export default AddQuestion;
