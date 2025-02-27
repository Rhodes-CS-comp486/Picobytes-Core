/* Topic Selection */
import './topic_select.css'

import Topic_Select_Topic from './topic_select_topic';

const Topic_Select = () => {
    return(
        <>
            <div id="header">
                <h1>Lesson Title</h1>
                <h2>Description of lessons.</h2>

                <button>CLICK ME TO START LESSON</button>

                <p>PROGRESS BAR BELOW HERE</p>
            </div>

            {/* Main Body */}
            
            
            {<Topic_Select_Topic/>}
            
        </>
    );
};

export default Topic_Select