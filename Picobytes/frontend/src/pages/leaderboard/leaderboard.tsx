/// Leaderboard TSX
import './leaderboard.css';
import { useNavigate } from 'react-router-dom';




const Leaderboard = () => {

    const navigate = useNavigate();

    // View full Leaderboard page
    const goToLeaderboard = () => {
        navigate('/leaderboard');
    };

    // get username
    const username = localStorage.getItem("username") || "Agent 41"

    
    const players = [username, 'Bob', 'Kugele', 'Player 4', 'Player 5', 'Player 6', 'Player 7', 'Player 8', 'Player 9'];

    const getRankEmote = (index: number) => {
        switch (index) {
            case 0:
                return "🥇"; // Emote for 1st place
            case 1:
                return "🥈"; // Emote for 2nd place
            case 2:
                return "🥉"; // Emote for 3rd place
            default:
                return index + ".";  // Regular emote for other players
        }
    };

    return (
        <div id="leaderboard">
            <div className="view-all-link" onClick={goToLeaderboard}>VIEW ALL</div>
            <div id="leaderboard-grid">
                <div id='leaderboard-header'>🏆 Leaderboard 🏆</div>

                {players.map((player, index) => (
                    <div id='leaderboard-grid-item'
                        key={index}
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
                        </div>
                    </div>
                ))}

            </div>
        </div>
    );
};

export default Leaderboard;
