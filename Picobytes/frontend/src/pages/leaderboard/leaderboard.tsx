/// Leaderboard TSX
import './leaderboard.css'

// get username
const username = localStorage.getItem("username") || "Agent 41"

const Leaderboard = () => {
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
            
            <div id="leaderboard-grid">
                <div id='leaderboard-header'>🏆 Leaderboard 🏆</div>

                {players.map((player, index) => (
                    <div className='grid-item' key={index}>
                        <div id="grid-hbox">
                            <div className='stat-icon'>
                                {getRankEmote(index)} 
                            </div>

                            <div id="grid-icon">
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
