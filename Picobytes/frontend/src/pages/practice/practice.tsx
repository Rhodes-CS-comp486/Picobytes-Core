import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import Home_Header from "../home/home_header";
import Home_Prof_Overlay from "../home/home_prof_overlay";
import SideBar from "../home/side_bar";

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
    const realTopics: Topic[] = [];

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
        // Fetch all topics
        fetch("http://localhost:5001/api/topics")
            .then((response) => response.json())
            .then((data) => {
                // Extract unique topics from the questions
                const topicsSet = new Set<string>();
                const topicProgressData: Record<string, number> = {};
                const updatedTopics: Topic[] = []; // Temporary array to store topics
    
                // Extract unique topics from the data
                data.forEach((topic: string) => {
                    if (!topicsSet.has(topic)) {
                        topicsSet.add(topic);
                        topicProgressData[topic]=0;
                        updatedTopics.push({ name: topic, types: ['ALL', 'MC', 'TF','FR','CB'] });
                    }
                });
                setTopics(updatedTopics);
            })
            .catch((err) => {
                console.error("Fetch error:", err);
                setTopics(dummyTopics); // Fallback to dummy topics on error
            })
            .finally(() => {
                setLoading(false); // Set loading to false once topics are set
            });
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
            <SideBar toggleDark={toggleDark}></SideBar>

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
