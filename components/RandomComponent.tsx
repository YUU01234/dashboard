 'use client';

import React from 'react';

const RandomComponent = () => {
  // Instead of using Math.random() directly in the render
  // We use a state variable set in useEffect
  const [randomValue, setRandomValue] = React.useState<number | null>(null);

  React.useEffect(() => {
    // Only generate random values on the client
    setRandomValue(Math.random());
  }, []);

  return (
    <div>
      {/* Only show the value once component is mounted on client */}
      {randomValue !== null ? (
        <p>Random value: {randomValue}</p>
      ) : (
        <p>Loading...</p>
      )}
    </div>
  );
};

export default RandomComponent;