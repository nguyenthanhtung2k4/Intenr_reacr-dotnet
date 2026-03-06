import React, { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import {
  fetchTournaments,
  createTournament,
  updateTournament,
  deleteTournament,
} from '../../../core/api';
import { useAuth } from '../../../context/AuthContext';
import { useToast } from '../../../context/ToastContext';
import { TournamentData } from '../../../types/Tournament';

const TournamentList = () => {
  const { role } = useAuth();
  const toast = useToast();
  const navigate = useNavigate();

  const [tournaments, setTournaments] = useState<TournamentData[]>([]);
  const [loading, setLoading] = useState(true);

  // Admin State
  const [showCreateForm, setShowCreateForm] = useState(false);
  const [editingTournamentId, setEditingTournamentId] = useState<number | null>(null);

  // Form State
  const [formData, setFormData] = useState({
    tourneyLocation: '',
    tourneyDate: '',
  });
  const [creating, setCreating] = useState(false);

  // Fetch Tournaments
  const refreshTournaments = async () => {
    setLoading(true);
    try {
      const data = await fetchTournaments();
      setTournaments(data);
    } catch (error) {
      console.error('Error fetching tournaments:', error);
      toast.showToast('Failed to load tournaments', 'error');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    refreshTournaments();
  }, []);

  const handleCreateSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!formData.tourneyLocation || !formData.tourneyDate) {
      toast.showToast('Please fill all fields', 'warning');
      return;
    }

    setCreating(true);
    try {
      if (editingTournamentId) {
        await updateTournament(editingTournamentId, formData);
        toast.showToast('Tournament updated successfully!', 'success');
      } else {
        await createTournament(formData);
        toast.showToast('Tournament created successfully!', 'success');
      }
      setShowCreateForm(false);
      setEditingTournamentId(null);
      setFormData({ tourneyLocation: '', tourneyDate: '' });
      refreshTournaments();
    } catch (error: any) {
      toast.showToast(error.message || 'Failed to save tournament', 'error');
    } finally {
      setCreating(false);
    }
  };

  const handleEdit = (tournament: TournamentData) => {
    setEditingTournamentId(tournament.tourneyId);
    setFormData({
      tourneyLocation: tournament.tourneyLocation,
      tourneyDate: tournament.tourneyDate.split('T')[0],
    });
    setShowCreateForm(true);
  };

  const handleDelete = async (id: number) => {
    if (!window.confirm('Are you sure you want to delete this tournament?')) return;
    try {
      await deleteTournament(id);
      toast.showToast('Tournament deleted successfully', 'success');
      refreshTournaments();
    } catch (error) {
      toast.showToast('Failed to delete tournament', 'error');
    }
  };

  if (loading && tournaments.length === 0) {
    return (
      <div className="min-h-screen pt-24 pb-12 bg-slate-50 flex justify-center">
        <div className="w-10 h-10 border-4 border-blue-600 rounded-full animate-spin border-t-transparent"></div>
      </div>
    );
  }

  return (
    <div className="mt-28 min-h-screen pt-24 pb-12 bg-slate-50">
      <div className="container-custom">
        {/* Header */}
        <div className="flex flex-col md:flex-row md:items-end justify-between gap-6 mb-10">
          <div>
            <h1 className="text-3xl font-black text-slate-900 tracking-tight uppercase">
              Tournaments
            </h1>
            <p className="text-slate-500 mt-1">Manage official league schedules and events</p>
          </div>

          {role === 'Admin' && (
            <button
              onClick={() => {
                if (showCreateForm) {
                  setShowCreateForm(false);
                  setEditingTournamentId(null);
                  setFormData({ tourneyLocation: '', tourneyDate: '' });
                } else {
                  setShowCreateForm(true);
                }
              }}
              className={`btn ${showCreateForm ? 'btn-white' : 'btn-primary'}`}
            >
              {showCreateForm ? 'Cancel' : '+ Create Tournament'}
            </button>
          )}
        </div>

        {/* Create/Edit Form */}
        {showCreateForm && role === 'Admin' && (
          <div className="bg-white rounded-xl border border-slate-200 shadow-sm p-6 mb-8 animate-fade-in-up">
            <h3 className="text-lg font-bold text-slate-900 uppercase mb-6 pb-4 border-b border-slate-100">
              {editingTournamentId ? 'Edit Tournament' : 'Create New Tournament'}
            </h3>
            <form onSubmit={handleCreateSubmit} className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div>
                <label className="block text-sm font-bold text-slate-700 uppercase tracking-wide mb-2">
                  Location
                </label>
                <input
                  type="text"
                  placeholder="e.g. Bowling Center A"
                  className="input-field"
                  value={formData.tourneyLocation}
                  onChange={(e) => setFormData({ ...formData, tourneyLocation: e.target.value })}
                />
              </div>

              <div>
                <label className="block text-sm font-bold text-slate-700 uppercase tracking-wide mb-2">
                  Date
                </label>
                <input
                  type="date"
                  className="input-field"
                  value={formData.tourneyDate}
                  onChange={(e) => setFormData({ ...formData, tourneyDate: e.target.value })}
                />
              </div>

              <div className="md:col-span-2 flex justify-end gap-3 pt-4">
                <button
                  type="button"
                  onClick={() => setShowCreateForm(false)}
                  className="btn btn-white"
                >
                  Cancel
                </button>
                <button type="submit" disabled={creating} className="btn btn-primary min-w-[120px]">
                  {creating ? 'Saving...' : editingTournamentId ? 'Update' : 'Create'}
                </button>
              </div>
            </form>
          </div>
        )}

        {/* Tournament List */}
        <div className="space-y-4">
          {tournaments.map((tournament) => (
            <div
              key={tournament.tourneyId}
              className="group bg-white rounded-xl border border-slate-200 p-6 shadow-sm hover:shadow-md hover:border-blue-300 transition-all cursor-pointer relative overflow-hidden"
              onClick={() => navigate(`/league/tournaments/${tournament.tourneyId}`)}
            >
              {/* Blue bar on hover */}
              <div className="absolute left-0 top-0 bottom-0 w-1 bg-blue-600 opacity-0 group-hover:opacity-100 transition-opacity"></div>

              <div className="flex flex-col md:flex-row items-center justify-between gap-6 pl-2">
                {/* Date */}
                <div className="flex flex-col items-center md:items-start min-w-[100px]">
                  <span className="text-red-600 font-extrabold text-lg uppercase tracking-wider">
                    {new Date(tournament.tourneyDate).toLocaleDateString('en-US', {
                      month: 'short',
                      day: 'numeric',
                    })}
                  </span>
                  <span className="text-slate-400 text-xs font-bold">
                    {new Date(tournament.tourneyDate).getFullYear()}
                  </span>
                </div>

                {/* Location */}
                <div className="flex-1 text-center md:text-left">
                  <h3 className="text-xl font-bold text-slate-900 group-hover:text-blue-700 transition-colors">
                    {tournament.tourneyLocation}
                  </h3>
                  <p className="text-slate-500 text-sm mt-1">Click to view matches</p>
                </div>

                {/* Admin Actions */}
                {role === 'Admin' && (
                  <div className="flex gap-2" onClick={(e) => e.stopPropagation()}>
                    <button
                      onClick={() => handleEdit(tournament)}
                      className="px-4 py-2 text-xs font-bold text-slate-600 bg-slate-100 hover:bg-slate-200 rounded uppercase tracking-wider"
                    >
                      Edit
                    </button>
                    <button
                      onClick={() => handleDelete(tournament.tourneyId)}
                      className="px-4 py-2 text-xs font-bold text-red-600 bg-red-50 hover:bg-red-100 rounded uppercase tracking-wider"
                    >
                      Delete
                    </button>
                  </div>
                )}

                {/* Arrow Icon */}
                <div className="hidden md:block text-slate-300 group-hover:text-blue-500 group-hover:translate-x-1 transition-all">
                  <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      strokeWidth={2}
                      d="M9 5l7 7-7 7"
                    />
                  </svg>
                </div>
              </div>
            </div>
          ))}

          {tournaments.length === 0 && (
            <div className="text-center py-20 bg-white rounded-xl border border-dashed border-slate-300">
              <p className="text-slate-500 mb-4">No tournaments created yet.</p>
              {role === 'Admin' && (
                <button onClick={() => setShowCreateForm(true)} className="btn btn-primary">
                  Create First Tournament
                </button>
              )}
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default TournamentList;
