import { useEffect, useMemo, useState } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import {
  fetchGlobalMatches,
  fetchLeagueStandings,
  fetchTeamBowlers,
  fetchTeams,
  fetchTournaments,
  softDeleteBowler,
  updateTeam,
} from '../../../core/api';
import { useAuth } from '../../../context/AuthContext';
import { Bowler } from '../../../types/Bowler';
import { MatchData } from '../../../types/Match';
import { StandingData } from '../../../types/Standing';
import type { Team as TeamType } from '../../../types/Team';
import { TournamentData } from '../../../types/Tournament';

const parseDate = (value: string): number => {
  const date = new Date(value);
  return Number.isNaN(date.getTime()) ? 0 : date.getTime();
};

const formatDate = (value: string): string => {
  const date = new Date(value);
  if (Number.isNaN(date.getTime())) return 'Unknown date';
  return date.toLocaleDateString('en-US', {
    year: 'numeric',
    month: 'short',
    day: '2-digit',
  });
};

const sortMatchesByNewest = (a: MatchData, b: MatchData): number => {
  const dateDiff = parseDate(b.tourneyDate) - parseDate(a.tourneyDate);
  if (dateDiff !== 0) return dateDiff;
  return b.matchId - a.matchId;
};

const sortTournamentsByNewest = (a: TournamentData, b: TournamentData): number => {
  const dateDiff = parseDate(b.tourneyDate) - parseDate(a.tourneyDate);
  if (dateDiff !== 0) return dateDiff;
  return b.tourneyId - a.tourneyId;
};

function TeamDetailPage() {
  const [bowlerData, setBowlerData] = useState<Bowler[]>([]);
  const [nameTeam, setNameTeam] = useState('Loading...');
  const [currentTeam, setCurrentTeam] = useState<TeamType | null>(null);
  const [teamMatches, setTeamMatches] = useState<MatchData[]>([]);
  const [teamTournaments, setTeamTournaments] = useState<TournamentData[]>([]);
  const [teamStanding, setTeamStanding] = useState<StandingData | null>(null);
  const [teamRank, setTeamRank] = useState<number | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  // Edit Team State
  const [showEditTeam, setShowEditTeam] = useState(false);
  const [editTeamName, setEditTeamName] = useState('');
  const [editCaptainId, setEditCaptainId] = useState<number | null>(null);

  const navigate = useNavigate();
  const { id } = useParams<{ id: string }>();
  const { isAuthenticated, role } = useAuth();
  const isAdmin = role === 'Admin';
  const teamId = useMemo(() => Number(id), [id]);

  useEffect(() => {
    if (!id || Number.isNaN(teamId)) {
      setError('Error: Team id is invalid.');
      setIsLoading(false);
      return;
    }

    const fetchData = async () => {
      try {
        setError(null);
        setIsLoading(true);

        const [bowlers, teams, matches, tournaments, standings] = await Promise.all([
          fetchTeamBowlers(id),
          fetchTeams(),
          fetchGlobalMatches(),
          fetchTournaments(),
          fetchLeagueStandings(),
        ]);
        setBowlerData(bowlers || []);

        const team = teams.find((t) => t.TeamId === teamId);
        if (team) {
          setCurrentTeam(team);
          setNameTeam(team.teamName);
          setEditTeamName(team.teamName);
          setEditCaptainId(team.captainId);
        } else if (bowlers.length > 0) {
          setNameTeam(bowlers[0].team?.teamName || 'Unknown Team');
        } else {
          setNameTeam('Team');
        }

        const filteredMatches = (matches || [])
          .filter((match) => match.oddLaneTeamId === teamId || match.evenLaneTeamId === teamId)
          .sort(sortMatchesByNewest);
        setTeamMatches(filteredMatches);

        const tournamentIds = new Set<number>();
        filteredMatches.forEach((match) => {
          if (typeof match.tourneyId === 'number') {
            tournamentIds.add(match.tourneyId);
          }
        });

        const filteredTournaments = (tournaments || [])
          .filter((tournament) => tournamentIds.has(tournament.tourneyId))
          .sort(sortTournamentsByNewest);
        setTeamTournaments(filteredTournaments);

        const standingRecord = standings.find((item) => item.teamId === teamId) ?? null;
        setTeamStanding(standingRecord);

        if (standingRecord) {
          const sortedStandings = [...standings].sort((a, b) => {
            if (b.points !== a.points) return b.points - a.points;
            if (b.won !== a.won) return b.won - a.won;
            return (b.totalPins || 0) - (a.totalPins || 0);
          });
          const rankIndex = sortedStandings.findIndex((item) => item.teamId === teamId);
          setTeamRank(rankIndex >= 0 ? rankIndex + 1 : null);
        } else {
          setTeamRank(null);
        }
      } catch (exception: unknown) {
        const message =
          exception instanceof Error ? exception.message : 'Failed to load team data.';
        setError(message);
        setNameTeam('Error');
      } finally {
        setIsLoading(false);
      }
    };

    void fetchData();
  }, [id, teamId]);

  const teamMatchSummary = useMemo(() => {
    if (Number.isNaN(teamId)) {
      return { completed: 0, won: 0, lost: 0, draw: 0, pending: 0 };
    }

    let completed = 0;
    let won = 0;
    let lost = 0;
    let draw = 0;

    teamMatches.forEach((match) => {
      const hasResult = Boolean(
        match.hasResult ||
        match.winningTeamId !== undefined ||
        match.oddLaneWins !== undefined ||
        match.evenLaneWins !== undefined,
      );
      if (!hasResult) return;

      completed += 1;

      if (typeof match.winningTeamId === 'number') {
        if (match.winningTeamId === teamId) won += 1;
        else lost += 1;
        return;
      }

      if (typeof match.oddLaneWins === 'number' && typeof match.evenLaneWins === 'number') {
        const isOddLaneTeam = match.oddLaneTeamId === teamId;
        const teamWins = isOddLaneTeam ? match.oddLaneWins : match.evenLaneWins;
        const opponentWins = isOddLaneTeam ? match.evenLaneWins : match.oddLaneWins;
        if (teamWins > opponentWins) won += 1;
        else if (teamWins < opponentWins) lost += 1;
        else draw += 1;
      }
    });

    return {
      completed,
      won,
      lost,
      draw,
      pending: Math.max(teamMatches.length - completed, 0),
    };
  }, [teamId, teamMatches]);

  const tournamentMatchCount = useMemo(() => {
    const counts = new Map<number, number>();
    teamMatches.forEach((match) => {
      if (typeof match.tourneyId !== 'number') return;
      counts.set(match.tourneyId, (counts.get(match.tourneyId) || 0) + 1);
    });
    return counts;
  }, [teamMatches]);

  const handleEdit = (bowlerId?: number) => {
    if (!bowlerId) {
      console.error('Invalid Bowler ID for edit:', bowlerId);
      return;
    }
    navigate(`/bowlers/${bowlerId}/edit`);
  };

  const handleDelete = async (bowlerId?: number) => {
    if (!bowlerId || !id) return;

    if (!window.confirm('Do you want to remove this bowler from active list?')) {
      return;
    }

    try {
      await softDeleteBowler(bowlerId);
      const data = await fetchTeamBowlers(id);
      setBowlerData(data || []);
      alert('Bowler removed successfully.');
    } catch (exception: unknown) {
      const message = exception instanceof Error ? exception.message : 'Unknown error';
      alert(`Delete failed: ${message}`);
    }
  };

  const handleUpdateTeam = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!currentTeam || !editTeamName.trim()) return;

    try {
      await updateTeam(currentTeam.TeamId, {
        teamName: editTeamName,
        captainId: editCaptainId,
      });

      setNameTeam(editTeamName);
      setCurrentTeam({ ...currentTeam, teamName: editTeamName, captainId: editCaptainId });
      setShowEditTeam(false);
      alert('Team updated successfully.');
    } catch (exception: unknown) {
      const message = exception instanceof Error ? exception.message : 'Unknown error';
      alert(`Update failed: ${message}`);
    }
  };

  const handleCancelEditTeam = () => {
    if (currentTeam) {
      setEditTeamName(currentTeam.teamName);
      setEditCaptainId(currentTeam.captainId);
    }
    setShowEditTeam(false);
  };

  const getOpponentName = (match: MatchData): string => {
    if (match.oddLaneTeamId === teamId) return match.evenLaneTeam;
    if (match.evenLaneTeamId === teamId) return match.oddLaneTeam;
    return 'Unknown Opponent';
  };

  const getTeamWinsInMatch = (match: MatchData): number | null => {
    if (typeof match.oddLaneWins !== 'number' || typeof match.evenLaneWins !== 'number') {
      return null;
    }
    return match.oddLaneTeamId === teamId ? match.oddLaneWins : match.evenLaneWins;
  };

  const getOpponentWinsInMatch = (match: MatchData): number | null => {
    if (typeof match.oddLaneWins !== 'number' || typeof match.evenLaneWins !== 'number') {
      return null;
    }
    return match.oddLaneTeamId === teamId ? match.evenLaneWins : match.oddLaneWins;
  };

  const renderResultBadge = (match: MatchData) => {
    const hasResult = Boolean(
      match.hasResult ||
      match.winningTeamId !== undefined ||
      match.oddLaneWins !== undefined ||
      match.evenLaneWins !== undefined,
    );
    if (!hasResult) {
      return (
        <span className="inline-flex rounded-full bg-slate-100 px-2 py-1 text-[10px] font-bold uppercase tracking-wider text-slate-500">
          Pending
        </span>
      );
    }

    const teamWins = getTeamWinsInMatch(match);
    const opponentWins = getOpponentWinsInMatch(match);
    const isWin =
      match.winningTeamId === teamId ||
      (teamWins !== null && opponentWins !== null && teamWins > opponentWins);
    const isDraw = teamWins !== null && opponentWins !== null && teamWins === opponentWins;

    if (isDraw) {
      return (
        <span className="inline-flex rounded-full bg-amber-100 px-2 py-1 text-[10px] font-bold uppercase tracking-wider text-amber-700">
          Draw
        </span>
      );
    }

    return isWin ? (
      <span className="inline-flex rounded-full bg-green-100 px-2 py-1 text-[10px] font-bold uppercase tracking-wider text-green-700">
        Win
      </span>
    ) : (
      <span className="inline-flex rounded-full bg-rose-100 px-2 py-1 text-[10px] font-bold uppercase tracking-wider text-rose-700">
        Loss
      </span>
    );
  };

  return (
    <div className="mt-32 min-h-screen bg-white pt-24 pb-12 px-6 font-sans text-slate-900">
      <div className="max-w-6xl mx-auto">
        {/* Header Section */}
        <div className="mb-12 flex flex-col md:flex-row md:items-end justify-between gap-6">
          <div className="relative flex-1">
            <div className="flex items-center gap-3 mb-10 text-blue-600 font-bold uppercase tracking-[0.3em] text-xs">
              <span className="w-8 h-px bg-blue-600"></span> Team Roster
              <span className="w-8 h-px bg-blue-600"></span>
            </div>
            <h1 className="text-5xl font-black italic tracking-tighter leading-none uppercase">
              <span className="p-3 bg-clip-text text-transparent bg-gradient-to-r from-blue-600 to-purple-600">
                {nameTeam}
              </span>
            </h1>
            {currentTeam && (
              <div className="mt-3 text-sm text-slate-600">
                <span className="font-bold">Captain: </span>
                {currentTeam.captainId
                  ? (() => {
                      const captain = bowlerData.find((b) => b.BowlerId === currentTeam.captainId);
                      return captain
                        ? `${captain.bowlerLastName}, ${captain.bowlerFirstName}`
                        : `ID #${currentTeam.captainId}`;
                    })()
                  : 'No Captain'}
              </div>
            )}
          </div>

          <div className="flex gap-3">
            {isAdmin && currentTeam && (
              <button
                onClick={() => setShowEditTeam(!showEditTeam)}
                className="group flex items-center gap-2 bg-blue-600 text-white font-bold px-6 py-3 rounded-full hover:bg-blue-700 transition-all text-sm uppercase tracking-wider shadow-md"
              >
                <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth={2}
                    d="M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5m-1.414-9.414a2 2 0 112.828 2.828L11.828 15H9v-2.828l8.586-8.586z"
                  />
                </svg>
                {showEditTeam ? 'Cancel' : 'Edit Team'}
              </button>
            )}
            <button
              onClick={() => navigate('/teams')}
              className="group flex items-center gap-2 bg-white border-2 border-slate-200 text-slate-700 font-bold px-6 py-3 rounded-full hover:bg-slate-50 transition-all text-sm uppercase tracking-wider shadow-sm"
            >
              <span className="group-hover:-translate-x-1 transition-transform">{'<-'}</span> Back
              to Teams
            </button>
          </div>
        </div>

        {error && (
          <div className="p-5 mb-8 bg-red-50 border-l-4 border-red-500 text-red-700 rounded-r-2xl font-bold shadow-sm">
            {error}
          </div>
        )}

        {/* Edit Team Form */}
        {showEditTeam && currentTeam && (
          <div className="bg-white p-6 rounded-2xl border-2 border-blue-200 shadow-lg mb-8 animate-fade-in-up">
            <h3 className="text-xl font-bold text-slate-900 mb-6 flex items-center gap-2">
              <svg
                className="w-5 h-5 text-blue-600"
                fill="none"
                stroke="currentColor"
                viewBox="0 0 24 24"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={2}
                  d="M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5m-1.414-9.414a2 2 0 112.828 2.828L11.828 15H9v-2.828l8.586-8.586z"
                />
              </svg>
              Edit Team Information
            </h3>
            <form onSubmit={handleUpdateTeam} className="space-y-5">
              <div>
                <label className="block text-sm font-bold text-slate-700 mb-2 uppercase tracking-wide">
                  Team Name
                </label>
                <input
                  type="text"
                  className="w-full px-4 py-3 border-2 border-slate-200 rounded-lg focus:border-blue-500 focus:outline-none font-medium transition-colors"
                  value={editTeamName}
                  onChange={(e) => setEditTeamName(e.target.value)}
                  required
                  placeholder="Enter team name"
                />
              </div>

              <div>
                <label className="block text-sm font-bold text-slate-700 mb-2 uppercase tracking-wide">
                  Team Captain
                </label>
                <select
                  className="w-full px-4 py-3 border-2 border-slate-200 rounded-lg focus:border-blue-500 focus:outline-none font-medium transition-colors"
                  value={editCaptainId || ''}
                  onChange={(e) => setEditCaptainId(e.target.value ? Number(e.target.value) : null)}
                >
                  <option value="">No Captain</option>
                  {bowlerData.map((bowler) => (
                    <option key={bowler.BowlerId} value={bowler.BowlerId}>
                      {bowler.bowlerLastName}, {bowler.bowlerFirstName}
                    </option>
                  ))}
                </select>
                <p className="mt-2 text-xs text-slate-500">
                  Select a team captain from the current roster
                </p>
              </div>

              <div className="flex gap-3 pt-4">
                <button
                  type="submit"
                  className="flex-1 bg-blue-600 text-white font-bold py-3 px-6 rounded-lg hover:bg-blue-700 transition-all uppercase tracking-wider shadow-md"
                >
                  Save Changes
                </button>
                <button
                  type="button"
                  onClick={handleCancelEditTeam}
                  className="flex-1 bg-slate-200 text-slate-700 font-bold py-3 px-6 rounded-lg hover:bg-slate-300 transition-all uppercase tracking-wider"
                >
                  Cancel
                </button>
              </div>
            </form>
          </div>
        )}

        {isLoading && !error ? (
          <div className="flex flex-col items-center justify-center py-24">
            <div className="animate-spin rounded-full h-12 w-12 border-4 border-slate-100 border-t-blue-600"></div>
            <p className="mt-4 text-slate-400 font-bold tracking-widest uppercase text-xs">
              Fetching athletes...
            </p>
          </div>
        ) : (
          <>
            <section className="mb-8 grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-4">
              <div className="rounded-2xl border border-slate-200 bg-white p-5 shadow-sm">
                <div className="text-[11px] font-bold uppercase tracking-widest text-slate-400">
                  Matches
                </div>
                <div className="mt-2 text-3xl font-black text-slate-900">{teamMatches.length}</div>
                <div className="mt-1 text-xs text-slate-500">
                  {teamMatchSummary.completed} completed, {teamMatchSummary.pending} pending
                </div>
              </div>
              <div className="rounded-2xl border border-slate-200 bg-white p-5 shadow-sm">
                <div className="text-[11px] font-bold uppercase tracking-widest text-slate-400">
                  Tournaments
                </div>
                <div className="mt-2 text-3xl font-black text-slate-900">
                  {teamTournaments.length}
                </div>
                <div className="mt-1 text-xs text-slate-500">Total events joined</div>
              </div>
              <div className="rounded-2xl border border-slate-200 bg-white p-5 shadow-sm">
                <div className="text-[11px] font-bold uppercase tracking-widest text-slate-400">
                  Points
                </div>
                <div className="mt-2 text-3xl font-black text-blue-600">
                  {teamStanding ? teamStanding.points : '-'}
                </div>
                <div className="mt-1 text-xs text-slate-500">Current league points</div>
              </div>
              <div className="rounded-2xl border border-slate-200 bg-white p-5 shadow-sm">
                <div className="text-[11px] font-bold uppercase tracking-widest text-slate-400">
                  League Rank
                </div>
                <div className="mt-2 text-3xl font-black text-slate-900">
                  {teamRank ? `#${teamRank}` : '-'}
                </div>
                <div className="mt-1 text-xs text-slate-500">Standings position</div>
              </div>
            </section>
            <section className="mb-8 grid grid-cols-1 gap-6 lg:grid-cols-2">
              <div className="rounded-2xl border border-slate-200 bg-white p-6 shadow-sm">
                <h2 className="text-lg font-black uppercase tracking-tight text-slate-900">
                  Ranking Snapshot
                </h2>
                {teamStanding ? (
                  <div className="mt-4 grid grid-cols-2 gap-4 text-sm">
                    <div className="rounded-xl bg-slate-50 p-3">
                      <div className="text-[10px] font-bold uppercase tracking-widest text-slate-500">
                        Played
                      </div>
                      <div className="mt-1 text-xl font-black text-slate-900">
                        {teamStanding.played}
                      </div>
                    </div>
                    <div className="rounded-xl bg-slate-50 p-3">
                      <div className="text-[10px] font-bold uppercase tracking-widest text-slate-500">
                        W / L
                      </div>
                      <div className="mt-1 text-xl font-black text-slate-900">
                        {teamStanding.won} / {teamStanding.lost}
                      </div>
                    </div>
                    <div className="rounded-xl bg-slate-50 p-3">
                      <div className="text-[10px] font-bold uppercase tracking-widest text-slate-500">
                        Total Pins
                      </div>
                      <div className="mt-1 text-xl font-black text-slate-900">
                        {(teamStanding.totalPins || 0).toLocaleString()}
                      </div>
                    </div>
                    <div className="rounded-xl bg-slate-50 p-3">
                      <div className="text-[10px] font-bold uppercase tracking-widest text-slate-500">
                        Average
                      </div>
                      <div className="mt-1 text-xl font-black text-slate-900">
                        {teamStanding.average ? Number(teamStanding.average).toFixed(2) : '-'}
                      </div>
                    </div>
                  </div>
                ) : (
                  <p className="mt-4 text-sm text-slate-500">
                    No standings data available for this team.
                  </p>
                )}
              </div>

              <div className="rounded-2xl border border-slate-200 bg-white p-6 shadow-sm">
                <h2 className="text-lg font-black uppercase tracking-tight text-slate-900">
                  Participation Summary
                </h2>
                <div className="mt-4 space-y-3 text-sm">
                  <div className="flex items-center justify-between rounded-xl bg-green-50 px-4 py-3">
                    <span className="font-bold text-green-700">Wins</span>
                    <span className="text-xl font-black text-green-700">
                      {teamMatchSummary.won}
                    </span>
                  </div>
                  <div className="flex items-center justify-between rounded-xl bg-rose-50 px-4 py-3">
                    <span className="font-bold text-rose-700">Losses</span>
                    <span className="text-xl font-black text-rose-700">
                      {teamMatchSummary.lost}
                    </span>
                  </div>
                  <div className="flex items-center justify-between rounded-xl bg-amber-50 px-4 py-3">
                    <span className="font-bold text-amber-700">Draws</span>
                    <span className="text-xl font-black text-amber-700">
                      {teamMatchSummary.draw}
                    </span>
                  </div>
                  <div className="flex items-center justify-between rounded-xl bg-slate-50 px-4 py-3">
                    <span className="font-bold text-slate-700">Pending</span>
                    <span className="text-xl font-black text-slate-700">
                      {teamMatchSummary.pending}
                    </span>
                  </div>
                </div>
              </div>
            </section>
            <section className="mb-8 overflow-hidden rounded-2xl border border-slate-200 bg-white shadow-sm">
              <div className="border-b border-slate-100 p-6">
                <h2 className="text-lg font-black uppercase tracking-tight text-slate-900">
                  Matches Participated
                </h2>
                <p className="mt-1 text-sm text-slate-500">Newest matches are shown first.</p>
              </div>
              <div className="overflow-x-auto">
                <table className="min-w-full text-sm">
                  <thead className="bg-slate-50">
                    <tr>
                      <th className="px-4 py-3 text-left text-xs font-bold uppercase tracking-wider text-slate-500">
                        Date
                      </th>
                      <th className="px-4 py-3 text-left text-xs font-bold uppercase tracking-wider text-slate-500">
                        Tournament
                      </th>
                      <th className="px-4 py-3 text-left text-xs font-bold uppercase tracking-wider text-slate-500">
                        Opponent
                      </th>
                      <th className="px-4 py-3 text-center text-xs font-bold uppercase tracking-wider text-slate-500">
                        Lanes
                      </th>
                      <th className="px-4 py-3 text-center text-xs font-bold uppercase tracking-wider text-slate-500">
                        Score
                      </th>
                      <th className="px-4 py-3 text-center text-xs font-bold uppercase tracking-wider text-slate-500">
                        Result
                      </th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-slate-100">
                    {teamMatches.length === 0 ? (
                      <tr>
                        <td colSpan={6} className="px-4 py-12 text-center text-slate-500">
                          This team has not joined any matches yet.
                        </td>
                      </tr>
                    ) : (
                      teamMatches.map((match) => {
                        const teamWins = getTeamWinsInMatch(match);
                        const opponentWins = getOpponentWinsInMatch(match);
                        return (
                          <tr key={match.matchId} className="hover:bg-blue-50/40">
                            <td className="px-4 py-4 text-slate-700">
                              {formatDate(match.tourneyDate)}
                            </td>
                            <td className="px-4 py-4 font-medium text-slate-900">
                              {match.tourneyLocation || 'Unknown tournament'}
                            </td>
                            <td className="px-4 py-4 text-slate-700">{getOpponentName(match)}</td>
                            <td className="px-4 py-4 text-center font-bold text-blue-700">
                              {match.lanes}
                            </td>
                            <td className="px-4 py-4 text-center font-bold text-slate-700">
                              {teamWins !== null && opponentWins !== null
                                ? `${teamWins} - ${opponentWins}`
                                : '-'}
                            </td>
                            <td className="px-4 py-4 text-center">{renderResultBadge(match)}</td>
                          </tr>
                        );
                      })
                    )}
                  </tbody>
                </table>
              </div>
            </section>
            <section className="mb-8 overflow-hidden rounded-2xl border border-slate-200 bg-white shadow-sm">
              <div className="border-b border-slate-100 p-6">
                <h2 className="text-lg font-black uppercase tracking-tight text-slate-900">
                  Tournaments Participated
                </h2>
              </div>
              <div className="divide-y divide-slate-100">
                {teamTournaments.length === 0 ? (
                  <div className="p-6 text-sm text-slate-500">
                    No tournament participation found.
                  </div>
                ) : (
                  teamTournaments.map((tournament) => (
                    <div
                      key={tournament.tourneyId}
                      className="flex flex-col gap-2 p-6 sm:flex-row sm:items-center sm:justify-between"
                    >
                      <div>
                        <div className="text-sm font-black uppercase tracking-tight text-slate-900">
                          {tournament.tourneyLocation}
                        </div>
                        <div className="text-xs text-slate-500">
                          {formatDate(tournament.tourneyDate)}
                        </div>
                      </div>
                      <div className="inline-flex rounded-full bg-blue-50 px-3 py-1 text-xs font-bold uppercase tracking-wider text-blue-700">
                        {tournamentMatchCount.get(tournament.tourneyId) || 0} matches
                      </div>
                    </div>
                  ))
                )}
              </div>
            </section>
            <div className="overflow-hidden bg-white rounded-3xl border border-slate-100 shadow-[0_20px_50px_rgba(0,0,0,0.04)]">
              <div className="overflow-x-auto">
                <table className="min-w-full">
                  <thead>
                    <tr className="bg-[#1a1c2e]">
                      <th className="px-8 py-6 text-left text-xs font-bold text-slate-400 uppercase tracking-[0.2em]">
                        Athlete
                      </th>
                      <th className="px-8 py-6 text-left text-xs font-bold text-slate-400 uppercase tracking-[0.2em]">
                        Contact
                      </th>
                      <th className="px-8 py-6 text-left text-xs font-bold text-slate-400 uppercase tracking-[0.2em]">
                        Location
                      </th>
                      {isAuthenticated && (
                        <th className="px-8 py-6 text-right text-xs font-bold text-slate-400 uppercase tracking-[0.2em]">
                          Actions
                        </th>
                      )}
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-slate-50 bg-white">
                    {bowlerData.length === 0 ? (
                      <tr>
                        <td
                          colSpan={isAuthenticated ? 4 : 3}
                          className="px-8 py-20 text-center text-slate-400 italic font-medium"
                        >
                          This team doesn't have any registered players yet.
                        </td>
                      </tr>
                    ) : (
                      bowlerData.map((b) => (
                        <tr key={b.BowlerId} className="hover:bg-blue-50/40 transition-all group">
                          <td className="px-8 py-6 whitespace-nowrap">
                            <div className="flex items-center gap-4">
                              <div className="w-10 h-10 bg-gradient-to-br from-blue-500 to-purple-600 rounded-xl flex items-center justify-center text-white font-black text-sm shadow-md group-hover:scale-110 transition-transform">
                                {b.bowlerLastName.charAt(0)}
                              </div>
                              <div>
                                <div className="text-lg font-bold text-slate-800 tracking-tight">
                                  {b.bowlerLastName}, {b.bowlerFirstName}
                                </div>
                                <div className="text-[10px] text-blue-600 font-black uppercase tracking-widest">
                                  Active Player
                                </div>
                              </div>
                            </div>
                          </td>

                          <td className="px-8 py-6 whitespace-nowrap">
                            <div className="text-sm font-bold text-slate-700">
                              {b.bowlerPhoneNumber}
                            </div>
                            <div className="text-[10px] text-slate-400 font-bold uppercase">
                              Mobile
                            </div>
                          </td>

                          <td className="px-8 py-6">
                            <div className="text-sm text-slate-600 font-medium">
                              {b.bowlerCity}, {b.bowlerState}
                            </div>
                            <div className="text-xs text-slate-400 truncate max-w-[200px]">
                              {b.bowlerAddress}
                            </div>
                          </td>

                          {isAdmin && (
                            <td className="px-8 py-6 text-right whitespace-nowrap space-x-6">
                              <button
                                onClick={() => handleEdit(b.BowlerId)}
                                className="text-xs font-black uppercase tracking-widest text-slate-400 hover:text-blue-600 transition-colors"
                              >
                                Edit
                              </button>
                              <button
                                onClick={() => handleDelete(b.BowlerId)}
                                className="text-xs font-black uppercase tracking-widest text-slate-400 hover:text-pink-600 transition-colors"
                              >
                                Delete
                              </button>
                            </td>
                          )}
                        </tr>
                      ))
                    )}
                  </tbody>
                </table>
              </div>
            </div>
          </>
        )}

        <div className="mt-8 text-center text-slate-400 text-xs font-bold uppercase tracking-widest">
          Bowling League Management System - {new Date().getFullYear()}
        </div>
      </div>
    </div>
  );
}

export default TeamDetailPage;
