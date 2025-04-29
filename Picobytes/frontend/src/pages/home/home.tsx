import { useState, useEffect } from "react";
import { useNavigate, useLocation } from "react-router-dom";
import Home_Header from "./home_header";
import Home_Prof_Overlay from "./home_prof_overlay";
import "./home.css";
import SideBar from "./side_bar";
// import Questions from "../Questions";
import "../Questions.css";
// import QuestionStats from "../admin/components/QuestionStats";

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
  progress: number;
}

interface Player {
  username: string;
  uid: string;
}

interface QuestionData {
  questions: {
    // id, question, level, topic
    tf: [number, string, string, string][];
    // id, question, topic, op1, op2, op3, op4, answer_id, difficulty
    mc: [
      number,
      string,
      string,
      string,
      string,
      string,
      string,
      number,
      string
    ][];
    //qid, qlevel, qtext, qtopic
    fr: { qid: number; qlevel: string; qtext: string; qtopic: string }[];
    //qid, prompt, topic, difficulty, stuff - --
    cb: [number, string, string, string, string][];
  };
  total_questions: number;
}

interface Question {
  id: number;
  type: string;
  prompt: string;
  difficulty: string;
  topic: string;
  answered: boolean;
}

/// MAIN CONTENT ////////////////////////////////////

const Homepage = ({ toggleDark }: Prop) => {
  /// CONSTANTS ///////////////////////////////////////
  const [players, setPlayers] = useState<Player[]>([]);
  const [questionData, setQuestionData] = useState<QuestionData | null>(null);

  // Get username from localStorage with fallback
  const username = localStorage.getItem("username") || "Agent 41";
  const [answeredQuestions, setAnsweredQuestions] = useState(null);
  const [dailyAnswered, setDailyAnswered] = useState(0);
  const [streak, setStreak] = useState(-1);
  const [points, setPoints] = useState(-1);
  const [progress, setProgress] = useState(-1);
  const [questions, setQuestions] = useState<Question[]>([]);

  const navigate = useNavigate();
  const [showOverlay, setShowOverlay] = useState(false);
  const [topicProgress, setTopicProgress] = useState<Record<string, number>>(
    {}
  );
  const [isTopicsLoading, setIsTopicsLoading] = useState(true);

  const processQuestions = (qs: QuestionData) => {
    // Process Code Block Questions
    var qlist: Question[] = [];
    qs.questions.cb.forEach((q) => {
      const question: Question = {
        id: q[0],
        type: "Code Block",
        prompt: q[1],
        difficulty: q[3],
        topic: q[2],
        answered: (answeredQuestions || [-1]).includes(q[0]),
      };
      qlist = [...qlist, question];
    });
    // Process Free Response Questions
    qs.questions.fr.forEach((q) => {
      const question: Question = {
        id: q.qid,
        type: "Free Response",
        prompt: q.qtext,
        difficulty: q.qlevel,
        topic: q.qtopic,
        answered: (answeredQuestions || [-1]).includes(q[0]),
      };
      qlist = [...qlist, question];
    });

    // Process Mulitiple Choice Questions
    qs.questions.mc.forEach((q) => {
      const question: Question = {
        id: q[0],
        type: "Multiple Choice",
        prompt: q[1],
        difficulty: q[8],
        topic: q[2],
        answered: (answeredQuestions || [-1]).includes(q[0]),
      };
      qlist = [...qlist, question];
    });

    // Process True/False Questions
    qs.questions.tf.forEach((q) => {
      const question: Question = {
        id: q[0],
        type: "True False",
        prompt: q[1],
        difficulty: q[2],
        topic: q[3],
        answered: (answeredQuestions || [-1]).includes(q[0]),
      };
      qlist = [...qlist, question];
    });

    // sorting list (in order of ID)
    qlist = qlist.sort((a, b) => {
      return a.id - b.id;
    });

    setQuestions(qlist);
  };

  // Get user information
  useEffect(() => {
    fetch(
      "http://localhost:5000/api/get_user_stats/" + localStorage.getItem("uid")
    )
      .then((response) => response.json())
      .then((data) => {
        setStreak(data.streak);
        setPoints(data.points);
        setProgress(data.answered.length);
        setAnsweredQuestions(
          data.answered.map((a) => {
            console.log(a.qid);
            return a.qid;
          })
        );
      })
      .catch((error) => {
        console.error("Error getting user stats:", error);
      });
  }, []);

  //TODO: fetch daily goals
  useEffect(() => {
    fetch(
      `http://localhost:5000/api/daily_goals?uid=${localStorage.getItem("uid")}`
    )
      .then((response) => response.json())
      .then((data) => {
        setDailyAnswered(data.num_questions);
        // console.log(data);
      })
      .catch((e) => {
        console.error("Eror getting daily goals");
      });
  }, []);

  // Fetch both questions and topics data
  useEffect(() => {
    // Fetch total number of questions
    fetch("http://localhost:5000/api/questions")
      .then((response) => response.json())
      .then((data) => {
        setQuestionData(data);
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

        // console.log(topicsSet);

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

  useEffect(() => {
    if (questionData != null) {
      processQuestions(questionData);
    }
  }, [questionData]);

  const toggleOverlay = () => {
    setShowOverlay(!showOverlay);
  };

  const goToQuestion = (id: number) => {
    navigate(`/question/${id}`);
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

  const progresspercent = (
    (100 * progress) /
    questionData?.total_questions!
  ).toPrecision(2);

  return (
    <div className="duolingo-layout">
      {/* Mobile Menu is included in Header component */}
      <Home_Header toggleOverlay={toggleOverlay} />
      {showOverlay && <Home_Prof_Overlay />}

      <div className="home-content">

      <SideBar toggleDark={toggleDark}></SideBar>
        {/* Main Content */}
        <div className="main-content">
          {/* Enhanced Learning Path */}
          <div className="learning-path">
            <h1 className="welcome-heading">
              {getGreeting()}, {username}!
            </h1>

            <div className="daily-streak">
              <div className="daily-streak-title">
                <span className="streak-flame">🔥</span>
                Daily Streak
              </div>
              <div className="streak-days">{streak} days</div>
              <div className="progress-label">
                Your progress: {progresspercent}%
              </div>
              <div className="goal-progress-bar">
                <div
                  className="goal-progress-filled"
                  style={{ width: `${progresspercent}%` }}
                ></div>
              </div>
            </div>

            {/* MASCOT */}
            <div className="mascot-container">
              <div className="mascot-speech">
                {progress > 0
                  ? "Great progress! Ready to continue learning C programming?"
                  : "Ready to start learning C programming?"}
              </div>
              <div className="mascot-character">
                <img src="/logo.png"></img>
              </div>
            </div>

            <button
              className="start-learning-button"
              onClick={handleStartLearning}
            >
              {progress > 0 ? "CONTINUE" : "START"}
            </button>

            {/* QUESTIONS PATH */}
            <div id="home-questions-vscroll">
              <h1>All Question List</h1>
              <ul>
                {questions.map((q, i) => {
                  return (
                    <li
                      key={q.id}
                      className={
                        q.answered ? "answered-question-item" : "question-item"
                      }
                      onClick={() => goToQuestion(q.id)}
                    >
                      {q.answered ? "✓ " : ""}
                      {q.id}: {q.prompt}
                      <div className="question-info">
                        <div className="question-type">{q.type}</div>
                        <div className="difficulty-badge">{q.difficulty}</div>
                        <div className="topic-badge">{q.topic}</div>
                      </div>
                    </li>
                  );
                })}
              </ul>
            </div>
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
                  {progress}
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
              {/* <div className="view-all-link" onClick={goToAllQuestions}>
              VIEW ALL
            </div> */}
            </div>

            <div className="progress-percentage">{progresspercent}%</div>

            <div className="progress-bar">
              <div
                className="progress-filled"
                style={{ width: `${progresspercent}%` }}
              ></div>
            </div>

            <div className="progress-label">
              {progress} of {questionData?.total_questions} questions completed
            </div>
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
                      width: `${Math.min(100, (100 * dailyAnswered) / 5)}%`,
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
