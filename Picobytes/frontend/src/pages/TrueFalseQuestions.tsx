import React, { useState, useEffect } from "react";
import { useNavigate, useParams } from "react-router";
import Home_Header from "./home/home_header";

const TrueFalseQuestion = () => {
  const [answer, setAnswer] = useState<boolean | null>(null);
  const [question, setQuestion] = useState("Loading question...");
  const [questionData, setQuestionData] = useState<any>(null);
  const [error, setError] = useState("");
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [feedback, setFeedback] = useState("");
  const params = useParams();
  const id = params.id;
  const navigate = useNavigate();

  // Fetch questions when component mounts or ID changes
  useEffect(() => {
    fetchQuestions();
  }, [id]);

  const fetchQuestions = () => {
    fetch('http://127.0.0.1:5000/api/questions')
      .then(response => response.json())
      .then(data => {
        if (data.questions && data.questions.tf && data.questions.tf.length > 0) {
          // Find the question with the matching ID
          const tf = data.questions.tf;
          const currentQuestion = tf.find((q: any) => q[0] === parseInt(id!));
          
          if (currentQuestion) {
            setQuestionData(currentQuestion);
            setQuestion(currentQuestion[1]); // question text is at index 1
            setError("");
          } else {
            setError(`True/False question with ID ${id} not found`);
          }
        } else {
          setError("No true/false questions found");
        }
      })
      .catch(error => {
        console.error("Error fetching questions: ", error);
        setError(`Error fetching questions: ${error.message}`);
      });
  };

  const navToQuestion = (qid: number) => {
    navigate(`/true_false/${qid}`);
  };

  const updateAnswer = (value: boolean) => {
    setAnswer(value);
  };

  const submitAnswer = () => {
    // Check if an answer is selected
    if (answer === null) {
      setFeedback("Please select an answer before submitting.");
      return;
    }

    setIsSubmitting(true);
    setFeedback("");

    // Get correct answer from question data (index 3 is the correct answer)
    const correctAnswer = questionData[3] === 1; // Convert 1/0 to true/false
    const isCorrect = answer === correctAnswer;
    
    // Display feedback
    setFeedback(isCorrect 
      ? "Correct!" 
      : `Wrong. The correct answer was: ${correctAnswer ? "True" : "False"}`
    );
    
    // Navigate to the next question after a short delay
    setTimeout(() => {
      navToQuestion(parseInt(id!) + 1);
    }, 1500);
  };

  if (error !== "") {
    return (
      <>
        <h1>Error: {error}</h1>
        <p>Question ID: {id}</p>
        <button onClick={() => navToQuestion(parseInt(id!) - 1)}>&lt;</button>
        <button onClick={() => navToQuestion(parseInt(id!) + 1)}>&gt;</button>
      </>
    );
  } else {
    return (
      <div>
        <Home_Header />
        <h1>{question}</h1>
        <p>Question ID: {id} </p>
        {feedback && (
          <p 
            style={{ 
              color: feedback.includes("Correct") ? "green" : "red", 
              fontWeight: "bold" 
            }}
          >
            {feedback}
          </p>
        )}
        <br></br>
        <ul>
          <li>
            <input 
              type="radio" 
              name="tfOption"
              onChange={() => updateAnswer(true)} 
              checked={answer === true} 
              disabled={isSubmitting}
            /> True
          </li>
          <li>
            <input 
              type="radio" 
              name="tfOption"
              onChange={() => updateAnswer(false)} 
              checked={answer === false} 
              disabled={isSubmitting}
            /> False
          </li>
        </ul>
        <br></br>
        <button 
          onClick={() => navToQuestion(parseInt(id!) - 1)}
          disabled={isSubmitting}
        >
          &lt;
        </button>
        <button 
          onClick={submitAnswer}
          disabled={isSubmitting}
        >
          {isSubmitting ? "Submitting..." : "Submit"}
        </button>
        <button 
          onClick={() => navToQuestion(parseInt(id!) + 1)}
          disabled={isSubmitting}
        >
          &gt;
        </button>
      </div>
    );
  }
};

export default TrueFalseQuestion;