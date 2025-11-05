import React, { useState, useEffect } from 'react';
import { submitQuiz } from '../services/api';
import axios from 'axios';

export default function Quiz({ token, onResult }) {
  const [questions, setQuestions] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    // Fetch questions from backend API
    const fetchQuestions = async () => {
      try {
        const res = await axios.get('http://localhost:8080/api/quiz/questions', {
          headers: { Authorization: `Bearer ${token}` }
        });
        // Add isChecked property to each option for local state management
        const questionsWithCheck = res.data.map(q => ({
          ...q,
          options: q.options.map(o => ({ ...o, isChecked: false }))
        }));
        setQuestions(questionsWithCheck);
      } catch (err) {
        alert('Failed to load questions');
      } finally {
        setLoading(false);
      }
    };
    fetchQuestions();
  }, [token]);

  const handleCheck = (qid, oid) => {
    setQuestions((qs) =>
      qs.map((q) =>
        q.id === qid
          ? {
              ...q,
              options: q.options.map((o) =>
                o.id === oid ? { ...o, isChecked: !o.isChecked } : o
              ),
            }
          : q
      )
    );
  };

  const handleSubmit = async () => {
    const payload = {};
    questions.forEach((q) => {
      payload[q.id] = q.options.filter((o) => o.isChecked).map((o) => o.id);
    });
    try {
      const { data } = await submitQuiz(payload, token);
      onResult(data);
    } catch (err) {
      alert('Failed to submit quiz');
    }
  };

  if (loading) return <div>Loading questions...</div>;

  return (
    <div>
      <h2>Quiz</h2>
      {questions.map((q) => (
        <div key={q.id}>
          <p>{q.text}</p>
          {q.options.map((o) => (
            <label key={o.id}>
              <input
                type="checkbox"
                checked={o.isChecked}
                onChange={() => handleCheck(q.id, o.id)}
              />
              {o.text}
            </label>
          ))}
        </div>
      ))}
      <button onClick={handleSubmit}>Submit</button>
    </div>
  );
}
