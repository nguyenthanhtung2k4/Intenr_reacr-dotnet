import React, { useEffect, useState } from 'react';
import { useParams, Link, useNavigate } from 'react-router-dom';
import {
  fetchTournaments,
  fetchGlobalMatches,
  createMatch,
  updateMatch,
  deleteMatch,
  fetchTeams,
  Team,
} from '../../../core/api';
import { useAuth } from '../../../context/AuthContext';
import { useToast } from '../../../context/ToastContext';
import { TournamentData } from '../../../types/Tournament';
import { MatchData, MatchCreateData } from '../../../types/Match';

const TournamentDetail = () => {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const { role } = useAuth();
  const toast = useToast();

  const [tournament, setTournament] = useState<TournamentData | null>(null);
  const [matches, setMatches] = useState<MatchData[]>([]);
  const [teams, setTeams] = useState<Team[]>([]);
  const [loading, setLoading] = useState(true);

  // Match Form State
  const [showMatchForm, setShowMatchForm] = useState(false);
  const [editingMatchId, setEditingMatchId] = useState<number | null>(null);
  const [matchForm, setMatchForm] = useState<MatchCreateData>({
    tourneyId: Number(id),
    lanes: '1-2',
    oddLaneTeamId: 0,
    evenLaneTeamId: 0,
  });

  const fetchData = async () => {
    setLoading(true);
    try {
      const [allTournaments, allMatches] = await Promise.all([
        fetchTournaments(),
        fetchGlobalMatches(),
      ]);

      const foundTourney = allTournaments.find((t) => t.tourneyId === Number(id));
      if (!foundTourney) {
        toast.showToast('Tournament not found', 'error');
        navigate('/league/tournaments');
        return;
      }
      setTournament(foundTourney);

      const tourneyMatches = allMatches.filter((m) => m.tourneyId === Number(id));
      setMatches(tourneyMatches);

      const allTeams = await fetchTeams();
      setTeams(allTeams);
    } catch (error) {
      console.error('Error fetching details:', error);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    if (id) fetchData();
  }, [id]);

  const handleMatchSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      const payload = { ...matchForm, tourneyId: Number(id) };
      if (editingMatchId) {
        // Find existing match to get original oddLaneTeam/evenLaneTeam names if needed,
        // but API update usually focuses on IDs and lanes.
        // Assuming updateMatch accepts partial update or IDs.
        await updateMatch(editingMatchId, payload);
        toast.showToast('Match updated', 'success');
      } else {
        await createMatch(payload);
        toast.showToast('Match scheduled', 'success');
      }
      setShowMatchForm(false);
      setEditingMatchId(null);
      setMatchForm({ tourneyId: Number(id), lanes: '', oddLaneTeamId: 0, evenLaneTeamId: 0 });
      fetchData();
    } catch (error: any) {
      toast.showToast('Failed to save match', 'error');
    }
  };

  const handleDeleteMatch = async (matchId: number) => {
    if (!window.confirm('Delete this match?')) return;
    try {
      await deleteMatch(matchId);
      toast.showToast('Match deleted', 'success');
      fetchData();
    } catch (error) {
      toast.showToast('Failed to delete', 'error');
    }
  };

  if (loading) return <div className="p-20 text-center">Loading...</div>;
  if (!tournament) return null;

  return (
    <div className="mt-28 min-h-screen pt-24 pb-12 bg-slate-50">
      <div className="container-custom">
        {/* Breadcrumb */}
        <div className="flex items-center gap-2 text-sm text-slate-500 mb-6 font-medium">
          <Link to="/league/tournaments" className="hover:text-blue-600 transition-colors">
            Tournaments
          </Link>
          <span>/</span>
          <span className="text-slate-900">{tournament.tourneyLocation}</span>
        </div>

        {/* Tournament Info */}
        <div className="bg-white rounded-xl border border-slate-200 p-8 shadow-sm mb-8">
          <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
            <div>
              <div className="flex items-center gap-3 mb-2">
                <span className="bg-blue-100 text-blue-700 text-xs font-bold px-2 py-1 rounded uppercase tracking-wider">
                  Official Event
                </span>
                <span className="text-slate-400 text-sm font-bold">
                  ID: #{tournament.tourneyId}
                </span>
              </div>
              <h1 className="text-4xl font-black text-slate-900 tracking-tight mb-2">
                {tournament.tourneyLocation}
              </h1>
              <div className="flex items-center gap-6 text-slate-600 font-medium">
                <div className="flex items-center gap-2">
                  <svg
                    className="w-5 h-5 text-slate-400"
                    fill="none"
                    viewBox="0 0 24 24"
                    stroke="currentColor"
                  >
                    <path
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      strokeWidth={2}
                      d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z"
                    />
                  </svg>
                  {new Date(tournament.tourneyDate).toLocaleDateString('en-US', {
                    weekday: 'long',
                    year: 'numeric',
                    month: 'long',
                    day: 'numeric',
                  })}
                </div>
                <div className="flex items-center gap-2">
                  <svg
                    className="w-5 h-5 text-slate-400"
                    fill="none"
                    viewBox="0 0 24 24"
                    stroke="currentColor"
                  >
                    <path
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      strokeWidth={2}
                      d="M17.657 16.657L13.414 20.9a1.998 1.998 0 01-2.827 0l-4.244-4.243a8 8 0 1111.314 0z"
                    />
                    <path
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      strokeWidth={2}
                      d="M15 11a3 3 0 11-6 0 3 3 0 016 0z"
                    />
                  </svg>
                  {tournament.tourneyLocation}
                </div>
              </div>
            </div>

            {role === 'Admin' && (
              <button
                onClick={() => setShowMatchForm(!showMatchForm)}
                className="btn btn-primary shadow-blue-200 shadow-lg"
              >
                {showMatchForm ? 'Cancel Scheduling' : '+ Schedule Match'}
              </button>
            )}
          </div>
        </div>

        {/* Schedule Form */}
        {showMatchForm && (
          <div className="bg-slate-100 rounded-xl p-6 mb-8 border border-slate-200 animate-fade-in-up">
            <h3 className="text-lg font-bold text-slate-900 mb-4 uppercase tracking-wide">
              {editingMatchId ? 'Edit Match' : 'Add New Match'}
            </h3>
            <form
              onSubmit={handleMatchSubmit}
              className="grid grid-cols-1 md:grid-cols-4 gap-4 items-end"
            >
              <div className="md:col-span-1">
                <label className="block text-xs font-bold text-slate-500 uppercase mb-1">
                  Lanes
                </label>
                <input
                  type="text"
                  placeholder="e.g. 1-2"
                  className="input-field bg-white"
                  value={matchForm.lanes}
                  onChange={(e) => setMatchForm({ ...matchForm, lanes: e.target.value })}
                />
              </div>
              <div className="md:col-span-1">
                <label className="block text-xs font-bold text-slate-500 uppercase mb-1">
                  Team 1 (Odd Lane)
                </label>
                <select
                  className="input-field bg-white"
                  value={matchForm.oddLaneTeamId}
                  onChange={(e) =>
                    setMatchForm({ ...matchForm, oddLaneTeamId: Number(e.target.value) })
                  }
                >
                  <option value={0}>Select Team</option>
                  {teams.map((t) => (
                    <option key={t.TeamId} value={t.TeamId}>
                      {t.teamName}
                    </option>
                  ))}
                </select>
              </div>
              <div className="md:col-span-1">
                <label className="block text-xs font-bold text-slate-500 uppercase mb-1">
                  Team 2 (Even Lane)
                </label>
                <select
                  className="input-field bg-white"
                  value={matchForm.evenLaneTeamId}
                  onChange={(e) =>
                    setMatchForm({ ...matchForm, evenLaneTeamId: Number(e.target.value) })
                  }
                >
                  <option value={0}>Select Team</option>
                  {teams.map((t) => (
                    <option key={t.TeamId} value={t.TeamId}>
                      {t.teamName}
                    </option>
                  ))}
                </select>
              </div>
              <div className="md:col-span-1">
                <button type="submit" className="btn btn-primary w-full h-[42px]">
                  {editingMatchId ? 'Update Match' : 'Add Match'}
                </button>
              </div>
            </form>
          </div>
        )}

        {/* Matches List */}
        <div>
          <div className="flex justify-between items-end mb-6">
            <h2 className="text-2xl font-black text-slate-900">Matches Scheduled</h2>
            <span className="text-slate-500 font-bold">{matches.length} matches</span>
          </div>

          <div className="grid gap-4">
            {matches.map((match) => (
              <div
                key={match.matchId}
                className="bg-white border border-slate-200 rounded-lg p-4 flex flex-col md:flex-row items-center justify-between gap-4 hover:border-blue-300 transition-colors shadow-sm"
              >
                {/* Visual Connector / Lanes */}
                <div className="flex items-center gap-4 w-full md:w-auto">
                  <div className="flex flex-col items-center justify-center w-16 h-16 bg-slate-50 rounded-lg border border-slate-100">
                    <span className="text-[10px] font-bold text-slate-400 uppercase">Lanes</span>
                    <span className="text-xl font-black text-blue-600">{match.lanes}</span>
                  </div>
                </div>

                {/* Teams */}
                <div className="flex-1 flex items-center justify-center gap-8 w-full border-t md:border-t-0 md:border-l md:border-r border-slate-100 py-4 md:py-0 px-8">
                  <div className="text-lg font-bold text-slate-900 w-1/2 text-right">
                    {match.oddLaneTeam}
                  </div>
                  <div className="text-xs font-bold text-slate-400 bg-slate-100 px-2 py-1 rounded">
                    VS
                  </div>
                  <div className="text-lg font-bold text-slate-900 w-1/2 text-left">
                    {match.evenLaneTeam}
                  </div>
                </div>

                {/* Actions */}
                {role === 'Admin' && (
                  <div className="flex items-center gap-2 w-full md:w-auto justify-end">
                    <button
                      onClick={() => {
                        setEditingMatchId(match.matchId);
                        // Need logic to reverse-lookup IDs from names if API doesn't provide them in MatchData
                        // For now, just opening the form empty or keeping existing logic if possible.
                        // Simplified: Just auto-scroll to form
                        setShowMatchForm(true);
                        window.scrollTo({ top: 0, behavior: 'smooth' });
                        toast.showToast('Edit mode: Re-select teams', 'info');
                      }}
                      className="p-2 text-slate-400 hover:text-blue-600 hover:bg-blue-50 rounded transition-colors"
                      title="Edit"
                    >
                      <svg
                        className="w-5 h-5"
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
                    </button>
                    <button
                      onClick={() => handleDeleteMatch(match.matchId)}
                      className="p-2 text-slate-400 hover:text-red-600 hover:bg-red-50 rounded transition-colors"
                      title="Delete"
                    >
                      <svg
                        className="w-5 h-5"
                        fill="none"
                        stroke="currentColor"
                        viewBox="0 0 24 24"
                      >
                        <path
                          strokeLinecap="round"
                          strokeLinejoin="round"
                          strokeWidth={2}
                          d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16"
                        />
                      </svg>
                    </button>
                  </div>
                )}
              </div>
            ))}
            {matches.length === 0 && (
              <div className="text-center py-12 text-slate-500 bg-white border border-dashed border-slate-300 rounded-lg">
                No matches scheduled for this tournament yet.
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};

export default TournamentDetail;
