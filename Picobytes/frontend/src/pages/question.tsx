// The individual question and possibly feedback

import React from "react";
import { useState } from "react";

interface Prop {
  id: number;
}

const Question = ({ id }: Prop) => {
  const [answer, setAnswer] = useState([false, false, false, false]);

  const updateAnswer = (n: number) => {
    setAnswer(
      answer.map((a, j) => {
        if (n == j) {
          return !a;
        } else {
          return a;
        }
      })
    );
  };

  /// Hard coded example question

  const question = "Example Question"

  const options = [ 
    "Example answer 1",
    "Example answer 2",
    "Example answer 3",
    "Example answer 4",
  ];

  return (
    <div>
      <h1>{question}</h1>
      <br></br>
      <ul>
        {options.map((o, i) => (
          <li key={i}>
            <input type="checkbox" onClick={() => updateAnswer(i)} /> {o}
          </li>
        ))}
      </ul>
      <br></br>
      <button onClick={() => console.log(answer)}>Submit</button>
    </div>
  );
};

export default Question;
