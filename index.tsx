import React from 'react';
import ReactDOM from 'react-dom/client';
import App from './App';

const rootElement = document.getElementById('root');

if (!rootElement) {
  console.error("Erro: Elemento root não encontrado no HTML.");
} else {
  const root = ReactDOM.createRoot(rootElement);
  root.render(<App />);
}
