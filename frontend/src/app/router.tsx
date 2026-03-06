import React from 'react';
import { Navigate, Route, Routes, useParams } from 'react-router-dom';
import LoginPage from '../modules/auth/pages/LoginPage';
import LogoutPage from '../modules/auth/pages/LogoutPage';
import AccountListPage from '../modules/accounts/pages/AccountListPage';
import AccountFormPage from '../modules/accounts/pages/AccountFormPage';
import AccountDetailPage from '../modules/accounts/pages/AccountDetailPage';
import LivePage from '../modules/league/pages/LivePage';
import TournamentListPage from '../modules/league/pages/TournamentListPage';
import TournamentDetailPage from '../modules/league/pages/TournamentDetailPage';
import MatchListPage from '../modules/league/pages/MatchListPage';
import StandingsPage from '../modules/league/pages/StandingsPage';
import TeamListPage from '../modules/teams/pages/TeamListPage';
import TeamDetailPage from '../modules/teams/pages/TeamDetailPage';
import BowlerListPage from '../modules/bowlers/pages/BowlerListPage';
import BowlerFormPage from '../modules/bowlers/pages/BowlerFormPage';

function RedirectTournamentDetail() {
  const { id } = useParams();
  return <Navigate to={`/league/tournaments/${id}`} replace />;
}

function RedirectEditAccount() {
  const { id } = useParams();
  return <Navigate to={`/accounts/${id}/edit`} replace />;
}

function RedirectTeamDetail() {
  const { id } = useParams();
  return <Navigate to={`/teams/${id}`} replace />;
}

function RedirectBowlerEdit() {
  const { id } = useParams();
  return <Navigate to={`/bowlers/${id}/edit`} replace />;
}

function RedirectAccountDetail() {
  const { id } = useParams();
  return <Navigate to={`/accounts/${id}`} replace />;
}

export default function AppRouter() {
  return (
    <Routes>
      <Route path="/" element={<Navigate to="/league/live" replace />} />

      <Route path="/league/live" element={<LivePage />} />
      <Route path="/league/tournaments" element={<TournamentListPage />} />
      <Route path="/league/tournaments/:id" element={<TournamentDetailPage />} />
      <Route path="/league/matches" element={<MatchListPage />} />
      <Route path="/league/standings" element={<StandingsPage />} />

      <Route path="/auth/login" element={<LoginPage />} />
      <Route path="/auth/logout" element={<LogoutPage />} />

      <Route path="/accounts" element={<AccountListPage />} />
      <Route path="/accounts/new" element={<AccountFormPage />} />
      <Route path="/accounts/:id/edit" element={<AccountFormPage />} />
      <Route path="/accounts/:id" element={<AccountDetailPage />} />

      <Route path="/teams" element={<TeamListPage />} />
      <Route path="/teams/:id" element={<TeamDetailPage />} />

      <Route path="/bowlers" element={<BowlerListPage />} />
      <Route path="/bowlers/new" element={<BowlerFormPage />} />
      <Route path="/bowlers/:id/edit" element={<BowlerFormPage />} />

      <Route path="/fixtures" element={<Navigate to="/league/matches" replace />} />
      <Route path="/tournaments" element={<Navigate to="/league/tournaments" replace />} />
      <Route path="/tournaments/:id" element={<RedirectTournamentDetail />} />
      <Route path="/standings" element={<Navigate to="/league/standings" replace />} />
      <Route path="/login" element={<Navigate to="/auth/login" replace />} />
      <Route path="/logout" element={<Navigate to="/auth/logout" replace />} />
      <Route path="/view-accounts" element={<Navigate to="/accounts" replace />} />
      <Route path="/register" element={<Navigate to="/accounts/new" replace />} />
      <Route path="/create-account" element={<Navigate to="/accounts/new" replace />} />
      <Route path="/edit-account/:id" element={<RedirectEditAccount />} />
      <Route path="/team/:id" element={<RedirectTeamDetail />} />
      <Route path="/view-teams" element={<Navigate to="/teams" replace />} />
      <Route path="/stats" element={<Navigate to="/bowlers" replace />} />
      <Route path="/bowler/new" element={<Navigate to="/bowlers/new" replace />} />
      <Route path="/bowler/:id" element={<RedirectBowlerEdit />} />
      <Route path="/account/:id" element={<RedirectAccountDetail />} />
      <Route path="/create-team" element={<Navigate to="/teams" replace />} />
      <Route path="/delete/:id" element={<Navigate to="/bowlers" replace />} />

      <Route path="*" element={<Navigate to="/league/live" replace />} />
    </Routes>
  );
}
