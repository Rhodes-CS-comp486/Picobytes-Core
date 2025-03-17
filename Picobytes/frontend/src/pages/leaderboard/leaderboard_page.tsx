import './leaderboard.css';
import { useNavigate } from 'react-router-dom';

const Leaderboard_All = () => {
    const navigate = useNavigate();

    const goToHomepage = () => {
        navigate('/homepage');
    };

    // Get username
    const username = localStorage.getItem("username") || "Agent 41";

    // Players array
    const players = [username, 'Bob', 'Kugele', 'Player 4', 'Player 5', 'Player 6', 'Player 7', 'Player 8', 'Player 9', 'Player 10'];

    // Generate random XP for each player
    const generateRandomXP = () => {
        return Math.floor(Math.random() * 1000) + 100; // Random XP between 100 and 1000
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

    return (
        <div id="leaderboard-all">
            <div id="leaderboard-all-link" onClick={goToHomepage}>Go Back</div>
            
            <div id="leaderboard-all-title">🏆 Leaderboard 🏆</div>
            
            <div id="leaderboard-all-grid">
                {players.map((player, index) => (
                    <div id='leaderboard-all-grid-item' key={index}
                    className={player === username ? 'highlight-user' : ''} // Highlight if current user
                    >
                        <div id="leaderboard-grid-hbox">
                            <div className='stat-icon'>
                                {getRankEmote(index)} 
                            </div>

                            <div id="ld-grid-icon">
                                {player.charAt(0).toUpperCase()}
                            </div>

                            {player}

                            {/* Add random XP value at the end */}
                            <div id="leaderboard-xp">
                                XP: {generateRandomXP()}
                            </div>
                        </div>
                    </div>
                ))}
            </div>
        </div>
    );
};

export default Leaderboard_All;
