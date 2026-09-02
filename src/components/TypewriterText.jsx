import React, { useState, useEffect, useRef } from 'react';
import ReactMarkdown from 'react-markdown';

export const TypewriterText = ({ text, onComplete, speed = 30, isMarkdown = false }) => {
  const [displayedText, setDisplayedText] = useState("");
  const [isTyping, setIsTyping] = useState(true);
  const textRef = useRef(null);

  // Auto-scroll to bottom as text types
  useEffect(() => {
    if (textRef.current) {
      textRef.current.scrollTop = textRef.current.scrollHeight;
    }
  }, [displayedText]);

  useEffect(() => {
    setDisplayedText("");
    setIsTyping(true);
    let i = 0;

    const intervalId = setInterval(() => {
      setDisplayedText(text.substring(0, i + 1));
      i++;
      if (i >= text.length) {
        clearInterval(intervalId);
        setIsTyping(false);
        if (onComplete) onComplete();
      }
    }, speed);

    return () => clearInterval(intervalId);
  }, [text, speed]);

  const handleSkip = () => {
    if (isTyping) {
      setDisplayedText(text);
      setIsTyping(false);
      if (onComplete) onComplete();
    }
  };

  return (
    <div 
      ref={textRef}
      className="vn-message-text" 
      onClick={handleSkip} 
      style={{ cursor: isTyping ? 'pointer' : 'default' }}
    >
      {isMarkdown ? (
        <div className="vn-markdown-content">
          <ReactMarkdown
            components={{
              p: ({ node, ...props }) => <p style={{ marginBottom: '10px' }} {...props} />,
              strong: ({ node, ...props }) => <strong style={{ color: '#fbbf24', fontWeight: 800 }} {...props} />,
              ul: ({ node, ...props }) => <ul style={{ listStyleType: 'disc', paddingLeft: '20px', marginBottom: '10px' }} {...props} />,
              ol: ({ node, ...props }) => <ol style={{ listStyleType: 'decimal', paddingLeft: '20px', marginBottom: '10px' }} {...props} />,
              li: ({ node, ...props }) => <li style={{ marginBottom: '5px' }} {...props} />
            }}
          >
            {displayedText}
          </ReactMarkdown>
        </div>
      ) : (
        displayedText
      )}
    </div>
  );
};
