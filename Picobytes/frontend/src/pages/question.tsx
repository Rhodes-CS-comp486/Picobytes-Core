import React, { useState, useEffect } from "react";
import { useNavigate, useParams } from "react-router";
import Home_Header from "./home/home_header";

const Question = () => {
  const [answer, setAnswer] = useState([false, false, false, false]);
  const [question, setQuestion] = useState("⬜⬜⬜⬜⬜⬜⬜⬜⬜⬜⬜⬜⬜⬜⬜?");
  const [correct, setCorrect] = useState(0);
  const [options, setOptions] = useState([
    "⬜⬜⬜⬜⬜⬜⬜⬜",
    "⬜⬜⬜⬜⬜⬜⬜⬜",
    "⬜⬜⬜⬜⬜⬜⬜⬜",
    "⬜⬜⬜⬜⬜⬜⬜⬜",
  ]);
  const [error, setError] = useState("");
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [feedback, setFeedback] = useState("");
  let params = useParams();
  let id = params.id;
  const navigate = useNavigate();

  // Fetch question data when ID changes
  useEffect(() => {
    fetchQuestion(id);
  }, [id]);

  const fetchQuestion = (questionId: string | undefined) => {
    if (!questionId) return;
    
    // Reset states when fetching a new question
    setAnswer([false, false, false, false]);
    setFeedback("");
    setError("");
    setIsSubmitting(false);
    
    fetch(`http://127.0.0.1:5000/api/question/${questionId}`, {
      method: "GET",
    })
      .then((response) => response.json())
      .then((data) => {
        if (data.error != null) throw data.error;
        setQuestion(data.question_text);
        setOptions([
          data.option_1,
          data.option_2,
          data.option_3,
          data.option_4,
        ]);
        setCorrect(data.answer);
      })
      .catch((error) => {
        console.error("error fetching multiple choice questions: ", error);
        setError(error);
      });
  };

  const navToQuestion = (qid: number) => {
    navigate(`/question/${qid}`);
  };

  const updateAnswer = (n: number) => {
    // Create a new array with all false values
    const newAnswer = [false, false, false, false];
    // Set the selected option to true
    newAnswer[n] = true;
    setAnswer(newAnswer);
  };

  const submitAnswer = () => {
    // Check if at least one option is selected
    if (!answer.includes(true)) {
      setFeedback("Please select an answer before submitting.");
      return;
    }

    setIsSubmitting(true);
    setFeedback("");

    fetch("http://127.0.0.1:5000/api/submit_answer", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        question_id: id,
        selected_answer: answer,
      }),
    })
      .then((response) => {
        if (!response.ok) {
          throw new Error(`HTTP error! status: ${response.status}`);
        }
        return response.json();
      })
      .then((data) => {
        if (data.error) {
          setError(data.error);
          setIsSubmitting(false);
        } else {
          // Display feedback briefly before navigating
          const isCorrect = data.is_correct;
          setFeedback(isCorrect ? "Correct!" : `Wrong. The correct answer was: ${options[data.correct_answer_index]}`);
          
          // Navigate to the next question after a short delay
          setTimeout(() => {
            navToQuestion(parseInt(id!) + 1);
          }, 1500);
        }
      })
      .catch((error) => {
        console.error("Error submitting answer: ", error);
        setError(`Error submitting answer: ${error.message}`);
        setIsSubmitting(false);
      });
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
        {feedback && <p style={{ color: feedback.includes("Correct") ? "green" : "red", fontWeight: "bold" }}>{feedback}</p>}
        <br></br>
        <ul>
          {options.map((o, i) => (
            <li key={i}>
              <input 
                type="radio" 
                name="questionOption"
                onChange={() => updateAnswer(i)} 
                checked={answer[i]} 
                disabled={isSubmitting}
              /> {o}
            </li>
          ))}
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

export default Question;