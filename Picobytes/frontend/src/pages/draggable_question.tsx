import React, { useState, useEffect } from "react";
import { useParams } from "react-router";
import './draggable_question.css';

interface DraggableQuestionProps {
  onUpdateAnswer: (ids: string[]) => void; // Callback prop to send IDs to parent
}

const Draggable_Question = ({ onUpdateAnswer }: DraggableQuestionProps) => {
  const [draggedItem, setDraggedItem] = useState<HTMLElement | null>(null);
  const [questionText, setQuestionText] = useState("");
  const [questions, setQuestions] = useState<string[]>([]);
  const [draggedWords, setDraggedWords] = useState<string[]>([]);

  let params = useParams();
  let id: any = params.id;

  const handleDragStart = (e: React.DragEvent<HTMLDivElement>, item: HTMLElement) => {
    setDraggedItem(item);
  };

  const handleDragOver = (e: React.DragEvent<HTMLDivElement>) => {
    e.preventDefault();
  };

  const handleDrop = (e: React.DragEvent<HTMLDivElement>) => {
    e.preventDefault();
    if (draggedItem) {
      const draggedText = draggedItem.textContent || "";

      if (e.currentTarget.id === "question_table") {
        setDraggedWords((prevWords) => prevWords.filter((word) => word !== draggedText));
      } else {
        setDraggedWords((prevWords) => [...prevWords, draggedText]);
      }

      e.currentTarget.appendChild(draggedItem);
      setDraggedItem(null);

      // Update the parent with the new IDs
      const ids = getAnswerTableIds();
      console.log("Updated IDs:", ids);
      onUpdateAnswer(ids); // Send updated IDs to parent
    }
  };

  const getAnswerTableIds = (): string[] => {
    const answerInputDiv = document.getElementById("answer_input");
    if (!answerInputDiv) {
      console.error("Answer input div not found");
      return [];
    }

    const childDivs = Array.from(answerInputDiv.children) as HTMLElement[];
    const ids = childDivs.map((child) => child.id).filter((id) => id);
    return ids;
  };

  const questionPull = async (qid: number) => {
    try {
      const response = await fetch(`http://127.0.0.1:5000/api/question/${qid}`);
      const data = await response.json();

      if (data.error) throw new Error(data.error);

      setQuestionText(data.question_text);

      let questions = [
        data.block1,
        data.block2,
        data.block3,
        data.block4,
        data.block5,
        data.block6,
        data.block7,
        data.block8,
        data.block9,
        data.block10,
      ];
      questions = questions.filter((item) => item !== "-1000");

      setQuestions(questions);
    } catch (err: any) {
      console.error("Error fetching question:", err.message);
    }
  };

  useEffect(() => {
    questionPull(id);
  }, [id]);

  return (
    <div className="container">
      <div>{questionText ? questionText : "NO QUESTION LOADED"}</div>
      <div id="dragged_words_display">
        {draggedWords.length > 0 ? draggedWords.join(" ") : "No words dragged yet."}
      </div>
      <div id="answer_input" onDragOver={handleDragOver} onDrop={handleDrop}></div>
      <div id="question_table" onDragOver={handleDragOver} onDrop={handleDrop}>
        {questions.map((question, index) => (
          <div
            key={index}
            className="question_drag"
            draggable
            id={`${index + 1}`}
            onDragStart={(e) => handleDragStart(e, e.currentTarget)}
          >
            {question}
          </div>
        ))}
      </div>
    </div>
  );
};

export default Draggable_Question;


