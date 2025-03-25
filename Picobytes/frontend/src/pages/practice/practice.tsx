import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import Home_Header from "../home/home_header";
import Home_Prof_Overlay from "../home/home_prof_overlay";

import './practice.css';

interface Prop {
    toggleDark: () => void;
}

interface Topic {
    name: string;
    types: string[];
}

const Practice_Page = ({ toggleDark }: Prop) => {
    const navigate = useNavigate();
    const [showOverlay, setShowOverlay] = useState(false);
    const [searchTerm, setSearchTerm] = useState("");
    const [topics, setTopics] = useState<Topic[]>([]); // State for topics
    const [loading, setLoading] = useState(true); // Loading state
    const [error, setError] = useState<string | null>(null); // Error state

    const toggleOverlay = () => {
        setShowOverlay(!showOverlay);
    };

    // Dummy topics and question types (initially used)
    const dummyTopics = [
        { name: 'C Basics', types: ['ALL','MC','TF'] },
        { name: 'C Memory Management', types: ['ALL','MC','TF'] },
        { name: 'C Functions', types: ['ALL','MC','TF'] },
        { name: 'Linux', types: ['ALL','MC','TF'] },
        { name: 'Programming', types: ['ALL','MC','TF'] },
    ];

    // Function to handle fetching data on topic and type selection
    const handleTopicClick = async (topicName: string, questionType: string) => {
        try {
            // Navigate to the Questions Page with the selected topic and question type
            navigate(`/questions/${topicName}/${questionType}`);
        } catch (err) {
            setError("Error fetching data");
            console.error("Fetch error:", err);
        }
    };

    useEffect(() => {
        // Set dummy topics or fetch real topics from API
        setTopics(dummyTopics);
        setLoading(false); // Set loading to false once topics are set
    }, []);

    // Filter the topics based on the search term
    const filteredTopics = topics.filter((topic) =>
        topic.name.toLowerCase().includes(searchTerm.toLowerCase())
    );

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
                    <div className={`nav-item ${window.location.pathname === '/homepage' ? 'active' : ''}`} onClick={() => navigate('/homepage')}>
                        <span className="material-icon">🏠</span>
                        <span>Home</span>
                    </div>
                    <div className={`nav-item ${window.location.pathname === '/questions' ? 'active' : ''}`} onClick={() => goToAllQuestions()}>
                        <span className="material-icon">📝</span>
                        <span>Questions</span>
                    </div>
                    <div className={`nav-item ${window.location.pathname === '/practice' ? 'active' : ''}`} onClick={() => goToTopicSelection()}>
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

            {/* MIDDLE CONTENTS */}
            <div className="main-content">
                {/* Search Bar */}
                <input
                    type="text"
                    value={searchTerm}
                    onChange={(e) => setSearchTerm(e.target.value)}
                    placeholder="Search for a topic..."
                    className="search-bar"
                />

                {/* Display topics and their question types */}
                <div className="topics-list">
                    {filteredTopics.map((topic, index) => (
                        <div key={index} className="topic-item">
                            <div className="topic-name">{topic.name}</div>
                            <div className="question-types">
                                {topic.types.map((type, typeIndex) => (
                                    <button
                                        key={typeIndex}
                                        className="question-type-button"
                                        onClick={() => handleTopicClick(topic.name, type)}
                                    >
                                        {type}
                                    </button>
                                ))}
                            </div>
                        </div>
                    ))}
                </div>
            </div>
        </div>
    );
};

export default Practice_Page;
