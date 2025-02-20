import { useEffect, useState } from 'react';
import './questions.css';

const Questions = () => {
  const [questions, setQuestions] = useState({ true_false: [], multiple_choice: [] });

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
      <h2>True/False Questions</h2>
      <ul>
        {questions.true_false.map((question, index) => (
          <li key={index}>
            {question[1]} (Level: {question[2]}) - Correct Answer: {question[3] ? 'True' : 'False'}
          </li>
        ))}
      </ul>
      <h2>Multiple Choice Questions</h2>
      <ul>
        {questions.multiple_choice.map((question, index) => (
          <li key={index}>
            {question[1]} (Level: {question[7]})
            <ul>
              <li>{question[2]}</li>
              <li>{question[3]}</li>
              <li>{question[4]}</li>
              <li>{question[5]}</li>
            </ul>
            Correct Answer: {question[6]}
          </li>
        ))}
      </ul>
    </div>
  );
};

export default Questions;