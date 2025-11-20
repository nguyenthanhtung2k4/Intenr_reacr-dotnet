import React from 'react';
import './App.css';
import './index.css';
import Header from './Header';
import BowlersTable from './component/Home/BowlersTable';
import { Routes, Route } from 'react-router-dom';
import Delete from './component/Home/Delete';
import BowlerForm from './component/Home/BowlerForm';
import CreateTeam from './component/Home/createTeams';
import ViewTeams from './component/Home/viewTeam';
import Login from './component/account/Login';
import Team from './component/Home/team';
import { LogoutButton } from './component/account/Logout';

function App() {
  return (
    <div className="App">
      <Header title="Tungnt" description="I am study  React HIHI :)| CRUD" />
      <LogoutButton />

      <br />
      <Routes>
        <Route
          path="/"
          element={<BowlersTable displayTeams={['tungnt', 'Sharks']} />}
        />

        <Route path="/bowler/:id" element={<BowlerForm />} />

        <Route path="/login" element={<Login />} />

        <Route path="/create-team" element={<CreateTeam />} />
        <Route path="/view-teams" element={<ViewTeams />} />
        <Route path="/team/:id" element={<Team />} />
        <Route path="/delete/:id" element={<Delete />} />
      </Routes>
    </div>
  );
}

export default App;
