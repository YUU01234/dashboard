'use client';

import React, { useState, useEffect } from 'react';

// This component properly handles window access on the client side only
const WindowSizeComponent = () => {
  const [windowWidth, setWindowWidth] = useState(0);

  useEffect(() => {
    // Setting initial value only on client-side
    setWindowWidth(window.innerWidth);
    
    // Adding event listener for window resize
    const handleResize = () => {
      setWindowWidth(window.innerWidth);
    };
    
    window.addEventListener('resize', handleResize);
    
    // Cleanup function to remove event listener
    return () => window.removeEventListener('resize', handleResize);
  }, []);

  return (
    <div>
      <p>Current window width: {windowWidth}px</p>
    </div>
  );
};

// Main page component
export default function ExamplePage() {
  return (
    <div className="p-4">
      <h1 className="text-2xl font-bold mb-4">Example Page</h1>
      <WindowSizeComponent />
    </div>
  );
}