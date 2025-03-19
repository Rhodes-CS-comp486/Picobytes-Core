/// Leaderboard Page TSX ///////////////////////////////////////////////

import './leaderboard.css';
import Home_Header from '../home/home_header';
import Home_Prof_Overlay from '../home/home_prof_overlay';
import { useNavigate } from 'react-router-dom';
import { useState } from 'react';

/// INTERFACES /////////////////////////////////////////////////////////////
interface Prop {
    toggleDark: () => void;
}

const Leaderboard_All = ({toggleDark}: Prop) => {
    /// CONSTANTS ////////////////////////////////////////////////////////
    const navigate = useNavigate();

    const [showOverlay, setShowOverlay] = useState(false);
    
    const toggleOverlay = () => {
        setShowOverlay(!showOverlay);
    };

    // Get username from localStorage or set default
    const username = localStorage.getItem("username") || "Agent 41";

    // Players array
    const players = [username, 'Bob', 'Kugele', 'Player 4', 'Player 5', 'Player 6', 'Player 7', 'Player 8', 'Player 9', 'Player 10'];


    /// FUNCTIONS ////////////////////////////////////////////////////////
    // Generate random questions answered (out of 50)
    const generateRandomQuestionsAnswered = () => {
        return Math.floor(Math.random() * 51); // Random value between 0 and 50
    };

    // Generate random streak (in days)
    const generateRandomStreak = () => {
        return Math.floor(Math.random() * 500); // Random streak between 0 and 500 days
    };

    // Generate random correctness percentage (0 to 100)
    const generateRandomCorrectness = () => {
        return Math.floor(Math.random() * 101); // Random value between 0 and 100
    };


    // Get rank emote based on index
    const getRankEmote = (index: number) => {
        switch (index) {
            case 0:
                return "🥇"; // Emote for 1st place
            case 1:
                return "🥈"; // Emote for 2nd place
            case 2:
                return "🥉"; // Emote for 3rd place
            default:
                return index + 1 + ".";  // Regular emote for other players
        }
    };

    // Function to convert streaks into days, months, or years
    const getStreakDisplay = (streakDays: number) => {
        if (streakDays >= 365) {
            const years = Math.floor(streakDays / 365);
            return `${years} year${years > 1 ? 's' : ''}`;
        } else if (streakDays >= 30) {
            const months = Math.floor(streakDays / 30);
            return `${months} month${months > 1 ? 's' : ''}`;
        } else {
            return `${streakDays} day${streakDays > 1 ? 's' : ''}`;
        }
    };


    /// MAIN CONTENT ////////////////////////////////////////////////////

    return (
        <div id="ld-all">
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
                    <div className={`nav-item ${window.location.pathname === '/questions' ? 'active' : ''}`} onClick={() => navigate("questions")}>
                        <span className="material-icon">📝</span>
                        <span>Questions</span>
                    </div>
                    <div className={`nav-item ${window.location.pathname === '/practice' ? 'active' : ''}`} onClick={() => navigate("/practice")}>
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

            {/* MAIN CONTENT */}
            
            <div id="ld-all-content">
                <div id="ld-all-title">🏆 Leaderboard 🏆
                    <div>Top ten users!</div>
                </div>

                
                <div id="ld-all-grid">
                    {players.map((player, index) => {
                        // Generate random streak for each player
                        const streak = generateRandomStreak();
                        const questionsAnswered = generateRandomQuestionsAnswered();
                        const correctness = generateRandomCorrectness();  // Generate random correctness

                        return (
                            <div id='ld-all-grid-item' key={index}
                                className={player === username ? 'highlight-user' : ''} // Highlight if current user
                            >
                                <div id="leaderboard-grid-hbox">
                                    <div id="ld-all-rank-icon">
                                        {getRankEmote(index)} 
                                    </div>

                                    <div id="ld-all-pfp-icon">
                                        {player.charAt(0).toUpperCase()}
                                    </div>

                                    {/* PLAYER USERNAME & STREAKS */}
                                    <div id="leaderboard-user-stats">
                                        {player}
                                        <div id="leaderboard-streak">
                                            🔥 {getStreakDisplay(streak)}
                                        </div>
                                    </div>

                                    {/* DISPLAY TOTAL QUESTIONS ANSWERED */}
                                    <div id="leaderboard-questions-answered">
                                        {questionsAnswered} / 50
                                    </div>

                                    {/* DISPLAY CORRECTNESS PERCENTAGE */}
                                    <div id="leaderboard-correctness">
                                        ✅ {correctness}%
                                    </div>

                                    
                                </div>
                            </div>
                        );
                    })}
                </div>
            </div>
        </div>
    );
};

export default Leaderboard_All;
