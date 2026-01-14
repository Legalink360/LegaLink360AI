import React from 'react';

interface ErrorDisplayProps {
  error?: string;
}

const ErrorDisplay: React.FC<ErrorDisplayProps> = ({ error }) => {
  return (
    <div>
      {error && <p>Error: {error}</p>}
      {/* Error display implementation */}
    </div>
  );
};

export default ErrorDisplay;


