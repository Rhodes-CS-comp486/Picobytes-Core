import { useEffect, useState } from 'react';
import './questions.css';

interface Question {
  tf: any[];
  mc: any[];
}

const Questions = () => {
  const [questions, setQuestions] = useState<Question>({ tf: [], mc: [] });
  const [error, setError] = useState<string>('');
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    setLoading(true);
    fetch('http://localhost:5000/api/questions')
      .then(response => {
        if (!response.ok) {
          throw new Error('Network response was not ok');
        }
        return response.json();
      })
      .then(data => {
        console.log('Received data:', data); // Debug log
        setQuestions(data.questions);
        setLoading(false);
      })
      .catch(error => {
        console.error('Error fetching questions:', error);
        setError('Failed to load questions');
        setLoading(false);
      });
  }, []);

  if (loading) return <div>Loading questions...</div>;
  if (error) return <div>Error: {error}</div>;

  return (
    <div className="questions-page">
      <h1>All Questions</h1>
      
      <h2>True/False Questions</h2>
      <ul>
        {questions.tf && questions.tf.map((question, index) => (
          <li key={index}>
            <strong>Question:</strong> {question[1]}
            <br />
            <strong>Level:</strong> {question[2]}
            <br />
            <strong>Answer:</strong> {question[3] ? 'True' : 'False'}
          </li>
        ))}
      </ul>

      <h2>Multiple Choice Questions</h2>
      <ul>
        {questions.mc && questions.mc.map((question, index) => (
          <li key={index}>
            <strong>Question:</strong> {question[1]}
            <br />
            <strong>Level:</strong> {question[7]}
            <br />
            <strong>Options:</strong>
            <ol>
              <li>{question[2]}</li>
              <li>{question[3]}</li>
              <li>{question[4]}</li>
              <li>{question[5]}</li>
            </ol>
            <strong>Correct Answer:</strong> Option {question[6]}
          </li>
        ))}
      </ul>
    </div>
  );
};

export default Questions;