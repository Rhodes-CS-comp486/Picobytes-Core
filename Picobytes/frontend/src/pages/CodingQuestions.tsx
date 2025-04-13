import { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import Home_Header from './home/home_header';
import SideBar from './home/side_bar';
import './Questions.css';
import './CodingQuestion.css'; // Import the new CSS file

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

const CodingQuestions = ({ toggleDark }: Prop) => {
  const [data, setData] = useState<CodingQuestionData | null>(null);
  const [error, setError] = useState<string>('');
  const [loading, setLoading] = useState(true);
  const navigate = useNavigate();

  useEffect(() => {
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
  }, []);

  const goToHomepage = () => {
    navigate('/homepage');
  };

  const goToQuestion = (id: number) => {
    navigate(`/coding-question/${id}`);
  };

  if (loading) return (
    <div className="coding-question-container">
      <Home_Header toggleOverlay={() => {}} />
      <SideBar toggleDark={toggleDark} />
      <div className="coding-question-content">
        <div className="coding-question-header">
          <h2>Coding Questions</h2>
        </div>
        <div className="loading-state">Loading coding questions...</div>
      </div>
    </div>
  );
  
  if (error) return (
    <div className="coding-question-container">
      <Home_Header toggleOverlay={() => {}} />
      <SideBar toggleDark={toggleDark} />
      <div className="coding-question-content">
        <div className="coding-question-header">
          <h2>Coding Questions</h2>
        </div>
        <div className="error-state">Error: {error}</div>
      </div>
    </div>
  );
  
  if (!data) return (
    <div className="coding-question-container">
      <Home_Header toggleOverlay={() => {}} />
      <SideBar toggleDark={toggleDark} />
      <div className="coding-question-content">
        <div className="coding-question-header">
          <h2>Coding Questions</h2>
        </div>
        <div className="empty-state">No coding questions available</div>
      </div>
    </div>
  );

  return (
    <div className="coding-question-container">
      <Home_Header toggleOverlay={() => {}} />
      <SideBar toggleDark={toggleDark}/>
      <div className="coding-question-content">
        <div className="coding-question-header">
          <h2>Coding Questions</h2>
          <div className="question-count">{data.total_questions} available questions</div>
        </div>
        
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