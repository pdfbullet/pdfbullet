import React from 'react';
import ReactDOM from 'react-dom/client';
import { BrowserRouter, useNavigate } from 'react-router-dom';
import App from './App';

const rootElement = document.getElementById('root');
if (!rootElement) {
  throw new Error("Could not find root element to mount to");
}

const RedirectHandler = () => {
  const navigate = useNavigate();

  React.useEffect(() => {
    const path = sessionStorage.getItem("redirectPath");
    if (path) {
      sessionStorage.removeItem("redirectPath");
      navigate(path);
    }
  }, [navigate]);

  return null;
};

const root = ReactDOM.createRoot(rootElement);
root.render(
  <React.StrictMode>
    <BrowserRouter>
      <RedirectHandler />
      <App />
    </BrowserRouter>
  </React.StrictMode>
);
