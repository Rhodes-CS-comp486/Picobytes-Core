// The individual question and possibly feedbacuk

//filler code essentially / helps with tests
// Picobytes/frontend/src/pages/Questions.tsx
import { useEffect, useState } from 'react';

const Questions = () => {
  const [questions, setQuestions] = useState([]);

  useEffect(() => {
    fetch('/api/questions')
      .then(response => response.json())
      .then(data => setQuestions(data))
      .catch(error => console.error('Error fetching questions:', error));
  }, []);

  return (
    <div>
      <h1>Questions</h1>
      <ul>
        {questions.map((question: any) => (
          <li key={question.qid}>{question.qtext}</li>
        ))}
      </ul>
    </div>
  );
};

export default Questions;