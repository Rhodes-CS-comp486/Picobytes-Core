/* Topic Selection */
import Home_Header from '../home/home_header';
import './topic_select.css'

import Topic_Select_Topic from './topic_select_topic';

const Topic_Select = () => {
    return(
        <>
            <Home_Header />
            <div id="header">
                <h1>Lesson Title</h1>
                <h2>Description of lessons.</h2>

                <button>CLICK ME TO START Topic 1</button>

            </div>

            {/* Main Body */}
            
            
            {<Topic_Select_Topic/>}
            
        </>
    );
};

export default Topic_Select