/// Leaderboard TSX
import './leaderboard.css';
import { useNavigate } from 'react-router-dom';

const Leaderboard = () => {
    /// CONSTANTS /////////////////////////////////////////////////////////

    const navigate = useNavigate();

    // View full Leaderboard page
    const goToLeaderboard = () => {
        navigate('/leaderboard');
    };

    // get username
    const username = localStorage.getItem("username") || "Agent 41"

    
    const players = [username, 'Bob', 'Kugele', 'Player 4', 'Player 5', 'Player 6', 'Player 7', 'Player 8', 'Player 9'];


    /// FUNCTIONS  /////////////////////////////////////////////////////////
    // Generate random streak (in days)
    const generateRandomStreak = () => {
        return Math.floor(Math.random() * 500); // Random streak between 0 and 500 days
    };


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


    /// MAIN CONTENT /////////////////////////////////////////////////////////

    return (
        <div id="ld">
            
            <div id='ld-title'>🏆 Leaderboard 🏆</div>
            


            <div id="ld-grid">

                {players.map((player, index) => {
                 
                    return(
                        <div id='ld-grid-item'
                            key={index}
                            className={player === username ? 'highlight-user' : ''} // Highlight if current user
                            >
                            <div id="leaderboard-grid-hbox">
                                <div id="ld-rank-icon">
                                    {getRankEmote(index)} 
                                </div>

                                <div id="ld-pfp-icon">
                                    {player.charAt(0).toUpperCase()}
                                </div>

                                <div id="ld-player-name">
                                    {player}
                                </div>
                                
                            </div>
                        </div>
                    );
                }
                )}
                    

            </div>
            <div id="ld-link" onClick={goToLeaderboard}>VIEW ALL</div>
        </div>
    );
};

export default Leaderboard;
