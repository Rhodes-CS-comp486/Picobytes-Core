import React, { useState, useEffect } from "react";
import { useNavigate, useParams } from "react-router";
import Home_Header from "./home/home_header";

const Question = () => {
  const [answer, setAnswer] = useState<boolean[] | boolean | null>([false, false, false, false]);
  const [question, setQuestion] = useState("⬜⬜⬜⬜⬜⬜⬜⬜⬜⬜⬜⬜⬜⬜⬜?");
  const [questionType, setQuestionType] = useState<string>("mc");
  const [correct, setCorrect] = useState<number | boolean>(0);
  const [options, setOptions] = useState([
    "⬜⬜⬜⬜⬜⬜⬜⬜",
    "⬜⬜⬜⬜⬜⬜⬜⬜",
    "⬜⬜⬜⬜⬜⬜⬜⬜",
    "⬜⬜⬜⬜⬜⬜⬜⬜",
  ]);
  const [error, setError] = useState("");
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [feedback, setFeedback] = useState("");
  const [difficulty, setDifficulty] = useState("");
  const [topic, setTopic] = useState("");
  
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
    setFeedback("");
    setError("");
    setIsSubmitting(false);
    
    fetch(`http://127.0.0.1:5000/api/question/${questionId}`, {
      method: "GET",
    })
      .then((response) => response.json())
      .then((data) => {
        if (data.error != null) throw data.error;
        
        console.log("Question data:", data); // Debug log
        setQuestion(data.question_text);
        setQuestionType(data.question_type);
        setDifficulty(data.question_level);
        setTopic(data.question_topic);
        
        if (data.question_type === "mc") {
          setOptions([
            data.option_1,
            data.option_2,
            data.option_3,
            data.option_4,
          ]);
          setCorrect(data.answer);
          setAnswer([false, false, false, false]);
        } else if (data.question_type === "tf") {
          setCorrect(data.answer === 1);
          setAnswer(null); // Initialize as null so no option is selected by default
        }
      })
      .catch((error) => {
        console.error("Error fetching question: ", error);
        setError(error);
      });
  };

  const navToQuestion = (qid: number) => {
    navigate(`/question/${qid}`);
  };

  const updateMCAnswer = (n: number) => {
    // Create a new array with all false values
    const newAnswer = [false, false, false, false];
    // Set the selected option to true
    newAnswer[n] = true;
    setAnswer(newAnswer);
  };

  const updateTFAnswer = (value: boolean) => {
    setAnswer(value);
  };

  const submitAnswer = () => {
    // Check if an answer is selected
    if (
      (questionType === "mc" && !(answer as boolean[]).includes(true)) ||
      (questionType === "tf" && answer === null)
    ) {
      setFeedback("Please select an answer before submitting.");
      return;
    }

    setIsSubmitting(true);
    setFeedback("");

    if (questionType === "mc") {
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
            setFeedback(
              isCorrect 
                ? "Correct!" 
                : `Wrong. The correct answer was: ${options[data.correct_answer_index]}`
            );
            
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
    } else if (questionType === "tf") {
      // For true/false questions, we can check the answer client-side
      const isCorrect = answer === correct;
      
      setFeedback(
        isCorrect 
          ? "Correct!" 
          : `Wrong. The correct answer was: ${correct ? "True" : "False"}`
      );
      
      // Navigate to the next question after a short delay
      setTimeout(() => {
        navToQuestion(parseInt(id!) + 1);
      }, 1500);
    }
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
        <p>Question ID: {id} | Type: {questionType} | Level: {difficulty} | Topic: {topic}</p>
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
        
        {questionType === "tf" ? (
          // True/False options
          <ul>
            <li>
              <input 
                type="radio" 
                name="tfOption"
                onChange={() => updateTFAnswer(true)} 
                checked={answer === true} 
                disabled={isSubmitting}
              /> True
            </li>
            <li>
              <input 
                type="radio" 
                name="tfOption"
                onChange={() => updateTFAnswer(false)} 
                checked={answer === false} 
                disabled={isSubmitting}
              /> False
            </li>
          </ul>
        ) : (
          // Multiple choice options
          <ul>
            {options.map((o, i) => (
              <li key={i}>
                <input 
                  type="radio" 
                  name="questionOption"
                  onChange={() => updateMCAnswer(i)} 
                  checked={(answer as boolean[])[i]} 
                  disabled={isSubmitting}
                /> {o}
              </li>
            ))}
          </ul>
        )}
        
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