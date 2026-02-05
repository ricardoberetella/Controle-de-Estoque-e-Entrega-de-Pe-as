import React from 'react';
import ReactDOM from 'react-dom/client';
import App from './App';

// O Firebase Realtime Database precisa que o root esteja limpo antes da renderização
const rootElement = document.getElementById('root');

if (!rootElement) {
  throw new Error("Não foi possível encontrar o elemento root para montar a aplicação.");
}

const root = ReactDOM.createRoot(rootElement);

// Renderização simples para evitar conflitos de duplicidade de chamadas ao Firebase no StrictMode durante o desenvolvimento
root.render(
  <App />
);
