
import { useNavigate } from 'react-router-dom';
import { useEffect, useState } from 'react';


import './home_top_content.css'

const Home_Top_Content = () => {
    const navigate = useNavigate();

    const question = () => {
        navigate('/question/:id')
    }
    const topic_select = () => {
        navigate('/topic_select')
    }
    const allQuestions = () => {
        navigate('/questions')
    
    }
    const [totalQuestions, setTotalQuestions] = useState(0);
    
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



    /* MAIN BODY */
    return (
        <div className='htc'>
            <div>
                <h1>Welcome back, Agent 41!</h1>

            </div>

            {/* PROGRESS BAR */}
            <p>Total Questions: {totalQuestions}</p>
            <div className='htc-progress-bar'></div>

            <div className='button-container'>
                <button className='htc-button' onClick={question}>
                    Resume Questions <span>&#10233;</span>
                </button>
                <button className='htc-button' onClick={allQuestions}>
                    All Questions <span>&#10233;</span>
                </button>
            </div>
        </div>
    );
};

export default Home_Top_Content