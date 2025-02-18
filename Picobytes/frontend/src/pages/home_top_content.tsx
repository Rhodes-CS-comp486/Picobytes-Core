
import { useNavigate } from 'react-router-dom';

import './home_top_content.css'

const Home_Top_Content = () => {
    const navigate = useNavigate();

    const questions = () => {
        navigate('/question/:id')
    }
    return (
        <div className='htc'>
            <div>
                <h1>Welcome back, Agent 41!</h1>
            </div>

            {/* Button */}
            <button className='htc-button' onClick={questions}>
                Continue Lesson
            </button>

        </div>
    );

};

export default Home_Top_Content