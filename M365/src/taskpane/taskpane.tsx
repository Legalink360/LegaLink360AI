import React from 'react';
import { createRoot } from 'react-dom/client';
import App from './App';
import './index.css';

Office.onReady((info) => {
  if (info.host === Office.HostType.Word || info.host === Office.HostType.Outlook) {
    const container = document.getElementById('root');
    if (container) {
      const root = createRoot(container);
      root.render(<App />);
    }
  }
});


