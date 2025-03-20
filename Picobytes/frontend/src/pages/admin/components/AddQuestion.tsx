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
  
  // For multiple choice questions
  const [option1, setOption1] = useState<string>('');
  const [option2, setOption2] = useState<string>('');
  const [option3, setOption3] = useState<string>('');
  const [option4, setOption4] = useState<string>('');
  const [correctMCAnswer, setCorrectMCAnswer] = useState<number>(1);
  
  // For true/false questions
  const [correctTFAnswer, setCorrectTFAnswer] = useState<boolean>(true);
  
  const [isSubmitting, setIsSubmitting] = useState<boolean>(false);
  const [feedback, setFeedback] = useState<{ message: string; type: 'success' | 'error' } | null>(null);

  const resetForm = () => {
    setQuestionText('');
    setQuestionLevel('easy');
    setQuestionTopic('');
    setOption1('');
    setOption2('');
    setOption3('');
    setOption4('');
    setCorrectMCAnswer(1);
    setCorrectTFAnswer(true);
    setFeedback(null);
  };

  const validateForm = (): boolean => {
    if (!questionText.trim()) {
      setFeedback({
        message: 'Question text is required',
        type: 'error'
      });
      return false;
    }

    if (!questionTopic.trim()) {
      setFeedback({
        message: 'Question topic is required',
        type: 'error'
      });
      return false;
    }

    if (questionType === 'multiple_choice') {
      if (!option1.trim() || !option2.trim() || !option3.trim() || !option4.trim()) {
        setFeedback({
          message: 'All four options are required for multiple choice questions',
          type: 'error'
        });
        return false;
      }
    }

    return true;
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!validateForm()) {
      return;
    }
    
    setIsSubmitting(true);
    setFeedback(null);
    
    try {
      const questionData = {
        qtext: questionText,
        qtype: questionType,
        qlevel: questionLevel,
        qtopic: questionTopic,
        qactive: true,
        ...(questionType === 'multiple_choice' 
          ? { 
              option1, 
              option2, 
              option3, 
              option4, 
              answer: correctMCAnswer 
            } 
          : { 
              correct: correctTFAnswer 
            }
        )
      };
      
      const response = await fetch('http://localhost:5000/api/admin/add_question', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(questionData),
      });
      
      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.error || 'Failed to add question');
      }
      
      const data = await response.json();
      
      setFeedback({
        message: `Question added successfully! Question ID: ${data.qid}`,
        type: 'success'
      });
      
      resetForm();
      onQuestionAdded();
      
    } catch (error) {
      setFeedback({
        message: error instanceof Error ? error.message : 'An unknown error occurred',
        type: 'error'
      });
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="add-question-container">
      <form onSubmit={handleSubmit} className="question-form">
        {feedback && (
          <div className={`feedback-message ${feedback.type}`}>
            {feedback.message}
          </div>
        )}
        
        <div className="form-group">
          <label htmlFor="questionType">Question Type</label>
          <select 
            id="questionType" 
            value={questionType} 
            onChange={(e) => setQuestionType(e.target.value)}
            disabled={isSubmitting}
          >
            <option value="multiple_choice">Multiple Choice</option>
            <option value="true_false">True/False</option>
          </select>
        </div>
        
        <div className="form-group">
          <label htmlFor="questionText">Question Text</label>
          <textarea 
            id="questionText" 
            value={questionText} 
            onChange={(e) => setQuestionText(e.target.value)}
            placeholder="Enter the question text"
            rows={3}
            disabled={isSubmitting}
            required
          />
        </div>
        
        <div className="form-row">
          <div className="form-group">
            <label htmlFor="questionLevel">Difficulty Level</label>
            <select 
              id="questionLevel" 
              value={questionLevel} 
              onChange={(e) => setQuestionLevel(e.target.value)}
              disabled={isSubmitting}
            >
              <option value="easy">Easy</option>
              <option value="medium">Medium</option>
              <option value="hard">Hard</option>
            </select>
          </div>
          
          <div className="form-group">
            <label htmlFor="questionTopic">Topic</label>
            <input 
              type="text" 
              id="questionTopic" 
              value={questionTopic} 
              onChange={(e) => setQuestionTopic(e.target.value)}
              placeholder="e.g. Linux, C Basics, C Memory Management"
              disabled={isSubmitting}
              required
            />
          </div>
        </div>
        
        {questionType === 'multiple_choice' ? (
          <div className="options-container">
            <h3>Multiple Choice Options</h3>
            
            <div className="form-group">
              <label htmlFor="option1">Option 1</label>
              <input 
                type="text" 
                id="option1" 
                value={option1} 
                onChange={(e) => setOption1(e.target.value)}
                placeholder="Enter option 1"
                disabled={isSubmitting}
                required
              />
            </div>
            
            <div className="form-group">
              <label htmlFor="option2">Option 2</label>
              <input 
                type="text" 
                id="option2" 
                value={option2} 
                onChange={(e) => setOption2(e.target.value)}
                placeholder="Enter option 2"
                disabled={isSubmitting}
                required
              />
            </div>
            
            <div className="form-group">
              <label htmlFor="option3">Option 3</label>
              <input 
                type="text" 
                id="option3" 
                value={option3} 
                onChange={(e) => setOption3(e.target.value)}
                placeholder="Enter option 3"
                disabled={isSubmitting}
                required
              />
            </div>
            
            <div className="form-group">
              <label htmlFor="option4">Option 4</label>
              <input 
                type="text" 
                id="option4" 
                value={option4} 
                onChange={(e) => setOption4(e.target.value)}
                placeholder="Enter option 4"
                disabled={isSubmitting}
                required
              />
            </div>
            
            <div className="form-group">
              <label htmlFor="correctAnswer">Correct Answer</label>
              <select 
                id="correctAnswer" 
                value={correctMCAnswer} 
                onChange={(e) => setCorrectMCAnswer(parseInt(e.target.value))}
                disabled={isSubmitting}
              >
                <option value={1}>Option 1</option>
                <option value={2}>Option 2</option>
                <option value={3}>Option 3</option>
                <option value={4}>Option 4</option>
              </select>
            </div>
          </div>
        ) : (
          <div className="true-false-container">
            <h3>True/False Answer</h3>
            
            <div className="form-group radio-group">
              <label>Correct Answer</label>
              <div className="radio-options">
                <label>
                  <input 
                    type="radio" 
                    name="correctTFAnswer" 
                    checked={correctTFAnswer === true} 
                    onChange={() => setCorrectTFAnswer(true)}
                    disabled={isSubmitting}
                  /> 
                  True
                </label>
                <label>
                  <input 
                    type="radio" 
                    name="correctTFAnswer" 
                    checked={correctTFAnswer === false} 
                    onChange={() => setCorrectTFAnswer(false)}
                    disabled={isSubmitting}
                  /> 
                  False
                </label>
              </div>
            </div>
          </div>
        )}
        
        <div className="form-actions">
          <button 
            type="button" 
            onClick={resetForm} 
            className="reset-button"
            disabled={isSubmitting}
          >
            Reset
          </button>
          <button 
            type="submit" 
            className="submit-button"
            disabled={isSubmitting}
          >
            {isSubmitting ? 'Adding...' : 'Add Question'}
          </button>
        </div>
      </form>
    </div>
  );
};

export default AddQuestion;