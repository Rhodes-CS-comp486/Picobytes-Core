import { useState, useEffect } from "react";
import { useNavigate, useLocation } from "react-router-dom";
import Home_Header from "./home_header";
import Home_Prof_Overlay from "./home_prof_overlay";
import "./home.css";

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

// Type definitions for topic icons mapping
interface TopicIcons {
  [key: string]: string;
}

// Interface for the header component props
interface HeaderProps {
  toggleOverlay: () => void;
}

// Interface for the overlay component props
interface OverlayProps {
  toggleOverlay: () => void;
}

/// MAIN CONTENT ////////////////////////////////////

const Homepage = ({ toggleDark }: Prop) => {
  /// CONSTANTS ///////////////////////////////////////
  const [playerStats, setPlayerStats] = useState<{ [key: string]: PlayerStats }>({});
  const [players, setPlayers] = useState<Player[]>([]);

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
  const getButtonPosition = (index: number) => {
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

  const goToQuestion = (id: number) => {
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

  // Get topic icon for display
  const getTopicIcon = (topic: string): string => {
    const icons: TopicIcons = {
      "C Basics": "🔤",
      "C Functions": "🧩",
      "C Memory Management": "💾",
      "Linux": "🐧",
      "Programming": "💻",
    };
    
    // Default icon if topic not found
    return icons[topic] || "📚";
  };

  /// MAIN CONTENT ///

  return (
    <div className="home-container">
      <Home_Header toggleOverlay={() => setShowOverlay(!showOverlay)} />
      {showOverlay && <Home_Prof_Overlay toggleOverlay={() => setShowOverlay(!showOverlay)} />}
      
      <div className="welcome-section">
        <h1 className="welcome-heading">{getGreeting()}, {username}!</h1>
        
        <div className="card stats-card">
          <div className="stats-grid">
            <div className="stat-item">
              <div className="stat-icon">🔥</div>
              <div className="stat-value">{streak}</div>
              <div className="stat-label">Day Streak</div>
            </div>
            <div className="stat-item">
              <div className="stat-icon">⭐</div>
              <div className="stat-value">{points}</div>
              <div className="stat-label">Points</div>
            </div>
            <div className="stat-item">
              <div className="stat-icon">📚</div>
              <div className="stat-value">{Object.keys(topicProgress).length}</div>
              <div className="stat-label">Topics</div>
            </div>
          </div>
        </div>
      </div>
      
      <div className="learning-path-section">
        <h2>Continue Learning</h2>
        <div className="topic-cards">
          {Object.entries(topicProgress).map(([topic, progress]) => (
            <div 
              key={topic} 
              className="card topic-card"
              onClick={() => navigate(`/practice?topic=${encodeURIComponent(topic)}`)}
            >
              <div className="topic-icon">{getTopicIcon(topic)}</div>
              <div className="topic-info">
                <h3>{topic}</h3>
                <div className="progress-bar">
                  <div 
                    className="progress-filled" 
                    style={{width: `${progress}%`}}
                  ></div>
                </div>
                <div className="progress-percentage">{progress}% complete</div>
              </div>
            </div>
          ))}
        </div>
        
        <button className="btn btn-primary" onClick={goToTopicSelection}>
          View All Topics
        </button>
      </div>
      
      <div className="card recent-questions-card">
        <h2>Recently Added Questions</h2>
        <div className="recent-questions-list">
          {/* Simulated recent questions */}
          <div className="question-item" onClick={() => goToQuestion(1)}>
            <div className="question-title">Question #1</div>
            <div className="question-preview">What is the output of printf("%d", 5/2)?</div>
          </div>
          <div className="question-item" onClick={() => goToQuestion(2)}>
            <div className="question-title">Question #2</div>
            <div className="question-preview">How do you declare a pointer to an integer in C?</div>
          </div>
          <div className="question-item" onClick={() => goToQuestion(3)}>
            <div className="question-title">Question #3</div>
            <div className="question-preview">What is the difference between malloc and calloc?</div>
          </div>
        </div>
        
        <button className="btn btn-secondary" onClick={goToAllQuestions}>
          Browse All Questions
        </button>
      </div>
    </div>
  );
};

export default Homepage;
