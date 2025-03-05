/* Practice TSX */

import { useState } from "react";
import { useNavigate } from "react-router-dom";
import Home_Header from "../home/home_header";
import Home_Prof_Overlay from "../home/home_prof_overlay";

import './practice.css';

const Practice_Page = () => {
    const navigate = useNavigate();
    const [showOverlay, setShowOverlay] = useState(false);
    const [searchTerm, setSearchTerm] = useState("");
    const [expandedTopic, setExpandedTopic] = useState<string | null>(null);

    // Dummy topics for now
    const [topics] = useState([
        { name: "Science", types: ["Multiple Choice", "True/False"] },
        { name: "Programming", types: ["Multiple Choice", "True/False"] },
        { name: "Geography", types: ["Multiple Choice", "True/False"] },
        { name: "Biology", types: ["Multiple Choice", "True/False"] }
    ]);

    const toggleOverlay = () => {
        setShowOverlay(!showOverlay);
    };

    // Handler to filter topics based on search term
    const handleSearch = (e: React.ChangeEvent<HTMLInputElement>) => {
        setSearchTerm(e.target.value);
    };

    // Filter topics based on the search term
    const filteredTopics = topics.filter((topic) =>
        topic.name.toLowerCase().includes(searchTerm.toLowerCase())
    );

    // Handler for expanding/collapsing topic question types
    const handleTopicClick = (topicName: string) => {
        setExpandedTopic(expandedTopic === topicName ? null : topicName);
    };

    // Function to handle navigation to a specific question type page
    const goToQuestionPage = (topicName: string, questionType: string) => {
        // Assuming you have a question page for each type under the path `/questions/topic/question-type`
        navigate(`/questions/${topicName}/${questionType.toLowerCase()}`);
    };

    function goToAllQuestions(): void {
        navigate('/questions');
    }

    function goToTopicSelection(): void {
        navigate('/practice');
    }

    return (
        <div className="practice-layout">
            {/* Mobile Menu is included in Header component */}
            <Home_Header toggleOverlay={toggleOverlay} />
            {showOverlay && <Home_Prof_Overlay />}
            
            {/* Left Sidebar */}
            <div className="sidebar">
            <div className="logo-container">
            <h1 className="logo-text">Picobytes</h1>
            </div>
            
            <nav className="sidebar-nav">
            <div className="nav-item active" onClick={()=> navigate('/homepage')}>
                <span className="material-icon">🏠</span>
                <span>Home</span>
            </div>
            <div className="nav-item" onClick={() => goToAllQuestions()}>
                <span className="material-icon">📝</span>
                <span>Questions</span>
            </div>
            <div className="nav-item" onClick={() => goToTopicSelection()}>
                <span className="material-icon">📚</span>
                <span>Topics</span>
            </div>
            <div className="nav-item" onClick={() => navigate('/settings')}>
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
            </nav>
            </div>

            {/* MIDDLE CONTENTS */}
            <div className="main-content">
                {/* Search Bar */}
                <input
                    type="text"
                    value={searchTerm}
                    onChange={handleSearch}
                    placeholder="Search for a topic..."
                    className="search-bar"
                />

                {/* Display filtered topics */}
                <div className="topics-list">
                    {filteredTopics.length > 0 ? (
                        filteredTopics.map((topic, index) => (
                            <div key={index} className="topic-item">
                                <div className="topic-name">{topic.name}</div>

                                <div className="question-types" onClick={() => handleTopicClick(topic.name)}>
                                        {topic.types.map((type, typeIndex) => (
                                            <button
                                                key={typeIndex}
                                                className="question-type-button"
                                                onClick={() => goToQuestionPage(topic.name, type)}>
                                                {type}
                                            </button>
                                        ))}
                                </div>

                            </div>
                        ))
                    ) : (
                        <div className="no-results">No topics found</div>
                    )}
                </div>
            </div>
        </div>
    );
};

export default Practice_Page;
