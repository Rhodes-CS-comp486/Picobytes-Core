import React, { useState, useEffect } from "react";
import { useNavigate, useParams } from "react-router";
import Home_Header from "./home/home_header";
import "./question.css"; // Import the new CSS file

import SideBar from "./home/side_bar";
import Draggable_Question from "./draggable_question";

interface Prop {
  toggleDark: () => void;
}

/// MAIN CONTENT //////////

const Question = ({ toggleDark }: Prop) => {
  const [answer, setAnswer] = useState<number | boolean | string | null>(null);
  const [isCorrect, setIsCorrect] = useState<boolean>(false);

  const [question, setQuestion] = useState("Loading question...");
  const [questionType, setQuestionType] = useState<string>("multiple_choice");
  const [correct, setCorrect] = useState<number | boolean>(0);
  const [options, setOptions] = useState([
    "Option 1",
    "Option 2",
    "Option 3",
    "Option 4",
  ]);
  const [error, setError] = useState("");
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [feedback, setFeedback] = useState("");
  const [difficulty, setDifficulty] = useState("");
  const [topic, setTopic] = useState("");
  const [showCelebration, setShowCelebration] = useState(false);
  const [totalQuestions, setTotalQuestions] = useState(0);
  const [draggedIds, setDraggedIds] = useState<string[]>([]); // State to store IDs from Draggable_Question
  const [loading, setLoading] = useState<boolean>(true); // New loading state


  let params = useParams();
  let id = params.id;
  const navigate = useNavigate();

  // Fetch total number of questions
  useEffect(() => {
    fetch("http://127.0.0.1:5000/api/questions")
      .then((response) => response.json())
      .then((data) => {
        setTotalQuestions(data.total_questions);
      })
      .catch((error) => {
        console.error("Error fetching questions:", error);
      });
  }, []);

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
    setShowCelebration(false);
    setIsCorrect(false);
    setAnswer(null);
    setLoading(true);

    fetch(`http://127.0.0.1:5000/api/question/${questionId}`, {
      method: "GET",
    })
      .then((response) => response.json())
      .then((data) => {
        if (data.error != null) throw data.error;

        setQuestion(data.question_text);
        setQuestionType(data.question_type);
        setDifficulty(data.question_level);
        setTopic(data.question_topic);

        if (data.question_type === "multiple_choice") {
          setOptions([
            data.option_1,
            data.option_2,
            data.option_3,
            data.option_4,
          ]);
          setCorrect(data.answer);
          setAnswer(null);
        } else if (data.question_type === "true_false") {
          console.log(data);
          setCorrect(data.correct_answer === true);
          setAnswer(null); // Initialize as null so no option is selected by default
        } else if (data.question_type === "free_response") {
          setCorrect(data.professor_answer);
          setAnswer("");
        }
        else if (data.question_type === "code_blocks"){
          setCorrect(data.answer);
          setAnswer("")
        }
        
        setLoading(false); // Set loading to false after fetching the question
      })
      .catch((error) => {
        console.error("Error fetching question: ", error);
        setError(error);
        setLoading(false);
      });
  };

  const navToQuestion = (qid: number) => {
    navigate(`/question/${qid}`);
  };

  const goToHomepage = () => {
    navigate("/homepage");
  };

  const updateMCAnswer = (n: number) => {
    // // Create a new array with all false values
    // const newAnswer = [false, false, false, false];
    // // Set the selected option to true
    // newAnswer[n] = true;
    setAnswer(n);
  };

  const updateTFAnswer = (value: boolean) => {
    setAnswer(value);
  };

  const submitAnswer = () => {
    // Check if an answer is selected
    // if (
    //   (questionType === "multiple_choice" &&
    //     // !(answer as boolean[]).includes(true)) ||
    //   // (questionType === "true_false" && answer === null)
    // ) {
    //   setFeedback("Please select an answer");
    //   return;
    // }
    if (answer === null) {
      setFeedback("Please select an answer");
      return;
    }

    setIsSubmitting(true);
    setFeedback("");

    if (questionType === "multiple_choice") {
      if (Number(answer) + 1 == correct) {
        setIsCorrect(true);
        setFeedback("Correct");
      } else {
        setIsCorrect(false);
        setFeedback(
          'Incorrect: correct answer was "' + options[Number(correct) - 1] + '"'
        );
      }

      fetch("http://127.0.0.1:5000/api/submit_answer", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          question_id: id,
          response: answer,
          uid: localStorage.getItem("uid"),
        }),
      }).catch((error) => {
        console.error("Error submitting answer: ", error);

        // More user-friendly error handling
        let errorMessage = "Error submitting answer";

        if (error.message && error.message.includes("400")) {
          errorMessage = "Missing required information. Please try again.";
        } else if (error.message && error.message.includes("500")) {
          errorMessage = "Server error. Please try again later.";
        } else {
          errorMessage = `Error: ${error.message}`;
        }

        setFeedback(errorMessage);
        setIsSubmitting(false);
      });
    } else if (questionType === "true_false") {
      // For true/false questions, we can check the answer client-side
      const isAnswerCorrect = answer === correct;
      console.log("Answer:", answer);
      console.log("Correct:", correct);
      setIsCorrect(isAnswerCorrect);

      console.log(correct);

      if (isAnswerCorrect) {
        setFeedback("Correct!");
        setShowCelebration(true);
      } else {
        setFeedback(
          `Incorrect. The correct answer was: ${correct ? "True" : "False"}`
        );
      }
      fetch("http://127.0.0.1:5000/api/submit_answer", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          question_id: id,
          response: answer,
          uid: localStorage.getItem("uid"),
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
          // Display feedback
          console.log("Response data:", data);
        }
      });

      fetch("http://127.0.0.1:5000/api/submit_answer", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          question_id: id,
          response: answer,
          uid: localStorage.getItem("uid"),
        }),
      }).catch((error) => {
        let errorMessage = "Error submitting answer";

        if (error.message && error.message.includes("400")) {
          errorMessage = "Missing required information. Please try again.";
        } else if (error.message && error.message.includes("500")) {
          errorMessage = "Server error. Please try again later.";
        } else {
          errorMessage = `Error: ${error.message}`;
        }

        setFeedback(errorMessage);
        setIsSubmitting(false);
      });

      // Enable proceeding to next question
      setIsSubmitting(true);
    } else if (questionType === "free_response") {
      setFeedback("Placeholder");
      fetch("http://127.0.0.1:5000/api/submit_answer", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          question_id: id,
          selected_answer: answer,
        }),
      });
    }
    else if (questionType === "code_blocks") {
      // Convert draggedIds array to a comma-separated string
      const draggedIdsString = draggedIds.join(",");
      
      console.log("Dragged IDs:", draggedIdsString);
  
      fetch("http://127.0.0.1:5000/api/submit_answer", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          question_id: id,
          response: draggedIdsString, // Send the comma-separated string
          uid: localStorage.getItem("uid"),
          correct: correct
        }),
      })
        .then((response) => response.json())
        .then((data) => {
          if (data.error) {
            setError(data.error);
          } else {
            setFeedback(data.message || "Answer submitted successfully!");
          }
          setIsSubmitting(false);
        })
        .catch((error) => {
          console.error("Error submitting answer: ", error);
          setFeedback("Error submitting answer. Please try again.");
          setIsSubmitting(false);
        });
        setIsSubmitting(true);
    }
  };

  // Calculate current progress percentage
  const progressPercentage = id ? (parseInt(id) / totalQuestions) * 100 : 0;

  

  if (error !== "") {
    return (
      <div className="duolingo-question-page">
        <Home_Header toggleOverlay={() => {}} />
        <div className="question-content error-content">
          <SideBar toggleDark={toggleDark} />
          <div className="error-container">
            <div className="error-icon">⚠️</div>
            <h1>Error</h1>
            <p>{error}</p>
            <p>Question ID: {id}</p>
            <div className="question-nav">
              <button
                className="nav-button"
                onClick={() => navToQuestion(parseInt(id!) - 1)}
              >
                Previous Question
              </button>
              <button className="nav-button home-button" onClick={goToHomepage}>
                Go to Homepage
              </button>
              <button
                className="nav-button"
                onClick={() => navToQuestion(parseInt(id!) + 1)}
              >
                Next Question
              </button>
            </div>
          </div>
        </div>
      </div>
    );
  } else {
    return (
      <div className="duolingo-question-page">
        <Home_Header toggleOverlay={() => {}} />
        <SideBar toggleDark={toggleDark} />

        <div className="question-content">
          {/* Progress bar */}
          <div className="question-progress">
            <div className="progress-info">
              <span>
                Question {id} of {totalQuestions}
              </span>
              <span>{Math.round(progressPercentage)}% Complete</span>
            </div>
            <div className="progress-bar">
              <div
                className="progress-filled"
                style={{ width: `${progressPercentage}%` }}
              ></div>
              {totalQuestions > 0 &&
                Array.from(
                  { length: Math.min(totalQuestions, 20) },
                  (_, index) => {
                    const questionPosition =
                      ((index + 1) / totalQuestions) * 100;
                    const isCurrentQuestion = parseInt(id!) === index + 1;
                    const isCompletedQuestion = parseInt(id!) > index + 1;
                    return (
                      <div
                        key={index}
                        className={`progress-marker ${
                          isCurrentQuestion ? "current" : ""
                        } ${isCompletedQuestion ? "completed" : ""}`}
                        style={{ left: `${questionPosition}%` }}
                        title={`Question ${index + 1}`}
                        onClick={() => navToQuestion(index + 1)}
                      />
                    );
                  }
                )}
            </div>
          </div>

          {/* Home button at top */}
          <div className="top-nav">
            <button className="home-button" onClick={goToHomepage}>
              Home
            </button>
          </div>

          {/* Question information */}
          <div className="question-info">
            <div className="topic-badge">{topic}</div>
            <div className="difficulty-badge">{difficulty}</div>
          </div>

          {/* Main question card */}
          <div className="question-card">
            <h1 className="question-text">{question}</h1>

            <div className="options-container">
              {questionType === "true_false" ? (
                // True/False options
                <div className="tf-options">
                  <button
                    className={`option-button tf-option ${
                      answer === true ? "selected" : ""
                    } ${
                      feedback && answer === true
                        ? correct === true
                          ? "correct"
                          : "incorrect"
                        : ""
                    }`}
                    onClick={() => !isSubmitting && updateTFAnswer(true)}
                    disabled={isSubmitting}
                  >
                    <div className="option-content">
                      <div className="option-icon">✓</div>
                      <div className="option-text">True</div>
                    </div>
                  </button>
                  <button
                    className={`option-button tf-option ${
                      answer === false ? "selected" : ""
                    } ${
                      feedback && answer === false
                        ? correct === false
                          ? "correct"
                          : "incorrect"
                        : ""
                    }`}
                    onClick={() => !isSubmitting && updateTFAnswer(false)}
                    disabled={isSubmitting}
                  >
                    <div className="option-content">
                      <div className="option-icon">✗</div>
                      <div className="option-text">False</div>
                    </div>
                  </button>
                </div>
              ) : questionType === "free_response" ? (
                <textarea
                  className="fr"
                  onChange={(e) => setAnswer(e.target.value)}
                  rows={10}
                  placeholder="type your short response here"
                ></textarea>
              ) : questionType === "multiple_choice" ?(
                // Multiple choice options
                <div className="mc-options">
                  {options.map((option, index) => (
                    <button
                      key={index}
                      className={`option-button mc-option ${
                        answer === index ? "selected" : ""
                      } ${
                        feedback && answer === index
                          ? isCorrect
                            ? "correct"
                            : "incorrect"
                          : ""
                      }`}
                      onClick={() => !isSubmitting && updateMCAnswer(index)}
                      disabled={isSubmitting}
                    >
                      <div className="option-content">
                        <div className="option-letter">
                          {String.fromCharCode(65 + index)}
                        </div>
                        <div className="option-text">{option}</div>
                      </div>
                    </button>
                  ))}
                </div>
              ) : (
                <Draggable_Question onUpdateAnswer={setDraggedIds} />
                )}
            </div>
            {feedback && questionType == "free_response" && (
              <div className="feedback-message">
                <b>Correct Answer:</b> {correct}
              </div>
            )}
          </div>

          {/* Feedback area */}
          {feedback && questionType != "free_response" && (
            <div
              className={`feedback-container ${
                feedback.includes("Correct")
                  ? "correct-feedback"
                  : "incorrect-feedback"
              }`}
            >
              <div className="feedback-icon">
                {feedback.includes("Correct") ? "🎉" : "❌"}
              </div>
              <div className="feedback-message">{feedback}</div>
            </div>
          )}

          {/* Celebration animation */}
          {showCelebration && (
            <div className="celebration">
              <div className="confetti confetti-1">🎊</div>
              <div className="confetti confetti-2">✨</div>
              <div className="confetti confetti-3">🎉</div>
              <div className="confetti confetti-4">⭐</div>
              <div className="confetti confetti-5">🎊</div>
              <div className="confetti confetti-6">✨</div>
            </div>
          )}

          {/* Action buttons */}
          <div className="action-buttons">
            {!isSubmitting ? (
              <button
                className="check-button"
                onClick={submitAnswer}
                disabled={
                  (questionType === "multiple_choice" && answer === null) ||
                  (questionType === "true_false" && answer === null) ||
                  (questionType === "code_blocks" && answer === null)
                }
              >
                Check
              </button>
            ) : (
              <button
                className="continue-button"
                onClick={() => navToQuestion(parseInt(id!) + 1)}
              >
                Continue
              </button>
            )}
          </div>

          {/* Bottom navigation */}
          <div className="bottom-nav">
            <button
              className="skip-button"
              onClick={() => navToQuestion(parseInt(id!) - 1)}
              disabled={parseInt(id!) <= 1}
            >
              Previous
            </button>
            <div className="nav-center">
              <div className="question-counter">
                Question {id} of {totalQuestions}
              </div>
            </div>
            <button
              className="skip-button"
              onClick={() => navToQuestion(parseInt(id!) + 1)}
              disabled={parseInt(id!) >= totalQuestions}
            >
              Skip
            </button>
          </div>
        </div>
      </div>
    );
  }
};

export default Question;
