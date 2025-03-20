/// Leaderboard Page TSX ///////////////////////////////////////////////

import './leaderboard.css';
import Home_Header from '../home/home_header';
import Home_Prof_Overlay from '../home/home_prof_overlay';
import { useNavigate } from 'react-router-dom';
import { useEffect, useState } from 'react';

/// INTERFACES /////////////////////////////////////////////////////////////
interface Prop {
    toggleDark: () => void;
}

interface PlayerStreaks {
    [key: string]: number; // Map of UID to their streak
}


const Leaderboard_All = ({toggleDark}: Prop) => {
    /// CONSTANTS ////////////////////////////////////////////////////////
    const navigate = useNavigate();

    const [showOverlay, setShowOverlay] = useState(false);
    const [playerStreaks, setPlayerStreaks] = useState<PlayerStreaks>({});
    const [players, setPlayers] = useState<{ username: string, uid: string }[]>([]);
    
    const toggleOverlay = () => {
        setShowOverlay(!showOverlay);
    };

    // Get username from localStorage or set default
    const username = localStorage.getItem("username") || "Agent 41";
    const uid = localStorage.getItem("uid") || "pvCYNLaP7Z"; //will correctly fetch uid from local storage except for Will and Matt users

    // Players array
    //const players = [username, 'Bob', 'Kugele', 'Player 4', 'Player 5', 'Player 6', 'Player 7', 'Player 8', 'Player 9', 'Player 10'];
   


    /// FUNCTIONS ////////////////////////////////////////////////////////
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
    

    const getStreakDisplay = (streakDays: number) => {
        if (!streakDays) return ''; // No streak to display
        const streakDisplay = streakDays >= 365
            ? `${Math.floor(streakDays / 365)} year${streakDays >= 730 ? 's' : ''}`
            : streakDays >= 30
            ? `${Math.floor(streakDays / 30)} month${streakDays >= 60 ? 's' : ''}`
            : `${streakDays} day${streakDays > 1 ? 's' : ''}`;
        
        // Add the fire emoji if streakDays is >= 1
        return streakDays >= 1 ? `🔥 ${streakDisplay}` : streakDisplay;
    };


    useEffect(() => {
        // Example list of player UIDs (You can replace it with actual data)
        
        const playersList = [
            { username: username, uid: uid },
            { username: 'Bob', uid: 'pvCYNLaP7Z' },
            { username: 'Kugele', uid: '5YAN6mAhvf' },
            { username: 'Player 4', uid: '5YAN6mAhvf' },
            { username: 'Player 5', uid: '5YAN6mAhvf' },
            { username: 'Player 6', uid: '5YAN6mAhvf' },
            { username: 'Player 7', uid: '5YAN6mAhvf' },
            { username: 'Player 8', uid: '5YAN6mAhvf' },
            { username: 'Player 9', uid: '5YAN6mAhvf' },
            { username: 'Player 10', uid: '5YAN6mAhvf' }
        ];

        setPlayers(playersList); // Set player data

        // Fetch streaks for all players
        const fetchStreaks = async () => {
            const streaks: PlayerStreaks = {};
            for (const player of playersList) {
                try {
                    const response = await fetch(`http://localhost:5000/get_user_stats/${player.uid}`);
                    const data = await response.json();
                    if (response.status === 200 && data.streak !== undefined) {
                        streaks[player.uid] = data.streak;
                    } else {
                        streaks[player.uid] = 0; // If there's an error or no streak, set to 0
                    }
                } catch (error) {
                    console.error(`Error fetching streak for ${player.uid}:`, error);
                    streaks[player.uid] = 0; // If there's an error fetching streak, set to 0
                }
            }
            setPlayerStreaks(streaks); // Update the streaks in the state
        };

        fetchStreaks();
    }, []);



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
                        const streak = playerStreaks[player.uid] || 0;

                        return (
                            <div id='ld-all-grid-item' key={index}
                                className={player.username === username ? 'highlight-user' : ''} // Highlight if current user
                            >
                                <div id="leaderboard-grid-hbox">
                                    <div id="ld-all-rank-icon">
                                        {getRankEmote(index)} 
                                    </div>

                                    <div id="ld-all-pfp-icon">
                                        {player.username.charAt(0).toUpperCase()}
                                    </div>

                                    {/* PLAYER USERNAME & STREAKS */}
                                    <div id="leaderboard-user-stats">
                                        {player.username}
                                        <div id="leaderboard-streak">
                                            {getStreakDisplay(streak)}
                                        </div>
                                    </div>

                                    {/* DISPLAY TOTAL QUESTIONS ANSWERED */}
                                    <div id="leaderboard-questions-answered">
                                        10 / 50
                                    </div>

                                    {/* DISPLAY CORRECTNESS PERCENTAGE */}
                                    <div id="leaderboard-correctness">
                                        ✅ 50%
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