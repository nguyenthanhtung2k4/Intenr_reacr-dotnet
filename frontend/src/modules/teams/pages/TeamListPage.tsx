import React, { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import {
  fetchTeams,
  createTeam,
  deleteTeam,
  updateTeam,
  fetchAllBowlers,
  Team,
  Bowler,
} from '../../../core/api';
import { useAuth } from '../../../context/AuthContext';
import { useToast } from '../../../context/ToastContext';

const ViewTeams = () => {
  const [teams, setTeams] = useState<Team[]>([]);
  const [bowlers, setBowlers] = useState<Bowler[]>([]);
  const [loading, setLoading] = useState(true);
  const { role } = useAuth();
  const isAdmin = role === 'Admin';
  const toast = useToast();
  const navigate = useNavigate();

  // Create Form State
  const [showCreate, setShowCreate] = useState(false);
  const [newTeamName, setNewTeamName] = useState('');

  // Edit Form State
  const [showEdit, setShowEdit] = useState(false);
  const [editingTeam, setEditingTeam] = useState<Team | null>(null);
  const [editTeamName, setEditTeamName] = useState('');
  const [editCaptainId, setEditCaptainId] = useState<number | null>(null);

  const loadTeams = async () => {
    try {
      const data = await fetchTeams();
      setTeams(data);
    } catch (error) {
      console.error(error);
    } finally {
      setLoading(false);
    }
  };

  const loadBowlers = async () => {
    try {
      const data = await fetchAllBowlers();
      setBowlers(data);
    } catch (error) {
      console.error(error);
    }
  };

  useEffect(() => {
    loadTeams();
    loadBowlers();
  }, []);

  const handleCreate = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!newTeamName.trim()) return;
    try {
      await createTeam({ TeamName: newTeamName, CaptainId: null });
      toast.showToast('Team created successfully', 'success');
      setNewTeamName('');
      setShowCreate(false);
      loadTeams();
    } catch (error) {
      toast.showToast('Failed to create team', 'error');
    }
  };

  const handleDelete = async (id: number) => {
    if (!window.confirm(`Delete this team? ${id}`)) return;
    try {
      await deleteTeam(id);

      toast.showToast('Team deleted', 'success');
      loadTeams();
    } catch (error) {
      toast.showToast('Failed to delete team', 'error');
    }
  };

  const handleEdit = (team: Team) => {
    setEditingTeam(team);
    setEditTeamName(team.teamName);
    setEditCaptainId(team.captainId);
    setShowEdit(true);
    setShowCreate(false); // Close create form if open
  };

  const handleUpdate = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!editingTeam || !editTeamName.trim()) return;

    try {
      await updateTeam(editingTeam.TeamId, {
        teamName: editTeamName,
        captainId: editCaptainId,
      });
      toast.showToast('Team updated successfully', 'success');
      setShowEdit(false);
      setEditingTeam(null);
      loadTeams();
    } catch (error) {
      toast.showToast('Failed to update team', 'error');
    }
  };

  const handleCancelEdit = () => {
    setShowEdit(false);
    setEditingTeam(null);
    setEditTeamName('');
    setEditCaptainId(null);
  };

  const handleViewTeam = (teamId: number) => {
    navigate(`/teams/${teamId}`);
  };

  if (loading) {
    return (
      <div className="min-h-screen pt-24 bg-slate-50 flex justify-center items-center">
        <div className="w-10 h-10 border-4 border-blue-600 rounded-full animate-spin border-t-transparent"></div>
      </div>
    );
  }

  return (
    <div className="mt-28 min-h-screen pt-24 pb-12 bg-slate-50">
      <div className="container-custom">
        <div className="flex items-end justify-between mb-8">
          <div>
            <h1 className="text-3xl font-black text-slate-900 uppercase tracking-tight">Teams</h1>
            <p className="text-slate-500 mt-1">League participating squads</p>
          </div>
          {isAdmin && (
            <button onClick={() => setShowCreate(!showCreate)} className="btn btn-primary">
              {showCreate ? 'Cancel' : '+ New Team'}
            </button>
          )}
        </div>

        {showCreate && (
          <div className="bg-white p-6 rounded-xl border border-slate-200 shadow-sm mb-8 animate-fade-in-up max-w-lg">
            <h3 className="text-lg font-bold text-slate-900 mb-4">Create New Team</h3>
            <form onSubmit={handleCreate} className="flex gap-4">
              <input
                type="text"
                placeholder="Enter team name"
                className="input-field flex-1"
                value={newTeamName}
                onChange={(e) => setNewTeamName(e.target.value)}
              />
              <button type="submit" className="btn btn-primary">
                Save
              </button>
            </form>
          </div>
        )}

        {showEdit && editingTeam && (
          <div className="bg-white p-6 rounded-xl border border-blue-200 shadow-md mb-8 animate-fade-in-up max-w-2xl">
            <h3 className="text-lg font-bold text-slate-900 mb-4">
              Edit Team: {editingTeam.teamName}
            </h3>
            <form onSubmit={handleUpdate} className="space-y-4">
              <div>
                <label className="block text-sm font-bold text-slate-700 mb-2">Team Name</label>
                <input
                  type="text"
                  placeholder="Enter team name"
                  className="input-field w-full"
                  value={editTeamName}
                  onChange={(e) => setEditTeamName(e.target.value)}
                  required
                />
              </div>

              <div>
                <label className="block text-sm font-bold text-slate-700 mb-2">Captain</label>
                <select
                  className="input-field w-full"
                  value={editCaptainId || ''}
                  onChange={(e) => setEditCaptainId(e.target.value ? Number(e.target.value) : null)}
                >
                  <option value="">No Captain</option>
                  {bowlers.map((bowler) => (
                    <option key={bowler.BowlerId} value={bowler.BowlerId}>
                      {bowler.bowlerLastName}, {bowler.bowlerFirstName}
                      {bowler.team?.teamName ? ` (${bowler.team.teamName})` : ''}
                    </option>
                  ))}
                </select>
              </div>

              <div className="flex gap-3">
                <button type="submit" className="btn btn-primary">
                  Update Team
                </button>
                <button
                  type="button"
                  onClick={handleCancelEdit}
                  className="btn bg-slate-200 text-slate-700 hover:bg-slate-300"
                >
                  Cancel
                </button>
              </div>
            </form>
          </div>
        )}

        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
          {teams.map((team) => (
            <div
              key={team.TeamId}
              className="bg-white rounded-xl p-6 border border-slate-200 shadow-sm hover:shadow-lg hover:border-blue-300 transition-all group relative cursor-pointer"
              onClick={() => handleViewTeam(team.TeamId)}
            >
              <div className="flex items-center justify-between mb-4">
                <div className="w-12 h-12 rounded-lg bg-blue-50 text-blue-600 flex items-center justify-center font-black text-xl group-hover:bg-blue-100 transition-colors">
                  {team.teamName.charAt(0)}
                </div>
                {isAdmin && (
                  <div className="flex items-center gap-2">
                    <button
                      onClick={(e) => {
                        e.stopPropagation();
                        handleEdit(team);
                      }}
                      className="text-slate-300 hover:text-blue-500 transition-colors z-10"
                      title="Edit team"
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
                      onClick={(e) => {
                        e.stopPropagation(); // Prevent card click when deleting
                        handleDelete(team.TeamId);
                      }}
                      className="text-slate-300 hover:text-red-500 transition-colors z-10"
                      title="Delete team"
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
              <h3 className="text-xl font-bold text-slate-900 group-hover:text-blue-700 transition-colors mb-2">
                {team.teamName}
              </h3>
              <div className="text-sm text-slate-500 font-medium flex items-center gap-2 mb-3">
                <span>Captain:</span>
                <span className="text-slate-800">
                  {team.captainId
                    ? (() => {
                        const captain = bowlers.find((b) => b.BowlerId === team.captainId);
                        return captain
                          ? `${captain.bowlerLastName}, ${captain.bowlerFirstName}`
                          : `#${team.captainId}`;
                      })()
                    : 'None'}
                </span>
              </div>

              {/* View Details Indicator */}
              <div className="flex items-center gap-2 text-xs text-blue-600 font-bold uppercase tracking-wider opacity-0 group-hover:opacity-100 transition-opacity">
                <span>View Details</span>
                <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth={2}
                    d="M9 5l7 7-7 7"
                  />
                </svg>
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
};

export default ViewTeams;
