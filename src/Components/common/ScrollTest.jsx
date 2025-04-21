import React from 'react';

const ScrollTest = () => {
  return (
    <div style={{ padding: '20px' }}>
      <h1>Scroll Test Page</h1>
      <p>This page is designed to test scrolling behavior.</p>
      
      {[...Array(30)].map((_, i) => (
        <div key={i} style={{ marginBottom: '100px' }}>
          <h2>Section {i + 1}</h2>
          <p>This is section {i + 1} of the test page.</p>
          <p>Scroll down to see more content and test the scroll-to-top button.</p>
        </div>
      ))}
    </div>
  );
};

export default ScrollTest; 