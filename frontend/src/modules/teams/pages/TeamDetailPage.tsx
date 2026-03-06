import { useEffect, useState } from 'react';
import { Bowler } from '../../../types/Bowler';
import type { Team as TeamType } from '../../../types/Team';
import { useNavigate, useParams } from 'react-router-dom';
import { fetchTeamBowlers, softDeleteBowler, updateTeam, fetchTeams } from '../../../core/api';
import { useAuth } from '../../../context/AuthContext';

function Team() {
  const [bowlerData, setBowlerData] = useState<Bowler[]>([]);
  const [nameTeam, setNameTeam] = useState('Loading...');
  const [currentTeam, setCurrentTeam] = useState<TeamType | null>(null);
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

  useEffect(() => {
    if (!id) {
      setError('Lỗi: Không tìm thấy ID đội.');
      setIsLoading(false);
      return;
    }

    const fetchData = async () => {
      try {
        setError(null);
        setIsLoading(true);

        // Fetch bowlers
        const bowlers = await fetchTeamBowlers(id);
        // const bowlers = await

        setBowlerData(bowlers || []);

        // Fetch team info
        const teams = await fetchTeams();
        const team = teams.find((t) => t.TeamId === Number(id));

        if (team) {
          setCurrentTeam(team);
          setNameTeam(team.teamName);
          setEditTeamName(team.teamName);
          setEditCaptainId(team.captainId);
        } else if (bowlers && bowlers.length > 0) {
          setNameTeam(bowlers[0].team.teamName);
        } else {
          setNameTeam('Empty Team');
        }
      } catch (ex: any) {
        setError(ex.message || 'Lỗi khi tải dữ liệu đội.');
        setNameTeam('Error');
      } finally {
        setIsLoading(false);
      }
    };

    fetchData();
  }, [id]);

  const handleEdit = (bowlerId?: number) => {
    if (!bowlerId) {
      console.error('Invalid Bowler ID for edit:', bowlerId);
      return;
    }
    navigate(`/bowlers/${bowlerId}/edit`);
  };

  const handleDelete = async (bowlerId?: number) => {
    if (!bowlerId) {
      console.error('Invalid Bowler ID for delete:', bowlerId);
      return;
    }

    if (!window.confirm('Bạn có chắc chắn muốn xóa cầu thủ này?')) {
      return;
    }

    try {
      await softDeleteBowler(bowlerId);
      // Refresh the data after successful delete
      const data = await fetchTeamBowlers(id!);
      setBowlerData(data || []);
      alert('Đã xóa cầu thủ thành công!');
    } catch (error: any) {
      console.error('Error deleting bowler:', error);
      alert(`Lỗi khi xóa: ${error.message}`);
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
      alert('Cập nhật team thành công!');
    } catch (error: any) {
      console.error('Error updating team:', error);
      alert(`Lỗi khi cập nhật: ${error.message}`);
    }
  };

  const handleCancelEditTeam = () => {
    if (currentTeam) {
      setEditTeamName(currentTeam.teamName);
      setEditCaptainId(currentTeam.captainId);
    }
    setShowEditTeam(false);
  };
  console.log('TEAM : ', bowlerData);
  return (
    <div className="mt-32 min-h-screen bg-white pt-24 pb-12 px-6 font-sans text-slate-900">
      <div className="max-w-6xl mx-auto">
        {/* Header Section: Đồng bộ với trang chính */}
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
              <span className="group-hover:-translate-x-1 transition-transform">←</span> Back to
              Teams
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
          /* Bảng thiết kế lại: Trắng, sạch, bóng đổ mềm */
          <div className="overflow-hidden bg-white rounded-3xl border border-slate-100 shadow-[0_20px_50px_rgba(0,0,0,0.04)]">
            <div className="overflow-x-auto">
              <table className="min-w-full">
                <thead>
                  {/* Header bảng màu tối sâu cực sang trọng */}
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
                        colSpan={6}
                        className="px-8 py-20 text-center text-slate-400 italic font-medium"
                      >
                        This team doesn't have any registered players yet.
                      </td>
                    </tr>
                  ) : (
                    bowlerData.map((b) => (
                      <tr key={b.BowlerId} className="hover:bg-blue-50/40 transition-all group">
                        {/* Cột Tên + Avatar Placeholder */}
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

                        {/* Cột Số điện thoại */}
                        <td className="px-8 py-6 whitespace-nowrap">
                          <div className="text-sm font-bold text-slate-700">
                            {b.bowlerPhoneNumber}
                          </div>
                          <div className="text-[10px] text-slate-400 font-bold uppercase">
                            Mobile
                          </div>
                        </td>

                        {/* Cột Địa chỉ */}
                        <td className="px-8 py-6">
                          <div className="text-sm text-slate-600 font-medium">
                            {b.bowlerCity}, {b.bowlerState}
                          </div>
                          <div className="text-xs text-slate-400 truncate max-w-[200px]">
                            {b.bowlerAddress}
                          </div>
                        </td>

                        {/* Cột Actions (Chỉ cho Admin) */}
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
        )}

        {/* Footer info thêm cho đẹp */}
        <div className="mt-8 text-center text-slate-400 text-xs font-bold uppercase tracking-widest">
          Bowling League Management System • {new Date().getFullYear()}
        </div>
      </div>
    </div>
  );
}

export default Team;
