import React from 'react';
import { BrowserRouter, Routes, Route } from 'react-router-dom';
import HomePage from './pages/HomePage';
import BattlePage from './pages/BattlePage';

function App() {
  return (
    <BrowserRouter>
      <Routes>
        <Route path="/" element={<HomePage />} />
        <Route path="/battle/:battleId" element={<BattlePage />} />
      </Routes>
    </BrowserRouter>
  );
}

export default App;
