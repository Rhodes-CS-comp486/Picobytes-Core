/// Leaderboard TSX
import './leaderboard_page.css'
import Homepage from '../home/home';
import { useNavigate } from 'react-router-dom';



const Leaderboard_All = () => {
    const navigate = useNavigate();

    const goToHomepage = () =>
    {
        navigate('/homepage');
    };

    // get username
    const username = localStorage.getItem("username") || "Agent 41"

    const players = [username, 'Bob', 'Kugele', 'Player 4', 'Player 5', 'Player 6', 'Player 7', 'Player 8', 'Player 9', 'Player 10'];

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
        <div id="leaderboard-all">
            <div id="leaderboard-all-link" onClick={goToHomepage}>Go Back</div>
                
            <div id="leaderboard-all-title">🏆 Leaderboard 🏆</div>

            
            <div id="leaderboard-all-grid">

                {players.map((player, index) => (
                    <div id='leaderboard-all-grid-item' key={index}>
                        <div id="leaderboard-all-grid-hbox">
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

export default Leaderboard_All;
