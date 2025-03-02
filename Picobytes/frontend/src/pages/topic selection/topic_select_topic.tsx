/* Topic Select Topic */

import { useEffect, useState } from "react";

import './topic_select.css'


const Topic_Select_Topic = () => {
    const [totalQuestions, setTotalQuestions] = useState(0)
    const [topics, setTopics]  = useState<string[]>([])

    const [selectedTopic, setSelectedTopic] = useState<string | null>(null)

    // State for filtered questions (topic)
    const [filteredQuestions, setFilteredQuestion] = useState<any[]>([])

    // State to store all questions from filtered
    const [allQuestions, setAllQuestions] = useState<any[]>([])

    // Fetch the questions
    useEffect(() => {
        fetch("http://localhost:5000/api/questions")
        .then((response) => response.json())
        .then((data) => {
            const questions = [...data.questions.tf, ...data.questions.mc];
            console.log("Questions: ", questions)

            const distinctTopics = [...new Set(questions.map((q) => q.qtopic))];
            console.log("Distinct Topics:", distinctTopics);  // Check topics

            setTopics(distinctTopics);
            setAllQuestions(questions); // Store all questions
            setTotalQuestions(data.total_questions);
        })
        .catch((error) => console.error("Error fetching questions:", error));
    }, []);

    // Handles topic selection and filter questions
    const handleTopic = (topic : string) => {
        setSelectedTopic(topic);

        // Filter questions by topic
        const filtered = allQuestions.filter((q) => q.qtopic === topic); 

        // Store filtered questions
        setFilteredQuestion(filtered)
    }


    return(
        <div id='main-wrap'>

            {/* LEFT */}
            <div id="ts-left">
                <h3>Total Questions: {totalQuestions}</h3>
                <div>
                {topics.length > 0 ? (
                    topics.map((topic, index) => (
                    <button
                        key={index}
                        onClick={() => handleTopic(topic)}
                        style={{
                        backgroundColor: selectedTopic === topic ? "#D3D3D3" : "#FFF",
                        }}
                    >
                        {topic}
                    </button>
                    ))
                ) : (
                    <p>No topics available</p>
                )}
                </div>
            </div>


            {/* RIGHT */}
            <div id="ts-right">
                <h3>Questions for {selectedTopic}</h3>
                {selectedTopic && filteredQuestions.length > 0 ? (
                <ul>
                    {filteredQuestions.map((question, index) => (
                    <li key={index}>{question.qtext}</li>
                    ))}
                </ul>
                ) : selectedTopic ? (
                <p>No questions available for this topic.</p>
                ) : (
                <p>Select a topic to see questions.</p>
                )}

            </div>

        </div>
    );
};
export default Topic_Select_Topic