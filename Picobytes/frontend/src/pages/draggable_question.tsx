import React, { useState } from "react";
import './draggable_question.css'

const Draggable_Question = () => {
  const [draggedItem, setDraggedItem] = useState<HTMLElement | null>(null);

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


    return (
        <div className='container'>
          <div >
            THIS IS QUESTION _____ THIS IS QUESTION ______ THIS IS QUESTION _____ THIS IS QUESTION ______ THIS IS QUESTION _____ 
          </div>
          <div id="answer_input"  onDragOver={handleDragOver} onDrop={handleDrop}>
          </div>
          <div id="question_table" onDragOver={handleDragOver} onDrop={handleDrop}>
              <div className="question_drag" draggable onDragStart={(e) => handleDragStart(e, e.currentTarget)}>
              Question 1
              </div>
              <div className="question_drag" draggable onDragStart={(e) => handleDragStart(e, e.currentTarget)}>
              Question 2
              </div>
              <div className="question_drag" draggable onDragStart={(e) => handleDragStart(e, e.currentTarget)}>
              Question 3
              </div>
              <div className="question_drag" draggable onDragStart={(e) => handleDragStart(e, e.currentTarget)}>
              Question 4
              </div>
              <div className="question_drag" draggable onDragStart={(e) => handleDragStart(e, e.currentTarget)}>
              Question 5
              </div>
          </div>
        </div>

       
    )
}

export default Draggable_Question


