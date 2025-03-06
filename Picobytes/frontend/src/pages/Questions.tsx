import { useEffect, useState } from 'react';
import './questions.css';

interface QuestionData {
  questions: {
    tf: [number, string, string, number][];
    mc: [number, string, string, string, string, string, number, string][];
  };
  total_questions: number;
}


const Questions = () => {
  console.log("Questions component rendering"); // Debug log

  const [data, setData] = useState<QuestionData | null>(null);
  const [error, setError] = useState<string>('');
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    console.log("Starting fetch request"); // Debug log
    
    fetch('http://127.0.0.1:5000/api/questions')
      .then(response => {
        console.log("Response received:", response.status); // Debug log
        if (!response.ok) {
          throw new Error('Network response was not ok');
        }
        return response.json();
      })
      .then((responseData) => {
        console.log("Data received:", responseData); // Debug log
        setData(responseData);
        setLoading(false);
      })
      .catch(error => {
        console.log("Error caught:", error); // Debug log
        setError(error.message);
        setLoading(false);
      });
  }, []);

  console.log("Current state:", { loading, error, data }); // Debug log

  if (loading) return <div>Loading questions...</div>;
  if (error) return <div>Error: {error}</div>;
  if (!data) return <div>No questions available</div>;

  return (
    <div className="questions-page">
      <h1>All Questions ({data.total_questions} total)</h1>
      
      <h2>True/False Questions</h2>
      <ul>
        {data.questions.tf.map((question) => (
          <li key={question[0]} className="question-item">
            <strong>Question {question[0]}:</strong> {question[1]}
            <br />
            <strong>Level:</strong> {question[2]}
            <br />
            <strong>Answer:</strong> {question[3] ? 'True' : 'False'}
          </li>
        ))}
      </ul>

      <h2>Multiple Choice Questions</h2>
      <ul>
        {data.questions.mc.map((question) => (
          <li key={question[0]} className="question-item">
            <strong>Question {question[0]}:</strong> {question[1]}
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