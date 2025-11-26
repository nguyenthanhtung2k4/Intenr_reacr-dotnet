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
import Register from './component/account/register';
import Team from './component/Home/team';
import { LogoutButton } from './component/account/Logout';
import { useAuth } from './context/AuthContext';
import Accounts from './component/account/accounts';

function App() {
  const AuthConnext = useAuth();
  let Auth = AuthConnext.isAuthenticated;
  console.log('App : ', Auth);
  return (
    <div className="App">
      <Header title="Tungnt" description="I am study  React HIHI :)| CRUD" />
      {Auth && (
        <div className="isAuthFalse">
          <LogoutButton />
          <br />
          <Routes>
            <Route
              path="/"
              element={
                <BowlersTable
                  isAuth={Auth}
                  displayTeams={['tungnt', 'Sharks']}
                />
              }
            />

            <Route path="/bowler/:id" element={<BowlerForm />} />

            <Route path="/login" element={<Login />} />

            {/* account */}
            <Route path="/create-account" element={<Register />} />
            <Route path="/edit-account/:id" element={<Register />} />
            <Route path="/view-accounts" element={<Accounts />} />
            {/*Teams */}
            <Route path="/create-team" element={<CreateTeam />} />
            <Route path="/view-teams" element={<ViewTeams />} />
            <Route path="/team/:id" element={<Team />} />
            <Route path="/delete/:id" element={<Delete />} />
          </Routes>
        </div>
      )}
      {!Auth && (
        <div className="isAuthTrue">
          <LogoutButton />
          <br />
          <Routes>
            <Route
              path="/"
              element={
                <BowlersTable
                  isAuth={Auth}
                  displayTeams={['tungnt', 'Sharks']}
                />
              }
            />
            <Route path="/bowler/:id" element={<BowlerForm />} />

            <Route path="/login" element={<Login />} />
            <Route path="/view-teams" element={<ViewTeams />} />
            <Route path="/team/:id" element={<Team />} />
          </Routes>
        </div>
      )}
    </div>
  );
}

export default App;
