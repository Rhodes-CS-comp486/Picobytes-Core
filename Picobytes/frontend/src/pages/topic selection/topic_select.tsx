/* Topic Selection */
import Home_Header from '../home/home_header';
import './topic_select.css'

const Topic_Select = () => {
    return(
        <>
            <Home_Header />
            <div id="header">
                <h1>Lesson Title</h1>
                <h2>Description of lessons.</h2>

                <button>CLICK ME TO START LESSON</button>

                <p>PROGRESS BAR BELOW HERE</p>
            </div>

            {/* Main Body */}
            
            <div id="main-wrap">
                <div id="left">
                    List of topics here
                </div>
            </div>
        </>
    );
};

export default Topic_Select