// import React from "react";
import { useParams } from "react-router";
import "./free_response.css";
import { useState } from "react";

const FreeResonse = () => {
  const [response, updateResponse] = useState("");
  const q = useParams().id;
  return (
    <>
      <h1>Sample Question</h1>
      <p>Question id: {q}</p>
      <textarea
        onChange={(e) => updateResponse(e.target.value)}
        rows={10}
        placeholder="type your short response here"
      ></textarea>
      <br></br>
      <button onClick={() => console.log(response)}>Submit</button>
      <button>Next Question</button>
    </>
  );
};

export default FreeResonse;
