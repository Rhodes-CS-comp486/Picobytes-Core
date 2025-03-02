// The individual question and possibly feedback

import React from "react";
import { useState, useEffect } from "react";
import { useNavigate, useParams } from "react-router";
import Home_Header from "./home/home_header";

const Question = () => {
  const [answer, setAnswer] = useState([false, false, false, false]);
  const [question, setQuestion] = useState("⬜⬜⬜⬜⬜⬜⬜⬜⬜⬜⬜⬜⬜⬜⬜?");
  const [correct, setCorrect] = useState(0);
  const [options, setOptions] = useState([
    "⬜⬜⬜⬜⬜⬜⬜⬜",
    "⬜⬜⬜⬜⬜⬜⬜⬜",
    "⬜⬜⬜⬜⬜⬜⬜⬜",
    "⬜⬜⬜⬜⬜⬜⬜⬜",
  ]);
  const [error, setError] = useState("");
  let params = useParams();
  let id = params.id;
  const navigate = useNavigate();

  useEffect(() => {
    fetch("http://127.0.0.1:5000/api/question/" + id, {
      method: "GET",
    })
      .then((response) => response.json())
      .then((data) => {
        if (data.error != null) throw data.error;
        setQuestion(data.question_text);
        setOptions([
          data.option_1,
          data.option_2,
          data.option_3,
          data.option_4,
        ]);
        setCorrect(data.answer);
        // setLoading(false);
      })
      // setTopic(data.question_topic);
      // setDifficulty(data.question_level);
      .catch((error) => {
        console.error("error fetching multiple choice questions: ", error);
        setError(error);
      });
  }, [id]);

  const navToQuestion = (qid: number) => {
    navigate("/question/" + qid);
    setCorrect(0);
    setOptions([
      "⬜⬜⬜⬜⬜⬜⬜⬜",
      "⬜⬜⬜⬜⬜⬜⬜⬜",
      "⬜⬜⬜⬜⬜⬜⬜⬜",
      "⬜⬜⬜⬜⬜⬜⬜⬜",
    ]);
    setQuestion("⬜⬜⬜⬜⬜⬜⬜⬜⬜⬜⬜⬜⬜⬜⬜?");
    setError("");
  };

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

  const checkCorrect = () => {
    return answer
      .map((v, i) => {
        if (i == correct - 1) {
          return v;
        } else {
          return !v;
        }
      })
      .every((i) => i);
  };

  if (error != "") {
    return (
      <>
        <h1>Error: {error}</h1>
        <p>Question ID: {id}</p>
        <button onClick={() => navToQuestion(parseInt(id!) - 1)}>&lt;</button>
        <button onClick={() => navToQuestion(parseInt(id!) + 1)}>&gt;</button>
      </>
    );
  } else {
    return (
      <div>
        <Home_Header />
        <h1>{question}</h1>
        <p>Question ID: {id} </p>
        <br></br>
        <ul>
          {options.map((o, i) => (
            <li key={i}>
              <input type="checkbox" onClick={() => updateAnswer(i)} /> {o}
            </li>
          ))}
        </ul>
        <br></br>
        <button onClick={() => navToQuestion(parseInt(id!) - 1)}>&lt;</button>
        <button
          onClick={() => {
            checkCorrect()
              ? console.log("Correct!")
              : console.log(
                  "Wrong. The correct answer was: " + options[correct - 1]
                );
          }}
        >
          Submit
        </button>
        <button onClick={() => navToQuestion(parseInt(id!) + 1)}>&gt;</button>
      </div>
    );
  }
};

export default Question;
