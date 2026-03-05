import { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { Bowler, BowlerStatsData } from '../../../types/Bowler';
import {
  fetchAllBowlers,
  deleteBowler,
  fetchTeams,
  fetchBowlerStats,
  Team,
} from '../../../services/api.services';
import { useAuth } from '../../../context/AuthContext';
import { useToast } from '../../../context/ToastContext';

function BowlersTable() {
  const [bowlers, setBowlers] = useState<Bowler[]>([]);
  const [stats, setStats] = useState<Map<number, BowlerStatsData>>(new Map());
  const [teams, setTeams] = useState<Team[]>([]);
  const [search, setSearch] = useState('');
  const [currentPage, setCurrentPage] = useState(1);
  const [loading, setLoading] = useState(true);
  const { role } = useAuth();
  const isAdmin = role === 'Admin';
  const navigate = useNavigate();
  const toast = useToast();

  /* New State for Sorting */
  const [sortConfig, setSortConfig] = useState<{
    key: string;
    direction: 'asc' | 'desc';
  } | null>(null);

  useEffect(() => {
    Promise.all([fetchAllBowlers(), fetchTeams(), fetchBowlerStats()])
      .then(([bowlerData, teamData, statsData]) => {
        setBowlers(bowlerData);
        setTeams(teamData);

        // Convert stats array to Map for easy lookup
        const statsMap = new Map<number, BowlerStatsData>();
        statsData.forEach((s) => statsMap.set(s.bowlerId, s));
        setStats(statsMap);

        setLoading(false);
      })
      .catch((err) => {
        console.error(err);
        setLoading(false);
      });
  }, []);

  // Filter Logic
  const filteredBowlers = bowlers
    .filter(
      (b) =>
        b.bowlerFirstName.toLowerCase().includes(search.toLowerCase()) ||
        b.bowlerLastName.toLowerCase().includes(search.toLowerCase()) ||
        b.team?.teamName?.toLowerCase().includes(search.toLowerCase()),
    )
    .sort((a, b) => {
      if (!sortConfig) return 0;

      let valA: any = '';
      let valB: any = '';
      const statA = stats.get(a.BowlerId);
      const statB = stats.get(b.BowlerId);

      switch (sortConfig.key) {
        case 'name':
          valA = `${a.bowlerFirstName} ${a.bowlerLastName}`.toLowerCase();
          valB = `${b.bowlerFirstName} ${b.bowlerLastName}`.toLowerCase();
          break;
        case 'team':
          valA = a.team?.teamName?.toLowerCase() || '';
          valB = b.team?.teamName?.toLowerCase() || '';
          break;
        case 'games':
          valA = statA?.totalGames || 0;
          valB = statB?.totalGames || 0;
          break;
        case 'avg':
          valA = statA?.averageScore || 0;
          valB = statB?.averageScore || 0;
          break;
        case 'high':
          valA = statA?.highScore || 0;
          valB = statB?.highScore || 0;
          break;
        case 'pins':
          valA = statA?.totalPins || 0;
          valB = statB?.totalPins || 0;
          break;
        default:
          return 0;
      }

      if (valA < valB) {
        return sortConfig.direction === 'asc' ? -1 : 1;
      }
      if (valA > valB) {
        return sortConfig.direction === 'asc' ? 1 : -1;
      }
      return 0;
    });

  // Handle Sort Click
  const handleSort = (key: string) => {
    let direction: 'asc' | 'desc' = 'asc';
    if (sortConfig && sortConfig.key === key && sortConfig.direction === 'asc') {
      direction = 'desc';
    }
    setSortConfig({ key, direction });
  };

  // Helper to render sort arrow
  const renderSortIndicator = (key: string) => {
    if (!sortConfig || sortConfig.key !== key) {
      return (
        <svg
          className="w-4 h-4 text-slate-300 ml-1 inline-block"
          viewBox="0 0 20 20"
          fill="currentColor"
        >
          <path
            fillRule="evenodd"
            d="M10 3a1 1 0 01.707.293l3 3a1 1 0 01-1.414 1.414L10 5.414 7.707 7.707a1 1 0 01-1.414-1.414l3-3A1 1 0 0110 3zm-3.707 9.293a1 1 0 011.414 0L10 14.586l2.293-2.293a1 1 0 011.414 1.414l-3 3a1 1 0 01-1.414 0l-3-3a1 1 0 010-1.414z"
            clipRule="evenodd"
          />
        </svg>
      );
    }
    return sortConfig.direction === 'asc' ? (
      <span className="ml-1 inline-block">↑</span>
    ) : (
      <span className="ml-1 inline-block">↓</span>
    );
  };

  const handleDelete = async (id: number) => {
    if (!window.confirm('Are you sure?')) return;
    try {
      await deleteBowler(id);
      setBowlers(bowlers.filter((b) => b.BowlerId !== id));
      toast.showToast('Bowler deleted', 'success');
    } catch (error) {
      toast.showToast('Failed to delete', 'error');
    }
  };

  return (
    <div className="mt-28 min-h-screen pt-24 pb-12 bg-slate-50">
      <div className="container-custom">
        <div className="flex flex-col md:flex-row items-end justify-between gap-6 mb-8">
          <div>
            <h1 className="text-3xl font-black text-slate-900 uppercase tracking-tight">
              Player Database
            </h1>
            <p className="text-slate-500 mt-1">Manage league athletes and their stats</p>
          </div>

          <div className="flex flex-col md:flex-row gap-3 w-full md:w-auto">
            {/* Search */}
            <div className="relative">
              <input
                type="text"
                placeholder="Search players..."
                className="pl-10 pr-4 py-2 border border-slate-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 w-full md:w-64"
                value={search}
                onChange={(e) => setSearch(e.target.value)}
              />
              <svg
                className="w-5 h-5 text-slate-400 absolute left-3 top-1/2 -translate-y-1/2"
                fill="none"
                stroke="currentColor"
                viewBox="0 0 24 24"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={2}
                  d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z"
                />
              </svg>
            </div>

            {isAdmin && (
              <button
                onClick={() => navigate('/bowler/new')}
                className="btn btn-primary whitespace-nowrap"
              >
                + Add Player
              </button>
            )}
          </div>
        </div>

        <div className="bg-white rounded-xl shadow-sm border border-slate-200 overflow-hidden">
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead>
                <tr className="bg-slate-50 border-b border-slate-200 select-none">
                  <th
                    onClick={() => handleSort('name')}
                    className="px-6 py-4 text-xs font-bold text-slate-500 uppercase tracking-wider text-left cursor-pointer hover:bg-slate-100 transition-colors"
                  >
                    Name {renderSortIndicator('name')}
                  </th>
                  <th
                    onClick={() => handleSort('team')}
                    className="px-6 py-4 text-xs font-bold text-slate-500 uppercase tracking-wider text-left cursor-pointer hover:bg-slate-100 transition-colors"
                  >
                    Team {renderSortIndicator('team')}
                  </th>
                  <th
                    onClick={() => handleSort('games')}
                    className="px-6 py-4 text-xs font-bold text-slate-500 uppercase tracking-wider text-center cursor-pointer hover:bg-slate-100 transition-colors"
                  >
                    Games {renderSortIndicator('games')}
                  </th>
                  <th
                    onClick={() => handleSort('avg')}
                    className="px-6 py-4 text-xs font-bold text-slate-500 uppercase tracking-wider text-center cursor-pointer hover:bg-slate-100 transition-colors"
                  >
                    Avg {renderSortIndicator('avg')}
                  </th>
                  <th
                    onClick={() => handleSort('high')}
                    className="px-6 py-4 text-xs font-bold text-slate-500 uppercase tracking-wider text-center cursor-pointer hover:bg-slate-100 transition-colors"
                  >
                    High {renderSortIndicator('high')}
                  </th>
                  <th
                    onClick={() => handleSort('pins')}
                    className="px-6 py-4 text-xs font-bold text-slate-500 uppercase tracking-wider text-center cursor-pointer hover:bg-slate-100 transition-colors"
                  >
                    Pins {renderSortIndicator('pins')}
                  </th>
                  {isAdmin && (
                    <th className="px-6 py-4 text-xs font-bold text-slate-500 uppercase tracking-wider text-right">
                      Actions
                    </th>
                  )}
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100">
                {filteredBowlers.length === 0 ? (
                  <tr>
                    <td colSpan={7} className="p-8 text-center text-slate-500">
                      No players found.
                    </td>
                  </tr>
                ) : (
                  filteredBowlers.slice((currentPage - 1) * 10, currentPage * 10).map((bowler) => {
                    const stat = stats.get(bowler.BowlerId);
                    return (
                      <tr key={bowler.BowlerId} className="hover:bg-slate-50 transition-colors">
                        <td className="px-6 py-4">
                          <div className="flex items-center gap-3">
                            <div className="w-10 h-10 rounded-full bg-blue-100 flex items-center justify-center text-blue-700 font-bold text-sm">
                              {bowler.bowlerFirstName.charAt(0)}
                              {bowler.bowlerLastName.charAt(0)}
                            </div>
                            <div>
                              <div className="font-bold text-slate-900">
                                {bowler.bowlerFirstName} {bowler.bowlerLastName}
                              </div>
                              <div className="text-xs text-slate-400">ID: {bowler.BowlerId}</div>
                            </div>
                          </div>
                        </td>
                        <td className="px-6 py-4">
                          <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-slate-100 text-slate-800">
                            {bowler.team?.teamName || 'Unassigned'}
                          </span>
                        </td>
                        <td className="px-6 py-4 text-center text-slate-600 font-medium">
                          {stat?.totalGames || 0}
                        </td>
                        <td className="px-6 py-4 text-center text-slate-900 font-bold">
                          {stat?.averageScore?.toFixed(1) || '0.0'}
                        </td>
                        <td className="px-6 py-4 text-center text-green-600 font-medium">
                          {stat?.highScore || 0}
                        </td>
                        <td className="px-6 py-4 text-center text-slate-600 font-medium">
                          {stat?.totalPins?.toLocaleString() || 0}
                        </td>
                        {isAdmin && (
                          <td className="px-6 py-4 text-right">
                            <div className="flex items-center justify-end gap-2">
                              <button
                                onClick={() => navigate(`/bowler/${bowler.BowlerId}`)}
                                className="p-1.5 text-slate-400 hover:text-blue-600 hover:bg-blue-50 rounded"
                              >
                                Edit
                              </button>
                              <button
                                onClick={() => handleDelete(bowler.BowlerId)}
                                className="p-1.5 text-slate-400 hover:text-red-600 hover:bg-red-50 rounded"
                              >
                                Delete
                              </button>
                            </div>
                          </td>
                        )}
                      </tr>
                    );
                  })
                )}
              </tbody>
            </table>
          </div>

          {/* Pagination Controls */}
          {/* Lenght  >  10  to  show pagination */}
          {filteredBowlers.length > 10 && (
            <div className="flex items-center justify-between px-6 py-4 bg-slate-50 border-t border-slate-200">
              <div className="text-sm text-slate-500">
                Showing <span className="font-medium">{(currentPage - 1) * 10 + 1}</span> to{' '}
                <span className="font-medium">
                  {Math.min(currentPage * 10, filteredBowlers.length)}
                </span>{' '}
                of <span className="font-medium">{filteredBowlers.length}</span> results
              </div>
              <div className="flex gap-2">
                <button
                  onClick={() => setCurrentPage((p) => Math.max(1, p - 1))}
                  disabled={currentPage === 1}
                  className="px-3 py-1 text-sm font-medium text-slate-600 bg-white border border-slate-300 rounded hover:bg-slate-50 disabled:opacity-50 disabled:cursor-not-allowed"
                >
                  Previous
                </button>
                {Array.from(
                  { length: Math.ceil(filteredBowlers.length / 10) },
                  (_, i) => i + 1,
                ).map((page) => (
                  <button
                    key={page}
                    onClick={() => setCurrentPage(page)}
                    className={`px-3 py-1 text-sm font-medium border rounded ${
                      currentPage === page
                        ? 'bg-blue-600 text-white border-blue-600'
                        : 'bg-white text-slate-600 border-slate-300 hover:bg-slate-50'
                    }`}
                  >
                    {page}
                  </button>
                ))}
                <button
                  onClick={() =>
                    setCurrentPage((p) => Math.min(Math.ceil(filteredBowlers.length / 10), p + 1))
                  }
                  disabled={currentPage === Math.ceil(filteredBowlers.length / 10)}
                  className="px-3 py-1 text-sm font-medium text-slate-600 bg-white border border-slate-300 rounded hover:bg-slate-50 disabled:opacity-50 disabled:cursor-not-allowed"
                >
                  Next
                </button>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}

export default BowlersTable;
