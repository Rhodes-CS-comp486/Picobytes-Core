/* Homepage Bot Contents */

import { useNavigate } from 'react-router-dom'
import './home_bot_content.css'
import { useEffect, useState } from 'react';

const Home_Bot_Content = () => {
    const [totalQuestions, setTotalQuestions] = useState(0);
    const navigate = useNavigate();
        
        // Fetch total number questions
        useEffect(() => {
            fetch('http://localhost:5000/api/questions')
                .then(response => response.json())
                .then(data => {
                    setTotalQuestions(data.total_questions);
                })
                .catch(error => {
                    console.error('Error fetching total questions:', error);
                });
        }, []);

    // Navigate to questions page with question id
    const goToQuestion = (id: number) => {
        navigate(`/question/${id}`);
    }

    return (
        
        <div className='hbc'>
            <h1>Lessons</h1>
            <div className='hbc-grid'>
                {/* GENERATE BUTTONS BASED ON TOTAL QUESTIONS */}
                {[...Array(totalQuestions)].map((_, index) => {
                    const questionId = index + 1; // ID starts from 1
                    return (
                        <div key={questionId}>
                            <button onClick={() => goToQuestion(questionId)}>
                                Question {questionId}
                            </button>
                        </div>
                    );
                })}
            </div>
        </div>
    );
};

export default Home_Bot_Content