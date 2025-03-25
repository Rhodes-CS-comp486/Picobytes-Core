/* Lesson Progress Page */
/* Will hold all lessons and their progress bars */
/* Similar to topic_select */
import { useEffect, useState } from 'react';
import { useNavigate } from "react-router-dom";
import Home_Header from '../home/home_header';
import Home_Prof_Overlay from '../home/home_prof_overlay';
import './lesson_progress.css'
import '../practice/practice.css'


/// DEFINES ///////////////////////////
interface Prop {
    toggleDark: () => void;
}

interface Lesson {
    name: string;
    progress: number;
    totalQuestions: number;
    answeredQuestions: number;
}


const Lesson_Progress = ({ toggleDark }: Prop) => {
    /// CONSTANTS ///////////////////////////////////
    const navigate = useNavigate()
    const [showOverlay, setShowOverlay] = useState(false);
    const toggleOverlay = () => {
        setShowOverlay(!showOverlay);
    };

    const [progressValues, setProgressValues] = useState<number[]>([]); // Store progress values for each lesson

    // Set a lesson number as no way to fetch lesson amount from DB yet.
    // Set to 3 for now
    
    const lessons: Lesson[] = [
        { name: 'Lesson 1', progress: 70, totalQuestions: 10, answeredQuestions: 7 },
        { name: 'Lesson 2', progress: 40, totalQuestions: 10, answeredQuestions: 4 },
        { name: 'Lesson 3', progress: 90, totalQuestions: 10, answeredQuestions: 9 }
    ];

    /// FUNCTIONS /////////////////////////////////////

    function goToLesson(lessonNumber: number, answeredQuestions: number) {
        // Store both lesson number and answered questions in the URL query parameters
        navigate(`/homepage?lesson=${lessonNumber}&answered=${answeredQuestions}`);
    }

    /// PROGRESS ANIMATION ////////////////////////////////////
    useEffect(() => {
        // Initialize progress values for each lesson to 0
        const initialProgressValues = lessons.map(() => 0);
        setProgressValues(initialProgressValues);
    
        // Animate progress bars for each lesson
        const intervals = lessons.map((lesson, index) => {
            let currentProgress = 0;
            const interval = setInterval(() => {
                if (currentProgress < lesson.progress) {
                    currentProgress += 1;  // Gradually increase progress value
                    setProgressValues((prevValues) => {
                        // Create a copy of the previous state
                        const updatedValues = [...prevValues];
                        updatedValues[index] = currentProgress; // Update specific lesson's progress
                        return updatedValues;
                    });
                } else {
                    clearInterval(interval);  // Stop the interval when we reach the desired value
                }
            }, 20); // Change progress every 20ms for smooth animation
    
            return interval;
        });
    
        // Cleanup the intervals when the component unmounts
        return () => {
            intervals.forEach(clearInterval);
        };
    }, []);
    
    


    /// MAIN CONTENT //////////////////////////////////
    return(
        <div className='practice-layout'>
            {/* NAVIGATIONAL SIDE BAR*/}
            {/* Mobile Menu is included in Header component */}
            <Home_Header toggleOverlay={toggleOverlay} />
            {showOverlay && <Home_Prof_Overlay />}

            {/* Left Sidebar */}
            <div className="sidebar">
                <div className="logo-container">
                    <h1 className="logo-text">Picobytes</h1>
                </div>

                <nav className="sidebar-nav">
                    <div className={`nav-item ${window.location.pathname === '/homepage' ? 'active' : ''}`} onClick={() => {
                        const lastLesson = localStorage.getItem('selectedLesson');
                        if (lastLesson) {
                            navigate(`/homepage?lesson=${lastLesson}`);
                        } else {
                            navigate('/homepage'); // Default homepage if no lesson was selected
                        }
                    }}>
                        <span className="material-icon">🏠</span>
                        <span>Home</span>
                    </div>
                    <div className={`nav-item ${window.location.pathname === '/questions' ? 'active' : ''}`} onClick={() => navigate('/questions')}>
                        <span className="material-icon">📝</span>
                        <span>Questions</span>
                    </div>
                    <div className={`nav-item ${window.location.pathname === '/practice' ? 'active' : ''}`} onClick={() => navigate('/practice')}>
                        <span className="material-icon">📚</span>
                        <span>Topics</span>
                    </div>
                    <div className={`nav-item ${window.location.pathname === '/settings' ? 'active' : ''}`} onClick={() => navigate('/settings')}>
                        <span className="material-icon">⚙️</span>
                        <span>Settings</span>
                    </div>
                    {/* Admin section if user is admin */}
                    {localStorage.getItem("isAdmin") === "true" && (
                        <div className="nav-item" onClick={() => navigate('/admin/dashboard')}>
                            <span className="material-icon">👑</span>
                            <span>Admin</span>
                        </div>
                    )}

                    <div className="nav-item" onClick={() => toggleDark()}>
                        <span className="material-icon">☾</span>
                        <span>Theme</span>
                    </div>
                </nav>
            </div>


            {/* MAIN LESSON CONTENT */}
            <div className='main-content'>
                <h1>All Lessons</h1>
                <div className='topics-list'>
                    {lessons.map((lesson: Lesson, index: number) => (
                            <div key={index} className='topic-item' onClick={() => goToLesson(index + 1, lesson.answeredQuestions)}>
                                <div className='topic-name'>{lesson.name}</div>
                                <div id='lesson-prog-info'>
                                    <progress max='100' value={progressValues[index]} id='lesson-prog-bar'></progress>
                                    <span>{lesson.answeredQuestions}/{lesson.totalQuestions} Questions</span>
                                </div>
                            </div>
                        ))
                    }
                </div>
            </div>
        </div>
    );
};

export default Lesson_Progress;
