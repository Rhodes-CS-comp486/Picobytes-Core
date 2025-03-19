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

    /// MAIN CONTENT /////////////////////////////////////////////////////////

    return (
        <div id="ld">
            <div id="ld-header">
                <div id='ld-title'>🏆 Leaderboard 🏆</div>
                <div className="view-all-link" onClick={goToLeaderboard}>VIEW ALL</div>
            </div>


            <div id="ld-grid">

                {players.map((player, index) => {
                    const streak = generateRandomStreak();
                 
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

                                <div id="leaderboard-user-stats">
                                    {player}
                                    <div id="leaderboard-streak">
                                        🔥 {getStreakDisplay(streak)}
                                    </div>
                                </div>
                                
                            </div>
                        </div>
                    );
                }
                )}
                    

            </div>
        </div>
    );
};

export default Leaderboard;
