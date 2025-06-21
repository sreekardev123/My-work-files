import React from 'react';
import { Routes, Route } from 'react-router-dom';
import Bisform from './components/bisform/bisform';
import Paymentform from './components/paymentform/paymentform';
import Receiptform from './components/recepitform/receiptform';

const App = () => {
  return (
    <Routes>
      <Route path="/" element={<Bisform />} />
      <Route path="/paymentform" element={<Paymentform />} />
      <Route path="/receiptform" element={<Receiptform />} /> {/* spelling fixed */}
    </Routes>
  );
};

export default App;
