import React, { useState, useEffect } from "react";
import { useParams } from "react-router-dom";

const Question = () => {
  const [question, setQuestion] = useState<string>("");
  const [options, setOptions] = useState<string[]>([]);
  const [answer, setAnswer] = useState<boolean[]>([]);
  let { id } = useParams<{ id: string }>();

  useEffect(() => {
    // Fetch the question data from the backend
    fetch(`/api/questions/${id}`)
      .then((response) => response.json())
      .then((data) => {
        console.log("Fetched data:", data); // Add logging
        if (data.error) {
          console.error("Error fetching question:", data.error);
        } else {
          setQuestion(data.qtext);
          setOptions(data.options);
          setAnswer(new Array(data.options.length).fill(false));
        }
      })
      .catch((error) => console.error("Error fetching question:", error));
  }, [id]);

  const updateAnswer = (n: number) => {
    setAnswer(
      answer.map((a, j) => {
        if (n === j) {
          return !a;
        } else {
          return a;
        }
      })
    );
  };

  return (
    <div>
      <h1>{question}</h1>
      <p>Question ID: {id}</p>
      <br />
      <ul>
        {options.map((o, i) => (
          <li key={i}>
            <input type="checkbox" onClick={() => updateAnswer(i)} /> {o}
          </li>
        ))}
      </ul>
      <br />
      <button onClick={() => console.log(answer)}>Submit</button>
    </div>
  );
};

export default Question;