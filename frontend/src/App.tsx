import React from 'react';
import './App.css';
import Header from './Header';
import BowlersTable from './component/Home/BowlersTable';
import { Routes, Route } from 'react-router-dom';
import Edit from './component/Home/Edit';

function App() {
  // const Team = ['Marlins', 'Sharks', 'Terrapins', 'Barracudas', 'Dolphins'];
  return (
    <div className="App">
      <Header title="Tungnt" description="I am study  React HIHI :)| CRUD" />
      <br />
      {/* <BowlersTable displayTeams={['Marlins', 'Sharks']} /> */}
      <Routes>
        <Route
          path="/"
          element={<BowlersTable displayTeams={['Marlins', 'Sharks']} />}
        />
        <Route path="/edit/:id" element={<Edit />} />
      </Routes>
    </div>
  );
}

export default App;
