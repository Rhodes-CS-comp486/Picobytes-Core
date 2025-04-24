/// Leaderboard Page TSX ///////////////////////////////////////////////

import "./leaderboard.css";
import Home_Header from "../home/home_header";
import Home_Prof_Overlay from "../home/home_prof_overlay";
import { useEffect, useState } from "react";
import SideBar from "../home/side_bar";
import { useSidebar } from "../home/side_bar_context";

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
  points : number;
}

const Leaderboard_All = ({ toggleDark }: Prop) => {
  /// CONSTANTS ////////////////////////////////////////////////////////
  const [showOverlay, setShowOverlay] = useState(false);

  const [playerStats, setPlayerStats] = useState<{
    [key: string]: PlayerStats;
  }>({});
  const [players, setPlayers] = useState<Player[]>([]);

  const [progressValue, setProgressValue] = useState(0); // Initial value is 0

  const { isVisible } = useSidebar();

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
        return index + 1 + "."; // Regular emote for other players
    }
  };

  useEffect(() => {
    // Fetch top 10 players
    const fetchTop10 = async () => {
      try {
        const response = await fetch("http://localhost:5000/api/get_top_10");
        const data = await response.json();
        if (response.ok) {
          const formattedPlayers = data.top10.map((player: any) => ({
            username: player.uname || player[0],
            uid: player.uid || player[1],
            points: player.upoints || player[2],
          }));
          setPlayers(formattedPlayers || []);
        } else {
          console.error("Error fetching top 10 players:", data.error);
        }
      } catch (error) {
        console.error("Error fetching top 10 players:", error);
      }
    };

    fetchTop10();
  }, []);

  // Fetch user stats only
  useEffect(() => {
    // Fetch the current user's stats only
    const fetchPlayerStats = async () => {
      try {
        const response = await fetch(
          `http://localhost:5000/api/get_user_stats/${uid}`
        );
        const data = await response.json();

        if (
          response.ok &&
          data.streak !== undefined &&
          data.points !== undefined
        ) {
          setPlayerStats({
            [uid]: { streak: data.streak, points: data.points },
          });
        } else {
          setPlayerStats({ [uid]: { streak: 0, points: 0 } });
        }
      } catch (error) {
        console.error(`Error fetching stats for ${uid}:`, error);
        setPlayerStats({ [uid]: { streak: 0, points: 0 } });
      }
    };

    fetchPlayerStats();
  }, [uid]); // Only re-run when the `uid` changes

  /// MAIN CONTENT ////////////////////////////////////////////////////

  return (
    <div className={`ld-all-container ${isVisible ? "sidebar-expanded" : "sidebar-collapsed"}`}>
      {/* Mobile Menu is included in Header component */}
      <Home_Header toggleOverlay={toggleOverlay} />
      {showOverlay && <Home_Prof_Overlay />}

      {/* Left Sidebar */}
      <SideBar toggleDark={toggleDark}></SideBar>

      {/* MAIN CONTENT */}
      <div id="ld-main-container">
        <div id="ld-all-content">
          <div id="ld-all-title">
            🏆 Leaderboard 🏆
            <div id="ld-all-subtitle">Top ten users!</div>
          </div>

          <div id="ld-all-grid">
            {players.map((player, index) => {
              return (
                <div
                  id="ld-all-grid-item"
                  key={index}
                  className={player.username === username ? "highlight-user" : ""} // Highlight if current user
                >
                  <div id="ld-grid-hbox">
                    <div id="ld-all-rank-icon">{getRankEmote(index)}</div>

                    <div id="ld-all-pfp-icon">
                      {player.username.charAt(0).toUpperCase()}
                    </div>

                    {/* PLAYER USERNAME*/}
                    <div id="ld-user-stats">{player.username}</div>
                    <small id="leaderboard-user-points">({player.points || 0} PicoBits)</small>
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
            <div id="ld-all-user-icon">{username.charAt(0).toUpperCase()}</div>
            {username}
          </div>
          <div id="ld-all-user-stats-vbox">
            <div id="ld-all-user-stats-hbox">
              {/* Points */}
              <div className="stat-item">
                <div className="stat-icon">👾</div>
                <div className="stat-value">{playerStats[uid]?.points || 0}</div>
                <div className="stat-label">Bytes</div>
              </div>

              {/* Streak */}
              <div className="stat-item">
                <div className="stat-icon">🔥</div>
                <div className="stat-value">{playerStats[uid]?.streak || 0}</div>
                <div className="stat-label">Streaks</div>
              </div>

              {/* Completed */}
              <div className="stat-item">
                <div className="stat-icon">⭐</div>
                <div className="stat-value">10/50</div>
                <div className="stat-label">Completed</div>
              </div>
            </div>

            {/* Progress */}

            <div id="ld-all-user-goal-text">
              {100 - progressValue} points left until next goal
            </div>
            <progress
              max="100"
              value={progressValue}
              id="lesson-prog-bar"
            ></progress>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Leaderboard_All;
