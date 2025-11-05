import React from 'react';

export default function Result({ result }) {
  return (
    <div>
      <h2>Your Score</h2>
      <p>{result.score} points</p>
    </div>
  );
}
