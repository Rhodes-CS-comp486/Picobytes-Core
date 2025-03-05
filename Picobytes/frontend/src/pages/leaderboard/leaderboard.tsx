/// Leaderboard TSX
import './leaderboard.css'

import Home_Header from '../home/home_header';

const Leaderboard = () => {
    const players = ['Player 1', 'Player 2', 'Player 3', 'Player 4', 'Player 5', 'Player 6', 'Player 7', 'Player 8', 'Player 9'];

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
            <Home_Header/>
            
            <div id="leaderboard-grid">
                <div id="leaderboard-header">
                    <h1>🏆 Leaderboard 🏆</h1>
                </div>

                {players.map((player, index) => (
                    <p className='grid-item' key={index}>
                        {getRankEmote(index)} {player}
                    </p>
                ))}

            </div>
        </div>
    );
};

export default Leaderboard;
