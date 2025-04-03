import { useEffect, useState } from "react";
import { useParams, useNavigate } from "react-router-dom";
import Home_Header from "../home/home_header";
import './topic_select.css';

interface Question {
    question_id: number;
    question_text: string;
    question_type: string;
    qlevel: string;
    option1?: string;
    option2?: string;
    option3?: string;
    option4?: string;
}

const Topic_Select = () => {
    /// CONSTANTS ////////////////////////////////////////
    const { topicName, questionType } = useParams();
    const [questions, setQuestions] = useState<Question[]>([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState<string | null>(null);
    const [selectedDifficulty, setSelectedDifficulty] = useState<string | null>(null)
    const navigate = useNavigate();

    useEffect(() => {
        const fetchQuestions = async () => {
            try {
                console.log(`Fetching questions for topic: ${topicName} and question type: ${questionType}`);
                const response = await fetch(`http://localhost:5001/api/topic_selection?qtype=${questionType}&topic=${topicName}`);
                if (!response.ok) {
                    throw new Error("Failed to fetch questions");
                }
                const data = await response.json();

                if (data.topics && data.topics.length > 0) {
                    setQuestions(data.topics); // Set the questions from the topics array
                    console.log(data.topics);
                } else {
                    setError("No questions found for this topic.");
                }
                setLoading(false);
            } catch (err) {
                setError("Error fetching questions");
                setLoading(false);
                console.error("Fetch error:", err);
            }
        };

        if (topicName && questionType) {
            fetchQuestions();
        }
    }, [topicName, questionType]);

    // Handle answer selection
    const handleAnswerSelect = (qid: number, answer: boolean | number) => {
        // Navigate to the question page with the selected answer
        navigate(`/question/${qid}`);
    };

    const goToTopicSelect = () => {
        navigate('/practice');
    };

    // Filter questions based on selected difficulty
    const filteredQuestions = selectedDifficulty
        ? questions.filter((q) => q.qlevel.toLowerCase() === selectedDifficulty.toLowerCase())
        : questions;


    if (loading) return (
        <div className="questions-layout">
            <Home_Header toggleOverlay={() => {}} />
            <div>Loading questions...</div>
        </div>
    );
    
    if (error) return (
        <div className="questions-layout">
            <Home_Header toggleOverlay={() => {}} />
            <div>{error}</div>
        </div>
    );


    /// MAIN CONTENT ////////////////////////////////////////////////
    return (
        <div className="questions-layout">
            <Home_Header toggleOverlay={() => {}} />
            
            <div className="header">
                <h1>{topicName} - {questionType} Questions</h1>
            </div>

            {/* DIFFICULTY FILTERS */}
            <div id="difficulty-filter">
                <button 
                    className={selectedDifficulty === null ? "active" : ""} 
                    onClick={() => setSelectedDifficulty(null)}
                >
                    All
                </button>
                <button 
                    className={selectedDifficulty === "easy" ? "active" : ""} 
                    onClick={() => setSelectedDifficulty("easy")}
                >
                    Easy
                </button>
                <button 
                    className={selectedDifficulty === "medium" ? "active" : ""} 
                    onClick={() => setSelectedDifficulty("medium")}
                >
                    Medium
                </button>
                <button 
                    className={selectedDifficulty === "hard" ? "active" : ""} 
                    onClick={() => setSelectedDifficulty("hard")}
                >
                    Hard
                </button>
            </div>


            <div className="questions-list">
                {filteredQuestions.length > 0 ? (
                    filteredQuestions.map((question) => (
                        <div 
                            key={question.question_id} 
                            className="question-item"
                            onClick={() => navigate(`/question/${question.question_id}`)}
                            style={{ cursor: 'pointer' }}
                        >
                            <div className="question-text">{question.question_text}</div>
                            <div className="question-meta">
                                <span className="question-level">{question.qlevel}</span>
                                <span className="question-type">{question.question_type}</span>
                            </div>

                            {/* For True/False Questions */}
                            {question.question_type.toLowerCase() === "true_false" && (
                                <div className="answer-choices">
                                    <button onClick={(e) => {
                                        e.stopPropagation();
                                        handleAnswerSelect(question.question_id, true);
                                    }}>
                                        True
                                    </button>
                                    <button onClick={(e) => {
                                        e.stopPropagation();
                                        handleAnswerSelect(question.question_id, false);
                                    }}>
                                        False
                                    </button>
                                </div>
                            )}

                            {/* For Multiple Choice Questions */}
                            {question.question_type.toLowerCase() === "multiple_choice" && (
                                <div className="answer-choices">
                                    <button onClick={(e) => {
                                        e.stopPropagation();
                                        handleAnswerSelect(question.question_id, 1);
                                    }}>
                                        {question.option1}
                                    </button>
                                    <button onClick={(e) => {
                                        e.stopPropagation();
                                        handleAnswerSelect(question.question_id, 2);
                                    }}>
                                        {question.option2}
                                    </button>
                                    <button onClick={(e) => {
                                        e.stopPropagation();
                                        handleAnswerSelect(question.question_id, 3);
                                    }}>
                                        {question.option3}
                                    </button>
                                    <button onClick={(e) => {
                                        e.stopPropagation();
                                        handleAnswerSelect(question.question_id, 4);
                                    }}>
                                        {question.option4}
                                    </button>
                                </div>
                            )}
                        </div>
                    ))
                ) : (
                    <div>No questions found for this topic.</div>
                )}
                
                <button className="back-button" onClick={goToTopicSelect}>
                    Back to Topics
                </button>
            </div>
        </div>
    );
};

export default Topic_Select;
