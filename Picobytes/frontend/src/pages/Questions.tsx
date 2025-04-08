import { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import Home_Header from './home/home_header';
import './questions.css';
import SideBar from './home/side_bar';

interface Prop {
  toggleDark: () => void;
}

interface QuestionData {
  questions: {
    tf: [number, string, string, number][];
    mc: [number, string, string, string, string, string, number, string][];
  };
  total_questions: number;
}

/// MAIN CONTENT //////////////////////////////
const Questions = ({toggleDark} : Prop) => {
  const [data, setData] = useState<QuestionData | null>(null);
  const [error, setError] = useState<string>('');
  const [loading, setLoading] = useState(true);
  const navigate = useNavigate();

  useEffect(() => {
    fetch('http://127.0.0.1:5000/api/questions')
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
    navigate(`/question/${id}`);
  };

  if (loading) return (
    <div className="duolingo-question-page">
      <Home_Header toggleOverlay={() => {}} />
      <div className="questions-page">Loading questions...</div>
    </div>
  );
  
  if (error) return (
    <div className="duolingo-question-page">
      <Home_Header toggleOverlay={() => {}} />
      <div className="questions-page">Error: {error}</div>
    </div>
  );
  
  if (!data) return (
    <div className="duolingo-question-page">
      <Home_Header toggleOverlay={() => {}} />
      <div className="questions-page">No questions available</div>
    </div>
  );

  return (
    <div className="duolingo-question-page">
      <Home_Header toggleOverlay={() => {}} />
      <SideBar toggleDark={toggleDark}/>
      <div className="questions-page">
        <h1>All Questions ({data.total_questions} total)</h1>
        
        <h2>True/False Questions</h2>
        <ul>
          {data.questions.tf.map((question) => (
            <li 
              key={question[0]} 
              className="question-item"
              onClick={() => goToQuestion(question[0])}
              style={{ cursor: 'pointer' }}
            >
              <strong>Question {question[0]}:</strong> {question[1]}
              <div className="level">{question[2]}</div>
              <div className="answer">
                <strong>Answer:</strong> <span className={question[3] ? 'correct' : 'incorrect'}>{question[3] ? 'True' : 'False'}</span>
              </div>
            </li>
          ))}
        </ul>

        <h2>Multiple Choice Questions</h2>
        <ul>
          {data.questions.mc.map((question) => (
            <li 
              key={question[0]} 
              className="question-item"
              onClick={() => goToQuestion(question[0])}
              style={{ cursor: 'pointer' }}
            >
              <strong>Question {question[0]}:</strong> {question[1]}
              <div className="level">{question[7]}</div>
              <div className="options">
                <strong>Options:</strong>
                <div className="answer-choices">
                  <button className={`option-button ${question[6] === 1 ? 'correct' : ''}`} disabled>
                    <span className="option-number">1.</span> {question[2]}
                  </button>
                  <button className={`option-button ${question[6] === 2 ? 'correct' : ''}`} disabled>
                    <span className="option-number">2.</span> {question[3]}
                  </button>
                  <button className={`option-button ${question[6] === 3 ? 'correct' : ''}`} disabled>
                    <span className="option-number">3.</span> {question[4]}
                  </button>
                  <button className={`option-button ${question[6] === 4 ? 'correct' : ''}`} disabled>
                    <span className="option-number">4.</span> {question[5]}
                  </button>
                </div>
              </div>
            </li>
          ))}
        </ul>
        
        <button className="home-button" onClick={goToHomepage}>
          Back to Home
        </button>
      </div>
    </div>
  );
};

export default Questions;