/// Leaderboard Page TSX ///////////////////////////////////////////////

import './leaderboard.css';
import Home_Header from '../home/home_header';
import Home_Prof_Overlay from '../home/home_prof_overlay';
import { useNavigate } from 'react-router-dom';
import { useEffect, useState } from 'react';
import SideBar from '../home/side_bar';

/// INTERFACES /////////////////////////////////////////////////////////////
interface Prop {
    toggleDark: () => void;
}


interface PlayerStats {
    streak: number;
    points: number;
}

interface Player {
    username: string;
    uid: string;
}



const Leaderboard_All = ({toggleDark}: Prop) => {
    /// CONSTANTS ////////////////////////////////////////////////////////
    const [showOverlay, setShowOverlay] = useState(false);

    const [playerStats, setPlayerStats] = useState<{ [key: string]: PlayerStats }>({});
    const [players, setPlayers] = useState<Player[]>([]);

    const [progressValue, setProgressValue] = useState(0); // Initial value is 0

    
    const toggleOverlay = () => {
        setShowOverlay(!showOverlay);
    };

    // Get username, uid from localStorage or set default
    const username = localStorage.getItem("username") || "Agent 41";
    const uid = localStorage.getItem("uid") || "pvCYNLaP7Z";


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
    

    useEffect(() => {

        const top10players: Player[] = [];
    

        const fetchTop10 = async () => {
            try {
                const response = await fetch('http://localhost:5000/api/get_top_10');
                const data = await response.json();
                if (response.ok) {
                    console.log(data);
                    // Map the array to a more readable format
                    const formattedPlayers = data.top10.map((player: any) => ({
                        username: player[0], // First element is the username
                        uid: player[1],      // Second element is the uid
                        points: player[2],   // Third element is the points
                    }));

                    
                    setPlayers(formattedPlayers || []); // Update state with formatted players
                } else {
                    console.error("Error fetching top 10 players:", data.error);
                }
            } catch (error) {
                console.error("Error fetching top 10 players:", error);
            }
        };
        fetchTop10();

        const fetchPlayerStats = async () => {
            const stats: { [key: string]: PlayerStats } = {};
            for (const player of top10players) {
                console.log(player.uid);
                try {
                    const response = await fetch(`http://localhost:5000/api/get_user_stats/${player.uid}`);
                    const data = await response.json();
                    if (response.status === 200 && data.streak !== undefined && data.points !== undefined) {
                        stats[player.uid] = { streak: data.streak, points: data.points };
                    } else {
                        stats[player.uid] = { streak: 0, points: 0 };
                    }
                } catch (error) {
                    console.error(`Error fetching stats for ${player.uid}:`, error);
                    stats[player.uid] = { streak: 0, points: 0 };
                }
            }
            setPlayerStats(stats);
        };

        fetchPlayerStats();

        setTimeout(() => {
            setProgressValue(30);
        }, 500);
    }, [uid, username]);




    /// MAIN CONTENT ////////////////////////////////////////////////////

    return (
        <div id="ld-all">
            {/* Mobile Menu is included in Header component */}
            <Home_Header toggleOverlay={toggleOverlay} />
            {showOverlay && <Home_Prof_Overlay />}

            {/* Left Sidebar */}
            <SideBar toggleDark={toggleDark}></SideBar>

            {/* MAIN CONTENT */}
            
            <div id="ld-all-content">
                <div id="ld-all-title">🏆 Leaderboard 🏆
                    <div>Top ten users!</div>
                </div>

                
                <div id="ld-all-grid">
                    {players.map((player, index) => {

                        return (
                            <div id='ld-all-grid-item' key={index}
                                className={player.username === username ? 'highlight-user' : ''} // Highlight if current user
                            >
                                <div id="ld-grid-hbox">
                                    <div id="ld-all-rank-icon">
                                        {getRankEmote(index)} 
                                    </div>

                                    <div id="ld-all-pfp-icon">
                                        {player.username.charAt(0).toUpperCase()}
                                    </div>

                                    {/* PLAYER USERNAME*/}
                                    <div id="ld-user-stats">
                                        {player.username}
                                    </div>

                                </div>
                            </div>
                        );
                    })}
                </div>
            </div>

            {/* USER STATS */}
            <div id="ld-all-user-stats">
                <div id="ld-all-user-header">
                  
                    1.
                    <div id="ld-all-user-icon">
                        {username.charAt(0).toUpperCase()}
                    </div>
                    {username}
            
                </div>
                <div id="ld-all-user-stats-vbox">
                    <div id="ld-all-user-stats-hbox">

                        {/* Points */}
                        <div className="stat-item">
                            <div className="stat-icon">👾</div>
                            <div className="stat-value">
                                {playerStats[uid]?.points || 0}
                            </div>
                            <div className="stat-label">Bytes</div>
                        </div>

                        {/* Streak */}
                        <div className="stat-item">
                            <div className="stat-icon">🔥</div>
                            <div className="stat-value">
                                {playerStats[uid]?.streak || 0}
                            </div>
                            <div className="stat-label">Streaks</div>
                        </div>

                        {/* Completed */}
                        <div className="stat-item">
                            <div className="stat-icon">⭐</div>
                            <div className="stat-value">
                                10/50
                            </div>
                            <div className="stat-label">Completed</div>
                        </div>
                    </div>

                    {/* Progress */}
                    
                    <div id="ld-all-user-goal-text">
                        {100-progressValue} points left until next goal
                    </div>
                    <progress max='100' value={progressValue} id='lesson-prog-bar'></progress>
                    
                </div>
            </div>
                
        </div>
    );
};

export default Leaderboard_All;