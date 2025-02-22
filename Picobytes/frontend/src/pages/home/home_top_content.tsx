
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
                <button onClick={topic_select}>To topic select</button>
            </div>

            {/* PROGRESS BAR */}
            <p>Total Questions: {totalQuestions}</p>
            <div className='htc-progress-bar'>
                {/*<div className={`progress progress-${progress}`}>*/}
                
            </div>

            {/* Button */}
            <button className='htc-button' onClick={question}>
                Resume Questions <span>&#10233;</span>
            </button>

        </div>
    );

};

export default Home_Top_Content