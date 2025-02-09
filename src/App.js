import React, { useState } from 'react';
import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';
import Select from './Select'; 
import Captain from './Captain';
import Judge from './Judge';
import SecondManager from './SecondManager';
import SuperManager from './SuperManager';

function App() {
  const [showSelect, setShowSelect] = useState(true);

  const handleSelectCaptain = () => {
    setShowSelect(false);
  };

  

  return (
    <div className="App">
      <Router>
        {/* 根据 showSelect 状态决定是否渲染 Select 组件 */}
        {showSelect && <Select onSelectCaptain={handleSelectCaptain} />}
        <Routes>
          <Route path="/Captain" element={<Captain />} />
          <Route path="/Judge" element={<Judge />} />
          <Route path="/SecondManager" element={<SecondManager />} />
          <Route path="/SuperManager" element={<SuperManager />} />
        </Routes>
      </Router>
    </div>
  );
}

export default App;