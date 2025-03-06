import React, { useState } from "react";
import './draggable_question.css'

const Draggable_Question = () => {
  const [answer, setAnswer] = useState<boolean[] | boolean | null>([false, false, false, false]);
  const [questionType, setQuestionType] = useState<string>("multiple_choice");
  const [correct, setCorrect] = useState<number | boolean>(0);
  const [options, setOptions] = useState([
    "Option 1",
    "Option 2",
    "Option 3",
    "Option 4",
    "Option 5",
    "Option 6",
    "Option 7",
    "Option 8",
    "Option 9",
    "Option 10",
  ]);
  const [error, setError] = useState("");
  const [difficulty, setDifficulty] = useState("");
  const [topic, setTopic] = useState("");
  const [totalQuestions, setTotalQuestions] = useState(0);
  const [draggedItem, setDraggedItem] = useState<HTMLElement | null>(null);
  const [questionText, setQuestionText] = useState("");
  const [questions, setQuestion] = useState(["Question 1", "A 2", "Question 3", "Question 4", "Question 5"]);
  

  const handleDragStart = (e: React.DragEvent<HTMLDivElement>, item: HTMLElement) => {
    setDraggedItem(item);
  };

  const handleDragOver = (e: React.DragEvent<HTMLDivElement>) => {
    e.preventDefault(); 
  };

  const handleDrop = (e: React.DragEvent<HTMLDivElement>) => {
    e.preventDefault();
    if (draggedItem) {
      e.currentTarget.appendChild(draggedItem);
      setDraggedItem(null);
    }
  };

  const questionPull = async (qid: number) => {
    try {
      const response = await fetch(`http://127.0.0.1:5000/api/question/${qid}`);
      const data = await response.json();
  
      if (data.error) throw new Error(data.error);
  
      console.log("Question data:", data);
      setQuestionText(data.question_text);
      setQuestionType(data.question_type);
      setDifficulty(data.question_level);
      setTopic(data.question_topic);
  
      if (data.question_type === "code_blocks") {
        setQuestion(
          [data.block1, data.block2, data.block3,
           data.block4, data.block5, data.block6,
           data.block7, data.block8, data.block9, data.block10].filter(Boolean)
        );
  
        setCorrect(data.answer ?? "");
      }
    } catch (err: any) {
      console.error("Error fetching question:", err.message);
      setError(err.message);
    }
  };
  
  

    return (
        <div className='container'>
          <div>
            THIS IS QUESTION _____ THIS IS QUESTION ______ THIS IS QUESTION _____ THIS IS QUESTION ______ THIS IS QUESTION _____ 
          </div>
          <div id="answer_input"  onDragOver={handleDragOver} onDrop={handleDrop}>
          </div>
          <div id="question_table" onDragOver={handleDragOver} onDrop={handleDrop}>
            {questions.map((question, index) => (
              <div
                key={index}
                className="question_drag"
                draggable
                onDragStart={(e) => handleDragStart(e, e.currentTarget)}
              >
                {question}
              </div>
            ))}
          </div>
          <button onClick={() => questionPull(8)}>Pull Question 1</button>
        </div>

       
    )
}

export default Draggable_Question


