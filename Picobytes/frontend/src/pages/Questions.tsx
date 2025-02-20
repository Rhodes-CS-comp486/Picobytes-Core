import { useEffect, useState } from 'react';
import './questions.css';

const Questions = () => {
  const [questions, setQuestions] = useState([]);

  useEffect(() => {
    fetch('http://localhost:5000/api/questions')
      .then(response => response.json())
      .then(data => {
        setQuestions(data.questions);
      })
      .catch(error => {
        console.error('Error fetching questions:', error);
      });
  }, []);

  return (
    <div className="questions-page">
      <h1>All Questions</h1>
      <ul>
        {questions.map((question, index) => (
          <li key={index}>{question}</li>
        ))}
      </ul>
    </div>
  );
};

export default Questions;