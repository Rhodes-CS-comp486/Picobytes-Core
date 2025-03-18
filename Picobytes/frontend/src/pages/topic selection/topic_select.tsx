import { useEffect, useState } from "react";
import { useParams } from "react-router-dom";
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
    const { topicName, questionType } = useParams();
    const [questions, setQuestions] = useState<Question[]>([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState<string | null>(null);

    useEffect(() => {
        const fetchQuestions = async () => {
            try {
                const response = await fetch(`http://localhost:5000/api/topic_selection?qtype=ALL&topic=${topicName}`);
                if (!response.ok) {
                    throw new Error("Failed to fetch questions");
                }
                const data = await response.json();

                if (data.topics && data.topics.length > 0) {
                    setQuestions(data.topics); // Set the questions from the topics array
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

    // Update the handleAnswerSelect function to accept both boolean (True/False) or number (multiple choice)
    const handleAnswerSelect = (qid: number, answer: boolean | number) => {
        // Handle the answer selection (could store the answer or submit it)
    };

    if (loading) return <div>Loading questions...</div>;
    if (error) return <div>{error}</div>;

    return (
        <div className="questions-layout">
            <div className="header">
                <h1>{topicName} - {questionType} Questions</h1>
            </div>

            <div className="questions-list">
                {questions.length > 0 ? (
                    questions.map((question) => (
                        <div key={question.question_id} className="question-item">
                            <div className="question-text">{question.question_text}</div>
                            <div className="question-meta">
                                <span className="question-level">{question.qlevel}</span>
                                <span className="question-type">{question.question_type}</span>
                            </div>

                            {/* For True/False Questions */}
                            {question.question_type.toLowerCase() === "true_false" && (
                                <div className="answer-choices">
                                    <button onClick={() => handleAnswerSelect(question.question_id, true)}>
                                        True
                                    </button>
                                    <button onClick={() => handleAnswerSelect(question.question_id, false)}>
                                        False
                                    </button>
                                </div>
                            )}

                            {/* For Multiple Choice Questions */}
                            {question.question_type.toLowerCase() === "multiple_choice" && (
                                <div className="answer-choices">
                                    <button onClick={() => handleAnswerSelect(question.question_id, 1)}>
                                        {question.option1}
                                    </button>
                                    <button onClick={() => handleAnswerSelect(question.question_id, 2)}>
                                        {question.option2}
                                    </button>
                                    <button onClick={() => handleAnswerSelect(question.question_id, 3)}>
                                        {question.option3}
                                    </button>
                                    <button onClick={() => handleAnswerSelect(question.question_id, 4)}>
                                        {question.option4}
                                    </button>
                                </div>
                            )}

                        </div>
                    ))
                ) : (
                    <div>No questions found for this topic.</div>
                )}
            </div>
        </div>
    );
};

export default Topic_Select;
