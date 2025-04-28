import React, { useState, useEffect } from "react";
import { useNavigate, useParams } from "react-router";
import Home_Header from "./home/home_header";
import "./question.css"; // Import the new CSS file
import SideBar from "./home/side_bar"; // Import SideBar component
import Draggable_Question from "./draggable_question";
import CodeExecutionPage from "./code_execution/code_execution_page";

const Question = () => {
  const [answer, setAnswer] = useState<number | boolean | string | null>(null);
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
  const [isCorrect, setIsCorrect] = useState(false);
  const [draggedIds, setDraggedIds] = useState<string[]>([]); // State to store IDs from Draggable_Question

  let params = useParams();
  let id = params.id;
  const navigate = useNavigate();
  const qidArray = localStorage.getItem("qidArray")
  ? JSON.parse(localStorage.getItem("qidArray")!)
  : null;

const useQuestionIndex = () => {
    const [index, setIndex] = useState(0);

    const incrementIndex = () => setIndex((prev) => prev + 1);
    const decrementIndex = () => setIndex((prev) => Math.max(prev - 1, 0));

    return { index, setIndex, incrementIndex, decrementIndex };
};

const { index, setIndex, incrementIndex, decrementIndex } = useQuestionIndex();

  // Fetch total number of questions
  useEffect(() => {
    setIndex(qidArray.indexOf(parseInt(id!)));
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
    console.log("Fetching question with Index:", index);
    console.log("Fetching question with ID:", questionId);

    // Reset states when fetching a new question
    setFeedback("");
    setError("");
    setIsSubmitting(false);
    setShowCelebration(false);
    setIsCorrect(false);
    setAnswer(null);

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
          setCorrect(data.correct_answer === 1);
          setAnswer(null); // Initialize as null so no option is selected by default
        } else if (data.question_type === "free_response") {
          setCorrect(data.professor_answer);
          setAnswer("")
        }else if (data.question_type === "coding"){
          setCorrect(data.correctcode)
          setAnswer("")
        }
      })
      .catch((error) => {
        console.error("Error fetching question: ", error);
        setError(error);
      });
  };

  const navToQuestion = (qid: number) => {
    navigate(`/questionsT/${qid}`);
  };

  const goToHomepage = () => {
    navigate("/homepage");
  };

  const updateMCAnswer = (n: number) => {
    setAnswer(n);
  };

  const updateTFAnswer = (value: boolean) => {
    setAnswer(value);
  };

  const submitAnswer = () => {
    // Check if an answer is selected
    if (answer === null && draggedIds.length === 0) {
      setFeedback("Please select an answer");
      return;
    }

    setIsSubmitting(true);
    setFeedback("");

    if (questionType === "multiple_choice") {
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
            
            // Check if this question was already answered
            if (data.message === 'Question already answered') {
              setFeedback("You've already answered this question.");
              setIsSubmitting(true);
              return;
            }
            
            const isCorrectResponse = data.is_correct;
            setIsCorrect(isCorrectResponse);

            if (isCorrectResponse) {
              setFeedback("Correct!");
              setShowCelebration(true);
            } else {
              // Log entire response for debugging
              console.log("Full response object for debugging:", data);
              
              // Try to extract the correct answer from various possible property names
              let correctAnswerText = "Unknown";
              
              try {
                const correctAnswerValue = data.correct_answer;
                console.log("Raw correct_answer value:", correctAnswerValue);
                
                if (correctAnswerValue && !isNaN(parseInt(correctAnswerValue))) {
                  const index = parseInt(correctAnswerValue) - 1;
                  if (index >= 0 && index < options.length) {
                    correctAnswerText = options[index];
                  }
                }
              } catch (err) {
                console.error("Error parsing correct answer:", err);
              }
              
              setFeedback(`Incorrect. The correct answer was: ${correctAnswerText}`);
            }

            // Enable proceeding to next question
            setIsSubmitting(true);
          }
        })
        .catch((error) => {
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

      // Enable proceeding to next question
      setIsSubmitting(true);
    } else if (questionType === "free_response") {
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
      setFeedback("Placeholder")
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
          correct: correct,
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
          if(data.is_correct){
            setFeedback("Correct!");
            setShowCelebration(true);
          }
          else{
            setFeedback("Incorrect.");
          }
        }
      });
      setIsSubmitting(true);
    }
  };

  // Calculate current progress percentage
  const progressPercentage = id ? ((index+1) / qidArray.length) * 100 : 0;

  // Add toggleDark function for the sidebar
  const toggleDark = () => {
    const body = document.body;
    body.classList.toggle("dark-mode");
    body.classList.toggle("light-mode");
  };

  if (error !== "") {
    return (
      <div className="duolingo-question-page">
        <Home_Header toggleOverlay={() => {}} />
        <SideBar toggleDark={toggleDark} />
        <div className="question-content error-content">
          <div className="error-container">
            <div className="error-icon">⚠️</div>
            <h1>Error</h1>
            <p>{error}</p>
            <p>Question ID: {id}</p>
            <div className="question-nav">
              <button className="nav-button home-button" onClick={goToHomepage}>
                Go to Homepage
              </button>
              <button
                className="nav-button"
                onClick={() => {
                    if (qidArray) {
                      incrementIndex();
                      navToQuestion(parseInt(qidArray[index]));
                    } else {
                      console.error("qidArray is null");
                    }
                  }}
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
              <span>Question {index + 1} of {qidArray.length}</span>
            </div>
            <div className="progress-bar">
              <div
                className="progress-filled"
                style={{ width: `${progressPercentage}%` }}
              ></div>
            </div>
          </div>

          {/* Home button at top */}
          <div className="top-nav">
            <button
              className="home-button"
              onClick={goToHomepage}
            >
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
              {questionType === "true_false" && (
                <div className="tf-options">
                  <button
                    className={`option-button ${answer === true ? "selected" : ""} ${
                      isSubmitting
                        ? correct === true
                          ? "correct"
                          : answer === true
                            ? "incorrect"
                            : ""
                        : ""
                    }`}
                    onClick={() => updateTFAnswer(true)}
                    disabled={isSubmitting}
                  >
                    <div className="option-content">
                      <div className="option-icon">T</div>
                      <div className="option-text">True</div>
                    </div>
                  </button>
                  <button
                    className={`option-button ${answer === false ? "selected" : ""} ${
                      isSubmitting
                        ? correct === false
                          ? "correct"
                          : answer === false
                            ? "incorrect"
                            : ""
                        : ""
                    }`}
                    onClick={() => updateTFAnswer(false)}
                    disabled={isSubmitting}
                  >
                    <div className="option-content">
                      <div className="option-icon">F</div>
                      <div className="option-text">False</div>
                    </div>
                  </button>
                </div>
              )}
              {questionType === "free_response" && (
                <textarea
                  className="fr"
                  placeholder="Type your answer here..."
                  value={answer as string}
                  onChange={(e) => setAnswer(e.target.value)}
                  disabled={isSubmitting}
                ></textarea>
              )}
              {questionType === "multiple_choice" && (
                <div className="mc-options">
                  {options.map((option, index) => (
                    <button
                      key={index}
                      className={`option-button ${answer === index ? "selected" : ""} ${
                        isSubmitting
                          ? typeof correct === 'number' && index === (correct - 1)
                            ? "correct"
                            : answer === index
                              ? "incorrect"
                              : ""
                          : ""
                      }`}
                      onClick={() => updateMCAnswer(index)}
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
              )}
              {questionType === "code_blocks" && (
                <div className="option-content">
                  <Draggable_Question onUpdateAnswer={setDraggedIds} />
                </div>
              )}
              {questionType === "coding" && (
                <div className="option-container">
                  <CodeExecutionPage toggleDark={toggleDark} />
                </div>
              )}
            </div>
          </div>

          {/* Feedback area */}
          {feedback && (
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
                  isSubmitting || 
                  (questionType === "multiple_choice" && answer === null) ||
                  (questionType === "true_false" && answer === null) ||
                  (questionType === "free_response" && !answer) ||
                  (questionType === "code_blocks" && draggedIds.length === 0)
                }
              >
                {isSubmitting ? "Checking..." : "Check Answer"}
              </button>
            ) : (
                <button
                  className="continue-button"
                  onClick={() => {
                    if (qidArray) {
                      incrementIndex(); // Increment the index
                      setTimeout(() => {
                        navToQuestion(parseInt(qidArray[index + 1])); // Navigate to the next question
                      }, 0); // Ensure navigation happens after state update
                    } else {
                      console.error("qidArray is null");
                    }
                  }}
                  disabled={index >= qidArray.length - 1}
                >
                  Continue
                </button>
              
            )}
          </div>

          {/* Bottom navigation */}
          <div className="bottom-nav">
            <button
                className="skip-button"
                onClick={() => {
                    if (qidArray) {
                    decrementIndex(); // Decrement the index
                    setTimeout(() => {
                        navToQuestion(parseInt(qidArray[index - 1])); // Navigate to the previous question
                    }, 0); // Ensure navigation happens after state update
                    } else {
                    console.error("qidArray is null");
                    }
                }}
                disabled={index <= 0}
                >
                Previous
            </button>
            <div className="nav-center">
              <div className="question-counter">
                Question {index + 1} of {qidArray.length}
              </div>
            </div>
            <button
                className="skip-button"
                onClick={() => {
                    if (qidArray) {
                    incrementIndex(); // Increment the index
                    setTimeout(() => {
                        navToQuestion(parseInt(qidArray[index + 1])); // Navigate to the next question
                    }, 0); // Ensure navigation happens after state update
                    } else {
                    console.error("qidArray is null");
                    }
                }}
                disabled={index >= qidArray.length - 1}
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
