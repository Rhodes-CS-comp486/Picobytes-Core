
import { useNavigate } from 'react-router-dom';
import { useEffect, useState } from 'react';

import './home_top_content.css'

const Home_Top_Content = () => {
    const navigate = useNavigate();

    const question = () => {
        navigate('/question/:id')
    }
    
    const [totalQuestions, setTotalQuestions] = useState(0);
    
    // Fetch total number MC questions
    useEffect(() => {
        fetch('/api/question/<int:qid>')
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
                <p>Continue your progress?</p>
            </div>

            {/* PROGRESS BAR */}
            <div className='htc-progress-bar'>
                {/*<div className={`progress progress-${progress}`}>*/}
                
            </div>
            <p>Total Questions: {totalQuestions}</p>

            {/* Button */}
            <button className='htc-button' onClick={question}>
                Resume Questions <span>&#10233;</span>
            </button>

        </div>
    );

};

export default Home_Top_Content