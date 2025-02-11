// The individual question and possibly feedback

import React from "react";

const Question = () => {
  return (
    <div>
      <h1>Example Question</h1>
      <br></br>
      <select>
        <option key="1">Example answer 1</option>
        <option key="2">Example answer 2</option>
        <option key="3">Example answer 3</option>
      </select>
      <br></br>
      <br></br>
      <button>Submit</button>
    </div>
  );
};

export default Question;
