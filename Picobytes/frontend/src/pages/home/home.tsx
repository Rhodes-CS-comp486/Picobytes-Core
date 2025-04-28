import { useState, useEffect } from "react";
import { useNavigate, useLocation } from "react-router-dom";
import Home_Header from "./home_header";
import Home_Prof_Overlay from "./home_prof_overlay";
import "./home.css";
import SideBar from "./side_bar";
import { useSidebar } from "./side_bar_context";

interface Prop {
  toggleDark: () => void;
}

// Define interfaces for topic data
interface Topic {
  name: string;
  progress: number;
}

interface PlayerStats {
  streak: number;
  points: number;
}

interface Player {
  username: string;
  uid: string;
}

/// MAIN CONTENT ////////////////////////////////////

const Homepage = ({ toggleDark }: Prop) => {
  /// CONSTANTS ///////////////////////////////////////
  const { isVisible } = useSidebar();

  //const [playerStats, setPlayerStats] = useState<{ [key: string]: PlayerStats }>({});
  //const [players, setPlayers] = useState<Player[]>([]);

  // Get username from localStorage with fallback
  const username = localStorage.getItem("username") || "Agent 41";
  const uid = localStorage.getItem("uid") || "pvCYNLaP7Z";

  const location = useLocation();
  const queryParams = new URLSearchParams(location.search);
  const [lessonNumber, setLessonNumber] = useState<string | null>(null);
  const [answeredQuestions, setAnsweredQuestions] = useState<string | null>(
    null
  );
  const [streak, setStreak] = useState(-1);
  const [points, setPoints] = useState(-1);
  // Function to apply the S-curve positioning
  const getButtonPosition = (index) => {
    // Calculate S-curve path
    const curveOffset = 10; // Height offset for each curve step
    const maxCurveOffset = 70; // Maximum offset (how wide the curve should be)
    
    // Using Math.sin to create the S-curve effect
    const curveY = Math.sin(index * 0.3) * curveOffset; // Adjust the multiplier for curve tightness
    const curveX = Math.cos(index * 0.3) * maxCurveOffset; // Slight horizontal offset to make it more pronounced

    return { transform: `translateY(${curveY}px) translateX(${curveX}px)` };
  };


  useEffect(() => {
    const lessonFromURL = queryParams.get("lesson");
    const answeredFromURL = queryParams.get("answered");

    if (lessonFromURL) {
      setLessonNumber(lessonFromURL);
    }
    if (answeredFromURL) {
      setAnsweredQuestions(answeredFromURL);
    }
  }, [location]);

  const navigate = useNavigate();
  const [showOverlay, setShowOverlay] = useState(false);
  const [questionStats, setQuestionStats] = useState({
    totalQuestions: 0,
    completedQuestions: 0,
  });
  // Initialize with empty object, will be populated from API
  const [topicProgress, setTopicProgress] = useState<Record<string, number>>(
    {}
  );
  const [isTopicsLoading, setIsTopicsLoading] = useState(true);


  // Get user information
  useEffect(() => {
    fetch(
      "http://localhost:5000/api/get_user_stats/" + localStorage.getItem("uid")
    )
      .then((response) => response.json())
      .then((data) => {
        setStreak(data.streak);
        setPoints(data.points);
      })
      .catch((error) => {
        console.error("Error getting user stats:", error);
      });
  }, []);

  // Fetch both questions and topics data
  useEffect(() => {
    // Fetch total number of questions
    fetch("http://localhost:5000/api/questions")
      .then((response) => response.json())
      .then((data) => {
        setQuestionStats({
          totalQuestions: data.total_questions,
          // For demo purposes, assume 25% of questions are completed
          completedQuestions: Math.floor(data.total_questions * 0.25),
        });
      })
      .catch((error) => {
        console.error("Error fetching total questions:", error);
      });

    // Fetch topics from the database
    fetch("http://localhost:5000/api/topics")
      .then((response) => response.json())
      .then((data) => {
        // Extract unique topics from the questions
        const topicsSet = new Set();
        const topicProgressData: Record<string, number> = {};

        // Extract unique topics from the data
        data.forEach((topic: string) => {
          if (!topicsSet.has(topic)) {
            topicsSet.add(topic);
            topicProgressData[topic] = 0; // Initialize progress to 0
          }
        });

        console.log(topicsSet);

        // If no topics are found, use fallback topics
        if (Object.keys(topicProgressData).length === 0) {
          setTopicProgress({
            "C Basics": 60,
            "C Functions": 45,
            "C Memory Management": 30,
            Linux: 20,
            Programming: 10,
          });
        } else {
          // Assign some random progress for now (this would normally come from user data)
          for (const topic of Object.keys(topicProgressData)) {
            // Random progress between 10 and 80
            topicProgressData[topic] = Math.floor(Math.random() * 70) + 10;
          }
          setTopicProgress(topicProgressData);
        }
        setIsTopicsLoading(false);
      })
      .catch((error) => {
        console.error("Error fetching topics:", error);
        // Fallback to hardcoded topics in case of error
        setTopicProgress({
          "C Basics": 60,
          "C Functions": 45,
          "C Memory Management": 30,
          Linux: 20,
          Programming: 10,
        });
        setIsTopicsLoading(false);
      });
  }, []);

  /// PLAYER STATS ///
  useEffect(() => {
    const fetchPlayerStats = async () => {
      try {
        const response = await fetch(`http://localhost:5000/api/get_user_stats/${uid}`);
        const data = await response.json();
        if (response.status === 200 && data.streak !== undefined && data.points !== undefined) {
          setPlayerStats({ [uid]: { streak: data.streak, points: data.points } });
        } else {
          setPlayerStats({ [uid]: { streak: 0, points: 0 } });
        }
      } catch (error) {
        console.error(`Error fetching stats for ${uid}:`, error);
        setPlayerStats({ [uid]: { streak: 0, points: 0 } });
      }
    };
  
    fetchPlayerStats();
  }, [uid]);

  /// NAVS ///

  const toggleOverlay = () => {
    setShowOverlay(!showOverlay);
  };

  const goToQuestion = (id) => {
    navigate(`/question/${id}`);
  };

  const goToTopicSelection = () => {
    navigate("/practice");
  };

  const goToLessonProgress = () => {
    navigate("/lessons");
  };

  const goToAllQuestions = () => {
    navigate("/questions");
  };

  const handleLogout = () => {
    localStorage.removeItem("uid");
    localStorage.removeItem("username");
    navigate("/");
  };

  // Get greeting based on time of day
  const getGreeting = () => {
    const hour = new Date().getHours();
    if (hour < 12) return "Good morning";
    if (hour < 18) return "Good afternoon";
    return "Good evening";
  };

  // Topics list
  const topicsList = Object.keys(topicProgress);

  // Determine status of each topic (completed, current, locked)
  const getTopicStatus = (index) => {
    const topicName = topicsList[index];
    const progress = topicProgress[topicName] || 0;

    if (progress >= 100) return "completed";

    // Find the first incomplete topic
    const firstIncompleteTopic = topicsList.findIndex(
      (topic) => (topicProgress[topic] || 0) < 100
    );

    if (index === firstIncompleteTopic) return "current";
    if (index > firstIncompleteTopic) return "locked";

    return "completed"; // Fallback
  };

  // Handle start/continue learning button click
  const handleStartLearning = () => {
    // Find the first incomplete topic and navigate to it
    const firstIncompleteTopic = topicsList.findIndex(
      (topic) => (topicProgress[topic] || 0) < 100
    );

    if (firstIncompleteTopic >= 0) {
      goToQuestion(firstIncompleteTopic + 1);
    } else {
      goToQuestion(1); // If all complete, start from beginning
    }
  };

  // Calculate overall progress percentage
  const overallProgress =
    lessonNumber && answeredQuestions
      ? Math.round(Number(answeredQuestions) * 10)
      : 0;

  // Get topic icon or character for display
  const getTopicIcon = (topic) => {
    // Handle C programming related topics
    if (topic.includes("C Basics")) return "B";
    if (topic.includes("C Functions")) return "F";
    if (topic.includes("C Memory")) return "M";
    if (topic.toLowerCase() === "linux") return "L";
    if (topic.toLowerCase() === "programming") return "P";

    // For other topics, use first letter
    return topic.charAt(0).toUpperCase();
  };


  /// MAIN CONTENT ///

  return (
    <div className={`home-container ${isVisible ? "sidebar-expanded" : "sidebar-collapsed"}`}>
      {/* Mobile Menu is included in Header component */}
      <Home_Header toggleOverlay={toggleOverlay} />
      {showOverlay && <Home_Prof_Overlay />}

      <SideBar toggleDark={toggleDark}></SideBar>

      <div className="home-content">
        {/* Main Content */}
        <div className="main-content">
          {/*
          <div className="unit-header">
            <div className="unit-back" onClick={goToLessonProgress}>
              <span className="material-icon">←</span>
            </div>
            <div className="unit-info">
              <div className="unit-title">Lesson {lessonNumber}</div>
              <div className="unit-subtitle">See all lesson progress</div>
            </div>
            <div className="unit-actions">
              <button className="guidebook-button" onClick={goToAllQuestions}>
                <span className="material-icon">📖</span>
                <span>All Questions</span>
              </button>
            </div>
          </div>
          */}

          {/* Enhanced Learning Path */}
          <div className="learning-path">
            <h1 className="welcome-heading">
              {getGreeting()}, {username}!
            </h1>
            <div className="progress-info">
              <div className="progress-label">
                Your progress: {overallProgress}%
              </div>
              <div className="progress-bar">
                <div
                  className="progress-filled"
                  style={{ width: `${overallProgress}%` }}
                ></div>
              </div>
            </div>

            <div className="daily-streak">
              <div className="daily-streak-title">
                <span className="streak-flame">🔥</span>
                Daily Streak
              </div>
              <div className="streak-days">{streak} days</div>
            </div>

          
            {/*
            {isTopicsLoading ? (
              <div style={{ textAlign: "center", margin: "30px 0" }}>
                Loading topics...
              </div>
            ) : (
              <div className="topic-path-container">
                <div className="path-line"></div>
                <div className="topic-nodes">
                  {topicsList.map((topic, index) => {
                    const status = getTopicStatus(index);
                    const topicIcon = getTopicIcon(topic);
                    return (
                      <div
                        className="topic-node"
                        key={index}
                        onClick={() =>
                          status !== "locked" && goToQuestion(index + 1)
                        }
                      >
                        <div className={`node-circle ${status}`}>
                          {status === "completed"
                            ? "✓"
                            : status === "locked"
                            ? "🔒"
                            : topicIcon}
                        </div>
                        <div className="node-label">{topic}</div>
                      </div>
                    );
                  })}
                  <div className="treasure-chest">🏆</div>
                </div>
              </div>
            )}
              */}


            {/* MASCOT */}
            <div className="mascot-container">
              <div className="mascot-speech">
                {overallProgress > 0
                  ? "Great progress! Ready to continue learning C programming?"
                  : "Ready to start learning C programming?"}
              </div>
              <div className="mascot-character">🤖</div>
            </div>

            <button
              className="start-learning-button"
              onClick={handleStartLearning}
            >
              {overallProgress > 0 ? "CONTINUE" : "START"}
            </button>
            
            
            {/* QUESTIONS PATH */}
            <div id="home-questions-vscroll">
              {[...Array(questionStats.totalQuestions)].map((_, index) => {
                const questionId = index + 1;
                const isCompleted =
                  questionId <= questionStats.completedQuestions;

                // Get the dynamic positioning for each button
                const buttonPosition = getButtonPosition(index);

                return (
                  <div key={questionId} id="home-question-button-container" style={buttonPosition}>
                    <button
                      className={`home-question-button ${
                        isCompleted ? "completed" : ""
                      }`}
                      onClick={() => goToQuestion(questionId)}
                    >
                      <span className="home-question-text">{isCompleted ? "✓ " : ""}{questionId}</span>
                    </button>
                  </div>
                );
              })}
            </div>

            
            

        

            {/* All Questions Section */}
          {/*
            <div className="all-questions-section">
              <h2>All Questions</h2>
              <div className="questions-grid">
                {[...Array(questionStats.totalQuestions)].map((_, index) => {
                  const questionId = index + 1;
                  const isCompleted =
                    questionId <= questionStats.completedQuestions;

                  return (
                    <div key={questionId} className="question-button-container">
                      <button
                        className={`question-button ${
                          isCompleted ? "completed" : ""
                        }`}
                        onClick={() => goToQuestion(questionId)}
                      >
                        {isCompleted ? "✓ " : ""} Question {questionId}
                      </button>
                    </div>
                  );
                })}
                
              </div>
            </div> 
          */}
          </div>
        </div>

        {/* Right Sidebar */}
        <div className="right-sidebar">
          {/* User Profile Card */}
          <div className="user-profile-card">
            <div className="user-profile-header">
              <div className="user-avatar">
                {username.charAt(0).toUpperCase()}
              </div>
              <div className="user-info">
                <div className="user-name">{username}</div>
                <div className="user-level">Bronze</div>
              </div>
            </div>

            <div className="user-stats-container">
              <div className="stat-item">
                <div className="stat-icon">🏆</div>
                <div className="stat-value">{points}</div>
                <div className="stat-label">Points</div>
              </div>

              <div className="stat-item">
                <div className="stat-icon">🔥</div>
                <div className="stat-value">{streak}</div>
                <div className="stat-label">Day Streak</div>
              </div>

              <div className="stat-item">
                <div className="stat-icon">⭐</div>
                <div className="stat-value">
                  {
                    Object.keys(topicProgress).filter(
                      (topic) => topicProgress[topic] >= 100
                    ).length
                  }
                  {/* {questionStats.completedQuestions || -1} */}
                </div>
                <div className="stat-label">Completed</div>
              </div>
            </div>
          </div>

          {/* Overall Progress Section */}
          <div className="progress-section">
            <div className="section-header">
              <div className="section-title">Your Progress</div>
              <div className="view-all-link" onClick={goToAllQuestions}>
                VIEW ALL
              </div>
            </div>

            <div className="progress-percentage">{overallProgress}%</div>

            <div className="progress-bar">
              <div
                className="progress-filled"
                style={{ width: `${overallProgress}%` }}
              ></div>
            </div>

            <div className="progress-label">
              {answeredQuestions} of 10 questions completed
            </div>
          </div>

          {/* Topic Progress Section */}
          <div className="topic-progress-section">
            <div className="section-header">
              <div className="section-title">Topic Progress</div>
              <div className="view-all-link" onClick={goToTopicSelection}>
                VIEW
              </div>
            </div>

            {isTopicsLoading ? (
              <div style={{ textAlign: "center", padding: "20px 0" }}>
                Loading topics...
              </div>
            ) : (
              Object.entries(topicProgress).map(([topic, progress]) => (
                <div className="topic-item" key={topic}>
                  <div className="topic-header">
                    <div className="topic-name">
                      <div className="topic-icon">{getTopicIcon(topic)}</div>
                      {topic}
                    </div>
                    <div className="topic-percentage">{progress}%</div>
                  </div>
                  <div className="progress-bar">
                    <div
                      className="progress-filled"
                      style={{ width: `${progress}%` }}
                    ></div>
                  </div>
                </div>
              ))
            )}
          </div>

          {/* Daily Goals Section */}
          <div className="daily-goals-section">
            <div className="section-header">
              <div className="section-title">Daily Goals</div>
            </div>

            <div className="goal-item">
              <div className="goal-icon">📝</div>
              <div className="goal-details">
                <div className="goal-title">Complete 5 questions</div>
                <div className="goal-progress-bar">
                  <div
                    className="goal-progress-filled"
                    style={{
                      width: `${Math.min(
                        100,
                        (questionStats.completedQuestions / 5) * 100
                      )}%`,
                    }}
                  ></div>
                </div>
              </div>
            </div>

            <div className="goal-item">
              <div className="goal-icon">🎯</div>
              <div className="goal-details">
                <div className="goal-title">Study 2 topics</div>
                <div className="goal-progress-bar">
                  <div
                    className="goal-progress-filled"
                    style={{
                      width: `${Math.min(
                        100,
                        (Object.keys(topicProgress).filter(
                          (t) => topicProgress[t] > 0
                        ).length /
                          2) *
                          100
                      )}%`,
                    }}
                  ></div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Homepage;
