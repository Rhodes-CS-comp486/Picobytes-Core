import React, { useState } from "react";
import './draggable_question.css'

const Draggable_Question = () => {
  const [draggedItem, setDraggedItem] = useState<HTMLElement | null>(null);
  const questions = ["Question 1", "A 2", "Question 3", "Question 4", "Question 5"];
  

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
      const response = await fetch(`http://localhost:5000/api/questions`, {
        method: "GET",
        headers: {
          "Content-Type": "application/json",
        },
      });

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.error || "Failed to get questions");
      }

      console.log(data.mc[0]);
    } catch (err: any) {
      console.error(err.message);
    }
  }

    


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
          <button onClick={() => questionPull(1)}>Pull Question 1</button>
        </div>

       
    )
}

export default Draggable_Question


